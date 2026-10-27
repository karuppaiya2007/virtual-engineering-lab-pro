import React, { useRef } from 'react';
import { useLabStore } from '../../state/labStore';
import { COMPONENT_DEFS } from '../../data/componentLibrary';
import { ComponentType } from '../../types';

// ============================================================
// Breadboard constants
// ============================================================
const HOLE_RADIUS = 4;
const HOLE_SPACING = 18;
const HOLE_COLS = 30;        // columns a-j per section (labeled 1-30)
const ROWS_PER_SECTION = 5;  // rows a-e and f-j
const RAIL_HOLES = 25;       // power rail holes each side

const BOARD_PADDING = 24;
const RAIL_HEIGHT = 28;
const GAP_HEIGHT = 20;
const SECTION_HEIGHT = ROWS_PER_SECTION * HOLE_SPACING;

const BOARD_WIDTH  = HOLE_COLS * HOLE_SPACING + 2 * BOARD_PADDING;
const BOARD_HEIGHT = 2 * RAIL_HEIGHT + GAP_HEIGHT + 2 * SECTION_HEIGHT + 2 * BOARD_PADDING + 30;

const ROW_LABELS  = ['a','b','c','d','e','f','g','h','i','j'];
const HOLE_COLOR  = '#5C4033';
const HOLE_EMPTY  = '#7B5E42';
const BOARD_COLOR = '#C8B88A';
const RAIL_POS    = '#CC2200';
const RAIL_NEG    = '#1A237E';

export default function BreadboardView() {
  const { circuit, activeTool, addComponent, transform } = useLabStore();
  const svgRef = useRef<SVGSVGElement>(null);

  // Compute which holes are occupied
  const occupiedHoles = new Map<string, string>(); // "col,row" -> componentId
  for (const comp of circuit.components) {
    if (comp.bbRow !== undefined && comp.bbCol !== undefined) {
      occupiedHoles.set(`${comp.bbCol},${comp.bbRow}`, comp.id);
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const type = e.dataTransfer.getData('componentType') as ComponentType;
    if (!type || !COMPONENT_DEFS[type]) return;

    // Find nearest hole
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return;
    const svgX = (e.clientX - rect.left - transform.x) / transform.scale;
    const svgY = (e.clientY - rect.top  - transform.y) / transform.scale;

    // Place as schematic component at SVG coords
    addComponent(type, Math.round(svgX / 10) * 10, Math.round(svgY / 10) * 10);
  };

  // Layout calculations
  const topRailY     = BOARD_PADDING;
  const topSectionY  = BOARD_PADDING + RAIL_HEIGHT + 8;
  const gapY         = topSectionY + SECTION_HEIGHT;
  const botSectionY  = gapY + GAP_HEIGHT;
  const botRailY     = botSectionY + SECTION_HEIGHT + 8;

  return (
    <svg
      ref={svgRef}
      width={BOARD_WIDTH}
      height={BOARD_HEIGHT}
      onDragOver={e => e.preventDefault()}
      onDrop={handleDrop}
      style={{ display: 'block', margin: '20px auto', filter: 'drop-shadow(0 4px 16px rgba(0,0,0,0.18))' }}
    >
      {/* Board background */}
      <rect
        x={0} y={0} width={BOARD_WIDTH} height={BOARD_HEIGHT}
        rx={8} fill={BOARD_COLOR}
        stroke="#A09060" strokeWidth={2}
      />

      {/* Central gap */}
      <rect
        x={BOARD_PADDING - 4} y={gapY - 2}
        width={HOLE_COLS * HOLE_SPACING + 8} height={GAP_HEIGHT + 4}
        fill="#B8A870" rx={2}
      />
      <text x={BOARD_WIDTH / 2} y={gapY + GAP_HEIGHT / 2 + 4} textAnchor="middle" fontSize={8} fill="#8B7355" fontWeight={600}>
        DIP PACKAGE GAP
      </text>

      {/* Column numbers */}
      {Array.from({ length: HOLE_COLS }, (_, col) => {
        const x = BOARD_PADDING + col * HOLE_SPACING + HOLE_SPACING / 2;
        return (
          <text key={col} x={x} y={topSectionY - 4} textAnchor="middle" fontSize={7} fill="#5C4033" fontWeight={600}>
            {col + 1}
          </text>
        );
      })}

      {/* TOP POWER RAILS */}
      <PowerRail
        x={BOARD_PADDING} y={topRailY} holes={RAIL_HOLES}
        spacing={HOLE_SPACING} positive={true} label="+" side="top"
      />
      <PowerRail
        x={BOARD_PADDING} y={topRailY + 14} holes={RAIL_HOLES}
        spacing={HOLE_SPACING} positive={false} label="−" side="top"
      />

      {/* TOP SECTION (rows a-e) */}
      {Array.from({ length: ROWS_PER_SECTION }, (_, row) => (
        <g key={`top-${row}`}>
          <text
            x={BOARD_PADDING - 12} y={topSectionY + row * HOLE_SPACING + HOLE_SPACING / 2 + 4}
            textAnchor="middle" fontSize={8} fill="#5C4033" fontWeight={700}
          >
            {ROW_LABELS[row]}
          </text>
          {Array.from({ length: HOLE_COLS }, (_, col) => {
            const hx = BOARD_PADDING + col * HOLE_SPACING + HOLE_SPACING / 2;
            const hy = topSectionY + row * HOLE_SPACING + HOLE_SPACING / 2;
            const key = `${col},${row}`;
            const occupied = occupiedHoles.has(key);
            return (
              <Hole
                key={`t${row}-${col}`}
                cx={hx} cy={hy}
                occupied={occupied}
                label={`${ROW_LABELS[row]}${col + 1}`}
              />
            );
          })}
        </g>
      ))}

      {/* BOTTOM SECTION (rows f-j) */}
      {Array.from({ length: ROWS_PER_SECTION }, (_, row) => (
        <g key={`bot-${row}`}>
          <text
            x={BOARD_PADDING - 12} y={botSectionY + row * HOLE_SPACING + HOLE_SPACING / 2 + 4}
            textAnchor="middle" fontSize={8} fill="#5C4033" fontWeight={700}
          >
            {ROW_LABELS[row + 5]}
          </text>
          {Array.from({ length: HOLE_COLS }, (_, col) => {
            const hx = BOARD_PADDING + col * HOLE_SPACING + HOLE_SPACING / 2;
            const hy = botSectionY + row * HOLE_SPACING + HOLE_SPACING / 2;
            const key = `${col},${row + 100}`;
            const occupied = occupiedHoles.has(key);
            return (
              <Hole
                key={`b${row}-${col}`}
                cx={hx} cy={hy}
                occupied={occupied}
                label={`${ROW_LABELS[row + 5]}${col + 1}`}
              />
            );
          })}
        </g>
      ))}

      {/* BOTTOM POWER RAILS */}
      <PowerRail
        x={BOARD_PADDING} y={botRailY} holes={RAIL_HOLES}
        spacing={HOLE_SPACING} positive={true} label="+" side="bottom"
      />
      <PowerRail
        x={BOARD_PADDING} y={botRailY + 14} holes={RAIL_HOLES}
        spacing={HOLE_SPACING} positive={false} label="−" side="bottom"
      />

      {/* Right row labels */}
      {Array.from({ length: ROWS_PER_SECTION }, (_, row) => (
        <React.Fragment key={`rlabel-${row}`}>
          <text
            x={BOARD_PADDING + HOLE_COLS * HOLE_SPACING + 10}
            y={topSectionY + row * HOLE_SPACING + HOLE_SPACING / 2 + 4}
            fontSize={8} fill="#5C4033" fontWeight={700}
          >
            {ROW_LABELS[row]}
          </text>
          <text
            x={BOARD_PADDING + HOLE_COLS * HOLE_SPACING + 10}
            y={botSectionY + row * HOLE_SPACING + HOLE_SPACING / 2 + 4}
            fontSize={8} fill="#5C4033" fontWeight={700}
          >
            {ROW_LABELS[row + 5]}
          </text>
        </React.Fragment>
      ))}

      {/* Instructions overlay when empty */}
      {circuit.components.length === 0 && (
        <text
          x={BOARD_WIDTH / 2} y={BOARD_HEIGHT / 2}
          textAnchor="middle" dominantBaseline="middle"
          fontSize={12} fill="#8B7355" opacity={0.8}
        >
          Drag components from the library onto the breadboard
        </text>
      )}
    </svg>
  );
}

// ============================================================
// Hole component
// ============================================================
function Hole({ cx, cy, occupied, label }: {
  cx: number; cy: number; occupied: boolean; label: string;
}) {
  const [hovered, setHovered] = React.useState(false);
  return (
    <g>
      {/* Hole shadow */}
      <circle cx={cx} cy={cy + 1} r={HOLE_RADIUS + 1} fill="rgba(0,0,0,0.3)" />
      {/* Hole */}
      <circle
        cx={cx} cy={cy} r={HOLE_RADIUS}
        fill={occupied ? '#FFD700' : hovered ? '#A0916A' : HOLE_EMPTY}
        stroke={occupied ? '#B8860B' : '#4A3728'}
        strokeWidth={0.8}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{ cursor: 'pointer' }}
      />
      {/* Inner hole */}
      {!occupied && (
        <circle cx={cx} cy={cy} r={HOLE_RADIUS - 2} fill={HOLE_COLOR} />
      )}
      {/* Tooltip */}
      {hovered && (
        <text cx={cx} x={cx} y={cy - 10} textAnchor="middle" fontSize={7} fill="#2C1810" fontWeight={600}>
          {label}
        </text>
      )}
    </g>
  );
}

// ============================================================
// Power rail
// ============================================================
function PowerRail({ x, y, holes, spacing, positive, label, side }: {
  x: number; y: number; holes: number; spacing: number;
  positive: boolean; label: string; side: 'top' | 'bottom';
}) {
  const color = positive ? RAIL_POS : RAIL_NEG;
  const lineY = y + 7;
  const endX  = x + holes * spacing;

  return (
    <g>
      {/* Rail line */}
      <line x1={x} y1={lineY} x2={endX} y2={lineY} stroke={color} strokeWidth={1.5} opacity={0.6} strokeDasharray={positive ? 'none' : '4 2'} />
      {/* Label */}
      <text x={x - 14} y={lineY + 4} textAnchor="middle" fontSize={10} fill={color} fontWeight={700}>{label}</text>
      {/* Holes */}
      {Array.from({ length: holes }, (_, i) => (
        <circle
          key={i}
          cx={x + i * spacing + spacing / 2}
          cy={lineY}
          r={HOLE_RADIUS - 1}
          fill={HOLE_COLOR}
          stroke={color}
          strokeWidth={1}
          style={{ cursor: 'pointer' }}
        />
      ))}
    </g>
  );
}

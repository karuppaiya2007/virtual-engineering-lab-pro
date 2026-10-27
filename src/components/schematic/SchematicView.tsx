import React, { useCallback, useRef, useState } from 'react';
import { useLabStore, getRotatedPins } from '../../state/labStore';
import { PlacedComponent, Pin } from '../../types';
import { ComponentSymbol, getComponentColor, formatComponentValue } from './ComponentSymbols';
import { COMPONENT_DEFS } from '../../data/componentLibrary';

export default function SchematicView() {
  const {
    circuit, activeTool, selectedComponentIds, wireInProgress,
    selectComponent, moveComponent, removeComponent,
    startWire, updateWirePreview, finishWire, cancelWire,
    removeWire, selectedWireIds, selectWire,
  } = useLabStore();

  const svgRef = useRef<SVGSVGElement>(null);
  const dragging = useRef<{ id: string; startX: number; startY: number; origX: number; origY: number } | null>(null);

  const getSVGPoint = (e: React.MouseEvent): { x: number; y: number } => {
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return { x: 0, y: 0 };
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  // --- Drag ---
  const handleCompMouseDown = (e: React.MouseEvent, comp: PlacedComponent) => {
    e.stopPropagation();
    if (activeTool === 'delete') {
      removeComponent(comp.id);
      return;
    }
    if (activeTool === 'select' || activeTool === 'wire') {
      selectComponent(comp.id, e.shiftKey);
    }
    if (activeTool === 'select') {
      const pt = getSVGPoint(e);
      dragging.current = { id: comp.id, startX: pt.x, startY: pt.y, origX: comp.x, origY: comp.y };
    }
  };

  const handleSVGMouseMove = (e: React.MouseEvent) => {
    const pt = getSVGPoint(e);
    if (dragging.current) {
      const dx = pt.x - dragging.current.startX;
      const dy = pt.y - dragging.current.startY;
      // Snap to 10px grid
      const nx = Math.round((dragging.current.origX + dx) / 10) * 10;
      const ny = Math.round((dragging.current.origY + dy) / 10) * 10;
      moveComponent(dragging.current.id, nx, ny);
    }
    if (wireInProgress) {
      updateWirePreview(pt.x, pt.y);
    }
  };

  const handleSVGMouseUp = () => {
    dragging.current = null;
  };

  // --- Pin click for wiring ---
  const handlePinClick = (e: React.MouseEvent, comp: PlacedComponent, pin: Pin) => {
    e.stopPropagation();
    if (activeTool !== 'wire') return;

    // Find absolute pin position
    const rot = (comp.rotation * Math.PI) / 180;
    const px = comp.x + pin.x * Math.cos(rot) - pin.y * Math.sin(rot);
    const py = comp.y + pin.x * Math.sin(rot) + pin.y * Math.cos(rot);

    if (!wireInProgress) {
      startWire(comp.id, pin.id, px, py);
    } else {
      finishWire(comp.id, pin.id);
    }
  };

  // Get wire endpoints
  const getWireEndpoints = (wire: typeof circuit.wires[0]) => {
    const fromComp = circuit.components.find(c => c.id === wire.fromComponentId);
    const toComp = circuit.components.find(c => c.id === wire.toComponentId);
    if (!fromComp || !toComp) return null;
    const fromPin = fromComp.pins.find(p => p.id === wire.fromPinId);
    const toPin = toComp.pins.find(p => p.id === wire.toPinId);
    if (!fromPin || !toPin) return null;

    const frot = (fromComp.rotation * Math.PI) / 180;
    const trot = (toComp.rotation * Math.PI) / 180;

    const fx = fromComp.x + fromPin.x * Math.cos(frot) - fromPin.y * Math.sin(frot);
    const fy = fromComp.y + fromPin.x * Math.sin(frot) + fromPin.y * Math.cos(frot);
    const tx = toComp.x + toPin.x * Math.cos(trot) - toPin.y * Math.sin(trot);
    const ty = toComp.y + toPin.x * Math.sin(trot) + toPin.y * Math.cos(trot);

    return { fx, fy, tx, ty };
  };

  // Wire path (orthogonal)
  const makeWirePath = (x1: number, y1: number, x2: number, y2: number): string => {
    const mx = (x1 + x2) / 2;
    return `M ${x1} ${y1} L ${mx} ${y1} L ${mx} ${y2} L ${x2} ${y2}`;
  };

  return (
    <svg
      ref={svgRef}
      style={{ width: '100%', height: '100%', cursor: 'inherit' }}
      onMouseMove={handleSVGMouseMove}
      onMouseUp={handleSVGMouseUp}
      onClick={() => { if (wireInProgress) cancelWire(); }}
    >
      {/* Drop zone indicator */}
      {circuit.components.length === 0 && (
        <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle"
          style={{ fontSize: 13, fill: 'var(--color-text-muted)', pointerEvents: 'none' }}>
          Drag components here from the library panel
        </text>
      )}

      {/* Wires */}
      {circuit.wires.map(wire => {
        const ep = getWireEndpoints(wire);
        if (!ep) return null;
        const isSelected = selectedWireIds.includes(wire.id);
        return (
          <g key={wire.id}>
            <path
              d={makeWirePath(ep.fx, ep.fy, ep.tx, ep.ty)}
              stroke="transparent"
              strokeWidth="10"
              fill="none"
              style={{ cursor: activeTool === 'delete' ? 'not-allowed' : 'pointer' }}
              onClick={e => {
                e.stopPropagation();
                if (activeTool === 'delete') removeWire(wire.id);
                else selectWire(wire.id, e.shiftKey);
              }}
            />
            <path
              d={makeWirePath(ep.fx, ep.fy, ep.tx, ep.ty)}
              stroke={isSelected ? 'var(--color-blue)' : wire.color}
              strokeWidth={isSelected ? 2.5 : 1.8}
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ pointerEvents: 'none' }}
            />
            {/* Connection dots */}
            <circle cx={ep.fx} cy={ep.fy} r={3} fill={isSelected ? 'var(--color-blue)' : wire.color} />
            <circle cx={ep.tx} cy={ep.ty} r={3} fill={isSelected ? 'var(--color-blue)' : wire.color} />
          </g>
        );
      })}

      {/* Wire in progress */}
      {wireInProgress && (
        <path
          d={makeWirePath(wireInProgress.startX, wireInProgress.startY, wireInProgress.currentX, wireInProgress.currentY)}
          stroke="var(--color-blue)"
          strokeWidth="1.8"
          fill="none"
          strokeDasharray="6 3"
          strokeLinecap="round"
          style={{ pointerEvents: 'none' }}
        />
      )}

      {/* Components */}
      {circuit.components.map(comp => {
        const isSelected = selectedComponentIds.includes(comp.id);
        const color = getComponentColor(comp.type);
        const valueStr = formatComponentValue(comp);

        return (
          <g
            key={comp.id}
            transform={`translate(${comp.x}, ${comp.y})`}
            style={{ cursor: activeTool === 'select' ? 'move' : activeTool === 'delete' ? 'not-allowed' : 'default' }}
            onMouseDown={e => handleCompMouseDown(e, comp)}
          >
            {/* Selection ring */}
            {isSelected && (
              <rect
                x={-40} y={-40} width={80} height={80}
                fill="none"
                stroke="var(--color-blue)"
                strokeWidth="1.5"
                strokeDasharray="4 2"
                rx={4}
              />
            )}

            {/* Symbol */}
            <g color={color}>
              <ComponentSymbol component={comp} selected={isSelected} />
            </g>

            {/* Label */}
            <text
              x={0} y={-38}
              textAnchor="middle"
              fontSize={10}
              fontWeight={600}
              fill="var(--color-text-primary)"
              style={{ pointerEvents: 'none', userSelect: 'none' }}
            >
              {comp.label}
            </text>

            {/* Value */}
            {valueStr && (
              <text
                x={0} y={-27}
                textAnchor="middle"
                fontSize={9}
                fill="var(--color-text-muted)"
                fontFamily="var(--font-mono)"
                style={{ pointerEvents: 'none', userSelect: 'none' }}
              >
                {valueStr}
              </text>
            )}

            {/* Pins */}
            {comp.pins.map(pin => {
              const rot = (comp.rotation * Math.PI) / 180;
              const px = pin.x * Math.cos(rot) - pin.y * Math.sin(rot);
              const py = pin.x * Math.sin(rot) + pin.y * Math.cos(rot);
              const isWireStart = wireInProgress?.fromComponentId === comp.id && wireInProgress?.fromPinId === pin.id;

              return (
                <g key={pin.id}>
                  <circle
                    cx={px} cy={py} r={8}
                    fill="transparent"
                    style={{ cursor: activeTool === 'wire' ? 'crosshair' : 'default' }}
                    onClick={e => handlePinClick(e, comp, pin)}
                  />
                  <circle
                    cx={px} cy={py} r={isWireStart ? 4 : 3}
                    fill={isWireStart ? 'var(--color-blue)' : color}
                    stroke="var(--color-bg)"
                    strokeWidth="1"
                    style={{ pointerEvents: 'none' }}
                  />
                </g>
              );
            })}
          </g>
        );
      })}
    </svg>
  );
}

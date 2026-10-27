import React, { JSX } from 'react';
import { PlacedComponent } from '../../types';

// ============================================================
// SVG Component Symbols
// ============================================================

interface SymbolProps {
  component: PlacedComponent;
  selected?: boolean;
}

export function ComponentSymbol({ component, selected }: SymbolProps) {
  const { type, rotation, props } = component;

  const transform = `rotate(${rotation} 0 0)`;

  const symbolMap: Record<string, React.ReactElement> = {
    resistor: (
      <g transform={transform}>
        <line x1="-30" y1="0" x2="-15" y2="0" stroke="currentColor" strokeWidth="1.5" />
        <rect x="-15" y="-7" width="30" height="14" fill="none" stroke="currentColor" strokeWidth="1.5" rx="1" />
        <line x1="15" y1="0" x2="30" y2="0" stroke="currentColor" strokeWidth="1.5" />
      </g>
    ),

    potentiometer: (
      <g transform={transform}>
        <line x1="-30" y1="0" x2="-15" y2="0" stroke="currentColor" strokeWidth="1.5" />
        <rect x="-15" y="-7" width="30" height="14" fill="none" stroke="currentColor" strokeWidth="1.5" rx="1" />
        <line x1="15" y1="0" x2="30" y2="0" stroke="currentColor" strokeWidth="1.5" />
        <line x1="0" y1="-7" x2="0" y2="-18" stroke="currentColor" strokeWidth="1.5" />
        <polygon points="0,-18 -4,-13 4,-13" fill="currentColor" />
      </g>
    ),

    capacitor: (
      <g transform={transform}>
        <line x1="-20" y1="0" x2="-5" y2="0" stroke="currentColor" strokeWidth="1.5" />
        <line x1="-5" y1="-12" x2="-5" y2="12" stroke="currentColor" strokeWidth="2.5" />
        <line x1="5" y1="-12" x2="5" y2="12" stroke="currentColor" strokeWidth="2.5" />
        <line x1="5" y1="0" x2="20" y2="0" stroke="currentColor" strokeWidth="1.5" />
        <text x="-9" y="-14" fontSize="9" fill="currentColor" textAnchor="middle">+</text>
      </g>
    ),

    inductor: (
      <g transform={transform}>
        <line x1="-30" y1="0" x2="-18" y2="0" stroke="currentColor" strokeWidth="1.5" />
        {[0, 1, 2].map(i => (
          <path key={i}
            d={`M ${-18 + i * 12} 0 Q ${-12 + i * 12} -12 ${-6 + i * 12} 0`}
            fill="none" stroke="currentColor" strokeWidth="1.5"
          />
        ))}
        <line x1="18" y1="0" x2="30" y2="0" stroke="currentColor" strokeWidth="1.5" />
      </g>
    ),

    diode: (
      <g transform={transform}>
        <line x1="-25" y1="0" x2="-10" y2="0" stroke="currentColor" strokeWidth="1.5" />
        <polygon points="-10,0 10,-10 10,10" fill="currentColor" />
        <line x1="10" y1="-10" x2="10" y2="10" stroke="currentColor" strokeWidth="2" />
        <line x1="10" y1="0" x2="25" y2="0" stroke="currentColor" strokeWidth="1.5" />
      </g>
    ),

    led: (
      <g transform={transform}>
        <line x1="-25" y1="0" x2="-10" y2="0" stroke="currentColor" strokeWidth="1.5" />
        <polygon points="-10,0 10,-10 10,10" fill={props.color || '#ef4444'} stroke="currentColor" strokeWidth="1" />
        <line x1="10" y1="-10" x2="10" y2="10" stroke="currentColor" strokeWidth="2" />
        <line x1="10" y1="0" x2="25" y2="0" stroke="currentColor" strokeWidth="1.5" />
        <line x1="14" y1="-8" x2="20" y2="-14" stroke={props.color || '#ef4444'} strokeWidth="1.2" markerEnd="url(#arrow)" />
        <line x1="10" y1="-12" x2="16" y2="-18" stroke={props.color || '#ef4444'} strokeWidth="1.2" />
      </g>
    ),

    zener: (
      <g transform={transform}>
        <line x1="-25" y1="0" x2="-10" y2="0" stroke="currentColor" strokeWidth="1.5" />
        <polygon points="-10,0 10,-10 10,10" fill="currentColor" />
        <path d="M 7 -10 L 10 -10 L 10 10 L 13 10" fill="none" stroke="currentColor" strokeWidth="2" />
        <line x1="10" y1="0" x2="25" y2="0" stroke="currentColor" strokeWidth="1.5" />
      </g>
    ),

    bjt_npn: (
      <g transform={transform}>
        {/* Base */}
        <line x1="-30" y1="0" x2="-10" y2="0" stroke="currentColor" strokeWidth="1.5" />
        <line x1="-10" y1="-22" x2="-10" y2="22" stroke="currentColor" strokeWidth="2.5" />
        {/* Emitter */}
        <line x1="-10" y1="12" x2="12" y2="22" stroke="currentColor" strokeWidth="1.5" />
        <polygon points="12,22 5,20 8,15" fill="currentColor" transform="rotate(0)" />
        <line x1="12" y1="22" x2="12" y2="30" stroke="currentColor" strokeWidth="1.5" />
        {/* Collector */}
        <line x1="-10" y1="-12" x2="12" y2="-22" stroke="currentColor" strokeWidth="1.5" />
        <line x1="12" y1="-22" x2="12" y2="-30" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="0" cy="0" r="22" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.3" />
        <text x="18" y="-18" fontSize="9" fill="currentColor">C</text>
        <text x="-26" y="3" fontSize="9" fill="currentColor">B</text>
        <text x="18" y="28" fontSize="9" fill="currentColor">E</text>
      </g>
    ),

    bjt_pnp: (
      <g transform={transform}>
        <line x1="-30" y1="0" x2="-10" y2="0" stroke="currentColor" strokeWidth="1.5" />
        <line x1="-10" y1="-22" x2="-10" y2="22" stroke="currentColor" strokeWidth="2.5" />
        <line x1="-10" y1="12" x2="12" y2="22" stroke="currentColor" strokeWidth="1.5" />
        <line x1="12" y1="22" x2="12" y2="30" stroke="currentColor" strokeWidth="1.5" />
        <line x1="-10" y1="-12" x2="12" y2="-22" stroke="currentColor" strokeWidth="1.5" />
        <polygon points="-10,-12 -4,-14 -4,-8" fill="currentColor" />
        <line x1="12" y1="-22" x2="12" y2="-30" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="0" cy="0" r="22" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.3" />
        <text x="18" y="-18" fontSize="9" fill="currentColor">C</text>
        <text x="-26" y="3" fontSize="9" fill="currentColor">B</text>
        <text x="18" y="28" fontSize="9" fill="currentColor">E</text>
      </g>
    ),

    mosfet_n: (
      <g transform={transform}>
        <line x1="-30" y1="0" x2="-14" y2="0" stroke="currentColor" strokeWidth="1.5" />
        <line x1="-14" y1="-15" x2="-14" y2="15" stroke="currentColor" strokeWidth="2.5" />
        <line x1="-10" y1="-15" x2="-10" y2="15" stroke="currentColor" strokeWidth="1.5" />
        <line x1="-10" y1="-10" x2="12" y2="-10" stroke="currentColor" strokeWidth="1.5" />
        <line x1="-10" y1="10" x2="12" y2="10" stroke="currentColor" strokeWidth="1.5" />
        <line x1="12" y1="-10" x2="12" y2="-28" stroke="currentColor" strokeWidth="1.5" />
        <line x1="12" y1="10" x2="12" y2="28" stroke="currentColor" strokeWidth="1.5" />
        <line x1="12" y1="0" x2="12" y2="0" stroke="currentColor" strokeWidth="1.5" />
        <polygon points="0,0 -8,-5 -8,5" fill="currentColor" transform="translate(12,0)" />
        <text x="16" y="-22" fontSize="9" fill="currentColor">D</text>
        <text x="-26" y="3" fontSize="9" fill="currentColor">G</text>
        <text x="16" y="28" fontSize="9" fill="currentColor">S</text>
      </g>
    ),

    opamp: (
      <g transform={transform}>
        <polygon points="-40,-30 -40,30 40,0" fill="none" stroke="currentColor" strokeWidth="1.5" />
        <line x1="-40" y1="-15" x2="-55" y2="-15" stroke="currentColor" strokeWidth="1.5" />
        <line x1="-40" y1="15" x2="-55" y2="15" stroke="currentColor" strokeWidth="1.5" />
        <line x1="40" y1="0" x2="55" y2="0" stroke="currentColor" strokeWidth="1.5" />
        <text x="-32" y="-10" fontSize="10" fill="currentColor">−</text>
        <text x="-32" y="18" fontSize="10" fill="currentColor">+</text>
      </g>
    ),

    dc_source: (
      <g transform={transform}>
        <line x1="0" y1="-30" x2="0" y2="-8" stroke="currentColor" strokeWidth="1.5" />
        <line x1="-12" y1="-8" x2="12" y2="-8" stroke="currentColor" strokeWidth="3" />
        <line x1="-7" y1="-2" x2="7" y2="-2" stroke="currentColor" strokeWidth="1.5" />
        <line x1="-12" y1="4" x2="12" y2="4" stroke="currentColor" strokeWidth="3" />
        <line x1="-7" y1="10" x2="7" y2="10" stroke="currentColor" strokeWidth="1.5" />
        <line x1="0" y1="10" x2="0" y2="30" stroke="currentColor" strokeWidth="1.5" />
        <text x="16" y="-5" fontSize="9" fill="currentColor">+</text>
        <text x="16" y="12" fontSize="9" fill="currentColor">−</text>
      </g>
    ),

    ac_source: (
      <g transform={transform}>
        <circle cx="0" cy="0" r="22" fill="none" stroke="currentColor" strokeWidth="1.5" />
        <path d="M -12 0 Q -6 -12 0 0 Q 6 12 12 0" fill="none" stroke="currentColor" strokeWidth="1.5" />
        <line x1="0" y1="-22" x2="0" y2="-30" stroke="currentColor" strokeWidth="1.5" />
        <line x1="0" y1="22" x2="0" y2="30" stroke="currentColor" strokeWidth="1.5" />
      </g>
    ),

    current_source: (
      <g transform={transform}>
        <circle cx="0" cy="0" r="22" fill="none" stroke="currentColor" strokeWidth="1.5" />
        <line x1="0" y1="-22" x2="0" y2="-30" stroke="currentColor" strokeWidth="1.5" />
        <line x1="0" y1="22" x2="0" y2="30" stroke="currentColor" strokeWidth="1.5" />
        <line x1="0" y1="-12" x2="0" y2="12" stroke="currentColor" strokeWidth="1.5" />
        <polygon points="0,-12 -5,-4 5,-4" fill="currentColor" />
      </g>
    ),

    ground: (
      <g>
        <line x1="0" y1="0" x2="0" y2="10" stroke="currentColor" strokeWidth="1.5" />
        <line x1="-14" y1="10" x2="14" y2="10" stroke="currentColor" strokeWidth="2" />
        <line x1="-9" y1="15" x2="9" y2="15" stroke="currentColor" strokeWidth="2" />
        <line x1="-4" y1="20" x2="4" y2="20" stroke="currentColor" strokeWidth="2" />
      </g>
    ),

    switch: (
      <g transform={transform}>
        <line x1="-25" y1="0" x2="-10" y2="0" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="-10" cy="0" r="2.5" fill="currentColor" />
        <circle cx="10" cy="0" r="2.5" fill="currentColor" />
        {props.closed ? (
          <line x1="-10" y1="0" x2="10" y2="0" stroke="currentColor" strokeWidth="1.5" />
        ) : (
          <line x1="-10" y1="0" x2="9" y2="-10" stroke="currentColor" strokeWidth="1.5" />
        )}
        <line x1="10" y1="0" x2="25" y2="0" stroke="currentColor" strokeWidth="1.5" />
      </g>
    ),

    gate_and: (
      <g transform={transform}>
        <path d="M -30,-20 L 0,-20 Q 30,-20 30,0 Q 30,20 0,20 L -30,20 Z" fill="none" stroke="currentColor" strokeWidth="1.5" />
        <line x1="-40" y1="-12" x2="-30" y2="-12" stroke="currentColor" strokeWidth="1.5" />
        <line x1="-40" y1="12" x2="-30" y2="12" stroke="currentColor" strokeWidth="1.5" />
        <line x1="30" y1="0" x2="44" y2="0" stroke="currentColor" strokeWidth="1.5" />
        <text x="-38" y="-15" fontSize="8" fill="currentColor">A</text>
        <text x="-38" y="19" fontSize="8" fill="currentColor">B</text>
        <text x="34" y="4" fontSize="8" fill="currentColor">Y</text>
      </g>
    ),

    gate_or: (
      <g transform={transform}>
        <path d="M -30,-20 Q -10,-20 10,-20 Q 35,-10 35,0 Q 35,10 10,20 Q -10,20 -30,20 Q -10,0 -30,-20 Z" fill="none" stroke="currentColor" strokeWidth="1.5" />
        <line x1="-40" y1="-12" x2="-22" y2="-12" stroke="currentColor" strokeWidth="1.5" />
        <line x1="-40" y1="12" x2="-22" y2="12" stroke="currentColor" strokeWidth="1.5" />
        <line x1="35" y1="0" x2="45" y2="0" stroke="currentColor" strokeWidth="1.5" />
        <text x="-38" y="-15" fontSize="8" fill="currentColor">A</text>
        <text x="-38" y="19" fontSize="8" fill="currentColor">B</text>
        <text x="36" y="4" fontSize="8" fill="currentColor">Y</text>
      </g>
    ),

    gate_not: (
      <g transform={transform}>
        <polygon points="-25,-18 25,0 -25,18" fill="none" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="28" cy="0" r="4" fill="none" stroke="currentColor" strokeWidth="1.5" />
        <line x1="-35" y1="0" x2="-25" y2="0" stroke="currentColor" strokeWidth="1.5" />
        <line x1="32" y1="0" x2="42" y2="0" stroke="currentColor" strokeWidth="1.5" />
      </g>
    ),

    gate_nand: (
      <g transform={transform}>
        <path d="M -30,-20 L 0,-20 Q 30,-20 30,0 Q 30,20 0,20 L -30,20 Z" fill="none" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="34" cy="0" r="4" fill="none" stroke="currentColor" strokeWidth="1.5" />
        <line x1="-40" y1="-12" x2="-30" y2="-12" stroke="currentColor" strokeWidth="1.5" />
        <line x1="-40" y1="12" x2="-30" y2="12" stroke="currentColor" strokeWidth="1.5" />
        <line x1="38" y1="0" x2="48" y2="0" stroke="currentColor" strokeWidth="1.5" />
      </g>
    ),

    gate_nor: (
      <g transform={transform}>
        <path d="M -30,-20 Q -10,-20 10,-20 Q 35,-10 35,0 Q 35,10 10,20 Q -10,20 -30,20 Q -10,0 -30,-20 Z" fill="none" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="39" cy="0" r="4" fill="none" stroke="currentColor" strokeWidth="1.5" />
        <line x1="-40" y1="-12" x2="-22" y2="-12" stroke="currentColor" strokeWidth="1.5" />
        <line x1="-40" y1="12" x2="-22" y2="12" stroke="currentColor" strokeWidth="1.5" />
        <line x1="43" y1="0" x2="50" y2="0" stroke="currentColor" strokeWidth="1.5" />
      </g>
    ),

    gate_xor: (
      <g transform={transform}>
        <path d="M -25,-20 Q -5,-20 15,-20 Q 40,-10 40,0 Q 40,10 15,20 Q -5,20 -25,20 Q -5,0 -25,-20 Z" fill="none" stroke="currentColor" strokeWidth="1.5" />
        <path d="M -33,-20 Q -13,0 -33,20" fill="none" stroke="currentColor" strokeWidth="1.5" />
        <line x1="-44" y1="-12" x2="-26" y2="-12" stroke="currentColor" strokeWidth="1.5" />
        <line x1="-44" y1="12" x2="-26" y2="12" stroke="currentColor" strokeWidth="1.5" />
        <line x1="40" y1="0" x2="50" y2="0" stroke="currentColor" strokeWidth="1.5" />
      </g>
    ),

    oscilloscope: (
      <g>
        <rect x="-40" y="-30" width="80" height="60" rx="4" fill="none" stroke="currentColor" strokeWidth="1.5" />
        <rect x="-32" y="-22" width="64" height="36" rx="2" fill="#172033" stroke="none" />
        <path d="M -28 -4 Q -20 -16 -12 -4 Q -4 8 4 -4 Q 12 -16 20 -4" fill="none" stroke="#22d3ee" strokeWidth="1.5" />
        <text x="0" y="20" fontSize="7" fill="currentColor" textAnchor="middle">OSC</text>
      </g>
    ),

    dmm: (
      <g>
        <rect x="-30" y="-35" width="60" height="70" rx="6" fill="none" stroke="currentColor" strokeWidth="1.5" />
        <rect x="-22" y="-28" width="44" height="22" rx="2" fill="#172033" />
        <text x="0" y="-13" fontSize="10" fill="#22d3ee" textAnchor="middle" fontFamily="monospace">0.00V</text>
        <circle cx="-8" cy="10" r="6" fill="none" stroke="currentColor" strokeWidth="1.5" />
        <text x="0" y="30" fontSize="7" fill="currentColor" textAnchor="middle">DMM</text>
        <line x1="-10" y1="35" x2="-10" y2="42" stroke="currentColor" strokeWidth="1.5" />
        <line x1="10" y1="35" x2="10" y2="42" stroke="currentColor" strokeWidth="1.5" />
      </g>
    ),

    function_gen: (
      <g>
        <rect x="-40" y="-30" width="80" height="60" rx="4" fill="none" stroke="currentColor" strokeWidth="1.5" />
        <path d="M -28 4 Q -22 -12 -16 4 Q -16 4 -10 4 L -10 -12 L -4 -12 L -4 4 Q 2 4 2 4 Q 8 -12 14 4" fill="none" stroke="currentColor" strokeWidth="1.2" />
        <text x="0" y="20" fontSize="7" fill="currentColor" textAnchor="middle">FUNC GEN</text>
        <line x1="40" y1="0" x2="50" y2="0" stroke="currentColor" strokeWidth="1.5" />
        <line x1="40" y1="16" x2="50" y2="16" stroke="currentColor" strokeWidth="1.5" />
      </g>
    ),
  };

  const symbol = symbolMap[type] || (
    <g>
      <rect x="-20" y="-15" width="40" height="30" rx="4" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <text x="0" y="4" fontSize="8" textAnchor="middle" fill="currentColor">{type.substring(0, 4)}</text>
    </g>
  );

  return <>{symbol}</>;
}

// Color map for component types
export function getComponentColor(type: string): string {
  if (['resistor','capacitor','inductor','potentiometer'].includes(type)) return 'var(--color-text-primary)';
  if (['diode','led','zener'].includes(type)) return 'var(--color-error)';
  if (['bjt_npn','bjt_pnp','mosfet_n','mosfet_p'].includes(type)) return '#16a34a';
  if (['dc_source','ac_source','current_source'].includes(type)) return '#d97706';
  if (['gate_and','gate_or','gate_not','gate_nand','gate_nor','gate_xor'].includes(type)) return '#7c3aed';
  if (['oscilloscope','dmm','function_gen'].includes(type)) return '#0891b2';
  if (type === 'ground') return '#374151';
  if (type === 'opamp') return '#be185d';
  return 'var(--color-text-primary)';
}

export function formatComponentValue(component: PlacedComponent): string {
  const { type, props } = component;
  if (type === 'resistor' || type === 'potentiometer') {
    const R = props.resistance ?? 0;
    if (R >= 1e6) return `${(R / 1e6).toPrecision(3)}MΩ`;
    if (R >= 1e3) return `${(R / 1e3).toPrecision(3)}kΩ`;
    return `${R}Ω`;
  }
  if (type === 'capacitor') {
    const C = props.capacitance ?? 0;
    if (C >= 1e-3) return `${(C * 1e3).toPrecision(3)}mF`;
    if (C >= 1e-6) return `${(C * 1e6).toPrecision(3)}μF`;
    if (C >= 1e-9) return `${(C * 1e9).toPrecision(3)}nF`;
    return `${(C * 1e12).toPrecision(3)}pF`;
  }
  if (type === 'inductor') {
    const L = props.inductance ?? 0;
    if (L >= 1) return `${L.toPrecision(3)}H`;
    if (L >= 1e-3) return `${(L * 1e3).toPrecision(3)}mH`;
    return `${(L * 1e6).toPrecision(3)}μH`;
  }
  if (type === 'dc_source') return `${props.voltage ?? 0}V`;
  if (type === 'ac_source') return `${props.amplitude ?? 0}V ${props.frequency ?? 0}Hz`;
  if (type === 'current_source') {
    const I = props.current ?? 0;
    if (Math.abs(I) >= 1) return `${I}A`;
    if (Math.abs(I) >= 1e-3) return `${(I * 1e3).toPrecision(3)}mA`;
    return `${(I * 1e6).toPrecision(3)}μA`;
  }
  return '';
}

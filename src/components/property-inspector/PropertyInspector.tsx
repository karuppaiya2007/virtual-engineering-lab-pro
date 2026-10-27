import React from 'react';
import { useLabStore } from '../../state/labStore';
import { COMPONENT_DEFS } from '../../data/componentLibrary';
import { PlacedComponent, SimResult } from '../../types';

export default function PropertyInspector() {
  const {
    circuit, selectedComponentIds, selectedWireIds,
    updateComponentProps, removeComponent, rotateComponent,
    simResult,
  } = useLabStore();

  const selectedComp = selectedComponentIds.length === 1
    ? circuit.components.find(c => c.id === selectedComponentIds[0])
    : null;

  const selectedWire = selectedWireIds.length === 1
    ? circuit.wires.find(w => w.id === selectedWireIds[0])
    : null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', borderBottom: '1px solid var(--color-border)' }}>
      <div className="panel-header">
        <span>Inspector</span>
        {selectedComp && (
          <span style={{ fontSize: 10, color: 'var(--color-text-muted)', fontWeight: 400 }}>
            {selectedComp.type}
          </span>
        )}
      </div>

      <div style={{ overflowY: 'auto', maxHeight: 400, padding: '8px' }}>
        {selectedComp ? (
          <ComponentInspector
            comp={selectedComp}
            simResult={simResult}
            onUpdate={(props) => updateComponentProps(selectedComp.id, props)}
            onRemove={() => removeComponent(selectedComp.id)}
            onRotate={() => rotateComponent(selectedComp.id)}
          />
        ) : selectedWire ? (
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 8 }}>Wire</div>
            <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>
              From: {selectedWire.fromComponentId.substring(0, 8)}…:{selectedWire.fromPinId}
            </div>
            <div style={{ fontSize: 11, color: 'var(--color-text-muted)', marginTop: 4 }}>
              To: {selectedWire.toComponentId.substring(0, 8)}…:{selectedWire.toPinId}
            </div>
            {simResult?.nodeVoltages && (
              <div style={{ marginTop: 8, padding: 8, background: 'var(--color-bg-secondary)', borderRadius: 6 }}>
                <div style={{ fontSize: 10, fontWeight: 600, marginBottom: 4, color: 'var(--color-text-muted)' }}>SIM INFO</div>
                <div style={{ fontSize: 11 }}>Node connected to wire endpoints</div>
              </div>
            )}
          </div>
        ) : (
          <div className="empty-state" style={{ padding: 16 }}>
            <span style={{ fontSize: 20 }}>🖱️</span>
            <p style={{ fontSize: 11 }}>Click a component or wire to inspect it</p>
          </div>
        )}
      </div>
    </div>
  );
}

function ComponentInspector({
  comp, simResult, onUpdate, onRemove, onRotate,
}: {
  comp: PlacedComponent;
  simResult: SimResult | null;
  onUpdate: (props: Partial<PlacedComponent['props']>) => void;
  onRemove: () => void;
  onRotate: () => void;
}) {
  const def = COMPONENT_DEFS[comp.type];

  const simCurrent = simResult?.branchCurrents?.[comp.id];
  const simPower = simResult?.powerDissipation?.[comp.id];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {/* ID + Actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700 }}>{def?.name || comp.type}</div>
          <div style={{ fontSize: 10, color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>
            {comp.id.substring(0, 12)}…
          </div>
        </div>
        <div style={{ display: 'flex', gap: 4 }}>
          <button className="btn btn-secondary btn-sm" onClick={onRotate} title="Rotate 90°">↻</button>
          <button className="btn btn-error btn-sm" onClick={onRemove} title="Delete">🗑</button>
        </div>
      </div>

      <hr className="divider" />

      {/* Position */}
      <Field label="Position" value={`x: ${comp.x}, y: ${comp.y}`} mono />
      <Field label="Rotation" value={`${comp.rotation}°`} mono />

      <hr className="divider" />

      {/* Properties by type */}
      {comp.type === 'resistor' || comp.type === 'potentiometer' ? (
        <>
          <NumberField
            label="Resistance (Ω)"
            value={comp.props.resistance ?? 1000}
            min={0.001}
            onChange={v => onUpdate({ resistance: v })}
          />
          <ResistorColorCode resistance={comp.props.resistance ?? 1000} />
        </>
      ) : comp.type === 'capacitor' ? (
        <>
          <NumberField label="Capacitance (μF)" value={(comp.props.capacitance ?? 100e-6) * 1e6}
            min={0.001} onChange={v => onUpdate({ capacitance: v / 1e6 })} />
          <Info>Time constant τ = R × C</Info>
        </>
      ) : comp.type === 'inductor' ? (
        <NumberField label="Inductance (mH)" value={(comp.props.inductance ?? 10e-3) * 1e3}
          min={0.001} onChange={v => onUpdate({ inductance: v / 1e3 })} />
      ) : comp.type === 'dc_source' ? (
        <NumberField label="Voltage (V)" value={comp.props.voltage ?? 5}
          onChange={v => onUpdate({ voltage: v })} />
      ) : comp.type === 'ac_source' ? (
        <>
          <NumberField label="Amplitude (V)" value={comp.props.amplitude ?? 5}
            onChange={v => onUpdate({ amplitude: v })} />
          <NumberField label="Frequency (Hz)" value={comp.props.frequency ?? 50}
            min={0.001} onChange={v => onUpdate({ frequency: v })} />
          <NumberField label="DC Offset (V)" value={comp.props.offset ?? 0}
            onChange={v => onUpdate({ offset: v })} />
        </>
      ) : comp.type === 'current_source' ? (
        <NumberField label="Current (mA)" value={(comp.props.current ?? 0.001) * 1000}
          onChange={v => onUpdate({ current: v / 1000 })} />
      ) : comp.type === 'zener' ? (
        <>
          <NumberField label="Zener Voltage (V)" value={comp.props.zenerVoltage ?? 5.1}
            min={0.1} onChange={v => onUpdate({ zenerVoltage: v })} />
          <NumberField label="Vf (V)" value={comp.props.forwardVoltage ?? 0.7}
            onChange={v => onUpdate({ forwardVoltage: v })} />
        </>
      ) : comp.type === 'bjt_npn' || comp.type === 'bjt_pnp' ? (
        <>
          <NumberField label="β (hFE)" value={comp.props.beta ?? 100} min={1}
            onChange={v => onUpdate({ beta: v })} />
          <Info>IC = β × IB</Info>
        </>
      ) : comp.type === 'led' ? (
        <>
          <NumberField label="Vf (V)" value={comp.props.forwardVoltage ?? 2.0}
            onChange={v => onUpdate({ forwardVoltage: v })} />
          <div>
            <label style={{ fontSize: 11, color: 'var(--color-text-muted)', display: 'block', marginBottom: 4 }}>LED Color</label>
            <input type="color" value={comp.props.color || '#FF0000'}
              onChange={e => onUpdate({ color: e.target.value })}
              style={{ width: 40, height: 24, cursor: 'pointer', border: '1px solid var(--color-border)', borderRadius: 4 }} />
          </div>
        </>
      ) : comp.type === 'switch' ? (
        <div>
          <label style={{ fontSize: 11, color: 'var(--color-text-muted)', display: 'block', marginBottom: 4 }}>State</label>
          <button
            className={`btn ${comp.props.closed ? 'btn-success' : 'btn-secondary'} btn-sm`}
            onClick={() => onUpdate({ closed: !comp.props.closed })}
          >
            {comp.props.closed ? '● Closed (ON)' : '○ Open (OFF)'}
          </button>
        </div>
      ) : comp.type === 'function_gen' ? (
        <>
          <div>
            <label style={{ fontSize: 11, color: 'var(--color-text-muted)', display: 'block', marginBottom: 4 }}>Waveform</label>
            <select className="input" style={{ fontSize: 11 }}
              value={comp.props.waveform || 'sine'}
              onChange={e => onUpdate({ waveform: e.target.value as any })}>
              <option value="sine">Sine</option>
              <option value="square">Square</option>
              <option value="triangle">Triangle</option>
              <option value="dc">DC</option>
            </select>
          </div>
          <NumberField label="Amplitude (V)" value={comp.props.amplitude ?? 5}
            onChange={v => onUpdate({ amplitude: v })} />
          <NumberField label="Frequency (Hz)" value={comp.props.frequency ?? 1000}
            min={0.001} onChange={v => onUpdate({ frequency: v })} />
          <NumberField label="DC Offset (V)" value={comp.props.offset ?? 0}
            onChange={v => onUpdate({ offset: v })} />
        </>
      ) : null}

      {/* Simulation Results */}
      {(simCurrent !== undefined || simPower !== undefined) && (
        <>
          <hr className="divider" />
          <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Simulation Results
          </div>
          {simCurrent !== undefined && (
            <Field label="Current" value={formatCurrent(simCurrent)} mono highlight />
          )}
          {simPower !== undefined && (
            <Field label="Power" value={`${(simPower * 1000).toPrecision(3)} mW`} mono highlight />
          )}
        </>
      )}

      {/* Pin info */}
      <hr className="divider" />
      <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
        Pins
      </div>
      {comp.pins.map(pin => (
        <div key={pin.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11 }}>
          <span style={{ color: 'var(--color-text-secondary)' }}>{pin.label}</span>
          <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-text-muted)' }}>{pin.id}</span>
        </div>
      ))}
    </div>
  );
}

function Field({ label, value, mono, highlight }: { label: string; value: string; mono?: boolean; highlight?: boolean }) {
  return (
    <div>
      <div style={{ fontSize: 10, color: 'var(--color-text-muted)', marginBottom: 2 }}>{label}</div>
      <div style={{
        fontSize: 12,
        fontFamily: mono ? 'var(--font-mono)' : 'var(--font-body)',
        color: highlight ? 'var(--color-blue)' : 'var(--color-text-primary)',
        fontWeight: highlight ? 600 : 400,
        padding: highlight ? '2px 6px' : 0,
        background: highlight ? 'var(--color-blue-light)' : 'transparent',
        borderRadius: highlight ? 4 : 0,
      }}>
        {value}
      </div>
    </div>
  );
}

function NumberField({
  label, value, min, onChange,
}: { label: string; value: number; min?: number; onChange: (v: number) => void }) {
  return (
    <div>
      <label style={{ fontSize: 11, color: 'var(--color-text-muted)', display: 'block', marginBottom: 3 }}>{label}</label>
      <input
        type="number"
        className="input"
        style={{ fontSize: 12, fontFamily: 'var(--font-mono)' }}
        value={value}
        min={min}
        step="any"
        onChange={e => {
          const v = parseFloat(e.target.value);
          if (!isNaN(v) && (min === undefined || v >= min)) onChange(v);
        }}
      />
    </div>
  );
}

function Info({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      fontSize: 11, color: 'var(--color-text-secondary)',
      background: 'var(--color-bg-secondary)', borderRadius: 4,
      padding: '4px 8px', fontFamily: 'var(--font-mono)',
    }}>
      {children}
    </div>
  );
}

function ResistorColorCode({ resistance }: { resistance: number }) {
  const BAND_COLORS = ['black','brown','red','orange','yellow','green','blue','violet','gray','white'];
  const MULTIPLIERS = ['black','brown','red','orange','yellow','gold','silver'];
  const MULT_VALUES = [1, 10, 100, 1000, 10000, 0.1, 0.01];

  const encode = (R: number) => {
    let mult = 0;
    let val = R;
    while (val >= 100) { val /= 10; mult++; }
    val = Math.round(val);
    const d1 = Math.floor(val / 10);
    const d2 = val % 10;
    return [d1, d2, mult];
  };

  const [d1, d2, m] = encode(Math.abs(resistance));
  const bands = [
    { color: BAND_COLORS[d1], label: d1.toString() },
    { color: BAND_COLORS[d2], label: d2.toString() },
    { color: MULTIPLIERS[Math.min(m, 6)], label: `×${MULT_VALUES[Math.min(m, 6)]}` },
    { color: 'gold', label: '±5%' },
  ];

  return (
    <div>
      <div style={{ fontSize: 10, color: 'var(--color-text-muted)', marginBottom: 4 }}>Color Code</div>
      <div style={{ display: 'flex', gap: 3, alignItems: 'center' }}>
        {bands.map((b, i) => (
          <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
            <div style={{
              width: 14, height: 28,
              background: b.color,
              border: '1px solid rgba(0,0,0,0.15)',
              borderRadius: 2,
            }} />
            <span style={{ fontSize: 8, color: 'var(--color-text-muted)' }}>{b.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function formatCurrent(I: number): string {
  const abs = Math.abs(I);
  if (abs >= 1) return `${I.toPrecision(4)} A`;
  if (abs >= 1e-3) return `${(I * 1e3).toPrecision(4)} mA`;
  if (abs >= 1e-6) return `${(I * 1e6).toPrecision(4)} μA`;
  return `${(I * 1e9).toPrecision(4)} nA`;
}

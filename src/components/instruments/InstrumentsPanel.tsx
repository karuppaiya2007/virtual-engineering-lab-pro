import React, { useState, useMemo } from 'react';
import { useLabStore } from '../../state/labStore';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, AreaChart, Area,
} from 'recharts';
import {
  generateSignal, generateAMSignal, generateFMSignal,
  computeDFT, generateTruthTable,
} from '../../simulation/engine';

type InstrumentTab = 'oscilloscope' | 'funcgen' | 'dmm' | 'logic' | 'spectrum';

export default function InstrumentsPanel() {
  const { simResult, circuit, toggleInstruments } = useLabStore();
  const [activeTab, setActiveTab] = useState<InstrumentTab>('oscilloscope');

  const TABS: { id: InstrumentTab; label: string }[] = [
    { id: 'oscilloscope', label: 'Oscilloscope' },
    { id: 'funcgen',      label: 'Function Gen' },
    { id: 'dmm',          label: 'Multimeter' },
    { id: 'logic',        label: 'Logic Analyzer' },
    { id: 'spectrum',     label: 'Spectrum' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Tab bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        padding: '0 12px',
        background: 'var(--color-bg-secondary)',
        borderBottom: '1px solid var(--color-border)',
        flexShrink: 0,
        gap: 0,
      }}>
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '6px 12px',
              fontSize: 12,
              fontWeight: 500,
              background: 'transparent',
              color: activeTab === tab.id ? 'var(--color-blue)' : 'var(--color-text-muted)',
              border: 'none',
              borderBottom: activeTab === tab.id ? '2px solid var(--color-blue)' : '2px solid transparent',
              cursor: 'pointer',
              fontFamily: 'var(--font-body)',
              transition: 'all 0.12s',
              marginBottom: -1,
            }}
          >
            {tab.label}
          </button>
        ))}
        <div style={{ flex: 1 }} />
        <button className="btn btn-ghost btn-sm" onClick={toggleInstruments} style={{ fontSize: 11 }}>
          ▼ Hide
        </button>
      </div>

      {/* Instrument content */}
      <div style={{ flex: 1, overflow: 'hidden', display: 'flex' }}>
        {activeTab === 'oscilloscope' && <OscilloscopeView simResult={simResult} />}
        {activeTab === 'funcgen' && <FunctionGeneratorView circuit={circuit} />}
        {activeTab === 'dmm' && <DMMView simResult={simResult} circuit={circuit} />}
        {activeTab === 'logic' && <LogicAnalyzerView circuit={circuit} />}
        {activeTab === 'spectrum' && <SpectrumView simResult={simResult} circuit={circuit} />}
      </div>
    </div>
  );
}

// ============================================================
// Oscilloscope
// ============================================================
function OscilloscopeView({ simResult }: { simResult: any }) {
  const [timeDivMs, setTimeDivMs] = useState(10);
  const [vDiv, setVDiv] = useState(2);

  const chartData = useMemo(() => {
    if (!simResult?.timePoints) return generateDemoWave();
    return simResult.timePoints.map((t: number, i: number) => {
      const entry: any = { t };
      Object.entries(simResult.voltageWaveforms || {}).forEach(([key, vals]) => {
        entry[key] = (vals as number[])[i];
      });
      return entry;
    });
  }, [simResult]);

  const waveKeys = useMemo(() => {
    if (simResult?.voltageWaveforms) return Object.keys(simResult.voltageWaveforms);
    return ['CH1'];
  }, [simResult]);

  const COLORS = ['#2563EB', '#DC2626', '#16A34A', '#D97706'];

  return (
    <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
      {/* Display */}
      <div style={{ flex: 1, padding: '8px 12px', background: '#0F172A', position: 'relative' }}>
        <div style={{
          position: 'absolute', inset: 8,
          backgroundImage: 'linear-gradient(rgba(34,211,238,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(34,211,238,0.05) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
          borderRadius: 4,
        }} />
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 4, right: 8, bottom: 4, left: 0 }}>
            <CartesianGrid strokeDasharray="2 6" stroke="rgba(34,211,238,0.1)" />
            <XAxis dataKey="t" tick={{ fontSize: 9, fill: '#94A3B8' }} label={{ value: 'ms', position: 'insideBottomRight', fill: '#64748B', fontSize: 9 }} />
            <YAxis tick={{ fontSize: 9, fill: '#94A3B8' }} label={{ value: 'V', angle: -90, fill: '#64748B', fontSize: 9 }} />
            <Tooltip contentStyle={{ background: '#1E293B', border: '1px solid #334155', fontSize: 11, color: '#E2E8F0' }} />
            <Legend wrapperStyle={{ fontSize: 10, color: '#94A3B8' }} />
            {waveKeys.map((key, i) => (
              <Line key={key} type="monotone" dataKey={key} stroke={COLORS[i % COLORS.length]}
                dot={false} strokeWidth={1.5} isAnimationActive={false} />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Controls */}
      <div style={{
        width: 140,
        background: '#1E293B',
        borderLeft: '1px solid #334155',
        padding: 10,
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        fontSize: 11,
        color: '#94A3B8',
        flexShrink: 0,
        overflowY: 'auto',
      }}>
        <div style={{ fontWeight: 700, color: '#E2E8F0', fontSize: 12, letterSpacing: '0.04em' }}>OSCILLOSCOPE</div>
        <Knob label="Time/Div" value={timeDivMs} unit="ms" options={[1,2,5,10,20,50,100]} onChange={setTimeDivMs} />
        <Knob label="V/Div" value={vDiv} unit="V" options={[0.1,0.2,0.5,1,2,5,10]} onChange={setVDiv} />
        <div style={{ borderTop: '1px solid #334155', paddingTop: 8 }}>
          <div style={{ fontSize: 10, marginBottom: 4, color: '#64748B' }}>CHANNELS</div>
          {['CH1','CH2'].map(ch => (
            <div key={ch} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
              <span style={{ color: ch === 'CH1' ? '#2563EB' : '#DC2626' }}>{ch}</span>
              <span style={{ color: '#22D3EE', fontFamily: 'monospace', fontSize: 10 }}>ON</span>
            </div>
          ))}
        </div>
        {simResult?.voltageWaveforms && (
          <div style={{ borderTop: '1px solid #334155', paddingTop: 8 }}>
            <div style={{ fontSize: 10, marginBottom: 4, color: '#64748B' }}>MEASURE</div>
            {Object.entries(simResult.voltageWaveforms).slice(0, 2).map(([key, vals]) => {
              const arr = vals as number[];
              const max = Math.max(...arr).toFixed(3);
              const min = Math.min(...arr).toFixed(3);
              return (
                <div key={key} style={{ marginBottom: 4 }}>
                  <div style={{ color: '#64748B', fontSize: 9 }}>{key}</div>
                  <div style={{ color: '#22D3EE', fontFamily: 'monospace', fontSize: 10 }}>Max: {max}V</div>
                  <div style={{ color: '#22D3EE', fontFamily: 'monospace', fontSize: 10 }}>Min: {min}V</div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function Knob({ label, value, unit, options, onChange }: any) {
  return (
    <div>
      <div style={{ fontSize: 9, color: '#64748B', marginBottom: 3 }}>{label}</div>
      <select
        value={value}
        onChange={e => onChange(parseFloat(e.target.value))}
        style={{
          width: '100%', background: '#0F172A', color: '#22D3EE',
          border: '1px solid #334155', borderRadius: 4,
          padding: '3px 4px', fontSize: 11, fontFamily: 'monospace', cursor: 'pointer',
        }}
      >
        {options.map((o: number) => <option key={o} value={o}>{o} {unit}</option>)}
      </select>
    </div>
  );
}

function generateDemoWave() {
  return Array.from({ length: 200 }, (_, i) => ({
    t: i * 0.5,
    CH1: Math.sin(i * 0.15) * 3 + Math.sin(i * 0.05) * 0.5,
  }));
}

// ============================================================
// Function Generator
// ============================================================
function FunctionGeneratorView({ circuit }: { circuit: any }) {
  const [waveform, setWaveform] = useState<'sine'|'square'|'triangle'|'dc'>('sine');
  const [freq, setFreq] = useState(1000);
  const [amp, setAmp] = useState(5);
  const [offset, setOffset] = useState(0);
  const [running, setRunning] = useState(true);

  const signal = useMemo(() => {
    if (!running) return [];
    const sr = Math.max(freq * 20, 10000);
    const dur = Math.min(10 / freq, 0.01);
    const { time, values } = generateSignal(waveform, freq, amp, offset, dur, sr);
    const step = Math.max(1, Math.floor(time.length / 300));
    return time.filter((_, i) => i % step === 0).map((t, i) => ({ t, v: values[i * step] }));
  }, [waveform, freq, amp, offset, running]);

  return (
    <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
      {/* Preview */}
      <div style={{ flex: 1, padding: 8, background: '#0F172A' }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={signal} margin={{ top: 4, right: 8, bottom: 4, left: 0 }}>
            <defs>
              <linearGradient id="sigGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#2563EB" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="2 6" stroke="rgba(34,211,238,0.1)" />
            <XAxis dataKey="t" tick={{ fontSize: 9, fill: '#64748B' }} label={{ value: 'ms', position: 'insideBottomRight', fill: '#64748B', fontSize: 9 }} />
            <YAxis tick={{ fontSize: 9, fill: '#64748B' }} />
            <Tooltip contentStyle={{ background: '#1E293B', border: '1px solid #334155', fontSize: 11, color: '#E2E8F0' }} />
            <Area type="monotone" dataKey="v" stroke="#2563EB" fill="url(#sigGrad)" dot={false} strokeWidth={1.5} isAnimationActive={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Controls */}
      <div style={{ width: 180, background: '#1E293B', borderLeft: '1px solid #334155', padding: 12, display: 'flex', flexDirection: 'column', gap: 12, overflowY: 'auto', flexShrink: 0 }}>
        <div style={{ fontWeight: 700, color: '#E2E8F0', fontSize: 12 }}>FUNCTION GEN</div>

        <div>
          <div style={{ fontSize: 10, color: '#64748B', marginBottom: 4 }}>WAVEFORM</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 3 }}>
            {(['sine','square','triangle','dc'] as const).map(w => (
              <button key={w} onClick={() => setWaveform(w)} style={{
                padding: '4px', fontSize: 10, fontFamily: 'monospace',
                background: waveform === w ? '#2563EB' : '#0F172A',
                color: waveform === w ? '#fff' : '#64748B',
                border: '1px solid', borderColor: waveform === w ? '#2563EB' : '#334155',
                borderRadius: 4, cursor: 'pointer', textTransform: 'uppercase',
              }}>{w}</button>
            ))}
          </div>
        </div>

        <NumberInput dark label="Frequency" value={freq} unit="Hz" min={0.1} onChange={setFreq} />
        <NumberInput dark label="Amplitude" value={amp} unit="V" onChange={setAmp} />
        <NumberInput dark label="DC Offset" value={offset} unit="V" onChange={setOffset} />

        <button
          onClick={() => setRunning(r => !r)}
          style={{
            padding: '6px', fontSize: 11, fontFamily: 'monospace',
            background: running ? '#16A34A' : '#374151',
            color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer',
          }}
        >
          {running ? '● OUTPUT ON' : '○ OUTPUT OFF'}
        </button>

        <div style={{ borderTop: '1px solid #334155', paddingTop: 8, fontSize: 10, color: '#64748B' }}>
          <div>Period: {(1000 / freq).toPrecision(4)} ms</div>
          <div>Vpeak: {amp.toFixed(2)} V</div>
          <div>Vpp: {(2 * amp).toFixed(2)} V</div>
          <div>Vrms: {(amp / Math.sqrt(2)).toFixed(3)} V</div>
        </div>
      </div>
    </div>
  );
}

function NumberInput({ label, value, unit, min, onChange, dark }: any) {
  return (
    <div>
      <div style={{ fontSize: 10, color: dark ? '#64748B' : 'var(--color-text-muted)', marginBottom: 3 }}>{label}</div>
      <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
        <input type="number" value={value} min={min} step="any"
          onChange={e => { const v = parseFloat(e.target.value); if (!isNaN(v)) onChange(v); }}
          style={{
            flex: 1, padding: '4px 6px', fontSize: 11, fontFamily: 'monospace',
            background: dark ? '#0F172A' : 'var(--color-bg)',
            color: dark ? '#22D3EE' : 'var(--color-text-primary)',
            border: `1px solid ${dark ? '#334155' : 'var(--color-border)'}`,
            borderRadius: 4, outline: 'none',
          }} />
        <span style={{ fontSize: 10, color: dark ? '#64748B' : 'var(--color-text-muted)', flexShrink: 0 }}>{unit}</span>
      </div>
    </div>
  );
}

// ============================================================
// DMM
// ============================================================
function DMMView({ simResult, circuit }: any) {
  const [mode, setMode] = useState<'V'|'A'|'Ω'>('V');
  const [selectedNode, setSelectedNode] = useState<string>('');

  const nodes = simResult ? Object.keys(simResult.nodeVoltages) : [];
  const reading = useMemo(() => {
    if (!simResult) return null;
    if (mode === 'V' && selectedNode) return simResult.nodeVoltages[selectedNode];
    if (mode === 'A') {
      const vals = Object.values(simResult.branchCurrents) as number[];
      return vals.length > 0 ? vals[0] : 0;
    }
    return null;
  }, [simResult, mode, selectedNode]);

  const formatReading = (v: number | null): string => {
    if (v === null) return '-.----';
    if (mode === 'V') return v.toFixed(4) + ' V';
    if (mode === 'A') {
      const abs = Math.abs(v);
      if (abs >= 1) return v.toFixed(4) + ' A';
      if (abs >= 1e-3) return (v * 1e3).toFixed(4) + ' mA';
      return (v * 1e6).toFixed(4) + ' μA';
    }
    return '—';
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1, gap: 24, padding: 16 }}>
      {/* DMM body */}
      <div style={{
        background: '#1E293B', borderRadius: 12, padding: '20px 24px',
        border: '2px solid #334155', boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
        display: 'flex', flexDirection: 'column', gap: 16, minWidth: 240,
      }}>
        <div style={{ fontWeight: 700, fontSize: 13, color: '#E2E8F0', textAlign: 'center', letterSpacing: '0.08em' }}>
          DIGITAL MULTIMETER
        </div>

        {/* Display */}
        <div style={{
          background: '#0F172A', borderRadius: 8, padding: '12px 16px',
          border: '1px solid #334155', textAlign: 'right',
        }}>
          <div style={{ fontSize: 10, color: '#64748B', marginBottom: 4 }}>{mode}</div>
          <div style={{ fontSize: 26, fontFamily: 'monospace', fontWeight: 700, color: '#22D3EE', letterSpacing: '0.05em' }}>
            {formatReading(reading)}
          </div>
        </div>

        {/* Mode selector */}
        <div style={{ display: 'flex', gap: 6 }}>
          {(['V','A','Ω'] as const).map(m => (
            <button key={m} onClick={() => setMode(m)} style={{
              flex: 1, padding: '6px', fontSize: 13, fontFamily: 'monospace', fontWeight: 700,
              background: mode === m ? '#2563EB' : '#0F172A',
              color: mode === m ? '#fff' : '#64748B',
              border: '1px solid', borderColor: mode === m ? '#2563EB' : '#334155',
              borderRadius: 6, cursor: 'pointer',
            }}>{m}</button>
          ))}
        </div>

        {/* Node selector for V mode */}
        {mode === 'V' && nodes.length > 0 && (
          <div>
            <div style={{ fontSize: 10, color: '#64748B', marginBottom: 4 }}>Probe Node</div>
            <select value={selectedNode} onChange={e => setSelectedNode(e.target.value)}
              style={{
                width: '100%', background: '#0F172A', color: '#22D3EE',
                border: '1px solid #334155', borderRadius: 4,
                padding: '4px 6px', fontSize: 11, fontFamily: 'monospace',
              }}>
              <option value="">— Select node —</option>
              {nodes.map(n => (
                <option key={n} value={n}>{n}: {simResult.nodeVoltages[n].toFixed(4)} V</option>
              ))}
            </select>
          </div>
        )}

        {!simResult && (
          <div style={{ fontSize: 11, color: '#64748B', textAlign: 'center' }}>
            Run simulation to measure
          </div>
        )}
      </div>

      {/* Node voltages table */}
      {simResult?.nodeVoltages && (
        <div style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)', borderRadius: 8, overflow: 'hidden', minWidth: 200 }}>
          <div style={{ padding: '8px 12px', background: 'var(--color-bg-secondary)', fontSize: 11, fontWeight: 600, borderBottom: '1px solid var(--color-border)' }}>
            All Node Voltages
          </div>
          {Object.entries(simResult.nodeVoltages).map(([node, v]) => (
            <div key={node} style={{
              display: 'flex', justifyContent: 'space-between',
              padding: '5px 12px', borderBottom: '1px solid var(--color-border-light)',
              fontSize: 12,
            }}>
              <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-text-primary)' }}>{node}</span>
              <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-blue)', fontWeight: 600 }}>
                {(v as number).toFixed(4)} V
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================================
// Logic Analyzer
// ============================================================
function LogicAnalyzerView({ circuit }: { circuit: any }) {
  const logicGates = circuit.components.filter((c: any) =>
    ['gate_and','gate_or','gate_not','gate_nand','gate_nor','gate_xor','gate_xnor'].includes(c.type)
  );

  const [selectedGate, setSelectedGate] = useState<string>('gate_and');
  const { headers, rows } = useMemo(() => generateTruthTable(selectedGate, selectedGate === 'gate_not' ? 1 : 2), [selectedGate]);

  return (
    <div style={{ flex: 1, display: 'flex', gap: 16, padding: 16, overflow: 'auto' }}>
      {/* Gate selector */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flexShrink: 0 }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          Gate Type
        </div>
        {['gate_and','gate_or','gate_not','gate_nand','gate_nor','gate_xor','gate_xnor'].map(g => (
          <button key={g} onClick={() => setSelectedGate(g)} style={{
            padding: '4px 10px', fontSize: 11, fontFamily: 'var(--font-mono)',
            background: selectedGate === g ? 'var(--color-blue-light)' : 'var(--color-bg-secondary)',
            color: selectedGate === g ? 'var(--color-blue)' : 'var(--color-text-secondary)',
            border: '1px solid', borderColor: selectedGate === g ? 'var(--color-blue-mid)' : 'var(--color-border)',
            borderRadius: 5, cursor: 'pointer', fontWeight: selectedGate === g ? 600 : 400,
          }}>{g.replace('gate_','').toUpperCase()}</button>
        ))}
      </div>

      {/* Truth Table */}
      <div>
        <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 10 }}>
          {selectedGate.replace('gate_','').toUpperCase()} Gate Truth Table
        </div>
        <table style={{ borderCollapse: 'collapse', fontSize: 12 }}>
          <thead>
            <tr>
              {headers.map(h => (
                <th key={h} style={{
                  padding: '6px 16px', background: 'var(--color-bg-secondary)',
                  border: '1px solid var(--color-border)',
                  fontFamily: 'var(--font-mono)', color: 'var(--color-text-secondary)',
                }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i}>
                {row.map((val, j) => (
                  <td key={j} style={{
                    padding: '6px 16px', textAlign: 'center',
                    border: '1px solid var(--color-border)',
                    background: j === row.length - 1
                      ? (val === 1 ? 'var(--color-success-light)' : 'var(--color-bg-secondary)')
                      : 'var(--color-bg)',
                    color: j === row.length - 1
                      ? (val === 1 ? 'var(--color-success)' : 'var(--color-text-muted)')
                      : 'var(--color-text-primary)',
                    fontFamily: 'var(--font-mono)',
                    fontWeight: j === row.length - 1 ? 700 : 400,
                  }}>
                    {val}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        <div style={{ marginTop: 12, fontSize: 11, color: 'var(--color-text-muted)' }}>
          {selectedGate === 'gate_and'  && 'Y = A · B — Output is HIGH only when both inputs are HIGH'}
          {selectedGate === 'gate_or'   && 'Y = A + B — Output is HIGH when any input is HIGH'}
          {selectedGate === 'gate_not'  && 'Y = Ā — Output is the complement of input'}
          {selectedGate === 'gate_nand' && 'Y = ̄(A·B) — Universal gate: NOT of AND'}
          {selectedGate === 'gate_nor'  && 'Y = ̄(A+B) — Universal gate: NOT of OR'}
          {selectedGate === 'gate_xor'  && 'Y = A⊕B — Output HIGH when inputs differ'}
          {selectedGate === 'gate_xnor' && 'Y = ̄(A⊕B) — Output HIGH when inputs are equal'}
        </div>
      </div>
    </div>
  );
}

// ============================================================
// Spectrum Analyzer
// ============================================================
function SpectrumView({ simResult, circuit }: any) {
  const [freq, setFreq] = useState(1000);
  const [waveform, setWaveform] = useState<'sine'|'square'|'triangle'>('square');

  const spectrumData = useMemo(() => {
    const sr = 44100;
    const N = 512;
    const dur = N / sr;
    const { values } = generateSignal(waveform, freq, 1, 0, dur, sr);
    const { frequencies, magnitudes } = computeDFT(values.slice(0, N), sr);
    const maxFreq = freq * 10;
    return frequencies
      .map((f, i) => ({ f, m: magnitudes[i] }))
      .filter(d => d.f <= maxFreq && d.f > 0);
  }, [freq, waveform]);

  return (
    <div style={{ display: 'flex', flex: 1, flexDirection: 'column', padding: 12, gap: 12, background: '#0F172A', overflow: 'hidden' }}>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <span style={{ fontSize: 11, color: '#64748B', fontWeight: 600, letterSpacing: '0.05em' }}>SPECTRUM ANALYZER</span>
        <select value={waveform} onChange={e => setWaveform(e.target.value as any)}
          style={{ background: '#1E293B', color: '#22D3EE', border: '1px solid #334155', borderRadius: 4, padding: '3px 6px', fontSize: 11, fontFamily: 'monospace' }}>
          <option value="sine">Sine</option>
          <option value="square">Square</option>
          <option value="triangle">Triangle</option>
        </select>
        <input type="number" value={freq} min={10} onChange={e => setFreq(Math.max(10, parseFloat(e.target.value) || 1000))}
          style={{ width: 80, background: '#1E293B', color: '#22D3EE', border: '1px solid #334155', borderRadius: 4, padding: '3px 6px', fontSize: 11, fontFamily: 'monospace' }} />
        <span style={{ fontSize: 10, color: '#64748B' }}>Hz</span>
      </div>

      <div style={{ flex: 1 }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={spectrumData} margin={{ top: 4, right: 8, bottom: 16, left: 0 }}>
            <defs>
              <linearGradient id="specGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#2563EB" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#2563EB" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="2 6" stroke="rgba(34,211,238,0.08)" />
            <XAxis dataKey="f" tick={{ fontSize: 9, fill: '#64748B' }} label={{ value: 'Frequency (Hz)', position: 'insideBottom', fill: '#64748B', fontSize: 9 }} />
            <YAxis tick={{ fontSize: 9, fill: '#64748B' }} />
            <Tooltip contentStyle={{ background: '#1E293B', border: '1px solid #334155', fontSize: 11, color: '#E2E8F0' }} />
            <Area type="monotone" dataKey="m" stroke="#2563EB" fill="url(#specGrad)" dot={false} strokeWidth={1.5} isAnimationActive={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

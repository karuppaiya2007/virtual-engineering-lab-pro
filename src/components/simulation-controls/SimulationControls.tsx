import React from 'react';
import { useLabStore } from '../../state/labStore';
import { runDCAnalysis, runRCTransient } from '../../simulation/engine';

export default function SimulationControls() {
  const {
    circuit, simStatus, simConfig,
    setSimStatus, setSimResult, setSimConfig, activeTool, setActiveTool,
    clearSelection,
  } = useLabStore();

  const handleRun = () => {
    setSimStatus('running');
    setSimResult(null);

    setTimeout(() => {
      try {
        let result;
        if (simConfig.type === 'dc') {
          result = runDCAnalysis(circuit);
        } else if (simConfig.type === 'transient') {
          result = runRCTransient(circuit, simConfig.duration ?? 0.1, 500);
        } else {
          result = runDCAnalysis(circuit);
        }
        setSimResult(result);
        setSimStatus(result.errors.length > 0 ? 'error' : 'completed');
      } catch (err) {
        setSimResult({
          status: 'error',
          nodeVoltages: {}, branchCurrents: {}, powerDissipation: {},
          errors: [(err as Error).message || 'Unknown simulation error'],
          warnings: [],
        });
        setSimStatus('error');
      }
    }, 120);
  };

  const handleStop = () => {
    setSimStatus('idle');
    setSimResult(null);
  };

  const handleReset = () => {
    setSimStatus('idle');
    setSimResult(null);
  };

  const TOOLS: { id: typeof activeTool; label: string; icon: string; tip: string }[] = [
    { id: 'select', label: 'Select', icon: '▲', tip: 'Select & move components (V)' },
    { id: 'wire',   label: 'Wire',   icon: '⌇', tip: 'Draw wire connections (W)' },
    { id: 'delete', label: 'Delete', icon: '✕', tip: 'Delete component or wire (Delete)' },
    { id: 'pan',    label: 'Pan',    icon: '✋', tip: 'Pan the workspace (Space)' },
  ];

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      padding: '5px 12px',
      background: 'var(--color-bg)',
      borderBottom: '1px solid var(--color-border)',
      flexShrink: 0,
    }}>
      {/* Tools */}
      <div style={{ display: 'flex', gap: 2 }}>
        {TOOLS.map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTool(t.id)}
            data-tooltip={t.tip}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              padding: '4px 9px',
              fontSize: 11,
              fontWeight: 500,
              background: activeTool === t.id ? 'var(--color-blue)' : 'var(--color-bg-secondary)',
              color: activeTool === t.id ? '#fff' : 'var(--color-text-secondary)',
              border: '1px solid',
              borderColor: activeTool === t.id ? 'var(--color-blue)' : 'var(--color-border)',
              borderRadius: 5,
              cursor: 'pointer',
              fontFamily: 'var(--font-body)',
              transition: 'all 0.12s',
            }}
          >
            <span>{t.icon}</span>
            <span>{t.label}</span>
          </button>
        ))}
      </div>

      <div style={{ width: 1, height: 20, background: 'var(--color-border)' }} />

      {/* Sim type */}
      <select
        className="input"
        style={{ width: 120, fontSize: 11 }}
        value={simConfig.type}
        onChange={e => setSimConfig({ type: e.target.value as any })}
      >
        <option value="dc">DC Analysis</option>
        <option value="transient">Transient (RC)</option>
        <option value="digital">Digital Logic</option>
        <option value="signal">Signal/Comms</option>
      </select>

      {simConfig.type === 'transient' && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <label style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>Duration:</label>
          <input
            type="number"
            className="input"
            style={{ width: 70, fontSize: 11, fontFamily: 'var(--font-mono)' }}
            value={(simConfig.duration ?? 0.1) * 1000}
            min={1}
            step={1}
            onChange={e => setSimConfig({ duration: parseFloat(e.target.value) / 1000 })}
          />
          <span style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>ms</span>
        </div>
      )}

      <div style={{ flex: 1 }} />

      {/* Sim controls */}
      <div style={{ display: 'flex', gap: 4 }}>
        {simStatus === 'idle' || simStatus === 'completed' || simStatus === 'error' ? (
          <button className="btn btn-success btn-sm" onClick={handleRun}>
            ▶ Run
          </button>
        ) : (
          <button className="btn btn-secondary btn-sm" disabled>
            ⟳ Running…
          </button>
        )}
        <button className="btn btn-secondary btn-sm" onClick={handleStop} disabled={simStatus === 'idle'}>
          ■ Stop
        </button>
        <button className="btn btn-ghost btn-sm" onClick={handleReset}>
          ↺ Reset
        </button>
      </div>

      {/* Status */}
      {simStatus !== 'idle' && (
        <div className={`badge badge-${simStatus === 'completed' ? 'success' : simStatus === 'error' ? 'error' : 'blue'}`}>
          {simStatus === 'running' ? '⟳ Running' : simStatus === 'completed' ? '✓ Complete' : simStatus === 'error' ? '✗ Error' : simStatus}
        </div>
      )}

      {/* Component count */}
      <span style={{ fontSize: 10, color: 'var(--color-text-muted)' }}>
        {circuit.components.length}C · {circuit.wires.length}W
      </span>
    </div>
  );
}

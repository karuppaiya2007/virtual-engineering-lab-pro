import React from 'react';
import { useLabStore } from '../../state/labStore';

export default function SimResultsPanel() {
  const { simResult, circuit } = useLabStore();

  if (!simResult) return null;

  return (
    <div style={{ overflowY: 'auto', padding: '8px', flex: 1 }}>
      <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 8 }}>
        Simulation Results
      </div>

      {/* Errors */}
      {simResult.errors.length > 0 && (
        <div style={{ marginBottom: 8 }}>
          {simResult.errors.map((err, i) => (
            <div key={i} style={{
              padding: '6px 8px',
              background: 'var(--color-error-light)',
              border: '1px solid #FECACA',
              borderRadius: 6,
              fontSize: 11,
              color: 'var(--color-error)',
              marginBottom: 4,
            }}>
              ✗ {err}
            </div>
          ))}
        </div>
      )}

      {/* Warnings */}
      {simResult.warnings.length > 0 && (
        <div style={{ marginBottom: 8 }}>
          {simResult.warnings.map((w, i) => (
            <div key={i} style={{
              padding: '5px 8px',
              background: 'var(--color-warning-light)',
              border: '1px solid #FDE68A',
              borderRadius: 6,
              fontSize: 11,
              color: 'var(--color-warning)',
              marginBottom: 3,
            }}>
              ⚠ {w}
            </div>
          ))}
        </div>
      )}

      {/* Node Voltages */}
      {Object.keys(simResult.nodeVoltages).length > 0 && (
        <div style={{ marginBottom: 10 }}>
          <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: 5, textTransform: 'uppercase' }}>
            Node Voltages
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
            <thead>
              <tr style={{ background: 'var(--color-bg-secondary)' }}>
                <th style={{ padding: '3px 6px', textAlign: 'left', fontWeight: 600, color: 'var(--color-text-secondary)', borderBottom: '1px solid var(--color-border)' }}>Node</th>
                <th style={{ padding: '3px 6px', textAlign: 'right', fontWeight: 600, color: 'var(--color-text-secondary)', borderBottom: '1px solid var(--color-border)' }}>Voltage</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(simResult.nodeVoltages).map(([node, v]) => (
                <tr key={node}>
                  <td style={{ padding: '3px 6px', fontFamily: 'var(--font-mono)', color: 'var(--color-text-primary)' }}>{node}</td>
                  <td style={{ padding: '3px 6px', textAlign: 'right', fontFamily: 'var(--font-mono)', color: 'var(--color-blue)', fontWeight: 600 }}>
                    {formatVoltage(v)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Branch Currents */}
      {Object.keys(simResult.branchCurrents).length > 0 && (
        <div style={{ marginBottom: 10 }}>
          <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: 5, textTransform: 'uppercase' }}>
            Branch Currents
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
            <thead>
              <tr style={{ background: 'var(--color-bg-secondary)' }}>
                <th style={{ padding: '3px 6px', textAlign: 'left', fontWeight: 600, color: 'var(--color-text-secondary)', borderBottom: '1px solid var(--color-border)' }}>Component</th>
                <th style={{ padding: '3px 6px', textAlign: 'right', fontWeight: 600, color: 'var(--color-text-secondary)', borderBottom: '1px solid var(--color-border)' }}>Current</th>
                <th style={{ padding: '3px 6px', textAlign: 'right', fontWeight: 600, color: 'var(--color-text-secondary)', borderBottom: '1px solid var(--color-border)' }}>Power</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(simResult.branchCurrents).map(([id, I]) => {
                const comp = circuit.components.find(c => c.id === id);
                const P = simResult.powerDissipation[id];
                return (
                  <tr key={id}>
                    <td style={{ padding: '3px 6px', color: 'var(--color-text-primary)' }}>
                      {comp?.label || id.substring(0, 8) + '…'}
                    </td>
                    <td style={{ padding: '3px 6px', textAlign: 'right', fontFamily: 'var(--font-mono)', color: 'var(--color-success)', fontWeight: 600 }}>
                      {formatCurrent(I)}
                    </td>
                    <td style={{ padding: '3px 6px', textAlign: 'right', fontFamily: 'var(--font-mono)', color: 'var(--color-text-secondary)' }}>
                      {P !== undefined ? formatPower(P) : '—'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {simResult.status === 'completed' && simResult.errors.length === 0 && (
        <div style={{
          padding: '5px 8px',
          background: 'var(--color-success-light)',
          borderRadius: 6,
          fontSize: 11,
          color: 'var(--color-success)',
          fontWeight: 500,
        }}>
          ✓ Simulation completed successfully
        </div>
      )}
    </div>
  );
}

function formatVoltage(v: number): string {
  if (Math.abs(v) >= 1000) return `${(v/1000).toPrecision(4)} kV`;
  return `${v.toPrecision(5)} V`;
}

function formatCurrent(I: number): string {
  const abs = Math.abs(I);
  if (abs >= 1) return `${I.toPrecision(4)} A`;
  if (abs >= 1e-3) return `${(I * 1e3).toPrecision(4)} mA`;
  if (abs >= 1e-6) return `${(I * 1e6).toPrecision(4)} μA`;
  return `${(I * 1e9).toPrecision(4)} nA`;
}

function formatPower(P: number): string {
  if (P >= 1) return `${P.toPrecision(3)} W`;
  if (P >= 1e-3) return `${(P * 1e3).toPrecision(3)} mW`;
  return `${(P * 1e6).toPrecision(3)} μW`;
}

import React, { useState } from 'react';
import { Experiment } from '../../types';
import { useLabStore } from '../../state/labStore';

interface Props {
  experiment: Experiment;
}

export default function ExperimentPanel({ experiment }: Props) {
  const [step, setStep] = useState(0);
  const [tab, setTab] = useState<'procedure' | 'theory' | 'formulas' | 'observations'>('procedure');
  const { newCircuit, setSimConfig } = useLabStore();

  const handleLoadExperiment = () => {
    newCircuit();
    if (experiment.simType === 'dc') setSimConfig({ type: 'dc' });
    else if (experiment.simType === 'transient') setSimConfig({ type: 'transient', duration: 0.1 });
    else if (experiment.simType === 'digital') setSimConfig({ type: 'digital' });
    else setSimConfig({ type: 'signal' });
  };

  const diffColors: Record<string, string> = {
    beginner: 'var(--color-success)',
    intermediate: 'var(--color-warning)',
    advanced: 'var(--color-error)',
  };
  const simBadge: Record<string, string> = {
    dc: 'DC Sim',
    transient: 'Transient',
    digital: 'Digital',
    signal: 'Signal',
    guided: 'Guided',
    demonstration: 'Demo',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{
        padding: '10px 12px',
        borderBottom: '1px solid var(--color-border)',
        background: 'var(--color-bg)',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8, marginBottom: 6 }}>
          <h3 style={{ fontSize: 13, lineHeight: 1.3, color: 'var(--color-text-primary)' }}>
            {experiment.name}
          </h3>
          <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
            <span className="badge badge-muted" style={{ fontSize: 9 }}>
              {simBadge[experiment.simType] || experiment.simType}
            </span>
            <span
              className="badge"
              style={{
                fontSize: 9,
                background: diffColors[experiment.difficulty] + '18',
                color: diffColors[experiment.difficulty],
              }}
            >
              {experiment.difficulty}
            </span>
          </div>
        </div>
        <p style={{ fontSize: 11, color: 'var(--color-text-secondary)', lineHeight: 1.4 }}>
          {experiment.objective}
        </p>
        <button
          className="btn btn-primary btn-sm"
          style={{ marginTop: 8, width: '100%', justifyContent: 'center' }}
          onClick={handleLoadExperiment}
        >
          ↺ Reset Workspace for Experiment
        </button>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex',
        borderBottom: '1px solid var(--color-border)',
        background: 'var(--color-bg-secondary)',
        flexShrink: 0,
      }}>
        {(['procedure', 'theory', 'formulas', 'observations'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              padding: '6px 10px',
              fontSize: 11,
              fontWeight: 500,
              background: 'transparent',
              color: tab === t ? 'var(--color-blue)' : 'var(--color-text-muted)',
              border: 'none',
              borderBottom: tab === t ? '2px solid var(--color-blue)' : '2px solid transparent',
              cursor: 'pointer',
              fontFamily: 'var(--font-body)',
              textTransform: 'capitalize',
              marginBottom: -1,
              flex: 1,
            }}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '10px 12px' }}>
        {tab === 'procedure' && (
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Step-by-Step Procedure
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {experiment.procedure.map((s, i) => (
                <div
                  key={i}
                  onClick={() => setStep(i)}
                  style={{
                    display: 'flex',
                    gap: 10,
                    padding: '8px 10px',
                    borderRadius: 6,
                    background: step === i ? 'var(--color-blue-light)' : 'var(--color-bg-secondary)',
                    border: `1px solid ${step === i ? 'var(--color-blue-mid)' : 'var(--color-border)'}`,
                    cursor: 'pointer',
                    transition: 'all 0.12s',
                  }}
                >
                  <div style={{
                    width: 20, height: 20, borderRadius: '50%', flexShrink: 0,
                    background: step === i ? 'var(--color-blue)' : 'var(--color-bg-tertiary)',
                    color: step === i ? '#fff' : 'var(--color-text-muted)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 10, fontWeight: 700,
                  }}>
                    {i + 1}
                  </div>
                  <p style={{
                    fontSize: 11,
                    color: step === i ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
                    lineHeight: 1.5,
                    margin: 0,
                  }}>
                    {s}
                  </p>
                </div>
              ))}
            </div>

            {/* Nav buttons */}
            <div style={{ display: 'flex', gap: 6, marginTop: 10 }}>
              <button
                className="btn btn-secondary btn-sm"
                style={{ flex: 1 }}
                disabled={step === 0}
                onClick={() => setStep(s => s - 1)}
              >
                ← Prev
              </button>
              <button
                className="btn btn-primary btn-sm"
                style={{ flex: 1 }}
                disabled={step >= experiment.procedure.length - 1}
                onClick={() => setStep(s => s + 1)}
              >
                Next →
              </button>
            </div>
          </div>
        )}

        {tab === 'theory' && (
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Theory
            </div>
            <p style={{ fontSize: 12, color: 'var(--color-text-secondary)', lineHeight: 1.7 }}>
              {experiment.theory}
            </p>
            {experiment.simType === 'guided' && (
              <div style={{
                marginTop: 12, padding: 10, background: 'var(--color-warning-light)',
                border: '1px solid #FDE68A', borderRadius: 6,
                fontSize: 11, color: 'var(--color-warning)',
              }}>
                ℹ This is a guided demonstration experiment. Full circuit simulation for this type is not yet implemented.
              </div>
            )}
            {experiment.simType === 'demonstration' && (
              <div style={{
                marginTop: 12, padding: 10, background: 'var(--color-info-light)',
                border: '1px solid #A5F3FC', borderRadius: 6,
                fontSize: 11, color: 'var(--color-info)',
              }}>
                ℹ This experiment uses a mathematical model / visual demonstration.
              </div>
            )}
          </div>
        )}

        {tab === 'formulas' && (
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Key Formulas
            </div>
            {experiment.formulas && experiment.formulas.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {experiment.formulas.map((f, i) => (
                  <div key={i} style={{
                    padding: '10px 12px',
                    background: 'var(--color-bg-secondary)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 6,
                    borderLeft: '3px solid var(--color-blue)',
                  }}>
                    <div style={{ fontSize: 10, color: 'var(--color-text-muted)', marginBottom: 4, fontWeight: 600 }}>
                      {f.label}
                    </div>
                    <div style={{
                      fontSize: 13, fontFamily: 'var(--font-mono)',
                      color: 'var(--color-text-primary)', fontWeight: 500,
                    }}>
                      {f.formula}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state" style={{ padding: '20px 0' }}>
                <p style={{ fontSize: 11 }}>No formulas defined for this experiment.</p>
              </div>
            )}
          </div>
        )}

        {tab === 'observations' && (
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Observation Table
            </div>
            {experiment.observations && experiment.observations.length > 0 ? (
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
                <thead>
                  <tr style={{ background: 'var(--color-bg-secondary)' }}>
                    <th style={{ padding: '6px 8px', border: '1px solid var(--color-border)', textAlign: 'left', fontWeight: 600, color: 'var(--color-text-secondary)' }}>Parameter</th>
                    <th style={{ padding: '6px 8px', border: '1px solid var(--color-border)', fontWeight: 600, color: 'var(--color-text-secondary)' }}>Unit</th>
                    <th style={{ padding: '6px 8px', border: '1px solid var(--color-border)', fontWeight: 600, color: 'var(--color-text-secondary)' }}>Calculated</th>
                    <th style={{ padding: '6px 8px', border: '1px solid var(--color-border)', fontWeight: 600, color: 'var(--color-text-secondary)' }}>Measured</th>
                  </tr>
                </thead>
                <tbody>
                  {experiment.observations.map((obs, i) => (
                    <tr key={i}>
                      <td style={{ padding: '6px 8px', border: '1px solid var(--color-border)', color: 'var(--color-text-primary)' }}>{obs.variable}</td>
                      <td style={{ padding: '6px 8px', border: '1px solid var(--color-border)', textAlign: 'center', color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>{obs.unit}</td>
                      <td style={{ padding: '6px 8px', border: '1px solid var(--color-border)', textAlign: 'center', color: 'var(--color-blue)', fontFamily: 'var(--font-mono)' }}>
                        {obs.calculated?.toFixed(4) ?? '—'}
                      </td>
                      <td style={{ padding: '6px 8px', border: '1px solid var(--color-border)', textAlign: 'center' }}>
                        <input
                          type="number"
                          placeholder="Enter"
                          style={{
                            width: 70, padding: '2px 4px', fontSize: 11,
                            border: '1px solid var(--color-border)', borderRadius: 4,
                            fontFamily: 'var(--font-mono)', textAlign: 'center',
                            background: 'var(--color-bg)',
                          }}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div style={{
                padding: '16px', background: 'var(--color-bg-secondary)',
                borderRadius: 6, border: '1px solid var(--color-border)',
                fontSize: 11, color: 'var(--color-text-muted)', textAlign: 'center',
              }}>
                Run the simulation and record readings here.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

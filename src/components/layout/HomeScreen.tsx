import React from 'react';
import { useLabStore } from '../../state/labStore';
import { LABS } from '../../data/labs';

export default function HomeScreen() {
  const { setActiveLab, setActivePanel, projects, loadProject, newCircuit } = useLabStore();

  const handleNewCircuit = () => {
    newCircuit();
    setActiveLab('free');
  };

  return (
    <div style={{
      flex: 1,
      overflowY: 'auto',
      background: 'var(--color-bg-secondary)',
      padding: '24px',
      display: 'flex',
      flexDirection: 'column',
      gap: '24px',
    }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: 20, fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: 4 }}>
          ECE Virtual Engineering Lab Pro
        </h1>
        <p style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>
          Interactive electronics laboratory for ECE students
        </p>
      </div>

      {/* Quick Actions */}
      <section>
        <h2 style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>
          Quick Start
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 12 }}>
          {[
            { icon: '➕', label: 'New Circuit', desc: 'Start from scratch', action: handleNewCircuit, color: 'var(--color-blue)' },
            { icon: '📂', label: 'Open Project', desc: 'Load saved work', action: () => {}, color: 'var(--color-success)' },
            { icon: '🔬', label: 'Browse Labs', desc: 'All 13 ECE labs', action: () => {}, color: '#7C3AED' },
            { icon: '📖', label: 'Component Ref', desc: 'Component guide', action: () => {}, color: '#D97706' },
            { icon: '🎓', label: 'Guided Practice', desc: 'Step-by-step', action: () => setActiveLab('edc'), color: '#DC2626' },
          ].map(item => (
            <button
              key={item.label}
              onClick={item.action}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                padding: '14px',
                background: 'var(--color-bg)',
                border: '1px solid var(--color-border)',
                borderRadius: 8,
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.15s',
                fontFamily: 'var(--font-body)',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = item.color;
                e.currentTarget.style.boxShadow = `0 2px 8px rgba(0,0,0,0.08)`;
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'var(--color-border)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <span style={{ fontSize: 20, marginBottom: 8 }}>{item.icon}</span>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: 2 }}>{item.label}</div>
              <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>{item.desc}</div>
            </button>
          ))}
        </div>
      </section>

      {/* ECE Labs */}
      <section>
        <h2 style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>
          ECE Laboratories
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 10 }}>
          {LABS.filter(l => l.id !== 'free').map(lab => (
            <button
              key={lab.id}
              onClick={() => setActiveLab(lab.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '12px 14px',
                background: 'var(--color-bg)',
                border: '1px solid var(--color-border)',
                borderRadius: 8,
                cursor: 'pointer',
                textAlign: 'left',
                fontFamily: 'var(--font-body)',
                transition: 'all 0.15s',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'var(--color-bg-secondary)';
                e.currentTarget.style.borderColor = lab.color;
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'var(--color-bg)';
                e.currentTarget.style.borderColor = 'var(--color-border)';
              }}
            >
              <div style={{
                width: 34, height: 34,
                background: lab.color + '18',
                borderRadius: 8,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 16, flexShrink: 0,
              }}>
                {lab.icon}
              </div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: 1 }}>{lab.shortName}</div>
                <div style={{ fontSize: 11, color: 'var(--color-text-muted)', lineHeight: 1.3 }}>{lab.experiments.length} experiments</div>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Recent Projects */}
      {projects.length > 0 && (
        <section>
          <h2 style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>
            Recent Projects
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {projects.slice(-5).reverse().map(p => (
              <button
                key={p.id}
                onClick={() => loadProject(p.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 14px',
                  background: 'var(--color-bg)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 8,
                  cursor: 'pointer',
                  fontFamily: 'var(--font-body)',
                  textAlign: 'left',
                  transition: 'background 0.12s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--color-bg-secondary)'}
                onMouseLeave={e => e.currentTarget.style.background = 'var(--color-bg)'}
              >
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-primary)' }}>{p.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>
                    {p.circuit.components.length} components · {new Date(p.updatedAt).toLocaleDateString()}
                  </div>
                </div>
                <span style={{ fontSize: 12, color: 'var(--color-blue)' }}>Open →</span>
              </button>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

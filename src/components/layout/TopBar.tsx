import React, { useState } from 'react';
import { useLabStore } from '../../state/labStore';
import { LABS } from '../../data/labs';

export default function TopBar() {
  const {
    circuit, activeTool, view, simStatus,
    setView, undo, redo, saveProject,
    history, historyIndex,
    setActivePanel, activeLabId
  } = useLabStore();

  const [saving, setSaving] = useState(false);

  const handleSave = () => {
    setSaving(true);
    saveProject();
    setTimeout(() => setSaving(false), 1500);
  };

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;
  const activeLab = LABS.find(l => l.id === activeLabId);

  return (
    <header style={{
      height: 'var(--topbar-height)',
      display: 'flex',
      alignItems: 'center',
      padding: '0 12px',
      background: 'var(--color-bg)',
      borderBottom: '1px solid var(--color-border)',
      gap: '12px',
      flexShrink: 0,
      zIndex: 100,
    }}>
      {/* Logo */}
      <div
        onClick={() => setActivePanel('home')}
        style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', flexShrink: 0 }}
      >
        <div style={{
          width: 28, height: 28,
          background: 'var(--color-blue)',
          borderRadius: 6,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#fff', fontSize: 14, fontWeight: 700,
        }}>E</div>
        <span style={{ fontWeight: 700, fontSize: 14, color: 'var(--color-text-primary)', letterSpacing: '-0.2px' }}>
          ECE Virtual Lab
        </span>
      </div>

      {/* Separator */}
      <div style={{ width: 1, height: 20, background: 'var(--color-border)', flexShrink: 0 }} />

      {/* Context */}
      {activeLab && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--color-text-secondary)', flexShrink: 0 }}>
          <span style={{ color: activeLab.color }}>{activeLab.icon}</span>
          <span>{activeLab.name}</span>
          <span style={{ color: 'var(--color-border)' }}>›</span>
          <span style={{ color: 'var(--color-text-primary)', fontWeight: 500, maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {circuit.name}
          </span>
        </div>
      )}

      {/* Spacer */}
      <div style={{ flex: 1 }} />

      {/* View Toggle */}
      <div style={{ display: 'flex', background: 'var(--color-bg-secondary)', borderRadius: 6, border: '1px solid var(--color-border)', overflow: 'hidden', flexShrink: 0 }}>
        {(['schematic', 'breadboard'] as const).map(v => (
          <button
            key={v}
            onClick={() => setView(v)}
            style={{
              padding: '4px 10px',
              fontSize: 11,
              fontWeight: 500,
              background: view === v ? 'var(--color-blue)' : 'transparent',
              color: view === v ? '#fff' : 'var(--color-text-secondary)',
              border: 'none',
              cursor: 'pointer',
              textTransform: 'capitalize',
              transition: 'all 0.15s',
              fontFamily: 'var(--font-body)',
            }}
          >
            {v}
          </button>
        ))}
      </div>

      {/* Undo/Redo */}
      <div style={{ display: 'flex', gap: 2, flexShrink: 0 }}>
        <button
          onClick={undo}
          disabled={!canUndo}
          className="btn btn-ghost btn-icon"
          data-tooltip="Undo (Ctrl+Z)"
          style={{ fontSize: 14 }}
        >↩</button>
        <button
          onClick={redo}
          disabled={!canRedo}
          className="btn btn-ghost btn-icon"
          data-tooltip="Redo (Ctrl+Y)"
          style={{ fontSize: 14 }}
        >↪</button>
      </div>

      {/* Sim Status */}
      {simStatus !== 'idle' && (
        <div className={`badge badge-${simStatus === 'completed' ? 'success' : simStatus === 'error' ? 'error' : 'blue'}`} style={{ flexShrink: 0 }}>
          {simStatus === 'running' ? '⟳ Running' : simStatus === 'completed' ? '✓ Done' : simStatus === 'error' ? '✗ Error' : simStatus}
        </div>
      )}

      {/* Save */}
      <button
        onClick={handleSave}
        className="btn btn-secondary btn-sm"
        style={{ flexShrink: 0 }}
      >
        {saving ? '✓ Saved' : '⬡ Save'}
      </button>
    </header>
  );
}

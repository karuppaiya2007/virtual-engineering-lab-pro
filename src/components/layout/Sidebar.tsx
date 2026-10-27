import React from 'react';
import { useLabStore } from '../../state/labStore';
import { LABS } from '../../data/labs';

export default function Sidebar() {
  const { sidebarCollapsed, toggleSidebar, setActiveLab, activeLabId, setActivePanel } = useLabStore();

  const w = sidebarCollapsed ? 'var(--sidebar-collapsed-width)' : 'var(--sidebar-width)';

  return (
    <aside style={{
      width: w,
      minWidth: w,
      maxWidth: w,
      height: '100%',
      background: 'var(--color-bg)',
      borderRight: '1px solid var(--color-border)',
      display: 'flex',
      flexDirection: 'column',
      transition: 'width 0.2s ease',
      overflow: 'hidden',
      flexShrink: 0,
      zIndex: 50,
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: sidebarCollapsed ? 'center' : 'space-between',
        padding: '8px 10px',
        borderBottom: '1px solid var(--color-border)',
        flexShrink: 0,
      }}>
        {!sidebarCollapsed && (
          <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Laboratories
          </span>
        )}
        <button
          onClick={toggleSidebar}
          className="btn btn-ghost btn-icon"
          data-tooltip={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          style={{ fontSize: 12 }}
        >
          {sidebarCollapsed ? '▶' : '◀'}
        </button>
      </div>

      {/* Home */}
      <button
        onClick={() => setActivePanel('home')}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: sidebarCollapsed ? '8px' : '8px 10px',
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          fontSize: 13,
          color: 'var(--color-text-secondary)',
          fontFamily: 'var(--font-body)',
          width: '100%',
          textAlign: 'left',
          borderBottom: '1px solid var(--color-border-light)',
          transition: 'background 0.12s',
          justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
        }}
        onMouseEnter={e => (e.currentTarget.style.background = 'var(--color-bg-secondary)')}
        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
      >
        <span style={{ fontSize: 16 }}>🏠</span>
        {!sidebarCollapsed && <span style={{ fontWeight: 500 }}>Home</span>}
      </button>

      {/* Labs List */}
      <div style={{ flex: 1, overflowY: 'auto', padding: sidebarCollapsed ? '4px 0' : '4px 0' }}>
        {LABS.map(lab => {
          const isActive = lab.id === activeLabId;
          return (
            <button
              key={lab.id}
              onClick={() => setActiveLab(lab.id)}
              title={sidebarCollapsed ? lab.name : undefined}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: sidebarCollapsed ? '8px' : '7px 10px',
                background: isActive ? 'var(--color-blue-light)' : 'transparent',
                border: 'none',
                borderLeft: isActive ? `3px solid ${lab.color}` : '3px solid transparent',
                cursor: 'pointer',
                fontSize: 12,
                color: isActive ? lab.color : 'var(--color-text-secondary)',
                fontFamily: 'var(--font-body)',
                width: '100%',
                textAlign: 'left',
                fontWeight: isActive ? 600 : 400,
                transition: 'all 0.12s',
                justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
              }}
              onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'var(--color-bg-secondary)'; }}
              onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
            >
              <span style={{ fontSize: 15, flexShrink: 0 }}>{lab.icon}</span>
              {!sidebarCollapsed && (
                <div style={{ overflow: 'hidden' }}>
                  <div style={{ fontWeight: 600, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.04em', color: isActive ? lab.color : 'var(--color-text-muted)' }}>
                    {lab.shortName}
                  </div>
                  <div style={{ fontSize: 11, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: isActive ? 'var(--color-text-primary)' : 'var(--color-text-secondary)' }}>
                    {lab.name}
                  </div>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </aside>
  );
}

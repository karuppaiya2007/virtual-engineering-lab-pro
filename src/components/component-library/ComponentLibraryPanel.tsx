import React, { useState, useRef } from 'react';
import { useLabStore } from '../../state/labStore';
import { COMPONENT_LIBRARY, CATEGORIES } from '../../data/componentLibrary';
import { ComponentDef, ComponentType } from '../../types';

export default function ComponentLibraryPanel() {
  const { addComponent, setActiveTool, transform } = useLabStore();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [draggingType, setDraggingType] = useState<ComponentType | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const filtered = COMPONENT_LIBRARY.filter(c => {
    const matchCat = category === 'all' || c.category === category;
    const matchSearch = !search || c.tags.some(t => t.toLowerCase().includes(search.toLowerCase())) || c.name.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const handleDragStart = (e: React.DragEvent, def: ComponentDef) => {
    e.dataTransfer.setData('componentType', def.type);
    setDraggingType(def.type);
  };

  const handleDoubleClick = (def: ComponentDef) => {
    // Place in center of visible workspace
    const x = (400 - transform.x) / transform.scale;
    const y = (300 - transform.y) / transform.scale;
    addComponent(def.type, Math.round(x / 10) * 10, Math.round(y / 10) * 10);
    setActiveTool('select');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {/* Header */}
      <div className="panel-header">
        <span>Components</span>
        <span style={{ fontSize: 10, color: 'var(--color-text-muted)', fontWeight: 400 }}>{filtered.length}</span>
      </div>

      {/* Search */}
      <div style={{ padding: '6px 8px', borderBottom: '1px solid var(--color-border)' }}>
        <input
          className="input"
          placeholder="Search components..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ fontSize: 11 }}
        />
      </div>

      {/* Category tabs */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 3,
        padding: '6px 8px',
        borderBottom: '1px solid var(--color-border)',
        flexShrink: 0,
      }}>
        {CATEGORIES.map(cat => (
          <button
            key={cat.id}
            onClick={() => setCategory(cat.id)}
            style={{
              padding: '2px 7px',
              fontSize: 10,
              fontWeight: 500,
              background: category === cat.id ? 'var(--color-blue)' : 'var(--color-bg-secondary)',
              color: category === cat.id ? '#fff' : 'var(--color-text-secondary)',
              border: '1px solid',
              borderColor: category === cat.id ? 'var(--color-blue)' : 'var(--color-border)',
              borderRadius: 10,
              cursor: 'pointer',
              fontFamily: 'var(--font-body)',
              transition: 'all 0.12s',
            }}
          >
            {cat.label === 'All Components' ? 'All' : cat.label}
          </button>
        ))}
      </div>

      {/* Component List */}
      <div ref={panelRef} style={{ flex: 1, overflowY: 'auto', padding: '4px' }}>
        {filtered.length === 0 ? (
          <div className="empty-state" style={{ padding: '20px 8px' }}>
            <span style={{ fontSize: 24 }}>🔍</span>
            <p style={{ fontSize: 11 }}>No components match "{search}"</p>
          </div>
        ) : (
          filtered.map(def => (
            <ComponentItem
              key={def.type}
              def={def}
              onDragStart={handleDragStart}
              onDoubleClick={handleDoubleClick}
            />
          ))
        )}
      </div>

      {/* Hint */}
      <div style={{
        padding: '6px 8px',
        borderTop: '1px solid var(--color-border)',
        fontSize: 10,
        color: 'var(--color-text-muted)',
        textAlign: 'center',
      }}>
        Drag to canvas · Double-click to place
      </div>
    </div>
  );
}

function ComponentItem({
  def,
  onDragStart,
  onDoubleClick,
}: {
  def: ComponentDef;
  onDragStart: (e: React.DragEvent, def: ComponentDef) => void;
  onDoubleClick: (def: ComponentDef) => void;
}) {
  const categoryColors: Record<string, string> = {
    passive:    '#2563EB',
    diode:      '#DC2626',
    transistor: '#16A34A',
    ic:         '#BE185D',
    source:     '#D97706',
    logic:      '#7C3AED',
    instrument: '#0891B2',
    connector:  '#374151',
  };

  const color = categoryColors[def.category] || '#374151';

  return (
    <div
      draggable
      onDragStart={e => onDragStart(e, def)}
      onDoubleClick={() => onDoubleClick(def)}
      title={def.description}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '6px 8px',
        borderRadius: 6,
        cursor: 'grab',
        border: '1px solid transparent',
        transition: 'all 0.12s',
        userSelect: 'none',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.background = 'var(--color-bg-secondary)';
        e.currentTarget.style.borderColor = 'var(--color-border)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.background = 'transparent';
        e.currentTarget.style.borderColor = 'transparent';
      }}
    >
      {/* Color indicator */}
      <div style={{
        width: 6,
        height: 28,
        background: color,
        borderRadius: 3,
        flexShrink: 0,
        opacity: 0.8,
      }} />

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-primary)', lineHeight: 1.3 }}>
          {def.name}
        </div>
        <div style={{
          fontSize: 10,
          color: 'var(--color-text-muted)',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          lineHeight: 1.3,
        }}>
          {def.description}
        </div>
      </div>

      <span style={{ fontSize: 10, color: 'var(--color-text-muted)', flexShrink: 0 }}>⠿</span>
    </div>
  );
}

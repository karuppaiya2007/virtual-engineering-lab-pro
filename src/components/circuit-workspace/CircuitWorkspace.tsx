import React, { useRef, useCallback, useState, useEffect } from 'react';
import { useLabStore } from '../../state/labStore';
import SchematicView from '../schematic/SchematicView';
import BreadboardView from '../breadboard/BreadboardView';
import { COMPONENT_DEFS } from '../../data/componentLibrary';
import { ComponentType } from '../../types';

export default function CircuitWorkspace() {
  const {
    view, activeTool, transform, setTransform, clearSelection,
    addComponent,
  } = useLabStore();

  const containerRef = useRef<HTMLDivElement>(null);
  const [isPanning, setIsPanning] = useState(false);
  const panStart = useRef<{ mx: number; my: number; tx: number; ty: number } | null>(null);
  const transformRef = useRef(transform);
  transformRef.current = transform;

  // Zoom with wheel
  const handleWheel = useCallback((e: WheelEvent) => {
    e.preventDefault();
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const t = transformRef.current;
    const factor = e.deltaY < 0 ? 1.1 : 0.9;
    const newScale = Math.min(4, Math.max(0.2, t.scale * factor));
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    const newX = mx - (mx - t.x) * (newScale / t.scale);
    const newY = my - (my - t.y) * (newScale / t.scale);
    setTransform({ x: newX, y: newY, scale: newScale });
  }, [setTransform]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    el.addEventListener('wheel', handleWheel, { passive: false });
    return () => el.removeEventListener('wheel', handleWheel);
  }, [handleWheel]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (activeTool === 'pan' || e.button === 1) {
      setIsPanning(true);
      panStart.current = { mx: e.clientX, my: e.clientY, tx: transform.x, ty: transform.y };
      e.preventDefault();
    } else if (e.target === e.currentTarget) {
      clearSelection();
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanning && panStart.current) {
      const dx = e.clientX - panStart.current.mx;
      const dy = e.clientY - panStart.current.my;
      setTransform({ x: panStart.current.tx + dx, y: panStart.current.ty + dy });
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
    panStart.current = null;
  };

  // Drag-drop from component library
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const type = e.dataTransfer.getData('componentType') as ComponentType;
    if (!type || !COMPONENT_DEFS[type]) return;
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    // Convert screen coords to canvas coords
    const canvasX = (e.clientX - rect.left - transform.x) / transform.scale;
    const canvasY = (e.clientY - rect.top  - transform.y) / transform.scale;
    // Snap to 10px grid
    addComponent(type, Math.round(canvasX / 10) * 10, Math.round(canvasY / 10) * 10);
  };

  return (
    <div
      ref={containerRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      style={{
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        position: 'relative',
        background: '#FAFBFC',
        cursor:
          activeTool === 'pan'    ? (isPanning ? 'grabbing' : 'grab') :
          activeTool === 'wire'   ? 'crosshair' :
          activeTool === 'delete' ? 'not-allowed' : 'default',
        userSelect: 'none',
      }}
    >
      {/* Dot grid */}
      <GridBackground transform={transform} />

      {/* Transformed canvas */}
      <div
        style={{
          position: 'absolute',
          transformOrigin: '0 0',
          transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`,
          width: '3000px',
          height: '3000px',
        }}
      >
        {view === 'schematic' ? <SchematicView /> : <BreadboardView />}
      </div>

      {/* Zoom Controls */}
      <ZoomControls />
    </div>
  );
}

function GridBackground({ transform }: { transform: { x: number; y: number; scale: number } }) {
  const { showGrid } = useLabStore();
  if (!showGrid) return null;
  const gridSize = 20 * transform.scale;
  const offsetX = ((transform.x % gridSize) + gridSize) % gridSize;
  const offsetY = ((transform.y % gridSize) + gridSize) % gridSize;
  return (
    <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
      <defs>
        <pattern id="grid-dots" x={offsetX} y={offsetY} width={gridSize} height={gridSize} patternUnits="userSpaceOnUse">
          <circle cx={0} cy={0} r={0.9} fill="#CBD5E0" opacity={0.9} />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#grid-dots)" />
    </svg>
  );
}

function ZoomControls() {
  const { transform, setTransform, resetTransform } = useLabStore();
  return (
    <div style={{ position: 'absolute', bottom: 16, right: 16, display: 'flex', flexDirection: 'column', gap: 4, zIndex: 20 }}>
      <div style={{
        background: 'var(--color-bg)', border: '1px solid var(--color-border)',
        borderRadius: 6, overflow: 'hidden', boxShadow: 'var(--shadow-sm)',
        display: 'flex', flexDirection: 'column',
      }}>
        <button
          className="btn btn-ghost"
          style={{ padding: '5px 12px', borderRadius: 0, borderBottom: '1px solid var(--color-border)', fontSize: 16, lineHeight: 1 }}
          onClick={() => setTransform({ scale: Math.min(4, transform.scale * 1.25), x: transform.x, y: transform.y })}
        >+</button>
        <div style={{ padding: '4px 12px', fontSize: 11, textAlign: 'center', color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)', background: 'var(--color-bg-secondary)' }}>
          {Math.round(transform.scale * 100)}%
        </div>
        <button
          className="btn btn-ghost"
          style={{ padding: '5px 12px', borderRadius: 0, borderTop: '1px solid var(--color-border)', fontSize: 16, lineHeight: 1 }}
          onClick={() => setTransform({ scale: Math.max(0.2, transform.scale * 0.8), x: transform.x, y: transform.y })}
        >−</button>
      </div>
      <button className="btn btn-secondary btn-sm" style={{ fontSize: 11, padding: '3px 8px' }} onClick={resetTransform} title="Fit to screen">
        ⊙ Fit
      </button>
    </div>
  );
}

import React, { useState } from 'react';
import { useLabStore } from '../../state/labStore';
import { LABS_MAP } from '../../data/labs';
import ExperimentPanel from '../experiments/ExperimentPanel';
import CircuitWorkspace from '../circuit-workspace/CircuitWorkspace';
import ComponentLibraryPanel from '../component-library/ComponentLibraryPanel';
import PropertyInspector from '../property-inspector/PropertyInspector';
import SimulationControls from '../simulation-controls/SimulationControls';
import InstrumentsPanel from '../instruments/InstrumentsPanel';
import SimResultsPanel from '../simulation-controls/SimResultsPanel';

export default function LabWorkspace() {
  const {
    activeLabId, activeExperimentId, setActiveLab,
    inspectorCollapsed, instrumentsCollapsed,
    toggleInspector, toggleInstruments,
  } = useLabStore();

  const lab = activeLabId ? LABS_MAP[activeLabId] : null;
  const experiment = lab?.experiments.find(e => e.id === activeExperimentId);

  const [showExperiment, setShowExperiment] = useState(true);
  const [leftWidth, setLeftWidth] = useState(200);
  const [rightWidth, setRightWidth] = useState(280);

  if (!lab) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {/* Lab Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '6px 12px',
        background: 'var(--color-bg)',
        borderBottom: '1px solid var(--color-border)',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 16 }}>{lab.icon}</span>
          <span style={{ fontSize: 13, fontWeight: 700, color: lab.color }}>{lab.shortName}</span>
          <span style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>{lab.name}</span>
        </div>

        <div style={{ flex: 1 }} />

        {/* Experiment selector */}
        {lab.experiments.length > 0 && (
          <select
            className="input"
            style={{ width: 250, fontSize: 12 }}
            value={activeExperimentId ?? ''}
            onChange={e => setActiveLab(activeLabId!, e.target.value || null)}
          >
            <option value="">— Select Experiment —</option>
            {lab.experiments.map(exp => (
              <option key={exp.id} value={exp.id}>{exp.name}</option>
            ))}
          </select>
        )}

        <button
          onClick={() => setShowExperiment(s => !s)}
          className="btn btn-secondary btn-sm"
        >
          {showExperiment ? 'Hide Procedure' : 'Show Procedure'}
        </button>
        <button onClick={toggleInspector} className="btn btn-ghost btn-sm">Inspector</button>
        <button onClick={toggleInstruments} className="btn btn-ghost btn-sm">Instruments</button>
      </div>

      {/* Simulation Controls */}
      <SimulationControls />

      {/* Main Layout */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Component Library */}
        <div style={{
          width: leftWidth,
          minWidth: 180,
          maxWidth: 300,
          flexShrink: 0,
          borderRight: '1px solid var(--color-border)',
          display: 'flex',
          flexDirection: 'column',
          background: 'var(--color-bg)',
          overflow: 'hidden',
        }}>
          <ComponentLibraryPanel />
        </div>

        {/* Workspace + Instruments */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {/* Circuit + Experiment split */}
          <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
            {/* Experiment Panel */}
            {showExperiment && experiment && (
              <>
                <div style={{ width: 340, flexShrink: 0, borderRight: '1px solid var(--color-border)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                  <ExperimentPanel experiment={experiment} />
                </div>
              </>
            )}

            {/* Circuit Workspace */}
            <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
              <CircuitWorkspace />
            </div>
          </div>

          {/* Instruments Panel */}
          {!instrumentsCollapsed && (
            <div style={{
              height: 'var(--instruments-height)',
              flexShrink: 0,
              borderTop: '1px solid var(--color-border)',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
            }}>
              <InstrumentsPanel />
            </div>
          )}
        </div>

        {/* Property Inspector */}
        {!inspectorCollapsed && (
          <div style={{
            width: rightWidth,
            flexShrink: 0,
            borderLeft: '1px solid var(--color-border)',
            background: 'var(--color-bg)',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
          }}>
            <PropertyInspector />
            <SimResultsPanel />
          </div>
        )}
      </div>
    </div>
  );
}

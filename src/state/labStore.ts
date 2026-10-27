import { create } from 'zustand';
import {
  Circuit, PlacedComponent, Wire, SimResult, SimConfig,
  ActiveTool, WorkspaceView, ViewTransform, Project, ActivePanel,
  ComponentType, Point, Pin,
} from '../types';
import { COMPONENT_DEFS } from '../data/componentLibrary';
import { v4 as uuid } from './uuid';

// ============================================================
// Helpers
// ============================================================
function makeNewCircuit(): Circuit {
  return {
    id: uuid(),
    name: 'Untitled Circuit',
    components: [],
    wires: [],
    nodes: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

// ============================================================
// Store Interface
// ============================================================
interface LabStore {
  // --- UI ---
  activePanel: ActivePanel;
  activeLabId: string | null;
  activeExperimentId: string | null;
  sidebarCollapsed: boolean;
  inspectorCollapsed: boolean;
  instrumentsCollapsed: boolean;
  view: WorkspaceView;
  activeTool: ActiveTool;
  transform: ViewTransform;
  selectedComponentIds: string[];
  selectedWireIds: string[];
  showGrid: boolean;

  // --- Circuit ---
  circuit: Circuit;
  history: Circuit[];
  historyIndex: number;

  // --- Simulation ---
  simConfig: SimConfig;
  simResult: SimResult | null;
  simStatus: 'idle' | 'running' | 'paused' | 'error' | 'completed';

  // --- Projects ---
  projects: Project[];
  activeProjectId: string | null;

  // --- Wire drawing ---
  wireInProgress: {
    fromComponentId: string;
    fromPinId: string;
    startX: number;
    startY: number;
    currentX: number;
    currentY: number;
  } | null;

  // --- Actions ---
  setActivePanel: (panel: ActivePanel) => void;
  setActiveLab: (labId: string | null, experimentId?: string | null) => void;
  toggleSidebar: () => void;
  toggleInspector: () => void;
  toggleInstruments: () => void;
  setView: (view: WorkspaceView) => void;
  setActiveTool: (tool: ActiveTool) => void;
  setTransform: (t: Partial<ViewTransform>) => void;
  resetTransform: () => void;

  // Circuit
  addComponent: (type: ComponentType, x: number, y: number) => string;
  moveComponent: (id: string, x: number, y: number) => void;
  removeComponent: (id: string) => void;
  updateComponentProps: (id: string, props: Partial<PlacedComponent['props']>) => void;
  rotateComponent: (id: string) => void;
  selectComponent: (id: string, multi?: boolean) => void;
  clearSelection: () => void;
  selectAll: () => void;

  // Wires
  startWire: (componentId: string, pinId: string, x: number, y: number) => void;
  updateWirePreview: (x: number, y: number) => void;
  finishWire: (componentId: string, pinId: string) => void;
  cancelWire: () => void;
  removeWire: (id: string) => void;
  selectWire: (id: string, multi?: boolean) => void;

  // Circuit management
  newCircuit: () => void;
  setCircuitName: (name: string) => void;
  loadCircuit: (c: Circuit) => void;
  undo: () => void;
  redo: () => void;

  // Simulation
  setSimConfig: (cfg: Partial<SimConfig>) => void;
  setSimResult: (result: SimResult | null) => void;
  setSimStatus: (s: LabStore['simStatus']) => void;

  // Projects
  saveProject: () => void;
  loadProject: (id: string) => void;
  deleteProject: (id: string) => void;
  loadProjectsFromStorage: () => void;
}

// ============================================================
// Pin positioning utility
// ============================================================
function getRotatedPins(component: PlacedComponent): Pin[] {
  const rot = (component.rotation * Math.PI) / 180;
  const cos = Math.cos(rot);
  const sin = Math.sin(rot);
  return component.pins.map(pin => ({
    ...pin,
    x: component.x + pin.x * cos - pin.y * sin,
    y: component.y + pin.x * sin + pin.y * cos,
  }));
}

// ============================================================
// Store
// ============================================================
const initialCircuit = makeNewCircuit();

export const useLabStore = create<LabStore>((set, get) => ({
  // --- UI defaults ---
  activePanel: 'home',
  activeLabId: null,
  activeExperimentId: null,
  sidebarCollapsed: false,
  inspectorCollapsed: false,
  instrumentsCollapsed: false,
  view: 'schematic',
  activeTool: 'select',
  transform: { x: 0, y: 0, scale: 1 },
  selectedComponentIds: [],
  selectedWireIds: [],
  showGrid: true,

  // --- Circuit ---
  circuit: initialCircuit,
  history: [initialCircuit],
  historyIndex: 0,

  // --- Simulation ---
  simConfig: { type: 'dc' },
  simResult: null,
  simStatus: 'idle',

  // --- Projects ---
  projects: [],
  activeProjectId: null,

  // --- Wire drawing ---
  wireInProgress: null,

  // ============================================================
  // UI Actions
  // ============================================================
  setActivePanel: (panel) => set({ activePanel: panel }),

  setActiveLab: (labId, experimentId = null) =>
    set({ activeLabId: labId, activeExperimentId: experimentId, activePanel: labId ? 'lab' : 'home' }),

  toggleSidebar: () => set(s => ({ sidebarCollapsed: !s.sidebarCollapsed })),
  toggleInspector: () => set(s => ({ inspectorCollapsed: !s.inspectorCollapsed })),
  toggleInstruments: () => set(s => ({ instrumentsCollapsed: !s.instrumentsCollapsed })),
  setView: (view) => set({ view }),
  setActiveTool: (tool) => set({ activeTool: tool, wireInProgress: null }),
  setTransform: (t) => set(s => ({ transform: { ...s.transform, ...t } })),
  resetTransform: () => set({ transform: { x: 0, y: 0, scale: 1 } }),

  // ============================================================
  // Component Actions
  // ============================================================
  addComponent: (type, x, y) => {
    const def = COMPONENT_DEFS[type];
    if (!def) return '';
    const id = uuid();
    const newComp: PlacedComponent = {
      id,
      type,
      label: `${def.name.substring(0, 2).toUpperCase()}${Date.now() % 1000}`,
      x,
      y,
      rotation: 0,
      props: { ...def.defaultProps },
      pins: def.defaultPins.map(p => ({ ...p })),
    };
    set(s => {
      const updated = {
        ...s.circuit,
        components: [...s.circuit.components, newComp],
        updatedAt: new Date().toISOString(),
      };
      return {
        circuit: updated,
        selectedComponentIds: [id],
        ...pushHistory(s, updated),
      };
    });
    return id;
  },

  moveComponent: (id, x, y) => {
    set(s => {
      const updated = {
        ...s.circuit,
        components: s.circuit.components.map(c =>
          c.id === id ? { ...c, x, y } : c
        ),
        updatedAt: new Date().toISOString(),
      };
      return { circuit: updated };
    });
  },

  removeComponent: (id) => {
    set(s => {
      const updated = {
        ...s.circuit,
        components: s.circuit.components.filter(c => c.id !== id),
        wires: s.circuit.wires.filter(w => w.fromComponentId !== id && w.toComponentId !== id),
        updatedAt: new Date().toISOString(),
      };
      return {
        circuit: updated,
        selectedComponentIds: s.selectedComponentIds.filter(i => i !== id),
        ...pushHistory(s, updated),
      };
    });
  },

  updateComponentProps: (id, props) => {
    set(s => {
      const updated = {
        ...s.circuit,
        components: s.circuit.components.map(c =>
          c.id === id ? { ...c, props: { ...c.props, ...props } } : c
        ),
        updatedAt: new Date().toISOString(),
      };
      return { circuit: updated, ...pushHistory(s, updated) };
    });
  },

  rotateComponent: (id) => {
    set(s => {
      const updated = {
        ...s.circuit,
        components: s.circuit.components.map(c =>
          c.id === id ? { ...c, rotation: (c.rotation + 90) % 360 } : c
        ),
        updatedAt: new Date().toISOString(),
      };
      return { circuit: updated };
    });
  },

  selectComponent: (id, multi = false) => {
    set(s => ({
      selectedComponentIds: multi
        ? s.selectedComponentIds.includes(id)
          ? s.selectedComponentIds.filter(i => i !== id)
          : [...s.selectedComponentIds, id]
        : [id],
      selectedWireIds: multi ? s.selectedWireIds : [],
    }));
  },

  clearSelection: () => set({ selectedComponentIds: [], selectedWireIds: [] }),
  selectAll: () => set(s => ({
    selectedComponentIds: s.circuit.components.map(c => c.id),
  })),

  // ============================================================
  // Wire Actions
  // ============================================================
  startWire: (componentId, pinId, x, y) => {
    set({ wireInProgress: { fromComponentId: componentId, fromPinId: pinId, startX: x, startY: y, currentX: x, currentY: y } });
  },

  updateWirePreview: (x, y) => {
    set(s => s.wireInProgress ? { wireInProgress: { ...s.wireInProgress, currentX: x, currentY: y } } : {});
  },

  finishWire: (componentId, pinId) => {
    const { wireInProgress, circuit } = get();
    if (!wireInProgress) return;
    if (wireInProgress.fromComponentId === componentId && wireInProgress.fromPinId === pinId) {
      set({ wireInProgress: null });
      return;
    }
    // Check for duplicate
    const duplicate = circuit.wires.find(w =>
      (w.fromComponentId === wireInProgress.fromComponentId && w.fromPinId === wireInProgress.fromPinId &&
       w.toComponentId === componentId && w.toPinId === pinId) ||
      (w.toComponentId === wireInProgress.fromComponentId && w.toPinId === wireInProgress.fromPinId &&
       w.fromComponentId === componentId && w.fromPinId === pinId)
    );
    if (duplicate) { set({ wireInProgress: null }); return; }

    const newWire: Wire = {
      id: uuid(),
      fromComponentId: wireInProgress.fromComponentId,
      fromPinId: wireInProgress.fromPinId,
      toComponentId: componentId,
      toPinId: pinId,
      path: [
        { x: wireInProgress.startX, y: wireInProgress.startY },
        { x: wireInProgress.currentX, y: wireInProgress.currentY },
      ],
      color: '#1565C0',
    };

    set(s => {
      const updated = {
        ...s.circuit,
        wires: [...s.circuit.wires, newWire],
        updatedAt: new Date().toISOString(),
      };
      return { circuit: updated, wireInProgress: null, ...pushHistory(s, updated) };
    });
  },

  cancelWire: () => set({ wireInProgress: null }),

  removeWire: (id) => {
    set(s => {
      const updated = {
        ...s.circuit,
        wires: s.circuit.wires.filter(w => w.id !== id),
        updatedAt: new Date().toISOString(),
      };
      return { circuit: updated, selectedWireIds: s.selectedWireIds.filter(i => i !== id), ...pushHistory(s, updated) };
    });
  },

  selectWire: (id, multi = false) => {
    set(s => ({
      selectedWireIds: multi
        ? s.selectedWireIds.includes(id)
          ? s.selectedWireIds.filter(i => i !== id)
          : [...s.selectedWireIds, id]
        : [id],
      selectedComponentIds: multi ? s.selectedComponentIds : [],
    }));
  },

  // ============================================================
  // Circuit Management
  // ============================================================
  newCircuit: () => {
    const c = makeNewCircuit();
    set({ circuit: c, history: [c], historyIndex: 0, selectedComponentIds: [], selectedWireIds: [], simResult: null, simStatus: 'idle' });
  },

  setCircuitName: (name) => {
    set(s => ({ circuit: { ...s.circuit, name, updatedAt: new Date().toISOString() } }));
  },

  loadCircuit: (c) => {
    set({ circuit: c, history: [c], historyIndex: 0, selectedComponentIds: [], selectedWireIds: [], simResult: null, simStatus: 'idle' });
  },

  undo: () => {
    const { history, historyIndex } = get();
    if (historyIndex <= 0) return;
    const newIndex = historyIndex - 1;
    set({ circuit: history[newIndex], historyIndex: newIndex, selectedComponentIds: [], selectedWireIds: [] });
  },

  redo: () => {
    const { history, historyIndex } = get();
    if (historyIndex >= history.length - 1) return;
    const newIndex = historyIndex + 1;
    set({ circuit: history[newIndex], historyIndex: newIndex });
  },

  // ============================================================
  // Simulation
  // ============================================================
  setSimConfig: (cfg) => set(s => ({ simConfig: { ...s.simConfig, ...cfg } })),
  setSimResult: (result) => set({ simResult: result }),
  setSimStatus: (s) => set({ simStatus: s }),

  // ============================================================
  // Projects
  // ============================================================
  saveProject: () => {
    const { circuit, projects, activeProjectId } = get();
    const now = new Date().toISOString();
    const existingIndex = projects.findIndex(p => p.id === activeProjectId);
    let newProjects: Project[];

    if (existingIndex >= 0) {
      newProjects = projects.map((p, i) =>
        i === existingIndex ? { ...p, circuit, updatedAt: now } : p
      );
    } else {
      const newProject: Project = {
        id: uuid(),
        name: circuit.name,
        circuit,
        createdAt: now,
        updatedAt: now,
        version: '1.0',
      };
      newProjects = [...projects, newProject];
      set({ activeProjectId: newProject.id });
    }

    set({ projects: newProjects });
    localStorage.setItem('ece-lab-projects', JSON.stringify(newProjects));
  },

  loadProject: (id) => {
    const { projects } = get();
    const project = projects.find(p => p.id === id);
    if (!project) return;
    set({
      circuit: project.circuit,
      activeProjectId: id,
      history: [project.circuit],
      historyIndex: 0,
      selectedComponentIds: [],
      selectedWireIds: [],
      simResult: null,
      simStatus: 'idle',
      activePanel: 'lab',
    });
  },

  deleteProject: (id) => {
    set(s => {
      const newProjects = s.projects.filter(p => p.id !== id);
      localStorage.setItem('ece-lab-projects', JSON.stringify(newProjects));
      return { projects: newProjects, activeProjectId: s.activeProjectId === id ? null : s.activeProjectId };
    });
  },

  loadProjectsFromStorage: () => {
    try {
      const raw = localStorage.getItem('ece-lab-projects');
      if (raw) set({ projects: JSON.parse(raw) });
    } catch { /* ignore */ }
  },
}));

// ============================================================
// History helper (called within set)
// ============================================================
function pushHistory(s: LabStore, updated: Circuit) {
  const newHistory = s.history.slice(0, s.historyIndex + 1);
  newHistory.push(updated);
  if (newHistory.length > 50) newHistory.shift();
  return { history: newHistory, historyIndex: newHistory.length - 1 };
}

// Re-export getRotatedPins for use in components
export { getRotatedPins };

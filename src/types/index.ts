// ============================================================
// ECE Virtual Lab — Core TypeScript Types
// ============================================================

// --- Position & Geometry ---
export interface Point { x: number; y: number; }
export interface Size  { width: number; height: number; }
export interface Rect extends Point, Size {}

// --- Component Categories ---
export type ComponentCategory =
  | 'passive'
  | 'diode'
  | 'transistor'
  | 'ic'
  | 'source'
  | 'instrument'
  | 'logic'
  | 'connector';

// --- Component Types ---
export type ComponentType =
  | 'resistor'
  | 'capacitor'
  | 'inductor'
  | 'potentiometer'
  | 'diode'
  | 'led'
  | 'zener'
  | 'bjt_npn'
  | 'bjt_pnp'
  | 'mosfet_n'
  | 'mosfet_p'
  | 'opamp'
  | 'dc_source'
  | 'ac_source'
  | 'current_source'
  | 'ground'
  | 'switch'
  | 'pushbutton'
  | 'gate_and'
  | 'gate_or'
  | 'gate_not'
  | 'gate_nand'
  | 'gate_nor'
  | 'gate_xor'
  | 'gate_xnor'
  | 'dff'
  | 'jkff'
  | 'oscilloscope'
  | 'dmm'
  | 'function_gen'
  | 'logic_analyzer'
  | 'transformer'
  | 'wire_junction';

// --- Component Pin ---
export interface Pin {
  id: string;
  label: string;
  x: number;   // relative offset from component origin (schematic)
  y: number;
  node?: string; // circuit node name
}

// --- Placed Component ---
export interface PlacedComponent {
  id: string;
  type: ComponentType;
  label: string;
  x: number;        // position in workspace
  y: number;
  rotation: number; // degrees: 0, 90, 180, 270
  props: ComponentProps;
  pins: Pin[];
  selected?: boolean;
  // breadboard placement
  bbRow?: number;
  bbCol?: number;
}

// --- Component Properties ---
export interface ComponentProps {
  // Passive
  resistance?: number;      // Ohms
  capacitance?: number;     // Farads
  inductance?: number;      // Henrys
  // Sources
  voltage?: number;         // Volts
  current?: number;         // Amps
  frequency?: number;       // Hz
  amplitude?: number;       // Volts peak
  offset?: number;          // DC offset Volts
  waveform?: 'sine' | 'square' | 'triangle' | 'dc';
  // Diode
  forwardVoltage?: number;  // Vf
  // BJT
  beta?: number;            // hFE
  // Zener
  zenerVoltage?: number;
  // Switch
  closed?: boolean;
  // Display
  unit?: string;
  color?: string;
  notes?: string;
}

// --- Wire ---
export interface Wire {
  id: string;
  fromComponentId: string;
  fromPinId: string;
  toComponentId: string;
  toPinId: string;
  path: Point[];   // SVG path waypoints
  color: string;
  selected?: boolean;
  node?: string;   // circuit node
}

// --- Circuit Node (for MNA) ---
export interface CircuitNode {
  id: string;
  name: string;
  voltage?: number;
  connectedPins: { componentId: string; pinId: string }[];
}

// --- Circuit ---
export interface Circuit {
  id: string;
  name: string;
  description?: string;
  components: PlacedComponent[];
  wires: Wire[];
  nodes: CircuitNode[];
  createdAt: string;
  updatedAt: string;
  labId?: string;
  experimentId?: string;
}

// --- Simulation ---
export type SimStatus = 'idle' | 'running' | 'paused' | 'error' | 'completed';

export interface SimResult {
  status: SimStatus;
  nodeVoltages: Record<string, number>;
  branchCurrents: Record<string, number>;   // componentId -> current in amps
  powerDissipation: Record<string, number>; // componentId -> watts
  errors: string[];
  warnings: string[];
  time?: number;  // ms for transient
  // Waveform data for transient / signal sims
  timePoints?: number[];
  voltageWaveforms?: Record<string, number[]>;
  currentWaveforms?: Record<string, number[]>;
}

export interface SimConfig {
  type: 'dc' | 'transient' | 'ac' | 'digital' | 'signal';
  duration?: number;   // seconds for transient
  timeStep?: number;
  stopTime?: number;
}

// --- Labs ---
export interface LabInfo {
  id: string;
  name: string;
  shortName: string;
  icon: string;
  color: string;
  experiments: Experiment[];
}

export interface Experiment {
  id: string;
  labId: string;
  name: string;
  objective: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  simType: SimConfig['type'] | 'guided' | 'demonstration';
  components: ComponentType[];
  procedure: string[];
  theory: string;
  formulas?: { label: string; formula: string; }[];
  observations?: ObservationRow[];
  prebuilt?: Partial<Circuit>;
}

export interface ObservationRow {
  variable: string;
  unit: string;
  calculated?: number;
  measured?: number;
}

// --- UI State ---
export type ActiveTool = 'select' | 'wire' | 'delete' | 'pan';
export type WorkspaceView = 'breadboard' | 'schematic';
export type ActivePanel = 'home' | 'lab' | 'experiment';

export interface ViewTransform {
  x: number; y: number; scale: number;
}

// --- Project ---
export interface Project {
  id: string;
  name: string;
  circuit: Circuit;
  labId?: string;
  experimentId?: string;
  createdAt: string;
  updatedAt: string;
  version: string;
}

// --- Breadboard ---
export interface BreadboardHole {
  col: number;
  row: number;    // 1-30 for main rows; 0 = top power rail, 31 = bottom power rail
  section: 'top' | 'bottom' | 'rail-top-pos' | 'rail-top-neg' | 'rail-bot-pos' | 'rail-bot-neg';
  connected: boolean;
  occupiedBy?: { componentId: string; pinId: string };
  nodeId?: string;
}

// --- Component Library Definition ---
export interface ComponentDef {
  type: ComponentType;
  name: string;
  category: ComponentCategory;
  description: string;
  symbol: string;   // SVG path or identifier
  defaultProps: ComponentProps;
  defaultPins: Omit<Pin, 'node'>[];
  width: number;    // schematic bounding box
  height: number;
  tags: string[];
}

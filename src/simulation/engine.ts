// ============================================================
// DC Nodal Analysis Simulation Engine (Modified Nodal Analysis)
// ============================================================
// Implements MNA to solve for node voltages and branch currents
// in circuits containing resistors, voltage sources, and current sources.

import { Circuit, SimResult, PlacedComponent, Wire } from '../types';

interface Node {
  id: string;
  isGround: boolean;
}

interface Branch {
  id: string;
  type: 'resistor' | 'voltage_source' | 'current_source' | 'short';
  from: string;  // node id
  to: string;    // node id
  value: number;
  componentId: string;
}

// ============================================================
// Build circuit graph from placed components + wires
// ============================================================
function buildGraph(circuit: Circuit): {
  nodes: Map<string, Node>;
  branches: Branch[];
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];
  const nodes = new Map<string, Node>();
  const branches: Branch[] = [];

  // 1. Find all connected node groups via wires (union-find)
  // Each pin has an ID: "componentId:pinId"
  const pinToNode = new Map<string, string>();

  function getRoot(id: string): string {
    if (!pinToNode.has(id)) pinToNode.set(id, id);
    let root = id;
    while (pinToNode.get(root) !== root) root = pinToNode.get(root)!;
    // Path compression
    let cur = id;
    while (cur !== root) { const next = pinToNode.get(cur)!; pinToNode.set(cur, root); cur = next; }
    return root;
  }

  function union(a: string, b: string) {
    const ra = getRoot(a);
    const rb = getRoot(b);
    if (ra !== rb) pinToNode.set(ra, rb);
  }

  // Init all pins
  for (const comp of circuit.components) {
    for (const pin of comp.pins) {
      const key = `${comp.id}:${pin.id}`;
      pinToNode.set(key, key);
    }
  }

  // Union pins connected by wires
  for (const wire of circuit.wires) {
    const fromKey = `${wire.fromComponentId}:${wire.fromPinId}`;
    const toKey   = `${wire.toComponentId}:${wire.toPinId}`;
    union(fromKey, toKey);
  }

  // Build node IDs from roots
  const rootToNodeId = new Map<string, string>();
  let nodeCounter = 1;

  function getNodeId(pinKey: string): string {
    const root = getRoot(pinKey);
    if (!rootToNodeId.has(root)) {
      rootToNodeId.set(root, `N${nodeCounter++}`);
    }
    return rootToNodeId.get(root)!;
  }

  // 2. Identify ground nodes
  let groundNodeId: string | null = null;
  for (const comp of circuit.components) {
    if (comp.type === 'ground') {
      const key = `${comp.id}:gnd`;
      const nid = getNodeId(key);
      groundNodeId = nid;
    }
  }

  if (!groundNodeId) {
    errors.push('No ground reference found. Add a ground component to the circuit.');
  }

  // Re-map all roots to use 'GND' for ground node
  if (groundNodeId) {
    rootToNodeId.forEach((nid, root) => {
      if (nid === groundNodeId) rootToNodeId.set(root, 'GND');
    });
    nodes.set('GND', { id: 'GND', isGround: true });
  }

  // 3. Register all nodes
  for (const comp of circuit.components) {
    for (const pin of comp.pins) {
      const key = `${comp.id}:${pin.id}`;
      const nid = getNodeId(key);
      if (!nodes.has(nid)) {
        nodes.set(nid, { id: nid, isGround: nid === 'GND' });
      }
    }
  }

  // 4. Build branches from components
  for (const comp of circuit.components) {
    switch (comp.type) {
      case 'resistor': {
        const p1 = getNodeId(`${comp.id}:p1`);
        const p2 = getNodeId(`${comp.id}:p2`);
        const R = comp.props.resistance ?? 1000;
        if (R <= 0) { errors.push(`Resistor ${comp.label}: resistance must be > 0Ω`); break; }
        branches.push({ id: comp.id, type: 'resistor', from: p1, to: p2, value: R, componentId: comp.id });
        break;
      }
      case 'dc_source': {
        const pos = getNodeId(`${comp.id}:pos`);
        const neg = getNodeId(`${comp.id}:neg`);
        const V = comp.props.voltage ?? 0;
        branches.push({ id: comp.id, type: 'voltage_source', from: pos, to: neg, value: V, componentId: comp.id });
        break;
      }
      case 'current_source': {
        const pos = getNodeId(`${comp.id}:pos`);
        const neg = getNodeId(`${comp.id}:neg`);
        const I = comp.props.current ?? 0;
        branches.push({ id: comp.id, type: 'current_source', from: pos, to: neg, value: I, componentId: comp.id });
        break;
      }
      case 'switch': {
        if (comp.props.closed) {
          const p1 = getNodeId(`${comp.id}:p1`);
          const p2 = getNodeId(`${comp.id}:p2`);
          branches.push({ id: comp.id, type: 'short', from: p1, to: p2, value: 0, componentId: comp.id });
        }
        break;
      }
      case 'ground':
      case 'oscilloscope':
      case 'dmm':
      case 'function_gen':
      case 'logic_analyzer':
        // These don't add electrical branches
        break;
      default:
        if (!['gate_and','gate_or','gate_not','gate_nand','gate_nor','gate_xor','gate_xnor',
              'dff','jkff','led','diode','zener','bjt_npn','bjt_pnp','mosfet_n','mosfet_p','opamp'].includes(comp.type)) {
          // Only warn for truly unhandled types
        }
    }
  }

  // Check for floating nodes (connected to only one component terminal)
  // (simplified check: just warn if any non-ground node has only one branch endpoint)

  return { nodes, branches, errors, warnings };
}

// ============================================================
// Gaussian elimination solver
// ============================================================
function gaussianElimination(A: number[][], b: number[]): number[] | null {
  const n = A.length;
  const M = A.map((row, i) => [...row, b[i]]);

  for (let col = 0; col < n; col++) {
    // Find pivot
    let maxRow = col;
    for (let row = col + 1; row < n; row++) {
      if (Math.abs(M[row][col]) > Math.abs(M[maxRow][col])) maxRow = row;
    }
    [M[col], M[maxRow]] = [M[maxRow], M[col]];

    if (Math.abs(M[col][col]) < 1e-12) return null; // Singular

    for (let row = 0; row < n; row++) {
      if (row === col) continue;
      const factor = M[row][col] / M[col][col];
      for (let k = col; k <= n; k++) {
        M[row][k] -= factor * M[col][k];
      }
    }
  }

  return M.map((row, i) => row[n] / row[i]);
}

// ============================================================
// Main DC Solver
// ============================================================
export function runDCAnalysis(circuit: Circuit): SimResult {
  const { nodes, branches, errors, warnings } = buildGraph(circuit);

  if (errors.length > 0) {
    return {
      status: 'error',
      nodeVoltages: {},
      branchCurrents: {},
      powerDissipation: {},
      errors,
      warnings,
    };
  }

  // Separate voltage sources from other branches
  const resistors  = branches.filter(b => b.type === 'resistor');
  const vSources   = branches.filter(b => b.type === 'voltage_source' || b.type === 'short');
  const iSources   = branches.filter(b => b.type === 'current_source');

  // Node list (excluding GND)
  const nodeList = Array.from(nodes.keys()).filter(n => n !== 'GND');
  const nNodes = nodeList.length;
  const nVsrc  = vSources.length;
  const n = nNodes + nVsrc;

  if (n === 0) {
    return {
      status: 'completed',
      nodeVoltages: { GND: 0 },
      branchCurrents: {},
      powerDissipation: {},
      errors: [],
      warnings: ['Circuit has no nodes. Add components and connect them.'],
    };
  }

  const nodeIndex = new Map<string, number>();
  nodeList.forEach((id, i) => nodeIndex.set(id, i));
  function idx(nid: string): number { return nid === 'GND' ? -1 : (nodeIndex.get(nid) ?? -1); }

  // Build MNA matrices: G (conductance), B (vsrc), C (vsrc transposed), D (zero), RHS
  const G = Array.from({ length: n }, () => new Array(n).fill(0));
  const rhs = new Array(n).fill(0);

  // Stamp resistors into G
  for (const r of resistors) {
    const g = 1 / r.value;
    const fi = idx(r.from);
    const ti = idx(r.to);
    if (fi >= 0) G[fi][fi] += g;
    if (ti >= 0) G[ti][ti] += g;
    if (fi >= 0 && ti >= 0) { G[fi][ti] -= g; G[ti][fi] -= g; }
  }

  // Stamp current sources into RHS
  for (const cs of iSources) {
    const fi = idx(cs.from);
    const ti = idx(cs.to);
    if (fi >= 0) rhs[fi] += cs.value;
    if (ti >= 0) rhs[ti] -= cs.value;
  }

  // Stamp voltage sources (MNA)
  for (let k = 0; k < nVsrc; k++) {
    const vs = vSources[k];
    const row = nNodes + k;
    const fi = idx(vs.from);
    const ti = idx(vs.to);

    if (fi >= 0) { G[fi][row] += 1; G[row][fi] += 1; }
    if (ti >= 0) { G[ti][row] -= 1; G[row][ti] -= 1; }
    rhs[row] = vs.type === 'short' ? 0 : vs.value;
  }

  // Solve
  const solution = gaussianElimination(G, rhs);
  if (!solution) {
    return {
      status: 'error',
      nodeVoltages: {},
      branchCurrents: {},
      powerDissipation: {},
      errors: ['Circuit equations could not be solved. Check for short circuits or disconnected nodes.'],
      warnings,
    };
  }

  // Extract node voltages
  const nodeVoltages: Record<string, number> = { GND: 0 };
  nodeList.forEach((id, i) => { nodeVoltages[id] = round(solution[i]); });

  // Extract branch currents for voltage sources
  const branchCurrents: Record<string, number> = {};
  for (let k = 0; k < nVsrc; k++) {
    const vs = vSources[k];
    branchCurrents[vs.componentId] = round(solution[nNodes + k]);
  }

  // Calculate resistor currents: I = (V_from - V_to) / R
  const powerDissipation: Record<string, number> = {};
  for (const r of resistors) {
    const vf = nodeVoltages[r.from] ?? 0;
    const vt = nodeVoltages[r.to] ?? 0;
    const I = (vf - vt) / r.value;
    branchCurrents[r.componentId] = round(I);
    powerDissipation[r.componentId] = round(Math.abs(I * I * r.value));
  }

  // Warn about floating nodes
  const floatingWarnings: string[] = [];
  for (const [nid, node] of nodes) {
    if (!node.isGround && nodeVoltages[nid] === undefined) {
      floatingWarnings.push(`Node ${nid} may be floating.`);
    }
  }

  return {
    status: 'completed',
    nodeVoltages,
    branchCurrents,
    powerDissipation,
    errors: [],
    warnings: [...warnings, ...floatingWarnings],
  };
}

function round(v: number, decimals = 6): number {
  return Math.round(v * 10 ** decimals) / 10 ** decimals;
}

// ============================================================
// RC Transient Analysis
// ============================================================
export function runRCTransient(
  circuit: Circuit,
  duration: number = 0.1,
  steps: number = 500
): SimResult {
  // Find RC circuit elements
  const resistors  = circuit.components.filter((c: PlacedComponent) => c.type === 'resistor');
  const capacitors = circuit.components.filter((c: PlacedComponent) => c.type === 'capacitor');
  const sources    = circuit.components.filter((c: PlacedComponent) => c.type === 'dc_source');

  if (capacitors.length === 0 || resistors.length === 0 || sources.length === 0) {
    return {
      status: 'error',
      nodeVoltages: {}, branchCurrents: {}, powerDissipation: {},
      errors: ['RC transient requires at least one resistor, capacitor, and DC source.'],
      warnings: [],
    };
  }

  const R = resistors[0].props.resistance ?? 1000;
  const C = capacitors[0].props.capacitance ?? 100e-6;
  const Vs = sources[0].props.voltage ?? 5;
  const tau = R * C;
  const dt = duration / steps;

  const timePoints: number[] = [];
  const vcPoints: number[] = [];
  const icPoints: number[] = [];
  let vc = 0;

  for (let i = 0; i <= steps; i++) {
    const t = i * dt;
    vc = Vs * (1 - Math.exp(-t / tau));
    const ic = (Vs - vc) / R;
    timePoints.push(round(t * 1000, 3));  // ms
    vcPoints.push(round(vc, 4));
    icPoints.push(round(ic * 1000, 4));   // mA
  }

  return {
    status: 'completed',
    nodeVoltages: { GND: 0, 'N1': Vs },
    branchCurrents: { [resistors[0].id]: round((Vs) / R) },
    powerDissipation: {},
    errors: [],
    warnings: [],
    timePoints,
    voltageWaveforms: {
      [`${capacitors[0].id}_vc`]: vcPoints,
      'source': timePoints.map(() => Vs),
    },
    currentWaveforms: {
      [`${resistors[0].id}_ic`]: icPoints,
    },
  };
}

// ============================================================
// Digital Logic Simulation
// ============================================================
type LogicLevel = 0 | 1;

export function evaluateLogicGate(type: string, inputs: LogicLevel[]): LogicLevel {
  const [a, b] = inputs;
  switch (type) {
    case 'gate_and':  return (a & b) as LogicLevel;
    case 'gate_or':   return (a | b) as LogicLevel;
    case 'gate_not':  return (a ^ 1) as LogicLevel;
    case 'gate_nand': return ((a & b) ^ 1) as LogicLevel;
    case 'gate_nor':  return ((a | b) ^ 1) as LogicLevel;
    case 'gate_xor':  return (a ^ b) as LogicLevel;
    case 'gate_xnor': return ((a ^ b) ^ 1) as LogicLevel;
    default: return 0;
  }
}

export function generateTruthTable(gateType: string, numInputs: number = 2): {
  headers: string[];
  rows: (0|1)[][];
} {
  const rows: (0|1)[][] = [];
  const n = numInputs;
  const inputLabels = Array.from({ length: n }, (_, i) => String.fromCharCode(65 + i));

  for (let mask = 0; mask < (1 << n); mask++) {
    const inputs = Array.from({ length: n }, (_, i) => ((mask >> (n - 1 - i)) & 1) as (0|1));
    const output = evaluateLogicGate(gateType, inputs);
    rows.push([...inputs, output]);
  }

  return { headers: [...inputLabels, 'Y'], rows };
}

// ============================================================
// Signal Generation for Comms/DSP demos
// ============================================================
export function generateSignal(
  type: 'sine' | 'square' | 'triangle' | 'dc',
  frequency: number,
  amplitude: number,
  offset: number,
  duration: number,
  sampleRate: number
): { time: number[]; values: number[] } {
  const n = Math.floor(duration * sampleRate);
  const time: number[] = [];
  const values: number[] = [];

  for (let i = 0; i < n; i++) {
    const t = i / sampleRate;
    time.push(round(t * 1000, 3)); // ms
    let v = 0;
    const phase = 2 * Math.PI * frequency * t;
    switch (type) {
      case 'sine':     v = amplitude * Math.sin(phase); break;
      case 'square':   v = amplitude * Math.sign(Math.sin(phase)); break;
      case 'triangle': v = amplitude * (2 / Math.PI) * Math.asin(Math.sin(phase)); break;
      case 'dc':       v = amplitude; break;
    }
    values.push(round(v + offset, 4));
  }

  return { time, values };
}

export function generateAMSignal(
  carrierFreq: number,
  messageFreq: number,
  carrierAmplitude: number,
  messageAmplitude: number,
  duration: number,
  sampleRate: number
): { time: number[]; carrier: number[]; message: number[]; modulated: number[] } {
  const n = Math.floor(duration * sampleRate);
  const time: number[] = [];
  const carrier: number[] = [];
  const message: number[] = [];
  const modulated: number[] = [];
  const m = messageAmplitude / carrierAmplitude;

  for (let i = 0; i < n; i++) {
    const t = i / sampleRate;
    time.push(round(t * 1000, 3));
    const c = carrierAmplitude * Math.sin(2 * Math.PI * carrierFreq * t);
    const msg = messageAmplitude * Math.sin(2 * Math.PI * messageFreq * t);
    const mod = carrierAmplitude * (1 + m * Math.sin(2 * Math.PI * messageFreq * t)) * Math.sin(2 * Math.PI * carrierFreq * t);
    carrier.push(round(c, 4));
    message.push(round(msg, 4));
    modulated.push(round(mod, 4));
  }

  return { time, carrier, message, modulated };
}

export function generateFMSignal(
  carrierFreq: number,
  messageFreq: number,
  carrierAmplitude: number,
  freqDeviation: number,
  duration: number,
  sampleRate: number
): { time: number[]; message: number[]; modulated: number[] } {
  const n = Math.floor(duration * sampleRate);
  const time: number[] = [];
  const message: number[] = [];
  const modulated: number[] = [];
  const beta = freqDeviation / messageFreq;

  for (let i = 0; i < n; i++) {
    const t = i / sampleRate;
    time.push(round(t * 1000, 3));
    const msg = Math.sin(2 * Math.PI * messageFreq * t);
    const mod = carrierAmplitude * Math.sin(2 * Math.PI * carrierFreq * t + beta * Math.sin(2 * Math.PI * messageFreq * t));
    message.push(round(msg, 4));
    modulated.push(round(mod, 4));
  }

  return { time, message, modulated };
}

// DFT computation
export function computeDFT(signal: number[], sampleRate: number): {
  frequencies: number[];
  magnitudes: number[];
} {
  const N = signal.length;
  const frequencies: number[] = [];
  const magnitudes: number[] = [];

  for (let k = 0; k < N / 2; k++) {
    let re = 0, im = 0;
    for (let n = 0; n < N; n++) {
      const angle = (2 * Math.PI * k * n) / N;
      re += signal[n] * Math.cos(angle);
      im -= signal[n] * Math.sin(angle);
    }
    frequencies.push(round((k * sampleRate) / N, 2));
    magnitudes.push(round(Math.sqrt(re * re + im * im) / N, 4));
  }

  return { frequencies, magnitudes };
}

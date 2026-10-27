# ECE Virtual Engineering Lab Pro

> Interactive electronics laboratory for ECE students — React + TypeScript + Vite

## Running the App

```bash
npm run dev
```

Opens at **http://localhost:5173/**

> **Note**: If `npm` is not in PATH, run directly:
> ```
> node node_modules/vite/bin/vite.js --port 5173
> ```

## Features Implemented

### Phase 1 — Foundation ✅
- Professional engineering UI (white/navy/blue design system)
- 13 ECE laboratory sections in collapsible sidebar
- Component library with 30+ components (search + categories)
- Interactive schematic workspace (SVG, drag/drop, wire tool)
- Realistic SVG breadboard (30 columns, 10 rows, power rails)
- Property inspector with per-type editors
- Resistor colour code calculator
- Undo/redo history (up to 50 steps)
- Project save/load (localStorage)

### Phase 2 — DC Simulation Engine ✅
- Modified Nodal Analysis (MNA) solver
- Node voltage calculation
- Branch current and power dissipation
- Validation: missing ground, short circuits, floating nodes
- Circuit validation with clear error messages

### Phase 3 — Instruments ✅
- Oscilloscope with waveform display
- Function Generator (sine/square/triangle/DC)
- Digital Multimeter with node probing
- Logic Analyzer with truth tables
- Spectrum Analyzer (DFT)

### Phase 4 — Experiments ✅
- 7 EDC experiments (Ohm's Law, KVL, KCL, RC, Diode, Rectifier)
- 2 Analog experiments (CE Amplifier, Op-Amp)
- 2 Digital experiments (Logic Gates, Half Adder)
- 2 Comms experiments (AM, FM)
- 2 DSP experiments (Sampling, DFT)
- Network, Microprocessors, Control, M&I, EM, Fiber, VLSI labs

### Phase 5 — Signals ✅
- AM/FM modulation signal generation
- DFT computation
- RC transient simulation
- Digital logic evaluation

## Tech Stack
- **React 18** + **TypeScript** + **Vite 8**
- **Zustand** — state management
- **Recharts** — waveform/spectrum charts
- **SVG** — circuit workspace and breadboard

## Architecture
```
src/
  App.tsx
  main.tsx
  components/
    layout/          TopBar, Sidebar, HomeScreen, LabWorkspace
    circuit-workspace/ CircuitWorkspace (zoom/pan/drop)
    breadboard/      BreadboardView (SVG)
    schematic/       SchematicView + ComponentSymbols
    component-library/ ComponentLibraryPanel
    property-inspector/ PropertyInspector
    simulation-controls/ SimulationControls + SimResultsPanel
    instruments/     InstrumentsPanel (OSC, FuncGen, DMM, Logic, Spectrum)
    experiments/     ExperimentPanel
  data/
    componentLibrary.ts   30+ component definitions
    labs.ts               13 lab + experiment definitions
  simulation/
    engine.ts             MNA + RC transient + signals + DFT
  state/
    labStore.ts           Zustand store (circuit + UI + sim)
  types/
    index.ts              All TypeScript interfaces
  styles/
    global.css            Design system CSS variables + utilities
```

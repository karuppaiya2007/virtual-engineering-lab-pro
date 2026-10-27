import React, { useEffect } from 'react';
import { useLabStore } from './state/labStore';
import TopBar from './components/layout/TopBar';
import Sidebar from './components/layout/Sidebar';
import HomeScreen from './components/layout/HomeScreen';
import LabWorkspace from './components/layout/LabWorkspace';
import './styles/global.css';

export default function App() {
  const { activePanel, loadProjectsFromStorage } = useLabStore();

  useEffect(() => {
    loadProjectsFromStorage();
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100vw', overflow: 'hidden', background: 'var(--color-bg)' }}>
      <TopBar />
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <Sidebar />
        <main style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          {activePanel === 'home' ? <HomeScreen /> : <LabWorkspace />}
        </main>
      </div>
    </div>
  );
}

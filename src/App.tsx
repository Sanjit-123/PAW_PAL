import React, { useState } from 'react';
import { PawPointsProvider, usePawPoints } from './context/PawPointsContext';
import { FurCard } from './components/ui/FurCard';
import { Dog2D } from './components/scene/Dog2D';
import { JournalBook } from './components/journal/JournalBook';
import { ChatBot } from './components/chat/ChatBot';
import { MoodAnalytics } from './components/analytics/MoodAnalytics';
import { Resources } from './components/analytics/Resources';
import { Navbar } from './components/ui/Navbar';
import type { TabType } from './components/ui/Navbar';
import { Sparkles, Activity } from 'lucide-react';
import { LandingPage } from './LandingPage';
import './index.css';

const CompanionView: React.FC = () => {
  const { userData } = usePawPoints();
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', paddingBottom: '2rem' }}>
      <FurCard className="pet-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
        <h1 style={{ fontSize: '2rem', color: 'var(--primary-hover)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Sparkles size={28} /> PawPal
        </h1>
        <Dog2D />
        <div style={{ marginTop: '2rem', textAlign: 'center' }}>
          <h3 style={{ color: 'var(--text-secondary)' }}>Your Companion</h3>
          <p style={{ marginTop: '0.5rem', fontWeight: 'bold' }}>Looking happy and relaxed!</p>
        </div>
      </FurCard>

      <FurCard className="stats-container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><Activity size={24} /> Wellness Stats</h2>
          <div style={{ background: 'var(--accent-yellow)', padding: '0.5rem 1rem', borderRadius: '20px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '5px' }}>
            🐾 {userData.paw_points} Pts
          </div>
        </div>
          <div style={{ marginTop: '1rem', display: 'flex', gap: '10px', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Stress Level:</span>
              <span style={{ color: userData.current_stress_level === 'High' ? '#ff6b6b' : userData.current_stress_level === 'Moderate' ? '#feca57' : '#88d8b0', fontWeight: 'bold' }}>
                {userData.current_stress_level}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Streak:</span>
              <span style={{ fontWeight: 'bold' }}>{userData.streak_days} Days 🔥</span>
            </div>
          </div>
        </FurCard>
    </div>
  );
};

const Dashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('companion');

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      overflowY: 'auto',
      backgroundColor: 'transparent'
    }}>
      <Navbar activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Main Content Area */}
      <div className="main-content-area" style={{ display: 'flex', justifyContent: 'center', width: '100%', maxWidth: '1200px', margin: '0 auto' }}>
        {activeTab === 'companion' && (
          <div style={{ width: '100%', maxWidth: '600px' }}>
             <CompanionView />
          </div>
        )}
        
        {activeTab === 'journal' && (
          <div style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
            <JournalBook />
          </div>
        )}

        {activeTab === 'chat' && (
          <div style={{ width: '100%', maxWidth: '1200px', display: 'flex', justifyContent: 'center' }}>
            <ChatBot />
          </div>
        )}

        {activeTab === 'analytics' && (
          <div style={{ width: '100%', maxWidth: '800px', display: 'flex', justifyContent: 'center' }}>
            <MoodAnalytics />
          </div>
        )}

        {activeTab === 'resources' && (
          <div style={{ width: '100%', maxWidth: '800px', display: 'flex', justifyContent: 'center' }}>
            <Resources />
          </div>
        )}
      </div>
    </div>
  );
};

function App() {
  const [hasEntered, setHasEntered] = useState(false);

  return (
    <PawPointsProvider>
      {!hasEntered ? (
        <LandingPage onEnter={() => setHasEntered(true)} />
      ) : (
        <Dashboard />
      )}
    </PawPointsProvider>
  );
}

export default App;

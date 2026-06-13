import React from 'react';
import { PawPrint, BookOpen, Activity, HeartHandshake, MessageCircle, ChevronDown } from 'lucide-react';
import { usePawPoints } from '../../context/PawPointsContext';

export type TabType = 'companion' | 'journal' | 'chat' | 'analytics' | 'resources';

interface NavbarProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'companion', label: 'Companion', icon: <PawPrint size={20} /> },
    { id: 'journal', label: 'Magic Journal', icon: <BookOpen size={20} /> },
    { id: 'chat', label: 'Chat', icon: <MessageCircle size={20} /> },
    { id: 'analytics', label: 'Analytics', icon: <Activity size={20} /> },
    { id: 'resources', label: 'Resources', icon: <HeartHandshake size={20} /> },
  ] as const;

  const { userData } = usePawPoints();

  return (
    <nav style={{ 
      display: 'flex', 
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '0.75rem 1.5rem',
      margin: '1.5rem auto',
      width: '95%',
      maxWidth: '1200px',
      position: 'sticky',
      top: '1.5rem',
      zIndex: 100,
      backgroundColor: 'rgba(253, 250, 246, 0.75)',
      backdropFilter: 'blur(10px)',
      borderRadius: '40px',
      boxShadow: '0 8px 30px rgba(0,0,0,0.08), inset 0 0 10px rgba(255,255,255,0.5)',
      border: '1px solid rgba(139, 90, 43, 0.1)',
      overflowX: 'auto',
      WebkitOverflowScrolling: 'touch',
      scrollbarWidth: 'none',
      msOverflowStyle: 'none'
    }}>
      <style>{`nav::-webkit-scrollbar { display: none; }`}</style>
      
      {/* Left side: Navigation Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        {tabs.map(tab => (
          <button 
            key={tab.id}
            onClick={() => onTabChange(tab.id as TabType)}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              whiteSpace: 'nowrap',
              padding: '0.75rem 1.5rem', 
              border: 'none', 
              background: activeTab === tab.id ? 'var(--primary-color)' : 'transparent',
              borderRadius: '25px', 
              cursor: 'pointer', 
              fontWeight: 'bold', 
              color: activeTab === tab.id ? '#5c4e4e' : 'var(--text-primary)',
              transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
              transform: activeTab === tab.id ? 'scale(1.08) translateY(-2px)' : 'scale(1)',
              boxShadow: activeTab === tab.id ? '0 6px 15px rgba(255, 182, 193, 0.5), inset 0 -2px 5px rgba(0,0,0,0.1)' : 'none',
              border: activeTab === tab.id ? '1px solid #ffb6c1' : '1px solid transparent'
            }}>
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* Right side: User Profile & Streak */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginLeft: 'auto', paddingLeft: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#fff0e6', padding: '0.5rem 1rem', borderRadius: '20px', fontWeight: 'bold', fontSize: '0.9rem', color: '#5c4e4e' }}>
          🔥 {userData?.streak_days || 0} Day Streak
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#ffeaa7', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', border: '2px solid white', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
            <span style={{ fontSize: '1.5rem' }}>🐶</span>
          </div>
          <ChevronDown size={18} color="#8c7e7e" />
        </div>
      </div>
    </nav>
  );
};

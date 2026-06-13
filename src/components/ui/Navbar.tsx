import React from 'react';
import { PawPrint, BookOpen, Activity, HeartHandshake, MessageCircle } from 'lucide-react';

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

  return (
    <nav style={{ 
      display: 'flex', 
      justifyContent: 'flex-start', // allow scrolling from the left
      alignItems: 'center',
      padding: '1.5rem',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      backgroundColor: 'rgba(252, 249, 242, 0.9)',
      backdropFilter: 'blur(10px)',
      borderBottom: '1px solid rgba(92, 78, 78, 0.1)',
      overflowX: 'auto',
      WebkitOverflowScrolling: 'touch',
      scrollbarWidth: 'none', // Hide scrollbar for Firefox
      msOverflowStyle: 'none' // Hide scrollbar for IE/Edge
    }}>
      <style>{`nav::-webkit-scrollbar { display: none; }`}</style>
      <div style={{ display: 'flex', gap: '1rem', margin: '0 auto' }}>
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
    </nav>
  );
};

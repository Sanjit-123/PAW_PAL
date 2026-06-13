import React from 'react';
import { PawPrint, BookOpen, Activity, HeartHandshake } from 'lucide-react';

export type TabType = 'companion' | 'journal' | 'analytics' | 'resources';

interface NavbarProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'companion', label: 'Companion', icon: <PawPrint size={20} /> },
    { id: 'journal', label: 'Magic Journal', icon: <BookOpen size={20} /> },
    { id: 'analytics', label: 'Analytics', icon: <Activity size={20} /> },
    { id: 'resources', label: 'Resources', icon: <HeartHandshake size={20} /> },
  ] as const;

  return (
    <nav style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center',
      gap: '1rem', 
      padding: '1.5rem 2rem',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      backgroundColor: 'rgba(252, 249, 242, 0.9)', // Match var(--bg-color) with slight transparency
      backdropFilter: 'blur(10px)',
      borderBottom: '1px solid rgba(92, 78, 78, 0.1)'
    }}>
      <div style={{ display: 'flex', gap: '1rem' }}>
        {tabs.map(tab => (
          <button 
            key={tab.id}
            onClick={() => onTabChange(tab.id as TabType)}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              padding: '0.75rem 1.5rem', 
              border: 'none', 
              background: activeTab === tab.id ? 'var(--primary-color)' : 'transparent',
              borderRadius: '25px', 
              cursor: 'pointer', 
              fontWeight: 'bold', 
              color: 'var(--text-primary)',
              transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
              transform: activeTab === tab.id ? 'scale(1.05)' : 'scale(1)',
              boxShadow: activeTab === tab.id ? '0 4px 15px rgba(255, 209, 220, 0.6)' : 'none'
            }}>
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>
    </nav>
  );
};

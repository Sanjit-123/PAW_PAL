import React, { useEffect, useState } from 'react';
import { FurCard } from '../ui/FurCard';
import { usePawPoints } from '../../context/PawPointsContext';
import { HeartHandshake, ExternalLink } from 'lucide-react';

interface Resource {
  title: string;
  url: string;
  type: string;
}

export const Resources: React.FC = () => {
  const { userData } = usePawPoints();
  const [resources, setResources] = useState<Resource[]>([]);

  useEffect(() => {
    const fetchResources = async () => {
      try {
        const response = await fetch(`http://localhost:8000/api/resources?stress_level=${userData.current_stress_level}`);
        if (response.ok) {
          const data = await response.json();
          setResources(data);
        }
      } catch (e) {
        console.error("Failed to fetch resources", e);
      }
    };
    fetchResources();
  }, [userData.current_stress_level]);

  if (resources.length === 0) return null;

  return (
    <FurCard style={{ marginTop: '2rem', width: '100%', backgroundColor: userData.current_stress_level === 'High' ? '#fff0f0' : 'var(--fur-bg)' }}>
      <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <HeartHandshake size={20} color={userData.current_stress_level === 'High' ? '#ff6b6b' : 'inherit'} /> 
        Recommended For You
      </h3>
      {userData.current_stress_level === 'High' && (
        <p style={{ fontSize: '0.9rem', marginBottom: '1rem', color: '#ff6b6b', fontWeight: 'bold' }}>
          PawPal noticed you might be feeling overwhelmed. Here are some supportive resources:
        </p>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
        {resources.map((resource, i) => (
          <a 
            key={i} 
            href={resource.url} 
            target="_blank" 
            rel="noopener noreferrer"
            style={{ 
              textDecoration: 'none', 
              color: 'inherit',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '0.8rem',
              backgroundColor: 'white',
              borderRadius: '15px',
              boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
              transition: 'transform 0.2s'
            }}
            onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
            onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            <div>
              <div style={{ fontWeight: 'bold' }}>{resource.title}</div>
              <div style={{ fontSize: '0.8rem', opacity: 0.6 }}>{resource.type}</div>
            </div>
            <ExternalLink size={16} opacity={0.5} />
          </a>
        ))}
      </div>
    </FurCard>
  );
};

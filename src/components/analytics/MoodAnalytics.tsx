import React, { useEffect, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';
import { FurCard } from '../ui/FurCard';
import { Activity } from 'lucide-react';

interface JournalEntry {
  id: number;
  entry_text: string;
  timestamp: string;
  sentiment: string;
  stress_score: number;
  stress_level: string;
}

export const MoodAnalytics: React.FC = () => {
  const [history, setHistory] = useState<JournalEntry[]>([]);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const [journalRes, chatRes] = await Promise.all([
          fetch('http://localhost:8000/api/journal/history'),
          fetch('http://localhost:8000/api/chat/history')
        ]);
        
        let allData: JournalEntry[] = [];
        if (journalRes.ok) {
          allData = await journalRes.json();
        }
        if (chatRes.ok) {
          const chatData = await chatRes.json();
          // Filter to only user messages with stress scores
          const chatEntries = chatData
            .filter((msg: any) => msg.sender === 'user' && msg.stress_score !== null)
            .map((msg: any) => ({
              id: msg.id + 10000, // offset id to avoid collisions
              entry_text: msg.text,
              timestamp: msg.timestamp,
              sentiment: msg.sentiment,
              stress_score: msg.stress_score,
              stress_level: msg.stress_level
            }));
          allData = [...allData, ...chatEntries];
        }

        // Sort ascending for the chart
        const sorted = allData.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
        setHistory(sorted);
      } catch (e) {
        console.error("Failed to fetch unified history", e);
      }
    };
    fetchHistory();
  }, []);

  const chartData = history.map(entry => ({
    date: format(new Date(entry.timestamp), 'MMM dd, HH:mm'),
    stress: entry.stress_score,
    sentiment: entry.sentiment
  }));

  if (history.length === 0) {
    return (
      <FurCard style={{ marginTop: '2rem' }}>
        <div style={{ textAlign: 'center', opacity: 0.6 }}>
          <Activity size={32} />
          <p>No mood data yet! Start journaling or chatting to see your trends.</p>
        </div>
      </FurCard>
    );
  }

  return (
    <FurCard style={{ marginTop: '2rem', width: '100%' }}>
      <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <Activity size={20} /> Mood & Stress Trends
      </h3>
      <div style={{ width: '100%', height: 200 }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="colorStress" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ffb6c1" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#ffb6c1" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <XAxis dataKey="date" hide />
            <YAxis hide domain={[0, 100]} />
            <Tooltip 
              contentStyle={{ borderRadius: '15px', border: 'none', boxShadow: '0 5px 15px rgba(0,0,0,0.1)' }}
            />
            <Area type="monotone" dataKey="stress" stroke="#ffb6c1" fillOpacity={1} fill="url(#colorStress)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <div style={{ marginTop: '1rem', maxHeight: '150px', overflowY: 'auto' }}>
        <h4 style={{ opacity: 0.7, marginBottom: '0.5rem' }}>Recent Entries</h4>
        {history.slice().reverse().slice(0, 5).map(entry => (
          <div key={entry.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid #eee' }}>
            <span style={{ fontSize: '0.9rem', color: '#888' }}>{format(new Date(entry.timestamp), 'MMM dd')}</span>
            <span style={{ 
              fontSize: '0.8rem', 
              padding: '0.2rem 0.6rem', 
              borderRadius: '10px', 
              backgroundColor: entry.stress_level === 'High' ? '#ff6b6b' : entry.stress_level === 'Moderate' ? '#feca57' : '#d1ead1',
              color: entry.stress_level === 'Moderate' ? '#333' : 'white',
              fontWeight: 'bold'
            }}>
              {entry.stress_level} Stress
            </span>
          </div>
        ))}
      </div>
    </FurCard>
  );
};

import React, { useState, useEffect, useRef } from 'react';
import { FurCard } from '../ui/FurCard';
import { usePawPoints } from '../../context/PawPointsContext';
import { Send, Sparkles } from 'lucide-react';
import { Dog2D } from '../scene/Dog2D';
import { MiniGame } from './MiniGame';

interface ChatMessage {
  id: number;
  sender: 'user' | 'bot';
  text: string;
  timestamp: string;
  action?: string;
  expression?: string;
}

export const ChatBot: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const { refreshUserData } = usePawPoints();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Mini-game interaction states
  const [gameAction, setGameAction] = useState<string | null>(null);
  const [gameExpression, setGameExpression] = useState<string | null>(null);

  useEffect(() => {
    fetchHistory();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const fetchHistory = async () => {
    try {
      const res = await fetch('http://localhost:8000/api/chat/history');
      if (res.ok) {
        const data = await res.json();
        setMessages(data);
      }
    } catch (e) {
      console.error('Failed to fetch chat history', e);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isTyping) return;

    const tempMsg: ChatMessage = {
      id: Date.now(),
      sender: 'user',
      text: inputText,
      timestamp: new Date().toISOString()
    };
    
    setMessages(prev => [...prev, tempMsg]);
    setInputText('');
    setIsTyping(true);

    try {
      const res = await fetch('http://localhost:8000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: tempMsg.text })
      });
      if (res.ok) {
        const [userDbMsg, botDbMsg] = await res.json();
        setMessages(prev => prev.map(m => m.id === tempMsg.id ? userDbMsg : m).concat(botDbMsg));
        await refreshUserData();
      }
    } catch (e) {
      console.error('Failed to send message', e);
    } finally {
      setIsTyping(false);
    }
  };

  const handleGameAction = (action: string, expression: string) => {
    setGameAction(action);
    setGameExpression(expression);
    // Reset back to chat expression after animation completes
    setTimeout(() => {
      setGameAction(null);
      setGameExpression(null);
    }, 4000); 
  };

  const latestBotMsg = [...messages].reverse().find(m => m.sender === 'bot');
  // Override with game interactions if active
  const currentExpression = gameExpression || latestBotMsg?.expression || 'normal';
  const currentAction = gameAction || latestBotMsg?.action || 'tail_wag';

  return (
    <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', width: '100%', paddingTop: '160px' }}>
      
      {/* Absolutely Centered Dynamic Companion */}
      <div style={{ 
        position: 'absolute', 
        top: '0px', 
        left: '50%', 
        transform: 'translateX(-50%) scale(1.2)', 
        zIndex: 50,
        pointerEvents: 'auto'
      }}>
        <Dog2D expression={currentExpression} action={currentAction} />
      </div>

      <div style={{ display: 'flex', gap: '2rem', width: '100%', alignItems: 'stretch' }}>
        
        {/* Left Column: Chat (Takes up most space) */}
        <div style={{ flex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', width: '100%' }}>
          <FurCard style={{ width: '100%', height: '55vh', display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden' }}>
            {/* Header */}
            <div style={{ padding: '1.5rem', borderBottom: '1px solid rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', gap: '10px', background: 'var(--primary-hover)', color: 'white' }}>
              <Sparkles size={24} />
              <h2 style={{ margin: 0, fontSize: '1.2rem' }}>Chat with PawPal</h2>
            </div>

            {/* Messages Area */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', background: '#fdfbf7' }}>
              {messages.length === 0 && (
                <div style={{ textAlign: 'center', opacity: 0.5, marginTop: '2rem' }}>
                  PawPal is wagging its tail, waiting to chat! Say hi! 🐾
                </div>
              )}
            
            {messages.map(msg => (
              <div key={msg.id} style={{
                alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                maxWidth: '75%',
                padding: '1rem',
                borderRadius: msg.sender === 'user' ? '20px 20px 0 20px' : '20px 20px 20px 0',
                background: msg.sender === 'user' ? 'var(--primary-color)' : 'white',
                color: msg.sender === 'user' ? 'white' : '#5c4e4e',
                boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
              }}>
                {msg.text}
              </div>
            ))}
            {isTyping && (
              <div style={{ alignSelf: 'flex-start', background: 'white', padding: '1rem', borderRadius: '20px 20px 20px 0', color: '#888', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
                PawPal is typing... 🐾
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <form onSubmit={sendMessage} style={{ padding: '1rem', background: 'white', borderTop: '1px solid rgba(0,0,0,0.05)', display: 'flex', gap: '10px' }}>
            <input 
              type="text" 
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Type a message..."
              style={{ flex: 1, padding: '1rem', borderRadius: '25px', border: '1px solid #eee', outline: 'none', background: '#f9f9f9' }}
            />
            <button type="submit" disabled={!inputText.trim() || isTyping} style={{
              background: 'var(--primary-hover)', color: 'white', border: 'none', borderRadius: '50%', width: '50px', height: '50px', display: 'flex', justifyContent: 'center', alignItems: 'center', cursor: 'pointer', opacity: !inputText.trim() ? 0.5 : 1
            }}>
              <Send size={20} style={{ marginLeft: '3px' }} />
            </button>
          </form>
        </FurCard>
      </div>

      {/* Right Column: Mini-Game Area */}
      <div style={{ flex: 1, width: '100%' }}>
        <MiniGame onPlayAction={handleGameAction} />
      </div>

    </div>
  </div>
  );
};

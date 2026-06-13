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
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%', alignItems: 'center', paddingTop: '100px' }}>
      
      <div style={{ display: 'flex', gap: '2rem', width: '100%', alignItems: 'stretch' }}>
        
        {/* Left Column: Chat */}
        <div style={{ flex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', position: 'relative' }}>
          
          {/* Peeking PawPal */}
          <div style={{ 
            position: 'absolute', 
            top: '-140px', 
            left: '30%', 
            transform: 'translateX(-50%) scale(1.1)', 
            zIndex: 50,
            pointerEvents: 'auto'
          }}>
            <Dog2D expression={currentExpression} action={currentAction} />
          </div>

          <FurCard style={{ width: '100%', height: '70vh', display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden', position: 'relative', zIndex: 10 }}>
            {/* Header */}
            <div style={{ padding: '1.5rem', borderBottom: '1px solid rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', gap: '10px', background: '#ff9eb5', color: 'white' }}>
              <PawPrint size={24} />
              <h2 style={{ margin: 0, fontSize: '1.4rem' }}>Chat with PawPal</h2>
            </div>

            {/* Messages Area */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', background: '#fcf9f2' }}>
              {messages.length === 0 && (
                <div style={{ textAlign: 'center', opacity: 0.5, marginTop: '2rem' }}>
                  PawPal is wagging its tail, waiting to chat! Say hi! 🐾
                </div>
              )}
            
            {messages.map((msg, index) => {
              const date = new Date(msg.timestamp || Date.now());
              const timeString = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

              return (
                <div key={msg.id} style={{ 
                  display: 'flex', 
                  gap: '12px', 
                  alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start', 
                  maxWidth: '75%',
                  flexDirection: msg.sender === 'user' ? 'row-reverse' : 'row'
                }}>
                  {/* Bot Avatar */}
                  {msg.sender === 'bot' && (
                    <div style={{ width: '45px', height: '45px', borderRadius: '50%', backgroundColor: '#ffeaa7', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', border: '2px solid white', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', flexShrink: 0, alignSelf: 'flex-start' }}>
                      <span style={{ fontSize: '1.8rem' }}>🐶</span>
                    </div>
                  )}

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: msg.sender === 'user' ? 'flex-end' : 'flex-start' }}>
                    <div style={{
                      padding: '1rem 1.5rem',
                      borderRadius: msg.sender === 'user' ? '20px 0 20px 20px' : '0 20px 20px 20px',
                      background: msg.sender === 'user' ? '#fcdde7' : 'white',
                      color: '#5c4e4e',
                      boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
                      width: 'fit-content',
                      position: 'relative'
                    }} className="chat-message-text">
                      {msg.text}
                      
                      {/* Speech Bubble Tail */}
                      <div style={{
                        position: 'absolute',
                        top: 0,
                        [msg.sender === 'user' ? 'right' : 'left']: '-10px',
                        width: '20px',
                        height: '20px',
                        background: msg.sender === 'user' ? '#fcdde7' : 'white',
                        clipPath: msg.sender === 'user' ? 'polygon(0 0, 0 100%, 100% 0)' : 'polygon(100% 0, 100% 100%, 0 0)'
                      }} />
                    </div>

                    <div style={{ display: 'flex', gap: '5px', alignItems: 'center', fontSize: '0.8rem', color: '#a09494' }}>
                      {timeString}
                      {msg.sender === 'user' && <span style={{ color: '#ff9eb5', fontWeight: 'bold' }}>✓✓</span>}
                    </div>
                  </div>
                </div>
              );
            })}
            {isTyping && (
              <div style={{ display: 'flex', gap: '12px', alignSelf: 'flex-start' }}>
                <div style={{ width: '45px', height: '45px', borderRadius: '50%', backgroundColor: '#ffeaa7', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', border: '2px solid white', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', flexShrink: 0 }}>
                  <span style={{ fontSize: '1.8rem' }}>🐶</span>
                </div>
                <div style={{ alignSelf: 'center', background: 'white', padding: '1rem 1.5rem', borderRadius: '0 20px 20px 20px', color: '#888', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
                  🐾 PawPal is typing...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <form onSubmit={sendMessage} style={{ padding: '1.5rem', background: 'white', borderTop: '1px solid rgba(0,0,0,0.05)', display: 'flex', gap: '15px', alignItems: 'center' }}>
            <div style={{ position: 'relative', flex: 1, display: 'flex', alignItems: 'center' }}>
               <input 
                 type="text" 
                 value={inputText}
                 onChange={(e) => setInputText(e.target.value)}
                 placeholder="🐾 Type a message to PawPal..."
                 style={{ width: '100%', padding: '1rem 1.5rem 1rem 3rem', borderRadius: '30px', border: 'none', outline: 'none', background: '#f9f9f9', boxShadow: 'inset 0 2px 5px rgba(0,0,0,0.03)' }}
                 className="chat-message-text"
               />
            </div>
            <button type="submit" disabled={!inputText.trim() || isTyping} style={{
              background: 'var(--primary-hover)', color: 'white', border: 'none', borderRadius: '50%', width: '55px', height: '55px', display: 'flex', justifyContent: 'center', alignItems: 'center', cursor: 'pointer', opacity: !inputText.trim() ? 0.5 : 1, transition: 'transform 0.2s', boxShadow: '0 4px 15px rgba(255, 182, 193, 0.5)'
            }} onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-3px)'} onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
              <Send size={22} style={{ marginLeft: '3px' }} />
            </button>
          </form>
        </FurCard>
      </div>

        {/* Right Column: Mini-Game Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <MiniGame onPlayAction={handleGameAction} />
      </div>

    </div>
  </div>
  );
};

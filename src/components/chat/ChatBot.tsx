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
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%', alignItems: 'center' }}>
      
      <div style={{ display: 'flex', gap: '2rem', width: '100%', alignItems: 'stretch' }}>
        
        {/* Left Column: Chat */}
        <div style={{ flex: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
          <FurCard style={{ width: '100%', height: '70vh', display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden' }}>
            {/* Header */}
            <div style={{ padding: '1.5rem', borderBottom: '1px solid rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', gap: '10px', background: 'var(--primary-hover)', color: 'white' }}>
              <Sparkles size={24} />
              <h2 style={{ margin: 0, fontSize: '1.4rem' }}>Chat with PawPal</h2>
            </div>

            {/* Messages Area */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', background: '#fcf9f2' }}>
              {messages.length === 0 && (
                <div style={{ textAlign: 'center', opacity: 0.5, marginTop: '2rem' }}>
                  PawPal is wagging its tail, waiting to chat! Say hi! 🐾
                </div>
              )}
            
            {messages.map((msg, index) => (
              <div key={msg.id} style={{ display: 'flex', flexDirection: 'column', gap: '5px', alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start', maxWidth: '65%' }}>
                {msg.sender === 'bot' && (msg as any).reaction_emoji && (
                  <div style={{ fontSize: '0.9rem', color: '#888', fontWeight: 'bold', marginBottom: '-5px', marginLeft: '5px' }}>
                    {(msg as any).reaction_emoji}
                  </div>
                )}
                <div style={{
                  padding: '1rem 1.5rem',
                  borderRadius: msg.sender === 'user' ? '20px 20px 0 20px' : '20px 20px 20px 0',
                  background: msg.sender === 'user' ? 'var(--primary-color)' : 'white',
                  color: msg.sender === 'user' ? '#5c4e4e' : '#5c4e4e',
                  boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
                  width: 'fit-content',
                  alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                }} className="chat-message-text">
                  {msg.text}
                </div>
              </div>
            ))}
            {isTyping && (
              <div style={{ alignSelf: 'flex-start', background: 'white', padding: '1rem 1.5rem', borderRadius: '20px 20px 20px 0', color: '#888', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
                🐾 PawPal is typing...
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

      {/* Middle Column: Companion Stage */}
      <div style={{ flex: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
         <div style={{ transform: 'scale(1.3)', zIndex: 10 }}>
           <Dog2D expression={currentExpression} action={currentAction} />
         </div>
         {/* Stage floor ellipse */}
         <div style={{ width: '250px', height: '40px', background: 'rgba(0,0,0,0.03)', borderRadius: '50%', marginTop: '-20px' }} />
      </div>

      {/* Right Column: Mini-Game Area */}
      <div style={{ flex: 3 }}>
        <MiniGame onPlayAction={handleGameAction} />
      </div>

    </div>
  </div>
  );
};

import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { Camera, MessageSquare, Send, Mic, Clock, Grid } from 'lucide-react';

function System() {
  const [query, setQuery] = useState('');
  const [cameraActive, setCameraActive] = useState(true);
  const [isListening, setIsListening] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'ai', content: 'System active. What would you like to know about today\'s security events?' }
  ]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await axios.get('http://localhost:8000/api/logs');
        setLogs(res.data.logs.reverse()); 
      } catch(e) {}
    };
    fetchLogs();
    const interval = setInterval(fetchLogs, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleChat = async (e) => {
    e.preventDefault();
    if(!query.trim()) return;
    
    const userMsg = query;
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setQuery('');
    setLoading(true);

    try {
      const response = await axios.post('http://localhost:8000/api/chat', { query: userMsg });
      setMessages(prev => [...prev, { role: 'ai', content: response.data.answer }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'ai', content: 'Error connecting to backend. Make sure the FastAPI server is running on port 8000.' }]);
    }
    setLoading(false);
  };

  const toggleCamera = async () => {
    const newState = !cameraActive;
    setCameraActive(newState);
    try {
      await axios.post('http://localhost:8000/api/camera/toggle', { active: newState });
    } catch (e) {
      console.error("Failed to toggle camera hardware:", e);
    }
  };

  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Your browser does not support Voice Recognition. Please use Chrome or Edge.");
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setQuery(prev => prev ? prev + " " + transcript : transcript);
      setIsListening(false);
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
    recognition.start();
  };

  return (
    <div className="system-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
      
      {/* LEFT COLUMN: Multi-Camera Grid + Timeline */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', height: '100%' }}>
        
        {/* --- MULTI-CAMERA SECURITY GRID --- */}
        <div className="glass-panel video-container" style={{ flex: '0 0 auto', padding: '15px' }}>
          <div className="system-header" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px'}}>
            <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
              <Grid size={20} color="var(--primary)" /> 
              Multi-Sensor Camera Array (AI + Thermal + Night Vision)
            </div>
            <button 
              onClick={toggleCamera} 
              className="btn-primary" 
              style={{padding: '6px 12px', fontSize: '0.8rem'}}
            >
              {cameraActive ? 'Shutdown Array' : 'Boot Array'}
            </button>
          </div>
          
          {cameraActive ? (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              
              {/* CAM 01: MAIN AI INFERENCE */}
              <div style={{ position: 'relative', borderRadius: '8px', overflow: 'hidden', background: '#000' }}>
                <div style={{ position: 'absolute', top: 5, left: 5, background: 'rgba(0,0,0,0.7)', color: '#10b981', padding: '2px 6px', fontSize: '10px', zIndex: 10, borderRadius: '4px', fontWeight: 'bold' }}>CAM 01: MAIN ENTRY (YOLO+POSE)</div>
                <img src="http://localhost:8000/api/video_feed" alt="Cam 1" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>

              {/* CAM 02: NIGHT VISION SIMULATION */}
              <div style={{ position: 'relative', borderRadius: '8px', overflow: 'hidden', background: '#000' }}>
                <div style={{ position: 'absolute', top: 5, left: 5, background: 'rgba(0,0,0,0.7)', color: '#ef4444', padding: '2px 6px', fontSize: '10px', zIndex: 10, borderRadius: '4px', fontWeight: 'bold' }}>CAM 02: NIGHT VISION</div>
                <img src="http://localhost:8000/api/video_feed" alt="Cam 2" style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'sepia(1) hue-rotate(90deg) brightness(1.2)' }} />
              </div>

              {/* CAM 03: THERMAL IMAGING SIMULATION */}
              <div style={{ position: 'relative', borderRadius: '8px', overflow: 'hidden', background: '#000' }}>
                <div style={{ position: 'absolute', top: 5, left: 5, background: 'rgba(0,0,0,0.7)', color: '#f59e0b', padding: '2px 6px', fontSize: '10px', zIndex: 10, borderRadius: '4px', fontWeight: 'bold' }}>CAM 03: THERMAL INFRARED</div>
                <img src="http://localhost:8000/api/video_feed" alt="Cam 3" style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'invert(1) hue-rotate(180deg) brightness(1.5)' }} />
              </div>

              {/* CAM 04: HIGH CONTRAST SECURITY */}
              <div style={{ position: 'relative', borderRadius: '8px', overflow: 'hidden', background: '#000' }}>
                <div style={{ position: 'absolute', top: 5, left: 5, background: 'rgba(0,0,0,0.7)', color: '#3b82f6', padding: '2px 6px', fontSize: '10px', zIndex: 10, borderRadius: '4px', fontWeight: 'bold' }}>CAM 04: X-RAY CONTRAST</div>
                <img src="http://localhost:8000/api/video_feed" alt="Cam 4" style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'grayscale(1) contrast(2.5)' }} />
              </div>
              
            </div>
          ) : (
            <div style={{flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', background: '#000', minHeight: '300px', borderRadius: '12px'}}>
              Security Array is Offline.
            </div>
          )}
        </div>

        {/* TIMELINE COMPONENT */}
        <div className="glass-panel" style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
          <div className="system-header">
            <Clock size={20} color="var(--accent)" />
            Live Event Timeline (Past 7 Days)
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '15px', padding: '0 20px 20px 20px' }}>
            {logs.length === 0 ? <p style={{color: 'var(--text-muted)'}}>No events recorded yet.</p> : null}
            {logs.map((log, i) => {
              const isThreat = log.includes('ALARM') || log.includes('THREAT') || log.includes('WEAPON');
              return (
                <div key={i} style={{ 
                  padding: '12px', 
                  background: isThreat ? 'rgba(239, 68, 68, 0.1)' : 'rgba(255,255,255,0.05)', 
                  borderRadius: '8px', 
                  borderLeft: isThreat ? '4px solid #ef4444' : '4px solid var(--primary)',
                  fontSize: '0.85rem',
                  lineHeight: '1.4'
                }}>
                  {log}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: AI Chat */}
      <div className="glass-panel chat-container" style={{ height: '100%' }}>
        <div className="system-header">
          <MessageSquare size={20} color="var(--accent)" />
          Llama 3.2 Security Assistant
        </div>
        <div className="chat-messages">
          {messages.map((m, i) => (
            <div key={i} className={`chat-bubble ${m.role}`}>
              {m.content}
            </div>
          ))}
          {loading && (
            <div className="chat-bubble ai" style={{opacity: 0.7}}>
              Searching ChromaDB logs...
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
        <form onSubmit={handleChat} className="chat-input-area">
          <input 
            type="text" 
            className="chat-input"
            value={query} 
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ask about security events (e.g., 'Did you see any people?')"
          />
          <button type="button" onClick={startListening} className="btn-send" style={{background: isListening ? '#ef4444' : 'var(--accent)', marginRight: '5px'}} title="Voice Query">
            <Mic size={18} />
          </button>
          <button type="submit" className="btn-send" disabled={loading} title="Send">
            <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  );
}

export default System;

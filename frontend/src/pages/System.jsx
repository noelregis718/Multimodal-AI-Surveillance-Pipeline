import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { Camera, MessageSquare, Send, Mic, Clock, Grid, Terminal, Radio, ShieldAlert } from 'lucide-react';

function System() {
  const [query, setQuery] = useState('');
  const [cameraActive, setCameraActive] = useState(true);
  const [isListening, setIsListening] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'ai', content: 'Argus AI active. Ask me anything regarding today\'s telemetry, identified personnel, or threat anomalies.' }
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
      setMessages(prev => [...prev, { role: 'ai', content: 'Error connecting to backend. Please ensure FastAPI is running on port 8000.' }]);
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
    <div className="system-grid">
      
      {/* LEFT COLUMN: Multi-Camera Grid + Timeline */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', minHeight: '100%' }}>
        
        {/* --- MULTI-CAMERA SECURITY GRID --- */}
        <div className="glass-panel video-container" style={{ padding: '16px' }}>
          <div className="system-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', borderRadius: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Grid size={18} color="#ffffff" /> 
              <span>Multi-Sensor Sensor Matrix</span>
              <div className="status-dot" style={{ background: cameraActive ? 'var(--accent-emerald)' : 'var(--accent-red)' }} />
            </div>
            <button 
              onClick={toggleCamera} 
              className={cameraActive ? "btn-secondary" : "btn-primary"} 
              style={{ padding: '6px 16px', fontSize: '0.78rem' }}
            >
              <Radio size={12} />
              <span>{cameraActive ? 'Shutdown Array' : 'Boot Array'}</span>
            </button>
          </div>
          
          {cameraActive ? (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              
              {/* CAM 01: MAIN AI INFERENCE */}
              <div style={{ position: 'relative', borderRadius: '12px', overflow: 'hidden', background: '#09090b', border: '1px solid var(--glass-border)', aspectRatio: '4/3' }}>
                <div style={{ position: 'absolute', top: 8, left: 8, background: 'rgba(0,0,0,0.8)', border: '1px solid rgba(255,255,255,0.1)', color: '#ffffff', padding: '3px 8px', fontSize: '10px', zIndex: 10, borderRadius: '6px', fontFamily: 'var(--font-mono)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div className="status-dot" />
                  <span>CAM_01 // YOLO_SEG_POSE</span>
                </div>
                <img src="http://localhost:8000/api/video_feed" alt="Cam 1" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>

              {/* CAM 02: NIGHT VISION SIMULATION */}
              <div style={{ position: 'relative', borderRadius: '12px', overflow: 'hidden', background: '#09090b', border: '1px solid var(--glass-border)', aspectRatio: '4/3' }}>
                <div style={{ position: 'absolute', top: 8, left: 8, background: 'rgba(0,0,0,0.8)', border: '1px solid rgba(255,255,255,0.1)', color: '#ffffff', padding: '3px 8px', fontSize: '10px', zIndex: 10, borderRadius: '6px', fontFamily: 'var(--font-mono)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div className="status-dot" style={{ background: '#38bdf8' }} />
                  <span>CAM_02 // NIGHT_VISION_IR</span>
                </div>
                <img src="http://localhost:8000/api/video_feed" alt="Cam 2" style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'sepia(1) hue-rotate(90deg) brightness(1.2)' }} />
              </div>

              {/* CAM 03: THERMAL IMAGING SIMULATION */}
              <div style={{ position: 'relative', borderRadius: '12px', overflow: 'hidden', background: '#09090b', border: '1px solid var(--glass-border)', aspectRatio: '4/3' }}>
                <div style={{ position: 'absolute', top: 8, left: 8, background: 'rgba(0,0,0,0.8)', border: '1px solid rgba(255,255,255,0.1)', color: '#ffffff', padding: '3px 8px', fontSize: '10px', zIndex: 10, borderRadius: '6px', fontFamily: 'var(--font-mono)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div className="status-dot" style={{ background: '#f59e0b' }} />
                  <span>CAM_03 // THERMAL_INFRARED</span>
                </div>
                <img src="http://localhost:8000/api/video_feed" alt="Cam 3" style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'invert(1) hue-rotate(180deg) brightness(1.5)' }} />
              </div>

              {/* CAM 04: HIGH CONTRAST SECURITY */}
              <div style={{ position: 'relative', borderRadius: '12px', overflow: 'hidden', background: '#09090b', border: '1px solid var(--glass-border)', aspectRatio: '4/3' }}>
                <div style={{ position: 'absolute', top: 8, left: 8, background: 'rgba(0,0,0,0.8)', border: '1px solid rgba(255,255,255,0.1)', color: '#ffffff', padding: '3px 8px', fontSize: '10px', zIndex: 10, borderRadius: '6px', fontFamily: 'var(--font-mono)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div className="status-dot" style={{ background: '#a855f7' }} />
                  <span>CAM_04 // HIGH_CONTRAST_XRAY</span>
                </div>
                <img src="http://localhost:8000/api/video_feed" alt="Cam 4" style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'grayscale(1) contrast(2.5)' }} />
              </div>
              
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-dim)', background: '#09090b', minHeight: '260px', borderRadius: '14px', border: '1px dashed var(--glass-border)' }}>
              <Radio size={32} style={{ marginBottom: 12, opacity: 0.3 }} />
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>// CAMERA ARRAY OFFLINE //</span>
            </div>
          )}
        </div>

        {/* TIMELINE COMPONENT */}
        <div className="glass-panel" style={{ flex: 1, minHeight: '280px', display: 'flex', flexDirection: 'column' }}>
          <div className="system-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Clock size={16} color="#ffffff" />
              <span>Event Timeline</span>
            </div>
            <div className="pill-badge" style={{ padding: '2px 10px', fontSize: '0.68rem' }}>
              <span>{logs.length} EVENTS BUFFERED</span>
            </div>
          </div>
          <div style={{ flex: 1, overflowY: 'auto', maxHeight: '340px', display: 'flex', flexDirection: 'column', gap: '8px', padding: '16px' }}>
            {logs.length === 0 ? (
              <p style={{ color: 'var(--text-dim)', fontFamily: 'var(--font-mono)', fontSize: '0.82rem', textAlign: 'center', padding: '30px 0' }}>
                // No telemetry events recorded yet //
              </p>
            ) : null}
            {logs.map((log, i) => {
              const isThreat = log.includes('ALARM') || log.includes('THREAT') || log.includes('WEAPON') || log.includes('FALLEN');
              return (
                <div key={i} style={{ 
                  padding: '10px 14px', 
                  background: isThreat ? 'rgba(239, 68, 68, 0.08)' : 'rgba(255,255,255,0.02)', 
                  borderRadius: '10px', 
                  border: isThreat ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid var(--glass-border)',
                  borderLeft: isThreat ? '3px solid var(--accent-red)' : '3px solid rgba(255,255,255,0.2)',
                  fontSize: '0.82rem',
                  lineHeight: '1.45',
                  fontFamily: 'var(--font-mono)',
                  color: isThreat ? '#fca5a5' : 'var(--text-muted)'
                }}>
                  {log}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: AI Copilot Chat */}
      <div className="glass-panel chat-container" style={{ minHeight: '100%' }}>
        <div className="system-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Terminal size={16} color="#ffffff" />
            <span>Llama 3.2 Security Copilot</span>
          </div>
          <div className="pill-badge" style={{ padding: '2px 10px', fontSize: '0.68rem' }}>
            <div className="status-dot" />
            <span>RAG ONLINE</span>
          </div>
        </div>

        <div className="chat-messages">
          {messages.map((m, i) => (
            <div key={i} className={`chat-bubble ${m.role}`}>
              {m.content}
            </div>
          ))}
          {loading && (
            <div className="chat-bubble ai" style={{ opacity: 0.7, fontFamily: 'var(--font-mono)', fontSize: '0.82rem' }}>
              // Querying ChromaDB Vector Index...
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
            placeholder="Query telemetry (e.g. 'Were there any weapons detected?')"
          />
          <button 
            type="button" 
            onClick={startListening} 
            className="btn-secondary"
            style={{ 
              padding: '0 14px', 
              borderRadius: '10px',
              color: isListening ? 'var(--accent-red)' : '#ffffff',
              borderColor: isListening ? 'var(--accent-red)' : 'var(--glass-border)'
            }} 
            title="Speech Recognition"
          >
            <Mic size={16} />
          </button>
          <button type="submit" className="btn-send" disabled={loading} title="Send Inquiry">
            <Send size={15} />
          </button>
        </form>
      </div>

    </div>
  );
}

export default System;

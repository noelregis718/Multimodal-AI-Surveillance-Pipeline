import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { Camera, MessageSquare, Send } from 'lucide-react';

function System() {
  const [query, setQuery] = useState('');
  const [cameraActive, setCameraActive] = useState(true);
  const [messages, setMessages] = useState([
    { role: 'ai', content: 'System active. What would you like to know about today\'s security events?' }
  ]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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

  return (
    <div className="system-grid">
      <div className="glass-panel video-container">
        <div className="system-header" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
          <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
            <Camera size={20} color="var(--primary)" /> 
            Live YOLOv8 Inference Stream
          </div>
          <button 
            onClick={toggleCamera} 
            className="btn-primary" 
            style={{padding: '6px 12px', fontSize: '0.8rem'}}
          >
            {cameraActive ? 'Turn Camera Off' : 'Turn Camera On'}
          </button>
        </div>
        {cameraActive ? (
          <img 
            src="http://localhost:8000/api/video_feed" 
            alt="Live CCTV Feed" 
            className="video-feed"
            onError={(e) => {
              if(!e.target.dataset.error) {
                e.target.dataset.error = true;
                e.target.style.display='none'; 
                e.target.parentElement.innerHTML += '<div style="flex:1; display:flex; align-items:center; justify-content:center; color:var(--text-muted); padding:20px; text-align:center;">FastAPI Backend Not Connected.<br/>Please run `python smart_cctv/api.py`</div>';
              }
            }}
          />
        ) : (
          <div style={{flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', background: '#000'}}>
            Camera is disabled to save resources.
          </div>
        )}
      </div>

      <div className="glass-panel chat-container">
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
          <button type="submit" className="btn-send" disabled={loading}>
            <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  );
}

export default System;

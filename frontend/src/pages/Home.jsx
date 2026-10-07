import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Brain, Activity } from 'lucide-react';

function Home() {
  return (
    <div>
      <section className="hero">
        <h1>Enterprise Multimodal<br/><span style={{background: 'linear-gradient(to right, var(--primary), var(--accent))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'}}>AI Surveillance</span></h1>
        <p>Real-time computer vision tracking powered by YOLOv8, seamlessly integrated with a Local Large Language Model (Llama 3.2) for natural language security querying.</p>
        <Link to="/system" className="btn-primary" style={{marginTop: '20px', fontSize: '1.1rem'}}>
          Launch AI Dashboard
        </Link>
      </section>
      
      <div style={{display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '30px', marginTop: '40px'}}>
        <div className="glass-panel" style={{padding: '30px', textAlign: 'center'}}>
          <Shield size={48} color="var(--primary)" style={{marginBottom: '20px'}}/>
          <h3 style={{marginBottom: '10px'}}>Real-Time Telemetry</h3>
          <p style={{color: 'var(--text-muted)'}}>Automated event logging and hardware-accelerated computer vision.</p>
        </div>
        <div className="glass-panel" style={{padding: '30px', textAlign: 'center'}}>
          <Brain size={48} color="var(--accent)" style={{marginBottom: '20px'}}/>
          <h3 style={{marginBottom: '10px'}}>Generative RAG Engine</h3>
          <p style={{color: 'var(--text-muted)'}}>Talk to your CCTV. Powered by ChromaDB and Meta's Llama 3.2.</p>
        </div>
        <div className="glass-panel" style={{padding: '30px', textAlign: 'center'}}>
          <Activity size={48} color="var(--primary)" style={{marginBottom: '20px'}}/>
          <h3 style={{marginBottom: '10px'}}>Threat Detection</h3>
          <p style={{color: 'var(--text-muted)'}}>Simulated Facial Recognition and Twilio SMS Alert integrations.</p>
        </div>
      </div>
    </div>
  );
}

export default Home;

import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Shield, 
  Brain, 
  Activity, 
  Radio, 
  BookOpen, 
  Eye, 
  Mic, 
  Grid, 
  Cpu, 
  Lock, 
  Terminal,
  Zap,
  ArrowRight
} from 'lucide-react';

function Home() {
  return (
    <div>
      {/* HERO SECTION */}
      <section className="hero">
        <div className="pill-badge" style={{ marginBottom: '24px' }}>
          <div className="status-dot" />
          <span>ARGUS DEFENSE INTELLIGENCE • SYSTEM ONLINE</span>
        </div>
        
        <h1>
          Autonomous Physical Perception<br />
          &amp; Threat Intelligence.
        </h1>
        
        <p>
          An enterprise-grade multimodal surveillance pipeline fusing edge computer vision 
          (YOLOv8-Seg, Pose, DeepFace) with ambient acoustic telemetry and local generative 
          intelligence (Llama 3.2 + Llava) for proactive security containment.
        </p>

        <div className="hero-actions">
          <Link to="/system" className="btn-primary">
            <Radio size={16} />
            <span>Launch Live Array</span>
          </Link>
          <Link to="/docs" className="btn-secondary">
            <BookOpen size={16} />
            <span>Read Architecture</span>
          </Link>
        </div>

        {/* METRICS / STATS STRIP */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '16px',
          width: '100%',
          maxWidth: '960px',
          margin: '20px 0 60px 0',
          padding: '20px',
          background: 'rgba(255, 255, 255, 0.02)',
          border: '1px solid var(--glass-border)',
          borderRadius: '16px'
        }}>
          <div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.4rem', fontWeight: 700, color: '#ffffff' }}>0ms</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)', marginTop: '4px' }}>Cloud Latency (100% Local)</div>
          </div>
          <div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.4rem', fontWeight: 700, color: '#ffffff' }}>4-Feed</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)', marginTop: '4px' }}>Simulated Spectrum Array</div>
          </div>
          <div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.4rem', fontWeight: 700, color: '#ffffff' }}>106 Pt</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)', marginTop: '4px' }}>3D Facial Landmarks</div>
          </div>
          <div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.4rem', fontWeight: 700, color: '#ffffff' }}>Zero</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)', marginTop: '4px' }}>External API Dependency</div>
          </div>
        </div>
      </section>

      {/* BENTO GRID (POWDER STYLE) */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '24px' }}>
          <div>
            <div className="pill-badge" style={{ marginBottom: '10px' }}>
              <span>CAPABILITIES MATRIX</span>
            </div>
            <h2 style={{ fontSize: '2rem', fontWeight: 700, letterSpacing: '-0.03em' }}>
              Engineered for autonomous threat mitigation.
            </h2>
          </div>
          <Link to="/system" style={{ color: 'var(--text-muted)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.88rem' }}>
            <span>Explore live console</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        <div className="bento-grid">
          
          {/* CARD 1: SAM / Segmentation (Featured Col-Span-2) */}
          <div className="glass-panel bento-card col-span-2">
            <div>
              <div className="bento-icon-box">
                <Eye size={22} />
              </div>
              <h3 className="bento-title">Pixel-Perfect Instance Segmentation</h3>
              <p className="bento-desc">
                Replaces conventional rectangular bounding boxes with high-fidelity polygonal masks using 
                YOLOv8-Seg. Identifies humans, assets, and perimeters down to individual pixels with zero frame degradation.
              </p>
            </div>
            <div className="bento-mono-tag">
              <Zap size={12} color="var(--accent-emerald)" />
              <span>YOLOV8_SEGMENTATION • REAL_TIME_MASK_SYNTHESIS</span>
            </div>
          </div>

          {/* CARD 2: 3D Face & Emotion */}
          <div className="glass-panel bento-card">
            <div>
              <div className="bento-icon-box">
                <Lock size={22} />
              </div>
              <h3 className="bento-title">ArcFace 3D Biometrics</h3>
              <p className="bento-desc">
                DeepFace ArcFace neural embeddings with RetinaFace landmark mapping. Extracts identity and micro-expressions 
                to gauge hostile behavioral indicators.
              </p>
            </div>
            <div className="bento-mono-tag">
              <Cpu size={12} color="var(--accent-cyan)" />
              <span>106_FACIAL_LANDMARKS • EMOTION_DETECTION</span>
            </div>
          </div>

          {/* CARD 3: Llama 3.2 RAG Copilot */}
          <div className="glass-panel bento-card">
            <div>
              <div className="bento-icon-box">
                <Brain size={22} />
              </div>
              <h3 className="bento-title">Conversational Copilot</h3>
              <p className="bento-desc">
                Inquire about your security logs in plain English. Powered by ChromaDB vector similarity 
                retrieval and Meta's local Llama 3.2 LLM.
              </p>
            </div>
            <div className="bento-mono-tag">
              <Terminal size={12} color="#ffffff" />
              <span>LLAMA_3.2 • CHROMADB_VECTOR_RAG</span>
            </div>
          </div>

          {/* CARD 4: Acoustic Keyword Spotting */}
          <div className="glass-panel bento-card">
            <div>
              <div className="bento-icon-box">
                <Mic size={22} />
              </div>
              <h3 className="bento-title">Acoustic Keyword Spotting</h3>
              <p className="bento-desc">
                Continuous background sound analysis listens for acoustic anomalies and distress keywords 
                (HELP, WEAPON, INTRUDER) to log preemptive warnings.
              </p>
            </div>
            <div className="bento-mono-tag">
              <Activity size={12} color="var(--accent-amber)" />
              <span>16KHZ_DSP_ANALYSIS • THREAT_FREQUENCY_INDEX</span>
            </div>
          </div>

          {/* CARD 5: 4-Quadrant Sensor Spectrum */}
          <div className="glass-panel bento-card">
            <div>
              <div className="bento-icon-box">
                <Grid size={22} />
              </div>
              <h3 className="bento-title">Multi-Sensor Matrix</h3>
              <p className="bento-desc">
                Simultaneous multi-sensor feeds including Primary AI Vision, Low-Light Night Vision, 
                Thermal Infrared, and High-Contrast X-Ray filtering.
              </p>
            </div>
            <div className="bento-mono-tag">
              <Radio size={12} color="var(--accent-cyan)" />
              <span>2X2_ARRAY • SPECTRAL_SIMULATION</span>
            </div>
          </div>

          {/* CARD 6: Autonomous Forensics (Col-Span-3) */}
          <div className="glass-panel bento-card col-span-3">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px' }}>
              <div style={{ maxWidth: '650px' }}>
                <div className="bento-icon-box">
                  <Shield size={22} />
                </div>
                <h3 className="bento-title">Automated Forensics &amp; Threat Containment</h3>
                <p className="bento-desc">
                  When a physical anomaly is confirmed—such as posture collapse (fall detection), weapon detection, 
                  or an unauthorized facial signature—Argus AI instantly records an MP4 evidence clip into the local VMS 
                  and triggers emergency email dispatch.
                </p>
              </div>
              <div style={{
                background: 'rgba(0, 0, 0, 0.4)',
                border: '1px solid var(--glass-border)',
                borderRadius: '12px',
                padding: '16px 24px',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.8rem',
                minWidth: '260px'
              }}>
                <div style={{ color: 'var(--accent-emerald)', marginBottom: '8px' }}>● VMS DAEMON: RUNNING</div>
                <div style={{ color: 'var(--text-muted)' }}>CLIP_EXTRACTION: 1080P MP4</div>
                <div style={{ color: 'var(--text-muted)' }}>DISPATCH: SMTP SECURE</div>
                <div style={{ color: 'var(--text-muted)' }}>STORAGE: AIR-GAPPED DISK</div>
              </div>
            </div>
            <div className="bento-mono-tag" style={{ marginTop: '24px' }}>
              <span>YOLOV8_POSE • REID_COLOR_HISTOGRAMS • AUTOMATED_EVIDENCE_CHAIN</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default Home;

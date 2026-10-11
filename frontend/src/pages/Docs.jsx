import React from 'react';
import { BookOpen, Cpu, Brain, Shield, Mic, Eye, Database, Terminal } from 'lucide-react';

function Docs() {
  const sections = [
    {
      icon: <Eye size={20} />,
      tag: "SUBSYSTEM // CV_01",
      title: "Edge Vision & Instance Segmentation",
      desc: "Raw video frames from hardware capture devices (OpenCV) are routed into an asynchronous processing worker running Ultralytics YOLOv8-Seg. Instead of generic bounding boxes, polygonal segmentation masks isolate pixel boundaries for humans and objects."
    },
    {
      icon: <Cpu size={20} />,
      tag: "SUBSYSTEM // BIO_02",
      title: "3D Face Biometrics & Emotion Analysis",
      desc: "Personnel recognition utilizes DeepFace ArcFace backed by RetinaFace 106-point landmark localization. It extracts high-dimensional mathematical facial embeddings resilient to head rotation, glasses, and ambient lighting shifts while gauging emotional aggression."
    },
    {
      icon: <Brain size={20} />,
      tag: "SUBSYSTEM // RAG_03",
      title: "ChromaDB & Llama 3.2 Conversational Copilot",
      desc: "All events from the surveillance stream are formatted as timestamped telemetry vectors embedded via sentence-transformers (all-MiniLM-L6-v2) into a persistent ChromaDB database. User inquiries trigger Top-K semantic retrieval into Meta's local Llama 3.2 LLM."
    },
    {
      icon: <Mic size={20} />,
      tag: "SUBSYSTEM // AUDIO_04",
      title: "Acoustic Keyword & Distress Spotting",
      desc: "An ambient sound daemon samples the microphone in 1-second chunks at 16kHz via sounddevice, checking decibel variance and speech recognition for high-priority distress triggers ('HELP', 'GUN', 'INTRUDER')."
    },
    {
      icon: <Shield size={20} />,
      tag: "SUBSYSTEM // VMS_05",
      title: "Autonomous Evidence Extraction (VMS)",
      desc: "When high-threat incidents (posture collapses, raised arms, hostile emotions, or weapon classifications) occur, the background pipeline buffers the incident and records an H.264/MP4 evidence clip directly to disk."
    }
  ];

  return (
    <div style={{ maxWidth: '920px', margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <div className="pill-badge" style={{ marginBottom: '16px' }}>
          <span>TECHNICAL SPECIFICATIONS</span>
        </div>
        <h1 style={{ fontSize: '2.8rem', fontWeight: 700, letterSpacing: '-0.04em', color: '#ffffff' }}>
          Argus AI Architecture
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', marginTop: '12px', maxWidth: '600px', margin: '12px auto 0 auto' }}>
          In-depth technical breakdown of the multi-agent surveillance and intelligence pipeline.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {sections.map((sec, i) => (
          <div key={i} className="glass-panel" style={{ padding: '28px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: 36,
                  height: 36,
                  borderRadius: '10px',
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid var(--glass-border)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff'
                }}>
                  {sec.icon}
                </div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 600, letterSpacing: '-0.02em', color: '#ffffff' }}>
                  {sec.title}
                </h2>
              </div>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--text-dim)' }}>
                {sec.tag}
              </span>
            </div>
            <p style={{ color: 'var(--text-muted)', lineHeight: '1.65', fontSize: '0.92rem' }}>
              {sec.desc}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Docs;

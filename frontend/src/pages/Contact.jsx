import React from 'react';
import { Mail, Code, Globe, Shield } from 'lucide-react';

function Contact() {
  return (
    <div style={{ maxWidth: '640px', margin: '40px auto 0 auto' }}>
      <div className="glass-panel" style={{ padding: '48px 36px', textAlign: 'center' }}>
        <div className="pill-badge" style={{ marginBottom: '20px' }}>
          <div className="status-dot" />
          <span>DEVELOPER &amp; DEFENSE LAB</span>
        </div>
        
        <h1 style={{ fontSize: '2.4rem', fontWeight: 700, letterSpacing: '-0.04em', color: '#ffffff', marginBottom: '14px' }}>
          Connect with Argus AI
        </h1>
        
        <p style={{ color: 'var(--text-muted)', lineHeight: '1.6', fontSize: '0.95rem', marginBottom: '36px' }}>
          Argus AI was engineered as a zero-cloud, 100% local multimodal defense pipeline. For technical collaboration, 
          academic research, or deployment inquiries, reach out below.
        </p>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', width: '100%', maxWidth: '420px', margin: '0 auto' }}>
          <a 
            href="mailto:developer@college.edu" 
            className="btn-primary"
            style={{ width: '100%' }}
          >
            <Mail size={16} />
            <span>Direct Email Inquiry</span>
          </a>
          
          <a 
            href="https://github.com/noelregis718/New-Project" 
            target="_blank" 
            rel="noreferrer" 
            className="btn-secondary"
            style={{ width: '100%' }}
          >
            <Code size={16} />
            <span>Open Source Repository</span>
          </a>
        </div>

        <div style={{ marginTop: '36px', paddingTop: '24px', borderTop: '1px solid var(--glass-border)', fontFamily: 'var(--font-mono)', fontSize: '0.74rem', color: 'var(--text-dim)' }}>
          SECURE ENCRYPTED COMMUNICATIONS // GITHUB VERIFIED
        </div>
      </div>
    </div>
  );
}

export default Contact;

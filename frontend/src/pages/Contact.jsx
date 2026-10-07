import React from 'react';
import { Mail, Code } from 'lucide-react';

function Contact() {
  return (
    <div className="glass-panel" style={{padding: '40px', maxWidth: '600px', margin: '0 auto', textAlign: 'center'}}>
      <h1 style={{marginBottom: '20px'}}>Contact the Developer</h1>
      <p style={{color: 'var(--text-muted)', marginBottom: '40px'}}>
        This advanced multimodal AI project was built as a demonstration of enterprise-level software engineering and artificial intelligence integration.
      </p>
      
      <div style={{display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center'}}>
        <a href="mailto:developer@college.edu" style={{display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text)', textDecoration: 'none', background: 'rgba(255,255,255,0.05)', padding: '15px 30px', borderRadius: '8px', width: '100%', justifyContent: 'center'}}>
          <Mail color="var(--primary)" /> Email Me
        </a>
        <a href="https://github.com/noelregis718/New-Project" target="_blank" rel="noreferrer" style={{display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text)', textDecoration: 'none', background: 'rgba(255,255,255,0.05)', padding: '15px 30px', borderRadius: '8px', width: '100%', justifyContent: 'center'}}>
          <Code color="var(--primary)" /> View on GitHub
        </a>
      </div>
    </div>
  );
}

export default Contact;

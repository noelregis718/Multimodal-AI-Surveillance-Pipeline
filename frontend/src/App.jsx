import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Shield, Radio, Terminal } from 'lucide-react';
import Home from './pages/Home';
import System from './pages/System';
import Docs from './pages/Docs';
import Contact from './pages/Contact';

function NavLinks() {
  const location = useLocation();
  return (
    <div className="nav-links">
      <Link to="/" className={location.pathname === '/' ? 'active' : ''}>Overview</Link>
      <Link to="/system" className={location.pathname === '/system' ? 'active' : ''}>Live Array</Link>
      <Link to="/docs" className={location.pathname === '/docs' ? 'active' : ''}>Documentation</Link>
      <Link to="/contact" className={location.pathname === '/contact' ? 'active' : ''}>Contact</Link>
    </div>
  );
}

function App() {
  return (
    <Router>
      <div className="nav-wrapper">
        <nav className="navbar">
          <Link to="/" className="nav-logo">
            <div style={{
              width: 32,
              height: 32,
              borderRadius: '8px',
              background: 'rgba(255, 255, 255, 0.06)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Shield size={18} color="#ffffff" />
            </div>
            <span>Argus AI</span>
            <div className="status-dot" title="Telemetry Active" style={{ marginLeft: 4 }} />
          </Link>
          
          <NavLinks />

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Link 
              to="/system" 
              className="btn-primary" 
              style={{ padding: '8px 18px', fontSize: '0.82rem', borderRadius: '999px' }}
            >
              <Radio size={14} />
              <span>Launch Console</span>
            </Link>
          </div>
        </nav>
      </div>

      <div className="container">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/system" element={<System />} />
          <Route path="/docs" element={<Docs />} />
          <Route path="/contact" element={<Contact />} />
        </Routes>
      </div>

      <footer className="footer" style={{ maxWidth: '1200px', margin: '60px auto 0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div className="status-dot" />
          <span>ARGUS AI • AUTONOMOUS MULTIMODAL DEFENSE INTELLIGENCE</span>
        </div>
        <div>
          <span>SECURE LOCAL EDGE ENGINE • SYSTEM STATUS: NORMAL</span>
        </div>
      </footer>
    </Router>
  );
}

export default App;

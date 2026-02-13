import React from 'react';
import footballBg from '../assets/football_bg.png';

const LandingPage = ({ onEnter }) => {
    return (
        <div className="landing-container" style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100vh',
            width: '100vw',
            position: 'fixed',
            top: 0,
            left: 0,
            zIndex: 2000,
            backgroundImage: `url(${footballBg})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
        }}>
            {/* Dark Overlay for readability - Reduced Opacity to 0.5 */}
            <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                backgroundColor: 'rgba(11, 15, 25, 0.5)',
                zIndex: -1
            }}></div>

            <h1 className="app-title" style={{ fontSize: '10rem', marginBottom: '40px' }}>
                StratGen
            </h1>

            <p style={{
                color: 'var(--accent-cyan)',
                fontSize: '1.5rem',
                letterSpacing: '4px',
                textTransform: 'uppercase',
                marginBottom: '60px',
                fontWeight: '600',
                textShadow: '0 0 20px rgba(0, 229, 255, 0.5)'
            }}>
                Next-Gen Tactical Analysis
            </p>

            <button
                onClick={onEnter}
                style={{
                    width: 'auto',
                    padding: '20px 60px',
                    fontSize: '1.5rem',
                    background: 'transparent',
                    border: '2px solid var(--accent-green)',
                    color: 'var(--accent-green)',
                    boxShadow: '0 0 30px rgba(0, 255, 157, 0.2)',
                    borderRadius: '50px',
                    animation: 'pulse 2s infinite',
                    cursor: 'pointer'
                    /* marginBottom: 'auto' REMOVED to allow centering */
                }}
                onMouseEnter={(e) => {
                    e.target.style.background = 'var(--accent-green)';
                    e.target.style.color = '#000';
                    e.target.style.boxShadow = '0 0 50px rgba(0, 255, 157, 0.6)';
                }}
                onMouseLeave={(e) => {
                    e.target.style.background = 'transparent';
                    e.target.style.color = 'var(--accent-green)';
                    e.target.style.boxShadow = '0 0 30px rgba(0, 255, 157, 0.2)';
                }}
            >
                ENTER TACTICS
            </button>

            {/* Footer */}
            <footer style={{
                width: '100%',
                padding: '20px',
                textAlign: 'center',
                color: 'var(--text-secondary)',
                fontSize: '0.9rem',
                letterSpacing: '1px',
                borderTop: '1px solid rgba(255, 255, 255, 0.05)',
                background: 'rgba(0, 0, 0, 0.4)',
                marginTop: '40px',
                position: 'absolute',
                bottom: 0
            }}>
                <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', marginBottom: '5px' }}>
                    <span>📞 +91 8882493607</span>
                    <span style={{ color: 'var(--glass-border)' }}>|</span>
                    <span>✉️ contact@stratgen.com</span>
                </div>
                <div style={{ fontSize: '0.7rem', opacity: 0.6, marginTop: '5px' }}>
                    © 2026 StratGen. All rights reserved.
                </div>
            </footer>

            <style>{`
        @keyframes pulse {
          0% { box-shadow: 0 0 0 0 rgba(0, 255, 157, 0.4); }
          70% { box-shadow: 0 0 0 20px rgba(0, 255, 157, 0); }
          100% { box-shadow: 0 0 0 0 rgba(0, 255, 157, 0); }
        }
      `}</style>
        </div>
    );
};

export default LandingPage;

import React from 'react';
import footballBg from '../assets/football_bg.png';

const LandingPage = ({ onEnter }) => {
    return (
        <div className="landing-wrapper" style={{ overflowX: 'hidden' }}>
            {/* Fixed Background Layer */}
            <div style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                zIndex: -1,
                backgroundImage: `url(${footballBg})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat'
            }}>
                {/* Dark Overlay - Opacity 0.5 */}
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    backgroundColor: 'rgba(11, 15, 25, 0.5)'
                }}></div>
            </div>

            {/* Hero Section (100vh) */}
            <div style={{
                height: '100vh',
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative'
            }}>
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

                {/* Scroll Indicator */}
                <div style={{
                    position: 'absolute',
                    bottom: '30px',
                    color: 'var(--text-secondary)',
                    animation: 'bounce 2s infinite',
                    opacity: 0.7
                }}>
                    Scroll for more ↓
                </div>
            </div>

            {/* About Section (min-100vh) */}
            <div style={{
                minHeight: '100vh',
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                padding: '100px 20px',
                backgroundColor: 'rgba(11, 15, 25, 0.8)', // Darker background for readability
                backdropFilter: 'blur(10px)',
                color: 'white',
                textAlign: 'center'
            }}>
                <h2 style={{
                    fontFamily: "'Montserrat', sans-serif",
                    fontSize: '4rem',
                    color: 'var(--accent-cyan)',
                    marginBottom: '40px',
                    textTransform: 'uppercase',
                    letterSpacing: '-2px'
                }}>
                    About StratGen
                </h2>

                <div style={{ maxWidth: '800px', fontSize: '1.2rem', lineHeight: '1.8', color: '#cbd5e1', marginBottom: '60px' }}>
                    <p style={{ marginBottom: '20px' }}>
                        StratGen is the ultimate tactical analysis tool designed for modern football managers and analysts.
                        By leveraging advanced AI and spatial data visualization, we bridge the gap between whiteboard tactics and on-pitch reality.
                    </p>
                    <p>
                        Whether you are simulating pressing traps, analyzing defensive shapes, or optimizing player positioning,
                        StratGen provides the precision and intuitive interface you need to dominate the game.
                    </p>
                </div>

                {/* Social Media Links */}
                <div style={{ marginBottom: '80px' }}>
                    <h3 style={{ fontSize: '1.5rem', marginBottom: '30px', color: 'var(--accent-green)', textTransform: 'uppercase' }}>Connect With Us</h3>
                    <div style={{ display: 'flex', gap: '40px', justifyContent: 'center' }}>
                        {/* Instagram */}
                        <a href="https://instagram.com/dummy_stratgen" target="_blank" rel="noopener noreferrer" style={{ transition: 'transform 0.3s' }} className="social-icon">
                            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'white' }}>
                                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                            </svg>
                        </a>
                        {/* Twitter / X */}
                        <a href="https://twitter.com/dummy_stratgen" target="_blank" rel="noopener noreferrer" style={{ transition: 'transform 0.3s' }} className="social-icon">
                            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'white' }}>
                                <path d="M4 4l11.733 16h4.267l-11.733 -16z"></path>
                                <path d="M4 20l6.768 -6.768m2.46 -2.46l6.772 -6.772"></path>
                            </svg>
                        </a>
                        {/* Facebook */}
                        <a href="https://facebook.com/dummy_stratgen" target="_blank" rel="noopener noreferrer" style={{ transition: 'transform 0.3s' }} className="social-icon">
                            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'white' }}>
                                <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                            </svg>
                        </a>
                    </div>
                </div>

                {/* Footer */}
                <footer style={{
                    width: '100%',
                    padding: '20px',
                    borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                    marginTop: 'auto'
                }}>
                    <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', marginBottom: '10px' }}>
                        <span>📞 +91 8882493607</span>
                        <span style={{ color: 'var(--glass-border)' }}>|</span>
                        <span>✉️ contact@stratgen.com</span>
                    </div>
                    <div style={{ fontSize: '0.8rem', opacity: 0.6 }}>
                        © 2026 StratGen. All rights reserved.
                    </div>
                </footer>
            </div>

            <style>{`
        @keyframes pulse {
          0% { box-shadow: 0 0 0 0 rgba(0, 255, 157, 0.4); }
          70% { box-shadow: 0 0 0 20px rgba(0, 255, 157, 0); }
          100% { box-shadow: 0 0 0 0 rgba(0, 255, 157, 0); }
        }
        @keyframes bounce {
          0%, 20%, 50%, 80%, 100% {transform: translateY(0);}
          40% {transform: translateY(-10px);}
          60% {transform: translateY(-5px);}
        }
        .social-icon:hover svg {
          color: var(--accent-cyan) !important;
          transform: scale(1.1);
        }
      `}</style>
        </div>
    );
};

export default LandingPage;

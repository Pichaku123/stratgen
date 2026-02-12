import React from 'react';

const Pitch = () => {
    // Pitch dimensions
    const width = 800;
    const height = 600;

    // Grass Stripes Pattern
    // ShareMyTactics Green (Brighter, classic tactical board look)
    const grassStyle = {
        position: 'absolute',
        width: '100%',
        height: '100%',
        backgroundColor: '#588f58', // Typical football pitch green
        backgroundImage: `
            linear-gradient(to right, rgba(255,255,255,0.1) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255,255,255,0.1) 1px, transparent 1px),
            linear-gradient(to right, rgba(0,0,0,0.05) 50%, transparent 50%)
        `,
        backgroundSize: '100px 100px, 100px 100px, 50px 100%', 
        border: 'none',
        boxSizing: 'border-box',
        overflow: 'hidden',
        pointerEvents: 'none',
        boxShadow: 'inset 0 0 20px rgba(0,0,0,0.2)'
    };

    const lineStyle = {
        position: 'absolute',
        border: '2px solid rgba(255, 255, 255, 0.9)',
        boxShadow: '0 0 4px rgba(0,0,0,0.2)' // Subtle shadow for lines
    };

    return (
        <div style={grassStyle}>
            {/* Center Circle */}
            <div
                style={{
                    ...lineStyle,
                    top: '50%',
                    left: '50%',
                    width: '130px',
                    height: '130px',
                    borderRadius: '50%',
                    transform: 'translate(-50%, -50%)',
                }}
            />

            {/* Center Line */}
            <div
                style={{
                    ...lineStyle,
                    top: '0',
                    left: '50%',
                    width: '0',
                    borderLeft: '2px solid rgba(255, 255, 255, 0.9)',
                    height: '100%',
                    transform: 'translateX(-50%)',
                }}
            />

            {/* Penalty Areas */}
            {/* Left */}
            <div
                style={{
                    ...lineStyle,
                    top: '50%',
                    left: '0',
                    width: '120px',
                    height: '320px',
                    borderLeft: 'none',
                    transform: 'translateY(-50%)',
                    backgroundColor: 'rgba(255,255,255,0.03)'
                }}
            />
            {/* Right */}
            <div
                style={{
                    ...lineStyle,
                    top: '50%',
                    right: '0',
                    width: '120px',
                    height: '320px',
                    borderRight: 'none',
                    transform: 'translateY(-50%)',
                    backgroundColor: 'rgba(255,255,255,0.03)'
                }}
            />
            
            {/* Corner Arcs */}
            <div style={{ ...lineStyle, top: '-20px', left: '-20px', width: '40px', height: '40px', borderRadius: '50%' }} />
            <div style={{ ...lineStyle, top: '-20px', right: '-20px', width: '40px', height: '40px', borderRadius: '50%' }} />
            <div style={{ ...lineStyle, bottom: '-20px', left: '-20px', width: '40px', height: '40px', borderRadius: '50%' }} />
            <div style={{ ...lineStyle, bottom: '-20px', right: '-20px', width: '40px', height: '40px', borderRadius: '50%' }} />
        </div>
    );
};

export default Pitch;

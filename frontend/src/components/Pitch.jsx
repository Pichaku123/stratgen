import React from 'react';

const Pitch = () => {
    // Pitch dimensions
    const width = 800;
    const height = 600;

    // Pro Max "Turf" Style - Deep Green with Tech Grid
    const grassStyle = {
        position: 'absolute',
        width: '100%',
        height: '100%',
        backgroundColor: '#22c55e', // Base Green
        backgroundImage: `
            linear-gradient(rgba(0,0,0,0.1) 2px, transparent 2px),
            linear-gradient(90deg, rgba(0,0,0,0.1) 2px, transparent 2px),
            linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px),
            conic-gradient(from 90deg at 2px 2px, #0000 90deg, #15803d 0)
        `,
        backgroundSize: '100px 100px, 100px 100px, 20px 20px, 20px 20px, 100px 100px',
        // Creating a "Mowed" look with alternating stripes overlay
        background: `
            repeating-linear-gradient(
                90deg,
                #4ade80,
                #4ade80 50px,
                #22c55e 50px,
                #22c55e 100px
            ),
            repeating-linear-gradient(
                0deg,
                transparent,
                transparent 50px,
                rgba(0,0,0,0.05) 50px,
                rgba(0,0,0,0.05) 100px
            )
        `,
        backgroundBlendMode: 'multiply',
        border: '3px solid rgba(255, 255, 255, 0.8)',
        boxSizing: 'border-box',
        overflow: 'hidden',
        pointerEvents: 'none',
        boxShadow: 'inset 0 0 80px rgba(0, 0, 0, 0.8)'
    };

    const lineStyle = {
        position: 'absolute',
        border: '2px solid rgba(255, 255, 255, 0.9)', // Crisp White Lines
        boxShadow: '0 0 10px rgba(255, 255, 255, 0.3)', // Slight bloom
        opacity: 0.9
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
                    backgroundColor: 'rgba(14, 165, 233, 0.05)'
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
                    backgroundColor: 'rgba(14, 165, 233, 0.05)'
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

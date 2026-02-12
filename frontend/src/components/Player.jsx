import React from 'react';

const Player = ({ player, onMouseDown, isSelected }) => {
  const { uid, id, team, role, x, y } = player;

  const isAttack = team === 'attack';

  // Pro Style: Blue vs Red
  const bg = isAttack ? '#3b82f6' : '#ef4444'; // Blue vs Red
  const text = '#fff';
  const border = isSelected ? '#fff' : 'rgba(255,255,255,0.8)';
  const glow = isAttack ? '0 0 10px #3b82f6' : '0 0 10px #ef4444';

  const style = {
    position: 'absolute',
    left: `${x}px`,
    top: `${y}px`,
    width: '36px',
    height: '36px',
    backgroundColor: 'rgba(2, 6, 23, 0.9)', // Dark background
    color: bg, // Text color matches team color
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transform: `translate(-50%, -50%) scale(${isSelected ? 1.2 : 1})`,
    userSelect: 'none',
    border: `2px solid ${bg}`, // Border is team color
    boxShadow: isSelected ? `0 0 20px ${bg}, inset 0 0 10px ${bg}` : `0 0 5px ${bg}`,
    zIndex: isSelected ? 100 : 10,
    fontSize: '12px',
    fontFamily: '"Rajdhani", sans-serif',
    fontWeight: '700',
    transition: 'all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
  };

  return (
    <div
      style={style}
      onMouseDown={(e) => onMouseDown(e, uid, 'player')}
    >
      {role}
      {/* Small ID indicator */}
      <span style={{ position: 'absolute', bottom: '-18px', fontSize: '9px', color: 'rgba(255,255,255,0.8)', textShadow: '0 1px 2px black', pointerEvents: 'none' }}>
        {id}
      </span>
    </div>
  );
};

export default Player;

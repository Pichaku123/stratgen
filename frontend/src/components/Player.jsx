import React from 'react';

const Player = ({ player, onMouseDown, isSelected }) => {
  const { uid, id, team, role, x, y } = player;

  const isAttack = team === 'attack';
  
  // ShareMyTactics Style (Kit Colors)
  // Attack = Red/White (Example) or User Blue, Defense = Yellow/Black
  // Let's stick to the Classic Red vs Blue or similar distinct kit colors
  
  const bg = isAttack ? '#e31b23' : '#ffd700'; // Red vs Yellow
  const text = isAttack ? '#fff' : '#000';
  const border = isSelected ? '#000' : '#fff'; // Black selection for visibility

  const style = {
    position: 'absolute',
    left: `${x}px`,
    top: `${y}px`,
    width: '34px',
    height: '34px',
    backgroundColor: bg,
    color: text,
    borderRadius: '50%', // Keeping circle as it's cleaner than CSS t-shirt hacks
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'grab',
    transform: `translate(-50%, -50%) scale(${isSelected ? 1.1 : 1})`,
    userSelect: 'none',
    border: `2px solid ${border}`,
    boxShadow: '0 2px 5px rgba(0,0,0,0.4)',
    zIndex: isSelected ? 100 : 10,
    fontSize: '12px',
    fontFamily: '"Open Sans", sans-serif',
    fontWeight: '800',
    transition: 'transform 0.1s ease'
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

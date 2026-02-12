import React from 'react';

const Ball = ({ x, y, onMouseDown }) => {
  const style = {
    position: 'absolute',
    left: `${x}px`,
    top: `${y}px`,
    width: '15px',
    height: '15px',
    backgroundColor: 'white',
    borderRadius: '50%',
    border: '1px solid black',
    cursor: 'grab',
    transform: 'translate(-50%, -50%)',
    zIndex: 20, 
  };

  return (
    <div
      style={style}
      onMouseDown={(e) => onMouseDown(e, 'ball', 'ball')}
    />
  );
};

export default Ball;

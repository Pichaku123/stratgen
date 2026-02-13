import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Pitch from './Pitch';
import Player from './Player';
import Ball from './Ball';
import { convertToStatsBomb360 } from '../utils/statsBombConverter';
import { generateBackendPayload } from '../utils/payloadGenerator';
import axios from 'axios';

// Initial state helpers
const INITIAL_WIDTH = 800;
const INITIAL_HEIGHT = 600;

const createInitialPlayers = () => {
  const players = [];
  // Helper to create unique IDs
  const uid = () => Math.random().toString(36).substr(2, 9);

  // Attackers (Blue) - 1-4-3-3 Formation approximation
  // GK
  players.push({ uid: uid(), id: 1, team: 'attack', role: 'GK', x: 50, y: 300 });
  // Defenders
  players.push({ uid: uid(), id: 2, team: 'attack', role: 'LB', x: 200, y: 100 });
  players.push({ uid: uid(), id: 3, team: 'attack', role: 'CB', x: 200, y: 250 });
  players.push({ uid: uid(), id: 4, team: 'attack', role: 'CB', x: 200, y: 350 });
  players.push({ uid: uid(), id: 5, team: 'attack', role: 'RB', x: 200, y: 500 });
  // Midfielders
  players.push({ uid: uid(), id: 6, team: 'attack', role: 'LM', x: 400, y: 150 });
  players.push({ uid: uid(), id: 7, team: 'attack', role: 'CM', x: 400, y: 300 });
  players.push({ uid: uid(), id: 8, team: 'attack', role: 'RM', x: 400, y: 450 });
  // Forwards
  players.push({ uid: uid(), id: 9, team: 'attack', role: 'LW', x: 600, y: 150 });
  players.push({ uid: uid(), id: 10, team: 'attack', role: 'ST', x: 600, y: 300 });
  players.push({ uid: uid(), id: 11, team: 'attack', role: 'RW', x: 600, y: 450 });

  // Defenders (Yellow) - 1-4-4-2 Formation approximation
  // GK
  players.push({ uid: uid(), id: 12, team: 'defense', role: 'GK', x: 750, y: 300 });
  // Defenders
  players.push({ uid: uid(), id: 13, team: 'defense', role: 'RB', x: 650, y: 100 });
  players.push({ uid: uid(), id: 14, team: 'defense', role: 'CB', x: 650, y: 250 });
  players.push({ uid: uid(), id: 15, team: 'defense', role: 'CB', x: 650, y: 350 });
  players.push({ uid: uid(), id: 16, team: 'defense', role: 'LB', x: 650, y: 500 });
  // Midfielders
  players.push({ uid: uid(), id: 17, team: 'defense', role: 'RM', x: 500, y: 100 });
  players.push({ uid: uid(), id: 18, team: 'defense', role: 'CM', x: 500, y: 250 });
  players.push({ uid: uid(), id: 19, team: 'defense', role: 'CM', x: 500, y: 350 });
  players.push({ uid: uid(), id: 20, team: 'defense', role: 'LM', x: 500, y: 500 });
  // Forwards
  players.push({ uid: uid(), id: 21, team: 'defense', role: 'ST', x: 350, y: 250 });
  players.push({ uid: uid(), id: 22, team: 'defense', role: 'ST', x: 350, y: 350 });

  return players;
};

const TacticsBoard = () => {
  const [players, setPlayers] = useState(createInitialPlayers());
  const [ball, setBall] = useState({ x: 400, y: 300 });
  const [dragState, setDragState] = useState(null);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [hasMoved, setHasMoved] = useState(false);
  const [evaluationResult, setEvaluationResult] = useState(null);
  const [ghostPlayers, setGhostPlayers] = useState([]);
  const boardRef = useRef(null);

  const handleMouseDown = (e, identifier, type) => {
    e.stopPropagation();
    // identifier is uid for player, or 'ball' for ball (or maybe ignored if type is ball)
    // Actually Ball passes 'ball' as ID.
    const entity = type === 'player' ? players.find(p => p.uid === identifier) : ball;

    setDragState({
      id: identifier, // This is now UID for players
      type,
      startMouseX: e.clientX,
      startMouseY: e.clientY,
      initialX: entity.x,
      initialY: entity.y
    });
    setHasMoved(false);
  };

  const handleMouseMove = (e) => {
    if (!dragState) return;

    const dx = e.clientX - dragState.startMouseX;
    const dy = e.clientY - dragState.startMouseY;

    if (Math.abs(dx) > 2 || Math.abs(dy) > 2) {
      setHasMoved(true);
    }

    // Constrain to board dimensions
    const newX = Math.max(0, Math.min(INITIAL_WIDTH, dragState.initialX + dx));
    const newY = Math.max(0, Math.min(INITIAL_HEIGHT, dragState.initialY + dy));

    if (dragState.type === 'player') {
      setPlayers(prev => prev.map(p =>
        p.uid === dragState.id ? { ...p, x: newX, y: newY } : p
      ));
    } else {
      setBall({ x: newX, y: newY });
    }
  };

  const handleMouseUp = () => {
    if (!dragState) return;

    if (!hasMoved && dragState.type === 'player') {
      const player = players.find(p => p.uid === dragState.id);
      setSelectedPlayer(player);
    } else if (!hasMoved && dragState.type === 'ball') {
      setSelectedPlayer(null); // Deselect if ball clicked
    }

    setDragState(null);
    setHasMoved(false);
  };


  const updatePlayerAttribute = (key, value) => {
    if (!selectedPlayer) return;
    const updated = { ...selectedPlayer, [key]: value };

    // Update proper number type for ID if needed
    if (key === 'id') updated.id = parseInt(value) || value;

    // Use UID to find and update the player, so changing ID doesn't break referencing
    setPlayers(prev => prev.map(p => p.uid === selectedPlayer.uid ? updated : p));
    setSelectedPlayer(updated);
  };

  const getTeamCounts = () => {
    const attack = players.filter(p => p.team === 'attack').length;
    const defense = players.filter(p => p.team === 'defense').length;
    return { attack, defense };
  };

  const { attack, defense } = getTeamCounts();



  // ... (rest of imports)

  // ... (inside TacticsBoard component)

  const handleEvaluate = async () => {
    // Validate before sending
    if (attack > 11 || defense > 11) {
      alert("Teams cannot have more than 11 players each!");
      return;
    }

    // Scale to Recquested Pitch Size (120x80)
    // Board is 800x600 (INITIAL_WIDTH x INITIAL_HEIGHT)
    const PITCH_LENGTH = 120;
    const PITCH_WIDTH = 80;

    const scaleX = PITCH_LENGTH / INITIAL_WIDTH;
    const scaleY = PITCH_WIDTH / INITIAL_HEIGHT;

    const scaledPlayers = players.map(p => ({
      ...p,
      x: p.x * scaleX,
      y: p.y * scaleY
    }));

    const scaledBall = {
      x: ball.x * scaleX,
      y: ball.y * scaleY
    };

    // Prepare modifications tracking (example: if selectedPlayer exists, assume it was just modified)
    const modifications = {
      draggedNodes: selectedPlayer ? [`p_${selectedPlayer.uid}`] : []
    };

    const payload = generateBackendPayload(scaledPlayers, scaledBall, modifications);

    console.log("%c Generated Payload ", "background: #222; color: #bada55; font-size:14px; padding:4px;");
    console.log(JSON.stringify(payload, null, 2));
    alert("Payload generated! Check Console (F12).");

    // API Call restored
    try {
      const response = await axios.post('http://localhost:8000/evaluate-formation', payload);
      const prob = response.data.score;
      const percent = (prob * 100).toFixed(2);

      let interpretation = "Uncertain";
      if (prob > 0.6) interpretation = "High chance of a SHOT";
      else if (prob > 0.4) interpretation = "Likely a PASS / Build-up";
      else interpretation = "Low scoring opportunity";

      // Set state for modal instead of alert
      setEvaluationResult({
        message: response.data.message,
        prediction: interpretation,
        probability: prob.toFixed(4),
        percent: percent
      });

      console.log("API Response:", response.data);
      // Process Ghost Players (Optimal Attacker Positions)
      if (response.data.optimal_placements) {
        const optimal = response.data.optimal_placements.map((pos, index) => ({
          uid: `ghost_${index}`,
          id: `G${index}`,
          originalId: pos.id, // Capture original ID for arrow mapping
          team: 'ghost', // Special team for styling
          role: 'Op',
          x: pos.x / scaleX, // Scale back to board dimensions
          y: pos.y / scaleY
        }));
        console.log("Calculated Ghosts:", optimal);
        setGhostPlayers(optimal);
      } else {
        setGhostPlayers([]);
      }

    } catch (error) {
      console.error("API Error", error);
      alert("Error connecting to backend");
    }
  };

  return (
    <div className="layout-wrapper">

      <div className="tactics-container">

        <div
          ref={boardRef}
          className="board"
          style={{
            width: `${INITIAL_WIDTH}px`,
            height: `${INITIAL_HEIGHT}px`,
            position: 'relative',
            backgroundColor: '#1e2025',
            userSelect: 'none'
          }}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={() => setDragState(null)}
        >
          <Pitch />

          {/* Arrows Connecting Players to Ghosts */}
          <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 0 }}>
            <defs>
              <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                <polygon points="0 0, 10 3.5, 0 7" fill="#00cc6a" opacity="0.8" />
              </marker>
            </defs>
            {ghostPlayers.map(ghost => {
              if (!ghost.originalId) return null;
              // Robust ID matching: handle 'p_' prefix and string/number types
              const originalUid = ghost.originalId.replace('p_', '');
              const original = players.find(p => String(p.uid) === originalUid);

              if (!original) return null;

              return (
                <line
                  key={`arrow_${ghost.uid}`}
                  x1={original.x}
                  y1={original.y}
                  x2={ghost.x}
                  y2={ghost.y}
                  stroke="#00cc6a"
                  strokeWidth="2"
                  strokeDasharray="5,5"
                  opacity="0.6"
                  markerEnd="url(#arrowhead)"
                />
              );
            })}
          </svg>

          {ghostPlayers.map(p => (
            <div
              key={p.uid}
              className="player ghost"
              style={{
                position: 'absolute',
                left: p.x,
                top: p.y,
                transform: 'translate(-50%, -50%)',
                pointerEvents: 'none',
                opacity: 0.8, // Overall opacity
                zIndex: 1,
                width: '34px',
                height: '34px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'rgba(227, 27, 35, 0.5)', // Faded Red (Attacker Color)
                border: '2px solid rgba(255, 255, 255, 0.6)', // Faded White Border
                boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
              }}
            >
              <span className="player-role" style={{ fontSize: '10px', color: 'white', fontWeight: 'bold' }}>{p.role}</span>
            </div>
          ))}
          {players.map(p => (
            <Player
              key={p.uid}
              player={p}
              onMouseDown={handleMouseDown}
              isSelected={selectedPlayer && selectedPlayer.uid === p.uid}
            />
          ))}
          <Ball x={ball.x} y={ball.y} onMouseDown={handleMouseDown} />
        </div>

        <div className="sidebar">
          <button onClick={handleEvaluate} style={{ marginBottom: '24px' }}>
            Evaluate Formation
          </button>

          <div className="stats-panel">
            <div className="stat-item">
              <div className="stat-label">Attackers</div>
              <div className="stat-value" style={{ color: '#ef4444' }}>
                {attack}
              </div>
            </div>
            <div className="stat-item">
              <div className="stat-label">Defenders</div>
              <div className="stat-value" style={{ color: '#facc15' }}>
                {defense}
              </div>
            </div>
          </div>

          <div className="sidebar-divider"></div>

          {selectedPlayer ? (
            <div className="player-editor">
              <h3>Edit Player</h3>
              <div className="form-group">
                <label>Jersey Number</label>
                <input
                  type="number"
                  value={selectedPlayer.id}
                  onChange={(e) => updatePlayerAttribute('id', e.target.value)}
                  placeholder="e.g. 10"
                />
              </div>
              <div className="form-group">
                <label>Role / Position</label>
                <input
                  type="text"
                  value={selectedPlayer.role}
                  onChange={(e) => updatePlayerAttribute('role', e.target.value)}
                  placeholder="e.g. ST"
                />
              </div>
              <button className="secondary-btn" onClick={() => setSelectedPlayer(null)}>
                Done
              </button>
            </div>
          ) : (
            <div style={{ color: 'var(--text-secondary)', textAlign: 'center', marginTop: '40px', fontSize: '0.9rem' }}>
              Select a player on the board to edit attributes
            </div>
          )}
        </div>

      </div>
      {/* Evaluation Modal - Using Portal to ensure centering */}
      {evaluationResult && createPortal(
        <div className="modal-overlay" onClick={() => setEvaluationResult(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">Evaluation Result</div>
            <div className="modal-body">
              <div className="prediction-text">{evaluationResult.prediction}</div>
              <div className="probability-score">{evaluationResult.percent}%</div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                Probability: {evaluationResult.probability}
              </div>
            </div>
            <button className="modal-close-btn" onClick={() => setEvaluationResult(null)}>
              Close
            </button>
          </div>
        </div>,
        document.body
      )}

    </div>
  );
};

export default TacticsBoard;

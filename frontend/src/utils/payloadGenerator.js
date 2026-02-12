import { calculateDistance } from './geometry';

export const generateBackendPayload = (players, ball, modifications = {}) => {
  // Constants from requirements
  const PITCH_LENGTH = 120;
  const PITCH_WIDTH = 80;
  
  // Identify Actor (closest to ball)
  let minDist = Infinity;
  let actorUid = null;

  players.forEach(p => {
      const d = calculateDistance(p, ball);
      if (d < minDist) {
          minDist = d;
          actorUid = p.uid;
      }
  });

  // Map Players to Graph Nodes
  const graph_nodes = players.map(p => {
    const isActor = p.uid === actorUid;
    const isAttacker = p.team === 'attack';
    
    let features;
    if (isAttacker) {
      features = {
        player_id: parseInt(p.id) || 0,
        role_id: 0, // Placeholder
        jersey: String(p.id),
        marking_intensity: 0.0 // Placeholder
      };
    } else {
      features = {
        is_keeper: p.role === 'GK',
        pressure_applied: 0.0 // Placeholder
      };
    }

    return {
      id: `p_${p.uid}`, // Stable ID
      type: isAttacker ? "attacker" : "defender",
      is_actor: isActor,
      position: {
        x: parseFloat(p.x.toFixed(2)),
        y: parseFloat(p.y.toFixed(2))
      },
      features: features
    };
  });

  const obj = {
    metadata: {
      session_id: "5d14bae0-f462-491c-9fc2-e55faec97743", // Static for now or gen new UUID
      pitch_length: PITCH_LENGTH,
      pitch_width: PITCH_WIDTH,
      set_piece_type: "corner_kick",
      attacking_team_id: 217
    },
    tactical_context: {
      formation: "442",
      possession_phase: "attacking_set_piece"
    },
    graph_nodes: graph_nodes,
    user_modifications: {
      dragged_nodes: modifications.draggedNodes || [], // Array of IDs
      target_zone: modifications.targetZone || { x_min: 75, x_max: 85, y_min: 35, y_max: 45 }
    }
    };
    console.log(obj);
    return obj;
};

import { calculateDistance, calculateAngle, findNearestNeighbor } from './geometry';

export const buildGraphPayload = (players, ball, pitchSize = [105, 68]) => {
  const nodes = players.map(player => {
    // Find nearest opponent
    const opponents = players.filter(p => p.team !== player.team);
    const { nearest, distance } = findNearestNeighbor(player, opponents);
    
    // Goal stats (Assuming attacking right -> goal at x=105, y=34)
    // If team is defense, maybe they defend left? simplified: goal is always (105, 34) for now or based on team.
    // Let's assume standard statsbomb: attacking team shoots at 105, 34.
    const goalPos = { x: 105, y: 34 };
    const distToGoal = calculateDistance(player, goalPos);
    const angleToGoal = calculateAngle(player, goalPos);

    return {
      id: player.id,
      team: player.team,
      role: player.role,
      position: { x: player.x, y: player.y },
      goal_stats: {
        distance: distToGoal,
        angle: angleToGoal
      },
      context: {
        nearest_opponent_id: nearest ? nearest.id : null,
        nearest_opponent_distance: nearest ? distance : null
      }
    };
  });

  // Also add Ball as a node? Or just metadata? 
  // User input example didn't show ball in nodes, but usually ball is key. 
  // User example:
  /*
  "nodes": [ { id: 1, team: "attack", ... } ]
  */
  // I will include ball if it has an ID, or maybe just players. User said "send its coordinates".
  // I'll add ball as a special node or in metadata if needed. For now component structure implies ball is separate.
  // I'll stick to players for nodes as per example. Ball might be passed in context or separate field if requested.
  // User asked "just make a draggable ball, we just wanna send its coordinates".
  // So I should add ball to the payload. I'll add it to metadata or as a node.
  // I'll add it to specific "ball" field in payload.

  const edges = [];
  // Simple edge generation: Connect every player to their nearest teammate and nearest opponent
  players.forEach(player => {
    // Edge to nearest teammate
    const teammates = players.filter(p => p.team === player.team && p.id !== player.id);
    const { nearest: nearestTeammate } = findNearestNeighbor(player, teammates);
    if (nearestTeammate) {
      edges.push({
        source: player.id,
        target: nearestTeammate.id,
        features: {
          distance: calculateDistance(player, nearestTeammate),
          relative_angle: calculateAngle(player, nearestTeammate),
          is_teammate: true
        }
      });
    }

    // Edge to nearest opponent
    const opponents = players.filter(p => p.team !== player.team);
    const { nearest: nearestOpponent } = findNearestNeighbor(player, opponents);
    if (nearestOpponent) {
      edges.push({
        source: player.id,
        target: nearestOpponent.id,
        features: {
          distance: calculateDistance(player, nearestOpponent),
          relative_angle: calculateAngle(player, nearestOpponent),
          is_teammate: false
        }
      });
    }
  });

  return {
    layout_id: "interactive_v1",
    metadata: {
      pitch_size: pitchSize,
      unit: "meters",
      ball_position: { x: ball.x, y: ball.y }
    },
    nodes: nodes,
    edges: edges
  };
};

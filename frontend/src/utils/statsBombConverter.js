import { calculateDistance } from './geometry';

export const generateUUID = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
};

export const convertToStatsBomb360 = (players, ball) => {
    // 1. Identify the "Actor" (Player closest to the ball)
    let minDist = Infinity;
    let actorIdentifier = null;

    players.forEach(p => {
        const d = calculateDistance(p, ball);
        if (d < minDist) {
            minDist = d;
            // Use uid if available for unique identification, else id
            actorIdentifier = p.uid || p.id;
        }
    });

    // 2. Build Freeze Frame
    const freeze_frame = players.map(p => {
        const currentIdentifier = p.uid || p.id;
        return {
            teammate: p.team === 'attack', // Assuming 'attack' team has possession/perspective
            actor: currentIdentifier === actorIdentifier,
            keeper: p.role === 'GK',
            location: [p.x, p.y] // [x, y] format
        };
    });

    // 3. Construct Final Object
    return {
        event_uuid: generateUUID(),
        visible_area: [0, 0, 105, 0, 105, 68, 0, 68, 0, 0], // Full pitch 105x68 approx
        freeze_frame: freeze_frame
    };
};

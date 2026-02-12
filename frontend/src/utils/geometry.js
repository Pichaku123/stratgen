
export const calculateDistance = (p1, p2) => {
  return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
};

export const calculateAngle = (p1, p2) => {
  return Math.atan2(p2.y - p1.y, p2.x - p1.x) * (180 / Math.PI);
};

export const findNearestNeighbor = (target, entities, typeFilter = null) => {
  let minDistance = Infinity;
  let nearest = null;

  entities.forEach(entity => {
    if (entity.id === target.id) return;
    if (typeFilter && entity.team !== typeFilter) return;

    const d = calculateDistance(target, entity);
    if (d < minDistance) {
      minDistance = d;
      nearest = entity;
    }
  });
  return { nearest, distance: minDistance };
};

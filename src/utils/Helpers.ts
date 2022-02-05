export function randomIndex(length: number) {
  return Math.floor(Math.random() * length);
}

export function getPointsAroundPoint(x: number, y: number, room: Room): LookAtResultWithPos<LookConstant>[] {
  return room.lookAtArea(y + 1, x + 1, y - 1, y - 1, true);
}

export function getAvailableSourcePlaces(source: Source) {
  const points = getPointsAroundPoint(source.pos.x, source.pos.y, source.room);
  return points.filter(point => point.type === "terrain" && point.terrain === "plain");
}

export function randomIndex(length: number) {
  return Math.floor(Math.random() * length);
}

export function getObjectsAroundPosition(
  x: number,
  y: number,
  room: Room
): { x: number; y: number; objects: LookAtResult<LookConstant>[] }[] {
  const positions: { x: number; y: number }[] = [];
  for (let px = x - 1; px <= x + 1; px++) {
    for (let py = y - 1; py <= y + 1; py++) {
      positions.push({ x: px, y: py });
    }
  }

  return positions.map(pos => ({
    x: pos.x,
    y: pos.y,
    objects: room.lookAt(pos.x, pos.y)
  }));
}

export function getAvailableSourcePlaces(source: Source): { x: number; y: number }[] {
  const positions = getObjectsAroundPosition(source.pos.x, source.pos.y, source.room);
  return positions
    .filter(position => {
      return (
        position.objects.findIndex(object => {
          return !(
            (object.type === "terrain" && object.terrain === "plain") ||
            (object.type === "structure" && object.structure && object.structure.structureType === "road") ||
            object.type === "constructionSite" ||
            object.creep
          );
        }) === -1
      );
    })
    .map(position => ({ x: position.x, y: position.y }));
}

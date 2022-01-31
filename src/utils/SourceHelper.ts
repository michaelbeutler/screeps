export const getSources = (roomID: string) => {
  return Game.rooms[roomID].find<104, Source>(FIND_SOURCES_ACTIVE);
};

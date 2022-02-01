export default abstract class Role<T> {
  creep: Creep;
  room: Room;

  constructor(creep: Creep & { memory: T }) {
    this.creep = creep;
    this.room = creep.room;
  }

  public work() {
    throw new Error("Not implemented yet.");
  }
  public static spawn(spawn: StructureSpawn) {
    throw new Error("Not implemented yet.");
  }
  public static getBodyParts(stage: number) {
    throw new Error("Not implemented yet.");
  }
}

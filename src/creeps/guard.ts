import Role from "./role";

export type GuardMemory = CreepMemory & { spawnId: string; direction: DirectionConstant };

class Guard extends Role<GuardMemory> {
  creep: Creep;
  spawn: StructureSpawn | null;
  room: Room;
  direction: DirectionConstant;

  constructor(creep: Creep & { memory: GuardMemory }) {
    super(creep);
    this.creep = creep;
    this.spawn = Game.getObjectById(creep.memory.spawnId);
    this.room = creep.room;
    this.direction = creep.memory.direction;
  }

  static getBodyParts(stage: number) {
    switch (stage) {
      case 1:
        return [CARRY, MOVE, WORK];
      case 2:
        return [CARRY, CARRY, MOVE, WORK];

      default:
        return [CARRY, MOVE, WORK];
    }
  }

  static spawn(spawn: StructureSpawn) {
    const name = `guard${Memory.creepIndex}`;
    const spawnCreep = spawn.spawnCreep(Guard.getBodyParts(Memory.stage), name, {
      memory: {
        role: "guard",
        room: spawn.room.name,
        working: false
      }
    });

    switch (spawnCreep) {
      case OK:
        Memory.creepIndex++;
        (Game.creeps[name].memory as GuardMemory).spawnId = spawn.id;
        (Game.creeps[name].memory as GuardMemory).direction = TOP;
        console.log(`Successfully spawned ${name}.`);
        return;
      case ERR_NOT_ENOUGH_ENERGY:
        console.log(`Not enough energy for spawning creep.`);
        return;

      default:
        console.log(`Unable to spawn ${name}! (${spawnCreep.toLocaleString()})`);
        break;
    }
  }

  work() {
    if (!this.spawn || this.spawn === null) {
      console.warn(`${this.creep.name} is unable to work due to missing spawn.`);
      return;
    }


    const newPosition = PathFinder.search(this.creep.pos, )
    const move = this.creep.moveTo(this.direction, {maxRooms:1});
    switch (move) {
      case OK:
        return;
      case ERR_NO_BODYPART:
        switch (this.direction) {
          case TOP:
            this.direction = RIGHT;
            break;
          case RIGHT:
            this.direction = BOTTOM;
            break;
          case BOTTOM:
            this.direction = LEFT;
            break;
          case LEFT:
            this.direction = TOP;
            break;
          default:
            this.direction = TOP;
            break;
        }
        return;

      case ERR_TIRED:
        this.creep.say("I'm tired!");
        return;

      default:
        break;
    }
  }
}

export default Guard;

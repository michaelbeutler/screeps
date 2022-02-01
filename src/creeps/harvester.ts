export type HarvesterMemory = CreepMemory & { sourceId: string; spawnId: string };

class Harvester {
  creep: Creep;
  source: Source | null;
  spawn: StructureSpawn | null;

  constructor(creep: Creep & { memory: HarvesterMemory }) {
    this.creep = creep;
    this.source = Game.getObjectById(creep.memory.sourceId);
    this.spawn = Game.getObjectById(creep.memory.spawnId);
  }

  static index = 0;

  static getBodyParts(stage: number) {
    switch (stage) {
      case 1:
        return [CARRY, MOVE, WORK];

      default:
        return [CARRY, MOVE, WORK];
    }
  }

  static spawn(spawn: StructureSpawn, stage: number) {
    const name = `harvester${this.index}`;
    const spawnCreep = spawn.spawnCreep(Harvester.getBodyParts(stage), name, {
      memory: {
        role: "harvester",
        room: spawn.room.name,
        working: false
      }
    });

    if (spawnCreep === OK) {
      (Game.creeps[name].memory as HarvesterMemory).sourceId = spawn.room.find(FIND_SOURCES_ACTIVE)[0].id;
      (Game.creeps[name].memory as HarvesterMemory).spawnId = spawn.id;
      console.log(`Successfully spawned ${name}.`);
      return;
    }

    console.log(`Unable to spawn ${name}! (${spawnCreep.toLocaleString()})`);
  }

  work() {
    if (!this.source || this.source === null) {
      console.warn(`${this.creep.name} is unable to work due to missing source.`);
      return;
    }
    if (!this.spawn || this.spawn === null) {
      console.warn(`${this.creep.name} is unable to work due to missing spawn.`);
      return;
    }

    // Check if creep can't carry more energy
    if (this.creep.store.energy >= this.creep.store.getCapacity(RESOURCE_ENERGY)) {
      const transfer = this.creep.transfer(this.spawn, RESOURCE_ENERGY);
      switch (transfer) {
        case ERR_NOT_IN_RANGE:
          this.creep.moveTo(this.spawn);
          break;

        default:
          this.creep.say(transfer.toLocaleString());
          break;
      }
    }

    const harvest = this.creep.harvest(this.source);
    switch (harvest) {
      case OK:
        break;

      case ERR_NOT_IN_RANGE:
        this.creep.moveTo(this.source);
        break;

      case ERR_NOT_ENOUGH_ENERGY:
        this.creep.moveTo(this.spawn.pos);
        break;

      default:
        break;
    }
  }
}

export default Harvester;

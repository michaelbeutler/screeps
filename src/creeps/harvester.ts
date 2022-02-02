import { randomIndex } from "utils/Helpers";
import Role from "./role";

export type HarvesterMemory = CreepMemory & { sourceId: string; spawnId: string };

class Harvester extends Role<HarvesterMemory> {
  creep: Creep;
  source: Source | null;
  spawn: StructureSpawn | null;
  room: Room;

  constructor(creep: Creep & { memory: HarvesterMemory }) {
    super(creep);
    this.creep = creep;
    this.source = Game.getObjectById(creep.memory.sourceId);
    this.spawn = Game.getObjectById(creep.memory.spawnId);
    this.room = creep.room;
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
    const name = `harvester${Memory.creepIndex}`;
    const spawnCreep = spawn.spawnCreep(Harvester.getBodyParts(Memory.stage), name, {
      memory: {
        role: "harvester",
        room: spawn.room.name,
        working: false
      }
    });

    switch (spawnCreep) {
      case OK:
        Memory.creepIndex++;
        const sources = spawn.room.find(FIND_SOURCES_ACTIVE);
        (Game.creeps[name].memory as HarvesterMemory).sourceId = sources[randomIndex(sources.length)].id;
        (Game.creeps[name].memory as HarvesterMemory).spawnId = spawn.id;
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
    if (!this.source || this.source === null) {
      console.warn(`${this.creep.name} is unable to work due to missing source.`);
      return;
    }
    if (!this.spawn || this.spawn === null) {
      console.warn(`${this.creep.name} is unable to work due to missing spawn.`);
      return;
    }

    // Check if creep can't carry more energy
    if (this.creep.carry.energy >= this.creep.carryCapacity) {
      if (this.spawn.energy >= this.spawn.energyCapacity) {
        const controller = this.room.controller;
        if (!controller) {
          return;
        }

        const transfer = this.creep.upgradeController(controller);
        switch (transfer) {
          case OK:
            return;

          case ERR_NOT_IN_RANGE:
            this.creep.moveTo(controller);
            return;

          default:
            this.creep.say(transfer.toLocaleString());
            return;
        }
      }

      const transfer = this.creep.transfer(this.spawn, RESOURCE_ENERGY);
      switch (transfer) {
        case OK:
          return;

        case ERR_NOT_IN_RANGE:
          this.creep.moveTo(this.spawn);
          return;

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

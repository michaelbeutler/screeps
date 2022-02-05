import Harvester, { HarvesterMemory } from "creeps/Harvester";
import { ErrorMapper } from "utils/ErrorMapper";
import { getAvailableSourcePlaces } from "utils/Helpers";
import Population from "utils/Population";

declare global {
  /*
    Example types, expand on these or remove them and add your own.
    Note: Values, properties defined here do no fully *exist* by this type definiton alone.
          You must also give them an implemention if you would like to use them. (ex. actually setting a `role` property in a Creeps memory)

    Types added in this `global` block are in an ambient, global context. This is needed because `main.ts` is a module file (uses import or export).
    Interfaces matching on name from @types/screeps will be merged. This is how you can extend the 'built-in' interfaces from @types/screeps.
  */
  // Memory extension samples
  interface Memory {
    uuid: number;
    log: any;
    creepIndex: number;
    stage: number;
  }

  interface CreepMemory {
    role: ROLE;
    room: string;
    working: boolean;
  }

  // Syntax for adding proprties to `global` (ex "global.log")
  namespace NodeJS {
    interface Global {
      log: any;
    }
  }
}

export type ROLE = "harvester" | "guard";

// When compiling TS to JS and bundling with rollup, the line numbers and file names in error messages change
// This utility uses source maps to get the line numbers and file names of the original, TS source code
export const loop = ErrorMapper.wrapLoop(() => {
  console.log(`Current game tick is ${Game.time}; Stage: ${Memory.stage}`);

  // Automatically delete memory of missing creeps
  for (const name in Memory.creeps) {
    if (!(name in Game.creeps)) {
      delete Memory.creeps[name];
    }
  }

  if (!Memory.creepIndex) {
    Memory.creepIndex = 0;
  }
  if (!Memory.stage) {
    Memory.stage = 1;
  }

  let count = 0;
  for (const creepName in Game.creeps) {
    if (Object.prototype.hasOwnProperty.call(Game.creeps, creepName)) {
      count++;
      const creep = Game.creeps[creepName];
      switch (creep.memory.role) {
        case "harvester":
          new Harvester(creep as Creep & { memory: HarvesterMemory }).work();
          break;

        default:
          break;
      }
    }
  }

  Population.tick();
  switch (Memory.stage) {
    case 1:
      Population.set("harvester", 3);
      if (Population.getEffective("harvester") >= 3) {
        Memory.stage = 2;
      }
      return;
    case 2:
      Population.set("harvester", 4);
      if (Population.getEffective("harvester") < 3) {
        Memory.stage = 1;
      }
      if (Population.getEffective("harvester") >= 3) {
        Memory.stage = 3;
      }
      return;
    case 3:
      let places = 0;
      Population.spawn.room.find(FIND_SOURCES_ACTIVE).forEach(source => {
        places += getAvailableSourcePlaces(source).length;
      });

      Population.set("harvester", places);
      if (Population.getEffective("harvester") > 3) {
        for (const creepName in Game.creeps) {
          if (Object.prototype.hasOwnProperty.call(Game.creeps, creepName)) {
            const creep = Game.creeps[creepName];
            if (
              creep.memory.role === "harvester" &&
              creep.body.length < Harvester.getBodyParts(3).length &&
              Population.spawn.energy >= Population.spawn.energyCapacity
            ) {
              creep.suicide();
            }
          }
        }
      }
      return;

    default:
      Population.set("harvester", 3);
      return;
  }
});

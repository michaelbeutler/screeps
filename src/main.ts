import Harvester, { HarvesterMemory, ROLE_HARVESTER } from "creeps/Harvester";
import { ErrorMapper } from "utils/ErrorMapper";
import Population, { Role } from "utils/Population";
import { getSources } from "utils/SourceHelper";

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
    role: Role;
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

// When compiling TS to JS and bundling with rollup, the line numbers and file names in error messages change
// This utility uses source maps to get the line numbers and file names of the original, TS source code
export const loop = ErrorMapper.wrapLoop(() => {
  console.log(`Current game tick is ${Game.time}`);
  for (const roomId in Game.rooms) {
    if (Object.prototype.hasOwnProperty.call(Game.rooms, roomId)) {
      const room = Game.rooms[roomId];
      console.log(`Active sources in room ${room.name}: ${getSources(room.name).length}`);
    }
  }

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
        case ROLE_HARVESTER:
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
      Population.set(ROLE_HARVESTER, 3);
      if (Population.get(ROLE_HARVESTER) >= 3) {
        Memory.stage = 2;
      }
      return;
    case 2:
      Population.set(ROLE_HARVESTER, 5);
      if (Population.get(ROLE_HARVESTER) < 3) {
        Memory.stage = 1;
      }
      if (Population.get(ROLE_HARVESTER) >= 5) {
        Memory.stage = 3;
      }
      return;
    case 3:
      Population.set(ROLE_HARVESTER, 10);
      if (Population.get(ROLE_HARVESTER) < 5) {
        Memory.stage = 2;
      }
      return;

    default:
      Memory.stage = 1;
      Population.set(ROLE_HARVESTER, 3);
      return;
  }
});

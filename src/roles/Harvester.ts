import { getSources } from "utils/SourceHelper";

export const tick = (creep: Creep) => {
  // If the creep is not assigned a source, assign it one
  if (creep.memory.roleSpecific.source === undefined) {
    creep.memory.roleSpecific.source = getSources(creep.room.name)[0].id;
  }

  // Get the source from memory
  const source = Game.getObjectById<Source>(creep.memory.roleSpecific.source);

  // If the source is not found, remove it from memory
  if (source === null) {
    console.warn(`${creep.name} has a source assigned, but it is not found. Removing source from creep memory.`);
    delete creep.memory.roleSpecific.source;
    return;
  }

  // If the creep is not carrying energy, move to the source and harvest it
  if (creep.memory.status === "working") {
    // Check if the creep is full
    if (creep.store.getFreeCapacity() === 0) {
      creep.memory.status = "upgrading";
      return;
    }

    switch (creep.harvest(source)) {
      case ERR_NOT_IN_RANGE:
        creep.moveTo(source);
        break;
      case ERR_NOT_ENOUGH_RESOURCES:
        console.warn(`${creep.name} has a source assigned, but it is empty. Removing source from creep memory.`);
        delete creep.memory.roleSpecific.source;
        break;
      default:
        break;
    }
  } else if (creep.memory.status === "upgrading") {
    if (creep.store.getFreeCapacity() === creep.store.getCapacity()) {
      creep.memory.status = "working";
      return;
    }

    // If the creep is carrying energy, move to the spawn and transfer it
    switch (creep.transfer(Game.spawns[creep.memory.spawnId], RESOURCE_ENERGY)) {
      case ERR_NOT_IN_RANGE:
        creep.moveTo(Game.spawns[creep.memory.spawnId]);
        break;
    }
  } else {
    // If the creep is not working or upgrading, set it to working
    creep.memory.status = "working";
  }
};

import { ROLE, getBlueprint, Blueprint } from "./Roles";

export type PopulationConfig = {
  [role: ROLE | string]: {
    current: number;
    desired: number;
    difference: number;
  };
};

export const tick = (population: PopulationConfig) => {
  // Iterate over all keys in the population object
  for (const role in population) {
    // Get the current number of creeps with the role
    const current = _.filter(Game.creeps, creep => creep.memory.role === role).length;
    // Get the desired number of creeps with the role
    const desired = population[role].desired;
    // Calculate the difference between the current and desired number of creeps
    const difference = desired - current;
    // Update the population object with the current, desired, and difference
    population[role] = {
      current,
      desired,
      difference
    };

    // If the difference is positive, spawn a new creep
    if (difference > 0) {
      // Get the blueprint for the role
      const blueprint = getBlueprint(role as ROLE);

      // Find a spawn with enough energy to spawn the creep
      const spawn = findSpawnWithEnoughEnergy(blueprint);
      if (spawn === false) {
        console.log("No spawn found with enough energy to spawn creep.");
        return;
      }

      // Get the name of the new creep
      const newName = `${role}-${Game.time}`;
      // Spawn the creep
      spawn.spawnCreep(blueprint.body, newName, {
        memory: { ...blueprint.memory, spawnId: spawn.name }
      });
    }
  }
};

export const getTotalBodyCost = (body: BodyPartConstant[]): number => {
  let total = 0;
  for (const part of body) {
    total += BODYPART_COST[part];
  }
  return total;
}

export const findSpawnWithEnoughEnergy = (blueprint: Blueprint): StructureSpawn | false => {
  const spawns = Object.values(Game.spawns);
  for (const spawn of spawns) {
    if (spawn.store.getUsedCapacity(RESOURCE_ENERGY) >= getTotalBodyCost(blueprint.body)) {
      return spawn;
    }
  }
  return false;
};

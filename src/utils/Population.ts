import Harvester, { ROLE_HARVESTER } from "creeps/Harvester";

export type Role = ROLE_HARVESTER;

export default class Population {
  static population: { [key: string | Role]: number };
  static spawn: StructureSpawn = Game.spawns["spawn0"];

  static tick() {
    const currentPopulation: { [key: string | Role]: number } = {};
    for (const creepName in Game.creeps) {
      if (Object.prototype.hasOwnProperty.call(Game.creeps, creepName)) {
        const creep = Game.creeps[creepName];
        currentPopulation[creep.memory.role] += 1;
      }
    }

    for (const role in Population.population) {
      if (Object.prototype.hasOwnProperty.call(Population.population, role)) {
        const requiredPopulation = Population.population[role];
        if (requiredPopulation === currentPopulation[role]) {
          continue;
        }

        if (requiredPopulation <= currentPopulation[role]) {
          // Just let them die and do not regenerate
          continue;
        }

        if (requiredPopulation > currentPopulation[role]) {
          switch (role) {
            case ROLE_HARVESTER:
                Harvester.spawn(Population.spawn);
              break;

            default:
              break;
          }
        }
      }
    }
  }

  public static increase(role: Role, amount: number = 1) {
    Population.population = Object.assign({}, Population.population, {
      [role]: Population.population[role] + amount
    });
  }

  public static decrease(role: Role, amount: number = 1) {
    Population.population = Object.assign({}, Population.population, {
      [role]: Population.population[role] - amount
    });
  }

  public static set(role: Role, amount: number = 1) {
    Population.population = Object.assign({}, Population.population, {
      [role]: amount
    });
  }

  public static get(role?: Role) {
    if (!role) {
      return Population.population;
    }
    return Population.population[role];
  }
}

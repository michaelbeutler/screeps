import Harvester from "creeps/Harvester";
import { ROLE } from "main";

export default class Population {
  static population: { [key: string | ROLE]: number };
  static spawn: StructureSpawn = Game.spawns["spawn0"];

  static tick() {
    const currentPopulation: { [key: string | ROLE]: number } = {};
    for (const creepName in Game.creeps) {
      if (Object.prototype.hasOwnProperty.call(Game.creeps, creepName)) {
        const creep = Game.creeps[creepName];
        if (currentPopulation[creep.memory.role]) {
          currentPopulation[creep.memory.role] = currentPopulation[creep.memory.role] + 1;
        } else {
          currentPopulation[creep.memory.role] = 1;
        }
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

        if (requiredPopulation > currentPopulation[role] || currentPopulation[role] === undefined) {
          switch (role) {
            case "harvester":
              Harvester.spawn(Population.spawn);
              break;

            default:
              break;
          }
        }
      }
    }
  }

  public static increase(role: ROLE, amount: number = 1) {
    Population.population = Object.assign({}, Population.population, {
      [role]: Population.population[role] + amount
    });
  }

  public static decrease(role: ROLE, amount: number = 1) {
    Population.population = Object.assign({}, Population.population, {
      [role]: Population.population[role] - amount
    });
  }

  public static set(role: ROLE, amount: number = 1) {
    Population.population = Object.assign({}, Population.population, {
      [role]: amount
    });
  }

  public static get(role?: ROLE) {
    if (!role) {
      return Population.population;
    }
    return Population.population[role];
  }

  public static getEffective(role?: ROLE) {
    let count = 0;
    for (const creepName in Game.creeps) {
      if (Object.prototype.hasOwnProperty.call(Game.creeps, creepName)) {
        const creep = Game.creeps[creepName];
        if (role && role === creep.memory.role) {
          count++;
        } else if (!role) {
          count++;
        }
      }
    }
    return count;
  }
}

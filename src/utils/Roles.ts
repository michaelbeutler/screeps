import { tick as tickHarvester } from "roles/Harvester";

export type ROLE = "harvester1" | "harvester2";
export type STATUS = "idle" | "working" | "moving" | "upgrading";

export type Blueprint = {
  body: BodyPartConstant[];
  memory: CreepMemory;
  tick: (creep: Creep) => void;
};

export const getBlueprint = (role: ROLE): Blueprint => {
  const defaultMemory: CreepMemory = {
    role: "harvester1" as ROLE,
    roleSpecific: {},
    spawnId: "",
    status: "idle" as STATUS
  };

  switch (role) {
    case "harvester1":
      return {
        body: [WORK, CARRY, MOVE],
        memory: { ...defaultMemory, role: "harvester1" as ROLE },
        tick: tickHarvester
      };
    case "harvester2":
      return {
        body: [WORK, WORK, CARRY, MOVE, MOVE],
        memory: { ...defaultMemory, role: "harvester2" as ROLE },
        tick: tickHarvester
      };
  }
};

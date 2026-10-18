export const firstSimulation = {
  footprint: {
    readOnly: ["CONTRACT_DATA:A", "CONTRACT_DATA:B"],
    readWrite: ["CONTRACT_DATA:C"]
  },
  minResourceFee: "100",
  cost: { cpuInsns: "1000", memBytes: "2000" }
};

export const secondSimulation = {
  footprint: {
    readOnly: ["CONTRACT_DATA:A"],
    readWrite: ["CONTRACT_DATA:B", "CONTRACT_DATA:D"]
  },
  minResourceFee: "150",
  cost: { cpuInsns: "1100", memBytes: "2100" }
};

/** Same key appears in both read-only and read-write → conflict mode. */
export const conflictSimulation = {
  footprint: {
    readOnly: ["CONTRACT_DATA:X"],
    readWrite: ["CONTRACT_DATA:X"]
  }
};

export const firstSimulationJson = JSON.stringify(firstSimulation, null, 2);
export const secondSimulationJson = JSON.stringify(secondSimulation, null, 2);
export const conflictSimulationJson = JSON.stringify(conflictSimulation, null, 2);

export const invalidXdrSimulationJson = JSON.stringify({
  footprint: {
    readOnly: ["AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA"],
    readWrite: []
  }
});

export const simulationsFixture = {
  first: firstSimulationJson,
  second: secondSimulationJson
};

export const accessConflictsFixture = {
  conflict: conflictSimulationJson
};

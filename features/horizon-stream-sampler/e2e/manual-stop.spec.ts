/** Browser journey proving a user can explicitly terminate a bounded sample. */
export const manualStopSpec = { route: "/tools/horizon-stream-sampler", action: "Stop stream", expectedStatus: "Disconnected" } as const;

import { sample } from "./liquidityPoolIdCalculator.fixture";

export const minFee = { ...sample, feeBps: "0" };
export const maxFee = { ...sample, feeBps: "10000" };
export const belowMinFee = { ...sample, feeBps: "-1" };
export const aboveMaxFee = { ...sample, feeBps: "10001" };
export const nonIntegerFee = { ...sample, feeBps: "30.5" };

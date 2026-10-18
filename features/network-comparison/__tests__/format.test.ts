import {expect,it} from "vitest";
import {formatValue} from "../lib/format";
import {copy} from "../copy";
it("preserves precise fees and represents unavailable fields",()=>{expect(formatValue("9007199254740993")).toBe("9007199254740993");expect(formatValue(0)).toBe("0");expect(formatValue(null)).toBe(copy.unavailable);});

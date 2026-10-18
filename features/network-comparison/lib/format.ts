import { copy } from "../copy";
export function formatValue(value:string|number|null): string {return value === null ? copy.unavailable : String(value);}

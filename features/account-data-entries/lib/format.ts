import { Buffer } from "buffer";
import type { AccountDataEntryDisplayType } from "../types";

export function decodeDataEntry(base64: string): { 
  displayType: AccountDataEntryDisplayType; 
  decodedValue: string; 
  byteLength: number; 
} {
  try {
    const buf = Buffer.from(base64, 'base64');
    if (buf.length === 0 && base64.length > 0) {
      throw new Error("Invalid base64");
    }
    const str = buf.toString('utf8');
    
    // Check if valid round-trip
    if (Buffer.from(str, 'utf8').equals(buf)) {
      // Check for control characters (except standard whitespace)
      // Matches standard ASCII control chars (0-31, 127) excluding \n (10), \r (13), \t (9)
      const hasControlChars = /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/.test(str);
      
      if (!hasControlChars) {
        return {
          displayType: 'text',
          decodedValue: str,
          byteLength: buf.length
        };
      }
    }
    
    // Hex fallback
    return {
      displayType: 'hex',
      decodedValue: buf.toString('hex'),
      byteLength: buf.length
    };
  } catch {
    return {
      displayType: 'hex',
      decodedValue: "",
      byteLength: 0
    };
  }
}

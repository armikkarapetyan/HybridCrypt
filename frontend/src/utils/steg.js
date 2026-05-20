
const ZW_CHARS = {
  zero: "\u200B", // zero-width space -> encode bit 0
  one: "\u200C", // zero-width non-joiner -> encode bit 1
  sep: "\u200D" // zero-width joiner -> separator/end
};

// Convert a string to binary representation (UTF-8 bytes)
function toBinary(str) {
  const encoder = new TextEncoder();
  const bytes = encoder.encode(str);
  let bits = "";
  for (const b of bytes) {
    bits += b.toString(2).padStart(8, "0");
  }
  return bits;
}

function fromBinary(bits) {
  const bytes = [];
  for (let i = 0; i < bits.length; i += 8) {
    const byte = bits.slice(i, i + 8);
    if (byte.length < 8) break;
    bytes.push(parseInt(byte, 2));
  }
  const decoder = new TextDecoder();
  return decoder.decode(new Uint8Array(bytes));
}

// Hide payload inside carrier text by inserting zero-width characters after spaces
export function hideInText(carrierText, payload) {
  const bits = toBinary(payload);
  let bitIdx = 0;
  const out = [];

  // Interleave zero-width bits after each character in the carrier until we run out of bits.
  for (let i = 0; i < carrierText.length; i++) {
    out.push(carrierText[i]);
    if (bitIdx < bits.length) {
      out.push(bits[bitIdx] === "1" ? ZW_CHARS.one : ZW_CHARS.zero);
      bitIdx++;
    }
  }

  // If there are leftover bits, append them at the end as a tail, then separator
  while (bitIdx < bits.length) {
    out.push(bits[bitIdx] === "1" ? ZW_CHARS.one : ZW_CHARS.zero);
    bitIdx++;
  }

  // Always append separator to mark the end of hidden data
  out.push(ZW_CHARS.sep);

  return out.join("");
}

// Extract hidden payload from text
export function extractFromText(stegoText) {
  // Collect zero-width characters
  const zw = Array.from(stegoText).filter((c) => c === ZW_CHARS.zero || c === ZW_CHARS.one || c === ZW_CHARS.sep);
  let bits = "";
  for (const c of zw) {
    if (c === ZW_CHARS.zero) bits += "0";
    else if (c === ZW_CHARS.one) bits += "1";
    else if (c === ZW_CHARS.sep) break;
  }
  if (!bits) return "";
  return fromBinary(bits);
}

// Utility to map Base64 characters to different visual alphabets (English, Armenian, Russian, Emoji)
// and back. This preserves the underlying encrypted Base64 content while changing only the
// visual representation shown to the user.

const BASE64_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";

// Helper to safely turn a Unicode string into an array of user-perceived characters
const chars = (s) => Array.from(s);

// Prepare style alphabets. We ensure each pool has the same length as BASE64_CHARS.
const STYLE_POOLS = {
  English: chars(BASE64_CHARS), // identity
  // Use Armenian letters (uppercase then lowercase) and slice to required length
  Armenian: (function () {
    // Armenian uppercase U+0531..U+0556, lowercase U+0561..U+0586
    const upper = Array.from(String.fromCharCode(...Array.from({ length: 0x0556 - 0x0531 + 1 }, (_, i) => 0x0531 + i)));
    const lower = Array.from(String.fromCharCode(...Array.from({ length: 0x0586 - 0x0561 + 1 }, (_, i) => 0x0561 + i)));
    return upper.concat(lower).slice(0, BASE64_CHARS.length);
  })(),
  // Use Cyrillic (Russian) uppercase then lowercase
  Russian: (function () {
    // Cyrillic uppercase U+0410..U+042F (А..Я), lowercase U+0430..U+044F (а..я)
    const upper = Array.from(String.fromCharCode(...Array.from({ length: 0x042F - 0x0410 + 1 }, (_, i) => 0x0410 + i)));
    const lower = Array.from(String.fromCharCode(...Array.from({ length: 0x044F - 0x0430 + 1 }, (_, i) => 0x0430 + i)));
    return upper.concat(lower).slice(0, BASE64_CHARS.length);
  })(),
  // Emoji pool: 65 emoji chosen to be distinct and stable across platforms
  Emoji: (function () {
    const e = [
      "😀","😃","😄","😁","😆","😅","🤣","😂","🙂","🙃",
      "😉","😊","😇","🥰","😍","🤩","😘","😗","😚","😙",
      "😋","😛","😜","🤪","😝","🤑","🤗","🤭","🤫","🤔",
      "🤐","🤨","😐","😑","😶","😏","😒","🙄","😬","🤥",
      "😌","😔","😪","🤤","😴","😷","🤒","🤕","🤢","🤮",
      "🤧","🥵","🥶","🥳","🥸","😎","🤓","🧐","😕","😟",
      "🙁","😮","😯","😲","😳","🥺","😦","😧","😨"
    ];
    // Ensure exactly the same length as BASE64_CHARS
    return e.slice(0, BASE64_CHARS.length);
  })(),
};

const STYLE_NAMES = Object.keys(STYLE_POOLS);

// Build maps for quick lookup
const STYLE_MAPS = {};
for (const name of STYLE_NAMES) {
  const pool = STYLE_POOLS[name];
  const map = new Map();
  const rev = new Map();
  for (let i = 0; i < BASE64_CHARS.length; i++) {
    const b = BASE64_CHARS[i];
    const s = pool[i];
    map.set(b, s);
    rev.set(s, b);
  }
  STYLE_MAPS[name] = { map, rev, pool };
}

// Encode a Base64 string into selected style
export function encodeToStyle(base64String, styleName = "English") {
  if (!STYLE_MAPS[styleName]) styleName = "English";
  const { map } = STYLE_MAPS[styleName];
  // Replace each character individually, leave unknown chars unchanged
  return Array.from(base64String)
    .map((ch) => (map.has(ch) ? map.get(ch) : ch))
    .join("");
}

// Try to detect the style used by inspecting characters present in the input.
function detectStyleForText(text) {
  // Count matches for each style
  const samples = Array.from(text);
  const scores = STYLE_NAMES.map((name) => {
    const { pool } = STYLE_MAPS[name];
    const set = new Set(pool);
    let hits = 0;
    for (const ch of samples) if (set.has(ch)) hits++;
    return { name, hits };
  });
  // Choose the style with the most hits. If tie or zero, return null.
  scores.sort((a, b) => b.hits - a.hits);
  if (scores.length === 0 || scores[0].hits === 0) return null;
  // If top score is unique, return it
  if (scores.length === 1 || scores[0].hits > scores[1].hits) return scores[0].name;
  return null;
}

// Decode a styled string back into Base64. If styleName is omitted, attempt auto-detection.
export function decodeFromStyle(styledString, styleName) {
  let style = styleName;
  if (!style) {
    style = detectStyleForText(styledString);
  }
  // If we still don't know the style, assume input is already Base64 and return as-is
  if (!style || !STYLE_MAPS[style]) return styledString;

  const { rev } = STYLE_MAPS[style];
  return Array.from(styledString)
    .map((ch) => (rev.has(ch) ? rev.get(ch) : ch))
    .join("");
}

export { STYLE_NAMES };

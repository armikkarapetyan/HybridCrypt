// text → vector
export function textToVec(text, n) {
  let arr = new Array(n).fill(0);
  for (let i = 0; i < text.length; i++) {
    arr[i] = text.charCodeAt(i);
  }
  return arr;
}

// vector → text
export function vecToText(vec, len) {
  return String.fromCharCode(
    ...vec.slice(0, len).map(v => Math.round(v))
  );
}

// next power of 2
export function nextPow2(n) {
  let p = 1;
  while (p < n) p *= 2;
  return p;
}

// FWHT
export function fwht(x) {
  let n = x.length;
  let y = x.slice();
  let h = 1;

  while (h < n) {
    for (let i = 0; i < n; i += 2 * h) {
      for (let j = 0; j < h; j++) {
        let a = y[i + j];
        let b = y[i + j + h];
        y[i + j] = a + b;
        y[i + j + h] = a - b;
      }
    }
    h *= 2;
  }
  return y;
}

// inverse
export function ifwht(x) {
  let n = x.length;
  let y = fwht(x);
  return y.map(v => v / n);
}

// key from text 
export function generateKeyFromText(text, n) {
  const words = text.split(" ");
  let key = "";

  // Take first and last letters of each word (if length >= 2)
  for (let word of words) {
    if (word.length >= 2) {
      key += word[0] + word[word.length - 1];
    } else {
      key += word[0]; // if single letter word
    }
  }

  // Repeat key until it matches length n
  while (key.length < n) {
    key += key;
  }

  return key.slice(0, n);
}
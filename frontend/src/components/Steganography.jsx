import { useState } from "react";
import { hideInText, extractFromText } from "../utils/steg";

export default function Steganography() {
  const [secret, setSecret] = useState("");
  const [carrier, setCarrier] = useState("");
  const [stego, setStego] = useState(null);
  const [extracted, setExtracted] = useState("");
  const [rightInput, setRightInput] = useState("");
  const [diagnostics, setDiagnostics] = useState(null);
  const [hiddenCount, setHiddenCount] = useState(0);

  const handleHide = () => {
    if (!carrier) return alert("Enter or paste carrier text first.");
    if (!secret) return alert("Enter secret message to hide.");
  const result = hideInText(carrier, secret);
    setStego(result);
    // Replace carrier content with the modified text so user can copy or edit
    setCarrier(result);
    // store hidden length so we can show count
    setHiddenCount(secret.length);
  };

  const handleExtract = () => {
    if (!rightInput) return alert("Paste the modified (stego) text into the right input first.");
    const hidden = extractFromText(rightInput);
    setExtracted(hidden);
    // diagnostics: count zero-width chars and bits
    try {
      const zw = Array.from(rightInput).filter((c) => c === "\u200B" || c === "\u200C" || c === "\u200D");
      const bits = zw.map((c) => (c === "\u200C" ? "1" : c === "\u200B" ? "0" : "|" )).join("");
      setDiagnostics({ zwCount: zw.length, bitsSample: bits.slice(0, 200) });
    } catch (e) {
      setDiagnostics(null);
    }
  };

  const fillRightAndExtract = () => {
    const result = stego || "";
    if (!result) return alert("No left result available to fill.");
    setRightInput(result);
    // Extract immediately from the result
    const hidden = extractFromText(result);
    setExtracted(hidden);
    try {
      const zw = Array.from(result).filter((c) => c === "\u200B" || c === "\u200C" || c === "\u200D");
      const bits = zw.map((c) => (c === "\u200C" ? "1" : c === "\u200B" ? "0" : "|" )).join("");
      setDiagnostics({ zwCount: zw.length, bitsSample: bits.slice(0, 200) });
    } catch (e) {
      setDiagnostics(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-6 flex items-center justify-center">
      <div className="max-w-3xl w-full bg-white shadow-xl rounded-2xl p-8">
        <h2 className="text-2xl font-bold text-purple-700 mb-4">Text Steganography</h2>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Secret message to hide</label>
          <textarea value={secret} onChange={(e) => setSecret(e.target.value)} rows={3} className="mt-1 block w-full border rounded p-2" />
        </div>

        <div className="mb-4 flex items-center gap-3">
          {/* no repeat-per-word option: default interleaving is used */}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Carrier text (paste normal readable text here)</label>
            <textarea value={carrier} onChange={(e) => setCarrier(e.target.value)} rows={10} className="mt-2 block w-full border rounded p-2" />

            <div className="mt-3 flex gap-3">
              <button onClick={handleHide} className="bg-purple-600 text-white px-4 py-2 rounded">Hide</button>
              <button onClick={() => { setCarrier(""); setStego(null); setExtracted(""); setRightInput(""); }} className="bg-gray-200 px-3 py-2 rounded">Clear</button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Stego text</label>
            <textarea value={rightInput} onChange={(e) => setRightInput(e.target.value)} rows={10} className="mt-2 block w-full border rounded p-2" />

            <div className="mt-3 flex gap-3">
              <button onClick={handleExtract} className="bg-green-600 text-white px-4 py-2 rounded">Extract</button>
              <button onClick={fillRightAndExtract} className="bg-purple-600 text-white px-3 py-2 rounded">Fill + Extract</button>
            </div>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-50 p-4 rounded">
            <h3 className="font-semibold">Stego preview (left result)</h3>
            <pre className="whitespace-pre-wrap break-words text-sm max-h-48 overflow-auto">{(stego || "").slice(0, 1000)}</pre>
            {hiddenCount > 0 && (
              <p className="text-sm text-gray-600 mt-2">Hidden text length: {hiddenCount} characters</p>
            )}
            <div className="mt-2 flex gap-2">
              <button
                onClick={() => navigator.clipboard.writeText(stego || "")}
                className="bg-purple-600 text-white px-3 py-1 rounded text-sm"
              >
                Copy stego text
              </button>
              <button
                onClick={() => { setStego(null); setCarrier(""); setExtracted(""); setRightInput(""); }}
                className="bg-gray-200 text-gray-700 px-3 py-1 rounded text-sm"
              >
                Clear
              </button>
            </div>
          </div>

          <div className="bg-green-50 p-4 rounded">
            <h3 className="font-semibold">Extracted secret</h3>
            <p className="break-words">{extracted}</p>
            {!extracted && diagnostics && (
              <div className="mt-2 text-sm text-gray-600">
                <p>No hidden text found.</p>
                <p>Zero-width chars found: {diagnostics.zwCount}</p>
                <p>Bits sample (first 200): <code className="bg-white px-1">{diagnostics.bitsSample}</code></p>
                <p className="mt-1">Hint: ensure the stego text actually contains zero-width characters (they are invisible). If you copied/pasted through an editor that strips invisible chars, extraction will fail.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

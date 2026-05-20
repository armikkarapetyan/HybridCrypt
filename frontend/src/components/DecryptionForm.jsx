import { useState } from "react";
import axios from "axios";
import { decodeFromStyle, STYLE_NAMES } from "../utils/styler";

export default function DecryptForm({ inline = false }) {
  const [encrypted, setEncrypted] = useState("");
  const [decrypted, setDecrypted] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [style, setStyle] = useState("Auto-detect");

  const handleDecrypt = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setDecrypted("");

    try {
      // Convert styled input back to Base64 before sending
      const base64 = decodeFromStyle(encrypted, style === "Auto-detect" ? undefined : style);

      const res = await axios.post("http://localhost:3005/api/messages/decrypt", {
        encrypted: base64
      });
      setDecrypted(res.data.decryptedText);
    } catch (err) {
      console.error(err);
      setError("Decryption failed!");
    } finally {
      setLoading(false);
    }
  };

  const card = (
    <div className="w-full bg-white shadow-xl rounded-2xl p-8">
      <h2 className="text-2xl md:text-3xl font-bold text-center text-purple-700 mb-6">Decrypt Text</h2>

      <form onSubmit={handleDecrypt} className="flex flex-col gap-4">
        <textarea
          value={encrypted}
          onChange={(e) => setEncrypted(e.target.value)}
          placeholder="Paste encrypted string (styled or Base64)"
          rows={4}
          className="border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-400 text-lg"
          required
        />

        <label className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Input style:</span>
          <select
            value={style}
            onChange={(e) => setStyle(e.target.value)}
            className="ml-2 border rounded px-2 py-1"
          >
            <option>Auto-detect</option>
            {STYLE_NAMES.map((n) => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
        </label>

        <button
          type="submit"
          className="bg-purple-600 text-white font-semibold px-6 py-3 rounded-lg hover:bg-purple-700 transition"
        >
          Decrypt
        </button>
      </form>

      {loading && <p className="text-center text-gray-500 mt-4">Decrypting...</p>}
      {error && <p className="text-center text-red-500 mt-4">{error}</p>}

      {decrypted && (
        <div className="mt-6 bg-gray-100 p-4 rounded-lg break-words">
          <h3 className="text-xl font-semibold text-gray-700 mb-2">Decrypted Text:</h3>
          <p className="text-green-700">{decrypted}</p>
        </div>
      )}
    </div>
  );

  if (inline) return card;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center p-6">
      <div className="w-full max-w-lg">{card}</div>
    </div>
  );
}
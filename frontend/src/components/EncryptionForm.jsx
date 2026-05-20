import { useState } from "react";
import axios from "axios";
import { encodeToStyle, STYLE_NAMES } from "../utils/styler";

export default function EncryptForm({ inline = false }) {
  const [text, setText] = useState("");
  const [encryptedData, setEncryptedData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [style, setStyle] = useState(STYLE_NAMES[0]);

  const handleEncrypt = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setEncryptedData(null);

    try {
      const res = await axios.post("http://localhost:3005/api/messages/encrypt", { text });
      // res.data is expected to include { encrypted, iv, ... }
      setEncryptedData(res.data);
    } catch (err) {
      console.error(err);
      setError("Encryption failed!");
    } finally {
      setLoading(false);
    }
  };

  // Display the encrypted.encrypted (Base64) as styled text
  const getStyledEncrypted = () => {
    if (!encryptedData || !encryptedData.encrypted) return null;
    return encodeToStyle(encryptedData.encrypted, style);
  };

  const card = (
    <div className="w-full bg-white shadow-xl rounded-2xl p-8">
      <h2 className="text-2xl md:text-3xl font-bold text-center text-purple-700 mb-6">Encrypt Text</h2>
      <form onSubmit={handleEncrypt} className="flex flex-col gap-4">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Enter text"
          className="border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-400 text-lg"
          required
        />

        <label className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Output style:</span>
          <select
            value={style}
            onChange={(e) => setStyle(e.target.value)}
            className="ml-2 border rounded px-2 py-1"
          >
            {STYLE_NAMES.map((n) => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
        </label>

        <button
          type="submit"
          className="bg-purple-600 text-white font-semibold px-6 py-3 rounded-lg hover:bg-purple-700 transition"
        >
          Encrypt
        </button>
      </form>

      {loading && <p className="text-center text-gray-500 mt-4">Encrypting...</p>}
      {error && <p className="text-center text-red-500 mt-4">{error}</p>}

      {encryptedData && (
        <div className="mt-6 bg-gray-100 p-4 rounded-lg break-words">
          <h3 className="text-xl font-semibold text-gray-700 mb-2">Encrypted Text:</h3>
          <p className="text-purple-700 break-words">{getStyledEncrypted()}</p>
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
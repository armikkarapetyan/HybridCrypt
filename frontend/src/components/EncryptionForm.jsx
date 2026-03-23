import { useState } from "react";
import axios from "axios";

export default function EncryptForm() {
  const [text, setText] = useState("");
  const [encryptedData, setEncryptedData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleEncrypt = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await axios.post("http://localhost:3004/api/messages/encrypt", { text });
      setEncryptedData(res.data);
    } catch (err) {
      console.error(err);
      setError("Encryption failed!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "2rem", fontFamily: "Arial" }}>
      <h2>Encrypt Text</h2>
      <form onSubmit={handleEncrypt}>
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Enter text"
          style={{ padding: "0.5rem", width: "300px" }}
          required
        />
        <button type="submit" style={{ padding: "0.5rem 1rem", marginLeft: "1rem" }}>
          Encrypt
        </button>
      </form>

      {loading && <p>Encrypting...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {encryptedData && (
        <div style={{ marginTop: "1.5rem", wordBreak: "break-all" }}>
          <p><strong>Encrypted:</strong></p>
          <pre>{encryptedData.encrypted}</pre>
        </div>
      )}
    </div>
  );
}
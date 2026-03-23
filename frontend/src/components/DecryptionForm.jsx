import { useState } from "react";
import axios from "axios";

export default function DecryptForm() {
  const [encrypted, setEncrypted] = useState("");
  const [decrypted, setDecrypted] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleDecrypt = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await axios.post("http://localhost:3004/api/messages/decrypt", {
        encrypted
      });
      setDecrypted(res.data.decryptedText);
    } catch (err) {
      console.error(err);
      setError("Decryption failed!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "2rem", fontFamily: "Arial" }}>
      <h2>Decrypt Text</h2>

      <form onSubmit={handleDecrypt}>
        <textarea
          value={encrypted}
          onChange={(e) => setEncrypted(e.target.value)}
          placeholder="Paste encrypted string"
          rows={4}
          style={{ width: "100%", padding: "0.5rem" }}
          required
        />

        <button type="submit" style={{ marginTop: "10px", padding: "0.5rem 1rem" }}>
          Decrypt
        </button>
      </form>

      {loading && <p>Decrypting...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {decrypted && (
        <div style={{ marginTop: "1.5rem" }}>
          <p><strong>Decrypted:</strong></p>
          <p>{decrypted}</p>
        </div>
      )}
    </div>
  );
}
import EncryptForm from "./components/EncryptionForm"
import DecryptForm from "./components/DecryptionForm"
import Steganography from "./components/Steganography"
import { useState } from "react";

function App() {
  const [tab, setTab] = useState("crypto");

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-6 flex items-center justify-center">
      <div className="max-w-6xl w-full">
        <div className="mb-6 flex justify-center gap-4">
          <button onClick={() => setTab("crypto")} className={`px-4 py-2 rounded ${tab === "crypto" ? 'bg-purple-600 text-white' : 'bg-white text-gray-700'}`}>
            Encrypt / Decrypt
          </button>
          <button onClick={() => setTab("stego")} className={`px-4 py-2 rounded ${tab === "stego" ? 'bg-purple-600 text-white' : 'bg-white text-gray-700'}`}>
            Steganography
          </button>
        </div>

        {tab === "crypto" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            <EncryptForm inline />
            <DecryptForm inline />
          </div>
        )}

        {tab === "stego" && <Steganography />}
      </div>
    </div>
  );
}

export default App;



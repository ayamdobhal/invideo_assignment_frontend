"use client";

import { useState } from "react";
import { fetchShader } from "../utils/fetchShader";

export function ShaderEditor() {
  const [description, setDescription] = useState("");
  const [shaderCode, setShaderCode] = useState("");

  const generateShader = async () => {
    const code = await fetchShader(description);
    setShaderCode(code);
  };

  return (
    <div>
      <input
        className="border p-2 rounded w-full text-black"
        type="text"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Describe your shader"
      />
      <button
        className="mt-2 bg-blue-500 text-white px-4 py-2 rounded"
        onClick={generateShader}
      >
        Generate Shader
      </button>
      <pre className="mt-2 bg-gray-900 text-green-400 p-4 rounded">
        {shaderCode}
      </pre>
    </div>
  );
}

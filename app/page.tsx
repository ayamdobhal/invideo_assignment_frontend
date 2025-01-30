"use client";

import { useState } from "react";
import { Calculator } from "./components/Calculator";
import { ShaderEditor } from "./components/ShaderEditor";

export default function App() {
  const [activeTab, setActiveTab] = useState<string>("calculator");

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <div className="flex space-x-4 mb-4 text-black">
        <button
          className={`px-4 py-2 rounded-lg ${
            activeTab === "calculator"
              ? "bg-blue-500 text-white"
              : "bg-gray-200"
          }`}
          onClick={() => setActiveTab("calculator")}
        >
          Rust Calculator
        </button>
        <button
          className={`px-4 py-2 rounded-lg ${
            activeTab === "shader" ? "bg-blue-500 text-white" : "bg-gray-200"
          }`}
          onClick={() => setActiveTab("shader")}
        >
          Text-to-Shader
        </button>
      </div>

      {activeTab === "calculator" ? <Calculator /> : <ShaderEditor />}
    </div>
  );
}

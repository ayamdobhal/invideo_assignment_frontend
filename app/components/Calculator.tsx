"use client";

import { useState } from "react";
import init, { evaluate_expression } from "../wasm/invideo_assignment_wasm";

export function Calculator() {
  const [expression, setExpression] = useState<string>("");
  const [result, setResult] = useState<string>("");

  const calculate = async () => {
    await init();
    try {
      setResult(evaluate_expression(expression));
    } catch (e) {
      setResult(`Error: ${e}`);
    }
  };

  return (
    <div>
      <input
        className="border p-2 rounded w-full text-black"
        type="text"
        value={expression}
        onChange={(e) => setExpression(e.target.value)}
        placeholder="Enter expression"
      />
      <button
        className="mt-2 bg-green-500 text-white px-4 py-2 rounded"
        onClick={calculate}
      >
        Calculate
      </button>
      <p className="mt-2 text-lg">Result: {result}</p>
    </div>
  );
}

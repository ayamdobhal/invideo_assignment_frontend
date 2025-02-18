"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { fetchModifiedShader } from "../utils/fetchModifiedShader";
import { fetchShader } from "../utils/fetchShader";
import ShaderCanvas from "./ShaderCanvas";

export function ShaderEditor() {
  const [description, setDescription] = useState<string>("");
  const [shaderCode, setShaderCode] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [shaderFetched, setShaderFetched] = useState<boolean>(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(Date.now());

  const generateShader = async () => {
    if (!description.trim()) {
      setError("Please enter a shader description");
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      let code = await fetchShader(description);
      code = code.replaceAll("```glsl", "");
      code = code.replaceAll("```", "");
      setShaderCode(code);
      if (canvasRef.current) {
        setupWebGL();
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to generate shader"
      );
      console.error("Shader generation error:", err);
    } finally {
      setIsLoading(false);
      setShaderFetched(true);
    }
  };

  const modifyShader = async () => {
    if (!description.trim()) {
      setError("Please enter a shader description");
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      let code = await fetchModifiedShader(description, shaderCode);
      code = code.replaceAll("```glsl", "");
      code = code.replaceAll("```", "");
      setShaderCode(code);
      if (canvasRef.current) {
        setupWebGL();
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to generate shader"
      );
      console.error("Shader generation error:", err);
    } finally {
      setIsLoading(false);
      setShaderFetched(true);
    }
  };

  const setupWebGL = useCallback(() => {
    if (!canvasRef.current) return;

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    const gl = canvasRef.current.getContext("webgl2");
    if (!gl) {
      setError("WebGL2 not supported in your browser");
      return;
    }

    const vertexShaderSource = `#version 300 es
    in vec4 position;
    void main() {
      gl_Position = position;
    }`;

    try {
      const vertexShader = initShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
      const fragmentShader = initShader(gl, gl.FRAGMENT_SHADER, shaderCode);

      const program = gl.createProgram();
      if (!program) {
        throw new Error("Failed to create program");
      }

      gl.attachShader(program, vertexShader);
      gl.attachShader(program, fragmentShader);
      gl.linkProgram(program);

      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        throw new Error("Program link error: " + gl.getProgramInfoLog(program));
      }

      const positions = new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]);

      const positionBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

      const positionAttributeLocation = gl.getAttribLocation(
        program,
        "position"
      );
      const timeLocation = gl.getUniformLocation(program, "time");
      const resolutionLocation = gl.getUniformLocation(program, "resolution");
      const mousePosition = gl.getUniformLocation(program, "mouseLocation");

      gl.useProgram(program);
      gl.enableVertexAttribArray(positionAttributeLocation);
      gl.vertexAttribPointer(
        positionAttributeLocation,
        2,
        gl.FLOAT,
        false,
        0,
        0
      );

      const render = () => {
        const time = (Date.now() - startTimeRef.current) / 1000;
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

        gl.useProgram(program);
        gl.uniform1f(timeLocation, time);
        gl.uniform2f(resolutionLocation, gl.canvas.width, gl.canvas.height);
        const normalizedX = 500 / gl.canvas.width;
        const normalizedY = 1.0 - 500 / gl.canvas.height; // Flip Y coordinate
        gl.uniform2f(mousePosition, normalizedX, normalizedY);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
        animationFrameRef.current = requestAnimationFrame(render);
      };

      render();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown shader error";
      setError(errorMessage);
    }
  }, [shaderCode, setError]);

  const initShader = (
    gl: WebGL2RenderingContext,
    type: number,
    source: string
  ) => {
    const shader = gl.createShader(type);
    if (!shader) {
      throw new Error("Failed to create shader");
    }

    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      const info = gl.getShaderInfoLog(shader);
      gl.deleteShader(shader);
      setError("Shader compilation error: " + info);
    }

    return shader;
  };

  useEffect(() => {
    if (!shaderFetched) return;
    if (canvasRef.current) {
      const pixelRatio = window.devicePixelRatio || 1;
      canvasRef.current.width = 800 * pixelRatio;
      canvasRef.current.height = 600 * pixelRatio;

      setupWebGL();
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [shaderCode, shaderFetched, setupWebGL]);

  return (
    <div className="min-h-screen  p-8">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-2">
            Text-to-Shader Generator
          </h1>
        </div>

        <div className="bg-white/5 backdrop-blur-lg rounded-xl p-8 shadow-xl border border-white/10">
          <div className="flex flex-col gap-4 sm:flex-row sm:gap-3">
            <input
              className="flex-grow px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your shader (e.g., 'A rotating cube with a gradient background')"
              disabled={isLoading}
            />
            <button
              className={`px-6 py-3 rounded-lg font-medium transition-all ${
                isLoading
                  ? "bg-gray-600 cursor-not-allowed"
                  : "bg-blue-500 hover:bg-blue-600 active:bg-blue-700"
              } text-white shadow-lg flex-shrink-0`}
              onClick={generateShader}
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Generating...
                </span>
              ) : (
                "Generate Shader"
              )}
            </button>
            <button
              className={`px-6 py-3 rounded-lg font-medium transition-all ${
                isLoading
                  ? "bg-gray-600 cursor-not-allowed"
                  : "bg-blue-500 hover:bg-blue-600 active:bg-blue-700"
              } text-white shadow-lg flex-shrink-0`}
              onClick={modifyShader}
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Generating...
                </span>
              ) : (
                "Modify Shader"
              )}
            </button>
          </div>
        </div>

        <div className="space-y-8">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-200 px-6 py-4 rounded-lg animate-fade-in">
              <p className="font-semibold">Shader Error:</p>
              <p className="text-sm opacity-90">{error}</p>
            </div>
          )}

          <div className="bg-white/5 backdrop-blur-lg rounded-xl p-8 shadow-xl border border-white/10">
            <h3 className="text-xl font-semibold text-white mb-4">
              Live Preview
            </h3>
            <div className="relative rounded-lg overflow-hidden">
              <ShaderCanvas shaderCode={shaderCode} />
              <div className="absolute inset-0 pointer-events-none border border-white/10 rounded-lg"></div>
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-lg rounded-xl p-8 shadow-xl border border-white/10">
            <h3 className="text-xl font-semibold text-white mb-4">
              Shader Code
            </h3>
            <div className="bg-gray-900/50 rounded-lg p-4 overflow-hidden">
              <pre className="text-green-400 overflow-x-auto whitespace-pre-wrap font-mono text-sm leading-relaxed">
                {shaderCode}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

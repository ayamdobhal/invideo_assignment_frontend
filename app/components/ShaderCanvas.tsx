import { useCallback, useEffect, useRef } from "react";

const ShaderCanvas = (props: { shaderCode: string }) => {
  const shaderCode = props.shaderCode;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mousePos = useRef({ x: 0, y: 0 });
  const animationFrameRef = useRef<number>(null);
  const startTimeRef = useRef(Date.now());

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleMouseMove = useCallback((event: any) => {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width;
    const y = 1.0 - (event.clientY - rect.top) / rect.height; // Flip Y coordinate
    mousePos.current = { x, y };
  }, []);

  const setupWebGL = useCallback(() => {
    if (!canvasRef.current) return;

    const gl = canvasRef.current.getContext("webgl2");
    if (!gl) return;

    // Vertex shader setup
    const vertexShaderSource = `#version 300 es
      in vec4 position;
      void main() {
        gl_Position = position;
      }`;

    const vertexShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vertexShader!, vertexShaderSource);
    gl.compileShader(vertexShader!);

    // Fragment shader setup
    const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fragmentShader!, shaderCode);
    gl.compileShader(fragmentShader!);

    // Program setup
    const program = gl.createProgram();
    gl.attachShader(program, vertexShader!);
    gl.attachShader(program, fragmentShader!);
    gl.linkProgram(program);

    // Buffer setup
    const positions = new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]);
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

    // Attribute/uniform locations
    const positionAttributeLocation = gl.getAttribLocation(program, "position");
    const timeLocation = gl.getUniformLocation(program, "time");
    const resolutionLocation = gl.getUniformLocation(program, "resolution");
    const mousePosition = gl.getUniformLocation(program, "mousePosition");

    gl.useProgram(program);
    gl.enableVertexAttribArray(positionAttributeLocation);
    gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);

    const render = () => {
      const time = (Date.now() - startTimeRef.current) / 1000;
      gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

      gl.useProgram(program);
      gl.uniform1f(timeLocation, time);
      gl.uniform2f(resolutionLocation, gl.canvas.width, gl.canvas.height);
      gl.uniform2f(mousePosition, mousePos.current.x, mousePos.current.y);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      animationFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [shaderCode]);

  useEffect(() => {
    if (canvasRef.current) {
      const pixelRatio = window.devicePixelRatio || 1;
      canvasRef.current.width = 800 * pixelRatio;
      canvasRef.current.height = 600 * pixelRatio;
      setupWebGL();
    }
  }, [setupWebGL]);

  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      <canvas
        ref={canvasRef}
        onMouseMove={handleMouseMove}
        className="w-full aspect-video bg-gray-900 rounded-lg"
      />
    </div>
  );
};

export default ShaderCanvas;

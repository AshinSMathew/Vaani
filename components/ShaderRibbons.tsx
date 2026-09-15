"use client";

import React, { useEffect, useRef, useState } from "react";

export const ShaderRibbons: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [useFallback, setUseFallback] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) {
      return;
    }

    let animationFrameId: number;
    let gl: WebGLRenderingContext | null = null;
    let isContextLost = false;

    const resize = () => {
      if (!canvas) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
        canvas.width = width * dpr;
        canvas.height = height * dpr;
        if (gl) {
          gl.viewport(0, 0, canvas.width, canvas.height);
        }
      }
    };

    try {
      gl = canvas.getContext("webgl", {
        alpha: true,
        antialias: true,
        depth: false,
        stencil: false,
        premultipliedAlpha: false,
      });
    } catch {
      gl = null;
    }

    if (!gl) {
      setUseFallback(true);
      return;
    }

    const vertexShaderSource = `
      attribute vec2 position;
      varying vec2 vUv;
      void main() {
        vUv = (position + 1.0) * 0.5;
        gl_Position = vec4(position, 0.0, 1.0);
      }
    `;

    const fragmentShaderSource = `
      precision mediump float;
      varying vec2 vUv;
      uniform float uTime;
      uniform vec2 uResolution;

      // Indigo #6366F1, Violet #8B5CF6, Cyan #06B6D4
      const vec3 COLOR_INDIGO = vec3(0.388, 0.400, 0.945);
      const vec3 COLOR_VIOLET = vec3(0.545, 0.361, 0.965);
      const vec3 COLOR_CYAN   = vec3(0.024, 0.714, 0.831);

      float ribbon(vec2 uv, float freq1, float freq2, float speed, float phase, float thickness) {
        float y = 0.5 + 0.18 * sin(uv.x * freq1 + uTime * speed + phase)
                      + 0.10 * cos(uv.x * freq2 - uTime * (speed * 0.7) + phase * 1.6);
        float dist = abs(uv.y - y);
        return smoothstep(thickness, 0.0, dist);
      }

      void main() {
        vec2 uv = vUv;
        
        // Compute 3 drifting ribbons
        float r1 = ribbon(uv, 3.2, 5.8, 0.55, 0.00, 0.075);
        float r2 = ribbon(uv, 4.1, 2.7, 0.42, 2.14, 0.085);
        float r3 = ribbon(uv, 2.6, 6.4, 0.68, 4.38, 0.070);

        // Additive color blending with bloom on overlap
        vec3 col = vec3(0.0);
        col += COLOR_INDIGO * r1 * 1.35;
        col += COLOR_VIOLET * r2 * 1.25;
        col += COLOR_CYAN   * r3 * 1.15;

        // Central soft glow
        float centerGlow = (r1 * r2 + r2 * r3 + r1 * r3) * 1.8;
        col += vec3(0.9, 0.95, 1.0) * centerGlow;

        // Overall alpha calculation
        float alpha = clamp(r1 * 0.75 + r2 * 0.70 + r3 * 0.65 + centerGlow * 0.9, 0.0, 0.92);

        // Dark edge vignette
        float vignette = smoothstep(1.4, 0.2, length((uv - 0.5) * vec2(1.2, 1.0)));
        alpha *= vignette;

        gl_FragColor = vec4(col, alpha);
      }
    `;

    const compileShader = (source: string, type: number): WebGLShader | null => {
      if (!gl) return null;
      const shader = gl.createShader(type);
      if (!shader) return null;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.warn("Shader compile error:", gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    };

    const vs = compileShader(vertexShaderSource, gl.VERTEX_SHADER);
    const fs = compileShader(fragmentShaderSource, gl.FRAGMENT_SHADER);

    if (!vs || !fs) {
      setUseFallback(true);
      return;
    }

    const program = gl.createProgram();
    if (!program) {
      setUseFallback(true);
      return;
    }

    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.warn("Program link error:", gl.getProgramInfoLog(program));
      setUseFallback(true);
      return;
    }

    gl.useProgram(program);

    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([
        -1.0, -1.0,
         1.0, -1.0,
        -1.0,  1.0,
        -1.0,  1.0,
         1.0, -1.0,
         1.0,  1.0,
      ]),
      gl.STATIC_DRAW
    );

    const posAttr = gl.getAttribLocation(program, "position");
    gl.enableVertexAttribArray(posAttr);
    gl.vertexAttribPointer(posAttr, 2, gl.FLOAT, false, 0, 0);

    const uTimeLoc = gl.getUniformLocation(program, "uTime");
    const uResLoc = gl.getUniformLocation(program, "uResolution");

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    resize();
    window.addEventListener("resize", resize);

    const startTime = performance.now();

    const render = (now: number) => {
      if (isContextLost || !gl || !canvas) return;

      const elapsed = (now - startTime) * 0.001;
      gl.uniform1f(uTimeLoc, elapsed);
      if (uResLoc) {
        gl.uniform2f(uResLoc, canvas.width, canvas.height);
      }

      gl.clearColor(0.0, 0.0, 0.0, 0.0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLES, 0, 6);

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    const handleContextLost = (e: Event) => {
      e.preventDefault();
      isContextLost = true;
      cancelAnimationFrame(animationFrameId);
      setUseFallback(true);
    };

    canvas.addEventListener("webglcontextlost", handleContextLost);

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animationFrameId);
      if (canvas) {
        canvas.removeEventListener("webglcontextlost", handleContextLost);
      }
    };
  }, []);

  // 2D Canvas Fallback
  useEffect(() => {
    if (!useFallback) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = canvas.clientWidth * dpr;
      canvas.height = canvas.clientHeight * dpr;
    };
    resize();
    window.addEventListener("resize", resize);

    const startTime = performance.now();

    const render2D = (now: number) => {
      const t = (now - startTime) * 0.0008;
      const w = canvas.width;
      const h = canvas.height;

      ctx.clearRect(0, 0, w, h);
      ctx.globalCompositeOperation = "lighter";

      const drawSine = (color: string, freq1: number, freq2: number, speed: number, phase: number) => {
        ctx.beginPath();
        for (let x = 0; x <= w; x += 4) {
          const nx = x / w;
          const y = (h * 0.5) +
                    Math.sin(nx * freq1 + t * speed + phase) * (h * 0.18) +
                    Math.cos(nx * freq2 - t * (speed * 0.7) + phase * 1.6) * (h * 0.10);
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.strokeStyle = color;
        ctx.lineWidth = 14;
        ctx.stroke();
      };

      drawSine("rgba(99, 102, 241, 0.45)", 3.2, 5.8, 0.55, 0.0);
      drawSine("rgba(139, 92, 246, 0.40)", 4.1, 2.7, 0.42, 2.14);
      drawSine("rgba(6, 182, 212, 0.35)", 2.6, 6.4, 0.68, 4.38);

      animId = requestAnimationFrame(render2D);
    };

    animId = requestAnimationFrame(render2D);

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animId);
    };
  }, [useFallback]);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden select-none z-0" aria-hidden="true">
      <canvas
        ref={canvasRef}
        className="w-full h-full opacity-60 mix-blend-screen"
      />
      {/* Downward linear veil gradient so foreground typography is crisp */}
      <div className="absolute inset-0 bg-linear-to-b from-transparent via-[#0A0A0A]/70 to-[#0A0A0A] pointer-events-none" />
      {/* Subtle radial vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(10,10,10,0.85)_100%)] pointer-events-none" />
    </div>
  );
};

"use client";

import React, { useRef, useState, useEffect, useMemo, useContext } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { DashboardContext } from "@/context/DashboardContext";

// Procedurally generate high-definition realistic Earth surface texture
function generateEarthTexture(highContrast: boolean) {
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext("2d");
  if (!ctx) return canvas;

  // Deep slate blue/charcoal ocean base (or white/light-grey in light mode)
  ctx.fillStyle = highContrast ? "#f1f5f9" : "#051124";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Draw technological holographic grid lines
  ctx.strokeStyle = highContrast ? "rgba(16, 185, 129, 0.08)" : "rgba(16, 185, 129, 0.15)";
  ctx.lineWidth = 1;
  const gridSize = 16;
  for (let x = 0; x < canvas.width; x += gridSize) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvas.height);
    ctx.stroke();
  }
  for (let y = 0; y < canvas.height; y += gridSize) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);
    ctx.stroke();
  }

  const drawPolygon = (points: [number, number][], fillColor: string, strokeColor: string) => {
    ctx.fillStyle = fillColor;
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = 2;
    ctx.beginPath();
    points.forEach(([lon, lat], idx) => {
      // Longitude: -180 to 180 -> 0 to canvas.width
      const x = ((lon + 180) / 360) * canvas.width;
      // Latitude: -90 to 90 -> canvas.height to 0
      const y = ((90 - lat) / 180) * canvas.height;
      if (idx === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  };

  // Colored continents setup matching the design theme
  const fillCol = highContrast ? "rgba(5, 150, 105, 0.18)" : "#10b981";
  const strokeCol = highContrast ? "#059669" : "#10b981";

  // Real Continent Polygons (approximate high-fidelity paths)
  const northAmerica: [number, number][] = [
    [-168, 65], [-160, 71], [-140, 70], [-120, 69], [-100, 68], [-80, 73], [-60, 60],
    [-55, 48], [-60, 43], [-70, 42], [-74, 40], [-80, 30], [-81, 25], [-82, 23],
    [-89, 29], [-97, 26], [-97, 20], [-80, 9], [-85, 12], [-90, 14], [-100, 16],
    [-105, 20], [-110, 23], [-115, 32], [-120, 34], [-124, 40], [-125, 48], [-135, 55],
    [-145, 60], [-160, 60]
  ];

  const southAmerica: [number, number][] = [
    [-77, 8], [-72, 11], [-60, 10], [-50, 0], [-35, -6], [-40, -20], [-48, -27],
    [-58, -35], [-63, -40], [-65, -50], [-71, -55], [-75, -50], [-74, -40], [-72, -30],
    [-70, -20], [-80, -10], [-81, -5], [-80, 0], [-77, 4]
  ];

  const greenland: [number, number][] = [
    [-45, 60], [-40, 62], [-35, 65], [-20, 70], [-18, 75], [-20, 80], [-30, 83],
    [-60, 82], [-70, 78], [-73, 76], [-60, 70], [-55, 65], [-50, 60]
  ];

  const africa: [number, number][] = [
    [32, 31], [30, 31], [25, 32], [20, 32], [15, 32], [10, 36], [5, 36], [0, 35],
    [-5, 35], [-8, 32], [-13, 29], [-17, 15], [-15, 12], [-10, 5], [0, 5], [8, 4],
    [9, 2], [10, -5], [12, -10], [13, -20], [18, -30], [20, -34], [26, -33], [33, -28],
    [40, -20], [39, -15], [39, -5], [42, 3], [51, 11], [49, 12], [43, 13], [42, 15],
    [37, 19], [34, 27]
  ];

  const eurasia: [number, number][] = [
    [-9, 38], [-9, 43], [-3, 43], [-2, 49], [5, 50], [5, 55], [5, 60], [10, 62],
    [10, 65], [15, 65], [20, 70], [25, 71], [30, 70], [40, 68], [50, 68], [60, 70],
    [70, 71], [80, 73], [90, 75], [100, 76], [110, 74], [120, 73], [130, 73], [140, 73],
    [150, 70], [160, 70], [170, 67], [180, 66], [175, 60], [165, 55], [160, 50],
    [150, 48], [143, 43], [140, 40], [135, 35], [130, 33], [125, 32], [122, 30],
    [120, 25], [115, 20], [108, 15], [105, 10], [100, 5], [97, 8], [95, 15],
    [90, 22], [88, 22], [80, 10], [77, 8], [72, 18], [68, 23], [60, 25], [55, 15],
    [45, 15], [35, 30], [33, 31], [34, 35], [28, 36], [26, 40], [22, 40], [19, 42],
    [15, 40], [12, 42], [9, 38]
  ];

  const australia: [number, number][] = [
    [113, -26], [115, -21], [120, -18], [125, -15], [130, -12], [136, -12], [142, -10],
    [143, -15], [150, -20], [152, -28], [150, -35], [147, -38], [138, -35], [135, -33],
    [130, -32], [120, -34], [115, -33]
  ];

  const antarctica: [number, number][] = [
    [-180, -68], [-140, -70], [-100, -72], [-60, -68], [-20, -68], [20, -69],
    [60, -66], [100, -66], [140, -68], [180, -68], [180, -90], [-180, -90]
  ];

  const madagascar: [number, number][] = [
    [47, -15], [49, -15], [50, -20], [47, -25], [45, -20]
  ];

  const japan: [number, number][] = [
    [135, 34], [140, 38], [142, 43], [140, 40]
  ];

  // Draw base green continents
  drawPolygon(northAmerica, fillCol, strokeCol);
  drawPolygon(southAmerica, fillCol, strokeCol);
  drawPolygon(africa, fillCol, strokeCol);
  drawPolygon(eurasia, fillCol, strokeCol);
  drawPolygon(australia, fillCol, strokeCol);

  // Draw polar ice caps
  drawPolygon(greenland, highContrast ? "rgba(100,116,139,0.15)" : "rgba(248,250,252,0.3)", strokeCol);
  drawPolygon(antarctica, highContrast ? "rgba(100,116,139,0.15)" : "rgba(255,255,255,0.3)", strokeCol);

  // Draw minor landmasses
  drawPolygon(madagascar, fillCol, strokeCol);
  drawPolygon(japan, fillCol, strokeCol);

  // Draw fluffy cloud clusters (fractal weather patterns) directly on the Earth surface
  ctx.fillStyle = highContrast ? "rgba(5, 150, 105, 0.08)" : "rgba(255, 255, 255, 0.35)";
  for (let i = 0; i < 20; i++) {
    const cx = Math.random() * canvas.width;
    const cy = 100 + Math.random() * 312; // Concentrate clouds in temperate weather bands
    const clusterSize = 8 + Math.floor(Math.random() * 12);
    for (let j = 0; j < clusterSize; j++) {
      const x = cx + (Math.random() - 0.5) * 120;
      const y = cy + (Math.random() - 0.5) * 60;
      const r = 12 + Math.random() * 24;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  return canvas;
}

// Realistic Earth Globe component
function EarthGlobe({ highContrast }: { highContrast: boolean }) {
  const globeRef = useRef<THREE.Mesh>(null);
  const [earthTexture, setEarthTexture] = useState<THREE.Texture | null>(null);

  useEffect(() => {
    // Generate fallback texture immediately to avoid blank/white frame
    const earthCanvas = generateEarthTexture(highContrast);
    const canvasTexture = new THREE.CanvasTexture(earthCanvas);
    canvasTexture.needsUpdate = true;
    setEarthTexture(canvasTexture);

    if (!highContrast) {
      // Try loading satellite Earth texture from multiple CDN sources
      const loader = new THREE.TextureLoader();
      loader.crossOrigin = "anonymous";

      const cacheBuster = `?t=${Date.now()}`;
      const textureUrls = [
        `https://upload.wikimedia.org/wikipedia/commons/thumb/c/cd/Land_ocean_ice_2048.jpg/1024px-Land_ocean_ice_2048.jpg${cacheBuster}`,
        `https://unpkg.com/three-globe@2.31.1/example/img/earth-blue-marble.jpg${cacheBuster}`,
      ];

      let loaded = false;
      textureUrls.forEach((url) => {
        if (loaded) return;
        loader.load(
          url,
          (texture) => {
            if (!loaded) {
              loaded = true;
              texture.colorSpace = THREE.SRGBColorSpace;
              setEarthTexture(texture);
            }
          },
          undefined,
          () => { /* silently try next URL */ }
        );
      });
    }
  }, [highContrast]);

  useFrame(({ clock }) => {
    const time = clock.getElapsedTime();
    if (globeRef.current) {
      globeRef.current.rotation.y = time * 0.035;
      // Organic heartbeat scale pulse
      const pulse = 1.0 + Math.sin(time * 0.6) * 0.015;
      globeRef.current.scale.set(pulse, pulse, pulse);
    }
  });

  return (
    <group>
      {/* Solid Earth Sphere */}
      <mesh ref={globeRef} castShadow receiveShadow>
        <sphereGeometry args={[2.2, 64, 64]} />
        <meshStandardMaterial
          key={earthTexture?.uuid || "none"}
          map={earthTexture || undefined}
          color={earthTexture ? "#ffffff" : "#0a1628"}
          roughness={0.5}
          metalness={0.15}
        />
      </mesh>
    </group>
  );
}

// Glowing atmospheric outer shield
function AtmosphereGlow({ highContrast }: { highContrast: boolean }) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    const time = clock.getElapsedTime();
    if (meshRef.current) {
      // Counter-rotate atmospheric layers and pulse
      meshRef.current.rotation.y = -time * 0.015;
      const pulse = 1.0 + Math.cos(time * 0.6) * 0.012;
      meshRef.current.scale.set(pulse, pulse, pulse);
    }
  });

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[2.26, 32, 32]} />
      <meshBasicMaterial
        color={highContrast ? "#059669" : "#10b981"}
        transparent
        opacity={highContrast ? 0.04 : 0.12}
        side={THREE.BackSide}
      />
    </mesh>
  );
}

// Ambient drifting star background
function FloatingParticles({ highContrast }: { highContrast: boolean }) {
  const pointsRef = useRef<THREE.Points>(null);
  const count = 150;
  
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 18;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 18;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 18;
    }
    return pos;
  }, []);

  useFrame(({ clock }) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y = clock.getElapsedTime() * 0.005;
      pointsRef.current.rotation.x = clock.getElapsedTime() * 0.002;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        color={highContrast ? "#059669" : "#ffffff"}
        size={0.025}
        sizeAttenuation
        transparent
        opacity={highContrast ? 0.15 : 0.45}
        depthWrite={false}
      />
    </points>
  );
}

// Flat SVG earth drawing for browser fallback
function SvgGlobeFallback() {
  return (
    <div className="relative w-72 h-72 sm:w-96 sm:h-96 flex items-center justify-center animate-[spin_60s_linear_infinite]">
      <svg viewBox="0 0 100 100" className="w-full h-full text-emerald-500/25">
        <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="1" />
        <circle cx="50" cy="50" r="44.2" fill="none" stroke="currentColor" strokeWidth="0.2" strokeDasharray="2 2" />
        <path d="M 6,50 A 44,20 0 0 0 94,50" fill="none" stroke="currentColor" strokeWidth="0.6" />
        <path d="M 6,50 A 44,20 0 0 1 94,50" fill="none" stroke="currentColor" strokeWidth="0.6" />
        <path d="M 14,30 A 44,12 0 0 0 86,30" fill="none" stroke="currentColor" strokeWidth="0.6" />
        <path d="M 14,70 A 44,12 0 0 1 86,70" fill="none" stroke="currentColor" strokeWidth="0.6" />
        <path d="M 50,6 A 20,44 0 0 0 50,94" fill="none" stroke="currentColor" strokeWidth="0.6" />
        <path d="M 50,6 A 20,44 0 0 1 50,94" fill="none" stroke="currentColor" strokeWidth="0.6" />
      </svg>
    </div>
  );
}

export default function ThreeGlobe() {
  const [useFallback, setUseFallback] = useState(false);
  const [mounted, setMounted] = useState(false);

  const context = useContext(DashboardContext);
  const highContrast = context ? context.highContrast : false;

  useEffect(() => {
    setMounted(true);
    try {
      const canvas = document.createElement("canvas");
      const support = !!(
        window.WebGLRenderingContext &&
        (canvas.getContext("webgl") || canvas.getContext("experimental-webgl"))
      );
      if (!support) {
        setUseFallback(true);
      }
    } catch {
      setUseFallback(true);
    }
  }, []);

  if (!mounted) {
    return (
      <div className="w-72 h-72 flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (useFallback) {
    return <SvgGlobeFallback />;
  }

  return (
    <div className="relative w-full h-[380px] sm:h-[480px]">
      <Canvas camera={{ position: [0, 0, 5], fov: 60 }} shadows>
        <ambientLight intensity={highContrast ? 0.8 : 0.45} />
        {/* Directional Sunlight */}
        <directionalLight
          position={[5, 3, 5]}
          intensity={highContrast ? 1.0 : 1.5}
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
        />
        <EarthGlobe highContrast={highContrast} />
        <AtmosphereGlow highContrast={highContrast} />
        <FloatingParticles highContrast={highContrast} />
        <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={0.5} />
      </Canvas>
    </div>
  );
}

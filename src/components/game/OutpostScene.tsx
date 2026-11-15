import { Canvas } from "@react-three/fiber";
import { Environment, Lightformer, OrbitControls } from "@react-three/drei";
import { useMemo } from "react";
import * as THREE from "three";
import type { GameState } from "@/game/types";

// Presentation only: draws what the outpost owns; never changes game state.
function groundTexture(moon: boolean) {
  const c = document.createElement("canvas");
  c.width = c.height = 256;
  const g = c.getContext("2d")!;
  g.fillStyle = moon ? "#8d8f94" : "#a4532f";
  g.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 900; i++) {
    const v = Math.random() * 40 - 20;
    g.fillStyle = moon ? `rgba(${120 + v},${122 + v},${128 + v},0.6)` : `rgba(${150 + v},${70 + v},${40 + v},0.6)`;
    g.beginPath();
    g.arc(Math.random() * 256, Math.random() * 256, Math.random() * 4, 0, 7);
    g.fill();
  }
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(8, 8);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

function Dome({ x, z, r }: { x: number; z: number; r: number }) {
  return (
    <group position={[x, 0, z]}>
      <mesh castShadow><sphereGeometry args={[r, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2]} /><meshStandardMaterial color="#e8e6e1" metalness={0.3} roughness={0.4} /></mesh>
      <mesh position={[0, 0.05, 0]}><cylinderGeometry args={[r * 1.05, r * 1.05, 0.1, 32]} /><meshStandardMaterial color="#555" /></mesh>
    </group>
  );
}

function Panel({ x, z, big }: { x: number; z: number; big: boolean }) {
  const w = big ? 2.2 : 1.5;
  return (
    <group position={[x, 0, z]}>
      <mesh position={[0, 0.5, 0]}><cylinderGeometry args={[0.05, 0.05, 1]} /><meshStandardMaterial color="#888" /></mesh>
      <mesh position={[0, 1, 0]} rotation={[-0.6, 0, 0]} castShadow><boxGeometry args={[w, 0.05, 1.1]} /><meshStandardMaterial color="#1d3a7a" metalness={0.6} roughness={0.2} /></mesh>
    </group>
  );
}

function Tank({ x, z, color }: { x: number; z: number; color: string }) {
  return <mesh position={[x, 0.6, z]} castShadow><cylinderGeometry args={[0.45, 0.45, 1.2, 20]} /><meshStandardMaterial color={color} metalness={0.5} roughness={0.3} /></mesh>;
}

function Rover({ x, z }: { x: number; z: number }) {
  return (
    <group position={[x, 0, z]} rotation={[0, 0.7, 0]}>
      <mesh position={[0, 0.5, 0]} castShadow><boxGeometry args={[1.4, 0.4, 0.9]} /><meshStandardMaterial color="#d9d4c7" /></mesh>
      <mesh position={[0.4, 0.95, 0]}><boxGeometry args={[0.3, 0.5, 0.3]} /><meshStandardMaterial color="#333" /></mesh>
      {[-0.5, 0, 0.5].flatMap((dx) => [-0.5, 0.5].map((dz) => (
        <mesh key={`${dx}${dz}`} position={[dx, 0.25, dz]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.22, 0.22, 0.15, 16]} /><meshStandardMaterial color="#222" /></mesh>
      )))}
    </group>
  );
}

export default function OutpostScene({ state }: { state: GameState }) {
  const moon = state.place === "moon";
  const tex = useMemo(() => groundTexture(moon), [moon]);
  const count = (id: string) => state.purchases?.filter((p) => p === id).length ?? 0;
  const waterTanks = state.shieldBonus;
  const o2 = count("oxygen");
  const shelves = count("garden");
  const batteries = count("battery");
  const bigSolar = state.crates.includes("solar");
  return (
    <div className="h-[420px] w-full overflow-hidden rounded-xl" data-scene-ready>
      <Canvas shadows camera={{ position: [9, 7, 11], fov: 45 }}>
        <color attach="background" args={[moon ? "#05060a" : "#2a1410"]} />
        <fog attach="fog" args={[moon ? "#05060a" : "#3a1c14", 18, 45]} />
        <ambientLight intensity={0.4} />
        <directionalLight position={[8, 12, 5]} intensity={2} castShadow />
        <Environment><Lightformer intensity={2} position={[0, 5, 0]} scale={[10, 10, 1]} /></Environment>
        <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow><planeGeometry args={[80, 80]} /><meshStandardMaterial map={tex} roughness={1} /></mesh>
        <Dome x={0} z={0} r={2} />
        <Dome x={-3.5} z={1} r={1.3} />
        {shelves > 0 && <Dome x={3} z={-2} r={1 + shelves * 0.15} />}
        {[0, 1, 2].map((i) => <Panel key={i} x={-4 + i * 2.4} z={-5} big={bigSolar} />)}
        {bigSolar && [0, 1].map((i) => <Panel key={`b${i}`} x={3.5 + i * 2.4} z={-5.5} big />)}
        {Array.from({ length: waterTanks }, (_, i) => <Tank key={`w${i}`} x={-6 + i * 1.1} z={3} color="#4aa3df" />)}
        {Array.from({ length: o2 }, (_, i) => <Tank key={`o${i}`} x={2 + i * 1.1} z={3.5} color="#e9eef2" />)}
        {Array.from({ length: batteries }, (_, i) => (
          <mesh key={`bt${i}`} position={[5.5, 0.35, i * 0.9]} castShadow><boxGeometry args={[0.8, 0.7, 0.7]} /><meshStandardMaterial color="#e3b23c" /></mesh>
        ))}
        {state.crates.includes("rover") && <Rover x={5} z={4} />}
        <OrbitControls enablePan={false} minDistance={6} maxDistance={25} maxPolarAngle={1.45} />
      </Canvas>
    </div>
  );
}

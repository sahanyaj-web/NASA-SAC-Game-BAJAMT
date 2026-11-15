import { Canvas } from "@react-three/fiber";
import { Environment, Lightformer, OrbitControls, Stars } from "@react-three/drei";
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

const metal = { color: "#d8d6d0", metalness: 0.55, roughness: 0.45 } as const;

// Seeded random so the landscape stays the same between renders.
function rng(seed: number) {
  return () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
}

function Terrain({ moon, tex }: { moon: boolean; tex: THREE.Texture }) {
  const geo = useMemo(() => {
    const g = new THREE.PlaneGeometry(120, 120, 160, 160);
    const pos = g.getAttribute("position") as THREE.BufferAttribute;
    const r = rng(moon ? 7 : 11);
    const craters = Array.from({ length: moon ? 40 : 14 }, () => ({ x: r() * 110 - 55, y: r() * 110 - 55, rad: 1 + r() * (moon ? 5 : 3) }));
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i), y = pos.getY(i);
      const d0 = Math.hypot(x, y);
      let h = Math.sin(x * 0.08) * Math.cos(y * 0.07) * 1.2 + Math.sin(x * 0.31 + y * 0.17) * 0.25;
      if (!moon) h += Math.max(0, d0 - 25) * 0.12 * (1 + Math.sin(Math.atan2(y, x) * 3));
      for (const c of craters) {
        const d = Math.hypot(x - c.x, y - c.y) / c.rad;
        if (d < 1) h -= (1 - d * d) * c.rad * 0.35;
        else if (d < 1.4) h += Math.sin(((d - 1) / 0.4) * Math.PI) * c.rad * 0.12;
      }
      h *= Math.min(1, Math.max(0, (d0 - 8) / 10)); // flat pad under the base
      pos.setZ(i, h);
    }
    g.computeVertexNormals();
    return g;
  }, [moon]);
  return <mesh geometry={geo} rotation={[-Math.PI / 2, 0, 0]} receiveShadow><meshStandardMaterial map={tex} roughness={1} /></mesh>;
}

function Rocks({ moon }: { moon: boolean }) {
  const rocks = useMemo(() => {
    const r = rng(moon ? 3 : 5);
    return Array.from({ length: 70 }, () => {
      const a = r() * Math.PI * 2, d = 9 + r() * 30;
      return { p: [Math.cos(a) * d, 0, Math.sin(a) * d] as [number, number, number], s: 0.15 + r() ** 3 * 1.2, rot: r() * 6 };
    });
  }, [moon]);
  return (
    <>
      {rocks.map((k, i) => (
        <mesh key={i} position={k.p} rotation={[k.rot, k.rot * 2, 0]} scale={[k.s, k.s * 0.7, k.s]} castShadow receiveShadow>
          <dodecahedronGeometry args={[1, 0]} />
          <meshStandardMaterial color={moon ? "#77787c" : "#7a3a22"} roughness={0.95} flatShading />
        </mesh>
      ))}
    </>
  );
}

/** Cylindrical habitat module lying on its side, with end caps, windows and feet. */
function Module({ x, z, len = 4, r = 1.1, rot = 0 }: { x: number; z: number; len?: number; r?: number; rot?: number }) {
  return (
    <group position={[x, r + 0.3, z]} rotation={[0, rot, 0]}>
      <mesh rotation={[0, 0, Math.PI / 2]} castShadow receiveShadow><cylinderGeometry args={[r, r, len, 32]} /><meshStandardMaterial {...metal} /></mesh>
      {[-1, 1].map((sd) => (
        <mesh key={sd} position={[(sd * len) / 2, 0, 0]} scale={[0.35, 1, 1]} castShadow><sphereGeometry args={[r, 24, 16]} /><meshStandardMaterial {...metal} /></mesh>
      ))}
      {Array.from({ length: Math.floor(len) + 1 }, (_, i) => (
        <mesh key={i} position={[-len / 2 + i * (len / Math.floor(len)), 0, 0]} rotation={[0, 0, Math.PI / 2]}><torusGeometry args={[r + 0.02, 0.04, 8, 32]} /><meshStandardMaterial color="#8c8a85" metalness={0.7} roughness={0.4} /></mesh>
      ))}
      {[-0.8, 0.8].map((wx) => (
        <mesh key={wx} position={[wx, 0.25, r - 0.02]}><circleGeometry args={[0.2, 20]} /><meshStandardMaterial color="#ffd27a" emissive="#ffb347" emissiveIntensity={1.2} /></mesh>
      ))}
      {[-len / 3, len / 3].flatMap((fx) => [-0.6, 0.6].map((fz) => (
        <mesh key={`${fx}${fz}`} position={[fx, -r, fz]}><cylinderGeometry args={[0.07, 0.12, 0.6]} /><meshStandardMaterial color="#555" metalness={0.6} /></mesh>
      )))}
    </group>
  );
}

function Dome({ x, z, r, glass = false }: { x: number; z: number; r: number; glass?: boolean }) {
  return (
    <group position={[x, 0, z]}>
      <mesh castShadow><sphereGeometry args={[r, 40, 20, 0, Math.PI * 2, 0, Math.PI / 2]} />
        {glass ? <meshPhysicalMaterial color="#cfe8d0" transmission={0.6} roughness={0.15} thickness={0.3} transparent opacity={0.55} /> : <meshStandardMaterial color="#e6e2da" roughness={0.75} />}
      </mesh>
      {glass && <mesh position={[0, 0.3, 0]}><cylinderGeometry args={[r * 0.8, r * 0.8, 0.5, 24]} /><meshStandardMaterial color="#3f8a3a" roughness={0.9} /></mesh>}
      <mesh position={[0, 0.08, 0]}><cylinderGeometry args={[r * 1.04, r * 1.08, 0.16, 40]} /><meshStandardMaterial color="#6b6b6b" metalness={0.5} roughness={0.5} /></mesh>
      <mesh position={[r * 0.98, 0.45, 0]} rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[0.35, 0.35, 0.5, 16]} /><meshStandardMaterial {...metal} /></mesh>
    </group>
  );
}

function Panel({ x, z, big }: { x: number; z: number; big: boolean }) {
  const w = big ? 2.6 : 1.8;
  return (
    <group position={[x, 0, z]}>
      <mesh position={[0, 0.6, 0]} castShadow><cylinderGeometry args={[0.06, 0.08, 1.2]} /><meshStandardMaterial color="#9a9a9a" metalness={0.8} roughness={0.3} /></mesh>
      <group position={[0, 1.25, 0]} rotation={[-0.55, 0, 0]}>
        <mesh castShadow><boxGeometry args={[w, 0.04, 1.3]} /><meshStandardMaterial color="#0e1f45" metalness={0.85} roughness={0.15} /></mesh>
        {Array.from({ length: 5 }, (_, i) => <mesh key={i} position={[-w / 2 + (i + 0.5) * (w / 5), 0.025, 0]}><boxGeometry args={[0.02, 0.01, 1.3]} /><meshStandardMaterial color="#b8c0cc" metalness={0.9} /></mesh>)}
      </group>
    </group>
  );
}

function Tank({ x, z, color }: { x: number; z: number; color: string }) {
  return (
    <group position={[x, 0, z]}>
      <mesh position={[0, 0.75, 0]} castShadow><capsuleGeometry args={[0.4, 0.7, 8, 20]} /><meshStandardMaterial color={color} metalness={0.6} roughness={0.3} /></mesh>
      <mesh position={[0, 0.1, 0]}><cylinderGeometry args={[0.45, 0.5, 0.2, 16]} /><meshStandardMaterial color="#444" metalness={0.6} /></mesh>
    </group>
  );
}

function Rover({ x, z }: { x: number; z: number }) {
  return (
    <group position={[x, 0, z]} rotation={[0, 0.7, 0]}>
      <mesh position={[0, 0.65, 0]} castShadow><boxGeometry args={[1.8, 0.35, 1.1]} /><meshStandardMaterial color="#e8e4da" metalness={0.3} roughness={0.5} /></mesh>
      <mesh position={[0.2, 0.95, 0]} castShadow><boxGeometry args={[0.9, 0.3, 0.9]} /><meshStandardMaterial color="#c9c4b8" /></mesh>
      <mesh position={[-0.6, 1.4, 0]}><cylinderGeometry args={[0.04, 0.04, 0.9]} /><meshStandardMaterial color="#777" /></mesh>
      <mesh position={[-0.6, 1.9, 0]} castShadow><boxGeometry args={[0.35, 0.2, 0.25]} /><meshStandardMaterial color="#333" /></mesh>
      <mesh position={[0.8, 1.1, 0.4]} rotation={[0, 0, -0.3]}><boxGeometry args={[0.02, 0.6, 0.6]} /><meshStandardMaterial color="#0e1f45" metalness={0.8} roughness={0.2} /></mesh>
      {[-0.65, 0, 0.65].flatMap((dx) => [-0.65, 0.65].map((dz) => (
        <mesh key={`${dx}${dz}`} position={[dx, 0.28, dz]} rotation={[Math.PI / 2, 0, 0]} castShadow><cylinderGeometry args={[0.28, 0.28, 0.2, 18]} /><meshStandardMaterial color="#3a3a3a" roughness={0.9} /></mesh>
      )))}
    </group>
  );
}

function Dish({ x, z }: { x: number; z: number }) {
  return (
    <group position={[x, 0, z]}>
      <mesh position={[0, 1, 0]}><cylinderGeometry args={[0.08, 0.15, 2]} /><meshStandardMaterial color="#888" metalness={0.7} /></mesh>
      <mesh position={[0, 2.2, 0]} rotation={[-0.9, 0, 0]} castShadow><sphereGeometry args={[1, 32, 12, 0, Math.PI * 2, 0, 0.9]} /><meshStandardMaterial color="#eeeeea" side={THREE.DoubleSide} metalness={0.4} roughness={0.4} /></mesh>
    </group>
  );
}

function Tag({ pos, text }: { pos: [number, number, number]; text: string }) {
  return (
    <Html position={pos} center distanceFactor={14} zIndexRange={[10, 0]}>
      <div className="pointer-events-none whitespace-nowrap rounded-full border border-primary bg-card/90 px-2 py-0.5 text-xs font-bold text-foreground shadow-lg">{text}</div>
    </Html>
  );
}

function Reactor({ x, z }: { x: number; z: number }) {
  return (
    <group position={[x, 0, z]}>
      <mesh position={[0, 0.9, 0]} castShadow><cylinderGeometry args={[0.7, 0.9, 1.8, 24]} /><meshStandardMaterial color="#d8d8d0" metalness={0.6} roughness={0.35} /></mesh>
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <mesh key={i} position={[Math.cos(i) * 1.1, 1.1, Math.sin(i) * 1.1]} rotation={[0, -i, 0]} castShadow><boxGeometry args={[0.05, 1.4, 0.6]} /><meshStandardMaterial color="#444" metalness={0.8} /></mesh>
      ))}
      <mesh position={[0, 1.85, 0]}><cylinderGeometry args={[0.3, 0.3, 0.1, 16]} /><meshStandardMaterial color="#f5c518" emissive="#f5c518" emissiveIntensity={0.8} /></mesh>
    </group>
  );
}

function Crate({ x, z, color }: { x: number; z: number; color: string }) {
  return (
    <group position={[x, 0, z]}>
      {[[0, 0.4, 0], [0.85, 0.4, 0.1], [0.4, 1.2, 0.05]].map((p, i) => (
        <mesh key={i} position={p as [number, number, number]} castShadow><boxGeometry args={[0.8, 0.8, 0.8]} /><meshStandardMaterial color={color} roughness={0.7} /></mesh>
      ))}
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
  const has = (id: string) => count(id) > 0;
  const sunPos: [number, number, number] = moon ? [-20, 6, 8] : [15, 18, 10];
  return (
    <div className="h-[460px] w-full overflow-hidden rounded-xl" data-scene-ready>
      <Canvas shadows camera={{ position: [12, 8, 14], fov: 45 }} gl={{ toneMapping: THREE.ACESFilmicToneMapping }}>
        <color attach="background" args={[moon ? "#020308" : "#c9906a"]} />
        <fog attach="fog" args={moon ? ["#020308", 40, 90] : ["#c48a63", 20, 70]} />
        {moon && <Stars radius={100} depth={40} count={3000} factor={4} fade />}
        {moon && <mesh position={[-30, 22, -50]}><sphereGeometry args={[3, 32, 32]} /><meshStandardMaterial color="#4a7fd6" emissive="#2a4f9a" emissiveIntensity={0.6} /></mesh>}
        <hemisphereLight args={[moon ? "#556" : "#f2c6a0", moon ? "#111" : "#5a2a18", moon ? 0.15 : 0.6]} />
        <directionalLight position={sunPos} intensity={moon ? 3.2 : 2.2} color={moon ? "#ffffff" : "#ffe2c4"} castShadow shadow-mapSize={[2048, 2048]} shadow-camera-left={-20} shadow-camera-right={20} shadow-camera-top={20} shadow-camera-bottom={-20} />
        <Environment resolution={64}>
          <Lightformer intensity={moon ? 0.6 : 1.5} color={moon ? "#99a" : "#e8b08a"} position={[0, 8, 0]} scale={[20, 20, 1]} rotation-x={Math.PI / 2} />
          <Lightformer intensity={1} position={sunPos} scale={[6, 6, 1]} />
        </Environment>
        <Terrain moon={moon} tex={tex} />
        <Rocks moon={moon} />
        <Module x={0} z={0} len={4.5} />
        <Module x={-1.5} z={3.2} len={3} r={0.9} rot={Math.PI / 2} />
        <Dome x={-4.5} z={-0.5} r={1.8} />
        {has("livingdome") && <Module x={4.5} z={-1.5} len={3.5} rot={0.3} />}
        {shelves > 0 && <Dome x={3.2} z={2.8} r={1.1 + shelves * 0.15} glass />}
        {[0, 1, 2, 3].map((i) => <Panel key={i} x={-5 + i * 2.6} z={-6} big={bigSolar} />)}
        {bigSolar && [0, 1, 2].map((i) => <Panel key={`b${i}`} x={-5 + i * 3} z={-8.5} big />)}
        {Array.from({ length: waterTanks }, (_, i) => <Tank key={`w${i}`} x={-7.5 + i * 1.1} z={3.5} color="#5a9fd0" />)}
        {Array.from({ length: o2 }, (_, i) => <Tank key={`o${i}`} x={1.5 + i * 1.1} z={5.5} color="#e9eef2" />)}
        {Array.from({ length: batteries }, (_, i) => (
          <mesh key={`bt${i}`} position={[6.5, 0.45, 2 + i * 1]} castShadow><boxGeometry args={[0.9, 0.9, 0.8]} /><meshStandardMaterial color="#c9a23a" metalness={0.4} roughness={0.5} /></mesh>
        ))}
        {has("radiodish") && <Dish x={-7} z={-3} />}
        {has("bermwall") && <mesh position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}><torusGeometry args={[9, 0.7, 8, 48, Math.PI * 1.3]} /><meshStandardMaterial color={moon ? "#7d7e82" : "#8a4428"} roughness={1} flatShading /></mesh>}
        {has("brushbot") && <mesh position={[-2, 0.25, -4.2]} castShadow><boxGeometry args={[0.6, 0.3, 0.4]} /><meshStandardMaterial color="#f0b030" /></mesh>}
        {state.crates.includes("rover") && <><Rover x={5.5} z={5.5} /><Tag pos={[5.5, 2.2, 5.5]} text="🚙 Rocket box: Robot car" /></>}
        {state.crates.includes("solar") && <Tag pos={[-2, 2.6, -8.5]} text="🔆 Rocket box: Extra solar panels" />}
        {state.crates.includes("reactor") && <><Reactor x={8} z={-4} /><Tag pos={[8, 3, -4]} text="⚛️ Rocket box: Nuclear power" /></>}
        {state.crates.includes("water") && <>{[0, 1, 2].map((i) => <Tank key={`cw${i}`} x={-8 + i * 1.3} z={6} color="#2f7fd0" />)}<Tag pos={[-6.7, 3, 6]} text="💧 Rocket box: Water tanks" /></>}
        {state.crates.includes("battery") && <><mesh position={[7.5, 0.7, 5]} castShadow><boxGeometry args={[1.6, 1.4, 1.2]} /><meshStandardMaterial color="#2a9d4a" metalness={0.4} roughness={0.4} /></mesh><Tag pos={[7.5, 2.4, 5]} text="🔋 Rocket box: Big battery" /></>}
        {state.crates.includes("food") && <><Crate x={-3.5} z={6.5} color="#d9822b" /><Tag pos={[-3.1, 2.4, 6.5]} text="🥫 Rocket box: Food stash" /></>}
        {waterTanks > 0 && <Tag pos={[-7.5, 2.4, 3.5]} text="💧 Water tanks" />}
        {o2 > 0 && <Tag pos={[1.5, 2.4, 5.5]} text={`🫁 Oxygen tanks ×${o2}`} />}
        {shelves > 0 && <Tag pos={[3.2, 2.6, 2.8]} text="🥬 Plant room" />}
        {batteries > 0 && <Tag pos={[6.5, 1.8, 2]} text={`🔋 Extra batteries ×${batteries}`} />}
        {has("livingdome") && <Tag pos={[4.5, 2.6, -1.5]} text="🏠 Living dome" />}
        {has("radiodish") && <Tag pos={[-7, 4, -3]} text="📡 Radio dish" />}
        {has("bermwall") && <Tag pos={[0, 2, 9]} text="🧱 Dirt wall" />}
        {has("brushbot") && <Tag pos={[-2, 1.2, -4.2]} text="🧹 Dust brush robot" />}
        <OrbitControls enablePan={false} minDistance={7} maxDistance={30} maxPolarAngle={1.42} autoRotate autoRotateSpeed={0.4} />
      </Canvas>
    </div>
  );
}

import React, { useMemo, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { Html, OrbitControls } from "@react-three/drei";
import { a, useSpring } from "@react-spring/three";
import * as THREE from "three";

const Bar = ({ category, amount, maxAmount, position, color, isHovered, onHover, onUnhover }) => {
  const targetHeight = (amount / maxAmount) * 5 + 0.5;

  const { scale } = useSpring({
    scale: [1, isHovered ? targetHeight * 1.1 : targetHeight, 1],
    config: { mass: 1, tension: 120, friction: 14 }
  });

  return (
    <a.mesh
      position={position}
      scale={scale}
      onPointerOver={onHover}
      onPointerOut={onUnhover}
      castShadow
      receiveShadow
    >
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color={color} />
      <Html position={[0, targetHeight / 2 + 0.2, 0]} center>
        {isHovered && (
          <div className="bg-black/70 text-white text-xs px-2 py-1 rounded shadow">
            {category}: Rs. {amount.toLocaleString()}
          </div>
        )}
      </Html>
    </a.mesh>
  );
};

const Axis = ({ length = 10 }) => {
  const lineMaterial = new THREE.LineBasicMaterial({ color: "white" });
  return (
    <group>
      {/* X-axis */}
      <line>
        <bufferGeometry attach="geometry">
          <bufferAttribute
            attachObject={["attributes", "position"]}
            array={new Float32Array([-length, 0, 0, length, 0, 0])}
            count={2}
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial color="white" />
      </line>
      {/* Y-axis */}
      <line>
        <bufferGeometry attach="geometry">
          <bufferAttribute
            attachObject={["attributes", "position"]}
            array={new Float32Array([0, 0, 0, 0, length, 0])}
            count={2}
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial color="white" />
      </line>
      {/* Z-axis */}
      <line>
        <bufferGeometry attach="geometry">
          <bufferAttribute
            attachObject={["attributes", "position"]}
            array={new Float32Array([0, 0, -length, 0, 0, length])}
            count={2}
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial color="white" />
      </line>
    </group>
  );
};

const Spending3DChart = ({ data }) => {
  const [hoveredIndex, setHoveredIndex] = useState(null);

  const { bars, maxAmount } = useMemo(() => {
    const entries = Object.entries(data);
    const max = Math.max(...entries.map(([, amount]) => amount));
    const bars = entries.map(([category, amount], i) => ({
      category,
      amount,
      color: `hsl(${(i * 137.5) % 360}, 70%, 50%)`,
      position: [i * 2 - entries.length + 1, 0, 0], // X-axis layout
    }));
    return { bars, maxAmount: max };
  }, [data]);

  return (
    <div className="w-full h-full">
      <Canvas shadows camera={{ position: [0, 8, 15], fov: 50 }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[5, 10, 5]} intensity={1} castShadow />
        
        {/* Grid and axes */}
        <Axis length={10} />
        <gridHelper args={[20, 20, "white", "gray"]} />

        {/* Bars */}
        {bars.map((bar, idx) => (
          <Bar
            key={idx}
            category={bar.category}
            amount={bar.amount}
            maxAmount={maxAmount}
            position={bar.position}
            color={bar.color}
            isHovered={hoveredIndex === idx}
            onHover={() => setHoveredIndex(idx)}
            onUnhover={() => setHoveredIndex(null)}
          />
        ))}

        {/* Orbit controls */}
        <OrbitControls enablePan enableZoom enableRotate />
      </Canvas>
    </div>
  );
};

export default Spending3DChart;

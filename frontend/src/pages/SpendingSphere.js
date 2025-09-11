import React, { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { a, useSpring } from "@react-spring/three";
import { Html } from "@react-three/drei";

const SpendingSphere = ({ category, amount, orbitRadius, speed, color }) => {
  const meshRef = useRef();

  const targetSize = Math.sqrt(amount) / 10;

  // smooth scaling animation
  const { scale } = useSpring({
    scale: [targetSize, targetSize, targetSize],
    config: { mass: 1, tension: 200, friction: 20 }
  });

  // orbit animation
  useFrame((state) => {
    if (meshRef.current) {
      const t = state.clock.getElapsedTime() * speed;
      meshRef.current.position.x = Math.cos(t) * orbitRadius;
      meshRef.current.position.z = Math.sin(t) * orbitRadius;
    }
  });

  return (
    <a.mesh ref={meshRef} scale={scale}>
      <sphereGeometry args={[1, 32, 32]} />
      <meshStandardMaterial color={color} />
      <Html position={[0, 0, targetSize + 0.5]} center>
        <div className="bg-black/70 text-white text-xs px-2 py-1 rounded">
          {category}: Rs. {amount}
        </div>
      </Html>
    </a.mesh>
  );
};

export default SpendingSphere;

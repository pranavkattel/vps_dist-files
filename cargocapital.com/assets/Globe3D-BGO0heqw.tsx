import { useRef, useMemo, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, useTexture } from '@react-three/drei';
import * as THREE from 'three';
import earthTextureImg from '../assets/images/earth_texture.jpg';

const Globe = () => {
  const meshRef = useRef<THREE.Mesh>(null);
  const groupRef = useRef<THREE.Group>(null);

  const globeRadius = 2.5; // Increased size for better visibility

  // Load Earth texture from local assets for reliable rendering
  const earthTexture = useTexture(earthTextureImg);

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.001;
    }
  });

  return (
    <group ref={groupRef} scale={[1.1, 1.1, 1.1]}>
      {/* Main globe with land masses only - Light grey tinted */}
      <mesh 
        ref={meshRef} 
        geometry={useMemo(() => new THREE.SphereGeometry(globeRadius, 64, 64), [])}
      >
        <meshStandardMaterial 
          map={earthTexture}
          color="#CBD5E0"
          roughness={0.4}
          metalness={0.1}
          transparent={false}
          opacity={1.0}
        />
      </mesh>

      {/* Subtle atmospheric glow - Light smoke grey */}
      <mesh geometry={useMemo(() => new THREE.SphereGeometry(globeRadius * 1.02, 64, 64), [])}>
        <meshBasicMaterial 
          color="#E2E8F0" 
          transparent 
          opacity={0.15}
          side={THREE.BackSide}
        />
      </mesh>

      {/* Continent markers removed - now showing on hero background */}

      {/* Bright lighting for land visibility - Light grey tones */}
      <ambientLight intensity={1.5} color="#E2E8F0" />
      <directionalLight 
        position={[5, 3, 5]} 
        intensity={2.2} 
        color="#F7FAFC"
        castShadow={false}
      />
      <directionalLight 
        position={[-3, 2, -3]} 
        intensity={1.8} 
        color="#E2E8F0"
      />
      <directionalLight 
        position={[0, 5, 0]} 
        intensity={1.5} 
        color="#CBD5E0"
      />
    </group>
  );
};

const Globe3D = () => {
  return (
    <div className="flex items-center justify-center relative">
      {/* Sun rays effect behind the globe */}
      <div 
        className="absolute inset-0 rounded-full"
        style={{
          width: 'min(20rem, 40vw)',
          aspectRatio: '1 / 1',
          background: 'radial-gradient(circle at center, rgba(59, 130, 246, 0.3) 0%, rgba(59, 130, 246, 0.15) 30%, rgba(59, 130, 246, 0.05) 60%, transparent 70%)',
          filter: 'blur(2px)',
          animation: 'pulse 4s ease-in-out infinite'
        }}
      />
      
      {/* Circular cutout using theme colors with inner shadow */}
      <div
        className="rounded-full overflow-hidden relative z-10"
        style={{
          width: 'min(20rem, 40vw)',
          aspectRatio: '1 / 1',
          background: 'linear-gradient(180deg, #08306B 0%, #041226 100%)',
          boxShadow: `
            inset 0 0 40px rgba(4,18,38,0.85), 
            0 8px 30px rgba(4,18,38,0.25), 
            0 0 40px rgba(8,48,107,0.12),
            0 0 80px rgba(59, 130, 246, 0.2),
            0 0 120px rgba(59, 130, 246, 0.1)
          `,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '3px solid rgba(2,6,23,0.6)'
        }}
      >
        <Canvas
          style={{ width: '100%', height: '100%', background: 'transparent' }}
          camera={{ position: [0, 0, 6], fov: 45 }}
        >
          <Suspense fallback={null}>
            <OrbitControls
              enableZoom={false}
              enablePan={false}
              autoRotate
              autoRotateSpeed={0.3}
              minDistance={8}
              maxDistance={8}
              enableDamping={true}
              dampingFactor={0.1}
              target={[0, 0, 0]}
              makeDefault
            />
            <Globe />
          </Suspense>
        </Canvas>
      </div>
      
      {/* Add keyframe animation in style tag */}
      <style>{`
        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
            opacity: 0.6;
          }
          50% {
            transform: scale(1.05);
            opacity: 0.8;
          }
        }
      `}</style>
    </div>
  );
};

export default Globe3D;

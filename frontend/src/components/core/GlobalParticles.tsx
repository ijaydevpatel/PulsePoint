"use client";
import React, { useRef, useMemo, useEffect, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useTheme } from '@/components/core/ThemeProvider';

const ParticleField = ({ count = 300, theme = 'dark' }) => {
  const mesh = useRef<THREE.InstancedMesh>(null);
  const light = useRef<THREE.PointLight>(null);

  const particles = useMemo(() => {
    const temp = [];
    const isDark = theme === 'dark';
    
    // Theme-specific color mapping
    // Dark Mode: White and Burgundy
    // Light Mode: Soft Gray and Burgundy
    const burgundyColor = '#D92544';  

    for (let i = 0; i < count; i++) {
      const time = Math.random() * 100;
      const factor = Math.random() * 0.5 + 0.5;
      const x = (Math.random() - 0.5) * 50;
      const y = (Math.random() - 0.5) * 50;
      const z = (Math.random() - 0.5) * 20;
      
      const color = new THREE.Color(burgundyColor);
      
      temp.push({ time, factor, x, y, z, color });
    }
    return temp;
  }, [count, theme]);

  const dummy = useMemo(() => new THREE.Object3D(), []);
  
  const particleTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const context = canvas.getContext('2d');
    if (context) {
        const gradient = context.createRadialGradient(32, 32, 0, 32, 32, 32);
        gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
        gradient.addColorStop(0.2, 'rgba(255, 255, 255, 0.9)');
        gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.2)');
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        context.fillStyle = gradient;
        context.fillRect(0, 0, 64, 64);
    }
    return new THREE.CanvasTexture(canvas);
  }, []);

  useFrame((state) => {
    particles.forEach((particle, i) => {
      let { time, factor, x, y, z } = particle;
      time = particle.time += 0.003;
      
      const px = x + Math.cos(time * factor) * 1.5;
      const py = y + Math.sin(time * factor) * 2;
      const pz = z + Math.sin(time * 0.5) * 0.5;
      
      dummy.position.set(px, py, pz);
      dummy.rotation.set(0, 0, 0);
      
      // Fixed small dot size 
      dummy.scale.set(0.12, 0.12, 0.12);
      dummy.updateMatrix();
      
      if (mesh.current) {
        mesh.current.setMatrixAt(i, dummy.matrix);
        mesh.current.setColorAt(i, particle.color);
      }
    });

    if (mesh.current) {
      mesh.current.instanceMatrix.needsUpdate = true;
      if (mesh.current.instanceColor) {
        mesh.current.instanceColor.needsUpdate = true;
      }
    }
  });

  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight ref={light} distance={40} intensity={0.8} color="#D92544" />
      <instancedMesh ref={mesh} args={[undefined, undefined, count]}>
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial 
          map={particleTexture}
          transparent={true}
          opacity={1}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </instancedMesh>
    </>
  );
};

export function GlobalParticles() {
  const [mounted, setMounted] = useState(false);
  const { theme } = useTheme();
  
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-[40] opacity-100">
      <Canvas 
        camera={{ position: [0, 0, 15], fov: 75 }} 
        gl={{ antialias: true, alpha: true }}
        style={{ pointerEvents: 'none' }}
      >
        <ParticleField count={315} theme={theme} />
      </Canvas>
    </div>
  );
}

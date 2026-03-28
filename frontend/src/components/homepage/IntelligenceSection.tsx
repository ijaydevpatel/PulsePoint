"use client";
import React, { useRef } from "react";
import { motion } from "framer-motion";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Icosahedron } from "@react-three/drei";

function OrganicCell() {
  const meshRef = useRef<any>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.elapsedTime * 0.1;
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.15;
    }
  });

  return (
    <Icosahedron ref={meshRef} args={[2, 6]}>
      <meshPhysicalMaterial
        color="#ffffff"
        emissive="#8A1B33"
        emissiveIntensity={0.2}
        roughness={0.1}
        metalness={0.1}
        clearcoat={1}
        clearcoatRoughness={0.1}
        transmission={0.8}
        thickness={1.5}
      />
    </Icosahedron>
  );
}

export function IntelligenceSection() {
  return (
    <section className="py-32 w-full relative z-10 bg-surface-low overflow-hidden">
      <div className="max-w-[1400px] mx-auto px-8 md:px-16 flex flex-col-reverse lg:flex-row items-center gap-16">
        
        {/* Left: 3D Visual */}
        <div className="w-full lg:w-1/2 h-[500px] relative">
           <motion.div 
             initial={{ opacity: 0, scale: 0.8 }}
             whileInView={{ opacity: 1, scale: 1 }}
             viewport={{ once: true }}
             transition={{ duration: 1 }}
             className="w-full h-full relative"
           >
             <Canvas camera={{ position: [0, 0, 6], fov: 45 }}>
                <ambientLight intensity={1} />
                <directionalLight position={[10, 10, 10]} intensity={2} color="#ffffff" />
                <directionalLight position={[-10, -10, -10]} intensity={1} color="#FFD4D5" />
                <OrganicCell />
                <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={2} />
             </Canvas>
           </motion.div>
        </div>

        {/* Right: Typography */}
        <div className="w-full lg:w-1/2 flex flex-col justify-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <span className="text-primary font-bold tracking-[0.2em] uppercase text-xs mb-4 block">Medical Intelligence</span>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-sans font-extrabold text-text-primary tracking-tight leading-[1.1] mb-6">
              AI analytics that<br />understand biology.
            </h2>
            <p className="text-lg text-text-secondary font-medium leading-relaxed max-w-lg mb-8">
              Moving beyond traditional data tracking. Biotrack employs advanced neural networks to map your precise biological markers, detecting critical signals buried within vast noise.
            </p>
            
            <button className="px-8 py-4 bg-primary text-white rounded-full font-bold shadow-float hover:scale-105 transition-transform">
              Explore the Engine
            </button>
          </motion.div>
        </div>

      </div>
    </section>
  );
}

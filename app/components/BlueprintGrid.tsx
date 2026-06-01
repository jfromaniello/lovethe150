"use client";

import { motion } from "framer-motion";

export default function BlueprintGrid() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Blueprint grid pattern */}
      <div 
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(107, 15, 26, 1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(107, 15, 26, 1) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px'
        }}
      />
      
      {/* Subtle crosshair marks */}
      <div className="absolute inset-0 opacity-[0.04]" style={{
        backgroundImage: `
          radial-gradient(circle, rgba(107, 15, 26, 1) 1px, transparent 1px)
        `,
        backgroundSize: '80px 80px',
        backgroundPosition: '40px 40px'
      }} />
    </div>
  );
}

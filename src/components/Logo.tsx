import React from 'react';

interface LogoProps {
  className?: string;
}

export default function Logo({ className }: LogoProps) {
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      {/* Colorful Overlapping Circles */}
      <div className="absolute inset-0 flex items-center justify-center gap-[-10px]">
        <div className="w-8 h-8 rounded-full bg-pink-400 opacity-60 -mr-3" />
        <div className="w-8 h-8 rounded-full bg-purple-500 opacity-60 -mr-3" />
        <div className="w-8 h-8 rounded-full bg-blue-400 opacity-60 -mr-3" />
        <div className="w-8 h-8 rounded-full bg-green-400 opacity-60 -mr-3" />
        <div className="w-8 h-8 rounded-full bg-yellow-400 opacity-60 -mr-3" />
        <div className="w-8 h-8 rounded-full bg-orange-500 opacity-60 -mr-3" />
        <div className="w-8 h-8 rounded-full bg-red-500 opacity-60 -mr-3" />
        <div className="w-8 h-8 rounded-full bg-purple-800 opacity-60" />
      </div>
      
      {/* Logo Text */}
      <span className="relative z-10 font-black text-white tracking-tighter text-xl drop-shadow-sm">
        TECHNOTASK
      </span>
    </div>
  );
}

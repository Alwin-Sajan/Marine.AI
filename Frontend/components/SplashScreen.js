"use client";

import React, { useEffect, useState } from "react";
import { Sparkles, Waves } from "lucide-react";

const SplashScreen = ({ onFinish }) => {
  const [progress, setProgress] = useState(0);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    // 1. Progress Timer: Increments until 100
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 2; // Adjust speed here (2 = slower, 5 = faster)
      });
    }, 40); // 40ms * 50 steps = ~2 seconds

    return () => clearInterval(interval);
  }, []);

  // 2. Watch for progress to hit 100, then trigger exit sequence
  useEffect(() => {
    if (progress === 100) {
      // Small pause at 100% for user satisfaction
      const delayTimer = setTimeout(() => {
        setFadeOut(true);
        
        // Wait for the CSS opacity transition (500ms) to finish before unmounting
        const finishTimer = setTimeout(() => {
          onFinish();
        }, 500);

        return () => clearTimeout(finishTimer);
      }, 400);

      return () => clearTimeout(delayTimer);
    }
  }, [progress, onFinish]);

  return (
    <div 
      className={`fixed inset-0 z-[9999] flex items-center justify-center bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 transition-opacity duration-700 ease-in-out ${
        fadeOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
      </div>

      {/* Main content */}
      <div className="relative text-center space-y-8 z-10">
        {/* Logo/Icon */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-blue-400 rounded-full blur-xl opacity-50 animate-pulse"></div>
            <div className="relative bg-gradient-to-br from-cyan-500 to-blue-600 p-6 rounded-full shadow-2xl">
              <Waves className="w-16 h-16 text-white" strokeWidth={2} />
            </div>
          </div>
        </div>

        {/* Title */}
        <div className="space-y-3">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
            Marine.AI
          </h1>
          <div className="flex items-center justify-center space-x-2 text-cyan-200/60">
            <Sparkles className="w-4 h-4" />
            <p className="text-sm tracking-widest uppercase font-light">Marine Species Intelligence</p>
          </div>
        </div>

        {/* Loading bar */}
        <div className="w-64 mx-auto space-y-4">
          <div className="h-1.5 w-full bg-slate-800/50 rounded-full overflow-hidden border border-white/5">
            <div 
              className="h-full bg-gradient-to-r from-cyan-400 via-blue-400 to-cyan-400 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <div className="flex justify-between items-center px-1">
            <span className="text-[10px] text-gray-500 uppercase tracking-tighter">Initializing Systems</span>
            <span className="text-cyan-400 text-xs font-mono font-bold">{progress}%</span>
          </div>
        </div>

        {/* Tagline */}
        <p className="text-gray-500 text-sm max-w-md mx-auto italic">
          Marine Biology • Ocean Conservation • Species Identification
        </p>
      </div>

      {/* Wave animation at bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-32 opacity-30 pointer-events-none">
        <svg className="w-full h-full" viewBox="0 0 1440 320" preserveAspectRatio="none">
          <defs>
            <linearGradient id="wave-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#22d3ee" />
              <stop offset="100%" stopColor="#3b82f6" />
            </linearGradient>
          </defs>
          <path 
            fill="url(#wave-gradient)" 
            d="M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,112C672,96,768,96,864,112C960,128,1056,160,1152,160C1248,160,1344,128,1392,112L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
          >
            <animate
              attributeName="d"
              dur="8s"
              repeatCount="indefinite"
              values="
                M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,112C672,96,768,96,864,112C960,128,1056,160,1152,160C1248,160,1344,128,1392,112L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z;
                M0,128L48,112C96,96,192,64,288,64C384,64,480,96,576,112C672,128,768,128,864,112C960,96,1056,64,1152,64C1248,64,1344,96,1392,112L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z;
                M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,112C672,96,768,96,864,112C960,128,1056,160,1152,160C1248,160,1344,128,1392,112L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
            />
          </path>
        </svg>
      </div>
    </div>
  );
};

export default SplashScreen;
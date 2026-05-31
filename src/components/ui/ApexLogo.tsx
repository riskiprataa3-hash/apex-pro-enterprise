import React from 'react';
import { ShieldCheck } from 'lucide-react';

interface ApexLogoProps {
  className?: string;
  size?: number;
  showText?: boolean;
  text?: string;
}

export const ApexLogo: React.FC<ApexLogoProps> = ({ className = "w-10 h-10", size = 24, showText = false, text = "CPO" }) => {
  // Added hideText logic via props if needed, but keeping interface simple
  const isHiddenText = (className as any).includes('hideText');

  return (
    <div className={`flex flex-col items-center justify-center gap-1.5 ${className}`}>
      <svg
        width={size * 2}
        height={size * 2}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="drop-shadow-xl hover:scale-105 transition-transform"
      >
        <defs>
          <linearGradient id="metallicBlue" x1="20%" y1="0%" x2="80%" y2="100%">
            <stop offset="0%" stopColor="#87a5cc" />
            <stop offset="50%" stopColor="#2e4c70" />
            <stop offset="100%" stopColor="#10233b" />
          </linearGradient>
          <linearGradient id="metallicRed" x1="0%" y1="20%" x2="100%" y2="80%">
            <stop offset="0%" stopColor="#cf4d63" />
            <stop offset="50%" stopColor="#8c1c2f" />
            <stop offset="100%" stopColor="#4a0f18" />
          </linearGradient>
          <filter id="bevelResult" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur in="SourceAlpha" stdDeviation="1.5" result="blur" />
            <feOffset dx="1.5" dy="1.5" result="offsetBlur" />
            <feComposite in="SourceGraphic" in2="offsetBlur" operator="over" />
          </filter>
        </defs>
        
        {/* Red orbiting rings */}
        <path d="M 15 55 Q 15 25 80 35" fill="none" stroke="url(#metallicRed)" strokeWidth="8" strokeLinecap="round" filter="url(#bevelResult)" />
        <path d="M 85 45 Q 85 75 20 65" fill="none" stroke="url(#metallicRed)" strokeWidth="8" strokeLinecap="round" filter="url(#bevelResult)" />
        
        {/* Main 'S' Shape */}
        <path d="M 70 30 C 70 15, 30 15, 30 35 C 30 55, 70 45, 70 65 C 70 85, 30 85, 30 70" fill="none" stroke="url(#metallicBlue)" strokeWidth="22" strokeLinecap="round" filter="url(#bevelResult)" />
      </svg>
      {showText && !isHiddenText && (
         <span className="font-extrabold tracking-widest uppercase text-transparent bg-clip-text bg-gradient-to-b from-gray-700 to-gray-900 drop-shadow-sm" style={{ fontSize: size * 0.5 }}>
            {text}
         </span>
      )}
    </div>
  );
};

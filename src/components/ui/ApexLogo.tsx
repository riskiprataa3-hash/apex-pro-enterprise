import React from 'react';
import { ShieldCheck } from 'lucide-react';

interface ApexLogoProps {
  className?: string;
  size?: number;
  showText?: boolean;
}

export const ApexLogo: React.FC<ApexLogoProps> = ({ className = "w-10 h-10", size = 24, showText = false }) => {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="relative group cursor-pointer">
        {/* Glow effect */}
        <div className="absolute inset-0 bg-primary/30 blur-2xl rounded-full animate-pulse group-hover:bg-primary/50 transition-all duration-500" />
        
        {/* Outer Ring */}
        <div className="relative bg-background border-2 border-primary w-14 h-14 rounded-2xl flex items-center justify-center overflow-hidden rotate-45 group-hover:rotate-90 transition-all duration-700 shadow-[0_0_20px_rgba(var(--primary-rgb),0.3)]">
          {/* Inner Content */}
          <ShieldCheck 
            size={size * 1.5} 
            className="text-primary -rotate-45 group-hover:-rotate-90 transition-all duration-700" 
          />
          
          {/* Decorative scan line */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/10 to-transparent w-full h-[2px] animate-scan pointer-events-none" />
        </div>
      </div>
      
      {showText && (
        <div className="flex flex-col">
          <h1 className="text-2xl font-black italic tracking-tighter uppercase leading-none text-foreground">
            Toll-Guard<br/>
            <span className="text-primary">Apex Pro.</span>
          </h1>
          <p className="text-[7px] font-bold text-muted-foreground uppercase tracking-[0.4em] mt-1 leading-none">
            Infrastructure Monitoring
          </p>
        </div>
      )}
    </div>
  );
};

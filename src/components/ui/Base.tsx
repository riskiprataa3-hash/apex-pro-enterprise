import React from "react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const Button = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive', size?: 'sm' | 'md' | 'lg' | 'icon' }
>(({ className, variant = 'primary', size = 'md', ...props }, ref) => {
  const variants = {
    primary: 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm border border-transparent',
    secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80 shadow-sm border border-transparent',
    outline: 'border border-border/50 bg-background/50 backdrop-blur-sm hover:bg-accent hover:text-accent-foreground',
    ghost: 'hover:bg-accent hover:text-accent-foreground',
    destructive: 'bg-destructive/90 text-destructive-foreground hover:bg-destructive shadow-sm border border-transparent',
  };
  
  const sizes = {
    sm: 'px-3 py-1.5 text-[11px] h-8',
    md: 'px-4 py-2 text-xs h-10',
    lg: 'px-6 py-2.5 text-sm h-12',
    icon: 'p-2 w-10 h-10',
  };
  
  return (
    <button
      ref={ref}
      className={cn(
        'inline-flex items-center justify-center rounded-xl font-bold transition-all active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    />
  );
});

import { motion } from 'motion/react';
import { X } from 'lucide-react';

export const Modal = ({ isOpen, onClose, children }: { isOpen: boolean; onClose: () => void; children: React.ReactNode }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={onClose} className="absolute inset-0 bg-background/80 backdrop-blur-sm" />
      <motion.div initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} className="relative bg-card w-full max-w-xl rounded-[2rem] shadow-xl overflow-hidden border border-border/50">
        <button onClick={onClose} className="absolute top-4 right-4 text-foreground/50 hover:text-foreground hover:bg-muted p-2 rounded-full transition-all z-10">
          <X className="w-5 h-5" />
        </button>
        {children}
      </motion.div>
    </div>
  );
};

export const Card = ({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("bg-card border border-border/50 rounded-[2rem] shadow-sm", className)} {...props}>
    {children}
  </div>
);

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "flex h-11 w-full rounded-xl border border-border/50 bg-background/50 px-4 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 disabled:cursor-not-allowed disabled:opacity-50 transition-colors shadow-sm",
        className
      )}
      {...props}
    />
  )
);

export const Badge = ({ className, variant = 'primary', children, ...props }: React.HTMLAttributes<HTMLDivElement> & { variant?: 'primary' | 'outline' | 'ghost' | 'destructive' | 'success' }) => {
  const variants = {
    primary: 'bg-primary/20 text-primary border-primary/20',
    outline: 'border border-border/50 bg-background/20',
    ghost: 'bg-muted/30 text-muted-foreground',
    destructive: 'bg-rose-500/20 text-rose-500 border-rose-500/20',
    success: 'bg-emerald-500/20 text-emerald-500 border-emerald-500/20'
  };
  
  return (
    <div className={cn("inline-flex items-center rounded-full border px-2.5 py-0.5 text-[9px] font-black uppercase tracking-widest transition-colors", variants[variant], className)} {...props}>
      {children}
    </div>
  );
};

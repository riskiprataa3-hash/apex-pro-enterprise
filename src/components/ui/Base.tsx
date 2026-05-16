import React from "react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const Button = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive' }
>(({ className, variant = 'primary', ...props }, ref) => {
  const variants = {
    primary: 'bg-primary/90 backdrop-blur-md text-primary-foreground hover:bg-primary shadow-lg shadow-primary/20 border border-primary/50',
    secondary: 'bg-secondary/50 backdrop-blur-md text-secondary-foreground hover:bg-secondary/70 border border-white/10 dark:border-white/5',
    outline: 'border border-border/50 bg-background/30 backdrop-blur-md hover:bg-accent/50 hover:text-accent-foreground',
    ghost: 'hover:bg-accent/30 hover:backdrop-blur-sm hover:text-accent-foreground',
    destructive: 'bg-destructive/90 backdrop-blur-md text-destructive-foreground hover:bg-destructive shadow-lg shadow-destructive/20 border border-destructive/50',
  };
  
  return (
    <button
      ref={ref}
      className={cn(
        'inline-flex items-center justify-center rounded-2xl px-4 py-2.5 text-xs font-black uppercase tracking-widest transition-all active:scale-95 disabled:opacity-50 overflow-hidden relative',
        variants[variant],
        className
      )}
      {...props}
    />
  );
});

export const Card = ({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("bg-card/40 backdrop-blur-xl border border-white/20 dark:border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl", className)} {...props}>
    {children}
  </div>
);

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "flex h-12 w-full rounded-2xl border border-border/50 bg-background/40 backdrop-blur-md px-4 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:bg-background/60 disabled:cursor-not-allowed disabled:opacity-50 transition-all shadow-inner",
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

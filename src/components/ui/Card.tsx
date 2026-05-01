import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  glass?: boolean;
  onClick?: () => void;
}

export function Card({ children, className = '', glass = false, onClick }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={`rounded-2xl border border-white/10
        ${glass
          ? 'bg-white/5 backdrop-blur-sm shadow-glass'
          : 'bg-surface-800 shadow-glass'}
        ${onClick ? 'cursor-pointer hover:border-white/20 transition-all hover:bg-surface-700' : ''}
        ${className}`}
    >
      {children}
    </div>
  );
}

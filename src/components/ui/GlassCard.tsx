import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../utils/cn';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
  gradient?: boolean;
  animate?: boolean;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  className,
  hover = false,
  onClick,
  gradient = false,
  animate = true,
}) => {
  const Component = animate ? motion.div : 'div';
  const animProps = animate ? {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.3 },
    whileHover: hover ? { scale: 1.01, y: -2 } : undefined,
    whileTap: onClick ? { scale: 0.99 } : undefined,
  } : {};

  return (
    <Component
      {...animProps}
      onClick={onClick}
      className={cn(
        'rounded-2xl border backdrop-blur-xl',
        gradient
          ? 'bg-gradient-to-br from-white/10 to-white/5 border-white/20'
          : 'bg-white/8 border-white/12',
        hover && 'cursor-pointer transition-all duration-300 hover:border-violet-500/40 hover:shadow-lg hover:shadow-violet-500/10',
        className
      )}
    >
      {children}
    </Component>
  );
};

export default GlassCard;

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../utils/cn';
import { getStatusColor, getStatusLabel } from '../../utils/helpers';

interface BadgeProps {
  status: string;
  pulse?: boolean;
  className?: string;
}

export const StatusBadge: React.FC<BadgeProps> = ({ status, pulse = false, className }) => {
  const colorClass = getStatusColor(status);
  const label = getStatusLabel(status);

  return (
    <span className={cn(
      'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border',
      colorClass,
      className
    )}>
      {pulse && (
        <span className="relative flex h-2 w-2">
          <span className={cn('animate-ping absolute inline-flex h-full w-full rounded-full opacity-75', colorClass.includes('green') ? 'bg-green-400' : colorClass.includes('blue') ? 'bg-blue-400' : colorClass.includes('yellow') ? 'bg-yellow-400' : colorClass.includes('orange') ? 'bg-orange-400' : colorClass.includes('purple') ? 'bg-purple-400' : 'bg-red-400')} />
          <span className={cn('relative inline-flex rounded-full h-2 w-2', colorClass.includes('green') ? 'bg-green-400' : colorClass.includes('blue') ? 'bg-blue-400' : colorClass.includes('yellow') ? 'bg-yellow-400' : colorClass.includes('orange') ? 'bg-orange-400' : colorClass.includes('purple') ? 'bg-purple-400' : 'bg-red-400')} />
        </span>
      )}
      {label}
    </span>
  );
};

interface LiveBadgeProps {
  className?: string;
  label?: string;
}

export const LiveBadge: React.FC<LiveBadgeProps> = ({ className, label = 'LIVE' }) => (
  <motion.span
    animate={{ opacity: [1, 0.6, 1] }}
    transition={{ duration: 1.5, repeat: Infinity }}
    className={cn('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-green-500/20 text-green-400 border border-green-500/30', className)}
  >
    <span className="relative flex h-2 w-2">
      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
      <span className="relative inline-flex rounded-full h-2 w-2 bg-green-400" />
    </span>
    {label}
  </motion.span>
);

export default StatusBadge;

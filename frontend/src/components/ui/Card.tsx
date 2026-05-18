import React from 'react';
import { motion } from 'framer-motion';

// Extend props so it supports onClick, style, etc.
interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}

const Card: React.FC<CardProps> = ({ 
  children, 
  className = '', 
  hover = false,
  ...props  // spread extra props (like onClick)
}) => {
  const baseClasses = 'bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 transition-colors duration-300';
  const hoverClasses = hover ? 'hover:shadow-md dark:hover:shadow-gray-900/50 transition-shadow duration-200' : '';
  
  return (
    <motion.div
      whileHover={hover ? { y: -2 } : {}}
      className={`${baseClasses} ${hoverClasses} ${className}`}
      {...props}   // ✅ allows onClick, id, style, etc.
    >
      {children}
    </motion.div>
  );
};

export default Card;

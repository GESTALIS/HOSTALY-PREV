import React from 'react';
import { motion } from 'framer-motion';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  variant?: 'default' | 'elevated' | 'outlined' | 'gradient';
  hover?: boolean;
}

const Card: React.FC<CardProps> = ({ 
  children, 
  className = '', 
  onClick, 
  variant = 'default',
  hover = true 
}) => {
  const baseClasses = "bg-white rounded-2xl border transition-all duration-300";
  
  const variantClasses = {
    default: "border-gray-200 shadow-sm hover:shadow-md",
    elevated: "border-transparent shadow-lg hover:shadow-xl",
    outlined: "border-hotaly-primary/20 bg-transparent hover:bg-hotaly-primary/5",
    gradient: "bg-gradient-to-br from-white to-hotaly-neutral/30 border-hotaly-primary/10"
  };
  
  const hoverClasses = hover ? "hover:-translate-y-1" : "";
  
  const classes = `${baseClasses} ${variantClasses[variant]} ${hoverClasses} ${className}`;
  
  return (
    <motion.div
      whileHover={hover ? { y: -4 } : {}}
      className={classes}
      onClick={onClick}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
    >
      <div className="p-6">
        {children}
      </div>
    </motion.div>
  );
};

export default Card;

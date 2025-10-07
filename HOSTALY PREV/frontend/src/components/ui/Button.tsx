import React from 'react';
import { motion } from 'framer-motion';

interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'accent' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  className?: string;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  onClick,
  disabled = false,
  loading = false,
  className = '',
  icon,
  iconPosition = 'left'
}) => {
  const baseClasses = "inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variantClasses = {
    primary: "bg-hotaly-primary text-white hover:bg-hotaly-primary-light focus:ring-hotaly-primary/50 shadow-lg hover:shadow-xl",
    secondary: "bg-hotaly-secondary text-white hover:bg-hotaly-secondary-light focus:ring-hotaly-secondary/50 shadow-lg hover:shadow-xl",
    accent: "bg-hotaly-accent text-white hover:bg-hotaly-accent-light focus:ring-hotaly-accent/50 shadow-lg hover:shadow-xl",
    outline: "border-2 border-hotaly-primary text-hotaly-primary bg-transparent hover:bg-hotaly-primary hover:text-white focus:ring-hotaly-primary/50",
    ghost: "text-hotaly-primary hover:bg-hotaly-primary/10 focus:ring-hotaly-primary/50",
    danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500/50 shadow-lg hover:shadow-xl"
  };
  
  const sizeClasses = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-lg",
    xl: "px-10 py-5 text-xl"
  };
  
  const classes = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`;
  
  const iconClasses = "transition-transform duration-200";
  const leftIconClasses = iconPosition === 'left' ? `${iconClasses} mr-2` : '';
  const rightIconClasses = iconPosition === 'right' ? `${iconClasses} ml-2` : '';
  
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={classes}
      onClick={onClick}
      disabled={disabled || loading}
    >
      {loading && (
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"
        />
      )}
      
      {icon && iconPosition === 'left' && (
        <span className={leftIconClasses}>
          {icon}
        </span>
      )}
      
      <span className="font-medium tracking-wide">
        {children}
      </span>
      
      {icon && iconPosition === 'right' && (
        <span className={rightIconClasses}>
          {icon}
        </span>
      )}
    </motion.button>
  );
};

export default Button;

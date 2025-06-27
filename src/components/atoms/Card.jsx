import { motion } from 'framer-motion';

const Card = ({ 
  children, 
  className = '', 
  hover = false,
  padding = 'md',
  ...props 
}) => {
  const baseClasses = 'bg-white rounded-lg border border-surface-200 shadow-sm';
  
  const paddings = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8'
  };
  
  const Component = hover ? motion.div : 'div';
  const motionProps = hover ? {
    whileHover: { y: -2, boxShadow: '0 10px 25px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)' },
    transition: { duration: 0.2 }
  } : {};
  
  return (
    <Component
      className={`
        ${baseClasses}
        ${paddings[padding]}
        ${hover ? 'cursor-pointer' : ''}
        ${className}
      `}
      {...motionProps}
      {...props}
    >
      {children}
    </Component>
  );
};

export default Card;
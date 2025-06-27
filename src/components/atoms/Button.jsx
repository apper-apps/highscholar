import { motion } from 'framer-motion';
import ApperIcon from '@/components/ApperIcon';

const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  icon, 
  iconPosition = 'left',
  loading = false,
  disabled = false,
  className = '',
  onClick,
  ...props 
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2';
  
  const variants = {
    primary: 'bg-primary-900 text-white hover:bg-primary-800 focus:ring-primary-500 shadow-sm',
    secondary: 'bg-secondary-500 text-white hover:bg-secondary-600 focus:ring-secondary-400 shadow-sm',
    outline: 'border border-surface-300 text-surface-700 hover:bg-surface-50 focus:ring-primary-500',
    ghost: 'text-surface-700 hover:bg-surface-100 focus:ring-primary-500',
    danger: 'bg-accent-500 text-white hover:bg-accent-600 focus:ring-accent-400 shadow-sm'
  };
  
  const sizes = {
    sm: 'px-3 py-1.5 text-sm gap-1.5',
    md: 'px-4 py-2 text-sm gap-2',
    lg: 'px-6 py-3 text-base gap-2.5'
  };
  
  const isDisabled = disabled || loading;
  
  return (
    <motion.button
      whileHover={!isDisabled ? { scale: 1.02 } : {}}
      whileTap={!isDisabled ? { scale: 0.98 } : {}}
      className={`
        ${baseClasses}
        ${variants[variant]}
        ${sizes[size]}
        ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${className}
      `}
      disabled={isDisabled}
      onClick={onClick}
      {...props}
    >
      {loading && (
        <div className="animate-spin">
          <ApperIcon name="Loader2" size={16} />
        </div>
      )}
      
      {icon && iconPosition === 'left' && !loading && (
        <ApperIcon name={icon} size={16} />
      )}
      
      {children}
      
      {icon && iconPosition === 'right' && !loading && (
        <ApperIcon name={icon} size={16} />
      )}
    </motion.button>
  );
};

export default Button;
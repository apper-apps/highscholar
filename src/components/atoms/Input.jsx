import { useState } from 'react';
import { motion } from 'framer-motion';
import ApperIcon from '@/components/ApperIcon';

const Input = ({ 
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  error,
  success,
  icon,
  required = false,
  disabled = false,
  className = '',
  ...props 
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const hasValue = value && value.length > 0;
  const shouldFloat = isFocused || hasValue;
  
  const handleInputChange = (e) => {
    if (onChange) {
      onChange(e);
    }
  };

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <input
          type={type === 'password' && showPassword ? 'text' : type}
          value={value || ''}
          onChange={handleInputChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={shouldFloat ? '' : placeholder}
          disabled={disabled}
          className={`
            w-full px-3 py-3 border rounded-lg bg-white transition-all duration-200
            ${icon ? 'pl-10' : ''}
            ${type === 'password' ? 'pr-10' : ''}
            ${error 
              ? 'border-accent-500 focus:border-accent-500 focus:ring-2 focus:ring-accent-200' 
              : success
              ? 'border-success-500 focus:border-success-500 focus:ring-2 focus:ring-success-200'
              : 'border-surface-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-200'
            }
            ${disabled ? 'bg-surface-100 cursor-not-allowed' : ''}
            focus:outline-none
          `}
          {...props}
        />
        
        {/* Floating Label */}
        {label && (
          <motion.label
            animate={{
              top: shouldFloat ? '0.25rem' : '0.75rem',
              fontSize: shouldFloat ? '0.75rem' : '1rem',
              color: error 
                ? '#e74c3c' 
                : success 
                ? '#27ae60'
                : isFocused 
                ? '#2c3e50' 
                : '#64748b'
            }}
            transition={{ duration: 0.2 }}
            className={`
              absolute left-3 pointer-events-none transform -translate-y-1/2
              ${icon ? 'left-10' : ''}
              ${shouldFloat ? 'bg-white px-1' : ''}
            `}
          >
            {label}
            {required && <span className="text-accent-500 ml-1">*</span>}
          </motion.label>
        )}
        
        {/* Left Icon */}
        {icon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
            <ApperIcon 
              name={icon} 
              size={18} 
              className={`
                ${error 
                  ? 'text-accent-500' 
                  : success 
                  ? 'text-success-500'
                  : isFocused 
                  ? 'text-primary-500' 
                  : 'text-surface-400'
                }
              `} 
            />
          </div>
        )}
        
        {/* Password Toggle */}
        {type === 'password' && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-surface-400 hover:text-surface-600"
          >
            <ApperIcon name={showPassword ? 'EyeOff' : 'Eye'} size={18} />
          </button>
        )}
        
        {/* Success Icon */}
        {success && type !== 'password' && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <ApperIcon name="CheckCircle" size={18} className="text-success-500" />
          </div>
        )}
      </div>
      
      {/* Error Message */}
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-1 text-sm text-accent-500 flex items-center gap-1"
        >
          <ApperIcon name="AlertCircle" size={14} />
          {error}
        </motion.p>
      )}
      
      {/* Success Message */}
      {success && (
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-1 text-sm text-success-500 flex items-center gap-1"
        >
          <ApperIcon name="CheckCircle" size={14} />
          {success}
        </motion.p>
      )}
    </div>
  );
};

export default Input;
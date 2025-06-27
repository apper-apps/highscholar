import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ApperIcon from '@/components/ApperIcon';

const Select = ({ 
  label,
  value,
  onChange,
  options = [],
  placeholder = 'Select an option',
  error,
  success,
  required = false,
  disabled = false,
  className = '',
  ...props 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  
  const selectedOption = options.find(option => option.value === value);
  const hasValue = value !== undefined && value !== null && value !== '';
  const shouldFloat = isFocused || hasValue || isOpen;

  const handleSelect = (optionValue) => {
    if (onChange) {
      onChange({ target: { value: optionValue } });
    }
    setIsOpen(false);
  };

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <button
          type="button"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          disabled={disabled}
          className={`
            w-full px-3 py-3 border rounded-lg bg-white text-left transition-all duration-200
            ${error 
              ? 'border-accent-500 focus:border-accent-500 focus:ring-2 focus:ring-accent-200' 
              : success
              ? 'border-success-500 focus:border-success-500 focus:ring-2 focus:ring-success-200'
              : 'border-surface-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-200'
            }
            ${disabled ? 'bg-surface-100 cursor-not-allowed' : 'cursor-pointer'}
            focus:outline-none
          `}
          {...props}
        >
          <span className={selectedOption ? 'text-surface-900' : 'text-surface-400'}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <motion.div
              animate={{ rotate: isOpen ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ApperIcon 
                name="ChevronDown" 
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
            </motion.div>
          </div>
        </button>
        
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
              ${shouldFloat ? 'bg-white px-1' : ''}
            `}
          >
            {label}
            {required && <span className="text-accent-500 ml-1">*</span>}
          </motion.label>
        )}
        
        {/* Dropdown Options */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="absolute z-50 w-full mt-1 bg-white border border-surface-200 rounded-lg shadow-lg max-h-60 overflow-y-auto"
            >
              {options.map((option, index) => (
                <motion.button
                  key={option.value}
                  type="button"
                  onClick={() => handleSelect(option.value)}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`
                    w-full px-3 py-2 text-left hover:bg-surface-50 transition-colors
                    ${value === option.value ? 'bg-primary-50 text-primary-900' : 'text-surface-700'}
                    ${index === 0 ? 'rounded-t-lg' : ''}
                    ${index === options.length - 1 ? 'rounded-b-lg' : ''}
                  `}
                >
                  {option.label}
                </motion.button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
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

export default Select;
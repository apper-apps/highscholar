import { motion } from 'framer-motion';
import Button from '@/components/atoms/Button';
import Card from '@/components/atoms/Card';
import ApperIcon from '@/components/ApperIcon';

const EmptyState = ({ 
  title, 
  description, 
  actionLabel, 
  onAction,
  icon = 'Package',
  className = '' 
}) => {
  return (
    <Card className={`text-center py-12 ${className}`}>
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
          className="w-16 h-16 bg-surface-100 rounded-full flex items-center justify-center mx-auto mb-4"
        >
          <ApperIcon name={icon} size={32} className="text-surface-400" />
        </motion.div>
        
        <h3 className="text-lg font-semibold text-surface-900 mb-2">
          {title}
        </h3>
        
        <p className="text-surface-600 mb-6 max-w-md mx-auto">
          {description}
        </p>
        
        {actionLabel && onAction && (
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button onClick={onAction} variant="primary">
              {actionLabel}
            </Button>
          </motion.div>
        )}
      </motion.div>
    </Card>
  );
};

export default EmptyState;
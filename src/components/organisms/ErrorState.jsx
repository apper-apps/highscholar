import { motion } from 'framer-motion';
import Button from '@/components/atoms/Button';
import Card from '@/components/atoms/Card';
import ApperIcon from '@/components/ApperIcon';

const ErrorState = ({ 
  message = 'Something went wrong', 
  onRetry,
  showRetry = true,
  className = '' 
}) => {
  return (
    <Card className={`text-center py-12 ${className}`}>
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="w-16 h-16 bg-accent-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <ApperIcon name="AlertTriangle" size={32} className="text-accent-600" />
        </div>
        
        <h3 className="text-lg font-semibold text-surface-900 mb-2">
          Oops! Something went wrong
        </h3>
        
        <p className="text-surface-600 mb-6 max-w-md mx-auto">
          {message}
        </p>
        
        {showRetry && onRetry && (
          <Button onClick={onRetry} variant="primary">
            <ApperIcon name="RefreshCw" size={16} />
            Try Again
          </Button>
        )}
      </motion.div>
    </Card>
  );
};

export default ErrorState;
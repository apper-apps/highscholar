import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Button from '@/components/atoms/Button';
import Card from '@/components/atoms/Card';
import ApperIcon from '@/components/ApperIcon';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-[50vh] flex items-center justify-center">
      <Card className="text-center max-w-md mx-auto">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="w-24 h-24 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <ApperIcon name="FileQuestion" size={48} className="text-primary-600" />
          </div>
          
          <h1 className="text-4xl font-bold text-surface-900 mb-4">404</h1>
          
          <h2 className="text-xl font-semibold text-surface-900 mb-2">
            Page Not Found
          </h2>
          
          <p className="text-surface-600 mb-8">
            The page you're looking for doesn't exist or has been moved.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              onClick={() => navigate(-1)}
              variant="outline"
            >
              <ApperIcon name="ArrowLeft" size={16} />
              Go Back
            </Button>
            
            <Button
              onClick={() => navigate('/')}
              variant="primary"
            >
              <ApperIcon name="Home" size={16} />
              Go Home
            </Button>
          </div>
        </motion.div>
      </Card>
    </div>
  );
};

export default NotFound;
import { motion } from 'framer-motion';
import Card from '@/components/atoms/Card';
import ApperIcon from '@/components/ApperIcon';

const StatsCard = ({ 
  title, 
  value, 
  icon, 
  trend, 
  trendValue,
  color = 'primary',
  className = '' 
}) => {
  const colors = {
    primary: {
      bg: 'bg-primary-50',
      icon: 'text-primary-600',
      text: 'text-primary-900'
    },
    secondary: {
      bg: 'bg-secondary-50',
      icon: 'text-secondary-600',
      text: 'text-secondary-900'
    },
    success: {
      bg: 'bg-success-50',
      icon: 'text-success-600',
      text: 'text-success-900'
    },
    warning: {
      bg: 'bg-warning-50',
      icon: 'text-warning-600',
      text: 'text-warning-900'
    },
    danger: {
      bg: 'bg-accent-50',
      icon: 'text-accent-600',
      text: 'text-accent-900'
    }
  };

  const getTrendIcon = () => {
    if (trend === 'up') return 'TrendingUp';
    if (trend === 'down') return 'TrendingDown';
    return 'Minus';
  };

  const getTrendColor = () => {
    if (trend === 'up') return 'text-success-600';
    if (trend === 'down') return 'text-accent-600';
    return 'text-surface-400';
  };

  return (
    <Card hover className={className}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-surface-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-surface-900">{value}</p>
          
          {trendValue && (
            <div className="flex items-center gap-1 mt-2">
              <ApperIcon name={getTrendIcon()} size={14} className={getTrendColor()} />
              <span className={`text-sm ${getTrendColor()}`}>
                {trendValue}
              </span>
            </div>
          )}
        </div>
        
        {icon && (
          <div className={`w-12 h-12 rounded-lg ${colors[color].bg} flex items-center justify-center`}>
            <ApperIcon name={icon} size={24} className={colors[color].icon} />
          </div>
        )}
      </div>
    </Card>
  );
};

export default StatsCard;
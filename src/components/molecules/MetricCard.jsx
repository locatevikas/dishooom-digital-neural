import { motion } from 'framer-motion';
import ApperIcon from '@/components/ApperIcon';
import Card from '@/components/atoms/Card';

const MetricCard = ({ 
  title, 
  value, 
  icon, 
  trend, 
  trendValue,
  color = 'primary',
  onClick 
}) => {
  const colors = {
    primary: 'text-primary bg-primary/10',
    secondary: 'text-secondary bg-secondary/10',
    accent: 'text-accent bg-accent/10',
    success: 'text-green-600 bg-green-100',
    warning: 'text-yellow-600 bg-yellow-100',
    danger: 'text-red-600 bg-red-100'
  };

  const trendColors = {
    up: 'text-green-600',
    down: 'text-red-600',
    neutral: 'text-gray-500'
  };

  return (
    <Card hover={!!onClick} onClick={onClick} className="p-4">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <div className="flex items-baseline gap-2 mt-1">
            <motion.p 
              className="text-2xl font-bold text-gray-900"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              {value}
            </motion.p>
            {trend && trendValue && (
              <div className={`flex items-center gap-1 ${trendColors[trend]}`}>
                <ApperIcon 
                  name={trend === 'up' ? 'TrendingUp' : trend === 'down' ? 'TrendingDown' : 'Minus'} 
                  size={16} 
                />
                <span className="text-xs font-medium">{trendValue}</span>
              </div>
            )}
          </div>
        </div>
        <div className={`p-3 rounded-lg ${colors[color]}`}>
          <ApperIcon name={icon} size={24} />
        </div>
      </div>
    </Card>
  );
};

export default MetricCard;
import { motion } from 'framer-motion';
import ApperIcon from '@/components/ApperIcon';
import Card from '@/components/atoms/Card';
import Badge from '@/components/atoms/Badge';

const ProductCard = ({ product, onEdit, onDelete, onStockUpdate }) => {
  const getStockStatus = () => {
    if (product.currentStock <= product.minStock) {
      return { status: 'low', color: 'danger', text: 'Low Stock' };
    } else if (product.currentStock <= product.minStock * 1.5) {
      return { status: 'medium', color: 'warning', text: 'Medium Stock' };
    }
    return { status: 'good', color: 'success', text: 'Good Stock' };
  };

  const stockStatus = getStockStatus();
  const stockPercentage = Math.min((product.currentStock / (product.minStock * 2)) * 100, 100);

  return (
    <Card className="p-4 hover:shadow-md transition-shadow dark:bg-gray-800">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 dark:text-white truncate">{product.name}</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">{product.type}</p>
        </div>
        <div className="flex items-center gap-2 ml-2">
          <Badge variant={product.isWhiteLabelled ? 'accent' : 'primary'}>
            {product.isWhiteLabelled ? 'White Label' : 'Branded'}
          </Badge>
          <div className="flex gap-1">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => onEdit?.(product)}
              className="p-1.5 text-gray-400 hover:text-primary dark:text-gray-500 dark:hover:text-primary transition-colors"
            >
              <ApperIcon name="Edit2" size={16} />
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => onDelete?.(product)}
              className="p-1.5 text-gray-400 hover:text-red-500 dark:text-gray-500 dark:hover:text-red-400 transition-colors"
            >
              <ApperIcon name="Trash2" size={16} />
            </motion.button>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {/* Stock Level */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm text-gray-600 dark:text-gray-400">Stock Level</span>
            <Badge variant={stockStatus.color} size="xs">
              {stockStatus.text}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <motion.div
                className={`h-2 rounded-full ${
                  stockStatus.status === 'good' ? 'bg-green-500' :
                  stockStatus.status === 'medium' ? 'bg-yellow-500' : 'bg-red-500'
                }`}
                initial={{ width: 0 }}
                animate={{ width: `${stockPercentage}%` }}
                transition={{ duration: 0.5, delay: 0.2 }}
              />
            </div>
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              {product.currentStock} {product.unit}
            </span>
          </div>
        </div>

        {/* Stock Actions */}
        <div className="flex gap-2">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => onStockUpdate?.(product, 'in')}
            className="flex-1 flex items-center justify-center gap-1 py-2 px-3 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-lg text-sm font-medium hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors"
          >
            <ApperIcon name="Plus" size={14} />
            Stock In
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => onStockUpdate?.(product, 'out')}
            className="flex-1 flex items-center justify-center gap-1 py-2 px-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg text-sm font-medium hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
          >
            <ApperIcon name="Minus" size={14} />
            Stock Out
          </motion.button>
        </div>

        {/* Additional Info */}
        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 pt-2 border-t border-gray-100 dark:border-gray-700">
          <span>Min: {product.minStock} {product.unit}</span>
          <span>Price: ₹{product.sellingPrice}</span>
        </div>
      </div>
    </Card>
  );
};

export default ProductCard;
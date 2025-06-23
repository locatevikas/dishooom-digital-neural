import { motion } from 'framer-motion';
import ApperIcon from '@/components/ApperIcon';
import Card from '@/components/atoms/Card';
import Badge from '@/components/atoms/Badge';
import { format } from 'date-fns';

const SalesOrderCard = ({ order, onEdit, onDelete, onUpdatePayment, onViewDetails, onInvoiceGenerate }) => {
  const paymentColors = {
    paid: 'success',
    partial: 'warning',
    pending: 'danger'
  };

  const paymentLabels = {
    paid: 'Paid',
    partial: 'Partial',
    pending: 'Pending'
  };

  return (
    <Card className="p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 dark:text-white truncate">{order.customerName}</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">{order.invoiceNumber}</p>
        </div>
        <div className="flex items-center gap-2 ml-2">
          <Badge variant={paymentColors[order.paymentStatus]}>
            {paymentLabels[order.paymentStatus]}
          </Badge>
          <div className="flex gap-1">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => onInvoiceGenerate?.(order)}
              className="p-1.5 text-gray-400 hover:text-blue-500 dark:text-gray-500 dark:hover:text-blue-400 transition-colors"
              title="Generate Invoice PDF"
            >
              <ApperIcon name="FileText" size={16} />
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => onViewDetails?.(order)}
              className="p-1.5 text-gray-400 hover:text-primary dark:text-gray-500 dark:hover:text-primary transition-colors"
            >
              <ApperIcon name="Eye" size={16} />
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => onEdit?.(order)}
              className="p-1.5 text-gray-400 hover:text-primary dark:text-gray-500 dark:hover:text-primary transition-colors"
            >
              <ApperIcon name="Edit2" size={16} />
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => onDelete?.(order)}
              className="p-1.5 text-gray-400 hover:text-red-500 dark:text-gray-500 dark:hover:text-red-400 transition-colors"
            >
              <ApperIcon name="Trash2" size={16} />
            </motion.button>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {/* Order Details */}
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Total Amount</p>
            <p className="text-lg font-bold text-gray-900 dark:text-white">₹{order.totalAmount.toLocaleString()}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600 dark:text-gray-400">Items</p>
            <p className="text-lg font-bold text-gray-900 dark:text-white">{order.items.length}</p>
          </div>
        </div>

        {/* Payment Actions */}
        {order.paymentStatus !== 'paid' && (
          <div className="flex gap-2">
            {order.paymentStatus === 'pending' && (
              <>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => onUpdatePayment?.(order, 'partial')}
                  className="flex-1 py-2 px-3 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400 rounded-lg text-sm font-medium hover:bg-yellow-100 dark:hover:bg-yellow-900/30 transition-colors"
                >
                  Mark Partial
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => onUpdatePayment?.(order, 'paid')}
                  className="flex-1 py-2 px-3 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-lg text-sm font-medium hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors"
                >
                  Mark Paid
                </motion.button>
              </>
            )}
            {order.paymentStatus === 'partial' && (
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => onUpdatePayment?.(order, 'paid')}
                className="w-full py-2 px-3 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-lg text-sm font-medium hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors"
              >
                Mark Fully Paid
              </motion.button>
            )}
          </div>
        )}

        {/* Order Info */}
        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 pt-2 border-t border-gray-100 dark:border-gray-700">
          <span>Date: {format(new Date(order.orderDate), 'MMM dd, yyyy')}</span>
          <span>ID: #{order.Id}</span>
        </div>
      </div>
    </Card>
  );
};

export default SalesOrderCard;
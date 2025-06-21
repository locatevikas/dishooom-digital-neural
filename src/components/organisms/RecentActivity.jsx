import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import ApperIcon from '@/components/ApperIcon';
import Card from '@/components/atoms/Card';
import salesOrderService from '@/services/api/salesOrderService';
import { format } from 'date-fns';

const RecentActivity = () => {
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadRecentActivity = async () => {
      try {
        const orders = await salesOrderService.getAll();
        // Sort by date and take the 5 most recent
        const recent = orders
          .sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate))
          .slice(0, 5);
        setRecentOrders(recent);
      } catch (error) {
        console.error('Failed to load recent activity:', error);
      } finally {
        setLoading(false);
      }
    };

    loadRecentActivity();
  }, []);

  if (loading) {
    return (
      <Card className="p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center gap-3 animate-pulse">
              <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
              <div className="flex-1 space-y-1">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-4">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
      
      {recentOrders.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <ApperIcon name="Activity" size={48} className="mx-auto mb-2 text-gray-300" />
          <p>No recent activity</p>
        </div>
      ) : (
        <div className="space-y-3">
          {recentOrders.map((order, index) => (
            <motion.div
              key={order.Id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                <ApperIcon name="ShoppingCart" size={20} className="text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 truncate">
                  New order from {order.customerName}
                </p>
                <p className="text-sm text-gray-500">
                  ₹{order.totalAmount.toLocaleString()} • {format(new Date(order.orderDate), 'MMM dd, HH:mm')}
                </p>
              </div>
              <div className={`w-2 h-2 rounded-full ${
                order.paymentStatus === 'paid' ? 'bg-green-500' :
                order.paymentStatus === 'partial' ? 'bg-yellow-500' : 'bg-red-500'
              }`}></div>
            </motion.div>
          ))}
        </div>
      )}
    </Card>
  );
};

export default RecentActivity;
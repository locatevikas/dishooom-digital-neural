import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import MetricCard from '@/components/molecules/MetricCard';
import productService from '@/services/api/productService';
import salesOrderService from '@/services/api/salesOrderService';
import customerService from '@/services/api/customerService';

const DashboardMetrics = () => {
  const [metrics, setMetrics] = useState({
    totalProducts: 0,
    lowStockCount: 0,
    totalCustomers: 0,
    pendingPayments: 0,
    monthlySales: 0,
    newLeads: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadMetrics = async () => {
      try {
        const [products, orders, customers] = await Promise.all([
          productService.getAll(),
          salesOrderService.getAll(),
          customerService.getAll()
        ]);

        const lowStockProducts = products.filter(p => p.currentStock <= p.minStock);
        const pendingOrders = orders.filter(o => o.paymentStatus === 'pending');
        const newLeads = customers.filter(c => c.pipelineStage === 'new');
        
        const currentMonth = new Date().getMonth() + 1;
        const currentYear = new Date().getFullYear();
        const monthlyOrders = orders.filter(order => {
          const orderDate = new Date(order.orderDate);
          return orderDate.getMonth() + 1 === currentMonth && orderDate.getFullYear() === currentYear;
        });
        const monthlySalesTotal = monthlyOrders.reduce((sum, order) => sum + order.totalAmount, 0);
        const pendingAmount = pendingOrders.reduce((sum, order) => sum + order.totalAmount, 0);

        setMetrics({
          totalProducts: products.length,
          lowStockCount: lowStockProducts.length,
          totalCustomers: customers.length,
          pendingPayments: pendingAmount,
          monthlySales: monthlySalesTotal,
          newLeads: newLeads.length
        });
      } catch (error) {
        console.error('Failed to load metrics:', error);
      } finally {
        setLoading(false);
      }
    };

    loadMetrics();
  }, []);

  const metricsConfig = [
    {
      title: 'Total Products',
      value: metrics.totalProducts,
      icon: 'Package',
      color: 'primary'
    },
    {
      title: 'Low Stock Items',
      value: metrics.lowStockCount,
      icon: 'AlertTriangle',
      color: metrics.lowStockCount > 0 ? 'warning' : 'success'
    },
    {
      title: 'Total Customers',
      value: metrics.totalCustomers,
      icon: 'Users',
      color: 'secondary'
    },
    {
      title: 'New Leads',
      value: metrics.newLeads,
      icon: 'UserPlus',
      color: 'accent'
    },
    {
      title: 'Monthly Sales',
      value: `₹${metrics.monthlySales.toLocaleString()}`,
      icon: 'TrendingUp',
      color: 'success'
    },
    {
      title: 'Pending Payments',
      value: `₹${metrics.pendingPayments.toLocaleString()}`,
      icon: 'Clock',
      color: metrics.pendingPayments > 0 ? 'danger' : 'success'
    }
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg p-4 animate-pulse">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-20"></div>
                <div className="h-8 bg-gray-200 rounded w-16"></div>
              </div>
              <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
      {metricsConfig.map((metric, index) => (
        <motion.div
          key={metric.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.1 }}
        >
          <MetricCard {...metric} />
        </motion.div>
      ))}
    </div>
  );
};

export default DashboardMetrics;
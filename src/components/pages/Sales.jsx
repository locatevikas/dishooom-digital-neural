import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import SalesOrderCard from '@/components/molecules/SalesOrderCard';
import SearchBar from '@/components/molecules/SearchBar';
import Button from '@/components/atoms/Button';
import ApperIcon from '@/components/ApperIcon';
import salesOrderService from '@/services/api/salesOrderService';
import invoiceService from '@/services/api/invoiceService';
import customerService from '@/services/api/customerService';

const SalesFloatingActionButton = () => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate('/sales/create');
  };

  return (
    <div className="fixed bottom-24 right-4 z-30">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleClick}
        className="w-14 h-14 bg-primary text-white rounded-full shadow-lg flex items-center justify-center transition-all duration-200"
      >
        <ApperIcon name="Plus" size={24} />
      </motion.button>
    </div>
  );
};
const Sales = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all'); // all, pending, partial, paid
  const navigate = useNavigate();

  useEffect(() => {
    loadOrders();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [orders, filter]);

  const loadOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await salesOrderService.getAll();
      setOrders(data);
    } catch (err) {
      setError(err.message || 'Failed to load sales orders');
      toast.error('Failed to load sales orders');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...orders];
    
    switch (filter) {
      case 'pending':
      case 'partial':
      case 'paid':
        filtered = filtered.filter(o => o.paymentStatus === filter);
        break;
      default:
        break;
    }
    
    setFilteredOrders(filtered);
  };

  const handleSearch = (searchTerm) => {
    if (!searchTerm) {
      applyFilters();
      return;
    }
    
    const filtered = orders.filter(order =>
      order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.Id.toString().includes(searchTerm)
    );
    setFilteredOrders(filtered);
  };

  const handleView = (order) => {
    // Navigate to order details - for now, just show a toast
    toast.info('Order details view coming soon');
  };

  const handleEdit = (order) => {
    // Navigate to edit order page
    navigate(`/sales/edit/${order.Id}`);
  };

  const handleDelete = async (order) => {
    if (!window.confirm(`Are you sure you want to delete order #${order.Id}?`)) return;

    try {
      await salesOrderService.delete(order.Id);
      toast.success('Sales order deleted successfully');
      loadOrders();
} catch (error) {
      toast.error(`Failed to delete order: ${error.message}`);
    }
  };

  const handleGenerateInvoice = async (order) => {
    try {
      toast.info('Generating invoice PDF...');
      
      // Get customer data for invoice
      let customerData = null;
      try {
        customerData = await customerService.getById(order.customerId);
      } catch (err) {
        console.warn('Could not fetch customer details:', err);
      }
      
      const result = await invoiceService.generatePDFInvoice(order, customerData);
      
      if (result.success) {
        toast.success(`Invoice ${result.filename} downloaded successfully!`);
      }
    } catch (error) {
      console.error('Invoice generation failed:', error);
      toast.error(`Failed to generate invoice: ${error.message}`);
    }
  };

  const filterOptions = [
    { value: 'all', label: 'All Orders', icon: 'ShoppingCart' },
    { value: 'pending', label: 'Pending', icon: 'Clock' },
    { value: 'partial', label: 'Partial', icon: 'AlertCircle' },
    { value: 'paid', label: 'Paid', icon: 'CheckCircle' }
  ];

  if (loading) {
    return (
      <div className="min-h-full bg-gray-50 dark:bg-gray-900">
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-4">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-32 animate-pulse"></div>
        </div>
        <div className="p-4 space-y-4">
          <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
          <div className="grid gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white dark:bg-gray-800 rounded-lg p-4 animate-pulse">
                <div className="space-y-3">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                  <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-full bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center p-8">
          <ApperIcon name="AlertCircle" size={48} className="mx-auto mb-4 text-red-500" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Failed to load sales orders</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
          <Button onClick={loadOrders}>Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-4">
        <div className="mb-4">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Sales Orders</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">{filteredOrders.length} orders</p>
        </div>

        <SearchBar
          placeholder="Search orders..."
          onSearch={handleSearch}
        />
      </div>

      {/* Filter Tabs */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4">
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {filterOptions.map(option => (
            <motion.button
              key={option.value}
              whileTap={{ scale: 0.95 }}
              onClick={() => setFilter(option.value)}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap
                transition-colors duration-200
                ${filter === option.value
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }
              `}
            >
              <ApperIcon name={option.icon} size={16} />
              {option.label}
              {option.value === 'pending' && (
                <span className="ml-1 px-2 py-0.5 bg-orange-100 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 rounded-full text-xs">
                  {orders.filter(o => o.paymentStatus === 'pending').length}
                </span>
              )}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {filteredOrders.length === 0 ? (
          <div className="text-center py-12">
            <ApperIcon name="ShoppingCart" size={64} className="mx-auto mb-4 text-gray-300 dark:text-gray-700" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No sales orders found</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {filter === 'all' 
                ? "Start by creating your first sales order"
                : "No orders match the current filter"
              }
            </p>
            {filter === 'all' && (
              <Button onClick={() => navigate('/sales/create')}>
                Create Your First Order
              </Button>
            )}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4"
          >
            {filteredOrders.map((order, index) => (
              <motion.div
                key={order.Id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
<SalesOrderCard
                  order={order}
                  onView={handleView}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onInvoiceGenerate={handleGenerateInvoice}
                />
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>

{/* Floating Action Button */}
      <SalesFloatingActionButton />
    </div>
  );
};

export default Sales;
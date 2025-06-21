import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import SalesOrderCard from '@/components/molecules/SalesOrderCard';
import SearchBar from '@/components/molecules/SearchBar';
import Button from '@/components/atoms/Button';
import ApperIcon from '@/components/ApperIcon';
import salesOrderService from '@/services/api/salesOrderService';

const Sales = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all'); // all, paid, partial, pending
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
      // Sort by date descending
      const sortedData = data.sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate));
      setOrders(sortedData);
    } catch (err) {
      setError(err.message || 'Failed to load sales orders');
      toast.error('Failed to load sales orders');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...orders];
    
    if (filter !== 'all') {
      filtered = filtered.filter(order => order.paymentStatus === filter);
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
      order.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.items.some(item => 
        item.productName.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
    setFilteredOrders(filtered);
  };

  const handleUpdatePayment = async (order, newStatus) => {
    try {
      await salesOrderService.updatePaymentStatus(order.Id, newStatus);
      toast.success(`Payment status updated to ${newStatus}`);
      loadOrders();
    } catch (error) {
      toast.error(`Failed to update payment status: ${error.message}`);
    }
  };

  const handleViewDetails = (order) => {
    // For now, show a simple alert with order details
    const itemsList = order.items.map(item => 
      `${item.productName} x${item.quantity} = ₹${item.total}`
    ).join('\n');
    
    alert(`Order Details:\n\nCustomer: ${order.customerName}\nInvoice: ${order.invoiceNumber}\nTotal: ₹${order.totalAmount}\n\nItems:\n${itemsList}`);
  };

  const handleEdit = (order) => {
    // Navigate to edit page - for now, just show a toast
    toast.info('Edit functionality coming soon');
  };

  const handleDelete = async (order) => {
    if (!window.confirm(`Are you sure you want to delete order ${order.invoiceNumber}?`)) return;

    try {
      await salesOrderService.delete(order.Id);
      toast.success('Sales order deleted successfully');
      loadOrders();
    } catch (error) {
      toast.error(`Failed to delete order: ${error.message}`);
    }
  };

  const filterOptions = [
    { value: 'all', label: 'All Orders', icon: 'ShoppingCart' },
    { value: 'paid', label: 'Paid', icon: 'CheckCircle' },
    { value: 'partial', label: 'Partial', icon: 'Clock' },
    { value: 'pending', label: 'Pending', icon: 'AlertCircle' }
  ];

  // Calculate totals
  const totals = {
    all: orders.length,
    paid: orders.filter(o => o.paymentStatus === 'paid').length,
    partial: orders.filter(o => o.paymentStatus === 'partial').length,
    pending: orders.filter(o => o.paymentStatus === 'pending').length,
    totalAmount: orders.reduce((sum, order) => sum + order.totalAmount, 0),
    pendingAmount: orders.filter(o => o.paymentStatus === 'pending').reduce((sum, order) => sum + order.totalAmount, 0)
  };

  if (loading) {
    return (
      <div className="min-h-full bg-gray-50">
        <div className="bg-white border-b border-gray-200 px-4 py-4">
          <div className="h-6 bg-gray-200 rounded w-32 animate-pulse"></div>
        </div>
        <div className="p-4 space-y-4">
          <div className="h-12 bg-gray-200 rounded animate-pulse"></div>
          <div className="grid gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg p-4 animate-pulse">
                <div className="space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-8 bg-gray-200 rounded"></div>
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
      <div className="min-h-full bg-gray-50 flex items-center justify-center">
        <div className="text-center p-8">
          <ApperIcon name="AlertCircle" size={48} className="mx-auto mb-4 text-red-500" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Failed to load sales orders</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={loadOrders}>Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Sales</h1>
            <p className="text-sm text-gray-600">
              {filteredOrders.length} orders • ₹{totals.totalAmount.toLocaleString()} total
            </p>
          </div>
          <Button
            size="sm"
            onClick={() => navigate('/sales/create')}
            className="flex items-center gap-2"
          >
            <ApperIcon name="Plus" size={16} />
            New Order
          </Button>
        </div>

        <SearchBar
          placeholder="Search orders..."
          onSearch={handleSearch}
        />
      </div>

      {/* Summary Cards */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <p className="text-sm text-green-600 font-medium">Total Sales</p>
            <p className="text-lg font-bold text-green-700">₹{totals.totalAmount.toLocaleString()}</p>
          </div>
          <div className="text-center p-3 bg-red-50 rounded-lg">
            <p className="text-sm text-red-600 font-medium">Pending Payments</p>
            <p className="text-lg font-bold text-red-700">₹{totals.pendingAmount.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white border-b border-gray-200 px-4">
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
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }
              `}
            >
              <ApperIcon name={option.icon} size={16} />
              {option.label}
              <span className="ml-1 px-2 py-0.5 bg-white/20 rounded-full text-xs">
                {totals[option.value]}
              </span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {filteredOrders.length === 0 ? (
          <div className="text-center py-12">
            <ApperIcon name="ShoppingCart" size={64} className="mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
            <p className="text-gray-600 mb-6">
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
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onUpdatePayment={handleUpdatePayment}
                  onViewDetails={handleViewDetails}
                />
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Sales;
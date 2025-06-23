import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import CustomerCard from '@/components/molecules/CustomerCard';
import SearchBar from '@/components/molecules/SearchBar';
import Button from '@/components/atoms/Button';
import ApperIcon from '@/components/ApperIcon';
import FloatingActionButton from '@/components/molecules/FloatingActionButton';
import customerService from '@/services/api/customerService';

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all'); // all, new, contacted, closed, retailer, reseller
  const navigate = useNavigate();

  useEffect(() => {
    loadCustomers();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [customers, filter]);

  const loadCustomers = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await customerService.getAll();
      setCustomers(data);
    } catch (err) {
      setError(err.message || 'Failed to load customers');
      toast.error('Failed to load customers');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...customers];
    
    switch (filter) {
      case 'new':
      case 'contacted':
      case 'closed':
        filtered = filtered.filter(c => c.pipelineStage === filter);
        break;
      case 'retailer':
      case 'reseller':
        filtered = filtered.filter(c => c.type.toLowerCase() === filter);
        break;
      default:
        break;
    }
    
    setFilteredCustomers(filtered);
  };

  const handleSearch = (searchTerm) => {
    if (!searchTerm) {
      applyFilters();
      return;
    }
    
    const filtered = customers.filter(customer =>
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phone.includes(searchTerm) ||
      customer.type.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredCustomers(filtered);
  };

  const handleCall = (customer) => {
    // Simulate phone call
    if (window.confirm(`Call ${customer.name} at ${customer.phone}?`)) {
      window.open(`tel:${customer.phone}`);
    }
  };

  const handleEmail = (customer) => {
    // Simulate email
    const subject = encodeURIComponent(`Follow up - ${customer.name}`);
    const body = encodeURIComponent(`Dear ${customer.name},\n\nThank you for your interest in Dishooom products.\n\nBest regards,\nDishooom Team`);
    window.open(`mailto:${customer.email}?subject=${subject}&body=${body}`);
  };

  const handleUpdateStage = async (customer, newStage) => {
    try {
      await customerService.updatePipelineStage(customer.Id, newStage);
      toast.success(`Customer moved to ${newStage} stage`);
      loadCustomers();
    } catch (error) {
      toast.error(`Failed to update stage: ${error.message}`);
    }
  };
const handleEdit = (customer) => {
    navigate(`/customers/edit/${customer.Id}`);
  };

  const handleDelete = async (customer) => {
    if (!window.confirm(`Are you sure you want to delete ${customer.name}?`)) return;

    try {
      await customerService.delete(customer.Id);
      toast.success('Customer deleted successfully');
      loadCustomers();
    } catch (error) {
      toast.error(`Failed to delete customer: ${error.message}`);
    }
  };

  const filterOptions = [
    { value: 'all', label: 'All Customers', icon: 'Users' },
    { value: 'new', label: 'New Leads', icon: 'UserPlus' },
    { value: 'contacted', label: 'Contacted', icon: 'Phone' },
    { value: 'closed', label: 'Closed', icon: 'CheckCircle' },
    { value: 'retailer', label: 'Retailers', icon: 'Store' },
    { value: 'reseller', label: 'Resellers', icon: 'Building' }
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
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Failed to load customers</h3>
          <p className="text-gray-600 dark:text-gray-300 mb-4">{error}</p>
          <Button onClick={loadCustomers}>Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-gray-50 dark:bg-gray-900">
{/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-4">
        <div className="mb-4">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Customers</h1>
          <p className="text-sm text-gray-600 dark:text-gray-300">{filteredCustomers.length} customers</p>
        </div>

        <SearchBar
          placeholder="Search customers..."
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
              {option.value === 'new' && (
                <span className="ml-1 px-2 py-0.5 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 rounded-full text-xs">
                  {customers.filter(c => c.pipelineStage === 'new').length}
                </span>
              )}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {filteredCustomers.length === 0 ? (
          <div className="text-center py-12">
            <ApperIcon name="Users" size={64} className="mx-auto mb-4 text-gray-300 dark:text-gray-700" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No customers found</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              {filter === 'all' 
                ? "Start by adding your first customer"
                : "No customers match the current filter"}
            </p>
            {filter === 'all' && (
              <Button onClick={() => navigate('/customers/add')}>
                Add Your First Customer
              </Button>
            )}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4"
          >
            {filteredCustomers.map((customer, index) => (
              <motion.div
                key={customer.Id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <CustomerCard
                  customer={customer}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onCall={handleCall}
                  onEmail={handleEmail}
                  onUpdateStage={handleUpdateStage}
                />
              </motion.div>
            ))}
</motion.div>
        )}
      </div>

      {/* Floating Action Button */}
      <div className="fixed bottom-24 right-4 z-30">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/customers/add')}
          className="w-14 h-14 bg-primary text-white rounded-full shadow-lg flex items-center justify-center transition-all duration-200"
        >
          <ApperIcon name="UserPlus" size={24} />
        </motion.button>
      </div>
    </div>
  );
};

export default Customers;
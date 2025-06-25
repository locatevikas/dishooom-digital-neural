import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import ApperIcon from '@/components/ApperIcon';
import Button from '@/components/atoms/Button';
import Card from '@/components/atoms/Card';
import Input from '@/components/atoms/Input';
import Select from '@/components/atoms/Select';
import Badge from '@/components/atoms/Badge';
import expenseService from '@/services/api/expenseService';
import { format } from 'date-fns';

const Expenses = () => {
  const navigate = useNavigate();
  const [expenses, setExpenses] = useState([]);
  const [filteredExpenses, setFilteredExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [filter, setFilter] = useState('all');
  const [formData, setFormData] = useState({
    category: '',
    amount: '',
    description: '',
    vendor: '',
    date: new Date().toISOString().split('T')[0]
  });

  const categories = [
    { value: 'Raw Materials', label: 'Raw Materials' },
    { value: 'Packaging', label: 'Packaging' },
    { value: 'Transport', label: 'Transport' },
    { value: 'Marketing', label: 'Marketing' },
    { value: 'Utilities', label: 'Utilities' },
    { value: 'Equipment', label: 'Equipment' },
    { value: 'Office', label: 'Office' },
    { value: 'Other', label: 'Other' }
  ];

  useEffect(() => {
    loadExpenses();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [expenses, filter]);

  const loadExpenses = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await expenseService.getAll();
      // Sort by date descending
      const sortedData = data.sort((a, b) => new Date(b.date) - new Date(a.date));
      setExpenses(sortedData);
    } catch (err) {
      setError(err.message || 'Failed to load expenses');
      toast.error('Failed to load expenses');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...expenses];
    
    if (filter !== 'all') {
      filtered = filtered.filter(expense => expense.category === filter);
    }
    
    setFilteredExpenses(filtered);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.category || !formData.amount || !formData.description) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (parseFloat(formData.amount) <= 0) {
      toast.error('Amount must be greater than 0');
      return;
    }

    try {
      const expenseData = {
        ...formData,
        amount: parseFloat(formData.amount)
      };

      await expenseService.create(expenseData);
      toast.success('Expense added successfully!');
      setShowAddForm(false);
      setFormData({
        category: '',
        amount: '',
        description: '',
        vendor: '',
        date: new Date().toISOString().split('T')[0]
      });
      loadExpenses();
    } catch (error) {
      toast.error(`Failed to add expense: ${error.message}`);
    }
  };

  const handleDelete = async (expense) => {
    if (!window.confirm(`Are you sure you want to delete this expense?`)) return;

    try {
      await expenseService.delete(expense.Id);
      toast.success('Expense deleted successfully');
      loadExpenses();
    } catch (error) {
      toast.error(`Failed to delete expense: ${error.message}`);
    }
  };

  // Calculate totals
  const totalExpenses = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const monthlyExpenses = filteredExpenses.filter(expense => {
    const expenseDate = new Date(expense.date);
    return expenseDate.getMonth() === currentMonth && expenseDate.getFullYear() === currentYear;
  }).reduce((sum, expense) => sum + expense.amount, 0);

  const categoryColors = {
    'Raw Materials': 'primary',
    'Packaging': 'secondary',
    'Transport': 'accent',
    'Marketing': 'info',
    'Utilities': 'warning',
    'Equipment': 'success',
    'Office': 'default',
    'Other': 'default'
  };

  if (loading) {
    return (
      <div className="min-h-full bg-gray-50 dark:bg-gray-900">
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-4">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-32 animate-pulse"></div>
        </div>
        <div className="p-4 space-y-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-lg p-4 animate-pulse">
              <div className="space-y-3">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-full bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center p-8">
          <ApperIcon name="AlertCircle" size={48} className="mx-auto mb-4 text-red-500" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Failed to load expenses</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
          <Button onClick={loadExpenses}>Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-4">
        <div className="flex items-center gap-4 mb-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/more')}
            className="p-2"
          >
            <ApperIcon name="ArrowLeft" size={20} />
          </Button>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Expenses</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">{filteredExpenses.length} expenses</p>
          </div>
          <Button
            size="sm"
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-2"
          >
            <ApperIcon name="Plus" size={16} />
            Add Expense
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
            <p className="text-sm text-red-600 dark:text-red-400 font-medium">Total Expenses</p>
            <p className="text-lg font-bold text-red-700 dark:text-red-300">₹{totalExpenses.toLocaleString()}</p>
          </div>
          <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">This Month</p>
            <p className="text-lg font-bold text-blue-700 dark:text-blue-300">₹{monthlyExpenses.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4">
        <div className="flex gap-2 overflow-x-auto pb-2 pt-3 scrollbar-hide">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setFilter('all')}
            className={`
              flex items-center gap-2 px-4 py-3 rounded-full text-sm font-medium whitespace-nowrap
              transition-colors duration-200
              ${filter === 'all'
                ? 'bg-primary text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }
            `}
          >
            <ApperIcon name="Receipt" size={16} />
            All Expenses
          </motion.button>
          {categories.map(category => (
            <motion.button
              key={category.value}
              whileTap={{ scale: 0.95 }}
              onClick={() => setFilter(category.value)}
              className={`
                flex items-center gap-2 px-4 py-3 rounded-full text-sm font-medium whitespace-nowrap
                transition-colors duration-200
                ${filter === category.value
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }
              `}
            >
              <ApperIcon name={category.value === 'Other' ? 'MoreHorizontal' : 'Tag'} size={16} />
              {category.label}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Add Expense Form */}
      {showAddForm && (
        <div className="bg-white border-b border-gray-200 p-4 dark:bg-gray-800 dark:border-gray-700">
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            onSubmit={handleSubmit}
            className="space-y-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900 dark:text-white">Add New Expense</h3>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowAddForm(false)}
                className="p-2"
              >
                <ApperIcon name="X" size={16} />
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Select
                label="Category"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                options={categories}
                placeholder="Select category"
                required
              />

              <Input
                label="Amount (₹)"
                name="amount"
                type="number"
                value={formData.amount}
                onChange={handleInputChange}
                placeholder="0.00"
                min="0"
                step="0.01"
                required
              />
            </div>

            <Input
              label="Description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Brief description of the expense"
              required
            />

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Vendor/Supplier"
                name="vendor"
                value={formData.vendor}
                onChange={handleInputChange}
                placeholder="Vendor name (optional)"
              />

              <Input
                label="Date"
                name="date"
                type="date"
                value={formData.date}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                fullWidth
                onClick={() => setShowAddForm(false)}
              >
                Cancel
              </Button>
              <Button type="submit" fullWidth>
                Add Expense
              </Button>
            </div>
          </motion.form>
        </div>
      )}

      {/* Content */}
      <div className="p-4">
        {filteredExpenses.length === 0 ? (
          <div className="text-center py-12">
            <ApperIcon name="Receipt" size={64} className="mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No expenses found</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {filter === 'all' 
                ? "Start by adding your first expense"
                : "No expenses match the current filter"
              }
            </p>
            {filter === 'all' && (
              <Button onClick={() => setShowAddForm(true)}>
                Add Your First Expense
              </Button>
            )}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4"
          >
            {filteredExpenses.map((expense, index) => (
              <motion.div
                key={expense.Id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <Card className="p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant={categoryColors[expense.category] || 'default'}>
                          {expense.category}
                        </Badge>
                        <span className="text-sm text-gray-500">
                          {format(new Date(expense.date), 'MMM dd, yyyy')}
                        </span>
                      </div>
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{expense.description}</h3>
                      {expense.vendor && (
                        <p className="text-sm text-gray-600">{expense.vendor}</p>
                      )}
                    </div>
                    <div className="text-right ml-4">
                      <p className="text-lg font-bold text-red-600">₹{expense.amount.toLocaleString()}</p>
                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleDelete(expense)}
                        className="mt-1 p-1 text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <ApperIcon name="Trash2" size={16} />
                      </motion.button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Expenses;
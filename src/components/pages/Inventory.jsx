import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import ProductCard from '@/components/molecules/ProductCard';
import SearchBar from '@/components/molecules/SearchBar';
import Button from '@/components/atoms/Button';
import ApperIcon from '@/components/ApperIcon';
import productService from '@/services/api/productService';

const Inventory = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all'); // all, branded, white-label, low-stock
  const navigate = useNavigate();

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [products, filter]);

  const loadProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await productService.getAll();
      setProducts(data);
    } catch (err) {
      setError(err.message || 'Failed to load products');
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...products];
    
    switch (filter) {
      case 'branded':
        filtered = filtered.filter(p => !p.isWhiteLabelled);
        break;
      case 'white-label':
        filtered = filtered.filter(p => p.isWhiteLabelled);
        break;
      case 'low-stock':
        filtered = filtered.filter(p => p.currentStock <= p.minStock);
        break;
      default:
        break;
    }
    
    setFilteredProducts(filtered);
  };

  const handleSearch = (searchTerm) => {
    if (!searchTerm) {
      applyFilters();
      return;
    }
    
    const filtered = products.filter(product =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredProducts(filtered);
  };

  const handleStockUpdate = async (product, type) => {
    const quantity = prompt(`Enter quantity to ${type === 'in' ? 'add to' : 'remove from'} stock:`);
    if (!quantity || isNaN(quantity) || parseInt(quantity) <= 0) return;

    try {
      await productService.updateStock(product.Id, parseInt(quantity), type);
      toast.success(`Stock ${type === 'in' ? 'added' : 'removed'} successfully`);
      loadProducts();
    } catch (error) {
      toast.error(`Failed to update stock: ${error.message}`);
    }
  };
const handleEdit = (product) => {
    navigate(`/inventory/edit/${product.Id}`);
  };

  const handleDelete = async (product) => {
    if (!window.confirm(`Are you sure you want to delete ${product.name}?`)) return;

    try {
      await productService.delete(product.Id);
      toast.success('Product deleted successfully');
      loadProducts();
    } catch (error) {
      toast.error(`Failed to delete product: ${error.message}`);
    }
  };

  const filterOptions = [
    { value: 'all', label: 'All Products', icon: 'Package' },
    { value: 'branded', label: 'Branded', icon: 'Award' },
    { value: 'white-label', label: 'White Label', icon: 'Tag' },
    { value: 'low-stock', label: 'Low Stock', icon: 'AlertTriangle' }
  ];

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
                  <div className="h-2 bg-gray-200 rounded"></div>
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
          <h3 className="text-lg font-medium text-gray-900 mb-2">Failed to load inventory</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={loadProducts}>Try Again</Button>
        </div>
      </div>
    );
  }

  return (
<div className="min-h-full bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="mb-4">
          <h1 className="text-xl font-bold text-gray-900">Inventory</h1>
          <p className="text-sm text-gray-600">{filteredProducts.length} products</p>
        </div>

        <SearchBar
          placeholder="Search products..."
          onSearch={handleSearch}
        />
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
              {option.value === 'low-stock' && (
                <span className="ml-1 px-2 py-0.5 bg-red-100 text-red-600 rounded-full text-xs">
                  {products.filter(p => p.currentStock <= p.minStock).length}
                </span>
              )}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <ApperIcon name="Package" size={64} className="mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
            <p className="text-gray-600 mb-6">
              {filter === 'all' 
                ? "Start by adding your first product to inventory"
                : "No products match the current filter"
              }
            </p>
            {filter === 'all' && (
              <Button onClick={() => navigate('/inventory/add')}>
                Add Your First Product
              </Button>
            )}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4"
          >
            {filteredProducts.map((product, index) => (
              <motion.div
                key={product.Id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <ProductCard
                  product={product}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onStockUpdate={handleStockUpdate}
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
          onClick={() => navigate('/inventory/add')}
          className="w-14 h-14 bg-primary text-white rounded-full shadow-lg flex items-center justify-center transition-all duration-200"
        >
          <ApperIcon name="Plus" size={24} />
        </motion.button>
      </div>
    </div>
  );
};

export default Inventory;
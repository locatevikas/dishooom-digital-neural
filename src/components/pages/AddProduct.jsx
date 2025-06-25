import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import Button from '@/components/atoms/Button';
import Input from '@/components/atoms/Input';
import Select from '@/components/atoms/Select';
import ApperIcon from '@/components/ApperIcon';
import productService from '@/services/api/productService';

const AddProduct = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    category: '',
    currentStock: '',
    minStock: '',
    unit: 'bottles',
    isWhiteLabelled: false,
    batchDate: '',
    expiryDate: '',
    costPrice: '',
    sellingPrice: ''
  });

  const productTypes = [
    { value: 'Handwash', label: 'Handwash' },
    { value: 'Phenyl', label: 'Phenyl' },
    { value: 'Dish Wash', label: 'Dish Wash' },
    { value: 'Car Wash', label: 'Car Wash' },
    { value: 'Room Freshener', label: 'Room Freshener' },
    { value: 'Floor Cleaner', label: 'Floor Cleaner' },
    { value: 'Glass Cleaner', label: 'Glass Cleaner' },
    { value: 'Toilet Cleaner', label: 'Toilet Cleaner' }
  ];

  const categories = [
    { value: 'Personal Care', label: 'Personal Care' },
    { value: 'Floor Care', label: 'Floor Care' },
    { value: 'Kitchen Care', label: 'Kitchen Care' },
    { value: 'Automotive', label: 'Automotive' },
    { value: 'Air Care', label: 'Air Care' },
    { value: 'Bathroom Care', label: 'Bathroom Care' }
  ];

  const units = [
    { value: 'bottles', label: 'Bottles' },
    { value: 'liters', label: 'Liters' },
    { value: 'pieces', label: 'Pieces' },
    { value: 'kg', label: 'Kilograms' },
    { value: 'packs', label: 'Packs' }
  ];

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.name || !formData.type || !formData.category) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (parseFloat(formData.currentStock) < 0 || parseFloat(formData.minStock) < 0) {
      toast.error('Stock quantities cannot be negative');
      return;
    }

    if (parseFloat(formData.costPrice) < 0 || parseFloat(formData.sellingPrice) < 0) {
      toast.error('Prices cannot be negative');
      return;
    }

    setLoading(true);
    try {
      const productData = {
        ...formData,
        currentStock: parseInt(formData.currentStock) || 0,
        minStock: parseInt(formData.minStock) || 0,
        costPrice: parseFloat(formData.costPrice) || 0,
        sellingPrice: parseFloat(formData.sellingPrice) || 0
      };

      await productService.create(productData);
      toast.success('Product added successfully!');
      navigate('/inventory');
    } catch (error) {
      toast.error(`Failed to add product: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-full bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-4 dark:bg-gray-800 dark:border-gray-700">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/products')}
            className="p-2"
          >
            <ApperIcon name="ArrowLeft" size={20} />
          </Button>
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Add Product</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">Add new product to inventory</p>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="p-4">
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleSubmit}
          className="space-y-6"
        >
          {/* Basic Information */}
          <div className="bg-white rounded-lg p-4 space-y-4 dark:bg-gray-800">
            <h3 className="font-semibold text-gray-900 dark:text-white">Basic Information</h3>
            
            <Input
              label="Product Name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="e.g., Dishooom Premium Handwash"
              required
            />

            <div className="grid grid-cols-2 gap-4">
              <Select
                label="Product Type"
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                options={productTypes}
                placeholder="Select type"
                required
              />

              <Select
                label="Category"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                options={categories}
                placeholder="Select category"
                required
              />
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="isWhiteLabelled"
                name="isWhiteLabelled"
                checked={formData.isWhiteLabelled}
                onChange={handleInputChange}
                className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
              />
              <label htmlFor="isWhiteLabelled" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                White Labelled Product
              </label>
            </div>
          </div>

          {/* Inventory Details */}
          <div className="bg-white rounded-lg p-4 space-y-4 dark:bg-gray-800">
            <h3 className="font-semibold text-gray-900 dark:text-white">Inventory Details</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Current Stock"
                name="currentStock"
                type="number"
                value={formData.currentStock}
                onChange={handleInputChange}
                placeholder="0"
                min="0"
                required
              />

              <Input
                label="Minimum Stock"
                name="minStock"
                type="number"
                value={formData.minStock}
                onChange={handleInputChange}
                placeholder="0"
                min="0"
                required
              />
            </div>

            <Select
              label="Unit"
              name="unit"
              value={formData.unit}
              onChange={handleInputChange}
              options={units}
              required
            />

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Batch Date"
                name="batchDate"
                type="date"
                value={formData.batchDate}
                onChange={handleInputChange}
              />

              <Input
                label="Expiry Date"
                name="expiryDate"
                type="date"
                value={formData.expiryDate}
                onChange={handleInputChange}
              />
            </div>
          </div>

          {/* Pricing */}
          <div className="bg-white rounded-lg p-4 space-y-4 dark:bg-gray-800">
            <h3 className="font-semibold text-gray-900 dark:text-white">Pricing</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Cost Price (₹)"
                name="costPrice"
                type="number"
                value={formData.costPrice}
                onChange={handleInputChange}
                placeholder="0.00"
                min="0"
                step="0.01"
              />

              <Input
                label="Selling Price (₹)"
                name="sellingPrice"
                type="number"
                value={formData.sellingPrice}
                onChange={handleInputChange}
                placeholder="0.00"
                min="0"
                step="0.01"
              />
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              fullWidth
              onClick={() => navigate('/inventory')}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              fullWidth
              loading={loading}
            >
              Add Product
            </Button>
          </div>
        </motion.form>
      </div>
    </div>
  );
};

export default AddProduct;
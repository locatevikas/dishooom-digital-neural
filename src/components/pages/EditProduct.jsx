import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import Button from '@/components/atoms/Button';
import Input from '@/components/atoms/Input';
import Select from '@/components/atoms/Select';
import ApperIcon from '@/components/ApperIcon';
import productService from '@/services/api/productService';

const EditProduct = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
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

  useEffect(() => {
    loadProduct();
  }, [id]);

  const loadProduct = async () => {
    setInitialLoading(true);
    try {
      const product = await productService.getById(parseInt(id));
      if (!product) {
        toast.error('Product not found');
        navigate('/inventory');
        return;
      }
      
      setFormData({
        name: product.name || '',
        type: product.type || '',
        category: product.category || '',
        currentStock: product.currentStock?.toString() || '',
        minStock: product.minStock?.toString() || '',
        unit: product.unit || 'bottles',
        isWhiteLabelled: product.isWhiteLabelled || false,
        batchDate: product.batchDate || '',
        expiryDate: product.expiryDate || '',
        costPrice: product.costPrice?.toString() || '',
        sellingPrice: product.sellingPrice?.toString() || ''
      });
    } catch (error) {
      toast.error(`Failed to load product: ${error.message}`);
      navigate('/inventory');
    } finally {
      setInitialLoading(false);
    }
  };

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

      await productService.update(parseInt(id), productData);
      toast.success('Product updated successfully!');
      navigate('/inventory');
    } catch (error) {
      toast.error(`Failed to update product: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="min-h-full bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading product...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-4 dark:bg-gray-800 dark:border-gray-700">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/inventory')}
            className="p-2"
          >
            <ApperIcon name="ArrowLeft" size={20} />
          </Button>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Edit Product</h1>
            <p className="text-sm text-gray-600">Update product information</p>
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
          <div className="bg-white rounded-lg p-4 space-y-4">
            <h3 className="font-semibold text-gray-900">Inventory Details</h3>
            
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
          <div className="bg-white rounded-lg p-4 space-y-4">
            <h3 className="font-semibold text-gray-900">Pricing</h3>
            
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
              Update Product
            </Button>
          </div>
        </motion.form>
      </div>
    </div>
  );
};

export default EditProduct;
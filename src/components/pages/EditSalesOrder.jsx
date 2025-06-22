import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import Button from '@/components/atoms/Button';
import Input from '@/components/atoms/Input';
import Select from '@/components/atoms/Select';
import ApperIcon from '@/components/ApperIcon';
import salesOrderService from '@/services/api/salesOrderService';
import customerService from '@/services/api/customerService';
import productService from '@/services/api/productService';

const EditSalesOrder = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  
  const [orderData, setOrderData] = useState({
    customerId: '',
    customerName: '',
    items: [],
    paymentStatus: 'pending',
    notes: ''
  });

  const paymentStatusOptions = [
    { value: 'pending', label: 'Pending' },
    { value: 'partial', label: 'Partial Payment' },
    { value: 'paid', label: 'Fully Paid' }
  ];

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const [order, customersData, productsData] = await Promise.all([
        salesOrderService.getById(parseInt(id, 10)),
        customerService.getAll(),
        productService.getAll()
      ]);
      
      setOrderData({
        customerId: order.customerId || '',
        customerName: order.customerName || '',
        items: order.items || [],
        paymentStatus: order.paymentStatus || 'pending',
        notes: order.notes || ''
      });
      
      setCustomers(customersData);
      setProducts(productsData);
    } catch (err) {
      setError(err.message || 'Failed to load order data');
      toast.error('Failed to load order data');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setOrderData(prev => ({
      ...prev,
      [name]: value
    }));

    // Update customer name when customer is selected
    if (name === 'customerId') {
      const selectedCustomer = customers.find(c => c.Id === parseInt(value, 10));
      setOrderData(prev => ({
        ...prev,
        customerName: selectedCustomer ? selectedCustomer.name : ''
      }));
    }
  };

  const handleItemChange = (index, field, value) => {
    const updatedItems = [...orderData.items];
    updatedItems[index] = {
      ...updatedItems[index],
      [field]: field === 'quantity' || field === 'unitPrice' ? parseFloat(value) || 0 : value
    };
    
    // Recalculate total for the item
    if (field === 'quantity' || field === 'unitPrice') {
      updatedItems[index].total = updatedItems[index].quantity * updatedItems[index].unitPrice;
    }
    
    setOrderData(prev => ({
      ...prev,
      items: updatedItems
    }));
  };

  const addItem = () => {
    const newItem = {
      productId: '',
      productName: '',
      quantity: 1,
      unitPrice: 0,
      total: 0
    };
    
    setOrderData(prev => ({
      ...prev,
      items: [...prev.items, newItem]
    }));
  };

  const removeItem = (index) => {
    setOrderData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const calculateTotalAmount = () => {
    return orderData.items.reduce((sum, item) => sum + (item.total || 0), 0);
  };

  const validateForm = () => {
    if (!orderData.customerId) {
      toast.error('Please select a customer');
      return false;
    }
    
    if (orderData.items.length === 0) {
      toast.error('Please add at least one item');
      return false;
    }
    
    for (let i = 0; i < orderData.items.length; i++) {
      const item = orderData.items[i];
      if (!item.productId || !item.quantity || !item.unitPrice) {
        toast.error(`Please complete item ${i + 1} details`);
        return false;
      }
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setSaving(true);
    
    try {
      const totalAmount = calculateTotalAmount();
      
      const updateData = {
        customerId: parseInt(orderData.customerId, 10),
        customerName: orderData.customerName,
        items: orderData.items,
        totalAmount,
        paymentStatus: orderData.paymentStatus,
        notes: orderData.notes
      };
      
      await salesOrderService.update(parseInt(id, 10), updateData);
      toast.success('Sales order updated successfully');
      navigate('/sales');
    } catch (error) {
      toast.error(`Failed to update order: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-full bg-gray-50">
        <div className="bg-white border-b border-gray-200 px-4 py-4">
          <div className="h-6 bg-gray-200 rounded w-32 animate-pulse"></div>
        </div>
        <div className="p-4 space-y-4">
          <div className="h-12 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-32 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-20 bg-gray-200 rounded animate-pulse"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-full bg-gray-50 flex items-center justify-center">
        <div className="text-center p-8">
          <ApperIcon name="AlertCircle" size={48} className="mx-auto mb-4 text-red-500" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Failed to load order</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={() => navigate('/sales')}>Back to Sales</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="flex items-center gap-3">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/sales')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ApperIcon name="ArrowLeft" size={20} />
          </motion.button>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Edit Sales Order</h1>
            <p className="text-sm text-gray-600">Update order details</p>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="p-4">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Customer Selection */}
          <div className="bg-white rounded-lg p-4 space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">Customer Information</h2>
            <Select
              label="Customer"
              name="customerId"
              value={orderData.customerId}
              onChange={handleInputChange}
              required
            >
              <option value="">Select Customer</option>
              {customers.map(customer => (
                <option key={customer.Id} value={customer.Id}>
                  {customer.name}
                </option>
              ))}
            </Select>
          </div>

          {/* Items */}
          <div className="bg-white rounded-lg p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Order Items</h2>
              <Button type="button" onClick={addItem} size="sm">
                <ApperIcon name="Plus" size={16} className="mr-2" />
                Add Item
              </Button>
            </div>
            
            {orderData.items.map((item, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-gray-900">Item {index + 1}</h3>
                  <motion.button
                    type="button"
                    whileTap={{ scale: 0.95 }}
                    onClick={() => removeItem(index)}
                    className="p-1 text-red-500 hover:bg-red-50 rounded transition-colors"
                  >
                    <ApperIcon name="Trash2" size={16} />
                  </motion.button>
                </div>
                
                <div className="grid grid-cols-1 gap-3">
                  <Select
                    label="Product"
                    value={item.productId}
                    onChange={(e) => {
                      const selectedProduct = products.find(p => p.Id === parseInt(e.target.value, 10));
                      handleItemChange(index, 'productId', e.target.value);
                      if (selectedProduct) {
                        handleItemChange(index, 'productName', selectedProduct.name);
                        handleItemChange(index, 'unitPrice', selectedProduct.sellingPrice || 0);
                      }
                    }}
                    required
                  >
                    <option value="">Select Product</option>
                    {products.map(product => (
                      <option key={product.Id} value={product.Id}>
                        {product.name} - ₹{product.sellingPrice}
                      </option>
                    ))}
                  </Select>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      label="Quantity"
                      type="number"
                      min="1"
                      step="1"
                      value={item.quantity}
                      onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                      required
                    />
                    <Input
                      label="Unit Price"
                      type="number"
                      min="0"
                      step="0.01"
                      value={item.unitPrice}
                      onChange={(e) => handleItemChange(index, 'unitPrice', e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="text-right">
                    <span className="text-sm text-gray-600">Total: </span>
                    <span className="font-semibold">₹{(item.total || 0).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            ))}
            
            {orderData.items.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <ApperIcon name="Package" size={32} className="mx-auto mb-2 opacity-50" />
                <p>No items added yet</p>
              </div>
            )}
          </div>

          {/* Order Summary & Payment */}
          <div className="bg-white rounded-lg p-4 space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">Order Summary</h2>
            
            <div className="flex justify-between items-center py-2 border-t border-gray-200">
              <span className="text-lg font-semibold">Total Amount:</span>
              <span className="text-xl font-bold text-primary">₹{calculateTotalAmount().toLocaleString()}</span>
            </div>
            
            <Select
              label="Payment Status"
              name="paymentStatus"
              value={orderData.paymentStatus}
              onChange={handleInputChange}
              required
            >
              {paymentStatusOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes (Optional)
              </label>
              <textarea
                name="notes"
                value={orderData.notes}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Add any notes for this order..."
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate('/sales')}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={saving}
              className="flex-1"
            >
              {saving ? (
                <>
                  <ApperIcon name="Loader2" size={16} className="mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <ApperIcon name="Check" size={16} className="mr-2" />
                  Update Order
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditSalesOrder;
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import Button from '@/components/atoms/Button';
import Select from '@/components/atoms/Select';
import Input from '@/components/atoms/Input';
import ApperIcon from '@/components/ApperIcon';
import customerService from '@/services/api/customerService';
import productService from '@/services/api/productService';
import invoiceService from '@/services/api/invoiceService';

const CreateInvoice = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [formData, setFormData] = useState({
    customerId: '',
    customerName: '',
    paymentStatus: 'pending',
    notes: '',
    orderId: ''
  });
  const [invoiceItems, setInvoiceItems] = useState([
    { productId: '', productName: '', quantity: 1, unitPrice: 0, total: 0 }
  ]);
  const [taxRate, setTaxRate] = useState(18); // 18% GST

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [customersData, productsData] = await Promise.all([
        customerService.getAll(),
        productService.getAll()
      ]);
      setCustomers(customersData);
      setProducts(productsData);
    } catch (error) {
      toast.error('Failed to load data');
    }
  };

  const customerOptions = customers.map(customer => ({
    value: customer.Id,
    label: customer.name
  }));

  const productOptions = products.map(product => ({
    value: product.Id,
    label: `${product.name} - ₹${product.sellingPrice}`
  }));

  const paymentStatusOptions = [
    { value: 'pending', label: 'Pending' },
    { value: 'partial', label: 'Partial' },
    { value: 'paid', label: 'Paid' }
  ];

  const handleCustomerChange = (e) => {
    const customerId = parseInt(e.target.value);
    const customer = customers.find(c => c.Id === customerId);
    setFormData(prev => ({
      ...prev,
      customerId,
      customerName: customer ? customer.name : ''
    }));
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...invoiceItems];
    newItems[index][field] = value;

    if (field === 'productId') {
      const product = products.find(p => p.Id === parseInt(value));
      if (product) {
        newItems[index].productName = product.name;
        newItems[index].unitPrice = product.sellingPrice;
        newItems[index].total = newItems[index].quantity * product.sellingPrice;
      }
    } else if (field === 'quantity' || field === 'unitPrice') {
      newItems[index].total = newItems[index].quantity * newItems[index].unitPrice;
    }

    setInvoiceItems(newItems);
  };

  const addItem = () => {
    setInvoiceItems([...invoiceItems, { productId: '', productName: '', quantity: 1, unitPrice: 0, total: 0 }]);
  };

  const removeItem = (index) => {
    if (invoiceItems.length > 1) {
      setInvoiceItems(invoiceItems.filter((_, i) => i !== index));
    }
  };

  const calculateSubtotal = () => {
    return invoiceItems.reduce((sum, item) => sum + item.total, 0);
  };

  const calculateTax = () => {
    return (calculateSubtotal() * taxRate) / 100;
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax();
  };

  const validateForm = () => {
    if (!formData.customerId) {
      toast.error('Please select a customer');
      return false;
    }

    if (invoiceItems.length === 0 || !invoiceItems[0].productId) {
      toast.error('Please add at least one product');
      return false;
    }

    for (let i = 0; i < invoiceItems.length; i++) {
      const item = invoiceItems[i];
      if (!item.productId || item.quantity <= 0) {
        toast.error(`Please check item ${i + 1}`);
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    try {
      const invoiceData = {
        customerId: formData.customerId,
        customerName: formData.customerName,
        paymentStatus: formData.paymentStatus,
        orderId: formData.orderId || null,
        items: invoiceItems.filter(item => item.productId),
        subtotal: calculateSubtotal(),
        taxAmount: calculateTax(),
        totalAmount: calculateTotal(),
        notes: formData.notes
      };

      await invoiceService.create(invoiceData);
      toast.success('Invoice created successfully!');
      navigate('/sales');
    } catch (error) {
      toast.error(`Failed to create invoice: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-full bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/sales')}
            className="p-2"
          >
            <ApperIcon name="ArrowLeft" size={20} />
          </Button>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Create Invoice</h1>
            <p className="text-sm text-gray-600">Generate new invoice for billing</p>
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
          {/* Customer Information */}
          <div className="bg-white rounded-lg p-4 space-y-4">
            <h3 className="font-semibold text-gray-900">Customer Information</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <Select
                label="Select Customer"
                name="customerId"
                value={formData.customerId}
                onChange={handleCustomerChange}
                options={customerOptions}
                placeholder="Choose customer"
                required
              />

              <Select
                label="Payment Status"
                name="paymentStatus"
                value={formData.paymentStatus}
                onChange={(e) => setFormData(prev => ({ ...prev, paymentStatus: e.target.value }))}
                options={paymentStatusOptions}
                required
              />
            </div>

            <Input
              label="Related Order ID (Optional)"
              name="orderId"
              value={formData.orderId}
              onChange={(e) => setFormData(prev => ({ ...prev, orderId: e.target.value }))}
              placeholder="Enter order ID if applicable"
            />
          </div>

          {/* Invoice Items */}
          <div className="bg-white rounded-lg p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">Invoice Items</h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addItem}
                className="flex items-center gap-2"
              >
                <ApperIcon name="Plus" size={16} />
                Add Item
              </Button>
            </div>

            <div className="space-y-4">
              {invoiceItems.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="border border-gray-200 rounded-lg p-4"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-gray-700">Item {index + 1}</span>
                    {invoiceItems.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeItem(index)}
                        className="text-red-500 hover:text-red-700 p-1"
                      >
                        <ApperIcon name="Trash2" size={16} />
                      </Button>
                    )}
                  </div>

                  <div className="space-y-3">
                    <Select
                      label="Product"
                      value={item.productId}
                      onChange={(e) => handleItemChange(index, 'productId', e.target.value)}
                      options={productOptions}
                      placeholder="Select product"
                      required
                    />

                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Quantity
                        </label>
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value))}
                          min="1"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Unit Price (₹)
                        </label>
                        <input
                          type="number"
                          value={item.unitPrice}
                          onChange={(e) => handleItemChange(index, 'unitPrice', parseFloat(e.target.value))}
                          min="0"
                          step="0.01"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Total (₹)
                        </label>
                        <input
                          type="text"
                          value={item.total.toFixed(2)}
                          readOnly
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Tax Configuration */}
          <div className="bg-white rounded-lg p-4 space-y-4">
            <h3 className="font-semibold text-gray-900">Tax Configuration</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tax Rate (%)
                </label>
                <input
                  type="number"
                  value={taxRate}
                  onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
                  min="0"
                  max="100"
                  step="0.1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                />
              </div>
            </div>
          </div>

          {/* Invoice Summary */}
          <div className="bg-white rounded-lg p-4 space-y-3">
            <h3 className="font-semibold text-gray-900">Invoice Summary</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>₹{calculateSubtotal().toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax ({taxRate}%):</span>
                <span>₹{calculateTax().toLocaleString()}</span>
              </div>
              <div className="border-t pt-2">
                <div className="flex justify-between items-center text-lg font-semibold">
                  <span>Total Amount:</span>
                  <span className="text-primary">₹{calculateTotal().toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="bg-white rounded-lg p-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes (Optional)
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Add any additional notes or terms..."
              rows="3"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
            />
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              fullWidth
              onClick={() => navigate('/sales')}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              fullWidth
              loading={loading}
            >
              Create Invoice
            </Button>
          </div>
        </motion.form>
      </div>
    </div>
  );
};

export default CreateInvoice;
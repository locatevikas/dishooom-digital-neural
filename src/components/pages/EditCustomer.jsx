import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import Button from '@/components/atoms/Button';
import Input from '@/components/atoms/Input';
import Select from '@/components/atoms/Select';
import ApperIcon from '@/components/ApperIcon';
import customerService from '@/services/api/customerService';

const EditCustomer = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    type: '',
    pipelineStage: 'new',
    assignedTo: 'Sales Rep 1',
    address: '',
    gstNumber: ''
  });

  const customerTypes = [
    { value: 'Retailer', label: 'Retailer' },
    { value: 'Reseller', label: 'Reseller' }
  ];

  const pipelineStages = [
    { value: 'new', label: 'New Lead' },
    { value: 'contacted', label: 'Contacted' },
    { value: 'closed', label: 'Closed' }
  ];

  const salesReps = [
    { value: 'Sales Rep 1', label: 'Sales Rep 1' },
    { value: 'Sales Rep 2', label: 'Sales Rep 2' },
    { value: 'Sales Manager', label: 'Sales Manager' }
  ];

  useEffect(() => {
    loadCustomer();
  }, [id]);

  const loadCustomer = async () => {
    setInitialLoading(true);
    try {
      const customer = await customerService.getById(parseInt(id));
      if (!customer) {
        toast.error('Customer not found');
        navigate('/customers');
        return;
      }
      
      setFormData({
        name: customer.name || '',
        phone: customer.phone || '',
        email: customer.email || '',
        type: customer.type || '',
        pipelineStage: customer.pipelineStage || 'new',
        assignedTo: customer.assignedTo || 'Sales Rep 1',
        address: customer.address || '',
        gstNumber: customer.gstNumber || ''
      });
    } catch (error) {
      toast.error(`Failed to load customer: ${error.message}`);
      navigate('/customers');
    } finally {
      setInitialLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    if (!formData.name || !formData.phone || !formData.email || !formData.type) {
      toast.error('Please fill in all required fields');
      return false;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error('Please enter a valid email address');
      return false;
    }

    // Basic phone validation (Indian format)
    const phoneRegex = /^[+]?[0-9\s-()]{10,15}$/;
    if (!phoneRegex.test(formData.phone)) {
      toast.error('Please enter a valid phone number');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    try {
      await customerService.update(parseInt(id), formData);
      toast.success('Customer updated successfully!');
      navigate('/customers');
    } catch (error) {
      toast.error(`Failed to update customer: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="min-h-full bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading customer...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/customers')}
            className="p-2"
          >
            <ApperIcon name="ArrowLeft" size={20} />
          </Button>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Edit Customer</h1>
            <p className="text-sm text-gray-600">Update customer information</p>
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
          <div className="bg-white rounded-lg p-4 space-y-4">
            <h3 className="font-semibold text-gray-900">Basic Information</h3>
            
            <Input
              label="Customer Name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="e.g., Rajesh Trading Co."
              required
            />

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Phone Number"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="+91 98765 43210"
                required
              />

              <Select
                label="Customer Type"
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                options={customerTypes}
                placeholder="Select type"
                required
              />
            </div>

            <Input
              label="Email Address"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="customer@example.com"
              required
            />

            <Input
              label="Address"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              placeholder="Complete business address"
            />

            <Input
              label="GST Number"
              name="gstNumber"
              value={formData.gstNumber}
              onChange={handleInputChange}
              placeholder="22AAAAF1234A1Z5"
            />
          </div>

          {/* Sales Information */}
          <div className="bg-white rounded-lg p-4 space-y-4">
            <h3 className="font-semibold text-gray-900">Sales Information</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <Select
                label="Pipeline Stage"
                name="pipelineStage"
                value={formData.pipelineStage}
                onChange={handleInputChange}
                options={pipelineStages}
                required
              />

              <Select
                label="Assigned To"
                name="assignedTo"
                value={formData.assignedTo}
                onChange={handleInputChange}
                options={salesReps}
                required
              />
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              fullWidth
              onClick={() => navigate('/customers')}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              fullWidth
              loading={loading}
            >
              Update Customer
            </Button>
          </div>
        </motion.form>
      </div>
    </div>
  );
};

export default EditCustomer;
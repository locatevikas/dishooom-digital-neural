import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import ApperIcon from '@/components/ApperIcon';

const FloatingActionButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const actions = [
    {
      label: 'Add Product',
      icon: 'Package',
      path: '/inventory/add',
      color: 'bg-primary'
    },
    {
      label: 'Add Customer',
      icon: 'UserPlus',
      path: '/customers/add',
      color: 'bg-secondary'
    },
    {
      label: 'Create Sale',
      icon: 'ShoppingCart',
      path: '/sales/create',
      color: 'bg-accent'
    }
  ];

  const handleActionClick = (path) => {
    navigate(path);
    setIsOpen(false);
  };

  return (
    <div className="fixed bottom-24 right-4 z-30">
      <AnimatePresence>
        {isOpen && (
          <div className="absolute bottom-16 right-0 space-y-3">
            {actions.map((action, index) => (
              <motion.button
                key={action.path}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleActionClick(action.path)}
                className={`
                  w-14 h-14 ${action.color} text-white 
                  rounded-full shadow-lg hover:shadow-xl transition-all duration-200
                  flex items-center justify-center
                `}
                title={action.label}
              >
                <ApperIcon name={action.icon} size={24} />
              </motion.button>
            ))}
          </div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className={`
          w-14 h-14 bg-primary text-white rounded-full shadow-lg 
          flex items-center justify-center transition-all duration-200
          ${isOpen ? 'rotate-45' : ''}
        `}
      >
        <ApperIcon name="Plus" size={24} />
      </motion.button>
    </div>
  );
};

export default FloatingActionButton;

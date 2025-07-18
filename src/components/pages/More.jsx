import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import ApperIcon from '@/components/ApperIcon';
import Card from '@/components/atoms/Card';

const More = () => {
  const navigate = useNavigate();

  const menuItems = [
    {
      title: 'Expenses',
      description: 'Track business expenses',
      icon: 'Receipt',
      path: '/expenses',
      color: 'text-green-600 bg-green-100'
    },
    {
      title: 'Reports',
      description: 'View detailed reports',
      icon: 'BarChart',
      path: '/reports',
      color: 'text-blue-600 bg-blue-100'
    },
    {
      title: 'Settings',
      description: 'App settings and preferences',
      icon: 'Settings',
      path: '/settings',
      color: 'text-gray-600 bg-gray-100'
    },
    {
      title: 'User Management',
      description: 'Manage users and roles',
      icon: 'Users',
      path: '/users',
      color: 'text-purple-600 bg-purple-100'
    },
    {
      title: 'Backup & Sync',
      description: 'Data backup and synchronization',
      icon: 'Cloud',
      path: '/backup',
      color: 'text-indigo-600 bg-indigo-100'
    },
    {
      title: 'Help & Support',
      description: 'Get help and contact support',
      icon: 'HelpCircle',
      path: '/help',
      color: 'text-orange-600 bg-orange-100'
    }
  ];

const handleItemClick = (item) => {
    if (item.path === '/expenses' || item.path === '/reports' || item.path === '/settings') {
      navigate(item.path);
    } else {
      // For other items, show coming soon message
      alert(`${item.title} feature coming soon!`);
    }
  };

  return (
    <div className="min-h-full bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">More</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">Additional features and settings</p>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Business Info Card */}
        <Card className="p-4 mb-6 dark:bg-gray-800 dark:border-gray-700">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-2xl font-bold text-white">D</span>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Dishooom</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Chemical Product Manufacturing</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Version 1.0.0</p>
            </div>
          </div>
        </Card>

        {/* Menu Items */}
        <div className="space-y-3">
          {menuItems.map((item, index) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Card
                hover
                onClick={() => handleItemClick(item)}
                className="p-4 dark:bg-gray-800 dark:border-gray-700"
              >
                <div className="flex items-center gap-4">
                  <div className={
                    `w-12 h-12 rounded-lg flex items-center justify-center ${item.color} dark:bg-opacity-20 ` +
                    (item.title === 'Expenses' ? 'dark:text-green-300' :
                    item.title === 'Reports' ? 'dark:text-blue-300' :
                    item.title === 'Settings' ? 'dark:text-gray-300' :
                    item.title === 'User Management' ? 'dark:text-purple-300' :
                    item.title === 'Backup & Sync' ? 'dark:text-indigo-300' :
                    item.title === 'Help & Support' ? 'dark:text-orange-300' :
                    '')
                  }>
                    <ApperIcon name={item.icon} size={24} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 dark:text-white">{item.title}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 truncate">{item.description}</p>
                  </div>
                  <ApperIcon name="ChevronRight" size={20} className="text-gray-400 dark:text-gray-500" />
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-xs text-gray-500 dark:text-gray-400">
          <p>© 2024 Dishooom CRM. All rights reserved.</p>
          <p className="mt-1">Made with ❤️ for chemical product manufacturers</p>
        </div>
      </div>
    </div>
  );
};

export default More;
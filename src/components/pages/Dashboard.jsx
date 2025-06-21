import { motion } from 'framer-motion';
import DashboardMetrics from '@/components/organisms/DashboardMetrics';
import RecentActivity from '@/components/organisms/RecentActivity';
import FloatingActionButton from '@/components/molecules/FloatingActionButton';

const Dashboard = () => {
  return (
    <div className="min-h-full bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-sm text-gray-600">Welcome back to Dishooom CRM</p>
          </div>
          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
            <span className="text-primary font-bold">D</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <DashboardMetrics />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <RecentActivity />
        </motion.div>
      </div>

      <FloatingActionButton />
    </div>
  );
};

export default Dashboard;
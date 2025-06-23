import { motion } from 'framer-motion';
import DashboardMetrics from '@/components/organisms/DashboardMetrics';
import RecentActivity from '@/components/organisms/RecentActivity';
import FloatingActionButton from '@/components/molecules/FloatingActionButton';

const Dashboard = () => {
  return (
    <div className="min-h-full bg-gray-50 dark:bg-gray-900">
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
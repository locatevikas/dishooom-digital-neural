import { motion } from "framer-motion";
import { format } from "date-fns";
import React from "react";
import ApperIcon from "@/components/ApperIcon";
import Card from "@/components/atoms/Card";
import Badge from "@/components/atoms/Badge";

const CustomerCard = ({ customer, onEdit, onDelete, onCall, onEmail, onUpdateStage }) => {
  const stageColors = {
    new: 'info',
    contacted: 'warning', 
    closed: 'success'
  };

  const stageLabels = {
    new: 'New Lead',
    contacted: 'Contacted',
    closed: 'Closed'
  };
  
  const formatDate = (dateString) => {
    if (!dateString) return 'No date';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'Invalid date';
      }
      return format(date, 'MMM dd');
    } catch (error) {
      console.warn('Date formatting error:', error);
      return 'Invalid date';
    }
  };

  // Safe property access with fallbacks
  const pipelineStage = customer?.pipelineStage || 'new';
  const stageColor = stageColors[pipelineStage] || 'info';
  const stageLabel = stageLabels[pipelineStage] || 'Unknown';

  return (
    <Card className="p-4 hover:shadow-md transition-shadow">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
              <ApperIcon name="User" size={20} className="text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{customer?.name || 'Unknown Customer'}</h3>
              <p className="text-sm text-gray-600">{customer?.type || 'Unknown Type'}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={stageColor}>
              {stageLabel}
            </Badge>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => onEdit?.(customer)}
              className="p-1.5 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <ApperIcon name="Edit2" size={16} />
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => onDelete?.(customer)}
              className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
            >
              <ApperIcon name="Trash2" size={16} />
            </motion.button>
          </div>
        </div>

        {/* Contact Info */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <ApperIcon name="Phone" size={14} className="text-gray-400" />
            <span className="text-gray-900">{customer?.phone || 'No phone'}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <ApperIcon name="Mail" size={14} className="text-gray-400" />
            <span className="text-gray-600 truncate">{customer?.email || 'No email'}</span>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex gap-2">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => onCall?.(customer)}
            className="flex-1 flex items-center justify-center gap-1 py-2 px-3 bg-primary/10 text-primary rounded-lg text-sm font-medium hover:bg-primary/20 transition-colors"
          >
            <ApperIcon name="Phone" size={14} />
            Call
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => onEmail?.(customer)}
            className="flex-1 flex items-center justify-center gap-1 py-2 px-3 bg-secondary/10 text-secondary rounded-lg text-sm font-medium hover:bg-secondary/20 transition-colors"
          >
            <ApperIcon name="Mail" size={14} />
            Email
          </motion.button>
        </div>

        {/* Pipeline Actions */}
        {customer?.pipelineStage !== 'closed' && (
          <div className="flex gap-2">
            {customer?.pipelineStage === 'new' && (
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => onUpdateStage?.(customer, 'contacted')}
                className="flex-1 py-2 px-3 bg-yellow-50 text-yellow-600 rounded-lg text-sm font-medium hover:bg-yellow-100 transition-colors"
              >
                Mark Contacted
              </motion.button>
            )}
            {customer?.pipelineStage === 'contacted' && (
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => onUpdateStage?.(customer, 'closed')}
                className="flex-1 py-2 px-3 bg-green-50 text-green-600 rounded-lg text-sm font-medium hover:bg-green-100 transition-colors"
              >
                Mark Closed
              </motion.button>
            )}
          </div>
        )}

        {/* Additional Info */}
        <div className="flex items-center justify-between text-sm text-gray-600 pt-2 border-t border-gray-100">
          <span>Assigned to: {customer?.assignedTo || 'Unassigned'}</span>
          <span>Last Contact: {formatDate(customer?.lastContact)}</span>
        </div>
      </div>
    </Card>
  );
};

export default CustomerCard;
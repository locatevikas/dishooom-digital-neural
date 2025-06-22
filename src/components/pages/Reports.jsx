import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import DatePicker from 'react-datepicker';
import ApperIcon from '@/components/ApperIcon';
import Card from '@/components/atoms/Card';
import Button from '@/components/atoms/Button';
import Select from '@/components/atoms/Select';
import Input from '@/components/atoms/Input';
import MetricCard from '@/components/molecules/MetricCard';
import reportService from '@/services/api/reportService';
import { toast } from 'react-toastify';
import Chart from 'react-apexcharts';
import { format, startOfMonth, endOfMonth, subMonths, startOfYear } from 'date-fns';
import 'react-datepicker/dist/react-datepicker.css';

const Reports = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedReport, setSelectedReport] = useState(null);
  const [dateRange, setDateRange] = useState('thisMonth');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [reportData, setReportData] = useState(null);
  const [exportLoading, setExportLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const reportTypes = [
    {
      id: 'sales',
      title: 'Sales Report',
      description: 'Track revenue, orders, and sales performance over time',
      icon: 'TrendingUp',
      color: 'bg-gradient-to-br from-blue-500 to-blue-600',
      metrics: ['Revenue', 'Orders', 'Growth Rate', 'Top Products']
    },
    {
      id: 'expenses',
      title: 'Expense Report',
      description: 'Monitor spending patterns and expense categories',
      icon: 'Receipt',
      color: 'bg-gradient-to-br from-red-500 to-red-600',
      metrics: ['Total Expenses', 'Categories', 'Trends', 'Cost Control']
    },
    {
      id: 'inventory',
      title: 'Inventory Report',
      description: 'Analyze stock levels, product performance, and inventory value',
      icon: 'Package',
      color: 'bg-gradient-to-br from-green-500 to-green-600',
      metrics: ['Stock Levels', 'Inventory Value', 'Low Stock', 'Categories']
    },
    {
      id: 'overview',
      title: 'Business Overview',
      description: 'Comprehensive business performance and financial summary',
      icon: 'BarChart3',
      color: 'bg-gradient-to-br from-purple-500 to-purple-600',
      metrics: ['Revenue', 'Expenses', 'Profit', 'Margin']
    },
    {
      id: 'customer',
      title: 'Customer Analytics',
      description: 'Customer behavior, retention, and value analysis',
      icon: 'Users',
      color: 'bg-gradient-to-br from-indigo-500 to-indigo-600',
      metrics: ['Customer Count', 'Retention', 'Lifetime Value', 'Segments']
    },
    {
      id: 'product',
      title: 'Product Performance',
      description: 'Product sales analysis, performance metrics, and trends',
      icon: 'Zap',
      color: 'bg-gradient-to-br from-yellow-500 to-yellow-600',
      metrics: ['Top Products', 'Performance', 'Categories', 'Trends']
    }
  ];

  const dateRanges = [
    { value: 'today', label: 'Today', icon: 'Calendar' },
    { value: 'yesterday', label: 'Yesterday', icon: 'Calendar' },
    { value: 'thisWeek', label: 'This Week', icon: 'Calendar' },
    { value: 'lastWeek', label: 'Last Week', icon: 'Calendar' },
    { value: 'thisMonth', label: 'This Month', icon: 'Calendar' },
    { value: 'lastMonth', label: 'Last Month', icon: 'Calendar' },
    { value: 'last3Months', label: 'Last 3 Months', icon: 'Calendar' },
    { value: 'last6Months', label: 'Last 6 Months', icon: 'Calendar' },
    { value: 'thisYear', label: 'This Year', icon: 'Calendar' },
    { value: 'lastYear', label: 'Last Year', icon: 'Calendar' },
    { value: 'custom', label: 'Custom Range', icon: 'CalendarRange' }
  ];

  const exportFormats = [
    { value: 'pdf', label: 'PDF Report', icon: 'FileText', description: 'Formatted report with charts' },
    { value: 'csv', label: 'CSV Data', icon: 'Download', description: 'Raw data export' }
  ];

  const getDateRangeValues = () => {
    const now = new Date();
    const startOfCurrentMonth = startOfMonth(now);
    const endOfCurrentMonth = endOfMonth(now);

    switch (dateRange) {
      case 'today':
        return { startDate: now, endDate: now };
      case 'yesterday':
        const yesterday = new Date(now);
        yesterday.setDate(yesterday.getDate() - 1);
        return { startDate: yesterday, endDate: yesterday };
      case 'thisWeek':
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay());
        return { startDate: startOfWeek, endDate: now };
      case 'lastWeek':
        const lastWeekStart = new Date(now);
        lastWeekStart.setDate(now.getDate() - now.getDay() - 7);
        const lastWeekEnd = new Date(lastWeekStart);
        lastWeekEnd.setDate(lastWeekStart.getDate() + 6);
        return { startDate: lastWeekStart, endDate: lastWeekEnd };
      case 'thisMonth':
        return { startDate: startOfCurrentMonth, endDate: endOfCurrentMonth };
      case 'lastMonth':
        const lastMonth = subMonths(now, 1);
        return { startDate: startOfMonth(lastMonth), endDate: endOfMonth(lastMonth) };
      case 'last3Months':
        return { startDate: startOfMonth(subMonths(now, 2)), endDate: endOfCurrentMonth };
      case 'last6Months':
        return { startDate: startOfMonth(subMonths(now, 5)), endDate: endOfCurrentMonth };
      case 'thisYear':
        return { startDate: startOfYear(now), endDate: now };
      case 'lastYear':
        const lastYear = new Date(now.getFullYear() - 1, 0, 1);
        const lastYearEnd = new Date(now.getFullYear() - 1, 11, 31);
        return { startDate: lastYear, endDate: lastYearEnd };
      case 'custom':
        return {
          startDate: customStartDate ? new Date(customStartDate) : startOfCurrentMonth,
          endDate: customEndDate ? new Date(customEndDate) : endOfCurrentMonth
        };
      default:
        return { startDate: startOfCurrentMonth, endDate: endOfCurrentMonth };
    }
  };

  const loadReportData = async (reportType) => {
    if (!reportType) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const { startDate, endDate } = getDateRangeValues();
      let data;

      switch (reportType) {
        case 'sales':
          data = await reportService.getSalesReport(startDate, endDate);
          break;
        case 'expenses':
          data = await reportService.getExpenseReport(startDate, endDate);
          break;
        case 'inventory':
          data = await reportService.getInventoryReport();
          break;
        case 'overview':
          data = await reportService.getBusinessOverview(startDate, endDate);
          break;
        case 'customer':
        case 'product':
          // For now, use sales data as placeholder
          data = await reportService.getSalesReport(startDate, endDate);
          break;
        default:
          data = await reportService.getSalesReport(startDate, endDate);
      }

      setReportData(data);
      toast.success('Report generated successfully');
    } catch (err) {
      setError(err.message);
      toast.error('Failed to load report data');
    } finally {
      setLoading(false);
    }
  };

  const handleReportSelect = (reportType) => {
    setSelectedReport(reportType);
    setReportData(null);
    loadReportData(reportType);
  };

  const handleExport = async (format) => {
    if (!selectedReport) {
      toast.error('Please select a report first');
      return;
    }

    setExportLoading(true);
    try {
      const { startDate, endDate } = getDateRangeValues();
      const result = await reportService.exportReport(selectedReport, format, startDate, endDate);
      toast.success(`Report exported as ${format.toUpperCase()} successfully`);
    } catch (err) {
      toast.error(`Failed to export ${format.toUpperCase()} report`);
    } finally {
      setExportLoading(false);
    }
  };

  const getChartOptions = () => {
    if (!reportData?.chartData) return {};

    return {
      chart: {
        type: 'area',
        height: 400,
        toolbar: { show: true },
        zoom: { enabled: true }
      },
      dataLabels: { enabled: false },
      stroke: { curve: 'smooth', width: 3 },
      xaxis: { categories: reportData.chartData.categories || [] },
      colors: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444'],
      fill: {
        type: 'gradient',
        gradient: {
          shadeIntensity: 1,
          opacityFrom: 0.8,
          opacityTo: 0.1,
          stops: [0, 90, 100]
        }
      },
      grid: {
        borderColor: '#f1f5f9',
        strokeDashArray: 4
      },
      tooltip: {
        theme: 'light',
        y: { formatter: (val) => typeof val === 'number' ? `$${val.toLocaleString()}` : val }
      }
    };
  };

  useEffect(() => {
    if (selectedReport) {
      loadReportData(selectedReport);
    }
  }, [dateRange, customStartDate, customEndDate]);

  return (
    <motion.div
      className="min-h-screen bg-gradient-to-br from-gray-50 to-white p-4 sm:p-6 lg:p-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Business Intelligence
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Generate comprehensive reports and gain valuable insights into your business performance
          </p>
        </motion.div>

        {/* Report Type Selection */}
        {!selectedReport && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="text-center mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">Choose Report Type</h2>
              <p className="text-gray-600">Select the type of report you want to generate</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {reportTypes.map((report, index) => (
                <motion.div
                  key={report.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                  whileHover={{ scale: 1.02, y: -5 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Card
                    className="h-full cursor-pointer border-2 border-transparent hover:border-blue-200 hover:shadow-xl transition-all duration-300"
                    onClick={() => handleReportSelect(report.id)}
                  >
                    <div className="p-6">
                      <div className={`w-16 h-16 ${report.color} rounded-2xl flex items-center justify-center mb-4 shadow-lg`}>
                        <ApperIcon name={report.icon} size={32} className="text-white" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">{report.title}</h3>
                      <p className="text-gray-600 mb-4 leading-relaxed">{report.description}</p>
                      <div className="flex flex-wrap gap-2">
                        {report.metrics.map((metric, idx) => (
                          <span
                            key={idx}
                            className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full font-medium"
                          >
                            {metric}
                          </span>
                        ))}
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Report Interface */}
        {selectedReport && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
{/* Report Header */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6 bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center gap-4 mb-4 lg:mb-0">
                <Button
                  variant="ghost"
                  onClick={() => {
                    setSelectedReport(null);
                    setReportData(null);
                  }}
                  className="p-2"
                >
                  <ApperIcon name="ArrowLeft" size={20} />
                </Button>
                <div className={`w-12 h-12 ${reportTypes.find(r => r.id === selectedReport)?.color} rounded-xl flex items-center justify-center`}>
                  <ApperIcon name={reportTypes.find(r => r.id === selectedReport)?.icon} size={24} className="text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {reportTypes.find(r => r.id === selectedReport)?.title}
                  </h2>
                  <p className="text-gray-600">
                    {reportTypes.find(r => r.id === selectedReport)?.description}
                  </p>
                </div>
              </div>
              
              <div className="flex flex-wrap items-center gap-4">
                {/* Date Selection */}
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <ApperIcon name="Calendar" size={16} className="text-gray-600" />
                    <span className="text-sm font-medium text-gray-700">Date:</span>
                  </div>
                  <Select
                    value={dateRange}
                    onChange={(e) => setDateRange(e.target.value)}
                    className="min-w-[140px]"
                  >
                    {dateRanges.map((range) => (
                      <option key={range.value} value={range.value}>
                        {range.label}
                      </option>
                    ))}
                  </Select>
                </div>

{/* Custom Date Inputs */}
                {dateRange === 'custom' && (
                  <div className="flex items-center gap-2">
                    <div className="flex flex-col">
                      <label className="text-xs text-gray-600 mb-1">Start Date</label>
                      <DatePicker
                        selected={customStartDate ? new Date(customStartDate) : null}
                        onChange={(date) => setCustomStartDate(date ? date.toISOString().split('T')[0] : '')}
                        dateFormat="MMM dd, yyyy"
                        placeholderText="Select start date"
                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        maxDate={new Date()}
                      />
                    </div>
                    <span className="text-gray-400 self-end pb-2">to</span>
                    <div className="flex flex-col">
                      <label className="text-xs text-gray-600 mb-1">End Date</label>
                      <DatePicker
                        selected={customEndDate ? new Date(customEndDate) : null}
                        onChange={(date) => setCustomEndDate(date ? date.toISOString().split('T')[0] : '')}
                        dateFormat="MMM dd, yyyy"
                        placeholderText="Select end date"
                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        minDate={customStartDate ? new Date(customStartDate) : null}
                        maxDate={new Date()}
                      />
                    </div>
                  </div>
                )}

                {/* Export Dropdown */}
                <div className="relative">
                  <Button
                    variant="outline"
                    onClick={() => setShowFilters(!showFilters)}
                    disabled={!reportData}
                    className="flex items-center gap-2"
                  >
                    <ApperIcon name="Download" size={16} />
                    Export
                    <ApperIcon name="ChevronDown" size={14} />
                  </Button>
                  
                  {showFilters && (
                    <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                      <div className="p-2">
                        {exportFormats.map((format) => (
                          <Button
                            key={format.value}
                            variant="ghost"
                            onClick={() => {
                              handleExport(format.value);
                              setShowFilters(false);
                            }}
                            disabled={!reportData || exportLoading}
                            className="w-full justify-start p-3 h-auto"
                          >
                            <div className="flex items-center gap-3">
                              <ApperIcon name={format.icon} size={18} />
                              <div className="text-left">
                                <div className="font-medium text-sm">{format.label}</div>
                                <div className="text-xs text-gray-500">{format.description}</div>
                              </div>
                            </div>
                            {exportLoading && <div className="ml-auto w-4 h-4 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin" />}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Refresh Button */}
                <Button
                  onClick={() => loadReportData(selectedReport)}
                  disabled={loading}
                  className="flex items-center gap-2"
                >
                  <ApperIcon name="RefreshCw" size={16} />
                  Refresh
                </Button>
              </div>
            </div>

            {/* Loading State */}
            {loading && (
              <Card className="mb-6">
                <div className="p-12 text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                    <div className="w-8 h-8 border-3 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Generating Report</h3>
                  <p className="text-gray-600">Please wait while we analyze your data...</p>
                </div>
              </Card>
            )}

            {/* Error State */}
            {error && (
              <Card className="mb-6 border-red-200 bg-red-50">
                <div className="p-6 text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
                    <ApperIcon name="AlertCircle" size={32} className="text-red-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-red-900 mb-2">Report Generation Failed</h3>
                  <p className="text-red-700 mb-4">{error}</p>
                  <Button
                    variant="outline"
                    onClick={() => loadReportData(selectedReport)}
                    className="border-red-300 text-red-700 hover:bg-red-100"
                  >
                    <ApperIcon name="RefreshCw" size={16} />
                    Try Again
                  </Button>
                </div>
              </Card>
            )}

            {/* Report Data */}
            {!loading && !error && reportData && (
              <motion.div
                className="space-y-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                {/* Key Metrics */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {reportData.metrics?.map((metric, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 * index }}
                    >
                      <MetricCard
                        title={metric.title}
                        value={metric.value}
                        icon={metric.icon}
                        trend={metric.trend}
                        trendValue={metric.trendValue}
                        color={metric.color}
                      />
                    </motion.div>
                  ))}
                </div>

                {/* Chart */}
                {reportData.chartData && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <Card className="border border-gray-200">
                      <div className="p-6">
                        <div className="flex items-center gap-2 mb-6">
                          <ApperIcon name="BarChart3" size={24} className="text-gray-700" />
                          <h3 className="text-xl font-semibold text-gray-900">{reportData.chartTitle}</h3>
                        </div>
                        <div className="bg-gray-50 rounded-xl p-4">
                          <Chart
                            options={getChartOptions()}
                            series={reportData.chartData.series || []}
                            type="area"
                            height={400}
                          />
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                )}

                {/* Details Table */}
                {reportData.tableData && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    <Card className="border border-gray-200">
                      <div className="p-6">
                        <div className="flex items-center gap-2 mb-6">
                          <ApperIcon name="Table" size={24} className="text-gray-700" />
                          <h3 className="text-xl font-semibold text-gray-900">{reportData.tableTitle}</h3>
                        </div>
                        <div className="overflow-x-auto bg-gray-50 rounded-xl">
                          <table className="min-w-full">
                            <thead>
                              <tr className="border-b border-gray-200">
                                {reportData.tableData.headers?.map((header, index) => (
                                  <th
                                    key={index}
                                    className="px-6 py-4 text-left text-sm font-semibold text-gray-900 bg-gray-100 first:rounded-tl-xl last:rounded-tr-xl"
                                  >
                                    {header}
                                  </th>
                                ))}
                              </tr>
                            </thead>
                            <tbody className="bg-white">
                              {reportData.tableData.rows?.map((row, rowIndex) => (
                                <tr
                                  key={rowIndex}
                                  className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                                >
                                  {row.map((cell, cellIndex) => (
                                    <td
                                      key={cellIndex}
                                      className="px-6 py-4 text-sm text-gray-900"
                                    >
                                      {cell}
                                    </td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                )}

                {/* Summary */}
                {reportData.summary && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                  >
                    <Card className="border border-gray-200">
                      <div className="p-6">
                        <div className="flex items-center gap-2 mb-6">
                          <ApperIcon name="FileText" size={24} className="text-gray-700" />
<h3 className="text-xl font-semibold text-gray-900">Executive Summary</h3>
                        </div>
                        <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-xl p-6 border border-blue-100">
                          <div className="prose max-w-none">
                            {reportData.summary.split('\n').map((line, index) => (
                              line.trim() ? (
                                <p key={index} className="text-gray-800 mb-4 leading-relaxed font-medium text-sm">
                                  {line.trim()}
                                </p>
                              ) : null
                            ))}
                          </div>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                )}
              </motion.div>
            )}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default Reports;
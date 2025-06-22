import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import ApperIcon from '@/components/ApperIcon';
import Card from '@/components/atoms/Card';
import Button from '@/components/atoms/Button';
import Select from '@/components/atoms/Select';
import Input from '@/components/atoms/Input';
import MetricCard from '@/components/molecules/MetricCard';
import reportService from '@/services/api/reportService';
import { toast } from 'react-toastify';
import Chart from 'react-apexcharts';
import { format, startOfMonth, endOfMonth, subMonths } from 'date-fns';

const Reports = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [reportType, setReportType] = useState('sales');
  const [dateRange, setDateRange] = useState('thisMonth');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [reportData, setReportData] = useState(null);

  const reportTypes = [
    { value: 'sales', label: 'Sales Report' },
    { value: 'expenses', label: 'Expense Report' },
    { value: 'inventory', label: 'Inventory Report' },
    { value: 'overview', label: 'Business Overview' }
  ];

  const dateRanges = [
    { value: 'thisMonth', label: 'This Month' },
    { value: 'lastMonth', label: 'Last Month' },
    { value: 'last3Months', label: 'Last 3 Months' },
    { value: 'thisYear', label: 'This Year' },
    { value: 'custom', label: 'Custom Range' }
  ];

  const getDateRangeValues = () => {
    const now = new Date();
    const startOfCurrentMonth = startOfMonth(now);
    const endOfCurrentMonth = endOfMonth(now);

    switch (dateRange) {
      case 'thisMonth':
        return {
          startDate: startOfCurrentMonth,
          endDate: endOfCurrentMonth
        };
      case 'lastMonth':
        const lastMonth = subMonths(now, 1);
        return {
          startDate: startOfMonth(lastMonth),
          endDate: endOfMonth(lastMonth)
        };
      case 'last3Months':
        return {
          startDate: startOfMonth(subMonths(now, 2)),
          endDate: endOfCurrentMonth
        };
      case 'thisYear':
        return {
          startDate: new Date(now.getFullYear(), 0, 1),
          endDate: now
        };
      case 'custom':
        return {
          startDate: customStartDate ? new Date(customStartDate) : startOfCurrentMonth,
          endDate: customEndDate ? new Date(customEndDate) : endOfCurrentMonth
        };
      default:
        return {
          startDate: startOfCurrentMonth,
          endDate: endOfCurrentMonth
        };
    }
  };

  const loadReportData = async () => {
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
        default:
          data = await reportService.getSalesReport(startDate, endDate);
      }

      setReportData(data);
    } catch (err) {
      setError(err.message);
      toast.error('Failed to load report data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReportData();
  }, [reportType, dateRange, customStartDate, customEndDate]);

  const handleExport = async (format) => {
    try {
      const { startDate, endDate } = getDateRangeValues();
      await reportService.exportReport(reportType, format, startDate, endDate);
      toast.success(`Report exported as ${format.toUpperCase()}`);
    } catch (err) {
      toast.error('Failed to export report');
    }
  };

  const getChartOptions = () => {
    if (!reportData?.chartData) return {};

    return {
      chart: {
        type: 'area',
        height: 350,
        toolbar: {
          show: true
        }
      },
      dataLabels: {
        enabled: false
      },
      stroke: {
        curve: 'smooth',
        width: 2
      },
      xaxis: {
        categories: reportData.chartData.categories || []
      },
      colors: ['#3B82F6', '#10B981', '#F59E0B'],
      fill: {
        type: 'gradient',
        gradient: {
          shadeIntensity: 1,
          opacityFrom: 0.7,
          opacityTo: 0.3
        }
      }
    };
  };

  const getChartSeries = () => {
    if (!reportData?.chartData) return [];
    return reportData.chartData.series || [];
  };

  return (
    <motion.div
      className="p-4 max-w-7xl mx-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Reports</h1>
          <p className="text-gray-600">View detailed reports and analytics</p>
        </div>
        <div className="flex gap-2 mt-4 sm:mt-0">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleExport('pdf')}
            disabled={loading || !reportData}
          >
            <ApperIcon name="FileText" size={16} />
            Export PDF
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleExport('csv')}
            disabled={loading || !reportData}
          >
            <ApperIcon name="Download" size={16} />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <div className="p-4">
          <h3 className="text-lg font-semibold mb-4">Report Filters</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Report Type
              </label>
              <Select
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
              >
                {reportTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date Range
              </label>
              <Select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
              >
                {dateRanges.map((range) => (
                  <option key={range.value} value={range.value}>
                    {range.label}
                  </option>
                ))}
              </Select>
            </div>
            {dateRange === 'custom' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Date
                  </label>
                  <Input
                    type="date"
                    value={customStartDate}
                    onChange={(e) => setCustomStartDate(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    End Date
                  </label>
                  <Input
                    type="date"
                    value={customEndDate}
                    onChange={(e) => setCustomEndDate(e.target.value)}
                  />
                </div>
              </>
            )}
          </div>
        </div>
      </Card>

      {/* Loading State */}
      {loading && (
        <Card className="mb-6">
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading report data...</p>
          </div>
        </Card>
      )}

      {/* Error State */}
      {error && (
        <Card className="mb-6">
          <div className="p-4 text-center">
            <ApperIcon name="AlertCircle" size={48} className="text-red-500 mx-auto mb-4" />
            <p className="text-red-600">{error}</p>
            <Button
              variant="outline"
              onClick={loadReportData}
              className="mt-2"
            >
              Try Again
            </Button>
          </div>
        </Card>
      )}

      {/* Report Data */}
      {!loading && !error && reportData && (
        <div className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {reportData.metrics?.map((metric, index) => (
              <MetricCard
                key={index}
                title={metric.title}
                value={metric.value}
                icon={metric.icon}
                trend={metric.trend}
                trendValue={metric.trendValue}
                color={metric.color}
              />
            ))}
          </div>

          {/* Chart */}
          {reportData.chartData && (
            <Card>
              <div className="p-4">
                <h3 className="text-lg font-semibold mb-4">{reportData.chartTitle}</h3>
                <Chart
                  options={getChartOptions()}
                  series={getChartSeries()}
                  type="area"
                  height={350}
                />
              </div>
            </Card>
          )}

          {/* Details Table */}
          {reportData.tableData && (
            <Card>
              <div className="p-4">
                <h3 className="text-lg font-semibold mb-4">{reportData.tableTitle}</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        {reportData.tableData.headers?.map((header, index) => (
                          <th
                            key={index}
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            {header}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {reportData.tableData.rows?.map((row, rowIndex) => (
                        <tr key={rowIndex} className="hover:bg-gray-50">
                          {row.map((cell, cellIndex) => (
                            <td
                              key={cellIndex}
                              className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
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
          )}

          {/* Summary */}
          {reportData.summary && (
            <Card>
              <div className="p-4">
                <h3 className="text-lg font-semibold mb-4">Summary</h3>
                <div className="prose max-w-none">
                  {reportData.summary.split('\n').map((line, index) => (
                    <p key={index} className="text-gray-700 mb-2">
                      {line}
                    </p>
                  ))}
                </div>
              </div>
            </Card>
          )}
        </div>
      )}
    </motion.div>
  );
};

export default Reports;
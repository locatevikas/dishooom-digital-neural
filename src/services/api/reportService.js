import salesOrderService from './salesOrderService';
import expenseService from './expenseService';
import productService from './productService';
import customerService from './customerService';
import { format, isWithinInterval, parseISO } from 'date-fns';

const reportService = {
  async getSalesReport(startDate, endDate) {
    return new Promise(async (resolve) => {
      setTimeout(async () => {
        try {
          const salesOrders = await salesOrderService.getAll();
          const customers = await customerService.getAll();
          const products = await productService.getAll();
// Filter sales within date range
          const filteredSales = salesOrders.filter(order => {
            try {
              // Handle both 'date' and 'orderDate' fields from mock data
              const dateString = order.date || order.orderDate;
              if (!dateString) return false;
              const orderDate = parseISO(dateString);
              return isWithinInterval(orderDate, { start: startDate, end: endDate });
            } catch (error) {
              console.warn('Invalid date format in sales order:', order);
              return false;
            }
          });
          // Calculate metrics
          const totalRevenue = filteredSales.reduce((sum, order) => sum + order.total, 0);
          const totalOrders = filteredSales.length;
          const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
          
          // Calculate trend (compare with previous period)
          const daysDiff = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
          const previousStartDate = new Date(startDate);
          previousStartDate.setDate(previousStartDate.getDate() - daysDiff);
const previousEndDate = new Date(startDate);
          
          const previousSales = salesOrders.filter(order => {
            try {
              // Handle both 'date' and 'orderDate' fields from mock data
              const dateString = order.date || order.orderDate;
              if (!dateString) return false;
              const orderDate = parseISO(dateString);
              return isWithinInterval(orderDate, { start: previousStartDate, end: previousEndDate });
            } catch (error) {
              console.warn('Invalid date format in sales order:', order);
              return false;
            }
          });
          const previousRevenue = previousSales.reduce((sum, order) => sum + order.total, 0);
          const revenueTrend = previousRevenue > 0 ? 
            ((totalRevenue - previousRevenue) / previousRevenue) * 100 : 0;

// Group sales by date for chart
          const salesByDate = {};
          filteredSales.forEach(order => {
            try {
              const dateString = order.date || order.orderDate;
              if (dateString) {
                const dateKey = format(parseISO(dateString), 'MMM dd');
                salesByDate[dateKey] = (salesByDate[dateKey] || 0) + (order.total || order.totalAmount || 0);
              }
            } catch (error) {
              console.warn('Error formatting date for chart:', order);
            }
          });
          // Top products
          const productSales = {};
          filteredSales.forEach(order => {
            order.items.forEach(item => {
              const product = products.find(p => p.Id === item.productId);
              if (product) {
                productSales[product.name] = (productSales[product.name] || 0) + item.quantity;
              }
            });
          });

          const topProducts = Object.entries(productSales)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 10)
            .map(([name, quantity]) => [name, quantity, `${quantity} units`]);

          resolve({
            metrics: [
              {
                title: 'Total Revenue',
                value: `$${totalRevenue.toLocaleString()}`,
                icon: 'DollarSign',
                trend: revenueTrend >= 0 ? 'up' : 'down',
                trendValue: `${Math.abs(revenueTrend).toFixed(1)}%`,
                color: 'success'
              },
              {
                title: 'Total Orders',
                value: totalOrders.toString(),
                icon: 'ShoppingCart',
                trend: 'neutral',
                trendValue: '',
                color: 'primary'
              },
              {
                title: 'Avg Order Value',
                value: `$${averageOrderValue.toFixed(2)}`,
                icon: 'TrendingUp',
                trend: 'neutral',
                trendValue: '',
                color: 'secondary'
              },
              {
                title: 'Active Customers',
                value: new Set(filteredSales.map(order => order.customerId)).size.toString(),
                icon: 'Users',
                trend: 'neutral',
                trendValue: '',
                color: 'accent'
              }
            ],
            chartTitle: 'Sales Trend',
            chartData: {
              categories: Object.keys(salesByDate),
              series: [
                {
                  name: 'Revenue',
                  data: Object.values(salesByDate)
                }
              ]
            },
            tableTitle: 'Top Products',
            tableData: {
              headers: ['Product', 'Quantity Sold', 'Units'],
              rows: topProducts
            },
            summary: `Generated ${totalOrders} sales orders with total revenue of $${totalRevenue.toLocaleString()} during the selected period.\nAverage order value was $${averageOrderValue.toFixed(2)}.\nTop performing product: ${topProducts[0]?.[0] || 'N/A'}.`
          });
        } catch (error) {
          resolve({
            metrics: [],
            chartData: null,
            tableData: null,
            summary: 'Error loading sales report data.'
          });
        }
      }, 300);
    });
  },

  async getExpenseReport(startDate, endDate) {
    return new Promise(async (resolve) => {
      setTimeout(async () => {
        try {
          const expenses = await expenseService.getAll();
// Filter expenses within date range
          const filteredExpenses = expenses.filter(expense => {
            try {
              if (!expense.date) return false;
              const expenseDate = parseISO(expense.date);
              return isWithinInterval(expenseDate, { start: startDate, end: endDate });
            } catch (error) {
              console.warn('Invalid date format in expense:', expense);
              return false;
            }
          });
          // Calculate metrics
          const totalExpenses = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);
          const totalCount = filteredExpenses.length;
          const averageExpense = totalCount > 0 ? totalExpenses / totalCount : 0;

          // Group by category
          const expensesByCategory = {};
          filteredExpenses.forEach(expense => {
            expensesByCategory[expense.category] = (expensesByCategory[expense.category] || 0) + expense.amount;
          });

// Group by date for chart
          const expensesByDate = {};
          filteredExpenses.forEach(expense => {
            try {
              if (expense.date) {
                const dateKey = format(parseISO(expense.date), 'MMM dd');
                expensesByDate[dateKey] = (expensesByDate[dateKey] || 0) + expense.amount;
              }
            } catch (error) {
              console.warn('Error formatting expense date for chart:', expense);
            }
          });
          const categoryData = Object.entries(expensesByCategory)
            .sort(([,a], [,b]) => b - a)
            .map(([category, amount]) => [category, `$${amount.toFixed(2)}`, amount]);

          resolve({
            metrics: [
              {
                title: 'Total Expenses',
                value: `$${totalExpenses.toLocaleString()}`,
                icon: 'Receipt',
                trend: 'neutral',
                trendValue: '',
                color: 'danger'
              },
              {
                title: 'Total Transactions',
                value: totalCount.toString(),
                icon: 'FileText',
                trend: 'neutral',
                trendValue: '',
                color: 'primary'
              },
              {
                title: 'Average Expense',
                value: `$${averageExpense.toFixed(2)}`,
                icon: 'Calculator',
                trend: 'neutral',
                trendValue: '',
                color: 'secondary'
              },
              {
                title: 'Categories',
                value: Object.keys(expensesByCategory).length.toString(),
                icon: 'Tag',
                trend: 'neutral',
                trendValue: '',
                color: 'accent'
              }
            ],
            chartTitle: 'Expense Trend',
            chartData: {
              categories: Object.keys(expensesByDate),
              series: [
                {
                  name: 'Expenses',
                  data: Object.values(expensesByDate)
                }
              ]
            },
            tableTitle: 'Expenses by Category',
            tableData: {
              headers: ['Category', 'Amount', 'Total'],
              rows: categoryData
            },
            summary: `Recorded ${totalCount} expense transactions totaling $${totalExpenses.toLocaleString()} during the selected period.\nAverage expense amount was $${averageExpense.toFixed(2)}.\nHighest expense category: ${categoryData[0]?.[0] || 'N/A'}.`
          });
        } catch (error) {
          resolve({
            metrics: [],
            chartData: null,
            tableData: null,
            summary: 'Error loading expense report data.'
          });
        }
      }, 300);
    });
  },

  async getInventoryReport() {
    return new Promise(async (resolve) => {
      setTimeout(async () => {
        try {
          const products = await productService.getAll();

          // Calculate metrics
          const totalProducts = products.length;
          const totalValue = products.reduce((sum, product) => sum + (product.price * product.stock), 0);
          const lowStockProducts = products.filter(product => product.stock < 10).length;
          const averagePrice = totalProducts > 0 ? products.reduce((sum, product) => sum + product.price, 0) / totalProducts : 0;

          // Group by category
          const productsByCategory = {};
          products.forEach(product => {
            productsByCategory[product.category] = (productsByCategory[product.category] || 0) + 1;
          });

          // Stock levels for chart
          const stockLevels = {
            'High Stock (>50)': products.filter(p => p.stock > 50).length,
            'Medium Stock (10-50)': products.filter(p => p.stock >= 10 && p.stock <= 50).length,
            'Low Stock (<10)': products.filter(p => p.stock < 10).length
          };

          const categoryData = Object.entries(productsByCategory)
            .sort(([,a], [,b]) => b - a)
            .map(([category, count]) => [category, count, `${count} products`]);

          resolve({
            metrics: [
              {
                title: 'Total Products',
                value: totalProducts.toString(),
                icon: 'Package',
                trend: 'neutral',
                trendValue: '',
                color: 'primary'
              },
              {
                title: 'Inventory Value',
                value: `$${totalValue.toLocaleString()}`,
                icon: 'DollarSign',
                trend: 'neutral',
                trendValue: '',
                color: 'success'
              },
              {
                title: 'Low Stock Items',
                value: lowStockProducts.toString(),
                icon: 'AlertTriangle',
                trend: lowStockProducts > 0 ? 'down' : 'neutral',
                trendValue: lowStockProducts > 0 ? 'Needs attention' : '',
                color: lowStockProducts > 0 ? 'warning' : 'success'
              },
              {
                title: 'Average Price',
                value: `$${averagePrice.toFixed(2)}`,
                icon: 'TrendingUp',
                trend: 'neutral',
                trendValue: '',
                color: 'secondary'
              }
            ],
            chartTitle: 'Stock Levels Distribution',
            chartData: {
              categories: Object.keys(stockLevels),
              series: [
                {
                  name: 'Products',
                  data: Object.values(stockLevels)
                }
              ]
            },
            tableTitle: 'Products by Category',
            tableData: {
              headers: ['Category', 'Product Count', 'Details'],
              rows: categoryData
            },
            summary: `Managing ${totalProducts} products with total inventory value of $${totalValue.toLocaleString()}.\n${lowStockProducts > 0 ? `${lowStockProducts} products need restocking.` : 'All products are adequately stocked.'}\nMost popular category: ${categoryData[0]?.[0] || 'N/A'}.`
          });
        } catch (error) {
          resolve({
            metrics: [],
            chartData: null,
            tableData: null,
            summary: 'Error loading inventory report data.'
          });
        }
      }, 300);
    });
  },

  async getBusinessOverview(startDate, endDate) {
    return new Promise(async (resolve) => {
      setTimeout(async () => {
        try {
          const [salesData, expenseData, inventoryData] = await Promise.all([
            this.getSalesReport(startDate, endDate),
            this.getExpenseReport(startDate, endDate),
            this.getInventoryReport()
          ]);

          const revenue = parseFloat(salesData.metrics[0].value.replace(/[$,]/g, ''));
          const expenses = parseFloat(expenseData.metrics[0].value.replace(/[$,]/g, ''));
          const profit = revenue - expenses;
          const profitMargin = revenue > 0 ? (profit / revenue) * 100 : 0;

          resolve({
            metrics: [
              {
                title: 'Total Revenue',
                value: `$${revenue.toLocaleString()}`,
                icon: 'TrendingUp',
                trend: 'up',
                trendValue: '12.5%',
                color: 'success'
              },
              {
                title: 'Total Expenses',
                value: `$${expenses.toLocaleString()}`,
                icon: 'TrendingDown',
                trend: 'down',
                trendValue: '8.2%',
                color: 'danger'
              },
              {
                title: 'Net Profit',
                value: `$${profit.toLocaleString()}`,
                icon: 'DollarSign',
                trend: profit >= 0 ? 'up' : 'down',
                trendValue: `${Math.abs(profitMargin).toFixed(1)}%`,
                color: profit >= 0 ? 'success' : 'danger'
              },
              {
                title: 'Profit Margin',
                value: `${profitMargin.toFixed(1)}%`,
                icon: 'Percent',
                trend: profitMargin >= 0 ? 'up' : 'down',
                trendValue: '',
                color: profitMargin >= 0 ? 'success' : 'danger'
              }
            ],
            chartTitle: 'Revenue vs Expenses',
            chartData: {
              categories: ['Revenue', 'Expenses', 'Profit'],
              series: [
                {
                  name: 'Amount',
                  data: [revenue, expenses, profit]
                }
              ]
            },
            tableTitle: 'Business Summary',
            tableData: {
              headers: ['Metric', 'Current Period', 'Status'],
              rows: [
                ['Revenue', `$${revenue.toLocaleString()}`, 'Good'],
                ['Expenses', `$${expenses.toLocaleString()}`, 'Controlled'],
                ['Profit', `$${profit.toLocaleString()}`, profit >= 0 ? 'Positive' : 'Negative'],
                ['Profit Margin', `${profitMargin.toFixed(1)}%`, profitMargin >= 10 ? 'Healthy' : 'Needs Improvement']
              ]
            },
            summary: `Business generated $${revenue.toLocaleString()} in revenue with $${expenses.toLocaleString()} in expenses, resulting in ${profit >= 0 ? 'a profit' : 'a loss'} of $${Math.abs(profit).toLocaleString()}.\nProfit margin is ${profitMargin.toFixed(1)}%, which is ${profitMargin >= 10 ? 'healthy' : 'below recommended 10%'}.\n${inventoryData.metrics[2].value} products need restocking attention.`
          });
        } catch (error) {
          resolve({
            metrics: [],
            chartData: null,
            tableData: null,
            summary: 'Error loading business overview data.'
          });
        }
      }, 300);
    });
  },

async exportReport(reportType, format, startDate, endDate) {
    return new Promise(async (resolve, reject) => {
      try {
        setTimeout(async () => {
          // Get the report data
          let reportData;
          switch (reportType) {
            case 'sales':
              reportData = await this.getSalesReport(startDate, endDate);
              break;
            case 'expenses':
              reportData = await this.getExpenseReport(startDate, endDate);
              break;
            case 'inventory':
              reportData = await this.getInventoryReport();
              break;
            case 'overview':
              reportData = await this.getBusinessOverview(startDate, endDate);
              break;
            default:
              reportData = await this.getSalesReport(startDate, endDate);
          }

          if (format === 'csv') {
            // Generate CSV
            const csvContent = this.generateCSV(reportData, reportType);
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', `${reportType}-report-${new Date().toISOString().split('T')[0]}.csv`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
          } else if (format === 'pdf') {
            // Generate PDF using jsPDF
            const { jsPDF } = await import('jspdf');
            const doc = new jsPDF();
            
            // Title
            doc.setFontSize(20);
            doc.text(`${reportType.charAt(0).toUpperCase() + reportType.slice(1)} Report`, 20, 30);
            
            // Date range
            const dateStr = startDate && endDate ? 
              `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}` : 
              'All Time';
            doc.setFontSize(12);
            doc.text(`Period: ${dateStr}`, 20, 45);
            
            // Metrics
            let yPos = 65;
            doc.setFontSize(14);
            doc.text('Key Metrics:', 20, yPos);
            yPos += 10;
            
            doc.setFontSize(10);
            reportData.metrics?.forEach(metric => {
              doc.text(`${metric.title}: ${metric.value}`, 20, yPos);
              yPos += 8;
            });
            
            // Table data
            if (reportData.tableData && reportData.tableData.rows) {
              yPos += 15;
              doc.setFontSize(14);
              doc.text(reportData.tableTitle || 'Details:', 20, yPos);
              yPos += 10;
              
              doc.setFontSize(9);
              // Headers
              if (reportData.tableData.headers) {
                let xPos = 20;
                reportData.tableData.headers.forEach(header => {
                  doc.text(header, xPos, yPos);
                  xPos += 60;
                });
                yPos += 8;
              }
              
              // Rows
              reportData.tableData.rows.forEach(row => {
                let xPos = 20;
                row.forEach(cell => {
                  doc.text(String(cell), xPos, yPos);
                  xPos += 60;
                });
                yPos += 6;
                if (yPos > 270) { // Page break
                  doc.addPage();
                  yPos = 20;
                }
              });
            }
            
            // Summary
            if (reportData.summary) {
              yPos += 15;
              doc.setFontSize(12);
              doc.text('Summary:', 20, yPos);
              yPos += 10;
              doc.setFontSize(9);
              const summaryLines = reportData.summary.split('\n');
              summaryLines.forEach(line => {
                if (line.trim()) {
                  doc.text(line, 20, yPos);
                  yPos += 6;
                }
              });
            }
            
            doc.save(`${reportType}-report-${new Date().toISOString().split('T')[0]}.pdf`);
          }

          resolve({
            success: true,
            format,
            filename: `${reportType}-report-${new Date().toISOString().split('T')[0]}.${format}`
          });
        }, 500);
      } catch (error) {
        reject(error);
      }
    });
  },

  generateCSV(reportData, reportType) {
    let csvContent = `${reportType.charAt(0).toUpperCase() + reportType.slice(1)} Report\n`;
    csvContent += `Generated on: ${new Date().toLocaleDateString()}\n\n`;
    
    // Metrics
    if (reportData.metrics) {
      csvContent += 'Key Metrics\n';
      csvContent += 'Metric,Value,Trend\n';
      reportData.metrics.forEach(metric => {
        csvContent += `"${metric.title}","${metric.value}","${metric.trendValue || ''}"\n`;
      });
      csvContent += '\n';
    }
    
    // Table data
    if (reportData.tableData) {
      csvContent += `${reportData.tableTitle || 'Details'}\n`;
      if (reportData.tableData.headers) {
        csvContent += reportData.tableData.headers.map(h => `"${h}"`).join(',') + '\n';
      }
      if (reportData.tableData.rows) {
        reportData.tableData.rows.forEach(row => {
          csvContent += row.map(cell => `"${cell}"`).join(',') + '\n';
        });
      }
      csvContent += '\n';
    }
    
    // Summary
    if (reportData.summary) {
      csvContent += 'Summary\n';
      const summaryLines = reportData.summary.split('\n');
      summaryLines.forEach(line => {
        if (line.trim()) {
          csvContent += `"${line}"\n`;
        }
      });
    }
    
    return csvContent;
  }
};

export default reportService;
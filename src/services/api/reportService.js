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
            const orderDate = parseISO(order.date);
            return isWithinInterval(orderDate, { start: startDate, end: endDate });
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
            const orderDate = parseISO(order.date);
            return isWithinInterval(orderDate, { start: previousStartDate, end: previousEndDate });
          });
          
          const previousRevenue = previousSales.reduce((sum, order) => sum + order.total, 0);
          const revenueTrend = previousRevenue > 0 ? 
            ((totalRevenue - previousRevenue) / previousRevenue) * 100 : 0;

          // Group sales by date for chart
          const salesByDate = {};
          filteredSales.forEach(order => {
            const dateKey = format(parseISO(order.date), 'MMM dd');
            salesByDate[dateKey] = (salesByDate[dateKey] || 0) + order.total;
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
            const expenseDate = parseISO(expense.date);
            return isWithinInterval(expenseDate, { start: startDate, end: endDate });
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
            const dateKey = format(parseISO(expense.date), 'MMM dd');
            expensesByDate[dateKey] = (expensesByDate[dateKey] || 0) + expense.amount;
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
    return new Promise((resolve) => {
      setTimeout(() => {
        // Simulate export functionality
        console.log(`Exporting ${reportType} report as ${format} for period ${startDate} to ${endDate}`);
        resolve();
      }, 500);
    });
  }
};

export default reportService;
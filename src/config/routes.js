import Dashboard from '@/components/pages/Dashboard';
import Inventory from '@/components/pages/Inventory';
import Customers from '@/components/pages/Customers';
import Sales from '@/components/pages/Sales';
import More from '@/components/pages/More';
import AddProduct from '@/components/pages/AddProduct';
import AddCustomer from '@/components/pages/AddCustomer';
import CreateSalesOrder from '@/components/pages/CreateSalesOrder';
import Expenses from '@/components/pages/Expenses';
import Reports from '@/components/pages/Reports';

export const routes = {
  dashboard: {
    id: 'dashboard',
    label: 'Dashboard',
    path: '/',
    icon: 'BarChart3',
    component: Dashboard
  },
  inventory: {
    id: 'inventory',
    label: 'Inventory',
    path: '/inventory',
    icon: 'Package',
    component: Inventory
  },
  customers: {
    id: 'customers',
    label: 'Customers',
    path: '/customers',
    icon: 'Users',
    component: Customers
  },
  sales: {
    id: 'sales',
    label: 'Sales',
    path: '/sales',
    icon: 'ShoppingCart',
    component: Sales
  },
  more: {
    id: 'more',
    label: 'More',
    path: '/more',
    icon: 'Menu',
    component: More
  },
  addProduct: {
    id: 'addProduct',
    label: 'Add Product',
    path: '/inventory/add',
    icon: 'Plus',
    component: AddProduct
  },
  addCustomer: {
    id: 'addCustomer',
    label: 'Add Customer',
    path: '/customers/add',
    icon: 'UserPlus',
    component: AddCustomer
  },
  createSalesOrder: {
    id: 'createSalesOrder',
    label: 'Create Sales Order',
    path: '/sales/create',
    icon: 'FileText',
    component: CreateSalesOrder
  },
expenses: {
    id: 'expenses',
    label: 'Expenses',
    path: '/expenses',
    icon: 'Receipt',
    component: Expenses
  },
  reports: {
    id: 'reports',
    label: 'Reports',
    path: '/reports',
    icon: 'BarChart',
    component: Reports
  }
};

export const routeArray = Object.values(routes);
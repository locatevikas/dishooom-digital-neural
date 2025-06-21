import salesOrderData from '../mockData/salesOrders.json';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

class SalesOrderService {
  constructor() {
    this.data = [...salesOrderData];
  }

  async getAll() {
    await delay(300);
    return [...this.data];
  }

  async getById(id) {
    await delay(200);
    const order = this.data.find(item => item.Id === parseInt(id, 10));
    if (!order) throw new Error('Sales order not found');
    return { ...order };
  }

  async create(order) {
    await delay(400);
    const newId = Math.max(...this.data.map(o => o.Id), 0) + 1;
    const invoiceNumber = `INV-${new Date().getFullYear()}-${String(newId).padStart(4, '0')}`;
    
    const newOrder = {
      ...order,
      Id: newId,
      invoiceNumber,
      orderDate: new Date().toISOString(),
      paymentStatus: order.paymentStatus || 'pending',
      createdAt: new Date().toISOString()
    };
    this.data.push(newOrder);
    return { ...newOrder };
  }

  async update(id, updates) {
    await delay(300);
    const index = this.data.findIndex(item => item.Id === parseInt(id, 10));
    if (index === -1) throw new Error('Sales order not found');
    
    const updatedOrder = {
      ...this.data[index],
      ...updates,
      Id: this.data[index].Id, // Prevent Id modification
      updatedAt: new Date().toISOString()
    };
    this.data[index] = updatedOrder;
    return { ...updatedOrder };
  }

  async delete(id) {
    await delay(250);
    const index = this.data.findIndex(item => item.Id === parseInt(id, 10));
    if (index === -1) throw new Error('Sales order not found');
    
    const deleted = this.data.splice(index, 1)[0];
    return { ...deleted };
  }

  async updatePaymentStatus(id, status) {
    await delay(250);
    return this.update(id, { paymentStatus: status });
  }

  async getByPaymentStatus(status) {
    await delay(200);
    return this.data.filter(order => order.paymentStatus === status);
  }

  async getMonthlySales(year, month) {
    await delay(200);
    return this.data.filter(order => {
      const orderDate = new Date(order.orderDate);
      return orderDate.getFullYear() === year && orderDate.getMonth() === month - 1;
    });
  }
}

export default new SalesOrderService();
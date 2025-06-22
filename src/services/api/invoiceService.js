import invoiceData from '../mockData/invoices.json';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

class InvoiceService {
  constructor() {
    this.data = [...invoiceData];
  }

  async getAll() {
    await delay(300);
    return [...this.data];
  }

  async getById(id) {
    await delay(200);
    const invoice = this.data.find(item => item.Id === parseInt(id, 10));
    if (!invoice) throw new Error('Invoice not found');
    return { ...invoice };
  }

  async create(invoice) {
    await delay(400);
    const newId = Math.max(...this.data.map(i => i.Id), 0) + 1;
    const invoiceNumber = `INV-${new Date().getFullYear()}-${String(newId).padStart(4, '0')}`;
    
    const newInvoice = {
      ...invoice,
      Id: newId,
      invoiceNumber,
      invoiceDate: new Date().toISOString(),
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
      paymentStatus: invoice.paymentStatus || 'pending',
      createdAt: new Date().toISOString()
    };
    this.data.push(newInvoice);
    return { ...newInvoice };
  }

  async update(id, updates) {
    await delay(300);
    const index = this.data.findIndex(item => item.Id === parseInt(id, 10));
    if (index === -1) throw new Error('Invoice not found');
    
    const updatedInvoice = {
      ...this.data[index],
      ...updates,
      Id: this.data[index].Id, // Prevent Id modification
      updatedAt: new Date().toISOString()
    };
    this.data[index] = updatedInvoice;
    return { ...updatedInvoice };
  }

  async delete(id) {
    await delay(250);
    const index = this.data.findIndex(item => item.Id === parseInt(id, 10));
    if (index === -1) throw new Error('Invoice not found');
    
    const deleted = this.data.splice(index, 1)[0];
    return { ...deleted };
  }

  async updatePaymentStatus(id, status) {
    await delay(250);
    return this.update(id, { paymentStatus: status });
  }

  async getByPaymentStatus(status) {
    await delay(200);
    return this.data.filter(invoice => invoice.paymentStatus === status);
  }

  async getByCustomerId(customerId) {
    await delay(200);
    return this.data.filter(invoice => invoice.customerId === parseInt(customerId, 10));
  }

  async getByOrderId(orderId) {
    await delay(200);
    return this.data.filter(invoice => invoice.orderId === parseInt(orderId, 10));
  }
}

export default new InvoiceService();
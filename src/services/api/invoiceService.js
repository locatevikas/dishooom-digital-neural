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

  async generatePDFInvoice(order, customerData) {
    await delay(300);
    
    // Dynamic import for jsPDF to avoid bundling issues
    const { jsPDF } = await import('jspdf');
    
    const doc = new jsPDF();
    
    // Company header
    doc.setFontSize(20);
    doc.setTextColor(0, 0, 0);
    doc.text('DISHOOOM CRM', 20, 30);
    
    doc.setFontSize(12);
    doc.text('Invoice', 20, 45);
    
    // Invoice details
    doc.setFontSize(10);
    doc.text(`Invoice Number: ${order.invoiceNumber}`, 20, 60);
    doc.text(`Order ID: #${order.Id}`, 20, 70);
    doc.text(`Date: ${new Date(order.orderDate).toLocaleDateString()}`, 20, 80);
    
    // Customer details
    doc.text('Bill To:', 20, 100);
    doc.text(order.customerName, 20, 110);
    if (customerData) {
      doc.text(customerData.address || '', 20, 120);
      doc.text(`Phone: ${customerData.phone || ''}`, 20, 130);
      doc.text(`GST: ${customerData.gstNumber || ''}`, 20, 140);
    }
    
    // Items table header
    let yPos = 160;
    doc.setFontSize(9);
    doc.text('Item', 20, yPos);
    doc.text('Qty', 120, yPos);
    doc.text('Rate', 140, yPos);
    doc.text('Amount', 160, yPos);
    
    // Items
    yPos += 10;
    order.items.forEach(item => {
      doc.text(item.productName, 20, yPos);
      doc.text(item.quantity.toString(), 120, yPos);
      doc.text(`₹${item.unitPrice}`, 140, yPos);
      doc.text(`₹${item.total}`, 160, yPos);
      yPos += 10;
    });
    
    // Total
    yPos += 10;
    doc.setFontSize(12);
    doc.text(`Total: ₹${order.totalAmount.toLocaleString()}`, 140, yPos);
    doc.text(`Status: ${order.paymentStatus.toUpperCase()}`, 140, yPos + 15);
    
    // Download the PDF
    doc.save(`Invoice-${order.invoiceNumber}.pdf`);
    
    return {
      success: true,
      filename: `Invoice-${order.invoiceNumber}.pdf`
    };
  }
}

export default new InvoiceService();
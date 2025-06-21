import customerData from '../mockData/customers.json';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

class CustomerService {
  constructor() {
    this.data = [...customerData];
  }

  async getAll() {
    await delay(300);
    return [...this.data];
  }

  async getById(id) {
    await delay(200);
    const customer = this.data.find(item => item.Id === parseInt(id, 10));
    if (!customer) throw new Error('Customer not found');
    return { ...customer };
  }

  async create(customer) {
    await delay(400);
    const newId = Math.max(...this.data.map(c => c.Id), 0) + 1;
    const newCustomer = {
      ...customer,
      Id: newId,
      createdAt: new Date().toISOString(),
      pipelineStage: customer.pipelineStage || 'new'
    };
    this.data.push(newCustomer);
    return { ...newCustomer };
  }

  async update(id, updates) {
    await delay(300);
    const index = this.data.findIndex(item => item.Id === parseInt(id, 10));
    if (index === -1) throw new Error('Customer not found');
    
    const updatedCustomer = {
      ...this.data[index],
      ...updates,
      Id: this.data[index].Id, // Prevent Id modification
      updatedAt: new Date().toISOString()
    };
    this.data[index] = updatedCustomer;
    return { ...updatedCustomer };
  }

  async delete(id) {
    await delay(250);
    const index = this.data.findIndex(item => item.Id === parseInt(id, 10));
    if (index === -1) throw new Error('Customer not found');
    
    const deleted = this.data.splice(index, 1)[0];
    return { ...deleted };
  }

  async getByPipelineStage(stage) {
    await delay(200);
    return this.data.filter(customer => customer.pipelineStage === stage);
  }

  async updatePipelineStage(id, stage) {
    await delay(250);
    return this.update(id, { 
      pipelineStage: stage,
      lastContact: new Date().toISOString()
    });
  }
}

export default new CustomerService();
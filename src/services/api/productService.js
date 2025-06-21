import productData from '../mockData/products.json';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

class ProductService {
  constructor() {
    this.data = [...productData];
  }

  async getAll() {
    await delay(300);
    return [...this.data];
  }

  async getById(id) {
    await delay(200);
    const product = this.data.find(item => item.Id === parseInt(id, 10));
    if (!product) throw new Error('Product not found');
    return { ...product };
  }

  async create(product) {
    await delay(400);
    const newId = Math.max(...this.data.map(p => p.Id), 0) + 1;
    const newProduct = {
      ...product,
      Id: newId,
      createdAt: new Date().toISOString()
    };
    this.data.push(newProduct);
    return { ...newProduct };
  }

  async update(id, updates) {
    await delay(300);
    const index = this.data.findIndex(item => item.Id === parseInt(id, 10));
    if (index === -1) throw new Error('Product not found');
    
    const updatedProduct = {
      ...this.data[index],
      ...updates,
      Id: this.data[index].Id, // Prevent Id modification
      updatedAt: new Date().toISOString()
    };
    this.data[index] = updatedProduct;
    return { ...updatedProduct };
  }

  async delete(id) {
    await delay(250);
    const index = this.data.findIndex(item => item.Id === parseInt(id, 10));
    if (index === -1) throw new Error('Product not found');
    
    const deleted = this.data.splice(index, 1)[0];
    return { ...deleted };
  }

  async getLowStockProducts() {
    await delay(200);
    return this.data.filter(product => product.currentStock <= product.minStock);
  }

  async updateStock(id, quantity, type = 'in') {
    await delay(300);
    const product = await this.getById(id);
    const newStock = type === 'in' 
      ? product.currentStock + quantity 
      : Math.max(0, product.currentStock - quantity);
    
    return this.update(id, { currentStock: newStock });
  }
}

export default new ProductService();
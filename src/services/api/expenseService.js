import expenseData from '../mockData/expenses.json';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

class ExpenseService {
  constructor() {
    this.data = [...expenseData];
  }

  async getAll() {
    await delay(300);
    return [...this.data];
  }

  async getById(id) {
    await delay(200);
    const expense = this.data.find(item => item.Id === parseInt(id, 10));
    if (!expense) throw new Error('Expense not found');
    return { ...expense };
  }

  async create(expense) {
    await delay(400);
    const newId = Math.max(...this.data.map(e => e.Id), 0) + 1;
    const newExpense = {
      ...expense,
      Id: newId,
      date: expense.date || new Date().toISOString(),
      createdAt: new Date().toISOString()
    };
    this.data.push(newExpense);
    return { ...newExpense };
  }

  async update(id, updates) {
    await delay(300);
    const index = this.data.findIndex(item => item.Id === parseInt(id, 10));
    if (index === -1) throw new Error('Expense not found');
    
    const updatedExpense = {
      ...this.data[index],
      ...updates,
      Id: this.data[index].Id, // Prevent Id modification
      updatedAt: new Date().toISOString()
    };
    this.data[index] = updatedExpense;
    return { ...updatedExpense };
  }

  async delete(id) {
    await delay(250);
    const index = this.data.findIndex(item => item.Id === parseInt(id, 10));
    if (index === -1) throw new Error('Expense not found');
    
    const deleted = this.data.splice(index, 1)[0];
    return { ...deleted };
  }

  async getByCategory(category) {
    await delay(200);
    return this.data.filter(expense => expense.category === category);
  }

  async getMonthlyExpenses(year, month) {
    await delay(200);
    return this.data.filter(expense => {
      const expenseDate = new Date(expense.date);
      return expenseDate.getFullYear() === year && expenseDate.getMonth() === month - 1;
    });
  }
}

export default new ExpenseService();
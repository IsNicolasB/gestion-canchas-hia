class BaseEmailStrategy {
    constructor(data) {
      this.data = data;
    }
  
    // Este método debe ser implementado en las subclases
    getEmailOptions() {
      throw new Error('getEmailOptions() debe ser implementado por la subclase');
    }
  }
  
module.exports = BaseEmailStrategy;
  
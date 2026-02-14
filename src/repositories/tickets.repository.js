const Ticket = require('../dao/models/ticket.model');

class TicketsRepository {
  async create({ amount, purchaser }) {
    return Ticket.create({ amount, purchaser });
  }
}

module.exports = TicketsRepository;
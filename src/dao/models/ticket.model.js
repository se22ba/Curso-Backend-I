const { Schema, model } = require('mongoose');
const crypto = require('crypto');

const ticketSchema = new Schema(
  {
    code: { type: String, unique: true, index: true, default: () => crypto.randomUUID() },
    purchase_datetime: { type: Date, default: Date.now },
    amount: { type: Number, required: true },
    purchaser: { type: String, required: true }
  },
  { timestamps: true }
);

module.exports = model('Ticket', ticketSchema);
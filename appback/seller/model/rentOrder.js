
const mongoose = require('mongoose');
const itemsdata = require('./db');

const rentOrderSchema = new mongoose.Schema({
  item: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'rented',
    required: true
  },
  renter: {        
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  buyer: {          
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  address: {
    type: String,
    required: true
  },
  contactno: {
    type: Number,
    required: true
  },
  paymentMethod: {
    type: String,
    enum: ['cod', 'online'],
    default: 'cod',
    required: true
  },
  rentStartDate: {
    type: Date,
    default: Date.now
  },
  rentEndDate: {
    type: Date,
    required: true
  },
  depositAmount: {
    type: Number,
    default: 0
  },
  orderStatus: {
    type: String,
    enum: ['booked', 'active', 'returned', 'cancelled'],
    default: 'booked'
  }
}, { timestamps: true });

module.exports = itemsdata.model('RentOrder', rentOrderSchema);
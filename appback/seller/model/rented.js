const mongoose = require('mongoose');
const itemsdata = require("./db");

const rentedSchema = new mongoose.Schema({
  image: {
    type: Buffer,
    required: [true, 'Image is required']
  },
  name: {
    type: String,
    required: [true, 'Name is required']
  },
  price: {
    type: Number,
    min: 0,
    required: [true, 'Price is required']
  },
  age: {
    type: String,
    enum: {
      values: ['New', 'Old'],
      message: 'Age must be either "New" or "Old"'
    },
    required: [true, 'Age is required']
  },
  description: {
    type: String,           
    required: true
  },
  renter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  buyer: {                  
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  orderStatus: {
    type: String,
    enum: ['available', 'booked', 'active', 'returned'],
    default: 'available'
  }
}, { timestamps: true });

module.exports = itemsdata.model('rented', rentedSchema);

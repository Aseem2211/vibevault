
const mongoose = require('mongoose');

const itemsdata =require('./db');

itemsdata.on('connected', () => console.log('Connected to database items'));

const itemSchema = new mongoose.Schema({
  section: {
    type: String,
    enum: {
      values: ['assignment', 'furniture', 'appliance', 'book','stationary','snacks','clothes'],
      message: 'Invalid section'
    },
    required: [true, 'Section is required']
  },
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
      message: 'Age must be either "New" or "Old"'    },
    required: [true, 'Age is required']
  },
  description:{
    type:String,
    required:true
  },
  seller:{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    
  },
  buyer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  orderStatus: {
    type: String,
    enum: ['listed', 'ordered', 'delivered', 'cancelled'],
    default: 'listed'
  },
  metadata:{
    type:mongoose.Schema.Types.Mixed,
    default:{}
  },
  reviews:[
    {
      user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User'
      },
      rating:{
        type:Number,
        min:1,
        max:5,
        required:true
      },
      comment:{
        type:String,
        default:''
      },
      createdAt:{
        type:Date,
        default:Date.now
      }
    }
  ]  
    
}, {
  timestamps:true
});


module.exports=itemsdata.model('Item',itemSchema);

    
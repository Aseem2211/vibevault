
const mongoose = require('mongoose');

const itemsdata =require('./db');



const deliverSchema = new mongoose.Schema({
  name:{
    type:String,
    minlength:[2,'Name should be at least 2 characters long'],
    required:true,
   
   },
    item: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Item",
        required: true
    },
    address:{
    type:String,
    required:[true,'Address is required'],
   },
   contactno:{
    type:String,
    required:[true,'Mobile no. is required'],
    match:[/^\d{10}$/,'Contact number must be exactly 10 digits'],
    
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
  paymentMethod: {
  type: String,
  enum: ['cod', 'online'],
  required: true,
  default: 'cod'
  },
  orderStatus: {
    type: String,
    enum: ['listed', 'ordered', 'delivered', 'cancelled'],
    default: 'listed'
  },
  quantity:{
    type:Number,
    default:1,
    min:[1,'Quantity must be atleast 1'],
  }
    
    
}, {
  timestamps:true
});


module.exports=itemsdata.model('Deliver',deliverSchema);
const mongoose=require('mongoose');
const itemsdata=require('./db');
const userschema=new mongoose.Schema({
   name:{
    type:String,
    minlength:[2,'Name should be at leat 2 characters long'],
    required:true,
   
   },
   password:{
    type:String,
    required:[true,'Password is required'],
    minlength:[8,'Password must be at least 8 characters long'],
    select:false
   },
   email:{
    type:String,
    required:true,
    unique:true,

   },
   address:{
    type:String,
    required:[true,'Address is required'],
   },
   contactno:{
    type:Number,
    required:[true,'Mobile no. is required'],
    unique:true
   },
   role:{
    type:String,
    
    enum:['user','admin'],
    default:'user'
   },
   isVerified:{
      type:Boolean,
      default:false
   }
   
},

   {timestamps:true
});

module.exports=itemsdata.model('User',userschema);
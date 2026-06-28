const express=require('express');
const furniturerouter=express.Router();
const path=require('path');
const controller=require('../controllers/vibecontroller');
furniturerouter.get("/furniture",controller.fetchfurniture);

    

module.exports=furniturerouter;
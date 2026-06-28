const express=require('express');
const clothesrouter=express.Router();
const path=require('path');
const controller=require('../controllers/vibecontroller');

clothesrouter.get('/clothes',controller.fetchclothes);

   

module.exports=clothesrouter;
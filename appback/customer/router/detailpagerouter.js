const express=require('express');
const pagerouter=express.Router();
const pagecontroler=require('../controllers/pagecontroller');
pagerouter.get("/detailpage/:itemId",pagecontroler.showpage);

module.exports=pagerouter;
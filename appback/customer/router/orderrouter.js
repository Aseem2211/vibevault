const express = require('express');
const orderrouter = express.Router();
const sellercontroller=require('../controllers/sellercontroller');
const buycontroller = require('../controllers/buycontroller');
const isAuth=(req,res,next)=>{
    if(!req.session.user){
        return res.status(401).json({message:"Unauthorized",redirect:"/login"});
    }
    next();
};
orderrouter.get('/buy/:itemId',isAuth, buycontroller.prebuy);

orderrouter.get('/seller/orders', isAuth,sellercontroller.getSellerOrders);
orderrouter.patch('/seller/orders/:orderId/status',isAuth,sellercontroller.updateOrderStatus);
orderrouter.post('/buy/:itemId', isAuth,buycontroller.placeOrder);
orderrouter.get('/orders', isAuth, buycontroller.getOrders);
orderrouter.delete('/orders/:deliveryId/delete',isAuth,buycontroller.deleteOrder);
orderrouter.get('/seedetails/:id',isAuth, buycontroller.seeDetails);

orderrouter.post('/orders/:deliveryId/cancel', isAuth, buycontroller.cancelOrder);
orderrouter.get('/seller', isAuth,buycontroller.postbuy);

module.exports = orderrouter;
const express=require('express');
const cartrouter=express.Router();
const path=require('path');
const cartcontroller=require('../controllers/cartcontroller');
const isAuth = (req, res, next) => {
    if (!req.session.user) {
        return res.status(401).json({ message: "Unauthorized", redirect: "/login" });
    }
    next();
};
cartrouter.post("/addcart/:itemId",isAuth,cartcontroller.addToCart);
cartrouter.get('/cart',isAuth,cartcontroller.viewCart);
cartrouter.delete('/cart/remove/:id',isAuth,cartcontroller.removeCart);
module.exports=cartrouter;
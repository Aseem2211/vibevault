const express = require('express');
const rentrouter = express.Router();
const rentcontroller = require('../controllers/rentcontroller');

const isLoggedIn = (req, res, next) => {
    if (!req.session?.user) {
        return res.status(401).json({ message: "Unauthorized", redirect: "/login" });
    }
    next();
};

const isAdmin = (req, res, next) => {
    if (!req.session?.user) {
        return res.status(401).json({ redirect: "/login" });
    }
    if (req.session.user.role !== 'admin') {
        return res.status(403).json({ message: "Access denied" });
    }
    next();
};


rentrouter.get('/rent',         isLoggedIn, rentcontroller.getrented);
rentrouter.get('/seller/rent',  isAdmin,    rentcontroller.postrentitem);
rentrouter.post('/rent/order',  isLoggedIn, rentcontroller.placeOrder);

rentrouter.post('/register/rent',
    isAdmin,
    rentcontroller.upload.single('image'),
    rentcontroller.putonrent
);
rentrouter.post('/rent-orders/:rentOrderId/cancel', isLoggedIn, rentcontroller.cancelRentOrder);
rentrouter.get('/rent/orders/buyer',  isLoggedIn, rentcontroller.getBuyerRentOrders);
rentrouter.get('/rent/orders/seller', isLoggedIn,     rentcontroller.getSellerRentOrders);
rentrouter.get('/rent/edit/:itemId',  isAdmin, rentcontroller.geteditrentitem);
rentrouter.post('/rent/edit/:itemId',
    isAdmin,
    rentcontroller.upload.single('image'),
    rentcontroller.updaterentitem
);
rentrouter.patch('/rent-orders/:rentOrderId/status', isLoggedIn, rentcontroller.updateRentOrderStatus);
rentrouter.delete('/rent/delete/:itemId', isAdmin, rentcontroller.deleterentitem);
rentrouter.delete('/rent-orders/:rentOrderId/delete',isLoggedIn,rentcontroller.deleteRentOrder);

rentrouter.get('/rent/:itemId', isLoggedIn, rentcontroller.prerentitem);

module.exports = rentrouter;

const express = require('express');
const frontrouter = express.Router();
const controller = require('../controllers/vibecontroller');
const multer = require('multer');

const upload = multer({
    storage: multer.memoryStorage(),
    fileFilter: (req, file, cb) => {
        const allowed = ['image/png', 'image/jpg', 'image/jpeg'];
        cb(null, allowed.includes(file.mimetype));
    }
});
const authenticate=(req,res,next)=>{
    if(!req.session?.user){
        return res.status(401).json({success:false,message:'User not loggedIn'})
    }
    req.user=req.session.user;
    next();
}

const adminOnly = (req, res, next) => {
    if (req.session?.user?.role !== 'admin') {
        return res.status(403).json({success:false,message:'Access denied: Admins only'});
    }
    req.user=req.session.user;
    next();
};
frontrouter.get('/appliances', controller.fetching);
frontrouter.get('/books',      controller.fetchbooks);
frontrouter.get('/furniture',  controller.fetchfurniture);
frontrouter.get('/snacks',     controller.fetchsnacks);
frontrouter.get('/stationary', controller.fetchstationary);
frontrouter.get('/clothes',    controller.fetchclothes);

frontrouter.patch('/item/:id/stock',adminOnly,controller.decreaseStock);
frontrouter.post('/item/:id/review',authenticate,controller.addReview);
frontrouter.get('/item/edit/:id', adminOnly, controller.getEditItem);
frontrouter.post('/item/edit/:id', adminOnly, upload.single('image'), controller.posteditItem);
frontrouter.post('/item/delete/:id', adminOnly, controller.deleteItem);
frontrouter.delete('/item/:id/reviews/:reviewId', authenticate, controller.deleteReview);
    


module.exports = frontrouter;
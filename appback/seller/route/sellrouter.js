const express = require('express');
const sellrouter = express.Router();
const path = require('path');
const Item = require("../model/item");
const mongoose = require('mongoose');
const multer = require('multer');
const fs=require('fs');
const storage = multer.memoryStorage(); 
const upload = multer({  
    storage,
    fileFilter: (req, file, cb) => {
        if (
            file.mimetype === 'image/png' ||
            file.mimetype === 'image/jpg' ||
            file.mimetype === 'image/jpeg'
        ) {
            cb(null, true);
        } else {
            cb(null, false);
        }
    }
});



sellrouter.get("/sell", async (req, res) => {
    try {
        const myItem = await Item.find({
            seller: new mongoose.Types.ObjectId(req.session.user._id)
        });
        const itemsWithImages = myItem.map(item => ({
            ...item._doc,
            image: item.image
                ? `data:image/jpeg;base64,${item.image.toString('base64')}`
                : null
        }));
        console.log('First item image value:', itemsWithImages[0]?.image?.substring(0, 50));

        res.json({ myItem:itemsWithImages,role:req.session.user.role });
    } catch (err) {
        console.log(err);
        res.json({ myItem: [],role:'user' });
    }
});


sellrouter.post("/register/sell", upload.single('image'), async (req, res) => {
    try {
        const userRole=req.session.user.role;
        const adminOnlyCategories=['stationary','snacks','clothes'];
        if(userRole!=='admin'&&adminOnlyCategories.includes(req.body.section)){
            return res.status(403).json({message:"You are not allowed to list in this category"});
        }
        const newItem = new Item({
            section: req.body.section,
            image: req.file.buffer, 
            name: req.body.name,
            price: req.body.price,
            age: req.body.age,
            description:req.body.description,
            seller: new mongoose.Types.ObjectId(req.session.user._id)
        });
        await newItem.save();
        res.json({redirect:'/sell'});
    } catch (err) {
        res.status(500).json({message:"Error while saving item: " });
    }
});

sellrouter.post('/sell/delete/:id', async (req, res) => {
    try {
        const itemId = req.params.id;
        if (!mongoose.Types.ObjectId.isValid(itemId)) {
        return res.status(400).json({message:'Invalid item ID'});
        }
        const item = await Item.findById(itemId);
        if (!item) {
            return res.status(404).json({message:'Item not found'});
        }
        if (item.seller.toString() !== req.session.user._id.toString()) {
            return res.status(403).json({message:'Unauthorized'});
        }
        await Item.findByIdAndDelete(itemId);
        res.json({redirect:'/sell'});
    } catch (err) {
        console.log(err);
        res.status(500).json({message:'Error deleting item:'});
    }
});

exports.sellrouter=sellrouter;

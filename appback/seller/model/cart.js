const mongoose = require('mongoose');
const itemsdata = require('./db'); 

const cartschema = new mongoose.Schema({
    item: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Item",
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    quantity: {
        type: Number,
        default: 1
    }
});

module.exports = itemsdata.model('Cart', cartschema); 

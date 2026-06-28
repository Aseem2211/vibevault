const Item = require('../../seller/model/item');
const User = require('../../seller/model/user');
const mongoose = require('mongoose');
const Deliver = require('../../seller/model/deliver');
const convertImage = (items) => {
    return items.map(item => ({
        ...item._doc,
        image: item.image
            ? `data:image/png;base64,${Buffer.from(item.image.buffer).toString('base64')}`
            : null
    }));
};
exports.prebuy = async (req, res) => {
    try {
        const userId = req.session.user._id;
        const ItemId = req.params.itemId;
        console.log("ItemId:", ItemId);
        const foundItem = await Item.findById(ItemId);
        
         console.log("foundItem:", foundItem);
        const userdetails = await User.findById(userId);
        console.log("userdetails:", userdetails);
        const itemDetails = convertImage([foundItem])[0];

        if (!userdetails) {
            return res.status(404).json({message:"User not found"});
        }

        res.json({
            Data: userdetails,
            itemDetails
        });
    } catch (err) {
        res.status(500).json({message:"User cannot be fetched"});
    }
};


exports.postbuy = async (req, res) => {
    try {
        const sellerId = req.session.user._id;

        const myItem = await Item.find({
            seller: new mongoose.Types.ObjectId(sellerId)
        });
        const convertedItems = convertImage(myItem);
        const deliveries=await Deliver.find({item:{$in:myItem.map(i=>i._id)}}).select('item');
        const orderedItemIds=new Set(deliveries.map(d=>d.item.toString()));
        const itemsWithStatus = convertedItems.map(item => ({
            ...item,
            status: orderedItemIds.has(item._id.toString())    
        }));

        res.json({
            myItem: itemsWithStatus
        });
    } catch (err) {
        res.status(500).json({message:err});
    }
};


exports.placeOrder = async (req, res) => {
        try {
        const buyerId = req.session.user._id;
        const itemId=req.params.itemId || req.body.itemId;
        const { name, address, contactno,quantity} = req.body;
        const paymentMethod=req.body.paymentMethod?.toLowerCase();
        const qty=parseInt(quantity,10)||1;
        const item = await Item.findById(itemId);
        if (!item) return res.status(404).json({ message: "Item not found" });
        const currentStock=item.metadata?.stock??0;
        if(qty>currentStock){
            return res.status(400).json({message:"Item out of stock"});
        }
        item.metadata.stock=currentStock-qty;
        item.markModified('metadata');
        await item.save();
        const delivery=await Deliver.create({
            name,
            address,
            contactno,
            paymentMethod,
            item: itemId,
            buyer: buyerId,
            seller:item.seller,
            quantity:qty,
            orderStatus:'ordered',
        });
       
        res.json({message:"Registered successful",redirect:"/confirmation"});
    } catch (err) {
        console.error("placeorder error",err);
        res.status(500).json({message:"Error while registering"});
    }
};
exports.getOrders = async (req, res) => {
    try {
        const buyerId = req.session.user._id;
        const deliveries = await Deliver.find({ buyer: buyerId })
            .populate('item');
        const orders = deliveries.map(d => {
            const item = d.item;
            return {
                _id: d._id,
                name: item?.name,
                price: item?.price,
                section: item?.section,
                age: item?.age,
                image: item?.image
                    ? `data:image/png;base64,${Buffer.from(item.image.buffer).toString('base64')}`
                    : null,
                orderStatus: d.orderStatus,
                quantity: d.quantity,
                createdAt:d.createdAt,
                type:'buy',
            };
        });
        res.json({ cohort: orders });
    } catch (err) {
        res.status(500).json({ message: "Error fetching orders" });
    }
};

exports.seeDetails = async (req, res) => {
    try {
        const item = await Item.findById(req.params.id);
        if (!item) {
            return res.status(404).json({ message: "No order found for this item" });
        }
        const delivery = await Deliver.findOne({ item: req.params.id }).populate('buyer');
        res.json({
            item,
            buyer: delivery?.buyer || null
        });
    } catch (err) {
        res.status(500).json({ message: "Error occured" });
    }
};
exports.cancelOrder = async (req, res) => {
    try {
        const buyerId = req.session.user._id;
        const deliveryId = req.params.deliveryId;
        const delivery = await Deliver.findById(deliveryId);
        if (!delivery) return res.status(404).json({ message: "Order not found" });
        if (delivery.buyer.toString() !== buyerId.toString()) {
            return res.status(403).json({ message: "Unauthorized" });
        }
        if (delivery.orderStatus !== 'ordered') {
            return res.status(400).json({ message: "Order cannot be cancelled at this stage" });
        }
        const CANCEL_WINDOW_MS = 20 * 60 * 1000; 
        const elapsed = Date.now() - new Date(delivery.createdAt).getTime();
        if (elapsed > CANCEL_WINDOW_MS) {
            return res.status(400).json({ message: "Cancellation window has passed (20 minutes)" });
        }
        const item = await Item.findById(delivery.item);
        if (item) {
            item.metadata.stock = (item.metadata?.stock ?? 0) + delivery.quantity;
            item.markModified('metadata');
            await item.save();
        }
        delivery.orderStatus = 'cancelled';
        await delivery.save();
        res.json({ message: "Order cancelled successfully" });
    } catch (err) {
        console.error("cancelOrder error", err);
        res.status(500).json({ message: "Error cancelling order" });
    }

};
exports.deleteOrder = async (req, res) => {
    try {
        const buyerId = req.session.user._id;
        const delivery = await Deliver.findById(req.params.deliveryId);
        if (!delivery) return res.status(404).json({ message: "Order not found" });
        if (delivery.buyer.toString() !== buyerId.toString())
            return res.status(403).json({ message: "Unauthorized" });
        const deletable = ['delivered', 'cancelled'];
        if (!deletable.includes(delivery.orderStatus))
            return res.status(400).json({ message: "Can only delete delivered or cancelled orders" });
        await Deliver.findByIdAndDelete(req.params.deliveryId);
        res.json({ message: "Order deleted" });
    } catch (err) {
        res.status(500).json({ message: "Error deleting order" });
    }
};

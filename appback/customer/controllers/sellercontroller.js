const Deliver = require('../../seller/model/deliver');
const mongoose = require('mongoose');

exports.getSellerOrders = async (req, res) => {
    try {
        const sellerId = req.session.user._id;
        const orders = await Deliver.find({ seller: new mongoose.Types.ObjectId(sellerId) })
            .populate('item', 'name price section image')
            .populate('buyer', 'username email')
            .sort({ createdAt: -1 });
        const formatted = orders.map(o => ({
            _id: o._id,
            itemName: o.item?.name || 'Unknown',
            itemPrice: o.item?.price || 0,
            section: o.item?.section || '',
            buyerName: o.buyer?.username || o.name,
            buyerEmail: o.buyer?.email || '',
            address: o.address,
            contactno: o.contactno,
            quantity: o.quantity,
            paymentMethod: o.paymentMethod,
            orderStatus: o.orderStatus,
            createdAt: o.createdAt
        }));
        res.json({ orders: formatted });
    } catch (err) {
        console.error('getSellerOrders error', err);
        res.status(500).json({ message: 'Failed to fetch orders' });
    }
};


exports.updateOrderStatus = async (req, res) => {
    try {
        const sellerId = req.session.user._id;
        const { orderId } = req.params;
        const { orderStatus } = req.body;
        const validStatuses = ['ordered', 'delivered', 'cancelled'];
        if (!validStatuses.includes(orderStatus)) {
            return res.status(400).json({ message: 'Invalid status' });
        }
        const order = await Deliver.findOne({
            _id: orderId,
            seller: new mongoose.Types.ObjectId(sellerId)
        });
        if (!order) return res.status(404).json({ message: 'Order not found' });
        order.orderStatus = orderStatus;
        await order.save();
        res.json({ message: 'Status updated', orderStatus: order.orderStatus });
    } catch (err) {
        console.error('updateOrderStatus error', err);
        res.status(500).json({ message: 'Failed to update status' });
    }
};
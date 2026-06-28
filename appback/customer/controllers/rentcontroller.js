const rented = require('../../seller/model/rented');
const RentOrder = require('../../seller/model/rentOrder');
const mongoose = require('mongoose');
const User = require('../../seller/model/user');
const multer = require('multer');

const storage = multer.memoryStorage();                   
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {                        
    const allowed = ['image/png', 'image/jpg', 'image/jpeg'];
    cb(null, allowed.includes(file.mimetype));
  }
});
exports.upload = upload;                                   

const convertImage = (items) => {
  return items.map(item => ({
    ...item._doc,
    image: item.image
      ? `data:image/jpeg;base64,${Buffer.from(item.image).toString('base64')}`
      : null
  }));
};


exports.putonrent = async (req, res) => {                
  try {
    const newitem = new rented({
      image: req.file.buffer,                             
      name: req.body.name,
      price: req.body.price,
      age: req.body.age,
      description: req.body.description,
      renter: req.session.user._id                        
    });
    await newitem.save();
    res.json({redirect:"/rent"});
  } catch (err) {
    res.status(500).json({message:"Error adding the Item"});
  }
};
exports.getrented = async (req, res) => {
  try {
    const myitem = await rented.find({ orderStatus: 'available' });
    const rentimage = convertImage(myitem);
    res.json({
      myitem: rentimage,
      user: req.session.user  
    });
  } catch (err) {
    res.json({ myitem: [], user: req.session.user });
  }
};




exports.prerentitem = async (req, res) => {
  try {
    const renterId = req.session.user._id;               
    const rentitemId = req.params.itemId;

    const foundItem = await rented.findById(rentitemId);
    const userdetails = await User.findById(renterId);    

    if (!foundItem) return res.status(404).json({message:"Item not found"});
    if (!userdetails) return res.status(422).json({message:"User not found"});

    const itemDetails = convertImage([foundItem])[0];

    res.json({
      Data: userdetails,
      itemDetails,
    });
  } catch (err) {
    res.status(500).json({message:"Cannot fetch item: " });
  }
};


exports.postrentitem = async (req, res) => {
  try {
    const renterId = req.session.user._id;
    const myItem = await rented.find({
      renter: new mongoose.Types.ObjectId(renterId)
    });

    const convertedItems = convertImage(myItem).map(item => ({
      ...item,
      isBooked: item.orderStatus !== 'available'
    }));
    res.json({ myItem: convertedItems });
  } catch (err) {
    res.status(500).json({message:"Error: "});
  }
};


exports.placeOrder = async (req, res) => {
  try {
    const buyerId = req.session.user._id;
    const { itemId, name, address, contactno, paymentMethod, rentEndDate, depositAmount } = req.body;

    const foundItem = await rented.findById(itemId);
    if (!foundItem) return res.status(404).json({message:"Item not found"});

    
    await RentOrder.create({
      item: itemId,
      renter: foundItem.renter,
      buyer: buyerId,
      name,
      address,
      contactno,
      paymentMethod,
      rentEndDate,
      depositAmount: depositAmount || 0
    });

    
    await rented.findByIdAndUpdate(itemId, {
      buyer: buyerId,
      orderStatus: 'booked'
    });

    res.json({redirect:"/confirm"});
  } catch (err) {
    res.status(500).json({message:"Order failed: "});
  }
};

exports.geteditrentitem = async (req, res) => {
  try {
    const item = await rented.findById(req.params.itemId);
    if (!item) return res.status(404).json({message:"Item not found"});

    const itemDetails = convertImage([item])[0];
    res.json({ itemDetails });
  } catch (err) {
    res.status(500).json({message:"Error loading edit form:"});
  }
};

exports.updaterentitem = async (req, res) => {
  try {
    const { name, price, age, description } = req.body;
    const updateData = { name, price, age, description };
    if (req.file) {
      updateData.image = req.file.buffer;
    }
    const updated = await rented.findByIdAndUpdate(req.params.itemId, updateData, { new: true });
    if (!updated) return res.status(404).json({ message: "Item not found" });
    res.json({ redirect: "/seller/rent" });
  } catch (err) {
    console.error("updaterentitem error:", err);
    res.status(500).json({ message: err.message });
  }
};

exports.getBuyerRentOrders=async(req,res)=>{
  try{
    const buyerId=req.session.user._id;
    const orders=await RentOrder.find({buyer:buyerId}).populate('item');
    const result =orders.map(o=>({
       _id:o._id,
       name:o.item?.name,
       price:o.item?.price,
       image:o.item?.image
           ? `data:image/jpeg;base64,${Buffer.from(o.item.image).toString('base64')}`
           :null,
        rentEndDate:o.rentEndDate,
        orderStatus:o.orderStatus,
        createdAt:o.createdAt,
        type:'rent'   
    }));
    res.json({cohort:result});

  }catch(err){
    res.status(500).json({message:"Error fetching the rent orders"});

  }

};
exports.getSellerRentOrders = async (req, res) => {
  try {
    const renterId = req.session.user._id;
    const orders = await RentOrder.find({ renter: renterId })  
      .populate('item')
      .populate('buyer');

    const result = orders.map(o => ({ 
      _id: o._id,
      itemName: o.item?.name,  
      image: o.item?.image
        ? `data:image/jpeg;base64,${Buffer.from(o.item.image).toString('base64')}` 
        : null,
      buyerName: o.buyer?.username,
      buyerEmail: o.buyer?.email,
      name: o.name,
      address: o.address, 
      contactno: o.contactno,
      paymentMethod: o.paymentMethod,
      rentEndDate: o.rentEndDate,
      orderStatus: o.item?.orderStatus,
      type: 'rent'
    }));

    res.json({ cohort: result });
  } catch (err) {
    console.error('getSellerRentOrders error', err);
    res.status(500).json({ message: "Error fetching seller rent orders" });
  }
};

exports.deleterentitem = async (req, res) => {
  try {
    const item = await rented.findById(req.params.itemId);
    if (!item) return res.status(404).json({message:"Item not found"});

    if (item.orderStatus === 'booked') {
      return res.status(400).json({message:"Cannot delete a booked item"});
    }
    await rented.findByIdAndDelete(req.params.itemId);
    res.json({redirect:"/rent"});
  } catch (err) {
    res.status(500).json({message:"Error deleting item:"});
  }
};


exports.cancelRentOrder = async (req, res) => {
    try {
        const buyerId = req.session.user._id;
        const rentOrderId = req.params.rentOrderId;
        const rentOrder = await RentOrder.findById(rentOrderId);
        if (!rentOrder) return res.status(404).json({ message: "Rent order not found" });
        if (rentOrder.buyer.toString() !== buyerId.toString()) {
            return res.status(403).json({ message: "Unauthorized" });
        }
        if (rentOrder.orderStatus !== 'booked') {
            return res.status(400).json({ message: "Rent order cannot be cancelled at this stage" });
        }
        const CANCEL_WINDOW_MS = 20 * 60 * 1000;
        const elapsed = Date.now() - new Date(rentOrder.createdAt).getTime();
        if (elapsed > CANCEL_WINDOW_MS) {
            return res.status(400).json({ message: "Cancellation window has passed (20 minutes)" });
        }
        rentOrder.orderStatus = 'cancelled';
        await rentOrder.save();
        await rented.findByIdAndUpdate(rentOrder.item, { orderStatus: 'available', buyer: null });
        res.json({ message: "Rent order cancelled successfully" });
    } catch (err) {
        console.error("cancelRentOrder error", err);
        res.status(500).json({ message: "Error cancelling rent order" });
    }
};
exports.deleteRentOrder = async (req, res) => {
    try {
        const buyerId = req.session.user._id;
        const order = await RentOrder.findById(req.params.rentOrderId);
        if (!order) return res.status(404).json({ message: "Rent order not found" });
        if (order.buyer.toString() !== buyerId.toString())
            return res.status(403).json({ message: "Unauthorized" });
        const deletable = ['cancelled'];
        if (!deletable.includes(order.orderStatus))
            return res.status(400).json({ message: "Can only delete cancelled rent orders" });
        await RentOrder.findByIdAndDelete(req.params.rentOrderId);
        res.json({ message: "Rent order deleted" });
    } catch (err) {
        res.status(500).json({ message: "Error deleting rent order" });
    }
};
exports.updateRentOrderStatus = async (req, res) => {
    try {
        const renterId = req.session.user._id;
        const { rentOrderId } = req.params;
        const { orderStatus } = req.body;
        const validStatuses = ['booked', 'cancelled'];
        if (!validStatuses.includes(orderStatus))
            return res.status(400).json({ message: 'Invalid status' });
        const order = await RentOrder.findOne({
            _id: rentOrderId,
            renter: renterId
        });
        if (!order) return res.status(404).json({ message: 'Rent order not found' });
        order.orderStatus = orderStatus;
        await order.save();
        if (orderStatus === 'cancelled') {
            await rented.findByIdAndUpdate(order.item, { orderStatus: 'available', buyer: null });
        }
        res.json({ message: 'Status updated', orderStatus: order.orderStatus });
    } catch (err) {
        res.status(500).json({ message: 'Failed to update rent order status' });
    }
};
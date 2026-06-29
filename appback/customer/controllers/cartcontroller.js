const Cart=require('../../../appback/seller/model/cart');
const User=require('../../seller/model/user');
const Item=require('../../../appback/seller/model/item');
exports.addToCart=async(req,res)=>{
    try{
        const itemId=req.params.itemId;
        const userId=req.session.user._id;
        const foundItem=await Item.findById(itemId);
        if(!foundItem){
            return res.status(404).json({message:"Item not found"});
        }
        const existingcartitem=await Cart.findOne({
            user:userId,
            item:itemId
        });
        if(existingcartitem){
            existingcartitem.quantity+=1;
            await existingcartitem.save();
        }else{
            await Cart.create({
                user:userId,
                item:itemId,
                quantity:1
            });
        }
        res.json({redirect:"/cart"});
    }catch(err){
        console.log(err);
        res.status(500).json({message:"Error adding the item"});
    }
};
exports.viewCart = async (req, res) => {
    try {
        const userId = req.session.user._id;
        const cartitems = await Cart.find({ user: userId }).populate("item");

        let total = 0;
        const converted = cartitems.map(c => {
            const cartObj = c.toObject();
            total += cartObj.item.price * cartObj.quantity;

            if (cartObj.item?.image?.data) {
                const buffer = Buffer.from(cartObj.item.image.data);
                cartObj.item.image = `data:image/jpeg;base64,${buffer.toString('base64')}`;
            }
            return cartObj;
        });

        res.json({ cartitems: converted, total });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Error loading the cart" });
    }
};


exports.removeCart=async(req,res)=>{
    try {
        const cartid=req.params.id;
        await Cart.findByIdAndDelete(cartid);
        res.json({redirect:"/cart"});
    }catch(err){
        console.log(err);
        res.status(500).json({message:"Error deleting the item",err});
    }
};


    

const User=require('../../seller/model/user');
const Item=require('../../seller/model/item');
const mongoose=require('mongoose');
exports.postprofile=async(req,res)=>{
    try{
        const userId=req.session.user._id;
        const userdata=await User.findById(userId);
        if(!userdata){
            return res.status(422).json({message:"Error try loggin in"});
        }
        res.json({
            userdata
        });
    }catch(err){
        res.status(500).json({message:"Error occured"});
    }
};
exports.postorder=async(req,res)=>{
    try{
        const cohort=await Item.find({
            buyer: new mongoose.Types.ObjectId(req.session.user._id)
        });
         const convertedItems = cohort.map(item => ({
            ...item._doc,
            _id: item._id.toString(),
            image: item.image
                ? `data:image/png;base64,${Buffer.from(item.image.buffer).toString('base64')}`
                : null
        }));
        res.json({
            cohort:convertedItems
        });

    }catch(err){
        res.json({
            cohort:[]
        });
    }
};
exports.geteditprofile = async (req, res) => {
    try {
        const userdata = await User.findById(req.session.user._id);
        if (!userdata) return res.json({redirect:"/profile"});
        res.json({ userdata });
    } catch (err) {
        res.status(500).json({message:"Error occurred: "});
    }
};


exports.posteditprofile = async (req, res) => {
    try {
        const { name, email, address, contactno } = req.body;
        await User.findByIdAndUpdate(
            req.session.user._id,
            { name, email, address, contactno },
            { new: true, runValidators: true }
        );
        res.json({redirect:"/profile"});         
    } catch (err) {
        res.status(500).json({message:"Error saving changes:"});
    }
};
exports.settings=async(req,res)=>{
    res.json({message:"Settings are still in progress"});
};
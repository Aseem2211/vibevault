const Item = require('../../seller/model/item');

exports.showpage = async (req, res) => {
    try {
        const ItemId = req.params.itemId;
        console.log("ItemId received:", ItemId);
        const founditem = await Item.find({ _id: ItemId });
        if (!founditem || founditem.length === 0) {
            console.log("Item no longer available");
            return res.status(422).json({message:"Item not available"});
        }
        const convertedItems = founditem.map(item => {
            const obj = item.toObject({ virtuals: true });
            return {
                ...obj,
                _id: obj._id.toString(),
                image: item.image
                    ? `data:image/png;base64,${Buffer.from(item.image.buffer).toString('base64')}`
                    : null,
                reviews: (obj.reviews ?? []).map(r => ({
                    ...r,
                    user: r.user?.toString() ?? r.user,
                })),
                averageRatings: obj.averageRating ?? 0,
            };
        });
        res.json({
            founditem: convertedItems
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({message:"Error loading the page"});
    }
};

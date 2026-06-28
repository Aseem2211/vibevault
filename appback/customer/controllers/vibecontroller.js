const Article = require('../../../appback/seller/model/item');

const convertImages = (items) => {
    return items.map(item => {
        const obj = item.toObject({ virtuals: true });
        return {
            ...obj,
            _id: obj._id.toString(),
            image: item.image
                ? `data:image/jpeg;base64,${item.image.toString('base64')}`
                : null,
            metadata: obj.metadata ?? {},
            reviews: (obj.reviews ?? []).map(r=>({
                ...r,
                user:r.user?.toString()??r.user,
            })),
            averageRatings: obj.averageRating ?? 0,
        };
    });
};

const fetchBySection = (section) => async (req, res) => {
    try {
        const piece = await Article.find({ section });
        const items = convertImages(piece);
        res.json({ success: true, articles: items });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.fetching        = fetchBySection('appliance');
exports.fetchbooks      = fetchBySection('book');
exports.fetchfurniture  = fetchBySection('furniture');
exports.fetchsnacks     = fetchBySection('snacks');
exports.fetchstationary = fetchBySection('stationary');
exports.fetchclothes    = fetchBySection('clothes');

exports.getEditItem = async (req, res) => {
    try {
        const item = await Article.findById(req.params.id).lean();
        if (!item) return res.status(404).json({ success: false, message: 'Item not found' });
        if (item.image) {
            item.image = `data:image/jpeg;base64,${item.image.toString('base64')}`;
        }
        res.json({ success: true, item });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.posteditItem = async (req, res) => {
    try {
        const updateData = {
            name: req.body.name,
            price: req.body.price,
            age: req.body.age,
            description: req.body.description,
            section: req.body.section,
            metadata: req.body.metadata ? JSON.parse(req.body.metadata) : undefined,
        };
        if (req.file) updateData.image = req.file.buffer;
        await Article.findByIdAndUpdate(req.params.id, updateData);
        res.json({ success: true, message: 'Item updated successfully' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.deleteItem = async (req, res) => {
    try {
        await Article.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'Item deleted successfully' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.addReview = async (req, res) => {
    try {
        const { rating, comment } = req.body;
        const userId = req.user._id;
        const item = await Article.findById(req.params.id);
        if (!item) return res.status(404).json({ success: false, message: 'Item not found' });
        const alreadyReviewed = item.reviews.find(
            (r) => r.user.toString() === userId.toString()
        );
        if (alreadyReviewed) {
            return res.status(400).json({ success: false, message: 'You already reviewed this item' });
        }
        item.reviews.push({ user: userId, rating: Number(rating), comment });
        await item.save();
        const newReview = item.reviews[item.reviews.length - 1];
        res.json({ success: true, message: 'Review added', averageRating: item.averageRating, review: newReview });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.deleteReview = async (req, res) => {
    try {
        const { id, reviewId } = req.params;
        const userId = req.user._id;
        const isAdmin = req.user.role === 'admin';
        const item = await Article.findById(id);
        if (!item) return res.status(404).json({ success: false, message: 'Item not found' });
        const review = item.reviews.id(reviewId);
        if (!review) return res.status(404).json({ success: false, message: 'Review not found' });
        if (!isAdmin && review.user.toString() !== userId.toString()) {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }
        review.deleteOne();
        await item.save();
        res.json({ success: true, message: 'Review deleted', averageRating: item.averageRating });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.decreaseStock = async (req, res) => {
    try {
        const { quantity } = req.body;
        const item = await Article.findById(req.params.id);
        if (!item) {
            return res.status(404).json({ success: false, message: 'Item not found' });
        }
        const currentStock = item.metadata?.stock ?? 0;
        if (quantity > currentStock) {
            return res.status(400).json({ success: false, message: 'Not enough stock' });
        }
        item.metadata.stock = currentStock - quantity;
        item.markModified('metadata');
        await item.save();
        res.json({ success: true, message: 'Stock updated', remaining: item.metadata.stock });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

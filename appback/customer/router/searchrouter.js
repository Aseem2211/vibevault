// routes/searchrouter.js
const express = require('express');
const searchrouter = express.Router();
const Item = require('../../seller/model/item');
console.log("Item model loaded:",!!Item);
const convertImage = (items) =>
  items.map(item => ({
    ...item._doc,
    image: item.image
      ? `data:image/png;base64,${Buffer.from(item.image.buffer).toString('base64')}`
      : null
  }));
searchrouter.get('/search', async (req, res) => {
  try {
    const {
      q = '',
      section,
      minPrice,
      maxPrice,
      age,
      sort = 'newest',
      page = 1,
      limit = 12
    } = req.query;

    console.log("Query params:", req.query); // debug
    const filter = {};
    if (q && q.trim()) {
      let regex;
      try {
        regex = new RegExp(q.trim(), 'i');
      } catch(e) {
        regex = new RegExp(q.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      }
      filter.$or = [
        { name: regex },
        { description: regex },
        { section: regex }
      ];
    }
    if (section && section !== 'all') filter.section = section;
    if (age && age !== 'all') filter.age = age;
    if (minPrice && !isNaN(minPrice)) filter.price = { ...filter.price, $gte: Number(minPrice) };
    if (maxPrice && !isNaN(maxPrice)) filter.price = { ...filter.price, $lte: Number(maxPrice) };
    const sortMap = {
      newest:   { createdAt: -1 },
      oldest:   { createdAt:  1 },
      priceasc: { price:  1 },
      pricedesc:{ price: -1 },
    };
    const skip = (Number(page) - 1) * Number(limit);
    const [total, items, sections] = await Promise.all([
      Item.countDocuments(filter),
      Item.find(filter)
        .sort(sortMap[sort] || sortMap.newest)
        .skip(skip)
        .limit(Number(limit)),
      Item.distinct('section')
    ]);
    res.json({
      items: convertImage(items),
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      sections
    });
  } catch (err) {
    console.error("Search error message:", err.message);
    console.error("Search error stack:", err.stack);
    res.status(500).json({ message: 'Search failed', error: err.message });
  }
});

module.exports = searchrouter;
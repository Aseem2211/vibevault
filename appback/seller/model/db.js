const mongoose = require('mongoose');

const itemsdata = mongoose.createConnection(process.env.MONGO_URI);
  

itemsdata.on('connected', () => console.log('Connected to database items'));
module.exports = itemsdata;
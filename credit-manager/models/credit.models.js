const mongoose = require('mongoose');

const creditSchema = mongoose.Schema({
    _id: String,
    count: Number
});


module.exports = mongoose.model('Credit', creditSchema);

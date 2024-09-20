const mongoose = require('mongoose');

const solverSchema = mongoose.Schema({
    _id: String,
    solverID: String,
    metadata: Object
});


module.exports = mongoose.model('Solver', solverSchema);
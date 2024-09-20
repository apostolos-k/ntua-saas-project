const mongoose = require('mongoose');

const locationsSchema = mongoose.Schema({
    _id: String,
    submissionID: String,
    locations: String,

});

module.exports = mongoose.model('Locations', locationsSchema);
const mongoose = require('mongoose');

const submissionSchema = mongoose.Schema({
    _id: String,
    solverID: String,
    credits: Number,
    creator: String,
    date: Date,
    metadata: Object,
    status:  {'type':String, 'enum': ['Balance Insufficient','Received', 'Pending', 'Finished'] },
    results: String
});

module.exports = mongoose.model('Submission', submissionSchema);
const express = require("express");
const Submission = require('../models/submission.models'); // Make sure to adjust the path as needed

const router = express.Router();


// Create the multer instance with the storage configuration
router.get("/", async (req, res, next) => {
    const submissionID = req.query.submissionID;


    try {

        var submission = await Submission.findById(submissionID)
        var submissionToSend= {}
        submissionToSend._id = submission._id
        submissionToSend.solverID = submission.solverID
        delete submission.metadata.locations
        submissionToSend.creator = submission.creator
        submissionToSend.credits = submission.credits
        submissionToSend.metadata = submission.metadata
        submissionToSend.status = submission.status
        submissionToSend.date = submission.date
        submissionToSend.results = submission.results



        //_id: String, solverID: String,metadata: Array,  locations: SEND FILE, state:  {'type':String, 'enum': ['Received', 'Pending', 'Finished'] },   date: Date,  results: String
        // Respond with the other backend's response
        res.status(200).json(submissionToSend);
    } catch (err) {
        next(err);
    }
});

module.exports = router;
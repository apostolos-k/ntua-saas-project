const express = require("express");
const router = express.Router();
const Submission = require('../models/submission.models'); // Make sure to adjust the path as needed


router.post("/", async (req, res, next) => {
    const submissionId = req.body.submissionID;


    try {
        const result = await Submission.findByIdAndDelete(submissionId).exec()
        res.status(200).json({
            "message": "Submission with ID: " + result._id + " deleted successfully"
        });
    } catch (err) {
        res.status(200).json({
            "message": "Submission with ID: " + submissionId + " not found"
        });
    }
});

module.exports = router;

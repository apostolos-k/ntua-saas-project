const express = require("express");
const router = express.Router();
const Submission = require('../models/submission.models'); // Make sure to adjust the path as needed

router.get("/", async (req, res, next) => {

    try {
        const submissions = await Submission.find();
        submissionsFormated = [] 
        for (submission in submissions){
            sub = {}
            sub.id = submissions[submission]._id
            sub.creator = submissions[submission].creator
            sub.name = submissions[submission].name
            sub.date = submissions[submission].date

            sub.solverID = submissions[submission].solverID
            sub.status = submissions[submission].status
            submissionsFormated.push(sub)
        }
        if (submissionsFormated) {
            res.status(200).json(submissionsFormated);
        } else {
            res.status(404).json({ message: 'Submissions not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
    // id, creator, name, date, status

});

module.exports = router;

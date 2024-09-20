const express = require("express");
const router = express.Router();
const multer = require("multer");
const fs = require("fs");
const axios = require("axios");
const FormData = require("form-data");
const Submission = require('../models/submission.models'); // Make sure to adjust the path as needed
const Solver = require('../models/solver.models');
const Credit = require('../models/credit.models'); // Make sure to adjust the path as needed
const ortoolsUrl = process.env.OR_TOOLS_URL || 'http://localhost:9500';

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './uploads');
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    }
});

// Create the multer instance with the storage configuration
const upload = multer({ storage: storage });

router.post("/", upload.single("file"), async (req, res, next) => {
    const submissionId = req.body.submissionID;
    const parameters = { ...req.body };
    delete parameters.submissionID;

    try {
        const submission = await Submission.findById(submissionId);
        if (!submission) {
            return res.status(404).json({ error: "Submission not found" });
        }

        const solver = await Solver.findOne({ solverID: submission.solverID });
        if (!solver) {
            return res.status(404).json({ error: "Solver not found" });
        }
        if (parameters.name) {
            var subName = parameters.name
        } else {
            var subName = submission.name
        }
        let newParams = {};
        let estimatedCredits = 20;

        for (const key in solver.metadata) {
            if (solver.metadata[key] === 'File') {
                const file = req.file;
                if (!file) {
                    const metadataValue = submission.metadata[key];
                    newParams[key] = metadataValue;
                    const tempFilePath = `./uploads/${submissionId}_${key}.json`;
                    fs.writeFileSync(tempFilePath, metadataValue.toString(), 'utf8');
                    estimatedCredits = Math.floor(metadataValue.length / 100);

                } else {
                    const fileString = fs.readFileSync(file.path, 'utf8');
                    newParams[key] = fileString;
                    estimatedCredits = Math.floor(fileString.length / 100);
                }
            } else {
                newParams[key] = parameters[key];
            }
        }

        const editedSubmission = await Submission.findByIdAndUpdate(submissionId, {
            name: subName,
            metadata: newParams,
            status: 'Received',
            results: ""
        }, { new: true });

        const creditID = "default";
        const credit = await Credit.findById(creditID);

        if (estimatedCredits > credit.count) {
            editedSubmission.status = 'Balance Insufficient';
            await editedSubmission.save();

            return res.status(200).json({
                balanceOK: "False",
                creditEstimation: estimatedCredits,
                submissionID: editedSubmission._id,
            });
            return;

        } else {
            editedSubmission.status = "Pending";
            editedSubmission.credits = editedSubmission.credits + estimatedCredits
            await editedSubmission.save();
            const updatedCredit = await Credit.findByIdAndUpdate(creditID, {
                count: credit.count - estimatedCredits
            });
            res.status(200).json({
                balanceOK: "True",
                creditEstimation: estimatedCredits,
                submissionID: editedSubmission._id,
            });

            const form = new FormData();
            for (const key in parameters) {
                form.append(key, parameters[key]);
            }
            form.append("submissionID", editedSubmission._id);

            if (req.file) {
                form.append("file", fs.createReadStream(req.file.path), req.file.originalname);
            } else {
                const key = Object.keys(solver.metadata).find(key => solver.metadata[key] === 'File');
                const tempFilePath = `./uploads/${submissionId}_${key}.json`
                form.append("file", fs.createReadStream(tempFilePath), tempFilePath);
            }
            form.append("solverID", submission.solverID);

            // Send the request to the other backend
            await axios.post(`${ortoolsUrl}/new_submission`, form, {
                headers: {
                    ...form.getHeaders()
                }
            }).catch(function (error) {
                if (error.response) {
                  // The request was made and the server responded with a status code
                  // that falls out of the range of 2xx
                  console.log(error.response.data);
                } else if (error.request) {
                  // The request was made but no response was received
                  // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
                  // http.ClientRequest in node.js
                  console.log(error.request);
                } else {
                  // Something happened in setting up the request that triggered an Error
                  console.log('Error', error.message);
                }
                console.log(error.config);
              });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal server error" });
    }
});

module.exports = router;

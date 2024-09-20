const express = require("express");
const multer = require("multer");
const fs = require("fs");
const axios = require("axios");
const FormData = require("form-data");
const router = express.Router();
const shortid = require('shortid');


const Credit = require('../models/credit.models'); // Make sure to adjust the path as needed
const Submission = require('../models/submission.models'); // Make sure to adjust the path as needed
const Solver = require('../models/solver.models'); // Make sure to adjust the path as needed
const ortoolsUrl = process.env.OR_TOOLS_URL || 'http://localhost:9500';

router.use((req, res, next) => {
    req.submissionID = shortid.generate();
    next();
});
// Define storage configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './uploads');
    },
    filename: (req, file, cb) => {
        const submissionID = req.submissionID;
        const newFilename = `${submissionID}-${file.originalname}`;

        cb(null, newFilename);
    }
});


// Create the multer instance with the storage configuration
const upload = multer({ storage: storage });
router.post("/", upload.single("file"), async (req, res, next) => {
        const parameters = Object(req.body)
        if (!parameters.solverID) {
            res.status(404).json({
                message: "SolverID not found in the parameters given ",
            });
            return
        }

        try {
            submissionSolver = await Solver.findOne({ solverID: parameters.solverID })
            for (let key in submissionSolver.metadata) {
                if (submissionSolver.metadata[key] == 'File') {
                    if (!req.file) {
                        res.status(404).json({
                            message: `File not found in the parameters given `,
                        });
                        return
                    }
                    var file = req.file;
                    const fileString = fs.readFileSync(file.path, 'utf8')
                    parameters[key.toString()] = fileString
                    var estimatedCredits = Math.floor(fileString.length / 100)
                }
            }
            for (let key in submissionSolver.metadata) {
                if (!(Object.keys(parameters).includes(key.toString()))) {
                    res.status(404).json({
                        message: `${key} not found in the parameters given `,
                    });
                    return
                }
            }
        } catch (error) {
            next(error)
        }

        const solverID = parameters.solverID
        delete parameters.solverID; // Remove solverID from parameters
        const submissionID = req.submissionID; // Use the generated submissionID

        try {
            // let nz_date_string = new Date().toLocaleString("el-GR", { timeZone: "Europe/Athens" });
            let utcdate = new Date()
            let offset = utcdate.getTimezoneOffset()
            let time = utcdate.getMinutes()
            let date = utcdate.setMinutes(time - offset)
            var newSubmission = await new Submission({
                _id: submissionID,
                solverID: solverID,
                credits: 0,
                creator: "Guest",
                date: date,
                metadata: parameters,
                status: 'Received',
                results: ""
            })
            await newSubmission.save();

            const creditID = "default";
            const credit = await Credit.findOne({ _id: creditID });

            if (estimatedCredits > credit.count) {
                newSubmission.status = 'Balance Insufficient'
                await newSubmission.save()

                res.status(200).json({
                    "balanceOK": "False",
                    "creditEstimation": estimatedCredits,
                    "submissionID": newSubmission._id,
                });

            } else {
                credit.count = credit.count - estimatedCredits
                credit.save()
                newSubmission.status = "Pending"
                newSubmission.credits = estimatedCredits

                await newSubmission.save();

                res.status(200).json({
                    "balanceOK": "True",
                    "creditEstimation": estimatedCredits,
                    "submissionID": newSubmission._id
                });

                const form = new FormData();
                form.append("solverID", newSubmission.solverID);
                for (key in parameters) {
                    form.append(key, parameters[key]);

                }
                form.append("submissionID", newSubmission._id);
                var newfile = fs.createReadStream(file.path)
                await form.append("file", newfile, file.originalname);


                // Send the request to the other backend

                const response = axios.post(`${ortoolsUrl}/new_submission`, form, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                }).catch(function (error) {
                    if (error.response) {
                        // The request was made and the server responded with a status code
                        // that falls out of the range of 2xx
                        console.log(error.response.data);
                        console.log(error.response.status);
                        console.log(error.response.headers);
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
            console.log(error)
        }
    });

module.exports = router;

const express = require("express");
const { default: mongoose } = require("mongoose");
const shortid = require('shortid');
const multer = require("multer");
const fs = require("fs");
const router = express.Router();
const Solver = require('../models/solver.models'); // Make sure to adjust the path as needed


router.get('/getall', async (req, res) => {
    try {
        const solvers = await Solver.find();
        if (solvers) {
            res.status(200).json(solvers);
        } else {
            res.status(404).json({ message: 'Solver not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});
router.get('/', async (req, res) => {
    const solverID = req.query.solverID;
    try {
        const solver = await Solver.findOne({ solverID: solverID });

        if (solver) {
            res.status(200).json(solver);
        } else {
            res.status(404).json({ message: 'Solver not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});
// Define storage configuration

router.get('/file', async (req, res) => {
    const solverID = req.query.solverID;
    try {
        const solver = await Solver.findOne({ solverID: solverID });
        if (solver) {
            res.status(200).download("./solvers/" + solverID + ".py");
        } else {
            res.status(404).json({ message: 'Solver not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './solvers');
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    }
});
const upload = multer({ storage: storage });

router.post('/', upload.single("file"), async (req, res, next) => {
    const solverID = req.body.solverID;
    const parameters = Object(req.body)
    delete parameters.solverID; // Remove solverID from parameters

    const existingSolver = await Solver.findOne({ solverID: solverID });
    try {
        if (!existingSolver) {
            const newSolver = new Solver({
                _id: shortid.generate(),
                solverID: solverID,
                metadata: parameters,
            });
            await newSolver.save();
            res.status(200).json({
                status: "success",
                message: "Solver saved successfully"
            });
        } else {
            res.status(200).json({
                message: "Solver name is already in use"
            });
        }
    }
    catch (error) {
        next(error)
    }

});

module.exports = router;
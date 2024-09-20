const express = require("express");
const { default: mongoose } = require("mongoose");
const router = express.Router();
const Credit = require('../models/credit.models'); // Make sure to adjust the path as needed

router.get('/', async (req, res) => {
    try {
        const _id = "default";
        const credit = await Credit.findOne({ _id: _id });
        if (credit) {
            res.status(200).json(credit);
        } else {
            res.status(404).json({ message: 'Credit not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});
// check for negative value
router.post('/', async (req, res) => {
    const _id = "default";
    const count = req.body.count;
    if (count < 0) {
        res.status(200).json({ message: "Credit count cannot be a negative number" });
    } else {
        try {

            const credit = await Credit.findOneAndUpdate(
                { _id: _id },
                { count: count },
                { returnOriginal: false }).exec()

            res.status(200).json({ message: "success" });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
});

module.exports = router;
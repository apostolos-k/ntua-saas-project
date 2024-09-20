const express = require("express");
const { default: mongoose } = require("mongoose");
const router = express.Router();

const server = require('../server');
// API call for testing the connection with the database

router.get("/", (req, res, next) => {
    var state = mongoose.connection.readyState
    if (state) {
        res.status(200).json({
            status: "OK",
            message: "Database connected and ready to use."
        })
    } else {
        res.status(500).json({
            status: "Failed", 
            message: "There seems to be a problem with the database at this moment."
        })}

});// 200: success


module.exports = router;
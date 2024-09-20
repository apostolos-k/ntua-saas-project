const cors = require("cors");
const bodyParser = require('body-parser');
const express = require('express');
const morgan = require('morgan');


const creditRoutes = require('./routes/credit.routes');


const app = express();
app.use(cors())
// Logger
app.use(morgan('dev'));

// Parser
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Routes that handle requests
app.use('/credit', creditRoutes);

app.use((req, res, next) => {
    const error = new Error('Not found!');
    error.status = 404;
    next(error);
});

// handles error from everywhere in the application, also from above.
// i.e. when DB is added
app.use((error, req, res, next) => {
    res.status(error.status || 500);
    res.json({
        success: false,
        message: error.message

    });
});

module.exports = app;
const colors = require('colors/safe');
require('dotenv').config();

const app = require('./app');
const db = require('./db');
const Credit = require('./models/credit.models'); // Make sure to adjust the path as needed

// fancy log
colors.enable();
const fancyLog = (x) => { console.log(colors.cyan.underline(`[submissions-results] ${x}`)); }

// runtime
const host = process.env.APP_HOST || "localhost";
const port = process.env.APP_PORT || 5500;
const mongoUrl = process.env.MONGO_URL || 'mongodb://localhost:27017';
//run
const spinServer = async () => {
    try {
        fancyLog(await db.connect(`${mongoUrl}/saas`));
        app.listen(port, () =>
            fancyLog(`Running on http://${host}:${port}/...`)
        );
    } catch (error) {
        console.error(error);
    }
};

spinServer();
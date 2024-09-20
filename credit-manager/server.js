const colors = require('colors/safe');
require('dotenv').config();

const app = require('./app');
const db = require('./db');
const Credit = require('./models/credit.models'); // Make sure to adjust the path as needed

// Enable colors for console logs
colors.enable();
const fancyLog = (x) => { console.log(colors.cyan.underline(`[credit-manager] ${x}`)); }

// Runtime configuration
const host = process.env.APP_HOST || "localhost";
const port = process.env.APP_PORT || 7500;
const mongoUrl = process.env.MONGO_URL || 'mongodb://localhost:27017';

// Function to initialize credit for a user
const initializeCredit = async () => {
    try {
        const _id = "default"; // Replace with the actual user ID
        const initialCount = 100; // Initial credit value

        const existingCredit = await Credit.findOne({ _id: _id });
        if (!existingCredit) {
            const newCredit = new Credit({
                _id: _id,
                count: initialCount,
            });

            await newCredit.save();
            fancyLog(`Credit initialized for user ${_id}: ${newCredit}`);
        } else {
            fancyLog(`Credit already exists for user ${_id}`);
        }
    } catch (error) {
        console.error('Error initializing credit:', error);
    }
}

// Function to spin up the server
const spinServer = async () => {
    try {
        fancyLog(await db.connect(`${mongoUrl}/saas`));
        await initializeCredit();
        app.listen(port, () => fancyLog(`Running on http://${host}:${port}/...`));
    } catch (error) {
        console.error('Error starting server:', error);
    }
};

spinServer();

const colors = require('colors/safe');
require('dotenv').config();
const shortid = require('shortid');

const app = require('./app');
const db = require('./db');
const Credit = require('./models/credit.models'); // Make sure to adjust the path as needed
const Solver = require('./models/solver.models'); // Make sure to adjust the path as needed

// Enable colors for console logs
colors.enable();
const fancyLog = (x) => { console.log(colors.cyan.underline(`[solver-manager] ${x}`)); }

// Runtime configuration
const host = process.env.APP_HOST || "localhost";
const port = process.env.APP_PORT || 8500;
const mongoUrl = process.env.MONGO_URL || 'mongodb://localhost:27017';


const initializeSolver = async () => {
    try {

        const existingSolver = await Solver.findOne();
        if (!existingSolver) {
            const newSolver = new Solver({
                _id: shortid.generate(),
                solverID: "vrpSolver",
                metadata:
                {
                    locations: 'File',
                    num_vehicles: 'Integer',
                    depot: 'Integer',
                    max_distance: 'Integer'
                }
            });
            await newSolver.save();
            fancyLog(`vrpSolver saved `);
        } else {
            fancyLog(`Solver already exists`);
        }
    } catch (error) {
        console.error('Error initializing solver:', error);
    }
}
// Function to spin up the server
const spinServer = async () => {
    try {
        fancyLog(await db.connect(`${mongoUrl}/saas`));
        await initializeSolver();
        app.listen(port, () => fancyLog(`Running on http://${host}:${port}/...`));
    } catch (error) {
        console.error('Error starting server:', error);
    }
};

spinServer();

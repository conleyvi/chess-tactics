const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path'); 

// Require the utils.js file
const { selectSet } = require('./assets/db');

const app = express();
const port = 80;

// Middleware to parse JSON request body
app.use(bodyParser.json());

// Endpoint to handle POST requests to /finishPuzzle
app.post('/app/finishPuzzle', (req, res) => {
    const puzzleData = req.body;
    console.log('Received puzzle data:', puzzleData);
    // Add your processing logic here
    // For demonstration, just sending back a response
    res.json({ message: 'Puzzle finished successfully', data: puzzleData });

    selectSet(puzzleData.pgn);
});

// Serve static files from the root directory
app.use(express.static(path.join(__dirname)));

// Serve static files from the 'assets' directory
app.use(express.static(path.join(__dirname, 'assets')));

// Serve static files from the 'img' directory
app.use(express.static(path.join(__dirname, 'img')));

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
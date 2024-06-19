const express = require('express');
const compression = require('compression');
const path = require('path'); 

// Require the utils.js file
const { selectSet, update } = require('./assets/db');

const app = express();
const port = 80;

// Middleware to handle gzip compression
app.use(compression());

// Handle up to 50 megabytes of JSON
app.use(express.json({limit: '50mb'}));

// Endpoint to handle POST requests to /finishPuzzle
app.post('/app/finishPuzzle', (req, res) => {
    const puzzleData = req.body;

    console.log('Received puzzle data:', puzzleData);
    // Add your processing logic here
    // For demonstration, just sending back a response
    res.json({ message: 'Puzzle finished successfully', data: puzzleData });

});

// Endpoint to handle POST requests to /selectSet
app.post('/app/selectSet', (req, res) => {
    const puzzleData = req.body;
    console.log('Received puzzle data:', puzzleData);
    // Calculate the size of the request body in bytes
    const contentLength = parseInt(req.get('Content-Length'), 10);
    console.log(`Received ${contentLength} bytes of data`);
    let result = selectSet(puzzleData.fileName, puzzleData.games);
    res.json({ message: 'Puzzle finished successfully', data: result });

    //selectSet(puzzleData.pgn);
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
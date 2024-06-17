const fs = require('fs');
const Papa = require('papaparse');

function getFileContents(filePath) {
    try {
        // Synchronously read the contents of the file
        const fileContents = fs.readFileSync(filePath, 'utf8');
        return fileContents;
    } catch (error) {
        // If an error occurs (e.g., file not found), return an empty string
        console.error(`Error reading file: ${error.message}`);
        return '';
    }
}

function removeFileExtension(filename) {
    // Find the last occurrence of '.'
    const lastDotIndex = filename.lastIndexOf('.');
    
    // If '.' is found and it's not the first character
    if (lastDotIndex !== -1 && lastDotIndex > 0) {
        return filename.substring(0, lastDotIndex);
    } else {
        return filename; // No '.' found or it's at the beginning, return the original filename
    }
}

/**
 * 
 * Use a bunch of CSV files to simulate a DB where we can store puzzle progress and stats.
 */

// One CSV per PGN that stores overall stats and progress
// One CSV per PGN+attempt that stores results for each individual puzzle
// If you have 8 attempts at 1 PGN you'll end up with 9 total CSV files

function selectSet(pgnFileName)
{
    console.log(`Selecting set ${pgnFileName}`);

    // Check if we've already created a table for this PGN
    var csvFileName = 'csv/' + removeFileExtension(pgnFileName) + '.csv';
    var contents = getFileContents(csvFileName);
    
    // If we don't have a file for this set, create it
    if(contents == '') {

        // Initial file will only have headers
        contents = 'total,completed';
        fs.writeFileSync(csvFileName, contents);
    }

    // First, parse CSV
    var csv = Papa.parse(contents, {
        header: true,
        dynamicTyping: true
    });
    console.log(JSON.stringify(csv.data));
    console.log(JSON.stringify(csv.meta));
    console.log(csv.data.length);

    // If we don't have a set in progress, start one
    if(csv.data.length == 0 || csv.data[csv.data.length -1 ].completed ==  csv.data[csv.data.length -1 ].total) {
        startSet(pgnFileName, csv, csv.data.length + 1);
    }

}

/**
 * 
 * Create a CSV for this set; each line represents a different puzzle
 * 
 * @param {*} pgnFileName 
 * @param {*} csv 
 * @param {*} count 
 */
function startSet(pgnFileName, csv, count) {
    console.log(`Starting set ${count} for ${pgnFileName}`);
}

/**
 * 
 * @param {*} puzzle Map of the puzzle we want to turn into a line in the CSV
 * @param {*} callback 
 */
function update(puzzle, callback)
{
    // Write the updated CSV for the current set

    // Compute stats and update the set table

    // Use the callback to (possibly) update the UI


}

// Export the function so it can be imported in other modules
module.exports = { selectSet };

getFileContents("csv/blank.csv");
getFileContents("csv/blank2.csv");
selectSet('polgar-mate-in-one.pgn');

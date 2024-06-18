const FS = require('fs');
const Papa = require('papaparse');
const PgnParser = require('pgn-parser');

function getFileContents(filePath) {
    try {
        // Synchronously read the contents of the file
        const fileContents = FS.readFileSync(filePath, 'utf8');
        return fileContents;
    } catch (error) {
        // If an error occurs (e.g., file not found), return an empty string
        console.error(`Error reading file: ${error.message}`);
        return '';
    }
}

function extractFileName(path) {
    // Using regular expression to match file name from path
    // This handles both Unix-like and Windows paths
    let match = path.match(/(?:\/|\\)?([^\/\\]+)$/);
    if (match) {
        return match[1]; // return the matched file name
    } else {
        return ""; // return empty string if no match (though this case shouldn't normally happen)
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

function shuffleArray(n) {
    // Create an array with values from 1 to n
    let arr = [];
    for (let i = 1; i <= n; i++) {
        arr.push(i);
    }

    // Perform Fisher-Yates shuffle
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }

    return arr;
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
    var csvFileName = 'csv/' + removeFileExtension(extractFileName(pgnFileName)) + '.csv';
    var contents = getFileContents(csvFileName);
    
    // If we don't have a file for this set, create it
    if(contents == '') {

        // Initial file will only have headers
        contents = 'total,completed';
        FS.writeFileSync(csvFileName, contents);
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
        let gameCount = startSet(pgnFileName, undefined, csv, csv.data.length + 1);
        console.log(`Started set with ${gameCount} games`);
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
function startSet(pgnFileName, games, csv, count) {
    var headers = 'index,random_index,theme,is_complete,is_correct,is_error,is_timeout,time_taken';

    if(games === undefined) {

        // Parse the PGN
        var PGNData = getFileContents(pgnFileName);
        const splitGames = (string) => PgnParser.parse(PGNData);
        games = splitGames(PGNData);
    }

    console.log(`Starting set ${count} for ${games.length} games in ${pgnFileName}`);
    let shuffled = shuffleArray(games.length);

    var set_csv = '' + headers + '\n';

    var template = `{index},{random_index},{theme},0,0,0,0,0\n`;
    for (let index = 0; index < shuffled.length; index++) {
        console.log(shuffled[index]);
        var game = games[shuffled[index]-1];
        console.log(JSON.stringify(game));
        set_csv += template.replace('{index}', index + 1).replace('{random_index}', shuffled[index]).replace('{theme}', 'tactics')
    }

    console.log(set_csv);
    var csvFileName = 'csv/' + removeFileExtension(extractFileName(pgnFileName)) + '-' + count + '.csv';
    FS.writeFileSync(csvFileName, set_csv);

    return games.length;
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
selectSet('/Users/kevinconnelly/Downloads/polgar-mate-in-one.pgn');

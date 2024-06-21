const { setServers } = require('dns');
const FS = require('fs');
const Papa = require('papaparse');
const PgnParser = require('pgn-parser');
const seedrandom = require('seedrandom');
const stringHash = require('string-hash');

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

function shuffleArray(arr, seed) {
    console.log(`Creating RNG with seed ${seed}`);
    const rng = seedrandom(seed);
    // Perform Fisher-Yates shuffle
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(rng() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }

    return arr;
}

/**
 * 
 * Use a bunch of CSV files to simulate a DB where we can store puzzle progress and stats.
 * 
 * One CSV per PGN that stores overall stats and progress
 * One CSV per PGN+attempt that stores results for each individual puzzle
 * If you have 8 attempts at 1 PGN you'll end up with 9 total CSV files
 */
function select(pgnFileName) {
    console.log(`Selecting set ${pgnFileName}`);

    // Check if we've already created a table for this PGN
    var contents = getFileContents(csvFileName(pgnFileName));

    const output = {};
    output.finished = 0;

    // If we don't have a file for this set, create it
    if (contents == '') {

        // Initial file will only have headers
        contents = 'set,total,finished';
        FS.writeFileSync(csvFileName(pgnFileName), contents);
        return output;
    }

    // Parse CSV
    var csv = Papa.parse(contents, {
        header: true,
        dynamicTyping: true
    });
    //console.log(JSON.stringify(csv.data));
    //console.log(JSON.stringify(csv.meta));
    //console.log(csv.data.length);

    if (csv.data.length == 0 || csv.data[csv.data.length - 1].finished == csv.data[csv.data.length - 1].total) {
        return output;
    }
    output.finished = csv.data[csv.data.length - 1].finished;
    return output;
}

function start(pgnFileName, games) {
    console.log(`Starting set ${pgnFileName}`);

    // Check if we've already created a table for this PGN
    var contents = getFileContents(csvFileName(pgnFileName));

    // If we don't have a file for this set, create it
    if (contents == '') {

        // Initial file will only have headers
        contents = 'set,total,finished';
        FS.writeFileSync(csvFileName(pgnFileName), contents);
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
    if (csv.data.length == 0 || csv.data[csv.data.length - 1].finished == csv.data[csv.data.length - 1].total) {
        let setNumber = csv.data.length + 1;

        if (games == undefined) {
            // Parse the PGN
            var PGNData = getFileContents(pgnFileName);
            const splitGames = (string) => PgnParser.parse(PGNData);
            games = splitGames(PGNData);
        }

        let gameCount = startSet(pgnFileName, games, csv, setNumber, true);
        console.log(`Started set ${setNumber} with ${gameCount} games`);
        let template = `\n{set},{total},0`;
        contents += template.replace('{set}', setNumber).replace('{total}', gameCount);
        FS.writeFileSync(csvFileName, contents);

        csv = Papa.parse(contents, {
            header: true,
            dynamicTyping: true
        });
        console.log(JSON.stringify(csv.data));
        console.log(JSON.stringify(csv.meta));
        console.log(csv.data.length);
    }

    // Need to return the set number, finished count, and ordering
    var ordering = extractOrdering(pgnFileName, csv.data[csv.data.length - 1].set);

    const result = {};
    result.set = csv.data[csv.data.length - 1].set;
    result.total = csv.data[csv.data.length - 1].total;
    result.finished = csv.data[csv.data.length - 1].finished;
    result.ordering = ordering;
    return result;
}

/**
 * 
 * Create a CSV for this set; each line represents a different puzzle
 * 
 * @param {*} pgnFileName 
 * @param {*} csv 
 * @param {*} count 
 */
function startSet(pgnFileName, games, csv, count, randomize) {
    var headers = 'index,random_index,theme,is_complete,is_correct,is_error,is_timeout,time_taken';

    console.log(`Starting set ${count} for ${games.length} games in ${pgnFileName}`);

    // Create an array with values from 1 to n
    let shuffled = [];
    for (let i = 1; i <= games.length; i++) {
        shuffled.push(i);
    }

    if (randomize) {
        shuffleArray(shuffled, stringHash(pgnFileName) * 37 + count);
    }

    var set_csv = '' + headers;

    let template = `\n{index},{random_index},'{theme}',0,0,0,0,0`;
    for (let index = 0; index < shuffled.length; index++) {
        console.log(shuffled[index]);
        var game = games[shuffled[index] - 1];
        console.log(JSON.stringify(game));
        set_csv += template.replace('{index}', index + 1).replace('{random_index}', shuffled[index]).replace('{theme}', 'basic tactics')
    }

    console.log(set_csv);
    FS.writeFileSync(csvFileNamePerSet(pgnFileName, count), set_csv);

    return games.length;
}

function extractOrdering(pgnFileName, setNumber) {
    let csvFileName = csvFileNamePerSet(pgnFileName, setNumber);
    // First, parse CSV
    var csv = Papa.parse(getFileContents(csvFileName), {
        header: true,
        dynamicTyping: true
    });

    var ordering = [];
    for (let index = 0; index < csv.data.length; index++) {
        ordering[index] = csv.data[index].random_index;
    }
    console.log(ordering);
    return ordering;
}

function csvFileName(pgnFileName) {
    return 'csv/' + removeFileExtension(extractFileName(pgnFileName)) + '.csv';
}

function csvFileNamePerSet(pgnFileName, setNumber) {
    return 'csv/' + removeFileExtension(extractFileName(pgnFileName)) + '-' + setNumber + '.csv';
}

/**
 * 
 * @param {*} puzzle Map of the puzzle we want to turn into a line in the CSV
 * @param {*} callback 
 */
function update(puzzle, callback) {
    // Write the updated CSV for the current set
    {
        let template = `{index},{random_index},'{theme}',{is_complete},{is_correct},{is_error},{is_timeout},{time_taken}`;
        var replacementLine = template.replace('{index}', puzzle.Order).replace('{random_index}', puzzle.Number).replace('{theme}', puzzle.Theme).replace('{is_complete}', booleanToFlag(puzzle.Complete))
            .replace('{is_correct}', booleanToFlag(puzzle.Solved)).replace('{is_error}', booleanToFlag(!puzzle.Solved)).replace('{is_timeout}', booleanToFlag(puzzle.Timeout)).replace('{time_taken}', puzzle.TimeMs);

        let csv = csvFileNamePerSet(puzzle.FileName, puzzle.Set);
        replaceLineInFile(csv, puzzle.Order, replacementLine);
    }

    // Compute stats and update the set table
    let stats = computeOverallStats(csvFileNamePerSet(puzzle.FileName, puzzle.Set));

    // Update overall CSV
    {
        let template = `{set},{total},{finished}`;
        var replacementLine = template.replace('{set}', puzzle.Set).replace('{total}', stats.total).replace('{finished}', stats.finished);

        let csv = csvFileName(puzzle.FileName);
        replaceLineInFile(csv, puzzle.Set, replacementLine);
    }

    // Use the callback to (possibly) update the UI
    callback(puzzle);

    return puzzle;
}

function computeOverallStats(csvFileName) {
    var csv = Papa.parse(getFileContents(csvFileName), {
        header: true,
        dynamicTyping: true
    });

    let stats = {};
    stats.total = 0;
    stats.finished = 0;
    stats.failed = 0;
    stats.solved = 0;
    stats.timedOut = 0;
    stats.timeTaken = 0;
    for (let puzzle of csv.data) {
        stats.total++;
        if (flagToBoolean(puzzle.is_complete)) {
            stats.finished++;
            if (flagToBoolean(puzzle.is_timeout)) {
                stats.timedOut++;
            } else if (flagToBoolean(puzzle.is_correct)) {
                stats.solved++;
            } else {
                stats.failed++;
            }
            stats.timeTaken += puzzle.timeTaken;
        }
    }
    return stats;
}

function replaceLineInFile(filePath, lineIndexToReplace, replacementLine) {

    // Read the file
    FS.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading file:', err);
            return;
        }

        // Split the content into lines
        const lines = data.split('\n');

        // Modify the specific line
        if (lineIndexToReplace < lines.length) {
            lines[lineIndexToReplace] = replacementLine;
        } else {
            console.error('Line index is out of bounds.');
            return;
        }

        // Join the lines back into a single string
        const updatedContent = lines.join('\n');

        // Write the updated content back to the file
        FS.writeFile(filePath, updatedContent, 'utf8', (err) => {
            if (err) {
                console.error('Error writing file:', err);
            } else {
                //console.log('File updated successfully.');
            }
        });
    });
}

function booleanToFlag(bool) {
    return bool ? 1 : 0;
}

function flagToBoolean(flag) {
    return flag == 0 ? false : true;
}

module.exports = { select, start, update };

//getFileContents("csv/blank.csv");
//getFileContents("csv/blank2.csv");
console.log(JSON.stringify(select('/Users/kevinconnelly/Downloads/polgar-mate-in-one.pgn')));

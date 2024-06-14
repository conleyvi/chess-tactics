/**
 * 
 * Use a bunch of CSV files to simulate a DB where we can store puzzle progress and stats.
 */

// One CSV per PGN that stores overall stats and progress
// One CSV per PGN+attempt that stores results for each individual puzzle
// If you have 8 attempts at 1 PGN you'll end up with 9 total CSV files

function selectSet(pgnFileName)
{
    // Check if we've already created a table for this PGN

    // If we have, return the current set 'open' set.

    // If not, create it

    // Initial file will only have headers




}

function update(callback)
{
    // Write the updated CSV for the current set

    // Compute stats and update the set table

    // Use the callback to (possibly) update the UI


}
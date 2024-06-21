/**
 * Countdown timer function
 * 
 * duration - time in seconds
 * callback - function to handle timer output
 */ 
function startTimer(duration, callback) {
	let timer = duration * 1000;
    let start = Date.now();
	let interval = setInterval(function () {
      let elapsed = Date.now() - start;
      let remaining = timer - elapsed;
	  if (remaining < 0) {
		remaining = 0; // Stop the timer when it reaches 0
	  }
	  var minutes = Math.floor(remaining / 60000);
	  var seconds = Math.floor((remaining % 60000) / 1000);
	  var tenths = Math.floor((remaining % 1000) / 100) ; // Get tenths of a second

      if(tenths == 10) {
        seconds += 1;
        tenths = 0;
      }
  
	  minutes = minutes < 10 ? "0" + minutes : minutes;
	  seconds = seconds < 10 ? "0" + seconds : seconds;
  
	  callback(minutes, seconds, tenths, elapsed, remaining);

      if(remaining <= 0) {
        clearInterval(interval);
      }
  
	}, 100); // Update timer every 100 milliseconds (0.1 seconds)

    return interval;
  }

function updateDisplay(minutes, seconds, tenths, elapsed, remaining)
{
	display.textContent = minutes + ":" + seconds + "." + tenths;
}

function logTimerToConsole(minutes, seconds, tenths, elapsed, remaining)
{
	console.log(minutes + ":" + seconds + "." + tenths + ' elapsed = ' + elapsed);
}

//startTimer(5, logTimerToConsole);
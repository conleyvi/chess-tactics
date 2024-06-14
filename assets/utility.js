/**
 * Countdown timer function
 * 
 * duration - time in seconds
 * callback - function to handle timer output
 */ 
function startTimer(duration, callback) {
	let timer = duration * 10;
	let interval = setInterval(function () {
	  let minutes = Math.floor(timer / 600);
	  let seconds = Math.floor((timer % 600) / 10);
	  let tenths = (timer % 10); // Get tenths of a second
  
	  minutes = minutes < 10 ? "0" + minutes : minutes;
	  seconds = seconds < 10 ? "0" + seconds : seconds;
  
	  callback(minutes, seconds, tenths);
  
	  if (--timer < 0) {
        clearInterval(interval);
		timer = 0; // Stop the timer when it reaches 0
	  }
	}, 100); // Update timer every 100 milliseconds (0.1 seconds)
  }

function updateDisplay(minutes, seconds, tenths)
{
	display.textContent = minutes + ":" + seconds + "." + tenths;
}

function logTimerToConsole(minutes, seconds, tenths)
{
	console.log(minutes + ":" + seconds + "." + tenths);
}

startTimer(61, logTimerToConsole);
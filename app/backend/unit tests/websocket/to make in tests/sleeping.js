// sleeping.js

// Function to simulate sleeping
function sleep(ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
}

// Example usage of setInterval and sleep
async function run() {
	console.log("Starting...");

	// runs asynchronously every second
	const intervalId = setInterval(() => {
		console.log("This message logs every second.");
	}, 1000);

	// Sleep for 5 seconds
	await sleep(5000);

	// Clear the interval after 5 seconds
	clearInterval(intervalId);
	console.log("Stopped logging after 5 seconds.");
}

run();

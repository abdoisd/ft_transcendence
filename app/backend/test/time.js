// Create a new date
const now = new Date();

// Number of milliseconds
const timestamp = now.getTime(); // or: +now
console.log(timestamp); // e.g., 1733905530000

// Format as YYYY-MM-DD
const formattedDate = now.toISOString();
console.log(formattedDate); // e.g., "2025-09-09"

// "MM/DD/YYYY"
const localeDate = now.toLocaleDateString('en-US');
console.log(localeDate);

// Hour in the day: "HH:MM:SS AM/PM"
const localeTime = now.toLocaleTimeString('en-US');
console.log(localeTime);

// Custom formatting using get methods: "2025-9-9 14:5:30"
const customFormat = `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()} ${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`;
console.log(customFormat);

console.log(timestamp); // prints in yellow in Node
console.log("Hello");   // prints in green
console.log({a:1});     // prints in cyan


// 1757849431258
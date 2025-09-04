import fs from 'fs';

// Create a readable stream
const readStream = fs.createReadStream('file.txt', { highWaterMark: 8 }); 
// highWaterMark = 8 bytes per chunk (small for demo)

// Listen to 'data' events (each chunk)
readStream.on('data', (chunk) => {
  console.log('New chunk received:');
  console.log(chunk.toString());
  console.log('---');
});

readStream.on('end', () => {
  console.log('Finished reading file.');
});

readStream.on('error', (err) => {
  console.error('Error reading file:', err);
});

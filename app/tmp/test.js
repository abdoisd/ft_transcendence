// // index.js
import pino from 'pino';

// Create a logger instance
const logger = pino({
  transport: {
    target: 'pino-pretty',
    options: { colorize: true }
  }
});

// Example logs
logger.info('Server started successfully');
logger.warn('This is a warning');
logger.error('Something went wrong');

// import net from 'net';

// const client = new net.Socket();
// client.connect(5000, 'localhost', () => {
//   console.log('Connected to Logstash');
// });

// const logger = pino({
//   level: 'info',
//   base: null,
// }, pino.destination({
//   write: (msg) => client.write(msg + '\n')
// }));

// logger.info({ message: 'Server started' });

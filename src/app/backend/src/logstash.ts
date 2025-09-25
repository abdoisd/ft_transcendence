import { server } from "./server.ts";
import net from 'net';
import { blue } from "./global.ts";

export function logstash()
{

const logClient = new net.Socket();
logClient.connect(5044, 'logstash', () => { // don't work with logstash
  console.log(blue, 'Connected to Logstash');
});

server.addHook('onSend', (request, reply, payload, done) => {
	console.log(blue, 'onSend');

	const log = {
		"service": "my-fastify-service",
		"request": {
		  "method": request.method,
		  "url": request.url, // not valid in kibana
		  "headers": request.headers,
		  "query": request.query,
		  "body": request.body,
		},
		"response": {
		  "status_code": reply.statusCode,
		},
	};

	fetch('http://logstash:5044', {
	method: 'POST',
	headers: {
		'Content-Type': 'application/json'
		},
		body: JSON.stringify(log)
	})
	.catch(error => console.error('Error:', error));
  
	done();
});

}

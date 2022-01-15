const http = require('http');
const fs = require('fs');
const { URL } = require('url');

const hostname = '127.0.0.1';
const port = 3000;

const server = http.createServer((req, res) => {
	switch (req.url) {
		case '/':
			sendHTML(req, res);
			break;
		case '/subscribe':
			registerSubscriber(req, res);
			break;
		case '/sendMessage':
			sendMessage(req, res);
			break;
		default:
			res.writeHead(400, { 'content-type': 'text/html; charset=utf8' });
			res.end('잘못된 요청');
	}
});

function sendHTML(req, res) {
	res.writeHead(200, { 'content-type': 'text/html' });
	fs.createReadStream('client/index.html').pipe(res, { end: true });
}

let subscribers = Object.create(null);

function registerSubscriber(req, res) {
	const id = Math.floor(Math.random() * 1000);

	res.setHeader('Content-Type', 'text/plain; charset=utf8');
	res.setHeader('Cache-Control', 'no-cache, must-revalidate');

	subscribers[id] = res;
}

function sendMessage(req, res) {
	if ('POST' === req.method) {
		req.setEncoding('utf8');

		let message = '';
		req.on('data', function (chunk) {
			message += chunk;
		}).on('end', function () {
			publish(message); // publish it to everyone
			res.end('ok');
		});
		return;
	}
}

function publish(message) {
	for (let subscriber of subscribers) {
		subscriber.end(message);
	}

	subscribers = Object.create(null);
}

server.listen(port, hostname, () => {
	console.log(`Server running at http://${hostname}:${port}/`);
});

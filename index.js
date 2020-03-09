const express = require('express'),
     http = require('http'),
     morgan = require('morgan'),
     bodyParser = require('body-parser');

const endpointRouter = require('./routes/endpointRouter');
const hostname = 'localhost';
const port = 3000;

const app = express();

app.use(morgan('dev'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use('/endpoints', endpointRouter);
app.use('/endpoints/:epId', endpointRouter);

app.get('/endpoints/:epId', (req, res, next) => {
  res.end('Will send endpoint #' + req.params.epId);
});

app.post('/endpoints/:epId', (req, res, next) => {
  res.statusCode = 403;
  res.end('Not supported. Use PUT.');
});

app.put('/endpoints/:epId', (req, res, next) => {
  res.write('Updating endpoint #' + req.params.epId);
  res.end('Endpoint name: ' + req.body.name + '.' +
    ' Description: ' + req.body.description);
});

app.delete('/endpoints/:epId', (req, res, next) => {
  res.end('Deleting endpoint #' + req.params.epId);
});

app.use(express.static(__dirname + '/public'));

app.use((req, res, next) => {
  console.log(req.headers);
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/html');
  res.end('<html><body><h1>This is an Express Server</h1></body></html>');

});

const server = http.createServer(app);

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});
const express = require('express');
const bodyParser = require('body-parser');

const endpointRouter = express.Router();

endpointRouter.use(bodyParser);

endpointRouter.route('/')
    .all((req, res, next) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'text/plain');
        next();
    })

    .get((req, res, next) => {
        res.end('Will send all data soon!');
    })
  
    .post((req, res, next) => {
        res.end('Will add the endpoint named ' + req.body.name +
            ' with details: ' + req.body.description);
    })
  
    .put((req, res, next) => {
        res.statusCode = 403;
        res.end('PUT operation not supported');
    })
  
    .delete((req, res, next) => {
        res.end('Deleting all the endpoints');
    });

endpointRouter.route('/:epId')
    .all((req, res, next) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'text/plain');
        next();
    })
    .get((req, res, next) => {
        res.end('Will send endpoint #' + req.params.epId);
    })
      
    .post((req, res, next) => {
        res.statusCode = 403;
        res.end('Not supported. Use PUT.');
    })
      
    .put((req, res, next) => {
        res.write('Updating endpoint #' + req.params.epId);
        res.end('Endpoint name: ' + req.body.name + '.' +
          ' Description: ' + req.body.description);
    })
      
    .delete((req, res, next) => {
        res.end('Deleting endpoint #' + req.params.epId);
    });

module.exports = endpointRouter;
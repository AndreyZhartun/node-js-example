const express = require('express');
const router = express.Router();

const bodyParser = require('body-parser');
const mongoose = require('mongoose');
var authenticate = require('../authenticate');

const Items = require('../models/items')

router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());

router.route('/')
    .get((req, res, next) => {
        Items.find({})
            .populate('comments.author')
            .then((items) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(items);
            }, (err) => next(err))
            .catch((err) => next(err));
    })
  
    .post(authenticate.verifyUser, (req, res, next) => {
        Items.create(req.body)
            .then((item) => {
                console.log('Item Created ', item);
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(item);
            }, (err) => next(err))
            .catch((err) => next(err));
    })
  
    .put(authenticate.verifyUser, (req, res, next) => {
        res.statusCode = 403;
        res.end('PUT not supported on /items');
    })
  
    .delete(authenticate.verifyUser, (req, res, next) => {
        Items.remove({})
            .then((resp) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(resp);
            }, (err) => next(err))
            .catch((err) => next(err));
    });

router.route('/:itemId')
    .get((req, res, next) => {
        Items.findById(req.params.itemId)
            .populate('comments.author')
            .then((item) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(item);
            }, (err) => next(err))
            .catch((err) => next(err));
    })
      
    .post(authenticate.verifyUser, (req, res, next) => {
        res.statusCode = 403;
        res.end('POST not supported on /items/' + req.params.itemId);
    })
      
    .put(authenticate.verifyUser, (req, res, next) => {
        Items.findByIdAndUpdate(req.params.itemId, { 
            $set: req.body 
        },
        { 
            new: true 
        })
            .then((item) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(item);
            }, (err) => next(err))
            .catch((err) => next(err));
    })
      
    .delete(authenticate.verifyUser, (req, res, next) => {
        Items.findByIdAndRemove(req.params.itemId)
            .then((resp) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(resp);
            }, (err) => next(err))
            .catch((err) => next(err));
    });

router.route('/:itemId/comments')
    .get((req,res,next) => {
        Items.findById(req.params.itemId)
            .populate('comments.author')
            .then((item) => {
                if (item != null) {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(item.comments);
                }
                else {
                    err = new Error('Item ' + req.params.itemId + ' not found');
                    err.status = 404;
                    return next(err);
                }
            }, (err) => next(err))
            .catch((err) => next(err));
    })
    .post(authenticate.verifyUser, (req, res, next) => {
        Dishes.findById(req.params.dishId)
        .then((dish) => {
            if (dish != null) {
                req.body.author = req.user._id;
                dish.comments.push(req.body);
                dish.save()
                .then((dish) => {
                    Dishes.findById(dish._id)
                    .populate('comments.author')
                    .then((dish) => {
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/json');
                        res.json(dish);
                    })            
                }, (err) => next(err));
            }
            else {
                err = new Error('Dish ' + req.params.dishId + ' not found');
                err.status = 404;
                return next(err);
            }
        }, (err) => next(err))
        .catch((err) => next(err));
    })
    .put(authenticate.verifyUser, (req, res, next) => {
        res.statusCode = 403;
        res.end('PUT operation not supported on /items/'
            + req.params.itemId + '/comments');
    })
    .delete(authenticate.verifyUser, (req, res, next) => {
        Items.findById(req.params.itemId)
        .then((item) => {
            if (item != null) {
                for (var i = (item.comments.length -1); i >= 0; i--) {
                    item.comments.id(item.comments[i]._id).remove();
                }
                item.save()
                .then((item) => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(item);                
                }, (err) => next(err));
            }
            else {
                err = new Error('Item ' + req.params.itemId + ' not found');
                err.status = 404;
                return next(err);
            }
        }, (err) => next(err))
        .catch((err) => next(err));    
    });

router.route('/:itemId/comments/:commentId')
    .get((req,res,next) => {
        Items.findById(req.params.itemId)
            .populate('comments.author')
            .then((item) => {
                if (item != null && item.comments.id(req.params.commentId) != null) {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(item.comments.id(req.params.commentId));
                }
                else if (item == null) {
                    err = new Error('Dish ' + req.params.itemId + ' not found');
                    err.status = 404;
                    return next(err);
                }
                else {
                    err = new Error('Comment ' + req.params.commentId + ' not found');
                    err.status = 404;
                    return next(err);            
                }
            }, (err) => next(err))
            .catch((err) => next(err));
    })
    .post(authenticate.verifyUser, (req, res, next) => {
        res.statusCode = 403;
        res.end('POST operation not supported on /items/'+ req.params.itemId
            + '/comments/' + req.params.commentId);
    })
    .put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        Dishes.findById(req.params.dishId)
            .then((dish) => {
                if (dish != null && dish.comments.id(req.params.commentId) != null) {
                    if (req.body.rating) {
                        dish.comments.id(req.params.commentId).rating = req.body.rating;
                    }
                    if (req.body.comment) {
                        dish.comments.id(req.params.commentId).comment = req.body.comment;                
                    }
                    dish.save()
                    .then((dish) => {
                        Dishes.findById(dish._id)
                        .populate('comments.author')
                        .then((dish) => {
                            res.statusCode = 200;
                            res.setHeader('Content-Type', 'application/json');
                            res.json(dish);  
                        })              
                    }, (err) => next(err));
                }
                else if (dish == null) {
                    err = new Error('Dish ' + req.params.dishId + ' not found');
                    err.status = 404;
                    return next(err);
                }
                else {
                    err = new Error('Comment ' + req.params.commentId + ' not found');
                    err.status = 404;
                    return next(err);            
                }
            }, (err) => next(err))
            .catch((err) => next(err));
    })
    .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        Dishes.findById(req.params.dishId)
            .then((dish) => {
                if (dish != null && dish.comments.id(req.params.commentId) != null) {
        
                    dish.comments.id(req.params.commentId).remove();
                    dish.save()
                    .then((dish) => {
                        Dishes.findById(dish._id)
                        .populate('comments.author')
                        .then((dish) => {
                            res.statusCode = 200;
                            res.setHeader('Content-Type', 'application/json');
                            res.json(dish);  
                        })               
                    }, (err) => next(err));
                }
                else if (dish == null) {
                    err = new Error('Dish ' + req.params.dishId + ' not found');
                    err.status = 404;
                    return next(err);
                }
                else {
                    err = new Error('Comment ' + req.params.commentId + ' not found');
                    err.status = 404;
                    return next(err);            
                }
            }, (err) => next(err))
            .catch((err) => next(err));
    });

module.exports = router;
var express = require('express');
var router = express.Router();
var config = require('../config');
var fs = require('fs');
var path = require('path');
var { promisify } = require('util');
var sizeOf = require('image-size');
var User = require('../models/User');
const jwt = require('jsonwebtoken');

const lstat = promisify(fs.lstat);
const readdir = promisify(fs.readdir);
const exists = promisify(fs.exists);
var readFile = promisify(fs.readFile);
sizeOf = promisify(sizeOf);


router.post('/register', function(req, res) {
    const { username, password, state} = req.body;
    const user = new User({ username, password, state});
    user.save(function(err) {
        if (err) {
            let errString = err.toString();
            if (/E11000 duplicate key error/.test(errString)) {
                res.status(400)
                    .json({status: 400, error: "Username already exists"});
            } else {
                res.status(500)
                    .json({status: 500, error: err.toString()});
            }
        } else {
            res.status(200).json({status: 200});
        }
    });
});


router.post('/username-check', async function(req, res) {
    const { username } = req.body;
    const existance = await User.exists( {username});
    res.json({status: 200, valid: !existance});
});


router.post('/login', (req, res) => {
    const { username, password } = req.body;
    User.findOne({ username }, function (err, user) {
        if (err) {
            console.error(err);
            res.status(500)
                .json({
                    error: 'Internal error please try again'
                });
        } else if (!user) {
            res.status(401)
                .json({
                    error: 'Incorrect email or password'
                });
        } else {
            user.isCorrectPassword(password, function (err, same) {
                if (err) {
                    res.status(500)
                        .json({
                            error: 'Internal error please try again'
                        });
                } else if (!same) {
                    res.status(401)
                        .json({
                            error: 'Incorrect email or password'
                        });
                }else {
                    if(!user.state){
                        res.status(401)
                            .json({
                                error: 'not accepted by admin'
                            });
                    }
                    else{
                        const token = getToken(username);
                        res.cookie('token', token)
                            .status(200).send({status: 200, token, username});
                    }
                }
            });
        }
    });

});


function getToken(username) {
    const payload = { username };
    return jwt.sign(payload, process.env.SECRET, {
        expiresIn: '8h'
    })
}

router.post('/setState', async(req, res) => {
    const {username,objectname,state} = req.body;
    if (!config.adminUsers.includes(username)){
        res.status(412)
        .json({
            error: 'you are not admin'
        });
    }
    else if(config.adminUsers.includes(objectname)){
        res.status(412)
        .json({
            error: 'can not change the state of admin'
        });
    }
    else{
        User.findOneAndUpdate({username:objectname}, {$set:{state}}, function(err, doc){
            if(err){
                res.status(412)
                    .json({
                        error: err
                    });
            }
        });
    }
});

exports.getToken = getToken;
module.exports.authRouter = router;
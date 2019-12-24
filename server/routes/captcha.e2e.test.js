require('dotenv').config();
var createError = require('http-errors');
const express = require('express');
const config = require('../config');
const app = express();
const {captchaRouter} = require('./captcha')
var path = require('path');
var cookieParser = require('cookie-parser');
var request = require('supertest');

const mongoose = require('mongoose');


beforeAll((done)=>{
    mongoose.connect(config.mongoDBUri, { useNewUrlParser: true }, err => {
        if (err) {
            throw err;
        }
    
        console.log("Successfully connected to " + config.mongoDBUri);
        done();
    }, );
})

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use('/captcha/', captchaRouter);


app.use(function(req, res, next) {
  next(createError(404));
});

describe("send the get captcha url", ()=>{
    it('return a response with status 200', done=>{
        request(app)
            .get('/captcha/getCaptcha')
            .expect(200)
            .end(done);
    })
});
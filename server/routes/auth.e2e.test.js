require('dotenv').config();
var createError = require('http-errors');
const express = require('express');
const config = require('../config');
const {authRouter, getToken} = require('./auth');
const withAuth = require('../middleware/withAuth');
const app = express();
var path = require('path');
var cookieParser = require('cookie-parser');
var request = require('supertest');
const mongoose = require('mongoose');
var User = require('../models/User');

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
app.use('/', authRouter);
app.get('/needAuth', withAuth, (req, res, next)=>{
    res.status(200).send(req.username);
});

app.use(function(req, res, next) {
  next(createError(404));
});


describe("withAuth", ()=>{
    it ("fails when no token is provided", done=>{
        request(app)
            .get('/needAuth')
            .expect(401)
            .end(done);
    });

    it ('fails when a wrong token is provided', done=>{
        request(app)
            .get('/needAuth')
            .set('Cookie', ['token=sfasdfzxcvadwerfa;'])
            .expect(401)
            .end(done);
    })

    it ('succeeds when a correct token is provided', done=>{
        request(app)
            .get('/needAuth')
            .set('Cookie', ['token=' + getToken('ccc') + ';'])
            .expect(200)
            .end((err, req, res)=>{
                expect(req.text).toBe('ccc');
                done();
            });
    })

});


describe("login", ()=>{
    beforeAll((done)=>{
        request(app)
        .post('/register')
        .send({username:"wangyixin",password:"wang4212"})
        .set('Content-Type', 'application/json')
        .end(done);
    })

    it ("should fail when providing random username and password", done=>{
        request(app)
        .post('/login')
        .send({username:"wangyixin",password:"123456"})
        .expect(401)
        .end(done);
    })

    it ("should succeed when providing correct username and password", done=>{
        request(app)
        .post('/login')
        .set('Accept', 'application/json')
        .send({username:"wangyixin",password:"wang4212"})
        .expect('Content-Type',/json/)
        .expect(200)
        .end(done);
    })

    it ("should set cookie when successfully login", (done)=>{
        request(app)
        .post('/login')
        .set('Accept', 'application/json')
        .send({username:"wangyixin",password:"wang4212"})
        .expect('Content-Type',/json/)
        .expect(200)
        .expect((res)=>{
            if(! "token" in res.body)
            throw new Error('missing cookie!');
        })
        .end(done);
    })
    afterAll((done)=>{
        var deleteUser = {username:'wangyixin'};
        User.remove(deleteUser,err=>{
            if(err) {
                console.log("delete user failed");di
            }
            done();
        });
    })

})

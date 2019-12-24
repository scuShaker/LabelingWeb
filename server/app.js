require('dotenv').config();
const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const sizeOf = require('image-size');
const config = require('./config');
const fs = require('fs');
const sharp = require('sharp');
const {promisify} = require('util');
const indexRouter = require('./routes/index');
const {authRouter} = require('./routes/auth');
const {statisticRouter} = require('./routes/statistic');
const {captchaRouter} = require('./routes/captcha');
const {fileRouter} = require('./routes/file');
const {fileSetUp} = require('./models/ImageFileUtil')
const {getScale, scaleBBoxes} = require('./utils');
const stat = promisify(fs.stat);


const app = express();
const staticDir = path.join(__dirname, config.staticDir);
const mongoose = require('mongoose');
mongoose.set('useFindAndModify', false);
mongoose.connect(config.mongoDBUri, { useNewUrlParser: true }, err => {
  if (err) {
    throw err;
  }

  console.log("Successfully connected to " + config.mongoDBUri);
  fileSetUp().catch(err=>{
    throw err;
  });
}, );

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, " +
      "Content-Type, Accept, X-Access-Token, x-access-token");
  res.header("Access-Control-Allow-Methods", "*");
  next();
});

let staticDirReg = /^\/*rawData/;
fs.readdir(staticDir, (err, items) => {
  if (err) {
    throw err;
  }

  let reg = "^\\/*(" + items.join('|') + ")";
  staticDirReg = new RegExp(reg);
});


app.use(express.json());
app.use(express.urlencoded({ extended: false }));
// TODO: How to use this logger
// app.use(logger('dev'));
app.use(cookieParser());

app.use(async function(req, res, next){
  if (!staticDirReg.test(req.path)) {
    next();
    return;
  }

  if (req.path.endsWith('.apk')) {
    next();
    return;
  }

  if (req.path.endsWith('.json')){
    const jsonPath = path.join(staticDir, decodeURI(req.path));
    if (!fs.existsSync(jsonPath)) {
      res.status(404).json({error: "Json not found"});
      return;
    }

    fs.readFile(jsonPath, {encoding: 'utf-8'}, async (err, data)=>{
      data = JSON.parse(data);
      let imagePath;
      let suffixes = ['jpg', 'jpeg', 'png', 'gif','bmp'];
      for (let i = 0; i < suffixes.length; i++){
        imagePath = jsonPath.replace(/json$/, suffixes[i]);
        if (fs.existsSync(imagePath)){
          break;
        }
      }

      if (fs.existsSync(imagePath)) {
        const scale = await getScale(imagePath);
        if (scale !== 1){
          scaleBBoxes(data.flaws, scale);
        }
      }

      res.status(200).json(data);
    });
    return;
  }

  // TODO: Refactor and test
  const imagePath = path.join(staticDir, decodeURI(req.path));
  const scale = await getScale(imagePath);
  if (scale !== 1) {
    sizeOf(imagePath, (err, dimensions) => {
      if (err) {
        console.error(imagePath + err.toString());
      }

      const w = dimensions.width;
      sharp(imagePath)
          .resize(Math.floor(w * scale))
          .toBuffer()
          .then(data=>{
            if (imagePath.endsWith('.png')){
              res.contentType('image/png');
            } else {
              res.contentType('image/jpeg');
            }
            res.end(data, 'binary');
          }).catch(err=>{
        res.statusCode = 500;
        res.send('');
        throw err;
      })
    });

    return;
  }

  next();
}, express.static(staticDir));

app.use('/captcha/', captchaRouter);
app.use('/file/', fileRouter);
app.use('/', indexRouter);
app.use('/authenticate/', authRouter);
app.use('/statistic/', statisticRouter);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  res.status(500).json({
    error: err
  })
});

module.exports = app;

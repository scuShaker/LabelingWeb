const { randomChoose, replaceSuffixWithJson, loadDefaultBBoxes,
  getImageNumInDir, checkLabeledDataFormat,
  getImageName, resizeBBoxesOnScaledImage } = require("../utils");

const User = require('../models/User');
const UnlabeledImage = require('../models/UnlabeledImage');
const {randomChooseAndLock} = require('../models/unlabeledImageUtil');
const express = require('express');
const router = express.Router();
const config = require('../config');
const fs = require('fs');
const path = require('path');
const withAuth = require('../middleware/withAuth');
const {promisify} = require('util');
const lstat = promisify(fs.lstat);
const readdir = promisify(fs.readdir);
const exists = promisify(fs.exists);
const sizeOf = promisify(require('image-size'));
const readFile = promisify(fs.readFile);


/**
 * Get next image data
 * 
 * return format:
 * 
 * {
 *    url,  // url to the image
 *    defaultType, // default flaw type
 *    defaultBox // default bounding boxes
 * }
 */

//router.get('/getJsonData/:url', withAuth, async function(req, res, next) {
  //imageUrl = req.params.tempUrl;
  //url = req.params.url; 
  //imageUrl = url.replace(/\*/g, '/');
  /*
  let relativeUrl = /:3001\/*(.*)/.exec(imageUrl)[1];
  imagePath = path.join(config.staticDir, relativeUrl);
  const JsonPath = replaceSuffixWithJson(imagePath);
  if (await exists(JsonPath)) {
    let data = await readFile(JsonPath);
    data = JSON.parse(data);
    let defaultBoxes = await loadDefaultBBoxes(data, imagePath);
    let defaultSceneType = data.fabricType;
    let labeledUser = "";
    let labeledDate = "";

    if(data.labeledUser !== undefined)
      labeledUser = data.labeledUser;
    if(data.labeledDate!== undefined)
      labeledDate = data.labeledDate;

    res.json({
      url: imageUrl,
      labeledUser,
      labeledDate,
      defaultBoxes,
      defaultSceneType
    });
  } else {
    res.status(201).json({
      message: "no json file found",
    });
  }
});
*/


router.get('/getJsonData/:fileName/:imageIndex', withAuth, async function(req, res, next) {
  //imageUrl = req.params.tempUrl;
  fileName = req.params.fileName;
  imageIndex = parseInt(req.params.imageIndex);
  let urls=[
    fileName + '/4/' + (imageIndex-1).toString() + ".jpeg",
    fileName + '/3/' + (imageIndex-1).toString() + ".jpeg",
    fileName + '/2/' + (imageIndex-1).toString() + ".jpeg",
    fileName + '/1/' + (imageIndex-1).toString() + ".jpeg",
    fileName + '/4/' + imageIndex.toString() + ".jpeg",
    fileName + '/3/' + imageIndex.toString() + ".jpeg",
    fileName + '/2/' + imageIndex.toString() + ".jpeg",
    fileName + '/1/' + imageIndex.toString() + ".jpeg",
    fileName + '/4/' + (imageIndex+1).toString() + ".jpeg",
    fileName + '/3/' + (imageIndex+1).toString() + ".jpeg",
    fileName + '/2/' + (imageIndex+1).toString() + ".jpeg",
    fileName + '/1/' + (imageIndex+1).toString() + ".jpeg",
  ];
  var promiseItem = async (urlItem)=>{
    imagePath = path.join(config.staticDir, urlItem);
    const JsonPath = replaceSuffixWithJson(imagePath);
    if (await exists(imagePath)){
      if (await exists(JsonPath)){
        let data = await readFile(JsonPath);
        data = JSON.parse(data);
        let defaultBoxes = await loadDefaultBBoxes(data, imagePath);
        let defaultSceneType = data.fabricType;
        let labeledUser = "";
        let labeledDate = "";
    
        if(data.labeledUser !== undefined)
          labeledUser = data.labeledUser;
        if(data.labeledDate!== undefined)
          labeledDate = data.labeledDate;
        
        if(data.version!=2.0 || data.version == undefined){
          return{
            url: urlItem,
            labeledUser: "",
            labeledDate: "",
            defaultBoxes: [],
            defaultSceneType: undefined,
          }
        }
        return{
          url: urlItem,
          labeledUser,
          labeledDate,
          defaultBoxes,
          defaultSceneType
        };
      }else{
        return{
          url: urlItem,
          labeledUser: "",
          labeledDate: "",
          defaultBoxes: [],
          defaultSceneType: undefined,
        }
      }
    }  
    else{
      return{
        url: "",
        labeledUser: "",
        labeledDate: "",
        defaultBoxes: [],
        defaultSceneType: undefined,
      }
    }  
  };
  Promise.all(urls.map(async function(item){
    return promiseItem(item).catch(function(err){
      console.log(err)
      return{
        url: "",
        labeledUser: "",
        labeledDate: "",
        defaultBoxes: [],
        defaultSceneType: undefined,
      };
    })
  })).then((data)=>{
    res.json(data);
  }).catch((err)=>{
    res.status(400);
  })  
});




/**
 * Get the number of unlabeled images
 */
router.get('/unlabeled-num', withAuth, async (req, res, next) => {
  let n = await UnlabeledImage.countDocuments();
  res.send({unlabeledNum: n});
});


/**
 * Post labeled data
 */
router.post('/postLabeledData', withAuth, async function(req, res, next) {
  // TODO: Add test that GET image and POST it back, make sure that the key data keeps the same
  const labeledData = req.body;
  checkLabeledDataFormat(labeledData);
  let url = labeledData.image;
  let relativeUrl = /:3001\/*(.*)/.exec(url)[1];
  let localUrl =  path.join(config.staticDir, relativeUrl)
  imagePath = decodeURI(localUrl);
  // FIXME: this is relied on port
  const jsonPath = replaceSuffixWithJson(imagePath);
  await refineLabeledData(labeledData, imagePath, req.username, jsonPath);
  const now = new Date();
  const date = `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()} ${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`;
  labeledData['labeledDate'] = date;
  labeledData['labeledUser'] = req.username;
  labeledData['version'] = 2.0;
  await fs.writeFile(jsonPath, JSON.stringify(labeledData, undefined, 2), function(err){
      if (err) throw err;
  });
  let {imageName,cameraName,fabricName} = await getImageName(imagePath);
  targetName = `${fabricName}_${cameraName}_${imageName}`
  const targetImagePath = path.join(config.targetDir, targetName);
  const targetJsonPath = replaceSuffixWithJson(targetImagePath);
  await fs.writeFile(targetJsonPath, JSON.stringify(labeledData, undefined, 2), function(err){
    if (err) throw err;
});
  await fs.copyFile(imagePath, targetImagePath, function(err){
    if(err) throw err;
  });
  const dbImagePath = `\\${fabricName}\\${cameraName}\\${imageName}`
  const dbJsonPath  = replaceSuffixWithJson(dbImagePath)
  await User.updateOne(
    {username: req.username},
      {
        $push: {
          labels: {
            labelPath: dbJsonPath,
            imagePath: dbImagePath,
            labelDate: date
          }
        }
      }
  );
  res.status(200).json({
    status: 200
  });
});


async function refineLabeledData(labeledData, imageTargetPath, username) {
  await resizeBBoxesOnScaledImage(imageTargetPath, labeledData);
}


module.exports = router;

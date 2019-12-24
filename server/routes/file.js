const express = require('express');
const router = express.Router();
const File = require('../models/ImageFile')
const {promisify} = require('util');
const withAuth = require('../middleware/withAuth');
const User = require('../models/User');
const {fileSetUp,fileWrite} = require('../models/ImageFileUtil');
const config = require('../config');
const fs = require('fs');
const readFile = promisify(fs.readFile);

router.get('/getFileData', withAuth, async (req, res, next)=>{
    fileSetUp().catch(err=>{
        throw err;
      });
    //TODO: bug remains
    File.find({}, function(err, files){
        if(err){
            console.log(err);
            res.status(400).json({
                error: "can not load the data of files"
              });
        }
        else{
            var fileArray = new Array();
           for(let file of files){
               var fileItem = {};
                fileItem['fileId'] = file['fileId'];
                fileItem['fileName'] = file['fileName'];
                fileItem['ifUsed'] = file['ifUsed'];
                fileItem['userName'] = file['userName'];
                fileItem['locationTag'] = file['locationTag'];
                fileArray.push(fileItem);
           }
           res.status(200).json(fileArray)
        }
    });
});

router.post('/setUserFile', withAuth, async (req, res, next)=>{
    username = req.username;
    filename = parseInt(req.body.filename);
    User.updateOne({ username}, {usedFile: filename}, function (err, user) {
        if(err){
            res.status(400).json({
                error: "update user fail"
              });
        }
        else{
            res.status(200).json({
                status: 200
              });
        }
    });
});

router.post('/setFileUser', withAuth, async (req, res, next)=>{
    username = req.body.username;
    fileid =parseInt(req.body.fileid);
    ifused = req.body.ifused;
    File.updateOne({fileId: fileid}, {ifUsed: ifused, userName: username}, function(err,file){
        if(err){
            res.status(400).json({
                error: "update file fail"
              });
        }
        else{
            File.findOne({fileId: fileid}, function (err, file){
                if(err){
                    res.status(400).json({
                        error: "can not find the user"
                      });
                }
                else{
                    fileWrite(file);
                    res.status(200).json({
                        status: 200
                      });         
                }
            });
        }
    });         
});


router.get('/getUsedFileId', withAuth, async (req, res, next)=>{
    username = req.username;
    User.findOne({ username},function (err, user) {
        if(err){
            res.status(400).json({
                error: "can not find the user"
              });
        }
        else{
            File.findOne({fileName: user.usedFile}, function(err,file){
                if(err){
                    res.status(400).json({
                        error: "can not find the file"
                      });
                }
                else{
                    if(!file){
                        res.status(200).json({
                            fileId: -1
                        });  
                    }
                    else{
                        res.status(200).json({
                            fileId: file.fileId
                        }); 
                    }
                }

            });
         
        }
    });
});


router.get('/getFileDataById/:fileid', withAuth, async (req, res, next)=>{
    fileId = parseInt(req.params.fileid);
    File.findOne({fileId},function (err, ImageFile) {
        if(err){
            res.status(400).json({
                error: "can not find the file"
              });
        }
        else{
            if(ImageFile){
                res.status(200).json({
                imageFile: ImageFile
                });
            }        
        }
    });
});


router.get('/getFilenameByUsername/:username', withAuth, async (req, res, next)=>{
    username = req.params.username;
    User.findOne({username},function (err, user) {
        if(err){
            res.status(400).json({
                error: "can not find the file"
              });
        }
        else{
            if(user){
                res.status(200).json({
                filename: user.usedFile
                });
            }        
        }
    });
});


router.get('/getPredicts/:fileName', withAuth, async (req, res, next)=>{
    fileName = req.params.fileName;
    predictPath=  `${config.staticDir}/${fileName}/predict.json`;
    if(fs.existsSync(predictPath)){
        const fileData = JSON.parse(await readFile(predictPath));
        res.status(200).json({
           predicts: fileData["predicted_has_mark"]
        });
    }
    else{
        res.status(400).json({
            error: "can not find the file"
          });  
    }
});

router.post('/writeLocation', withAuth, async (req, res, next)=>{
    fileName =  req.body.fileName;
    location = req.body.location;
    filePath =  `${config.staticDir}/${fileName}/config.json`;
    console.log(filePath);
    let data = await readFile(filePath);
    data = JSON.parse(data);
    data.locationTag = location;
    await fs.writeFile(filePath, JSON.stringify(data, undefined, 2), function(err){
        if (err) throw err;
    });
    File.updateOne({fileName},{locationTag:location},function(err, file){
        if(err)
            throw err;
    })
    console.log(data);
    res.status(200).json({
        status:200
    });
});

exports.fileRouter = router;

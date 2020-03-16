const ImageFile = require('./ImageFile');
const config = require('../config');
const fs = require('fs');
const {promisify} = require('util');
const path = require('path');
const lstat = promisify(fs.lstat);
const readdir = promisify(fs.readdir);
const exists = promisify(fs.exists);
const readFile = promisify(fs.readFile);
const sizeOf = promisify(require('image-size'));


async function fileSetUp(){
    await ImageFile.deleteMany();
    const items = await readdir(config.dataBaseDir);
    for (let index = 0; index < items.length; index++){
        let urlPath = `${items[index]}`;
        let filePath = path.join(`./${config.staticDir}`, urlPath);
        let configPath =  `${filePath}/${config.ConfigFileName}`;
        const stat = await lstat(path.join(`./${config.staticDir}`, urlPath));
        let jsonPath =  `${filePath}/detect_label.json`;
        if (!stat.isDirectory()) {
            continue;
        }
        if (!fs.existsSync(jsonPath)) {
            continue;
        }
        var jsonData = {
            fileId: index,
            fileName: items[index],
            ifUsed: false,
            userName: "",
            locationTag: 0
        };
        if (fs.existsSync(configPath)) {
                const fileData = JSON.parse(await readFile(configPath));
                //读取json文件
                if ('locationTag' in fileData){
                    jsonData["locationTag"] =  fileData["locationTag"];
                }
                if ('userName' in fileData){
                    jsonData["userName"] =  fileData["userName"];
                }
                if ('ifUsed' in fileData){
                    jsonData["ifUsed"] =  fileData["ifUsed"];
                }
        }
        else{
            //创立一个新的json文件
            var content =  JSON.stringify(jsonData);
            await fs.writeFile(configPath, content, function(err){
                if (err) throw err;
            });
        } 
        let fileEntity = new ImageFile(jsonData);
        await fileEntity.save(function(error,doc){  // 保存数据
            if(error){
               console.log("error :" + error);
            }
          });
    }
}


async function fileWrite(file){
    if(!file.fileName)
        return;
    let filePath = path.join(`./${config.staticDir}`, `${String(file.fileName)}`);
    let configPath =  `${filePath}/${config.ConfigFileName}`;
    var jsonData = {
        fileId: file.fileId,
        fileName: file.fileName,
        ifUsed: file.ifUsed,
        userName: file.userName,
        locationTag: file.locationTag
    };   
    var content =  JSON.stringify(jsonData);
    fs.writeFile(configPath, content, function(err){
        if (err) throw err;
    });
}

exports.fileSetUp = fileSetUp;
exports.fileWrite = fileWrite;
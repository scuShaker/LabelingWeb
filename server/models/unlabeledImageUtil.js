const UnlabeledImage = require('./UnlabeledImage');
const config = require('../config');
const fs = require('fs');
const {promisify} = require('util');
const path = require('path');
const lstat = promisify(fs.lstat);
const readdir = promisify(fs.readdir);
const exists = promisify(fs.exists);
const readFile = promisify(fs.readFile);
const sizeOf = promisify(require('image-size'));


async function loadAllUnlabeledImage() {
    // TODO: Need Tests
    const items = await readdir(config.unlabeledImageDir);
    const imageSuffixReg = /\.(jpg|jpeg|png|gif|bmp)$/;
    let urlPath;
    let n = 0;
    for (let index = 0; index < items.length; index++){
        urlPath = `/${config.unlabeledImageDirSuffix}/${items[index]}`;
        let images;
        const stat = await lstat(path.join(`./${config.staticDir}`, urlPath));
        if (!stat.isDirectory() && !imageSuffixReg.test(urlPath)){
            continue;
        }

        if (stat.isDirectory()) {
            // In the unlabeledImageDir there are images with labels, which is companied with a JSON file
            // For example, `abc.jpg` image may be companied with an `abc.json` file as its label.
            const dirPath = path.join(`./${config.staticDir}`, urlPath);
            images = (await readdir(dirPath))
                .filter(name=>imageSuffixReg.test(name))
                .map(name=>path.join(urlPath, name));

            // Empty dir
            if (images.length === 0){
                continue;
            }
        } else {
            images = [urlPath];
        }

        n += images.length;
        await loadImages(images);
    }

    console.log(`Loaded ${n} unlabeled images from ${config.unlabeledImageDirSuffix}`)
}


async function loadImages(imagesUrls) {
    // TODO: del this comment if current way is good to go
    // imagesUrls = imagesUrls.map(url=>url.replace(/\\/g, '/'));
    // let newUrls = (await Promise.all(imagesUrls.map(async url=>{
    //     const n = await UnlabeledImage.countDocuments({imagePath: url});
    //     if (n === 0) {
    //         return url;
    //     }
    //
    //     return undefined;
    // })));
    //
    // newUrls = newUrls.filter(v=>v!=null);
    // await UnlabeledImage.insertPaths(newUrls);
    await UnlabeledImage.insertPaths(imagesUrls);
}


let intervalId;
function clearOnInterval() {
    // TODO: Need Test
    intervalId = setInterval(()=>{
        UnlabeledImage.clearOutdated().then(()=>{
            console.log("Cleared outdated enqueued images");
        }).catch(e=>{
            console.error(e);
        });
    }, config.refreshIntervalInMS);
}


async function randomChooseAndLock() {
    // OPTIMIZE: can be optimized
    const img = await UnlabeledImage.randomChoose();
    if (!img) {
        // no img
        return undefined;
    }

    await UnlabeledImage.findOneAndUpdate(
        {imagePath: img.imagePath},
        {isInLabelingQueue: true, enqueueTime: new Date().getTime()},
    );
    return img.imagePath;
}


async function unlabeledDataSetUp() {
    // TODO: test the spent time here (to see whether we need optimize)
    await UnlabeledImage.deleteMany();
    console.log('Delete All UnlabeledImage data from DB');
    await loadAllUnlabeledImage();
    clearOnInterval();
}

module.exports = {unlabeledDataSetUp, randomChooseAndLock, clearOnInterval,
    loadAllUnlabeledImage, loadImages};


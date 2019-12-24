const fs = require('fs');
var { promisify } = require('util');
var { maxImageSizeInByte } = require('./config');
const config = require('./config');
var stat = promisify(fs.stat);
var path = require('path');
var sizeOf = require('image-size');
const lstat = promisify(fs.lstat);
const readdir = promisify(fs.readdir);
const exists = promisify(fs.exists);
var readFile = promisify(fs.readFile);

function randomChoose(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}
exports.randomChoose = randomChoose;

async function resizeBBoxesOnScaledImage(targetPath, labeledData) {
    let dimensions = await sizeOf(targetPath);
    // Need to resize the bounding boxes based on the request
    // height and width, and the actual height and width of the image.
    // Because the image need may be resized in the client side.
    if (dimensions.width !== labeledData.width || dimensions.height !== labeledData.height) {
        const wScale = dimensions.width / labeledData.width;
        const hScale = dimensions.height / labeledData.height;
        for (let i = 0; i < labeledData.flaws.length; i++) {
            labeledData.flaws[i].x *= wScale;
            labeledData.flaws[i].y *= hScale;
            labeledData.flaws[i].w *= wScale;
            labeledData.flaws[i].h *= hScale;
        }

        labeledData.width = dimensions.width;
        labeledData.height = dimensions.height;
    }

    return labeledData;
}
exports.resizeBBoxesOnScaledImage = resizeBBoxesOnScaledImage;


async function getImageNumInDir(dirPath) {
    let items = await readdir(dirPath);
    let n = 0;
    for (let i = 0; i < items.length; i++) {
        const stat = await lstat(path.join(config.unlabeledImageDir, items[i]));
        if (stat.isDirectory()) {
            const files = await readdir(path.join(config.unlabeledImageDir, items[i]));
            const filteredLength = files.filter(name => {
                return !name.endsWith('.json');
            }).length;
            n += filteredLength;
        }
        else if (!items[i].endsWith('.json')) {
            n++;
        }
    }
    return n;
}
exports.getImageNumInDir = getImageNumInDir;




function scaleBBoxes(defaultBoxes, scale) {
    for (let i = 0; i < defaultBoxes.length; i++) {
        defaultBoxes[i].x *= scale;
        defaultBoxes[i].y *= scale;
        defaultBoxes[i].w *= scale;
        defaultBoxes[i].h *= scale;
    }
}
exports.scaleBBoxes = scaleBBoxes;


async function getImageName(url) {
    const parts = url.split(/[\/\\]/);
    const imageName = parts[parts.length - 1];
    const cameraName = parts[parts.length - 2];
    const fabricName = parts[parts.length - 3];
    return  {imageName,cameraName,fabricName};
}
exports.getImageName = getImageName;


/**
 * Ensure the format of the labeld data is correct
 *
 * @param {labeled data the } labeledData
 *  the standard format of labeled Data
 *  req.body format:
 
{
  image: this.image.src,
  height: this.image.naturalHeight,
  width: this.image.naturalWidth,
  flaws: [
    {
      x: 100,
      y: 100,
      w: 10,
      h: 10,
      annotation: 'Cylinder'
    }
  ]
}
 */
function checkLabeledDataFormat(labeledData) {
    const fieldsMustHave = ['fabricType', 'height', 'width', 'flaws'];
    for (let col of fieldsMustHave) {
        if (!labeledData.hasOwnProperty(col)) {
            throw new TypeError(`Labeled data does not has "${col}" field; ${JSON.stringify(labeledData)}`);
        }
    }
    const flawFieldsMustHave = ['x', 'y', 'w', 'h', 'annotation'];
    for (let row of labeledData['flaws']) {
        for (let field of flawFieldsMustHave) {
            if (!row.hasOwnProperty(field)) {
                throw new TypeError(`LabeledData.flaws does not has "${field}" field`);
            }
        }
    }
}
exports.checkLabeledDataFormat = checkLabeledDataFormat;


async function loadDefaultBBoxes(data, imagePath) {
    try {
        checkLabeledDataFormat(data);
    }
    catch (e) {
        console.log(imagePath + 'loadDefaultBBoxes');
        throw e;
    }
    let defaultBoxes = data.flaws;
    const scale = await getScale(imagePath);
    if (scale !== 1) {
        scaleBBoxes(defaultBoxes, scale);
    }
    return defaultBoxes;
}
exports.loadDefaultBBoxes = loadDefaultBBoxes;



/**
 * Image path to correcponding json path by replace suffix
 *
 * `/path/to/abc.jpg` => `/path/to/abc.json`
 *
 * @param {*} imageName
 */
function replaceSuffixWithJson(imageName) {
    return imageName.replace(/(png|jpg|jpeg|bmp|gif)$/, 'json');
}
exports.replaceSuffixWithJson = replaceSuffixWithJson;


async function getScale(imagePath) {
    const fileSizeInByte = (await stat(imagePath)).size;
    if (fileSizeInByte > maxImageSizeInByte) {
        const scale = Math.sqrt(maxImageSizeInByte / fileSizeInByte);
        return scale;
    }
    return 1;
}
exports.getScale = getScale;
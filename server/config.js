var config = {};
config.dataBaseDir = '../data/';;
config.mongoDBUri = 'mongodb://localhost/labeler';
config.refreshIntervalInMS = 1000 * 30;
if (process.env.NODE_ENV === 'test') {
    config.dataBaseDir = './__test__/data/';
    config.mongoDBUri = 'mongodb://localhost/labeler-test';
}

config.staticDir = config.dataBaseDir;
config.targetDir = '../labeledData/';
config.unlabeledImageDirSuffix = 'semiLabeledDataFromPhone';
config.unlabeledImageDir = `./${config.staticDir}/${config.unlabeledImageDirSuffix}`; // Must be inside of staticDir
config.allLabeledIamgePaths = [config.unlabeledImageDir, config.targetDir];
config.ConfigFileName = 'config.json'

config.maxImageSizeInByte = 4096 * 2000;
config.adminUsers = ['admin','小马哥116'];

module.exports = config;

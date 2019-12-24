const mongoose = require('mongoose');
const config = require('../config');

const UnlabeledImageScheme = new mongoose.Schema({
    imagePath: { type: String, require: true, unique: true},
    isInLabelingQueue: { type: Boolean, default: false, index: true},
    enqueueTime: {type: Number, default: ""}
});

UnlabeledImageScheme.methods.enqueue = async function(cb){
    this.isInLabelingQueue = true;
    this.enqueueTime = (new Date()).getTime();
    this.save(cb);
};

UnlabeledImageScheme.statics.randomChoose = async function() {
    let v = await this.aggregate(
        [
            {$match: {isInLabelingQueue: false}},
            {$sample: {size: 1}},
        ]
    );

    if (v.length === 0){
        return undefined;
    }

    return v[0];
};

UnlabeledImageScheme.statics.clearOutdated = function() {
    // TODO: Test this !important
    const now = new Date().getTime();
    const removeLT = now - config.refreshIntervalInMS;
    return this.updateMany(
        {
            isInLabelingQueue: true,
            enqueueTime: {$lt: removeLT}
        },
        {
            $set: {
                isInLabelingQueue: false,
                enqueueTime: 0
            }
        }
    );
};

UnlabeledImageScheme.statics.insertPaths = function(paths) {
    return this.insertMany(paths.map(path=> {
        // Win \path\to\img => Linux /path/to/img
        path = path.replace(/\\/g, '/');
        return {
            imagePath: path,
            isInLabelingQueue: false,
            enqueueTime: ''
        }
    })).catch((err)=>{
        throw err;
    });
};

module.exports = mongoose.model('UnlabeledImage', UnlabeledImageScheme);

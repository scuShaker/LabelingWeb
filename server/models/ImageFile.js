const mongoose = require('mongoose');
const config = require('../config');

const ImageFileScheme = new mongoose.Schema({
    fileId: { type: Number, require: true, default:-1},
    fileName: { type: String, default: ""},
    ifUsed: {type: Boolean, default: false},
    userName: {type: String, default: ""},
    locationTag: {type: Number, default: 0},
});

ImageFileScheme.statics.getFiles = function(files){
    return this.insertMany(files.array.forEach((file, index)=> {
        // Win \path\to\img => Linux /path/to/img
        file = file.replace(/\\/g, '/');
        return {
            fileId: index,
            fileName: file,
        }
    })).catch((err)=>{
        throw err;
    });  
}

module.exports = mongoose.model('Files', ImageFileScheme);
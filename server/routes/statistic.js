const fs = require('fs');
const path = require('path');
const config = require('../config');
const withAuth = require('../middleware/withAuth');
const express = require('express');
const { promisify } = require('util');
const readdir = promisify(fs.readdir);
const readFile = promisify(fs.readFile);
const lstat = promisify(fs.lstat);
const User = require('../models/User');

const router = express.Router();


const userNameReg = /\[user\.(.*?)\]\.(jpg|jpeg|png|bmp)/;
// const ignoredUsers = ['czx', 'admin', 'test', '陈锦涛'];
const ignoredUsers = [];
function readFileUsername(filePath) {
    const filename = path.basename(filePath);
    const match = userNameReg.exec(filename);
    if (match && match.length >= 2) {
        const user = match[1];
        if (ignoredUsers.indexOf(user) === -1) {
            return user;
        }
    }

    return undefined;
}


async function readFileDate(filepath) {
    const jsonPath = filepath.replace(/\.(jpg|jpeg|png|bmp)/, '.json');
    let date;
    if (fs.existsSync(jsonPath)) {
        const jsonData = JSON.parse(await readFile(jsonPath));
        if ('datetime' in jsonData){
            date = new Date(jsonData.datetime);
            date.setMonth(date.getMonth() + 1);
        }
    }

    if (!date){
        const st = await lstat(filepath);
        // TODO: need test for this
        date = new Date(st.mtime);
    }

    return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
}


const imgReg = /\.(png|jpg|jpeg|bmp)$/;
/**
 * Count the number of the all images labeled by phone
 */
router.get('/image-num', withAuth, async (req, res, next)=>{
    // TODO: Refactor
    // TODO: Add Tests
    const userDateCount = {};
    for (let dir of config.allLabeledIamgePaths) {
        if(dir == config.targetDir)
            continue;
        const names = await readdir(dir);
        for (let name of names) {
            const filePath = path.join(dir, name);
            const stat = await lstat(filePath);

            let files;
            if (!stat.isDirectory()) {
                files = [filePath];
            } else {
                files = (await readdir(filePath)).map(subname=>path.join(filePath, subname))
            }

            for (let subPath of files) {
                if (!imgReg.test(subPath)){
                    continue;
                }

                let userName = readFileUsername(subPath);
                if (userName == null || userName.length === 0) {
                    userName = 'UNK';
                }

                const date = await readFileDate(subPath);
                if (!(userName in userDateCount)) {
                    userDateCount[userName] = {};
                }

                if (!(date in userDateCount[userName])) {
                    userDateCount[userName][date] = 0;
                }

                userDateCount[userName][date]++;
            }
        }
    }

    // If this part is getting too slow, use cache
    const now = new Date();
    const responseData = [];
    for (let username in userDateCount) {
        const row = {username, todayNum: 0, thisWeekNum: 0,
            totalNum: 0, dateNum: userDateCount[username]};
        for (let date in userDateCount[username]) {
            const n = userDateCount[username][date];
            date = new Date(date);
            const sec = now - date;
            if (sec < 24 * 3600 * 1000 && sec>0) {
                row.todayNum += n;
            }

            if (sec < 24 * 3600 * 1000 * 7) {
                row.thisWeekNum += n;
            }

            row.totalNum += n;
        }

        responseData.push(row)
    }

    res.json(responseData);
});


/**
 * Return the number of images labeled by the current user
 *
 * If user is admin, it will return the numbers of images labeled and state by
 * all the users
 */
router.get('/labeled-image-num', withAuth, async (req, res, next) => {
    const usersLabeledNum = [];
    const users = await User.aggregate([
        {"$project": {username: 1, size: {'$size':
                        {"$ifNull": ['$labels', []] }
        }, state: 1, usedFile: 1}}
    ]);
    for (let u of users) {
        usersLabeledNum.push({
            username: u.username,
            labeledNum: u.size,
            state: u.state,
            filename: u.usedFile
        })
    }
    res.status(200).json({
        usersLabeledNum
    })
});


/**
 * Return the url to the labeled images
 */
router.get('/labeled-images/:username', withAuth, async (req, res, next)=>{
    if (!config.adminUsers.includes(req.username)
        && req.params.username !== req.username) {
        res.status(402)
            .json({error: 'You cannot see the images labeled by the other user'});
        return;
    }

    // FIXME: If move labeled image out of the server, there will be error here (user.labels.imagePath does not exist)
    const user = await User.findOne({username: req.params.username}, {labels: {$slice: -50}});
    res.status(200).json(user.labels);
});

/**
 * Return the permission of the user
 */
router.get('/user-permission/:username',withAuth, async (req, res, next)=>{
    let permission = config.adminUsers.includes(req.username);
    res.status(200)
        .json(permission);
    return;       
});

exports.statisticRouter = router;

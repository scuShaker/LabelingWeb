const request = require('supertest');
const app = require('./app');
const fs = require('fs');
const path = require('path');
const testDir = './__test__'
const testDataDir = path.join(testDir, 'data');
const config = require('./config');
const { exec } = require('child_process');
const { getToken } = require('./routes/auth');
const { promisify } = require('util');
const writeFile = promisify(fs.writeFile);
const UnlabeledImage = require('./models/UnlabeledImage');

jest.setTimeout(20000);
beforeAll(async () => {
    const imageDir = path.join(config.unlabeledImageDir, '01')
    const dirs = [testDir, testDataDir, config.unlabeledImageDir, 
        config.targetDir, imageDir];
    for (let dir of dirs){
        await tryRun(()=>fs.mkdirSync(dir));
    }

    await tryRun(async ()=>{
        for (let i = 0; i < 10; i++){
            const filename = '' + i;
            const json = path.join(imageDir, filename + '.json');
            const image = path.join(imageDir, filename + '.jpg');
            const jsonObj = {
                "user": "aaa",
                "height": 2316,
                "width": 1080,
                "datetime": "2019/5/14 16:28:48",
                "fabricType": "印花",
                "flaws": [
                    {
                        "x": 1000,
                        "y": 1000,
                        "h": 152.98279,
                        "w": 138.00002,
                        "annotation": "梭织"
                    }
                ],
                "version": "1.0.0"
            };

            writeFile(json, JSON.stringify(jsonObj)).then(()=>{
                const oImg = path.join(__dirname, './res/sample.jpg');
                fs.copyFile(oImg, image, err=>err?console.error(err):err);
            });

        }
    })
});


async function tryRun(func){
    try {
        await func()
    } catch (e){ }
}

test('config.js changes on test', ()=>{
    expect(config.dataBaseDir).toBe('./__test__/data/');
});

describe('GET /', function() {
    it('responds with json in the required format', function (done) {
        request(app)
            .get('/')
            .set('Accept', 'application/json')
            .set('Cookie', 'token=' + getToken('123') + ';')
            .expect('Content-Type', /json/)
            .expect(200, (err, res) => {
                if (err) done(err);
                expect(res.body).toHaveProperty('url');
                const keys = ['url', 'defaultType', 'defaultBoxes']
                for (let key in res.body) {
                    expect(keys).toContain(key);
                }

                done();
            });
    });

    it('responds with an url that ', done=>{
        done();
    })
});


describe('GET /unlabeled-num', function() {
    it('responds with number', function (done) {
        request(app)
            .get('/unlabeled-num')
            .set('Cookie', 'token=' + getToken('123') + ';')
            .expect(200, done);
    });

    it('responds with number 10', done=>{
        request(app)
            .get('/unlabeled-num')
            .set('Cookie', 'token=' + getToken('123') + ';')
            .expect(200, (err, res) => {
                if (err) {
                    done(err);
                    throw err;
                }
                expect(res.body.unlabeledNum).toBe(10);
                done();
            });
    });
});


describe('db test', ()=>{
    beforeAll(()=>{
        config.refreshIntervalInMS = 1000*5;
    });

    it('if the record will be deleted after updload', async ()=>{
        const testImg = {
            image: "http://localhost:3001/semiLabeledDataFromPhone/01/9.jpg",
            height: 2340,
            width: 1080,
            flaws: [
            {
                x: 494.93563264037584,
                y: 989.576831399636,
                w: 205.18997870705857,
                h: 222.2170875508631,
            annotation: "断纬"
            }
            ],
            fabricType: "染色针织",
            datetime: "2019/4/30 22:40:13",
            phoneLabelingUser: "徐",
        };
        await UnlabeledImage.create({imagePath: "http://localhost:3001/semiLabeledDataFromPhone/01/9.jpg",isInLabelingQueue:false},function(err,docs){
            if(err){
                console.log(err);
            }
            else{
                console.log("creat document in db successfully"+docs);
            }
        })

        await new Promise((resolve, reject)=> {
            request(app)
                .post('/')
                .send(testImg)
                .set('Cookie', ['token=' + getToken('ccc') + ';'])
                .expect(200, (err)=>{
                    if(err) reject(err);
                    resolve();
                })
                .end(resolve);
        });
        const found = await UnlabeledImage.findOne({image: testImg.image});
        expect(found).toBeNull();
    });

    afterAll(()=>{
        config.refreshIntervalInMS = 1000*60;
    });
});
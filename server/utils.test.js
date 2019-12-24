const utils = require('./utils');
const fs = require('fs');
const path = require('path');
const { maxImageSizeInByte } = require('./config');
const testDir = './__test__'


describe("getScale", () => {
    it("does not scale small image", (done) => {
        const bytes = maxImageSizeInByte - 1;
        const data = [];
        for (let i = 0; i < bytes; i++) {
            data.push('a');
        }

        const str = data.join('');
        const imgPath = path.join(testDir, 'img.png');
        fs.writeFile(imgPath, str, async (err) => {
            if (err) {
                throw err;
            }

            expect(await utils.getScale(imgPath)).toEqual(1)
            done();
        });
    });

    it("does scale large image", (done) => {
        const bytes = maxImageSizeInByte + 1;
        const data = [];
        for (let i = 0; i < bytes; i++) {
            data.push('a');
        }

        const str = data.join('');
        const imgPath = path.join(testDir, 'img.png');
        fs.writeFile(imgPath, str, async (err) => {
            if (err) {
                throw err;
            }

            expect(await utils.getScale(imgPath)).toBeLessThan(1);
            done();
        });
    });
})


// test("checkLabeledDataFormat", done=>{
//     utils.checkLabeledDataFormat
// })
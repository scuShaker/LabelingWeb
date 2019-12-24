const UnlabeledImage = require('./UnlabeledImage');
const config = require('../config');
const mongoose = require('mongoose');

async function update(imagePath, isInLabelingQueue, enqueueTime) {
    return await UnlabeledImage.updateOne(
            {imagePath: imagePath},
            {$set: {isInLabelingQueue, enqueueTime}},
    )

}

describe("UnlabeledImage Mongoose Model", ()=>{
    beforeAll(async ()=>{
        await mongoose.connect(config.mongoDBUri, { useNewUrlParser: true });
        await UnlabeledImage.deleteMany({});
        await UnlabeledImage.insertPaths([
            '1',
            '2',
            '3',
            '4',
            '5',
            '6',
            '7'
        ]);

        await update('1', true, new Date().getTime());
        await update('2', true, new Date().getTime());
        await update('3', true, new Date().getTime());
        await update(
            '4',
            true,
            new Date().getTime() - config.refreshIntervalInMS - 1
        );

        await update(
            '5',
            true,
            new Date().getTime() - config.refreshIntervalInMS - 1
        );
    });

    it ("randomChoose can only get the unlock objects", async done=>{
        let v = await UnlabeledImage.randomChoose();
        expect(v.imagePath).toMatch(/[67]/);
        v = await UnlabeledImage.randomChoose();
        expect(v.imagePath).toMatch(/[67]/);
        v = await UnlabeledImage.randomChoose();
        expect(v.imagePath).toMatch(/[67]/);
        done();
    });

    it ("randomChoose actually choose randomly", async done=>{
        const appearNum = await UnlabeledImage.randomChoose();
        for (let i = 0; i < 10; i++){
            if (await UnlabeledImage.randomChoose() !== appearNum) {
                done();
            }
        }

        throw new Error("randomChoose's returned value is fixed " + appearNum.toString());
    });

    it ("clearOutdated can free the locks that exist for a long time", async done=>{
        await UnlabeledImage.clearOutdated();
        const rows = await UnlabeledImage.find({isInLabelingQueue: false});
        const paths = rows.map(row=>row.imagePath);
        expect(paths).toContain('4');
        expect(paths).toContain('5');
        done();
    });
});
const { exec } = require('child_process');
const fs = require('fs');
const ignored = ['node_modules', '__test__'];
const server = 'root@121.43.192.193:./labelingServer/object-detection-labeler/server/';

fs.readdir('./', (err, names) => {
    for (let name of names) {
        if (ignored.indexOf(name) !== -1){
            continue;
        }

        exec(`scp -v -r ./${name} ${server}`, (err, stdout, stderr)=>{
            if (err) {
                throw err;
            }

            console.log(name);
        });
    }
});
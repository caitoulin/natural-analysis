const fs = require('fs');
const readline = require('readline');

const lineReader = readline.createInterface({
    input: fs.createReadStream('./model/mock/landTyphoon.txt'),
});

const getLanded = {};
let i = 0;
lineReader.on('line', function (line) {
    i = i + 1;
    const getLineValues = line.split(',');
    getLanded[getLineValues[0]] = {
        location: getLineValues[1],
        position: [+getLineValues[2], +getLineValues[3]],
    };
    if (i === 611) {
        console.log(getLanded);
    }
});

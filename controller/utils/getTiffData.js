const gdal = require('gdal');
const cluser = require('cluster');
const numCpu = require('os').cpus().length;
function getImagePixelValue(url, getQuery) {
    const dataset = gdal.open(url);
    const width = dataset.rasterSize.x;
    const height = dataset.rasterSize.y;
    const band = dataset.bands.get(1); // i+j*width;
    const noData = band.noDataValue;
    const data = band.pixels.read(0, 0, width, height);
    const grids = getBoundaryValue(getQuery, data, noData);
    return grids;
}

function getBoundaryValue(getQuery, data, noData) {
    const { leftTopX, leftTopY, rightDownX, rightDownY } = getQuery;
    const n = rightDownX - leftTopX + 1;
    const m = rightDownY - leftTopY + 1;
    const gapX = +leftTopX;
    const gapY = +leftTopY;
    const grids = new Array(n);
    for (let i = 0; i < n; i++) {
        grids[i] = new Array(m);
        for (let j = 0; j < m; j++) {
            const index = i + gapX + (j + gapY) * 735;
            if (data[index] !== noData) {
                grids[i][j] = data[index];
            }
        }
    }
    return grids;
}

function splitCompute(bound) {
    const { leftTopX, leftTopY, rightDownX, rightDownY } = bound;
    const width = rightDownX - leftTopX + 1;
    const height = rightDownY - leftTopY + 1;
    const xHeigth = Math.ceil(height / numCpu);
    const threadArrays = new Array(numCpu).fill(0).map((item, index) => {
        const letfX = +leftTopX;
        const letfY = +leftTopY + index * xHeigth;
        const rightX = +rightDownX;
        const tem = +leftTopY + (index + 1) * xHeigth;
        const rightY = tem > 450 ? 450 : tem;
        const getBound = {
            leftTopX: letfX,
            leftTopY: letfY,
            rightDownX: rightX,
            rightDownY: rightY,
        };
        return getBound;
    });
    return threadArrays;
}
function getGridValue(url, bound) {
    const count = splitCompute(bound);
    let results = [];
    if (cluser.isMaster) {
        for (let i = 0; i < count.length; i++) {
            const worker = cluser.fork();
            worker.send(count[i]);
            worker.on('message', (msg) => {
                results.push(msg.data);
                worker.kill();
            });
        }
    } else {
        process.on('message', (msg) => {
            console.log(msg);
            const grids = getImagePixelValue(url, msg);
            process.send({ data: grids });
        });
    }
}

exports.getImagePixelValue = getImagePixelValue;
exports.getGridValue = getGridValue;

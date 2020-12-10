const gdal = require('gdal');
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
            const index = i + gapX + (j + gapY) * 7346;
            if (data[index] !== noData) {
                grids[i][j] = data[index];
            }
        }
    }
    return grids;
}

process.on('message', (msg) => {
    const { url, getQuery } = msg;
    const grids = getImagePixelValue(url, getQuery);
    process.send({ data: grids });
});

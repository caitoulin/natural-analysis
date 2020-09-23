const turf = require('@turf/turf');

function getDefaultGrids() {
    const bbox = [98, 17.5, 124, 46];
    const cellSide = 150;
    const options = { units: 'miles' };
    const squareGrid = turf.squareGrid(bbox, cellSide, options);
    return squareGrid;
}

function caculateGridIndex(allTyphoons) {
    const squareGrid = getDefaultGrids();
}

function getLandedTracks(allTyphoons, getLandedOrigin) {
    const getLandedTyphoons = allTyphoons
        .filter((item) => {
            return item[ifdl] === 1;
        })
        .map((item) => {
            const eachLandedOrigin = getLandedOrigin[item[ifbh]][position];
            const eachTrack = item[listInfo];
        });
}
exports.getDefaultGrids = getDefaultGrids;

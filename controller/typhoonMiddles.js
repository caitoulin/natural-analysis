const landedTyphoonList = require('../model/mock/landTyphoon');
const partOne = require('../model/mock/typhoon1983');
const partTwo = require('../model/mock/typhoon2018');
const typhoonSolve = require('./utils/landedOriginCluster');
const densityIndex = require('./utils/densityIndex');
const influencedIndex = require('../model/mock/influencedIndex');
const getTyListData = (req, res) => {
    const { typhoonPartOne } = partOne;
    const { typhoonPartTwo } = partTwo;
    const allPart = [...typhoonPartOne, ...typhoonPartTwo];
    res.header('Access-control-max-age', 5000);
    res.send(allPart);
};
const getDensityGrids = (req, res) => {
    const { typhoonPartOne } = partOne;
    const { typhoonPartTwo } = partTwo;
    const allPart = [...typhoonPartOne, ...typhoonPartTwo];
    res.header('Access-control-max-age', 5000);
    res.send(densityIndex.calcuIndex(allPart));
};

const getTyLandedOrigin = (req, res) => {
    res.header('Access-control-max-age', 5000);
    res.send(typhoonSolve.landedOrigin(landedTyphoonList));
};
const getInfIndex = (req, res) => {
    res.header('Access-control-max-age', 5000);
    res.send(influencedIndex);
};

exports.getTyListData = getTyListData;
exports.getTyLandedOrigin = getTyLandedOrigin;
exports.getInfIndex = getInfIndex;
exports.getDensityGrids = getDensityGrids;

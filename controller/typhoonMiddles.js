const landedTyphoonList = require('../model/mock/landTyphoon');
const partOne = require('../model/mock/typhoon1983');
const partTwo = require('../model/mock/typhoon2018');
const typhoonSolve = require('./utils/landedOriginCluster');
const getTyListData = (req, res) => {
    const { typhoonPartOne } = partOne;
    const { typhoonPartTwo } = partTwo;
    const allPart = [...typhoonPartOne, ...typhoonPartTwo];
    res.header('Access-control-max-age', 5000);
    res.send(allPart);
};

const getTyLandedOrigin = (req, res) => {
    res.header('Access-control-max-age', 5000);
    res.send(typhoonSolve.landedOrigin(landedTyphoonList));
};

exports.getTyListData = getTyListData;
exports.getTyLandedOrigin = getTyLandedOrigin;

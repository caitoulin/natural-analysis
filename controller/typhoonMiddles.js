const landedTyphoonList = require('../model/mock/landTyphoon');
const partOne = require('../model/mock/typhoon1983');
const partTwo = require('../model/mock/typhoon2018');
const typhoonSolve = require('./utils/landedOriginCluster');
const densityIndex = require('./utils/densityIndex');
const tiffIndex = require('./utils/getTiffData');
const influencedIndex = require('../model/mock/influencedIndex');

const fork = require('child_process').fork;
const transUrl = './model/tiffImages/transport.tif';
const gdpUrl = './model/tiffImages/gdp1km101.tif';
const landUrl = './model/tiffImages/land1km101.tif';
const popUrl = './model/tiffImages/pop1km101.tif';
const poiUrl = './model/tiffImages/poi1km101.tif';
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
const getPopIndex = (req, res) => {
    res.header('Access-control-max-age', 5000);
    res.send(tiffIndex.getImagePixelValue(popUrl, req.query));
};
const getPoiIndex = (req, res) => {
    res.header('Access-control-max-age', 5000);
    res.send(tiffIndex.getImagePixelValue(poiUrl, req.query));
};
const getGdpIndex = (req, res) => {
    res.header('Access-control-max-age', 5000);
    const getQuery = req.query;
    const resData = tiffIndex.getImagePixelValue(gdpUrl, getQuery);
    // 单独开一个进程进行计算
    /*   const compute = fork('./controller/utils/testChild.js');
    compute.send({ url: gdpUrl, getQuery });
    compute.on('message', (msg) => {
        res.send(msg.data);
        compute.kill();
    }); */
    res.send(resData);
};
const getLandIndex = (req, res) => {
    res.header('Access-control-max-age', 5000);
    res.send(tiffIndex.getImagePixelValue(landUrl, req.query));
};

const getTransIndex = (req, res) => {
    res.header('Access-control-max-age', 5000);
    res.send(tiffIndex.getImagePixelValue(transUrl, req.query));
};

const getRiskIndex = (req, res) => {
    res.header('Access-control-max-age', 5000);
};

exports.getTyListData = getTyListData;
exports.getTyLandedOrigin = getTyLandedOrigin;
exports.getInfIndex = getInfIndex;
exports.getDensityGrids = getDensityGrids;
exports.getPopIndex = getPopIndex;
exports.getGdpIndex = getGdpIndex;
exports.getLandIndex = getLandIndex;
exports.getPoiIndex = getPoiIndex;
exports.getTransIndex = getTransIndex;

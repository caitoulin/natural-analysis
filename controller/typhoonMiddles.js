const landedTyphoonList = require('../model/mock/landTyphoon');

const getTyListData = (req, res) => {
    const { typhoonData } = typhoonList;
    res.header('Access-control-max-age', 5000);
    res.send(typhoonData);
};

exports.getTyListData = getTyListData;

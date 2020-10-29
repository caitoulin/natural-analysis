const express = require('express');
const router = express.Router();
const typhoonMiddles = require('../controller/typhoonMiddles');
router.get('/typhoonList', typhoonMiddles.getTyListData);
router.get('/typhoonLandedOrigin', typhoonMiddles.getTyLandedOrigin);
router.get('/influenceIndex', typhoonMiddles.getInfIndex);
router.get('/grid', typhoonMiddles.getDensityGrids);

module.exports = router;

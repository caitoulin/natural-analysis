const express = require('express');
const router = express.Router();
const typhoonMiddles = require('../controller/typhoonMiddles');
router.get('/typhoonList', typhoonMiddles.getTyListData);
router.get('/typhoonLandedOrigin', typhoonMiddles.getTyLandedOrigin);

module.exports = router;

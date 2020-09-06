const express = require('express');
const router = express.Router();
const typhoonMiddles = require('../controller/typhoonMiddles');
router.get('/typhoonList', typhoonMiddles.getTyListData);

module.exports = router;

const express = require('express');
const { getInfo } = require('../controllers/example.controller');

const router = express.Router();

router.get('/info', getInfo);

module.exports = router;

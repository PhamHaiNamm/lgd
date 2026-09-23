const express = require('express');
const { register, login, getMe } = require('../controllers/auth.controller');
const { verifyToken, optionalAuth } = require('../middlewares/auth.middleware');

const router = express.Router();

router.post('/register', optionalAuth, register);
router.post('/login', login);
router.get('/me', verifyToken, getMe);

module.exports = router;

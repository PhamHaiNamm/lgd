const express = require('express');
const { getAllItems, createItem, deleteItem } = require('../controllers/item.controller');
const { verifyToken, requireAdmin } = require('../middlewares/auth.middleware');

const router = express.Router();

router.get('/', getAllItems);
router.post('/', verifyToken, requireAdmin, createItem);
router.delete('/:id', verifyToken, requireAdmin, deleteItem);

module.exports = router;

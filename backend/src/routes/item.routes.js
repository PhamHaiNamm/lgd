const express = require('express');
const { getAllItems, createItem, deleteItem } = require('../controllers/item.controller');

const router = express.Router();

router.get('/', getAllItems);
router.post('/', createItem);
router.delete('/:id', deleteItem);

module.exports = router;

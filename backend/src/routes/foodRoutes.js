const express = require('express');
const router = express.Router();
const { getFoods, getFoodById, createFood } = require('../controllers/foodController');
const { requireAuth } = require('../middleware/auth');

router.use(requireAuth);

router.get('/', getFoods);
router.get('/:id', getFoodById);
router.post('/', createFood);

module.exports = router;
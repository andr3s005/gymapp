const express = require('express');
const router = express.Router();
const {
  getNutritionLogs,
  getDailySummary,
  addNutritionLog,
  removeNutritionLogItem,
  getWaterLog,
  logWater,
} = require('../controllers/nutritionController');
const { requireAuth } = require('../middleware/auth');

router.use(requireAuth);

// Rutas específicas antes de las de parámetro
router.get('/summary/:date', getDailySummary);
router.get('/water/:date', getWaterLog);
router.post('/water', logWater);

// Rutas generales
router.get('/', getNutritionLogs);
router.post('/', addNutritionLog);
router.delete('/:logItemId', removeNutritionLogItem);

module.exports = router;
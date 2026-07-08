const express = require('express');
const router = express.Router();
const {
  getCoaches,
  getCoachById,
  setAvailability,
  assignCoach,
  unassignCoach,
  getMyClients,
} = require('../controllers/coachController');
const { requireAuth, requireRole } = require('../middleware/auth');

router.use(requireAuth);

// Rutas específicas primero (antes de cualquier /:param)
router.get('/', getCoaches);
router.get('/my-clients', getMyClients);
router.post('/assign', assignCoach);
router.delete('/assign', unassignCoach);

// Rutas con parámetro después
router.get('/:id', getCoachById);
router.post('/:id/availability', setAvailability);

module.exports = router;
const express = require('express');
const router = express.Router();
const {
  getSessions,
  getSessionById,
  startSession,
  finishSession,
  updateSessionExercise,
  addExerciseToSession,
  deleteSession,
} = require('../controllers/workoutSessionController');
const { requireAuth } = require('../middleware/auth');

router.use(requireAuth);

// Rutas específicas primero
router.get('/', getSessions);
router.post('/', startSession);

router.get('/:id', getSessionById);
router.delete('/:id', deleteSession);
router.put('/:id/finish', finishSession);
router.post('/:id/exercises', addExerciseToSession);
router.put('/:id/exercises/:sessionExerciseId', updateSessionExercise);

module.exports = router;
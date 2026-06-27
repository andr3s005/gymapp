const express = require('express');
const router = express.Router();
const { register, login, me, adminCreateUser } = require('../controllers/authController');
const { requireAuth, requireRole } = require('../middleware/auth');


router.post('/register', register);
router.post('/login', login);
router.get('/me', requireAuth, me);
router.post('/admin-create-user', requireAuth, requireRole('admin'), adminCreateUser);

module.exports = router;

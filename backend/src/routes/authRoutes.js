const express = require('express');
const router = express.Router();
const { register, login, me, adminCreateUser, getUsers, updateProfile, updatePassword } = require('../controllers/authController')
const { requireAuth, requireRole } = require('../middleware/auth');


router.post('/register', register);
router.post('/login', login);
router.get('/me', requireAuth, me);
router.post('/admin-create-user', requireAuth, requireRole('admin'), adminCreateUser);
router.get('/users', requireAuth, requireRole('admin'), getUsers)
router.put('/profile', requireAuth, updateProfile)
router.put('/password', requireAuth, updatePassword)

module.exports = router;

const express = require('express');
const router = express.Router();
const {
  getMemberships,
  getMembershipById,
  createMembership,
  updateMembershipStatus,
  renewMembership,
  checkMembershipStatus,
} = require('../controllers/membershipController');
const{requireAuth, requireRole}  = require('../middleware/auth');

router.use(requireAuth);

// Rutas accesibles para cualquier usuario autenticado
router.get('/check/:userId', checkMembershipStatus);
router.get('/:id', getMembershipById);

// Rutas solo para admins
router.get('/', requireRole('admin'), getMemberships);
router.post('/', requireRole('admin'), createMembership);
router.put('/:id/status', requireRole('admin'), updateMembershipStatus);
router.post('/:id/renew', requireRole('admin'), renewMembership);

module.exports = router;
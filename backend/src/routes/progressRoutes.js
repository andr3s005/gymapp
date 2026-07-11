const express = require('express');
const router = express.Router();
const {
  getMeasurements,
  createMeasurement,
  deleteMeasurement,
  getPhotos,
  createPhoto,
  updatePhotoPrivacy,
  deletePhoto,
  getUploadUrl,
} = require('../controllers/progressController');
const { requireAuth } = require('../middleware/auth');

router.use(requireAuth);

// Medidas corporales
router.get('/measurements', getMeasurements);
router.post('/measurements', createMeasurement);
router.delete('/measurements/:id', deleteMeasurement);

// Fotos de progreso
router.get('/photos', getPhotos);
router.post('/photos', createPhoto);
router.put('/photos/:id/share', updatePhotoPrivacy);
router.delete('/photos/:id', deletePhoto);

// Storage — URL firmada para subir foto directamente a Supabase
router.post('/upload-url', getUploadUrl);

module.exports = router;
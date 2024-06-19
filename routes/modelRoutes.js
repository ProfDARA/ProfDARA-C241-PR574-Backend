const express = require('express');
const { postPredict } = require('../controllers/modelController');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

// router prediksi gambar
const router = express.Router();

router.post('/predict', upload.single('image'), postPredict);

module.exports = router;
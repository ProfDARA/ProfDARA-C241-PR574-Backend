const express = require('express');
const { postPredict, getPredictionHistories } = require('../controllers/modelController');

const router = express.Router();

router.post('/predict', postPredict);
router.get('/predict/histories', getPredictionHistories);

module.exports = router;

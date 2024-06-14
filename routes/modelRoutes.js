const express = require('express');
const { postPredict, getPredictionHistories } = require('../controllers/modelController');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

const router = express.Router();

router.post('/predict', upload.single('image'), async (req, res) => {
  const { file } = req;
  const { model } = req.app.locals;
  try {
    const refugeeId = await compareFaces(file.buffer);
    if (refugeeId) {
      res.status(200).send({ status: "success", refugeeId });
    } else {
      res.status(404).send({ status: "fail", message: "No matching refugee found" });
    }
  } catch (error) {
    res.status(400).send({ status: "fail", message: error.message });
  }
});

router.get('/predict/histories', getPredictionHistories);

module.exports = router;

const { predictClassification, loadData, storeData } = require('../services/inferenceService');
const crypto = require('crypto');

// Predict using the model
exports.postPredict = async (req, res) => {
  const { image } = req.body;
  const { model } = req.app.locals;
  try {
    const { label, suggestion } = await predictClassification(model, image);
    const id = crypto.randomUUID();
    const createdAt = new Date().toISOString();

    const data = { id, result: label, suggestion, createdAt };
    await storeData(id, data);

    res.status(201).send({ status: "success", message: "Model is predicted successfully", data });
  } catch (error) {
    res.status(400).send({ status: "fail", message: error.message });
  }
};

// Get prediction histories
exports.getPredictionHistories = async (req, res) => {
  try {
    const data = await loadData();
    res.status(200).send({ status: "success", data });
  } catch (error) {
    res.status(500).send({ status: "fail", message: "Failed to get prediction histories" });
  }
};

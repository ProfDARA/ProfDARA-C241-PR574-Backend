const tf = require('@tensorflow/tfjs-node');
const { Firestore } = require('@google-cloud/firestore');
const InputError = require('../utils/errorHandler');

const firestore = new Firestore();

async function predictClassification(model, image) {
  try {
    const tensor = tf.node.decodeJpeg(image).resizeNearestNeighbor([224, 224]).expandDims().toFloat();
    const classes = ["ditemukan", "tidak_ditemukan"];
    const prediction = model.predict(tensor);
    const score = await prediction.data();
    const confidenceScore = Math.max(...score) * 100;
    const classResult = tf.argMax(prediction, 1).dataSync()[0];
    let label = classes[classResult];
    if (confidenceScore < 50) {
      label = "tidak_ditemukan";
    }
    let suggestion;
    if (label === 'ditemukan') {
      suggestion = "data identitas";
    } else {
      suggestion = "tidak ditemukan";
    }
    return { label, suggestion };
  } catch (error) {
    throw new InputError("Error in prediction", 400);
  }
}

async function loadData() {
  const snapshot = await firestore.collection('predictions').get();
  const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  return data;
}

async function storeData(id, data) {
  try {
    await firestore.collection('predictions').doc(id).set(data);
  } catch (error) {
    throw new Error('Failed to store data');
  }
}

module.exports = { predictClassification, loadData, storeData };

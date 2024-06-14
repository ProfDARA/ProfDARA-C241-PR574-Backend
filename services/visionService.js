const vision = require('@google-cloud/vision');
const config = require('../config/config');
const { Storage } = require('@google-cloud/storage');
const path = require('path');
const tf = require('@tensorflow/tfjs-node');

const client = new vision.ImageAnnotatorClient({
  keyFilename: config.gcloud.keyFilePath
});

const storage = new Storage({
  projectId: config.gcloud.projectId,
  keyFilename: path.join(__dirname, '../', config.gcloud.keyFilePath)
});
const bucket = storage.bucket(config.gcloud.storageBucket);

const loadRefugeeImages = async () => {
  const [files] = await bucket.getFiles({ prefix: 'refugee_photos/' });
  return files;
};

const compareFaces = async (inputImageBuffer) => {
  const [result] = await client.faceDetection({ image: { content: inputImageBuffer } });
  const faces = result.faceAnnotations;

  if (faces.length === 0) {
    return null;
  }

  const refugeeImages = await loadRefugeeImages();
  const inputTensor = tf.node.decodeImage(inputImageBuffer).resizeNearestNeighbor([224, 224]).expandDims().toFloat();

  for (const file of refugeeImages) {
    const fileBuffer = await file.download();
    const refugeeTensor = tf.node.decodeImage(fileBuffer[0]).resizeNearestNeighbor([224, 224]).expandDims().toFloat();
    const similarity = model.compare(inputTensor, refugeeTensor);
    if (similarity > 0.8) {
      return file.name.split('/')[1];
    }
  }

  return null;
};

module.exports = { compareFaces };
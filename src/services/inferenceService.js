const faceapi = require('face-api.js');
const canvas = require('canvas');
const { Canvas, Image, ImageData } = canvas;
const { Storage } = require('@google-cloud/storage');
const config = require('../config/config');
const fetch = require('node-fetch'); // node 
const path = require('path');
const tf = require('@tensorflow/tfjs-node');


// untuk menghubungkan dengan Google Cloud Storage
const storage = new Storage({
  projectId: config.gcloud.projectId,
  keyFilename: path.join(__dirname, '../', config.gcloud.keyFilePath)
});
const bucket = storage.bucket(config.gcloud.storageBucket);

faceapi.env.monkeyPatch({ Canvas, Image, ImageData });

async function loadModel(modelPath) {
  await faceapi.nets.ssdMobilenetv1.loadFromDisk(modelPath);
  await faceapi.nets.faceLandmark68Net.loadFromDisk(modelPath);
  await faceapi.nets.faceRecognitionNet.loadFromDisk(modelPath);
  console.log('Model loaded successfully');
}

tf.loadGraphModel('https://storage.googleapis.com/c241pr574model/ResNet50V2.json');
    console.log('Model loaded successfully');


async function findSimilarFace(inputBuffer) {
  const img = await canvas.loadImage(inputBuffer);
  const detections = await faceapi.detectAllFaces(img).withFaceLandmarks().withFaceDescriptors();
  if (!detections.length) {
    throw new Error('No faces detected in the input image');
  }

  const labeledFaceDescriptors = await loadLabeledImages();
  const faceMatcher = new faceapi.FaceMatcher(labeledFaceDescriptors, 0.6);
  const bestMatch = detections.map(d => faceMatcher.findBestMatch(d.descriptor)).find(match => match.distance < 0.6);

  if (bestMatch) {
    return { imageName: bestMatch.label, imageUrl: bestMatch.imageUrl };
  }

  return null;
}

async function loadLabeledImages() {
  const [files] = await bucket.getFiles();

  return Promise.all(
    files.map(async file => {
      const imgUrl = `https://storage.googleapis.com/${bucket.name}/${file.name}`;
      const response = await fetch(imgUrl);
      const buffer = await response.buffer();
      const img = await canvas.loadImage(buffer);
      const fullFaceDescription = await faceapi.detectSingleFace(img).withFaceLandmarks().withFaceDescriptor();
      if (!fullFaceDescription) {
        throw new Error(`No faces detected for image ${file.name}`);
      }
      const faceDescriptors = [fullFaceDescription.descriptor];
      return new faceapi.LabeledFaceDescriptors(file.name, faceDescriptors);
    })
  );
}

module.exports = { loadModel, findSimilarFace };
const { Storage } = require('@google-cloud/storage');
const config = require('../config/config');
const path = require('path');
const storage = new Storage({
  projectId: config.gcloud.projectId,
  keyFilename: path.join(__dirname, '../', config.gcloud.keyFilePath)
});
const bucket = storage.bucket(config.gcloud.storageBucket);

const uploadImage = async (file, id) => {
  const blob = bucket.file(`refugee_photos/${id}/${file.originalname}`);
  const blobStream = blob.createWriteStream({
    resumable: false
  });

  return new Promise((resolve, reject) => {
    blobStream.on('finish', () => {
      const publicUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;
      resolve(publicUrl);
    }).on('error', (err) => {
      reject(err);
    }).end(file.buffer);
  });
};

module.exports = { uploadImage };
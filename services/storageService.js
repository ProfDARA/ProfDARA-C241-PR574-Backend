const { Storage } = require('@google-cloud/storage');
const config = require('../config/config');
const path = require('path');

  //service save ke gcloud storage
const storage = new Storage({
  projectId: config.gcloud.projectId,
  keyFilename: path.join(__dirname, '../', config.gcloud.keyFilePath)
});

const bucket = storage.bucket(config.gcloud.storageBucket);

const uploadImage = async (file, id) => {
  // ekstrak file format
  const fileExtension = file.originalname.split('.').pop();
  const newFileName = `${id}.${fileExtension}`;

  // memisahkan folder berdasarkan id
  const blob = bucket.file(`${id}/${newFileName}`);
  const blobStream = blob.createWriteStream({
    resumable: false
  });
  
  return new Promise((resolve, reject) => {
    blobStream.on('finish', async () => {
      try {
        // supaya foto bisa diakses publik
        await blob.makePublic();

        const publicUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;
        resolve(publicUrl);
      } catch (err) {
        reject(err);
      }
    }).on('error', (err) => {
      reject(err);
    }).end(file.buffer);
  });
};


module.exports = { uploadImage };

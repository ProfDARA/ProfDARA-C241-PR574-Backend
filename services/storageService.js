const { Storage } = require('@google-cloud/storage');
const config = require('../config/config');
const path = require('path');

  //service save ke gcloud storage

  const storage = new Storage({
    projectId: config.gcloud.projectId,
    keyFilename: path.join(__dirname, '../', config.gcloud.keyFilePath)
  });
  const bucket = storage.bucket(config.gcloud.storageBucket);

  // upload nya
  async function uploadImage(file, id, nama, posko) {
    if (!file) {
      throw new Error('Harus Menambahkan Foto Pengungsi');
    }

    const sanitizedNama = nama.replace(/\s+/g, '_');
    const sanitizedPosko = posko.replace(/\s+/g, '_');
    const fileExtension = file.originalname.split('.').pop();
    const newFileName = `${sanitizedNama}_${sanitizedPosko}_${id}.${fileExtension}`;
    const blob = bucket.file(newFileName);
    const blobStream = blob.createWriteStream({
      resumable: false,
      gzip: true,
      metadata: {
        contentType: file.mimetype,
      },
    });

  return new Promise((resolve, reject) => {
    blobStream.on('error', err => {
      reject(err);
    });

    blobStream.on('finish', async () => {
      try {
        await blob.makePublic();
        const publicUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;
        resolve(publicUrl);
      } catch (err) {
        reject(err);
      }
    });

    blobStream.end(file.buffer);
  });
}

module.exports = { uploadImage };

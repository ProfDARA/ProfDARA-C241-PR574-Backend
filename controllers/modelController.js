const { findSimilarFace } = require('../services/inferenceService');
const { Storage } = require('@google-cloud/storage');
const config = require('../config/config');
const storage = new Storage({
  projectId: config.gcloud.projectId,
  keyFilename: config.gcloud.keyFilePath
});
const bucket = storage.bucket(config.gcloud.storageBucket);

exports.postPredict = async (req, res) => {
  const { file } = req;
  try {
    const result = await findSimilarFace(file.buffer);
    if (result) {
      res.status(200).send({ status: "Sukses", imageName: result.imageName, posko: result.posko, imageUrl: result.imageUrl });
    } else {
      res.status(404).send({ status: "Gagal", message: "Tidak Ada Pengungsi Ditemukan" });
    }
  } catch (error) {
    res.status(400).send({ status: "Sukses", message: error.message });
  }
};
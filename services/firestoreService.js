const { Firestore } = require('@google-cloud/firestore');
const config = require('../config/config');
const firestore = new Firestore({
  projectId: config.gcloud.projectId,
  keyFilename: config.gcloud.keyFilePath
});

module.exports = firestore;
// service firestore
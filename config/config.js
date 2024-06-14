const dotenv = require('dotenv');
const assert = require('assert');

dotenv.config();

const {
  PORT,
  HOST,
  HOST_URL,
  API_KEY,
  AUTH_DOMAIN,
  DATABASE_URL,
  PROJECT_ID,
  STORAGE_BUCKET,
  MESSAGING_SENDER_ID,
  APP_ID,
  GCLOUD_STORAGE_BUCKET,
  GCLOUD_PROJECT_ID,
  GCLOUD_KEYFILE_PATH,
  VISION_API_KEY
} = process.env;

assert(PORT, 'PORT is required');
assert(HOST, 'HOST is required');

module.exports = {
  port: PORT,
  host: HOST,
  url: HOST_URL,
  firebaseConfig: {
    apiKey: API_KEY,
    authDomain: AUTH_DOMAIN,
    databaseURL: DATABASE_URL,
    projectId: PROJECT_ID,
    storageBucket: STORAGE_BUCKET,
    messagingSenderId: MESSAGING_SENDER_ID,
    appId: APP_ID
  },
  gcloud: {
    storageBucket: GCLOUD_STORAGE_BUCKET,
    projectId: GCLOUD_PROJECT_ID,
    keyFilePath: GCLOUD_KEYFILE_PATH,
    visionApiKey: VISION_API_KEY
  }
};

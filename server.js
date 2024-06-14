const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const admin = require('firebase-admin');
const config = require('./config/config');
const authRoutes = require('./routes/authRoutes');
const refugeeRoutes = require('./routes/refugeeRoutes');
const modelRoutes = require('./routes/modelRoutes');
const { loadModel } = require('./services/inferenceService');
const credentials = require('./serac.json');
const path = require('path');

admin.initializeApp({
  credential: admin.credential.cert(credentials)
});

// fungsi express
const app = express();
app.use(bodyParser.json());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/auth', authRoutes);
app.use('/refugee', refugeeRoutes);
app.use('/model', modelRoutes);

app.get('/', (req, res) => {
  res.send('API Backend is running');
});

const PORT = process.env.PORT || 8080;
const HOST = config.host || 'localhost';

const modelPath = path.join(__dirname, 'weight');
loadModel(modelPath).then(() => {
  app.listen(PORT, () => {
    console.log(`Server is running on http://${HOST}:${PORT}`);
  });
}).catch(err => {
  console.error('Error loading model:', err);
});
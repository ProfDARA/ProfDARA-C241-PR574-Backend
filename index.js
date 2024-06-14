const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const admin = require('firebase-admin');
const config = require('./config/config');
const authRoutes = require('./routes/authRoutes');
const refugeeRoutes = require('./routes/refugeeRoutes');
const modelRoutes = require('./routes/modelRoutes');

admin.initializeApp({
  credential: admin.credential.cert(require('./serac.json'))
});

const app = express();
app.use(bodyParser.json());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/auth', authRoutes);
app.use('/refugee', refugeeRoutes);
app.use('/model', modelRoutes);

// route handle root URL
app.get('/', (req, res) => {
  res.send('API Bbackend telah jalan');
});

const PORT = config.port || 3000;
const HOST = config.host || 'localhost';

const loadModel = async () => {
  // Load model disini, placeholder function
  return {}; // Replace actual model loading
};

loadModel().then(model => {
  app.locals.model = model;
  app.listen(PORT, HOST, () => {
    console.log(`Server is running on http://${HOST}:${PORT}`);
  });
}).catch(err => {
  console.error('Error loading model:', err);
});
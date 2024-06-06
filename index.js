const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const admin = require('firebase-admin');
const config = require('./config/config');
const authRoutes = require('./routes/authRoutes');
const refugeeRoutes = require('./routes/refugeeRoutes');
const modelRoutes = require('./routes/modelRoutes');
const loadModel = require('./services/loadModel');

admin.initializeApp({
  credential: admin.credential.cert(require('./path/to/serviceAccountKey.json'))
});

const app = express();
app.use(bodyParser.json());
app.use(cors());

app.use('/auth', authRoutes);
app.use('/refugee', refugeeRoutes);
app.use('/model', modelRoutes);

const PORT = config.port || 3000;
const HOST = config.host || 'localhost';

loadModel().then(model => {
  app.locals.model = model;
  app.listen(PORT, HOST, () => {
    console.log(`Server is running on http://${HOST}:${PORT}`);
  });
}).catch(err => {
  console.error('Error loading model:', err);
});

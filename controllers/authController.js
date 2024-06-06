const admin = require('firebase-admin');
const db = require('../services/firestoreService');

// Signup user
exports.signup = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await admin.auth().createUser({ email, password });
    await db.collection('users').doc(user.uid).set({
      email: user.email,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });
    res.status(201).send(user);
  } catch (error) {
    res.status(400).send(error);
  }
};

// Signin user
exports.signin = async (req, res) => {
  const { email, password } = req.body;
  try {
    const userRecord = await admin.auth().getUserByEmail(email);
    res.status(200).send(userRecord);
  } catch (error) {
    res.status(400).send(error);
  }
};

// Get user data
exports.getUser = async (req, res) => {
  const { uid } = req.params;
  try {
    const user = await admin.auth().getUser(uid);
    const userDoc = await db.collection('users').doc(uid).get();
    if (!userDoc.exists) {
      res.status(404).send({ message: 'User not found in Firestore' });
    } else {
      res.status(200).send({ ...user, firestoreData: userDoc.data() });
    }
  } catch (error) {
    res.status(400).send(error);
  }
};

// Delete user
exports.deleteUser = async (req, res) => {
  const { uid } = req.params;
  try {
    await admin.auth().deleteUser(uid);
    await db.collection('users').doc(uid).delete();
    res.status(204).send();
  } catch (error) {
    res.status(400).send(error);
  }
};

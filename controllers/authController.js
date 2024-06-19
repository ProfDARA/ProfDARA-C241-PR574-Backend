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
    res.status(201).send({ message: 'Pengguna Berhasil Didaftarkan', user });
  } catch (error) {
    res.status(400).send({ message: 'Pendaftaran Pengguna Gagal', error });
  }
};

// Signin user
exports.signin = async (req, res) => {
  const { email, password } = req.body;
  try {
    const userRecord = await admin.auth().getUserByEmail(email);
    res.status(200).send({ message: 'Pengguna Berhasil Masuk', userRecord });
  } catch (error) {
    res.status(400).send({ message: 'Login Gagal', error });
  }
};

// Get user data
exports.getUser = async (req, res) => {
  const { uid } = req.params;
  try {
    const user = await admin.auth().getUser(uid);
    const userDoc = await db.collection('users').doc(uid).get();
    if (!userDoc.exists) {
      res.status(404).send({ message: 'Pengguna Tidak Ditemukan di Database' });
    } else {
      res.status(200).send({ message: 'Data Pengguna Berhasil Ditemukan', user, firestoreData: userDoc.data() });
    }
  } catch (error) {
    res.status(400).send({ message: 'Pengambilan Data Pengguna Gagal', error });
  }
};

// Delete user
exports.deleteUser = async (req, res) => {
  const { uid } = req.params;
  try {
    await admin.auth().deleteUser(uid);
    await db.collection('users').doc(uid).delete();
    res.status(204).send({ message: 'Pengguna Berhasil Dihapus' });
  } catch (error) {
    res.status(400).send({ message: 'Penghapusan Pengguna Gagal', error });
  }
};
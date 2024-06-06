const Refugee = require('../models/refugee');
const db = require('../services/firestoreService');

// Add refugee
exports.addRefugee = async (req, res) => {
  const { id, nama, jk, usia, kepalakk, asal, posko, catatan } = req.body;
  try {
    const refugee = new Refugee(id, nama, jk, usia, kepalakk, asal, posko, catatan);
    await db.collection('refugees').doc(id).set(refugee);
    res.status(201).send(refugee);
  } catch (error) {
    res.status(400).send(error);
  }
};

// Get all refugees
exports.getAllRefugees = async (req, res) => {
  try {
    const snapshot = await db.collection('refugees').get();
    const refugees = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.status(200).send(refugees);
  } catch (error) {
    res.status(400).send(error);
  }
};

// Get refugee by ID
exports.getRefugee = async (req, res) => {
  const { id } = req.params;
  try {
    const doc = await db.collection('refugees').doc(id).get();
    if (!doc.exists) {
      res.status(404).send({ message: 'Refugee not found' });
    } else {
      res.status(200).send(doc.data());
    }
  } catch (error) {
    res.status(400).send(error);
  }
};

// Update refugee
exports.updateRefugee = async (req, res) => {
  const { id } = req.params;
  const { nama, jk, usia, kepalakk, asal, posko, catatan } = req.body;
  try {
    await db.collection('refugees').doc(id).update({ nama, jk, usia, kepalakk, asal, posko, catatan });
    res.status(200).send({ message: 'Refugee updated successfully' });
  } catch (error) {
    res.status(400).send(error);
  }
};

// Delete refugee
exports.deleteRefugee = async (req, res) => {
  const { id } = req.params;
  try {
    await db.collection('refugees').doc(id).delete();
    res.status(204).send();
  } catch (error) {
    res.status(400).send(error);
  }
};

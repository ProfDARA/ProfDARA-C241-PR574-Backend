const { Storage } = require('@google-cloud/storage');
const db = require('../services/firestoreService');
const config = require('../config/config');
const path = require('path');
const { format } = require('util');

const storage = new Storage({
  projectId: config.gcloud.projectId,
  keyFilename: path.join(__dirname, '../', config.gcloud.keyFilePath)
});
const bucket = storage.bucket(config.gcloud.storageBucket);

async function uploadImage(file, id, nama, posko) {
  if (!file) {
    throw new Error('No image file uploaded');
  }

  const sanitizedNama = nama.replace(/\s+/g, '_');
  const sanitizedPosko = posko.replace(/\s+/g, '_');
  const fileExtension = file.originalname.split('.').pop();
  const newFileName = `${sanitizedNama}_${sanitizedPosko}_${id}.${fileExtension}`;
  const blob = bucket.file(`${newFileName}`);
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
        const publicUrl = format(`https://storage.googleapis.com/${bucket.name}/${blob.name}`);
        resolve(publicUrl);
      } catch (err) {
        reject(err);
      }
    });

    blobStream.end(file.buffer);
  });
}

exports.addRefugee = async (req, res) => {
  const { nama, jk, usia, asal, posko, catatan } = req.body;
  const { file } = req;

  try {
    const refugeeDocRef = db.collection('refugees').doc(); // Generate new doc ref with auto-ID
    const id = refugeeDocRef.id;
    const imageUrl = await uploadImage(file, id, nama, posko); // Pass posko to uploadImage
    const refugee = { id, nama, jk, usia, asal, posko, catatan, imageUrl };
    
    await refugeeDocRef.set(refugee);
    res.status(201).send(refugee);
  } catch (error) {
    res.status(400).send({ status: "fail", message: error.message });
  }
};

// List semua pengungsi
exports.getAllRefugees = async (req, res) => {
  try {
    const snapshot = await db.collection('refugees').get();
    const refugees = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.status(200).send(refugees);
  } catch (error) {
    res.status(400).send(error);
  }
};

// Get pengungsi by ID
exports.getRefugee = async (req, res) => {
  const { id } = req.params;
  try {
    const doc = await db.collection('refugees').doc(id).get();
    if (!doc.exists) {
      res.status(404).send({ message: 'Pengungsi tidak ditemukan' });
    } else {
      const refugeeData = doc.data();
      res.status(200).send(refugeeData);
    }
  } catch (error) {
    res.status(400).send({ status: "fail", message: error.message });
  }
};

// Get pengungsi by nama
exports.searchRefugeeByNama = async (req, res) => {
  const { nama } = req.query;

  if (!nama) {
    return res.status(400).send({ status: "fail", message: "Nama harus diberikan" });
  }

  try {
    const snapshot = await db.collection('refugees').where('nama', '>=', nama).where('nama', '<=', nama + '\uf8ff').get();
    if (snapshot.empty) {
      return res.status(404).send({ message: 'Pengungsi tidak ditemukan' });
    }

    const refugees = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.status(200).send(refugees);
  } catch (error) {
    res.status(400).send({ status: "fail", message: error.message });
  }
};

// Get pengungsi by posko
exports.searchRefugeeByPosko = async (req, res) => {
  const { posko } = req.query;

  if (!posko) {
    return res.status(400).send({ status: "fail", message: "Posko harus diberikan" });
  }

  try {
    const snapshot = await db.collection('refugees').where('posko', '==', posko).get();
    if (snapshot.empty) {
      return res.status(404).send({ message: 'Pengungsi tidak ditemukan' });
    }

    const refugees = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.status(200).send(refugees);
  } catch (error) {
    res.status(400).send({ status: "fail", message: error.message });
  }
};

exports.updateRefugee = async (req, res) => {
  const { id } = req.params;
  const { nama, jk, usia, kepalakk, asal, posko, catatan } = req.body;
  const { file } = req;
  let updatedData = { nama, jk, usia, kepalakk, asal, posko, catatan };

  // Remove undefined values from updatedData
  updatedData = Object.fromEntries(Object.entries(updatedData).filter(([_, v]) => v !== undefined));

  try {
    const docRef = db.collection('refugees').doc(id);
    const doc = await docRef.get();
    
    if (!doc.exists) {
      return res.status(404).send({ message: 'Pengungsi tidak ditemukan' });
    }

    if (file) {
      const oldImageUrl = doc.data().imageUrl;
      const oldImagePath = oldImageUrl.replace(`https://storage.googleapis.com/${bucket.name}/`, '');
      await bucket.file(oldImagePath).delete();
      const newImageUrl = await uploadImage(file, id, nama || doc.data().nama);
      updatedData.imageUrl = newImageUrl;
    }

    await docRef.update(updatedData);
    const updatedDoc = await docRef.get();
    
    res.status(200).send({ message: 'Data pengungsi berhasil diperbarui', data: updatedDoc.data() });
  } catch (error) {
    res.status(400).send({ status: "fail", message: `Kesalahan memperbarui data pengungsi: ${error.message}` });
  }
};

exports.deleteRefugee = async (req, res) => {
  const { id } = req.params;
  try {
    const docRef = db.collection('refugees').doc(id);

    const doc = await docRef.get();
    if (!doc.exists) {
      return res.status(404).send({ message: 'Pengungsi tidak ditemukan' });
    }

    const refugeeData = doc.data();
    const imageUrl = refugeeData.imageUrl;
    const imagePath = imageUrl.replace(`https://storage.googleapis.com/${bucket.name}/`, '');

    await bucket.file(imagePath).delete();
    await docRef.delete();

    res.status(200).send({ message: 'Data pengungsi berhasil dihapus' });
  } catch (error) {
    res.status(400).send({ status: "fail", message: `Kesalahan menghapus pengungsi: ${error.message}` });
  }
};
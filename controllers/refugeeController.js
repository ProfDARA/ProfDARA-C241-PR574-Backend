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

// Fungsi upload image
async function uploadImage(file, id, nama, posko) {
  if (!file) {
    throw new Error('Harus Menambahkan Foto Pengungsi');
  }

  const sanitizedNama = nama.replace(/\s+/g, '_');
  const sanitizedPosko = posko.replace(/\s+/g, '_');
  const fileExtension = file.originalname.split('.').pop();
  const newFileName = `${sanitizedNama}_${sanitizedPosko}_${id}.${fileExtension}`;
  const blob = bucket.file(newFileName);
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
        const publicUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;
        resolve(publicUrl);
      } catch (err) {
        reject(err);
      }
    });

    blobStream.end(file.buffer);
  });
}

// Fungsi rename image
async function renameImage(oldImageUrl, newFileName) {
  const oldImagePath = oldImageUrl.replace(`https://storage.googleapis.com/${bucket.name}/`, '');
  const newBlob = bucket.file(newFileName);
  
  await bucket.file(oldImagePath).copy(newBlob);
  await bucket.file(oldImagePath).delete();
  
  await newBlob.makePublic();
  return `https://storage.googleapis.com/${bucket.name}/${newFileName}`;
}
exports.addRefugee = async (req, res) => {
  const { nama, jk, usia, asal, posko, catatan } = req.body;
  const { file } = req;

  try {
    const refugeeDocRef = db.collection('refugees').doc(); // Generate auto-ID
    const id = refugeeDocRef.id;
    const imageUrl = await uploadImage(file, id, nama, posko); // Pass posko uploadImage
    const refugee = { id, nama, jk, usia, asal, posko, catatan, imageUrl };
    
    await refugeeDocRef.set(refugee);
    res.status(201).send(refugee);
  } catch (error) {
    res.status(400).send({ status: "Gagal", message: `Kesalahan Menambah Data Pengungsi: ${error.message}` });
  }
};

// List semua pengungsi
exports.getAllRefugees = async (req, res) => {
  try {
    const snapshot = await db.collection('refugees')
      .orderBy('nama', 'asc') // Sort alphabetically by name
      .get();
      
    const refugees = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.status(200).send({ status: "Sukses", data: refugees });
  } catch (error) {
    res.status(400).send({ status: "Gagal", message: `Kesalahan Mencari Data Semua Pengungsi: ${error.message}` });
  }
};

// Get pengungsi by ID
exports.getRefugee = async (req, res) => {
  const { id } = req.params;
  try {
    const doc = await db.collection('refugees').doc(id).get();
    if (!doc.exists) {
      res.status(404).send({ message: 'Pengungsi Tidak Ditemukan' });
    } else {
      const refugeeData = doc.data();
      res.status(200).send(refugeeData);
    }
  } catch (error) {
    res.status(400).send({ status: "Gagal", message: error.message });
  }
};

// Get pengungsi by nama
exports.searchRefugeeByNama = async (req, res) => {
  const { nama } = req.query;

  if (!nama) {
    return res.status(400).send({ status: "Gagal", message: "Nama Harus Ditulis" });
  }

  try {
    const snapshot = await db.collection('refugees')
      .where('nama', '>=', nama)
      .where('nama', '<=', nama + '\uf8ff')
      .orderBy('nama', 'asc') // Sort ascending nama
      .get();
    
    if (snapshot.empty) {
      return res.status(404).send({ message: 'Pengungsi Tidak Ditemukan' });
    }

    const refugees = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.status(200).send(refugees);
  } catch (error) {
    res.status(400).send({ status: "Gagal", message: `Kesalahan Mencari Data Nama: ${error.message}`});
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
    res.status(400).send({ status: "Gagal", message: `Kesalahan Mencari Data Posko: ${error.message}`});
  }
};

//updaate pengungsi by ID
exports.updateRefugee = async (req, res) => {
  const { id } = req.params;
  const { nama, jk, usia, kepalakk, asal, posko, catatan } = req.body;
  const { file } = req;

  let updatedData = { nama, jk, usia, kepalakk, asal, posko, catatan };


  updatedData = Object.fromEntries(Object.entries(updatedData).filter(([_, v]) => v !== undefined));

  try {
    const docRef = db.collection('refugees').doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(404).send({ message: 'Pengungsi Tidak Ditemukan' });
    }

    const existingData = doc.data();
    const oldImageUrl = existingData.imageUrl;
    const oldPosko = existingData.posko;
    const newPosko = posko || oldPosko;
    const newName = nama || existingData.nama;

    if (file) {
      if (oldImageUrl) {
        const oldImagePath = oldImageUrl.replace(`https://storage.googleapis.com/${bucket.name}/`, '');
        await bucket.file(oldImagePath).delete();
      }
      const newImageUrl = await uploadImage(file, id, newName, newPosko);
      updatedData.imageUrl = newImageUrl;
    } else if (posko && posko !== oldPosko && oldImageUrl) {
      const fileExtension = oldImageUrl.split('.').pop();
      const sanitizedNama = newName.replace(/\s+/g, '_');
      const sanitizedPosko = newPosko.replace(/\s+/g, '_');
      const newFileName = `${sanitizedNama}_${sanitizedPosko}_${id}.${fileExtension}`;
      const newImageUrl = await renameImage(oldImageUrl, newFileName);
      updatedData.imageUrl = newImageUrl;
    }

    // update doc
    await docRef.update(updatedData);

    // Fetch doc
    const updatedDoc = await docRef.get();

    res.status(200).send({ message: 'Data Pengungsi Berhasil Diperbarui', data: updatedDoc.data() });
  } catch (error) {
    res.status(400).send({ status: "Gagal", message: `Kesalahan Memperbarui Data Pengungsi: ${error.message}` });
  }
};


//Delete pengungsi by ID
exports.deleteRefugee = async (req, res) => {
  const { id } = req.params;
  try {
    const docRef = db.collection('refugees').doc(id);

    const doc = await docRef.get();
    if (!doc.exists) {
      return res.status(404).send({ message: 'Pengungsi Tidak Ditemukan' });
    }

    const refugeeData = doc.data();
    const imageUrl = refugeeData.imageUrl;
    const imagePath = imageUrl.replace(`https://storage.googleapis.com/${bucket.name}/`, '');

    await bucket.file(imagePath).delete();
    await docRef.delete();

    res.status(200).send({ message: 'Data Pengungsi Berhasil Dihapus' });
  } catch (error) {
    res.status(400).send({ status: "Gagal", message: `Kesalahan Menghapus Pengungsi: ${error.message}` });
  }
};
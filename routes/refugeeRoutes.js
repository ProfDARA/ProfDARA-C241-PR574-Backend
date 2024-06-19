const express = require('express');
const { addRefugee, getAllRefugees, getRefugee, updateRefugee, deleteRefugee, searchRefugeeByNama, searchRefugeeByPosko } = require('../controllers/refugeeController');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

const router = express.Router();

// Router data pengungsi
router.post('/register', upload.single('image'), addRefugee);
router.get('/refugees', getAllRefugees); // List semua data pengungsi
router.get('/refugee/:id', getRefugee); // Get data pengungsi berdasar ID
router.put('/refugee/:id', updateRefugee); // Update data pengungsi
router.delete('/refugee/:id', deleteRefugee); // Hapus pengungsi

// Search berdasar nama dan posko
router.get('/refugees/search/bynama', searchRefugeeByNama);
router.get('/refugees/search/byposko', searchRefugeeByPosko);

module.exports = router;

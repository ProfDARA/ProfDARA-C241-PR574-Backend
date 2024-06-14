const express = require('express');
const { addRefugee, getAllRefugees, getRefugee, updateRefugee, deleteRefugee } = require('../controllers/refugeeController');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

const router = express.Router();

//router data pengungsi
router.post('/refugee', upload.single('image'), addRefugee);
router.get('/refugees', getAllRefugees); //list semua data pengungsi
router.get('/refugee/:id', getRefugee); //get data pengungsi berdasar ID
router.put('/refugee/:id', updateRefugee); //update data pengungsi
router.delete('/refugee/:id', deleteRefugee); // hapus pengungsi

module.exports = router;
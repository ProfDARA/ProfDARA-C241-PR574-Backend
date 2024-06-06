const express = require('express');
const { addRefugee, getAllRefugees, getRefugee, updateRefugee, deleteRefugee } = require('../controllers/refugeeController');

const router = express.Router();

router.post('/refugee', addRefugee);
router.get('/refugees', getAllRefugees);
router.get('/refugee/:id', getRefugee);
router.put('/refugee/:id', updateRefugee);
router.delete('/refugee/:id', deleteRefugee);

module.exports = router;

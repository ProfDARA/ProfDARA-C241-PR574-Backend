const express = require('express');
const { signup, signin, getUser, deleteUser } = require('../controllers/authController');

const router = express.Router();
router.post('/signup', signup);
router.post('/signin', signin);
router.get('/user/:uid', getUser);
router.delete('/user/:uid', deleteUser);

module.exports = router;

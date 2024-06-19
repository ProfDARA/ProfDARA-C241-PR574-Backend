const express = require('express');
const { signup, signin, getUser, deleteUser } = require('../controllers/authController');

const router = express.Router();
router.post('/signup', signup); //daftar pengguna
router.post('/signin', signin); //login pengguna
router.get('/user/:uid', getUser); //ambil data pengguna
router.delete('/user/:uid', deleteUser); //hapus pengguna

module.exports = router;

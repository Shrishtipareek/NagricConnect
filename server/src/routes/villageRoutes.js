const express = require('express');
const router = express.Router();
const { getActiveVillages } = require('../controllers/villageController');

router.get('/', getActiveVillages);

module.exports = router;

const express = require('express');
const router = express.Router();
const {
  getCountries,
  getStates,
  getDistricts,
  getSubDistricts,
  getVillages,
} = require('../controllers/locationController');

router.get('/countries', getCountries);
router.get('/states', getStates);
router.get('/districts', getDistricts);
router.get('/sub-districts', getSubDistricts);
router.get('/villages', getVillages);

module.exports = router;

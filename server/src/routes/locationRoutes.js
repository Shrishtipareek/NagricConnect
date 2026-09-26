const express = require('express');
const router = express.Router();
const {
  getCountries,
  getStates,
  getDistricts,
  getSubDistricts,
  getVillages,
  getVillagesByPincode,
} = require('../controllers/locationController');

router.get('/countries', getCountries);
router.get('/states', getStates);
router.get('/districts', getDistricts);
router.get('/sub-districts', getSubDistricts);
router.get('/villages/by-pincode/:pincode', getVillagesByPincode);
router.get('/villages', getVillages);

module.exports = router;

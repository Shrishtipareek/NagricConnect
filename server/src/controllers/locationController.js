const locationService = require('../services/locationService');

/**
 * GET /api/locations/countries
 */
const getCountries = async (req, res, next) => {
  try {
    const countries = await locationService.getCountries();
    res.status(200).json({
      success: true,
      data: { countries },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/locations/states?countryId=...
 */
const getStates = async (req, res, next) => {
  try {
    const { countryId } = req.query;
    if (!countryId) {
      return res.status(400).json({
        success: false,
        message: 'countryId query parameter is required',
      });
    }

    const states = await locationService.getStates(countryId);
    res.status(200).json({
      success: true,
      data: { states },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/locations/districts?stateId=...
 */
const getDistricts = async (req, res, next) => {
  try {
    const { stateId } = req.query;
    if (!stateId) {
      return res.status(400).json({
        success: false,
        message: 'stateId query parameter is required',
      });
    }

    const districts = await locationService.getDistricts(stateId);
    res.status(200).json({
      success: true,
      data: { districts },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/locations/sub-districts?districtId=...
 */
const getSubDistricts = async (req, res, next) => {
  try {
    const { districtId } = req.query;
    if (!districtId) {
      return res.status(400).json({
        success: false,
        message: 'districtId query parameter is required',
      });
    }

    const subDistricts = await locationService.getSubDistricts(districtId);
    res.status(200).json({
      success: true,
      data: { subDistricts },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/locations/villages?districtId=...&subDistrictId=...&search=...&page=...
 */
const getVillages = async (req, res, next) => {
  try {
    const { districtId, subDistrictId, search, page, limit } = req.query;
    if (!districtId) {
      return res.status(400).json({
        success: false,
        message: 'districtId query parameter is required',
      });
    }

    const result = await locationService.getVillages({
      districtId,
      subDistrictId,
      search,
      page,
      limit,
    });

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/locations/villages/by-pincode/:pincode
 * Smart PIN-Code Assisted Village Lookup
 */
const getVillagesByPincode = async (req, res, next) => {
  try {
    const { pincode } = req.params;
    if (!pincode || !/^\d{6}$/.test(pincode.trim())) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid 6-digit Indian PIN code.',
      });
    }

    const result = await locationService.findVillagesByPincode({ pincode: pincode.trim() });

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCountries,
  getStates,
  getDistricts,
  getSubDistricts,
  getVillages,
  getVillagesByPincode,
};

/**
 * India Post Postal Code Service with In-Memory Caching
 */

const postalCache = new Map();
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Fetch Postal Information by PIN Code from India Post API
 * @param {string} pincode 6-digit Indian Postal PIN Code
 * @returns {Promise<Object|null>} Postal lookup results or null
 */
const getByPincode = async (pincode) => {
  if (!pincode || !/^\d{6}$/.test(pincode.trim())) {
    return null;
  }

  const cleanPin = pincode.trim();
  const now = Date.now();

  // Check in-memory cache
  if (postalCache.has(cleanPin)) {
    const cached = postalCache.get(cleanPin);
    if (cached.expiry > now) {
      return cached.data;
    }
    postalCache.delete(cleanPin);
  }

  try {
    const response = await fetch(`https://api.postalpincode.in/pincode/${cleanPin}`, {
      signal: AbortSignal.timeout(5000),
    });

    if (!response.ok) {
      console.warn(`India Post API returned status ${response.status} for PIN ${cleanPin}`);
      return null;
    }

    const json = await response.json();

    if (!Array.isArray(json) || json.length === 0 || json[0].Status !== 'Success') {
      console.warn(`No postal office records found for PIN ${cleanPin}`);
      return null;
    }

    const postOffices = json[0].PostOffice || [];
    if (postOffices.length === 0) return null;

    const result = {
      pincode: cleanPin,
      stateName: postOffices[0].State || '',
      districtName: postOffices[0].District || '',
      postOffices: postOffices.map((po) => ({
        name: po.Name,
        branchType: po.BranchType,
        deliveryStatus: po.DeliveryStatus,
        district: po.District,
        state: po.State,
        block: po.Block !== 'NA' ? po.Block : '',
        pincode: po.Pincode,
      })),
    };

    // Store in cache
    postalCache.set(cleanPin, {
      data: result,
      expiry: now + CACHE_TTL_MS,
    });

    return result;
  } catch (error) {
    console.error(`Postal service error for PIN ${cleanPin}:`, error.message);
    return null;
  }
};

module.exports = {
  getByPincode,
};

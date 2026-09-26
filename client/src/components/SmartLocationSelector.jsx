import React, { useState, useEffect } from 'react';
import api from '../services/api';
import CascadingLocationSelector from './CascadingLocationSelector';

const SmartLocationSelector = ({ value, onChange, error }) => {
  const [pincode, setPincode] = useState(value?.pincode || '');
  const [loading, setLoading] = useState(false);
  const [postalResults, setPostalResults] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(value || null);
  const [selectedRadioIndex, setSelectedRadioIndex] = useState(null);
  const [showManualFallback, setShowManualFallback] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Sync value from props if updated externally
  useEffect(() => {
    if (value && value.villageId && !selectedLocation) {
      setSelectedLocation(value);
      if (value.pincode) setPincode(value.pincode);
    }
  }, [value]);

  const handlePincodeSearch = async (e) => {
    if (e) e.preventDefault();
    if (!pincode || pincode.trim().length !== 6) {
      setErrorMessage('Please enter a valid 6-digit Indian PIN code.');
      return;
    }

    setLoading(true);
    setErrorMessage('');
    setShowManualFallback(false);
    setPostalResults(null);
    setSelectedLocation(null);
    setSelectedRadioIndex(null);

    try {
      const res = await api.get(`/locations/villages/by-pincode/${pincode.trim()}`);
      const data = res.data.data;

      if (data.matchCount > 0) {
        setPostalResults(data);
        if (data.matchCount === 1) {
          // Exactly 1 village found - auto select
          const loc = data.locations[0];
          setSelectedLocation(loc);
          onChange(loc);
        }
      } else {
        setErrorMessage(
          data.error || "We couldn't automatically identify your village from this PIN."
        );
        setShowManualFallback(true);
      }
    } catch (err) {
      setErrorMessage(
        err.response?.data?.message || 'Location lookup service temporarily unavailable.'
      );
      setShowManualFallback(true);
    } finally {
      setLoading(false);
    }
  };

  const handleRadioConfirm = () => {
    if (selectedRadioIndex === null || !postalResults?.locations[selectedRadioIndex]) return;
    const loc = postalResults.locations[selectedRadioIndex];
    setSelectedLocation(loc);
    onChange(loc);
  };

  const handleResetLocation = () => {
    setSelectedLocation(null);
    setPostalResults(null);
    setSelectedRadioIndex(null);
    setShowManualFallback(false);
    setErrorMessage('');
    onChange(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-1">
        <label className="block text-gray-700 text-sm font-bold">
          Your Location <span className="text-red-500">*</span>
        </label>
        {selectedLocation && (
          <button
            type="button"
            onClick={handleResetLocation}
            className="text-xs text-primary-600 font-semibold hover:underline"
          >
            Change Location
          </button>
        )}
      </div>

      {/* State 1: Confirmed Selected Location */}
      {selectedLocation ? (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="inline-flex items-center text-xs font-bold text-green-700 bg-green-100 px-2.5 py-1 rounded-full">
              ✓ Location Confirmed
            </span>
            <span className="text-xs text-gray-500 font-mono">PIN: {selectedLocation.pincode}</span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-sm mt-3">
            <div>
              <span className="text-xs text-gray-500 block">Village / Gram Panchayat</span>
              <span className="font-bold text-gray-800">{selectedLocation.villageName}</span>
              {selectedLocation.lgdCode && (
                <span className="text-xs text-gray-400 block font-mono">LGD: {selectedLocation.lgdCode}</span>
              )}
            </div>
            <div>
              <span className="text-xs text-gray-500 block">Sub-District / Tehsil</span>
              <span className="font-medium text-gray-700">{selectedLocation.subDistrictName || '—'}</span>
            </div>
            <div>
              <span className="text-xs text-gray-500 block">District</span>
              <span className="font-medium text-gray-700">{selectedLocation.districtName}</span>
            </div>
            <div>
              <span className="text-xs text-gray-500 block">State</span>
              <span className="font-medium text-gray-700">{selectedLocation.stateName}</span>
            </div>
          </div>
        </div>
      ) : (
        /* State 2: Location Input / Search Form */
        <div className="space-y-4">
          {!showManualFallback && (
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                Enter 6-Digit PIN Code
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  maxLength="6"
                  placeholder="e.g. 331001"
                  value={pincode}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '');
                    setPincode(val);
                    if (errorMessage) setErrorMessage('');
                  }}
                  className="flex-grow bg-white border border-gray-300 rounded py-2 px-3 text-gray-800 font-mono tracking-wider focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                />
                <button
                  type="button"
                  onClick={handlePincodeSearch}
                  disabled={loading || pincode.length !== 6}
                  className="bg-primary-600 hover:bg-primary-700 text-white font-bold px-4 py-2 rounded shadow transition-colors disabled:opacity-50 text-sm whitespace-nowrap flex items-center justify-center min-w-[130px]"
                >
                  {loading ? (
                    <span className="inline-flex items-center gap-1">
                      <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                      </svg>
                      Searching...
                    </span>
                  ) : (
                    'Find Location'
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Multiple Village Matches Found */}
          {postalResults && postalResults.matchCount > 1 && !selectedLocation && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-gray-800">
                  We found {postalResults.matchCount} villages for PIN {postalResults.pincode}:
                </p>
                <span className="text-xs text-gray-500">Select your village</span>
              </div>

              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {postalResults.locations.map((loc, idx) => (
                  <label
                    key={loc.villageId}
                    className={`flex items-start p-3 rounded-lg border cursor-pointer transition-all ${
                      selectedRadioIndex === idx
                        ? 'border-primary-500 bg-primary-50 ring-1 ring-primary-500'
                        : 'border-gray-200 bg-white hover:bg-gray-100'
                    }`}
                  >
                    <input
                      type="radio"
                      name="villageOption"
                      checked={selectedRadioIndex === idx}
                      onChange={() => setSelectedRadioIndex(idx)}
                      className="mt-1 h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                    />
                    <div className="ml-3 text-sm">
                      <p className="font-bold text-gray-900">{loc.villageName}</p>
                      <p className="text-xs text-gray-600">
                        {loc.subDistrictName ? `${loc.subDistrictName}, ` : ''}{loc.districtName}, {loc.stateName}
                      </p>
                    </div>
                  </label>
                ))}
              </div>

              <button
                type="button"
                onClick={handleRadioConfirm}
                disabled={selectedRadioIndex === null}
                className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-2 rounded text-sm disabled:opacity-50 transition-colors shadow"
              >
                Confirm Selected Village
              </button>
            </div>
          )}

          {/* Error Message & Manual Fallback Button */}
          {errorMessage && (
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 rounded text-xs text-yellow-800">
              <p className="font-semibold">{errorMessage}</p>
              {!showManualFallback && (
                <button
                  type="button"
                  onClick={() => setShowManualFallback(true)}
                  className="mt-1 text-primary-700 underline font-bold hover:text-primary-900 block"
                >
                  Can't find your village? Search manually →
                </button>
              )}
            </div>
          )}

          {/* Manual Cascading Fallback */}
          {showManualFallback && (
            <div className="border-t pt-4 space-y-2">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-bold text-gray-700">Manual Location Selector</span>
                <button
                  type="button"
                  onClick={() => setShowManualFallback(false)}
                  className="text-xs text-primary-600 hover:underline"
                >
                  ← Try PIN Search Again
                </button>
              </div>
              <CascadingLocationSelector
                value={value}
                onChange={(locPayload) => {
                  setSelectedLocation(locPayload);
                  onChange(locPayload);
                }}
              />
            </div>
          )}
        </div>
      )}

      {(error || (!selectedLocation && !showManualFallback && !postalResults)) && (
        <p className="text-xs text-gray-500 mt-1">
          {error || 'Enter your 6-digit PIN code to automatically locate your Gram Panchayat.'}
        </p>
      )}
    </div>
  );
};

export default SmartLocationSelector;

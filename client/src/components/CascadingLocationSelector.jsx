import React, { useState, useEffect } from 'react';
import api from '../services/api';

const CascadingLocationSelector = ({ value, onChange, error }) => {
  // Options State
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [subDistricts, setSubDistricts] = useState([]);
  const [villages, setVillages] = useState([]);

  // Selected Items State
  const [selectedCountry, setSelectedCountry] = useState(value?.countryId || 'IN');
  const [selectedState, setSelectedState] = useState(value?.stateId || '');
  const [selectedDistrict, setSelectedDistrict] = useState(value?.districtId || '');
  const [selectedSubDistrict, setSelectedSubDistrict] = useState(value?.subDistrictId || '');
  const [selectedVillage, setSelectedVillage] = useState(value?.villageId || '');

  // Loading States
  const [loadingCountries, setLoadingCountries] = useState(false);
  const [loadingStates, setLoadingStates] = useState(false);
  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const [loadingSubDistricts, setLoadingSubDistricts] = useState(false);
  const [loadingVillages, setLoadingVillages] = useState(false);

  // Search filter for villages
  const [villageSearch, setVillageSearch] = useState('');

  // 1. Fetch Countries on Mount
  useEffect(() => {
    const fetchCountries = async () => {
      setLoadingCountries(true);
      try {
        const res = await api.get('/locations/countries');
        const list = res.data.data.countries || [];
        setCountries(list);
        
        // Default to India if available
        if (!selectedCountry) {
          const india = list.find((c) => c.id === 'IN');
          if (india) setSelectedCountry('IN');
        }
      } catch (err) {
        console.error('Failed to load countries:', err);
      } finally {
        setLoadingCountries(false);
      }
    };
    fetchCountries();
  }, []);

  // 2. Fetch States when Country Changes
  useEffect(() => {
    if (!selectedCountry) {
      setStates([]);
      setSelectedState('');
      return;
    }

    const fetchStates = async () => {
      setLoadingStates(true);
      try {
        const res = await api.get(`/locations/states?countryId=${selectedCountry}`);
        setStates(res.data.data.states || []);
      } catch (err) {
        console.error('Failed to load states:', err);
        setStates([]);
      } finally {
        setLoadingStates(false);
      }
    };
    fetchStates();
  }, [selectedCountry]);

  // 3. Fetch Districts when State Changes
  useEffect(() => {
    if (!selectedState) {
      setDistricts([]);
      setSelectedDistrict('');
      return;
    }

    const fetchDistricts = async () => {
      setLoadingDistricts(true);
      try {
        const res = await api.get(`/locations/districts?stateId=${selectedState}`);
        setDistricts(res.data.data.districts || []);
      } catch (err) {
        console.error('Failed to load districts:', err);
        setDistricts([]);
      } finally {
        setLoadingDistricts(false);
      }
    };
    fetchDistricts();
  }, [selectedState]);

  // 4. Fetch Sub-Districts & Villages when District Changes
  useEffect(() => {
    if (!selectedDistrict) {
      setSubDistricts([]);
      setVillages([]);
      setSelectedSubDistrict('');
      setSelectedVillage('');
      return;
    }

    const fetchSubDistrictsAndVillages = async () => {
      setLoadingSubDistricts(true);
      try {
        const subRes = await api.get(`/locations/sub-districts?districtId=${selectedDistrict}`);
        setSubDistricts(subRes.data.data.subDistricts || []);
      } catch (err) {
        setSubDistricts([]);
      } finally {
        setLoadingSubDistricts(false);
      }

      fetchVillagesList(selectedDistrict, selectedSubDistrict, villageSearch);
    };

    fetchSubDistrictsAndVillages();
  }, [selectedDistrict]);

  // 5. Fetch Villages when SubDistrict or Search query changes
  const fetchVillagesList = async (distId, subDistId, query = '') => {
    if (!distId) return;
    setLoadingVillages(true);
    try {
      let url = `/locations/villages?districtId=${distId}`;
      if (subDistId) url += `&subDistrictId=${subDistId}`;
      if (query.trim()) url += `&search=${encodeURIComponent(query.trim())}`;

      const res = await api.get(url);
      setVillages(res.data.data.villages || []);
    } catch (err) {
      console.error('Failed to load villages:', err);
      setVillages([]);
    } finally {
      setLoadingVillages(false);
    }
  };

  // Debounced Village Search Handler
  useEffect(() => {
    if (!selectedDistrict) return;
    const timer = setTimeout(() => {
      fetchVillagesList(selectedDistrict, selectedSubDistrict, villageSearch);
    }, 300);
    return () => clearTimeout(timer);
  }, [villageSearch, selectedSubDistrict]);

  // Notify parent component on selection changes
  const emitLocationChange = (cId, sId, dId, subId, vId) => {
    const cObj = countries.find((c) => c.id === cId);
    const sObj = states.find((s) => s.id === sId);
    const dObj = districts.find((d) => d.id === dId);
    const subObj = subDistricts.find((sub) => sub.id === subId);
    const vObj = villages.find((v) => v.id === vId);

    const locationPayload = {
      countryId: cId,
      countryName: cObj ? cObj.name : '',
      stateId: sId,
      stateName: sObj ? sObj.name : '',
      districtId: dId,
      districtName: dObj ? dObj.name : '',
      subDistrictId: subId,
      subDistrictName: subObj ? subObj.name : '',
      villageId: vId,
      villageName: vObj ? vObj.name : '',
      lgdCode: vObj ? vObj.lgdCode : '',
    };

    onChange(locationPayload);
  };

  // Event Handlers for Cascade Resets
  const handleCountryChange = (e) => {
    const cId = e.target.value;
    setSelectedCountry(cId);
    setSelectedState('');
    setSelectedDistrict('');
    setSelectedSubDistrict('');
    setSelectedVillage('');
    setVillageSearch('');
    emitLocationChange(cId, '', '', '', '');
  };

  const handleStateChange = (e) => {
    const sId = e.target.value;
    setSelectedState(sId);
    setSelectedDistrict('');
    setSelectedSubDistrict('');
    setSelectedVillage('');
    setVillageSearch('');
    emitLocationChange(selectedCountry, sId, '', '', '');
  };

  const handleDistrictChange = (e) => {
    const dId = e.target.value;
    setSelectedDistrict(dId);
    setSelectedSubDistrict('');
    setSelectedVillage('');
    setVillageSearch('');
    emitLocationChange(selectedCountry, selectedState, dId, '', '');
  };

  const handleSubDistrictChange = (e) => {
    const subId = e.target.value;
    setSelectedSubDistrict(subId);
    setSelectedVillage('');
    emitLocationChange(selectedCountry, selectedState, selectedDistrict, subId, '');
  };

  const handleVillageChange = (e) => {
    const vId = e.target.value;
    setSelectedVillage(vId);
    emitLocationChange(selectedCountry, selectedState, selectedDistrict, selectedSubDistrict, vId);
  };

  return (
    <div className="space-y-4">
      {/* 1. Country Selection */}
      <div>
        <label className="block text-gray-700 text-sm font-bold mb-1">
          Country <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <select
            value={selectedCountry}
            onChange={handleCountryChange}
            disabled={loadingCountries}
            required
            className="w-full bg-white border border-gray-300 rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 disabled:bg-gray-100"
          >
            <option value="">-- Select Country --</option>
            {countries.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          {loadingCountries && (
            <span className="absolute right-3 top-2.5 text-xs text-gray-400">Loading...</span>
          )}
        </div>
      </div>

      {/* 2. State Selection */}
      <div>
        <label className="block text-gray-700 text-sm font-bold mb-1">
          State <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <select
            value={selectedState}
            onChange={handleStateChange}
            disabled={!selectedCountry || loadingStates}
            required
            className="w-full bg-white border border-gray-300 rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 disabled:bg-gray-100"
          >
            <option value="">
              {!selectedCountry
                ? 'Select a Country first'
                : loadingStates
                ? 'Loading States...'
                : '-- Select State --'}
            </option>
            {states.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} {s.lgdCode ? `(LGD: ${s.lgdCode})` : ''}
              </option>
            ))}
          </select>
          {loadingStates && (
            <span className="absolute right-3 top-2.5 text-xs text-primary-600">Loading...</span>
          )}
        </div>
      </div>

      {/* 3. District Selection */}
      <div>
        <label className="block text-gray-700 text-sm font-bold mb-1">
          District <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <select
            value={selectedDistrict}
            onChange={handleDistrictChange}
            disabled={!selectedState || loadingDistricts}
            required
            className="w-full bg-white border border-gray-300 rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 disabled:bg-gray-100"
          >
            <option value="">
              {!selectedState
                ? 'Select a State first'
                : loadingDistricts
                ? 'Loading Districts...'
                : '-- Select District --'}
            </option>
            {districts.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name} {d.lgdCode ? `(LGD: ${d.lgdCode})` : ''}
              </option>
            ))}
          </select>
          {loadingDistricts && (
            <span className="absolute right-3 top-2.5 text-xs text-primary-600">Loading...</span>
          )}
        </div>
      </div>

      {/* 4. Sub-District / Tehsil Selection (If present) */}
      {subDistricts.length > 0 && (
        <div>
          <label className="block text-gray-700 text-sm font-semibold mb-1">
            Sub-District / Tehsil / Block <span className="text-xs font-normal text-gray-500">(Optional)</span>
          </label>
          <select
            value={selectedSubDistrict}
            onChange={handleSubDistrictChange}
            disabled={!selectedDistrict || loadingSubDistricts}
            className="w-full bg-white border border-gray-300 rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:border-primary-500 disabled:bg-gray-100"
          >
            <option value="">-- All Sub-Districts / Tehsils --</option>
            {subDistricts.map((sub) => (
              <option key={sub.id} value={sub.id}>
                {sub.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* 5. Village Selection with Search */}
      <div>
        <label className="block text-gray-700 text-sm font-bold mb-1">
          Village / Gram Panchayat <span className="text-red-500">*</span>
        </label>
        
        {/* Search input for large village lists */}
        {selectedDistrict && (
          <div className="mb-2">
            <input
              type="text"
              placeholder="🔍 Search village by name or LGD code..."
              value={villageSearch}
              onChange={(e) => setVillageSearch(e.target.value)}
              className="w-full bg-gray-50 border border-gray-300 text-xs rounded py-1.5 px-3 text-gray-700 focus:outline-none focus:bg-white focus:border-primary-500"
            />
          </div>
        )}

        <div className="relative">
          <select
            value={selectedVillage}
            onChange={handleVillageChange}
            disabled={!selectedDistrict || loadingVillages}
            required
            className="w-full bg-white border border-gray-300 rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 disabled:bg-gray-100"
          >
            <option value="">
              {!selectedDistrict
                ? 'Select a District first'
                : loadingVillages
                ? 'Loading Villages...'
                : villages.length === 0
                ? 'No villages found for this selection'
                : '-- Select Village --'}
            </option>
            {villages.map((v) => (
              <option key={v.id} value={v.id}>
                {v.name} {v.lgdCode ? `(LGD: ${v.lgdCode})` : ''} {v.subDistrictName ? `— ${v.subDistrictName}` : ''}
              </option>
            ))}
          </select>
          {loadingVillages && (
            <span className="absolute right-3 top-2.5 text-xs text-primary-600">Loading...</span>
          )}
        </div>

        {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
      </div>
    </div>
  );
};

export default CascadingLocationSelector;

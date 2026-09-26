import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-toastify';
import CascadingLocationSelector from '../components/CascadingLocationSelector';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    role: 'CITIZEN',
    ward: '',
    location: null,
  });

  const [locationError, setLocationError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLocationChange = (locationPayload) => {
    setFormData((prev) => ({
      ...prev,
      location: locationPayload,
      villageId: locationPayload.villageId,
    }));
    if (locationPayload.villageId) {
      setLocationError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.location || !formData.location.villageId) {
      setLocationError('Please select Country, State, District, and Village.');
      toast.error('Please complete all required location fields.');
      return;
    }

    setLoading(true);
    try {
      await register(formData);
      if (formData.role === 'SARPANCH') {
        toast.success('Registration successful! Please wait for admin approval.');
        navigate('/login');
      } else {
        toast.success('Registration successful! Welcome to Nagric Connect.');
        navigate('/dashboard');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50 py-12 px-4">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-lg w-full max-w-lg border border-gray-100">
        <h2 className="text-2xl font-bold mb-6 text-center text-primary-700">Register as Citizen</h2>

        <div className="space-y-4">
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-1">Name *</label>
            <input
              type="text"
              name="name"
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
            />
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-bold mb-1">Email *</label>
            <input
              type="email"
              name="email"
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
            />
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-bold mb-1">Phone *</label>
            <input
              type="text"
              name="phone"
              onChange={handleChange}
              required
              pattern="[6-9][0-9]{9}"
              title="10-digit Indian mobile number"
              className="w-full border border-gray-300 rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
            />
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-bold mb-1">Password *</label>
            <input
              type="password"
              name="password"
              onChange={handleChange}
              required
              minLength="8"
              className="w-full border border-gray-300 rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
            />
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-bold mb-1">Register As</label>
            <select
              name="role"
              onChange={handleChange}
              required
              className="w-full bg-white border border-gray-300 rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
            >
              <option value="CITIZEN">Citizen</option>
              <option value="SARPANCH">Sarpanch</option>
            </select>
          </div>

          {/* Cascading Location Selector (Country -> State -> District -> Sub-District -> Village) */}
          <div className="pt-2 border-t border-gray-200">
            <CascadingLocationSelector
              value={formData.location}
              onChange={handleLocationChange}
              error={locationError}
            />
          </div>

          {formData.role === 'CITIZEN' && (
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-1">Ward Number / Name</label>
              <input
                type="text"
                name="ward"
                onChange={handleChange}
                placeholder="e.g. Ward 4"
                className="w-full border border-gray-300 rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
              />
            </div>
          )}

          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className="bg-primary-600 hover:bg-primary-700 text-white font-bold py-2.5 px-4 rounded focus:outline-none focus:ring-2 focus:ring-primary-500 w-full shadow transition-colors disabled:opacity-50"
            >
              {loading ? 'Submitting Registration...' : 'Register'}
            </button>
          </div>

          <div className="text-center mt-4">
            <Link
              to="/login"
              className="inline-block align-baseline font-bold text-sm text-primary-600 hover:text-primary-800"
            >
              Already have an account? Login
            </Link>
          </div>
        </div>
      </form>
    </div>
  );
};

export default Register;

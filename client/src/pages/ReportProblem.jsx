import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { toast } from 'react-toastify';

const categories = [
  'Road', 'Street Light', 'Water Supply', 'Drainage',
  'Garbage', 'Electricity', 'Public Toilet', 'Government Service',
  'School', 'Health', 'Agriculture', 'Other',
];

const ReportProblem = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    address: '',
    ward: '',
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/complaints', formData);
      toast.success('Complaint submitted successfully');
      navigate('/my-complaints');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit complaint');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-2xl mx-auto bg-white p-8 rounded shadow">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Report a Problem</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">Title *</label>
            <input type="text" name="title" onChange={handleChange} required className="w-full border p-2 rounded" />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">Category *</label>
            <select name="category" onChange={handleChange} required className="w-full border p-2 rounded">
              <option value="">Select a category</option>
              {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">Description *</label>
            <textarea name="description" onChange={handleChange} required rows="4" className="w-full border p-2 rounded"></textarea>
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">Area / Address</label>
            <input type="text" name="address" onChange={handleChange} className="w-full border p-2 rounded" />
          </div>
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2">Ward</label>
            <input type="text" name="ward" onChange={handleChange} className="w-full border p-2 rounded" />
          </div>
          <button type="submit" disabled={loading} className="w-full bg-primary-600 text-white p-2 rounded hover:bg-primary-700 disabled:opacity-50">
            {loading ? 'Submitting...' : 'Submit Complaint'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ReportProblem;

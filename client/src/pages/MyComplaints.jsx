import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Link } from 'react-router-dom';

const MyComplaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        const res = await api.get('/complaints/my');
        setComplaints(res.data.data.complaints);
      } catch (error) {
        console.error("Failed to fetch complaints:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchComplaints();
  }, []);

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">My Complaints</h1>
          <Link to="/dashboard" className="text-primary-600 hover:underline">Back to Dashboard</Link>
        </div>

        {complaints.length === 0 ? (
          <div className="bg-white p-8 rounded shadow text-center">
            <p className="text-gray-500 mb-4">You haven't reported any problems yet.</p>
            <Link to="/report-problem" className="px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700">
              Report a Problem
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {complaints.map(comp => (
              <div key={comp._id} className="bg-white p-6 rounded shadow border-l-4 border-primary-500">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-bold">{comp.title}</h3>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    comp.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                    comp.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {comp.status}
                  </span>
                </div>
                <p className="text-sm text-gray-500 mb-4">ID: {comp.complaintId} | Category: {comp.category} | Date: {new Date(comp.createdAt).toLocaleDateString()}</p>
                <p className="text-gray-700">{comp.description}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyComplaints;

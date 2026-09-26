import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';

const CitizenDashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [stats, setStats] = useState({ pending: 0, inProgress: 0, completed: 0 });

  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        const res = await api.get('/complaints/my?limit=100');
        const complaints = res.data.data.complaints;
        let p = 0, i = 0, c = 0;
        complaints.forEach(comp => {
          if (comp.status === 'PENDING') p++;
          if (comp.status === 'IN_PROGRESS') i++;
          if (comp.status === 'COMPLETED') c++;
        });
        setStats({ pending: p, inProgress: i, completed: c });
      } catch (error) {
        console.error("Failed to load complaints:", error);
      }
    };
    fetchComplaints();
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Welcome, {user?.name}</h1>
            <p className="text-gray-600 mt-1">Village: {user?.villageId?.name}</p>
          </div>
          <button onClick={handleLogout} className="text-red-600 font-semibold hover:underline">Logout</button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow border-l-4 border-yellow-500">
            <h3 className="text-gray-500 text-sm">Pending</h3>
            <p className="text-3xl font-bold">{stats.pending}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow border-l-4 border-blue-500">
            <h3 className="text-gray-500 text-sm">In Progress</h3>
            <p className="text-3xl font-bold">{stats.inProgress}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow border-l-4 border-green-500">
            <h3 className="text-gray-500 text-sm">Completed</h3>
            <p className="text-3xl font-bold">{stats.completed}</p>
          </div>
        </div>

        <div className="flex space-x-4 mb-8">
          <Link to="/report-problem" className="px-6 py-3 bg-primary-600 text-white rounded shadow hover:bg-primary-700">
            + Report a Problem
          </Link>
          <Link to="/my-complaints" className="px-6 py-3 bg-white text-primary-600 border border-primary-600 rounded shadow hover:bg-gray-50">
            View My Complaints
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CitizenDashboard;

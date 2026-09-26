import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';

const AdminDashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await api.get('/admin/dashboard');
        setData(res.data.data);
      } catch (error) {
        console.error("Failed to load admin dashboard:", error);
      }
    };
    fetchDashboard();
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Good Morning, Sarpanch</h1>
            <p className="text-gray-600 mt-1">Village: {user?.villageId?.name}</p>
          </div>
          <button onClick={handleLogout} className="text-red-600 font-semibold hover:underline">Logout</button>
        </div>

        {data && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white p-6 rounded-lg shadow border-t-4 border-gray-500">
                <h3 className="text-gray-500 text-sm">Total Complaints</h3>
                <p className="text-3xl font-bold">{data.stats.total}</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow border-t-4 border-yellow-500">
                <h3 className="text-gray-500 text-sm">Pending</h3>
                <p className="text-3xl font-bold">{data.stats.pending}</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow border-t-4 border-blue-500">
                <h3 className="text-gray-500 text-sm">In Progress</h3>
                <p className="text-3xl font-bold">{data.stats.inProgress}</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow border-t-4 border-green-500">
                <h3 className="text-gray-500 text-sm">Completed</h3>
                <p className="text-3xl font-bold">{data.stats.completed}</p>
              </div>
            </div>

            <div className="mb-8">
              <Link to="/admin/complaints" className="px-6 py-3 bg-primary-600 text-white rounded shadow hover:bg-primary-700">
                View All Complaints
              </Link>
            </div>
            
            <div className="bg-white p-6 rounded shadow">
              <h2 className="text-xl font-semibold mb-4">Recent Complaints</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b">
                      <th className="py-2">ID</th>
                      <th className="py-2">Title</th>
                      <th className="py-2">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.recentComplaints.map(comp => (
                      <tr key={comp._id} className="border-b">
                        <td className="py-2">{comp.complaintId}</td>
                        <td className="py-2">{comp.title}</td>
                        <td className="py-2">{comp.status}</td>
                      </tr>
                    ))}
                    {data.recentComplaints.length === 0 && (
                      <tr>
                        <td colSpan="3" className="py-4 text-center text-gray-500">No complaints yet.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;

import React, { useEffect, useState, useContext } from 'react';
import api from '../../services/api';
import { AuthContext } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const SuperAdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [villages, setVillages] = useState([]);
  const [pendingSarpanchs, setPendingSarpanchs] = useState([]);
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [statsRes, villagesRes, pendingRes] = await Promise.all([
        api.get('/super-admin/dashboard'),
        api.get('/super-admin/villages'),
        api.get('/super-admin/sarpanch/pending'),
      ]);
      setStats(statsRes.data.data);
      setVillages(villagesRes.data.data.villages);
      setPendingSarpanchs(pendingRes.data.data.sarpanchs);
    } catch (error) {
      console.error('Failed to fetch super admin data', error);
    }
  };

  const handleApprove = async (id) => {
    try {
      await api.patch(`/super-admin/sarpanch/${id}/manage`, { status: 'APPROVED' });
      toast.success('Sarpanch approved');
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to approve');
    }
  };

  const handleReject = async (id) => {
    try {
      await api.patch(`/super-admin/sarpanch/${id}/manage`, { status: 'REJECTED' });
      toast.success('Sarpanch rejected');
      fetchData();
    } catch (error) {
      toast.error('Failed to reject');
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Super Admin Dashboard</h1>
          <button onClick={handleLogout} className="text-red-600 font-semibold hover:underline">Logout</button>
        </div>

        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded shadow border-t-4 border-indigo-500">
              <h3 className="text-gray-500">Total Villages</h3>
              <p className="text-3xl font-bold">{stats.totalVillages} ({stats.activeVillages} active)</p>
            </div>
            <div className="bg-white p-6 rounded shadow border-t-4 border-blue-500">
              <h3 className="text-gray-500">Total Citizens</h3>
              <p className="text-3xl font-bold">{stats.totalCitizens}</p>
            </div>
            <div className="bg-white p-6 rounded shadow border-t-4 border-yellow-500">
              <h3 className="text-gray-500">Pending Sarpanchs</h3>
              <p className="text-3xl font-bold">{stats.pendingSarpanch}</p>
            </div>
          </div>
        )}

        <div className="bg-white p-6 rounded shadow mb-8">
          <h2 className="text-xl font-bold mb-4">Pending Sarpanch Approvals</h2>
          {pendingSarpanchs.length === 0 ? (
            <p className="text-gray-500">No pending approvals.</p>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b bg-gray-100">
                  <th className="p-3">Name</th>
                  <th className="p-3">Village</th>
                  <th className="p-3">Phone</th>
                  <th className="p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {pendingSarpanchs.map(s => (
                  <tr key={s._id} className="border-b">
                    <td className="p-3">{s.name}</td>
                    <td className="p-3">{s.villageId?.name}</td>
                    <td className="p-3">{s.phone}</td>
                    <td className="p-3 space-x-2">
                      <button onClick={() => handleApprove(s._id)} className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600">Approve</button>
                      <button onClick={() => handleReject(s._id)} className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600">Reject</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="bg-white p-6 rounded shadow">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Villages</h2>
          </div>
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b bg-gray-100">
                <th className="p-3">Code</th>
                <th className="p-3">Name</th>
                <th className="p-3">Citizens</th>
                <th className="p-3">Complaints</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {villages.map(v => (
                <tr key={v._id} className="border-b">
                  <td className="p-3">{v.villageCode}</td>
                  <td className="p-3">{v.name}</td>
                  <td className="p-3">{v.citizensCount}</td>
                  <td className="p-3">{v.complaintsCount}</td>
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded text-xs text-white ${v.isActive ? 'bg-green-500' : 'bg-red-500'}`}>
                      {v.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;

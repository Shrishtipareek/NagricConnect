import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';

const AdminComplaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    try {
      const res = await api.get('/admin/complaints?limit=100');
      setComplaints(res.data.data.complaints);
    } catch (error) {
      console.error("Failed to fetch complaints:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, newStatus) => {
    try {
      await api.patch(`/admin/complaints/${id}/status`, {
        status: newStatus,
        message: `Admin updated status to ${newStatus}`
      });
      toast.success('Status updated successfully');
      fetchComplaints(); // refresh
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">All Complaints</h1>
          <Link to="/admin/dashboard" className="text-primary-600 hover:underline">Back to Dashboard</Link>
        </div>

        <div className="bg-white p-6 rounded shadow overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b bg-gray-100">
                <th className="p-3">ID</th>
                <th className="p-3">Title</th>
                <th className="p-3">Category</th>
                <th className="p-3">Citizen</th>
                <th className="p-3">Status</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {complaints.map(comp => (
                <tr key={comp._id} className="border-b hover:bg-gray-50">
                  <td className="p-3 text-sm">{comp.complaintId}</td>
                  <td className="p-3 font-semibold">{comp.title}</td>
                  <td className="p-3 text-sm">{comp.category}</td>
                  <td className="p-3 text-sm">{comp.citizen?.name}</td>
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${
                      comp.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                      comp.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {comp.status}
                    </span>
                  </td>
                  <td className="p-3">
                    <select 
                      value={comp.status}
                      onChange={(e) => updateStatus(comp._id, e.target.value)}
                      className="border rounded p-1 text-sm bg-white"
                      disabled={comp.status === 'COMPLETED'}
                    >
                      <option value="PENDING">Pending</option>
                      <option value="IN_PROGRESS">In Progress</option>
                      <option value="COMPLETED">Completed</option>
                    </select>
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

export default AdminComplaints;

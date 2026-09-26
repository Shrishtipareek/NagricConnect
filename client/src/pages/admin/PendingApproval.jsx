import React, { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const PendingApproval = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-6">
      <div className="max-w-md w-full bg-white p-8 rounded shadow text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Approval Pending</h2>
        <p className="text-gray-600 mb-6">
          Your Sarpanch account for <strong>{user?.villageId?.name}</strong> is currently pending approval by the platform administrator.
        </p>
        <p className="text-gray-600 mb-8">
          You will be able to access the dashboard once your account is verified.
        </p>
        <button onClick={handleLogout} className="px-6 py-2 bg-primary-600 text-white rounded shadow hover:bg-primary-700">
          Logout
        </button>
      </div>
    </div>
  );
};

export default PendingApproval;

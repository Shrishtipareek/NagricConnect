import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const AdminRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (!user || user.role !== 'SARPANCH') {
    return <Navigate to="/" replace />;
  }

  if (user.sarpanchStatus !== 'APPROVED') {
    return <Navigate to="/admin/pending" replace />;
  }

  return children;
};

export default AdminRoute;

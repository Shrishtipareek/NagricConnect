import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-4xl font-bold text-primary-700 mb-4">NagrikConnect</h1>
      <p className="text-lg text-gray-600 mb-8 text-center max-w-2xl">
        Your Voice. Your Village. Your Connection. Report local problems, stay informed, and track the progress of issues in your village.
      </p>
      <div className="space-x-4">
        <Link to="/login" className="px-6 py-2 bg-primary-600 text-white rounded shadow hover:bg-primary-700 transition">Login</Link>
        <Link to="/register" className="px-6 py-2 bg-white text-primary-600 border border-primary-600 rounded shadow hover:bg-gray-50 transition">Register</Link>
      </div>
    </div>
  );
};

export default Home;

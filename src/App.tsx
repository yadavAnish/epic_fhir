import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router';
import { useEpicAuth } from './useEpicAuth';
import { generateAuthorizationUrl } from './auth';
import PatientDashboard from '../src/Dashboard';
import Callback from '../src/Callback'; // ✅ You must have this file
import './App.css';

const Home: React.FC = () => {
  const { tokenResponse, loading } = useEpicAuth();

  const initiateEpicLogin = async () => {
    const url = await generateAuthorizationUrl();
    window.location.href = url;
  };

  if (loading) return <div className="p-6">Loading...</div>;

  return tokenResponse ? (
    <div className="p-6">
      <h1 className="text-xl font-bold">Welcome!</h1>
      <p><strong>Access Token:</strong> {tokenResponse.access_token}</p>
      <p><strong>Patient ID:</strong> {tokenResponse.patient}</p>
    </div>
  ) : (
    <div className="p-6">
      <button onClick={initiateEpicLogin} className="px-6 py-2 bg-blue-600 text-white rounded">
        Sign in with Epic
      </button>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/callback" element={<Callback />} /> {/* ✅ REQUIRED */}
        <Route path="/dashboard" element={<PatientDashboard />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;

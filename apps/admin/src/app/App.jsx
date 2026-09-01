import React from 'react';
import { Routes, Route } from 'react-router-dom';

export default function App() {
  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-8">
      <div className="bg-slate-800 shadow rounded p-8 max-w-lg w-full text-center border-t-4 border-sale">
        <h1 className="text-2xl font-bold mb-4 text-white">Admin Portal</h1>
        <p className="text-gray-400">This is the Admin Micro-Frontend App.</p>
        <p className="text-sm mt-4 text-sale">Running on Port 5176</p>
      </div>
    </div>
  );
}

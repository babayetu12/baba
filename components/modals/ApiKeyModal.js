import React, { useState } from 'react';

export default function ApiKeyModal({ onSave }) {
  const [key, setKey] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (key.trim()) {
      onSave(key.trim());
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-900 z-50 flex justify-center items-center p-4 animate-fadeIn">
      <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-md p-6">
        <h2 className="text-xl font-bold mb-2">Welcome to Zenith Focus</h2>
        <p className="text-gray-400 mb-4">To enable AI-powered features like inspirational quotes, please enter your Google Gemini API key.</p>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="apiKey" className="block text-gray-300 mb-2">Gemini API Key</label>
            <input
              type="password"
              id="apiKey"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              className="w-full bg-gray-700 text-white rounded-md p-2 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              required
              placeholder="Enter your API key here"
            />
          </div>
           <p className="text-xs text-gray-500 mb-6">
              You can get a free key from Google AI Studio. Your key is stored only in your browser's local storage.
            </p>
          <div className="flex justify-end">
            <button type="submit" className="py-2 px-4 bg-cyan-500 hover:bg-cyan-600 rounded-md transition font-semibold">Save and Start</button>
          </div>
        </form>
      </div>
    </div>
  );
}

'use client';

import type React from 'react';
import { useState } from 'react';

// Declare chrome if it's not available in the environment (e.g., testing)
declare const chrome: any;

interface BirthdateFormProps {
  onSubmit: (date: Date) => void;
}

export default function BirthdateForm({ onSubmit }: BirthdateFormProps) {
  const [date, setDate] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!date) {
      setError('Please enter your birth date');
      return;
    }

    const birthDate = new Date(date);
    const today = new Date();

    if (birthDate > today) {
      setError('Birth date cannot be in the future');
      return;
    }

    // Store name if provided
    if (name.trim()) {
      try {
        chrome.storage.sync.set({ name: name.trim() });
      } catch (e) {
        console.warn('Chrome storage not available.', e);
      }
    }

    onSubmit(birthDate);
  };

  return (
    <div className="bg-gray-800 p-8 rounded-lg shadow-lg max-w-md w-full">
      <h2 className="text-2xl font-bold mb-6 text-center">
        Welcome to Life in Weeks
      </h2>
      <p className="mb-6 text-gray-400">
        To visualize your life in weeks, we need to know when you were born.
        This information is stored locally and never shared.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium mb-1">
            Your Name (optional)
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-2 rounded-md border border-gray-600 bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="Enter your name"
          />
        </div>

        <div>
          <label htmlFor="birthdate" className="block text-sm font-medium mb-1">
            Your birth date
          </label>
          <input
            type="date"
            id="birthdate"
            value={date}
            onChange={(e) => {
              setDate(e.target.value);
              setError('');
            }}
            className="w-full px-4 py-2 rounded-md border border-gray-600 bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary"
            max={new Date().toISOString().split('T')[0]}
          />
          {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
        </div>

        <button
          type="submit"
          className="w-full bg-primary hover:bg-primary/90 text-white font-medium py-2 px-4 rounded-md transition-colors"
        >
          Get Started
        </button>
      </form>
    </div>
  );
}

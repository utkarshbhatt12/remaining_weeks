'use client';

import type React from 'react';
import { useState, useEffect } from 'react';
import { X, Palette } from 'lucide-react';
import ThemeSelector from './ThemeSelector';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (name: string, birthDate: Date, lifeExpectancy: number) => void;
  initialName: string;
  initialBirthDate: Date;
  initialLifeExpectancy: number;
}

const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialName,
  initialBirthDate,
  initialLifeExpectancy = 80,
}) => {
  const [name, setName] = useState(initialName);
  const [birthDate, setBirthDate] = useState(
    initialBirthDate.toISOString().split('T')[0],
  );
  const [lifeExpectancy, setLifeExpectancy] = useState(
    initialLifeExpectancy.toString(),
  );
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'general' | 'appearance'>(
    'general',
  );

  useEffect(() => {
    // Reset form when modal opens
    if (isOpen) {
      setName(initialName);
      setBirthDate(initialBirthDate.toISOString().split('T')[0]);
      setLifeExpectancy(initialLifeExpectancy.toString());
      setError('');
      setActiveTab('general');
    }
  }, [isOpen, initialName, initialBirthDate, initialLifeExpectancy]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      setError('Please enter your name');
      return;
    }

    if (!birthDate) {
      setError('Please enter your birth date');
      return;
    }

    const birthDateObj = new Date(birthDate);
    const today = new Date();

    if (birthDateObj > today) {
      setError('Birth date cannot be in the future');
      return;
    }

    // Validate life expectancy
    const lifeExpectancyNum = Number.parseInt(lifeExpectancy, 10);
    if (
      isNaN(lifeExpectancyNum) ||
      lifeExpectancyNum <= 0 ||
      lifeExpectancyNum > 150
    ) {
      setError('Please enter a valid life expectancy between 1 and 150');
      return;
    }

    onSave(name.trim(), birthDateObj, lifeExpectancyNum);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-lg shadow-lg max-w-md w-full text-card-foreground">
        <div className="flex justify-between items-center p-4 border-b border-border">
          <h2 className="text-xl font-bold">Settings</h2>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground"
          >
            <X size={24} />
          </button>
        </div>

        <div className="flex border-b border-border">
          <button
            className={`px-4 py-2 font-medium text-sm ${
              activeTab === 'general'
                ? 'border-b-2 border-primary text-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
            onClick={() => setActiveTab('general')}
          >
            General
          </button>
          <button
            className={`px-4 py-2 font-medium text-sm flex items-center ${
              activeTab === 'appearance'
                ? 'border-b-2 border-primary text-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
            onClick={() => setActiveTab('appearance')}
          >
            <Palette size={16} className="mr-1" /> Appearance
          </button>
        </div>

        <div className="p-4">
          {activeTab === 'general' ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium mb-1"
                >
                  Your Name
                </label>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    setError('');
                  }}
                  className="w-full px-4 py-2 rounded-md border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Enter your name"
                />
              </div>

              <div>
                <label
                  htmlFor="birthdate"
                  className="block text-sm font-medium mb-1"
                >
                  Birth Date
                </label>
                <input
                  type="date"
                  id="birthdate"
                  value={birthDate}
                  onChange={(e) => {
                    setBirthDate(e.target.value);
                    setError('');
                  }}
                  className="w-full px-4 py-2 rounded-md border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  max={new Date().toISOString().split('T')[0]}
                />
              </div>

              <div>
                <label
                  htmlFor="lifeExpectancy"
                  className="block text-sm font-medium mb-1"
                >
                  Life Expectancy (years)
                </label>
                <input
                  type="number"
                  id="lifeExpectancy"
                  value={lifeExpectancy}
                  onChange={(e) => {
                    setLifeExpectancy(e.target.value);
                    setError('');
                  }}
                  className="w-full px-4 py-2 rounded-md border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  min="1"
                  max="150"
                  step="1"
                />
              </div>

              {error && <p className="text-red-500 text-sm">{error}</p>}

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-md bg-muted hover:bg-muted/80 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground hover:text-primary-foreground transition-colors"
                >
                  Save Changes
                </button>
              </div>
            </form>
          ) : (
            <ThemeSelector />
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;

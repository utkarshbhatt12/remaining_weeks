'use client';

import { useEffect, useState } from 'react';
import LifeGrid from './components/LifeGrid';
import BirthdateForm from './components/BirthdateForm';
import PinnedSites from './components/PinnedSites';

export default function App() {
  console.log('App component rendered');
  // State to track birthdate and pinned sites
  const [birthdate, setBirthdate] = useState<Date | null>(null);
  const [pinnedSites, setPinnedSites] = useState<
    chrome.topSites.MostVisitedURL[]
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      chrome.storage.sync.get(['birthdate'], (result) => {
        console.log('Storage result:', result);
        if (result.birthdate) {
          setBirthdate(new Date(result.birthdate));
        }
        setLoading(false);
      });
    } catch (e) {
      console.warn('Chrome storage not available.', e);
      setLoading(false);
    }

    // Get top sites
    try {
      if (chrome.topSites) {
        chrome.topSites.get((sites) => {
          console.log('Top sites:', sites);
          setPinnedSites(sites.slice(0, 8)); // Limit to 8 sites
        });
      }
    } catch (e) {
      console.warn('Chrome topSites not available.', e);
    }
  }, []);

  const handleBirthdateSubmit = (date: Date) => {
    console.log('Birthdate submitted:', date);
    setBirthdate(date);
    try {
      chrome.storage.sync.set({ birthdate: date.toISOString() });
    } catch (e) {
      console.warn('Chrome storage not available.', e);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900 text-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-4 px-6">
      <div className="max-w-full mx-auto">
        {!birthdate ? (
          <div className="flex items-center justify-center h-screen">
            <BirthdateForm onSubmit={handleBirthdateSubmit} />
          </div>
        ) : (
          <div className="space-y-6">
            <header className="text-center">
              <h1 className="text-2xl font-bold mb-1">Life in Weeks</h1>
              <p className="text-sm text-gray-400">
                A visual reminder of the time we have
              </p>
            </header>

            {/* Pinned Sites now at the top */}
            <div>
              <h2 className="text-lg font-semibold mb-3">
                Your Favorite Sites
              </h2>
              <PinnedSites sites={pinnedSites} />
            </div>

            {/* LifeGrid now below */}
            <div className="mt-6">
              <h2 className="text-lg font-semibold mb-3">Your Life in Weeks</h2>
              <LifeGrid birthDate={birthdate} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

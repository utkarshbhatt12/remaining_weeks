"use client";

import { useEffect, useState } from "react";

import LifeGrid from "./components/LifeGrid";
import BirthdateForm from "./components/BirthdateForm";
import PinnedSites from "./components/PinnedSites";

export default function App() {
  const [birthDate, setBirthdate] = useState<Date | null>(null);
  const [pinnedSites, setPinnedSites] = useState<
    chrome.topSites.MostVisitedURL[]
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log("App mounted");

    // Load birthdate from Chrome storage
    chrome.storage.sync.get(["birthdate"], (result) => {
      console.log("Storage result:", result);

      if (result.birthdate) {
        setBirthdate(new Date(result.birthdate));
      }

      setLoading(false);
    });

    chrome.topSites.get((sites) => {
      console.log("Top sites:", sites);
      setPinnedSites(sites.slice(0, 8)); // Limit to 8 sites
    });
  }, []);

  const handleBirthdateSubmit = (date: Date) => {
    console.log("Birthdate submitted:", date);
    setBirthdate(date);
    try {
      chrome.storage.sync.set({ birthdate: date.toISOString() });
    } catch (e) {
      console.warn("Chrome storage not available.", e);
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
    <div className="min-h-screen bg-gray-900 text-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        {!birthDate ? (
          <div className="flex items-center justify-center h-screen">
            <BirthdateForm onSubmit={handleBirthdateSubmit} />
          </div>
        ) : (
          <div className="space-y-8">
            <header className="text-center">
              <h1 className="text-3xl font-bold mb-2">Life in Weeks</h1>
              <p className="text-gray-400">
                A visual reminder of the time we have
              </p>
            </header>

            <LifeGrid birthDate={birthDate} />

            <div className="mt-12">
              <h2 className="text-xl font-semibold mb-4">Your Pinned Sites</h2>
              <PinnedSites sites={pinnedSites} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

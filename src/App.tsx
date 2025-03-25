"use client";

import React, { useEffect, useState } from "react";
import LifeGrid from "./components/LifeGrid";
import BirthdateForm from "./components/BirthdateForm";
import PinnedSites from "./components/PinnedSites";

export default function App() {
  const [birthdate, setBirthdate] = useState<Date | null>(null);
  const [pinnedSites, setPinnedSites] = useState<
    chrome.topSites.MostVisitedURL[]
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load birthdate from Chrome storage
    try {
      chrome.storage.sync.get(["birthdate"], (result) => {
        if (result.birthdate) {
          setBirthdate(new Date(result.birthdate));
        }
        setLoading(false);
      });
    } catch (e) {
      console.warn("Chrome storage not available.", e);
      setLoading(false);
    }

    // Get top sites
    try {
      if (chrome.topSites) {
        chrome.topSites.get((sites) => {
          setPinnedSites(sites.slice(0, 8)); // Limit to 8 sites
        });
      }
    } catch (e) {
      console.warn("Chrome topSites not available.", e);
    }
  }, []);

  const handleBirthdateSubmit = (date: Date) => {
    setBirthdate(date);
    try {
      chrome.storage.sync.set({ birthdate: date.toISOString() });
    } catch (e) {
      console.warn("Chrome storage not available.", e);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        {!birthdate ? (
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

            <LifeGrid birthdate={birthdate} />

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

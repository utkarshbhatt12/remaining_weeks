'use client';

import { Edit, Settings } from 'lucide-react';
import React, { useEffect, useState } from 'react';

import BirthdateForm from './components/BirthdateForm';
import LifeGrid from './components/LifeGrid';
import PinnedSites from './components/PinnedSites';
import SettingsModal from './components/SettingsModal';
import { ThemeProvider } from './components/ThemeProvider';
import { Site } from './types';

export default function App() {
  const [birthdate, setBirthdate] = useState<Date | null>(null);
  const [name, setName] = useState<string>('');
  const [lifeExpectancy, setLifeExpectancy] = useState<number>(80);
  const [chromeSites, setChromeSites] = useState<Site[]>([]);
  const [hiddenChromeSites, setHiddenChromeSites] = useState<string[]>([]);
  const [customSites, setCustomSites] = useState<Site[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [editingSites, setEditingSites] = useState(false);
  const [weeksRemaining, setWeeksRemaining] = useState<number>(0);

  const visibleChromeSites = chromeSites.filter(
    (site) => !hiddenChromeSites.includes(site.url)
  );
  const allSites = [...visibleChromeSites, ...customSites];

  useEffect(() => {
    if (!birthdate) {
      return;
    }

    const today = new Date();
    const millisecondsPerWeek = 7 * 24 * 60 * 60 * 1000;
    const weeksLived = Math.floor(
      (today.getTime() - birthdate.getTime()) / millisecondsPerWeek,
    );
    const remaining = Math.max(0, lifeExpectancy * 52 - weeksLived);

    setWeeksRemaining(remaining);
  }, [birthdate, lifeExpectancy]);

  useEffect(() => {
    try {
      window.chrome.storage.sync.get(
        ['birthdate', 'name', 'customSites', 'lifeExpectancy', 'hiddenChromeSites'],
        (result) => {
          if (result.birthdate) {
            setBirthdate(new Date(result.birthdate));
          }
          if (result.name) {
            setName(result.name);
          }
          if (result.customSites) {
            setCustomSites(result.customSites);
          }
          if (result.lifeExpectancy) {
            setLifeExpectancy(result.lifeExpectancy);
          }
          if (result.hiddenChromeSites) {
            setHiddenChromeSites(result.hiddenChromeSites);
          }
          setLoading(false);
        },
      );

      window.chrome.topSites.get((sites) => {
        setChromeSites(
          sites.slice(0, 8).map((site) => ({
            url: site.url,
            title: site.title,
            isCustom: false,
          })),
        );
      });
    } catch (e) {
      console.error('Failed to load data from Chrome storage:', e);
      setLoading(false);
    }
  }, []);

  const handleBirthdateSubmit = (date: Date) => {
    setBirthdate(date);
    window.chrome.storage.sync.set({ birthdate: date.toISOString() });
  };

  const handleSettingsSave = (
    newName: string,
    newBirthdate: Date,
    newLifeExpectancy: number,
  ) => {
    setName(newName);
    setBirthdate(newBirthdate);
    setLifeExpectancy(newLifeExpectancy);

    window.chrome.storage.sync.set({
      name: newName,
      birthdate: newBirthdate.toISOString(),
      lifeExpectancy: newLifeExpectancy,
    });
  };

  const handleRemoveSite = (index: number) => {
    const isChromeSite = index < visibleChromeSites.length;

    if (isChromeSite) {
      const siteUrl = visibleChromeSites[index].url;
      const newHidden = [...hiddenChromeSites, siteUrl];
      setHiddenChromeSites(newHidden);
      window.chrome.storage.sync.set({ hiddenChromeSites: newHidden });
    } else {
      const customIndex = index - visibleChromeSites.length;
      const updatedSites = customSites.filter((_, i) => i !== customIndex);
      setCustomSites(updatedSites);
      window.chrome.storage.sync.set({ customSites: updatedSites });
    }
  };

  const handleAddSite = (site: Site) => {
    const newCustomSites = [...customSites, site];
    setCustomSites(newCustomSites);
    window.chrome.storage.sync.set({ customSites: newCustomSites });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background text-foreground">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-background text-foreground p-4 px-6">
        <div className="max-w-full mx-auto">
          {!birthdate ? (
            <div className="flex items-center justify-center h-screen">
              <BirthdateForm onSubmit={handleBirthdateSubmit} />
            </div>
          ) : (
            <div className="space-y-6">
              <header className="flex justify-between items-center">
                <div className="text-center flex-1">
                  <h1 className="text-2xl font-bold mb-1">Life in Weeks</h1>
                  <p className="text-sm text-muted-foreground">
                    {name
                      ? `Hey, ${name}, only ${weeksRemaining.toLocaleString()} Sundays remain.`
                      : `Only ${weeksRemaining.toLocaleString()} Sundays remain.`}
                  </p>
                </div>
                <button
                  onClick={() => setIsSettingsOpen(true)}
                  className="p-2 rounded-full hover:bg-muted transition-colors"
                  title="Settings"
                >
                  <Settings
                    size={24}
                    className="text-muted-foreground hover:text-foreground"
                  />
                </button>
              </header>

              <div>
                <div className="flex justify-between items-center mb-3">
                  <h2 className="text-lg font-semibold">Your Favorite Sites</h2>
                  <button
                    onClick={() => setEditingSites(!editingSites)}
                    className={`p-1.5 rounded-md transition-colors ${
                      editingSites
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    }`}
                    title={editingSites ? 'Done editing' : 'Edit sites'}
                  >
                    <Edit size={18} />
                  </button>
                </div>
                <PinnedSites
                  sites={allSites}
                  onRemoveSite={editingSites ? handleRemoveSite : undefined}
                  onAddSite={editingSites ? handleAddSite : undefined}
                  editable={editingSites}
                />
              </div>

              <div className="mt-6">
                <h2 className="text-lg font-semibold mb-3">
                  Your Life in Weeks
                </h2>
                <LifeGrid
                  birthDate={birthdate}
                  lifeExpectancy={lifeExpectancy}
                />
              </div>

              <SettingsModal
                isOpen={isSettingsOpen}
                onClose={() => setIsSettingsOpen(false)}
                onSave={handleSettingsSave}
                initialName={name}
                initialBirthDate={birthdate}
                initialLifeExpectancy={lifeExpectancy}
              />
            </div>
          )}
        </div>
      </div>
    </ThemeProvider>
  );
}
'use client';

import { Edit, Settings } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';

import BirthdateForm from './components/BirthdateForm';
import LifeGrid from './components/LifeGrid';
import PinnedSites from './components/PinnedSites';
import SettingsModal from './components/SettingsModal';
import { ThemeProvider } from './components/ThemeProvider';
import { Site } from './types';

const TOP_SITES_LIMIT = 10;
const VISIBLE_SITES_LIMIT = 8;

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

  const isInitialMount = useRef(true);

  const visibleChromeSites = chromeSites.filter(
    (site) => !hiddenChromeSites.includes(site.url)
  );
  const allSites = [...visibleChromeSites.slice(0, VISIBLE_SITES_LIMIT), ...customSites];

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
    const loadData = async () => {
      try {
        // Load storage data first
        const storageData = await new Promise<{
          birthdate?: string;
          name?: string;
          customSites?: Site[];
          lifeExpectancy?: number;
          hiddenChromeSites?: string[];
        }>((resolve) => {
          window.chrome.storage.sync.get(
            ['birthdate', 'name', 'customSites', 'lifeExpectancy', 'hiddenChromeSites'],
            resolve,
          );
        });

        // Load top sites
        const topSitesData = await new Promise<chrome.topSites.MostVisitedURL[]>((resolve) => {
          window.chrome.topSites.get(resolve);
        });

        const topSites = topSitesData.slice(0, TOP_SITES_LIMIT).map((site) => ({
          url: site.url,
          title: site.title,
          isCustom: false,
        }));

        // Prune hidden sites to only include URLs still in current topSites
        const topSiteUrls = new Set(topSites.map((s) => s.url));
        const storedHidden = storageData.hiddenChromeSites ?? [];
        const prunedHidden = storedHidden.filter((url) => topSiteUrls.has(url));

        // Persist pruned list if it changed
        if (prunedHidden.length !== storedHidden.length) {
          window.chrome.storage.sync.set({ hiddenChromeSites: prunedHidden });
        }

        // Set all state
        if (storageData.birthdate) {
          setBirthdate(new Date(storageData.birthdate));
        }
        if (storageData.name) {
          setName(storageData.name);
        }
        if (storageData.customSites) {
          setCustomSites(storageData.customSites);
        }
        if (storageData.lifeExpectancy) {
          setLifeExpectancy(storageData.lifeExpectancy);
        }
        setHiddenChromeSites(prunedHidden);
        setChromeSites(topSites);
        setLoading(false);
      } catch (e) {
        console.error('Failed to load data from Chrome storage:', e);
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Persist hiddenChromeSites changes (skip initial mount)
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    window.chrome.storage.sync.set({ hiddenChromeSites });
  }, [hiddenChromeSites]);

  // Persist customSites changes
  useEffect(() => {
    if (isInitialMount.current) {
      return;
    }
    window.chrome.storage.sync.set({ customSites });
  }, [customSites]);

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
    const visibleChrome = chromeSites
      .filter((site) => !hiddenChromeSites.includes(site.url))
      .slice(0, VISIBLE_SITES_LIMIT);
    const isChromeSite = index < visibleChrome.length;

    if (isChromeSite) {
      const siteUrl = visibleChrome[index].url;
      if (hiddenChromeSites.includes(siteUrl)) {
        return; // Already hidden, no-op
      }
      const newHidden = [...hiddenChromeSites, siteUrl].slice(-TOP_SITES_LIMIT);
      setHiddenChromeSites(newHidden);
    } else {
      const customIndex = index - visibleChrome.length;
      const updatedSites = customSites.filter((_, i) => i !== customIndex);
      setCustomSites(updatedSites);
    }
  };

  const handleAddSite = (site: Site) => {
    const newCustomSites = [...customSites, site];
    setCustomSites(newCustomSites);
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
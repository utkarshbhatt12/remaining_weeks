'use client';

import { useEffect, useState } from 'react';
import { Settings, Edit } from 'lucide-react';
import LifeGrid from './components/LifeGrid';
import BirthdateForm from './components/BirthdateForm';
import PinnedSites from './components/PinnedSites';
import SettingsModal from './components/SettingsModal';

// Define site interface
interface Site {
  url: string;
  title: string;
  isCustom?: boolean;
}

export default function App() {
  const [birthdate, setBirthdate] = useState<Date | null>(null);
  const [name, setName] = useState<string>('');
  const [lifeExpectancy, setLifeExpectancy] = useState<number>(80);
  const [chromeSites, setChromeSites] = useState<Site[]>([]);
  const [customSites, setCustomSites] = useState<Site[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [editingSites, setEditingSites] = useState(false);

  // Combine Chrome sites and custom sites
  const allSites = [...chromeSites, ...customSites];

  useEffect(() => {
    console.log('App mounted');

    // Load user data from Chrome storage
    try {
      chrome.storage.sync.get(
        ['birthdate', 'name', 'customSites', 'lifeExpectancy'],
        (result) => {
          console.log('Storage result:', result);
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
          setLoading(false);
        },
      );
    } catch (e) {
      console.warn('Chrome storage not available.', e);
      setLoading(false);
    }

    // Get top sites
    try {
      if (chrome.topSites) {
        chrome.topSites.get((sites) => {
          console.log('Top sites:', sites);
          setChromeSites(sites.slice(0, 8)); // Limit to 8 sites
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

  const handleSettingsSave = (
    newName: string,
    newBirthdate: Date,
    newLifeExpectancy: number,
  ) => {
    console.log('Settings saved:', {
      newName,
      newBirthdate,
      newLifeExpectancy,
    });
    setName(newName);
    setBirthdate(newBirthdate);
    setLifeExpectancy(newLifeExpectancy);

    try {
      chrome.storage.sync.set({
        name: newName,
        birthdate: newBirthdate.toISOString(),
        lifeExpectancy: newLifeExpectancy,
      });
    } catch (e) {
      console.warn('Chrome storage not available.', e);
    }
  };

  const handleRemoveSite = (index: number) => {
    if (index < chromeSites.length) {
      // Remove from Chrome sites (just visually, can't modify Chrome's actual top sites)
      const newChromeSites = [...chromeSites];
      newChromeSites.splice(index, 1);
      setChromeSites(newChromeSites);
    } else {
      // Remove from custom sites
      const customIndex = index - chromeSites.length;
      const newCustomSites = [...customSites];
      newCustomSites.splice(customIndex, 1);
      setCustomSites(newCustomSites);

      // Save to storage
      try {
        chrome.storage.sync.set({ customSites: newCustomSites });
      } catch (e) {
        console.warn('Chrome storage not available.', e);
      }
    }
  };

  const handleAddSite = (site: Site) => {
    const newCustomSites = [...customSites, site];
    setCustomSites(newCustomSites);

    // Save to storage
    try {
      chrome.storage.sync.set({ customSites: newCustomSites });
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
            <header className="flex justify-between items-center">
              <div className="text-center flex-1">
                <h1 className="text-2xl font-bold mb-1">Life in Weeks</h1>
                <p className="text-sm text-gray-400">
                  {name ? `Hello, ${name}! ` : ''}A visual reminder of the time
                  we have
                </p>
              </div>
              <button
                onClick={() => setIsSettingsOpen(true)}
                className="p-2 rounded-full hover:bg-gray-800 transition-colors"
                title="Settings"
              >
                <Settings
                  size={24}
                  className="text-gray-400 hover:text-white"
                />
              </button>
            </header>

            {/* Pinned Sites at the top */}
            <div>
              <div className="flex justify-between items-center mb-3">
                <h2 className="text-lg font-semibold">Your Favorite Sites</h2>
                <button
                  onClick={() => setEditingSites(!editingSites)}
                  className={`p-1.5 rounded-md transition-colors ${
                    editingSites
                      ? 'bg-green-600 text-white'
                      : 'text-gray-400 hover:bg-gray-800 hover:text-white'
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

            {/* LifeGrid below */}
            <div className="mt-6">
              <h2 className="text-lg font-semibold mb-3">Your Life in Weeks</h2>
              <LifeGrid birthDate={birthdate} lifeExpectancy={lifeExpectancy} />
            </div>

            {/* Settings Modal */}
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
  );
}

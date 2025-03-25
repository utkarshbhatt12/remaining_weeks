import React from 'react';

interface PinnedSitesProps {
  sites: chrome.topSites.MostVisitedURL[];
}

export default function PinnedSites({ sites }: PinnedSitesProps) {
  if (sites.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400">
        No pinned sites available
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      {sites.map((site, index) => (
        <a
          key={index}
          href={site.url}
          className="flex flex-col items-center bg-gray-800 p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow"
        >
          <div className="w-12 h-12 flex items-center justify-center bg-gray-700 rounded-full mb-3">
            <img
              src={`https://www.google.com/s2/favicons?domain=${new URL(site.url).hostname}&sz=64`}
              alt={site.title}
              className="w-8 h-8"
              onError={(e) => {
                // If favicon fails to load, show the first letter of the site
                const target = e.target as HTMLElement;
                target.style.display = 'none';
                target.parentElement!.innerHTML = site.title
                  .charAt(0)
                  .toUpperCase();
                target.parentElement!.className += ' text-xl font-bold';
              }}
            />
          </div>
          <span className="text-sm font-medium text-center line-clamp-1">
            {site.title}
          </span>
        </a>
      ))}
    </div>
  );
}

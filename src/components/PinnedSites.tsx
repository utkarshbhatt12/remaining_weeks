'use client';

import { Plus, X } from 'lucide-react';
import React, { useState } from 'react';

import AddSiteModal from './AddSiteModal';
import { Site } from '../types';

interface PinnedSitesProps {
  sites: Site[];
  onRemoveSite?: (index: number) => void;
  onAddSite?: (site: Site) => void;
  editable?: boolean;
}

export default function PinnedSites({
  sites,
  onRemoveSite,
  onAddSite,
  editable = false,
}: PinnedSitesProps) {
  const [isAddSiteModalOpen, setIsAddSiteModalOpen] = useState(false);

  if (sites.length === 0 && !editable) {
    return (
      <div className="text-center py-4 text-muted-foreground">
        No pinned sites available
      </div>
    );
  }

  return (
    <div className="px-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
        {sites.map((site, index) => (
          <div key={index} className="relative group">
            <a
              href={site.url}
              className="flex flex-col items-center bg-card p-2 rounded-lg shadow-md hover:bg-muted transition-colors h-full"
            >
              <div className="w-10 h-10 flex items-center justify-center bg-muted rounded-full mb-2">
                <img
                  src={`https://www.google.com/s2/favicons?domain=${
                    new URL(site.url).hostname
                  }&sz=64`}
                  alt={site.title}
                  className="w-6 h-6"
                  onError={(e) => {
                    // If favicon fails to load, show the first letter of the site
                    const target = e.target as HTMLElement;
                    target.style.display = 'none';
                    target.parentElement!.innerHTML = site.title
                      .charAt(0)
                      .toUpperCase();
                    target.parentElement!.className += ' text-lg font-bold';
                  }}
                />
              </div>
              <span className="text-xs font-medium text-center line-clamp-1 w-full">
                {site.title}
              </span>
            </a>

            {editable && onRemoveSite && (
              <button
                onClick={() => onRemoveSite(index)}
                className="absolute -top-2 -right-2 bg-red-500 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                title="Remove site"
              >
                <X size={12} className="text-white" />
              </button>
            )}
          </div>
        ))}

        {editable && onAddSite && (
          <button
            onClick={() => setIsAddSiteModalOpen(true)}
            className="flex flex-col items-center justify-center bg-card p-2 rounded-lg shadow-md hover:bg-muted transition-colors border-2 border-dashed border-border h-full min-h-[80px]"
          >
            <Plus size={24} className="text-muted-foreground mb-1" />
            <span className="text-xs text-muted-foreground">Add Site</span>
          </button>
        )}
      </div>

      {/* Add Site Modal */}
      {onAddSite && (
        <AddSiteModal
          isOpen={isAddSiteModalOpen}
          onClose={() => setIsAddSiteModalOpen(false)}
          onAddSite={onAddSite}
        />
      )}
    </div>
  );
}

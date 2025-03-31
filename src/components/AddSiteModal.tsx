'use client';

import type React from 'react';
import { useState, useEffect } from 'react';
import { X, Plus } from 'lucide-react';

interface Site {
  url: string;
  title: string;
  isCustom?: boolean;
}

interface AddSiteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddSite: (site: Site) => void;
}

const AddSiteModal: React.FC<AddSiteModalProps> = ({
  isOpen,
  onClose,
  onAddSite,
}) => {
  const [newSiteUrl, setNewSiteUrl] = useState('');
  const [newSiteTitle, setNewSiteTitle] = useState('');
  const [urlError, setUrlError] = useState('');
  const [titleError, setTitleError] = useState('');

  useEffect(() => {
    // Reset form when modal opens
    if (isOpen) {
      setNewSiteUrl('');
      setNewSiteTitle('');
      setUrlError('');
      setTitleError('');
    }
  }, [isOpen]);

  const validateUrl = (url: string): boolean => {
    // Check if URL is empty
    if (!url.trim()) {
      setUrlError('Please enter a URL');
      return false;
    }

    // Prepare URL for validation by adding protocol if missing
    let formattedUrl = url.trim();
    if (
      !formattedUrl.startsWith('http://') &&
      !formattedUrl.startsWith('https://')
    ) {
      formattedUrl = 'https://' + formattedUrl;
    }

    // Use regex to validate URL format (basic validation)
    const urlPattern =
      /^(https?:\/\/)?(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)$/;
    if (!urlPattern.test(formattedUrl)) {
      setUrlError('Please enter a valid URL (e.g., google.com)');
      return false;
    }

    // Additional validation using URL constructor
    try {
      const urlObj = new URL(formattedUrl);
      // Check if hostname has at least one dot (for TLD)
      if (!urlObj.hostname.includes('.')) {
        setUrlError('URL must include a valid domain (e.g., example.com)');
        return false;
      }
      return true;
    } catch (e) {
      setUrlError('Please enter a valid URL (e.g., google.com)');
      return false;
    }
  };

  const validateTitle = (title: string): boolean => {
    if (!title.trim()) {
      return true; // Title is optional, so empty is valid
    }

    if (title.length > 50) {
      setTitleError('Title must be less than 50 characters');
      return false;
    }

    return true;
  };

  // Update the handleAddSite function to ensure proper URL validation and formatting
  const handleAddSite = () => {
    // Reset errors
    setUrlError('');
    setTitleError('');

    // Validate both fields
    const isUrlValid = validateUrl(newSiteUrl);
    const isTitleValid = validateTitle(newSiteTitle);

    if (!isUrlValid || !isTitleValid) {
      return;
    }

    // Format URL
    let url = newSiteUrl.trim();
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }

    try {
      // Final URL validation check
      const urlObj = new URL(url);
      // Use the URL hostname as title if not provided
      const title = newSiteTitle.trim() || urlObj.hostname;

      onAddSite({ url, title, isCustom: true });
      onClose();
    } catch (e) {
      setUrlError('Invalid URL format. Please check your input.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-lg shadow-lg max-w-md w-full text-card-foreground">
        <div className="flex justify-between items-center p-4 border-b border-border">
          <h2 className="text-lg font-bold flex items-center">
            <Plus size={18} className="mr-2" /> Add New Site
          </h2>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-4 space-y-4">
          <div>
            <label
              htmlFor="site-url"
              className="block text-sm font-medium mb-1"
            >
              URL (required)
            </label>
            <input
              type="text"
              id="site-url"
              value={newSiteUrl}
              onChange={(e) => {
                setNewSiteUrl(e.target.value);
                setUrlError('');
              }}
              className="w-full px-4 py-2 rounded-md border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="e.g., google.com"
              autoFocus
            />
          </div>

          {urlError && <p className="text-red-500 text-sm mt-1">{urlError}</p>}

          <div>
            <label
              htmlFor="site-title"
              className="block text-sm font-medium mb-1"
            >
              Title (optional)
            </label>
            <input
              type="text"
              id="site-title"
              value={newSiteTitle}
              onChange={(e) => {
                setNewSiteTitle(e.target.value);
                setTitleError('');
              }}
              className="w-full px-4 py-2 rounded-md border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="e.g., Google"
              maxLength={50}
            />
            {titleError && (
              <p className="text-red-500 text-sm mt-1">{titleError}</p>
            )}
          </div>

          <div className="flex justify-end space-x-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-md bg-muted hover:bg-muted/80 transition-colors text-foreground"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleAddSite}
              className="px-4 py-2 rounded-md bg-primary hover:bg-primary/90 transition-colors text-primary-foreground"
            >
              Add Site
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddSiteModal;

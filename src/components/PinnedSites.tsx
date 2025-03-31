interface PinnedSitesProps {
  sites: chrome.topSites.MostVisitedURL[];
}

export default function PinnedSites({ sites }: PinnedSitesProps) {
  if (sites.length === 0) {
    return (
      <div className="text-center py-4 text-gray-400">
        No pinned sites available
      </div>
    );
  }

  return (
    <div className="px-4">
      <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3">
        {sites.map((site, index) => (
          <a
            key={index}
            href={site.url}
            className="flex flex-col items-center bg-gray-800 p-2 rounded-lg shadow-md hover:bg-gray-700 transition-colors"
          >
            <div className="w-10 h-10 flex items-center justify-center bg-gray-700 rounded-full mb-2">
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
        ))}
      </div>
    </div>
  );
}

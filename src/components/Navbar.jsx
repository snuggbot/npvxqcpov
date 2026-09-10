import { Search, Bookmark, RefreshCw, Check } from 'lucide-react';

export default function Navbar({ 
  meta, 
  bookmarkCount, 
  showOnlyBookmarks,
  setShowOnlyBookmarks,
  searchQuery,
  setSearchQuery,
  onSync,
  isSyncing,
  syncStatus,
  activeRedditUrl
}) {
  const getSyncLabel = () => {
    if (isSyncing) return 'Checking...';
    if (syncStatus === 'synced') return 'Up to date';
    return 'Check updates';
  };

  const redditLink = activeRedditUrl || meta?.links?.redditPost || 'https://www.reddit.com/r/xqcow/';

  return (
    <header className="sticky top-0 z-40 bg-[#0c0c0e]/85 backdrop-blur-md border-b border-white/[0.08]">
      <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
        {/* Title & Attribution (nopixel V on line 1, xQc pov on line 2) */}
        <div className="flex flex-col justify-center py-1 truncate">
          <h1 className="flex flex-col tracking-tight leading-none">
            <span className="font-semibold text-zinc-100 text-sm sm:text-base whitespace-nowrap">
              nopixel V
            </span>
            <span className="font-medium text-zinc-400 text-xs whitespace-nowrap mt-0.5">
              xQc pov
            </span>
          </h1>
          <span className="text-[11px] text-zinc-500 font-normal tracking-tight mt-1 truncate">
            as timestamped by{' '}
            <a
              href={redditLink}
              target="_blank"
              rel="noopener noreferrer"
              className="text-zinc-300 hover:text-white hover:underline font-medium transition-colors"
            >
              u/HurricaneRein
            </a>
          </span>
        </div>

        {/* Search & Actions */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Search box */}
          <div className="relative w-36 sm:w-56">
            <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search moments..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-2.5 py-1.5 rounded-md bg-zinc-900/90 text-xs text-zinc-200 placeholder-zinc-500 border border-white/[0.08] focus:outline-none focus:border-zinc-600 transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-200 text-[10px]"
              >
                ✕
              </button>
            )}
          </div>

          {/* Sync / Check Updates Button */}
          <button
            onClick={onSync}
            disabled={isSyncing}
            className="px-2.5 py-1.5 rounded-md border border-white/[0.08] bg-zinc-900/90 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/80 transition-colors disabled:opacity-50 flex items-center gap-1.5 text-xs font-medium"
            title="Check Reddit for new timestamps / updates"
          >
            {syncStatus === 'synced' ? (
              <Check className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-amber-400' : ''}`} />
            )}
            <span className="hidden md:inline text-[11px]">
              {getSyncLabel()}
            </span>
          </button>

          {/* Bookmarks Toggle */}
          <button
            onClick={() => setShowOnlyBookmarks(!showOnlyBookmarks)}
            className={`p-1.5 rounded-md border text-xs transition-colors flex items-center gap-1 ${
              showOnlyBookmarks
                ? 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                : 'bg-zinc-900/90 border-white/[0.08] text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/80'
            }`}
            title="Show saved highlights"
          >
            <Bookmark className={`w-3.5 h-3.5 ${showOnlyBookmarks ? 'fill-amber-400 text-amber-400' : ''}`} />
            {bookmarkCount > 0 && <span className="font-mono text-[10px] tabular-nums font-semibold">{bookmarkCount}</span>}
          </button>


        </div>
      </div>
    </header>
  );
}

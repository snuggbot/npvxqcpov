import { useState, useMemo, useEffect } from 'react';
import { 
  Clock, Star, Play, 
  Bookmark, Check, Share2, 
  AlertTriangle, ArrowUpDown, Maximize2, LayoutGrid, Square, X, ChevronDown,
  ChevronLeft, ChevronRight, MessageSquare, ExternalLink
} from 'lucide-react';
import { TwitchIcon, KickIcon } from './Icons';

const CATEGORY_CONFIG = {
  all: { label: 'All Tags', accentColor: 'bg-zinc-600', dotColor: 'bg-zinc-400' },
  crime: { label: 'Crime', accentColor: 'bg-rose-500', dotColor: 'bg-rose-500' },
  job: { label: 'Economy & Jobs', accentColor: 'bg-emerald-500', dotColor: 'bg-emerald-500' },
  chase: { label: 'Police Chases', accentColor: 'bg-blue-500', dotColor: 'bg-blue-500' },
  lore: { label: 'Lore', accentColor: 'bg-purple-500', dotColor: 'bg-purple-500' },
  medical: { label: 'Medical', accentColor: 'bg-pink-500', dotColor: 'bg-pink-500' },
  crypto: { label: 'Crypto', accentColor: 'bg-lime-400', dotColor: 'bg-lime-400' },
  mechanic: { label: 'Mechanics', accentColor: 'bg-sky-500', dotColor: 'bg-sky-500' },
  social: { label: 'Social', accentColor: 'bg-teal-500', dotColor: 'bg-teal-500' }
};

export default function TimelineView({ 
  events, 
  bookmarks, 
  toggleBookmark, 
  onSelectImage,
  showOnlyBookmarks,
  setShowOnlyBookmarks,
  searchQuery,
  setSearchQuery,
  onCharacterClick,
  activeRedditUrl,
  currentDayTitle
}) {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedCharacter, setSelectedCharacter] = useState('all');
  const [isMajorOnly, setIsMajorOnly] = useState(false);
  const [sortOrder, setSortOrder] = useState('asc'); // 'asc' or 'desc'
  const [layoutMode, setLayoutMode] = useState('feed'); // 'feed' (1-col), 'grid' (2-col/3-col), or 'list' (compact timestamps)
  const [copiedId, setCopiedId] = useState(null);
  const [copiedToast, setCopiedToast] = useState(false);
  const [tappedId, setTappedId] = useState(null);
  const [focusedEvent, setFocusedEvent] = useState(null);

  // Character list derived from events
  const allCharacters = useMemo(() => {
    const set = new Set();
    events.forEach(e => e.characters?.forEach(c => set.add(c)));
    return Array.from(set);
  }, [events]);

  // Copy share link
  const copyEventLink = (event) => {
    const url = `${window.location.origin}${window.location.pathname}#${event.id}`;
    navigator.clipboard.writeText(url);
    setCopiedId(event.id);
    setCopiedToast(true);
    setTimeout(() => {
      setCopiedId(null);
      setCopiedToast(false);
    }, 2000);
  };

  // Filtered & sorted events (Combined with AND logic)
  const filteredEvents = useMemo(() => {
    return events.filter(event => {
      // 1. Bookmark filter
      if (showOnlyBookmarks && !bookmarks.includes(event.id)) {
        return false;
      }
      // 2. Major Only filter
      if (isMajorOnly && !event.isMajor) {
        return false;
      }
      // 3. Category Tag filter — match if any of the event's tags include selected
      if (selectedCategory !== 'all' && !(event.tags || [event.category]).includes(selectedCategory)) {
        return false;
      }
      // 4. Character dropdown filter
      if (selectedCharacter !== 'all' && !event.characters?.includes(selectedCharacter)) {
        return false;
      }
      // 5. Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchDesc = event.description?.toLowerCase().includes(q);
        const matchTime = event.timestamp?.includes(q);
        const matchChars = event.characters?.some(c => c.toLowerCase().includes(q));
        return matchDesc || matchTime || matchChars;
      }
      return true;
    }).sort((a, b) => {
      return sortOrder === 'asc' ? a.seconds - b.seconds : b.seconds - a.seconds;
    });
  }, [events, selectedCategory, selectedCharacter, isMajorOnly, showOnlyBookmarks, bookmarks, searchQuery, sortOrder]);

  // Keyboard navigation for focused one-column card view (defined AFTER filteredEvents)
  const handlePrevFocused = () => {
    if (!focusedEvent) return;
    const idx = filteredEvents.findIndex(e => e.id === focusedEvent.id);
    if (idx > 0) {
      setFocusedEvent(filteredEvents[idx - 1]);
    }
  };

  const handleNextFocused = () => {
    if (!focusedEvent) return;
    const idx = filteredEvents.findIndex(e => e.id === focusedEvent.id);
    if (idx !== -1 && idx < filteredEvents.length - 1) {
      setFocusedEvent(filteredEvents[idx + 1]);
    }
  };

  useEffect(() => {
    if (!focusedEvent) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setFocusedEvent(null);
      } else if (e.key === 'ArrowLeft') {
        handlePrevFocused();
      } else if (e.key === 'ArrowRight') {
        handleNextFocused();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [focusedEvent, filteredEvents]);

  // Dynamic category counts — each tag in tags[] increments its own bucket
  const categoryCounts = useMemo(() => {
    const counts = { all: 0 };
    events.forEach(e => {
      const matchChar = selectedCharacter === 'all' || e.characters?.includes(selectedCharacter);
      const matchMajor = !isMajorOnly || e.isMajor;
      if (matchChar && matchMajor) {
        counts.all = (counts.all || 0) + 1;
        const tags = e.tags || [e.category];
        tags.forEach(t => { counts[t] = (counts[t] || 0) + 1; });
      }
    });
    return counts;
  }, [events, selectedCharacter, isMajorOnly]);

  const majorCount = useMemo(() => {
    return events.filter(e => {
      const matchChar = selectedCharacter === 'all' || e.characters?.includes(selectedCharacter);
      const matchCat = selectedCategory === 'all' || (e.tags || [e.category]).includes(selectedCategory);
      return e.isMajor && matchChar && matchCat;
    }).length;
  }, [events, selectedCharacter, selectedCategory]);

  const hasActiveFilters = selectedCategory !== 'all' || selectedCharacter !== 'all' || isMajorOnly || searchQuery || showOnlyBookmarks;

  return (
    <div className="max-w-5xl mx-auto space-y-3 pb-16">
      {/* Grounded Neutral Filter Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 pt-1 text-xs">
        {/* Left Side: Major Only Toggle + Character Dropdown + Tag Dropdown */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Major Highlights Toggle Button */}
          <button
            onClick={() => setIsMajorOnly(!isMajorOnly)}
            className={`px-3 py-1.5 rounded-md font-medium whitespace-nowrap transition-colors border flex items-center gap-1.5 cursor-pointer ${
              isMajorOnly
                ? 'bg-amber-500 text-black border-amber-400 font-semibold shadow-sm'
                : 'bg-zinc-900/90 text-zinc-300 border-white/[0.08] hover:bg-zinc-800/80 hover:text-white'
            }`}
            title="Filter to Major Breakthrough Moments (bolded by author)"
          >
            <Star className={`w-3.5 h-3.5 ${isMajorOnly ? 'fill-black text-black' : 'fill-amber-400 text-amber-400'}`} />
            <span>Major Highlights</span>
            <span className={`px-1.5 py-0.2 rounded text-[10px] font-mono tabular-nums font-semibold ${isMajorOnly ? 'bg-black/20 text-black' : 'bg-zinc-800 text-zinc-400'}`}>
              {majorCount}
            </span>
          </button>

          {/* Character Dropdown Filter */}
          <div className="relative">
            <select
              value={selectedCharacter}
              onChange={(e) => setSelectedCharacter(e.target.value)}
              className={`pl-3 pr-8 py-1.5 rounded-md text-xs border focus:outline-none transition-colors appearance-none cursor-pointer ${
                selectedCharacter === 'all'
                  ? 'bg-zinc-900/90 text-zinc-300 border-white/[0.08] hover:border-zinc-700'
                  : 'bg-zinc-800 text-white border-zinc-600 font-medium'
              }`}
              title="Filter by character"
            >
              <option value="all">All Characters ({allCharacters.length})</option>
              {allCharacters.map(char => (
                <option key={char} value={char}>{char}</option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-zinc-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Tags Dropdown Filter */}
          <div className="relative">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className={`pl-3 pr-8 py-1.5 rounded-md text-xs border focus:outline-none transition-colors appearance-none cursor-pointer ${
                selectedCategory === 'all'
                  ? 'bg-zinc-900/90 text-zinc-300 border-white/[0.08] hover:border-zinc-700'
                  : 'bg-zinc-800 text-white border-zinc-600 font-medium'
              }`}
              title="Filter by category tag"
            >
              <option value="all">All Tags ({categoryCounts.all || events.length})</option>
              {Object.entries(CATEGORY_CONFIG)
                .filter(([k]) => k !== 'all')
                .map(([key, config]) => {
                  const count = categoryCounts[key] || 0;
                  return (
                    <option key={key} value={key}>
                      {config.label} ({count})
                    </option>
                  );
                })}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-zinc-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* Right Controls: Sort Order & Layout Switcher */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Sort order toggle */}
          <button
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="px-2.5 py-1.5 rounded-md bg-zinc-900/90 hover:bg-zinc-800/80 text-zinc-400 hover:text-zinc-200 border border-white/[0.08] transition-colors flex items-center gap-1.5 cursor-pointer"
            title={sortOrder === 'asc' ? 'Earliest first' : 'Latest first'}
          >
            <ArrowUpDown className="w-3 h-3 text-zinc-400" />
            <span className="text-[11px] hidden sm:inline font-mono tabular-nums">
              {sortOrder === 'asc' ? '01:00 → 13:25' : '13:25 → 01:00'}
            </span>
          </button>

          {/* Layout switcher: Feed (1-col), Grid (2-col on mobile, 3-col on desktop), List (Timestamps) */}
          <div className="flex items-center bg-zinc-900/90 rounded-md border border-white/[0.08] p-0.5 gap-0.5">
            <button
              onClick={() => setLayoutMode('feed')}
              className={`p-1.5 rounded transition-colors cursor-pointer ${layoutMode === 'feed' ? 'bg-zinc-800 text-zinc-100 shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}
              title="Single column view"
            >
              <Square className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setLayoutMode('grid')}
              className={`p-1.5 rounded transition-colors cursor-pointer ${layoutMode === 'grid' ? 'bg-zinc-800 text-zinc-100 shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}
              title="Multi column view"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setLayoutMode('list')}
              className={`p-1.5 rounded transition-colors cursor-pointer ${layoutMode === 'list' ? 'bg-zinc-800 text-zinc-100 shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}
              title="Timestamp view"
            >
              <Clock className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Active Combined Filter Chips (Clearable independently) */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-1.5 pt-1 pb-1 text-xs text-zinc-400 bg-zinc-900/60 p-2 rounded-lg border border-white/[0.08]">
          <span className="text-[11px] font-medium text-zinc-500 mr-1 uppercase tracking-wider">
            Filters ({filteredEvents.length} moments):
          </span>

          {/* Major Filter Chip */}
          {isMajorOnly && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-amber-500/10 text-amber-300 border border-amber-500/30 text-[11px] font-medium">
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              <span>Major Highlights</span>
              <button onClick={() => setIsMajorOnly(false)} className="hover:text-white p-0.5 cursor-pointer" title="Remove Major filter">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {/* Tag Filter Chip */}
          {selectedCategory !== 'all' && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-zinc-800 text-zinc-200 border border-zinc-700 text-[11px] font-medium">
              <span>Tag: {CATEGORY_CONFIG[selectedCategory]?.label || selectedCategory}</span>
              <button onClick={() => setSelectedCategory('all')} className="hover:text-white p-0.5 cursor-pointer" title="Remove Tag filter">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {/* Character Filter Chip */}
          {selectedCharacter !== 'all' && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-zinc-800 text-zinc-200 border border-zinc-700 text-[11px] font-medium">
              <span>Character: {selectedCharacter}</span>
              <button onClick={() => setSelectedCharacter('all')} className="hover:text-white p-0.5 cursor-pointer" title="Remove Character filter">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {/* Search Query Chip */}
          {searchQuery && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-zinc-800 text-zinc-200 border border-zinc-700 text-[11px]">
              <span>Search: "{searchQuery}"</span>
              <button onClick={() => setSearchQuery('')} className="hover:text-white p-0.5 cursor-pointer" title="Clear search">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {/* Saved Bookmarks Chip */}
          {showOnlyBookmarks && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-amber-500/10 text-amber-300 border border-amber-500/30 text-[11px]">
              <span>Saved Only</span>
              <button onClick={() => setShowOnlyBookmarks(false)} className="hover:text-white p-0.5 cursor-pointer" title="Show all">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {/* Reset All Filters */}
          <button
            onClick={() => {
              setSelectedCategory('all');
              setSelectedCharacter('all');
              setIsMajorOnly(false);
              setSearchQuery('');
              setShowOnlyBookmarks(false);
            }}
            className="text-zinc-500 hover:text-zinc-200 text-[11px] underline ml-auto font-medium transition-colors cursor-pointer"
          >
            Reset all
          </button>
        </div>
      )}

      {/* Empty State */}
      {filteredEvents.length === 0 && (
        <div className="text-center py-16 px-4 bg-zinc-900/40 rounded-xl border border-white/[0.08] space-y-3">
          <AlertTriangle className="w-8 h-8 text-amber-400 mx-auto" />
          <h3 className="text-base font-semibold text-zinc-200">No timeline moments match this combination</h3>
          <p className="text-xs text-zinc-400 max-w-sm mx-auto">
            Try removing one of the active filters above to see matching moments.
          </p>
          <button
            onClick={() => {
              setSelectedCategory('all');
              setSelectedCharacter('all');
              setIsMajorOnly(false);
              setSearchQuery('');
              setShowOnlyBookmarks(false);
            }}
            className="px-3.5 py-1.5 rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-medium text-xs border border-zinc-700 transition-colors cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      )}

      {/* View Mode Switching: List Mode vs Visual Gallery Mode */}
      {layoutMode === 'list' ? (
        /* Dense Compact Timestamp List View */
        <div className="rounded-xl border border-white/[0.08] bg-zinc-950/70 overflow-hidden divide-y divide-white/[0.05]">
          {filteredEvents.map((event) => {
            const isBookmarked = bookmarks.includes(event.id);
            const imgSrc = event.image || '/images/hes_back.png';

            return (
              <div
                key={event.id}
                id={event.id}
                className="group flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2.5 sm:px-3.5 sm:py-2.5 hover:bg-zinc-900/60 transition-colors"
              >
                {/* Left: Timestamp + Major Star + Mini Thumbnail + Description */}
                <div className="flex items-center gap-2 sm:gap-2.5 min-w-0 flex-1">
                  <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-black/60 text-zinc-200 border border-white/10 text-xs font-mono tabular-nums font-semibold shrink-0">
                    <Clock className="w-3 h-3 text-zinc-400" />
                    <span>{event.timestamp}</span>
                  </span>

                  {event.isMajor && (
                    <span title="Major Highlight" className="shrink-0">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    </span>
                  )}

                  {/* Clickable mini thumbnail (zoom modal) */}
                  <button
                    onClick={() => onSelectImage({ src: imgSrc, caption: event.description, timestamp: event.timestamp })}
                    className="relative w-12 sm:w-14 aspect-video rounded overflow-hidden border border-white/10 shrink-0 group/thumb hover:border-zinc-500 transition-colors cursor-pointer"
                    title="Click to zoom screenshot"
                  >
                    <img
                      src={imgSrc}
                      alt={event.description}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover/thumb:scale-105 transition-transform"
                    />
                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover/thumb:opacity-100 flex items-center justify-center transition-opacity">
                      <Maximize2 className="w-2.5 h-2.5 text-white" />
                    </div>
                  </button>

                  {/* Description & Characters */}
                  <div className="min-w-0 flex-1">
                    <p className="text-xs sm:text-sm text-zinc-200 font-medium line-clamp-2 sm:line-clamp-1 leading-snug">
                      {event.description}
                    </p>
                    {event.characters && event.characters.length > 0 && (
                      <div className="flex items-center gap-1 mt-0.5">
                        {event.characters.map((char) => (
                          <button
                            key={char}
                            onClick={() => {
                              setSelectedCharacter(selectedCharacter === char ? 'all' : char);
                              if (onCharacterClick) onCharacterClick(char);
                            }}
                            className="text-[10px] text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer"
                          >
                            @{char}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Right: Category Tags + Twitch + Kick + Bookmark + Share */}
                <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0 pt-1 sm:pt-0 border-t sm:border-t-0 border-white/[0.04]">
                  {/* Category Tags */}
                  <div className="flex items-center gap-1">
                    {(event.tags || [event.category]).map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1 text-[10px] text-zinc-400 bg-zinc-900 px-1.5 py-0.5 rounded border border-white/[0.06]"
                        title={CATEGORY_CONFIG[tag]?.label || tag}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${CATEGORY_CONFIG[tag]?.dotColor || 'bg-zinc-400'}`} />
                        <span className="hidden md:inline">{CATEGORY_CONFIG[tag]?.label || tag}</span>
                      </span>
                    ))}
                  </div>

                  {/* Twitch & Kick Jump Buttons */}
                  <div className="flex items-center gap-1">
                    <a
                      href={event.twitchUrl || 'https://www.twitch.tv/xqc'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 rounded bg-[#9146ff] hover:bg-[#772ce8] text-white transition-colors shadow-sm flex items-center justify-center"
                      title={`Jump to ${event.timestamp} on Twitch`}
                    >
                      <TwitchIcon className="w-3.5 h-3.5 fill-current" />
                    </a>

                    <a
                      href={event.kickUrl || 'https://kick.com/xqc'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 rounded bg-[#53fc18]/15 hover:bg-[#53fc18]/25 text-[#53fc18] border border-[#53fc18]/30 transition-colors flex items-center justify-center"
                      title={`Jump to ${event.timestamp} on Kick`}
                    >
                      <KickIcon className="w-3.5 h-3.5 fill-current" />
                    </a>

                    <button
                      onClick={() => toggleBookmark(event.id)}
                      className={`p-1.5 rounded border transition-colors cursor-pointer ${
                        isBookmarked
                          ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                          : 'bg-zinc-900 border-white/10 text-zinc-400 hover:text-white'
                      }`}
                      title={isBookmarked ? 'Remove bookmark' : 'Bookmark this moment'}
                    >
                      <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-amber-400' : ''}`} />
                    </button>

                    <button
                      onClick={() => copyEventLink(event)}
                      className="p-1.5 rounded bg-zinc-900 border border-white/10 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                      title="Copy link"
                    >
                      {copiedId === event.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Visual Screenshot Gallery: Feed (1-col) or Grid (2-col on mobile & tablet, 3-col on desktop) */
        <div className={layoutMode === 'grid' ? 'grid grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-4' : 'space-y-4'}>
          {filteredEvents.map((event) => {
            const isBookmarked = bookmarks.includes(event.id);
            const isTapped = tappedId === event.id;
            const imgSrc = event.image || '/images/hes_back.png';

            return (
              <article
                key={event.id}
                id={event.id}
                onClick={() => {
                  if (layoutMode === 'grid') {
                    setFocusedEvent(event);
                  } else {
                    setTappedId(isTapped ? null : event.id);
                  }
                }}
                className="group relative rounded-xl overflow-hidden aspect-video bg-zinc-950 border border-white/[0.08] hover:border-zinc-600/80 shadow-md transition-all duration-200 ease-out cursor-pointer select-none"
              >
                {/* Full-Bleed Screenshot with subtle 1.02x scale-up */}
                <img
                  src={imgSrc}
                  alt={event.description}
                  loading="lazy"
                  className="w-full h-full object-cover object-center transition-transform duration-300 ease-out group-hover:scale-[1.02]"
                />

                {/* Subtle Top Gradient for Badge Readability */}
                <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-black/70 to-transparent pointer-events-none group-hover:opacity-0 transition-opacity duration-200 ease-out"></div>

                {/* Translucent Centered Play Icon on Hover */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10 opacity-0 group-hover:opacity-90 transition-all duration-200 ease-out scale-90 group-hover:scale-100">
                  <div className="w-8 h-8 sm:w-11 sm:h-11 rounded-full bg-black/60 backdrop-blur-md border border-white/20 flex items-center justify-center text-white shadow-xl">
                    <Play className="w-4 h-4 sm:w-5 sm:h-5 fill-white ml-0.5" />
                  </div>
                </div>

                {/* Top Permanent Badge & Action Overlay - sits at z-30 above hover backdrop */}
                <div className="absolute top-2 sm:top-2.5 left-2 sm:left-3.5 right-2 sm:right-3 flex items-center justify-between pointer-events-auto z-30">
                  <div className="flex items-center gap-1 sm:gap-1.5">
                    {/* Frosted Glass Monospace Timestamp Pill */}
                    <span className="flex items-center gap-1 px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-md bg-black/60 backdrop-blur-md text-zinc-200 border border-white/10 text-[10px] sm:text-xs font-mono tabular-nums font-semibold shadow-sm">
                      <Clock className="w-3 h-3 text-zinc-400" />
                      <span>{event.timestamp}</span>
                    </span>

                    {/* Major Update Badge (Amber) */}
                    {event.isMajor && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsMajorOnly(!isMajorOnly);
                        }}
                        className="flex items-center gap-1 px-1.5 sm:px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[9px] sm:text-[10px] font-semibold tracking-wide uppercase shadow-sm hover:bg-amber-500/30 transition-colors cursor-pointer"
                        title="Major breakthrough moment"
                      >
                        <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                        <span className="hidden sm:inline">Major</span>
                      </button>
                    )}

                    {/* Tag dots — visible on desktop */}
                    <div className="hidden md:flex items-center gap-1">
                      {(event.tags || [event.category]).map(tag => (
                        <button
                          key={tag}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedCategory(selectedCategory === tag ? 'all' : tag);
                          }}
                          className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-black/60 backdrop-blur-md border border-white/10 text-[10px] font-medium text-zinc-300 hover:text-white hover:bg-black/80 transition-colors cursor-pointer"
                          title={`Filter: ${CATEGORY_CONFIG[tag]?.label || tag}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${CATEGORY_CONFIG[tag]?.dotColor || 'bg-zinc-400'}`}></span>
                          <span>{CATEGORY_CONFIG[tag]?.label || tag}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Bookmark & Share Actions */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleBookmark(event.id);
                      }}
                      className={`p-1 sm:p-1.5 rounded-md backdrop-blur-md border transition-colors cursor-pointer ${
                        isBookmarked
                          ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                          : 'bg-black/60 border-white/10 text-zinc-400 hover:text-white hover:bg-black/80'
                      }`}
                      title={isBookmarked ? 'Remove bookmark' : 'Bookmark this moment'}
                    >
                      <Bookmark className={`w-3 sm:w-3.5 h-3 sm:h-3.5 ${isBookmarked ? 'fill-amber-400' : ''}`} />
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        copyEventLink(event);
                      }}
                      className="p-1 sm:p-1.5 rounded-md backdrop-blur-md bg-black/60 border border-white/10 text-zinc-400 hover:text-white hover:bg-black/80 transition-colors cursor-pointer"
                      title="Copy direct link"
                    >
                      {copiedId === event.id ? <Check className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {/* Hover Pop-Up Overlay */}
                <div
                  className={`absolute inset-0 bg-[#09090b]/92 backdrop-blur-md px-3 sm:px-4 pt-9 sm:pt-10 pb-2 sm:pb-2.5 flex flex-col justify-between transition-all duration-200 ease-out z-20 ${
                    isTapped ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto'
                  }`}
                >
                  {/* Overlay Body: Description (top-aligned to prevent cutting off the start) */}
                  <div className="flex-1 min-h-0 overflow-y-auto pr-1 pt-1 flex flex-col justify-start">
                    <p className="text-zinc-100 text-[11px] sm:text-xs md:text-sm leading-snug font-medium">
                      {event.description}
                    </p>

                    {/* Involved Characters */}
                    {event.characters && event.characters.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1 pt-1.5 mt-auto sm:mt-1">
                        <span className="text-zinc-500 text-[10px] mr-0.5">Involved:</span>
                        {event.characters.map((char) => (
                          <button
                            key={char}
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedCharacter(selectedCharacter === char ? 'all' : char);
                              if (onCharacterClick) onCharacterClick(char);
                            }}
                            className={`px-1.5 py-0.5 rounded text-[10px] font-medium border transition-colors cursor-pointer ${
                              selectedCharacter === char
                                ? 'bg-zinc-100 text-zinc-900 border-zinc-200 font-semibold'
                                : 'bg-zinc-900/90 hover:bg-zinc-800 text-zinc-300 border-white/[0.08]'
                            }`}
                            title={`Filter: ${char}`}
                          >
                            {char}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Overlay Footer: Always pinned and shrink-0 */}
                  <div className="shrink-0 flex items-center justify-between gap-2 pt-1.5 border-t border-white/[0.08] mt-1">
                    <span className="text-[10px] sm:text-[11px] text-zinc-500 font-mono">
                      Jump to VOD:
                    </span>

                    <div className="flex items-center gap-1.5">
                      <a
                        href={event.twitchUrl || 'https://www.twitch.tv/xqc'}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="p-1.5 rounded-md bg-[#9146ff] hover:bg-[#772ce8] text-white transition-colors shadow-sm flex items-center justify-center cursor-pointer"
                        title={`Jump to ${event.timestamp} on Twitch`}
                      >
                        <TwitchIcon className="w-3.5 h-3.5 fill-current" />
                      </a>

                      <a
                        href={event.kickUrl || 'https://kick.com/xqc'}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="p-1.5 rounded-md bg-[#53fc18]/15 hover:bg-[#53fc18]/25 text-[#53fc18] border border-[#53fc18]/30 transition-colors flex items-center justify-center cursor-pointer"
                        title={`Jump to ${event.timestamp} on Kick`}
                      >
                        <KickIcon className="w-3.5 h-3.5 fill-current" />
                      </a>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* Community & Reddit Discussion Footer */}
      <div className="mt-14 mb-8 p-6 sm:p-8 rounded-2xl bg-gradient-to-b from-zinc-900/60 to-zinc-950 border border-white/[0.08] text-center space-y-3 shadow-lg">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-medium">
          <MessageSquare className="w-3.5 h-3.5" />
          <span>Community Discussion & Live Stream Notes</span>
        </div>
        <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight">
          Want to discuss these moments or suggest corrections?
        </h3>
        <p className="text-xs sm:text-sm text-zinc-400 max-w-xl mx-auto leading-relaxed">
          Timestamps are compiled live by <span className="text-zinc-200 font-medium">u/HurricaneRein</span>. Join the daily recap discussion and support the author directly on Reddit!
        </p>
        <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
          <a
            href={activeRedditUrl || 'https://www.reddit.com/r/xqcow/'}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#ff4500]/15 hover:bg-[#ff4500]/25 text-[#ff4500] border border-[#ff4500]/30 text-xs font-semibold transition-all shadow-sm cursor-pointer"
          >
            <span>💬 Discuss on Reddit ({currentDayTitle || 'Day Recap'})</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* Big One-Column Card Modal (when clicked in multi-column view) */}
      {focusedEvent && (
        <div 
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-fadeIn"
          onClick={() => setFocusedEvent(null)}
        >
          <div 
            className="relative max-w-4xl w-full bg-zinc-950 rounded-2xl border border-white/[0.12] overflow-hidden shadow-2xl flex flex-col max-h-[92vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="px-4 py-3 bg-zinc-900/90 border-b border-white/[0.08] flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1 px-2.5 py-1 rounded bg-black/60 text-zinc-200 border border-white/10 text-xs font-mono tabular-nums font-semibold">
                  <Clock className="w-3.5 h-3.5 text-zinc-400" />
                  <span>{focusedEvent.timestamp}</span>
                </span>
                {focusedEvent.isMajor && (
                  <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-semibold tracking-wide uppercase">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                    <span>Major Highlight</span>
                  </span>
                )}
                {(focusedEvent.tags || [focusedEvent.category]).map(tag => (
                  <span
                    key={tag}
                    className="hidden sm:inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-black/60 border border-white/10 text-[10px] font-medium text-zinc-300"
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${CATEGORY_CONFIG[tag]?.dotColor || 'bg-zinc-400'}`}></span>
                    <span>{CATEGORY_CONFIG[tag]?.label || tag}</span>
                  </span>
                ))}
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => toggleBookmark(focusedEvent.id)}
                  className={`p-1.5 rounded-md border transition-colors cursor-pointer ${
                    bookmarks.includes(focusedEvent.id)
                      ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                      : 'bg-zinc-800 border-white/10 text-zinc-400 hover:text-white'
                  }`}
                  title="Bookmark"
                >
                  <Bookmark className={`w-4 h-4 ${bookmarks.includes(focusedEvent.id) ? 'fill-amber-400' : ''}`} />
                </button>
                <button
                  onClick={() => copyEventLink(focusedEvent)}
                  className="p-1.5 rounded-md bg-zinc-800 border border-white/10 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                  title="Copy direct link"
                >
                  {copiedId === focusedEvent.id ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => setFocusedEvent(null)}
                  className="p-1.5 rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors cursor-pointer ml-1"
                  title="Close (Esc)"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Large 16:9 Screenshot */}
            <div 
              className="relative aspect-video w-full bg-black overflow-hidden group/img cursor-pointer"
              onClick={() => onSelectImage({ src: focusedEvent.image || '/images/hes_back.png', caption: focusedEvent.description, timestamp: focusedEvent.timestamp })}
              title="Click for full-screen zoom"
            >
              <img
                src={focusedEvent.image || '/images/hes_back.png'}
                alt={focusedEvent.description}
                className="w-full h-full object-contain"
              />
              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover/img:opacity-100 flex items-center justify-center transition-opacity">
                <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black/70 backdrop-blur-md text-white text-xs font-medium border border-white/20">
                  <Maximize2 className="w-3.5 h-3.5" />
                  <span>Full Screen Zoom</span>
                </span>
              </div>

              {/* Prev / Next Navigation Buttons */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handlePrevFocused();
                }}
                className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/60 hover:bg-black/80 text-white backdrop-blur-md border border-white/10 transition-all opacity-80 hover:opacity-100 cursor-pointer"
                title="Previous moment (←)"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleNextFocused();
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/60 hover:bg-black/80 text-white backdrop-blur-md border border-white/10 transition-all opacity-80 hover:opacity-100 cursor-pointer"
                title="Next moment (→)"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            {/* Bottom Card Content: Description + Characters + VOD Jump */}
            <div className="p-4 sm:p-5 bg-zinc-950 space-y-3 border-t border-white/[0.08]">
              <p className="text-zinc-100 text-sm sm:text-base leading-relaxed font-medium">
                {focusedEvent.description}
              </p>

              {/* Involved Characters */}
              {focusedEvent.characters && focusedEvent.characters.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-zinc-500 text-xs mr-1">Involved:</span>
                  {focusedEvent.characters.map((char) => (
                    <button
                      key={char}
                      onClick={() => {
                        setSelectedCharacter(selectedCharacter === char ? 'all' : char);
                        if (onCharacterClick) onCharacterClick(char);
                        setFocusedEvent(null);
                      }}
                      className="px-2.5 py-0.5 rounded-md text-xs font-medium bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-white/[0.08] transition-colors cursor-pointer"
                    >
                      {char}
                    </button>
                  ))}
                </div>
              )}

              {/* Footer: Jump to VOD buttons & Switch to Feed button */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-white/[0.08]">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-zinc-400 font-mono">
                    Jump to VOD:
                  </span>
                  <a
                    href={focusedEvent.twitchUrl || 'https://www.twitch.tv/xqc'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#9146ff] hover:bg-[#772ce8] text-white text-xs font-semibold transition-colors shadow-sm cursor-pointer"
                  >
                    <TwitchIcon className="w-3.5 h-3.5 fill-current" />
                    <span>Twitch</span>
                  </a>
                  <a
                    href={focusedEvent.kickUrl || 'https://kick.com/xqc'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#53fc18]/15 hover:bg-[#53fc18]/25 text-[#53fc18] border border-[#53fc18]/30 text-xs font-semibold transition-colors cursor-pointer"
                  >
                    <KickIcon className="w-3.5 h-3.5 fill-current" />
                    <span>Kick</span>
                  </a>
                </div>

                {/* Switch to single column view button */}
                <button
                  onClick={() => {
                    setLayoutMode('feed');
                    const targetId = focusedEvent.id;
                    setFocusedEvent(null);
                    setTimeout(() => {
                      const el = document.getElementById(targetId);
                      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }, 100);
                  }}
                  className="text-xs text-zinc-400 hover:text-zinc-200 underline font-medium transition-colors cursor-pointer"
                >
                  Switch to single column feed
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Toast Popup when Share Link is Copied */}
      <div
        className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 pointer-events-none ${
          copiedToast ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-2 scale-95'
        }`}
      >
        <div className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-zinc-900/95 text-zinc-100 border border-white/15 shadow-2xl backdrop-blur-md text-xs font-medium">
          <div className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
            <Check className="w-2.5 h-2.5 stroke-[2.5]" />
          </div>
          <span>timestamp link copied</span>
        </div>
      </div>
    </div>
  );
}

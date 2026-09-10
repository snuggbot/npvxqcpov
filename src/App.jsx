import { useState, useEffect } from 'react';
import recapData from './data/recapData.json';
import initialDaysData from './data/daysData.json';
import Navbar from './components/Navbar.jsx';
import TimelineView from './components/TimelineView.jsx';
import ExtrasModal from './components/ExtrasModal.jsx';
import { ArrowUp, ArrowDown, ChevronDown } from 'lucide-react';
import { Analytics } from '@vercel/analytics/react';

export default function App() {
  const [days, setDays] = useState(initialDaysData.days || {});
  const [selectedDay, setSelectedDay] = useState('1');
  const [searchQuery, setSearchQuery] = useState('');
  const [showOnlyBookmarks, setShowOnlyBookmarks] = useState(false);
  const [showExtras, setShowExtras] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState('idle'); // 'idle', 'syncing', 'synced'

  // Bookmarks persistence
  const [bookmarks, setBookmarks] = useState(() => {
    try {
      const saved = localStorage.getItem('np5_bookmarks');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const toggleBookmark = (eventId) => {
    setBookmarks((prev) => {
      const exists = prev.includes(eventId);
      const next = exists ? prev.filter(id => id !== eventId) : [...prev, eventId];
      try {
        localStorage.setItem('np5_bookmarks', JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
  };

  // Keyboard shortcut for search
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === '/' && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
        e.preventDefault();
        const input = document.querySelector('input[type="text"]');
        if (input) input.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const mergeDaysPreservingImages = (newDays, prevDays) => {
    const merged = { ...newDays };
    Object.keys(merged).forEach(dayKey => {
      if (merged[dayKey]?.events && prevDays[dayKey]?.events) {
        const prevImgMap = {};
        prevDays[dayKey].events.forEach(pe => {
          if (pe.image) {
            prevImgMap[pe.timestamp] = { image: pe.image, caption: pe.imageCaption };
          }
        });
        merged[dayKey].events.forEach(ne => {
          if (!ne.image && prevImgMap[ne.timestamp]) {
            ne.image = prevImgMap[ne.timestamp].image;
            ne.imageCaption = prevImgMap[ne.timestamp].caption;
          }
        });
      }
    });
    return merged;
  };

  // Fetch latest days data on mount
  useEffect(() => {
    fetch('/api/days')
      .then(r => r.json())
      .then(d => {
        if (d && d.days) {
          setDays(prev => mergeDaysPreservingImages(d.days, prev));
        }
      })
      .catch(() => {});
  }, []);

  // Sync with Reddit
  const handleSync = async () => {
    setIsSyncing(true);
    setSyncStatus('syncing');
    try {
      const res = await fetch('/api/sync', { method: 'POST' });
      const json = await res.json();
      if (json.data && json.data.days) {
        setDays(prev => mergeDaysPreservingImages(json.data.days, prev));
        setSyncStatus('synced');
        setTimeout(() => setSyncStatus('idle'), 3000);
      } else {
        setSyncStatus('idle');
      }
    } catch {
      setSyncStatus('idle');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleCharacterFilter = (charName) => {
    setSearchQuery(charName);
    window.scrollTo({ top: 100, behavior: 'smooth' });
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToBottom = () => {
    window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'smooth' });
  };

  // Resolve current active day's events
  const currentDayInfo = days[selectedDay] || days['1'];
  const activeEvents = currentDayInfo?.events || recapData.events;
  const activeRedditUrl = currentDayInfo?.redditUrl || recapData.meta.links.redditPost;

  const getDayOptionLabel = (dayNum, dayInfo) => {
    const count = dayInfo.eventsCount || dayInfo.events?.length || 0;
    const status = dayInfo.isLive ? ' • LIVE' : '';
    return `Day ${dayNum} (${count} moments)${status}`;
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 flex flex-col font-sans selection:bg-amber-500/20 selection:text-amber-200">
      {/* Top Navigation */}
      <Navbar
        meta={recapData.meta}
        bookmarkCount={bookmarks.length}
        showOnlyBookmarks={showOnlyBookmarks}
        setShowOnlyBookmarks={setShowOnlyBookmarks}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onSync={handleSync}
        isSyncing={isSyncing}
        syncStatus={syncStatus}
        activeRedditUrl={activeRedditUrl}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 pt-3">
        {/* Day Switcher & Extras Toolbar */}
        <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/[0.08] gap-2">
          {Object.keys(days).length <= 6 ? (
            <div className="flex items-center bg-zinc-900/90 p-1 rounded-lg border border-white/[0.08] gap-1 overflow-x-auto">
              {Object.entries(days).map(([dayNum, dayInfo]) => {
                const isSelected = selectedDay === dayNum;
                const count = dayInfo.eventsCount || dayInfo.events?.length || 0;
                return (
                  <button
                    key={dayNum}
                    onClick={() => setSelectedDay(dayNum)}
                    className={`px-3 py-1.5 rounded-md text-xs transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                      isSelected
                        ? 'bg-zinc-800 text-white font-semibold shadow-sm border border-zinc-700/60'
                        : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'
                    }`}
                  >
                    {dayInfo.isLive && (
                      <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                    )}
                    <span>Day {dayNum}</span>
                    <span className="font-mono text-[10px] tabular-nums opacity-75">({count})</span>
                    {dayInfo.isLive && (
                      <span className="px-1 py-0.2 rounded bg-red-500/20 text-red-400 text-[9px] font-bold">
                        LIVE
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          ) : (
            /* Scalable Dropdown + Quick Pills for 7+ Days */
            <div className="flex items-center gap-2">
              <div className="relative">
                <select
                  value={selectedDay}
                  onChange={(e) => setSelectedDay(e.target.value)}
                  className="pl-3 pr-8 py-1.5 rounded-lg text-xs font-semibold bg-zinc-900 text-zinc-100 border border-white/10 hover:border-zinc-700 focus:outline-none transition-colors appearance-none cursor-pointer shadow-sm"
                >
                  {Object.entries(days).map(([dayNum, dayInfo]) => (
                    <option key={dayNum} value={dayNum}>
                      {getDayOptionLabel(dayNum, dayInfo)}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-zinc-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              {/* Quick jump pills for the 2 most recent days */}
              <div className="hidden sm:flex items-center gap-1 bg-zinc-900/90 p-1 rounded-lg border border-white/[0.08]">
                {Object.entries(days).slice(-2).map(([dayNum, dayInfo]) => {
                  const isSelected = selectedDay === dayNum;
                  return (
                    <button
                      key={dayNum}
                      onClick={() => setSelectedDay(dayNum)}
                      className={`px-2.5 py-1 rounded text-xs transition-colors cursor-pointer flex items-center gap-1.5 ${
                        isSelected
                          ? 'bg-zinc-800 text-white font-semibold shadow-sm'
                          : 'text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      {dayInfo.isLive && (
                        <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                      )}
                      <span>Day {dayNum}</span>
                      {dayInfo.isLive && (
                        <span className="px-1 py-0.2 rounded bg-red-500/20 text-red-400 text-[9px] font-bold">
                          LIVE
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Extras Button */}
          <button
            onClick={() => setShowExtras(true)}
            className="px-3 py-1.5 rounded-lg bg-zinc-900/90 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-white/[0.08] hover:border-zinc-700 text-xs font-medium transition-colors cursor-pointer shrink-0 shadow-sm"
            title="Open Character Intel, Stats, and Lore Extras"
          >
            Extras
          </button>
        </div>

        {/* The Clean Timeline Feed */}
        <TimelineView
          events={activeEvents}
          bookmarks={bookmarks}
          toggleBookmark={toggleBookmark}
          showOnlyBookmarks={showOnlyBookmarks}
          setShowOnlyBookmarks={setShowOnlyBookmarks}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onCharacterClick={handleCharacterFilter}
          kickStreamUrl={currentDayInfo?.kickStreamUrl || recapData.meta.links.kickStreamUrl}
        />
      </main>

      {/* Extras & Character Intel Modal */}
      <ExtrasModal
        isOpen={showExtras}
        onClose={() => setShowExtras(false)}
        dayInfo={currentDayInfo}
        meta={recapData.meta}
        onCharacterSelect={handleCharacterFilter}
      />

      {/* Floating Scroll Navigation (Top & Bottom) */}
      <div className="fixed bottom-6 right-6 z-30 flex flex-col gap-2">
        <button
          onClick={scrollToTop}
          className="p-2.5 rounded-full bg-zinc-800/90 hover:bg-zinc-700 text-zinc-300 hover:text-white shadow-xl border border-white/10 hover:scale-105 active:scale-95 transition-all cursor-pointer backdrop-blur-md"
          title="Scroll to top"
        >
          <ArrowUp className="w-4 h-4" />
        </button>
        <button
          onClick={scrollToBottom}
          className="p-2.5 rounded-full bg-zinc-800/90 hover:bg-zinc-700 text-zinc-300 hover:text-white shadow-xl border border-white/10 hover:scale-105 active:scale-95 transition-all cursor-pointer backdrop-blur-md"
          title="Scroll to bottom"
        >
          <ArrowDown className="w-4 h-4" />
        </button>
      </div>

      {/* Vercel Analytics */}
      <Analytics />
    </div>
  );
}

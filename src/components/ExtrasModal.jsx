import { useState, useEffect, useMemo } from 'react';
import { 
  X, User, TrendingUp, Users, 
  ExternalLink, Clock, ShieldAlert, Award, 
  Coins, Siren, HeartPulse, Star, MessageSquare
} from 'lucide-react';

export default function ExtrasModal({ isOpen, onClose, dayInfo, meta, onCharacterSelect }) {
  const [activeTab, setActiveTab] = useState('character');

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Dynamically derive characters encountered in this day's recap
  const castList = useMemo(() => {
    const map = {};
    (dayInfo?.events || []).forEach(e => {
      (e.characters || []).forEach(char => {
        if (!map[char]) {
          map[char] = { name: char, count: 0, latestMoment: e.description, latestTime: e.timestamp };
        }
        map[char].count += 1;
        map[char].latestMoment = e.description;
        map[char].latestTime = e.timestamp;
      });
    });
    return Object.values(map).sort((a, b) => b.count - a.count);
  }, [dayInfo]);

  // Dynamically derive stream telemetry & economy events for this specific day
  const dayStats = useMemo(() => {
    const evts = dayInfo?.events || [];
    
    const medical = evts.filter(e => 
      e.category === 'medical' || 
      (e.tags && e.tags.includes('medical')) || 
      e.description?.toLowerCase().includes('hospital')
    ).length;

    const chases = evts.filter(e => 
      e.category === 'chase' || 
      (e.tags && e.tags.includes('chase'))
    ).length;

    const majors = evts.filter(e => e.isMajor).length;

    const cryptoEvents = evts.filter(e => 
      e.category === 'crypto' || 
      (e.tags && e.tags.includes('crypto')) || 
      e.description?.toLowerCase().includes('octane')
    );

    const latestCrypto = cryptoEvents.at(-1) || null;

    // Extract all financial/cash moments mentioned in this day's timestamps
    const moneyEvents = [];
    evts.forEach(e => {
      const match = e.description?.match(/\$?\b\d+(?:,\d+)?(?:\$|\s*dollars?)|\$\d+(?:,\d+)?/gi);
      if (match) {
        moneyEvents.push({
          timestamp: e.timestamp,
          amount: match[0],
          description: e.description
        });
      }
    });

    return {
      medicalCount: medical,
      chaseCount: chases,
      majorCount: majors,
      cryptoCount: cryptoEvents.length,
      latestCryptoAction: latestCrypto?.description || null,
      latestCryptoTime: latestCrypto?.timestamp || null,
      moneyEvents
    };
  }, [dayInfo]);

  if (!isOpen) return null;

  const charInfo = dayInfo?.characterInfo || {
    name: 'Jean Paul',
    background: 'Jean Paul (X) is a well-known criminal and constant menace in the city. Even though he prefers working alone, he’s been part of several groups over the years. His most recent one was The Company, which he eventually betrayed — stealing a large amount of their assets before teaming up with his best friend Marty Banks near the end of NoPixel 4.0, it is also notable that Jean Paul has a brother called Pierre Paul (played by xqc as well) who is a police officer and a sister called Jolie Paul (played by Pokimane) and an in-game girlfriend called Ginger Ale (played by his IRL GF now Aikobliss).',
    timeLoggedIn: '11.10 hours',
    timesJailed: '0'
  };

  const links = meta?.links || {};

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 animate-fadeIn"
      onClick={onClose}
    >
      <div 
        className="relative max-w-2xl w-full bg-zinc-950 rounded-2xl border border-white/[0.1] overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="px-5 py-3.5 bg-zinc-900/90 border-b border-white/[0.08] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-400"></span>
            <h2 className="font-semibold text-zinc-100 text-sm sm:text-base tracking-tight">
              Recap Extras & Intel
            </h2>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-white/10">
              Day {dayInfo?.dayNumber || 1}
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors cursor-pointer"
            title="Close (Esc)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 px-5 py-2.5 bg-zinc-900/40 border-b border-white/[0.06] overflow-x-auto text-xs font-medium">
          <button
            onClick={() => setActiveTab('character')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors cursor-pointer shrink-0 ${
              activeTab === 'character'
                ? 'bg-zinc-800 text-white shadow-sm border border-white/10'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'
            }`}
          >
            <User className="w-3.5 h-3.5 text-amber-400" />
            <span>Character Intel</span>
          </button>

          <button
            onClick={() => setActiveTab('economy')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors cursor-pointer shrink-0 ${
              activeTab === 'economy'
                ? 'bg-zinc-800 text-white shadow-sm border border-white/10'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5 text-lime-400" />
            <span>Economy & Telemetry</span>
          </button>

          <button
            onClick={() => setActiveTab('cast')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors cursor-pointer shrink-0 ${
              activeTab === 'cast'
                ? 'bg-zinc-800 text-white shadow-sm border border-white/10'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'
            }`}
          >
            <Users className="w-3.5 h-3.5 text-sky-400" />
            <span>Key Cast ({castList.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('community')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors cursor-pointer shrink-0 ${
              activeTab === 'community'
                ? 'bg-zinc-800 text-white shadow-sm border border-white/10'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5 text-amber-400" />
            <span>Community Notes</span>
          </button>
        </div>

        {/* Tab Content Area */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* TAB 1: Character Intel & Live Stats */}
          {activeTab === 'character' && (
            <div className="space-y-4">
              {/* Stat Cards Row */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                <div className="p-3 rounded-xl bg-zinc-900/60 border border-white/[0.06] space-y-1">
                  <span className="text-[11px] text-zinc-500 flex items-center gap-1">
                    <User className="w-3 h-3 text-zinc-400" />
                    <span>Character</span>
                  </span>
                  <p className="text-sm font-semibold text-zinc-100">
                    {charInfo.name || 'Jean Paul'}
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-zinc-900/60 border border-white/[0.06] space-y-1">
                  <span className="text-[11px] text-zinc-500 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-zinc-400" />
                    <span>Time Logged In</span>
                  </span>
                  <p className="text-sm font-semibold text-amber-400 font-mono tabular-nums">
                    {charInfo.timeLoggedIn || '11.10 hours'}
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-zinc-900/60 border border-white/[0.06] space-y-1 col-span-2 sm:col-span-1">
                  <span className="text-[11px] text-zinc-500 flex items-center gap-1">
                    <ShieldAlert className="w-3 h-3 text-zinc-400" />
                    <span>Times Jailed</span>
                  </span>
                  <p className="text-sm font-semibold text-emerald-400 font-mono tabular-nums">
                    {charInfo.timesJailed || '0'}
                  </p>
                </div>
              </div>

              {/* Character Background Lore */}
              <div className="p-4 rounded-xl bg-zinc-900/40 border border-white/[0.06] space-y-2">
                <span className="text-xs font-semibold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-amber-400" />
                  <span>Character Background (NoPixel 3.0 – 4.0)</span>
                </span>
                <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed font-normal">
                  {charInfo.background}
                </p>
              </div>

              {/* Community Wiki Links */}
              <div className="p-3 rounded-xl bg-zinc-900/20 border border-white/[0.06] space-y-2">
                <span className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider">
                  Community Fandom Wikis
                </span>
                <div className="flex flex-wrap gap-2 text-xs">
                  {links.wikiJeanPaul && (
                    <a
                      href={links.wikiJeanPaul}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1 rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white border border-white/[0.06] transition-colors flex items-center gap-1"
                    >
                      <span>Jean Paul (4.0)</span>
                      <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                    </a>
                  )}
                  {links.wikiPierrePaul && (
                    <a
                      href={links.wikiPierrePaul}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1 rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white border border-white/[0.06] transition-colors flex items-center gap-1"
                    >
                      <span>Officer Pierre Paul</span>
                      <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                    </a>
                  )}
                  {links.wikiJeanPierre && (
                    <a
                      href={links.wikiJeanPierre}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1 rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white border border-white/[0.06] transition-colors flex items-center gap-1"
                    >
                      <span>Jean-Pierre (2.0)</span>
                      <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Dynamic Economy & Stream Telemetry per Day */}
          {activeTab === 'economy' && (
            <div className="space-y-4">
              {/* Telemetry Metric Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="p-3 rounded-xl bg-zinc-900/60 border border-white/[0.06] space-y-1">
                  <span className="text-[11px] text-zinc-500 flex items-center gap-1">
                    <Star className="w-3 h-3 text-amber-400" />
                    <span>Highlights</span>
                  </span>
                  <p className="text-base font-semibold text-amber-400 font-mono">
                    {dayStats.majorCount}
                  </p>
                  <span className="text-[10px] text-zinc-500">Major moments</span>
                </div>

                <div className="p-3 rounded-xl bg-zinc-900/60 border border-white/[0.06] space-y-1">
                  <span className="text-[11px] text-zinc-500 flex items-center gap-1">
                    <Siren className="w-3 h-3 text-blue-400" />
                    <span>Police Chases</span>
                  </span>
                  <p className="text-base font-semibold text-blue-400 font-mono">
                    {dayStats.chaseCount}
                  </p>
                  <span className="text-[10px] text-zinc-500">Pursuits recorded</span>
                </div>

                <div className="p-3 rounded-xl bg-zinc-900/60 border border-white/[0.06] space-y-1">
                  <span className="text-[11px] text-zinc-500 flex items-center gap-1">
                    <HeartPulse className="w-3 h-3 text-rose-400" />
                    <span>Medical / EMS</span>
                  </span>
                  <p className="text-base font-semibold text-rose-400 font-mono">
                    {dayStats.medicalCount}
                  </p>
                  <span className="text-[10px] text-zinc-500">Hospital incidents</span>
                </div>

                <div className="p-3 rounded-xl bg-zinc-900/60 border border-white/[0.06] space-y-1">
                  <span className="text-[11px] text-zinc-500 flex items-center gap-1">
                    <Coins className="w-3 h-3 text-lime-400" />
                    <span>Crypto Activity</span>
                  </span>
                  <p className="text-base font-semibold text-lime-400 font-mono">
                    {dayStats.cryptoCount}
                  </p>
                  <span className="text-[10px] text-zinc-500">Octane events</span>
                </div>
              </div>

              {/* Latest Crypto Status */}
              {dayStats.latestCryptoAction && (
                <div className="p-3.5 rounded-xl bg-zinc-900/40 border border-white/[0.06] space-y-1 text-xs">
                  <div className="flex items-center justify-between text-zinc-400">
                    <span className="font-semibold text-lime-400 flex items-center gap-1.5">
                      <Coins className="w-3.5 h-3.5" />
                      <span>Octane Coin Latest Activity</span>
                    </span>
                    <span className="font-mono text-[10px] text-zinc-500">
                      @{dayStats.latestCryptoTime}
                    </span>
                  </div>
                  <p className="text-zinc-200 mt-1">
                    {dayStats.latestCryptoAction}
                  </p>
                </div>
              )}

              {/* Financial & Money Events Recorded in this day's stream */}
              <div className="space-y-2">
                <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block">
                  Transactions & Cash Flow Mentioned ({dayStats.moneyEvents.length}):
                </span>
                {dayStats.moneyEvents.length === 0 ? (
                  <p className="text-xs text-zinc-500 italic p-3 rounded-lg bg-zinc-900/40 border border-white/[0.06]">
                    No explicit dollar amounts mentioned in this day's timestamps.
                  </p>
                ) : (
                  <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1 text-xs">
                    {dayStats.moneyEvents.map((m, idx) => (
                      <div
                        key={idx}
                        className="p-2 rounded-lg bg-zinc-900/60 border border-white/[0.06] flex items-center justify-between gap-2"
                      >
                        <span className="font-mono text-xs text-emerald-400 font-semibold shrink-0">
                          {m.amount}
                        </span>
                        <span className="text-zinc-300 truncate flex-1 text-[11px]">
                          {m.description}
                        </span>
                        <span className="font-mono text-[10px] text-zinc-500 shrink-0">
                          {m.timestamp}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: Key Cast — 100% Dynamically Derived from Day Events */}
          {activeTab === 'cast' && (
            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between text-zinc-400 pb-1">
                <span>
                  Characters encountered by Jean Paul in Day {dayInfo?.dayNumber || 1} ({castList.length} total):
                </span>
                <span className="text-[11px] text-zinc-500 font-mono hidden sm:inline">
                  Click to filter timeline
                </span>
              </div>

              {castList.length === 0 ? (
                <div className="p-8 text-center text-zinc-500 bg-zinc-900/40 rounded-xl border border-white/[0.06]">
                  No characters recorded for this day yet.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {castList.map(c => (
                    <button
                      key={c.name}
                      onClick={() => {
                        if (onCharacterSelect) onCharacterSelect(c.name);
                        onClose();
                      }}
                      className="p-3 rounded-xl bg-zinc-900/60 hover:bg-zinc-800/80 border border-white/[0.06] hover:border-zinc-600 transition-all text-left cursor-pointer group"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-zinc-200 group-hover:text-white">
                          {c.name}
                        </span>
                        <span className="text-[10px] text-zinc-400 font-mono bg-zinc-800/80 px-2 py-0.5 rounded border border-white/10">
                          {c.count} moments
                        </span>
                      </div>
                      <p className="text-[11px] text-zinc-400 mt-1.5 leading-snug line-clamp-2">
                        {c.latestMoment}
                      </p>
                      <span className="text-[10px] text-zinc-500 font-mono mt-1 block">
                        Latest @ {c.latestTime}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: Community Discussion & Reddit Notes */}
          {activeTab === 'community' && (
            <div className="p-6 sm:p-8 rounded-2xl bg-zinc-900/60 border border-white/[0.08] text-center space-y-4 shadow-lg">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-medium">
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Community Discussion & Live Stream Notes</span>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                Want to discuss these moments or suggest corrections?
              </h3>
              <p className="text-xs sm:text-sm text-zinc-400 max-w-lg mx-auto leading-relaxed">
                Timestamps are compiled live by <span className="text-zinc-200 font-medium">u/HurricaneRein</span>. Join the daily recap discussion and support the author directly on Reddit!
              </p>
              <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
                <a
                  href={dayInfo?.redditUrl || meta?.links?.redditPost || 'https://www.reddit.com/r/xqcow/'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#ff4500]/15 hover:bg-[#ff4500]/25 text-[#ff4500] border border-[#ff4500]/30 text-xs font-semibold transition-all shadow-sm cursor-pointer"
                >
                  <span>💬 Discuss on Reddit ({dayInfo?.title || `Day ${dayInfo?.dayNumber || 1}`})</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

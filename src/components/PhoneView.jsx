import React, { useState } from 'react';
import { 
  Smartphone, MessageSquare, TrendingUp, Car, Briefcase, Activity, 
  Heart, Repeat2, Send, ArrowUpRight, AlertCircle, Sparkles
} from 'lucide-react';

export default function PhoneView({ recapData }) {
  const { twatterPosts, guberRides } = recapData;
  const [activeApp, setActiveApp] = useState('twatter'); // 'twatter', 'crypto', 'guber', 'business', 'health'
  
  // Interactive Twatter state
  const [posts, setPosts] = useState(twatterPosts);
  const [newTweetText, setNewTweetText] = useState('');
  const [likedPosts, setLikedPosts] = useState({});

  // Interactive Crypto state
  const [userCash, setUserCash] = useState(1000);
  const [userOctane, setUserOctane] = useState(0);
  const [tradeAmount, setTradeAmount] = useState(100);
  const [currentOctanePrice] = useState(52.5);

  // Like tweet handler
  const handleLikeTweet = (postId) => {
    setLikedPosts(prev => {
      const isLiked = prev[postId];
      const updatedLiked = { ...prev, [postId]: !isLiked };
      
      setPosts(currentPosts => 
        currentPosts.map(p => {
          if (p.id === postId) {
            return {
              ...p,
              likes: isLiked ? p.likes - 1 : p.likes + 1
            };
          }
          return p;
        })
      );
      return updatedLiked;
    });
  };

  // Submit mock tweet
  const handlePostTweet = (e) => {
    e.preventDefault();
    if (!newTweetText.trim()) return;

    const newPost = {
      id: `tw-user-${Date.now()}`,
      author: 'Jean Paul',
      handle: '@JustX',
      avatar: '⚡',
      timestamp: '13:30:00',
      content: newTweetText.trim(),
      likes: 1,
      retweets: 0,
      replies: [
        { author: 'Marty Banks', handle: '@MartyB', text: 'Real and true. Stalling on top.' }
      ]
    };

    setPosts([newPost, ...posts]);
    setNewTweetText('');
  };

  // Crypto Buy
  const handleBuyOctane = () => {
    if (userCash < tradeAmount) return;
    const coinsBought = tradeAmount / currentOctanePrice;
    setUserCash(prev => prev - tradeAmount);
    setUserOctane(prev => prev + coinsBought);
  };

  // Crypto Sell
  const handleSellOctane = () => {
    const coinsToSell = tradeAmount / currentOctanePrice;
    if (userOctane < coinsToSell) return;
    setUserCash(prev => prev + tradeAmount);
    setUserOctane(prev => Math.max(0, prev - coinsToSell));
  };

  return (
    <div className="space-y-6 pb-20 max-w-6xl mx-auto">
      {/* Header Info */}
      <div className="bg-slate-900/80 rounded-2xl p-6 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-cyan-400 mb-1">
            <Smartphone className="w-4 h-4" />
            <span>LOS SANTOS SMARTPHONE OS (NP5 EDITION)</span>
          </div>
          <h2 className="text-2xl font-display font-bold text-white">
            Jean Paul's In-Game Phone & Applications
          </h2>
          <p className="text-sm text-slate-400 mt-1 max-w-2xl">
            In NoPixel V, mobile phones control the economy, social clout, and criminal contracts. Browse X's Day 1 Twatter beefs, the Octane crypto market, Guber taxi driver rating, and the mysterious Pillbox hospital bio-monitor!
          </p>
        </div>

        {/* Quick App Badges */}
        <div className="flex flex-wrap items-center gap-2">
          {[
            { id: 'twatter', label: 'JustX', icon: MessageSquare, color: 'text-cyan-400' },
            { id: 'crypto', label: 'Octane Crypto', icon: TrendingUp, color: 'text-amber-400' },
            { id: 'guber', label: 'Guber Driver', icon: Car, color: 'text-blue-400' },
            { id: 'business', label: 'Stalling Co.', icon: Briefcase, color: 'text-emerald-400' },
            { id: 'health', label: 'Bio-Monitor', icon: Activity, color: 'text-rose-400' },
          ].map(app => {
            const Icon = app.icon;
            const isCurrent = activeApp === app.id;
            return (
              <button
                key={app.id}
                onClick={() => setActiveApp(app.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all ${
                  isCurrent
                    ? 'bg-slate-800 text-white border-cyan-500 shadow-md shadow-cyan-500/20'
                    : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                <Icon className={`w-4 h-4 ${app.color}`} />
                <span>{app.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Interactive Phone Chassis Container */}
      <div className="flex flex-col lg:flex-row items-start justify-center gap-8 pt-4">
        {/* Phone Mockup Frame */}
        <div className="w-full max-w-sm mx-auto lg:mx-0 bg-slate-950 rounded-[44px] p-3.5 shadow-2xl border-4 border-slate-800 relative ring-1 ring-white/10 shrink-0">
          {/* Hardware buttons simulation */}
          <div className="absolute -left-4 top-24 w-1 h-8 bg-slate-700 rounded-l-md"></div>
          <div className="absolute -left-4 top-36 w-1 h-12 bg-slate-700 rounded-l-md"></div>
          <div className="absolute -left-4 top-52 w-1 h-12 bg-slate-700 rounded-l-md"></div>
          <div className="absolute -right-4 top-32 w-1 h-16 bg-slate-700 rounded-r-md"></div>

          {/* Screen area */}
          <div className="bg-[#0b0f19] rounded-[36px] overflow-hidden border border-slate-800 flex flex-col h-[650px] relative shadow-inner">
            {/* Status Bar */}
            <div className="bg-[#0b0f19] px-6 pt-3 pb-2 flex items-center justify-between text-[11px] font-mono text-slate-300 select-none z-20">
              <span className="font-bold">12:38</span>
              {/* Dynamic Island / Notch */}
              <div className="w-24 h-4 bg-black rounded-full flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-slate-800"></div>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-cyan-400 font-bold">5G</span>
                <span>94%</span>
              </div>
            </div>

            {/* App Header */}
            <div className="px-4 py-2 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between z-10">
              <div className="flex items-center gap-2">
                {activeApp === 'twatter' && <MessageSquare className="w-4 h-4 text-cyan-400" />}
                {activeApp === 'crypto' && <TrendingUp className="w-4 h-4 text-amber-400" />}
                {activeApp === 'guber' && <Car className="w-4 h-4 text-blue-400" />}
                {activeApp === 'business' && <Briefcase className="w-4 h-4 text-emerald-400" />}
                {activeApp === 'health' && <Activity className="w-4 h-4 text-rose-400" />}
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  {activeApp === 'twatter' && 'JustX • Socials'}
                  {activeApp === 'crypto' && 'Octane Trading'}
                  {activeApp === 'guber' && 'Guber Driver'}
                  {activeApp === 'business' && 'Stalling Co.'}
                  {activeApp === 'health' && 'Pillbox Health'}
                </span>
              </div>
              <span className="text-[10px] font-mono text-slate-400">NP5.OS</span>
            </div>

            {/* Screen Inner Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-3 space-y-3">
              {/* APP 1: JUSTX (TWATTER) */}
              {activeApp === 'twatter' && (
                <div className="space-y-3 text-xs">
                  {/* Tweet box */}
                  <form onSubmit={handlePostTweet} className="bg-slate-900/90 p-2.5 rounded-xl border border-slate-800 space-y-2">
                    <div className="flex gap-2">
                      <div className="w-7 h-7 rounded-full bg-amber-500/20 text-amber-300 flex items-center justify-center font-bold text-xs shrink-0">
                        ⚡
                      </div>
                      <textarea
                        rows={2}
                        value={newTweetText}
                        onChange={(e) => setNewTweetText(e.target.value)}
                        placeholder="What's happening in Los Santos? (@JustX)"
                        className="w-full bg-transparent text-xs text-white placeholder-slate-500 resize-none focus:outline-none"
                      />
                    </div>
                    <div className="flex items-center justify-between pt-1 border-t border-slate-800">
                      <span className="text-[10px] text-slate-400 font-mono">JustX Public Feed</span>
                      <button
                        type="submit"
                        disabled={!newTweetText.trim()}
                        className="px-3 py-1 rounded-full bg-cyan-500 text-black font-bold text-[11px] disabled:opacity-40 hover:bg-cyan-400 transition-colors flex items-center gap-1"
                      >
                        <span>Tweet</span>
                        <Send className="w-3 h-3" />
                      </button>
                    </div>
                  </form>

                  {/* Feed */}
                  <div className="space-y-2.5">
                    {posts.map((tweet) => {
                      const isLiked = likedPosts[tweet.id];
                      return (
                        <div key={tweet.id} className="bg-slate-900/70 p-3 rounded-xl border border-slate-800/80 space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5">
                              <span className="text-base">{tweet.avatar}</span>
                              <div>
                                <span className="font-bold text-white text-[11px] mr-1">{tweet.author}</span>
                                <span className="text-slate-400 text-[10px]">{tweet.handle}</span>
                              </div>
                            </div>
                            <span className="text-[10px] font-mono text-cyan-400">{tweet.timestamp}</span>
                          </div>

                          <p className="text-slate-200 text-xs leading-relaxed">
                            {tweet.content}
                          </p>

                          <div className="flex items-center justify-between pt-1.5 border-t border-slate-800/50 text-slate-400 text-[11px]">
                            <button
                              onClick={() => handleLikeTweet(tweet.id)}
                              className={`flex items-center gap-1 hover:text-rose-400 transition-colors ${
                                isLiked ? 'text-rose-500 font-bold' : ''
                              }`}
                            >
                              <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-rose-500 text-rose-500' : ''}`} />
                              <span>{tweet.likes}</span>
                            </button>

                            <div className="flex items-center gap-1 text-slate-400">
                              <Repeat2 className="w-3.5 h-3.5" />
                              <span>{tweet.retweets}</span>
                            </div>

                            <span className="text-[10px] text-slate-400 font-mono">NoPixel V</span>
                          </div>

                          {/* Replies */}
                          {tweet.replies && tweet.replies.length > 0 && (
                            <div className="mt-2 pt-2 border-t border-slate-800/60 space-y-1 bg-slate-950/40 p-2 rounded-lg">
                              {tweet.replies.map((reply, rIdx) => (
                                <div key={rIdx} className="text-[10px] text-slate-300">
                                  <span className="font-semibold text-amber-400">{reply.author}</span> ({reply.handle}):{' '}
                                  <span className="text-slate-300">{reply.text}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* APP 2: OCTANE CRYPTO */}
              {activeApp === 'crypto' && (
                <div className="space-y-3 text-xs">
                  {/* Price Banner */}
                  <div className="bg-gradient-to-br from-amber-500/20 to-yellow-600/10 p-3 rounded-xl border border-amber-500/30 space-y-1">
                    <div className="flex justify-between items-center text-[10px] text-amber-300 font-bold uppercase tracking-wider">
                      <span>$OCTANE COIN</span>
                      <span className="px-1.5 py-0.2 rounded bg-amber-500/30 text-amber-200">DAY 1 LAUNCH</span>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-display font-bold text-white">${currentOctanePrice.toFixed(2)}</span>
                      <span className="text-emerald-400 font-semibold flex items-center text-xs">
                        <ArrowUpRight className="w-3 h-3" /> +5.0%
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400">
                      24h High: $68.50 | 24h Low: $46.00 (X bought dip)
                    </p>
                  </div>

                  {/* SVG Price Chart */}
                  <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800 space-y-2">
                    <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                      Price Movement Curve (Day 1 Stream)
                    </span>
                    <div className="h-28 w-full flex items-end">
                      <svg viewBox="0 0 300 100" className="w-full h-full overflow-visible">
                        <defs>
                          <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.4" />
                            <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
                          </linearGradient>
                        </defs>
                        {/* Area */}
                        <polygon
                          fill="url(#chartGrad)"
                          points="0,100 0,60 30,55 60,25 90,10 120,40 150,45 180,75 210,88 240,65 270,55 300,50 300,100"
                        />
                        {/* Line */}
                        <polyline
                          fill="none"
                          stroke="#f59e0b"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          points="0,60 30,55 60,25 90,10 120,40 150,45 180,75 210,88 240,65 270,55 300,50"
                        />
                        {/* Markers */}
                        <circle cx="90" cy="10" r="3.5" fill="#10b981" />
                        <text x="90" y="5" fill="#10b981" fontSize="8" textAnchor="middle">Tweet Pump ($68)</text>
                        <circle cx="210" cy="88" r="3.5" fill="#ef4444" />
                        <text x="210" y="98" fill="#ef4444" fontSize="8" textAnchor="middle">Dip Buy ($46)</text>
                      </svg>
                    </div>
                  </div>

                  {/* Interactive Trade Box */}
                  <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800 space-y-2.5">
                    <div className="flex justify-between items-center text-[11px]">
                      <span className="text-slate-400">Your Cash:</span>
                      <span className="text-emerald-400 font-bold font-mono">${userCash.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center text-[11px]">
                      <span className="text-slate-400">Your Octane:</span>
                      <span className="text-amber-400 font-bold font-mono">{userOctane.toFixed(3)} ($OCT)</span>
                    </div>

                    <div className="flex gap-2">
                      {[50, 100, 250, 500].map(amt => (
                        <button
                          key={amt}
                          onClick={() => setTradeAmount(amt)}
                          className={`flex-1 py-1 rounded text-[10px] font-mono border ${
                            tradeAmount === amt 
                              ? 'bg-amber-500/20 text-amber-300 border-amber-500/50' 
                              : 'bg-slate-800 text-slate-400 border-slate-700'
                          }`}
                        >
                          ${amt}
                        </button>
                      ))}
                    </div>

                    <div className="flex gap-2 pt-1">
                      <button
                        onClick={handleBuyOctane}
                        disabled={userCash < tradeAmount}
                        className="flex-1 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white font-bold text-xs transition-colors shadow"
                      >
                        Buy ${tradeAmount}
                      </button>
                      <button
                        onClick={handleSellOctane}
                        disabled={userOctane * currentOctanePrice < tradeAmount}
                        className="flex-1 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 disabled:opacity-40 text-white font-bold text-xs transition-colors shadow"
                      >
                        Sell ${tradeAmount}
                      </button>
                    </div>
                  </div>

                  {/* Lore Note */}
                  <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800 text-[10px] text-slate-400">
                    <strong className="text-amber-400">X's Crypto Journey:</strong> Bought $500 worth @ $55, hyped on JustX to 1.3k likes, panic sold to buy hunting rifles, and bought the $46 crash dip with Mista Lang & Tony Corleone!
                  </div>
                </div>
              )}

              {/* APP 3: GUBER DRIVER */}
              {activeApp === 'guber' && (
                <div className="space-y-3 text-xs">
                  {/* Driver Profile */}
                  <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-full bg-blue-500/20 text-blue-300 flex items-center justify-center font-bold text-sm border border-blue-500/30">
                        JP
                      </div>
                      <div>
                        <div className="font-bold text-white text-xs">Jean Paul</div>
                        <div className="text-[10px] text-slate-400">Active Guber Driver</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-amber-400 font-bold text-sm">4.22 ★</div>
                      <div className="text-[10px] text-slate-400">5 Rides Completed</div>
                    </div>
                  </div>

                  {/* Total Earnings Banner */}
                  <div className="bg-gradient-to-r from-blue-900/30 to-indigo-900/20 p-3 rounded-xl border border-blue-500/30 flex justify-between items-center">
                    <div>
                      <div className="text-[10px] text-blue-300 uppercase font-semibold">Day 1 Payout</div>
                      <div className="text-lg font-bold text-white font-mono">$1,827.00</div>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 text-[10px] font-semibold border border-blue-500/30">
                      Tier: Silver
                    </span>
                  </div>

                  {/* Ride History */}
                  <div className="space-y-2">
                    <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                      Completed Trips (Day 1 Log)
                    </div>
                    {guberRides.map(ride => (
                      <div key={ride.id} className="bg-slate-900/70 p-2.5 rounded-xl border border-slate-800 space-y-1.5">
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-slate-200 text-[11px]">{ride.passenger}</span>
                          <span className="font-mono text-emerald-400 font-bold">${ride.netPayout}</span>
                        </div>
                        <div className="flex justify-between text-[10px] text-slate-400">
                          <span>{ride.pickup} → {ride.dropoff}</span>
                          <span className="text-amber-400">{ride.rating}★</span>
                        </div>
                        {ride.penalty > 0 && (
                          <div className="text-[10px] text-rose-400 bg-rose-950/40 px-2 py-0.5 rounded border border-rose-900/50">
                            Reckless driving deduction: -${ride.penalty}
                          </div>
                        )}
                        <p className="text-[10px] text-slate-400 italic">
                          "{ride.review}"
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* APP 4: STALLING CO. */}
              {activeApp === 'business' && (
                <div className="space-y-3 text-xs">
                  <div className="bg-gradient-to-br from-emerald-500/20 to-teal-900/20 p-3 rounded-xl border border-emerald-500/30 space-y-1">
                    <div className="flex justify-between items-center text-[10px] text-emerald-300 font-bold uppercase">
                      <span>BUSINESS REGISTRATION</span>
                      <span className="px-1.5 py-0.2 rounded bg-emerald-500/30 text-emerald-200">ACTIVE</span>
                    </div>
                    <div className="text-lg font-display font-bold text-white">Stalling Co.</div>
                    <div className="text-[10px] text-slate-400">
                      Co-Founders: Jean Paul & Marty Banks (Created 04:49:20)
                    </div>
                  </div>

                  <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800 space-y-2">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                      Operational Roster
                    </span>
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950/40 border border-slate-800">
                        <div className="flex items-center gap-2">
                          <span className="text-sm">⚡</span>
                          <div>
                            <div className="font-bold text-white text-[11px]">Jean Paul</div>
                            <div className="text-[9px] text-slate-400">CEO / Mastermind</div>
                          </div>
                        </div>
                        <span className="text-[10px] text-emerald-400 font-bold">Online</span>
                      </div>
                      <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950/40 border border-slate-800">
                        <div className="flex items-center gap-2">
                          <span className="text-sm">🧢</span>
                          <div>
                            <div className="font-bold text-white text-[11px]">Marty Banks</div>
                            <div className="text-[9px] text-slate-400">COO / Muscle & Alibi</div>
                          </div>
                        </div>
                        <span className="text-[10px] text-emerald-400 font-bold">Online</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800 space-y-2">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                      Contracts & Sourcing Log
                    </span>
                    <ul className="space-y-1 text-[10px] text-slate-300">
                      <li className="flex items-center justify-between p-1.5 rounded bg-slate-950/30">
                        <span>Rolex & Phone Sourcing (Locals)</span>
                        <span className="text-emerald-400 font-semibold">Completed</span>
                      </li>
                      <li className="flex items-center justify-between p-1.5 rounded bg-slate-950/30">
                        <span>Pawn Shop Delivery ($350 Payout)</span>
                        <span className="text-emerald-400 font-semibold">Delivered</span>
                      </li>
                      <li className="flex items-center justify-between p-1.5 rounded bg-slate-950/30">
                        <span>Gold Panning Prospecting</span>
                        <span className="text-amber-400 font-semibold">15 Nuggets</span>
                      </li>
                    </ul>
                  </div>
                </div>
              )}

              {/* APP 5: PILLBOX HEALTH MONITOR */}
              {activeApp === 'health' && (
                <div className="space-y-3 text-xs">
                  {/* Heart rate monitor */}
                  <div className="bg-gradient-to-br from-rose-950/40 to-slate-900 p-3 rounded-xl border border-rose-500/30 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-bold text-rose-300 uppercase flex items-center gap-1">
                        <Activity className="w-3.5 h-3.5 animate-pulse text-rose-400" />
                        Live Biometrics
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">IRL + Game Sync</span>
                    </div>

                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-display font-bold text-rose-400">114</span>
                      <span className="text-xs text-slate-400 font-mono">BPM (Elevated)</span>
                    </div>

                    {/* Animated EKG line */}
                    <div className="h-10 w-full overflow-hidden flex items-center">
                      <svg viewBox="0 0 200 40" className="w-full h-full text-rose-500">
                        <polyline
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          points="0,20 20,20 30,5 40,35 50,15 60,20 90,20 100,5 110,35 120,15 130,20 160,20 170,5 180,35 190,15 200,20"
                        />
                      </svg>
                    </div>
                  </div>

                  {/* Sickness alert */}
                  <div className="bg-rose-500/20 p-3 rounded-xl border border-rose-500/50 space-y-1.5">
                    <div className="flex items-center gap-1.5 text-rose-300 font-bold text-xs">
                      <AlertCircle className="w-4 h-4 text-rose-400" />
                      <span>UNKNOWN PATHOGEN DETECTED</span>
                    </div>
                    <p className="text-[10px] text-slate-300 leading-relaxed">
                      Sickness icon appeared on health HUD after skinning wild coyotes in northern San Andreas. Blood sample collected by EMS at Pillbox Hospital. Pathogen nature currently unclassified by medical staff.
                    </p>
                  </div>

                  {/* Medical History */}
                  <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800 space-y-2">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                      Day 1 Emergency Admissions
                    </span>
                    <div className="space-y-1.5 text-[10px]">
                      <div className="p-2 rounded bg-slate-950/40 border border-slate-800">
                        <div className="flex justify-between font-bold text-slate-200">
                          <span>05:37:20 — Pillbox Hospital</span>
                          <span className="text-rose-400">Fatal Trauma</span>
                        </div>
                        <p className="text-slate-400 mt-0.5">
                          Shotgun blast from pharmacist during pharmacy till robbery. Transported by Marty Banks. Healed & discharged.
                        </p>
                      </div>

                      <div className="p-2 rounded bg-slate-950/40 border border-slate-800">
                        <div className="flex justify-between font-bold text-slate-200">
                          <span>06:58:20 — Pillbox Hospital</span>
                          <span className="text-amber-400">Infection Check</span>
                        </div>
                        <p className="text-slate-400 mt-0.5">
                          Second admission following security guard shootout. EMS ran toxicology screen on unknown disease.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom App Dock */}
            <div className="bg-slate-900/90 border-t border-slate-800 px-4 py-2.5 flex items-center justify-around z-10">
              {[
                { id: 'twatter', icon: MessageSquare, label: 'JustX', color: 'text-cyan-400' },
                { id: 'crypto', icon: TrendingUp, label: 'Octane', color: 'text-amber-400' },
                { id: 'guber', icon: Car, label: 'Guber', color: 'text-blue-400' },
                { id: 'business', icon: Briefcase, label: 'Stalling', color: 'text-emerald-400' },
                { id: 'health', icon: Activity, label: 'Health', color: 'text-rose-400' },
              ].map(dockItem => {
                const Icon = dockItem.icon;
                const isActive = activeApp === dockItem.id;
                return (
                  <button
                    key={dockItem.id}
                    onClick={() => setActiveApp(dockItem.id)}
                    className={`flex flex-col items-center gap-0.5 transition-transform ${
                      isActive ? 'scale-110' : 'opacity-60 hover:opacity-100'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                      isActive ? 'bg-slate-800 border border-cyan-500/40' : 'bg-slate-800/60'
                    }`}>
                      <Icon className={`w-4 h-4 ${dockItem.color}`} />
                    </div>
                    <span className="text-[9px] font-mono text-slate-300">{dockItem.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Home Indicator bar */}
            <div className="bg-[#0b0f19] pt-1 pb-2 flex justify-center">
              <div className="w-28 h-1 bg-slate-600 rounded-full"></div>
            </div>
          </div>
        </div>

        {/* Right Explanatory Guide Panel */}
        <div className="flex-1 space-y-4">
          <div className="bg-slate-900/80 rounded-2xl p-6 border border-slate-800 space-y-4">
            <h3 className="text-xl font-display font-bold text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400" />
              <span>How Mobile Mechanics Revolutionize NoPixel V</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="bg-slate-950/50 p-3.5 rounded-xl border border-slate-800 space-y-1.5">
                <div className="font-bold text-cyan-300 flex items-center gap-1.5">
                  <MessageSquare className="w-4 h-4 text-cyan-400" />
                  <span>JustX (In-Game Social Clout)</span>
                </div>
                <p className="text-slate-400 leading-relaxed">
                  Players build public clout, advertise heists, scam locals, or pump crypto. X used JustX to hype $OCTANE to 1,300+ likes, triggering a massive price pump across Los Santos.
                </p>
              </div>

              <div className="bg-slate-950/50 p-3.5 rounded-xl border border-slate-800 space-y-1.5">
                <div className="font-bold text-amber-300 flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4 text-amber-400" />
                  <span>Dynamic Octane Crypto</span>
                </div>
                <p className="text-slate-400 leading-relaxed">
                  Cryptocurrency moves based on player trades, news, and influencer tweets. X aped in at $55, sold to fund hunting gear, and bought back at the $46 crash with Lang and Tony.
                </p>
              </div>

              <div className="bg-slate-950/50 p-3.5 rounded-xl border border-slate-800 space-y-1.5">
                <div className="font-bold text-blue-300 flex items-center gap-1.5">
                  <Car className="w-4 h-4 text-blue-400" />
                  <span>Guber Taxi Economy</span>
                </div>
                <p className="text-slate-400 leading-relaxed">
                  Driving fares now enforce traffic rules. Speeding or crashing results in huge fare cuts and poor star ratings. X earned $1,827 across 5 fares with a final 4.22★ rating.
                </p>
              </div>

              <div className="bg-slate-950/50 p-3.5 rounded-xl border border-slate-800 space-y-1.5">
                <div className="font-bold text-rose-300 flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-rose-400" />
                  <span>Biological & Disease HUD</span>
                </div>
                <p className="text-slate-400 leading-relaxed">
                  NoPixel V introduces wilderness diseases, animal pathogen transmission, and EMS diagnostic testing. Hunting coyotes triggered an ominous illness indicator on Jean Paul's health bar.
                </p>
              </div>
            </div>

            {/* Quick interactive test */}
            <div className="p-4 rounded-xl bg-gradient-to-r from-cyan-900/20 via-indigo-900/20 to-purple-900/20 border border-cyan-500/30 flex items-center justify-between">
              <div>
                <span className="font-bold text-white text-xs">Try the Phone Apps!</span>
                <p className="text-[11px] text-slate-300">
                  Click the app icons above or dock buttons on the phone to switch between Twatter, Octane Trading, Guber, and Health.
                </p>
              </div>
              <button
                onClick={() => setActiveApp(activeApp === 'crypto' ? 'twatter' : 'crypto')}
                className="px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs transition-colors shrink-0"
              >
                Switch App →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

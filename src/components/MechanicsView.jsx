import React, { useState } from 'react';
import { 
  BookOpen, Utensils, Search, Coins, Crosshair, Briefcase, Car, 
  Volume2, CheckCircle2, DollarSign, Lightbulb, 
  ArrowRight
} from 'lucide-react';

export default function MechanicsView({ mechanics, onExploreInTimeline }) {
  const [activeMechanicId, setActiveMechanicId] = useState(mechanics[0]?.id || 'burger-shot');

  const mechanicIcons = {
    'burger-shot': Utensils,
    'metal-detecting': Search,
    'gold-panning': Coins,
    'coyote-hunting': Crosshair,
    'pawn-contracts': Briefcase,
    'guber-rides': Car
  };

  const activeMechanic = mechanics.find(m => m.id === activeMechanicId) || mechanics[0];
  const Icon = mechanicIcons[activeMechanic.id] || BookOpen;

  return (
    <div className="space-y-8 pb-20 max-w-6xl mx-auto">
      {/* Header Banner */}
      <div className="bg-slate-900/80 rounded-2xl p-6 md:p-8 border border-slate-800 relative overflow-hidden">
        <div className="absolute -left-20 top-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 space-y-2 max-w-3xl">
          <div className="flex items-center gap-2 text-xs font-semibold text-cyan-400">
            <BookOpen className="w-4 h-4" />
            <span>NOPIXEL V GAMEPLAY CODEX & ECONOMY GUIDE</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-display font-bold text-white">
            Day 1 Mechanics & System Innovations
          </h2>
          <p className="text-slate-300 text-sm md:text-base leading-relaxed">
            NoPixel V completely revamps the Los Santos economy with hands-on job mini-games, strict traffic law passenger ratings, wilderness hunting pathogens, and dynamic contract delivery logistics.
          </p>
        </div>
      </div>

      {/* Main interactive split view */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Mechanic Selector List */}
        <div className="lg:col-span-4 space-y-2">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">
            Core Mechanics Catalog
          </span>
          <div className="space-y-2">
            {mechanics.map(m => {
              const MIcon = mechanicIcons[m.id] || BookOpen;
              const isSelected = activeMechanicId === m.id;
              return (
                <button
                  key={m.id}
                  onClick={() => setActiveMechanicId(m.id)}
                  className={`w-full flex items-center justify-between p-3.5 rounded-xl border text-left transition-all ${
                    isSelected
                      ? 'bg-gradient-to-r from-cyan-950/60 to-slate-900 text-white border-cyan-500 shadow-md shadow-cyan-500/10 font-medium'
                      : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:bg-slate-800/80 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                      isSelected ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40' : 'bg-slate-800 text-slate-400'
                    }`}>
                      <MIcon className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold">{m.title.split('&')[0]}</div>
                      <div className="text-[11px] text-slate-400">{m.category}</div>
                    </div>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded font-mono ${
                    isSelected ? 'bg-cyan-500/20 text-cyan-300' : 'text-slate-500'
                  }`}>
                    Guide
                  </span>
                </button>
              );
            })}

            {/* Bonus Mechanic: Speakerphone Audio */}
            <div className="p-3.5 rounded-xl bg-slate-900/40 border border-slate-800/80 space-y-2">
              <div className="flex items-center gap-2.5 text-xs font-bold text-slate-300">
                <Volume2 className="w-4 h-4 text-purple-400" />
                <span>Audio Innovation: Speakerphone</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Players can now toggle phone calls to speakerphone mode (`09:55:00`). Vehicle passengers and nearby pedestrians can hear both sides of voice calls in real-time.
              </p>
            </div>
          </div>
        </div>

        {/* Right Mechanic Detail Card */}
        <div className="lg:col-span-8 bg-slate-900/90 rounded-2xl border border-slate-800 p-6 md:p-8 space-y-6 shadow-2xl">
          {/* Header */}
          <div className="flex flex-wrap items-start justify-between gap-4 pb-4 border-b border-slate-800">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 flex items-center justify-center">
                <Icon className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">
                  {activeMechanic.category}
                </span>
                <h3 className="text-2xl font-bold text-white">
                  {activeMechanic.title}
                </h3>
              </div>
            </div>

            <span className="px-3 py-1 rounded-full bg-slate-800 text-xs font-medium text-slate-300 border border-slate-700">
              Difficulty: {activeMechanic.difficulty}
            </span>
          </div>

          {/* Earnings & Yield */}
          <div className="bg-gradient-to-r from-emerald-950/30 to-slate-950/60 p-4 rounded-xl border border-emerald-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5" />
                Day 1 Yield / Recorded Earnings:
              </span>
              <div className="text-lg font-bold text-white font-mono mt-0.5">
                {activeMechanic.day1Earnings}
              </div>
            </div>
            <span className="text-xs text-slate-400 italic">
              Verified from xQc's stream log
            </span>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              System Overview & Mechanics
            </h4>
            <p className="text-slate-200 text-sm leading-relaxed">
              {activeMechanic.summary}
            </p>
          </div>

          {/* Operational Tips */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Lightbulb className="w-4 h-4 text-amber-400" />
              <span>Execution Guidelines & Best Practices</span>
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {activeMechanic.tips.map((tip, idx) => (
                <div key={idx} className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80 flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                  <span className="text-xs text-slate-300 leading-relaxed">{tip}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Timeline Jump Action */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
            <span className="text-xs text-slate-400">
              Want to see this in action during stream?
            </span>
            <button
              onClick={() => onExploreInTimeline(activeMechanic.category.toLowerCase())}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-medium text-xs transition-colors shadow-md shadow-cyan-600/20"
            >
              <span>View Timeline Events</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { 
  Users, Star, ArrowRight, ExternalLink, HeartHandshake
} from 'lucide-react';

export default function CharactersView({ characters, meta, onSelectCharacterTimeline }) {
  const [selectedFaction, setSelectedFaction] = useState('all');

  const factions = [
    { id: 'all', label: 'All Personalities' },
    { id: 'stalling', label: 'Stalling Crew' },
    { id: 'associates', label: 'Buddha & Tony Crew' },
    { id: 'syndicate', label: 'Syndicates & Mystery' },
    { id: 'civilians', label: 'Civilians & Rivals' }
  ];

  const filteredCharacters = characters.filter(char => {
    if (selectedFaction === 'all') return true;
    if (selectedFaction === 'stalling') return char.id === 'jean-paul' || char.id === 'marty-banks';
    if (selectedFaction === 'associates') return char.id === 'mista-lang' || char.id === 'tony-corleone';
    if (selectedFaction === 'syndicate') return char.id === 'mr-cement';
    if (selectedFaction === 'civilians') return char.id === 'chatterbox';
    return true;
  });

  return (
    <div className="space-y-8 pb-20 max-w-6xl mx-auto">
      {/* Header Banner */}
      <div className="bg-slate-900/80 rounded-2xl p-6 md:p-8 border border-slate-800 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 space-y-2 max-w-3xl">
          <div className="flex items-center gap-2 text-xs font-semibold text-purple-400">
            <Users className="w-4 h-4" />
            <span>CHARACTER LORE & DAY 1 ALLIANCES</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-display font-bold text-white">
            Key Figures of NoPixel V Launch
          </h2>
          <p className="text-slate-300 text-sm md:text-base leading-relaxed">
            Jean Paul enters Los Santos with a rich legacy from NoPixel 3.0 and 4.0: his infamous betrayal of <span className="text-amber-400 font-medium">The Company</span>, his unbreakable bond with <span className="text-cyan-400 font-medium">Marty Banks</span>, and his complex relations with <span className="text-rose-400 font-medium">Mista Lang</span> and <span className="text-purple-400 font-medium">Tony Corleone</span>.
          </p>
        </div>

        {/* Faction Filter Buttons */}
        <div className="mt-6 flex flex-wrap items-center gap-2">
          {factions.map(f => (
            <button
              key={f.id}
              onClick={() => setSelectedFaction(f.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                selectedFaction === f.id
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 shadow-sm'
                  : 'bg-slate-800/80 text-slate-400 border-slate-700 hover:text-white'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Characters Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredCharacters.map(char => (
          <div
            key={char.id}
            className="bg-slate-900/80 rounded-2xl border border-slate-800 overflow-hidden hover:border-slate-700 transition-all flex flex-col justify-between shadow-xl"
          >
            {/* Card Top */}
            <div className="p-6 space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${char.avatarColor} flex items-center justify-center text-xl font-display font-bold text-white shadow-lg border border-white/20 shrink-0`}>
                    {char.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                      {char.name}
                    </h3>
                    <div className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                      <span className="text-amber-400 font-medium">Played by {char.actor}</span>
                      <span>•</span>
                      <span className="text-slate-300 font-semibold">{char.faction}</span>
                    </div>
                  </div>
                </div>

                <span className="px-2.5 py-1 rounded-full bg-slate-800 text-[11px] font-medium text-cyan-300 border border-slate-700 shrink-0">
                  {char.role}
                </span>
              </div>

              {/* Status Banner */}
              <div className="flex items-center justify-between text-xs px-3 py-1.5 rounded-lg bg-slate-950/60 border border-slate-800">
                <span className="text-slate-400">Current Status:</span>
                <span className="text-emerald-400 font-medium">{char.status}</span>
              </div>

              {/* Bio description */}
              <p className="text-slate-300 text-sm leading-relaxed">
                {char.description}
              </p>

              {/* Key Day 1 Moments */}
              <div className="space-y-2 pt-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Star className="w-3.5 h-3.5 text-amber-400" />
                  Key Day 1 Moments:
                </span>
                <ul className="space-y-1.5 text-xs text-slate-300">
                  {char.keyMoments.map((moment, idx) => (
                    <li key={idx} className="flex items-start gap-2 bg-slate-950/40 p-2 rounded-lg border border-slate-800/60">
                      <span className="text-amber-400 font-bold shrink-0">•</span>
                      <span>{moment}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Card Footer */}
            <div className="px-6 py-3 bg-slate-950/80 border-t border-slate-800 flex items-center justify-between text-xs">
              <div className="flex items-center gap-3 text-slate-400">
                {char.stats && Object.entries(char.stats).map(([k, v]) => (
                  <span key={k} className="font-mono">
                    <strong className="text-slate-200">{k}:</strong> {v}
                  </span>
                ))}
              </div>

              <button
                onClick={() => onSelectCharacterTimeline(char.name)}
                className="flex items-center gap-1 text-cyan-400 hover:text-cyan-300 font-medium transition-colors"
              >
                <span>Timeline Moments</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Lore Extended Box */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/30 to-slate-900 rounded-2xl p-6 md:p-8 border border-indigo-500/30 space-y-4">
        <h3 className="text-lg font-display font-bold text-white flex items-center gap-2">
          <HeartHandshake className="w-5 h-5 text-cyan-400" />
          <span>Jean Paul's Family & Historical Network</span>
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
          <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-1">
            <span className="text-slate-400 font-mono">Brother</span>
            <div className="text-base font-bold text-white">Pierre Paul</div>
            <p className="text-slate-400 text-[11px]">
              Police Officer in the Los Santos Police Department (also played by xQc).
            </p>
          </div>
          <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-1">
            <span className="text-slate-400 font-mono">Sister</span>
            <div className="text-base font-bold text-white">Jolie Paul</div>
            <p className="text-slate-400 text-[11px]">
              Played by Pokimane in previous seasons of NoPixel.
            </p>
          </div>
          <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-1">
            <span className="text-slate-400 font-mono">In-Game Girlfriend</span>
            <div className="text-base font-bold text-white">Ginger Ale</div>
            <p className="text-slate-400 text-[11px]">
              Played by Aikobliss (IRL girlfriend of xQc).
            </p>
          </div>
          <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-1">
            <span className="text-slate-400 font-mono">Previous Faction</span>
            <div className="text-base font-bold text-white">The Company</div>
            <p className="text-slate-400 text-[11px]">
              4.0 syndicate X co-founded and eventually dramatically betrayed before 5.0.
            </p>
          </div>
        </div>

        {/* Wiki links */}
        <div className="pt-2 flex flex-wrap items-center gap-3 text-xs">
          <span className="text-slate-400">Official NoPixel Wiki Archives:</span>
          <a
            href={meta.links.wikiJeanPaul}
            target="_blank"
            rel="noopener noreferrer"
            className="text-cyan-400 hover:underline flex items-center gap-1"
          >
            Jean Paul (4.0 Wiki) <ExternalLink className="w-3 h-3" />
          </a>
          <a
            href={meta.links.wikiPierrePaul}
            target="_blank"
            rel="noopener noreferrer"
            className="text-cyan-400 hover:underline flex items-center gap-1"
          >
            Pierre Paul (3.0 Wiki) <ExternalLink className="w-3 h-3" />
          </a>
          <a
            href={meta.links.wikiJeanPierre}
            target="_blank"
            rel="noopener noreferrer"
            className="text-cyan-400 hover:underline flex items-center gap-1"
          >
            Jean-Pierre Baptiste (2.0) <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </div>
  );
}

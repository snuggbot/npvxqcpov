import React, { useState } from 'react';
import { 
  Play, ExternalLink, Film 
} from 'lucide-react';

export default function CinemaView({ meta }) {
  const [selectedVideo, setSelectedVideo] = useState('lore'); // 'lore', 'official'

  const videos = {
    lore: {
      id: 'SnzM1R8uKzs',
      title: 'NoPixel V Lore Trailer',
      description: 'The cinematic narrative prologue establishing the new world order, factions, and mysteries of NoPixel V.',
      tag: 'Cinematic Lore'
    },
    official: {
      id: 'K_LoFXzDoi4',
      title: 'NoPixel V Official Launch Trailer',
      description: 'The adrenaline-fueled feature trailer unveiling the new mechanics, visuals, and systems of NoPixel 5.0.',
      tag: 'Gameplay & Systems'
    }
  };

  const current = videos[selectedVideo];

  return (
    <div className="space-y-8 pb-20 max-w-6xl mx-auto">
      {/* Banner */}
      <div className="bg-slate-900/80 rounded-2xl p-6 md:p-8 border border-slate-800 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-red-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 space-y-2 max-w-3xl">
          <div className="flex items-center gap-2 text-xs font-semibold text-red-400">
            <Film className="w-4 h-4" />
            <span>CINEMA THEATER & OFFICIAL ARCHIVES</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-display font-bold text-white">
            Trailers, Cinematics & VOD Hub
          </h2>
          <p className="text-slate-300 text-sm md:text-base leading-relaxed">
            Watch the official NoPixel V launch trailers and follow along with xQc's complete 11-hour broadcast recordings on Twitch and Kick.
          </p>
        </div>

        {/* Video selector buttons */}
        <div className="mt-6 flex flex-wrap items-center gap-2">
          {Object.entries(videos).map(([key, vid]) => (
            <button
              key={key}
              onClick={() => setSelectedVideo(key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold border transition-all ${
                selectedVideo === key
                  ? 'bg-red-600 text-white border-red-500 shadow-md shadow-red-600/30'
                  : 'bg-slate-800 text-slate-300 border-slate-700 hover:text-white hover:bg-slate-700'
              }`}
            >
              <Film className="w-4 h-4" />
              <span>{vid.title}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Embedded Cinema Player Card */}
      <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-4 md:p-6 space-y-4 shadow-2xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse"></span>
            <span className="text-sm font-bold text-white">{current.title}</span>
            <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
              {current.tag}
            </span>
          </div>
          <a
            href={`https://www.youtube.com/watch?v=${current.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1 font-medium"
          >
            <span>Open in YouTube</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        {/* Responsive Video Container */}
        <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-black border border-slate-800 shadow-2xl">
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${current.id}?rel=0`}
            title={current.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            className="w-full h-full border-0"
          ></iframe>
        </div>

        <p className="text-slate-400 text-xs leading-relaxed">
          {current.description}
        </p>
      </div>

      {/* Full VOD Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Twitch VOD Card */}
        <div className="bg-gradient-to-br from-purple-950/40 via-slate-900 to-slate-900 rounded-2xl border border-purple-500/30 p-6 flex flex-col justify-between space-y-4 shadow-xl">
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-1 rounded-md bg-purple-500/20 text-purple-300 text-xs font-bold uppercase tracking-wider border border-purple-500/30">
                Twitch VOD Archive
              </span>
              <span className="text-xs font-mono text-slate-400">11.10 Hours</span>
            </div>
            <h3 className="text-xl font-bold text-white">
              xQc NoPixel V Launch Stream Broadcast
            </h3>
            <p className="text-slate-300 text-xs leading-relaxed">
              Complete VOD of the Day 1 launch stream. Includes full chat, all 117 timestamped moments, Burger Shot chaos, police pursuits, and the Mr. Cement meeting.
            </p>
          </div>

          <div className="pt-2">
            <a
              href={meta.links.twitchVod}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-sm transition-all shadow-lg shadow-purple-600/30"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Watch on Twitch (Full 11h VOD)</span>
              <ExternalLink className="w-4 h-4 opacity-70" />
            </a>
          </div>
        </div>

        {/* Kick VOD Card */}
        <div className="bg-gradient-to-br from-emerald-950/40 via-slate-900 to-slate-900 rounded-2xl border border-emerald-500/30 p-6 flex flex-col justify-between space-y-4 shadow-xl">
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-1 rounded-md bg-emerald-500/20 text-emerald-300 text-xs font-bold uppercase tracking-wider border border-emerald-500/30">
                Kick VOD Mirror
              </span>
              <span className="text-xs font-mono text-slate-400">High Bitrate Mirror</span>
            </div>
            <h3 className="text-xl font-bold text-white">
              xQc Kick Broadcast Recording
            </h3>
            <p className="text-slate-300 text-xs leading-relaxed">
              Alternative mirror of the Day 1 launch broadcast on Kick. High quality 1080p recording for viewers who prefer the Kick platform.
            </p>
          </div>

          <div className="pt-2">
            <a
              href={meta.links.kickVod}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm transition-all shadow-lg shadow-emerald-600/30"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Watch on Kick (Full VOD Mirror)</span>
              <ExternalLink className="w-4 h-4 opacity-70" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

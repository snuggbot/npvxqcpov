import React, { useState } from 'react';
import { 
  MessageSquare, ExternalLink, ThumbsUp, 
  Send, Sparkles, Share2, Check
} from 'lucide-react';

export default function CommunityView({ redditComments, meta, onAddNewComment }) {
  const [commentText, setCommentText] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [userComments, setUserComments] = useState(() => {
    try {
      const saved = localStorage.getItem('np5_user_comments');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [commentLikes, setCommentLikes] = useState({});
  const [copiedLink, setCopiedLink] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    const newC = {
      author: authorName.trim() || 'Anonymous RP Frog',
      score: 1,
      time: new Date().toISOString(),
      avatar: '',
      text: commentText.trim(),
      isLocal: true
    };

    const updated = [newC, ...userComments];
    setUserComments(updated);
    try {
      localStorage.setItem('np5_user_comments', JSON.stringify(updated));
    } catch {
      // ignore
    }

    if (onAddNewComment) {
      onAddNewComment(newC);
    }

    setCommentText('');
  };

  const handleLike = (idx) => {
    setCommentLikes(prev => ({
      ...prev,
      [idx]: (prev[idx] || 0) + 1
    }));
  };

  const copyRedditLink = () => {
    navigator.clipboard.writeText(meta.links.redditPost);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  // Combine user comments and original reddit comments
  const allComments = [...userComments, ...redditComments];

  return (
    <div className="space-y-8 pb-20 max-w-6xl mx-auto">
      {/* Header Banner */}
      <div className="bg-slate-900/80 rounded-2xl p-6 md:p-8 border border-slate-800 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 space-y-2 max-w-3xl">
          <div className="flex items-center gap-2 text-xs font-semibold text-orange-400">
            <MessageSquare className="w-4 h-4" />
            <span>COMMUNITY FEED & AUTHOR RECOGNITION</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-display font-bold text-white">
            Reddit Reaction Hub & Live Community Board
          </h2>
          <p className="text-slate-300 text-sm md:text-base leading-relaxed">
            Discover community reactions from r/xqcow, appreciate the live timestamp author <span className="text-amber-400 font-medium">HurricaneRein</span>, and leave your own notes on the Day 1 launch!
          </p>
        </div>

        {/* Post Metadata Chips */}
        <div className="mt-6 flex flex-wrap items-center gap-3 text-xs">
          <div className="px-3 py-1.5 rounded-xl bg-orange-500/20 text-orange-300 border border-orange-500/30 flex items-center gap-1.5 font-semibold">
            <span>Subreddit: r/xqcow</span>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-slate-800 text-slate-300 border border-slate-700 flex items-center gap-1.5">
            <ThumbsUp className="w-3.5 h-3.5 text-amber-400" />
            <span>225+ Upvotes</span>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-slate-800 text-slate-300 border border-slate-700 flex items-center gap-1.5">
            <MessageCircle className="w-3.5 h-3.5 text-cyan-400" />
            <span>{allComments.length} Community Messages</span>
          </div>
          <button
            onClick={copyRedditLink}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 flex items-center gap-1.5 transition-colors"
          >
            {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
            <span>{copiedLink ? 'Link Copied!' : 'Share Reddit URL'}</span>
          </button>
        </div>
      </div>

      {/* Author Spotlight Card */}
      <div className="bg-gradient-to-br from-slate-900 via-[#131b2e] to-slate-900 rounded-2xl border border-amber-500/30 p-6 md:p-8 space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white font-display font-bold text-xl flex items-center justify-center shadow-lg shadow-amber-500/20">
              HR
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold text-white">u/HurricaneRein</h3>
                <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[11px] font-bold border border-amber-500/40">
                  RECAP AUTHOR
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Dedicated community archivist • Also provided live timestamp recaps for NoPixel IV
              </p>
            </div>
          </div>

          <a
            href={meta.links.redditPost}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-orange-600/90 hover:bg-orange-500 text-white font-medium text-xs transition-colors shrink-0 shadow-lg shadow-orange-600/20"
          >
            <span>Original Reddit Post</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 text-xs text-slate-300 space-y-2 leading-relaxed">
          <span className="font-semibold text-amber-400 uppercase tracking-wider text-[10px] block">
            A Word from HurricaneRein:
          </span>
          <p className="italic">
            "A few points I want to mention: For the people asking how to tip me/support me, check out my personal bio (about section), your support, big or small is highly appreciated! If you spot any errors with regards to information in my post then please don't hesitate to comment/DM and I will happily edit them! English is not my native language so I apologize in advance for typo(s)/bad grammar. I'm not hired by X or anyone, this is completely voluntarily... Finally I appreciate your kind words, support and follows! xqcL"
          </p>
        </div>
      </div>

      {/* Comment Submission Form */}
      <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6 space-y-4 shadow-xl">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-cyan-400" />
          <span>Leave a Community Note / Reaction</span>
        </h3>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <input
              type="text"
              placeholder="Your Name / Handle (e.g. Chat Frog)"
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              className="px-3.5 py-2 rounded-xl bg-slate-800 text-xs text-white placeholder-slate-400 border border-slate-700 focus:outline-none focus:border-cyan-500"
            />
            <div className="sm:col-span-2">
              <input
                type="text"
                placeholder="What was your favorite moment from Day 1? (e.g. 50 combos at Burger Shot, Mr Cement tour bus)"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-800 text-xs text-white placeholder-slate-400 border border-slate-700 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={!commentText.trim()}
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 text-white font-medium text-xs transition-colors shadow-md shadow-cyan-600/20"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Post Reaction</span>
            </button>
          </div>
        </form>
      </div>

      {/* Community Comments Feed */}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs text-slate-400 px-1">
          <span className="font-semibold uppercase tracking-wider">
            All Community Comments ({allComments.length})
          </span>
          <span>Synced with r/xqcow Thread</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {allComments.map((comment, idx) => {
            const addedLikes = commentLikes[idx] || 0;
            const totalScore = (comment.score || 0) + addedLikes;

            return (
              <div
                key={idx}
                className="bg-slate-900/70 rounded-xl border border-slate-800 p-4 space-y-2.5 flex flex-col justify-between hover:border-slate-700 transition-colors"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs text-slate-300 font-bold shrink-0">
                        {comment.author.slice(0, 1).toUpperCase()}
                      </div>
                      <div>
                        <span className="font-bold text-white text-xs mr-1.5">
                          {comment.author}
                        </span>
                        {comment.isLocal && (
                          <span className="px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 text-[10px] font-mono">
                            Guest
                          </span>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => handleLike(idx)}
                      className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-amber-400 text-xs border border-slate-700/80 transition-colors"
                      title="Upvote this comment"
                    >
                      <ThumbsUp className="w-3 h-3 text-amber-400" />
                      <span className="font-mono">{totalScore}</span>
                    </button>
                  </div>

                  <p className="text-slate-200 text-xs leading-relaxed">
                    {comment.text}
                  </p>
                </div>

                <div className="text-[10px] text-slate-400 font-mono pt-2 border-t border-slate-800/60 flex items-center justify-between">
                  <span>{comment.time ? comment.time.split('T')[0] : 'r/xqcow'}</span>
                  <span className="text-slate-400">NoPixel V Launch</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

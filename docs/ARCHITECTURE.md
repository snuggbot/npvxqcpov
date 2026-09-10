# Project Architecture & Systems

## 1. VOD Synchronization & Timestamp Seeking

- **Kick Playback Engine**:
  - Direct HLS master playlist decoding via `hls.js` and native WebKit HLS.
  - Raw stream URL: `https://stream.kick.com/.../master.m3u8#t={seconds}`
  - Zero-ad in-app playback with native fullscreen and mobile controls.
  - Desktop Kick links route directly to `https://kick.com/xqc/videos/{uuid}?t={seconds}`.
- **Twitch Playback Engine**:
  - Direct timestamp URLs formatted with `?t={hours}h{minutes}m{seconds}s`.

## 2. Reddit RSS & Scraper Synchronization

- `scripts/sync_reddit.py` polls u/HurricaneRein's Reddit RSS feed every 15 minutes.
- Parses timestamped events, descriptions, tags, and character roles.
- Preserves screenshots, frame thumbnails, and manually curated metadata.
- Updates `src/data/daysData.json`.

## 3. Deployment & Hosting

- **Vercel**: Static SPA hosted on global edge CDN (`npvxqcpov.vercel.app`).
- **OpenGraph**: Rich social sharing cards with authentic Day 1 stream screenshot (`public/images/og_banner.jpg`).
- **Analytics**: Vercel Web Analytics integration via `@vercel/analytics`.

import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import { exec } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(bodyParser.json());

// Ensure data directory exists
const DATA_DIR = path.join(__dirname, 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Analytics storage file
const ANALYTICS_FILE = path.join(DATA_DIR, 'analytics.json');
if (!fs.existsSync(ANALYTICS_FILE)) {
  fs.writeFileSync(ANALYTICS_FILE, JSON.stringify({
    totalViews: 0,
    dailyViews: {},
    uniqueVisitors: {},
    referrers: {}
  }));
}

// Helper to read analytics
function getAnalytics() {
  try {
    return JSON.parse(fs.readFileSync(ANALYTICS_FILE, 'utf-8'));
  } catch {
    return { totalViews: 0, dailyViews: {}, uniqueVisitors: {}, referrers: {} };
  }
}

// Helper to save analytics
function saveAnalytics(data) {
  try {
    fs.writeFileSync(ANALYTICS_FILE, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Failed to save analytics:', err);
  }
}

// Load recap data
let recapData = null;
try {
  const recapRaw = fs.readFileSync(path.join(__dirname, 'src', 'data', 'recapData.json'), 'utf-8');
  recapData = JSON.parse(recapRaw);
} catch (err) {
  console.error('Error loading recapData.json:', err);
}

// API: Health check
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    name: 'NoPixel V Day 1 Recap API',
    eventsCount: recapData?.events?.length || 0
  });
});

// API: Full recap data
app.get('/api/recap', (_req, res) => {
  if (!recapData) {
    return res.status(500).json({ error: 'Recap data unavailable' });
  }
  res.json(recapData);
});

// API: Get multi-day recap data
app.get('/api/days', (_req, res) => {
  try {
    const raw = fs.readFileSync(path.join(__dirname, 'src', 'data', 'daysData.json'), 'utf-8');
    res.json(JSON.parse(raw));
  } catch {
    res.status(500).json({ error: 'Failed to read days data' });
  }
});

// Helper to get days data
function getDaysData() {
  try {
    const raw = fs.readFileSync(path.join(__dirname, 'src', 'data', 'daysData.json'), 'utf-8');
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

// Sync management state
let isSyncRunning = false;
let lastSyncTimestamp = 0;
const SYNC_COOLDOWN_MS = 2 * 60 * 1000; // 2 minute cooldown between live Reddit fetches

// API: Trigger sync from Reddit (with concurrency lock & cooldown)
app.post('/api/sync', (_req, res) => {
  const now = Date.now();
  const elapsed = now - lastSyncTimestamp;

  // If synced recently, return cached data without hammering Reddit
  if (elapsed < SYNC_COOLDOWN_MS) {
    const cooldownRemaining = Math.ceil((SYNC_COOLDOWN_MS - elapsed) / 1000);
    const data = getDaysData();
    return res.json({
      ok: true,
      cached: true,
      message: `Data is already fresh (checked ${Math.round(elapsed / 1000)}s ago)`,
      cooldownRemaining,
      data
    });
  }

  // Prevent multiple concurrent scrapers
  if (isSyncRunning) {
    return res.status(429).json({
      ok: false,
      error: 'A sync is already in progress. Please wait a few seconds.'
    });
  }

  isSyncRunning = true;
  exec('python3 scripts/sync_reddit.py', { cwd: __dirname, timeout: 45000 }, (error, stdout, stderr) => {
    isSyncRunning = false;
    lastSyncTimestamp = Date.now();

    if (error) {
      console.error('Sync error:', error);
      return res.status(500).json({ error: 'Sync failed', details: stderr });
    }

    const data = getDaysData();
    res.json({ ok: true, output: stdout, data });
  });
});

// API: Track page view (lightweight, privacy-first)
app.post('/api/stats/view', (req, res) => {
  try {
    const analytics = getAnalytics();
    const today = new Date().toISOString().split('T')[0];

    // Increment total views
    analytics.totalViews = (analytics.totalViews || 0) + 1;

    // Daily views
    if (!analytics.dailyViews) analytics.dailyViews = {};
    analytics.dailyViews[today] = (analytics.dailyViews[today] || 0) + 1;

    // Daily unique visitor hash (IP + today's date hashed, no PII stored)
    const clientIp = req.headers['cf-connecting-ip'] || req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
    const ipHash = crypto.createHash('sha256').update(clientIp + today).digest('hex').slice(0, 12);

    if (!analytics.uniqueVisitors) analytics.uniqueVisitors = {};
    if (!analytics.uniqueVisitors[today]) analytics.uniqueVisitors[today] = [];
    if (!analytics.uniqueVisitors[today].includes(ipHash)) {
      analytics.uniqueVisitors[today].push(ipHash);
    }

    // Referrer tracking
    const rawRef = req.body?.referrer || req.headers.referer || 'direct';
    let refKey = 'direct';
    try {
      if (rawRef && rawRef !== 'direct') {
        const parsed = new URL(rawRef.startsWith('http') ? rawRef : `https://${rawRef}`);
        refKey = parsed.hostname.replace('www.', '');
      }
    } catch {
      refKey = 'direct';
    }

    if (!analytics.referrers) analytics.referrers = {};
    analytics.referrers[refKey] = (analytics.referrers[refKey] || 0) + 1;

    saveAnalytics(analytics);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// API: Get visitor statistics
app.get('/api/stats', (_req, res) => {
  const analytics = getAnalytics();
  const today = new Date().toISOString().split('T')[0];
  const uniqueToday = analytics.uniqueVisitors?.[today]?.length || 0;

  // Calculate unique all-time approximate
  const totalUniques = Object.values(analytics.uniqueVisitors || {}).reduce((acc, arr) => acc + (arr?.length || 0), 0);

  res.json({
    totalViews: analytics.totalViews || 0,
    todayViews: analytics.dailyViews?.[today] || 0,
    uniqueToday,
    totalUniqueVisits: totalUniques,
    topReferrers: analytics.referrers || {}
  });
});

// Serve static assets from dist
app.use(express.static(path.join(__dirname, 'dist')));

// SPA fallback: any non-API route serves index.html
app.use((_req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`[NoPixel V Recap] Server listening on http://0.0.0.0:${PORT}`);

  // Auto-sync check every 15 minutes in background
  setInterval(() => {
    exec('python3 scripts/sync_reddit.py', { cwd: __dirname }, (err) => {
      if (!err) console.log('[Sync] Background sync check completed');
    });
  }, 15 * 60 * 1000);
});

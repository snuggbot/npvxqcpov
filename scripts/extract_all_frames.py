"""
extract_all_frames.py

Automatically captures screenshot frames for every event in every day in
daysData.json that is missing an image. Works for any future days added
without code changes — it reads the Twitch VOD URL directly from each day's
events.

  python3 scripts/extract_all_frames.py           # all days, skip existing
  python3 scripts/extract_all_frames.py --force   # re-capture even if image exists
  python3 scripts/extract_all_frames.py --day 2   # only a specific day
"""

import os
import re
import sys
import json
import shutil
import subprocess
from concurrent.futures import ThreadPoolExecutor, as_completed

# ---------------------------------------------------------------------------
# Paths
# ---------------------------------------------------------------------------
BASE_DIR      = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC_DATA_DIR  = os.path.join(BASE_DIR, "src", "data")
PUBLIC_FRAMES = os.path.join(BASE_DIR, "public", "images", "frames")
DIST_FRAMES   = os.path.join(BASE_DIR, "dist",   "images", "frames")
DAYS_FILE     = os.path.join(SRC_DATA_DIR, "daysData.json")
RECAP_FILE    = os.path.join(SRC_DATA_DIR, "recapData.json")

try:
    os.makedirs(PUBLIC_FRAMES, exist_ok=True)
    os.makedirs(DIST_FRAMES,   exist_ok=True)
except OSError as e:
    print(f"Warning: could not create frames directories: {e}")

# ---------------------------------------------------------------------------
# CLI flags
# ---------------------------------------------------------------------------
FORCE_RECAPTURE = "--force" in sys.argv
ONLY_DAY = None
for i, arg in enumerate(sys.argv):
    if arg == "--day" and i + 1 < len(sys.argv):
        ONLY_DAY = sys.argv[i + 1]

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def vod_id_from_url(url):
    m = re.search(r"twitch\.tv/videos/(\d+)", url or "")
    return m.group(1) if m else None


def resolve_hls(vod_url):
    """Use yt-dlp to get a direct HLS stream URL (<=480p for faster seeking)."""
    print(f"  [yt-dlp] Resolving HLS for {vod_url} ...")
    try:
        res = subprocess.run(
            ["yt-dlp", "-g", "-f", "[height<=480]", vod_url],
            capture_output=True, text=True, check=True, timeout=30
        )
        url = res.stdout.strip().splitlines()[0]
        print("  [yt-dlp] HLS URL resolved")
        return url
    except subprocess.TimeoutExpired:
        print("  [yt-dlp] Timeout resolving HLS URL")
    except subprocess.CalledProcessError as e:
        print(f"  [yt-dlp] Error: {e.stderr.strip()[:200]}")
    return None


def extract_frame(stream_url, timestamp, out_path):
    """Seek to timestamp in stream_url and save a single JPEG frame."""
    if not stream_url:
        return False
    if not FORCE_RECAPTURE and os.path.exists(out_path) and os.path.getsize(out_path) > 1000:
        return True  # already captured
    try:
        cmd = [
            "ffmpeg", "-ss", timestamp, "-i", stream_url,
            "-vframes", "1", "-q:v", "2", "-y", out_path
        ]
        res = subprocess.run(
            cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, timeout=25
        )
        return res.returncode == 0 and os.path.exists(out_path) and os.path.getsize(out_path) > 1000
    except Exception as e:
        print(f"    [ffmpeg] {e}")
        return False


def copy_to_dist(src, filename):
    """Mirror a captured frame into dist/ for the local preview server."""
    try:
        shutil.copy2(src, os.path.join(DIST_FRAMES, filename))
    except Exception:
        pass  # dist/ is optional


def frame_filename(day_number, evt_index, timestamp):
    """e.g. d2_evt_027_04_52_10.jpg"""
    slug = timestamp.replace(":", "_")
    return f"d{day_number}_evt_{evt_index:03d}_{slug}.jpg"


def discover_vod_url(events):
    """Find the Twitch VOD base URL from any event's twitchUrl."""
    for evt in events:
        vid = vod_id_from_url(evt.get("twitchUrl", ""))
        if vid:
            return f"https://www.twitch.tv/videos/{vid}"
    return None


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def run():
    if not os.path.exists(DAYS_FILE):
        print(f"ERROR: {DAYS_FILE} not found.")
        sys.exit(1)

    try:
        with open(DAYS_FILE, "r") as f:
            data = json.load(f)
    except (OSError, json.JSONDecodeError) as e:
        print(f"ERROR: could not read {DAYS_FILE}: {e}")
        sys.exit(1)

    days = data.get("days", {})

    try:
        day_keys = sorted(days.keys(), key=lambda k: int(k))
    except (ValueError, TypeError) as e:
        print(f"ERROR: unexpected day key format in daysData.json: {e}")
        sys.exit(1)

    if ONLY_DAY:
        if ONLY_DAY not in days:
            print(f"ERROR: Day '{ONLY_DAY}' not found (available: {', '.join(day_keys)})")
            sys.exit(1)
        day_keys = [ONLY_DAY]

    total_captured = 0
    total_skipped  = 0
    total_failed   = 0

    for day_key in day_keys:
        day = days[day_key]
        events = day.get("events", [])

        try:
            day_num = day.get("dayNumber", int(day_key))
        except (ValueError, TypeError):
            day_num = day_key

        # Decide which events still need frames
        targets = []
        for idx, evt in enumerate(events):
            img = evt.get("image", "")
            frame_exists = (
                img
                and "/images/frames/" in img
                and os.path.exists(os.path.join(BASE_DIR, "public", img.lstrip("/")))
            )
            if FORCE_RECAPTURE or not frame_exists:
                fname   = frame_filename(day_num, idx + 1, evt["timestamp"])
                out     = os.path.join(PUBLIC_FRAMES, fname)
                targets.append((idx, evt, fname, out))

        skipped = len(events) - len(targets)
        print(f"\n── Day {day_key} {'─' * 40}")
        print(f"   {len(events)} events | {skipped} already captured | {len(targets)} need frames")

        if not targets:
            total_skipped += skipped
            continue

        vod_url = discover_vod_url(events)
        if not vod_url:
            print(f"   SKIP: No Twitch VOD URL found for Day {day_key}.")
            print(f"         Add twitchUrl to any event in this day to enable frame capture.")
            total_skipped += len(targets)
            continue

        stream_url = resolve_hls(vod_url)
        if not stream_url:
            print(f"   SKIP: Could not resolve HLS stream for {vod_url}")
            total_skipped += len(targets)
            continue

        # Capture frames in parallel
        def worker(item):
            idx, evt, fname, out_path = item
            ok = extract_frame(stream_url, evt["timestamp"], out_path)
            return idx, evt, fname, out_path, ok

        day_ok   = 0
        day_fail = 0
        print(f"   Capturing {len(targets)} frames (6 parallel threads) ...")

        with ThreadPoolExecutor(max_workers=6) as pool:
            futures = {pool.submit(worker, t): t for t in targets}
            for future in as_completed(futures):
                idx, evt, fname, out_path, ok = future.result()
                if ok:
                    copy_to_dist(out_path, fname)
                    events[idx]["image"]        = f"/images/frames/{fname}"
                    events[idx]["imageCaption"] = f"Stream snapshot @ {evt['timestamp']}"
                    day_ok += 1
                    print(f"   + [{day_ok}/{len(targets)}] {fname}")
                else:
                    day_fail += 1
                    print(f"   x FAILED  Day {day_key} @ {evt['timestamp']}")

        day["events"] = events
        total_captured += day_ok
        total_failed   += day_fail
        total_skipped  += skipped

    # Save daysData.json
    try:
        with open(DAYS_FILE, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
        print(f"\n+ Saved {DAYS_FILE}")
    except OSError as e:
        print(f"ERROR: could not write {DAYS_FILE}: {e}")

    # Mirror Day 1 events into recapData.json (legacy)
    if os.path.exists(RECAP_FILE) and not ONLY_DAY:
        try:
            with open(RECAP_FILE, "r") as f:
                recap = json.load(f)
            if "1" in days:
                recap["events"] = days["1"]["events"]
                with open(RECAP_FILE, "w", encoding="utf-8") as f:
                    json.dump(recap, f, indent=2, ensure_ascii=False)
                print(f"+ Saved {RECAP_FILE}")
        except Exception as e:
            print(f"  Warning: could not update recapData.json: {e}")

    print(f"""
==============================================
  Captured : {total_captured}
  Skipped  : {total_skipped}  (already had frames)
  Failed   : {total_failed}
==============================================
""")
    if total_failed:
        print("Tip: Re-run the script to retry failed events.")


if __name__ == "__main__":
    run()

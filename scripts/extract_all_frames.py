import os
import re
import json
import subprocess
from concurrent.futures import ThreadPoolExecutor

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC_DATA_DIR = os.path.join(BASE_DIR, "src", "data")
PUBLIC_FRAMES_DIR = os.path.join(BASE_DIR, "public", "images", "frames")
DIST_FRAMES_DIR = os.path.join(BASE_DIR, "dist", "images", "frames")

for d in [PUBLIC_FRAMES_DIR, DIST_FRAMES_DIR]:
    try:
        os.makedirs(d, exist_ok=True)
    except Exception as e:
        print(f"Directory create error: {e}")

DAY1_TWITCH_VOD = "https://www.twitch.tv/videos/2868715967"

def get_stream_url(vod_url):
    print(f"Resolving direct HLS stream for {vod_url}...")
    try:
        res = subprocess.run(
            ["yt-dlp", "-g", "-f", "[height<=480]", vod_url],
            capture_output=True, text=True, check=True, timeout=20
        )
        url = res.stdout.strip()
        print("HLS URL resolved successfully.")
        return url
    except Exception as e:
        print("Error resolving stream URL:", e)
        return None

def extract_frame(stream_url, ts, out_path):
    if os.path.exists(out_path) and os.path.getsize(out_path) > 1000:
        return True
    try:
        cmd = [
            "ffmpeg", "-ss", ts, "-i", stream_url,
            "-vframes", "1", "-q:v", "2", "-y", out_path
        ]
        res = subprocess.run(cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, timeout=20)
        return res.returncode == 0 and os.path.exists(out_path) and os.path.getsize(out_path) > 1000
    except Exception as e:
        return False

def process_day1():
    days_file = os.path.join(SRC_DATA_DIR, "daysData.json")
    if not os.path.exists(days_file):
        print("daysData.json not found!")
        return

    try:
        with open(days_file, "r") as f:
            data = json.load(f)
    except Exception as e:
        print("Failed to read daysData.json:", e)
        return

    day1 = data.get("days", {}).get("1")
    if not day1:
        print("Day 1 data not found!")
        return

    events = day1.get("events", [])
    print(f"Day 1 has {len(events)} events.")

    stream_url = get_stream_url(DAY1_TWITCH_VOD)
    if not stream_url:
        print("Could not obtain stream URL, exiting.")
        return

    to_extract = []
    for idx, e in enumerate(events):
        # If no image or existing image was missing
        if not e.get("image"):
            slug = e["timestamp"].replace(":", "_")
            fname = f"d1_evt_{idx+1:03d}_{slug}.jpg"
            out_pub = os.path.join(PUBLIC_FRAMES_DIR, fname)
            to_extract.append((idx, e, e["timestamp"], out_pub, fname))

    print(f"{len(to_extract)} events need screenshot frame extraction.")

    def worker(item):
        idx, evt, ts, out_pub, fname = item
        success = extract_frame(stream_url, ts, out_pub)
        if success:
            out_dist = os.path.join(DIST_FRAMES_DIR, fname)
            try:
                with open(out_pub, "rb") as rf:
                    b = rf.read()
                with open(out_dist, "wb") as wf:
                    wf.write(b)
            except Exception as e:
                print(f"File copy error: {e}")
            return idx, f"/images/frames/{fname}", f"Stream snapshot @ {ts}"
        return idx, None, None

    # Run in parallel with 6 worker threads
    with ThreadPoolExecutor(max_workers=6) as executor:
        results = list(executor.map(worker, to_extract))

    success_count = 0
    for idx, img_path, caption in results:
        if img_path:
            events[idx]["image"] = img_path
            events[idx]["imageCaption"] = caption
            success_count += 1

    print(f"Successfully extracted and attached {success_count} screenshots!")
    day1["events"] = events
    data["days"]["1"] = day1

    try:
        with open(days_file, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2)
        print("Saved updated daysData.json")
    except Exception as e:
        print("Failed writing daysData.json:", e)

    # Also update recapData.json
    recap_file = os.path.join(SRC_DATA_DIR, "recapData.json")
    if os.path.exists(recap_file):
        try:
            with open(recap_file, "r") as f:
                rdata = json.load(f)
            rdata["events"] = events
            with open(recap_file, "w", encoding="utf-8") as f:
                json.dump(rdata, f, indent=2)
            print("Saved updated recapData.json")
        except Exception as e:
            print("Failed updating recapData.json:", e)

if __name__ == "__main__":
    process_day1()

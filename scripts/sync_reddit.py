import os
import re
import json
import subprocess
import urllib.request
import urllib.parse
import http.client
import http.cookiejar
import html as html_lib
import xml.etree.ElementTree as ET

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC_DATA_DIR = os.path.join(BASE_DIR, "src", "data")
PUBLIC_IMG_DIR = os.path.join(BASE_DIR, "public", "images")
PUBLIC_FRAMES_DIR = os.path.join(PUBLIC_IMG_DIR, "frames")
DIST_IMG_DIR = os.path.join(BASE_DIR, "dist", "images")

for d in [SRC_DATA_DIR, PUBLIC_IMG_DIR, DIST_IMG_DIR]:
    try:
        os.makedirs(d, exist_ok=True)
    except Exception as e:
        print(f"Warning creating {d}: {e}")

USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"

KNOWN_KICK_VODS = {
    1: "https://kick.com/xqc/videos/01a08187-d570-7940-9f3f-d5cd8c8cdabc",
    2: "https://kick.com/xqc/videos/01a086fe-0ec0-7302-b693-f16820ea41cc",
    3: "https://kick.com/xqc/videos/01a08c34-c640-71d2-a6a2-4b74fcefece2"
}

KNOWN_KICK_STREAMS = {
    1: "https://stream.kick.com/3c81249a5ce0/ivs/v1/196233775518/DsuAwCgUc9Bh/2026/9/8/14/59/8wZGxx2ttqbw/media/hls/master.m3u8",
    2: "https://stream.kick.com/3c81249a5ce0/ivs/v1/196233775518/DsuAwCgUc9Bh/2026/9/9/16/26/2oh2tsSCFYxW/media/hls/master.m3u8"
}

def _parse_rss_feed(xml_data):
    """Parse a Reddit Atom feed into a list of entry dicts."""
    root = ET.fromstring(xml_data)
    ns = {"atom": "http://www.w3.org/2005/Atom"}
    entries = []
    for e in root.findall("atom:entry", ns):
        title_el = e.find("atom:title", ns)
        link_el = e.find("atom:link", ns)
        updated_el = e.find("atom:updated", ns)
        content_el = e.find("atom:content", ns)
        if title_el is not None and link_el is not None:
            entries.append({
                "title": title_el.text or "",
                "url": link_el.attrib.get("href") or "",
                "updated": updated_el.text if updated_el is not None else "",
                # Reddit's RSS feed includes the complete post body. Using
                # it avoids the HTML endpoint, which commonly returns 403
                # to GitHub Actions datacenter IPs.
                "content": content_el.text or "" if content_el is not None else ""
            })
    return entries


def _merge_entries(*feed_lists):
    """Merge entries from several feed fetches, de-duplicating by URL.

    Reddit's RSS endpoint sometimes returns a *stale* 200 with a short,
    outdated entry list (no error raised), which left new recap posts
    undiscovered. By always fetching both www and old.reddit and merging on
    URL, a stale response from one host can never hide a new day's post.
    """
    merged = {}
    for entries in feed_lists:
        if not entries:
            continue
        for e in entries:
            url = e.get("url") or ""
            if not url:
                continue
            prev = merged.get(url)
            if prev is None or (not prev.get("content") and e.get("content")):
                merged[url] = e
    return list(merged.values())


def fetch_rss_entries(username="HurricaneRein"):
    feeds = []
    for host in ("https://www.reddit.com", "https://old.reddit.com"):
        url = f"{host}/user/{username}/submitted/.rss"
        req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
        try:
            with urllib.request.urlopen(req, timeout=15) as resp:
                xml_data = resp.read().decode("utf-8")
            feeds.append(_parse_rss_feed(xml_data))
            print(f"  [rss] {host}: ok")
        except Exception as e:
            print(f"  [rss] {host}: failed ({e})")
            feeds.append([])

    entries = _merge_entries(*feeds)
    if entries:
        return entries

    print("Notice: all RSS endpoints failed; using known post list...")
    return [
        {
            "title": "NoPixel V Launch | Day 1 Recap Sep 8th | xQc's POV With Timestamps",
            "url": "https://www.reddit.com/r/xqcow/comments/1wajfpn/nopixel_v_launch_day_1_recap_sep_8th_xqcs_pov/",
            "updated": "2026-09-08T09:23:17+00:00"
        },
        {
            "title": "NoPixel V | Day 2 Recap Sep 9th | xQc's POV With Timestamps",
            "url": "https://www.reddit.com/r/xqcow/comments/1wbpmio/nopixel_v_day_2_recap_sep_9th_xqcs_pov_with/",
            "updated": "2026-09-09T15:59:23+00:00"
        },
        {
            "title": "NoPixel V | Day 3 Recap Sep 10th | xQc's POV With Timestamps",
            "url": "https://www.reddit.com/r/xqcow/comments/1wcknq7/nopixel_v_day_3_recap_sep_10th_xqcs_pov_with/",
            "updated": "2026-09-10T14:23:02+00:00"
        },
        {
            # Keep this list current with the newest recap post: it is only
            # used when BOTH RSS hosts are unreachable (e.g. datacenter
            # blocks), so a new day added here keeps discovery working.
            "title": "NoPixel V | Day 4 Recap Sep 11th | xQc's POV With Timestamps",
            "url": "https://www.reddit.com/r/xqcow/comments/1wdaz7l/nopixel_v_day_4_recap_sep_11th_xqcs_pov_with/",
            "updated": "2026-09-11T09:09:34+00:00"
        }
    ]

def fetch_reddit_post_html(url):
    if not url.startswith("https://"):
        return ""
    cj = http.cookiejar.CookieJar()
    opener = urllib.request.build_opener(urllib.request.HTTPCookieProcessor(cj))

    req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
    try:
        res = opener.open(req, timeout=15)
        html = res.read().decode("utf-8", errors="ignore")
    except http.client.IncompleteRead as e:
        html = e.partial.decode("utf-8", errors="ignore")
    except Exception as e:
        print(f"Error fetching {url}: {e}")
        return ""

    token_match = re.search(r"name=\"jsc_token\" value=\"([^\"]+)\"", html)
    solution_match = re.search(r"\(\"([a-f0-9]+)\"\)", html)

    if token_match and solution_match:
        token = token_match.group(1)
        seed = solution_match.group(1)
        params = urllib.parse.urlencode({
            "solution": seed + seed,
            "js_challenge": "1",
            "jsc_token": token,
            "jsc_orig_r": ""
        })
        post_url = f"{url}?{params}"
        if not post_url.startswith("https://"):
            return ""
        post_req = urllib.request.Request(post_url, headers={"User-Agent": USER_AGENT})
        try:
            res2 = opener.open(post_req, timeout=15)
            return res2.read().decode("utf-8", errors="ignore")
        except http.client.IncompleteRead as e:
            return e.partial.decode("utf-8", errors="ignore")
        except Exception as e:
            print(f"Error resolving challenge for {url}: {e}")
            return ""
    
    return html

def parse_time_to_sec(ts):
    parts = list(map(int, ts.split(":")))
    return parts[0] * 3600 + parts[1] * 60 + parts[2]

def time_to_twitch_format(ts):
    parts = list(map(int, ts.split(":")))
    return f"{parts[0]:02d}h{parts[1]:02d}m{parts[2]:02d}s"

def clean_title(ts, desc):
    d = desc.strip()
    first_clause = re.split(r"[,;.]", d)[0]
    first_clause = re.sub(r"^x\s+", "", first_clause, flags=re.IGNORECASE)
    first_clause = first_clause.capitalize()
    return first_clause[:55]

def categorize_event(desc):
    desc_l = desc.lower()
    if "cement" in desc_l or "syndicate" in desc_l or "lore" in desc_l:
        return "lore"
    if "hospital" in desc_l or "disease" in desc_l or "blood" in desc_l or "cured" in desc_l:
        return "medical"
    if "octane" in desc_l or "crypto" in desc_l or "coin" in desc_l or "invest" in desc_l or "debt" in desc_l:
        return "crypto"
    if "cops" in desc_l or "police" in desc_l or "chase" in desc_l or "pulled over" in desc_l:
        return "chase"
    if "break into" in desc_l or "lockpick" in desc_l or "scam" in desc_l or "rob" in desc_l or "steal" in desc_l:
        return "crime"
    if "burger shot" in desc_l or "guber" in desc_l or "pawn" in desc_l or "real estate" in desc_l or "machinery" in desc_l:
        return "job"
    if "metal detect" in desc_l or "gold" in desc_l or "hunting" in desc_l or "furnace" in desc_l or "tranq" in desc_l:
        return "mechanic"
    return "general"

def extract_characters(desc):
    chars = ["Jean Paul (X)"]
    for name in ["Marty", "Lang", "Tony", "Cement", "Chatterbox", "Speedy", "Ken-Sama", "Kyle", "Bogg"]:
        if name in desc:
            chars.append(f"{name} Banks" if name == "Marty" else (f"Mista {name}" if name == "Lang" else name))
    return list(dict.fromkeys(chars))

def download_image(url, filename):
    safe_filename = os.path.basename(filename)
    dest_pub = os.path.realpath(os.path.join(PUBLIC_IMG_DIR, safe_filename))
    dest_dist = os.path.realpath(os.path.join(DIST_IMG_DIR, safe_filename))
    if not dest_pub.startswith(os.path.realpath(PUBLIC_IMG_DIR)):
        return None
    if os.path.exists(dest_pub):
        return f"/images/{safe_filename}"
    if not url.startswith("https://"):
        return None
    try:
        req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
        with urllib.request.urlopen(req, timeout=10) as r:
            data = r.read()
            with open(dest_pub, "wb") as f:
                f.write(data)
            with open(dest_dist, "wb") as f:
                f.write(data)
        return f"/images/{safe_filename}"
    except Exception as e:
        print(f"Failed image download {safe_filename}: {e}")
        return None

def parse_post_content(html, day_num, post_url, existing_events=None):
    # Map existing images AND tags by timestamp to preserve them across syncs
    existing_img_map = {}
    existing_tags_map = {}
    if existing_events:
        timestamp_occurrences = {}
        for e in existing_events:
            timestamp = e["timestamp"]
            occurrence = timestamp_occurrences.get(timestamp, 0)
            timestamp_occurrences[timestamp] = occurrence + 1
            if e.get("image"):
                existing_img_map[(timestamp, occurrence)] = {
                    "image": e["image"],
                    "imageCaption": e.get("imageCaption") or f"Snapshot @ {timestamp}"
                }
            if e.get("tags"):
                existing_tags_map[(timestamp, occurrence)] = e["tags"]

    # Prefer the modern post body's slot when fetching the page directly.
    # RSS entries contain the same body without that wrapper, so use the full
    # RSS content as a fallback (the page endpoint is often blocked on CI).
    pos = html.find("slot=\"text-body\"")
    if pos == -1:
        body_html = html
    else:
        end_pos = html.find("</shreddit-post>", pos)
        body_html = html[pos:end_pos]

    # Convert HTML bold tags to markdown asterisks so major updates are preserved
    body_html = re.sub(r"<strong[^>]*>(.*?)</strong>", r"**\1**", body_html, flags=re.DOTALL)
    body_html = re.sub(r"<b[^>]*>(.*?)</b>", r"**\1**", body_html, flags=re.DOTALL)

    # Extract VOD links if present, or fallback to known VODs / live channel
    twitch_match = re.search(r"https?://(?:www\.)?twitch\.tv/videos/\d+", body_html)
    kick_match = re.search(r"https?://(?:www\.)?kick\.com/[^\s\"'>]+", body_html)

    if twitch_match:
        twitch_base = twitch_match.group(0)
    elif day_num == 1:
        twitch_base = "https://www.twitch.tv/videos/2868715967"
    elif day_num == 2:
        twitch_base = "https://www.twitch.tv/videos/2869633607"
    elif day_num == 3:
        twitch_base = "https://www.twitch.tv/videos/2870490310"
    else:
        twitch_base = "https://www.twitch.tv/xqc"

    if kick_match and "/videos/" in kick_match.group(0):
        kick_base = kick_match.group(0)
    elif day_num in KNOWN_KICK_VODS:
        kick_base = KNOWN_KICK_VODS[day_num]
    else:
        kick_base = "https://kick.com/xqc"

    # Extract image links with captions
    img_matches = re.findall(r"\[\s*\]\((https://preview\.redd\.it/[^\)]+)\)\s*([^\n<]+)", body_html)
    downloaded_images = {}
    for idx, (img_url, caption) in enumerate(img_matches):
        clean_cap = caption.strip()
        filename = f"day{day_num}_img_{idx+1}.png"
        local_path = download_image(img_url, filename)
        if local_path:
            downloaded_images[idx] = {"src": local_path, "caption": clean_cap}

    # Extract timestamps
    ts_matches = re.finditer(r"(\*\*)?(\d{2}:\d{2}:\d{2})(\*\*)?\s*([^\n<]+)", body_html)
    
    events = []
    img_idx = 0
    timestamp_occurrences = {}
    for idx, m in enumerate(ts_matches):
        ts = m.group(2)
        occurrence = timestamp_occurrences.get(ts, 0)
        timestamp_occurrences[ts] = occurrence + 1
        raw_desc = m.group(4)
        is_major = ("**" in m.group(0)) or ("**" in raw_desc) or raw_desc.startswith("**") or raw_desc.endswith("**")
        clean_desc = html_lib.unescape(raw_desc.replace("**", "").strip())

        # Check for image priority: 1. Reddit markdown image, 2. Existing image, 3. Frame file on disk
        img_src = None
        img_cap = None
        if img_idx in downloaded_images:
            img_src = downloaded_images[img_idx]["src"]
            img_cap = downloaded_images[img_idx]["caption"]
            img_idx += 1
        elif (ts, occurrence) in existing_img_map:
            img_src = existing_img_map[(ts, occurrence)]["image"]
            img_cap = existing_img_map[(ts, occurrence)]["imageCaption"]
        else:
            slug = ts.replace(":", "_")
            possible_frame = f"d{day_num}_evt_{idx+1:03d}_{slug}.jpg"
            if os.path.exists(os.path.join(PUBLIC_FRAMES_DIR, possible_frame)):
                img_src = f"/images/frames/{possible_frame}"
                img_cap = f"Stream snapshot @ {ts}"

        sec = parse_time_to_sec(ts)
        event_twitch = f"{twitch_base}?t={time_to_twitch_format(ts)}" if "/videos/" in twitch_base else "https://www.twitch.tv/xqc"
        # Kick expects raw integer seconds in ?t= (e.g. ?t=8985), not HHhMMmSSs
        kick_sec = max(0, sec - 2)
        event_kick = f"{kick_base}?t={kick_sec}" if "/videos/" in kick_base else kick_base
        category = categorize_event(clean_desc)
        # Preserve manually-curated tags if they exist, otherwise default to [category]
        tags = existing_tags_map.get((ts, occurrence), [category])
        events.append({
            "id": f"d{day_num}-evt-{idx+1:03d}",
            "timestamp": ts,
            "seconds": sec,
            "isMajor": is_major,
            "title": clean_title(ts, clean_desc),
            "description": clean_desc,
            "category": tags[0] if tags else category,
            "tags": tags,
            "characters": extract_characters(clean_desc),
            "image": img_src,
            "imageCaption": img_cap,
            "twitchUrl": event_twitch,
            "kickUrl": event_kick
        })

    # Extract character info & stats from table if present
    character_info = {}
    rows = re.findall(r"<tr[^>]*>(.*?)</tr>", body_html, re.DOTALL)
    for r in rows:
        cells = re.findall(r"<t[dh][^>]*>(.*?)</t[dh]>", r, re.DOTALL)
        clean_cells = [html_lib.unescape(re.sub(r"<[^>]+>", "", c)).strip() for c in cells]
        if len(clean_cells) >= 2 and clean_cells[0] and clean_cells[1]:
            k = clean_cells[0].rstrip(":").strip()
            v = clean_cells[1].strip()
            if "Character Name" in k:
                character_info["name"] = v
            elif "Background" in k:
                character_info["background"] = v
            elif "Time Logged" in k:
                character_info["timeLoggedIn"] = v
            elif "Jailed" in k:
                character_info["timesJailed"] = v
            else:
                character_info[k] = v

    return {
        "events": events,
        "twitchVod": twitch_base,
        "kickVod": kick_base,
        "kickStreamUrl": KNOWN_KICK_STREAMS.get(day_num, ""),
        "characterInfo": character_info
    }

def sync_all():
    print("Checking HurricaneRein's submitted posts...")
    entries = fetch_rss_entries("HurricaneRein")

    recap_posts = []
    for e in entries:
        t = e["title"]
        m = re.search(r"NoPixel\s+V.*Day\s+(\d+)", t, re.IGNORECASE)
        if m:
            try:
                day_num = int(m.group(1))
            except Exception:
                continue
            recap_posts.append({
                "dayNumber": day_num,
                "title": t,
                "url": e["url"],
                "updated": e["updated"],
                "content": e.get("content", "")
            })

    print(f"Found {len(recap_posts)} NoPixel V recap posts:")
    for p in recap_posts:
        print(f"  Day {p['dayNumber']}: {p['title']} ({p['url']})")

    # Load existing daysData if present
    days_file = os.path.realpath(os.path.join(SRC_DATA_DIR, "daysData.json"))
    existing_data = {"days": {}}
    if os.path.exists(days_file):
        try:
            with open(days_file, "r") as f:
                existing_data = json.load(f)
        except Exception:
            existing_data = {"days": {}}

    updated_any = False
    parsed_posts = 0
    for p in recap_posts:
        day_str = str(p["dayNumber"])
        print(f"\nProcessing Day {day_str}...")
        try:
            html = p.get("content") or fetch_reddit_post_html(p["url"])
            prev_events = existing_data.get("days", {}).get(day_str, {}).get("events", [])
            parsed = parse_post_content(html, p["dayNumber"], p["url"], existing_events=prev_events)
        except Exception as e:
            # A malformed or temporarily unavailable post must not abort updates
            # for every other day. The workflow will retry if all posts fail.
            print(f"  -> Failed to parse Day {day_str}: {e}")
            continue

        if parsed and parsed["events"]:
            parsed_posts += 1
            print(f"  -> Successfully parsed {len(parsed['events'])} events for Day {day_str}!")
            existing_data["days"][day_str] = {
                "dayNumber": p["dayNumber"],
                "title": f"Day {day_str}",
                "redditTitle": p["title"],
                "redditUrl": p["url"],
                "updated": p["updated"],
                "isLive": "work in progress" in html.lower() or "keep updating" in html.lower(),
                "twitchVod": parsed["twitchVod"] or "https://www.twitch.tv/videos/2868715967",
                "kickVod": parsed["kickVod"] or KNOWN_KICK_VODS.get(p["dayNumber"], "https://kick.com/xqc"),
                "kickStreamUrl": parsed.get("kickStreamUrl") or KNOWN_KICK_STREAMS.get(p["dayNumber"], ""),
                "eventsCount": len(parsed["events"]),
                "events": parsed["events"],
                "characterInfo": parsed.get("characterInfo") or existing_data.get("days", {}).get(day_str, {}).get("characterInfo") or {}
            }
            updated_any = True

    if not parsed_posts:
        raise RuntimeError("Reddit posts could not be fetched or parsed; refusing to publish stale data")

    if updated_any:
        try:
            with open(days_file, "w", encoding="utf-8") as f:
                json.dump(existing_data, f, indent=2)
            print(f"\nUpdated {days_file} with {len(existing_data['days'])} days!")
            # Auto-tag any new events that don't have tags yet
            subprocess.run(
                ["python3", "scripts/auto_tag_events.py"],
                cwd=os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
                check=False
            )
        except Exception as e:
            print(f"Failed to write {days_file}: {e}")
    else:
        print("\nNo updates found.")

    return existing_data

if __name__ == "__main__":
    sync_all()

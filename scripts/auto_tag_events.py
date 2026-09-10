#!/usr/bin/env python3
"""
auto_tag_events.py
------------------
Reads daysData.json, assigns a 'tags' array to every event using
keyword rules on the description text, then writes the file back.

Run:  python3 scripts/auto_tag_events.py [--dry-run]
After running, manually edit src/data/daysData.json to fix outliers.
"""

import json, re, sys
from pathlib import Path

DRY_RUN = "--dry-run" in sys.argv

# ---------------------------------------------------------------------------
# Keyword rules — order matters: more-specific rules first.
# Each rule: (tag, [regex patterns]) — case-insensitive.
# An event can get multiple tags.
# ---------------------------------------------------------------------------
TAG_RULES = [
    ("chase",   [
        r"\bchase\b", r"\bpursuit\b", r"\bpd\b", r"\bcops?\b", r"\bpolice\b",
        r"\barrested?\b", r"\bgets? busted\b", r"\bgets? caught\b",
        r"\bgets? pulled over\b", r"\bwanted\b", r"\bstars?\b"
    ]),
    ("crime",   [
        r"\brob(bed|s|bing)?\b", r"\bheist\b", r"\bsteal(s|ing)?\b",
        r"\bstole\b", r"\bgun\b", r"\bshoots?\b", r"\bshoot ?out\b",
        r"\bkilled?\b", r"\bmurder\b", r"\bnecromancer\b", r"\bweapon\b",
        r"\bknife\b", r"\bhit ?man\b", r"\bgang\b", r"\bcarjack\b",
        r"\bholds? up\b", r"\bdrives? by\b", r"\bammo\b", r"\bfirearm\b"
    ]),
    ("medical", [
        r"\bhospital\b", r"\bdead\b", r"\bdown\b", r"\binjured?\b",
        r"\bwounded?\b", r"\bbleed(ing)?\b", r"\brespawn\b", r"\brevived?\b",
        r"\bems\b", r"\bbandage\b", r"\bsplint\b", r"\bscreams?\b",
        r"\bpills?\b", r"\boverdos\b"
    ]),
    ("crypto",  [
        r"\bcrypto\b", r"\boctane\b", r"\bcoin\b", r"\btoken\b",
        r"\bstock\b", r"\binvest\b", r"\bwallet\b", r"\bbank account\b",
        r"\btransfer\b", r"\btrades?\b", r"\bpump\b", r"\bdump\b",
        r"\bprofit\b"
    ]),
    ("lore",    [
        r"\blore\b", r"\bstory\b", r"\bcutscene\b", r"\bintro\b",
        r"\bbackstory\b", r"\bcharacter creat\b", r"\bconversation\b",
        r"\bmeets?\b", r"\brelationship\b", r"\bdialogu\b", r"\bsocials?\b",
        r"\btweets?\b", r"\bcontact\b", r"\bphone call\b"
    ]),
    ("job",     [
        r"\bjob\b", r"\bwork(s|ing|ed)?\b", r"\bboss\b", r"\bshift\b",
        r"\bburger shot\b", r"\bdelivery\b", r"\bsell(s|ing)?\b",
        r"\bearns?\b", r"\bpaid\b", r"\bwages?\b", r"\bsalary\b",
        r"\bemployed?\b", r"\bclocks? in\b", r"\bclocks? out\b",
        r"\bbuying\b", r"\bpurchases?\b", r"\bshop\b", r"\bstore\b"
    ]),
    ("mechanic",[
        r"\bgarage\b", r"\brepair\b", r"\bfix(es|ed|ing)?\b",
        r"\bcar\b", r"\bvehicle\b", r"\bmotorcycle\b", r"\bbike\b",
        r"\bhotwire\b", r"\bdriv(es?|ing|er)\b", r"\bcrash(es|ed)?\b",
        r"\bspeed\b", r"\bracin\b", r"\bmod(s|ded|ding)?\b"
    ]),
    ("social",  [
        r"\bbanter\b", r"\bjoking\b", r"\bhangs? out\b", r"\bparty\b",
        r"\bfriend\b", r"\btalk(s|ing)?\b", r"\bchat(s|ting)?\b",
        r"\bsays?\b", r"\btell(s|ing)?\b", r"\bencounters?\b",
        r"\bmeeting\b", r"\bgroup\b"
    ]),
]

# Compile patterns once
COMPILED = [
    (tag, [re.compile(p, re.IGNORECASE) for p in patterns])
    for tag, patterns in TAG_RULES
]

# ---------------------------------------------------------------------------

def detect_tags(description: str) -> list[str]:
    """Return list of matching tags for a description, no duplicates."""
    found = []
    for tag, patterns in COMPILED:
        if any(pat.search(description) for pat in patterns):
            if tag not in found:
                found.append(tag)
    return found or ["general"]


def process(data: dict) -> dict:
    days = data.get("days", data)
    total = tagged_multi = 0
    for day_key, day in days.items():
        events = day.get("events", [])
        for evt in events:
            desc = evt.get("description", "")
            tags = detect_tags(desc)
            evt["tags"] = tags
            # Keep legacy single category = first tag
            evt["category"] = tags[0]
            total += 1
            if len(tags) > 1:
                tagged_multi += 1

    print(f"✅  Tagged {total} events total; {tagged_multi} have multiple tags")
    return data


# ---------------------------------------------------------------------------

DATA_PATH = Path("src/data/daysData.json")

try:
    with open(DATA_PATH) as f:
        raw = json.load(f)
except FileNotFoundError:
    print(f"ERROR: {DATA_PATH} not found. Run from the project root.", file=sys.stderr)
    sys.exit(1)
except json.JSONDecodeError as e:
    print(f"ERROR: Failed to parse {DATA_PATH}: {e}", file=sys.stderr)
    sys.exit(1)

processed = process(raw)

if DRY_RUN:
    # Print sample of multi-tagged events
    days = processed.get("days", processed)
    for day_key, day in days.items():
        for evt in day.get("events", []):
            if len(evt.get("tags", [])) > 1:
                print(f"  [{', '.join(evt['tags'])}] {evt['description'][:70]}")
    print("\n(Dry run — no file written)")
else:
    try:
        with open(DATA_PATH, "w") as f:
            json.dump(processed, f, indent=2, ensure_ascii=False)
        print(f"Written → {DATA_PATH}")
    except OSError as e:
        print(f"ERROR: Could not write {DATA_PATH}: {e}", file=sys.stderr)
        sys.exit(1)

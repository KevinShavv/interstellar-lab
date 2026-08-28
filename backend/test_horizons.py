"""Test NASA Horizons API connection."""
from urllib.request import Request, urlopen
from urllib.parse import quote

body_code = "499"  # Mars
center_code = "10"  # Sun
date_str = "2026-05-29"

query = (
    f"format=text"
    f"&COMMAND='{body_code}'"
    f"&CENTER='500@{center_code}'"
    f"&MAKE_EPHEM='YES'"
    f"&TABLE_TYPE='VECTORS'"
    f"&START_TIME='{date_str}'"
    f"&STOP_TIME='{date_str}'"
    f"&STEP_SIZE='1d'"
    f"&CSV_FORMAT='YES'"
    f"&VEC_TABLE='2'"
    f"&REF_SYSTEM='ICRF'"
    f"&OUT_UNITS='KM-S'"
)

url = f"https://ssd.jpl.nasa.gov/api/horizons.api?{query}"
print(f"Requesting: {url[:120]}...")

req = Request(url, headers={"User-Agent": "SolarSystemEdu/1.0"}, method="GET")
try:
    resp = urlopen(req, timeout=30)
    text = resp.read().decode("utf-8", "replace")
    print(f"Status: {resp.status}")
    print(f"Response length: {len(text)}")
    # Print first 500 chars
    print("---Response preview---")
    print(text[:500])
except Exception as e:
    print(f"Error: {e}")

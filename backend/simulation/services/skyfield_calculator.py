"""
基于 Skyfield 的天体星历计算服务。

替代 NASA Horizons API，使用本地 JPL 星历文件进行天体位置/速度计算。

数据来源：JPL DE440 星历（1550-2650），精度高于 DE430，与最新 Horizons 一致。

⚠ 国内用户：由于 JPL 服务器在境外，首次运行前需要手动下载星历文件。
   详见下方 _download_instructions() 说明。
"""

import logging
import os
import sys
from datetime import datetime, timedelta
from pathlib import Path

from skyfield.api import Loader

logger = logging.getLogger(__name__)

# ── 星历文件路径 ─────────────────────────────────────────────────────
# 优先使用 backend/de440.bsp（用户手动下载 / Docker 挂载）
_EPHEM_FILE_CANDIDATES = [
    Path(__file__).resolve().parent.parent.parent / "de440.bsp",  # backend/de440.bsp
    Path("/app/de440.bsp"),  # Docker 挂载路径
    Path(__file__).resolve().parent / "skyfield_data" / "de440.bsp",
    Path(__file__).resolve().parent / "skyfield_data" / "de430.bsp",
]

_EPHEM_FILE = None
for _candidate in _EPHEM_FILE_CANDIDATES:
    if _candidate.exists():
        _EPHEM_FILE = _candidate
        break

_EPHEM_DIR = _EPHEM_FILE.parent if _EPHEM_FILE else Path(__file__).resolve().parent / "skyfield_data"

# ── 镜像地址 ────────────────────────────────────────────────────────
_DE440_MIRRORS = [
    "https://naif.jpl.nasa.gov/pub/naif/generic_kernels/spk/planets/de440.bsp",
    # JPL 官方站点在部分网络环境不可达，HuggingFace 上有一份同源镜像（含 LFS 校验和）
    "https://hf-mirror.com/datasets/phanerozoic/JPL-DE440-DE441/resolve/main/spk/de440.bsp",
]

DE440_EXPECTED_SIZE = 119799808  # 实际 de440.bsp 字节数（NAIF 原版，约 114 MB）


def _ephem_label():
    """按实际加载的文件名推断星历版本，例如 de440.bsp → DE440。"""
    if _EPHEM_FILE is None:
        return "DE440"
    return _EPHEM_FILE.stem.upper()


def _ephem_source():
    """返回给前端展示的星历来源标签，避免与真实加载的文件不符。"""
    return f"Skyfield (JPL {_ephem_label()})"


def _download_instructions():
    """打印手动下载帮助信息。"""
    dest = str(_EPHEM_DIR / "de440.bsp")
    print(f"""
╔══════════════════════════════════════════════════════════════════╗
║  Skyfield 星历文件缺失 — 请手动下载 de440.bsp (~114MB)          ║
╠══════════════════════════════════════════════════════════════════╣
║                                                                  ║
║  URL: https://naif.jpl.nasa.gov/pub/naif/generic_kernels/spk/   ║
║       planets/de440.bsp                                          ║
║  镜像: https://hf-mirror.com/datasets/phanerozoic/               ║
║        JPL-DE440-DE441/resolve/main/spk/de440.bsp                ║
║                                                                  ║
║  或运行: python backend/simulation/services/skyfield_calculator.py║
║                                                                  ║
║  放到: {dest:<55}║
║                                                                  ║
╚══════════════════════════════════════════════════════════════════╝
    """)


def download_ephemeris():
    """尝试从镜像下载星历文件，返回是否成功。

    模块级 `_EPHEM_FILE` 在导入时按候选路径探测，全新环境下为 None，
    因此这里必须写入 `_EPHEM_DIR` 下的目标路径，不能直接 open(_EPHEM_FILE)。
    """
    import urllib.request

    global _EPHEM_FILE, _EPHEM_DIR

    _EPHEM_DIR.mkdir(parents=True, exist_ok=True)
    dest = _EPHEM_DIR / "de440.bsp"
    part = dest.with_suffix(".bsp.part")

    for url in _DE440_MIRRORS:
        print(f"正在尝试从 {url} 下载...")
        try:
            req = urllib.request.Request(
                url,
                headers={"User-Agent": "SolarSystemEdu/1.0"},
            )
            with urllib.request.urlopen(req, timeout=300) as resp:
                total = int(resp.headers.get("Content-Length") or 0)
                if total:
                    print(f"  文件大小: {total / 1024 / 1024:.1f} MB")
                downloaded = 0
                with open(part, "wb") as f:
                    while True:
                        chunk = resp.read(1024 * 1024)
                        if not chunk:
                            break
                        f.write(chunk)
                        downloaded += len(chunk)
                        if total:
                            pct = downloaded * 100 // total
                            mb = downloaded / 1024 / 1024
                            print(f"\r  下载进度: {pct}% ({mb:.1f}/{total / 1024 / 1024:.1f}MB)", end="")
                print(f"\n  下载完成! 大小: {downloaded / 1024 / 1024:.1f} MB")
            if downloaded != DE440_EXPECTED_SIZE:
                print(
                    f"  校验失败: 期望 {DE440_EXPECTED_SIZE} 字节，实际 {downloaded} 字节，"
                    "换下一个镜像。"
                )
                part.unlink(missing_ok=True)
                continue
            os.replace(part, dest)
            _EPHEM_FILE = dest
            print(f"  已就位: {dest}")
            return True
        except Exception as exc:
            print(f"  失败: {exc}")
            part.unlink(missing_ok=True)
            continue

    print("所有镜像均下载失败，请手动下载。")
    _download_instructions()
    return False


# ── 延迟加载 ────────────────────────────────────────────────────────
_planets = None
_ts = None

# ── 天体 Key → JPL DE 标识符 ─────────────────────────────────────────
BODY_KEY_TO_NAIF = {
    "mercury": "MERCURY BARYCENTER",
    "venus": "VENUS BARYCENTER",
    "earth": "EARTH BARYCENTER",
    "mars": "MARS BARYCENTER",
    "jupiter": "JUPITER BARYCENTER",
    "saturn": "SATURN BARYCENTER",
    "uranus": "URANUS BARYCENTER",
    "neptune": "NEPTUNE BARYCENTER",
    "moon": "MOON",
    "sun": "SUN",
}

BODY_KEY_TO_NAME_ZH = {
    "mercury": "水星",
    "venus": "金星",
    "earth": "地球",
    "mars": "火星",
    "jupiter": "木星",
    "saturn": "土星",
    "uranus": "天王星",
    "neptune": "海王星",
    "moon": "月球",
    "sun": "太阳",
}


def _init_ephemeris():
    """延迟初始化星历数据。"""
    global _planets, _ts
    if _planets is not None:
        return

    if _EPHEM_FILE is None or not _EPHEM_FILE.exists():
        _download_instructions()
        raise FileNotFoundError(
            "星历文件未找到。请将 de440.bsp 放到 backend/ 目录下。\n"
            "下载地址: https://naif.jpl.nasa.gov/pub/naif/generic_kernels/spk/planets/de440.bsp"
        )

    logger.info("正在加载 JPL DE440 星历文件: %s", _EPHEM_FILE)
    _load = Loader(_EPHEM_DIR, verbose=False)
    _planets = _load(_EPHEM_FILE.name)
    _ts = _load.timescale()
    logger.info("DE440 星历加载完成。")


def _get_observer(center_key):
    """
    根据参考中心返回 Skyfield 观测者对象。
    - "sun": 太阳系质心（SSB）相对于太阳的偏移
    - 其他天体：该天体本身
    """
    global _planets, _ts, _earth_satellite
    _init_ephemeris()

    if center_key == "sun":
        # 以太阳为中心，观测者是太阳
        return _planets["SUN"]
    elif center_key in BODY_KEY_TO_NAIF:
        naif_name = BODY_KEY_TO_NAIF[center_key]
        return _planets[naif_name]
    else:
        raise ValueError(f"未知的参考中心: {center_key}")


def _get_target(body_key):
    """获取目标天体对象。"""
    global _planets
    _init_ephemeris()

    if body_key not in BODY_KEY_TO_NAIF:
        raise ValueError(f"未知的天体: {body_key}")
    return _planets[BODY_KEY_TO_NAIF[body_key]]


def compute_position(body_key, center_key="sun", date=None):
    """
    计算天体在指定日期相对于参考中心的位置和速度。

    参数:
        body_key: 目标天体 key（如 "mars", "earth"）
        center_key: 参考中心 key（默认 "sun"）
        date: 日期字符串 "YYYY-MM-DD" 或 datetime 对象（默认今天）

    返回:
        {
            "body": str,
            "center": str,
            "date": str,
            "jd": float,           # 儒略日
            "x": float, "y": float, "z": float,        # 位置 (km)
            "vx": float, "vy": float, "vz": float,     # 速度 (km/s)
            "distance_km": float,                       # 距离 (km)
            "distance_au": float,                       # 距离 (AU)
        }
    """
    global _ts
    _init_ephemeris()

    # 解析日期
    if date is None:
        dt = datetime.utcnow()
    elif isinstance(date, str):
        dt = datetime.strptime(date, "%Y-%m-%d")
    elif isinstance(date, datetime):
        dt = date
    else:
        raise ValueError(f"date 格式无效: {date}")

    t = _ts.utc(dt.year, dt.month, dt.day, dt.hour, dt.minute, dt.second)

    target = _get_target(body_key)
    observer = _get_observer(center_key)

    # 计算相对位置
    astrometric = observer.at(t).observe(target)

    # 获取位置（km）和速度（km/s）
    position = astrometric.position.km  # [x, y, z]
    velocity = astrometric.velocity.km_per_s  # [vx, vy, vz]
    distance = astrometric.distance().km

    return {
        "body": body_key,
        "body_name_zh": BODY_KEY_TO_NAME_ZH.get(body_key, body_key),
        "center": center_key,
        "center_name_zh": BODY_KEY_TO_NAME_ZH.get(center_key, center_key),
        "date": dt.strftime("%Y-%m-%d"),
        "jd": t.tt,
        "x": round(position[0], 6),
        "y": round(position[1], 6),
        "z": round(position[2], 6),
        "vx": round(velocity[0], 6),
        "vy": round(velocity[1], 6),
        "vz": round(velocity[2], 6),
        "distance_km": round(distance, 4),
        "distance_au": round(distance / 149597870.7, 8),
        "source": _ephem_source(),
    }


def compute_positions_range(body_key, center_key="sun", start_date=None, stop_date=None, step_days=1):
    """
    计算天体在日期范围内的位置序列。

    返回:
        {
            "body": str,
            "center": str,
            "start_date": str,
            "stop_date": str,
            "positions": [
                {"jd": float, "date": str, "x": ..., "y": ..., "z": ..., "vx": ..., "vy": ..., "vz": ...}
            ],
        }
    """
    global _ts
    _init_ephemeris()

    if start_date is None:
        start_date = datetime.utcnow().strftime("%Y-%m-%d")
    if stop_date is None:
        stop_date = start_date

    if isinstance(start_date, str):
        start_dt = datetime.strptime(start_date, "%Y-%m-%d")
    else:
        start_dt = start_date

    if isinstance(stop_date, str):
        stop_dt = datetime.strptime(stop_date, "%Y-%m-%d")
    else:
        stop_dt = stop_date

    target = _get_target(body_key)
    observer = _get_observer(center_key)

    positions = []
    current_dt = start_dt
    while current_dt <= stop_dt:
        t = _ts.utc(current_dt.year, current_dt.month, current_dt.day, 12, 0, 0)
        astrometric = observer.at(t).observe(target)
        pos = astrometric.position.km
        vel = astrometric.velocity.km_per_s

        positions.append({
            "jd": round(t.tt, 6),
            "date": current_dt.strftime("%Y-%m-%d"),
            "x": round(pos[0], 6),
            "y": round(pos[1], 6),
            "z": round(pos[2], 6),
            "vx": round(vel[0], 6),
            "vy": round(vel[1], 6),
            "vz": round(vel[2], 6),
        })
        current_dt += timedelta(days=step_days)

    return {
        "body": body_key,
        "body_name_zh": BODY_KEY_TO_NAME_ZH.get(body_key, body_key),
        "center": center_key,
        "center_name_zh": BODY_KEY_TO_NAME_ZH.get(center_key, center_key),
        "start_date": start_dt.strftime("%Y-%m-%d"),
        "stop_date": stop_dt.strftime("%Y-%m-%d"),
        "positions": positions,
        "source": _ephem_source(),
    }


def get_available_bodies():
    """返回支持的天体列表。"""
    return [
        {"key": k, "name_zh": v, "naif": BODY_KEY_TO_NAIF[k]}
        for k, v in BODY_KEY_TO_NAME_ZH.items()
    ]


def get_body_info(body_key):
    """获取天体基本信息（用于前端面板显示）。"""
    _init_ephemeris()

    body = _get_target(body_key)
    t_now = _ts.now()
    sun = _planets["SUN"]
    earth = _planets["EARTH BARYCENTER"]

    # 距太阳距离
    astro_sun = sun.at(t_now).observe(body)
    dist_sun_au = astro_sun.distance().au

    # 距地球距离
    astro_earth = earth.at(t_now).observe(body)
    dist_earth_au = astro_earth.distance().au

    return {
        "key": body_key,
        "name_zh": BODY_KEY_TO_NAME_ZH.get(body_key, body_key),
        "naif_id": BODY_KEY_TO_NAIF.get(body_key, ""),
        "distance_sun_au": round(dist_sun_au, 6),
        "distance_sun_km": round(dist_sun_au * 149597870.7, 4),
        "distance_earth_au": round(dist_earth_au, 6),
        "distance_earth_km": round(dist_earth_au * 149597870.7, 4),
        "source": _ephem_source(),
    }

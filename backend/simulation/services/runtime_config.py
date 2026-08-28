from .data_loader import PLANET_CATALOG
from .solar_calculator import (
    PLANET_SETUP,
    REAL_DISTANCE,
    REAL_ECCENTRICITY,
    REAL_RADIUS,
    build_solar_system_config,
)

REAL_MASS = {
    "sun": 1989000,
    "mercury": 0.330,
    "venus": 4.87,
    "earth": 5.97,
    "moon": 0.073,
    "mars": 0.642,
    "jupiter": 1898,
    "saturn": 568,
    "uranus": 86.8,
    "neptune": 102,
}

MOVE_RUNTIME_CONFIG = {
    "visual_scale": 1 / 2e6,
    "gravitational_constant": 6.67430e-11,
    "earth_mass": 5.972e24,
    "earth_radius": 6.371e6,
    "time_step_seconds": 60,
    "default_satellite_mass": 1000,
    "initial_satellite_altitude": 4.2164e7,
    "moon_mass": 7.34767309e22,
    "moon_distance": 3.844e8,
    "moon_radius": 1.737e6,
    "moon_velocity": 1022,
    "capture_radius": 1.5e7,
    "thrust_magnitude": 0.05,
}

NAME_BY_KEY = {planet["key"]: planet["name"] for planet in PLANET_SETUP}
CATALOG_BY_NAME = {item["name"]: item for item in PLANET_CATALOG}


def _dict_by_name(source):
    return {NAME_BY_KEY[key]: value for key, value in source.items() if key in NAME_BY_KEY}


def _planet_runtime_config_by_name():
    by_name = {}

    for planet in build_solar_system_config()["planets"]:
        payload = {
            "name": planet["name"],
            "distance": planet["distance"],
            "size": planet["size"],
            "speed": planet["speed"],
            "rotationSpeed": planet["rotation_speed"],
            "color": planet["color"],
            "model": planet["model"],
        }

        if "eccentricity" in planet:
            payload["eccentricity"] = planet["eccentricity"]

        if "orbit_color" in planet:
            payload["orbitColor"] = planet["orbit_color"]

        if "parent" in planet:
            payload["parent"] = NAME_BY_KEY.get(planet["parent"], planet["parent"])

        by_name[planet["name"]] = payload

    return by_name


def build_home_runtime_config():
    return {
        "real_radius_by_name": _dict_by_name(REAL_RADIUS),
        "real_distance_by_name": _dict_by_name(REAL_DISTANCE),
        "real_eccentricity_by_name": _dict_by_name(REAL_ECCENTRICITY),
        "planet_config_by_name": _planet_runtime_config_by_name(),
        "descriptions_by_name": {
            name: payload["description"] for name, payload in CATALOG_BY_NAME.items()
        },
        "nasa_urls_by_name": {
            name: payload["nasa_url"] for name, payload in CATALOG_BY_NAME.items()
        },
        # ★ 天文地理增量数据
        "earth_astronomy": {
            "axial_tilt_deg": 23.439281,
            "axial_tilt_desc": "黄赤交角（地轴倾角），决定四季成因。IAU标准值。",
            "eccentricity": 0.0167086,
            "argument_of_perihelion_deg": 102.937,
            "perihelion_date": "1月3日前后",
            "aphelion_date": "7月4日前后",
            "perihelion_distance_au": 0.9833,
            "aphelion_distance_au": 1.0167,
            "seasons": [
                {
                    "slug": "vernal_equinox", "name_zh": "春分", "name_en": "Vernal Equinox",
                    "sun_ecliptic_longitude_deg": 0, "earth_ecliptic_longitude_deg": 180,
                    "angle_from_perihelion_deg": 77.063, "date_approx": "3月20日前后",
                    "desc": "太阳直射赤道，昼夜等长，北半球天文春季开始。"
                },
                {
                    "slug": "summer_solstice", "name_zh": "夏至", "name_en": "Summer Solstice",
                    "sun_ecliptic_longitude_deg": 90, "earth_ecliptic_longitude_deg": 270,
                    "angle_from_perihelion_deg": 167.063, "date_approx": "6月21日前后",
                    "desc": "太阳直射北回归线（23.44°N），北半球白昼最长。"
                },
                {
                    "slug": "autumnal_equinox", "name_zh": "秋分", "name_en": "Autumnal Equinox",
                    "sun_ecliptic_longitude_deg": 180, "earth_ecliptic_longitude_deg": 0,
                    "angle_from_perihelion_deg": 257.063, "date_approx": "9月23日前后",
                    "desc": "太阳再次直射赤道，昼夜等长，北半球天文秋季开始。"
                },
                {
                    "slug": "winter_solstice", "name_zh": "冬至", "name_en": "Winter Solstice",
                    "sun_ecliptic_longitude_deg": 270, "earth_ecliptic_longitude_deg": 90,
                    "angle_from_perihelion_deg": 347.063, "date_approx": "12月22日前后",
                    "desc": "太阳直射南回归线（23.44°S），北半球白昼最短。"
                },
            ],
            "season_physics_notes": {
                "cause_of_seasons": "四季成因是地轴倾角（23.44°）+ 地球公转，而非近日/远日距离变化。",
                "perihelion_winter_note": "北半球冬季时地球实际处于近日点附近（1月），说明日地距离不是季节主因。",
            }
        },
    }


def build_tls_runtime_config():
    planet_runtime = _planet_runtime_config_by_name()

    return {
        "solar_system_models_by_name": {
            name: payload["model"] for name, payload in planet_runtime.items()
        },
        "real_radius_by_name": _dict_by_name(REAL_RADIUS),
        "real_distance_by_name": _dict_by_name(REAL_DISTANCE),
        "real_mass_by_name": _dict_by_name(REAL_MASS),
        "solar_system_defaults_by_name": {
            name: {
                "distance": payload["distance"],
                "size": payload["size"],
                "color": payload["color"],
            }
            for name, payload in planet_runtime.items()
        },
    }


def build_move_runtime_config():
    return MOVE_RUNTIME_CONFIG


def get_scene_runtime_config(scene_slug):
    runtime_builders = {
        "home": build_home_runtime_config,
        "move": build_move_runtime_config,
        "tls": build_tls_runtime_config,
    }

    try:
        return runtime_builders[scene_slug]()
    except KeyError as exc:
        raise KeyError(f"Runtime config for scene '{scene_slug}' was not found.") from exc

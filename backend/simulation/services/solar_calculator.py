from math import log


REAL_RADIUS = {
    "sun": 696340,
    "mercury": 2439.7,
    "venus": 6051.8,
    "earth": 6371,
    "moon": 1737.1,
    "mars": 3389.5,
    "jupiter": 69911,
    "saturn": 58232,
    "uranus": 25362,
    "neptune": 24622,
}

REAL_DISTANCE = {
    "mercury": 57.9,
    "venus": 108.2,
    "earth": 149.6,
    "moon": 0.384,
    "mars": 227.9,
    "jupiter": 778.6,
    "saturn": 1433.5,
    "uranus": 2872.5,
    "neptune": 4495.1,
}

REAL_ECCENTRICITY = {
    "mercury": 0.2056,
    "venus": 0.0068,
    "earth": 0.0167,
    "moon": 0.0549,
    "mars": 0.0934,
    "jupiter": 0.0489,
    "saturn": 0.0565,
    "uranus": 0.0457,
    "neptune": 0.0113,
}

PLANET_SETUP = [
    {
        "key": "sun",
        "name": "太阳",
        "speed": 0,
        "rotation_speed": 0.001,
        "color": "#ffde21",
        "model": "/assets/simulation/models/sun.glb",
        "gap_offset": 0,
        "size_multiplier": 4,
    },
    {
        "key": "mercury",
        "name": "水星",
        "speed": 0.010,
        "rotation_speed": 0.002,
        "color": "#b5b5b5",
        "orbit_color": "#aaaaaa",
        "model": "/assets/simulation/models/mercury.glb",
        "gap_offset": 0,
    },
    {
        "key": "venus",
        "name": "金星",
        "speed": 0.006,
        "rotation_speed": 0.0018,
        "color": "#eccc9a",
        "orbit_color": "#ffe4b5",
        "model": "/assets/simulation/models/venus.glb",
        "gap_offset": 5,
    },
    {
        "key": "earth",
        "name": "地球",
        "speed": 0.004,
        "rotation_speed": 0.002,
        "color": "#3399ff",
        "orbit_color": "#3399ff",
        "model": "/assets/simulation/models/earth.glb",
        "gap_offset": 10,
    },
    {
        "key": "moon",
        "name": "月球",
        "speed": 0.008,
        "rotation_speed": 0.002,
        "color": "#cccccc",
        "orbit_color": "#888888",
        "model": "/assets/simulation/models/moon.glb",
        "parent": "earth",
        "distance_multiplier": 2.2,
        "size_multiplier": 0.5,
    },
    {
        "key": "mars",
        "name": "火星",
        "speed": 0.003,
        "rotation_speed": 0.0017,
        "color": "#ff6633",
        "orbit_color": "#ff6347",
        "model": "/assets/simulation/models/mars.glb",
        "gap_offset": 15,
    },
    {
        "key": "jupiter",
        "name": "木星",
        "speed": 0.0014,
        "rotation_speed": 0.0015,
        "color": "#ffcc99",
        "orbit_color": "#f5deb3",
        "model": "/assets/simulation/models/jupiter.glb",
        "gap_offset": 100,
    },
    {
        "key": "saturn",
        "name": "土星",
        "speed": 0.0009,
        "rotation_speed": 0.0013,
        "color": "#ffe599",
        "orbit_color": "#ffe599",
        "model": "/assets/simulation/models/saturn.glb",
        "gap_offset": 200,
        "size_multiplier": 10,
    },
    {
        "key": "uranus",
        "name": "天王星",
        "speed": 0.0004,
        "rotation_speed": 0.001,
        "color": "#99ffff",
        "orbit_color": "#66ffff",
        "model": "/assets/simulation/models/uranus.glb",
        "gap_offset": 250,
    },
    {
        "key": "neptune",
        "name": "海王星",
        "speed": 0.0002,
        "rotation_speed": 0.0009,
        "color": "#3366ff",
        "orbit_color": "#3366ff",
        "model": "/assets/simulation/models/neptune.glb",
        "gap_offset": 400,
    },
]

SIZE_SCALE = 0.1
DISTANCE_SCALE = 10
DISTANCE_GAP_SCALE = 1.4


def log_scale(value, base=10):
    return log(value) / log(base)


def build_planet_config(planet):
    key = planet["key"]
    radius = REAL_RADIUS[key]
    size_multiplier = planet.get("size_multiplier", 1)
    distance_multiplier = planet.get("distance_multiplier", 1)

    if key == "sun":
        distance = 0
    elif key == "moon":
        distance = log_scale(REAL_DISTANCE[key]) * distance_multiplier
    else:
        distance = (
            log_scale(REAL_DISTANCE[key]) * DISTANCE_SCALE
            + planet.get("gap_offset", 0) * DISTANCE_GAP_SCALE
        )

    payload = {
        "key": key,
        "name": planet["name"],
        "distance": distance,
        "size": log_scale(radius) * SIZE_SCALE * size_multiplier,
        "speed": planet["speed"],
        "rotation_speed": planet["rotation_speed"],
        "color": planet["color"],
        "model": planet["model"],
    }

    if key != "sun":
        payload["eccentricity"] = REAL_ECCENTRICITY[key]
        payload["orbit_color"] = planet["orbit_color"]

    if "parent" in planet:
        payload["parent"] = planet["parent"]

    return payload


def build_solar_system_config():
    return {
        "size_scale": SIZE_SCALE,
        "distance_scale": DISTANCE_SCALE,
        "distance_gap_scale": DISTANCE_GAP_SCALE,
        "planets": [build_planet_config(planet) for planet in PLANET_SETUP],
    }

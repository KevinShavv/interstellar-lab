MODULE_CATALOG = [
    {
        "slug": "move",
        "title": "地月转移演示",
        "summary": "地月轨道转移演示。",
        "description": "",
        "route": "/move",
        "preview_image": "/assets/simulation/models/3.webp",
        "accent": "#2dd4bf",
    },
    {
        "slug": "home",
        "title": "探索太阳系",
        "summary": "太阳系 3D 展示。",
        "description": "",
        "route": "/solar",
        "preview_image": "/assets/simulation/models/sys.jpg",
        "accent": "#f59e0b",
    },
    {
        "slug": "tls",
        "title": "星体实验室",
        "summary": "多天体引力模拟。",
        "description": "",
        "route": "/tls",
        "preview_image": "/assets/simulation/models/5.webp",
        "accent": "#60a5fa",
    },
    {
        "slug": "realtime",
        "title": "实时天体追踪",
        "summary": "基于 Skyfield + JPL DE430 本地星历计算天体实时位置（国内可用，完全离线）。",
        "description": "",
        "route": "/realtime",
        "preview_image": "/assets/simulation/models/sys.jpg",
        "accent": "#8b5cf6",
    },
]

SCENE_CATALOG = [
    {
        "slug": "move",
        "title": "地月转移演示",
        "route": "/move",
        "legacy_path": "/legacy/LaunchDemostration.html",
        "kind": "three-scene",
    },
    {
        "slug": "home",
        "title": "探索太阳系",
        "route": "/solar",
        "legacy_path": "/legacy/SolarSystem.html",
        "kind": "three-scene",
    },
    {
        "slug": "tls",
        "title": "星体实验室",
        "route": "/tls",
        "legacy_path": "/legacy/Celestial%20SimulationLab.html",
        "kind": "three-scene",
    },
    {
        "slug": "realtime",
        "title": "实时天体追踪",
        "route": "/realtime",
        "legacy_path": "/legacy/RealtimeCelestial.html",
        "kind": "three-scene",
    },
]

PLANET_CATALOG = [
    {
        "key": "sun",
        "name": "太阳",
        "radius_km": 696340,
        "model": "/assets/simulation/models/sun.glb",
        "nasa_url": "https://science.nasa.gov/sun/",
        "description": "太阳系中心恒星，决定了整个系统的能量来源和引力框架。",
    },
    {
        "key": "mercury",
        "name": "水星",
        "radius_km": 2439.7,
        "distance_million_km": 57.9,
        "eccentricity": 0.2056,
        "model": "/assets/simulation/models/mercury.glb",
        "nasa_url": "https://science.nasa.gov/mercury/",
        "description": "距离太阳最近的行星，轨道偏心率较高，昼夜温差巨大。",
    },
    {
        "key": "venus",
        "name": "金星",
        "radius_km": 6051.8,
        "distance_million_km": 108.2,
        "eccentricity": 0.0068,
        "model": "/assets/simulation/models/venus.glb",
        "nasa_url": "https://science.nasa.gov/venus/",
        "description": "与地球大小相近，但拥有极端温室效应和高压大气。",
    },
    {
        "key": "earth",
        "name": "地球",
        "radius_km": 6371,
        "distance_million_km": 149.6,
        "eccentricity": 0.0167,
        "model": "/assets/simulation/models/earth.glb",
        "nasa_url": "https://science.nasa.gov/earth/facts/",
        "description": "目前已知唯一孕育生命的行星，也是月球的母星。",
    },
    {
        "key": "moon",
        "name": "月球",
        "radius_km": 1737.1,
        "distance_million_km": 0.384,
        "eccentricity": 0.0549,
        "model": "/assets/simulation/models/moon.glb",
        "nasa_url": "https://science.nasa.gov/moon/",
        "description": "地球唯一的天然卫星，在本项目里承担地月转移与跟随视角逻辑。",
    },
    {
        "key": "mars",
        "name": "火星",
        "radius_km": 3389.5,
        "distance_million_km": 227.9,
        "eccentricity": 0.0934,
        "model": "/assets/simulation/models/mars.glb",
        "nasa_url": "https://science.nasa.gov/mars/",
        "description": "常作为深空探索目标的类地行星，轨道偏心率明显。",
    },
    {
        "key": "jupiter",
        "name": "木星",
        "radius_km": 69911,
        "distance_million_km": 778.6,
        "eccentricity": 0.0489,
        "model": "/assets/simulation/models/jupiter.glb",
        "nasa_url": "https://science.nasa.gov/jupiter/",
        "description": "太阳系最大的行星，在旧逻辑中拥有明显更大的缩放系数。",
    },
    {
        "key": "saturn",
        "name": "土星",
        "radius_km": 58232,
        "distance_million_km": 1433.5,
        "eccentricity": 0.0565,
        "model": "/assets/simulation/models/saturn.glb",
        "nasa_url": "https://science.nasa.gov/saturn/",
        "description": "以行星环闻名，在原始 Three.js 逻辑中也有单独的尺寸强化。",
    },
    {
        "key": "uranus",
        "name": "天王星",
        "radius_km": 25362,
        "distance_million_km": 2872.5,
        "eccentricity": 0.0457,
        "model": "/assets/simulation/models/uranus.glb",
        "nasa_url": "https://science.nasa.gov/uranus/",
        "description": "冰巨星，保留原始模型和远距轨道配置。",
    },
    {
        "key": "neptune",
        "name": "海王星",
        "radius_km": 24622,
        "distance_million_km": 4495.1,
        "eccentricity": 0.0113,
        "model": "/assets/simulation/models/neptune.glb",
        "nasa_url": "https://science.nasa.gov/neptune/",
        "description": "太阳系最外侧的大行星之一，继续沿用原项目的展示模型。",
    },
]


def get_module_catalog():
    return MODULE_CATALOG



def get_scene_catalog():
    return SCENE_CATALOG



def get_planet_catalog():
    return PLANET_CATALOG
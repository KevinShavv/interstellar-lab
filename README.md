# Interstellar Lab

An interactive 3D solar system simulator and astronomy teaching platform built on real JPL ephemeris data. The interface is available in English and Chinese (English by default), with a language switch in the top-right corner.

## Features

- **Solar System** (`/solar`) — interactive 3D model with real ephemeris positions, selectable bodies, orbit trails and time controls
- **Earth–Moon–Sun** (`/earth-moon-sun`) — solar terms, eclipses and the Mid-Autumn moon phase
- **Mission Demo** (`/move`) — Earth-to-Moon transfer: launch, injection, perilune braking and lunar orbit insertion
- **Scientific Laboratory** (`/tls`) — controlled-variable experiments on mass, gravity, velocity and distance
- **Realtime Tracking** (`/realtime`) — query a date and recompute all planetary positions from local ephemeris
- **AI Assistant** — an in-page DeepSeek/Zhipu chat widget that answers with awareness of the current module
- **Bilingual UI** — every page, the 3D scenes and the AI assistant switch language together; the choice persists in `localStorage`

## Architecture

```
Browser (Vue 3 SPA)                Django REST API
┌──────────────────────┐           ┌──────────────────────────┐
│ Views / Components   │  /api/*   │ DRF endpoints            │
│ Pinia store          │ ────────▶ │ SolarSystem settings     │
│ Three.js scenes      │  proxy    │ Skyfield calculator      │
│ legacy HTML modules  │           │ JPL DE440 ephemeris      │
└──────────────────────┘           └──────────────────────────┘
        Vite 5173                          Django 8000
```

The frontend is a Vue 3 single-page application bundled with Vite. Its development server proxies `/api` to the Django backend, so the whole app runs from one origin. The 3D scenes are self-contained HTML modules under `frontend/public/legacy`, loaded into an iframe when a module is opened; they carry their own Three.js setup, controls and UI.

The backend is Django 5 with Django REST Framework. It serves catalog and configuration data, proxies the AI chat provider, and computes celestial positions locally with Skyfield reading a JPL DE440 kernel. All configuration comes from environment variables; no secrets are stored in the repository.

### Ephemeris

Positions are computed from **JPL DE440** (`de440.bsp`, 119,799,808 bytes). The loader looks for the kernel in `backend/de440.bsp`, a Docker mount at `/app/de440.bsp`, or a `skyfield_data/` directory, in that order. `skyfield_calculator.py` derives the source label from the file actually loaded, so the API never reports a version different from the data in use.

The kernel is not committed (GitHub limits single files to 100 MB). See [Getting the ephemeris](#getting-the-ephemeris) below.

### Internationalization

Language state lives in a single module-level `currentLang` ref inside `useSiteChrome`, shared by every Vue view. Each view holds a `translations.zh` / `translations.en` object and selects from it reactively, so one toggle updates all visible text immediately. The toggle lives in `SiteHeader.vue`, which every page renders.

The 3D modules are plain HTML rather than Vue components. They observe `localStorage('site-lang')` and a `site-chrome` postMessage from the parent frame to stay in sync. The AI chat widget is likewise standalone JavaScript: it reads the same key, keeps a separate string table and system prompt per language, and rebuilds its system message on switch so replies follow the selected language.

## Getting started

### Backend

```bash
cd backend
python -m venv .venv && source .venv/bin/activate      # Windows: .venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver 127.0.0.1:8000
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Open <http://127.0.0.1:5173/>. The Vite proxy forwards `/api` to port 8000.

### Optional environment variables

| Variable | Purpose | Default |
|---|---|---|
| `DJANGO_SECRET_KEY` | Django secret key | development key |
| `DJANGO_DEBUG` | Debug mode | `true` |
| `DJANGO_ALLOWED_HOSTS` | Comma-separated hosts | `127.0.0.1,localhost` |
| `DEEPSEEK_API_KEY` / `ZHIPU_API_KEY` | AI assistant provider key | unset |
| `CHAT_API_KEY` + `CHAT_API_URL` | Generic chat provider | unset |

The AI assistant returns a clear "not configured" message when no key is set; the rest of the app works without it.

### Getting the ephemeris

Some networks cannot reach `naif.jpl.nasa.gov` directly. A mirror of the same JPL kernel is available on HuggingFace:

```bash
curl -L -o backend/de440.bsp \
  "https://hf-mirror.com/datasets/phanerozoic/JPL-DE440-DE441/resolve/main/spk/de440.bsp"
```

Verify the download:

- Size: `119799808` bytes
- SHA-256: `a4ce9bf9b3282becc9f4b2ac3cebe03a2ae7599981aabd7265fd8482fff7c4b5`

`DE440_EXPECTED_SIZE` in `skyfield_calculator.py` matches this size; `download_ephemeris()` validates the download against it and moves to the next mirror on mismatch.

## API

All endpoints are under `/api/`:

| Endpoint | Description |
|---|---|
| `health/` | Health check |
| `modules/`, `scenes/`, `planets/` | Content catalogs |
| `scenes/<slug>/`, `scenes/<slug>/runtime/` | Scene detail and runtime config |
| `solar-system/config/` | Solar system configuration |
| `horizons/` | JPL Horizons proxy |
| `skyfield/` | Local ephemeris positions — modes `bodies`, `info`, `single`, `all`, `range` |
| `chat/` | AI assistant proxy (requires a provider key) |

## Project layout

```
backend/
  solar_system/         Django settings and URL config
  simulation/           API views, data catalogs, Skyfield calculator
  de440.bsp             JPL ephemeris (not committed)
frontend/
  src/                  Vue app: views, components, store, router, composables
  public/legacy/        Standalone Three.js scene modules
  public/assets/        3D models, textures, course materials, chat widget
```

---

# 中文版

# 星际实验室

基于真实 JPL 星历的太阳系三维模拟与天体教学平台。界面支持中英双语（默认英文），右上角可切换语言。

## 功能

- **太阳系**（`/solar`）——交互式 3D 模型，真实星历位置，可选天体、轨迹与时间控制
- **日地月**（`/earth-moon-sun`）——二分二至、日食月食与中秋月相
- **地月转移演示**（`/move`）——发射、转移、近月制动与环月轨道插入
- **科学实验室**（`/tls`）——质量、引力、速度、距离的控制变量实验
- **实时追踪**（`/realtime`）——选日期，用本地星历重算所有行星位置
- **AI 助手**——页面内 DeepSeek / 智谱对话，回答时结合当前模块内容
- **双语界面**——各页面、3D 场景与 AI 助手同步切换，选择保存在 `localStorage`

## 技术架构

前端为 Vue 3 单页应用，Vite 构建；开发服务器把 `/api` 代理到 Django，使整个应用同源运行。3D 场景是 `frontend/public/legacy/` 下独立的 HTML 模块，打开模块时以 iframe 加载，各自带 Three.js 初始化、控制器与界面。

后端为 Django 5 + Django REST Framework，提供内容目录与配置接口、代理 AI 对话，并用 Skyfield 读取本地 JPL DE440 星历计算天体位置。所有配置走环境变量，仓库内不含密钥。

**星历**：位置由 JPL DE440（`de440.bsp`，119,799,808 字节）计算。加载器依次查找 `backend/de440.bsp`、`/app/de440.bsp`（Docker 挂载）、`skyfield_data/`。来源标签按实际加载的文件名生成，接口不会报出与数据不符的版本。星历文件未入库（GitHub 单文件 100 MB 限制），获取方式见下。

**国际化**：语言状态是 `useSiteChrome` 里一个模块级 `currentLang` ref，所有视图共享。每个视图持有 `translations.zh` / `translations.en`，响应式取值，切换一次即更新全部可见文本。切换按钮在 `SiteHeader.vue`，所有页面都会渲染它。3D 模块是纯 HTML，通过 `localStorage('site-lang')` 和父窗口的 `site-chrome` postMessage 保持同步；AI 助手同样是独立 JS，读取同一个 key，各自维护中英文案与 system prompt，切换时重建 system message，使回复语言跟随界面。

## 运行

后端：

```bash
cd backend
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver 127.0.0.1:8000
```

前端：

```bash
cd frontend
npm install
npm run dev
```

打开 <http://127.0.0.1:5173/>。Vite 会把 `/api` 转发到 8000 端口。

可选环境变量：`DJANGO_SECRET_KEY`、`DJANGO_DEBUG`、`DJANGO_ALLOWED_HOSTS`、`DEEPSEEK_API_KEY` / `ZHIPU_API_KEY`、`CHAT_API_KEY` + `CHAT_API_URL`。未配置 AI key 时助手会返回明确的未配置提示，其余功能不受影响。

### 星历文件获取

`naif.jpl.nasa.gov` 在部分网络环境不可直连，可用 HuggingFace 上同源镜像：

```bash
curl -L -o backend/de440.bsp \
  "https://hf-mirror.com/datasets/phanerozoic/JPL-DE440-DE441/resolve/main/spk/de440.bsp"
```

校验：大小 `119799808` 字节；SHA-256 `a4ce9bf9b3282becc9f4b2ac3cebe03a2ae7599981aabd7265fd8482fff7c4b5`。`download_ephemeris()` 会按此校验，不符则换下一个镜像。

## 接口

全部位于 `/api/`：`health/`、`modules/`、`scenes/`、`scenes/<slug>/`、`scenes/<slug>/runtime/`、`planets/`、`solar-system/config/`、`horizons/`、`skyfield/`（modes：`bodies`/`info`/`single`/`all`/`range`）、`chat/`。

## 目录结构

```
backend/   Django 接口、内容目录、Skyfield 计算
frontend/  Vue 3 应用（Vite）、legacy 3D 场景、模型与课件
```

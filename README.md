# Interstellar Lab — Solar System Simulation

基于真实 JPL 星历的太阳系三维模拟与天体教学项目。
前端 Vue 3 + Three.js，后端 Django + Skyfield。

## 技术栈

- **Backend**: Django 5, Django REST Framework, Skyfield（JPL DE440 星历）
- **Frontend**: Vue 3, Vite, Three.js, Pinia, Vue Router, Tailwind CSS

## 功能

- 太阳系模拟（`/solar`）
- 地-月-日模型（`/earth-moon-sun`）
- 轨道机动 / 转移（`/move`）
- TLS 主题（`/tls`）
- 实时轨道（`/realtime`）
- 课程配套材料（`course-materials`）

## 目录结构

```
backend/   Django API + Skyfield 天体计算
frontend/  Vue 3 应用（Vite）
```

## 运行

### 后端

```bash
cd backend
pip install -r requirements.txt
python manage.py runserver
```

> 需要 `de440.bsp` 星历文件（未包含在仓库，因超过 GitHub 单文件 100 MB 限制，可从 NASA/JPL Horizon System 官方下载）。

### 前端

```bash
cd frontend
npm install
npm run dev
```

## 说明

- `de440.bsp`（JPL 星历数据，约 114 MB）未入库，请从官方渠道获取。
- 课程课件（zip）与 3D 模型（glb）等资源已包含在仓库内。

const solarSystemModels = {
            "太阳":   "/assets/simulation/models/sun.glb",
            "水星":   "/assets/simulation/models/mercury.glb",
            "金星":   "/assets/simulation/models/venus.glb",
            "地球":   "/assets/simulation/models/earth.glb",
            "月球":   "/assets/simulation/models/moon.glb",
            "火星":   "/assets/simulation/models/mars.glb",
            "木星":   "/assets/simulation/models/jupiter.glb",
            "土星":   "/assets/simulation/models/saturn.glb",
            "天王星": "/assets/simulation/models/uranus.glb",
            "海王星": "/assets/simulation/models/neptune.glb"
        };

        // 真实半径（单位：km）
        const realRadius = {
            "太阳": 696340,
            "水星": 2439.7,
            "金星": 6051.8,
            "地球": 6371,
            "火星": 3389.5,
            "木星": 69911,
            "土星": 58232,
            "天王星": 25362,
            "海王星": 24622,
            "月球": 1737.1
        };
        
        // 真实轨道半径（单位：百万km，日均距离）
        const realDistance = {
            "水星": 57.9,
            "金星": 108.2,
            "地球": 149.6,
            "火星": 227.9,
            "木星": 778.6,
            "土星": 1433.5,
            "天王星": 2872.5,
            "海王星": 4495.1,
            "月球": 0.384
        };
        
        // 真实质量（单位：10^24 kg）
        const realMass = {
            "太阳": 1989000,
            "水星": 0.330,
            "金星": 4.87,
            "地球": 5.97,
            "火星": 0.642,
            "木星": 1898,
            "土星": 568,
            "天王星": 86.8,
            "海王星": 102,
            "月球": 0.073
        };
        
        // 对数缩放因子
        const sizeScale = 0.1;
        const distanceScale = 10;
        const distanceGapScale = 1.4;
        
        function logScale(val, base = 10) {
            return Math.log(val) / Math.log(base);
        }
        
        function sceneDistanceFromRealDistance(simDistance, orbitOffset = 0) {
            if (simDistance <= 0) return 0;
            return logScale(simDistance + 1) * distanceScale + orbitOffset * distanceGapScale;
        }

        function satelliteSceneDistanceFromRealDistance(simDistance, nominalDistance = realDistance["月球"]) {
            const baseDistance = 7.2;
            const ratio = nominalDistance > 0 ? simDistance / nominalDistance : 1;
            const scaledDistance = baseDistance * Math.pow(Math.max(ratio, 0.05), 0.35);
            return Math.max(4.5, Math.min(18, scaledDistance));
        }

        const DEFAULT_BODY_MASS_EXPONENT = 0.35;
        const DEFAULT_BODY_MASS_MULTIPLIER = 0.02;

        // 太阳系默认参数
        // 默认星体使用更稳定的实验室距离、质量与初速度，避免加入后立即出现异常坠落或乱飞。
        const solarSystemDefaults = {
            "太阳":   { distance: 0, size: 6.8, color: 0xffde21, phase: 0, orbitOffset: 0 },
            "水星":   { distance: sceneDistanceFromRealDistance(realDistance["水星"], 0), size: 0.9, color: 0xb5b5b5, simDistance: realDistance["水星"], phase: 0.55, orbitOffset: 0 },
            "金星":   { distance: sceneDistanceFromRealDistance(realDistance["金星"], 3), size: 1.35, color: 0xeccc9a, simDistance: realDistance["金星"], phase: 1.45, orbitOffset: 3 },
            "地球":   { distance: sceneDistanceFromRealDistance(realDistance["地球"], 6), size: 1.4, color: 0x5577ff, simDistance: realDistance["地球"], phase: 2.2, orbitOffset: 6 },
            "月球":   { distance: satelliteSceneDistanceFromRealDistance(realDistance["月球"]), size: 0.55, color: 0xa7a7a7, simDistance: realDistance["月球"], phase: 0.9, orbitOffset: 6, referenceBodyName: "地球", nominalDistance: realDistance["月球"] },
            "火星":   { distance: sceneDistanceFromRealDistance(realDistance["火星"], 9), size: 1.05, color: 0xff5500, simDistance: realDistance["火星"], phase: 2.95, orbitOffset: 9 },
            "木星":   { distance: sceneDistanceFromRealDistance(realDistance["木星"], 16), size: 3.9, color: 0xb8864a, simDistance: realDistance["木星"], phase: 3.55, orbitOffset: 16 },
            "土星":   { distance: sceneDistanceFromRealDistance(realDistance["土星"], 22), size: 3.4, color: 0xd9c078, simDistance: realDistance["土星"], phase: 4.15, orbitOffset: 22 },
            "天王星": { distance: sceneDistanceFromRealDistance(realDistance["天王星"], 28), size: 2.4, color: 0x88ddff, simDistance: realDistance["天王星"], phase: 4.95, orbitOffset: 28 },
            "海王星": { distance: sceneDistanceFromRealDistance(realDistance["海王星"], 34), size: 2.35, color: 0x3344cc, simDistance: realDistance["海王星"], phase: 5.65, orbitOffset: 34 }
        };

        const solarSystemDescriptions = {
            "太阳": "系统中心恒星，适合作为引力核心",
            "水星": "靠近中心的高速内侧轨道行星",
            "金星": "高亮暖色预设行星",
            "地球": "标准蓝色预设行星",
            "月球": "较小的灰白色预设天体",
            "火星": "偏红色预设行星",
            "木星": "高质量巨行星",
            "土星": "带模型资源的外侧巨行星",
            "天王星": "冷色冰巨星预设",
            "海王星": "更外侧的蓝色预设行星"
        };

        // 半径缩放全局变量
        let radiusScale = 1;

        const container = document.getElementById("three-container");
        const scene = new THREE.Scene();
        const initialSize = { width: Math.max(1, container.clientWidth || window.innerWidth), height: Math.max(1, container.clientHeight || window.innerHeight) };
        const labPerfProfile = (() => {
            const viewportWidth = initialSize.width || window.innerWidth || 1920;
            const dpr = window.devicePixelRatio || 1;
            const heavy = dpr > 1.35 || viewportWidth < 1366;
            return {
                heavy,
                pixelRatioCap: heavy ? 1.0 : 1.15,
                gizmoPixelRatioCap: heavy ? 1.0 : 1.2,
                starCount: heavy
                    ? (window.innerWidth < 768 ? 2600 : window.innerWidth < 1440 ? 3400 : 4200)
                    : (window.innerWidth < 768 ? 3400 : window.innerWidth < 1440 ? 4600 : 5600),
                lineWidthUpdateIntervalMs: heavy ? 160 : 110,
                maintenanceIntervalMs: heavy ? 180 : 130,
                forceVisualIntervalMs: heavy ? 110 : 76,
                labelUpdateIntervalMs: heavy ? 74 : 48,
                gizmoUpdateIntervalMs: heavy ? 94 : 62,
                infoPanelUpdateIntervalMs: heavy ? 140 : 90,
                forceSyncIntervalMs: heavy ? 170 : 120
            };
        })();
        const camera = new THREE.PerspectiveCamera(50, initialSize.width / initialSize.height, 1, 20000);
        camera.position.set(0, 150, 400);

        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
        renderer.setSize(initialSize.width, initialSize.height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, labPerfProfile.pixelRatioCap));
        renderer.shadowMap.enabled = !labPerfProfile.heavy;
        if (renderer.shadowMap.enabled) {
            renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        }
        renderer.sortObjects = true; // ★ 启用 GPU 排序减少 overdraw
        container.appendChild(renderer.domElement);

        // 真实星空背景球体（高清贴图）
        // 替换为本地eso0932a.tif
        const starTextureUrl = '/assets/simulation/models/starfield.jpg';
        const loaderTex = new THREE.TextureLoader();
        loaderTex.load(starTextureUrl, function(texture) {
            const geometry = new THREE.SphereGeometry(8000, 64, 64);
            const material = new THREE.MeshBasicMaterial({
                map: texture,
                side: THREE.BackSide,
                depthWrite: false
            });
            const skySphere = new THREE.Mesh(geometry, material);
            skySphere.name = 'skySphere';
            scene.add(skySphere);
        });

        // 轨道控制器
        const controls = new THREE.OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;
        controls.minDistance = 50;
        controls.maxDistance = 8000;

        const orientationGizmo = createOrientationGizmo();

        function createAxisLabelSprite(label, color) {
            const canvas = document.createElement('canvas');
            canvas.width = 128;
            canvas.height = 128;
            const ctx = canvas.getContext('2d');
            if (!ctx) return null;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.beginPath();
            ctx.fillStyle = 'rgba(8, 18, 31, 0.88)';
            ctx.arc(64, 64, 42, 0, Math.PI * 2);
            ctx.fill();
            ctx.lineWidth = 8;
            ctx.strokeStyle = color;
            ctx.stroke();
            ctx.fillStyle = '#f3fbff';
            ctx.font = '700 60px "Barlow Condensed", "Segoe UI", sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(label, 64, 68);
            const texture = new THREE.CanvasTexture(canvas);
            texture.needsUpdate = true;
            const material = new THREE.SpriteMaterial({
                map: texture,
                transparent: true,
                depthTest: false,
                depthWrite: false
            });
            const sprite = new THREE.Sprite(material);
            sprite.scale.set(0.58, 0.58, 0.58);
            return sprite;
        }

        function resizeOrientationGizmo(gizmo = orientationGizmo) {
            if (!gizmo || !gizmo.viewport) return;
            const width = Math.max(72, Math.round(gizmo.viewport.clientWidth || 88));
            const height = Math.max(72, Math.round(gizmo.viewport.clientHeight || width));
            gizmo.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, labPerfProfile.gizmoPixelRatioCap));
            gizmo.renderer.setSize(width, height, false);
            const aspect = width / height;
            gizmo.camera.left = -1.8 * aspect;
            gizmo.camera.right = 1.8 * aspect;
            gizmo.camera.top = 1.8;
            gizmo.camera.bottom = -1.8;
            gizmo.camera.updateProjectionMatrix();
        }

        function createOrientationGizmo() {
            const dragHint = document.querySelector('.drag-hint');
            if (!dragHint) return null;
            dragHint.classList.add('drag-hint--with-gizmo');
            const root = document.createElement('div');
            root.className = 'orientation-gizmo';
            root.innerHTML = '<span class="orientation-gizmo__title">方位轴</span><div class="orientation-gizmo__viewport"></div>';
            dragHint.appendChild(root);

            const viewport = root.querySelector('.orientation-gizmo__viewport');
            const gizmoRenderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
            gizmoRenderer.setClearColor(0x000000, 0);
            viewport.appendChild(gizmoRenderer.domElement);

            const gizmoScene = new THREE.Scene();
            const gizmoCamera = new THREE.OrthographicCamera(-1.8, 1.8, 1.8, -1.8, 0.1, 10);
            gizmoCamera.position.set(0, 0, 4.5);
            gizmoCamera.lookAt(0, 0, 0);

            const axesGroup = new THREE.Group();
            const ring = new THREE.Mesh(
                new THREE.RingGeometry(1.3, 1.42, 48),
                new THREE.MeshBasicMaterial({
                    color: 0x6fd3ff,
                    transparent: true,
                    opacity: 0.16,
                    side: THREE.DoubleSide,
                    depthWrite: false
                })
            );
            axesGroup.add(ring);
            axesGroup.add(new THREE.AxesHelper(1.05));
            axesGroup.add(new THREE.Mesh(
                new THREE.SphereGeometry(0.09, 18, 18),
                new THREE.MeshBasicMaterial({ color: 0xe9f2ff, transparent: true, opacity: 0.92 })
            ));

            const xLabel = createAxisLabelSprite('X', '#ff8b7b');
            const yLabel = createAxisLabelSprite('Y', '#2ed6a1');
            const zLabel = createAxisLabelSprite('Z', '#6fd3ff');
            if (xLabel) {
                xLabel.position.set(1.35, 0, 0);
                axesGroup.add(xLabel);
            }
            if (yLabel) {
                yLabel.position.set(0, 1.35, 0);
                axesGroup.add(yLabel);
            }
            if (zLabel) {
                zLabel.position.set(0, 0, 1.35);
                axesGroup.add(zLabel);
            }

            gizmoScene.add(axesGroup);
            gizmoScene.add(new THREE.AmbientLight(0xffffff, 1));

            const state = {
                root,
                viewport,
                renderer: gizmoRenderer,
                scene: gizmoScene,
                camera: gizmoCamera,
                group: axesGroup
            };
            resizeOrientationGizmo(state);
            return state;
        }

        function updateOrientationGizmo(gizmo = orientationGizmo) {
            if (!gizmo) return;
            gizmo.group.quaternion.copy(camera.quaternion).invert();
            gizmo.renderer.render(gizmo.scene, gizmo.camera);
        }

        // 创建星空背景
        // 更明显的星空背景
        const starGeometry = new THREE.BufferGeometry();
        const starCount = labPerfProfile.starCount;
        const starVertices = [];
        const starColors = [];
        for (let i = 0; i < starCount; i++) {
            const x = (Math.random() - 0.5) * 16000;
            const y = (Math.random() - 0.5) * 16000;
            const z = (Math.random() - 0.5) * 16000;
            starVertices.push(x, y, z);
            // 星星有冷暖色调
            const color = new THREE.Color();
            if (Math.random() > 0.5) {
                color.setHSL(0.6 + Math.random() * 0.2, 0.7, 0.8 + Math.random() * 0.2); // 蓝白
            } else {
                color.setHSL(0.1 + Math.random() * 0.1, 0.7, 0.9 + Math.random() * 0.1); // 黄白
            }
            starColors.push(color.r, color.g, color.b);
        }
        starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3));
        starGeometry.setAttribute('color', new THREE.Float32BufferAttribute(starColors, 3));
        const starMaterial = new THREE.PointsMaterial({
            size: 2.2,
            vertexColors: true,
            transparent: true,
            opacity: 0.95,
            depthWrite: false
        });
        const stars = new THREE.Points(starGeometry, starMaterial);
        scene.add(stars);

        // 环境光
        const ambientLight = new THREE.AmbientLight(0xffffff, 1.1); // 更亮
        scene.add(ambientLight);

        // 点光源模拟太阳光
        const pointLight = new THREE.PointLight(0xffffff, 2.8, 16000); // 更亮更远
        pointLight.position.set(0, 0, 0);
        pointLight.castShadow = renderer.shadowMap.enabled;
        scene.add(pointLight);

        // 星体列表管理
        const planetObjs = [];
        const planetNames = new Set();
        let showPlanetNames = true;
        const planetNameLabels = new Map();
        let activePlanetInfoMesh = null;
        let planetInfoPanelElements = null;
        const planetForceArrows = new Map();
        const FORCE_VECTOR_COLOR = 0xffb14d;
        const FORCE_VECTOR_MIN_MAGNITUDE = 1e-8;
        const FORCE_VECTOR_MIN_LENGTH = 10;
        const FORCE_VECTOR_MAX_LENGTH = 72;

        // 加载管理器
        const loader = new THREE.GLTFLoader();

        // 用于轨道动画控制
        let isSimulating = false;
        const clock = new THREE.Clock();

        // 拖拽相关变量
        let raycaster = new THREE.Raycaster();
        let mouse = new THREE.Vector2();
        let selectedPlanet = null;
        let isDragging = false;
        let dragStart = null;
        let activeDragPointerId = null;
        let orbitAnimationPaused = false;
        let dragOrbitLine = null;
        let dragRadiusLabel = null;
        let dragHelperLine = null;
        let isFocusing = false; // 添加聚焦动画标志

        // 万有引力常数（单位：合适缩放，Three.js单位）
        let G = 10; // 更强引力，便于观察吸引

        // 轨迹线管理
        const trajectoryLines = new Map(); // name -> {geometry, line, positions, colors}
        let showTrajectories = true;
        const fadeOutDuration = 1000;
        // maxTrajectoryPoints 尾迹残留时间8秒，假设60fps，则8*60=480个点
        const maxTrajectoryPoints = 360;
        let needsSceneSort = true;
        let physicsTickCounter = 0;
        let lastLineWidthUpdateMs = 0;
        let lastMaintenanceUpdateMs = 0;
        let lastForceVisualUpdateMs = 0;
        let lastLabelUpdateMs = 0;
        let lastGizmoUpdateMs = 0;
        let lastInfoPanelUpdateMs = 0;
        const labelProjectVector = new THREE.Vector3();
        let lastForceSyncMs = 0;
        let isForceStateDirty = true;

        function markSceneSortDirty() {
            needsSceneSort = true;
        }

        function sortSceneChildren() {
            scene.children.sort((a, b) => {
                const aOrder = a.renderOrder || 0;
                const bOrder = b.renderOrder || 0;
                return aOrder - bOrder;
            });
            needsSceneSort = false;
        }

        function getPlanetRecord(mesh) {
            return planetObjs.find((planet) => planet.mesh === mesh) || null;
        }

        function getPlanetDisplayName(target) {
            if (!target) return "";
            if (target.mesh) return (target.mesh.userData && target.mesh.userData.name) || target.name || "";
            const record = getPlanetRecord(target);
            return (target.userData && target.userData.name) || (record && record.name) || target.name || "";
        }

        function syncPlanetNamesSet() {
            planetNames.clear();
            planetObjs.forEach((record) => {
                const currentName = getPlanetDisplayName(record);
                if (!currentName) return;
                record.name = currentName;
                planetNames.add(currentName);
            });
        }

        function setPlanetDisplayName(mesh, nextName) {
            const safeName = (nextName || "").trim();
            if (!mesh || !safeName) return;
            mesh.name = safeName;
            mesh.userData = mesh.userData || {};
            mesh.userData.name = safeName;
            const record = getPlanetRecord(mesh);
            if (record) record.name = safeName;
            syncPlanetNamesSet();
        }

        function getDefaultPlanetKey(mesh) {
            return mesh && mesh.userData ? mesh.userData.defaultBodyKey || null : null;
        }

        function isDefaultPlanet(mesh) {
            return Boolean(getDefaultPlanetKey(mesh));
        }

        function getLatestDefaultPlanetRecord(baseName) {
            for (let i = planetObjs.length - 1; i >= 0; i--) {
                const record = planetObjs[i];
                if (!record || !record.mesh) continue;
                if (getDefaultPlanetKey(record.mesh) === baseName) return record;
            }
            return null;
        }

        function getStableDefaultBodyMass(name) {
            const baseMass = realMass[name] || 1;
            return Math.max(0.001, Math.pow(baseMass, DEFAULT_BODY_MASS_EXPONENT) * DEFAULT_BODY_MASS_MULTIPLIER);
        }

        function calculateStableOrbitSpeed(primaryMass, radius) {
            if (!primaryMass || radius <= 0) return 0;
            return Math.sqrt((G * primaryMass) / Math.max(radius, 0.001));
        }

        function buildStableDefaultPlanetState(name, duplicateIndex = 0) {
            const definition = solarSystemDefaults[name];
            if (!definition) {
                return { position: new THREE.Vector3(), velocity: new THREE.Vector3(), angle: 0, referenceRecord: null, referenceName: null };
            }

            const explicitReferenceName = definition.referenceBodyName || null;
            const solarReferenceRecord = !explicitReferenceName && name !== "太阳"
                ? getLatestDefaultPlanetRecord("太阳")
                : null;
            const referenceRecord = explicitReferenceName
                ? getLatestDefaultPlanetRecord(explicitReferenceName)
                : solarReferenceRecord;
            const referenceName = explicitReferenceName || (solarReferenceRecord ? "太阳" : null);
            const referenceMesh = referenceRecord ? referenceRecord.mesh : null;
            const referencePosition = referenceMesh ? referenceMesh.position.clone() : new THREE.Vector3();
            const referenceVelocity = referenceMesh && referenceMesh.userData && referenceMesh.userData.velocity
                ? referenceMesh.userData.velocity.clone()
                : new THREE.Vector3();
            const angle = (typeof definition.phase === "number" ? definition.phase : getDefaultPlanetAngle()) + duplicateIndex * (Math.PI / 5);
            const radius = Math.max(0, Math.abs(definition.distance || 0));

            if (radius <= 0) {
                if (name === "太阳" && duplicateIndex > 0) {
                    const spawnRadius = 36 + duplicateIndex * 18;
                    const spawnSpeed = calculateStableOrbitSpeed(getStableDefaultBodyMass("太阳") * Math.max(1, duplicateIndex), spawnRadius) * 0.38;
                    const spawnPosition = new THREE.Vector3(Math.cos(angle) * spawnRadius, 0, Math.sin(angle) * spawnRadius);
                    const spawnVelocity = new THREE.Vector3(-Math.sin(angle) * spawnSpeed, 0, Math.cos(angle) * spawnSpeed);
                    return { position: spawnPosition, velocity: spawnVelocity, angle, referenceRecord: null, referenceName: null };
                }
                return { position: referencePosition, velocity: referenceVelocity, angle: 0, referenceRecord, referenceName };
            }

            const localPosition = new THREE.Vector3(Math.cos(angle) * radius, 0, Math.sin(angle) * radius);
            const primaryMass = referenceMesh
                ? (referenceMesh.userData.mass || getStableDefaultBodyMass(referenceName))
                : 0;
            const orbitalSpeed = calculateStableOrbitSpeed(primaryMass, radius);
            const localVelocity = new THREE.Vector3(-Math.sin(angle) * orbitalSpeed, 0, Math.cos(angle) * orbitalSpeed);

            return {
                position: referencePosition.add(localPosition),
                velocity: referenceVelocity.add(localVelocity),
                angle,
                referenceRecord,
                referenceName
            };
        }

        function formatNumber(value, digits = 2) {
            const numericValue = Number(value);
            if (!Number.isFinite(numericValue)) return "0";
            return numericValue.toLocaleString("zh-CN", { minimumFractionDigits: 0, maximumFractionDigits: digits });
        }

        function formatVector(vector, digits = 2) {
            if (!vector) return "(0, 0, 0)";
            return `(${formatNumber(vector.x, digits)}, ${formatNumber(vector.y, digits)}, ${formatNumber(vector.z, digits)})`;
        }

        function getPlanetVisualRadius(mesh) {
            const baseRadius = mesh && mesh.geometry && mesh.geometry.parameters && Number.isFinite(mesh.geometry.parameters.radius)
                ? mesh.geometry.parameters.radius
                : 0;
            const scaleX = mesh && mesh.scale && Number.isFinite(mesh.scale.x) ? mesh.scale.x : 1;
            return Math.max(0, baseRadius * scaleX);
        }

        function formatDynamicNumber(value, digits = 4) {
            const numericValue = Number(value);
            if (!Number.isFinite(numericValue)) return "0";
            const absValue = Math.abs(numericValue);
            if (absValue === 0) return "0";
            if (absValue >= 1000000 || absValue < Math.pow(10, -digits)) {
                return numericValue.toExponential(Math.max(1, digits - 1));
            }
            return formatNumber(numericValue, digits);
        }

        function formatDynamicVector(vector, digits = 4) {
            if (!vector) return "(0, 0, 0)";
            return `(${formatDynamicNumber(vector.x, digits)}, ${formatDynamicNumber(vector.y, digits)}, ${formatDynamicNumber(vector.z, digits)})`;
        }

        function calculatePlanetForces() {
            return planetObjs.map(({ mesh }, index) => {
                const result = new THREE.Vector3();
                const sourceMass = mesh && mesh.userData ? mesh.userData.mass : 1;
                const safeSourceMass = Number.isFinite(sourceMass) && sourceMass > 0 ? sourceMass : 1;
                for (let otherIndex = 0; otherIndex < planetObjs.length; otherIndex++) {
                    if (otherIndex === index) continue;
                    const otherMesh = planetObjs[otherIndex].mesh;
                    if (!otherMesh) continue;
                    const targetMass = otherMesh.userData ? otherMesh.userData.mass : 1;
                    const safeTargetMass = Number.isFinite(targetMass) && targetMass > 0 ? targetMass : 1;
                    const offset = new THREE.Vector3().subVectors(otherMesh.position, mesh.position);
                    const distance = offset.length();
                    if (distance < 1e-2) continue;
                    const magnitude = G * safeSourceMass * safeTargetMass / (distance * distance);
                    result.add(offset.normalize().multiplyScalar(magnitude));
                }
                return result;
            });
        }

        function syncPlanetForceState(forces = calculatePlanetForces()) {
            planetObjs.forEach(({ mesh }, index) => {
                if (!mesh) return;
                mesh.userData = mesh.userData || {};
                const safeMass = Math.max(Math.abs(mesh.userData.mass || 1), 0.000001);
                const currentForce = forces[index] || new THREE.Vector3();
                if (!mesh.userData.currentForce) mesh.userData.currentForce = new THREE.Vector3();
                if (!mesh.userData.currentAcceleration) mesh.userData.currentAcceleration = new THREE.Vector3();
                mesh.userData.currentForce.copy(currentForce);
                mesh.userData.currentAcceleration.copy(currentForce).divideScalar(safeMass);
            });
            return forces;
        }

        function escapeHtml(value) {
            return String(value ?? "").replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char] || char));
        }

        function toHexColor(value, fallback = "#ffffff") {
            try {
                if (value && value.isColor) return `#${value.getHexString()}`;
                if (typeof value === "number" && Number.isFinite(value)) return `#${value.toString(16).padStart(6, "0")}`;
                if (typeof value === "string" && value.trim()) return `#${new THREE.Color(value).getHexString()}`;
            } catch (error) {
                console.warn("颜色转换失败:", error);
            }
            return fallback;
        }

        function getPlanetColorHex(mesh) {
            if (mesh && mesh.userData && mesh.userData.originalColor) return toHexColor(mesh.userData.originalColor);
            if (mesh && mesh.material && mesh.material.color) return toHexColor(mesh.material.color);
            return "#ffffff";
        }

        function buildParameterRows(rows) {
            return rows.map(({ label, value }) => `
                <div class="planet-parameter-row">
                    <span>${escapeHtml(label)}</span>
                    <strong>${escapeHtml(value)}</strong>
                </div>
            `).join("");
        }

        function ensurePlanetInfoPanel() {
            if (planetInfoPanelElements) return planetInfoPanelElements;
            const panel = document.createElement("aside");
            panel.id = "planet-parameter-panel";
            panel.innerHTML = `
                <div class="planet-parameter-panel__header">
                    <div>
                        <p class="planet-parameter-panel__eyebrow">Body Parameters</p>
                        <h3 class="planet-parameter-panel__title"></h3>
                        <p class="planet-parameter-panel__subtitle"></p>
                    </div>
                </div>
                <div class="planet-parameter-panel__section">
                    <div class="planet-parameter-panel__section-title">当前参数</div>
                    <div class="planet-parameter-panel__grid planet-parameter-panel__current"></div>
                </div>
                <div class="planet-parameter-panel__section planet-parameter-panel__default-section">
                    <div class="planet-parameter-panel__section-title">默认参数</div>
                    <div class="planet-parameter-panel__grid planet-parameter-panel__default"></div>
                </div>
                <p class="planet-parameter-panel__description"></p>
                <div class="planet-parameter-panel__footer">
                    <span class="planet-parameter-panel__hint">单击名称聚焦，双击名称查看参数</span>
                    <button type="button" class="planet-parameter-panel__edit">编辑参数</button>
                </div>
            `;
            document.body.appendChild(panel);
            planetInfoPanelElements = {
                root: panel,
                title: panel.querySelector(".planet-parameter-panel__title"),
                subtitle: panel.querySelector(".planet-parameter-panel__subtitle"),
                current: panel.querySelector(".planet-parameter-panel__current"),
                defaultSection: panel.querySelector(".planet-parameter-panel__default-section"),
                defaults: panel.querySelector(".planet-parameter-panel__default"),
                description: panel.querySelector(".planet-parameter-panel__description"),
                close: panel.querySelector(".planet-parameter-panel__close"),
                edit: panel.querySelector(".planet-parameter-panel__edit")
            };
            planetInfoPanelElements.edit.addEventListener("click", () => {
                if (!activePlanetInfoMesh || isDefaultPlanet(activePlanetInfoMesh)) return;
                openEditDialog(activePlanetInfoMesh, getPlanetDisplayName(activePlanetInfoMesh));
            });
            return planetInfoPanelElements;
        }

        function buildPlanetCurrentRows(mesh, currentName, defaultKey) {
            const velocity = mesh.userData && mesh.userData.velocity ? mesh.userData.velocity : new THREE.Vector3(0, 0, 0);
            const currentForce = mesh.userData && mesh.userData.currentForce ? mesh.userData.currentForce : new THREE.Vector3(0, 0, 0);
            const currentAcceleration = mesh.userData && mesh.userData.currentAcceleration ? mesh.userData.currentAcceleration : new THREE.Vector3(0, 0, 0);
            const orbitalRadius = mesh.userData && Number.isFinite(mesh.userData.distance) ? mesh.userData.distance : mesh.position.length();
            const visualRadius = getPlanetVisualRadius(mesh);
            const referenceBodyName = mesh.userData && mesh.userData.referenceBodyName ? mesh.userData.referenceBodyName : "\u65e0";
            return [
                { label: "\u5f53\u524d\u540d\u79f0", value: currentName },
                { label: "\u6765\u6e90", value: defaultKey ? "\u9ed8\u8ba4\u661f\u4f53" : "\u81ea\u5b9a\u4e49\u661f\u4f53" },
                { label: "\u53c2\u8003\u5929\u4f53", value: referenceBodyName },
                { label: "\u5b9e\u9a8c\u5ba4\u663e\u793a\u534a\u5f84", value: `${formatDynamicNumber(visualRadius, 3)} \u5355\u4f4d` },
                { label: "\u5b9e\u9a8c\u5ba4\u8f68\u9053\u534a\u5f84", value: `${formatDynamicNumber(orbitalRadius, 3)} \u5355\u4f4d` },
                { label: "\u5f53\u524d\u8ddd\u539f\u70b9\u8ddd\u79bb", value: `${formatDynamicNumber(mesh.position.length(), 3)} \u5355\u4f4d` },
                { label: "\u5f53\u524d\u4f4d\u7f6e", value: formatDynamicVector(mesh.position, 2) },
                { label: "\u5f53\u524d\u901f\u5ea6", value: formatDynamicVector(velocity, 4) },
                { label: "\u901f\u5ea6\u6807\u91cf", value: `${formatDynamicNumber(velocity.length(), 4)} \u5355\u4f4d/\u6b65` },
                { label: "\u5f53\u524d\u5408\u529b", value: formatDynamicVector(currentForce, 4) },
                { label: "\u5408\u529b\u6807\u91cf", value: `${formatDynamicNumber(currentForce.length(), 4)} \u6a21\u62df\u5355\u4f4d` },
                { label: "\u5f53\u524d\u52a0\u901f\u5ea6", value: formatDynamicVector(currentAcceleration, 4) },
                { label: "\u52a0\u901f\u5ea6\u6807\u91cf", value: `${formatDynamicNumber(currentAcceleration.length(), 4)} \u6a21\u62df\u5355\u4f4d` },
                { label: "\u8d28\u91cf", value: `${formatDynamicNumber(mesh.userData && mesh.userData.mass ? mesh.userData.mass : 1, 4)} x10^24 kg` },
                { label: "\u989c\u8272", value: getPlanetColorHex(mesh) }
            ];
        }

        function buildDefaultPlanetRows(defaultKey, defaultDef) {
            return [
                { label: "\u9884\u8bbe\u540d\u79f0", value: defaultKey },
                { label: "\u9ed8\u8ba4\u663e\u793a\u534a\u5f84", value: `${formatDynamicNumber(defaultDef.size, 3)} \u5355\u4f4d` },
                { label: "\u9ed8\u8ba4\u8f68\u9053\u534a\u5f84", value: `${formatDynamicNumber(defaultDef.distance, 3)} \u5355\u4f4d` },
                { label: "\u771f\u5b9e\u534a\u5f84", value: realRadius[defaultKey] ? `${formatDynamicNumber(realRadius[defaultKey], 1)} km` : "\u65e0" },
                { label: "\u771f\u5b9e\u8f68\u9053\u8ddd\u79bb", value: realDistance[defaultKey] != null ? `${formatDynamicNumber(realDistance[defaultKey], 3)} \u767e\u4e07\u516c\u91cc` : "0 \u767e\u4e07\u516c\u91cc" },
                { label: "\u771f\u5b9e\u53c2\u8003\u8d28\u91cf", value: realMass[defaultKey] ? `${formatDynamicNumber(realMass[defaultKey], 4)} x10^24 kg` : "\u65e0" },
                { label: "\u9ed8\u8ba4\u989c\u8272", value: toHexColor(defaultDef.color) }
            ];
        }

        function getForceArrowLength(forceMagnitude, mesh) {
            if (!Number.isFinite(forceMagnitude) || forceMagnitude <= FORCE_VECTOR_MIN_MAGNITUDE) return 0;
            const visualRadius = getPlanetVisualRadius(mesh);
            const scaledLength = Math.log10(forceMagnitude + 1) * 18 + visualRadius * 0.9;
            return THREE.MathUtils.clamp(Math.max(visualRadius * 1.2, scaledLength), FORCE_VECTOR_MIN_LENGTH, FORCE_VECTOR_MAX_LENGTH);
        }

        function applyForceArrowStyle(arrow) {
            if (!arrow) return;
            [arrow.line, arrow.cone].forEach((part, index) => {
                if (!part || !part.material) return;
                part.material.transparent = true;
                part.material.opacity = 0.92;
                part.material.depthTest = false;
                part.material.depthWrite = false;
                part.material.toneMapped = false;
                part.renderOrder = 980 + index;
                part.frustumCulled = false;
            });
            arrow.renderOrder = 980;
            arrow.frustumCulled = false;
        }

        function ensurePlanetForceArrow(mesh) {
            let arrow = planetForceArrows.get(mesh.uuid);
            if (arrow) return arrow;
            arrow = new THREE.ArrowHelper(
                new THREE.Vector3(1, 0, 0),
                mesh.position.clone(),
                FORCE_VECTOR_MIN_LENGTH,
                FORCE_VECTOR_COLOR,
                7,
                3.2
            );
            applyForceArrowStyle(arrow);
            scene.add(arrow);
            planetForceArrows.set(mesh.uuid, arrow);
            return arrow;
        }

        function removePlanetForceArrow(target) {
            const uuid = typeof target === "string" ? target : target && target.uuid;
            if (!uuid) return;
            const arrow = planetForceArrows.get(uuid);
            if (!arrow) return;
            scene.remove(arrow);
            if (arrow.line) {
                if (arrow.line.geometry) arrow.line.geometry.dispose();
                if (arrow.line.material) arrow.line.material.dispose();
            }
            if (arrow.cone) {
                if (arrow.cone.geometry) arrow.cone.geometry.dispose();
                if (arrow.cone.material) arrow.cone.material.dispose();
            }
            planetForceArrows.delete(uuid);
        }

        function updateForceVisuals() {
            const activeUuids = new Set();
            planetObjs.forEach(({ mesh }) => {
                if (!mesh) return;
                activeUuids.add(mesh.uuid);
                const currentForce = mesh.userData && mesh.userData.currentForce ? mesh.userData.currentForce : null;
                const forceMagnitude = currentForce ? currentForce.length() : 0;
                const existingArrow = planetForceArrows.get(mesh.uuid);
                if (!currentForce || !Number.isFinite(forceMagnitude) || forceMagnitude <= FORCE_VECTOR_MIN_MAGNITUDE) {
                    if (existingArrow) existingArrow.visible = false;
                    return;
                }
                const direction = currentForce.clone().normalize();
                const visualRadius = getPlanetVisualRadius(mesh);
                const length = getForceArrowLength(forceMagnitude, mesh);
                const origin = mesh.position.clone().add(direction.clone().multiplyScalar(Math.max(visualRadius * 0.95, 0.8)));
                const arrow = existingArrow || ensurePlanetForceArrow(mesh);
                arrow.position.copy(origin);
                arrow.setDirection(direction);
                arrow.setLength(
                    length,
                    Math.max(4.5, Math.min(13, length * 0.28)),
                    Math.max(2.8, Math.min(8, length * 0.18))
                );
                arrow.setColor(new THREE.Color(FORCE_VECTOR_COLOR));
                arrow.visible = true;
            });

            for (const uuid of Array.from(planetForceArrows.keys())) {
                if (!activeUuids.has(uuid)) {
                    removePlanetForceArrow(uuid);
                }
            }
        }

        function closePlanetInfoPanel() {
            activePlanetInfoMesh = null;
            ensurePlanetInfoPanel().root.classList.remove("is-visible");
        }

        function refreshPlanetInfoPanel() {
            if (!activePlanetInfoMesh) return;
            const mesh = activePlanetInfoMesh;
            const stillExists = planetObjs.some((planet) => planet.mesh === mesh) && scene.children.includes(mesh);
            if (!stillExists) {
                closePlanetInfoPanel();
                return;
            }
            const panel = ensurePlanetInfoPanel();
            const currentName = getPlanetDisplayName(mesh);
            const defaultKey = getDefaultPlanetKey(mesh);
            const defaultDef = defaultKey ? solarSystemDefaults[defaultKey] : null;
            panel.title.textContent = currentName || "\u672a\u547d\u540d\u661f\u4f53";
            panel.subtitle.textContent = defaultKey
                ? `\u5f53\u524d\u573a\u666f\u540d\u79f0\uff1a${currentName} | \u9884\u8bbe\u6765\u6e90\uff1a${defaultKey} | \u5b9e\u65f6\u66f4\u65b0`
                : "\u81ea\u5b9a\u4e49\u661f\u4f53\u53c2\u6570 | \u5b9e\u65f6\u66f4\u65b0";
            panel.current.innerHTML = buildParameterRows(buildPlanetCurrentRows(mesh, currentName, defaultKey));
            if (defaultDef) {
                panel.defaults.innerHTML = buildParameterRows(buildDefaultPlanetRows(defaultKey, defaultDef));
                panel.defaultSection.style.display = "block";
                panel.description.textContent = `${solarSystemDescriptions[defaultKey] || "\u9ed8\u8ba4\u661f\u4f53\u53c2\u6570"} \u5f53\u524d\u53d7\u529b\u3001\u901f\u5ea6\u3001\u4f4d\u7f6e\u4e0e\u52a0\u901f\u5ea6\u4f1a\u5b9e\u65f6\u5237\u65b0\u3002`;
            } else {
                panel.defaults.innerHTML = "";
                panel.defaultSection.style.display = "none";
                panel.description.textContent = "\u8be5\u661f\u4f53\u7531\u5b9e\u9a8c\u5ba4\u81ea\u5b9a\u4e49\u521b\u5efa\uff0c\u53d7\u529b\u3001\u901f\u5ea6\u3001\u4f4d\u7f6e\u4e0e\u52a0\u901f\u5ea6\u4f1a\u968f\u6f14\u5316\u5b9e\u65f6\u5237\u65b0\u3002";
            }
            panel.edit.style.display = defaultKey ? "none" : "inline-flex";
            panel.root.classList.add("is-visible");
        }

        function openPlanetInfoPanel(mesh) {
            if (!mesh) return;
            activePlanetInfoMesh = mesh;
            syncPlanetForceState();
            refreshPlanetInfoPanel();
        }
        // fadeOutTrail：轨迹线淡出动画（来自zdsj(2)(3).html）
        function fadeOutTrail(traj, duration = 1000) {
            const material = traj.line.material;
            const startTime = performance.now();
            function animateFade() {
                const now = performance.now();
                const elapsed = now - startTime;
                const t = Math.min(elapsed / duration, 1);
                material.opacity = 1 - t;
                if (t < 1) {
                    requestAnimationFrame(animateFade);
                } else {
                    scene.remove(traj.line);
                    markSceneSortDirty();
                    trajectoryLines.forEach((v, k) => {
                        if (v === traj) trajectoryLines.delete(k);
                    });
                }
            }
            animateFade();
        }

        function getDynamicTrailRecordInterval() {
            const bodyCount = planetObjs.length;
            if (bodyCount > 26) return 4;
            if (bodyCount > 16) return 3;
            if (bodyCount > 10) return 2;
            return 1;
        }

        function appendTrajectoryPoint(traj, meshPosition, baseColor) {
            if (!traj || !traj.positions || !traj.colors || !meshPosition) return;
            const cap = maxTrajectoryPoints;
            let pointCount = traj.count || 0;
            if (pointCount >= cap) {
                traj.positions.copyWithin(0, 3);
                traj.colors.copyWithin(0, 3);
                pointCount = cap - 1;
            }

            const writeIndex = pointCount * 3;
            const colorScale = pointCount > 0 ? (0.55 + 0.35 * (pointCount / cap)) : 0.55;
            traj.positions[writeIndex] = meshPosition.x;
            traj.positions[writeIndex + 1] = meshPosition.y;
            traj.positions[writeIndex + 2] = meshPosition.z;
            traj.colors[writeIndex] = baseColor.r * colorScale;
            traj.colors[writeIndex + 1] = baseColor.g * colorScale;
            traj.colors[writeIndex + 2] = baseColor.b * colorScale;

            traj.count = pointCount + 1;
            traj.geometry.setDrawRange(0, traj.count);
            traj.geometry.attributes.position.needsUpdate = true;
            traj.geometry.attributes.color.needsUpdate = true;
        }

        // 动力学模拟主循环
        function simulatePhysics(dt) {
            const bodyCount = planetObjs.length;
            const forces = Array.from({ length: bodyCount }, () => new THREE.Vector3());
            const pairOffset = new THREE.Vector3();

            // 1. 计算所有星体的合力（对称求解，避免重复计算）
            for (let i = 0; i < bodyCount; i++) {
                const pi = planetObjs[i].mesh;
                const mi = Math.max(Math.abs(pi.userData.mass || 1), 0.000001);
                for (let j = i + 1; j < bodyCount; j++) {
                    const pj = planetObjs[j].mesh;
                    const mj = Math.max(Math.abs(pj.userData.mass || 1), 0.000001);
                    pairOffset.subVectors(pj.position, pi.position);
                    const distSq = pairOffset.lengthSq();
                    if (distSq < 1e-4) continue;
                    const dist = Math.sqrt(distSq);
                    const forceScalar = G * mi * mj / distSq;
                    const invDist = 1 / dist;
                    const fx = pairOffset.x * invDist * forceScalar;
                    const fy = pairOffset.y * invDist * forceScalar;
                    const fz = pairOffset.z * invDist * forceScalar;
                    forces[i].x += fx;
                    forces[i].y += fy;
                    forces[i].z += fz;
                    forces[j].x -= fx;
                    forces[j].y -= fy;
                    forces[j].z -= fz;
                }
            }

            const trailInterval = getDynamicTrailRecordInterval();
            const shouldRecordTrail = (physicsTickCounter++ % trailInterval) === 0;
            const stepCount = bodyCount > 24 ? 2 : bodyCount > 14 ? 3 : 4;

            // 2. 更新速度和位置（分步进行，每步都检查碰撞）
            for (let i = 0; i < bodyCount; i++) {
                const record = planetObjs[i];
                if (!record || !record.mesh) continue;
                const mesh = record.mesh;
                if (!mesh.userData.velocity) mesh.userData.velocity = new THREE.Vector3(0, 0, 0);
                const safeMass = Math.max(Math.abs(mesh.userData.mass || 1), 0.000001);
                const force = forces[i] || new THREE.Vector3();
                const accScale = dt / safeMass;
                mesh.userData.velocity.x += force.x * accScale;
                mesh.userData.velocity.y += force.y * accScale;
                mesh.userData.velocity.z += force.z * accScale;
                mesh.userData.currentForce = force.clone();
                mesh.userData.currentAcceleration = force.clone().divideScalar(safeMass);

                const stepVelocity = mesh.userData.velocity.clone().multiplyScalar(dt / stepCount);
                for (let step = 0; step < stepCount; step++) {
                    mesh.position.add(stepVelocity);
                    if (mesh && scene.children.includes(mesh)) {
                        const currentIndex = planetObjs.findIndex((p) => p.mesh === mesh);
                        if (currentIndex !== -1) {
                            checkCollisionsInStep(mesh, currentIndex);
                        }
                    }
                }

                if (showTrajectories && shouldRecordTrail) {
                    let traj = trajectoryLines.get(mesh.uuid);
                    if (!traj) {
                        const geometry = new THREE.BufferGeometry();
                        const positions = new Float32Array(maxTrajectoryPoints * 3);
                        const colors = new Float32Array(maxTrajectoryPoints * 3);
                        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
                        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
                        const material = new THREE.LineBasicMaterial({
                            vertexColors: true,
                            linewidth: 3,
                            transparent: true,
                            opacity: 0.96
                        });
                        const line = new THREE.Line(geometry, material);
                        scene.add(line);
                        markSceneSortDirty();
                        traj = { geometry, line, positions, colors, count: 0 };
                        trajectoryLines.set(mesh.uuid, traj);
                    }
                    const baseColor = mesh.material && mesh.material.color ? mesh.material.color : new THREE.Color(0xffffff);
                    appendTrajectoryPoint(traj, mesh.position, baseColor);
                }
            }
            isForceStateDirty = true;
            // 3. 检测碰撞并合并（改进的高速碰撞检测）
            const mergePairs = [];
            const mergedIndices = new Set();
            
            // 使用更精确的碰撞检测，考虑速度
            for (let i = 0; i < planetObjs.length; i++) {
                if (mergedIndices.has(i)) continue;
                const pi = planetObjs[i].mesh;
                const vi = pi.userData.velocity || new THREE.Vector3();
                
                // 真实半径（考虑缩放）
                let ri = 1;
                if (pi.geometry && pi.geometry.parameters && typeof pi.geometry.parameters.radius === 'number') {
                    ri = pi.geometry.parameters.radius * (pi.scale ? pi.scale.x : 1);
                }
                
                for (let j = i + 1; j < planetObjs.length; j++) {
                    if (mergedIndices.has(j)) continue;
                    const pj = planetObjs[j].mesh;
                    const vj = pj.userData.velocity || new THREE.Vector3();
                    
                    let rj = 1;
                    if (pj.geometry && pj.geometry.parameters && typeof pj.geometry.parameters.radius === 'number') {
                        rj = pj.geometry.parameters.radius * (pj.scale ? pj.scale.x : 1);
                    }
                    
                    const dist = pi.position.distanceTo(pj.position);
                    const combinedRadius = ri + rj;
                    
                    // 改进的碰撞检测：考虑相对速度和预测碰撞
                    const relativeVelocity = vi.clone().sub(vj);
                    const relativeSpeed = relativeVelocity.length();
                    
                    // 计算相对位置向量
                    const relativePosition = pj.position.clone().sub(pi.position);
                    
                    // 预测碰撞：检查下一帧是否会发生碰撞
                    const timeStep = 0.5 * timeScale;
                    const predictedPosition1 = pi.position.clone().add(vi.clone().multiplyScalar(timeStep));
                    const predictedPosition2 = pj.position.clone().add(vj.clone().multiplyScalar(timeStep));
                    const predictedDist = predictedPosition1.distanceTo(predictedPosition2);
                    
                    // 动态碰撞阈值：基于速度和时间步长
                    const speedFactor = Math.min(relativeSpeed * timeStep * 2, 50); // 增加速度因子
                    const collisionThreshold = combinedRadius + speedFactor;
                    
                    // 检查当前距离或预测距离是否满足碰撞条件
                    if (dist < collisionThreshold || predictedDist < collisionThreshold) {
                        mergePairs.push([i, j]);
                        mergedIndices.add(i);
                        mergedIndices.add(j);
                        break; // i只合并一次
                    }
                }
            }
            // 4. 统一处理所有合并
            const newPlanets = [];
            let starPlusIdx = 1;
            function getNextStarPlusName() {
                while (planetNames.has('star_plus_' + starPlusIdx)) starPlusIdx++;
                return 'star_plus_' + (starPlusIdx++);
            }
            for (const [i, j] of mergePairs) {
                const pi = planetObjs[i].mesh;
                const pj = planetObjs[j].mesh;
                const mi = pi.userData.mass || 1;
                const mj = pj.userData.mass || 1;
                const vi = pi.userData.velocity || new THREE.Vector3();
                const vj = pj.userData.velocity || new THREE.Vector3();
                const newMass = mi + mj;
                const newVel = vi.clone().multiplyScalar(mi).add(vj.clone().multiplyScalar(mj)).divideScalar(newMass);
                // 体积合并，半径按体积和开立方
                const si = pi.geometry.parameters.radius * (pi.scale ? pi.scale.x : 1) || 1;
                const sj = pj.geometry.parameters.radius * (pj.scale ? pj.scale.x : 1) || 1;
                const newSize = Math.cbrt(si*si*si + sj*sj*sj);
                // 颜色混合
                const ci = new THREE.Color(pi.material.color);
                const cj = new THREE.Color(pj.material.color);
                const newColor = ci.lerp(cj, mj / newMass);
                // 自动命名合并星体
                let mergedName = getNextStarPlusName();
                newPlanets.push({
                    name: mergedName,
                    size: newSize,
                    color: '#' + newColor.getHexString(),
                    mass: newMass,
                    velocity: newVel,
                    position: pi.position.clone().add(pj.position).multiplyScalar(0.5)
                });
            }
            // 5. 统一移除被合并的星体
            const indices = Array.from(mergedIndices).sort((a,b)=>b-a);
            for (const idx of indices) {
                // 开始轨迹线消失动画
                if (trajectoryLines.has(planetObjs[idx].mesh.uuid)) {
                    fadeOutTrail(trajectoryLines.get(planetObjs[idx].mesh.uuid));
                }
                
                scene.remove(planetObjs[idx].mesh);
                removePlanetLabel(planetObjs[idx].mesh);
                planetObjs.splice(idx, 1);
            }
            syncPlanetNamesSet();
            // 6. 统一添加新星体
            for (const np of newPlanets) {
                addPlanet(np.name, 0, np.size, np.color, np.mass, false, np.velocity);
                // 设置新星体位置
                planetObjs[planetObjs.length-1].mesh.position.copy(np.position);
            }
            if (indices.length > 0) updatePlanetList();
        }

        function setupSidebarWheelEffect() {
            const panel = document.getElementById("sidebar-panel");
            const scroller = panel?.querySelector(".sidebar-content");
            if (!panel || !scroller) return;

            let wheelTimer = 0;
            const markScrolling = () => {
                panel.classList.add("is-wheel-scrolling");
                window.clearTimeout(wheelTimer);
                wheelTimer = window.setTimeout(() => {
                    panel.classList.remove("is-wheel-scrolling");
                }, 520);
            };

            scroller.addEventListener("wheel", markScrolling, { passive: true });
            scroller.addEventListener("scroll", markScrolling, { passive: true });
        }
        // 初始化函数
        function init() {
            window.addEventListener("resize", onWindowResize);
            renderer.domElement.addEventListener("pointerdown", onPointerDown, true);
            renderer.domElement.addEventListener("pointermove", onPointerMove);
            renderer.domElement.addEventListener("pointerup", onPointerUp);
            renderer.domElement.addEventListener("pointerleave", onPointerUp);
            renderer.domElement.addEventListener("pointercancel", onPointerUp);
            window.addEventListener("pointermove", onPointerMove, true);
            window.addEventListener("pointerup", onPointerUp, true);
            window.addEventListener("pointercancel", onPointerUp, true);

            document.getElementById("add-custom-planet-btn").addEventListener("click", openCustomPlanetDialog);
            document.getElementById("add-default-planet-btn").addEventListener("click", openDefaultPlanetDialog);
            document.getElementById("simulate-btn").addEventListener("click", toggleSimulation);
            setupSidebarWheelEffect();
            document.getElementById("apply-radius-scale-btn").addEventListener("click", applyRadiusScale);
            document.getElementById("toggle-trajectories-btn").addEventListener("click", toggleTrajectories);

            const toggleNamesBtn = document.getElementById("toggle-names-btn");
            if (toggleNamesBtn) {
                toggleNamesBtn.textContent = showPlanetNames ? "隐藏星体名称" : "显示星体名称";
            }

            updatePlanetList();
            animate();
        }

        // 窗口大小调整
        function onWindowResize() {
            const width = Math.max(1, container.clientWidth || window.innerWidth);
            const height = Math.max(1, container.clientHeight || window.innerHeight);
            camera.aspect = width / height;
            camera.updateProjectionMatrix();
            renderer.setSize(width, height);
            resizeOrientationGizmo();
            updateTrajectoryLineWidth();
        }
        
        // 更新轨迹线粗细
        function updateTrajectoryLineWidth() {
            const distance = camera.position.distanceTo(controls.target);
            const lineWidth = Math.max(1, Math.min(4, 2.5 * (distance / 200))); // 优化粗细范围
            
            trajectoryLines.forEach(traj => {
                if (traj.line.material) {
                    traj.line.material.linewidth = lineWidth;
                }
            });
        }
        
        // 分步碰撞检测函数
        function checkCollisionsInStep(mesh, meshIndex) {
            if (!mesh || meshIndex < 0 || meshIndex >= planetObjs.length) return;
            
            // 验证mesh是否仍然存在于数组中
            if (planetObjs[meshIndex].mesh !== mesh) return;
            
            const ri = mesh.geometry && mesh.geometry.parameters && typeof mesh.geometry.parameters.radius === 'number' 
                ? mesh.geometry.parameters.radius * (mesh.scale ? mesh.scale.x : 1) : 1;
            
            for (let j = 0; j < planetObjs.length; j++) {
                if (j === meshIndex) continue;
                
                const otherMesh = planetObjs[j].mesh;
                if (!otherMesh) continue;
                
                const rj = otherMesh.geometry && otherMesh.geometry.parameters && typeof otherMesh.geometry.parameters.radius === 'number'
                    ? otherMesh.geometry.parameters.radius * (otherMesh.scale ? otherMesh.scale.x : 1) : 1;
                
                const dist = mesh.position.distanceTo(otherMesh.position);
                const combinedRadius = ri + rj;
                
                // 更宽松的碰撞检测
                if (dist < combinedRadius * 1.5) {
                    // 立即合并这两个星体
                    mergePlanets(meshIndex, j);
                    return; // 退出检测，因为meshIndex可能已经改变
                }
            }
        }
        
        // 合并星体函数
        function mergePlanets(index1, index2) {
            if (index1 >= planetObjs.length || index2 >= planetObjs.length || index1 === index2) return;
            
            const pi = planetObjs[index1].mesh;
            const pj = planetObjs[index2].mesh;
            
            if (!pi || !pj) return;
            
            const mi = pi.userData.mass || 1;
            const mj = pj.userData.mass || 1;
            const vi = pi.userData.velocity || new THREE.Vector3();
            const vj = pj.userData.velocity || new THREE.Vector3();
            
            const newMass = mi + mj;
            const newVel = vi.clone().multiplyScalar(mi).add(vj.clone().multiplyScalar(mj)).divideScalar(newMass);
            
            // 体积合并，半径按体积和开立方
            const si = pi.geometry.parameters.radius * (pi.scale ? pi.scale.x : 1) || 1;
            const sj = pj.geometry.parameters.radius * (pj.scale ? pj.scale.x : 1) || 1;
            const newSize = Math.cbrt(si*si*si + sj*sj*sj);
            
            // 颜色混合
            const ci = new THREE.Color(pi.material.color);
            const cj = new THREE.Color(pj.material.color);
            const newColor = ci.lerp(cj, mj / newMass);
            
            // 自动命名合并星体
            let starPlusIdx = 1;
            function getNextStarPlusName() {
                while (planetNames.has('star_plus_' + starPlusIdx)) starPlusIdx++;
                return 'star_plus_' + (starPlusIdx++);
            }
            const mergedName = getNextStarPlusName();
            
            // 创建新星体
            const newPlanet = {
                name: mergedName,
                size: newSize,
                color: '#' + newColor.getHexString(),
                mass: newMass,
                velocity: newVel,
                position: pi.position.clone().add(pj.position).multiplyScalar(0.5)
            };
            
            // 移除旧星体
            const indices = [index1, index2].sort((a, b) => b - a);
            for (const idx of indices) {
                if (trajectoryLines.has(planetObjs[idx].mesh.uuid)) {
                    fadeOutTrail(trajectoryLines.get(planetObjs[idx].mesh.uuid));
                }
                scene.remove(planetObjs[idx].mesh);
                removePlanetLabel(planetObjs[idx].mesh);
                planetObjs.splice(idx, 1);
            }
            syncPlanetNamesSet();
            
            // 直接创建新星体，避免位置被重置
            const geometry = new THREE.SphereGeometry(newPlanet.size * radiusScale, 32, 32);
            const material = new THREE.MeshStandardMaterial({ 
                color: newPlanet.color,
                roughness: 0.7,
                metalness: 0.3
            });
            const mesh = new THREE.Mesh(geometry, material);
            mesh.castShadow = true;
            mesh.receiveShadow = true;
            
            mesh.userData = {
                distance: 0,
                angle: 0,
                elevation: 0,
                isSolar: false,
                defaultBodyKey: null,
                name: newPlanet.name,
                originalColor: newPlanet.color,
                mass: newPlanet.mass
            };
            mesh.name = newPlanet.name;
            
            // 设置正确的位置和速度
            mesh.position.copy(newPlanet.position);
            mesh.userData.velocity = newPlanet.velocity;
            
            scene.add(mesh);
            planetObjs.push({ mesh, name: newPlanet.name });
            syncPlanetNamesSet();
            if (showPlanetNames) createPlanetLabel(mesh, newPlanet.name);
            
            updatePlanetList();
        }
        
        // 开始轨迹线消失动画
        function startTrajectoryFadeOut(meshUuid) {
            const traj = trajectoryLines.get(meshUuid);
            if (traj && !traj.fadeOut) {
                traj.fadeOut = {
                    startTime: Date.now()
                };
            }
        }
        
        // 清理已消失的轨迹线
        function cleanupFadedTrajectories() {
            const currentTime = Date.now();
            const toRemove = [];
            
            trajectoryLines.forEach((traj, meshUuid) => {
                if (traj.fadeOut) {
                    const fadeProgress = (currentTime - traj.fadeOut.startTime) / fadeOutDuration;
                    if (fadeProgress >= 1) {
                        toRemove.push(meshUuid);
                    }
                }
                
                // 确保轨迹线始终可见
                if (traj.line && traj.line.material) {
                    traj.line.material.needsUpdate = true;
                    traj.line.material.transparent = true;
                    traj.line.material.depthTest = false;
                    traj.line.material.depthWrite = false;
                    traj.line.material.opacity = 1.2; // 增强发光效果
                    traj.line.material.linewidth = 6; // 确保线条粗细
                    traj.line.renderOrder = 999;
                    traj.line.frustumCulled = false;
                }
            });
            
            toRemove.forEach(meshUuid => {
                const traj = trajectoryLines.get(meshUuid);
                if (traj) {
                    scene.remove(traj.line);
                    markSceneSortDirty();
                    traj.geometry.dispose();
                    traj.line.material.dispose();
                }
                trajectoryLines.delete(meshUuid);
            });
        }
        
        // 轨迹线显示/隐藏切换
        function toggleTrajectories() {
            showTrajectories = !showTrajectories;
            const btn = document.getElementById("toggle-trajectories-btn");
            btn.textContent = showTrajectories ? "隐藏轨迹线" : "显示轨迹线";
            
            trajectoryLines.forEach((traj, meshUuid) => {
                if (showTrajectories) {
                    if (!scene.children.includes(traj.line)) {
                        scene.add(traj.line);
                        markSceneSortDirty();
                    }
                    // 确保轨迹线可见性设置
                    if (traj.line && traj.line.material) {
                        traj.line.material.needsUpdate = true;
                        traj.line.material.transparent = true;
                        traj.line.material.depthTest = false;
                        traj.line.material.depthWrite = false;
                        traj.line.material.opacity = 1.2; // 增强发光效果
                        traj.line.material.linewidth = 6; // 确保线条粗细
                        traj.line.renderOrder = 999;
                        traj.line.frustumCulled = false;
                    }
                } else {
                    if (scene.children.includes(traj.line)) {
                        scene.remove(traj.line);
                        markSceneSortDirty();
                    }
                }
            });
        }
        


        // 应用半径缩放
        function applyRadiusScale() {
            const input = document.getElementById('radius-scale-input');
            let val = parseFloat(input.value);
            if (isNaN(val) || val <= 0) {
                showToast('请输入大于 0 的缩放倍数', 'danger');
                return;
            }
            radiusScale = val;
            showToast(`缩放倍数已设置为 ${val}x`, 'success');
        }

        // 添加自定义星体
        function addCustomPlanet() {
            const nameInput = document.getElementById("custom-planet-name");
            const distanceInput = document.getElementById("custom-planet-distance");
            const sizeInput = document.getElementById("custom-planet-size");
            const massInput = document.getElementById("custom-planet-mass");
            const vxInput = document.getElementById("custom-planet-vx");
            const vyInput = document.getElementById("custom-planet-vy");
            const vzInput = document.getElementById("custom-planet-vz");
            const yInput = document.getElementById("custom-planet-y");
            const elevationInput = document.getElementById("custom-planet-elevation");
            const colorInput = document.getElementById("custom-planet-color");

            let name = nameInput.value.trim();
            if (!name) {
                let idx = 1;
                while (planetNames.has('star_' + idx)) idx++;
                name = 'star_' + idx;
            }
            const distance = parseFloat(distanceInput.value);
            const size = parseFloat(sizeInput.value);
            const mass = parseFloat(massInput.value);
            const vx = parseFloat(vxInput.value);
            const vy = parseFloat(vyInput.value);
            const vz = parseFloat(vzInput.value);
            const y = parseFloat(yInput.value);
            const elevation = parseFloat(elevationInput.value);
            const color = colorInput.value;

            if (planetNames.has(name)) {
                showToast("该星体名称已存在", 'danger');
                return false;
            }
            if (isNaN(distance) || distance < 10 || distance > 8000) {
                showToast("轨道半径请输入 10-8000 之间的数字", 'danger');
                return false;
            }
            if (isNaN(size) || size < 1 || size > 50) {
                showToast("星体大小请输入 1-50 之间的数字", 'danger');
                return false;
            }
            if (isNaN(mass) || mass <= 0) {
                showToast("请输入大于 0 的质量", 'danger');
                return false;
            }
            if ([vx, vy, vz, y, elevation].some(v => isNaN(v))) {
                showToast("所有数值都必须为数字", 'danger');
                return false;
            }

            // 创建3D位置
            const angle = Math.random() * Math.PI * 2;
            const finalY = y !== 0 ? y : distance * elevation;
            const position = new THREE.Vector3(
                distance * Math.cos(angle),
                finalY,
                distance * Math.sin(angle)
            );

            addPlanet(name, distance, size, color, mass, false, new THREE.Vector3(vx, vy, vz));
            
            // 设置3D位置
            const lastPlanet = planetObjs[planetObjs.length - 1];
            if (lastPlanet) {
                lastPlanet.mesh.position.copy(position);
            }
            
            nameInput.value = "";
            distanceInput.value = 100;
            sizeInput.value = 5;
            massInput.value = 1;
            vxInput.value = 0;
            vyInput.value = 0;
            vzInput.value = 0;
            yInput.value = 0;
            elevationInput.value = 0;
            colorInput.value = "#ff9900";
            return true;
        }

        function forEachBodyMaterial(mesh, callback) {
            if (!mesh) return;
            const apply = (material, owner) => {
                if (!material) return;
                if (Array.isArray(material)) {
                    material.forEach((item) => apply(item, owner));
                    return;
                }
                callback(material, owner);
            };
            if (mesh.material) {
                apply(mesh.material, mesh);
            }
            mesh.traverse((child) => {
                if (child !== mesh && child.isMesh && child.material) {
                    apply(child.material, child);
                }
            });
        }

        function ensureMaterialState(material) {
            if (!material.userData) material.userData = {};
            if (typeof material.userData.baseOpacity !== "number") {
                material.userData.baseOpacity = typeof material.opacity === "number" ? material.opacity : 1;
            }
        }

        function setBodyOpacity(mesh, opacityFactor) {
            forEachBodyMaterial(mesh, (material, owner) => {
                ensureMaterialState(material);
                const isShell = owner === mesh;
                const baseOpacity = typeof material.userData.baseOpacity === "number" ? material.userData.baseOpacity : 1;
                const finalOpacity = isShell && mesh.userData && mesh.userData.isPresetModel
                    ? baseOpacity
                    : Math.max(0.08, baseOpacity * opacityFactor);
                material.transparent = finalOpacity < 0.999;
                material.opacity = finalOpacity;
                material.needsUpdate = true;
            });
        }

        function setBodyEmissive(mesh, hexColor, intensity) {
            forEachBodyMaterial(mesh, (material) => {
                if ("emissive" in material && material.emissive) {
                    material.emissive.setHex(hexColor);
                    material.emissiveIntensity = intensity;
                    material.needsUpdate = true;
                }
            });
        }


        function getDefaultPlanetAngle() {
            const orbitingCount = Math.max(planetObjs.filter(({ mesh }) => mesh.userData && mesh.userData.distance > 0).length - 1, 0);
            return (orbitingCount % 12) * (Math.PI / 6) - Math.PI / 3;
        }

        function attachPresetModel(shellMesh, name) {
            const url = solarSystemModels[name];
            if (!url) return;
            loader.load(url, (gltf) => {
                const visualRoot = gltf.scene;
                const bounds = new THREE.Box3().setFromObject(visualRoot);
                const center = bounds.getCenter(new THREE.Vector3());
                const size = bounds.getSize(new THREE.Vector3());
                const maxDimension = Math.max(size.x, size.y, size.z, 0.0001);
                const shellRadius = getPlanetVisualRadius(shellMesh);
                const targetDiameter = Math.max(shellRadius * 2, 0.6);
                const visualScale = targetDiameter / maxDimension;

                visualRoot.position.sub(center);
                visualRoot.scale.setScalar(visualScale);
                visualRoot.userData.isPresetVisual = true;
                visualRoot.userData.shellUuid = shellMesh.uuid;

                visualRoot.traverse((child) => {
                    if (child.isMesh) {
                        child.castShadow = true;
                        child.receiveShadow = true;
                    }
                });

                forEachBodyMaterial(visualRoot, (material) => {
                    ensureMaterialState(material);
                    material.transparent = true;
                    material.opacity = material.userData.baseOpacity;
                });

                shellMesh.add(visualRoot);
                shellMesh.userData.visualRoot = visualRoot;
            }, undefined, (err) => {
                console.error("加载模型失败:", err);
                shellMesh.userData.isPresetModel = false;
                shellMesh.material.depthWrite = true;
                shellMesh.material.userData.baseOpacity = 1;
                shellMesh.material.opacity = 1;
                shellMesh.material.transparent = false;
                setBodyOpacity(shellMesh, 1);
            });
        }

        function resolvePlanetMeshFromIntersection(object) {
            let current = object;
            while (current) {
                const found = planetObjs.find((planet) => planet.mesh === current);
                if (found) return found.mesh;
                current = current.parent;
            }
            return null;
        }

        // 通过名称添加太阳系星体
        function addPlanetByName(name, isSolar, options = {}) {
            if (!(name in solarSystemDefaults)) {
                showToast("没有找到该默认星体数据", 'danger');
                return;
            }

            const definition = solarSystemDefaults[name];
            const requiredReferenceName = definition.referenceBodyName || null;
            if (!options.skipAutoReference && requiredReferenceName && !getLatestDefaultPlanetRecord(requiredReferenceName)) {
                addPlanetByName(requiredReferenceName, true, { skipAutoReference: false, autoReference: true });
            }

            const duplicateIndex = getBaseNameCount(name);
            const initialState = buildStableDefaultPlanetState(name, duplicateIndex);
            const mass = getStableDefaultBodyMass(name);
            const color = "#" + definition.color.toString(16).padStart(6, "0");
            const mesh = addPlanet(name, Math.abs(definition.distance || 0), definition.size, color, mass, isSolar, initialState.velocity);
            if (!mesh) {
                return;
            }

            mesh.userData.defaultBodyKey = name;
            mesh.userData.isSolar = true;
            mesh.userData.referenceMass = realMass[name] || mass;
            mesh.userData.referenceBodyName = initialState.referenceName || null;
            mesh.userData.nominalDistance = definition.simDistance || 0;
            mesh.userData.angle = initialState.angle || 0;
            mesh.userData.elevation = 0;
            mesh.position.copy(initialState.position);
            mesh.userData.distance = initialState.referenceRecord
                ? mesh.position.distanceTo(initialState.referenceRecord.mesh.position)
                : Math.max(0, Math.abs(definition.distance || 0));
            mesh.userData.velocity = initialState.velocity ? initialState.velocity.clone() : new THREE.Vector3(0, 0, 0);

            const url = solarSystemModels[name];
            if (url) {
                mesh.userData.isPresetModel = true;
                mesh.material.color.set(color);
                mesh.material.transparent = true;
                mesh.material.opacity = 0.02;
                mesh.material.depthWrite = false;
                mesh.material.userData.baseOpacity = mesh.material.opacity;
                attachPresetModel(mesh, name);
            }

            return mesh;
        }

        // 添加普通球体星体
        function addPlanet(name, distance, size, color, mass = 1, isSolar = false, velocity = null) {
            const geometry = new THREE.SphereGeometry(size * radiusScale, 32, 32);
            const material = new THREE.MeshStandardMaterial({ 
                color: color,
                roughness: 0.7,
                metalness: 0.3
            });
            const mesh = new THREE.Mesh(geometry, material);
            mesh.castShadow = true;
            mesh.receiveShadow = true;
            
            mesh.userData = {
                distance: distance,
                angle: Math.random() * Math.PI * 2,
                elevation: (Math.random() - 0.5) * 0.3, // 添加高度变化
                isSolar: isSolar,
                defaultBodyKey: isSolar ? name : null,
                name: name,
                originalColor: color,
                mass: mass
            };
            mesh.name = name;
            
            // 3D位置初始化
            const elevation = mesh.userData.elevation;
            mesh.position.set(
                distance * Math.cos(mesh.userData.angle), 
                distance * elevation, // Y轴位置
                distance * Math.sin(mesh.userData.angle)
            );
            
            scene.add(mesh);
            planetObjs.push({ mesh, name });
            planetNames.add(name);
            mesh.userData.velocity = velocity ? velocity.clone() : new THREE.Vector3(0, 0, 0);
            if (showPlanetNames) createPlanetLabel(mesh, name);
            updatePlanetList();
            return mesh;
        }

        // 更新侧边栏星体列表显示
        function updatePlanetList() {
            const list = document.getElementById("planet-list");
            list.innerHTML = "";
            const countElement = document.getElementById("planet-count");
            if (countElement) {
                countElement.textContent = `(${planetObjs.length}个)`;
            }
            if (planetObjs.length > 8) {
                list.classList.add("compact");
            } else {
                list.classList.remove("compact");
            }
            planetObjs.forEach(({ mesh }, idx) => {
                const name = getPlanetDisplayName(mesh);
                const div = document.createElement("div");
                div.className = "planet-item";
                const meta = document.createElement("div");
                meta.className = "planet-item__meta";
                const nameSpan = document.createElement("span");
                nameSpan.className = "planet-name";
                nameSpan.textContent = name;
                nameSpan.title = "单击聚焦到该星体，双击查看参数";
                nameSpan.addEventListener("click", (event) => {
                    event.stopPropagation();
                    focusOnPlanet(mesh);
                });
                nameSpan.addEventListener("dblclick", (event) => {
                    event.stopPropagation();
                    focusOnPlanet(mesh);
                    openPlanetInfoPanel(mesh);
                });
                const massSpan = document.createElement("span");
                massSpan.className = "planet-mass";
                massSpan.textContent = `质量: ${formatNumber(mesh.userData.mass || 1, 4)} ×10²⁴kg`;
                meta.appendChild(nameSpan);
                meta.appendChild(massSpan);
                const actionGroup = document.createElement("div");
                actionGroup.className = "planet-item__actions";
                if (!isDefaultPlanet(mesh)) {
                    const editBtn = document.createElement("button");
                    editBtn.className = "edit-btn";
                    editBtn.textContent = "编辑";
                    editBtn.addEventListener("click", (event) => {
                        event.stopPropagation();
                        openEditDialog(mesh, name);
                    });
                    actionGroup.appendChild(editBtn);
                }
                const delBtn = document.createElement("button");
                delBtn.className = "delete-btn";
                delBtn.textContent = "删除";
                delBtn.addEventListener("click", () => {
                    if (trajectoryLines.has(mesh.uuid)) {
                        fadeOutTrail(trajectoryLines.get(mesh.uuid));
                    }
                    scene.remove(mesh);
                    planetObjs.splice(idx, 1);
                    removePlanetLabel(mesh);
                    syncPlanetNamesSet();
                    updatePlanetList();
                });
                actionGroup.appendChild(delBtn);
                div.appendChild(meta);
                div.appendChild(actionGroup);
                list.appendChild(div);
            });
            updatePlanetLabels();
        }

        function toggleSimulation() {
            const btn = document.getElementById("simulate-btn");
            if (!isSimulating) {
                if (planetObjs.length === 0) {
                    showToast("请先添加至少一个星体", 'danger');
                    return;
                }
                isSimulating = true;
                btn.textContent = "暂停模拟";
                btn.classList.add("simulating");
            } else {
                isSimulating = false;
                btn.textContent = "开始模拟";
                btn.classList.remove("simulating");
            }
        }

        // 确保星体大小保持为1的函数
        function ensurePlanetScale(planet) {
            if (planet && planet.scale) {
                planet.scale.set(1, 1, 1);
            }
        }
        
        // 鼠标点击选择星体
        function onPointerDown(event) {
            if (event.button !== 0) return;
            
            // 如果正在聚焦动画中，不允许拖拽
            if (isFocusing) return;
            
            const rect = renderer.domElement.getBoundingClientRect();
            mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
            mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

            raycaster.setFromCamera(mouse, camera);
            const intersects = raycaster.intersectObjects(planetObjs.map(p => p.mesh), true);
            
            if (intersects.length > 0) {
                event.preventDefault();
                event.stopPropagation();
                if (event.stopImmediatePropagation) event.stopImmediatePropagation();
                selectedPlanet = resolvePlanetMeshFromIntersection(intersects[0].object);
                if (!selectedPlanet) {
                    return;
                }
                if (renderer.domElement.setPointerCapture && event.pointerId != null) {
                    try {
                        renderer.domElement.setPointerCapture(event.pointerId);
                        activeDragPointerId = event.pointerId;
                    } catch (err) {
                        activeDragPointerId = null;
                    }
                }
                isDragging = true;
                orbitAnimationPaused = true;
                dragStart = { x: event.clientX, y: event.clientY };
                controls.enabled = false;
                
                // 记录拖拽开始时的初始位置和距离
                selectedPlanet.userData.dragOrigin = selectedPlanet.position.clone();
                selectedPlanet.userData.dragStartDistance = selectedPlanet.position.length();
                selectedPlanet.userData.dragPlaneNormal = camera.getWorldDirection(new THREE.Vector3()).clone().normalize();
                selectedPlanet.userData.dragPlanePoint = selectedPlanet.position.clone();
                const dragPlane = new THREE.Plane().setFromNormalAndCoplanarPoint(
                    selectedPlanet.userData.dragPlaneNormal,
                    selectedPlanet.userData.dragPlanePoint
                );
                const dragHitPoint = new THREE.Vector3();
                if (raycaster.ray.intersectPlane(dragPlane, dragHitPoint)) {
                    selectedPlanet.userData.dragOffset = selectedPlanet.position.clone().sub(dragHitPoint);
                } else {
                    selectedPlanet.userData.dragOffset = new THREE.Vector3();
                }
                
                // 高亮选中的星体（不改变大小）
                setBodyEmissive(selectedPlanet, 0x6a11cb, 0.7);
                // 确保大小保持为1
                ensurePlanetScale(selectedPlanet);
                
                // 其他星体半透明
                planetObjs.forEach(({ mesh }) => {
                    if (mesh !== selectedPlanet) {
                        setBodyOpacity(mesh, 0.3);
                    }
                });
                
                // 拖拽时显示轨道辅助线
                if (dragOrbitLine) scene.remove(dragOrbitLine);
                dragOrbitLine = createOrbitLine3D(selectedPlanet.userData.distance);
                dragOrbitLine.material.color.set(0x6a11cb);
                dragOrbitLine.material.opacity = 0.5;
                scene.add(dragOrbitLine);
                
                // 创建拖拽辅助线（从原点到行星的连线）
                if (dragHelperLine) scene.remove(dragHelperLine);
                const helperGeometry = new THREE.BufferGeometry().setFromPoints([
                    new THREE.Vector3(0, 0, 0),
                    selectedPlanet.position.clone()
                ]);
                const helperMaterial = new THREE.LineBasicMaterial({ 
                    color: 0x6a11cb, 
                    linewidth: 2,
                    opacity: 0.6,
                    transparent: true
                });
                dragHelperLine = new THREE.Line(helperGeometry, helperMaterial);
                scene.add(dragHelperLine);
                
                // 拖拽时显示当前半径标签
                if (!dragRadiusLabel) {
                    dragRadiusLabel = document.createElement('div');
                    dragRadiusLabel.style.cssText = `
                        position: fixed; left: 50%; top: 60px; transform: translateX(-50%);
                        background: rgba(30,40,80,0.85); color: #fff; padding: 12px 24px;
                        border-radius: 12px; font-size: 16px; z-index: 9999;
                        box-shadow: 0 4px 16px rgba(106,17,203,0.2); font-weight: 600; 
                        pointer-events: none; border: 1px solid rgba(106,17,203,0.3);
                        transition: all 0.3s ease;`;
                    document.body.appendChild(dragRadiusLabel);
                }
                const pos = selectedPlanet.position;
                dragRadiusLabel.textContent = `拖拽中 - 距离: ${selectedPlanet.userData.distance.toFixed(1)} | (${pos.x.toFixed(0)}, ${pos.y.toFixed(0)}, ${pos.z.toFixed(0)})`;
                dragRadiusLabel.style.display = 'block';
                
                // 添加拖拽开始时的视觉反馈
                if (selectedPlanet.material && selectedPlanet.material.color) {
                    selectedPlanet.userData.dragColor = selectedPlanet.material.color.clone();
                    selectedPlanet.userData.dragColorHex = selectedPlanet.material.color.getHexString();
                }
                
                let originalColor;
                if (selectedPlanet.userData.originalColor instanceof THREE.Color) {
                    originalColor = selectedPlanet.userData.originalColor.clone();
                } else if (selectedPlanet.userData.originalColor) {
                    originalColor = new THREE.Color(selectedPlanet.userData.originalColor);
                } else if (selectedPlanet.material && selectedPlanet.material.color) {
                    originalColor = selectedPlanet.material.color.clone();
                } else {
                    originalColor = new THREE.Color(0xffffff);
                }
                selectedPlanet.userData.originalColor = originalColor;
                selectedPlanet.userData.originalColorHex = originalColor.getHexString();
                
                // 设置拖拽时的紫色
                if (selectedPlanet.material && selectedPlanet.material.color) {
                    selectedPlanet.material.color.setHex(0x6a11cb);
                }
                setBodyEmissive(selectedPlanet, 0x6a11cb, 0.7);
            } else {
                selectedPlanet = null;
            }
        }

        // 鼠标移动拖拽星体 - 重新设计的三维拖拽系统
        function onPointerMove(event) {
            if (!isDragging || !selectedPlanet) return;
            if (activeDragPointerId != null && event.pointerId != null && event.pointerId !== activeDragPointerId) return;
            event.preventDefault();
            event.stopPropagation();
            if (event.stopImmediatePropagation) event.stopImmediatePropagation();

            const rect = renderer.domElement.getBoundingClientRect();
            const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
            const y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
            raycaster.setFromCamera({ x, y }, camera);

            const maxDistance = 8000;
            const dragPlaneNormal = selectedPlanet.userData.dragPlaneNormal
                ? selectedPlanet.userData.dragPlaneNormal.clone()
                : camera.getWorldDirection(new THREE.Vector3()).clone().normalize();
            const dragPlane = new THREE.Plane().setFromNormalAndCoplanarPoint(
                dragPlaneNormal,
                selectedPlanet.userData.dragPlanePoint || selectedPlanet.position.clone()
            );
            const intersect = new THREE.Vector3();

            if (!raycaster.ray.intersectPlane(dragPlane, intersect)) {
                return;
            }

            const dragOffset = selectedPlanet.userData.dragOffset || new THREE.Vector3();
            let finalPosition = intersect.add(dragOffset);
            const distance = finalPosition.length();

            if (distance > maxDistance) {
                finalPosition = finalPosition.clone().normalize().multiplyScalar(maxDistance);
            }

            selectedPlanet.position.copy(finalPosition);
            selectedPlanet.userData.distance = finalPosition.length();
            selectedPlanet.userData.angle = Math.atan2(finalPosition.z, finalPosition.x);
            selectedPlanet.userData.elevation = selectedPlanet.userData.distance > 0
                ? finalPosition.y / selectedPlanet.userData.distance
                : 0;

            if (dragOrbitLine) {
                scene.remove(dragOrbitLine);
                dragOrbitLine = createOrbitLine3D(selectedPlanet.userData.distance);
                dragOrbitLine.material.color.set(0x6a11cb);
                dragOrbitLine.material.opacity = 0.5;
                scene.add(dragOrbitLine);
            }

            if (dragHelperLine) {
                scene.remove(dragHelperLine);
                const helperGeometry = new THREE.BufferGeometry().setFromPoints([
                    new THREE.Vector3(0, 0, 0),
                    finalPosition.clone()
                ]);
                dragHelperLine.geometry = helperGeometry;
                scene.add(dragHelperLine);
            }

            if (dragRadiusLabel) {
                dragRadiusLabel.textContent = `距离: ${selectedPlanet.userData.distance.toFixed(1)} | (${finalPosition.x.toFixed(0)}, ${finalPosition.y.toFixed(0)}, ${finalPosition.z.toFixed(0)})`;
                dragRadiusLabel.style.background = 'rgba(30,40,80,0.85)';
                dragRadiusLabel.style.borderColor = 'rgba(106,17,203,0.3)';
            }
        }

        // 鼠标松开，结束拖拽
        function onPointerUp(event) {
            if (activeDragPointerId != null && event && event.pointerId != null && event.pointerId !== activeDragPointerId) return;
            if (isDragging && selectedPlanet) {
                event.preventDefault();
                event.stopPropagation();
                if (event.stopImmediatePropagation) event.stopImmediatePropagation();
                if (renderer.domElement.releasePointerCapture && activeDragPointerId != null) {
                    try {
                        renderer.domElement.releasePointerCapture(activeDragPointerId);
                    } catch (err) {}
                }
                activeDragPointerId = null;
                isDragging = false;
                orbitAnimationPaused = false;
                controls.enabled = true;
                
                // 拖拽结束颜色恢复动画
                let t = 0;
                const startColor = new THREE.Color(0x6a11cb);
                
                // 获取原始颜色
                let endColor;
                if (selectedPlanet.userData.originalColor) {
                    if (selectedPlanet.userData.originalColor instanceof THREE.Color) {
                        endColor = selectedPlanet.userData.originalColor.clone();
                    } else {
                        endColor = new THREE.Color(selectedPlanet.userData.originalColor);
                    }
                } else if (selectedPlanet.userData.originalColorHex) {
                    endColor = new THREE.Color(selectedPlanet.userData.originalColorHex);
                } else {
                    // 如果没有原始颜色信息，使用白色作为默认
                    endColor = new THREE.Color(0xffffff);
                }
                
                function animateColor() {
                    t += 0.08;
                    
                    // 只恢复颜色，不改变大小
                    if (selectedPlanet.material) {
                        selectedPlanet.material.color.lerpColors(startColor, endColor, t);
                    }
                    
                    if (t < 1) {
                        requestAnimationFrame(animateColor);
                    } else {
                        if (selectedPlanet.material) {
                            selectedPlanet.material.color.copy(endColor);
                        }
                    }
                }
                animateColor();
                
                // 恢复发光效果
                setBodyEmissive(selectedPlanet, 0x000000, 0);
                
                // 确保大小保持为1
                ensurePlanetScale(selectedPlanet);
                
                // 立即恢复颜色（不依赖动画）
                if (selectedPlanet.material && endColor) {
                    selectedPlanet.material.color.copy(endColor);
                }
                
                // 确保颜色恢复 - 如果动画没有完成，强制恢复
                const planetToRestore = selectedPlanet; // 保存引用
                setTimeout(() => {
                    if (planetToRestore && planetToRestore.material) {
                        if (endColor) {
                            planetToRestore.material.color.copy(endColor);
                        } else {
                            // 如果还是没有颜色，使用默认颜色
                            planetToRestore.material.color.setHex(0xffffff);
                        }
                    }
                }, 100);
                
                // 其他星体恢复不透明
                planetObjs.forEach(({ mesh }) => {
                    if (mesh !== selectedPlanet) {
                        setBodyOpacity(mesh, 1);
                    }
                });
                
                // 拖拽结束后速度归零，避免拖拽带入速度
                selectedPlanet.userData.velocity = new THREE.Vector3(0, 0, 0);
                
                // 清理拖拽相关数据
                delete selectedPlanet.userData.dragOrigin;
                delete selectedPlanet.userData.dragStartDistance;
                delete selectedPlanet.userData.dragPlaneNormal;
                delete selectedPlanet.userData.dragPlanePoint;
                delete selectedPlanet.userData.dragOffset;
                delete selectedPlanet.userData.dragColor;
                delete selectedPlanet.userData.dragColorHex;
                // 注意：不要删除originalColor，这是星体的原始颜色
                
                // 移除轨道辅助线
                if (dragOrbitLine) {
                    scene.remove(dragOrbitLine);
                    dragOrbitLine = null;
                }
                
                // 移除拖拽辅助线
                if (dragHelperLine) {
                    scene.remove(dragHelperLine);
                    dragHelperLine = null;
                }
                
                // 隐藏半径标签
                if (dragRadiusLabel) {
                    dragRadiusLabel.style.display = 'none';
                    dragRadiusLabel.style.background = 'rgba(30,40,80,0.85)';
                    dragRadiusLabel.style.borderColor = 'rgba(106,17,203,0.3)';
                }
                
                selectedPlanet = null;
            }
        }

        function animate() {
            requestAnimationFrame(animate);
            const now = performance.now();

            // 星空背景缓慢旋转
            stars.rotation.y += 0.0002;

            // 物理模拟
            if (isSimulating && !orbitAnimationPaused) {
                // 动态调整时间步长：根据最大速度调整
                let maxSpeed = 0;
                planetObjs.forEach(({ mesh }) => {
                    const speed = mesh.userData.velocity ? mesh.userData.velocity.length() : 0;
                    maxSpeed = Math.max(maxSpeed, speed);
                });
                
                // 根据最大速度动态调整时间步长
                let timeStep = 0.5 * timeScale;
                if (maxSpeed > 100) {
                    timeStep = 0.1 * timeScale; // 高速时使用更小步长
                } else if (maxSpeed > 50) {
                    timeStep = 0.2 * timeScale; // 中速时使用中等步长
                }
                
                const steps = Math.max(1, Math.floor(1 / timeStep));
                
                for (let step = 0; step < steps; step++) {
                    simulatePhysics(timeStep);
                }
                
                // 星体自转
                planetObjs.forEach(({ mesh }) => {
                    mesh.rotation.y += 0.02 * timeScale;
                    // 确保大小保持为1
                    ensurePlanetScale(mesh);
                });
            }


            // 持续跟踪模式
            if (isTrackingMode && selectedPlanetForTracking) {
                // 目标位置（星体当前位置）
                const targetPosition = selectedPlanetForTracking.position.clone();
                
                // 计算当前相机相对于目标的偏移
                const currentOffset = camera.position.clone().sub(controls.target);
                
                // 更新控制器目标为星体位置
                controls.target.copy(targetPosition);
                
                // 保持相机的相对位置，但跟随目标移动
                const newCameraPosition = targetPosition.clone().add(currentOffset);
                camera.position.copy(newCameraPosition);
                
                // 更新控制器
                controls.update();
            } else if (!isFocusing) {
                // 只在非聚焦状态下更新控制器和相机摆动
                controls.update();
            }

            if (now - lastLineWidthUpdateMs >= labPerfProfile.lineWidthUpdateIntervalMs) {
                updateTrajectoryLineWidth();
                lastLineWidthUpdateMs = now;
            }
            if (now - lastMaintenanceUpdateMs >= labPerfProfile.maintenanceIntervalMs) {
                cleanupFadedTrajectories();
                lastMaintenanceUpdateMs = now;
            }
            if ((!isSimulating || orbitAnimationPaused) && (isForceStateDirty || now - lastForceSyncMs >= labPerfProfile.forceSyncIntervalMs)) {
                syncPlanetForceState();
                isForceStateDirty = false;
                lastForceSyncMs = now;
            }
            if (now - lastForceVisualUpdateMs >= labPerfProfile.forceVisualIntervalMs) {
                updateForceVisuals();
                lastForceVisualUpdateMs = now;
            }
            if (now - lastInfoPanelUpdateMs >= labPerfProfile.infoPanelUpdateIntervalMs) {
                refreshPlanetInfoPanel();
                lastInfoPanelUpdateMs = now;
            }
            
            // 强制更新所有轨迹线可见性
            if (needsSceneSort) {
                sortSceneChildren();
            }
            
            renderer.render(scene, camera);
            updatePlanetLabels();
            lastLabelUpdateMs = now;
            if (now - lastGizmoUpdateMs >= labPerfProfile.gizmoUpdateIntervalMs) {
                updateOrientationGizmo();
                lastGizmoUpdateMs = now;
            }
        }

        // 添加CSS动画
        const style = document.createElement('style');
        style.textContent = `
            @keyframes fadeInOut {
                0% { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
                20% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
                80% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
                100% { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
            }
            
            @keyframes pulse {
                0% { box-shadow: 0 0 0 0 rgba(37, 117, 252, 0.7); }
                70% { box-shadow: 0 0 0 10px rgba(37, 117, 252, 0); }
                100% { box-shadow: 0 0 0 0 rgba(37, 117, 252, 0); }
            }
            
            #simulate-btn.simulating {
                animation: pulse 2s infinite;
            }
        `;
        document.head.appendChild(style);

        // 时间流逝控制变量
        let timeScale = 1;
        // 时间流逝控制UI逻辑
        const timeControlPanel = document.createElement('style');
        timeControlPanel.textContent = `
            #time-control-panel {
                position: fixed;
                top: 30px;
                left: 50%;
                transform: translateX(-50%);
                background: rgba(30,40,80,0.85);
                color: #fff;
                padding: 16px 32px 14px 32px;
                border-radius: 18px;
                box-shadow: 0 4px 24px rgba(37,117,252,0.18);
                z-index: 2000;
                display: flex;
                flex-direction: column;
                align-items: center;
                font-size: 16px;
                font-family: '微软雅黑', 'Arial', sans-serif;
                border: 1.5px solid rgba(80,120,255,0.18);
                gap: 10px;
            }
            #time-control-panel input[type="range"] {
                width: 260px;
                margin-top: 6px;
            }
            #time-label {
                font-size: 17px;
                font-weight: 600;
                margin-bottom: 2px;
                letter-spacing: 1px;
            }
            

        `;
        document.head.appendChild(timeControlPanel);
        // 事件绑定
        document.getElementById('time-slider').addEventListener('input', (event) => {
            timeScale = parseFloat(event.target.value);
            document.getElementById('time-label').textContent = `时间流逝速度: ${timeScale.toFixed(1)}x`;
        });

        // 键盘快捷键
        document.addEventListener('keydown', (event) => {
            switch(event.key) {
                case ' ':
                    event.preventDefault();
                    toggleSimulation();
                    break;
                case 'r':
                case 'R':
                    // 重置相机位置
                    camera.position.set(0, 150, 400);
                    controls.target.set(0, 0, 0);
                    break;
                case 'Delete':
                case 'Backspace':
                    // 删除选中的星体
                    if (selectedPlanet) {
                        const index = planetObjs.findIndex(p => p.mesh === selectedPlanet);
                        if (index !== -1) {
                            scene.remove(selectedPlanet);
                            planetObjs.splice(index, 1);
                            removePlanetLabel(selectedPlanet);
                            syncPlanetNamesSet();
                            updatePlanetList();
                            selectedPlanet = null;
                        }
                    }
                    break;
                case 'Escape':
                    // 停止跟踪模式
                    if (isTrackingMode) {
                        stopTrackingMode();
                    }
                    break;
            }
        });

        function createOrbitLine3D(radius) {
            // 创建简化的3D球面轨道
            const segments = 32;
            const points = [];
            
            // 创建主要纬线（水平圆环）
            for (let lat = -Math.PI/3; lat <= Math.PI/3; lat += Math.PI/6) {
                for (let i = 0; i <= segments; i++) {
                    const theta = (i / segments) * Math.PI * 2;
                    const x = Math.cos(theta) * Math.cos(lat) * radius;
                    const y = Math.sin(lat) * radius;
                    const z = Math.sin(theta) * Math.cos(lat) * radius;
                    points.push(new THREE.Vector3(x, y, z));
                }
            }
            
            // 创建主要经线（垂直圆环）
            for (let i = 0; i <= segments; i++) {
                const theta = (i / segments) * Math.PI * 2;
                for (let lat = -Math.PI/3; lat <= Math.PI/3; lat += Math.PI/6) {
                    const x = Math.cos(theta) * Math.cos(lat) * radius;
                    const y = Math.sin(lat) * radius;
                    const z = Math.sin(theta) * Math.cos(lat) * radius;
                    points.push(new THREE.Vector3(x, y, z));
                }
            }
            
            const geometry = new THREE.BufferGeometry().setFromPoints(points);
            const material = new THREE.LineBasicMaterial({ 
                color: 0x6a11cb, 
                linewidth: 2,
                transparent: true,
                opacity: 0.4
            });
            const line = new THREE.Line(geometry, material);
            return line;
        }

        function focusOnPlanet(planetMesh) {
            // 设置聚焦标志和跟踪目标
            isFocusing = true;
            selectedPlanetForTracking = planetMesh;
            
            // 目标位置（星体位置）
            const targetPosition = planetMesh.position.clone();
            
            // 保持当前相机相对于目标的偏移，这样用户的角度不会改变
            const currentOffset = camera.position.clone().sub(controls.target);
            const newCameraPosition = targetPosition.clone().add(currentOffset);
            
            // 快速直接跳转，减少过渡时间
            const startPosition = camera.position.clone();
            const startTarget = controls.target.clone();
            const duration = 400; // 0.4秒快速跳转
            const startTime = Date.now();
            
            function animateCamera() {
                const elapsed = Date.now() - startTime;
                const progress = Math.min(elapsed / duration, 1);
                
                // 使用线性插值，更直接的移动
                const easeProgress = progress;
                
                // 直接移动到目标位置，保持当前视角角度
                camera.position.lerpVectors(startPosition, newCameraPosition, easeProgress);
                controls.target.lerpVectors(startTarget, targetPosition, easeProgress);
                
                // 强制更新控制器，确保视角同步
                controls.update();
                
                if (progress < 1) {
                    requestAnimationFrame(animateCamera);
                } else {
                    // 动画完成，开始持续跟踪
                    isFocusing = false;
                    startTrackingMode();
                }
            }
            
            animateCamera();
            
            // 高亮显示被聚焦的星体
            planetObjs.forEach(({ mesh }) => {
                setBodyEmissive(mesh, 0x000000, 0);
                mesh.scale.set(1, 1, 1);
            });
            
            // 高亮目标星体（不改变大小）
            setBodyEmissive(planetMesh, 0x6a11cb, 0.5);
            // 确保大小保持为1
            ensurePlanetScale(planetMesh);
        }
        
        // 跟踪模式变量
        let selectedPlanetForTracking = null;
        let isTrackingMode = false;
        
        // 开始跟踪模式
        function startTrackingMode() {
            isTrackingMode = true;
            
            // 显示跟踪状态提示
            showTrackingStatus();
            
            // 高亮目标星体持续显示
            if (selectedPlanetForTracking) {
                setBodyEmissive(selectedPlanetForTracking, 0x6a11cb, 0.5);
            }
        }
        
        // 停止跟踪模式
        function stopTrackingMode() {
            isTrackingMode = false;
            selectedPlanetForTracking = null;
            
            // 隐藏跟踪状态提示
            hideTrackingStatus();
            
            // 恢复所有星体外观
            planetObjs.forEach(({ mesh }) => {
                setBodyEmissive(mesh, 0x000000, 0);
                mesh.scale.set(1, 1, 1);
            });
        }
        
        // 显示跟踪状态提示（隐藏版本）
        function showTrackingStatus() {
            // 不显示任何提示，静默跟踪
        }
        
        // 隐藏跟踪状态提示（隐藏版本）
        function hideTrackingStatus() {
            // 不需要隐藏任何提示
        }


        // 修改G按钮逻辑
        document.getElementById('change-g-btn').addEventListener('click', function() {
            openGravityDialog();
        });

        // 星体名称显示/隐藏逻辑
        function createPlanetLabel(mesh, name) {
            if (planetNameLabels.has(mesh.uuid)) return;
            const label = document.createElement("button");
            label.type = "button";
            label.className = "planet-3d-label";
            label.title = "单击聚焦，双击查看参数";
            label.innerHTML = '<span class="planet-3d-label__name"></span>';
            label.addEventListener("pointerdown", (event) => event.stopPropagation());
            label.addEventListener("click", (event) => {
                event.stopPropagation();
                focusOnPlanet(mesh);
            });
            label.addEventListener("dblclick", (event) => {
                event.stopPropagation();
                focusOnPlanet(mesh);
                openPlanetInfoPanel(mesh);
            });
            document.body.appendChild(label);
            planetNameLabels.set(mesh.uuid, label);
        }
        function removePlanetLabel(mesh) {
            if (!mesh) return;
            if (selectedPlanet === mesh) selectedPlanet = null;
            if (activePlanetInfoMesh === mesh) closePlanetInfoPanel();
            if (selectedPlanetForTracking === mesh) stopTracking();
            removePlanetForceArrow(mesh);
            const label = planetNameLabels.get(mesh.uuid);
            if (label && label.parentNode) label.parentNode.removeChild(label);
            planetNameLabels.delete(mesh.uuid);
        }
        function updatePlanetLabels() {
            for (const [uuid, label] of planetNameLabels.entries()) {
                const found = planetObjs.some(({ mesh }) => mesh.uuid === uuid);
                if (!found) {
                    if (label.parentNode) label.parentNode.removeChild(label);
                    planetNameLabels.delete(uuid);
                }
            }
            if (!showPlanetNames) {
                for (const label of planetNameLabels.values()) {
                    label.style.display = "none";
                }
                return;
            }
            const viewportWidth = window.innerWidth;
            const viewportHeight = window.innerHeight;
            planetObjs.forEach(({ mesh }) => {
                const name = getPlanetDisplayName(mesh);
                let label = planetNameLabels.get(mesh.uuid);
                if (!label) {
                    createPlanetLabel(mesh, name);
                    label = planetNameLabels.get(mesh.uuid);
                }
                const projected = labelProjectVector.copy(mesh.position).project(camera);
                const inDepthRange = projected.z > -1 && projected.z < 1;
                const inViewport = Math.abs(projected.x) < 1.15 && Math.abs(projected.y) < 1.15;
                if (!inDepthRange || !inViewport) {
                    label.style.display = "none";
                    return;
                }
                const x = (projected.x * 0.5 + 0.5) * viewportWidth;
                const y = (-projected.y * 0.5 + 0.5) * viewportHeight;
                const camDist = camera.position.distanceTo(mesh.position);
                const offset = Math.max(18, 34 - camDist * 0.05);
                const nameNode = label.querySelector(".planet-3d-label__name");
                if (nameNode) nameNode.textContent = name;
                label.style.display = "inline-flex";
                label.style.left = "0px";
                label.style.top = "0px";
                label.style.setProperty("--label-x", `${x}px`);
                label.style.setProperty("--label-y", `${y - offset}px`);
                label.classList.toggle("is-active", activePlanetInfoMesh === mesh || selectedPlanet === mesh || selectedPlanetForTracking === mesh);
            });
        }
        document.getElementById("toggle-names-btn").addEventListener("click", function() {
            showPlanetNames = !showPlanetNames;
            this.textContent = showPlanetNames ? "隐藏星体名称" : "显示星体名称";
            updatePlanetLabels();
        });

        const sidebarPanel = document.getElementById('sidebar-panel');
        const sidebarToggleBtn = document.getElementById('sidebar-toggle-btn');
        let sidebarCollapsed = false;
        if (sidebarPanel && sidebarToggleBtn) {
            sidebarToggleBtn.addEventListener('click', () => {
                sidebarCollapsed = !sidebarCollapsed;
                if (sidebarCollapsed) {
                    sidebarPanel.classList.add('collapsed');
                    sidebarToggleBtn.innerText = '⮞';
                } else {
                    sidebarPanel.classList.remove('collapsed');
                    sidebarToggleBtn.innerText = '⮜';
                }
            });
        }

        init();

        // 编辑对话框相关逻辑
        function openEditDialog(mesh, name) {
            const currentName = getPlanetDisplayName(mesh) || name;
            const wrap = labDialog(
                '编辑星体参数',
                `
                    <p class="lab-dialog__copy">当前正在编辑 <span class="lab-dialog__inline">${currentName}</span>，修改后会立即同步到实验室场景。</p>
                    <div class="lab-dialog__grid lab-dialog__grid--2">
                        <label class="lab-dialog__field lab-dialog__field--full">
                            <span class="lab-dialog__label">名称</span>
                            <input id="edit-name" class="lab-dialog__input" type="text" placeholder="星体名称" />
                        </label>
                        <label class="lab-dialog__field">
                            <span class="lab-dialog__label">大小</span>
                            <input id="edit-size" class="lab-dialog__input" type="number" min="1" max="50" step="0.01" />
                        </label>
                        <label class="lab-dialog__field">
                            <span class="lab-dialog__label">质量 (10²⁴kg)</span>
                            <input id="edit-mass" class="lab-dialog__input" type="number" min="0.0001" max="1000000" step="0.0001" />
                        </label>
                        <label class="lab-dialog__field">
                            <span class="lab-dialog__label">颜色</span>
                            <input id="edit-color" class="lab-dialog__input" type="color" />
                        </label>
                        <div class="lab-dialog__field lab-dialog__field--full">
                            <span class="lab-dialog__label">速度 (vx, vy, vz)</span>
                            <div class="lab-dialog__grid lab-dialog__grid--3">
                                <input id="edit-vx" class="lab-dialog__input" type="number" step="0.01" placeholder="vx" />
                                <input id="edit-vy" class="lab-dialog__input" type="number" step="0.01" placeholder="vy" />
                                <input id="edit-vz" class="lab-dialog__input" type="number" step="0.01" placeholder="vz" />
                            </div>
                        </div>
                    </div>
                    <div class="lab-dialog__actions">
                        <button id="edit-save" type="button" class="lab-dialog__button lab-dialog__button--primary">保存参数</button>
                    </div>
                `,
                {
                    id: 'edit-dialog',
                    eyebrow: 'Body Editor',
                    subtitle: '统一调整名称、显示尺寸、质量、颜色和初始速度',
                    maxWidth: '620px',
                },
            )

            const nameInput = wrap.querySelector('#edit-name')
            const sizeInput = wrap.querySelector('#edit-size')
            const massInput = wrap.querySelector('#edit-mass')
            const colorInput = wrap.querySelector('#edit-color')
            const vxInput = wrap.querySelector('#edit-vx')
            const vyInput = wrap.querySelector('#edit-vy')
            const vzInput = wrap.querySelector('#edit-vz')
            const saveBtn = wrap.querySelector('#edit-save')

            nameInput.value = currentName
            sizeInput.value = mesh.geometry.parameters.radius
            massInput.value = mesh.userData.mass || 1
            colorInput.value = mesh.material.color.getStyle ? rgbToHex(mesh.material.color.getStyle()) : '#ffffff'
            vxInput.value = mesh.userData.velocity ? mesh.userData.velocity.x : 0
            vyInput.value = mesh.userData.velocity ? mesh.userData.velocity.y : 0
            vzInput.value = mesh.userData.velocity ? mesh.userData.velocity.z : 0

            wrap.addEventListener('keydown', (event) => {
                if (event.key === 'Enter') saveBtn.click()
            })

            saveBtn.addEventListener('click', () => {
                const newName = nameInput.value.trim()
                const newSize = parseFloat(sizeInput.value)
                const newMass = parseFloat(massInput.value)
                const newColor = colorInput.value
                const vx = parseFloat(vxInput.value)
                const vy = parseFloat(vyInput.value)
                const vz = parseFloat(vzInput.value)

                if (!newName) {
                    showToast('名称不能为空', 'danger')
                    return
                }
                if (isNaN(newSize) || newSize < 1 || newSize > 50) {
                    showToast('大小需为 1-50', 'danger')
                    return
                }
                if (isNaN(newMass) || newMass <= 0) {
                    showToast('质量需为正数', 'danger')
                    return
                }
                if ([vx, vy, vz].some((v) => isNaN(v))) {
                    showToast('速度需为数字', 'danger')
                    return
                }
                if (newName !== currentName && planetNames.has(newName)) {
                    showToast('名称已存在', 'danger')
                    return
                }

                setPlanetDisplayName(mesh, newName)
                mesh.userData.mass = newMass
                mesh.material.color.set(newColor)
                mesh.userData.originalColor = newColor
                mesh.geometry = new THREE.SphereGeometry(newSize * radiusScale, 32, 32)
                mesh.userData.velocity = new THREE.Vector3(vx, vy, vz)
                updatePlanetList()
                updatePlanetLabels()
                if (activePlanetInfoMesh === mesh) openPlanetInfoPanel(mesh)
                showToast('星体参数已更新', 'success')
                wrap.closeDialog()
            })
        }
        // 辅助函数：rgb字符串转hex
        function rgbToHex(rgb) {
            if (!rgb) return '#ffffff';
            const result = rgb.match(/\d+/g);
            if (!result) return '#ffffff';
            return '#' + result.slice(0,3).map(x=>('0'+parseInt(x).toString(16)).slice(-2)).join('');
        }
        function showToast(message, tone = 'info') {
            const existing = document.querySelector('.lab-toast')
            if (existing) existing.remove()
            const toast = document.createElement('div')
            toast.className = `lab-toast lab-toast--${tone}`
            toast.textContent = message
            document.body.appendChild(toast)
            requestAnimationFrame(() => toast.classList.add('is-visible'))
            window.setTimeout(() => {
                toast.classList.remove('is-visible')
                window.setTimeout(() => toast.remove(), 220)
            }, 1800)
        }
        function getBaseNameCount(baseName) {
            return planetObjs.reduce((count, record) => {
                if (!record || !record.name) return count;
                return record.name === baseName || record.name.startsWith(baseName + ' ') ? count + 1 : count;
            }, 0);
        }


        function ensureLegacyCustomInputs() {
            let root = document.getElementById('legacy-custom-inputs');
            if (root) return root;
            root = document.createElement('div');
            root.id = 'legacy-custom-inputs';
            root.style.display = 'none';
            root.innerHTML = '<input id="custom-planet-name"><input id="custom-planet-distance"><input id="custom-planet-size"><input id="custom-planet-mass"><input id="custom-planet-vx"><input id="custom-planet-vy"><input id="custom-planet-vz"><input id="custom-planet-y"><input id="custom-planet-elevation"><input id="custom-planet-color">';
            document.body.appendChild(root);
            return root;
        }

        function labDialog(title, bodyHtml, options = {}) {
            const {
                id = 'lab-dialog',
                eyebrow = 'Simulation Studio',
                subtitle = '',
                maxWidth = '560px',
            } = options

            const old = document.getElementById(id)
            if (old) {
                if (typeof old.closeDialog === 'function') {
                    old.closeDialog()
                } else {
                    old.remove()
                }
            }

            const wrap = document.createElement('div')
            wrap.id = id
            wrap.className = 'lab-dialog'
            wrap.innerHTML = `
                <div class="lab-dialog__frame" style="width:min(${maxWidth},100%);">
                    <div class="lab-dialog__panel">
                        <div class="lab-dialog__header">
                            <div>
                                <p class="lab-dialog__eyebrow">${eyebrow}</p>
                                <h3 class="lab-dialog__title">${title}</h3>
                                ${subtitle ? `<p class="lab-dialog__subtitle">${subtitle}</p>` : ''}
                            </div>
                        </div>
                        <div class="lab-dialog__body">${bodyHtml}</div>
                    </div>
                </div>
            `

            const onKeyDown = (event) => {
                if (event.key === 'Escape') closeDialog()
            }

            function closeDialog() {
                if (wrap.parentNode) wrap.remove()
                document.removeEventListener('keydown', onKeyDown)
            }

            wrap.closeDialog = closeDialog
            wrap.addEventListener('click', (event) => {
                if (event.target === wrap) closeDialog()
            })
            document.addEventListener('keydown', onKeyDown)
            document.body.appendChild(wrap)
            return wrap
        }

        function openGravityDialog() {
            const wrap = labDialog(
                '调整引力常数 G',
                `
                    <p class="lab-dialog__copy">统一改变当前实验室的引力强度。建议使用正数，并逐步调节观察系统反馈。</p>
                    <label class="lab-dialog__field">
                        <span class="lab-dialog__label">当前 G 值</span>
                        <input id="dlg-gravity" class="lab-dialog__input" type="number" min="0.00000001" step="0.0001" />
                    </label>
                    <div class="lab-dialog__actions">
                        <button id="dlg-gravity-save" type="button" class="lab-dialog__button lab-dialog__button--primary">应用</button>
                    </div>
                `,
                {
                    eyebrow: 'Gravity Control',
                    subtitle: '修改全局引力常数后，所有天体都会按新的强度继续演化',
                    maxWidth: '520px',
                },
            )

            const input = wrap.querySelector('#dlg-gravity')
            input.value = G
            wrap.querySelector('#dlg-gravity-save').onclick = () => {
                const gnum = parseFloat(input.value)
                if (!isNaN(gnum) && gnum > 0) {
                    G = gnum
                    showToast(`G 已设置为 ${G}`, 'success')
                    wrap.closeDialog()
                } else {
                    showToast('请输入有效的正数', 'danger')
                }
            }
        }

        function openCustomPlanetDialog() {
            ensureLegacyCustomInputs()
            const wrap = labDialog(
                '添加自定义星体',
                `
                    <p class="lab-dialog__copy">创建一个可自由编辑参数的新星体，并立即加入当前引力环境。</p>
                    <div class="lab-dialog__grid lab-dialog__grid--2">
                        <label class="lab-dialog__field lab-dialog__field--full">
                            <span class="lab-dialog__label">名称</span>
                            <input id="dlg-name" class="lab-dialog__input" type="text" placeholder="星体名称" />
                        </label>
                        <label class="lab-dialog__field">
                            <span class="lab-dialog__label">轨道半径</span>
                            <input id="dlg-distance" class="lab-dialog__input" type="number" min="10" max="8000" step="1" value="100" />
                        </label>
                        <label class="lab-dialog__field">
                            <span class="lab-dialog__label">星体大小</span>
                            <input id="dlg-size" class="lab-dialog__input" type="number" min="1" max="50" step="0.01" value="5" />
                        </label>
                        <label class="lab-dialog__field">
                            <span class="lab-dialog__label">质量</span>
                            <input id="dlg-mass" class="lab-dialog__input" type="number" min="0.0001" max="1000000" step="0.0001" value="1" />
                        </label>
                        <label class="lab-dialog__field">
                            <span class="lab-dialog__label">颜色</span>
                            <input id="dlg-color" class="lab-dialog__input" type="color" value="#ff9900" />
                        </label>
                        <div class="lab-dialog__field lab-dialog__field--full">
                            <span class="lab-dialog__label">速度 (vx, vy, vz)</span>
                            <div class="lab-dialog__grid lab-dialog__grid--3">
                                <input id="dlg-vx" class="lab-dialog__input" type="number" step="0.01" value="0" placeholder="vx" />
                                <input id="dlg-vy" class="lab-dialog__input" type="number" step="0.01" value="0" placeholder="vy" />
                                <input id="dlg-vz" class="lab-dialog__input" type="number" step="0.01" value="0" placeholder="vz" />
                            </div>
                        </div>
                        <label class="lab-dialog__field">
                            <span class="lab-dialog__label">Y 高度</span>
                            <input id="dlg-y" class="lab-dialog__input" type="number" step="1" value="0" />
                        </label>
                        <label class="lab-dialog__field">
                            <span class="lab-dialog__label">高度比例</span>
                            <input id="dlg-elev" class="lab-dialog__input" type="number" step="0.01" value="0" />
                        </label>
                    </div>
                    <div class="lab-dialog__actions">
                        <button id="dlg-ok" type="button" class="lab-dialog__button lab-dialog__button--primary">加入场景</button>
                    </div>
                `,
                {
                    eyebrow: 'Custom Body',
                    subtitle: '名称、大小、质量、颜色和速度都会直接写入当前实验场景',
                    maxWidth: '680px',
                },
            )

            const set = (id, val) => {
                document.getElementById(id).value = val
            }

            wrap.querySelector('#dlg-name').value = (() => {
                let i = 1
                while (planetNames.has(`star_${i}`)) i++
                return `star_${i}`
            })()

            wrap.querySelector('#dlg-ok').onclick = () => {
                set('custom-planet-name', wrap.querySelector('#dlg-name').value)
                set('custom-planet-distance', wrap.querySelector('#dlg-distance').value)
                set('custom-planet-size', wrap.querySelector('#dlg-size').value)
                set('custom-planet-mass', wrap.querySelector('#dlg-mass').value)
                set('custom-planet-vx', wrap.querySelector('#dlg-vx').value)
                set('custom-planet-vy', wrap.querySelector('#dlg-vy').value)
                set('custom-planet-vz', wrap.querySelector('#dlg-vz').value)
                set('custom-planet-y', wrap.querySelector('#dlg-y').value)
                set('custom-planet-elevation', wrap.querySelector('#dlg-elev').value)
                set('custom-planet-color', wrap.querySelector('#dlg-color').value)
                if (addCustomPlanet()) {
                    showToast('自定义星体已加入场景', 'success')
                    wrap.closeDialog()
                }
            }
        }

        function openDefaultPlanetDialog() {
            const cards = Object.keys(solarSystemDefaults).map((name) => {
                const existing = getBaseNameCount(name)
                return `
                    <button type="button" data-planet="${name}" class="lab-dialog__planet-card">
                        <strong class="lab-dialog__planet-name">${name}</strong>
                        <span class="lab-dialog__planet-copy">${solarSystemDescriptions[name] || '默认星体'}${existing ? `，当前已有 ${existing} 个` : ''}</span>
                    </button>
                `
            }).join('')
            const wrap = labDialog(
                '使用默认星体',
                `
                    <p class="lab-dialog__copy">点击任意卡片即可把该默认星体加入当前场景。会自动沿用实验室中已有的默认稳定参数。</p>
                    <div class="lab-dialog__planet-grid">${cards}</div>
                `,
                {
                    eyebrow: 'Preset Bodies',
                    subtitle: '从预设星体库中快速加入太阳系对象',
                    maxWidth: '760px',
                },
            )
            wrap.querySelectorAll('[data-planet]').forEach((button) => {
                button.onclick = () => {
                    const planetName = button.getAttribute('data-planet')
                    addPlanetByName(planetName, true)
                    showToast(`${planetName} 已加入当前场景`, 'success')
                    wrap.closeDialog()
                }
            })
        }

        if (document.getElementById('time-slider')) document.getElementById('time-slider').max = '10';

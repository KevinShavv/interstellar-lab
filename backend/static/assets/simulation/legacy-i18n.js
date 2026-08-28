(() => {
  const storageKey = 'site-lang';
  let currentLang = window.localStorage.getItem(storageKey) === 'en' ? 'en' : 'zh';

  const solarNames = {
    zh: {
      太阳: '太阳',
      水星: '水星',
      金星: '金星',
      地球: '地球',
      月球: '月球',
      火星: '火星',
      木星: '木星',
      土星: '土星',
      天王星: '天王星',
      海王星: '海王星',
    },
    en: {
      太阳: 'Sun',
      水星: 'Mercury',
      金星: 'Venus',
      地球: 'Earth',
      月球: 'Moon',
      火星: 'Mars',
      木星: 'Jupiter',
      土星: 'Saturn',
      天王星: 'Uranus',
      海王星: 'Neptune',
    },
  };

  const solarDescriptions = {
    zh: {
      太阳: '太阳是太阳系的中心恒星，直径约139万公里，占太阳系总质量的99.86%。通过氢核聚变释放能量，表面温度约5500℃，核心达1500万℃。太阳活动会影响地球气候和通讯，约形成于46亿年前。',
      水星: '水星是最靠近太阳的行星，直径4880公里，表面温差极大。它几乎没有大气层，表面布满陨石坑，公转周期约88天。',
      金星: '金星大小与地球接近，但表面极端炽热，大气以二氧化碳为主，具有强烈温室效应，自转方向也与多数行星相反。',
      地球: '地球是已知唯一孕育生命的行星，拥有液态水、适宜大气和磁场保护，月球对潮汐与自转稳定也十分重要。',
      月球: '月球是地球唯一的天然卫星，表面遍布陨石坑与月海，同步自转使它总以同一面对着地球。',
      火星: '火星表面富含氧化铁而呈红色，拥有巨型火山、峡谷与极地冰盖，是人类重点探索的潜在移居目标之一。',
      木星: '木星是太阳系最大的行星，属于气体巨星，拥有著名的大红斑和强大磁场，以及数量众多的卫星系统。',
      土星: '土星以壮观光环闻名，密度低于水，拥有复杂的环系和多颗值得研究的卫星。',
      天王星: '天王星是一颗冰巨星，自转轴几乎横躺，因甲烷成分而呈青蓝色，季节变化极端。',
      海王星: '海王星位于太阳系外缘，拥有极强风暴和深蓝外观，是通过数学预测先于观测被确认的行星。',
    },
    en: {
      太阳: 'The Sun is the central star of the solar system. It powers the system through nuclear fusion and dominates almost all of its total mass.',
      水星: 'Mercury is the closest planet to the Sun, with a cratered surface, almost no atmosphere, and dramatic temperature swings.',
      金星: 'Venus is similar to Earth in size, but its dense carbon-dioxide atmosphere creates an extreme greenhouse environment.',
      地球: 'Earth is the only known life-bearing planet, with liquid water, a protective atmosphere, and a stabilizing moon.',
      月球: 'The Moon is Earth’s natural satellite, known for its cratered surface and synchronous rotation that keeps one face toward Earth.',
      火星: 'Mars is a cold rocky world with iron-rich soil, giant volcanoes, polar ice, and strong evidence of ancient water activity.',
      木星: 'Jupiter is the largest planet in the solar system, famous for its Great Red Spot, huge magnetosphere, and many moons.',
      土星: 'Saturn is a gas giant best known for its bright rings and complex moon system.',
      天王星: 'Uranus is an ice giant with an extreme axial tilt, giving it a sideways seasonal cycle and a cool cyan color.',
      海王星: 'Neptune is the outermost major planet, marked by powerful winds, deep blue clouds, and a discovery first predicted by mathematics.',
    },
  };

  const solarText = {
    zh: {
      title: '探索太阳系',
      loading: '正在加载太阳系模型...',
      loaded: '太阳系模型加载完成',
      timeScale: '时间流速',
      freeView: '自由视角',
      followView: '跟随行星',
      choosePlanet: '选择行星',
      collapse: '收起',
      expand: '展开',
      collapseTitle: '收起介绍面板',
      expandTitle: '展开介绍面板',
      nasa: '前往 NASA 页面',
      orbitDistance: '轨道距离',
      radius: '半径',
      orbitSpeed: '公转速度',
      rotationSpeed: '自转速度',
      millionKm: '百万公里',
      km: '公里',
      radPerSec: '弧度/秒',
      pause: '暂停',
      resume: '恢复',
    },
    en: {
      title: 'Explore the Solar System',
      loading: 'Loading the solar system model...',
      loaded: 'Solar system loaded successfully',
      timeScale: 'Time Scale',
      freeView: 'Free View',
      followView: 'Follow Planet',
      choosePlanet: 'Planet',
      collapse: 'Collapse',
      expand: 'Expand',
      collapseTitle: 'Collapse info panel',
      expandTitle: 'Expand info panel',
      nasa: 'Open NASA Page',
      orbitDistance: 'Orbital Distance',
      radius: 'Radius',
      orbitSpeed: 'Orbital Speed',
      rotationSpeed: 'Rotation Speed',
      millionKm: 'million km',
      km: 'km',
      radPerSec: 'rad/s',
      pause: 'Pause',
      resume: 'Resume',
    },
  };

  const launchStates = {
    '计算中...': 'Calculating...',
    '地球附近发射中': 'Launching near Earth',
    '地月转移中': 'Trans-lunar transfer',
    '近月制动中': 'Lunar braking',
    '环月轨道建立中': 'Establishing lunar orbit',
    '环月公转引导中': 'Guiding lunar orbit',
    '引力保持辅助中': 'Gravity hold assist',
    '月球捕获中': 'Captured by the Moon',
    '逃逸中': 'Escaping',
  };

  const launchText = {
    zh: {
      title: '地月转移演示',
      back: '返回',
      pause: '暂停',
      resume: '恢复',
      reset: '重置',
      simDays: '模拟日数',
      simDaysUnit: '天',
      taskTitle: '任务目标：',
      taskLines: ['从地球表面发射卫星，', '通过加速与近月制动，', '进入环月轨道。'],
      paramsTitle: '参数调节与状态',
      satelliteMass: '卫星质量 (kg)：',
      thrust: '推力速度控制：',
      thrustInfo: '使用 W/S/A/D 控制卫星',
      timeScale: '时间倍速：',
      matchOrbit: '匹配轨道速度',
      autoCapture: '一键月球捕获',
      moonMass: '月球质量：',
      moonVel: '月球速度：',
      satVel: '卫星速度：',
      satState: '卫星状态：',
      earthForce: '受地球引力：',
      moonForce: '受月球引力：',
      view: '视角',
      free: '自由',
      satellite: '卫星',
      moon: '月球',
      earthLabel: '地球',
      moonLabel: '月球',
      satLabel: '卫星',
    },
    en: {
      title: 'Earth-Moon Transfer Demo',
      back: 'Back',
      pause: 'Pause',
      resume: 'Resume',
      reset: 'Reset',
      simDays: 'Simulated Days',
      simDaysUnit: 'd',
      taskTitle: 'Mission Goal:',
      taskLines: ['Launch a satellite from Earth,', 'accelerate and brake near the Moon,', 'then enter a stable lunar orbit.'],
      paramsTitle: 'Parameters & Status',
      satelliteMass: 'Satellite Mass (kg):',
      thrust: 'Thrust Control:',
      thrustInfo: 'Use W/S/A/D to control the satellite',
      timeScale: 'Time Scale:',
      matchOrbit: 'Match Orbit Speed',
      autoCapture: 'Auto Moon Capture',
      moonMass: 'Moon Mass:',
      moonVel: 'Moon Velocity:',
      satVel: 'Satellite Velocity:',
      satState: 'Satellite State:',
      earthForce: 'Earth Force:',
      moonForce: 'Moon Force:',
      view: 'View',
      free: 'Free',
      satellite: 'Satellite',
      moon: 'Moon',
      earthLabel: 'Earth',
      moonLabel: 'Moon',
      satLabel: 'Satellite',
    },
  };

  const labText = {
    zh: {
      title: '星体实验室',
      hintTitle: '轨道交互',
      hintBody: '拖拽星体调整轨道，滚轮缩放，右键自由旋转视角。',
      eyebrow: 'Simulation Studio',
      panelTitle: '星体实验室',
      panelCopy: '在统一引力场中构建多天体系统，实时编辑半径、质量、速度与时间流逝。',
      meta: ['实时引力', '轨道编辑', '时间缩放'],
      systemControl: '系统控制',
      systemCopy: '快速切换标注、轨迹与全局引力常数。',
      changeG: '调整引力常数 G',
      hideNames: '隐藏星体名称',
      showNames: '显示星体名称',
      hideTrails: '隐藏轨迹线',
      showTrails: '显示轨迹线',
      bodyScale: '天体尺度',
      bodyScaleCopy: '统一调整星体显示半径，保持场景结构不变。',
      apply: '应用',
      addBodies: '添加星体',
      addBodiesCopy: '将创建入口收纳到弹窗中，让左侧控制区更干净。',
      addCustom: '添加自定义星体',
      addDefault: '使用默认星体',
      addNote: '自定义星体会在屏幕中央弹出参数面板，默认星体则可从预设列表快速加入。',
      addedBodies: '已添加星体',
      addedBodiesCopy: '点击名称聚焦目标，双击名称查看参数；自定义星体可继续编辑，默认星体可直接查看预设参数。',
      startSim: '开始模拟',
      pauseSim: '暂停模拟',
      ctaNote: 'Space 键可快速启动或暂停模拟，R 键可重置视角。',
      timeLabel: '时间流逝速度',
      timeNote: '拖动滑块可加速或减慢系统演化',
      sidebarToggle: '收起/展开侧边栏',
      edit: '编辑',
      remove: '删除',
      countSuffix: '个',
    },
    en: {
      title: 'Celestial Simulation Lab',
      hintTitle: 'Orbit Interaction',
      hintBody: 'Drag bodies to adjust orbits, use the wheel to zoom, and right-click to rotate the camera freely.',
      eyebrow: 'Simulation Studio',
      panelTitle: 'Celestial Lab',
      panelCopy: 'Build multi-body systems in a unified gravity field and edit radius, mass, velocity, and time flow in real time.',
      meta: ['Live Gravity', 'Orbit Editing', 'Time Scaling'],
      systemControl: 'System Controls',
      systemCopy: 'Quickly switch labels, trails, and the global gravitational constant.',
      changeG: 'Adjust Gravity G',
      hideNames: 'Hide Body Names',
      showNames: 'Show Body Names',
      hideTrails: 'Hide Trails',
      showTrails: 'Show Trails',
      bodyScale: 'Body Scale',
      bodyScaleCopy: 'Scale the visible radius of all bodies without changing the scene structure.',
      apply: 'Apply',
      addBodies: 'Add Bodies',
      addBodiesCopy: 'Keep creation actions in dialogs so the left panel stays cleaner.',
      addCustom: 'Add Custom Body',
      addDefault: 'Use Default Body',
      addNote: 'Custom bodies open a parameter dialog in the center, while default bodies can be added from presets.',
      addedBodies: 'Added Bodies',
      addedBodiesCopy: 'Click a name to focus it, double-click to inspect parameters; custom bodies remain editable.',
      startSim: 'Start Simulation',
      pauseSim: 'Pause Simulation',
      ctaNote: 'Press Space to start or pause, and R to reset the camera.',
      timeLabel: 'Time Flow',
      timeNote: 'Drag the slider to speed up or slow down the simulation',
      sidebarToggle: 'Collapse or expand sidebar',
      edit: 'Edit',
      remove: 'Delete',
      countSuffix: '',
    },
  };

  function setLang(nextLang) {
    currentLang = nextLang === 'en' ? 'en' : 'zh';
    window.localStorage.setItem(storageKey, currentLang);
    applyPage();
  }

  function byId(id) {
    return document.getElementById(id);
  }

  function setText(node, text) {
    if (node) {
      node.textContent = text;
    }
  }

  function setLabelWithInput(node, text) {
    if (!node) {
      return;
    }

    const input = node.querySelector('input');
    if (!input) {
      node.textContent = text;
      return;
    }

    node.textContent = '';
    node.appendChild(input);
    node.appendChild(document.createTextNode(text));
    input.style.marginRight = '4px';
  }

  function translatePair(value, pairs) {
    const raw = String(value || '').trim();
    if (!raw) {
      return raw;
    }

    for (const [zhValue, enValue] of Object.entries(pairs)) {
      if (raw === zhValue || raw === enValue) {
        return currentLang === 'en' ? enValue : zhValue;
      }
    }

    return raw;
  }

  function getSolarPlanetKey() {
    if (typeof followTarget !== 'undefined' && followTarget && solarNames.zh[followTarget]) {
      return followTarget;
    }

    const select = byId('planet-select');
    if (select && solarNames.zh[select.value]) {
      return select.value;
    }

    return '地球';
  }

  function isSolarPaused() {
    const slider = byId('time-scale-slider');
    const pauseBtn = byId('pause-btn');
    const sliderValue = slider ? Number.parseFloat(slider.value) : Number.NaN;
    if (!Number.isNaN(sliderValue)) {
      return sliderValue === 0;
    }
    return pauseBtn ? pauseBtn.textContent.includes('▶') : false;
  }

  function applySolarInfo(key = getSolarPlanetKey()) {
    const text = solarText[currentLang];
    const cfg = typeof planetConfig !== 'undefined' ? planetConfig[key] : null;
    const infoName = byId('planet-info-name');
    const infoDetails = byId('planet-info-details');
    const description = byId('planet-description-text');
    const nasaBtn = byId('nasa-link-btn');

    if (infoName) {
      infoName.textContent = solarNames[currentLang][key] || key;
    }

    if (infoDetails && cfg && typeof realDistance !== 'undefined' && typeof realRadius !== 'undefined') {
      infoDetails.innerHTML =
        `<b>${text.orbitDistance}：</b>${(realDistance[key] || 0).toFixed(3)} ${text.millionKm}<br/>` +
        `<b>${text.radius}：</b>${(realRadius[key] || 0).toLocaleString()} ${text.km}<br/>` +
        `<b>${text.orbitSpeed}：</b>${(cfg.speed * 60).toFixed(3)} ${text.radPerSec}<br/>` +
        `<b>${text.rotationSpeed}：</b>${(cfg.rotationSpeed * 60).toFixed(3)} ${text.radPerSec}<br/>`;
    }

    if (description) {
      description.textContent = solarDescriptions[currentLang][key] || '';
    }

    setText(nasaBtn, text.nasa);
  }

  function syncSolarLabelNodes() {
    if (typeof planetConfig === 'undefined') {
      return;
    }

    Object.values(planetConfig).forEach((cfg) => {
      const nameNode = cfg && cfg.__labelElement ? cfg.__labelElement.querySelector('.planet-name') : null;
      if (nameNode) {
        nameNode.textContent = solarNames[currentLang][cfg.name] || cfg.name;
      }
    });
  }

  function applySolarToggle() {
    const text = solarText[currentLang];
    const toggleBtn = byId('planet-info-toggle');
    if (!toggleBtn) {
      return;
    }

    const collapsed = typeof isInfoPanelCollapsed !== 'undefined'
      ? Boolean(isInfoPanelCollapsed)
      : byId('planet-info-panel')?.classList.contains('collapsed');

    toggleBtn.textContent = collapsed ? '⌄' : '⌃';
    toggleBtn.setAttribute('title', collapsed ? 'Expand planet info' : 'Collapse planet info');
    toggleBtn.setAttribute('aria-label', collapsed ? 'Expand planet info' : 'Collapse planet info');
    toggleBtn.setAttribute('aria-expanded', String(!collapsed));
  }

  function applySolar() {
    if (!byId('time-scale-controls')) {
      return;
    }

    const text = solarText[currentLang];
    document.title = text.title;
    setText(byId('loading-text'), text.loading);
    setText(document.querySelector('.notification'), text.loaded);
    setText(document.querySelector('label[for="time-scale-slider"]'), text.timeScale);
    setLabelWithInput(document.querySelectorAll('#follow-panel label')[0], text.freeView);
    setLabelWithInput(document.querySelectorAll('#follow-panel label')[1], text.followView);
    setText(document.querySelector('#planet-select-row span'), text.choosePlanet);

    const select = byId('planet-select');
    if (select) {
      Array.from(select.options).forEach((option) => {
        option.textContent = solarNames[currentLang][option.value] || option.value;
      });
    }

    const pauseBtn = byId('pause-btn');
    if (pauseBtn) {
      const pauseLabel = isSolarPaused() ? text.resume : text.pause;
      pauseBtn.setAttribute('title', pauseLabel);
      pauseBtn.setAttribute('aria-label', pauseLabel);
    }

    applySolarToggle();
    applySolarInfo();
    syncSolarLabelNodes();
  }

  function isLaunchPaused() {
    if (typeof isPaused !== 'undefined') {
      return Boolean(isPaused);
    }

    const pauseBtn = byId('pauseBtn');
    return pauseBtn ? /(恢复|Resume)/.test(pauseBtn.textContent) : false;
  }

  function applyLaunchState() {
    const stateNode = byId('satState');
    if (stateNode) {
      const nextText = translatePair(stateNode.textContent, launchStates);
      if (nextText !== stateNode.textContent) {
        stateNode.textContent = nextText;
      }
    }
  }

  function applyLaunch() {
    if (!byId('mission-params-panel')) {
      return;
    }

    const text = launchText[currentLang];
    document.title = text.title;
    setText(byId('backToMainBtn'), text.back);
    setText(byId('pauseBtn'), isLaunchPaused() ? text.resume : text.pause);
    setText(byId('resetBtn'), text.reset);
    setText(byId('applyOrbitSpeed'), text.matchOrbit);
    setText(byId('autoCaptureBtn'), text.autoCapture);
    setText(byId('viewFreeBtn'), text.free);
    setText(byId('viewSatBtn'), text.satellite);
    setText(byId('viewMoonBtn'), text.moon);
    setText(byId('label-earth'), text.earthLabel);
    setText(byId('label-moon'), text.moonLabel);
    setText(byId('label-sat'), text.satLabel);

    const statusTextWrap = byId('simTime')?.parentElement;
    if (statusTextWrap) {
      const simValue = byId('simTime')?.textContent || '0.0';
      statusTextWrap.innerHTML = `${text.simDays}：<span id="simTime">${simValue}</span> ${text.simDaysUnit}`;
    }

    const missionTaskPanel = byId('mission-task-panel');
    if (missionTaskPanel) {
      missionTaskPanel.innerHTML =
        `<strong>${text.taskTitle}</strong><br />` +
        `${text.taskLines[0]}<br />${text.taskLines[1]}<br />${text.taskLines[2]}`;
    }

    const missionParamsPanel = byId('mission-params-panel');
    if (missionParamsPanel) {
      setText(missionParamsPanel.querySelector('h4'), text.paramsTitle);

      const labels = missionParamsPanel.querySelectorAll('label');
      setText(labels[0], text.satelliteMass);
      setText(labels[1], text.thrust);
      setText(labels[2], text.timeScale);

      setText(byId('thrustControlInfo'), text.thrustInfo);

      const metrics = missionParamsPanel.querySelectorAll('strong');
      setText(metrics[0], text.moonMass);
      setText(metrics[1], text.moonVel);
      setText(metrics[2], text.satVel);
      setText(metrics[3], text.satState);
      setText(metrics[4], text.earthForce);
      setText(metrics[5], text.moonForce);
    }

    const viewTitle = byId('mission-view-panel')?.querySelector('span');
    if (viewTitle) {
      viewTitle.textContent = `${text.view}：`;
    }

    applyLaunchState();
  }

  function isLabSimulating() {
    return typeof isSimulating !== 'undefined' ? Boolean(isSimulating) : byId('simulate-btn')?.classList.contains('simulating');
  }

  function isLabShowingNames() {
    return typeof showPlanetNames !== 'undefined' ? Boolean(showPlanetNames) : !/显示|Show/.test(byId('toggle-names-btn')?.textContent || '');
  }

  function isLabShowingTrails() {
    return typeof showTrajectories !== 'undefined' ? Boolean(showTrajectories) : !/显示|Show/.test(byId('toggle-trajectories-btn')?.textContent || '');
  }


  function applyLab() {
    if (!byId('sidebar-panel')) {
      return;
    }

    const text = labText[currentLang];
    document.title = text.title;

    setText(document.querySelector('.drag-hint__content strong'), text.hintTitle);
    setText(document.querySelector('.drag-hint__content span'), text.hintBody);
    setText(document.querySelector('.panel-eyebrow'), text.eyebrow);
    setText(document.querySelector('.panel-intro h4'), text.panelTitle);
    setText(document.querySelector('.panel-copy'), text.panelCopy);

    const metaSpans = document.querySelectorAll('.panel-meta span');
    text.meta.forEach((value, index) => {
      setText(metaSpans[index], value);
    });

    const sectionCards = document.querySelectorAll('.section-card');
    if (sectionCards[0]) {
      setText(sectionCards[0].querySelector('.section-label'), text.systemControl);
      setText(sectionCards[0].querySelector('.section-copy'), text.systemCopy);
    }
    if (sectionCards[1]) {
      setText(sectionCards[1].querySelector('.section-label'), text.bodyScale);
      setText(sectionCards[1].querySelector('.section-copy'), text.bodyScaleCopy);
    }
    if (sectionCards[2]) {
      setText(sectionCards[2].querySelector('.section-label'), text.addBodies);
      setText(sectionCards[2].querySelector('.section-copy'), text.addBodiesCopy);
      setText(sectionCards[2].querySelector('.sidebar-note'), text.addNote);
    }
    if (sectionCards[3]) {
      const listLabel = sectionCards[3].querySelector('.section-label');
      const countNode = byId('planet-count');
      const countText = countNode ? countNode.textContent : '(0)';
      if (listLabel) {
        listLabel.innerHTML = `${text.addedBodies} <span id="planet-count">${countText}</span>`;
      }
      setText(sectionCards[3].querySelector('.section-copy'), text.addedBodiesCopy);
    }
    if (sectionCards[4]) {
      setText(sectionCards[4].querySelector('.sidebar-note'), text.ctaNote);
    }

    setText(byId('change-g-btn'), text.changeG);
    setText(byId('toggle-names-btn'), isLabShowingNames() ? text.hideNames : text.showNames);
    setText(byId('toggle-trajectories-btn'), isLabShowingTrails() ? text.hideTrails : text.showTrails);
    setText(byId('apply-radius-scale-btn'), text.apply);
    setText(byId('add-custom-planet-btn'), text.addCustom);
    setText(byId('add-default-planet-btn'), text.addDefault);
    setText(byId('simulate-btn'), isLabSimulating() ? text.pauseSim : text.startSim);
    setText(document.querySelector('#time-control-panel .time-note'), text.timeNote);

    const timeLabel = byId('time-label');
    if (timeLabel) {
      const rawValue = byId('time-slider')?.value || timeLabel.textContent.match(/[\d.]+/)?.[0] || '1';
      timeLabel.textContent = `${text.timeLabel}: ${Number.parseFloat(rawValue).toFixed(1)}x`;
    }

    const countNode = byId('planet-count');
    if (countNode && typeof planetObjs !== 'undefined') {
      countNode.textContent = currentLang === 'en' ? `(${planetObjs.length})` : `(${planetObjs.length}${text.countSuffix})`;
    }

    document.querySelectorAll('.edit-btn').forEach((node) => setText(node, text.edit));
    document.querySelectorAll('.delete-btn').forEach((node) => setText(node, text.remove));

    const sidebarToggle = byId('sidebar-toggle-btn');
    if (sidebarToggle) {
      sidebarToggle.setAttribute('title', text.sidebarToggle);
    }
  }

  function wireSolar() {
    if (!byId('time-scale-controls')) {
      return;
    }

    if (typeof showPlanetInfo === 'function' && !showPlanetInfo.__legacyI18nWrapped) {
      const originalShowPlanetInfo = showPlanetInfo;
      showPlanetInfo = function wrappedShowPlanetInfo(name) {
        const result = originalShowPlanetInfo.apply(this, arguments);
        applySolarInfo(name);
        return result;
      };
      showPlanetInfo.__legacyI18nWrapped = true;
    }

    if (typeof applyInfoPanelCollapsedState === 'function' && !applyInfoPanelCollapsedState.__legacyI18nWrapped) {
      const originalApplyInfoPanelCollapsedState = applyInfoPanelCollapsedState;
      applyInfoPanelCollapsedState = function wrappedApplyInfoPanelCollapsedState() {
        const result = originalApplyInfoPanelCollapsedState.apply(this, arguments);
        applySolarToggle();
        return result;
      };
      applyInfoPanelCollapsedState.__legacyI18nWrapped = true;
    }

    if (typeof showNotification === 'function' && !showNotification.__legacyI18nWrapped) {
      const originalShowNotification = showNotification;
      showNotification = function wrappedShowNotification(message) {
        const normalized = /Solar system loaded successfully|Model loaded successfully|太阳系模型加载完成|模型加载完成/.test(String(message))
          ? solarText[currentLang].loaded
          : message;
        return originalShowNotification.call(this, normalized);
      };
      showNotification.__legacyI18nWrapped = true;
    }

    byId('planet-select')?.addEventListener('change', () => window.setTimeout(() => applySolarInfo(), 0));
    byId('planet-info-toggle')?.addEventListener('click', () => window.setTimeout(() => applySolarToggle(), 0));
    byId('pause-btn')?.addEventListener('click', () => window.setTimeout(() => applySolar(), 0));
    byId('time-scale-slider')?.addEventListener('input', () => window.setTimeout(() => applySolar(), 0));

    if (document.body && !document.body.__solarLabelObserver) {
      const observer = new MutationObserver(() => syncSolarLabelNodes());
      observer.observe(document.body, { childList: true });
      document.body.__solarLabelObserver = observer;
    }

    applySolar();
  }

  function wireLaunch() {
    if (!byId('mission-params-panel')) {
      return;
    }

    byId('pauseBtn')?.addEventListener('click', () => window.setTimeout(() => applyLaunch(), 0));
    byId('timeSlider')?.addEventListener('input', () => window.setTimeout(() => applyLaunch(), 0));

    const stateNode = byId('satState');
    if (stateNode && !stateNode.__legacyI18nObserved) {
      const observer = new MutationObserver(() => applyLaunchState());
      observer.observe(stateNode, { childList: true, characterData: true, subtree: true });
      stateNode.__legacyI18nObserved = true;
    }

    applyLaunch();
  }

  function wireLab() {
    if (!byId('sidebar-panel')) {
      return;
    }

    if (typeof toggleSimulation === 'function' && !toggleSimulation.__legacyI18nWrapped) {
      const originalToggleSimulation = toggleSimulation;
      toggleSimulation = function wrappedToggleSimulation() {
        const result = originalToggleSimulation.apply(this, arguments);
        applyLab();
        return result;
      };
      toggleSimulation.__legacyI18nWrapped = true;
    }

    if (typeof toggleTrajectories === 'function' && !toggleTrajectories.__legacyI18nWrapped) {
      const originalToggleTrajectories = toggleTrajectories;
      toggleTrajectories = function wrappedToggleTrajectories() {
        const result = originalToggleTrajectories.apply(this, arguments);
        applyLab();
        return result;
      };
      toggleTrajectories.__legacyI18nWrapped = true;
    }

    if (typeof updatePlanetList === 'function' && !updatePlanetList.__legacyI18nWrapped) {
      const originalUpdatePlanetList = updatePlanetList;
      updatePlanetList = function wrappedUpdatePlanetList() {
        const result = originalUpdatePlanetList.apply(this, arguments);
        applyLab();
        return result;
      };
      updatePlanetList.__legacyI18nWrapped = true;
    }

    byId('toggle-names-btn')?.addEventListener('click', () => window.setTimeout(() => applyLab(), 0));
    byId('time-slider')?.addEventListener('input', () => window.setTimeout(() => applyLab(), 0));
    byId('sidebar-toggle-btn')?.addEventListener('click', () => window.setTimeout(() => applyLab(), 0));

    applyLab();
  }

  function applyPage() {
    applySolar();
    applyLaunch();
    applyLab();
  }

  window.addEventListener('message', (event) => {
    if (event.origin !== window.location.origin) {
      return;
    }

    if (event.data && event.data.type === 'site-chrome' && (event.data.lang === 'zh' || event.data.lang === 'en')) {
      setLang(event.data.lang);
    }
  });

  window.addEventListener('storage', (event) => {
    if (event.key === storageKey && event.newValue) {
      setLang(event.newValue);
    }
  });

  wireSolar();
  wireLaunch();
  wireLab();
})();

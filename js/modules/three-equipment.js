/* ==========================================================================
   CHEMVIRTUAL LAB - MODUL 4: 3D THREE.JS APPARATUS, REAL CAMERA AR & QR SCANNER
   Pengembangan Pembelajaran Berbasis Multimedia (S2 MTP FATMA)
   ========================================================================== */

class ThreeEquipmentModule {
  constructor() {
    this.currentEquipId = 'pipette_dropper'; // Default ke pipet tetes untuk inspeksi awal
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.currentMeshGroup = null;
    this.isAutoRotate = true;
    this.isWireframe = false;
    this.isVRMode = false;
    this.isARMode = false;
    this.animationFrameId = null;

    // Bunsen burner flame animation
    this.bunsenFlame = null;
    this.flameClock = null;

    // Mouse / Touch drag & zoom state
    this.isDragging = false;
    this.previousMousePosition = { x: 0, y: 0 };
    this.modelPosition = { x: 0, y: 0, z: 0 };
    this.modelScale = 1.0;

    // Live Camera AR Stream
    this.arMediaStream = null;
    this.arVideoElement = null;

    // QR Code Scanner State
    this.scannerMediaStream = null;
    this.scannerVideoElement = null;
    this.scannerCanvas = null;
    this.scannerCanvasCtx = null;
    this.scannerIntervalId = null;
    this.isScanning = false;

    // Modal 3D Apparatus Viewer & Real AR State (Maksimal 19 Alat)
    this.modalScene = null;
    this.modalCamera = null;
    this.modalRenderer = null;
    this.modalCurrentMeshGroup = null;
    this.modalCurrentEquipId = null;
    this.modalIsAutoRotate = true;
    this.modalIsWireframe = false;
    this.modalModelScale = 1.0;
    this.modalIsDragging = false;
    this.modalPreviousMousePosition = { x: 0, y: 0 };
    this.modalAnimId = null;
    this.modalGridHelper = null;
    this.modalBunsenFlame = null;
    this.modalARMediaStream = null;
    this.modalARVideoElement = null;
    this.modalIsARMode = false;
    this.modalInitialized = false;

    // Urutan 19 Alat Laboratorium Kimia untuk Navigasi Cepat di Modal
    this.apparatusOrder = [
      'measuring_cylinder',
      'pipette_volumetric',
      'pipette_graduated',
      'burette',
      'volumetric_flask',
      'test_tube',
      'beaker',
      'erlenmeyer',
      'evaporating_dish',
      'watch_glass_rod',
      'crucible',
      'bunsen_burner',
      'tripod_gauze',
      'test_tube_clamp',
      'test_tube_rack',
      'funnel',
      'digital_balance',
      'ph_meter',
      'thermometer'
    ];

    // Expose global open handler
    window.openApparatus3DModal = (equipId) => this.openApparatusModal(equipId);
  }

  init() {
    this.flameClock = new THREE.Clock();
    this.renderEquipmentSelector();
    this.renderGHSSymbols();
    this.initThreeViewer();
    this.loadApparatusModel(this.currentEquipId);
    this.setupEventListeners();
    this.initScannerModal();
    this.initARCardModal();
    this.initModalEventListeners();
  }

  initThreeViewer() {
    const container = document.getElementById('three-canvas-container');
    if (!container) return;

    const width = container.clientWidth || 600;
    const height = container.clientHeight || 460;

    // Scene
    this.scene = new THREE.Scene();

    // Camera
    this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    this.camera.position.set(0, 2.5, 9.5);
    this.camera.lookAt(0, 0, 0);

    // Renderer dengan alpha transparan untuk Mode AR
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.innerHTML = '';
    container.appendChild(this.renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    this.scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0x38bdf8, 0.9);
    dirLight1.position.set(6, 12, 8);
    this.scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0xffffff, 0.7);
    dirLight2.position.set(-6, -4, -6);
    this.scene.add(dirLight2);

    const pointLight = new THREE.PointLight(0xffffff, 0.5, 20);
    pointLight.position.set(0, 4, 4);
    this.scene.add(pointLight);

    // Grid Floor
    this.gridHelper = new THREE.GridHelper(12, 12, 0x0284c7, 0x334155);
    this.gridHelper.position.y = -2.5;
    this.scene.add(this.gridHelper);

    // Resize handler
    window.addEventListener('resize', () => {
      if (!container || !this.camera || !this.renderer) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      this.camera.aspect = w / h;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(w, h);
    });

    // Mouse and Touch Interaction
    const dom = this.renderer.domElement;
    
    // Mouse
    dom.addEventListener('mousedown', (e) => {
      this.isDragging = true;
      this.previousMousePosition = { x: e.clientX, y: e.clientY };
    });
    window.addEventListener('mouseup', () => { this.isDragging = false; });
    window.addEventListener('mousemove', (e) => {
      if (!this.isDragging || !this.currentMeshGroup) return;
      const deltaX = e.clientX - this.previousMousePosition.x;
      const deltaY = e.clientY - this.previousMousePosition.y;

      if (e.shiftKey || this.isARMode) {
        // Shift + Drag = Translate (Pindah Posisi di AR)
        this.currentMeshGroup.position.x += deltaX * 0.01;
        this.currentMeshGroup.position.y -= deltaY * 0.01;
      } else {
        // Normal Drag = Rotate
        this.currentMeshGroup.rotation.y += deltaX * 0.01;
        this.currentMeshGroup.rotation.x += deltaY * 0.01;
      }

      this.previousMousePosition = { x: e.clientX, y: e.clientY };
    });

    // Touch support untuk Mobile / Tablet AR
    let initialTouchDist = null;
    dom.addEventListener('touchstart', (e) => {
      if (e.touches.length === 1) {
        this.isDragging = true;
        this.previousMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      } else if (e.touches.length === 2) {
        initialTouchDist = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
      }
    }, { passive: true });

    dom.addEventListener('touchmove', (e) => {
      if (e.touches.length === 1 && this.isDragging && this.currentMeshGroup) {
        const deltaX = e.touches[0].clientX - this.previousMousePosition.x;
        const deltaY = e.touches[0].clientY - this.previousMousePosition.y;

        if (this.isARMode) {
          this.currentMeshGroup.position.x += deltaX * 0.012;
          this.currentMeshGroup.position.y -= deltaY * 0.012;
        } else {
          this.currentMeshGroup.rotation.y += deltaX * 0.012;
          this.currentMeshGroup.rotation.x += deltaY * 0.012;
        }
        this.previousMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      } else if (e.touches.length === 2 && initialTouchDist && this.currentMeshGroup) {
        const dist = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
        const scaleFactor = dist / initialTouchDist;
        this.modelScale = Math.max(0.4, Math.min(2.5, this.modelScale * scaleFactor));
        this.currentMeshGroup.scale.set(this.modelScale, this.modelScale, this.modelScale);
        initialTouchDist = dist;
      }
    }, { passive: true });

    dom.addEventListener('touchend', () => {
      this.isDragging = false;
      initialTouchDist = null;
    });

    // Zoom on wheel
    dom.addEventListener('wheel', (e) => {
      e.preventDefault();
      if (this.isARMode && this.currentMeshGroup) {
        // Zoom di AR = Resize Skala Objek
        const factor = e.deltaY > 0 ? 0.95 : 1.05;
        this.modelScale = Math.max(0.3, Math.min(3.0, this.modelScale * factor));
        this.currentMeshGroup.scale.set(this.modelScale, this.modelScale, this.modelScale);
      } else {
        this.camera.position.z += e.deltaY * 0.005;
        this.camera.position.z = Math.max(3.5, Math.min(18, this.camera.position.z));
      }
    }, { passive: false });

    // Loop
    this.animate();
  }

  animate() {
    this.animationFrameId = requestAnimationFrame(() => this.animate());

    // Auto rotate bila tidak sedang di-drag dan tidak di mode AR
    if (this.currentMeshGroup && this.isAutoRotate && !this.isDragging) {
      this.currentMeshGroup.rotation.y += 0.008;
    }

    // Bunsen Flame Dynamic Animation
    if (this.bunsenFlame) {
      const elapsed = this.flameClock.getElapsedTime();
      const flicker = 1 + Math.sin(elapsed * 15) * 0.06 + Math.cos(elapsed * 23) * 0.04;
      this.bunsenFlame.scale.set(flicker, 1 + Math.sin(elapsed * 10) * 0.08, flicker);
    }

    if (this.renderer && this.scene && this.camera) {
      this.renderer.render(this.scene, this.camera);
    }
  }

  /* ==========================================================================
     PEMODELAN 3D AKURAT & REALISTIS UNTUK SELURUH 19 ALAT PRAKTIKUM
     ========================================================================== */
  buildApparatus3DGroup(equipId, isWireframe) {
    const data = LAB_EQUIPMENT_DATA.find(e => e.id === equipId) || LAB_EQUIPMENT_DATA[0];
    const group = new THREE.Group();
    let bunsenFlame = null;

    // Material Kaca Realistis
    const glassMaterial = new THREE.MeshPhysicalMaterial({
      color: data.color || 0xbae6fd,
      transparent: true,
      opacity: data.opacity || 0.45,
      roughness: 0.08,
      metalness: 0.05,
      transmission: 0.92,
      ior: 1.5,
      clearcoat: 0.6,
      wireframe: isWireframe
    });

    const liquidMaterial = new THREE.MeshStandardMaterial({
      color: 0x0284c7,
      transparent: true,
      opacity: 0.75,
      roughness: 0.15,
      wireframe: isWireframe
    });

    const metalMaterial = new THREE.MeshStandardMaterial({
      color: 0x94a3b8,
      metalness: 0.85,
      roughness: 0.25,
      wireframe: isWireframe
    });

    const brassMaterial = new THREE.MeshStandardMaterial({
      color: 0xd97706,
      metalness: 0.75,
      roughness: 0.35,
      wireframe: isWireframe
    });

    const woodMaterial = new THREE.MeshStandardMaterial({
      color: 0xb45309,
      roughness: 0.65,
      metalness: 0.05,
      wireframe: isWireframe
    });

    const porcelainMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xf8fafc,
      roughness: 0.2,
      metalness: 0.05,
      clearcoat: 0.5,
      wireframe: isWireframe
    });

    const modelType = data.modelType || equipId;

    switch (modelType) {
      /* 1. PIPET TETES (PASTEUR DROPPER) */
      case 'pipette_dropper': {
        const dropperGroup = new THREE.Group();
        const bulbGeom = new THREE.CylinderGeometry(0.48, 0.42, 1.2, 32);
        const bulbMat = new THREE.MeshStandardMaterial({ color: 0xdc2626, roughness: 0.65, wireframe: isWireframe });
        const bulbMesh = new THREE.Mesh(bulbGeom, bulbMat);
        bulbMesh.position.y = 2.1;

        const bulbTopGeom = new THREE.SphereGeometry(0.48, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2);
        const bulbTopMesh = new THREE.Mesh(bulbTopGeom, bulbMat);
        bulbTopMesh.position.y = 2.7;

        const collarGeom = new THREE.TorusGeometry(0.44, 0.08, 16, 32);
        const collarMesh = new THREE.Mesh(collarGeom, bulbMat);
        collarMesh.rotation.x = Math.PI / 2;
        collarMesh.position.y = 1.5;

        const stemGeom = new THREE.CylinderGeometry(0.18, 0.18, 2.6, 32, 1, true);
        const stemMesh = new THREE.Mesh(stemGeom, glassMaterial);
        stemMesh.position.y = 0.2;

        const tipGeom = new THREE.CylinderGeometry(0.18, 0.05, 1.6, 32, 1, true);
        const tipMesh = new THREE.Mesh(tipGeom, glassMaterial);
        tipMesh.position.y = -1.9;

        const liquidGeom = new THREE.CylinderGeometry(0.14, 0.14, 1.2, 24);
        const liquidMesh = new THREE.Mesh(liquidGeom, liquidMaterial);
        liquidMesh.position.y = -0.4;

        const tipLiqGeom = new THREE.CylinderGeometry(0.14, 0.04, 1.0, 24);
        const tipLiqMesh = new THREE.Mesh(tipLiqGeom, liquidMaterial);
        tipLiqMesh.position.y = -1.5;

        const dropGeom = new THREE.SphereGeometry(0.1, 16, 16);
        const dropMesh = new THREE.Mesh(dropGeom, liquidMaterial);
        dropMesh.position.y = -2.8;

        dropperGroup.add(bulbMesh, bulbTopMesh, collarMesh, stemMesh, tipMesh, liquidMesh, tipLiqMesh, dropMesh);
        group.add(dropperGroup);
        break;
      }

      /* 2. LABU UKUR / LABU TAKAR (VOLUMETRIC FLASK) */
      case 'volumetric_flask': {
        const flaskGroup = new THREE.Group();
        const points = [];
        points.push(new THREE.Vector2(0, -2.0));
        points.push(new THREE.Vector2(1.2, -2.0));
        points.push(new THREE.Vector2(1.7, -1.6));
        points.push(new THREE.Vector2(1.9, -1.0));
        points.push(new THREE.Vector2(1.8, -0.3));
        points.push(new THREE.Vector2(1.2, 0.5));
        points.push(new THREE.Vector2(0.38, 1.3));
        points.push(new THREE.Vector2(0.38, 3.2));
        points.push(new THREE.Vector2(0.48, 3.35));

        const latheGeom = new THREE.LatheGeometry(points, 48);
        const flaskMesh = new THREE.Mesh(latheGeom, glassMaterial);

        const ringGeom = new THREE.TorusGeometry(0.39, 0.02, 16, 48);
        const ringMat = new THREE.MeshBasicMaterial({ color: 0xe11d48, wireframe: isWireframe });
        const ringMesh = new THREE.Mesh(ringGeom, ringMat);
        ringMesh.rotation.x = Math.PI / 2;
        ringMesh.position.y = 2.3;

        const stopperGeom = new THREE.CylinderGeometry(0.42, 0.32, 0.6, 32);
        const stopperMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.3 });
        const stopperMesh = new THREE.Mesh(stopperGeom, stopperMat);
        stopperMesh.position.y = 3.6;

        const stopperTopGeom = new THREE.BoxGeometry(0.85, 0.15, 0.4);
        const stopperTopMesh = new THREE.Mesh(stopperTopGeom, stopperMat);
        stopperTopMesh.position.y = 3.95;

        const liqPoints = [];
        liqPoints.push(new THREE.Vector2(0, -1.95));
        liqPoints.push(new THREE.Vector2(1.15, -1.95));
        liqPoints.push(new THREE.Vector2(1.65, -1.6));
        liqPoints.push(new THREE.Vector2(1.85, -1.0));
        liqPoints.push(new THREE.Vector2(1.75, -0.3));
        liqPoints.push(new THREE.Vector2(1.15, 0.5));
        liqPoints.push(new THREE.Vector2(0.36, 1.3));
        liqPoints.push(new THREE.Vector2(0.36, 2.3));

        const liqGeom = new THREE.LatheGeometry(liqPoints, 36);
        const flaskLiqMesh = new THREE.Mesh(liqGeom, liquidMaterial);

        flaskGroup.add(flaskMesh, ringMesh, stopperMesh, stopperTopMesh, flaskLiqMesh);
        group.add(flaskGroup);
        break;
      }

      /* 3. TABUNG REAKSI TUNGGAL DENGAN PENJEPIT & LARUTAN (TEST TUBE) */
      case 'test_tube': {
        const tubeGroup = new THREE.Group();
        const tGeom = new THREE.CylinderGeometry(0.42, 0.42, 3.8, 32, 1, true);
        const tMesh = new THREE.Mesh(tGeom, glassMaterial);
        tMesh.position.y = 0.3;

        const bottomGeom = new THREE.SphereGeometry(0.42, 32, 16, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2);
        const bottomMesh = new THREE.Mesh(bottomGeom, glassMaterial);
        bottomMesh.position.y = -1.6;

        const rimGeom = new THREE.TorusGeometry(0.43, 0.05, 16, 32);
        const rimMesh = new THREE.Mesh(rimGeom, glassMaterial);
        rimMesh.rotation.x = Math.PI / 2;
        rimMesh.position.y = 2.2;

        const liqMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, transparent: true, opacity: 0.82, roughness: 0.15 });
        const liqGeom = new THREE.CylinderGeometry(0.38, 0.38, 2.0, 24);
        const liqMesh = new THREE.Mesh(liqGeom, liqMat);
        liqMesh.position.y = -0.6;

        const liqBottomGeom = new THREE.SphereGeometry(0.38, 24, 16, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2);
        const liqBottomMesh = new THREE.Mesh(liqBottomGeom, liqMat);
        liqBottomMesh.position.y = -1.6;

        const meniscusGeom = new THREE.TorusGeometry(0.38, 0.02, 16, 32);
        const meniscusMesh = new THREE.Mesh(meniscusGeom, new THREE.MeshBasicMaterial({ color: 0x38bdf8 }));
        meniscusMesh.rotation.x = Math.PI / 2;
        meniscusMesh.position.y = 0.4;

        const clampBodyGeom = new THREE.BoxGeometry(3.0, 0.28, 0.35);
        const clampBodyMesh = new THREE.Mesh(clampBodyGeom, woodMaterial);
        clampBodyMesh.position.set(1.4, 1.3, 0);

        const springGeom = new THREE.TorusGeometry(0.2, 0.05, 12, 24);
        const springMesh = new THREE.Mesh(springGeom, metalMaterial);
        springMesh.position.set(0.8, 1.3, 0);

        tubeGroup.add(tMesh, bottomMesh, rimMesh, liqMesh, liqBottomMesh, meniscusMesh, clampBodyMesh, springMesh);
        group.add(tubeGroup);
        break;
      }

      /* 4. RAK TABUNG REAKSI & 4 TABUNG (TEST TUBE RACK) */
      case 'test_tube_rack': {
        const rackGroup = new THREE.Group();
        const baseGeom = new THREE.BoxGeometry(6.4, 0.35, 2.2);
        const baseMesh = new THREE.Mesh(baseGeom, woodMaterial);
        baseMesh.position.y = -1.8;

        const shelfGeom = new THREE.BoxGeometry(6.4, 0.3, 2.2);
        const shelfMesh = new THREE.Mesh(shelfGeom, woodMaterial);
        shelfMesh.position.y = 0.2;

        const pillarGeom = new THREE.CylinderGeometry(0.18, 0.18, 2.0, 16);
        const p1 = new THREE.Mesh(pillarGeom, woodMaterial);
        p1.position.set(-2.9, -0.8, -0.8);
        const p2 = new THREE.Mesh(pillarGeom, woodMaterial);
        p2.position.set(-2.9, -0.8, 0.8);
        const p3 = new THREE.Mesh(pillarGeom, woodMaterial);
        p3.position.set(2.9, -0.8, -0.8);
        const p4 = new THREE.Mesh(pillarGeom, woodMaterial);
        p4.position.set(2.9, -0.8, 0.8);

        rackGroup.add(baseMesh, shelfMesh, p1, p2, p3, p4);

        const tubeColors = [0x0284c7, 0xea580c, 0x10b981, 0xa855f7];
        const xPositions = [-2.1, -0.7, 0.7, 2.1];

        for (let i = 0; i < 4; i++) {
          const tGroup = new THREE.Group();
          tGroup.position.set(xPositions[i], 0, 0);

          const tGeom = new THREE.CylinderGeometry(0.35, 0.35, 3.2, 24, 1, true);
          const tMesh = new THREE.Mesh(tGeom, glassMaterial);
          tMesh.position.y = 0.1;

          const bottomGeom = new THREE.SphereGeometry(0.35, 24, 16, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2);
          const bottomMesh = new THREE.Mesh(bottomGeom, glassMaterial);
          bottomMesh.position.y = -1.5;

          const rimGeom = new THREE.TorusGeometry(0.36, 0.04, 16, 24);
          const rimMesh = new THREE.Mesh(rimGeom, glassMaterial);
          rimMesh.rotation.x = Math.PI / 2;
          rimMesh.position.y = 1.7;

          const liqMat = new THREE.MeshStandardMaterial({ color: tubeColors[i], transparent: true, opacity: 0.8 });
          const tLiqGeom = new THREE.CylinderGeometry(0.32, 0.32, 1.4, 24);
          const tLiqMesh = new THREE.Mesh(tLiqGeom, liqMat);
          tLiqMesh.position.y = -0.8;

          const tLiqBottomGeom = new THREE.SphereGeometry(0.32, 24, 16, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2);
          const tLiqBottomMesh = new THREE.Mesh(tLiqBottomGeom, liqMat);
          tLiqBottomMesh.position.y = -1.5;

          tGroup.add(tMesh, bottomMesh, rimMesh, tLiqMesh, tLiqBottomMesh);
          rackGroup.add(tGroup);
        }

        group.add(rackGroup);
        break;
      }

      /* 5. PEMBAKAR BUNSEN (BUNSEN BURNER) */
      case 'bunsen_burner': {
        const bunsenGroup = new THREE.Group();
        const baseGeom = new THREE.CylinderGeometry(1.6, 1.8, 0.5, 32);
        const baseMesh = new THREE.Mesh(baseGeom, new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.85, roughness: 0.4 }));
        baseMesh.position.y = -1.9;

        const inletGeom = new THREE.CylinderGeometry(0.12, 0.12, 1.2, 16);
        const inletMesh = new THREE.Mesh(inletGeom, brassMaterial);
        inletMesh.rotation.z = Math.PI / 2;
        inletMesh.position.set(-1.0, -1.5, 0);

        const hoseCurve = new THREE.CatmullRomCurve3([
          new THREE.Vector3(-1.6, -1.5, 0),
          new THREE.Vector3(-2.4, -1.7, 0.2),
          new THREE.Vector3(-2.8, -2.1, 0.4),
          new THREE.Vector3(-3.2, -2.3, 0.6)
        ]);
        const hoseGeom = new THREE.TubeGeometry(hoseCurve, 20, 0.1, 8, false);
        const hoseMesh = new THREE.Mesh(hoseGeom, new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.8 }));

        const collarGeom = new THREE.CylinderGeometry(0.52, 0.52, 0.6, 24);
        const collarMesh = new THREE.Mesh(collarGeom, brassMaterial);
        collarMesh.position.y = -1.1;

        const holeGeom = new THREE.CylinderGeometry(0.15, 0.15, 0.6, 16);
        const holeMat = new THREE.MeshBasicMaterial({ color: 0x0f172a });
        const holeMesh1 = new THREE.Mesh(holeGeom, holeMat);
        holeMesh1.rotation.z = Math.PI / 2;
        holeMesh1.position.set(0, -1.1, 0);

        const chimneyGeom = new THREE.CylinderGeometry(0.38, 0.38, 2.6, 32);
        const chimneyMesh = new THREE.Mesh(chimneyGeom, metalMaterial);
        chimneyMesh.position.y = 0.4;

        const topRingGeom = new THREE.TorusGeometry(0.4, 0.06, 16, 32);
        const topRingMesh = new THREE.Mesh(topRingGeom, metalMaterial);
        topRingMesh.rotation.x = Math.PI / 2;
        topRingMesh.position.y = 1.7;

        // Nyala Api Biru Dinamis
        const flameGroup = new THREE.Group();
        flameGroup.position.y = 1.75;

        const flameOuterGeom = new THREE.ConeGeometry(0.55, 2.2, 24);
        const flameOuterMat = new THREE.MeshBasicMaterial({
          color: 0x0284c7,
          transparent: true,
          opacity: 0.55,
          wireframe: isWireframe
        });
        const flameOuterMesh = new THREE.Mesh(flameOuterGeom, flameOuterMat);
        flameOuterMesh.position.y = 1.1;

        const flameInnerGeom = new THREE.ConeGeometry(0.3, 1.2, 24);
        const flameInnerMat = new THREE.MeshBasicMaterial({
          color: 0x67e8f9,
          transparent: true,
          opacity: 0.85,
          wireframe: isWireframe
        });
        const flameInnerMesh = new THREE.Mesh(flameInnerGeom, flameInnerMat);
        flameInnerMesh.position.y = 0.6;

        flameGroup.add(flameOuterMesh, flameInnerMesh);
        bunsenFlame = flameGroup;

        bunsenGroup.add(baseMesh, inletMesh, hoseMesh, collarMesh, holeMesh1, chimneyMesh, topRingMesh, flameGroup);
        group.add(bunsenGroup);
        break;
      }

      /* 6. CORONG KACA & KERTAS SARING (GLASS FUNNEL & FILTER PAPER) */
      case 'funnel': {
        const funnelGroup = new THREE.Group();
        const coneGeom = new THREE.CylinderGeometry(2.1, 0.35, 2.2, 36, 1, true);
        const coneMesh = new THREE.Mesh(coneGeom, glassMaterial);
        coneMesh.position.y = 0.8;

        const rimGeom = new THREE.TorusGeometry(2.1, 0.06, 16, 36);
        const rimMesh = new THREE.Mesh(rimGeom, glassMaterial);
        rimMesh.rotation.x = Math.PI / 2;
        rimMesh.position.y = 1.9;

        const stemGeom = new THREE.CylinderGeometry(0.28, 0.28, 2.6, 24, 1, true);
        const stemMesh = new THREE.Mesh(stemGeom, glassMaterial);
        stemMesh.position.y = -1.4;

        const tipGeom = new THREE.CylinderGeometry(0.28, 0.08, 0.4, 24, 1, true);
        const tipMesh = new THREE.Mesh(tipGeom, glassMaterial);
        tipMesh.position.y = -2.8;

        const paperGeom = new THREE.CylinderGeometry(1.85, 0.32, 1.8, 36, 1, true);
        const paperMat = new THREE.MeshStandardMaterial({
          color: 0xf8fafc,
          roughness: 0.8,
          side: THREE.DoubleSide,
          wireframe: isWireframe
        });
        const paperMesh = new THREE.Mesh(paperGeom, paperMat);
        paperMesh.position.y = 0.7;

        const dropGeom = new THREE.SphereGeometry(0.12, 16, 16);
        const dropMesh = new THREE.Mesh(dropGeom, liquidMaterial);
        dropMesh.position.y = -3.2;

        funnelGroup.add(coneMesh, rimMesh, stemMesh, tipMesh, paperMesh, dropMesh);
        group.add(funnelGroup);
        break;
      }

      /* 7. GELAS KIMIA / BEKER (BEAKER) */
      case 'beaker':
      case 'cylinder_open': {
        const beakerGroup = new THREE.Group();
        const rTop = data.dim?.radiusTop || 1.8;
        const rBottom = data.dim?.radiusBottom || 1.7;
        const h = data.dim?.height || 3.2;

        const geometry = new THREE.CylinderGeometry(rTop, rBottom, h, 36, 1, true);
        const mesh = new THREE.Mesh(geometry, glassMaterial);

        const bottomGeom = new THREE.CircleGeometry(rBottom, 36);
        const bottomMesh = new THREE.Mesh(bottomGeom, glassMaterial);
        bottomMesh.rotation.x = Math.PI / 2;
        bottomMesh.position.y = -h / 2;

        const rimGeom = new THREE.TorusGeometry(rTop, 0.06, 16, 36);
        const rimMesh = new THREE.Mesh(rimGeom, glassMaterial);
        rimMesh.rotation.x = Math.PI / 2;
        rimMesh.position.y = h / 2;

        for (let y = -0.6; y <= 0.8; y += 0.4) {
          const ring = new THREE.Mesh(
            new THREE.TorusGeometry(rTop * 0.99, 0.015, 8, 32),
            new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.8 })
          );
          ring.rotation.x = Math.PI / 2;
          ring.position.y = y;
          beakerGroup.add(ring);
        }

        const liqGeom = new THREE.CylinderGeometry(rBottom * 0.95, rBottom * 0.95, h * 0.55, 32);
        const liqMesh = new THREE.Mesh(liqGeom, liquidMaterial);
        liqMesh.position.y = -h * 0.22;

        beakerGroup.add(mesh, bottomMesh, rimMesh, liqMesh);
        group.add(beakerGroup);
        break;
      }

      /* 8. LABU ERLENMEYER (CONICAL FLASK) */
      case 'erlenmeyer':
      case 'cone_flask': {
        const erlenGroup = new THREE.Group();
        const rTop = data.dim?.radiusTop || 0.7;
        const rBottom = data.dim?.radiusBottom || 2.1;
        const h = data.dim?.height || 3.5;

        const coneGeom = new THREE.CylinderGeometry(rTop, rBottom, h * 0.75, 36, 1, true);
        const coneMesh = new THREE.Mesh(coneGeom, glassMaterial);

        const neckGeom = new THREE.CylinderGeometry(rTop, rTop, h * 0.35, 36, 1, true);
        const neckMesh = new THREE.Mesh(neckGeom, glassMaterial);
        neckMesh.position.y = h * 0.45;

        const rimGeom = new THREE.TorusGeometry(rTop, 0.05, 16, 36);
        const rimMesh = new THREE.Mesh(rimGeom, glassMaterial);
        rimMesh.rotation.x = Math.PI / 2;
        rimMesh.position.y = h * 0.62;

        const bottomGeom = new THREE.CircleGeometry(rBottom, 36);
        const bottomMesh = new THREE.Mesh(bottomGeom, glassMaterial);
        bottomMesh.rotation.x = Math.PI / 2;
        bottomMesh.position.y = -h * 0.375;

        const liqMat = new THREE.MeshStandardMaterial({ color: 0xf43f5e, transparent: true, opacity: 0.75 });
        const liqGeom = new THREE.CylinderGeometry(rTop * 1.5, rBottom * 0.94, h * 0.42, 32);
        const liqMesh = new THREE.Mesh(liqGeom, liqMat);
        liqMesh.position.y = -h * 0.16;

        erlenGroup.add(coneMesh, neckMesh, rimMesh, bottomMesh, liqMesh);
        group.add(erlenGroup);
        break;
      }

      /* 9. GELAS UKUR (GRADUATED CYLINDER) */
      case 'measuring_cylinder':
      case 'tall_cylinder': {
        const cylGroup = new THREE.Group();
        const rTop = data.dim?.radiusTop || 0.8;
        const rBottom = data.dim?.radiusBottom || 0.8;
        const h = data.dim?.height || 5.5;

        const cylGeom = new THREE.CylinderGeometry(rTop, rBottom, h, 36, 1, true);
        const cylMesh = new THREE.Mesh(cylGeom, glassMaterial);

        const baseGeom = new THREE.CylinderGeometry(rBottom * 1.8, rBottom * 2, 0.35, 6);
        const baseMesh = new THREE.Mesh(baseGeom, new THREE.MeshStandardMaterial({ color: 0x0284c7 }));
        baseMesh.position.y = -h / 2;

        const bumperGeom = new THREE.TorusGeometry(rTop * 1.15, 0.1, 16, 32);
        const bumperMesh = new THREE.Mesh(bumperGeom, new THREE.MeshStandardMaterial({ color: 0xf59e0b }));
        bumperMesh.rotation.x = Math.PI / 2;
        bumperMesh.position.y = h * 0.38;

        for (let y = -h * 0.35; y <= h * 0.35; y += 0.4) {
          const ring = new THREE.Mesh(
            new THREE.TorusGeometry(rTop * 0.99, 0.012, 8, 24),
            new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.8 })
          );
          ring.rotation.x = Math.PI / 2;
          ring.position.y = y;
          cylGroup.add(ring);
        }

        const liqGeom = new THREE.CylinderGeometry(rBottom * 0.9, rBottom * 0.9, h * 0.58, 32);
        const liqMesh = new THREE.Mesh(liqGeom, liquidMaterial);
        liqMesh.position.y = -h * 0.2;

        cylGroup.add(cylMesh, baseMesh, bumperMesh, liqMesh);
        group.add(cylGroup);
        break;
      }

      /* 10. BURET & STATIF (BURETTE RIG) */
      case 'burette':
      case 'burette_rig': {
        const buretteGroup = new THREE.Group();
        const pipeGeom = new THREE.CylinderGeometry(0.18, 0.18, 6.5, 32, 1, true);
        const pipeMesh = new THREE.Mesh(pipeGeom, glassMaterial);
        pipeMesh.position.x = 0.5;

        for (let y = -2.2; y <= 2.8; y += 0.35) {
          const mark = new THREE.Mesh(
            new THREE.TorusGeometry(0.185, 0.01, 8, 20),
            new THREE.MeshBasicMaterial({ color: 0x0284c7 })
          );
          mark.rotation.x = Math.PI / 2;
          mark.position.set(0.5, y, 0);
          buretteGroup.add(mark);
        }

        const stopcockGeom = new THREE.BoxGeometry(0.7, 0.25, 0.25);
        const stopcockMesh = new THREE.Mesh(stopcockGeom, new THREE.MeshStandardMaterial({ color: 0xef4444 }));
        stopcockMesh.position.set(0.5, -2.8, 0);

        const nozGeom = new THREE.CylinderGeometry(0.18, 0.05, 0.6, 16);
        const nozMesh = new THREE.Mesh(nozGeom, glassMaterial);
        nozMesh.position.set(0.5, -3.3, 0);

        const standPipe = new THREE.CylinderGeometry(0.12, 0.12, 7.5, 16);
        const standMesh = new THREE.Mesh(standPipe, new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.8 }));
        standMesh.position.set(-1.0, 0, 0);

        const clampGeom = new THREE.BoxGeometry(1.6, 0.2, 0.25);
        const clampMesh = new THREE.Mesh(clampGeom, new THREE.MeshStandardMaterial({ color: 0x64748b }));
        clampMesh.position.set(-0.2, 0.8, 0);

        const baseGeom = new THREE.BoxGeometry(3.6, 0.35, 2.5);
        const baseMesh = new THREE.Mesh(baseGeom, new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.7 }));
        baseMesh.position.set(-0.6, -3.7, 0);

        buretteGroup.add(pipeMesh, stopcockMesh, nozMesh, standMesh, clampMesh, baseMesh);
        group.add(buretteGroup);
        break;
      }

      /* 11. PIPET VOLUME / GONDOK (VOLUMETRIC PIPETTE) */
      case 'pipette_volumetric': {
        const vPipGroup = new THREE.Group();
        const topPipeGeom = new THREE.CylinderGeometry(0.14, 0.14, 2.2, 24, 1, true);
        const topPipeMesh = new THREE.Mesh(topPipeGeom, glassMaterial);
        topPipeMesh.position.y = 1.9;

        const calRing = new THREE.Mesh(
          new THREE.TorusGeometry(0.15, 0.015, 16, 24),
          new THREE.MeshBasicMaterial({ color: 0xe11d48 })
        );
        calRing.rotation.x = Math.PI / 2;
        calRing.position.y = 2.2;

        const bulbGeom = new THREE.SphereGeometry(0.8, 32, 24);
        bulbGeom.scale(1, 1.5, 1);
        const bulbMesh = new THREE.Mesh(bulbGeom, glassMaterial);
        bulbMesh.position.y = 0.2;

        const liqGeom = new THREE.SphereGeometry(0.74, 24, 20);
        liqGeom.scale(1, 1.4, 1);
        const liqMesh = new THREE.Mesh(liqGeom, liquidMaterial);
        liqMesh.position.y = 0.2;

        const btmPipeGeom = new THREE.CylinderGeometry(0.14, 0.05, 2.2, 24, 1, true);
        const btmPipeMesh = new THREE.Mesh(btmPipeGeom, glassMaterial);
        btmPipeMesh.position.y = -1.9;

        vPipGroup.add(topPipeMesh, calRing, bulbMesh, liqMesh, btmPipeMesh);
        group.add(vPipGroup);
        break;
      }

      /* 12. PIPET UKUR BERSKALA (GRADUATED PIPETTE) */
      case 'pipette_graduated': {
        const pGradGroup = new THREE.Group();
        const stemGeom = new THREE.CylinderGeometry(0.18, 0.18, 5.8, 32, 1, true);
        const stemMesh = new THREE.Mesh(stemGeom, glassMaterial);
        stemMesh.position.y = 0.2;

        const tipGeom = new THREE.CylinderGeometry(0.18, 0.05, 1.2, 32, 1, true);
        const tipMesh = new THREE.Mesh(tipGeom, glassMaterial);
        tipMesh.position.y = -3.1;

        const mouthGeom = new THREE.TorusGeometry(0.20, 0.03, 16, 24);
        const mouthMesh = new THREE.Mesh(mouthGeom, glassMaterial);
        mouthMesh.rotation.x = Math.PI / 2;
        mouthMesh.position.y = 3.1;

        for (let y = -2.2; y <= 2.2; y += 0.35) {
          const isMajor = Math.abs(Math.round(y * 10) % 7) === 0;
          const ring = new THREE.Mesh(
            new THREE.TorusGeometry(0.182, isMajor ? 0.012 : 0.007, 8, 24),
            new THREE.MeshBasicMaterial({ color: isMajor ? 0x0284c7 : 0xffffff, transparent: true, opacity: 0.85 })
          );
          ring.rotation.x = Math.PI / 2;
          ring.position.y = y;
          pGradGroup.add(ring);
        }

        const liqGeom = new THREE.CylinderGeometry(0.14, 0.14, 3.6, 24);
        const liqMesh = new THREE.Mesh(liqGeom, liquidMaterial);
        liqMesh.position.y = -0.8;

        const tipLiqGeom = new THREE.CylinderGeometry(0.14, 0.04, 0.8, 24);
        const tipLiqMesh = new THREE.Mesh(tipLiqGeom, liquidMaterial);
        tipLiqMesh.position.y = -2.8;

        const dropGeom = new THREE.SphereGeometry(0.08, 16, 16);
        const dropMesh = new THREE.Mesh(dropGeom, liquidMaterial);
        dropMesh.position.y = -3.8;

        pGradGroup.add(stemMesh, tipMesh, mouthMesh, liqMesh, tipLiqMesh, dropMesh);
        group.add(pGradGroup);
        break;
      }

      /* 13. CAWAN PENGUAP PORSELEN (EVAPORATING DISH) */
      case 'evaporating_dish': {
        const dishGroup = new THREE.Group();
        const dishGeom = new THREE.SphereGeometry(2.1, 32, 16, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2);
        const dishMesh = new THREE.Mesh(dishGeom, porcelainMaterial);
        dishMesh.rotation.x = Math.PI;
        dishMesh.position.y = -0.5;

        const rimGeom = new THREE.TorusGeometry(2.1, 0.08, 16, 32);
        const rimMesh = new THREE.Mesh(rimGeom, porcelainMaterial);
        rimMesh.rotation.x = Math.PI / 2;
        rimMesh.position.y = -0.5;

        const saltGeom = new THREE.CylinderGeometry(1.4, 1.2, 0.25, 24);
        const saltMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.9 });
        const saltMesh = new THREE.Mesh(saltGeom, saltMat);
        saltMesh.position.y = -1.2;

        dishGroup.add(dishMesh, rimMesh, saltMesh);
        group.add(dishGroup);
        break;
      }

      /* 14. MORTAR DAN ALUE (MORTAR & PESTLE) */
      case 'mortar_pestle': {
        const mpGroup = new THREE.Group();
        const mortarGeom = new THREE.CylinderGeometry(2.0, 1.4, 1.8, 32, 1, true);
        const mortarMesh = new THREE.Mesh(mortarGeom, porcelainMaterial);

        const mBottomGeom = new THREE.CircleGeometry(1.4, 32);
        const mBottomMesh = new THREE.Mesh(mBottomGeom, porcelainMaterial);
        mBottomMesh.rotation.x = Math.PI / 2;
        mBottomMesh.position.y = -0.9;

        const mRimGeom = new THREE.TorusGeometry(2.0, 0.15, 16, 32);
        const mRimMesh = new THREE.Mesh(mRimGeom, porcelainMaterial);
        mRimMesh.rotation.x = Math.PI / 2;
        mRimMesh.position.y = 0.9;

        const pestleGeom = new THREE.CylinderGeometry(0.3, 0.45, 2.5, 24);
        const pestleMesh = new THREE.Mesh(pestleGeom, porcelainMaterial);
        pestleMesh.rotation.z = Math.PI / 6;
        pestleMesh.position.set(0.6, 0.6, 0);

        mpGroup.add(mortarMesh, mBottomMesh, mRimMesh, pestleMesh);
        group.add(mpGroup);
        break;
      }

      /* 15. KACA ARLOJI & BATANG PENGADUK (WATCH GLASS & ROD) */
      case 'watch_glass_rod': {
        const wgGroup = new THREE.Group();
        const plateGeom = new THREE.SphereGeometry(2.2, 32, 16, 0, Math.PI * 2, 0, 0.5);
        const plateMesh = new THREE.Mesh(plateGeom, glassMaterial);
        plateMesh.rotation.x = Math.PI;
        plateMesh.position.y = -0.8;

        const crystalGeom = new THREE.ConeGeometry(0.8, 0.35, 16);
        const crystalMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.85 });
        const crystalMesh = new THREE.Mesh(crystalGeom, crystalMat);
        crystalMesh.position.y = -0.7;

        const rodGeom = new THREE.CylinderGeometry(0.08, 0.08, 5.2, 16);
        const rodMesh = new THREE.Mesh(rodGeom, glassMaterial);
        rodMesh.rotation.z = Math.PI / 3;
        rodMesh.position.set(0, 0.2, 0);

        wgGroup.add(plateMesh, crystalMesh, rodMesh);
        group.add(wgGroup);
        break;
      }

      /* 16. KRUS PORSELEN & TUTUP (CRUCIBLE WITH LID) */
      case 'crucible': {
        const crucibleGroup = new THREE.Group();
        const bowlPoints = [];
        bowlPoints.push(new THREE.Vector2(0, -1.2));
        bowlPoints.push(new THREE.Vector2(1.0, -1.2));
        bowlPoints.push(new THREE.Vector2(1.2, -0.6));
        bowlPoints.push(new THREE.Vector2(1.5, 0.4));
        bowlPoints.push(new THREE.Vector2(1.6, 1.1));
        bowlPoints.push(new THREE.Vector2(1.7, 1.2));
        const bowlGeom = new THREE.LatheGeometry(bowlPoints, 36);
        const bowlMesh = new THREE.Mesh(bowlGeom, porcelainMaterial);

        const lidPoints = [];
        lidPoints.push(new THREE.Vector2(0, 1.6));
        lidPoints.push(new THREE.Vector2(0.35, 1.55));
        lidPoints.push(new THREE.Vector2(1.55, 1.3));
        lidPoints.push(new THREE.Vector2(1.75, 1.18));
        const lidGeom = new THREE.LatheGeometry(lidPoints, 36);
        const lidMesh = new THREE.Mesh(lidGeom, porcelainMaterial);

        const knobGeom = new THREE.SphereGeometry(0.25, 20, 16);
        const knobMesh = new THREE.Mesh(knobGeom, porcelainMaterial);
        knobMesh.position.y = 1.75;

        const ashGeom = new THREE.CylinderGeometry(0.85, 0.7, 0.2, 24);
        const ashMat = new THREE.MeshStandardMaterial({ color: 0xcbd5e1, roughness: 0.95 });
        const ashMesh = new THREE.Mesh(ashGeom, ashMat);
        ashMesh.position.y = -1.0;

        const triGroup = new THREE.Group();
        triGroup.position.y = -1.35;
        for (let a = 0; a < 3; a++) {
          const angle = (a * 2 * Math.PI) / 3;
          const clayGeom = new THREE.CylinderGeometry(0.12, 0.12, 2.6, 16);
          const clayMesh = new THREE.Mesh(clayGeom, porcelainMaterial);
          clayMesh.rotation.z = Math.PI / 2;
          clayMesh.rotation.y = angle;
          clayMesh.position.set(Math.cos(angle + Math.PI / 6) * 1.2, 0, Math.sin(angle + Math.PI / 6) * 1.2);
          triGroup.add(clayMesh);
        }

        crucibleGroup.add(bowlMesh, lidMesh, knobMesh, ashMesh, triGroup);
        group.add(crucibleGroup);
        break;
      }

      /* 17. KAKI TIGA & KASA KAWAT (TRIPOD & WIRE GAUZE) */
      case 'tripod_gauze': {
        const tripodGroup = new THREE.Group();
        const ringGeom = new THREE.TorusGeometry(1.8, 0.12, 16, 32);
        const ringMesh = new THREE.Mesh(ringGeom, metalMaterial);
        ringMesh.rotation.x = Math.PI / 2;
        ringMesh.position.y = 0.8;

        const gauzeGeom = new THREE.BoxGeometry(3.6, 0.06, 3.6);
        const gauzeMat = new THREE.MeshStandardMaterial({ color: 0xcbd5e1, roughness: 0.8 });
        const gauzeMesh = new THREE.Mesh(gauzeGeom, gauzeMat);
        gauzeMesh.position.y = 0.9;

        const ceramicGeom = new THREE.CylinderGeometry(1.0, 1.0, 0.08, 24);
        const ceramicMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.9 });
        const ceramicMesh = new THREE.Mesh(ceramicGeom, ceramicMat);
        ceramicMesh.position.y = 0.95;

        const legGeom = new THREE.CylinderGeometry(0.09, 0.09, 3.8, 16);
        for (let a = 0; a < 3; a++) {
          const angle = (a * 2 * Math.PI) / 3;
          const legMesh = new THREE.Mesh(legGeom, metalMaterial);
          legMesh.position.set(Math.cos(angle) * 1.6, -1.0, Math.sin(angle) * 1.6);
          legMesh.rotation.z = Math.cos(angle) * 0.15;
          legMesh.rotation.x = Math.sin(angle) * 0.15;
          tripodGroup.add(legMesh);
        }

        tripodGroup.add(ringMesh, gauzeMesh, ceramicMesh);
        group.add(tripodGroup);
        break;
      }

      /* 18. PENJEPIT TABUNG & TANG KRUS (TEST TUBE CLAMP) */
      case 'test_tube_clamp': {
        const clampGroup = new THREE.Group();
        const arm1Geom = new THREE.BoxGeometry(4.8, 0.26, 0.38);
        const arm1Mesh = new THREE.Mesh(arm1Geom, woodMaterial);
        arm1Mesh.rotation.z = 0.06;
        arm1Mesh.position.set(0.6, 0.12, 0);

        const arm2Geom = new THREE.BoxGeometry(4.8, 0.26, 0.38);
        const arm2Mesh = new THREE.Mesh(arm2Geom, woodMaterial);
        arm2Mesh.rotation.z = -0.06;
        arm2Mesh.position.set(0.6, -0.12, 0);

        const coilGeom = new THREE.TorusGeometry(0.26, 0.08, 16, 24);
        const coilMesh = new THREE.Mesh(coilGeom, metalMaterial);
        coilMesh.position.set(0.2, 0, 0);

        const tGeom = new THREE.CylinderGeometry(0.38, 0.38, 3.4, 24, 1, true);
        const tMesh = new THREE.Mesh(tGeom, glassMaterial);
        tMesh.position.set(-1.6, -0.4, 0);

        const tBottomGeom = new THREE.SphereGeometry(0.38, 24, 16, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2);
        const tBottomMesh = new THREE.Mesh(tBottomGeom, glassMaterial);
        tBottomMesh.position.set(-1.6, -2.1, 0);

        const tRimGeom = new THREE.TorusGeometry(0.39, 0.05, 12, 24);
        const tRimMesh = new THREE.Mesh(tRimGeom, glassMaterial);
        tRimMesh.rotation.x = Math.PI / 2;
        tRimMesh.position.set(-1.6, 1.3, 0);

        const liqGeom = new THREE.CylinderGeometry(0.34, 0.34, 1.4, 20);
        const liqMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, transparent: true, opacity: 0.8 });
        const liqMesh = new THREE.Mesh(liqGeom, liqMat);
        liqMesh.position.set(-1.6, -1.3, 0);

        clampGroup.add(arm1Mesh, arm2Mesh, coilMesh, tMesh, tBottomMesh, tRimMesh, liqMesh);
        group.add(clampGroup);
        break;
      }

      /* 19. NERACA ANALITIK DIGITAL (ANALYTICAL BALANCE) */
      case 'digital_balance': {
        const balGroup = new THREE.Group();
        const chassisGeom = new THREE.BoxGeometry(4.8, 1.0, 4.2);
        const chassisMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.35, metalness: 0.4 });
        const chassisMesh = new THREE.Mesh(chassisGeom, chassisMat);
        chassisMesh.position.y = -1.2;

        const footGeom = new THREE.CylinderGeometry(0.3, 0.3, 0.2, 16);
        const footMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.9 });
        for (let fx of [-2.0, 2.0]) {
          for (let fz of [-1.7, 1.7]) {
            const foot = new THREE.Mesh(footGeom, footMat);
            foot.position.set(fx, -1.8, fz);
            balGroup.add(foot);
          }
        }

        const screenBezel = new THREE.Mesh(
          new THREE.BoxGeometry(2.6, 0.65, 0.04),
          new THREE.MeshStandardMaterial({ color: 0x0f172a })
        );
        screenBezel.position.set(0, -1.0, 2.12);
        screenBezel.rotation.x = -0.2;

        const screenLcd = new THREE.Mesh(
          new THREE.BoxGeometry(2.4, 0.48, 0.02),
          new THREE.MeshBasicMaterial({ color: 0x0284c7 })
        );
        screenLcd.position.set(0, -1.0, 2.14);
        screenLcd.rotation.x = -0.2;

        const btnTare = new THREE.Mesh(
          new THREE.CylinderGeometry(0.18, 0.18, 0.1, 16),
          new THREE.MeshStandardMaterial({ color: 0xef4444 })
        );
        btnTare.rotation.x = Math.PI / 2 - 0.2;
        btnTare.position.set(1.6, -1.0, 2.08);

        const btnCal = new THREE.Mesh(
          new THREE.CylinderGeometry(0.18, 0.18, 0.1, 16),
          new THREE.MeshStandardMaterial({ color: 0x10b981 })
        );
        btnCal.rotation.x = Math.PI / 2 - 0.2;
        btnCal.position.set(-1.6, -1.0, 2.08);

        const panGeom = new THREE.CylinderGeometry(1.2, 1.2, 0.1, 36);
        const panMesh = new THREE.Mesh(panGeom, metalMaterial);
        panMesh.position.y = -0.65;

        const panStemGeom = new THREE.CylinderGeometry(0.2, 0.2, 0.3, 16);
        const panStemMesh = new THREE.Mesh(panStemGeom, metalMaterial);
        panStemMesh.position.y = -0.8;

        const draftShieldGroup = new THREE.Group();
        draftShieldGroup.position.y = 0.8;

        const postGeom = new THREE.CylinderGeometry(0.06, 0.06, 2.8, 12);
        for (let px of [-1.8, 1.8]) {
          for (let pz of [-1.5, 1.5]) {
            const post = new THREE.Mesh(postGeom, metalMaterial);
            post.position.set(px, 0, pz);
            draftShieldGroup.add(post);
          }
        }

        const glassBoxGeom = new THREE.BoxGeometry(3.6, 2.8, 3.0);
        const draftGlassMesh = new THREE.Mesh(glassBoxGeom, glassMaterial);
        draftShieldGroup.add(draftGlassMesh);

        const sampleDish = new THREE.Mesh(
          new THREE.SphereGeometry(0.65, 24, 16, 0, Math.PI * 2, 0, 0.5),
          glassMaterial
        );
        sampleDish.rotation.x = Math.PI;
        sampleDish.position.y = -0.58;

        const samplePowder = new THREE.Mesh(
          new THREE.CylinderGeometry(0.35, 0.45, 0.1, 16),
          new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.9 })
        );
        samplePowder.position.y = -0.55;

        balGroup.add(chassisMesh, screenBezel, screenLcd, btnTare, btnCal, panMesh, panStemMesh, draftShieldGroup, sampleDish, samplePowder);
        group.add(balGroup);
        break;
      }

      /* 20. PH METER & INDIKATOR (DIGITAL PH METER) */
      case 'ph_meter': {
        const phGroup = new THREE.Group();
        const bodyGeom = new THREE.BoxGeometry(1.8, 3.4, 0.7);
        const bodyMat = new THREE.MeshStandardMaterial({ color: 0x0f766e, roughness: 0.4 });
        const bodyMesh = new THREE.Mesh(bodyGeom, bodyMat);
        bodyMesh.position.set(-1.2, 0.5, 0);

        const screenBezel = new THREE.Mesh(
          new THREE.BoxGeometry(1.4, 1.1, 0.04),
          new THREE.MeshStandardMaterial({ color: 0x115e59 })
        );
        screenBezel.position.set(-1.2, 1.1, 0.36);

        const screenLcd = new THREE.Mesh(
          new THREE.BoxGeometry(1.2, 0.9, 0.02),
          new THREE.MeshBasicMaterial({ color: 0xccfbf1 })
        );
        screenLcd.position.set(-1.2, 1.1, 0.38);

        for (let b = -0.4; b <= 0.4; b += 0.4) {
          const btn = new THREE.Mesh(
            new THREE.CylinderGeometry(0.12, 0.12, 0.05, 16),
            new THREE.MeshStandardMaterial({ color: 0x134e4a })
          );
          btn.rotation.x = Math.PI / 2;
          btn.position.set(-1.2 + b, 0.2, 0.36);
          phGroup.add(btn);
        }

        const cableCurve = new THREE.CatmullRomCurve3([
          new THREE.Vector3(-1.2, -1.2, 0),
          new THREE.Vector3(-1.0, -2.0, 0.2),
          new THREE.Vector3(0.2, -2.2, 0),
          new THREE.Vector3(1.2, -1.6, -0.2),
          new THREE.Vector3(1.4, 1.8, 0)
        ]);
        const cableGeom = new THREE.TubeGeometry(cableCurve, 28, 0.06, 8, false);
        const cableMesh = new THREE.Mesh(cableGeom, new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.8 }));

        const probeGroup = new THREE.Group();
        probeGroup.position.set(1.4, 0.2, 0);

        const probeHandle = new THREE.Mesh(
          new THREE.CylinderGeometry(0.24, 0.24, 2.6, 24),
          new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.5 })
        );
        probeHandle.position.y = 0.5;

        const probeStem = new THREE.Mesh(
          new THREE.CylinderGeometry(0.18, 0.18, 1.8, 24, 1, true),
          glassMaterial
        );
        probeStem.position.y = -1.4;

        const bulbSensor = new THREE.Mesh(
          new THREE.SphereGeometry(0.22, 24, 16),
          new THREE.MeshStandardMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.75 })
        );
        bulbSensor.position.y = -2.3;

        probeGroup.add(probeHandle, probeStem, bulbSensor);
        phGroup.add(bodyMesh, screenBezel, screenLcd, cableMesh, probeGroup);
        group.add(phGroup);
        break;
      }

      /* 21. TERMOMETER LABORATORIUM (LAB THERMOMETER) */
      case 'thermometer': {
        const thermGroup = new THREE.Group();
        const stemGeom = new THREE.CylinderGeometry(0.18, 0.18, 6.2, 32, 1, true);
        const stemMesh = new THREE.Mesh(stemGeom, glassMaterial);
        stemMesh.position.y = 0.3;

        const loopGeom = new THREE.TorusGeometry(0.24, 0.05, 12, 24);
        const loopMesh = new THREE.Mesh(loopGeom, glassMaterial);
        loopMesh.position.y = 3.45;

        const bulbGeom = new THREE.SphereGeometry(0.38, 32, 24);
        const redLiquidMat = new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.2, metalness: 0.1 });
        const bulbMesh = new THREE.Mesh(bulbGeom, redLiquidMat);
        bulbMesh.position.y = -2.8;

        const colGeom = new THREE.CylinderGeometry(0.06, 0.06, 4.4, 16);
        const colMesh = new THREE.Mesh(colGeom, redLiquidMat);
        colMesh.position.y = -0.7;

        for (let y = -2.0; y <= 2.2; y += 0.3) {
          const isMajor = Math.abs(Math.round(y * 10) % 6) === 0;
          const markGeom = new THREE.TorusGeometry(0.182, isMajor ? 0.012 : 0.006, 8, 24);
          const markMat = new THREE.MeshBasicMaterial({ color: isMajor ? 0xffffff : 0xbae6fd });
          const markMesh = new THREE.Mesh(markGeom, markMat);
          markMesh.rotation.x = Math.PI / 2;
          markMesh.position.y = y;
          thermGroup.add(markMesh);
        }

        thermGroup.add(stemMesh, loopMesh, bulbMesh, colMesh);
        group.add(thermGroup);
        break;
      }

      /* 22. BOTOL SEMPROT AKUADES (WASH BOTTLE) */
      case 'wash_bottle': {
        const wbGroup = new THREE.Group();
        const bodyGeom = new THREE.CylinderGeometry(1.2, 1.2, 3.2, 32);
        const bodyMat = new THREE.MeshPhysicalMaterial({ color: 0xe0f2fe, transparent: true, opacity: 0.65, roughness: 0.3 });
        const bodyMesh = new THREE.Mesh(bodyGeom, bodyMat);

        const capGeom = new THREE.CylinderGeometry(0.65, 0.65, 0.45, 24);
        const capMat = new THREE.MeshStandardMaterial({ color: 0x0284c7 });
        const capMesh = new THREE.Mesh(capGeom, capMat);
        capMesh.position.y = 1.8;

        const nozzleCurve = new THREE.CatmullRomCurve3([
          new THREE.Vector3(0, 1.8, 0),
          new THREE.Vector3(0, 2.5, 0),
          new THREE.Vector3(-0.6, 2.7, 0),
          new THREE.Vector3(-1.4, 2.3, 0),
          new THREE.Vector3(-1.8, 1.8, 0)
        ]);
        const nozzleGeom = new THREE.TubeGeometry(nozzleCurve, 24, 0.08, 8, false);
        const nozzleMesh = new THREE.Mesh(nozzleGeom, capMat);

        wbGroup.add(bodyMesh, capMesh, nozzleMesh);
        group.add(wbGroup);
        break;
      }

      default: {
        const geom = new THREE.CylinderGeometry(1.2, 1.2, 3.5, 32);
        const mesh = new THREE.Mesh(geom, glassMaterial);
        group.add(mesh);
      }
    }

    return { group, bunsenFlame };
  }

  loadApparatusModel(equipId) {
    const data = LAB_EQUIPMENT_DATA.find(e => e.id === equipId);
    if (!data || !this.scene) return;
    this.currentEquipId = equipId;
    this.bunsenFlame = null;

    if (this.currentMeshGroup) {
      this.scene.remove(this.currentMeshGroup);
    }

    const { group, bunsenFlame } = this.buildApparatus3DGroup(equipId, this.isWireframe);
    this.currentMeshGroup = group;
    this.currentMeshGroup.scale.set(this.modelScale, this.modelScale, this.modelScale);
    if (bunsenFlame) this.bunsenFlame = bunsenFlame;

    this.scene.add(this.currentMeshGroup);
    this.updateEquipDetailView(data);
  }

  /* ==========================================================================
     MODAL 3D APPARATUS VIEWER & LIVE CAMERA AR CONTROLLER
     ========================================================================== */
  initModalThreeViewer() {
    if (this.modalInitialized) return;
    const container = document.getElementById('modal-three-canvas-container');
    if (!container) return;

    const width = container.clientWidth || 640;
    const height = container.clientHeight || 480;

    this.modalScene = new THREE.Scene();
    this.modalCamera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    this.modalCamera.position.set(0, 2.5, 9.5);
    this.modalCamera.lookAt(0, 0, 0);

    this.modalRenderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
    this.modalRenderer.setSize(width, height);
    this.modalRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.modalRenderer.shadowMap.enabled = true;
    this.modalRenderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.appendChild(this.modalRenderer.domElement);

    // Studio Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.95);
    this.modalScene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0x38bdf8, 0.95);
    dirLight1.position.set(6, 12, 8);
    this.modalScene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0xffffff, 0.7);
    dirLight2.position.set(-6, -4, -6);
    this.modalScene.add(dirLight2);

    const pointLight = new THREE.PointLight(0xffffff, 0.6, 20);
    pointLight.position.set(0, 4, 4);
    this.modalScene.add(pointLight);

    // Grid Floor
    this.modalGridHelper = new THREE.GridHelper(12, 12, 0x0284c7, 0x334155);
    this.modalGridHelper.position.y = -2.5;
    this.modalScene.add(this.modalGridHelper);

    // Mouse & Touch interactions on Modal Canvas
    const dom = this.modalRenderer.domElement;
    dom.addEventListener('mousedown', (e) => {
      this.modalIsDragging = true;
      this.modalPreviousMousePosition = { x: e.clientX, y: e.clientY };
    });
    window.addEventListener('mouseup', () => { this.modalIsDragging = false; });
    window.addEventListener('mousemove', (e) => {
      if (!this.modalIsDragging || !this.modalCurrentMeshGroup) return;
      const deltaX = e.clientX - this.modalPreviousMousePosition.x;
      const deltaY = e.clientY - this.modalPreviousMousePosition.y;

      if (e.shiftKey || this.modalIsARMode) {
        this.modalCurrentMeshGroup.position.x += deltaX * 0.01;
        this.modalCurrentMeshGroup.position.y -= deltaY * 0.01;
      } else {
        this.modalCurrentMeshGroup.rotation.y += deltaX * 0.01;
        this.modalCurrentMeshGroup.rotation.x += deltaY * 0.01;
      }
      this.modalPreviousMousePosition = { x: e.clientX, y: e.clientY };
    });

    let initTouchDist = null;
    dom.addEventListener('touchstart', (e) => {
      if (e.touches.length === 1) {
        this.modalIsDragging = true;
        this.modalPreviousMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      } else if (e.touches.length === 2) {
        initTouchDist = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
      }
    }, { passive: true });

    dom.addEventListener('touchmove', (e) => {
      if (e.touches.length === 1 && this.modalIsDragging && this.modalCurrentMeshGroup) {
        const deltaX = e.touches[0].clientX - this.modalPreviousMousePosition.x;
        const deltaY = e.touches[0].clientY - this.modalPreviousMousePosition.y;
        if (this.modalIsARMode) {
          this.modalCurrentMeshGroup.position.x += deltaX * 0.012;
          this.modalCurrentMeshGroup.position.y -= deltaY * 0.012;
        } else {
          this.modalCurrentMeshGroup.rotation.y += deltaX * 0.012;
          this.modalCurrentMeshGroup.rotation.x += deltaY * 0.012;
        }
        this.modalPreviousMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      } else if (e.touches.length === 2 && initTouchDist && this.modalCurrentMeshGroup) {
        const dist = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
        const scaleFactor = dist / initTouchDist;
        this.modalModelScale = Math.max(0.35, Math.min(3.0, this.modalModelScale * scaleFactor));
        this.modalCurrentMeshGroup.scale.set(this.modalModelScale, this.modalModelScale, this.modalModelScale);
        initTouchDist = dist;
      }
    }, { passive: true });

    dom.addEventListener('touchend', () => {
      this.modalIsDragging = false;
      initTouchDist = null;
    });

    dom.addEventListener('wheel', (e) => {
      e.preventDefault();
      if (this.modalIsARMode && this.modalCurrentMeshGroup) {
        const factor = e.deltaY > 0 ? 0.95 : 1.05;
        this.modalModelScale = Math.max(0.3, Math.min(3.0, this.modalModelScale * factor));
        this.modalCurrentMeshGroup.scale.set(this.modalModelScale, this.modalModelScale, this.modalModelScale);
      } else {
        this.modalCamera.position.z += e.deltaY * 0.005;
        this.modalCamera.position.z = Math.max(3.5, Math.min(18, this.modalCamera.position.z));
      }
    }, { passive: false });

    window.addEventListener('resize', () => {
      if (!this.modalRenderer || !this.modalCamera) return;
      const w = container.clientWidth || 640;
      const h = container.clientHeight || 480;
      this.modalCamera.aspect = w / h;
      this.modalCamera.updateProjectionMatrix();
      this.modalRenderer.setSize(w, h);
    });

    this.modalInitialized = true;
    this.animateModal();
  }

  animateModal() {
    this.modalAnimId = requestAnimationFrame(() => this.animateModal());

    if (this.modalCurrentMeshGroup && this.modalIsAutoRotate && !this.modalIsDragging && !this.modalIsARMode) {
      this.modalCurrentMeshGroup.rotation.y += 0.008;
    }

    if (this.modalBunsenFlame && this.flameClock) {
      const elapsed = this.flameClock.getElapsedTime();
      const flicker = 1 + Math.sin(elapsed * 15) * 0.06 + Math.cos(elapsed * 23) * 0.04;
      this.modalBunsenFlame.scale.set(flicker, 1 + Math.sin(elapsed * 10) * 0.08, flicker);
    }

    if (this.modalRenderer && this.modalScene && this.modalCamera) {
      this.modalRenderer.render(this.modalScene, this.modalCamera);
    }
  }

  openApparatusModal(equipId) {
    const modal = document.getElementById('modal-apparatus-3d-ar');
    if (!modal) return;

    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';

    this.initModalThreeViewer();

    setTimeout(() => {
      const container = document.getElementById('modal-three-canvas-container');
      if (container && this.modalCamera && this.modalRenderer) {
        const w = container.clientWidth || 640;
        const h = container.clientHeight || 480;
        this.modalCamera.aspect = w / h;
        this.modalCamera.updateProjectionMatrix();
        this.modalRenderer.setSize(w, h);
      }
    }, 60);

    this.loadModalApparatusModel(equipId || 'measuring_cylinder');
  }

  closeApparatusModal() {
    const modal = document.getElementById('modal-apparatus-3d-ar');
    if (modal) modal.style.display = 'none';
    document.body.style.overflow = '';

    if (this.modalIsARMode) {
      this.stopModalLiveAR();
    }
  }

  loadModalApparatusModel(equipId) {
    let data = LAB_EQUIPMENT_DATA.find(e => e.id === equipId);
    if (!data) data = LAB_EQUIPMENT_DATA[0];
    if (!this.modalScene) return;

    this.modalCurrentEquipId = data.id;
    this.modalBunsenFlame = null;

    if (this.modalCurrentMeshGroup) {
      this.modalScene.remove(this.modalCurrentMeshGroup);
    }

    const { group, bunsenFlame } = this.buildApparatus3DGroup(data.id, this.modalIsWireframe);
    this.modalCurrentMeshGroup = group;
    this.modalCurrentMeshGroup.scale.set(this.modalModelScale, this.modalModelScale, this.modalModelScale);
    if (bunsenFlame) this.modalBunsenFlame = bunsenFlame;

    this.modalScene.add(this.modalCurrentMeshGroup);
    this.updateModalEquipDetailView(data);
  }

  updateModalEquipDetailView(data) {
    if (!data) return;
    const titleEl = document.getElementById('modal-equip-title');
    const latinEl = document.getElementById('modal-equip-latin');
    const catEl = document.getElementById('modal-equip-category');
    const iconEl = document.getElementById('modal-equip-icon');
    const descEl = document.getElementById('modal-equip-desc');
    const specsEl = document.getElementById('modal-equip-specs');
    const meniscusEl = document.getElementById('modal-equip-meniscus');
    const safetyEl = document.getElementById('modal-equip-safety');
    const counterEl = document.getElementById('modal-equip-counter');

    if (titleEl) titleEl.textContent = data.name;
    if (latinEl) latinEl.textContent = `${data.latinName} • ChemVirtual 3D Engine`;
    if (catEl) catEl.textContent = data.category || 'Alat Praktikum';
    if (iconEl) iconEl.innerHTML = data.svgIcon || '🔬';
    if (descEl) descEl.textContent = data.description || '';
    if (specsEl) specsEl.innerHTML = `<strong>Bahan & Standar:</strong> ${data.specs || '-'}`;
    if (meniscusEl) meniscusEl.innerHTML = `<div><strong>Cara Membaca / Menggunakan:</strong></div><div>${data.meniscusTip || '-'}</div>`;
    if (safetyEl) safetyEl.innerHTML = `<div><strong>Perhatian Keselamatan Kerja (K3):</strong></div><div>${data.safetyNote || '-'}</div>`;

    const currentIndex = this.apparatusOrder.indexOf(data.id);
    if (counterEl) {
      counterEl.textContent = `${currentIndex >= 0 ? currentIndex + 1 : 1} / ${this.apparatusOrder.length}`;
    }
  }

  navigateModalEquip(direction) {
    let index = this.apparatusOrder.indexOf(this.modalCurrentEquipId);
    if (index === -1) index = 0;
    index = (index + direction + this.apparatusOrder.length) % this.apparatusOrder.length;
    const nextId = this.apparatusOrder[index];
    this.loadModalApparatusModel(nextId);
  }

  resetModalView() {
    if (this.modalCurrentMeshGroup) {
      this.modalCurrentMeshGroup.rotation.set(0, 0, 0);
      this.modalCurrentMeshGroup.position.set(0, 0, 0);
      this.modalModelScale = 1.0;
      this.modalCurrentMeshGroup.scale.set(1, 1, 1);
    }
    if (this.modalCamera) {
      this.modalCamera.position.set(0, 2.5, 9.5);
    }
  }

  async toggleModalLiveAR() {
    if (this.modalIsARMode) {
      this.stopModalLiveAR();
    } else {
      await this.startModalLiveAR();
    }
  }

  async startModalLiveAR() {
    const container = document.getElementById('modal-three-canvas-container');
    const video = document.getElementById('modal-ar-video');
    const btnAR = document.getElementById('btn-modal-toggle-ar');
    if (!container || !video) return;

    try {
      const constraints = {
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      this.modalARMediaStream = stream;
      video.srcObject = stream;
      video.style.display = 'block';
      await video.play();

      this.modalIsARMode = true;
      container.classList.add('ar-mode-active');
      if (this.modalGridHelper) this.modalGridHelper.visible = false;
      this.modalIsAutoRotate = false;

      const btnRotate = document.getElementById('btn-modal-rotate');
      if (btnRotate) btnRotate.classList.remove('active');
      if (btnAR) {
        btnAR.classList.add('active');
        btnAR.innerHTML = '<span>✕</span> <span>Keluar AR</span>';
      }

    } catch (err) {
      console.warn("Modal AR Camera error:", err);
      this.modalIsARMode = true;
      container.classList.add('ar-mode-active');
      if (this.modalGridHelper) this.modalGridHelper.visible = false;
      if (btnAR) {
        btnAR.classList.add('active');
        btnAR.innerHTML = '<span>✕</span> <span>Keluar AR</span>';
      }
      alert("Mode AR Kamera Aktif!\n(Kamera fisik tidak terdeteksi atau izin belum diberikan. Anda tetap dapat menggeser objek 3D untuk simulasi penempatan di atas meja).");
    }
  }

  stopModalLiveAR() {
    this.modalIsARMode = false;
    const container = document.getElementById('modal-three-canvas-container');
    const video = document.getElementById('modal-ar-video');
    const btnAR = document.getElementById('btn-modal-toggle-ar');

    if (video) {
      video.style.display = 'none';
      video.srcObject = null;
    }

    if (this.modalARMediaStream) {
      this.modalARMediaStream.getTracks().forEach(t => t.stop());
      this.modalARMediaStream = null;
    }

    if (container) {
      container.classList.remove('ar-mode-active');
    }

    if (this.modalGridHelper) this.modalGridHelper.visible = true;

    if (btnAR) {
      btnAR.classList.remove('active');
      btnAR.innerHTML = '<span>📱</span> <span>Kamera AR</span>';
    }
  }

  takeModalARSnapshot() {
    if (!this.modalRenderer) return;
    try {
      const dataUrl = this.modalRenderer.domElement.toDataURL('image/png');
      const link = document.createElement('a');
      const equipName = (this.modalCurrentEquipId || 'alat').replace(/\s+/g, '_');
      link.download = `ChemVirtual_${equipName}_3D_${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
    } catch (e) {
      console.warn("Snapshot error:", e);
    }
  }

  initModalEventListeners() {
    const btnClose = document.getElementById('btn-modal-equip-close');
    if (btnClose) btnClose.addEventListener('click', () => this.closeApparatusModal());

    const btnBackdrop = document.getElementById('modal-apparatus-3d-ar');
    if (btnBackdrop) {
      btnBackdrop.addEventListener('click', (e) => {
        if (e.target === btnBackdrop) this.closeApparatusModal();
      });
    }

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        const modal = document.getElementById('modal-apparatus-3d-ar');
        if (modal && modal.style.display !== 'none') {
          this.closeApparatusModal();
        }
      }
    });

    const btnRotate = document.getElementById('btn-modal-rotate');
    if (btnRotate) {
      btnRotate.addEventListener('click', () => {
        this.modalIsAutoRotate = !this.modalIsAutoRotate;
        btnRotate.classList.toggle('active', this.modalIsAutoRotate);
      });
    }

    const btnWireframe = document.getElementById('btn-modal-wireframe');
    if (btnWireframe) {
      btnWireframe.addEventListener('click', () => {
        this.modalIsWireframe = !this.modalIsWireframe;
        btnWireframe.classList.toggle('active', this.modalIsWireframe);
        if (this.modalCurrentEquipId) {
          this.loadModalApparatusModel(this.modalCurrentEquipId);
        }
      });
    }

    const btnZoomIn = document.getElementById('btn-modal-zoom-in');
    if (btnZoomIn) {
      btnZoomIn.addEventListener('click', () => {
        this.modalModelScale = Math.min(3.0, this.modalModelScale * 1.15);
        if (this.modalCurrentMeshGroup) {
          this.modalCurrentMeshGroup.scale.set(this.modalModelScale, this.modalModelScale, this.modalModelScale);
        }
      });
    }

    const btnZoomOut = document.getElementById('btn-modal-zoom-out');
    if (btnZoomOut) {
      btnZoomOut.addEventListener('click', () => {
        this.modalModelScale = Math.max(0.35, this.modalModelScale * 0.85);
        if (this.modalCurrentMeshGroup) {
          this.modalCurrentMeshGroup.scale.set(this.modalModelScale, this.modalModelScale, this.modalModelScale);
        }
      });
    }

    const btnReset = document.getElementById('btn-modal-reset');
    if (btnReset) {
      btnReset.addEventListener('click', () => this.resetModalView());
    }

    const btnToggleAR = document.getElementById('btn-modal-toggle-ar');
    if (btnToggleAR) {
      btnToggleAR.addEventListener('click', () => this.toggleModalLiveAR());
    }

    const btnSnapshot = document.getElementById('btn-modal-snapshot');
    if (btnSnapshot) {
      btnSnapshot.addEventListener('click', () => this.takeModalARSnapshot());
    }

    const btnCardAR = document.getElementById('btn-modal-card-ar');
    if (btnCardAR) {
      btnCardAR.addEventListener('click', () => {
        if (this.modalCurrentEquipId) {
          this.showARCardModal(this.modalCurrentEquipId);
        }
      });
    }

    const btnPrev = document.getElementById('btn-modal-prev-equip');
    if (btnPrev) {
      btnPrev.addEventListener('click', () => this.navigateModalEquip(-1));
    }

    const btnNext = document.getElementById('btn-modal-next-equip');
    if (btnNext) {
      btnNext.addEventListener('click', () => this.navigateModalEquip(1));
    }
  }

  updateEquipDetailView(data) {
    const infoContainer = document.getElementById('equip-info-mount');
    if (!infoContainer) return;

    infoContainer.innerHTML = `
      <div class="equip-info-card">
        <div class="equip-info-header">
          <div class="equip-info-svg-badge">${data.svgIcon}</div>
          <div class="equip-info-title-group">
            <h3>${data.name}</h3>
            <div class="latin-name">${data.latinName} &bull; <span class="badge-tag">${data.category}</span></div>
          </div>
        </div>

        <p class="equip-info-desc">${data.description}</p>
        
        <div class="apd-spec-box" style="margin-bottom:0.75rem;">
          <strong>Spesifikasi & Kapasitas Alat:</strong>
          <span>${data.specs}</span>
        </div>

        <div class="meniscus-box">
          <span style="font-size:1.4rem;">👁️</span>
          <div>
            <strong>Panduan Meniskus & Teknik Pemakaian:</strong>
            <div>${data.meniscusTip}</div>
          </div>
        </div>

        <div class="apd-warning-box" style="margin-top:0.75rem;">
          <strong>Peringatan Keselamatan & SOP:</strong>
          <p>${data.safetyNote}</p>
        </div>

        <!-- Quick AR Action Buttons -->
        <div class="equip-ar-actions">
          <button class="btn btn-primary btn-sm btn-action-card-ar" data-id="${data.id}" title="Buka Kartu Marker & QR Code Siap Cetak">
            <span>🖨️</span> Buka Kartu AR & QR Code
          </button>
          <button class="btn btn-accent btn-sm btn-action-launch-ar" title="Lihat di Meja dengan Kamera AR">
            <span>📱</span> Proyeksikan ke Meja (AR)
          </button>
        </div>
      </div>
    `;

    // Highlight button in selector
    document.querySelectorAll('.equip-item-btn').forEach(btn => {
      if (btn.dataset.id === data.id) btn.classList.add('active');
      else btn.classList.remove('active');
    });
  }

  renderEquipmentSelector() {
    const listContainer = document.getElementById('equip-selector-mount');
    if (!listContainer) return;

    listContainer.innerHTML = LAB_EQUIPMENT_DATA.map(item => `
      <button class="equip-item-btn ${item.id === this.currentEquipId ? 'active' : ''}" data-id="${item.id}" title="${item.name}">
        <div class="equip-btn-svg">${item.svgIcon}</div>
        <span class="equip-btn-name">${item.name}</span>
      </button>
    `).join('');
  }

  renderGHSSymbols() {
    const ghsGrid = document.getElementById('ghs-symbols-grid');
    if (!ghsGrid || !window.GHS_SYMBOLS_DATA) return;

    ghsGrid.innerHTML = GHS_SYMBOLS_DATA.map(sym => `
      <div class="ghs-card" data-id="${sym.id}">
        <div class="ghs-diamond-frame">
          <div class="ghs-diamond-content">${sym.iconChar}</div>
        </div>
        <div class="ghs-name">${sym.name}</div>
        <div class="ghs-eng-name">${sym.engName}</div>
        <div class="ghs-desc">${sym.description}</div>
        <div class="ghs-examples-chip">Contoh: ${sym.examples.split(',')[0]}</div>
      </div>
    `).join('');
  }

  setupEventListeners() {
    // Klik tombol alat praktikum
    document.addEventListener('click', (e) => {
      const equipBtn = e.target.closest('.equip-item-btn');
      if (equipBtn && equipBtn.dataset.id) {
        this.loadApparatusModel(equipBtn.dataset.id);
        return;
      }

      // Klik tombol lihat Kartu AR dari info box
      const cardBtn = e.target.closest('.btn-action-card-ar');
      if (cardBtn && cardBtn.dataset.id) {
        this.showARCardModal(cardBtn.dataset.id);
        return;
      }

      // Klik tombol luncurkan AR langsung
      const launchARBtn = e.target.closest('.btn-action-launch-ar');
      if (launchARBtn) {
        this.startLiveCameraAR();
        return;
      }

      // Klik kartu GHS untuk menampilkan detail modal
      const ghsCard = e.target.closest('.ghs-card');
      if (ghsCard && ghsCard.dataset.id) {
        const symbol = GHS_SYMBOLS_DATA.find(s => s.id === ghsCard.dataset.id);
        if (symbol) this.showGHSModal(symbol);
        return;
      }
    });

    // Toolbar 3D Buttons
    const btnRotate = document.getElementById('btn-three-rotate');
    if (btnRotate) {
      btnRotate.addEventListener('click', () => {
        this.isAutoRotate = !this.isAutoRotate;
        btnRotate.classList.toggle('active', this.isAutoRotate);
      });
    }

    const btnWireframe = document.getElementById('btn-three-wireframe');
    if (btnWireframe) {
      btnWireframe.addEventListener('click', () => {
        this.isWireframe = !this.isWireframe;
        btnWireframe.classList.toggle('active', this.isWireframe);
        this.loadApparatusModel(this.currentEquipId);
      });
    }

    const btnResetView = document.getElementById('btn-three-reset');
    if (btnResetView) {
      btnResetView.addEventListener('click', () => {
        if (this.currentMeshGroup) {
          this.currentMeshGroup.rotation.set(0, 0, 0);
          this.currentMeshGroup.position.set(0, 0, 0);
          this.modelScale = 1.0;
          this.currentMeshGroup.scale.set(1, 1, 1);
        }
        if (this.camera) {
          this.camera.position.set(0, 2.5, 9.5);
        }
      });
    }

    // Tombol AR Live Camera
    const btnAR = document.getElementById('btn-three-ar');
    if (btnAR) {
      btnAR.addEventListener('click', () => {
        this.toggleLiveCameraAR();
      });
    }

    // Tombol Scan AR / QR Code
    const btnScan = document.getElementById('btn-three-scan');
    if (btnScan) {
      btnScan.addEventListener('click', () => {
        this.openScannerModal();
      });
    }

    // Tombol Cetak / Kartu AR
    const btnCard = document.getElementById('btn-three-card');
    if (btnCard) {
      btnCard.addEventListener('click', () => {
        this.showARCardModal(this.currentEquipId);
      });
    }

    // VR Mode Stereoscopic
    const btnVR = document.getElementById('btn-three-vr');
    if (btnVR) {
      btnVR.addEventListener('click', () => {
        this.toggleVRMode();
      });
    }
  }

  /* ==========================================================================
     FITUR 1: LIVE CAMERA AR MODE (AUGMENTED REALITY NYATA)
     Menampilkan model 3D alat di atas feed kamera perangkat / webcam
     ========================================================================== */
  async toggleLiveCameraAR() {
    if (this.isARMode) {
      this.stopLiveCameraAR();
    } else {
      await this.startLiveCameraAR();
    }
  }

  async startLiveCameraAR() {
    const container = document.getElementById('three-canvas-container');
    if (!container) return;

    try {
      // Minta izin kamera (prioritaskan kamera belakang untuk smartphone)
      const constraints = {
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      this.arMediaStream = stream;

      // Buat elemen video background jika belum ada
      if (!this.arVideoElement) {
        this.arVideoElement = document.createElement('video');
        this.arVideoElement.setAttribute('autoplay', '');
        this.arVideoElement.setAttribute('muted', '');
        this.arVideoElement.setAttribute('playsinline', '');
        this.arVideoElement.className = 'ar-camera-video-bg';
      }

      this.arVideoElement.srcObject = stream;
      await this.arVideoElement.play();

      // Tambahkan ke container di bawah canvas
      container.style.position = 'relative';
      if (!this.arVideoElement.parentNode) {
        container.insertBefore(this.arVideoElement, this.renderer.domElement);
      }

      // Update state
      this.isARMode = true;
      container.classList.add('ar-mode-active');
      if (this.gridHelper) this.gridHelper.visible = false; // Sembunyikan grid studio di AR
      this.isAutoRotate = false; // Matikan auto rotate agar stabil

      // Tampilkan HUD Kontrol AR
      this.showARControlsHUD(true);

      const btnAR = document.getElementById('btn-three-ar');
      if (btnAR) btnAR.classList.add('active');

    } catch (err) {
      console.warn("Camera AR Error:", err);
      // Fallback bila akses kamera ditolak atau tidak ada webcam
      this.isARMode = true;
      container.classList.add('ar-mode-active');
      container.style.background = 'linear-gradient(135deg, rgba(2, 132, 199, 0.4), rgba(56, 189, 248, 0.3)), repeating-linear-gradient(45deg, rgba(255,255,255,0.05) 0px, rgba(255,255,255,0.05) 20px, transparent 20px, transparent 40px)';
      if (this.gridHelper) this.gridHelper.visible = false;
      this.showARControlsHUD(true);
      alert("Mode AR Simulasi Aktif!\n(Kamera fisik tidak terdeteksi atau izin belum diberikan. Anda dapat menggeser objek untuk simulasi penempatan di meja).");
    }
  }

  stopLiveCameraAR() {
    this.isARMode = false;
    const container = document.getElementById('three-canvas-container');
    if (container) {
      container.classList.remove('ar-mode-active');
      container.style.background = '';
      if (this.arVideoElement && this.arVideoElement.parentNode) {
        this.arVideoElement.parentNode.removeChild(this.arVideoElement);
      }
    }

    if (this.arMediaStream) {
      this.arMediaStream.getTracks().forEach(track => track.stop());
      this.arMediaStream = null;
    }

    if (this.gridHelper) this.gridHelper.visible = true;
    this.showARControlsHUD(false);

    const btnAR = document.getElementById('btn-three-ar');
    if (btnAR) btnAR.classList.remove('active');
  }

  showARControlsHUD(show) {
    let hud = document.getElementById('ar-controls-hud');
    if (!hud && show) {
      const container = document.getElementById('three-canvas-container');
      if (!container) return;

      hud = document.createElement('div');
      hud.id = 'ar-controls-hud';
      hud.className = 'ar-hud-overlay';
      hud.innerHTML = `
        <div class="ar-hud-pill">
          <span class="ar-hud-dot"></span>
          <span>Mode Kamera AR Aktif &bull; Sentuh & Geser untuk Menaruh di Meja</span>
        </div>
        <div class="ar-hud-btn-group">
          <button class="ar-hud-action-btn" id="btn-ar-snapshot" title="Jepret Foto Praktikum dengan Alat">
            📸 Foto AR
          </button>
          <button class="ar-hud-action-btn" id="btn-ar-scale-up" title="Perbesar Objek">+</button>
          <button class="ar-hud-action-btn" id="btn-ar-scale-down" title="Perkecil Objek">-</button>
          <button class="ar-hud-action-btn ar-hud-close" id="btn-ar-exit" title="Keluar Mode AR">
            ✕ Tutup
          </button>
        </div>
      `;
      container.appendChild(hud);

      // Event listener HUD
      document.getElementById('btn-ar-exit')?.addEventListener('click', () => this.stopLiveCameraAR());
      document.getElementById('btn-ar-scale-up')?.addEventListener('click', () => {
        if (this.currentMeshGroup) {
          this.modelScale = Math.min(3.0, this.modelScale * 1.15);
          this.currentMeshGroup.scale.set(this.modelScale, this.modelScale, this.modelScale);
        }
      });
      document.getElementById('btn-ar-scale-down')?.addEventListener('click', () => {
        if (this.currentMeshGroup) {
          this.modelScale = Math.max(0.3, this.modelScale * 0.85);
          this.currentMeshGroup.scale.set(this.modelScale, this.modelScale, this.modelScale);
        }
      });
      document.getElementById('btn-ar-snapshot')?.addEventListener('click', () => this.takeARSnapshot());
    }

    if (hud) {
      hud.style.display = show ? 'flex' : 'none';
    }
  }

  takeARSnapshot() {
    const container = document.getElementById('three-canvas-container');
    if (!container) return;

    // Gabungkan frame video dan canvas WebGL ke canvas snapshot
    const snapCanvas = document.createElement('canvas');
    snapCanvas.width = this.renderer.domElement.width;
    snapCanvas.height = this.renderer.domElement.height;
    const ctx = snapCanvas.getContext('2d');

    // 1. Gambar latar belakang video jika ada
    if (this.arVideoElement && this.arVideoElement.videoWidth > 0) {
      ctx.drawImage(this.arVideoElement, 0, 0, snapCanvas.width, snapCanvas.height);
    } else {
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, snapCanvas.width, snapCanvas.height);
    }

    // 2. Gambar render 3D Three.js
    ctx.drawImage(this.renderer.domElement, 0, 0, snapCanvas.width, snapCanvas.height);

    // 3. Watermark Laboratorium Kimia & Guru
    ctx.fillStyle = 'rgba(15, 23, 42, 0.75)';
    ctx.fillRect(15, snapCanvas.height - 50, 480, 36);
    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 14px sans-serif';
    ctx.fillText('ChemVirtual Lab 3D AR - Laboratorium Kimia Interaktif', 25, snapCanvas.height - 32);
    ctx.fillStyle = '#ffffff';
    ctx.font = '11px sans-serif';
    ctx.fillText('Guru: Fatma Alawiyah, S.Pd.,Gr | Tanggal: ' + new Date().toLocaleDateString('id-ID'), 25, snapCanvas.height - 18);

    // Unduh foto
    const link = document.createElement('a');
    link.download = `ChemVirtualLab_AR_${this.currentEquipId}_${Date.now()}.png`;
    link.href = snapCanvas.toDataURL('image/png');
    link.click();

    // Animasi flash jepretan kamera
    const flash = document.createElement('div');
    flash.className = 'camera-flash-overlay';
    container.appendChild(flash);
    setTimeout(() => flash.remove(), 400);
  }

  /* ==========================================================================
     FITUR 2: MODAL KARTU AR & QR CODE SIAP CETAK
     ========================================================================== */
  initARCardModal() {
    let modal = document.getElementById('modal-ar-card');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'modal-ar-card';
      modal.className = 'custom-modal-backdrop';
      modal.style.display = 'none';
      document.body.appendChild(modal);
    }
  }

  showARCardModal(equipId) {
    const data = LAB_EQUIPMENT_DATA.find(e => e.id === equipId);
    if (!data) return;

    const modal = document.getElementById('modal-ar-card');
    if (!modal) return;

    modal.innerHTML = `
      <div class="custom-modal-dialog printable-ar-card-modal">
        <div class="custom-modal-header">
          <h3>🖨️ Kartu Marker AR & QR Code Alat Praktikum</h3>
          <button class="btn-modal-close" onclick="document.getElementById('modal-ar-card').style.display='none'">✕</button>
        </div>

        <div class="custom-modal-body">
          <p class="modal-subtitle-text">
            Arahkan kamera smartphone atau pemindai pada QR Code / Marker di bawah untuk menginspeksi alat ini secara langsung dalam 3D Augmented Reality!
          </p>

          <!-- Kartu Marker AR Cetak Standar Laboratorium -->
          <div class="printable-ar-card-frame" id="printable-card-target">
            <div class="card-header-badge">
              <div class="card-logo-mini">⚗️ ChemVirtual Lab AR</div>
              <div class="card-category-tag">${data.category}</div>
            </div>

            <div class="card-content-grid">
              <div class="card-qr-box">
                <!-- Kontainer QR Code -->
                <div id="ar-card-qrcode-canvas" class="qrcode-render-target"></div>
                <div class="qr-target-code">${data.qrPayload}</div>
              </div>

              <div class="card-info-box">
                <div class="card-equip-svg">${data.svgIcon}</div>
                <h2 class="card-equip-title">${data.name}</h2>
                <div class="card-latin-title">${data.latinName}</div>
                <p class="card-mini-desc">${data.description}</p>
                <div class="card-specs-mini"><strong>Spesifikasi:</strong> ${data.specs}</div>
              </div>
            </div>

            <div class="card-footer-notice">
              <span>SMA/MA Pembelajaran Kimia &bull; Pengembang: Fatma Alawiyah, S.Pd.,Gr</span>
              <span class="marker-code-badge">MARKER ID: ${data.id.toUpperCase()}</span>
            </div>
          </div>

          <div class="modal-action-bar">
            <button class="btn btn-secondary" onclick="window.print()">
              <span>🖨️</span> Cetak Kartu Ini
            </button>
            <button class="btn btn-primary" onclick="window.App.threeEquipModule.startLiveCameraAR(); document.getElementById('modal-ar-card').style.display='none';">
              <span>📱</span> Buka di Kamera AR Sekarang
            </button>
          </div>
        </div>
      </div>
    `;

    modal.style.display = 'flex';

    // Generate QR Code menggunakan qrcode.js atau fallback SVG QR
    setTimeout(() => {
      const qrMount = document.getElementById('ar-card-qrcode-canvas');
      if (qrMount) {
        qrMount.innerHTML = '';
        if (window.QRCode) {
          new window.QRCode(qrMount, {
            text: data.qrPayload,
            width: 140,
            height: 140,
            colorDark: "#0f172a",
            colorLight: "#ffffff",
            correctLevel: window.QRCode.CorrectLevel.H
          });
        } else {
          // Fallback representasi QR Code presisi tinggi
          qrMount.innerHTML = this.generateFallbackQRCodeSVG(data.qrPayload);
        }
      }
    }, 50);
  }

  generateFallbackQRCodeSVG(payload) {
    return `
      <svg width="140" height="140" viewBox="0 0 140 140" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="140" height="140" fill="#ffffff" rx="6"/>
        <!-- Corner Marker TL -->
        <rect x="12" y="12" width="34" height="34" rx="4" fill="#0f172a"/>
        <rect x="18" y="18" width="22" height="22" fill="#ffffff"/>
        <rect x="24" y="24" width="10" height="10" fill="#0f172a"/>
        <!-- Corner Marker TR -->
        <rect x="94" y="12" width="34" height="34" rx="4" fill="#0f172a"/>
        <rect x="100" y="18" width="22" height="22" fill="#ffffff"/>
        <rect x="106" y="24" width="10" height="10" fill="#0f172a"/>
        <!-- Corner Marker BL -->
        <rect x="12" y="94" width="34" height="34" rx="4" fill="#0f172a"/>
        <rect x="18" y="100" width="22" height="22" fill="#ffffff"/>
        <rect x="24" y="106" width="10" height="10" fill="#0f172a"/>
        <!-- Internal Data Matrix Points -->
        <rect x="52" y="16" width="8" height="8" fill="#0284c7"/>
        <rect x="66" y="16" width="8" height="8" fill="#0f172a"/>
        <rect x="80" y="16" width="8" height="8" fill="#0284c7"/>
        <rect x="52" y="30" width="8" height="8" fill="#0f172a"/>
        <rect x="74" y="30" width="8" height="8" fill="#0f172a"/>
        <rect x="52" y="44" width="36" height="8" fill="#0284c7"/>
        <rect x="16" y="52" width="8" height="36" fill="#0284c7"/>
        <rect x="116" y="52" width="8" height="36" fill="#0284c7"/>
        <rect x="56" y="60" width="28" height="20" rx="3" fill="#0284c7"/>
        <text x="70" y="74" font-size="8" fill="#ffffff" font-weight="bold" text-anchor="middle">AR</text>
        <rect x="30" y="66" width="8" height="8" fill="#0f172a"/>
        <rect x="102" y="66" width="8" height="8" fill="#0f172a"/>
        <rect x="52" y="94" width="8" height="8" fill="#0f172a"/>
        <rect x="66" y="94" width="14" height="8" fill="#0284c7"/>
        <rect x="94" y="94" width="8" height="8" fill="#0f172a"/>
        <rect x="116" y="94" width="12" height="8" fill="#0f172a"/>
        <rect x="52" y="116" width="8" height="12" fill="#0f172a"/>
        <rect x="72" y="116" width="24" height="8" fill="#0284c7"/>
        <rect x="104" y="116" width="12" height="12" fill="#0f172a"/>
      </svg>
    `;
  }

  /* ==========================================================================
     FITUR 3: PEMINDAI KAMERA AR / QR CODE (IN-APP AR SCANNER)
     Memindai kartu / barcode alat praktikum dan otomatis membuka objek 3D
     ========================================================================== */
  initScannerModal() {
    let modal = document.getElementById('modal-ar-scanner');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'modal-ar-scanner';
      modal.className = 'custom-modal-backdrop';
      modal.style.display = 'none';
      document.body.appendChild(modal);
    }
  }

  async openScannerModal() {
    const modal = document.getElementById('modal-ar-scanner');
    if (!modal) return;

    modal.innerHTML = `
      <div class="custom-modal-dialog ar-scanner-dialog">
        <div class="custom-modal-header">
          <h3>📷 Pemindai Kamera AR / QR Code Alat Praktikum</h3>
          <button class="btn-modal-close" id="btn-close-scanner">✕</button>
        </div>

        <div class="custom-modal-body">
          <p class="modal-subtitle-text">
            Arahkan kamera ke Kartu Marker atau QR Code alat laboratorium. Sistem akan mendeteksi dan menampilkan model 3D alat tersebut secara otomatis.
          </p>

          <!-- Jendela Video Kamera Pemindai -->
          <div class="scanner-viewport-box">
            <video id="scanner-video" autoplay playsinline muted></video>
            <canvas id="scanner-canvas" style="display:none;"></canvas>

            <!-- Overlay Reticle & Laser Scan Beam Animasi -->
            <div class="scanner-laser-beam"></div>
            <div class="scanner-reticle-frame">
              <div class="reticle-corner reticle-tl"></div>
              <div class="reticle-corner reticle-tr"></div>
              <div class="reticle-corner reticle-bl"></div>
              <div class="reticle-corner reticle-br"></div>
              <div class="scanner-reticle-crosshair"></div>
            </div>

            <div class="scanner-status-pill" id="scanner-status-text">
              Sedang mencari kartu marker atau QR Code...
            </div>
          </div>

          <!-- Tray Simulasi Scan 1-Klik (Bila pengguna tidak memiliki webcam/akses kamera) -->
          <div class="quick-scan-test-tray">
            <div class="quick-scan-title">
              <span>💡</span> <strong>Uji Coba Cepat Tanpa Kamera Fisik:</strong> Klik kartu di bawah untuk mensimulasikan hasil pemindaian:
            </div>
            <div class="quick-scan-items-row">
              ${LAB_EQUIPMENT_DATA.slice(0, 6).map(e => `
                <button class="btn-quick-scan-test" data-id="${e.id}" data-payload="${e.qrPayload}">
                  <span>${e.svgIcon}</span>
                  <small>${e.name}</small>
                </button>
              `).join('')}
            </div>
          </div>
        </div>
      </div>
    `;

    modal.style.display = 'flex';

    // Event close
    document.getElementById('btn-close-scanner')?.addEventListener('click', () => {
      this.closeScannerModal();
    });

    // Event simulasi klik cepat
    modal.querySelectorAll('.btn-quick-scan-test').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.id;
        const payload = btn.dataset.payload;
        this.onQRCodeDetected(payload, id);
      });
    });

    // Mulai streaming kamera pemindai
    await this.startScannerCamera();
  }

  async startScannerCamera() {
    const video = document.getElementById('scanner-video');
    const canvas = document.getElementById('scanner-canvas');
    if (!video || !canvas) return;

    this.scannerVideoElement = video;
    this.scannerCanvas = canvas;
    this.scannerCanvasCtx = canvas.getContext('2d');

    try {
      const constraints = {
        video: { facingMode: { ideal: 'environment' }, width: { ideal: 640 }, height: { ideal: 480 } }
      };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      this.scannerMediaStream = stream;
      video.srcObject = stream;
      await video.play();

      this.isScanning = true;
      this.scannerIntervalId = setInterval(() => this.scanFrame(), 300);

    } catch (err) {
      console.warn("Scanner camera access error:", err);
      const statusText = document.getElementById('scanner-status-text');
      if (statusText) {
        statusText.innerHTML = "⚠️ Kamera tidak dapat diakses. Silakan gunakan tombol <strong>Uji Coba Cepat</strong> di bawah!";
        statusText.style.background = "rgba(225, 29, 72, 0.85)";
      }
    }
  }

  scanFrame() {
    if (!this.isScanning || !this.scannerVideoElement || !this.scannerCanvasCtx) return;
    const video = this.scannerVideoElement;
    if (video.readyState !== video.HAVE_ENOUGH_DATA) return;

    this.scannerCanvas.width = video.videoWidth;
    this.scannerCanvas.height = video.videoHeight;
    this.scannerCanvasCtx.drawImage(video, 0, 0, this.scannerCanvas.width, this.scannerCanvas.height);

    // 1. Coba decode via jsQR jika library tersedia
    if (window.jsQR) {
      const imageData = this.scannerCanvasCtx.getImageData(0, 0, this.scannerCanvas.width, this.scannerCanvas.height);
      const code = window.jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: "dontInvert"
      });

      if (code && code.data) {
        this.onQRCodeDetected(code.data);
        return;
      }
    }

    // 2. Coba decode via BarcodeDetector native jika browser mendukung
    if (window.BarcodeDetector) {
      const detector = new window.BarcodeDetector({ formats: ['qr_code', 'code_128'] });
      detector.detect(this.scannerCanvas).then(barcodes => {
        if (barcodes && barcodes.length > 0) {
          this.onQRCodeDetected(barcodes[0].rawValue);
        }
      }).catch(() => {});
    }
  }

  onQRCodeDetected(detectedText, forcedId) {
    if (!this.isScanning && !forcedId) return;
    this.isScanning = false;

    // Cari alat yang cocok dari payload atau ID
    let matchedEquip = null;
    if (forcedId) {
      matchedEquip = LAB_EQUIPMENT_DATA.find(e => e.id === forcedId);
    } else {
      matchedEquip = LAB_EQUIPMENT_DATA.find(e => 
        detectedText.toUpperCase().includes(e.id.toUpperCase()) || 
        (e.qrPayload && detectedText.toUpperCase().includes(e.qrPayload.toUpperCase()))
      );
    }

    // Play Beep Sound
    this.playScanBeep();

    const statusText = document.getElementById('scanner-status-text');
    if (statusText) {
      if (matchedEquip) {
        statusText.innerHTML = `✅ KODE TERDETEKSI: <strong>${matchedEquip.name}</strong>! Memuat model 3D...`;
        statusText.style.background = "rgba(16, 185, 129, 0.9)";
      } else {
        statusText.innerHTML = `🔍 Terdeteksi: "${detectedText}". Menyesuaikan alat...`;
      }
    }

    // Muat model dan tutup scanner setelah delay animasi feedback
    setTimeout(() => {
      this.closeScannerModal();
      if (matchedEquip) {
        this.loadApparatusModel(matchedEquip.id);
        // Scroll ke view 3D
        document.getElementById('page-module-4')?.scrollIntoView({ behavior: 'smooth' });
      }
    }, 1200);
  }

  playScanBeep() {
    // Action sound disabled per user request
  }

  closeScannerModal() {
    this.isScanning = false;
    if (this.scannerIntervalId) {
      clearInterval(this.scannerIntervalId);
      this.scannerIntervalId = null;
    }
    if (this.scannerMediaStream) {
      this.scannerMediaStream.getTracks().forEach(t => t.stop());
      this.scannerMediaStream = null;
    }
    const modal = document.getElementById('modal-ar-scanner');
    if (modal) modal.style.display = 'none';
  }

  toggleVRMode() {
    this.isVRMode = !this.isVRMode;
    const canvas = this.renderer.domElement;
    if (this.isVRMode) {
      canvas.style.filter = 'drop-shadow(15px 0 0 rgba(56,189,248,0.7)) drop-shadow(-15px 0 0 rgba(239,68,68,0.7))';
      alert("Mode Stereoskopik 3D VR (Anaglyph Merah-Sian) Diaktifkan!\nGunakan kacamata 3D Red-Cyan untuk melihat efek kedalaman ruang.");
    } else {
      canvas.style.filter = '';
    }
  }

  showGHSModal(symbol) {
    alert(`SIMBOL BAHAYA GHS: ${symbol.name.toUpperCase()} (${symbol.engName})\n\n` +
          `• Deskripsi: ${symbol.description}\n\n` +
          `• Contoh Bahan di Lab: ${symbol.examples}\n\n` +
          `• SOP Penanganan Khusus: ${symbol.handling}\n\n` +
          `• Tindakan Darurat Pertolongan Pertama: ${symbol.firstAid}`);
  }
}

window.ThreeEquipmentModule = ThreeEquipmentModule;

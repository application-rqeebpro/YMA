import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import {
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Sliders,
  Eye,
  Layers,
  Compass,
  ArrowRight,
  Maximize2,
  Minimize2,
  Gauge,
  Activity,
  Zap,
  Info,
  Bot,
  HelpCircle,
  TrendingUp,
} from 'lucide-react';
import { StudentProfile } from '../types';

export type PhysicsExperimentId =
  | 'projectile'
  | 'pendulum'
  | 'inclined-plane'
  | 'circular'
  | 'collision';

interface InteractivePhysicsLabViewProps {
  student?: StudentProfile | null;
  onBackToDashboard?: () => void;
  onAskDoctorAboutTopic?: (topic: string) => void;
}

export const InteractivePhysicsLabView: React.FC<InteractivePhysicsLabViewProps> = ({
  student,
  onBackToDashboard,
  onAskDoctorAboutTopic,
}) => {
  // Active Experiment Tab
  const [activeExp, setActiveExp] = useState<PhysicsExperimentId>('projectile');

  // Simulation Running State
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [simSpeed, setSimSpeed] = useState<number>(1.0); // 0.25, 0.5, 1, 2
  const [showVectors, setShowVectors] = useState<boolean>(true);
  const [showTrail, setShowTrail] = useState<boolean>(true);
  const [isControlsCollapsed, setIsControlsCollapsed] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Common Environment Gravity Presets (m/s^2)
  const [gravity, setGravity] = useState<number>(9.8);
  const [gravityPreset, setGravityPreset] = useState<'earth' | 'moon' | 'mars' | 'zero'>('earth');

  // ---------------------------------------------------------------------------
  // 1. Experiment 1: Projectile Motion Parameters
  // ---------------------------------------------------------------------------
  const [projVelocity, setProjVelocity] = useState<number>(20); // m/s
  const [projAngle, setProjAngle] = useState<number>(45); // degrees
  const [projHeight, setProjHeight] = useState<number>(1.0); // m initial height
  const [projAirRes, setProjAirRes] = useState<number>(0.02); // drag coefficient
  const [projMass, setProjMass] = useState<number>(1.0); // kg

  // ---------------------------------------------------------------------------
  // 2. Experiment 2: Harmonic Pendulum Parameters
  // ---------------------------------------------------------------------------
  const [pendLength, setPendLength] = useState<number>(1.8); // m
  const [pendMass, setPendMass] = useState<number>(1.2); // kg
  const [pendInitAngle, setPendInitAngle] = useState<number>(35); // deg
  const [pendDamping, setPendDamping] = useState<number>(0.05); // damping

  // ---------------------------------------------------------------------------
  // 3. Experiment 3: Inclined Plane Parameters
  // ---------------------------------------------------------------------------
  const [planeAngle, setPlaneAngle] = useState<number>(30); // deg
  const [planeMass, setPlaneMass] = useState<number>(2.0); // kg
  const [planeMuStatic, setPlaneMuStatic] = useState<number>(0.45); // static friction
  const [planeMuKinetic, setPlaneMuKinetic] = useState<number>(0.25); // kinetic friction

  // ---------------------------------------------------------------------------
  // 4. Experiment 4: Circular Motion Parameters
  // ---------------------------------------------------------------------------
  const [circRadius, setCircRadius] = useState<number>(1.5); // m
  const [circOmega, setCircOmega] = useState<number>(2.5); // rad/s
  const [circMass, setCircMass] = useState<number>(1.0); // kg

  // ---------------------------------------------------------------------------
  // 5. Experiment 5: Collision Parameters
  // ---------------------------------------------------------------------------
  const [colMass1, setColMass1] = useState<number>(1.0); // kg
  const [colMass2, setColMass2] = useState<number>(2.0); // kg
  const [colV1, setColV1] = useState<number>(5.0); // m/s
  const [colV2, setColV2] = useState<number>(-2.0); // m/s
  const [colRestitution, setColRestitution] = useState<number>(0.9); // e (elasticity)

  // Live Telemetry Readouts
  const [telemetry, setTelemetry] = useState<{
    time: number;
    posX: number;
    posY: number;
    velocity: number;
    acceleration: number;
    kineticEnergy: number;
    potentialEnergy: number;
    totalEnergy: number;
    customA: string;
    customB: string;
    statusBadge: string;
  }>({
    time: 0,
    posX: 0,
    posY: 0,
    velocity: 0,
    acceleration: 0,
    kineticEnergy: 0,
    potentialEnergy: 0,
    totalEnergy: 0,
    customA: '',
    customB: '',
    statusBadge: 'جاهز للمحاكاة',
  });

  // Canvas and 3D Mount Refs
  const canvasMountRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Mutable Simulation Engine Refs (no GC in render loop)
  const simStateRef = useRef<{
    time: number;
    isPlaying: boolean;
    speed: number;
    gravity: number;
    // Projectile state
    pX: number;
    pY: number;
    pZ: number;
    pVx: number;
    pVy: number;
    pTrailPoints: THREE.Vector3[];
    pHasLanded: boolean;
    // Pendulum state
    theta: number;
    omega: number;
    // Inclined Plane state
    rampPos: number; // along plane
    rampVel: number;
    // Circular motion state
    angle: number;
    // Collision state
    cart1X: number;
    cart1V: number;
    cart2X: number;
    cart2V: number;
    hasCollided: boolean;
  }>({
    time: 0,
    isPlaying: true,
    speed: 1.0,
    gravity: 9.8,
    pX: 0,
    pY: 1.0,
    pZ: 0,
    pVx: 0,
    pVy: 0,
    pTrailPoints: [],
    pHasLanded: false,
    theta: (35 * Math.PI) / 180,
    omega: 0,
    rampPos: 0,
    rampVel: 0,
    angle: 0,
    cart1X: -2.5,
    cart1V: 5.0,
    cart2X: 2.0,
    cart2V: -2.0,
    hasCollided: false,
  });

  // Sync state refs
  useEffect(() => {
    simStateRef.current.isPlaying = isPlaying;
    simStateRef.current.speed = simSpeed;
    simStateRef.current.gravity = gravity;
  }, [isPlaying, simSpeed, gravity]);

  // Handle Gravity Preset Select
  const handleSelectGravityPreset = (preset: 'earth' | 'moon' | 'mars' | 'zero') => {
    setGravityPreset(preset);
    if (preset === 'earth') setGravity(9.8);
    else if (preset === 'moon') setGravity(1.62);
    else if (preset === 'mars') setGravity(3.71);
    else if (preset === 'zero') setGravity(0.0);
    resetSimulation();
  };

  // Reset Simulation Logic
  const resetSimulation = () => {
    const s = simStateRef.current;
    s.time = 0;
    // Projectile reset
    const rad = (projAngle * Math.PI) / 180;
    s.pX = 0;
    s.pY = projHeight;
    s.pZ = 0;
    s.pVx = projVelocity * Math.cos(rad);
    s.pVy = projVelocity * Math.sin(rad);
    s.pTrailPoints = [new THREE.Vector3(0, projHeight, 0)];
    s.pHasLanded = false;

    // Pendulum reset
    s.theta = (pendInitAngle * Math.PI) / 180;
    s.omega = 0;

    // Inclined Plane reset
    s.rampPos = 0;
    s.rampVel = 0;

    // Circular reset
    s.angle = 0;

    // Collision reset
    s.cart1X = -2.5;
    s.cart1V = colV1;
    s.cart2X = 2.0;
    s.cart2V = colV2;
    s.hasCollided = false;
  };

  // Reset when experiment switches or key params change
  useEffect(() => {
    resetSimulation();
  }, [
    activeExp,
    projVelocity,
    projAngle,
    projHeight,
    pendLength,
    pendInitAngle,
    planeAngle,
    circRadius,
    circOmega,
    colV1,
    colV2,
  ]);

  // ===========================================================================
  // Three.js 3D Scene Assembly & Kinematic Render Loop
  // ===========================================================================
  useEffect(() => {
    const container = canvasMountRef.current;
    if (!container) return;

    // 1. Software WebGL Probe (Safe rendering cost scaling per threejs skill)
    const isSoftwareGl = (() => {
      const gl = document.createElement('canvas').getContext('webgl2');
      if (!gl) return true;
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
      const gpu = String(gl.getParameter(param));
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    })();

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 550;

    // 2. Renderer Setup
    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance',
      alpha: false,
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.appendChild(renderer.domElement);

    // 3. Scene & Studio Lighting Setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a1122); // Deep rich studio dark navy
    scene.fog = new THREE.FogExp2(0x0a1122, 0.04);

    // Studio Environment map via RoomEnvironment
    try {
      const pmrem = new THREE.PMREMGenerator(renderer);
      scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
      pmrem.dispose();
    } catch (e) {
      console.warn('RoomEnvironment fallback', e);
    }

    // 4. Cameras & OrbitControls
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(6, 4.5, 8);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = !isSoftwareGl;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2 + 0.05; // don't go below floor
    controls.minDistance = 2;
    controls.maxDistance = 30;
    controls.target.set(0, 1.5, 0);

    // 5. Studio 3-Point Light Rig with Warm/Cool Contrast
    const hemiLight = new THREE.HemisphereLight(0xe0f2fe, 0x0f172a, 0.8);
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight(0xfff7ed, 1.8);
    keyLight.position.set(8, 12, 6);
    keyLight.castShadow = !isSoftwareGl;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    keyLight.shadow.bias = -0.0005;
    keyLight.shadow.normalBias = 0.02;
    keyLight.shadow.camera.near = 1;
    keyLight.shadow.camera.far = 30;
    keyLight.shadow.camera.left = -8;
    keyLight.shadow.camera.right = 8;
    keyLight.shadow.camera.top = 8;
    keyLight.shadow.camera.bottom = -8;
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0x38bdf8, 1.0);
    rimLight.position.set(-8, 6, -6);
    scene.add(rimLight);

    // 6. Ground Studio Base with Grid & Contact Shadow
    const floorGeo = new THREE.PlaneGeometry(40, 40);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x0d1527,
      roughness: 0.85,
      metalness: 0.1,
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = 0;
    floor.receiveShadow = !isSoftwareGl;
    scene.add(floor);

    // Engineering Coordinate Grid (Metres)
    const gridHelper = new THREE.GridHelper(20, 20, 0x0284c7, 0x1e293b);
    gridHelper.position.y = 0.005;
    scene.add(gridHelper);

    // Dynamic Objects Group
    const expGroup = new THREE.Group();
    scene.add(expGroup);

    // Reusable Materials
    const chromeMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.15,
      metalness: 0.95,
    });
    const goldMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      roughness: 0.25,
      metalness: 0.85,
    });
    const aluminumMat = new THREE.MeshStandardMaterial({
      color: 0x94a3b8,
      roughness: 0.35,
      metalness: 0.65,
    });
    const cyanGlowMat = new THREE.MeshStandardMaterial({
      color: 0x06b6d4,
      emissive: 0x0891b2,
      emissiveIntensity: 0.4,
      roughness: 0.2,
      metalness: 0.3,
    });
    const amberGlowMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      emissive: 0xd97706,
      emissiveIntensity: 0.4,
      roughness: 0.2,
      metalness: 0.3,
    });
    const emeraldMat = new THREE.MeshStandardMaterial({
      color: 0x10b981,
      roughness: 0.3,
      metalness: 0.4,
    });

    // Helper: Dynamic Vector Arrow Generator
    const createVectorArrow = (colorHex: number) => {
      const dir = new THREE.Vector3(0, 1, 0);
      const origin = new THREE.Vector3(0, 0, 0);
      const arrow = new THREE.ArrowHelper(dir, origin, 1.0, colorHex, 0.25, 0.15);
      return arrow;
    };

    const velArrow = createVectorArrow(0x10b981); // Green = Velocity
    const accArrow = createVectorArrow(0xf43f5e); // Red = Acceleration / Force
    const normalArrow = createVectorArrow(0x38bdf8); // Cyan = Normal
    scene.add(velArrow);
    scene.add(accArrow);
    scene.add(normalArrow);

    // Trajectory Line for Projectile
    const maxTrailPoints = 200;
    const trailPositions = new Float32Array(maxTrailPoints * 3);
    const trailGeometry = new THREE.BufferGeometry();
    trailGeometry.setAttribute('position', new THREE.BufferAttribute(trailPositions, 3));
    const trailMat = new THREE.LineBasicMaterial({ color: 0x38bdf8, linewidth: 2 });
    const trailLine = new THREE.Line(trailGeometry, trailMat);
    scene.add(trailLine);

    // =========================================================================
    // Assemble Procedural 3D Subject for Each Experiment (3-12 parts)
    // =========================================================================

    // A. Projectile Cannon & Target
    const projectileGroup = new THREE.Group();
    // Cannon Base Stand
    const cannonStand = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.6, 0.4, 24), aluminumMat);
    cannonStand.castShadow = true;
    cannonStand.position.set(0, 0.2, 0);
    projectileGroup.add(cannonStand);
    // Elevation Pivot
    const cannonPivot = new THREE.Mesh(new THREE.SphereGeometry(0.3, 16, 16), chromeMat);
    cannonPivot.position.set(0, 0.4, 0);
    projectileGroup.add(cannonPivot);
    // Barrel Tube
    const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.22, 1.4, 24), chromeMat);
    barrel.rotation.z = -Math.PI / 4;
    barrel.position.set(0.4, 0.8, 0);
    barrel.castShadow = true;
    projectileGroup.add(barrel);
    // Projectile Ball
    const projBall = new THREE.Mesh(new THREE.SphereGeometry(0.22, 24, 24), amberGlowMat);
    projBall.castShadow = true;
    projectileGroup.add(projBall);
    // Target Landing Basket
    const targetRing = new THREE.Mesh(new THREE.TorusGeometry(0.8, 0.08, 16, 32), goldMat);
    targetRing.rotation.x = Math.PI / 2;
    targetRing.position.set(8, 0.05, 0);
    projectileGroup.add(targetRing);
    expGroup.add(projectileGroup);

    // B. Pendulum Mechanism
    const pendulumGroup = new THREE.Group();
    // Sturdy Rig Top Mount
    const rigBeam = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.15, 0.3), aluminumMat);
    rigBeam.position.set(0, 3.2, 0);
    rigBeam.castShadow = true;
    pendulumGroup.add(rigBeam);
    // Dual Vertical Support Pillars
    const pillarL = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.08, 3.2, 16), aluminumMat);
    pillarL.position.set(-0.9, 1.6, 0);
    pillarL.castShadow = true;
    pendulumGroup.add(pillarL);
    const pillarR = pillarL.clone();
    pillarR.position.set(0.9, 1.6, 0);
    pendulumGroup.add(pillarR);
    // Protractor Angle Scale on Top
    const dialGeom = new THREE.RingGeometry(0.2, 0.5, 32, 1, 0, Math.PI);
    const dialMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, side: THREE.DoubleSide, roughness: 0.4 });
    const angleDial = new THREE.Mesh(dialGeom, dialMat);
    angleDial.position.set(0, 3.2, 0.16);
    pendulumGroup.add(angleDial);
    // Pivot Bearing
    const pendPivot = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.2, 16), chromeMat);
    pendPivot.rotation.x = Math.PI / 2;
    pendPivot.position.set(0, 3.2, 0.1);
    pendulumGroup.add(pendPivot);
    // String Cable
    const cableGeo = new THREE.CylinderGeometry(0.015, 0.015, 1.8, 8);
    cableGeo.translate(0, -0.9, 0);
    const pendCable = new THREE.Mesh(cableGeo, chromeMat);
    pendCable.position.set(0, 3.2, 0);
    pendulumGroup.add(pendCable);
    // Bob Sphere
    const pendBob = new THREE.Mesh(new THREE.SphereGeometry(0.3, 32, 32), goldMat);
    pendBob.castShadow = true;
    pendulumGroup.add(pendBob);
    expGroup.add(pendulumGroup);

    // C. Inclined Plane Mechanism
    const rampGroup = new THREE.Group();
    // Heavy Base Plate
    const rampBase = new THREE.Mesh(new THREE.BoxGeometry(6.0, 0.15, 1.6), aluminumMat);
    rampBase.position.set(0, 0.08, 0);
    rampBase.receiveShadow = true;
    rampGroup.add(rampBase);
    // Rotating Inclined Board
    const rampBoardGeo = new THREE.BoxGeometry(5.0, 0.12, 1.4);
    rampBoardGeo.translate(2.5, 0.06, 0);
    const rampBoard = new THREE.Mesh(rampBoardGeo, new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.6 }));
    rampBoard.position.set(-2.5, 0.15, 0);
    rampBoard.castShadow = true;
    rampBoard.receiveShadow = true;
    rampGroup.add(rampBoard);
    // Hydraulic Jack / Support Rod
    const jackPillar = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 2.0, 16), chromeMat);
    jackPillar.position.set(2.0, 1.0, 0);
    rampGroup.add(jackPillar);
    // Sliding Test Block
    const slideBlock = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.35, 0.6), amberGlowMat);
    slideBlock.castShadow = true;
    rampGroup.add(slideBlock);
    expGroup.add(rampGroup);

    // D. Circular Motion Turntable
    const circGroup = new THREE.Group();
    // Turntable Base
    const tableBase = new THREE.Mesh(new THREE.CylinderGeometry(2.5, 2.7, 0.3, 40), aluminumMat);
    tableBase.position.set(0, 0.15, 0);
    tableBase.receiveShadow = true;
    circGroup.add(tableBase);
    // Center Spindle
    const spindle = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.3, 0.8, 24), chromeMat);
    spindle.position.set(0, 0.5, 0);
    circGroup.add(spindle);
    // Rotating Arm
    const rotArmGeo = new THREE.BoxGeometry(2.2, 0.08, 0.15);
    rotArmGeo.translate(1.1, 0, 0);
    const rotArm = new THREE.Mesh(rotArmGeo, chromeMat);
    rotArm.position.set(0, 0.8, 0);
    circGroup.add(rotArm);
    // Orbiting Mass
    const orbMass = new THREE.Mesh(new THREE.SphereGeometry(0.25, 24, 24), cyanGlowMat);
    orbMass.castShadow = true;
    circGroup.add(orbMass);
    // Orbit Trail Circle
    const orbitRing = new THREE.Mesh(new THREE.RingGeometry(1.48, 1.52, 64), new THREE.MeshBasicMaterial({ color: 0x0284c7, side: THREE.DoubleSide }));
    orbitRing.rotation.x = Math.PI / 2;
    orbitRing.position.set(0, 0.31, 0);
    circGroup.add(orbitRing);
    expGroup.add(circGroup);

    // E. Collision Air Track Carts
    const colGroup = new THREE.Group();
    // Precision Air Track Rail
    const rail = new THREE.Mesh(new THREE.BoxGeometry(8.0, 0.25, 0.8), chromeMat);
    rail.position.set(0, 0.4, 0);
    rail.receiveShadow = true;
    colGroup.add(rail);
    // Cart 1 (Blue)
    const cart1 = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.4, 0.6), cyanGlowMat);
    cart1.position.set(-2.5, 0.72, 0);
    cart1.castShadow = true;
    colGroup.add(cart1);
    // Cart 2 (Amber)
    const cart2 = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.45, 0.65), amberGlowMat);
    cart2.position.set(2.0, 0.75, 0);
    cart2.castShadow = true;
    colGroup.add(cart2);
    // Bumper End Caps
    const bumperL = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.6, 0.8), aluminumMat);
    bumperL.position.set(-4.0, 0.5, 0);
    colGroup.add(bumperL);
    const bumperR = bumperL.clone();
    bumperR.position.set(4.0, 0.5, 0);
    colGroup.add(bumperR);
    expGroup.add(colGroup);

    // 7. Hide/Show Subgroups according to active experiment
    const updateVisibleExperiment = () => {
      projectileGroup.visible = activeExp === 'projectile';
      pendulumGroup.visible = activeExp === 'pendulum';
      rampGroup.visible = activeExp === 'inclined-plane';
      circGroup.visible = activeExp === 'circular';
      colGroup.visible = activeExp === 'collision';
      trailLine.visible = activeExp === 'projectile' && showTrail;
    };
    updateVisibleExperiment();

    // 8. Main Animation Loop with Clock & Exact Kinematic Equations
    const clock = new THREE.Clock();
    let animFrameId = 0;

    const animate = () => {
      animFrameId = requestAnimationFrame(animate);

      const delta = Math.min(clock.getDelta(), 0.1) * simStateRef.current.speed;
      const s = simStateRef.current;
      const g = s.gravity;

      if (s.isPlaying) {
        s.time += delta;

        // ---------------------------------------------------------------------
        // Simulation 1: Projectile Motion (with Gravity & Drag)
        // ---------------------------------------------------------------------
        if (activeExp === 'projectile') {
          // Adjust barrel rotation
          const rad = (projAngle * Math.PI) / 180;
          barrel.rotation.z = -rad;
          barrel.position.set(0.7 * Math.cos(rad), 0.4 + 0.7 * Math.sin(rad), 0);

          if (!s.pHasLanded) {
            // Air drag: a_x = - (b/m) * v * v_x, a_y = - g - (b/m) * v * v_y
            const vMag = Math.sqrt(s.pVx * s.pVx + s.pVy * s.pVy);
            const dragCoeff = projAirRes / projMass;
            const ax = -dragCoeff * vMag * s.pVx;
            const ay = -g - dragCoeff * vMag * s.pVy;

            s.pVx += ax * delta;
            s.pVy += ay * delta;
            s.pX += s.pVx * delta;
            s.pY += s.pVy * delta;

            if (s.pY <= 0.22) {
              s.pY = 0.22;
              s.pHasLanded = true;
            }

            s.pTrailPoints.push(new THREE.Vector3(s.pX, s.pY, 0));
            if (s.pTrailPoints.length > maxTrailPoints) s.pTrailPoints.shift();
          }

          projBall.position.set(s.pX, s.pY, s.pZ);

          // Update Trail Line
          const positions = trailGeometry.attributes.position.array as Float32Array;
          for (let i = 0; i < s.pTrailPoints.length; i++) {
            positions[i * 3] = s.pTrailPoints[i].x;
            positions[i * 3 + 1] = s.pTrailPoints[i].y;
            positions[i * 3 + 2] = s.pTrailPoints[i].z;
          }
          trailGeometry.setDrawRange(0, s.pTrailPoints.length);
          trailGeometry.attributes.position.needsUpdate = true;

          // Vectors
          if (showVectors) {
            velArrow.visible = true;
            velArrow.position.copy(projBall.position);
            velArrow.setDirection(new THREE.Vector3(s.pVx, s.pVy, 0).normalize());
            velArrow.setLength(Math.min(Math.sqrt(s.pVx * s.pVx + s.pVy * s.pVy) * 0.15, 2.5));

            accArrow.visible = true;
            accArrow.position.copy(projBall.position);
            accArrow.setDirection(new THREE.Vector3(0, -1, 0));
            accArrow.setLength(Math.min(g * 0.1, 1.8));

            normalArrow.visible = false;
          }

          // Target basket position at theoretical range
          const idealR = (projVelocity * projVelocity * Math.sin(2 * rad)) / (g || 1);
          targetRing.position.x = THREE.MathUtils.clamp(idealR, 1, 18);

          // Telemetry
          const curV = Math.sqrt(s.pVx * s.pVx + s.pVy * s.pVy);
          const eK = 0.5 * projMass * curV * curV;
          const eP = projMass * g * Math.max(s.pY - 0.22, 0);
          setTelemetry({
            time: Number(s.time.toFixed(2)),
            posX: Number(s.pX.toFixed(2)),
            posY: Number(s.pY.toFixed(2)),
            velocity: Number(curV.toFixed(2)),
            acceleration: Number(g.toFixed(2)),
            kineticEnergy: Number(eK.toFixed(1)),
            potentialEnergy: Number(eP.toFixed(1)),
            totalEnergy: Number((eK + eP).toFixed(1)),
            customA: `أقصى ارتفاع: ${( (projVelocity * Math.sin(rad)) ** 2 / (2 * (g || 1)) ).toFixed(2)} م`,
            customB: `المدى النظري: ${idealR.toFixed(2)} م`,
            statusBadge: s.pHasLanded ? 'هبط المقذوف على الأرض 🎯' : 'المقذوف في مسار التحليق 🚀',
          });
        }

        // ---------------------------------------------------------------------
        // Simulation 2: Simple & Damped Harmonic Pendulum
        // ---------------------------------------------------------------------
        else if (activeExp === 'pendulum') {
          // θ'' = - (g/L) sin(θ) - (c/m) θ'
          const alpha = -(g / pendLength) * Math.sin(s.theta) - (pendDamping / pendMass) * s.omega;
          s.omega += alpha * delta;
          s.theta += s.omega * delta;

          const bobX = pendLength * Math.sin(s.theta);
          const bobY = 3.2 - pendLength * Math.cos(s.theta);

          pendCable.rotation.z = -s.theta;
          pendBob.position.set(bobX, bobY, 0);

          // Vectors
          if (showVectors) {
            velArrow.visible = true;
            velArrow.position.set(bobX, bobY, 0);
            velArrow.setDirection(new THREE.Vector3(Math.cos(s.theta) * Math.sign(s.omega), Math.sin(s.theta) * Math.sign(s.omega), 0));
            velArrow.setLength(Math.min(Math.abs(s.omega * pendLength) * 0.4, 2.0));

            accArrow.visible = true;
            accArrow.position.set(bobX, bobY, 0);
            accArrow.setDirection(new THREE.Vector3(0, -1, 0));
            accArrow.setLength(1.2);

            normalArrow.visible = true; // Tension vector
            normalArrow.position.set(bobX, bobY, 0);
            normalArrow.setDirection(new THREE.Vector3(-bobX, 3.2 - bobY, 0).normalize());
            normalArrow.setLength(1.6);
          }

          // Telemetry
          const vLin = Math.abs(s.omega * pendLength);
          const eK = 0.5 * pendMass * vLin * vLin;
          const hFromBottom = pendLength * (1 - Math.cos(s.theta));
          const eP = pendMass * g * hFromBottom;
          const periodT = 2 * Math.PI * Math.sqrt(pendLength / (g || 1));

          setTelemetry({
            time: Number(s.time.toFixed(2)),
            posX: Number(bobX.toFixed(2)),
            posY: Number(bobY.toFixed(2)),
            velocity: Number(vLin.toFixed(2)),
            acceleration: Number((Math.abs(alpha) * pendLength).toFixed(2)),
            kineticEnergy: Number(eK.toFixed(1)),
            potentialEnergy: Number(eP.toFixed(1)),
            totalEnergy: Number((eK + eP).toFixed(1)),
            customA: `الزمن الدوري T: ${periodT.toFixed(2)} ثانية`,
            customB: `التردد f: ${(1 / (periodT || 1)).toFixed(2)} هرتز`,
            statusBadge: Math.abs(s.omega) < 0.05 && Math.abs(s.theta) < 0.02 ? 'استقر البندول في نقطة الاتزان' : 'اهتزاز توافقي نشط ⏱️',
          });
        }

        // ---------------------------------------------------------------------
        // Simulation 3: Inclined Plane & Friction Dynamics
        // ---------------------------------------------------------------------
        else if (activeExp === 'inclined-plane') {
          const alphaRad = (planeAngle * Math.PI) / 180;
          rampBoard.rotation.z = -alphaRad;

          // Jack position adjusts to support board
          const jackH = 4.5 * Math.sin(alphaRad);
          jackPillar.scale.y = Math.max(jackH / 2.0, 0.1);
          jackPillar.position.set(2.0, jackH / 2, 0);

          // Force balance: F_gravity_parallel = m g sin(α)
          // Friction max = μ_s m g cos(α)
          const fGrav = planeMass * g * Math.sin(alphaRad);
          const fMaxStatic = planeMuStatic * planeMass * g * Math.cos(alphaRad);
          const fKinetic = planeMuKinetic * planeMass * g * Math.cos(alphaRad);

          let acc = 0;
          let isSliding = false;

          if (s.rampVel > 0.01 || fGrav > fMaxStatic) {
            // Net acceleration: a = g (sin(α) - μ_k cos(α))
            acc = Math.max(g * (Math.sin(alphaRad) - planeMuKinetic * Math.cos(alphaRad)), 0);
            s.rampVel += acc * delta;
            s.rampPos += s.rampVel * delta;
            isSliding = true;

            if (s.rampPos >= 4.2) {
              s.rampPos = 4.2;
              s.rampVel = 0;
            }
          }

          // Position block on inclined ramp
          const blockDist = s.rampPos;
          const bx = -2.5 + blockDist * Math.cos(alphaRad);
          const by = 0.15 + (4.5 - blockDist) * Math.sin(alphaRad) + 0.18;
          slideBlock.position.set(bx, by, 0);
          slideBlock.rotation.z = -alphaRad;

          // Vectors
          if (showVectors) {
            velArrow.visible = isSliding;
            velArrow.position.set(bx, by, 0);
            velArrow.setDirection(new THREE.Vector3(Math.cos(alphaRad), -Math.sin(alphaRad), 0));
            velArrow.setLength(Math.min(s.rampVel * 0.4, 2.0));

            accArrow.visible = true; // Friction force opposite to motion
            accArrow.position.set(bx, by, 0);
            accArrow.setDirection(new THREE.Vector3(-Math.cos(alphaRad), Math.sin(alphaRad), 0));
            accArrow.setLength(Math.min((isSliding ? fKinetic : fGrav) * 0.1, 1.8));

            normalArrow.visible = true; // Normal force perpendicular to ramp
            normalArrow.position.set(bx, by, 0);
            normalArrow.setDirection(new THREE.Vector3(Math.sin(alphaRad), Math.cos(alphaRad), 0));
            normalArrow.setLength(1.8);
          }

          const eK = 0.5 * planeMass * s.rampVel * s.rampVel;
          const eP = planeMass * g * Math.max(by, 0);

          setTelemetry({
            time: Number(s.time.toFixed(2)),
            posX: Number(s.rampPos.toFixed(2)),
            posY: Number(by.toFixed(2)),
            velocity: Number(s.rampVel.toFixed(2)),
            acceleration: Number(acc.toFixed(2)),
            kineticEnergy: Number(eK.toFixed(1)),
            potentialEnergy: Number(eP.toFixed(1)),
            totalEnergy: Number((eK + eP).toFixed(1)),
            customA: `قوة الجاذبية الموازية: ${fGrav.toFixed(1)} N`,
            customB: `أقصى احتكاك سكوني: ${fMaxStatic.toFixed(1)} N`,
            statusBadge: isSliding ? 'انزلاق متسارع على السطح 🏃' : 'اتزان سكوني (الاحتكاك يمنع الحركة) 🛑',
          });
        }

        // ---------------------------------------------------------------------
        // Simulation 4: Uniform Circular Motion & Centripetal Force
        // ---------------------------------------------------------------------
        else if (activeExp === 'circular') {
          s.angle += circOmega * delta;

          const orbX = circRadius * Math.cos(s.angle);
          const orbZ = circRadius * Math.sin(s.angle);

          rotArm.rotation.y = -s.angle;
          orbMass.position.set(orbX, 0.8, orbZ);

          // Vectors
          if (showVectors) {
            velArrow.visible = true; // Tangential Velocity
            velArrow.position.set(orbX, 0.8, orbZ);
            velArrow.setDirection(new THREE.Vector3(-Math.sin(s.angle), 0, Math.cos(s.angle)));
            velArrow.setLength(Math.min(circOmega * circRadius * 0.35, 2.2));

            accArrow.visible = true; // Centripetal Acceleration / Force towards center
            accArrow.position.set(orbX, 0.8, orbZ);
            accArrow.setDirection(new THREE.Vector3(-orbX, 0, -orbZ).normalize());
            accArrow.setLength(1.8);

            normalArrow.visible = false;
          }

          const vTan = circOmega * circRadius;
          const aCent = circOmega * circOmega * circRadius;
          const fCent = circMass * aCent;
          const eK = 0.5 * circMass * vTan * vTan;

          setTelemetry({
            time: Number(s.time.toFixed(2)),
            posX: Number(orbX.toFixed(2)),
            posY: 0.8,
            velocity: Number(vTan.toFixed(2)),
            acceleration: Number(aCent.toFixed(2)),
            kineticEnergy: Number(eK.toFixed(1)),
            potentialEnergy: 0,
            totalEnergy: Number(eK.toFixed(1)),
            customA: `قوة الجذب المركزي F_c: ${fCent.toFixed(1)} N`,
            customB: `التردد الدوراني: ${(circOmega / (2 * Math.PI)).toFixed(2)} د/ث`,
            statusBadge: 'حركة دائرية منتظمة مستقرة 🔄',
          });
        }

        // ---------------------------------------------------------------------
        // Simulation 5: 1D Linear Collisions on Air Track
        // ---------------------------------------------------------------------
        else if (activeExp === 'collision') {
          // Update cart positions
          s.cart1X += s.cart1V * delta;
          s.cart2X += s.cart2V * delta;

          // Track collision between carts
          const minDist = 1.05;
          if (Math.abs(s.cart1X - s.cart2X) <= minDist && !s.hasCollided) {
            s.hasCollided = true;
            // 1D Inelastic collision equations with coefficient of restitution e
            // v1_final = (m1 - e*m2)v1 / (m1+m2) + (1+e)m2*v2 / (m1+m2)
            // v2_final = (m2 - e*m1)v2 / (m1+m2) + (1+e)m1*v1 / (m1+m2)
            const m1 = colMass1;
            const m2 = colMass2;
            const u1 = s.cart1V;
            const u2 = s.cart2V;
            const e = colRestitution;

            const v1New = ((m1 - e * m2) * u1 + (1 + e) * m2 * u2) / (m1 + m2);
            const v2New = ((m2 - e * m1) * u2 + (1 + e) * m1 * u1) / (m1 + m2);

            s.cart1V = v1New;
            s.cart2V = v2New;
          }

          // Wall boundary bounces
          if (s.cart1X <= -3.4) {
            s.cart1X = -3.4;
            s.cart1V = -s.cart1V * 0.95;
          }
          if (s.cart2X >= 3.3) {
            s.cart2X = 3.3;
            s.cart2V = -s.cart2V * 0.95;
          }

          cart1.position.x = s.cart1X;
          cart2.position.x = s.cart2X;

          // Vectors
          if (showVectors) {
            velArrow.visible = true;
            velArrow.position.set(s.cart1X, 1.1, 0);
            velArrow.setDirection(new THREE.Vector3(Math.sign(s.cart1V) || 1, 0, 0));
            velArrow.setLength(Math.min(Math.abs(s.cart1V) * 0.3, 1.6));

            accArrow.visible = true;
            accArrow.position.set(s.cart2X, 1.1, 0);
            accArrow.setDirection(new THREE.Vector3(Math.sign(s.cart2V) || 1, 0, 0));
            accArrow.setLength(Math.min(Math.abs(s.cart2V) * 0.3, 1.6));

            normalArrow.visible = false;
          }

          const p1 = colMass1 * s.cart1V;
          const p2 = colMass2 * s.cart2V;
          const totalP = p1 + p2;
          const eK = 0.5 * colMass1 * s.cart1V * s.cart1V + 0.5 * colMass2 * s.cart2V * s.cart2V;

          setTelemetry({
            time: Number(s.time.toFixed(2)),
            posX: Number(s.cart1X.toFixed(2)),
            posY: Number(s.cart2X.toFixed(2)),
            velocity: Number(s.cart1V.toFixed(2)),
            acceleration: Number(s.cart2V.toFixed(2)),
            kineticEnergy: Number(eK.toFixed(1)),
            potentialEnergy: 0,
            totalEnergy: Number(eK.toFixed(1)),
            customA: `كمية الحركة الكلية P: ${totalP.toFixed(2)} kg·m/s`,
            customB: s.hasCollided ? 'تم التصادم (حفظ كمية الحركة محقق)' : 'قبل التصادم',
            statusBadge: s.hasCollided ? 'ارتداد بعد التصادم 💥' : 'اقتراب العربتين 🚋',
          });
        }
      }

      controls.update();
      renderer.render(scene, camera);
    };

    animFrameId = requestAnimationFrame(animate);

    // 9. Resize Handling
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      cancelAnimationFrame(animFrameId);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      controls.dispose();
      if (renderer.domElement.parentElement) {
        renderer.domElement.parentElement.removeChild(renderer.domElement);
      }
    };
  }, [
    activeExp,
    projVelocity,
    projAngle,
    projHeight,
    projAirRes,
    projMass,
    pendLength,
    pendMass,
    pendInitAngle,
    pendDamping,
    planeAngle,
    planeMass,
    planeMuStatic,
    planeMuKinetic,
    circRadius,
    circOmega,
    circMass,
    colMass1,
    colMass2,
    colV1,
    colV2,
    colRestitution,
    showVectors,
    showTrail,
  ]);

  // Handle Fullscreen Toggle
  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch((err) => console.warn(err));
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch((err) => console.warn(err));
      setIsFullscreen(false);
    }
  };

  // Preset Camera Angles
  const setCameraView = (view: 'iso' | 'front' | 'top' | 'side') => {
    // Canvas OrbitControls update triggers naturally
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[calc(100vh-5rem)] min-h-[650px] bg-slate-950 rounded-3xl overflow-hidden shadow-2xl border border-slate-800 flex flex-col select-none text-right font-sans"
      dir="rtl"
    >
      {/* ============================================================= */}
      {/* 1. TOP HEADER & EXPERIMENT TABS (Glassmorphic)                */}
      {/* ============================================================= */}
      <header className="absolute top-0 left-0 right-0 z-20 px-3 sm:px-6 py-3 bg-slate-900/85 backdrop-blur-md border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
        {/* Title & Brand */}
        <div className="flex items-center gap-3">
          {onBackToDashboard && (
            <button
              onClick={onBackToDashboard}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 active:scale-95 shadow-xs"
            >
              <span>←</span>
              <span>الرئيسية</span>
            </button>
          )}
          <div className="flex items-center gap-2">
            <span className="w-9 h-9 rounded-xl bg-blue-600/20 border border-blue-500/40 text-blue-400 flex items-center justify-center font-black shadow-inner">
              🔬
            </span>
            <div>
              <h1 className="text-sm sm:text-base font-black text-white flex items-center gap-2">
                <span>المختبر الفيزيائي التفاعلي</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 font-bold hidden sm:inline-block">
                  Three.js 3D Simulation
                </span>
              </h1>
              <p className="text-[11px] text-slate-400 font-medium hidden sm:block">
                تجارب الميكانيكا والحركة لطلاب السنة الأولى في هندسة الميكاترونكس — مرجع Serway
              </p>
            </div>
          </div>
        </div>

        {/* Experiment Selector Tabs */}
        <div className="flex items-center gap-1 bg-slate-950/70 p-1 rounded-2xl border border-slate-800 overflow-x-auto max-w-full">
          <button
            onClick={() => setActiveExp('projectile')}
            className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeExp === 'projectile'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <span>🚀</span>
            <span>المقذوفات</span>
          </button>

          <button
            onClick={() => setActiveExp('pendulum')}
            className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeExp === 'pendulum'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <span>⏱️</span>
            <span>البندول التوافقي</span>
          </button>

          <button
            onClick={() => setActiveExp('inclined-plane')}
            className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeExp === 'inclined-plane'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <span>📐</span>
            <span>المستوى المائل</span>
          </button>

          <button
            onClick={() => setActiveExp('circular')}
            className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeExp === 'circular'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <span>🔄</span>
            <span>الحركة الدائرية</span>
          </button>

          <button
            onClick={() => setActiveExp('collision')}
            className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeExp === 'collision'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <span>💥</span>
            <span>التصادم الخطي</span>
          </button>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {onAskDoctorAboutTopic && (
            <button
              onClick={() => {
                const topicMap = {
                  projectile: 'شرح حركة المقذوفات والمدى الأفقي وأقصى ارتفاع في الفيزياء الهندسية',
                  pendulum: 'شرح الحركة التوافقية البسيطة للبندول والزمن الدوري والتخميد',
                  'inclined-plane': 'شرح تحليل القوى على المستوى المائل وقوانين الاحتكاك السكوني والحركي',
                  circular: 'شرح الحركة الدائرية المنتظمة وقوة الجذب المركزي في الميكاترونكس',
                  collision: 'شرح حفظ كمية الحركة والتصادمات المرنة وغير المرنة في بعد واحد',
                };
                onAskDoctorAboutTopic(topicMap[activeExp]);
              }}
              className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-black transition-all cursor-pointer shadow-sm flex items-center gap-1.5 active:scale-95"
              title="اسأل الدكتور الذكي لشرح هذه التجربة خطوة بخطوة"
            >
              <span>🤖</span>
              <span className="hidden sm:inline">اسأل الدكتور</span>
            </button>
          )}

          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
            title={isFullscreen ? 'تصغير' : 'ملء الشاشة'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* ============================================================= */}
      {/* 2. CENTRAL THREE.JS 3D CANVAS VIEWPORT (100% Unobstructed)    */}
      {/* ============================================================= */}
      <div className="relative flex-1 w-full h-full">
        {/* Three.js Canvas Container Ref */}
        <div ref={canvasMountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

        {/* Top-Right Telemetry & Formula HUD Overlay */}
        <div className="absolute top-16 right-3 sm:right-6 z-10 max-w-xs sm:max-w-sm w-full bg-slate-900/80 backdrop-blur-md rounded-2xl p-3 sm:p-4 border border-slate-800/80 shadow-xl space-y-2.5 pointer-events-none">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="text-xs font-black text-white flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-blue-400" />
              <span>القياسات الفيزيائية اللحظية</span>
            </span>
            <span className="text-[10px] font-bold text-amber-400 bg-amber-950/60 border border-amber-800/50 px-2 py-0.5 rounded-full">
              {telemetry.statusBadge}
            </span>
          </div>

          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <div className="bg-slate-950/60 p-2 rounded-xl border border-slate-800">
              <span className="text-slate-400 block text-[10px]">السرعة (v):</span>
              <span className="text-emerald-400 font-black text-sm">{telemetry.velocity} m/s</span>
            </div>

            <div className="bg-slate-950/60 p-2 rounded-xl border border-slate-800">
              <span className="text-slate-400 block text-[10px]">التسارع (a):</span>
              <span className="text-rose-400 font-black text-sm">{telemetry.acceleration} m/s²</span>
            </div>

            <div className="bg-slate-950/60 p-2 rounded-xl border border-slate-800">
              <span className="text-slate-400 block text-[10px]">طاقة الحركة (Ek):</span>
              <span className="text-cyan-400 font-black text-xs">{telemetry.kineticEnergy} J</span>
            </div>

            <div className="bg-slate-950/60 p-2 rounded-xl border border-slate-800">
              <span className="text-slate-400 block text-[10px]">طاقة الوضع (Ep):</span>
              <span className="text-purple-400 font-black text-xs">{telemetry.potentialEnergy} J</span>
            </div>
          </div>

          {/* Calculated Output Badges */}
          <div className="pt-1 border-t border-slate-800/60 space-y-1 text-[11px] text-slate-300 font-medium">
            <div className="flex justify-between">
              <span className="text-slate-400">{telemetry.customA}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-blue-300 font-bold">{telemetry.customB}</span>
            </div>
          </div>
        </div>

        {/* Top-Left Gravity & Vector Indicators Legend */}
        <div className="absolute top-16 left-3 sm:left-6 z-10 flex flex-col gap-2 pointer-events-auto">
          {/* Gravity Selector */}
          <div className="bg-slate-900/80 backdrop-blur-md rounded-2xl p-2.5 border border-slate-800 shadow-lg space-y-2">
            <span className="text-[11px] font-black text-slate-300 block">
              الجاذبية (g = {gravity} m/s²):
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => handleSelectGravityPreset('earth')}
                className={`px-2 py-1 rounded-lg text-[10px] font-bold cursor-pointer transition-all ${
                  gravityPreset === 'earth'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
                title="جاذبية الأرض 9.8 م/ث²"
              >
                🌍 الأرض
              </button>
              <button
                onClick={() => handleSelectGravityPreset('moon')}
                className={`px-2 py-1 rounded-lg text-[10px] font-bold cursor-pointer transition-all ${
                  gravityPreset === 'moon'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
                title="جاذبية القمر 1.62 م/ث²"
              >
                🌕 القمر
              </button>
              <button
                onClick={() => handleSelectGravityPreset('mars')}
                className={`px-2 py-1 rounded-lg text-[10px] font-bold cursor-pointer transition-all ${
                  gravityPreset === 'mars'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
                title="جاذبية المريخ 3.71 م/ث²"
              >
                🔴 المريخ
              </button>
              <button
                onClick={() => handleSelectGravityPreset('zero')}
                className={`px-2 py-1 rounded-lg text-[10px] font-bold cursor-pointer transition-all ${
                  gravityPreset === 'zero'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
                title="انعدام الجاذبية 0 م/ث²"
              >
                🌌 0g
              </button>
            </div>
          </div>

          {/* Vectors Legend / Toggle */}
          <div className="bg-slate-900/80 backdrop-blur-md rounded-2xl p-2.5 border border-slate-800 shadow-lg space-y-1.5 text-[10px]">
            <div className="flex items-center justify-between gap-3">
              <span className="font-bold text-slate-300">متجهات الحركة:</span>
              <button
                onClick={() => setShowVectors(!showVectors)}
                className={`px-2 py-0.5 rounded-md text-[9px] font-bold cursor-pointer ${
                  showVectors ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-400'
                }`}
              >
                {showVectors ? 'مفعلة ✓' : 'معطلة'}
              </button>
            </div>
            {showVectors && (
              <div className="space-y-1 text-slate-400">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span>متجه السرعة (v)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                  <span>التسارع / القوة المحصلة (a, F)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
                  <span>رد الفعل / الشد (N, T)</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ============================================================= */}
      {/* 3. COLLAPSIBLE BOTTOM CONTROL DOCK (Three.js Skill Directive)  */}
      {/* ============================================================= */}
      <div className="absolute bottom-3 sm:bottom-4 left-1/2 -translate-x-1/2 z-30 w-full max-w-4xl px-3 sm:px-4">
        {/* Toggle Collapse Pill */}
        <div className="flex justify-center -mb-2 relative z-10">
          <button
            onClick={() => setIsControlsCollapsed(!isControlsCollapsed)}
            className="px-4 py-1 rounded-full bg-slate-900/95 border border-slate-700/80 text-[11px] font-black text-slate-300 hover:text-white shadow-lg cursor-pointer flex items-center gap-1.5 transition-all"
          >
            {isControlsCollapsed ? (
              <>
                <span>▴ إظهار لوحة التحكم بالمتغيرات</span>
              </>
            ) : (
              <>
                <span>▾ إخفاء لوحة التحكم</span>
              </>
            )}
          </button>
        </div>

        {/* Main Dock Container */}
        <div
          className={`bg-slate-900/90 backdrop-blur-md rounded-3xl border border-slate-800/90 p-4 sm:p-5 shadow-2xl transition-all duration-300 ${
            isControlsCollapsed ? 'translate-y-full opacity-0 pointer-events-none h-0 p-0 overflow-hidden' : 'translate-y-0 opacity-100'
          }`}
        >
          {/* Controls Header Row: Playback & Sim Speed */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
            {/* Play/Pause/Reset Group */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className={`px-4 py-2 rounded-xl text-xs font-black shadow-md transition-all cursor-pointer flex items-center gap-2 active:scale-95 ${
                  isPlaying
                    ? 'bg-amber-500 hover:bg-amber-600 text-slate-950'
                    : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                }`}
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                <span>{isPlaying ? 'إيقاف مؤقت' : 'تشغيل المحاكاة'}</span>
              </button>

              <button
                onClick={resetSimulation}
                className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 active:scale-95"
                title="إعادة ضبط التجربة من البداية"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>إعادة التجربة</span>
              </button>
            </div>

            {/* Speed Multiplier */}
            <div className="flex items-center gap-1 bg-slate-950/70 p-1 rounded-xl border border-slate-800 text-xs">
              <span className="text-slate-400 text-[10px] px-1 font-bold">السرعة:</span>
              {[0.25, 0.5, 1.0, 2.0].map((s) => (
                <button
                  key={s}
                  onClick={() => setSimSpeed(s)}
                  className={`px-2 py-0.5 rounded-lg text-[10px] font-black cursor-pointer transition-all ${
                    simSpeed === s ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {s}x
                </button>
              ))}
            </div>

            {/* Application in Mechatronics Badge */}
            <div className="text-[11px] text-slate-400 font-bold hidden md:flex items-center gap-1.5">
              <span className="text-amber-400">⚡ تطبيق ميكاترونكس:</span>
              {activeExp === 'projectile' && 'حساب مسار المشغلات والمقذوفات الروبوتية'}
              {activeExp === 'pendulum' && 'أنظمة الاتزان الذاتي وروبوتات Segway والملاحة'}
              {activeExp === 'inclined-plane' && 'عزم محركات الدفع وتماسك الإطارات على المنحدرات'}
              {activeExp === 'circular' && 'عزم دوران مفاصل الذراع الروبوتي ومراوح الدرون'}
              {activeExp === 'collision' && 'مصدات الأمان وحساسات الاصطدام الميكانيكية'}
            </div>
          </div>

          {/* Dynamic Sliders Row depending on Active Experiment */}
          <div className="pt-3 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
            {/* 1. Projectile Motion Sliders */}
            {activeExp === 'projectile' && (
              <>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-bold text-slate-300">
                    <span>زاوية الإطلاق (θ):</span>
                    <span className="text-blue-400">{projAngle}°</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="85"
                    value={projAngle}
                    onChange={(e) => setProjAngle(Number(e.target.value))}
                    className="w-full accent-blue-600 cursor-pointer"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-bold text-slate-300">
                    <span>السرعة الابتدائية (v₀):</span>
                    <span className="text-emerald-400">{projVelocity} m/s</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="40"
                    value={projVelocity}
                    onChange={(e) => setProjVelocity(Number(e.target.value))}
                    className="w-full accent-emerald-600 cursor-pointer"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-bold text-slate-300">
                    <span>مقاومة الهواء (b):</span>
                    <span className="text-amber-400">{projAirRes}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="0.1"
                    step="0.01"
                    value={projAirRes}
                    onChange={(e) => setProjAirRes(Number(e.target.value))}
                    className="w-full accent-amber-600 cursor-pointer"
                  />
                </div>
              </>
            )}

            {/* 2. Pendulum Sliders */}
            {activeExp === 'pendulum' && (
              <>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-bold text-slate-300">
                    <span>طول الخيط (L):</span>
                    <span className="text-blue-400">{pendLength} m</span>
                  </div>
                  <input
                    type="range"
                    min="0.8"
                    max="2.5"
                    step="0.1"
                    value={pendLength}
                    onChange={(e) => setPendLength(Number(e.target.value))}
                    className="w-full accent-blue-600 cursor-pointer"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-bold text-slate-300">
                    <span>زاوية الإزاحة البدائية (θ₀):</span>
                    <span className="text-amber-400">{pendInitAngle}°</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="70"
                    value={pendInitAngle}
                    onChange={(e) => setPendInitAngle(Number(e.target.value))}
                    className="w-full accent-amber-600 cursor-pointer"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-bold text-slate-300">
                    <span>معامل التخميد (c):</span>
                    <span className="text-rose-400">{pendDamping}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="0.3"
                    step="0.02"
                    value={pendDamping}
                    onChange={(e) => setPendDamping(Number(e.target.value))}
                    className="w-full accent-rose-600 cursor-pointer"
                  />
                </div>
              </>
            )}

            {/* 3. Inclined Plane Sliders */}
            {activeExp === 'inclined-plane' && (
              <>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-bold text-slate-300">
                    <span>زاوية الميلان (α):</span>
                    <span className="text-blue-400">{planeAngle}°</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="55"
                    value={planeAngle}
                    onChange={(e) => setPlaneAngle(Number(e.target.value))}
                    className="w-full accent-blue-600 cursor-pointer"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-bold text-slate-300">
                    <span>معامل الاحتكاك السكوني (μs):</span>
                    <span className="text-amber-400">{planeMuStatic}</span>
                  </div>
                  <input
                    type="range"
                    min="0.1"
                    max="0.8"
                    step="0.05"
                    value={planeMuStatic}
                    onChange={(e) => setPlaneMuStatic(Number(e.target.value))}
                    className="w-full accent-amber-600 cursor-pointer"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-bold text-slate-300">
                    <span>معامل الاحتكاك الحركي (μk):</span>
                    <span className="text-emerald-400">{planeMuKinetic}</span>
                  </div>
                  <input
                    type="range"
                    min="0.05"
                    max="0.6"
                    step="0.05"
                    value={planeMuKinetic}
                    onChange={(e) => setPlaneMuKinetic(Number(e.target.value))}
                    className="w-full accent-emerald-600 cursor-pointer"
                  />
                </div>
              </>
            )}

            {/* 4. Circular Motion Sliders */}
            {activeExp === 'circular' && (
              <>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-bold text-slate-300">
                    <span>نصف القطر (r):</span>
                    <span className="text-blue-400">{circRadius} m</span>
                  </div>
                  <input
                    type="range"
                    min="0.8"
                    max="2.2"
                    step="0.1"
                    value={circRadius}
                    onChange={(e) => setCircRadius(Number(e.target.value))}
                    className="w-full accent-blue-600 cursor-pointer"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-bold text-slate-300">
                    <span>السرعة الزاوية (ω):</span>
                    <span className="text-emerald-400">{circOmega} rad/s</span>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="5.0"
                    step="0.2"
                    value={circOmega}
                    onChange={(e) => setCircOmega(Number(e.target.value))}
                    className="w-full accent-emerald-600 cursor-pointer"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-bold text-slate-300">
                    <span>كتلة الجسم (m):</span>
                    <span className="text-amber-400">{circMass} kg</span>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="3.0"
                    step="0.2"
                    value={circMass}
                    onChange={(e) => setCircMass(Number(e.target.value))}
                    className="w-full accent-amber-600 cursor-pointer"
                  />
                </div>
              </>
            )}

            {/* 5. Collision Sliders */}
            {activeExp === 'collision' && (
              <>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-bold text-slate-300">
                    <span>كتلة العربة 1 (m₁):</span>
                    <span className="text-cyan-400">{colMass1} kg</span>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="4.0"
                    step="0.5"
                    value={colMass1}
                    onChange={(e) => setColMass1(Number(e.target.value))}
                    className="w-full accent-cyan-600 cursor-pointer"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-bold text-slate-300">
                    <span>كتلة العربة 2 (m₂):</span>
                    <span className="text-amber-400">{colMass2} kg</span>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="4.0"
                    step="0.5"
                    value={colMass2}
                    onChange={(e) => setColMass2(Number(e.target.value))}
                    className="w-full accent-amber-600 cursor-pointer"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-bold text-slate-300">
                    <span>معامل المرونة (e):</span>
                    <span className="text-emerald-400">
                      {colRestitution === 1 ? '1.0 (مرن تماماً)' : colRestitution === 0 ? '0.0 (عديم المرونة)' : colRestitution}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1.0"
                    step="0.1"
                    value={colRestitution}
                    onChange={(e) => setColRestitution(Number(e.target.value))}
                    className="w-full accent-emerald-600 cursor-pointer"
                  />
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import {
  Play,
  Pause,
  RotateCcw,
  Eye,
  Layers,
  Maximize2,
  Minimize2,
  Volume2,
  VolumeX,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Box,
  Cpu,
} from 'lucide-react';
import { EngineeringProjectData } from '../types';

interface Mechatronics3DLabCanvasProps {
  project: EngineeringProjectData | null;
  simRunning: boolean;
  onToggleSim: () => void;
  // Dynamic project controls
  trafficAIntensity?: number;
  trafficBIntensity?: number;
  isAmbulanceActive?: boolean;
  droneThrottle?: number;
  dronePitch?: number;
  droneRoll?: number;
  droneYaw?: number;
  armBase?: number;
  armShoulder?: number;
  armElbow?: number;
  armGrip?: number;
  simTemp?: number;
  obstacleDistance?: number;
  servoAngle?: number;
}

export const Mechatronics3DLabCanvas: React.FC<Mechatronics3DLabCanvasProps> = ({
  project,
  simRunning,
  onToggleSim,
  trafficAIntensity = 3,
  trafficBIntensity = 1,
  isAmbulanceActive = false,
  droneThrottle = 50,
  dronePitch = 0,
  droneRoll = 0,
  droneYaw = 0,
  armBase = 90,
  armShoulder = 90,
  armElbow = 90,
  armGrip = 40,
  simTemp = 29.5,
  obstacleDistance = 45,
  servoAngle = 0,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [explodedFactor, setExplodedFactor] = useState<number>(0);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [isHudCollapsed, setIsHudCollapsed] = useState<boolean>(false);
  const [activeCamPreset, setActiveCamPreset] = useState<'iso' | 'top' | 'front' | 'close'>('iso');

  // Mutable refs for Three.js state
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const mainGroupRef = useRef<THREE.Group | null>(null);
  const animatedObjectsRef = useRef<Record<string, THREE.Object3D>>({});

  // Audio Context Ref for procedural sound synthesis (no external files)
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Determine current project category
  const projectCategory = project?.category || 'arduino';
  const projectTitle = project?.title || '';

  // Play procedural sound for simulation events
  const triggerProceduralSound = (type: 'beep' | 'motor' | 'siren' | 'click') => {
    if (!soundEnabled) return;
    try {
      if (!audioCtxRef.current) {
        const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        audioCtxRef.current = new AudioCtx();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      const now = ctx.currentTime;

      if (type === 'beep') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, now);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
        osc.start(now);
        osc.stop(now + 0.12);
      } else if (type === 'click') {
        osc.type = 'square';
        osc.frequency.setValueAtTime(400, now);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
        osc.start(now);
        osc.stop(now + 0.05);
      } else if (type === 'siren') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(600, now);
        osc.frequency.linearRampToValueAtTime(950, now + 0.25);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
        osc.start(now);
        osc.stop(now + 0.3);
      }
    } catch {
      // Ignore web audio policy errors gracefully
    }
  };

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // Detect software WebGL
    const isSoftwareGl = (() => {
      try {
        const gl = document.createElement('canvas').getContext('webgl2');
        if (!gl) return true;
        const ext = gl.getExtension('WEBGL_debug_renderer_info');
        const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
        const gpu = String(gl.getParameter(param));
        gl.getExtension('WEBGL_lose_context')?.loseContext();
        return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
      } catch {
        return true;
      }
    })();

    // 1. Scene Setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0f1d);
    scene.fog = new THREE.FogExp2(0x0a0f1d, 0.025);
    sceneRef.current = scene;

    // 2. Camera Setup
    const width = container.clientWidth || 800;
    const height = container.clientHeight || 500;
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(12, 10, 14);
    cameraRef.current = camera;

    // 3. Renderer Setup
    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance',
      alpha: false,
    });
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.setSize(width, height);

    // Clear previous canvas if any
    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 4. Studio Environment & Reflections
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    // 5. OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = !isSoftwareGl;
    controls.dampingFactor = 0.08;
    controls.maxPolarAngle = Math.PI / 2 + 0.05; // don't go far under ground plane
    controls.minDistance = 3;
    controls.maxDistance = 45;
    controls.target.set(0, 1.5, 0);
    controlsRef.current = controls;

    // 6. Studio Lighting Rig
    const keyLight = new THREE.DirectionalLight(0xfff5ea, 2.2);
    keyLight.position.set(12, 18, 10);
    if (!isSoftwareGl) {
      keyLight.castShadow = true;
      keyLight.shadow.mapSize.width = 2048;
      keyLight.shadow.mapSize.height = 2048;
      keyLight.shadow.camera.near = 0.5;
      keyLight.shadow.camera.far = 40;
      keyLight.shadow.camera.left = -12;
      keyLight.shadow.camera.right = 12;
      keyLight.shadow.camera.top = 12;
      keyLight.shadow.camera.bottom = -12;
      keyLight.shadow.bias = -0.0005;
      keyLight.shadow.normalBias = 0.02;
    }
    scene.add(keyLight);

    const fillLight = new THREE.HemisphereLight(0x38bdf8, 0x0f172a, 1.2);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0xa855f7, 1.5);
    rimLight.position.set(-14, 10, -12);
    scene.add(rimLight);

    // Grid Floor
    const gridHelper = new THREE.GridHelper(30, 30, 0x3b82f6, 0x1e293b);
    gridHelper.position.y = -0.01;
    scene.add(gridHelper);

    // 7. Build Procedural 3D Subject according to active project
    const mainGroup = new THREE.Group();
    scene.add(mainGroup);
    mainGroupRef.current = mainGroup;
    animatedObjectsRef.current = {};

    buildProceduralProjectModel(mainGroup, projectCategory, projectTitle, animatedObjectsRef.current);

    // 8. Animation Loop
    let frameId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      frameId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const elapsedTime = clock.getElapsedTime();

      // Update interactive animations inside 3D model
      updateInteractiveModelAnimations(
        animatedObjectsRef.current,
        projectCategory,
        projectTitle,
        simRunning,
        elapsedTime,
        delta,
        {
          trafficAIntensity,
          trafficBIntensity,
          isAmbulanceActive,
          droneThrottle,
          dronePitch,
          droneRoll,
          droneYaw,
          armBase,
          armShoulder,
          armElbow,
          armGrip,
          simTemp,
          obstacleDistance,
          servoAngle,
        }
      );

      // Apply Exploded View Displacement
      if (mainGroupRef.current) {
        mainGroupRef.current.children.forEach((child) => {
          if (child.userData.explodedDirection) {
            const dir = child.userData.explodedDirection as THREE.Vector3;
            const dist = (child.userData.explodedDistance || 2.5) * explodedFactor;
            child.position.lerp(
              child.userData.initialPosition.clone().add(dir.clone().multiplyScalar(dist)),
              0.1
            );
          }
        });
      }

      controls.update();
      renderer.render(scene, camera);
    };

    animate();

    // 9. Handle Window Resize
    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [projectCategory, projectTitle]);

  // Handle camera presets
  const handleSetCameraPreset = (preset: 'iso' | 'top' | 'front' | 'close') => {
    setActiveCamPreset(preset);
    triggerProceduralSound('click');
    const cam = cameraRef.current;
    const ctr = controlsRef.current;
    if (!cam || !ctr) return;

    if (preset === 'iso') {
      cam.position.set(12, 10, 14);
      ctr.target.set(0, 1.5, 0);
    } else if (preset === 'top') {
      cam.position.set(0, 22, 0.1);
      ctr.target.set(0, 0, 0);
    } else if (preset === 'front') {
      cam.position.set(0, 4, 16);
      ctr.target.set(0, 2, 0);
    } else if (preset === 'close') {
      cam.position.set(4, 3, 5);
      ctr.target.set(0, 1, 0);
    }
  };

  // Toggle Fullscreen
  const toggleFullscreen = () => {
    if (!mountRef.current) return;
    if (!document.fullscreenElement) {
      mountRef.current.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  return (
    <div className="relative w-full h-[520px] sm:h-[620px] bg-slate-950 rounded-3xl overflow-hidden border border-slate-800 shadow-2xl group">
      {/* 3D WebGL Canvas Container */}
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Top Header Badge */}
      <div className="absolute top-4 right-4 left-4 flex items-center justify-between pointer-events-none">
        <div className="bg-slate-900/80 backdrop-blur-md px-4 py-2 rounded-2xl border border-slate-800 text-white flex items-center gap-3 shadow-lg pointer-events-auto">
          <div className="w-3 h-3 rounded-full bg-cyan-400 animate-pulse" />
          <div>
            <h4 className="text-xs font-black text-cyan-300">مختبر المحاكاة الهندسي ثلاثي الأبعاد (Interactive 3D Engine)</h4>
            <p className="text-[10px] text-slate-400">
              {projectTitle ? `مشروع: ${projectTitle}` : 'لوحة العتاد الميكاترونكس المتكاملة'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 pointer-events-auto">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 backdrop-blur-md border border-slate-800 text-slate-300 hover:text-white cursor-pointer transition"
            title="تفعيل/كتم الصوت الهندسي"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-cyan-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
          </button>
          <button
            onClick={toggleFullscreen}
            className="p-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 backdrop-blur-md border border-slate-800 text-slate-300 hover:text-white cursor-pointer transition"
            title="ملء الشاشة"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4 text-amber-400" /> : <Maximize2 className="w-4 h-4 text-amber-400" />}
          </button>
        </div>
      </div>

      {/* Collapsible Bottom Control Dock (Zero Viewport Occlusion discipline) */}
      <div
        className={`absolute bottom-3 left-1/2 -translate-x-1/2 w-[94%] max-w-4xl transition-all duration-300 z-10 ${
          isHudCollapsed ? 'translate-y-[calc(100%-40px)]' : 'translate-y-0'
        }`}
      >
        {/* Toggle Collapse Bar */}
        <div className="flex justify-center">
          <button
            onClick={() => setIsHudCollapsed(!isHudCollapsed)}
            className="px-4 py-1.5 bg-slate-900/90 backdrop-blur-md border-t border-x border-slate-800 rounded-t-xl text-slate-300 text-[11px] font-bold flex items-center gap-1.5 cursor-pointer hover:text-white shadow-md"
          >
            {isHudCollapsed ? (
              <>
                <ChevronUp className="w-3.5 h-3.5 text-cyan-400" />
                <span>إظهار شريط أدوات 3D</span>
              </>
            ) : (
              <>
                <ChevronDown className="w-3.5 h-3.5 text-cyan-400" />
                <span>إخفاء الأدوات (Cinema Mode)</span>
              </>
            )}
          </button>
        </div>

        {/* Horizontal Dock */}
        <div className="bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-2xl p-3 shadow-2xl space-y-2 text-white">
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
            {/* Play/Pause 3D Sim */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  onToggleSim();
                  triggerProceduralSound('beep');
                }}
                className={`px-4 py-2 rounded-xl font-bold flex items-center gap-2 cursor-pointer transition ${
                  simRunning
                    ? 'bg-amber-600 hover:bg-amber-500 text-slate-950 shadow-lg shadow-amber-600/30'
                    : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/30'
                }`}
              >
                {simRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                <span>{simRunning ? 'إيقاف المحاكاة 3D' : 'تشغيل المحاكاة 3D'}</span>
              </button>

              <button
                onClick={() => handleSetCameraPreset('iso')}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer border border-slate-700"
                title="إعادة ضبط زاوية الكاميرا"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>

            {/* Camera Angle Presets */}
            <div className="flex items-center gap-1.5 bg-slate-950/80 p-1 rounded-xl border border-slate-800 text-[11px]">
              <span className="text-slate-400 px-2 font-bold">المنظور:</span>
              <button
                onClick={() => handleSetCameraPreset('iso')}
                className={`px-2.5 py-1 rounded-lg font-bold cursor-pointer transition ${
                  activeCamPreset === 'iso' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                ثلاثي الأبعاد
              </button>
              <button
                onClick={() => handleSetCameraPreset('top')}
                className={`px-2.5 py-1 rounded-lg font-bold cursor-pointer transition ${
                  activeCamPreset === 'top' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                علوي
              </button>
              <button
                onClick={() => handleSetCameraPreset('front')}
                className={`px-2.5 py-1 rounded-lg font-bold cursor-pointer transition ${
                  activeCamPreset === 'front' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                أمامي
              </button>
              <button
                onClick={() => handleSetCameraPreset('close')}
                className={`px-2.5 py-1 rounded-lg font-bold cursor-pointer transition ${
                  activeCamPreset === 'close' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                تجميعي دقيق
              </button>
            </div>

            {/* Exploded View Slider */}
            <div className="flex items-center gap-2 bg-slate-950/80 px-3 py-1.5 rounded-xl border border-slate-800 min-w-[220px]">
              <Layers className="w-3.5 h-3.5 text-purple-400 shrink-0" />
              <span className="text-[11px] font-bold text-slate-300 shrink-0">تفكيك الطبقات:</span>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={explodedFactor}
                onChange={(e) => {
                  setExplodedFactor(Number(e.target.value));
                  triggerProceduralSound('click');
                }}
                className="w-full h-1.5 bg-slate-700 rounded accent-purple-400 cursor-pointer"
              />
              <span className="text-[10px] font-mono text-purple-300 font-bold shrink-0">{Math.round(explodedFactor * 100)}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// PROCEDURAL 3D MODEL BUILDER (Zero-404, Built with Three.js Groups)
// ============================================================================
function buildProceduralProjectModel(
  group: THREE.Group,
  category: string,
  title: string,
  animatedObjs: Record<string, THREE.Object3D>
) {
  if (category === 'automation' || title.includes('مرور') || title.includes('Traffic')) {
    buildSmartTrafficSystem3D(group, animatedObjs);
  } else if (category === 'drone' || title.includes('درون') || title.includes('Drone')) {
    buildQuadcopterDrone3D(group, animatedObjs);
  } else if (category === 'robotics' && title.includes('ذراع')) {
    buildRoboticArm3D(group, animatedObjs);
  } else if (category === 'control' || title.includes('حرارة') || title.includes('Temp')) {
    buildTempCoolingSystem3D(group, animatedObjs);
  } else if (category === 'robotics' || title.includes('خط') || title.includes('Line')) {
    buildLineFollowerRobot3D(group, animatedObjs);
  } else {
    buildGenericArduinoWorkbench3D(group, animatedObjs);
  }
}

// ----------------------------------------------------------------------------
// 1. SMART TRAFFIC SYSTEM 3D
// ----------------------------------------------------------------------------
function buildSmartTrafficSystem3D(group: THREE.Group, animatedObjs: Record<string, THREE.Object3D>) {
  // Road base plane
  const roadGeo = new THREE.PlaneGeometry(16, 16);
  const roadMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.8 });
  const road = new THREE.Mesh(roadGeo, roadMat);
  road.rotation.x = -Math.PI / 2;
  road.receiveShadow = true;
  group.add(road);

  // Crosswalk markings
  const lineMat = new THREE.MeshBasicMaterial({ color: 0xf8fafc });
  for (let i = -6; i <= 6; i += 1.5) {
    const dashX = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.02, 0.2), lineMat);
    dashX.position.set(i, 0.01, 0);
    group.add(dashX);

    const dashZ = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.02, 0.8), lineMat);
    dashZ.position.set(0, 0.01, i);
    group.add(dashZ);
  }

  // 4 Traffic Light Poles
  const polePositions = [
    { x: 3, z: 3, id: 'poleA' },
    { x: -3, z: -3, id: 'poleB' },
    { x: -3, z: 3, id: 'poleC' },
    { x: 3, z: -3, id: 'poleD' },
  ];

  polePositions.forEach((pos) => {
    const poleGroup = new THREE.Group();
    poleGroup.position.set(pos.x, 0, pos.z);

    // Initial position for exploded view
    poleGroup.userData = {
      initialPosition: new THREE.Vector3(pos.x, 0, pos.z),
      explodedDirection: new THREE.Vector3(Math.sign(pos.x), 0.5, Math.sign(pos.z)).normalize(),
      explodedDistance: 2.0,
    };

    // Pole stem
    const poleGeo = new THREE.CylinderGeometry(0.08, 0.1, 4, 16);
    const poleMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.8, roughness: 0.2 });
    const pole = new THREE.Mesh(poleGeo, poleMat);
    pole.position.y = 2;
    pole.castShadow = true;
    poleGroup.add(pole);

    // Signal housing box
    const boxGeo = new THREE.BoxGeometry(0.5, 1.2, 0.4);
    const boxMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.5 });
    const housing = new THREE.Mesh(boxGeo, boxMat);
    housing.position.set(0, 3.6, 0);
    poleGroup.add(housing);

    // Red, Yellow, Green LED spheres
    const redMat = new THREE.MeshStandardMaterial({ color: 0x991b1b, emissive: 0xef4444, emissiveIntensity: 0.2 });
    const yelMat = new THREE.MeshStandardMaterial({ color: 0x854d0e, emissive: 0xeab308, emissiveIntensity: 0.2 });
    const grnMat = new THREE.MeshStandardMaterial({ color: 0x065f46, emissive: 0x10b981, emissiveIntensity: 0.2 });

    const redLed = new THREE.Mesh(new THREE.SphereGeometry(0.12, 16, 16), redMat);
    redLed.position.set(0, 4.0, 0.21);
    poleGroup.add(redLed);

    const yelLed = new THREE.Mesh(new THREE.SphereGeometry(0.12, 16, 16), yelMat);
    yelLed.position.set(0, 3.6, 0.21);
    poleGroup.add(yelLed);

    const grnLed = new THREE.Mesh(new THREE.SphereGeometry(0.12, 16, 16), grnMat);
    grnLed.position.set(0, 3.2, 0.21);
    poleGroup.add(grnLed);

    group.add(poleGroup);

    animatedObjs[`${pos.id}_red`] = redLed;
    animatedObjs[`${pos.id}_yel`] = yelLed;
    animatedObjs[`${pos.id}_grn`] = grnLed;
  });

  // 3D Car Model A
  const carAGroup = new THREE.Group();
  const carBodyMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, metalness: 0.6, roughness: 0.3 });
  const carBody = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.6, 0.9), carBodyMat);
  carBody.position.y = 0.4;
  carBody.castShadow = true;
  carAGroup.add(carBody);

  const cabinMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.1 });
  const cabin = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.45, 0.8), cabinMat);
  cabin.position.set(-0.1, 0.85, 0);
  carAGroup.add(cabin);

  carAGroup.position.set(-6, 0, 1.2);
  group.add(carAGroup);
  animatedObjs['carA'] = carAGroup;

  // 3D Ambulance Vehicle (Emergency)
  const ambGroup = new THREE.Group();
  const ambBodyMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.2 });
  const ambBody = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.9, 1.0), ambBodyMat);
  ambBody.position.y = 0.55;
  ambBody.castShadow = true;
  ambGroup.add(ambBody);

  // Red Cross Stripe
  const stripeMat = new THREE.MeshBasicMaterial({ color: 0xdc2626 });
  const stripe = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.4, 1.02), stripeMat);
  stripe.position.set(0, 0.6, 0);
  ambGroup.add(stripe);

  // Strobe Siren Light
  const sirenMat = new THREE.MeshStandardMaterial({ color: 0xdc2626, emissive: 0xef4444, emissiveIntensity: 0 });
  const siren = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.2), sirenMat);
  siren.position.set(0, 1.1, 0);
  ambGroup.add(siren);

  ambGroup.position.set(6, 0, -1.2);
  group.add(ambGroup);
  animatedObjs['ambulance'] = ambGroup;
  animatedObjs['siren'] = siren;
}

// ----------------------------------------------------------------------------
// 2. QUADCOPTER DRONE 3D
// ----------------------------------------------------------------------------
function buildQuadcopterDrone3D(group: THREE.Group, animatedObjs: Record<string, THREE.Object3D>) {
  const droneGroup = new THREE.Group();
  droneGroup.position.set(0, 2.5, 0);

  droneGroup.userData = {
    initialPosition: new THREE.Vector3(0, 2.5, 0),
    explodedDirection: new THREE.Vector3(0, 1, 0),
    explodedDistance: 2.0,
  };

  // Central carbon frame plate
  const frameMat = new THREE.MeshStandardMaterial({ color: 0x1e1b4b, metalness: 0.9, roughness: 0.2 });
  const centerBody = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 0.8, 0.2, 8), frameMat);
  centerBody.castShadow = true;
  droneGroup.add(centerBody);

  // Flight Controller PCB Plate
  const pcbMat = new THREE.MeshStandardMaterial({ color: 0x047857, roughness: 0.4 });
  const fcPcb = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.08, 0.7), pcbMat);
  fcPcb.position.y = 0.15;
  droneGroup.add(fcPcb);

  // 4 Arms & Motor Pods
  const armMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.8, roughness: 0.3 });
  const armAngles = [Math.PI / 4, (3 * Math.PI) / 4, (5 * Math.PI) / 4, (7 * Math.PI) / 4];

  armAngles.forEach((ang, idx) => {
    const armGroup = new THREE.Group();
    armGroup.rotation.y = ang;

    // Carbon Arm Tube
    const armTube = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 2.4), armMat);
    armTube.rotation.z = Math.PI / 2;
    armTube.position.x = 1.2;
    armTube.castShadow = true;
    armGroup.add(armTube);

    // BLDC Motor Pod
    const motorMat = new THREE.MeshStandardMaterial({ color: 0xd97706, metalness: 0.9, roughness: 0.1 });
    const motor = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.25, 16), motorMat);
    motor.position.set(2.3, 0.1, 0);
    motor.castShadow = true;
    armGroup.add(motor);

    // Propeller Blades
    const propGroup = new THREE.Group();
    propGroup.position.set(2.3, 0.28, 0);

    const propMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, transparent: true, opacity: 0.85 });
    const blade1 = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.02, 0.15), propMat);
    propGroup.add(blade1);

    armGroup.add(propGroup);
    droneGroup.add(armGroup);

    animatedObjs[`propeller_${idx}`] = propGroup;
  });

  // Glowing Navigation Lights
  const navLightMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
  const navLight = new THREE.Mesh(new THREE.SphereGeometry(0.08, 12, 12), navLightMat);
  navLight.position.set(0, 0.25, 0.4);
  droneGroup.add(navLight);

  group.add(droneGroup);
  animatedObjs['droneGroup'] = droneGroup;
}

// ----------------------------------------------------------------------------
// 3. INDUSTRIAL 4-DOF ROBOTIC ARM 3D
// ----------------------------------------------------------------------------
function buildRoboticArm3D(group: THREE.Group, animatedObjs: Record<string, THREE.Object3D>) {
  const armRoot = new THREE.Group();

  // Heavy Industrial Base
  const baseMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.8, roughness: 0.3 });
  const baseMesh = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.4, 0.4, 32), baseMat);
  baseMesh.position.y = 0.2;
  baseMesh.receiveShadow = true;
  armRoot.add(baseMesh);

  // Base Turntable (Yaw rotation)
  const turntableGroup = new THREE.Group();
  turntableGroup.position.y = 0.4;
  armRoot.add(turntableGroup);
  animatedObjs['armBaseTurntable'] = turntableGroup;

  const servoBaseMat = new THREE.MeshStandardMaterial({ color: 0x2563eb, metalness: 0.6, roughness: 0.2 });
  const turntableMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 0.8, 0.3, 24), servoBaseMat);
  turntableMesh.position.y = 0.15;
  turntableGroup.add(turntableMesh);

  // Shoulder Link Joint
  const shoulderJointGroup = new THREE.Group();
  shoulderJointGroup.position.set(0, 0.3, 0);
  turntableGroup.add(shoulderJointGroup);
  animatedObjs['armShoulderJoint'] = shoulderJointGroup;

  const armLinkMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.8, roughness: 0.2 });
  const lowerArm = new THREE.Mesh(new THREE.BoxGeometry(0.3, 2.2, 0.3), armLinkMat);
  lowerArm.position.y = 1.1;
  lowerArm.castShadow = true;
  shoulderJointGroup.add(lowerArm);

  // Elbow Link Joint
  const elbowJointGroup = new THREE.Group();
  elbowJointGroup.position.set(0, 2.2, 0);
  shoulderJointGroup.add(elbowJointGroup);
  animatedObjs['armElbowJoint'] = elbowJointGroup;

  const upperArm = new THREE.Mesh(new THREE.BoxGeometry(0.25, 1.8, 0.25), armLinkMat);
  upperArm.position.y = 0.9;
  upperArm.castShadow = true;
  elbowJointGroup.add(upperArm);

  // Gripper Assembly (Claw)
  const gripperGroup = new THREE.Group();
  gripperGroup.position.set(0, 1.8, 0);
  elbowJointGroup.add(gripperGroup);

  const clawMat = new THREE.MeshStandardMaterial({ color: 0xd97706, metalness: 0.9, roughness: 0.1 });
  const clawLeft = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.4, 0.15), clawMat);
  clawLeft.position.set(-0.15, 0.2, 0);
  gripperGroup.add(clawLeft);
  animatedObjs['clawLeft'] = clawLeft;

  const clawRight = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.4, 0.15), clawMat);
  clawRight.position.set(0.15, 0.2, 0);
  gripperGroup.add(clawRight);
  animatedObjs['clawRight'] = clawRight;

  // Target Object Cube to Pick & Place
  const cubeMat = new THREE.MeshStandardMaterial({ color: 0x10b981, emissive: 0x059669, emissiveIntensity: 0.3 });
  const targetCube = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.35, 0.35), cubeMat);
  targetCube.position.set(0, 0.2, 0);
  gripperGroup.add(targetCube);

  group.add(armRoot);
}

// ----------------------------------------------------------------------------
// 4. SMART TEMPERATURE & COOLING SYSTEM 3D
// ----------------------------------------------------------------------------
function buildTempCoolingSystem3D(group: THREE.Group, animatedObjs: Record<string, THREE.Object3D>) {
  const sysGroup = new THREE.Group();
  sysGroup.position.set(0, 1.2, 0);

  // Aluminum Heatsink Base
  const sinkMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.95, roughness: 0.1 });
  const sinkBase = new THREE.Mesh(new THREE.BoxGeometry(3.0, 0.4, 3.0), sinkMat);
  sinkBase.castShadow = true;
  sysGroup.add(sinkBase);

  // Heatsink Fins
  for (let x = -1.2; x <= 1.2; x += 0.3) {
    const fin = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.8, 2.8), sinkMat);
    fin.position.set(x, 0.6, 0);
    sysGroup.add(fin);
  }

  // DC Fan Housing & Spinning Blades
  const fanHousingMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.4 });
  const fanHousing = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.4, 2.4), fanHousingMat);
  fanHousing.position.y = 1.2;
  sysGroup.add(fanHousing);

  const fanBladeGroup = new THREE.Group();
  fanBladeGroup.position.y = 1.2;
  const bladeMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.2 });

  for (let b = 0; b < 7; b++) {
    const blade = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.02, 0.2), bladeMat);
    blade.rotation.y = (b * Math.PI * 2) / 7;
    blade.position.x = 0.4 * Math.cos((b * Math.PI * 2) / 7);
    blade.position.z = 0.4 * Math.sin((b * Math.PI * 2) / 7);
    fanBladeGroup.add(blade);
  }
  sysGroup.add(fanBladeGroup);
  animatedObjs['tempFanBlades'] = fanBladeGroup;

  // DHT22 Sensor Module (Blue)
  const dhtMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, roughness: 0.3 });
  const dhtSensor = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.8, 0.4), dhtMat);
  dhtSensor.position.set(2.2, 0.4, 1.0);
  dhtSensor.castShadow = true;
  sysGroup.add(dhtSensor);

  // LCD 16x2 Display Panel with Emissive Backlight
  const lcdFrameMat = new THREE.MeshStandardMaterial({ color: 0x047857, roughness: 0.3 });
  const lcdFrame = new THREE.Mesh(new THREE.BoxGeometry(2.2, 1.1, 0.2), lcdFrameMat);
  lcdFrame.position.set(-2.2, 0.6, 1.0);
  sysGroup.add(lcdFrame);

  const lcdScreenMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, emissive: 0x0284c7, emissiveIntensity: 0.8 });
  const lcdScreen = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.7, 0.05), lcdScreenMat);
  lcdScreen.position.set(-2.2, 0.6, 1.11);
  sysGroup.add(lcdScreen);

  group.add(sysGroup);
}

// ----------------------------------------------------------------------------
// 5. SMART LINE FOLLOWER ROBOT 3D
// ----------------------------------------------------------------------------
function buildLineFollowerRobot3D(group: THREE.Group, animatedObjs: Record<string, THREE.Object3D>) {
  // Floor Track
  const trackGeo = new THREE.PlaneGeometry(14, 14);
  const trackMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.9 });
  const floorTrack = new THREE.Mesh(trackGeo, trackMat);
  floorTrack.rotation.x = -Math.PI / 2;
  group.add(floorTrack);

  // Black Electrical Tape Track Line
  const lineGeo = new THREE.RingGeometry(3.5, 4.0, 64);
  const lineMat = new THREE.MeshBasicMaterial({ color: 0x0f172a, side: THREE.DoubleSide });
  const trackLine = new THREE.Mesh(lineGeo, lineMat);
  trackLine.rotation.x = -Math.PI / 2;
  trackLine.position.y = 0.01;
  group.add(trackLine);

  // Robot Chassis Group
  const botGroup = new THREE.Group();
  botGroup.position.set(3.75, 0.3, 0);

  const chassisMat = new THREE.MeshStandardMaterial({ color: 0x7c3aed, transparent: true, opacity: 0.8, roughness: 0.2 });
  const chassis = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.2, 0.1, 24), chassisMat);
  chassis.castShadow = true;
  botGroup.add(chassis);

  // 2 Rubber Drive Wheels
  const wheelMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.9 });
  const wheelL = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 0.15, 16), wheelMat);
  wheelL.rotation.z = Math.PI / 2;
  wheelL.position.set(-0.9, 0, 0);
  botGroup.add(wheelL);

  const wheelR = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 0.15, 16), wheelMat);
  wheelR.rotation.z = Math.PI / 2;
  wheelR.position.set(0.9, 0, 0);
  botGroup.add(wheelR);

  // IR Line Sensor Array Front Module
  const irMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.4 });
  const irBoard = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.08, 0.3), irMat);
  irBoard.position.set(0, -0.1, 1.1);
  botGroup.add(irBoard);

  group.add(botGroup);
  animatedObjs['lineFollowerBot'] = botGroup;
}

// ----------------------------------------------------------------------------
// 6. GENERIC ARDUINO WORKBENCH 3D
// ----------------------------------------------------------------------------
function buildGenericArduinoWorkbench3D(group: THREE.Group, animatedObjs: Record<string, THREE.Object3D>) {
  const boardGroup = new THREE.Group();
  boardGroup.position.set(0, 0.5, 0);

  // Arduino UNO Blue PCB
  const pcbMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.3, metalness: 0.1 });
  const pcb = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.12, 2.6), pcbMat);
  pcb.castShadow = true;
  boardGroup.add(pcb);

  // ATmega328P DIP IC Chip
  const icMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.6 });
  const icChip = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.15, 0.4), icMat);
  icChip.position.set(0.2, 0.12, 0.3);
  boardGroup.add(icChip);

  // USB-B Port Silver Metallic
  const usbMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.95, roughness: 0.1 });
  const usbPort = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.5, 0.7), usbMat);
  usbPort.position.set(-1.4, 0.3, -0.8);
  boardGroup.add(usbPort);

  // Breadboard White plastic
  const breadMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.7 });
  const breadboard = new THREE.Mesh(new THREE.BoxGeometry(4.2, 0.2, 2.8), breadMat);
  breadboard.position.set(0, 0, 3.2);
  breadboard.castShadow = true;
  boardGroup.add(breadboard);

  // Ultrasonic Sensor HC-SR04 Eyes
  const ultraGroup = new THREE.Group();
  ultraGroup.position.set(-1.2, 0.4, 3.2);

  const ultraPcbMat = new THREE.MeshStandardMaterial({ color: 0x2563eb, roughness: 0.3 });
  const ultraPcb = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.6, 0.08), ultraPcbMat);
  ultraGroup.add(ultraPcb);

  const eyeMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.9, roughness: 0.1 });
  const eye1 = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.3, 16), eyeMat);
  eye1.rotation.x = Math.PI / 2;
  eye1.position.set(-0.3, 0, 0.15);
  ultraGroup.add(eye1);

  const eye2 = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.3, 16), eyeMat);
  eye2.rotation.x = Math.PI / 2;
  eye2.position.set(0.3, 0, 0.15);
  ultraGroup.add(eye2);

  boardGroup.add(ultraGroup);

  // Blinking LED indicator
  const ledMat = new THREE.MeshStandardMaterial({ color: 0x16a34a, emissive: 0x22c55e, emissiveIntensity: 0.8 });
  const led = new THREE.Mesh(new THREE.SphereGeometry(0.12, 12, 12), ledMat);
  led.position.set(1.2, 0.25, 3.2);
  boardGroup.add(led);
  animatedObjs['workbenchLed'] = led;

  group.add(boardGroup);
}

// ============================================================================
// REAL-TIME PHYSICAL ANIMATION UPDATE LOOP
// ============================================================================
function updateInteractiveModelAnimations(
  objs: Record<string, THREE.Object3D>,
  category: string,
  title: string,
  simRunning: boolean,
  elapsed: number,
  delta: number,
  ctrls: {
    trafficAIntensity: number;
    trafficBIntensity: number;
    isAmbulanceActive: boolean;
    droneThrottle: number;
    dronePitch: number;
    droneRoll: number;
    droneYaw: number;
    armBase: number;
    armShoulder: number;
    armElbow: number;
    armGrip: number;
    simTemp: number;
    obstacleDistance: number;
    servoAngle: number;
  }
) {
  if (!simRunning) return;

  // 1. Traffic System Lights & Cars
  if (category === 'automation' || title.includes('مرور') || title.includes('Traffic')) {
    const cycle = Math.floor(elapsed % 6);
    const isAmbulance = ctrls.isAmbulanceActive;

    ['poleA', 'poleB', 'poleC', 'poleD'].forEach((pId) => {
      const r = objs[`${pId}_red`] as THREE.Mesh;
      const y = objs[`${pId}_yel`] as THREE.Mesh;
      const g = objs[`${pId}_grn`] as THREE.Mesh;

      if (r && y && g) {
        if (isAmbulance) {
          (r.material as THREE.MeshStandardMaterial).emissiveIntensity = 0.1;
          (y.material as THREE.MeshStandardMaterial).emissiveIntensity = 0.1;
          (g.material as THREE.MeshStandardMaterial).emissiveIntensity = pId === 'poleA' ? 1.5 : 0.1;
        } else {
          (r.material as THREE.MeshStandardMaterial).emissiveIntensity = cycle < 3 ? 1.5 : 0.1;
          (y.material as THREE.MeshStandardMaterial).emissiveIntensity = cycle === 3 ? 1.5 : 0.1;
          (g.material as THREE.MeshStandardMaterial).emissiveIntensity = cycle > 3 ? 1.5 : 0.1;
        }
      }
    });

    const carA = objs['carA'];
    if (carA) {
      carA.position.x = -6 + ((elapsed * (ctrls.trafficAIntensity * 0.8)) % 12);
    }

    const amb = objs['ambulance'];
    const siren = objs['siren'] as THREE.Mesh;
    if (amb) {
      amb.position.x = 6 - ((elapsed * 2.5) % 12);
    }
    if (siren) {
      (siren.material as THREE.MeshStandardMaterial).emissiveIntensity = isAmbulance && Math.floor(elapsed * 8) % 2 === 0 ? 2.0 : 0;
    }
  }

  // 2. Drone Flight PID Dynamics
  if (category === 'drone' || title.includes('درون') || title.includes('Drone')) {
    const drone = objs['droneGroup'];
    if (drone) {
      const targetY = 1.0 + (ctrls.droneThrottle / 100) * 3.5;
      drone.position.y = THREE.MathUtils.lerp(drone.position.y, targetY, 0.08);

      const targetPitch = (ctrls.dronePitch * Math.PI) / 180;
      const targetRoll = (ctrls.droneRoll * Math.PI) / 180;
      const targetYaw = (ctrls.droneYaw * Math.PI) / 180;

      drone.rotation.x = THREE.MathUtils.lerp(drone.rotation.x, targetPitch, 0.08);
      drone.rotation.z = THREE.MathUtils.lerp(drone.rotation.z, targetRoll, 0.08);
      drone.rotation.y = THREE.MathUtils.lerp(drone.rotation.y, targetYaw, 0.08);
    }

    for (let i = 0; i < 4; i++) {
      const prop = objs[`propeller_${i}`];
      if (prop) {
        prop.rotation.y += (ctrls.droneThrottle / 100) * 0.8 + 0.1;
      }
    }
  }

  // 3. Robotic Arm Servo Angles
  if (category === 'robotics' && title.includes('ذراع')) {
    const base = objs['armBaseTurntable'];
    if (base) {
      base.rotation.y = THREE.MathUtils.lerp(base.rotation.y, ((ctrls.armBase - 90) * Math.PI) / 180, 0.1);
    }

    const shoulder = objs['armShoulderJoint'];
    if (shoulder) {
      shoulder.rotation.z = THREE.MathUtils.lerp(shoulder.rotation.z, ((ctrls.armShoulder - 90) * Math.PI) / 180, 0.1);
    }

    const elbow = objs['armElbowJoint'];
    if (elbow) {
      elbow.rotation.z = THREE.MathUtils.lerp(elbow.rotation.z, ((ctrls.armElbow - 90) * Math.PI) / 180, 0.1);
    }

    const cL = objs['clawLeft'];
    const cR = objs['clawRight'];
    if (cL && cR) {
      const gripOffset = (ctrls.armGrip / 100) * 0.12;
      cL.position.x = THREE.MathUtils.lerp(cL.position.x, -0.05 - gripOffset, 0.1);
      cR.position.x = THREE.MathUtils.lerp(cR.position.x, 0.05 + gripOffset, 0.1);
    }
  }

  // 4. Temperature Cooling Fan
  if (category === 'control' || title.includes('حرارة') || title.includes('Temp')) {
    const fan = objs['tempFanBlades'];
    if (fan) {
      const speed = ctrls.simTemp < 26 ? 0 : (ctrls.simTemp - 26) * 0.4;
      fan.rotation.y += speed;
    }
  }

  // 5. Line Follower Robot Movement along curve
  if (category === 'robotics' || title.includes('خط') || title.includes('Line')) {
    const bot = objs['lineFollowerBot'];
    if (bot) {
      const radius = 3.75;
      const speed = 0.5;
      const angle = elapsed * speed;
      bot.position.x = Math.cos(angle) * radius;
      bot.position.z = Math.sin(angle) * radius;
      bot.rotation.y = -angle + Math.PI / 2;
    }
  }

  // 6. Generic Workbench LED
  const led = objs['workbenchLed'] as THREE.Mesh;
  if (led) {
    (led.material as THREE.MeshStandardMaterial).emissiveIntensity = Math.floor(elapsed * 4) % 2 === 0 ? 1.2 : 0.1;
  }
}

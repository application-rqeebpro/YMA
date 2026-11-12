import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import {
  Wrench,
  Zap,
  Activity,
  Sliders,
  Info,
  Maximize2,
  Minimize2,
  RotateCcw,
  Volume2,
  VolumeX,
  X,
  CheckCircle2,
  ChevronRight,
  BookOpen,
  Cpu,
  Radio,
  Compass,
  Sparkles,
} from 'lucide-react';

export interface MechatronicsToolDetail {
  id: string;
  nameAr: string;
  nameEn: string;
  category: string;
  icon: string;
  color: string;
  description: string;
  features: string[];
  specs: { label: string; value: string }[];
  howToUse: string[];
  safetyTips: string[];
}

export const fontKey = 'ar';

export const MECHATRONICS_TOOLS_DATA: Record<string, MechatronicsToolDetail> = {
  oscilloscope: {
    id: 'oscilloscope',
    nameAr: 'راسم الذبذبات الرقمي (Digital Oscilloscope)',
    nameEn: 'Digital Storage Oscilloscope (DSO 100MHz)',
    category: 'أجهزة الاختبار والتحليل الزمني',
    icon: 'Activity',
    color: 'text-cyan-400',
    description: 'جهاز راسم الإشارات الرقمي يُستخدم لمعاينة وتحليل تغير الجهد الكهربائي عبر الزمن، وهو الأداة رقم #1 لفحص إشارات PWM، نبضات الحساسات، والاتصال التسلسلي (UART, SPI, I2C).',
    features: [
      'عرض موجات الجهد الكهربائي متغيرة الزمن بدقة عالية.',
      'قياس التردد (Frequency)، السعة (Amplitude)، وعرض النبضة (Duty Cycle).',
      'فحص التشويش (Noise) وتذبذبات الطاقة في الدوائر الميكاترونية.',
      'التقاط الإشارات العابرة (Transients) باستخدام نظام القادح (Trigger).',
    ],
    specs: [
      { label: 'عرض النطاق (Bandwidth)', value: '100 MHz' },
      { label: 'معدل العينات (Sampling Rate)', value: '1 GSa/s' },
      { label: 'عدد القنوات (Channels)', value: '2 قنوات + External Trigger' },
      { label: 'دقة الشاشة', value: '7" TFT Color LCD (800x480)' },
    ],
    howToUse: [
      'قم بتوصيل المشبك الأرضي (Ground Crocodile Clip) بالأرضي (GND) للدائرة.',
      'وصل رأس المسبار (Probe Tip) بالمنفذ المراد فحص إشارته (مثل Pin D9 PWM).',
      'اضغط على زر AUTOSET لضبط النطاق والتكبير آلياً.',
      'استخدم مقابض VOLTS/DIV و SEC/DIV للتكبير الدقيق لقياس السعة والتردد.',
    ],
    safetyTips: [
      'تأكد دائماً من ضبط مفتاح المسبار على وضعية 10X لتجنب زيادة الجهد على المدخل.',
      'لا تقم بتوصيل المشبك الأرضي بمستويات جهد مرتفعة تجنباً لإحداث شورت كهربائي.',
    ],
  },
  powersupply: {
    id: 'powersupply',
    nameAr: 'مصدر الطاقة المعملي المنظم (DC Bench Power Supply)',
    nameEn: 'Triple Output DC Bench Power Supply (0-30V / 5A)',
    category: 'أجهزة التغذية الكهربائية',
    icon: 'Zap',
    color: 'text-amber-400',
    description: 'مصدر جهد تيار مستمر DC قابل للتعديل بدقة متناهية، يوفر تغذية مستقرة ومحميّة للمحركات، المتحكمات، ودواسات المرحلات في مختبرات الميكاترونكس.',
    features: [
      'توفير جهود مستمرة قابلة للتعديل من 0V إلى 30V وتيار حتى 5A.',
      'وضعيات حماية التيار المحدد (Current Limiting CC Mode) لمنع احتراق المكونات.',
      'شاشات رقمية مزدوجة لعرض الجهد والتيار المستهلك في الوقت الفعلي.',
      'مخارج مستقلة 5V ثابثة لتغذية الأردوينو وشريحة ESP32.',
    ],
    specs: [
      { label: 'نطاق الجهد (Voltage)', value: '0 - 30V DC Continuous' },
      { label: 'نطاق التيار (Current)', value: '0 - 5A Maximum' },
      { label: 'دقة التنظيم (Regulation)', value: '< 0.01% + 3mV' },
      { label: 'أنظمة الحماية', value: 'OVP, OCP, OTP (Over Voltage/Current/Temp)' },
    ],
    howToUse: [
      'اضبط مقبض الجهد Voltage على الجهد المطلوب (مثلاً 5.0V أو 12.0V) قبل التوصيل.',
      'حدد الحد الأقصى للتيار المسموح به (Current Limit) لحماية الدائرة.',
      'وصل الطرف الأحمر (+) بـ VCC والطرف الأسود (-) بـ GND في لوحة التجارب.',
      'قم بتفعيل زر OUTPUT وسجل قراءة التيار المستهلك.',
    ],
    safetyTips: [
      'تأكد من قطبية التوصيل (Polarity) قبل تشغيل الزر تجنباً لإتلاف الشرائح.',
      'عند تغذية محركات حثية، استخدم ديود حماية (Flyback Diode) لمنع الجهد العكسي.',
    ],
  },
  multimeter: {
    id: 'multimeter',
    nameAr: 'الملتيميتر الرقمي الشامل (Digital Multimeter)',
    nameEn: 'True-RMS Digital Multimeter',
    category: 'أجهزة القياس الكهربائي',
    icon: 'Radio',
    color: 'text-emerald-400',
    description: 'الأداة الأساسية والأكثر استخداماً لفحص الفولتية، القطبية، المقاومة، واستمرارية التوصيل (Continuity Test) وكشف القطوع في السلوك.',
    features: [
      'قياس الجهد المستمر والمتردد (VDC / VAC).',
      'قياس التيار المستمر والمتردد (ADC / AAC).',
      'فحص المقاومات والدايودات واختبار التوصيل الصوتي (Buzzer Beep).',
      'قياس السعة للمكثفات والتردد.',
    ],
    specs: [
      { label: 'نطاق الجهد المستمر', value: '0.1mV - 1000V DC' },
      { label: 'نطاق التيار', value: '0.1µA - 10A' },
      { label: 'قياس المقاومة', value: '0.1Ω - 50MΩ' },
      { label: 'نوع القياس', value: 'True-RMS High Precision' },
    ],
    howToUse: [
      'ضع المسبار الأسود في منفذ COM والمسبار الأحمر في منفذ V/Ω.',
      'أدر القرص الدوار إلى الخيار المطلوب (V= للجهد، Ω للمقاومة، أو أيقونة الصوت للتوصيلية).',
      'عند قياس الجهد: وصل المسبارين على التوازي مع العنصر المراد قياسه.',
      'عند قياس التيار: افتح الدائرة ووصل المسبارين على التوالي مع التيار.',
    ],
    safetyTips: [
      'لا تقم مطلقاً بتمريج قياس التيار على التوازي مع مصدر الطاقة تجنباً لضرب الصمام الذاتي (Fuse).',
    ],
  },
  breadboard: {
    id: 'breadboard',
    nameAr: 'لوحة التجارب بدون لحام (Solderless Breadboard)',
    nameEn: 'Standard Mechatronics Breadboard & Jumper Station',
    category: 'بيئة التجميع والربط',
    icon: 'Wrench',
    color: 'text-blue-400',
    description: 'منصة ميكانيكية وكهربائية مرنة لبناء واختبار الدوائر الإلكترونية والميكاترونية بسرعة وسهولة بدون الحاجة لعمليات اللحام.',
    features: [
      '830 نقطة توصيل مصفوفة عرقياً وعمودياً.',
      'مسارات تغذية جانبية مخصصة للـ 5V و GND.',
      'فجوة مركزية مخصصة لتثبيت الدوائر المتكاملة Dual In-Line Package (DIP ICs).',
      'إمكانية ربط أكثر من لوحة لتشكيل منصات تجميع ضخمة.',
    ],
    specs: [
      { label: 'عدد نقاط التوصيل', value: '830 Tie Points' },
      { label: 'الجهد الأقصى', value: '36V DC' },
      { label: 'التيار الأقصى', value: '2A Max per rail' },
      { label: 'المادة', value: 'ABS Plastic with Nickel-Bronze Spring Clips' },
    ],
    howToUse: [
      'ثبّت متحكم الأردوينو أو الشريحة في منتصف اللوحة فوق الفجوة الفاصلة.',
      'وصل مسارات التغذية الجانبية (+) و (-) بمصدر الطاقة 5V و GND.',
      'استخدم أسلاك التوصيل (Jumper Wires) للربط بين الحساسات والمنافذ.',
    ],
    safetyTips: [
      'احرص على ألا تلمس الأطراف المكشوفة للمكونات بعضها لتفادي حدوث ماس كهربائي (Short Circuit).',
    ],
  },
  functiongen: {
    id: 'functiongen',
    nameAr: 'مولد الإشارات والترددات (Function Signal Generator)',
    nameEn: 'Arbitrary Waveform Function Generator 20MHz',
    category: 'أجهزة التوليد والمحاكاة',
    icon: 'Compass',
    color: 'text-purple-400',
    description: 'جهاز يعطي إشارات كهربائية دورية بموجات جيبية (Sine)، مربعة (Square)، ومثلثة (Triangle) لاختبار استجابة الفلاتر والمحركات والمكبرات.',
    features: [
      'توليد موجات متنوعة: Sine, Square, Ramp, Pulse, Noise.',
      'التحكم الدقيق بالتردد والسعة والإنزياح (DC Offset).',
      'اختبار محركات السيرفو ومحاكاة إشارات الحساسات الصوتية والرادارية.',
    ],
    specs: [
      { label: 'أقصى تردد (Frequency)', value: '20 MHz' },
      { label: 'سعة الموجة (Amplitude)', value: '1mVpp - 10Vpp' },
      { label: 'شكل الموجة', value: 'Arbitrary Digital Synthesizer (DDS)' },
    ],
    howToUse: [
      'اختر شكل الموجة المطلوب (مثلاً Square Wave لاختبار إشارة PWM).',
      'اضبط التردد المطلوب (مثلاً 1kHz) والسعة (مثلاً 5Vpp).',
      'وصل المخرج BNC بالمدخل المطلوب في الدائرة المراد اختبارها.',
    ],
    safetyTips: [
      'تأكد من عدم تجاوز سعة الإشارة المولدة لجهد التحمل الأقصى للمتحكم (5V Max).',
    ],
  },
  caliper: {
    id: 'caliper',
    nameAr: 'القدمة ذات الورنية الرقمية (Digital Vernier Caliper)',
    nameEn: 'Precision Digital Vernier Caliper (0-150mm)',
    category: 'أدوات القياس الميكانيكي',
    icon: 'Cpu',
    color: 'text-indigo-400',
    description: 'أداة قياس ميكانيكية دقيقة تُستخدم لقياس الأبعاد الخارجية، القطار الداخلية للمحركات والتروس، وعمق ثقوب التثبيت بدقة 0.01 مم.',
    features: [
      'قياس الأقطار الخارجية، الأقطار الداخلية، والأعماق.',
      'شاشة عرض LCD رقمية بالمليمتر والبوصة.',
      'مصنوعة من الفولاذ المقاوم للصدأ (Stainless Steel).',
      'زر الصفر المرجعي (Zero Set) عند أي نقطة للقياس التفاضلي.',
    ],
    specs: [
      { label: 'مدى القياس', value: '0 - 150 mm (0 - 6 inch)' },
      { label: 'الدقة (Resolution)', value: '0.01 mm / 0.0005 inch' },
      { label: 'نسبة الخطأ', value: '±0.02 mm' },
    ],
    howToUse: [
      'نظف فكي القياس واغلقهما ثم اضغط على زر ZERO لصفرة الشاشة.',
      'افتح الفكين وضع القطعة (مثل محور المحرك أو الترس) ثم اغلق الفكين برفق.',
      'اقرأ القيمة المباشرة على الشاشة الرقمية.',
    ],
    safetyTips: [
      'لا تستخدم الفكين الحادين كأداة حفر أو خدش لحماية الدقة المتناهية.',
    ],
  },
};

interface Mechatronics3DToolsBenchProps {
  onSelectTool?: (tool: MechatronicsToolDetail) => void;
}

export const Mechatronics3DToolsBench: React.FC<Mechatronics3DToolsBenchProps> = ({ onSelectTool }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [selectedTool, setSelectedTool] = useState<MechatronicsToolDetail | null>(MECHATRONICS_TOOLS_DATA.oscilloscope);
  const [hoveredToolName, setHoveredToolName] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const toolMeshesRef = useRef<Record<string, THREE.Object3D>>({});
  const raycasterRef = useRef<THREE.Raycaster>(new THREE.Raycaster());
  const mouseRef = useRef<THREE.Vector2>(new THREE.Vector2());

  // Web Audio synth for clicks
  const playClickSound = (freq = 600) => {
    if (!soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.08);
    } catch {
      // ignore web audio
    }
  };

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

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

    // 1. Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0f1d);
    scene.fog = new THREE.FogExp2(0x0a0f1d, 0.03);
    sceneRef.current = scene;

    // 2. Camera
    const w = container.clientWidth || 800;
    const h = container.clientHeight || 500;
    const camera = new THREE.PerspectiveCamera(40, w / h, 0.1, 100);
    camera.position.set(0, 7, 13);
    cameraRef.current = camera;

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance',
    });
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.setSize(w, h);

    while (container.firstChild) container.removeChild(container.firstChild);
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 4. Studio Environment
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    // 5. OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = !isSoftwareGl;
    controls.dampingFactor = 0.08;
    controls.maxPolarAngle = Math.PI / 2 - 0.02;
    controls.minDistance = 4;
    controls.maxDistance = 25;
    controls.target.set(0, 1.2, 0);
    controlsRef.current = controls;

    // 6. Lighting
    const keyLight = new THREE.DirectionalLight(0xfff7ed, 2.5);
    keyLight.position.set(8, 14, 10);
    if (!isSoftwareGl) {
      keyLight.castShadow = true;
      keyLight.shadow.mapSize.width = 2048;
      keyLight.shadow.mapSize.height = 2048;
      keyLight.shadow.bias = -0.0005;
    }
    scene.add(keyLight);

    const fillLight = new THREE.HemisphereLight(0x38bdf8, 0x0f172a, 1.2);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0xa855f7, 1.4);
    rimLight.position.set(-10, 8, -8);
    scene.add(rimLight);

    // Workbench Table Top (Metallic Industrial Mat)
    const tableGeo = new THREE.BoxGeometry(16, 0.4, 8);
    const tableMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.4, metalness: 0.5 });
    const table = new THREE.Mesh(tableGeo, tableMat);
    table.position.set(0, 0, 0);
    table.receiveShadow = true;
    scene.add(table);

    // Grid Mat on Table
    const gridHelper = new THREE.GridHelper(15, 30, 0x0284c7, 0x334155);
    gridHelper.position.y = 0.21;
    scene.add(gridHelper);

    // 7. BUILD 3D BENCH TOOLS
    const toolMeshes: Record<string, THREE.Object3D> = {};

    // 7A. Oscilloscope
    const oscGroup = buildOscilloscope3D();
    oscGroup.position.set(-4.5, 0.21, -1.2);
    oscGroup.userData = { toolId: 'oscilloscope', toolName: MECHATRONICS_TOOLS_DATA.oscilloscope.nameAr };
    scene.add(oscGroup);
    toolMeshes['oscilloscope'] = oscGroup;

    // 7B. Power Supply
    const psGroup = buildPowerSupply3D();
    psGroup.position.set(-1.5, 0.21, -1.5);
    psGroup.userData = { toolId: 'powersupply', toolName: MECHATRONICS_TOOLS_DATA.powersupply.nameAr };
    scene.add(psGroup);
    toolMeshes['powersupply'] = psGroup;

    // 7C. Multimeter
    const dmmGroup = buildMultimeter3D();
    dmmGroup.position.set(1.8, 0.21, 1.0);
    dmmGroup.userData = { toolId: 'multimeter', toolName: MECHATRONICS_TOOLS_DATA.multimeter.nameAr };
    scene.add(dmmGroup);
    toolMeshes['multimeter'] = dmmGroup;

    // 7D. Breadboard Station
    const bbGroup = buildBreadboardStation3D();
    bbGroup.position.set(1.5, 0.21, -1.2);
    bbGroup.userData = { toolId: 'breadboard', toolName: MECHATRONICS_TOOLS_DATA.breadboard.nameAr };
    scene.add(bbGroup);
    toolMeshes['breadboard'] = bbGroup;

    // 7E. Function Generator
    const fgGroup = buildFunctionGenerator3D();
    fgGroup.position.set(4.8, 0.21, -1.5);
    fgGroup.userData = { toolId: 'functiongen', toolName: MECHATRONICS_TOOLS_DATA.functiongen.nameAr };
    scene.add(fgGroup);
    toolMeshes['functiongen'] = fgGroup;

    // 7F. Digital Caliper
    const calGroup = buildCaliper3D();
    calGroup.position.set(-2.0, 0.21, 1.8);
    calGroup.userData = { toolId: 'caliper', toolName: MECHATRONICS_TOOLS_DATA.caliper.nameAr };
    scene.add(calGroup);
    toolMeshes['caliper'] = calGroup;

    toolMeshesRef.current = toolMeshes;

    // 8. Raycasting Click & Hover Handlers
    const handlePointerMove = (evt: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouseRef.current.x = ((evt.clientX - rect.left) / rect.width) * 2 - 1;
      mouseRef.current.y = -((evt.clientY - rect.top) / rect.height) * 2 + 1;

      raycasterRef.current.setFromCamera(mouseRef.current, camera);
      const intersects = raycasterRef.current.intersectObjects(Object.values(toolMeshes), true);

      if (intersects.length > 0) {
        let rootObj: THREE.Object3D | null = intersects[0].object;
        while (rootObj && !rootObj.userData?.toolId && rootObj.parent) {
          rootObj = rootObj.parent;
        }
        if (rootObj && rootObj.userData?.toolName) {
          setHoveredToolName(rootObj.userData.toolName);
          container.style.cursor = 'pointer';
          return;
        }
      }
      setHoveredToolName(null);
      container.style.cursor = 'grab';
    };

    const handlePointerDown = (evt: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouseRef.current.x = ((evt.clientX - rect.left) / rect.width) * 2 - 1;
      mouseRef.current.y = -((evt.clientY - rect.top) / rect.height) * 2 + 1;

      raycasterRef.current.setFromCamera(mouseRef.current, camera);
      const intersects = raycasterRef.current.intersectObjects(Object.values(toolMeshes), true);

      if (intersects.length > 0) {
        let rootObj: THREE.Object3D | null = intersects[0].object;
        while (rootObj && !rootObj.userData?.toolId && rootObj.parent) {
          rootObj = rootObj.parent;
        }
        if (rootObj && rootObj.userData?.toolId) {
          const tId = rootObj.userData.toolId;
          const tDetail = MECHATRONICS_TOOLS_DATA[tId];
          if (tDetail) {
            setSelectedTool(tDetail);
            playClickSound(800);
            if (onSelectTool) onSelectTool(tDetail);
          }
        }
      }
    };

    const domElem = renderer.domElement;
    domElem.addEventListener('mousemove', handlePointerMove);
    domElem.addEventListener('click', handlePointerDown);

    // 9. Animation Loop
    let frameId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      frameId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      // Gentle floating/glowing animation for selected tool
      Object.entries(toolMeshes).forEach(([id, mesh]) => {
        if (selectedTool && selectedTool.id === id) {
          mesh.position.y = 0.21 + Math.sin(elapsed * 3) * 0.08;
          mesh.rotation.y += 0.005;
        } else {
          mesh.position.y = THREE.MathUtils.lerp(mesh.position.y, 0.21, 0.1);
          mesh.rotation.y = THREE.MathUtils.lerp(mesh.rotation.y, 0, 0.1);
        }
      });

      controls.update();
      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const width = container.clientWidth;
      const height = container.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(frameId);
      domElem.removeEventListener('mousemove', handlePointerMove);
      domElem.removeEventListener('click', handlePointerDown);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [selectedTool]);

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
    <div className="space-y-6">
      {/* 3D Bench Viewport Section */}
      <div className="relative w-full h-[480px] sm:h-[560px] bg-slate-950 rounded-3xl overflow-hidden border-2 border-slate-800 shadow-2xl group">
        <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

        {/* Top Header Badge */}
        <div className="absolute top-4 right-4 left-4 flex items-center justify-between pointer-events-none z-10">
          <div className="bg-slate-900/90 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-slate-800 text-white flex items-center gap-3 shadow-xl pointer-events-auto">
            <div className="w-3 h-3 rounded-full bg-cyan-400 animate-pulse" />
            <div>
              <h3 className="text-sm font-black text-cyan-300">طاولة أجهزة أدوات الميكاترونكس ثلاثية الأبعاد (3D Bench)</h3>
              <p className="text-[11px] text-slate-400">انقر فوق أي جهاز أو أداة لمعاينة الوظائف والمواصفات والدليل العملي</p>
            </div>
          </div>

          <div className="flex items-center gap-2 pointer-events-auto">
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="p-2.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 backdrop-blur-md border border-slate-800 text-slate-300 cursor-pointer"
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-cyan-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
            </button>
            <button
              onClick={toggleFullscreen}
              className="p-2.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 backdrop-blur-md border border-slate-800 text-slate-300 cursor-pointer"
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4 text-amber-400" /> : <Maximize2 className="w-4 h-4 text-amber-400" />}
            </button>
          </div>
        </div>

        {/* Hover Tool Tooltip Overlay */}
        {hoveredToolName && (
          <div className="absolute bottom-20 left-1/2 -translate-x-1/2 bg-slate-900/95 text-cyan-300 border border-cyan-500/50 px-4 py-2 rounded-2xl font-black text-xs shadow-2xl backdrop-blur-md pointer-events-none animate-fade-in flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-cyan-400 animate-spin" />
            <span>انقر للتعرف على: {hoveredToolName}</span>
          </div>
        )}

        {/* Quick Tools Selector Dock */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-2xl p-2 shadow-2xl flex items-center gap-1.5 z-10 max-w-[94%] overflow-x-auto">
          {Object.values(MECHATRONICS_TOOLS_DATA).map((t) => (
            <button
              key={t.id}
              onClick={() => {
                setSelectedTool(t);
                playClickSound(750);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                selectedTool?.id === t.id
                  ? 'bg-cyan-500 text-slate-950 shadow-lg font-black'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <span>{t.nameAr.split('(')[0]}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Selected Tool Details Card */}
      {selectedTool && (
        <div className="p-6 rounded-3xl bg-slate-900/90 border-2 border-cyan-500/30 text-white space-y-6 shadow-2xl animate-fade-in">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-cyan-950 border border-cyan-500/40 text-cyan-400 flex items-center justify-center font-black text-lg shadow-inner">
                ⚡
              </div>
              <div>
                <h3 className="text-xl font-black text-cyan-300">{selectedTool.nameAr}</h3>
                <span className="text-xs font-mono text-slate-400">{selectedTool.nameEn} • {selectedTool.category}</span>
              </div>
            </div>

            <span className="px-3 py-1 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800 text-xs font-bold">
              مكتبة أدوات الأكاديمية التفاعلية
            </span>
          </div>

          <p className="text-sm text-slate-300 leading-relaxed bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
            {selectedTool.description}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Features & Technical Specs */}
            <div className="space-y-4">
              <div className="space-y-2">
                <h4 className="font-bold text-sm text-cyan-300 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                  <span>الخصائص والوظائف الرئيسية:</span>
                </h4>
                <ul className="space-y-1.5 text-xs text-slate-300">
                  {selectedTool.features.map((f, i) => (
                    <li key={i} className="flex items-start gap-2 bg-slate-950/40 p-2 rounded-xl border border-slate-800/60">
                      <span className="text-cyan-400 font-bold">•</span>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-sm text-amber-300 flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-amber-400" />
                  <span>المواصفات الفنية المعملية:</span>
                </h4>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {selectedTool.specs.map((sp, idx) => (
                    <div key={idx} className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                      <span className="text-slate-400 block text-[10px]">{sp.label}</span>
                      <span className="font-mono font-bold text-amber-300">{sp.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Practical Usage Guide & Safety Tips */}
            <div className="space-y-4">
              <div className="space-y-2">
                <h4 className="font-bold text-sm text-emerald-300 flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-emerald-400" />
                  <span>دليل الاستخدام والتطبيق العملي (Step-by-Step):</span>
                </h4>
                <ol className="space-y-2 text-xs text-slate-300 list-decimal list-inside">
                  {selectedTool.howToUse.map((step, sIdx) => (
                    <li key={sIdx} className="bg-slate-950/40 p-2.5 rounded-xl border border-slate-800/60 leading-relaxed">
                      {step}
                    </li>
                  ))}
                </ol>
              </div>

              <div className="p-3.5 rounded-2xl bg-rose-950/30 border border-rose-800/60 text-xs text-rose-200 space-y-1">
                <span className="font-bold text-rose-400 block">⚠️ نصائح السلامة المعملية:</span>
                {selectedTool.safetyTips.map((tip, tIdx) => (
                  <p key={tIdx}>• {tip}</p>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// PROCEDURAL 3D PROCEDURAL TOOL BUILDERS
// ============================================================================

// 1. Oscilloscope 3D Model
function buildOscilloscope3D(): THREE.Group {
  const group = new THREE.Group();

  // Dark Main Housing
  const bodyMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.4, metalness: 0.3 });
  const body = new THREE.Mesh(new THREE.BoxGeometry(2.4, 1.6, 1.2), bodyMat);
  body.position.y = 0.8;
  body.castShadow = true;
  group.add(body);

  // LCD Screen Panel
  const screenMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, emissive: 0x0284c7, emissiveIntensity: 0.6 });
  const screen = new THREE.Mesh(new THREE.BoxGeometry(1.3, 1.0, 0.05), screenMat);
  screen.position.set(-0.4, 0.9, 0.61);
  group.add(screen);

  // Oscilloscope Waveform Line on Screen
  const waveMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
  const wave = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.04, 0.06), waveMat);
  wave.position.set(-0.4, 0.9, 0.64);
  group.add(wave);

  // BNC Probe Connectors & Rotary Knobs
  const metalMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.9, roughness: 0.1 });
  const bnc1 = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.2), metalMat);
  bnc1.rotation.x = Math.PI / 2;
  bnc1.position.set(0.6, 0.5, 0.65);
  group.add(bnc1);

  const bnc2 = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.2), metalMat);
  bnc2.rotation.x = Math.PI / 2;
  bnc2.position.set(0.9, 0.5, 0.65);
  group.add(bnc2);

  // Knobs
  const knob1 = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.15), metalMat);
  knob1.rotation.x = Math.PI / 2;
  knob1.position.set(0.6, 1.1, 0.63);
  group.add(knob1);

  const knob2 = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.15), metalMat);
  knob2.rotation.x = Math.PI / 2;
  knob2.position.set(0.9, 1.1, 0.63);
  group.add(knob2);

  return group;
}

// 2. Power Supply 3D Model
function buildPowerSupply3D(): THREE.Group {
  const group = new THREE.Group();

  const bodyMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.5, metalness: 0.2 });
  const body = new THREE.Mesh(new THREE.BoxGeometry(2.0, 1.8, 1.4), bodyMat);
  body.position.y = 0.9;
  body.castShadow = true;
  group.add(body);

  // 7-segment LED Display
  const ledDispMat = new THREE.MeshStandardMaterial({ color: 0xdc2626, emissive: 0xef4444, emissiveIntensity: 0.9 });
  const ledDisp = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.5, 0.05), ledDispMat);
  ledDisp.position.set(0, 1.3, 0.71);
  group.add(ledDisp);

  // Red & Black Output Binding Posts
  const redMat = new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.3 });
  const blkMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.3 });

  const postRed = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.2), redMat);
  postRed.rotation.x = Math.PI / 2;
  postRed.position.set(-0.4, 0.4, 0.73);
  group.add(postRed);

  const postBlk = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.2), blkMat);
  postBlk.rotation.x = Math.PI / 2;
  postBlk.position.set(0.4, 0.4, 0.73);
  group.add(postBlk);

  return group;
}

// 3. Multimeter 3D Model
function buildMultimeter3D(): THREE.Group {
  const group = new THREE.Group();

  // Yellow Rubber Holster
  const holsterMat = new THREE.MeshStandardMaterial({ color: 0xeab308, roughness: 0.5 });
  const body = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.35, 2.0), holsterMat);
  body.position.y = 0.18;
  body.castShadow = true;
  group.add(body);

  // LCD Screen
  const lcdMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, emissive: 0x0284c7, emissiveIntensity: 0.5 });
  const lcd = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.02, 0.5), lcdMat);
  lcd.position.set(0, 0.36, -0.5);
  group.add(lcd);

  // Rotary Selector Dial
  const dialMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.3 });
  const dial = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, 0.1), dialMat);
  dial.position.set(0, 0.38, 0.2);
  group.add(dial);

  return group;
}

// 4. Breadboard Station 3D Model
function buildBreadboardStation3D(): THREE.Group {
  const group = new THREE.Group();

  const boardMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.7 });
  const board = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.18, 2.4), boardMat);
  board.position.y = 0.09;
  board.castShadow = true;
  group.add(board);

  // Power Rails Colors (Red & Blue lines)
  const redRailMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });
  const blueRailMat = new THREE.MeshBasicMaterial({ color: 0x3b82f6 });

  const rRail = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.19, 2.2), redRailMat);
  rRail.position.set(-1.6, 0.1, 0);
  group.add(rRail);

  const bRail = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.19, 2.2), blueRailMat);
  bRail.position.set(1.6, 0.1, 0);
  group.add(bRail);

  return group;
}

// 5. Function Generator 3D Model
function buildFunctionGenerator3D(): THREE.Group {
  const group = new THREE.Group();

  const bodyMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.4, metalness: 0.4 });
  const body = new THREE.Mesh(new THREE.BoxGeometry(2.2, 1.4, 1.2), bodyMat);
  body.position.y = 0.7;
  body.castShadow = true;
  group.add(body);

  const dispMat = new THREE.MeshStandardMaterial({ color: 0xa855f7, emissive: 0x9333ea, emissiveIntensity: 0.6 });
  const disp = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.4, 0.05), dispMat);
  disp.position.set(-0.3, 1.0, 0.61);
  group.add(disp);

  return group;
}

// 6. Digital Caliper 3D Model
function buildCaliper3D(): THREE.Group {
  const group = new THREE.Group();

  const metalMat = new THREE.MeshStandardMaterial({ color: 0xc0c0c0, metalness: 0.95, roughness: 0.1 });
  const beam = new THREE.Mesh(new THREE.BoxGeometry(3.4, 0.06, 0.3), metalMat);
  beam.position.y = 0.03;
  beam.castShadow = true;
  group.add(beam);

  // Digital Module Housing
  const lcdMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, emissive: 0x0284c7, emissiveIntensity: 0.5 });
  const moduleBox = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.2, 0.4), lcdMat);
  moduleBox.position.set(0, 0.12, 0);
  group.add(moduleBox);

  return group;
}

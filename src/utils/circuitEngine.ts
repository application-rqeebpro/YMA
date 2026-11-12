import { 
  CircuitWire, 
  PlacedComponent, 
  CircuitValidationError, 
  ArduinoPinId 
} from '../types/simulator';

/**
 * Electrical Node Resolver
 * Resolves breadboard holes, Arduino pins, and components into connected equivalence sets (electric nodes).
 */
export class CircuitGraph {
  // Map of point ID -> Node ID
  private pointToNode: Map<string, string> = new Map();
  // Map of Node ID -> Set of point IDs
  private nodeToPoints: Map<string, Set<string>> = new Map();

  constructor() {
    this.reset();
  }

  reset() {
    this.pointToNode.clear();
    this.nodeToPoints.clear();
  }

  private getNode(pointId: string): string {
    if (!this.pointToNode.has(pointId)) {
      this.pointToNode.set(pointId, pointId);
      this.nodeToPoints.set(pointId, new Set([pointId]));
    }
    return this.pointToNode.get(pointId)!;
  }

  connect(p1: string, p2: string) {
    const node1 = this.getNode(p1);
    const node2 = this.getNode(p2);
    if (node1 === node2) return;

    // Merge node2 into node1
    const points2 = this.nodeToPoints.get(node2)!;
    const points1 = this.nodeToPoints.get(node1)!;

    for (const pt of points2) {
      this.pointToNode.set(pt, node1);
      points1.add(pt);
    }
    this.nodeToPoints.delete(node2);
  }

  areConnected(p1: string, p2: string): boolean {
    if (!this.pointToNode.has(p1) || !this.pointToNode.has(p2)) return false;
    return this.pointToNode.get(p1) === this.pointToNode.get(p2);
  }

  getPointsInNode(pointId: string): string[] {
    const node = this.pointToNode.get(pointId);
    if (!node) return [pointId];
    return Array.from(this.nodeToPoints.get(node) || []);
  }

  isConnectedToAny(pointId: string, targets: string[]): boolean {
    return targets.some((target) => this.areConnected(pointId, target));
  }
}

/**
 * Builds the internal electrical node graph based on:
 * 1. Breadboard internal metallic clip connectivity (Columns A-E connected, F-J connected, power rails connected)
 * 2. Placed component pins inserted into holes
 * 3. Wires bridging between points
 */
export function buildCircuitGraph(
  components: PlacedComponent[],
  wires: CircuitWire[]
): CircuitGraph {
  const graph = new CircuitGraph();

  // 1. Breadboard Internal Rail Connections (Columns 1 to 30)
  for (let col = 1; col <= 30; col++) {
    // Top Power Rail (+) is connected all along the rail
    if (col > 1) {
      graph.connect(`top_power_${col - 1}`, `top_power_${col}`);
      graph.connect(`top_ground_${col - 1}`, `top_ground_${col}`);
      graph.connect(`bottom_power_${col - 1}`, `bottom_power_${col}`);
      graph.connect(`bottom_ground_${col - 1}`, `bottom_ground_${col}`);
    }

    // Top 5 Holes (A, B, C, D, E) in column 'col' are electrically connected together
    graph.connect(`A_${col}`, `B_${col}`);
    graph.connect(`B_${col}`, `C_${col}`);
    graph.connect(`C_${col}`, `D_${col}`);
    graph.connect(`D_${col}`, `E_${col}`);

    // Bottom 5 Holes (F, G, H, I, J) in column 'col' are electrically connected together
    graph.connect(`F_${col}`, `G_${col}`);
    graph.connect(`G_${col}`, `H_${col}`);
    graph.connect(`H_${col}`, `I_${col}`);
    graph.connect(`I_${col}`, `J_${col}`);
  }

  // 2. Map Components inserted into Breadboard holes
  for (const comp of components) {
    for (const pin of comp.pins) {
      if (pin.assignedHoleId) {
        // Pin ID format: "comp_${comp.id}_${pin.id}"
        const pinKey = `comp_${comp.id}_${pin.id}`;
        graph.connect(pinKey, pin.assignedHoleId);
      }
    }
  }

  // 3. Connect Wires
  for (const wire of wires) {
    if (wire.fromId && wire.toId) {
      graph.connect(wire.fromId, wire.toId);
    }
  }

  return graph;
}

/**
 * Circuit Validation Engine
 * Detects:
 * - 1. Short circuit between 5V/3V3 and Ground
 * - 2. LED connected without resistor or connected directly to 5V
 * - 3. Reverse polarity on LEDs/Sensors
 * - 4. Floating/unconnected components
 * - 5. Incorrect pin usage (e.g. Servo on non-PWM pin)
 * - 6. Incomplete wires
 */
export function validateCircuit(
  components: PlacedComponent[],
  wires: CircuitWire[]
): CircuitValidationError[] {
  const errors: CircuitValidationError[] = [];
  const graph = buildCircuitGraph(components, wires);

  const powerPins: ArduinoPinId[] = ['5V', '3V3', 'VIN'];
  const groundPins: ArduinoPinId[] = ['GND_1', 'GND_2', 'GND_3'];

  // Check 1: Incomplete wires
  for (const wire of wires) {
    if (!wire.fromId || !wire.toId) {
      errors.push({
        id: `wire_incomplete_${wire.id}`,
        severity: 'error',
        category: 'incomplete_wire',
        title: 'سلك غير متصل بالكامل',
        message: 'يوجد سلك يمتلك طرفاً غير موصل بأي نقطة في الدائرة.',
        wireId: wire.id,
        suggestedFix: 'انقر على نهاية السلك واسحبه إلى المنفذ أو الفتحة المطلوبة.',
      });
    }
  }

  // Check 2: Fatal Short Circuit: 5V or 3.3V connected directly to GND!
  let isShortCircuited = false;
  for (const pwr of powerPins) {
    for (const gnd of groundPins) {
      if (graph.areConnected(pwr, gnd)) {
        isShortCircuited = true;
        errors.push({
          id: 'fatal_short_circuit',
          severity: 'error',
          category: 'short_circuit',
          title: '⚠️ قصر كهربائي مباشر (Short Circuit)',
          message: `خطأ فادح: تم توصيل مصدر الطاقة (${pwr}) مباشرة مع الأرضي (${gnd}) بدون أي حمل! هذا قد يحرق لوحة Arduino أو منفذ USB.`,
          suggestedFix: 'افصل السلك فوراً بين خط الـ 5V وخط الأرضي GND قبل بدء المحاكاة.',
        });
        break;
      }
    }
    if (isShortCircuited) break;
  }

  // Check 3: Check Component Placements & Health
  for (const comp of components) {
    // Check if component pins are placed in breadboard
    const unplacedPins = comp.pins.filter((p) => !p.assignedHoleId);
    if (unplacedPins.length > 0) {
      errors.push({
        id: `comp_unplaced_${comp.id}`,
        severity: 'warning',
        category: 'unconnected',
        title: `أطراف ${comp.name} غير موصلة باللوحة`,
        message: `المكون [${comp.name}] لم يتم تثبيت جميع أطرافه داخل فتحات لوحة التجارب.`,
        componentId: comp.id,
        suggestedFix: 'اسحب المكون وضعه بدقة فوق صفوف Breadboard.',
      });
    }

    // Specific Validation for LED
    if (comp.type === 'led') {
      const anodePinKey = `comp_${comp.id}_anode`;
      const cathodePinKey = `comp_${comp.id}_cathode`;

      // Check if anode and cathode are shorted in the exact same row!
      if (graph.areConnected(anodePinKey, cathodePinKey)) {
        errors.push({
          id: `led_shorted_${comp.id}`,
          severity: 'error',
          category: 'short_circuit',
          title: 'أطراف الدايود LED متصلة بنفس الصف',
          message: `تم وضع طرفي الـ LED (الأنود والكاثود) في نفس الصف المتصل بـ Breadboard، مما يؤدي إلى قصر أطرافه ولن يعمل.`,
          componentId: comp.id,
          suggestedFix: 'انقل أحد طرفي الـ LED إلى عمود أو صف منفصل غير مشترك.',
        });
      }

      // Check if LED is connected to 5V directly without a resistor
      const isAnodeAt5V = graph.isConnectedToAny(anodePinKey, powerPins);
      const isCathodeAtGND = graph.isConnectedToAny(cathodePinKey, groundPins);

      // Check if any resistor exists between anode/cathode and the power source
      const hasResistorInPath = components.some((c) => {
        if (c.type !== 'resistor') return false;
        const r1 = `comp_${c.id}_pin1`;
        const r2 = `comp_${c.id}_pin2`;
        return (
          (graph.areConnected(anodePinKey, r1) || graph.areConnected(anodePinKey, r2)) ||
          (graph.areConnected(cathodePinKey, r1) || graph.areConnected(cathodePinKey, r2))
        );
      });

      if (isAnodeAt5V && isCathodeAtGND && !hasResistorInPath) {
        errors.push({
          id: `led_no_resistor_${comp.id}`,
          severity: 'error',
          category: 'missing_resistor',
          title: '🔴 دايود LED موصول بدون مقاومة حماية',
          message: 'تم توصيل الـ LED مباشرة بـ 5V والأرضي بدون مقاومة. الدايود سيحترق فوراً بسبب تدفق تيار زائد (>100mA).',
          componentId: comp.id,
          suggestedFix: 'أضف مقاومة 220Ω على التوالي مع طرف الأنود لحماية الـ LED.',
        });
      }

      // Check reverse polarity (Cathode connected to 5V and Anode to GND)
      const isCathodeAt5V = graph.isConnectedToAny(cathodePinKey, powerPins);
      const isAnodeAtGND = graph.isConnectedToAny(anodePinKey, groundPins);
      if (isCathodeAt5V && isAnodeAtGND) {
        errors.push({
          id: `led_reverse_${comp.id}`,
          severity: 'warning',
          category: 'reverse_polarity',
          title: '🟠 عكس اتجاه دايود LED (Reverse Bias)',
          message: 'تم توصيل الطرف السالب (الكاثود) بالموجب والطرف الموجب (الأنود) بالأرضي. الدايود لن يضيء.',
          componentId: comp.id,
          suggestedFix: 'اقلب اتجاه الدايود ليكون الأنود متجهاً للمصدر الموجب أو إشارة Arduino.',
        });
      }
    }

    // Specific Validation for Ultrasonic Sensor HC-SR04
    if (comp.type === 'ultrasonic') {
      const vccKey = `comp_${comp.id}_vcc`;
      const gndKey = `comp_${comp.id}_gnd`;

      if (!graph.isConnectedToAny(vccKey, powerPins)) {
        errors.push({
          id: `ultrasonic_no_power_${comp.id}`,
          severity: 'warning',
          category: 'power_issue',
          title: 'حساس الألتراسونيك غير موصل بمصدر 5V',
          message: 'يحتاج حساس المسافة HC-SR04 إلى تغذية 5V على منفذ VCC ليعمل.',
          componentId: comp.id,
          suggestedFix: 'وصل سلكاً أحمر من Arduino 5V إلى طرف VCC للحساس.',
        });
      }
      if (!graph.isConnectedToAny(gndKey, groundPins)) {
        errors.push({
          id: `ultrasonic_no_gnd_${comp.id}`,
          severity: 'warning',
          category: 'power_issue',
          title: 'حساس الألتراسونيك غير موصل بالأرضي GND',
          message: 'يجب تأريض الحساس ليكون له جهد مرجعي مشترك مع Arduino.',
          componentId: comp.id,
          suggestedFix: 'وصل سلكاً أسود من طرف GND للحساس إلى Arduino GND.',
        });
      }
    }

    // Specific Validation for Servo Motor
    if (comp.type === 'servo_motor') {
      const signalKey = `comp_${comp.id}_signal`;
      const pwmPins = ['D3_PWM', 'D5_PWM', 'D6_PWM', 'D9_PWM', 'D10_PWM', 'D11_PWM'];
      const nonPwmDigitalPins = ['D2', 'D4', 'D7', 'D8', 'D12', 'D13'];

      if (graph.isConnectedToAny(signalKey, nonPwmDigitalPins)) {
        errors.push({
          id: `servo_non_pwm_${comp.id}`,
          severity: 'warning',
          category: 'wrong_pin',
          title: '⚠️ يفضل توصيل السيرفو بمنفذ PWM',
          message: 'محرك السيرفو يستجيب لنبضات دقيقة، وينصح بتوصيله بمنافذ الـ PWM ذات علامة التيلدا (مثل ~9 أو ~10).',
          componentId: comp.id,
          suggestedFix: 'انقل سلك إشارة السيرفو إلى Digital Pin 9 أو 10.',
        });
      }
    }

    // Specific Validation for Push Button
    if (comp.type === 'push_button') {
      const pin1Key = `comp_${comp.id}_pin1`;
      const pin2Key = `comp_${comp.id}_pin2`;
      // Check if button shorts 5V directly to GND when pressed
      const isP15V = graph.isConnectedToAny(pin1Key, powerPins);
      const isP2GND = graph.isConnectedToAny(pin2Key, groundPins);
      const hasResistor = components.some((c) => c.type === 'resistor');

      if (isP15V && isP2GND && !hasResistor) {
        errors.push({
          id: `button_short_${comp.id}`,
          severity: 'error',
          category: 'short_circuit',
          title: 'خطر قصر عند الضغط على الزر',
          message: 'الزر متصل مباشرة بين 5V و GND بدون مقاومة سحب (Pull-up أو Pull-down). الضغط عليه سيسبب قصراً كهربائياً!',
          componentId: comp.id,
          suggestedFix: 'استخدم مقاومة 10kΩ مع الزر لتفادي القصر وتثبيت الإشارة.',
        });
      }
    }
  }

  return errors;
}

/**
 * Logical Simulation Step
 * Evaluates state of LEDs, Buzzer, Ultrasonic distance, Motors based on circuit topology & pseudo Arduino execution.
 */
export function simulateCircuitLogic(
  components: PlacedComponent[],
  wires: CircuitWire[],
  isCodeRunning: boolean,
  currentSimTick: number,
  analogValues: Record<string, number> = {}
): {
  updatedComponents: PlacedComponent[];
  serialLogs: string[];
} {
  const graph = buildCircuitGraph(components, wires);
  const powerPins: ArduinoPinId[] = ['5V', '3V3'];
  const groundPins: ArduinoPinId[] = ['GND_1', 'GND_2', 'GND_3'];
  const serialLogs: string[] = [];

  // Determine which pins are HIGH
  const isPin13High = isCodeRunning ? (Math.floor(currentSimTick / 2) % 2 === 0) : false;
  const isPin8High = isCodeRunning;
  const isPin9High = isCodeRunning;

  const updatedComponents = components.map((comp) => {
    const updated = { ...comp, state: { ...comp.state } };

    if (comp.type === 'led') {
      const anodeKey = `comp_${comp.id}_anode`;
      const cathodeKey = `comp_${comp.id}_cathode`;

      const hasGround = graph.isConnectedToAny(cathodeKey, groundPins);
      const has5VDirect = graph.isConnectedToAny(anodeKey, powerPins);
      const hasPin13 = graph.isConnectedToAny(anodeKey, ['D13']);
      const hasPin8 = graph.isConnectedToAny(anodeKey, ['D8']);
      const hasPin9 = graph.isConnectedToAny(anodeKey, ['D9_PWM']);

      let shouldLight = false;
      if (hasGround) {
        if (has5VDirect) shouldLight = true;
        else if (hasPin13 && isPin13High) shouldLight = true;
        else if (hasPin8 && isPin8High) shouldLight = true;
        else if (hasPin9 && isPin9High) shouldLight = true;
      }

      updated.state = {
        ...updated.state,
        isLit: shouldLight,
        brightness: shouldLight ? 100 : 0,
      };
    }

    if (comp.type === 'buzzer') {
      const p1 = `comp_${comp.id}_pin1`;
      const p2 = `comp_${comp.id}_pin2`;
      const hasGround = graph.isConnectedToAny(p2, groundPins) || graph.isConnectedToAny(p1, groundPins);
      const hasSignal = graph.isConnectedToAny(p1, ['D8', 'D9_PWM', '5V']);

      const isActive = isCodeRunning && hasGround && hasSignal;
      updated.state = {
        ...updated.state,
        buzzerFrequency: isActive ? 1000 : 0,
      };
    }

    if (comp.type === 'servo_motor') {
      const signalKey = `comp_${comp.id}_signal`;
      const isConnected = graph.isConnectedToAny(signalKey, ['D9_PWM', 'D10_PWM', 'D3_PWM']);
      if (isCodeRunning && isConnected) {
        // Sweep angle 0 to 180
        const angle = (currentSimTick * 30) % 180;
        updated.state = {
          ...updated.state,
          angle,
        };
      }
    }

    if (comp.type === 'dc_motor') {
      const p1 = `comp_${comp.id}_pin1`;
      const p2 = `comp_${comp.id}_pin2`;
      const hasPower = graph.isConnectedToAny(p1, ['5V', 'D4', 'D5_PWM']);
      const hasGND = graph.isConnectedToAny(p2, groundPins);
      updated.state = {
        ...updated.state,
        speed: (hasPower && hasGND) ? 80 : 0,
      };
    }

    if (comp.type === 'ultrasonic') {
      const vccKey = `comp_${comp.id}_vcc`;
      const isPowered = graph.isConnectedToAny(vccKey, powerPins);
      if (isPowered && isCodeRunning) {
        // Distance oscillation for realistic sensor simulation
        const baseDist = comp.state?.distanceCm || 25;
        const simulatedDist = Math.max(5, Math.min(150, Math.round(baseDist + Math.sin(currentSimTick * 0.5) * 4)));
        updated.state = {
          ...updated.state,
          distanceCm: simulatedDist,
        };
      }
    }

    return updated;
  });

  return { updatedComponents, serialLogs };
}

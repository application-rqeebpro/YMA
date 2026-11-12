// Arduino & Electronic Circuit Simulator Data Types

export type ArduinoPinId = 
  // Power & Reset
  | '5V' | '3V3' | 'GND_1' | 'GND_2' | 'GND_3' | 'VIN' | 'RESET' | 'IOREF'
  // Analog Pins
  | 'A0' | 'A1' | 'A2' | 'A3' | 'A4' | 'A5'
  // Digital / PWM Pins
  | 'D0_RX' | 'D1_TX' | 'D2' | 'D3_PWM' | 'D4' | 'D5_PWM' | 'D6_PWM' | 'D7'
  | 'D8' | 'D9_PWM' | 'D10_PWM' | 'D11_PWM' | 'D12' | 'D13' | 'AREF';

export interface ArduinoPinInfo {
  id: ArduinoPinId;
  label: string;
  type: 'power' | 'ground' | 'digital' | 'analog' | 'pwm' | 'comm' | 'control';
  description: string;
  voltage?: number;
  isPWM?: boolean;
  x: number; // visual SVG coordinate
  y: number; // visual SVG coordinate
}

export type BreadboardRail = 'top_power' | 'top_ground' | 'bottom_power' | 'bottom_ground';

export interface BreadboardHole {
  id: string; // e.g., 'top_power_5', 'A_12', 'F_12', 'bottom_ground_15'
  section: 'top_rail' | 'bottom_rail' | 'top_rows' | 'bottom_rows';
  col: number; // 1 to 30
  row?: 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'H' | 'I' | 'J';
  rail?: BreadboardRail;
  nodeId: string; // Electrical node identifier for connection tracking
  x: number;
  y: number;
}

export type WireColor = 'red' | 'black' | 'yellow' | 'blue' | 'green' | 'orange' | 'purple' | 'white';

export interface CircuitWire {
  id: string;
  fromId: string; // Pin ID or Hole ID
  toId: string;   // Pin ID or Hole ID
  fromType: 'arduino_pin' | 'breadboard_hole' | 'component_pin';
  toType: 'arduino_pin' | 'breadboard_hole' | 'component_pin';
  color: WireColor;
  label?: string;
}

export type ComponentType = 
  | 'led'
  | 'resistor'
  | 'push_button'
  | 'potentiometer'
  | 'buzzer'
  | 'servo_motor'
  | 'dc_motor'
  | 'ldr'
  | 'temp_sensor'
  | 'ultrasonic'
  | 'ir_sensor'
  | 'relay'
  | 'rgb_led'
  | 'lcd_16x2'
  | 'seven_segment';

export interface ComponentPinDef {
  id: string; // e.g. 'anode', 'cathode'
  label: string;
  description: string;
  relativeX: number; // offset relative to component origin
  relativeY: number;
  assignedHoleId?: string; // which breadboard hole it's plugged into
}

export interface PlacedComponent {
  id: string;
  type: ComponentType;
  name: string;
  x: number;
  y: number;
  rotation?: number; // 0, 90, 180, 270
  state?: {
    resistance?: number; // for resistor
    color?: string; // for LED
    isLit?: boolean;
    brightness?: number; // 0 - 100
    isPressed?: boolean; // for push button
    angle?: number; // for servo (0-180)
    potValue?: number; // 0-1023
    speed?: number; // for DC motor
    distanceCm?: number; // for ultrasonic
    tempC?: number; // for temp sensor
    lightLux?: number; // for LDR
    buzzerFrequency?: number;
    relayClosed?: boolean;
    rgbColor?: { r: number; g: number; b: number };
    lcdText?: string;
    segmentDigit?: number;
  };
  pins: ComponentPinDef[];
}

export interface CircuitValidationError {
  id: string;
  severity: 'error' | 'warning' | 'info';
  category: 'short_circuit' | 'missing_resistor' | 'reverse_polarity' | 'unconnected' | 'wrong_pin' | 'power_issue' | 'incomplete_wire';
  title: string;
  message: string;
  locationNode?: string;
  componentId?: string;
  wireId?: string;
  suggestedFix: string;
}

export interface PresetExperiment {
  id: string;
  title: string;
  category: string;
  level: 'مبتدئ' | 'متوسط' | 'متقدم';
  summary: string;
  componentsNeeded: { type: ComponentType; count: number; name: string }[];
  steps: {
    stepNumber: number;
    title: string;
    instruction: string;
    detail: string;
  }[];
  defaultCode: string;
  expectedSerialOutputs?: string[];
  autoTestRules: {
    requiredComponents: ComponentType[];
    mustHavePins: string[];
    mustNotHaveShortCircuit: boolean;
  };
}

export interface CircuitProject {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  components: PlacedComponent[];
  wires: CircuitWire[];
  arduinoCode: string;
  notes?: string;
}

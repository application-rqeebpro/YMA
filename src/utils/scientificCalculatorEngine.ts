/**
 * High-Precision Scientific, Fraction, and Complex Math Engine
 * Designed for Mechatronics & Engineering Students
 * Strictly avoids eval() - Implements a safe Lexer & AST / Shunting-Yard Evaluator
 */

export type AngleMode = 'DEG' | 'RAD' | 'GRAD';

export interface CalculationHistoryItem {
  id: string;
  expression: string;
  result: string;
  fractionResult?: string;
  complexResult?: string;
  mode: AngleMode;
  timestamp: number;
}

export interface CalculationResult {
  success: boolean;
  value?: number;
  resultString: string;
  fractionString?: string;
  complexString?: string;
  polarString?: string;
  isFraction: boolean;
  isComplex: boolean;
  steps: string[];
  error?: string;
}

// ==========================================
// 1. EXACT FRACTION CLASS
// ==========================================
export class Fraction {
  num: number;
  den: number;

  constructor(numerator: number, denominator: number = 1) {
    if (denominator === 0) {
      throw new Error('لا يمكن القسمة على صفر في المقام');
    }
    const sign = denominator < 0 ? -1 : 1;
    this.num = Math.round(numerator) * sign;
    this.den = Math.abs(Math.round(denominator));
    this.simplify();
  }

  private gcd(a: number, b: number): number {
    a = Math.abs(a);
    b = Math.abs(b);
    while (b) {
      const t = b;
      b = a % b;
      a = t;
    }
    return a;
  }

  simplify(): this {
    if (this.num === 0) {
      this.den = 1;
      return this;
    }
    const g = this.gcd(this.num, this.den);
    this.num /= g;
    this.den /= g;
    return this;
  }

  add(other: Fraction): Fraction {
    return new Fraction(
      this.num * other.den + other.num * this.den,
      this.den * other.den
    );
  }

  subtract(other: Fraction): Fraction {
    return new Fraction(
      this.num * other.den - other.num * this.den,
      this.den * other.den
    );
  }

  multiply(other: Fraction): Fraction {
    return new Fraction(this.num * other.num, this.den * other.den);
  }

  divide(other: Fraction): Fraction {
    if (other.num === 0) {
      throw new Error('لا يمكن القسمة على صفر');
    }
    return new Fraction(this.num * other.den, this.den * other.num);
  }

  pow(exponent: number): Fraction {
    if (exponent === 0) return new Fraction(1, 1);
    if (exponent < 0) {
      return new Fraction(Math.pow(this.den, -exponent), Math.pow(this.num, -exponent));
    }
    return new Fraction(Math.pow(this.num, exponent), Math.pow(this.den, exponent));
  }

  toDecimal(): number {
    return this.num / this.den;
  }

  toString(): string {
    if (this.den === 1) return `${this.num}`;
    return `${this.num}/${this.den}`;
  }

  toMixedString(): string {
    if (this.den === 1) return `${this.num}`;
    const whole = Math.floor(Math.abs(this.num) / this.den);
    const rem = Math.abs(this.num) % this.den;
    const sign = this.num < 0 ? '-' : '';
    if (whole === 0) return `${sign}${rem}/${this.den}`;
    if (rem === 0) return `${sign}${whole}`;
    return `${sign}${whole} ${rem}/${this.den}`;
  }

  /**
   * Convert decimal number to best fraction approximation
   */
  static fromDecimal(val: number, maxDenominator: number = 10000): Fraction {
    if (!isFinite(val)) throw new Error('قيمة غير صالحة للتحويل إلى كسر');
    if (Math.abs(val - Math.round(val)) < 1e-10) {
      return new Fraction(Math.round(val), 1);
    }

    const sign = val < 0 ? -1 : 1;
    let x = Math.abs(val);

    let h1 = 1, h2 = 0;
    let k1 = 0, k2 = 1;
    let b = x;

    do {
      const a = Math.floor(b);
      let aux = h1;
      h1 = a * h1 + h2;
      h2 = aux;
      aux = k1;
      k1 = a * k1 + k2;
      k2 = aux;

      if (b - a === 0) break;
      b = 1 / (b - a);
    } while (Math.abs(x - h1 / k1) > x * 1e-9 && k1 <= maxDenominator);

    return new Fraction(sign * h1, k1);
  }
}

// ==========================================
// 2. COMPLEX NUMBER CLASS (a + bi)
// ==========================================
export class Complex {
  re: number;
  im: number;

  constructor(real: number, imag: number = 0) {
    this.re = real;
    this.im = imag;
  }

  add(other: Complex): Complex {
    return new Complex(this.re + other.re, this.im + other.im);
  }

  subtract(other: Complex): Complex {
    return new Complex(this.re - other.re, this.im - other.im);
  }

  multiply(other: Complex): Complex {
    return new Complex(
      this.re * other.re - this.im * other.im,
      this.re * other.im + this.im * other.re
    );
  }

  divide(other: Complex): Complex {
    const denom = other.re * other.re + other.im * other.im;
    if (denom === 0) {
      throw new Error('لا يمكن القسمة على صفر في الأعداد المركبة');
    }
    return new Complex(
      (this.re * other.re + this.im * other.im) / denom,
      (this.im * other.re - this.re * other.im) / denom
    );
  }

  magnitude(): number {
    return Math.sqrt(this.re * this.re + this.im * this.im);
  }

  phaseDeg(): number {
    return (Math.atan2(this.im, this.re) * 180) / Math.PI;
  }

  phaseRad(): number {
    return Math.atan2(this.im, this.re);
  }

  conjugate(): Complex {
    return new Complex(this.re, -this.im);
  }

  toString(useArabicI: boolean = false): string {
    const iSymbol = useArabicI ? 'ت' : 'i';
    const r = roundFloat(this.re);
    const m = roundFloat(this.im);

    if (m === 0) return `${r}`;
    if (r === 0) {
      if (m === 1) return iSymbol;
      if (m === -1) return `-${iSymbol}`;
      return `${m}${iSymbol}`;
    }

    const sign = m > 0 ? '+' : '-';
    const absM = Math.abs(m);
    const imPart = absM === 1 ? iSymbol : `${absM}${iSymbol}`;
    return `${r} ${sign} ${imPart}`;
  }

  toPolarString(mode: AngleMode = 'DEG'): string {
    const mag = roundFloat(this.magnitude());
    let angle = mode === 'RAD' ? roundFloat(this.phaseRad()) : roundFloat(this.phaseDeg());
    const unit = mode === 'RAD' ? ' rad' : '°';
    return `${mag} ∠ ${angle}${unit}`;
  }
}

// Helper: Clean round float to prevent 0.0000000000000002 artifacts
export function roundFloat(num: number, decimals: number = 10): number {
  if (Math.abs(num) < 1e-12) return 0;
  const factor = Math.pow(10, decimals);
  return Math.round((num + Number.EPSILON) * factor) / factor;
}

// Factorial calculation
export function factorial(n: number): number {
  if (n < 0 || Math.floor(n) !== n) throw new Error('العاملي (!) معرّف فقط للأعداد الصحيحة غير السالبة');
  if (n > 170) throw new Error('الرقم كبير جداً لحساب العاملي');
  let res = 1;
  for (let i = 2; i <= n; i++) res *= i;
  return res;
}

// ==========================================
// 3. SAFE TOKENIZER & AST EVALUATOR
// ==========================================

export type TokenType =
  | 'NUMBER'
  | 'COMPLEX_I'
  | 'IDENTIFIER' // functions, constants
  | 'OPERATOR'
  | 'LPAREN'
  | 'RPAREN';

export interface Token {
  type: TokenType;
  value: string;
  numValue?: number;
}

export class SafeMathParser {
  private angleMode: AngleMode;
  private useArabicI: boolean;

  constructor(angleMode: AngleMode = 'DEG', useArabicI: boolean = false) {
    this.angleMode = angleMode;
    this.useArabicI = useArabicI;
  }

  setAngleMode(mode: AngleMode) {
    this.angleMode = mode;
  }

  // Tokenize the input string safely
  tokenize(input: string): Token[] {
    let clean = input
      .replace(/[\u0660-\u0669]/g, (d) => String(d.charCodeAt(0) - 0x0660)) // convert Arabic numerals
      .replace(/[\u06F0-\u06F9]/g, (d) => String(d.charCodeAt(0) - 0x06F0)) // convert Persian numerals
      .replace(/×/g, '*')
      .replace(/÷/g, '/')
      .replace(/−/g, '-')
      .replace(/–/g, '-')
      .replace(/\s+/g, '')
      .replace(/ت/g, 'i') // support Arabic complex symbol
      .replace(/π/g, 'pi');

    const tokens: Token[] = [];
    let i = 0;

    while (i < clean.length) {
      const ch = clean[i];

      // 1. Numbers (including floats, scientific e-notation)
      if (/[0-9]/.test(ch) || (ch === '.' && /[0-9]/.test(clean[i + 1] || ''))) {
        let numStr = '';
        while (i < clean.length && (/[0-9.]/.test(clean[i]) || (clean[i] === 'e' && /[0-9+-]/.test(clean[i + 1] || '') && !/[a-df-z]/i.test(clean[i - 1] || '')))) {
          numStr += clean[i];
          i++;
        }
        tokens.push({ type: 'NUMBER', value: numStr, numValue: parseFloat(numStr) });
        continue;
      }

      // 2. Complex imaginary unit 'i'
      if (ch === 'i') {
        tokens.push({ type: 'COMPLEX_I', value: 'i' });
        i++;
        continue;
      }

      // 3. Parentheses
      if (ch === '(') {
        tokens.push({ type: 'LPAREN', value: '(' });
        i++;
        continue;
      }
      if (ch === ')') {
        tokens.push({ type: 'RPAREN', value: ')' });
        i++;
        continue;
      }

      // 4. Operators
      if (['+', '-', '*', '/', '^', '%', '!'].includes(ch)) {
        tokens.push({ type: 'OPERATOR', value: ch });
        i++;
        continue;
      }

      // 5. Multi-letter functions and constants
      if (/[a-zA-Z]/.test(ch)) {
        let id = '';
        while (i < clean.length && /[a-zA-Z0-9]/.test(clean[i])) {
          id += clean[i];
          i++;
        }
        tokens.push({ type: 'IDENTIFIER', value: id.toLowerCase() });
        continue;
      }

      // 6. Visual root symbols
      if (ch === '√') {
        tokens.push({ type: 'IDENTIFIER', value: 'sqrt' });
        i++;
        continue;
      }
      if (ch === '∛') {
        tokens.push({ type: 'IDENTIFIER', value: 'cbrt' });
        i++;
        continue;
      }

      // 7. Modulus / absolute bars |x|
      if (ch === '|') {
        tokens.push({ type: 'IDENTIFIER', value: 'abs' });
        i++;
        continue;
      }

      throw new Error(`رمز غير معروف في المعادلة: "${ch}"`);
    }

    // Insert implicit multiplications: e.g. 2(3), (2)(3), 2i, 3pi, 2sqrt(4)
    const processed: Token[] = [];
    for (let k = 0; k < tokens.length; k++) {
      const cur = tokens[k];
      const next = tokens[k + 1];
      processed.push(cur);

      if (!next) break;

      const curIsVal = cur.type === 'NUMBER' || cur.type === 'COMPLEX_I' || cur.type === 'RPAREN';
      const nextIsVal =
        next.type === 'NUMBER' ||
        next.type === 'COMPLEX_I' ||
        next.type === 'LPAREN' ||
        (next.type === 'IDENTIFIER' && next.value !== 'pi' && next.value !== 'e' && next.value !== 'i');

      if (
        (cur.type === 'NUMBER' && next.type === 'COMPLEX_I') ||
        (cur.type === 'NUMBER' && next.type === 'LPAREN') ||
        (cur.type === 'RPAREN' && next.type === 'LPAREN') ||
        (cur.type === 'RPAREN' && next.type === 'NUMBER') ||
        (cur.type === 'NUMBER' && next.type === 'IDENTIFIER') ||
        (cur.type === 'RPAREN' && next.type === 'IDENTIFIER') ||
        (cur.type === 'COMPLEX_I' && next.type === 'NUMBER')
      ) {
        processed.push({ type: 'OPERATOR', value: '*' });
      }
    }

    return processed;
  }

  // Evaluate tokens with PEMDAS / Shunting-Yard
  evaluate(rawInput: string): CalculationResult {
    const steps: string[] = [];
    if (!rawInput || !rawInput.trim()) {
      return {
        success: false,
        resultString: '0',
        isFraction: false,
        isComplex: false,
        steps: [],
        error: 'يرجى إدخال معادلة رياضية',
      };
    }

    try {
      // Balance parentheses automatically if needed
      let input = rawInput.trim();
      let openP = (input.match(/\(/g) || []).length;
      let closeP = (input.match(/\)/g) || []).length;
      if (openP > closeP) {
        input = input + ')'.repeat(openP - closeP);
      }

      const tokens = this.tokenize(input);
      if (tokens.length === 0) {
        return {
          success: true,
          value: 0,
          resultString: '0',
          isFraction: false,
          isComplex: false,
          steps: ['المعادلة فارغة = 0'],
        };
      }

      // Check if expression is complex
      const hasComplex = tokens.some((t) => t.type === 'COMPLEX_I');

      if (hasComplex) {
        return this.evaluateComplexExpression(tokens, input);
      }

      // Check if pure fraction calculation (e.g., 3/4 + 2/5)
      const fractionResult = this.tryEvaluateAsExactFraction(tokens);
      if (fractionResult) {
        return fractionResult;
      }

      // Standard High-Precision Real Evaluation
      return this.evaluateRealExpression(tokens, input);
    } catch (err: any) {
      const rawMsg = err.message || 'خطأ في الصيغة الرياضية';
      return {
        success: false,
        resultString: 'خطأ',
        isFraction: false,
        isComplex: false,
        steps: [],
        error: rawMsg.includes('صفر') ? 'لا يمكن القسمة على صفر' : `صيغة غير صحيحة: ${rawMsg}`,
      };
    }
  }

  // Evaluate as exact Fraction if operations are rational (+, -, *, /, ^ integer)
  private tryEvaluateAsExactFraction(tokens: Token[]): CalculationResult | null {
    // Check if tokens only use integers, +, -, *, /, (, )
    const hasUnsupportedFunctions = tokens.some(
      (t) =>
        t.type === 'IDENTIFIER' ||
        t.type === 'COMPLEX_I' ||
        (t.type === 'OPERATOR' && !['+', '-', '*', '/', '^'].includes(t.value))
    );
    if (hasUnsupportedFunctions) return null;

    // Check if there is at least one division (fraction) or requested fraction
    const hasSlash = tokens.some((t) => t.type === 'OPERATOR' && t.value === '/');
    if (!hasSlash) return null;

    try {
      // Evaluate using Fraction AST
      const frac = this.parseFractionRPN(this.toRPN(tokens));
      const decimalVal = frac.toDecimal();
      const roundedDec = roundFloat(decimalVal);

      const steps: string[] = [
        `1. توحيد المقامات وحساب الكسور بدقة رياضية جبرية`,
        `2. النتيجة بالكسر الاعتيادي المبسط: ${frac.toString()}`,
      ];

      if (frac.den !== 1) {
        steps.push(`3. الكسر المختلط (Mixed Fraction): ${frac.toMixedString()}`);
        steps.push(`4. القيمة العشرية المكافئة: ${roundedDec}`);
      }

      return {
        success: true,
        value: decimalVal,
        resultString: frac.toString(),
        fractionString: frac.toString(),
        isFraction: frac.den !== 1,
        isComplex: false,
        steps,
      };
    } catch (e) {
      return null;
    }
  }

  // Standard Real Expression Evaluation with PEMDAS
  private evaluateRealExpression(tokens: Token[], originalInput: string): CalculationResult {
    const steps: string[] = [];
    const rpn = this.toRPN(tokens);
    const stack: number[] = [];

    steps.push(`1. قراءة التعبير وتطبيق أسبقية العمليات (PEMDAS): الأقواس ← القوى والجذور ← الضرب والقسمة ← الجمع والطرح`);

    for (let i = 0; i < rpn.length; i++) {
      const token = rpn[i];

      if (token.type === 'NUMBER') {
        stack.push(token.numValue ?? 0);
      } else if (token.type === 'IDENTIFIER') {
        const id = token.value;
        if (id === 'pi') {
          stack.push(Math.PI);
        } else if (id === 'e') {
          stack.push(Math.E);
        } else {
          // Unary functions
          if (stack.length < 1) throw new Error(`معامل ناقص للدالة ${id}`);
          const a = stack.pop()!;
          const res = this.applyRealFunction(id, a);
          stack.push(res);
        }
      } else if (token.type === 'OPERATOR') {
        if (token.value === '!') {
          if (stack.length < 1) throw new Error('معامل ناقص للعاملي (!)');
          const a = stack.pop()!;
          stack.push(factorial(a));
          continue;
        }

        if (stack.length < 2) {
          // Check for unary minus
          if (token.value === '-' && stack.length === 1) {
            stack.push(-stack.pop()!);
            continue;
          }
          throw new Error('صيغة المعادلة غير مكتملة');
        }

        const b = stack.pop()!;
        const a = stack.pop()!;

        let res = 0;
        switch (token.value) {
          case '+':
            res = a + b;
            break;
          case '-':
            res = a - b;
            break;
          case '*':
            res = a * b;
            break;
          case '/':
            if (Math.abs(b) < 1e-15) throw new Error('لا يمكن القسمة على صفر');
            res = a / b;
            break;
          case '^':
            res = Math.pow(a, b);
            break;
          case '%':
            res = a % b;
            break;
          default:
            throw new Error(`عملية غير مدعومة: ${token.value}`);
        }
        stack.push(res);
      }
    }

    if (stack.length !== 1) {
      throw new Error('صيغة غير صحيحة، تحقق من الأقواس والعمليات');
    }

    const finalVal = roundFloat(stack[0]);
    if (isNaN(finalVal)) {
      throw new Error('النتيجة ليست رقماً صالحاً (NaN)');
    }

    // Try converting decimal to fraction if suitable
    let fractionString: string | undefined;
    let isFraction = false;
    if (Math.abs(finalVal - Math.round(finalVal)) > 1e-8 && Math.abs(finalVal) < 10000) {
      try {
        const frac = Fraction.fromDecimal(finalVal, 1000);
        if (frac.den > 1 && frac.den <= 1000) {
          fractionString = frac.toString();
          isFraction = true;
          steps.push(`2. تم تحويل الناتج إلى كسر اعتيادي مكافئ: ${frac.toString()}`);
        }
      } catch (e) {}
    }

    steps.push(`3. النتيجة النهائية المحسوبة بدقة = ${finalVal}`);

    return {
      success: true,
      value: finalVal,
      resultString: `${finalVal}`,
      fractionString,
      isFraction,
      isComplex: false,
      steps,
    };
  }

  // Complex Numbers Evaluation (e.g. (3 + 2i) + (4 - i) = 7 + i, |3 + 4i| = 5)
  private evaluateComplexExpression(tokens: Token[], originalInput: string): CalculationResult {
    const steps: string[] = [];
    steps.push(`1. تفعيل وضع الأعداد المركبة (Complex Numbers Mode - a + bi)`);

    const rpn = this.toRPN(tokens);
    const stack: Complex[] = [];

    for (const token of rpn) {
      if (token.type === 'NUMBER') {
        stack.push(new Complex(token.numValue ?? 0, 0));
      } else if (token.type === 'COMPLEX_I') {
        stack.push(new Complex(0, 1));
      } else if (token.type === 'IDENTIFIER') {
        const id = token.value;
        if (id === 'pi') {
          stack.push(new Complex(Math.PI, 0));
        } else if (id === 'e') {
          stack.push(new Complex(Math.E, 0));
        } else if (id === 'abs' || id === 'mag') {
          if (stack.length < 1) throw new Error('معامل ناقص لحساب المقياس');
          const z = stack.pop()!;
          stack.push(new Complex(z.magnitude(), 0));
        } else if (id === 'conj') {
          if (stack.length < 1) throw new Error('معامل ناقص لحساب المرافق');
          const z = stack.pop()!;
          stack.push(z.conjugate());
        } else {
          // Standard real functions on complex real part
          if (stack.length < 1) throw new Error(`معامل ناقص للدالة ${id}`);
          const z = stack.pop()!;
          if (z.im !== 0) {
            throw new Error(`الدالة ${id} مدعومة حالياً للأعداد الحقيقية`);
          }
          const res = this.applyRealFunction(id, z.re);
          stack.push(new Complex(res, 0));
        }
      } else if (token.type === 'OPERATOR') {
        if (stack.length < 2) {
          if (token.value === '-' && stack.length === 1) {
            const z = stack.pop()!;
            stack.push(new Complex(-z.re, -z.im));
            continue;
          }
          throw new Error('صيغة الأعداد المركبة غير مكتملة');
        }

        const b = stack.pop()!;
        const a = stack.pop()!;

        switch (token.value) {
          case '+':
            stack.push(a.add(b));
            break;
          case '-':
            stack.push(a.subtract(b));
            break;
          case '*':
            stack.push(a.multiply(b));
            break;
          case '/':
            stack.push(a.divide(b));
            break;
          case '^':
            if (b.im !== 0) throw new Error('الأس التخيلي غير مدعوم');
            const mag = Math.pow(a.magnitude(), b.re);
            const theta = a.phaseRad() * b.re;
            stack.push(new Complex(mag * Math.cos(theta), mag * Math.sin(theta)));
            break;
          default:
            throw new Error(`عملية غير مدعومة في الأعداد المركبة: ${token.value}`);
        }
      }
    }

    if (stack.length !== 1) {
      throw new Error('صيغة غير صحيحة للأعداد المركبة');
    }

    const finalZ = stack[0];
    const cartesianStr = finalZ.toString(this.useArabicI);
    const polarStr = finalZ.toPolarString(this.angleMode);

    steps.push(`2. الصيغة الديكارتية (Cartesian): ${cartesianStr}`);
    steps.push(`3. الصيغة القطبية (Polar): ${polarStr}`);
    steps.push(`4. المقياس |z| = ${roundFloat(finalZ.magnitude())} ، والمرافق = ${finalZ.conjugate().toString(this.useArabicI)}`);

    return {
      success: true,
      value: finalZ.im === 0 ? finalZ.re : finalZ.magnitude(),
      resultString: cartesianStr,
      complexString: cartesianStr,
      polarString: polarStr,
      isFraction: false,
      isComplex: true,
      steps,
    };
  }

  // Parse Fraction AST from RPN
  private parseFractionRPN(rpn: Token[]): Fraction {
    const stack: Fraction[] = [];
    for (const token of rpn) {
      if (token.type === 'NUMBER') {
        stack.push(new Fraction(token.numValue ?? 0, 1));
      } else if (token.type === 'OPERATOR') {
        if (stack.length < 2) {
          if (token.value === '-' && stack.length === 1) {
            const f = stack.pop()!;
            stack.push(new Fraction(-f.num, f.den));
            continue;
          }
          throw new Error('صيغة كسر غير مكتملة');
        }
        const b = stack.pop()!;
        const a = stack.pop()!;
        switch (token.value) {
          case '+':
            stack.push(a.add(b));
            break;
          case '-':
            stack.push(a.subtract(b));
            break;
          case '*':
            stack.push(a.multiply(b));
            break;
          case '/':
            stack.push(a.divide(b));
            break;
          case '^':
            stack.push(a.pow(b.toDecimal()));
            break;
          default:
            throw new Error(`عملية غير مدعومة للكسور: ${token.value}`);
        }
      }
    }
    if (stack.length !== 1) throw new Error('خطأ في حساب الكسور');
    return stack[0];
  }

  // Shunting-Yard Algorithm to convert Infix to Reverse Polish Notation (RPN)
  private toRPN(tokens: Token[]): Token[] {
    const output: Token[] = [];
    const opStack: Token[] = [];

    const precedence: Record<string, number> = {
      '+': 1,
      '-': 1,
      '*': 2,
      '/': 2,
      '%': 2,
      '^': 3,
      '!': 4,
    };

    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i];

      if (token.type === 'NUMBER' || token.type === 'COMPLEX_I') {
        output.push(token);
      } else if (token.type === 'IDENTIFIER') {
        // constants vs functions
        if (token.value === 'pi' || token.value === 'e') {
          output.push(token);
        } else {
          opStack.push(token);
        }
      } else if (token.type === 'OPERATOR') {
        // Handle unary minus: if at start or following an operator / lparen
        if (
          token.value === '-' &&
          (i === 0 || tokens[i - 1].type === 'OPERATOR' || tokens[i - 1].type === 'LPAREN')
        ) {
          // Push a 0 before the minus to treat it as 0 - x
          output.push({ type: 'NUMBER', value: '0', numValue: 0 });
        }

        while (
          opStack.length > 0 &&
          opStack[opStack.length - 1].type !== 'LPAREN' &&
          ((opStack[opStack.length - 1].type === 'IDENTIFIER') ||
            (precedence[opStack[opStack.length - 1].value] || 0) >= (precedence[token.value] || 0))
        ) {
          output.push(opStack.pop()!);
        }
        opStack.push(token);
      } else if (token.type === 'LPAREN') {
        opStack.push(token);
      } else if (token.type === 'RPAREN') {
        while (opStack.length > 0 && opStack[opStack.length - 1].type !== 'LPAREN') {
          output.push(opStack.pop()!);
        }
        if (opStack.length === 0) {
          throw new Error('أقواس غير متطابقة في المعادلة');
        }
        opStack.pop(); // discard '('

        // If the top of the stack is a function, pop it to output
        if (opStack.length > 0 && opStack[opStack.length - 1].type === 'IDENTIFIER') {
          output.push(opStack.pop()!);
        }
      }
    }

    while (opStack.length > 0) {
      const top = opStack.pop()!;
      if (top.type === 'LPAREN' || top.type === 'RPAREN') {
        throw new Error('أقواس غير مغلقة في المعادلة');
      }
      output.push(top);
    }

    return output;
  }

  // Trigonometric & Scientific Functions with Angle Mode Awareness
  private applyRealFunction(funcName: string, x: number): number {
    // Convert angle to Radians for Math.sin/cos/tan
    const toRadians = (angle: number): number => {
      if (this.angleMode === 'RAD') return angle;
      if (this.angleMode === 'GRAD') return (angle * Math.PI) / 200;
      return (angle * Math.PI) / 180; // DEG
    };

    // Convert Radians back to active angle mode for asin/acos/atan
    const fromRadians = (rad: number): number => {
      if (this.angleMode === 'RAD') return rad;
      if (this.angleMode === 'GRAD') return (rad * 200) / Math.PI;
      return (rad * 180) / Math.PI; // DEG
    };

    switch (funcName) {
      case 'sin': {
        const r = toRadians(x);
        // Clean special exact angles e.g. sin(30 deg) = 0.5, sin(180 deg) = 0
        if (this.angleMode === 'DEG') {
          const mod = Math.abs(x) % 360;
          if (mod === 0 || mod === 180) return 0;
          if (x === 30 || x === 150) return 0.5;
          if (x === -30 || x === -150) return -0.5;
          if (x === 90) return 1;
          if (x === 270 || x === -90) return -1;
        }
        return roundFloat(Math.sin(r));
      }
      case 'cos': {
        const r = toRadians(x);
        if (this.angleMode === 'DEG') {
          const mod = Math.abs(x) % 360;
          if (mod === 90 || mod === 270) return 0;
          if (x === 60 || x === 300) return 0.5;
          if (x === 120 || x === 240) return -0.5;
          if (x === 0) return 1;
          if (x === 180) return -1;
        }
        return roundFloat(Math.cos(r));
      }
      case 'tan': {
        const r = toRadians(x);
        if (this.angleMode === 'DEG') {
          const mod = Math.abs(x) % 180;
          if (mod === 90) throw new Error('tan(90°) غير معرّفة (قيمة لا نهائية)');
          if (x === 45) return 1;
          if (x === -45) return -1;
          if (mod === 0) return 0;
        }
        return roundFloat(Math.tan(r));
      }
      case 'asin':
      case 'sin_inv':
      case 'arcsin': {
        if (x < -1 || x > 1) throw new Error('مجال دالة sin⁻¹ هو بين -1 و 1');
        return roundFloat(fromRadians(Math.asin(x)));
      }
      case 'acos':
      case 'cos_inv':
      case 'arccos': {
        if (x < -1 || x > 1) throw new Error('مجال دالة cos⁻¹ هو بين -1 و 1');
        return roundFloat(fromRadians(Math.acos(x)));
      }
      case 'atan':
      case 'tan_inv':
      case 'arctan': {
        return roundFloat(fromRadians(Math.atan(x)));
      }
      case 'sqrt': {
        if (x < 0) throw new Error('الجذر التربيعي لعدد سالب غير معرّف في الأعداد الحقيقية (استخدم وضع الأعداد المركبة i)');
        return roundFloat(Math.sqrt(x));
      }
      case 'cbrt': {
        return roundFloat(Math.cbrt(x));
      }
      case 'log':
      case 'log10': {
        if (x <= 0) throw new Error('اللوغاريتم معرّف فقط للأعداد الموجبة قطعا (> 0)');
        return roundFloat(Math.log10(x));
      }
      case 'ln': {
        if (x <= 0) throw new Error('اللوغاريتم الطبيعي (ln) معرّف فقط للأعداد الموجبة قطعا');
        return roundFloat(Math.log(x));
      }
      case 'exp': {
        return roundFloat(Math.exp(x));
      }
      case 'abs': {
        return Math.abs(x);
      }
      default:
        throw new Error(`دالة غير معروفة: "${funcName}"`);
    }
  }
}

// ==========================================
// 4. UNIT CONVERTER ENGINE (Requirement 16)
// ==========================================

export type UnitCategory = 'length' | 'time' | 'mass' | 'angle' | 'speed' | 'energy' | 'power';

export interface UnitDefinition {
  id: string;
  name: string;
  factorToBase: number; // Multiply by this to get base unit
}

export const UNIT_CATEGORIES: Record<UnitCategory, { title: string; baseUnit: string; units: UnitDefinition[] }> = {
  length: {
    title: 'الطول والمقاسات',
    baseUnit: 'm',
    units: [
      { id: 'mm', name: 'مليمتر (mm)', factorToBase: 0.001 },
      { id: 'cm', name: 'سنتيمتر (cm)', factorToBase: 0.01 },
      { id: 'm', name: 'متر (m)', factorToBase: 1 },
      { id: 'km', name: 'كيلومتر (km)', factorToBase: 1000 },
      { id: 'in', name: 'بوصة (inch)', factorToBase: 0.0254 },
      { id: 'ft', name: 'قدم (foot)', factorToBase: 0.3048 },
    ],
  },
  time: {
    title: 'الزمن',
    baseUnit: 's',
    units: [
      { id: 'ms', name: 'ميلي ثانية (ms)', factorToBase: 0.001 },
      { id: 's', name: 'ثانية (s)', factorToBase: 1 },
      { id: 'min', name: 'دقيقة (min)', factorToBase: 60 },
      { id: 'h', name: 'ساعة (h)', factorToBase: 3600 },
      { id: 'd', name: 'يوم (day)', factorToBase: 86400 },
    ],
  },
  mass: {
    title: 'الكتلة والوزن',
    baseUnit: 'g',
    units: [
      { id: 'mg', name: 'مليغرام (mg)', factorToBase: 0.001 },
      { id: 'g', name: 'غرام (g)', factorToBase: 1 },
      { id: 'kg', name: 'كيلوغرام (kg)', factorToBase: 1000 },
      { id: 'ton', name: 'طن متري (t)', factorToBase: 1000000 },
      { id: 'lb', name: 'رطل (lb)', factorToBase: 453.592 },
    ],
  },
  angle: {
    title: 'الزوايا الهندسية',
    baseUnit: 'deg',
    units: [
      { id: 'deg', name: 'درجة (Degree °)', factorToBase: 1 },
      { id: 'rad', name: 'راديان (Radian rad)', factorToBase: 180 / Math.PI },
      { id: 'grad', name: 'غراد (Gradian grad)', factorToBase: 0.9 },
    ],
  },
  speed: {
    title: 'السرعة',
    baseUnit: 'm/s',
    units: [
      { id: 'ms', name: 'متر / ثانية (m/s)', factorToBase: 1 },
      { id: 'kmh', name: 'كيلومتر / ساعة (km/h)', factorToBase: 1 / 3.6 },
      { id: 'mph', name: 'ميل / ساعة (mph)', factorToBase: 0.44704 },
    ],
  },
  energy: {
    title: 'الطاقة والعمل',
    baseUnit: 'J',
    units: [
      { id: 'J', name: 'جول (J)', factorToBase: 1 },
      { id: 'kJ', name: 'كيلوجول (kJ)', factorToBase: 1000 },
      { id: 'cal', name: 'سعرة حرارية (cal)', factorToBase: 4.184 },
      { id: 'Wh', name: 'واط ساعة (Wh)', factorToBase: 3600 },
      { id: 'kWh', name: 'كيلوواط ساعة (kWh)', factorToBase: 3600000 },
    ],
  },
  power: {
    title: 'القدرة الكهربائية والميكانيكية',
    baseUnit: 'W',
    units: [
      { id: 'W', name: 'واط (W)', factorToBase: 1 },
      { id: 'kW', name: 'كيلوواط (kW)', factorToBase: 1000 },
      { id: 'hp', name: 'حصان ميكانيكي (hp)', factorToBase: 745.6998 },
    ],
  },
};

export function convertUnits(
  category: UnitCategory,
  fromUnitId: string,
  toUnitId: string,
  val: number
): number {
  const cat = UNIT_CATEGORIES[category];
  if (!cat) return val;
  const fromU = cat.units.find((u) => u.id === fromUnitId);
  const toU = cat.units.find((u) => u.id === toUnitId);
  if (!fromU || !toU) return val;

  const baseVal = val * fromU.factorToBase;
  const converted = baseVal / toU.factorToBase;
  return roundFloat(converted, 6);
}

// ==========================================
// 5. MECHATRONICS ENGINEERING TOOLS
// ==========================================

export interface OhmsLawResult {
  v: number;
  i: number;
  r: number;
  p: number;
}

export function calculateOhmsLaw(params: {
  v?: number;
  i?: number;
  r?: number;
  p?: number;
}): OhmsLawResult {
  let { v, i, r, p } = params;

  if (v !== undefined && r !== undefined && r !== 0) {
    i = v / r;
    p = v * i;
  } else if (v !== undefined && i !== undefined) {
    r = i !== 0 ? v / i : 0;
    p = v * i;
  } else if (i !== undefined && r !== undefined) {
    v = i * r;
    p = v * i;
  } else if (p !== undefined && v !== undefined && v !== 0) {
    i = p / v;
    r = v / i;
  } else if (p !== undefined && i !== undefined && i !== 0) {
    v = p / i;
    r = v / i;
  } else if (p !== undefined && r !== undefined && r > 0) {
    i = Math.sqrt(p / r);
    v = i * r;
  } else {
    v = v || 0;
    i = i || 0;
    r = r || 0;
    p = p || 0;
  }

  return {
    v: roundFloat(v || 0, 4),
    i: roundFloat(i || 0, 4),
    r: roundFloat(r || 0, 4),
    p: roundFloat(p || 0, 4),
  };
}

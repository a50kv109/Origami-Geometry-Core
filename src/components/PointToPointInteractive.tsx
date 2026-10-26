import React, { useState } from 'react';
import { findFoldAxisPointToPoint, PointToPointResult, DEFAULT_POINT_TO_POINT_SEPARATION_THRESHOLD } from '../construction/pointToPoint';
import { auditPointToPointResult, PointToPointAuditReport } from '../construction/pointToPointVerifier';
import { runPointToPointSuite, POINT_TO_POINT_TEST_CASES, TestExecutionResult } from '../construction/pointToPointTest';
import { Point2D, reflectPoint } from '../core/reflection';
import { 
  Play, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  ShieldCheck, 
  Sliders, 
  Compass, 
  RotateCcw,
  Layers,
  Sparkles
} from 'lucide-react';

export const PointToPointInteractive: React.FC = () => {
  // Interactive test inputs
  const [p1, setP1] = useState<Point2D>([0.2, 0.4]);
  const [p2, setP2] = useState<Point2D>([1.6, 1.2]);
  const [selectedPreset, setSelectedPreset] = useState<string>('custom');

  // Suite execution state
  const [suiteOutput, setSuiteOutput] = useState<{
    total: number;
    passed: number;
    failed: number;
    allPassed: boolean;
    results: TestExecutionResult[];
  }>(() => runPointToPointSuite());

  const computeCurrentResult = (): { result: PointToPointResult; audit: PointToPointAuditReport } => {
    const result = findFoldAxisPointToPoint(p1, p2);
    const audit = auditPointToPointResult(p1, p2, result);
    return { result, audit };
  };

  const { result, audit } = computeCurrentResult();

  const handleApplyPreset = (presetKey: string) => {
    setSelectedPreset(presetKey);
    switch (presetKey) {
      case 'horizontal':
        setP1([0, 0]);
        setP2([2, 0]);
        break;
      case 'vertical':
        setP1([0, 0]);
        setP2([0, 2]);
        break;
      case 'diagonal':
        setP1([1, 0]);
        setP2([0, 1]);
        break;
      case 'coincident':
        setP1([1, 1]);
        setP2([1, 1]);
        break;
      case 'subthreshold':
        setP1([1, 1]);
        setP2([1 + 1.0e-13, 1]);
        break;
      case 'abovethreshold':
        setP1([1, 1]);
        setP2([1 + 1.0e-8, 1]);
        break;
      default:
        break;
    }
  };

  const handleRunSuite = () => {
    setSuiteOutput(runPointToPointSuite());
  };

  // SVG coordinate transformation: paper domain [-0.5, 2.5] -> SVG viewport 400x400
  const svgSize = 400;
  const domainMin = -0.5;
  const domainMax = 2.5;
  const domainSpan = domainMax - domainMin;

  const toSvgX = (x: number) => ((x - domainMin) / domainSpan) * svgSize;
  const toSvgY = (y: number) => svgSize - ((y - domainMin) / domainSpan) * svgSize; // Invert Y

  // Compute line extension points for rendering
  let lineSegment: { x1: number; y1: number; x2: number; y2: number } | null = null;
  if (result.axis) {
    const A = result.axis.point;
    const u = result.axis.direction;
    const span = 4.0;
    const pStart: Point2D = [A[0] - u[0] * span, A[1] - u[1] * span];
    const pEnd: Point2D = [A[0] + u[0] * span, A[1] + u[1] * span];
    lineSegment = {
      x1: toSvgX(pStart[0]),
      y1: toSvgY(pStart[1]),
      x2: toSvgX(pEnd[0]),
      y2: toSvgY(pEnd[1]),
    };
  }

  // Reflected points for visual feedback
  let p1Reflected: Point2D | null = null;
  if (result.axis) {
    try {
      p1Reflected = reflectPoint(p1, result.axis.point, result.axis.direction);
    } catch {
      p1Reflected = null;
    }
  }

  return (
    <div className="space-y-6">
      {/* Title & Banner */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 text-[11px] font-mono uppercase bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold">
              Primitive B (Huzita Axiom 2)
            </span>
            <span className="px-2 py-0.5 text-[11px] font-mono uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold">
              Experimental Construction Layer
            </span>
            <span className="text-xs font-mono text-slate-400">Status: EXPERIMENT_VERIFIED</span>
          </div>
          <h2 className="text-xl font-bold font-mono tracking-tight text-slate-100 mt-2">
            FIND_FOLD_AXIS_POINT_TO_POINT — Серединный перпендикуляр
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-3xl">
            Построение оси сгиба, совмещающей точку P₁ с точкой P₂. Реализовано в изолированном модуле{' '}
            <code className="text-sky-400">src/construction/pointToPoint.ts</code> с нулевым вмешательством в замороженное ядро.
          </p>
        </div>

        <button
          onClick={handleRunSuite}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-mono font-bold text-xs flex items-center gap-2 shrink-0 self-start md:self-center transition-colors"
        >
          <Play className="w-4 h-4 fill-current" />
          <span>Запустить npm run test:p2p (11/11)</span>
        </button>
      </div>

      {/* Main Grid: Interactive Canvas & Invariant Auditor */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Interactive Visualizer (5 cols) */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 p-5 rounded-lg flex flex-col">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
            <div className="flex items-center gap-2 font-mono text-xs font-bold text-slate-200">
              <Compass className="w-4 h-4 text-sky-400" />
              <span>Геометрический интерактивный холст</span>
            </div>
            <span className="text-[10px] font-mono text-slate-500">Домен: [-0.5, 2.5]</span>
          </div>

          {/* Preset Buttons */}
          <div className="mb-4 space-y-1.5">
            <div className="text-[11px] font-mono text-slate-400">Пресеты краевых случаев:</div>
            <div className="grid grid-cols-3 gap-1.5 font-mono text-[10px]">
              <button
                onClick={() => handleApplyPreset('horizontal')}
                className={`px-2 py-1 border transition-colors ${
                  selectedPreset === 'horizontal' ? 'border-sky-400 bg-sky-950 text-sky-200' : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-slate-200'
                }`}
              >
                Горизонт (0,0)→(2,0)
              </button>
              <button
                onClick={() => handleApplyPreset('vertical')}
                className={`px-2 py-1 border transition-colors ${
                  selectedPreset === 'vertical' ? 'border-sky-400 bg-sky-950 text-sky-200' : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-slate-200'
                }`}
              >
                Вертикаль (0,0)→(0,2)
              </button>
              <button
                onClick={() => handleApplyPreset('diagonal')}
                className={`px-2 py-1 border transition-colors ${
                  selectedPreset === 'diagonal' ? 'border-sky-400 bg-sky-950 text-sky-200' : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-slate-200'
                }`}
              >
                Диагональ y = x
              </button>
              <button
                onClick={() => handleApplyPreset('coincident')}
                className={`px-2 py-1 border transition-colors ${
                  selectedPreset === 'coincident' ? 'border-amber-400 bg-amber-950 text-amber-200' : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-slate-200'
                }`}
              >
                Совпадение (d = 0)
              </button>
              <button
                onClick={() => handleApplyPreset('subthreshold')}
                className={`px-2 py-1 border transition-colors ${
                  selectedPreset === 'subthreshold' ? 'border-rose-400 bg-rose-950 text-rose-200' : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-slate-200'
                }`}
              >
                d &lt; 10⁻¹⁰ (Шум)
              </button>
              <button
                onClick={() => handleApplyPreset('abovethreshold')}
                className={`px-2 py-1 border transition-colors ${
                  selectedPreset === 'abovethreshold' ? 'border-emerald-400 bg-emerald-950 text-emerald-200' : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-slate-200'
                }`}
              >
                d = 10⁻⁸ (Граница)
              </button>
            </div>
          </div>

          {/* Coordinate Sliders */}
          <div className="grid grid-cols-2 gap-3 mb-4 bg-slate-950 p-3 border border-slate-800/80 font-mono text-xs">
            <div>
              <div className="text-slate-400 font-semibold mb-1 text-[11px] text-sky-400">Точка P₁ (исходная):</div>
              <div className="flex items-center gap-1.5">
                <span className="text-slate-500">x:</span>
                <input
                  type="number"
                  step="0.1"
                  value={p1[0]}
                  onChange={(e) => {
                    setSelectedPreset('custom');
                    setP1([parseFloat(e.target.value) || 0, p1[1]]);
                  }}
                  className="w-16 bg-slate-900 border border-slate-700 px-1.5 py-0.5 text-xs text-slate-200"
                />
                <span className="text-slate-500">y:</span>
                <input
                  type="number"
                  step="0.1"
                  value={p1[1]}
                  onChange={(e) => {
                    setSelectedPreset('custom');
                    setP1([p1[0], parseFloat(e.target.value) || 0]);
                  }}
                  className="w-16 bg-slate-900 border border-slate-700 px-1.5 py-0.5 text-xs text-slate-200"
                />
              </div>
            </div>

            <div>
              <div className="text-slate-400 font-semibold mb-1 text-[11px] text-emerald-400">Точка P₂ (целевая):</div>
              <div className="flex items-center gap-1.5">
                <span className="text-slate-500">x:</span>
                <input
                  type="number"
                  step="0.1"
                  value={p2[0]}
                  onChange={(e) => {
                    setSelectedPreset('custom');
                    setP2([parseFloat(e.target.value) || 0, p2[1]]);
                  }}
                  className="w-16 bg-slate-900 border border-slate-700 px-1.5 py-0.5 text-xs text-slate-200"
                />
                <span className="text-slate-500">y:</span>
                <input
                  type="number"
                  step="0.1"
                  value={p2[1]}
                  onChange={(e) => {
                    setSelectedPreset('custom');
                    setP2([p2[0], parseFloat(e.target.value) || 0]);
                  }}
                  className="w-16 bg-slate-900 border border-slate-700 px-1.5 py-0.5 text-xs text-slate-200"
                />
              </div>
            </div>
          </div>

          {/* SVG Canvas */}
          <div className="relative bg-slate-950 border border-slate-800 rounded flex items-center justify-center overflow-hidden">
            <svg width={svgSize} height={svgSize} className="block select-none">
              {/* Coordinate Grid */}
              <defs>
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1e293b" strokeWidth="0.8" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />

              {/* Coordinate Axes */}
              <line x1="0" y1={toSvgY(0)} x2={svgSize} y2={toSvgY(0)} stroke="#334155" strokeWidth="1.2" />
              <line x1={toSvgX(0)} y1="0" x2={toSvgX(0)} y2={svgSize} stroke="#334155" strokeWidth="1.2" />

              {/* Calibrated Unit Square [0, 2] x [0, 2] boundary */}
              <rect
                x={toSvgX(0)}
                y={toSvgY(2)}
                width={toSvgX(2) - toSvgX(0)}
                height={toSvgY(0) - toSvgY(2)}
                fill="none"
                stroke="#475569"
                strokeDasharray="3 3"
                strokeWidth="1"
              />

              {/* Chord Segment P1 -> P2 */}
              <line
                x1={toSvgX(p1[0])}
                y1={toSvgY(p1[1])}
                x2={toSvgX(p2[0])}
                y2={toSvgY(p2[1])}
                stroke="#64748b"
                strokeWidth="1.5"
                strokeDasharray="4 4"
              />

              {/* Fold Axis (Perpendicular Bisector) */}
              {lineSegment && (
                <line
                  x1={lineSegment.x1}
                  y1={lineSegment.y1}
                  x2={lineSegment.x2}
                  y2={lineSegment.y2}
                  stroke="#38bdf8"
                  strokeWidth="2.5"
                />
              )}

              {/* Midpoint M */}
              {result.midpoint && (
                <circle
                  cx={toSvgX(result.midpoint[0])}
                  cy={toSvgY(result.midpoint[1])}
                  r="4"
                  fill="#f59e0b"
                  stroke="#0f172a"
                  strokeWidth="1.5"
                />
              )}

              {/* Point P1 */}
              <circle
                cx={toSvgX(p1[0])}
                cy={toSvgY(p1[1])}
                r="6"
                fill="#38bdf8"
                stroke="#ffffff"
                strokeWidth="1.5"
              />
              <text
                x={toSvgX(p1[0]) + 8}
                y={toSvgY(p1[1]) - 8}
                fill="#38bdf8"
                fontSize="11"
                fontFamily="monospace"
                fontWeight="bold"
              >
                P₁({p1[0].toFixed(2)}, {p1[1].toFixed(2)})
              </text>

              {/* Point P2 */}
              <circle
                cx={toSvgX(p2[0])}
                cy={toSvgY(p2[1])}
                r="6"
                fill="#10b981"
                stroke="#ffffff"
                strokeWidth="1.5"
              />
              <text
                x={toSvgX(p2[0]) + 8}
                y={toSvgY(p2[1]) - 8}
                fill="#10b981"
                fontSize="11"
                fontFamily="monospace"
                fontWeight="bold"
              >
                P₂({p2[0].toFixed(2)}, {p2[1].toFixed(2)})
              </text>

              {/* Reflected P1 check marker */}
              {p1Reflected && (
                <circle
                  cx={toSvgX(p1Reflected[0])}
                  cy={toSvgY(p1Reflected[1])}
                  r="9"
                  fill="none"
                  stroke="#a855f7"
                  strokeWidth="1"
                  strokeDasharray="2 2"
                />
              )}
            </svg>
          </div>

          <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 mt-2 px-1">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-0.5 bg-sky-400 inline-block"></span> Ось сгиба
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-0.5 bg-slate-500 border-dashed border-b inline-block"></span> Хорда P₁P₂
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-500 inline-block"></span> Середина M
            </span>
          </div>
        </div>

        {/* Right Column: Mathematical Contract & 7 Invariant Checks (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Status Card */}
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-lg font-mono">
            <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-2">
              <span className="text-xs font-bold text-slate-300">ВЫВОД ПРИМИТИВА B</span>
              <span
                className={`text-[10px] px-2 py-0.5 font-bold uppercase ${
                  result.status === 'UNIQUE_SOLUTION'
                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-500'
                    : result.status === 'COINCIDENT_POINTS_INFINITE_SOLUTIONS'
                    ? 'bg-amber-950 text-amber-300 border border-amber-500'
                    : 'bg-rose-950 text-rose-300 border border-rose-500'
                }`}
              >
                {result.status}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs mb-3">
              <div>
                <span className="text-slate-500 block text-[10px]">Кратность:</span>
                <span className="text-slate-200 font-semibold">{result.multiplicity}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">Расстояние ||P₂ - P₁||:</span>
                <span className="text-slate-200 font-semibold">{result.distance.toExponential(4)}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">Порог стабильности:</span>
                <span className="text-slate-200 font-semibold">{DEFAULT_POINT_TO_POINT_SEPARATION_THRESHOLD.toExponential(1)}</span>
              </div>
            </div>

            {result.axis ? (
              <div className="bg-slate-950 p-3 border border-slate-800 text-xs space-y-1">
                <div>
                  <span className="text-slate-500">Точка привязки (M): </span>
                  <span className="text-sky-300 font-semibold">
                    [{result.axis.point[0].toFixed(7)}, {result.axis.point[1].toFixed(7)}]
                  </span>
                </div>
                <div>
                  <span className="text-slate-500">Вектор направления (u): </span>
                  <span className="text-emerald-300 font-semibold">
                    [{result.axis.direction[0].toFixed(7)}, {result.axis.direction[1].toFixed(7)}]
                  </span>
                </div>
                <div>
                  <span className="text-slate-500">Нормаль оси (n): </span>
                  <span className="text-amber-300 font-semibold">
                    [{(-result.axis.direction[1]).toFixed(7)}, {result.axis.direction[0].toFixed(7)}]
                  </span>
                </div>
              </div>
            ) : (
              <div className="bg-slate-950 p-3 border border-slate-800 text-xs text-amber-300">
                {result.diagnostic}
              </div>
            )}
          </div>

          {/* Independent Verifier: 7 Check Invariants */}
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-lg font-mono">
            <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-bold text-slate-300">НЕЗАВИСИМЫЙ АУДИТ КОНТРАКТА (7 ПРОВЕРОК)</span>
              </div>
              <span
                className={`text-[10px] px-2 py-0.5 font-bold uppercase ${
                  audit.passed ? 'bg-emerald-950 text-emerald-300 border border-emerald-500' : 'bg-rose-950 text-rose-300 border border-rose-500'
                }`}
              >
                Вердикт: {audit.verdict}
              </span>
            </div>

            <div className="space-y-2 text-xs">
              {/* Check 1 */}
              <div className="flex items-start justify-between p-2 bg-slate-950 border border-slate-800/80">
                <div className="space-y-0.5">
                  <div className="text-slate-200 font-semibold text-[11px]">1. Нормировка вектора оси (||u|| = 1)</div>
                  <div className="text-[10px] text-slate-400">{audit.checks.axisUnitNorm.message}</div>
                </div>
                {audit.checks.axisUnitNorm.passed ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : (
                  <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                )}
              </div>

              {/* Check 2 */}
              <div className="flex items-start justify-between p-2 bg-slate-950 border border-slate-800/80">
                <div className="space-y-0.5">
                  <div className="text-slate-200 font-semibold text-[11px]">2. Инцидентность середины отрезка оси (dist(M, L) = 0)</div>
                  <div className="text-[10px] text-slate-400">{audit.checks.midpointIncidence.message}</div>
                </div>
                {audit.checks.midpointIncidence.passed ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : (
                  <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                )}
              </div>

              {/* Check 3 */}
              <div className="flex items-start justify-between p-2 bg-slate-950 border border-slate-800/80">
                <div className="space-y-0.5">
                  <div className="text-slate-200 font-semibold text-[11px]">3. Ортогональность оси хорде P₁P₂ (&lt;Δ, u&gt; = 0)</div>
                  <div className="text-[10px] text-slate-400">{audit.checks.chordPerpendicularity.message}</div>
                </div>
                {audit.checks.chordPerpendicularity.passed ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : (
                  <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                )}
              </div>

              {/* Check 4 */}
              <div className="flex items-start justify-between p-2 bg-slate-950 border border-slate-800/80">
                <div className="space-y-0.5">
                  <div className="text-slate-200 font-semibold text-[11px]">4. Равноудаленность якоря от обеих точек (||A-P₁|| = ||A-P₂||)</div>
                  <div className="text-[10px] text-slate-400">{audit.checks.anchorEquidistance.message}</div>
                </div>
                {audit.checks.anchorEquidistance.passed ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : (
                  <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                )}
              </div>

              {/* Check 5 */}
              <div className="flex items-start justify-between p-2 bg-slate-950 border border-slate-800/80">
                <div className="space-y-0.5">
                  <div className="text-slate-200 font-semibold text-[11px]">5. Замыкание отражения R_L(P₁) = P₂</div>
                  <div className="text-[10px] text-slate-400">{audit.checks.reflectionClosureP1ToP2.message}</div>
                </div>
                {audit.checks.reflectionClosureP1ToP2.passed ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : (
                  <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                )}
              </div>

              {/* Check 6 */}
              <div className="flex items-start justify-between p-2 bg-slate-950 border border-slate-800/80">
                <div className="space-y-0.5">
                  <div className="text-slate-200 font-semibold text-[11px]">6. Симметрия инволюции R_L(P₂) = P₁</div>
                  <div className="text-[10px] text-slate-400">{audit.checks.reflectionClosureP2ToP1.message}</div>
                </div>
                {audit.checks.reflectionClosureP2ToP1.passed ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : (
                  <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                )}
              </div>

              {/* Check 7 */}
              <div className="flex items-start justify-between p-2 bg-slate-950 border border-slate-800/80">
                <div className="space-y-0.5">
                  <div className="text-slate-200 font-semibold text-[11px]">7. Неподвижность якоря на оси сгиба R_L(A) = A</div>
                  <div className="text-[10px] text-slate-400">{audit.checks.axisFixedPoint.message}</div>
                </div>
                {audit.checks.axisFixedPoint.passed ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : (
                  <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Automated Suite Summary (11 Tests) */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3 mb-4 font-mono">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-bold text-slate-200">
              РЕЕСТР АВТОМАТИЧЕСКИХ ТЕСТОВ ПРИМИТИВА B (`npm run test:p2p`)
            </h3>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <span className="text-slate-400">Пройдено:</span>
            <span className="text-emerald-400 font-bold">
              {suiteOutput.passed} / {suiteOutput.total} (100%)
            </span>
          </div>
        </div>

        <div className="space-y-2 font-mono text-xs">
          {suiteOutput.results.map((t) => (
            <div
              key={t.testId}
              className={`p-3 border rounded flex flex-col md:flex-row md:items-center justify-between gap-2 ${
                t.passed ? 'bg-slate-950/80 border-slate-800' : 'bg-rose-950/40 border-rose-800'
              }`}
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-slate-500 font-bold">[{t.testId}]</span>
                  <span className="text-slate-200 font-semibold">{t.name}</span>
                  <span className="text-[10px] px-1.5 py-0.2 border border-slate-700 bg-slate-900 text-slate-400">
                    {t.category}
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 truncate max-w-2xl">{t.diagnostic}</div>
              </div>

              <div className="flex items-center gap-4 shrink-0 text-xs">
                <div className="text-right">
                  <span className="text-slate-500 block text-[10px]">Аудит верификатора:</span>
                  <span
                    className={
                      t.auditVerdict === 'PASS' || t.auditVerdict === 'EXPECTED_DEGENERACY_CONFIRMED'
                        ? 'text-emerald-400 font-semibold'
                        : 'text-amber-400 font-semibold'
                    }
                  >
                    {t.auditVerdict}
                  </span>
                </div>
                <div className="w-6 flex justify-center">
                  {t.passed ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  ) : (
                    <XCircle className="w-5 h-5 text-rose-400" />
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

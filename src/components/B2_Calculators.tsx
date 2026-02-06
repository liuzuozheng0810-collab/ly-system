import React, { useState, useEffect } from 'react';
import { 
  ArrowRightLeft, 
  Droplets, 
  Gauge, 
  Weight, 
  Box, 
  Ruler, 
  ClipboardList, 
  ChevronDown, 
  ChevronRight 
} from 'lucide-react';

// DCT Grade Table: [Nominal Size Min, Max, [Grade1Tol, Grade2Tol, ..., Grade12Tol]] (mm)
const DCT_TABLE: [number, number, number[]][] = [
  [0, 10, [0.09, 0.13, 0.18, 0.26, 0.36, 0.52, 0.74, 1.0, 1.5, 2.0, 2.8, 4.2]],
  [10, 16, [0.10, 0.14, 0.20, 0.28, 0.38, 0.54, 0.78, 1.1, 1.6, 2.2, 3.0, 4.4]],
  [16, 25, [0.11, 0.15, 0.22, 0.30, 0.42, 0.58, 0.82, 1.2, 1.7, 2.4, 3.2, 4.6]],
  [25, 40, [0.12, 0.17, 0.24, 0.32, 0.46, 0.64, 0.90, 1.3, 1.8, 2.6, 3.6, 5.0]],
  [40, 63, [0.13, 0.18, 0.26, 0.36, 0.50, 0.70, 1.0, 1.4, 2.0, 2.8, 4.0, 5.6]],
  [63, 100, [0.14, 0.20, 0.28, 0.40, 0.56, 0.78, 1.1, 1.6, 2.2, 3.2, 4.4, 6.0]],
  [100, 160, [0.15, 0.22, 0.30, 0.44, 0.62, 0.88, 1.2, 1.8, 2.5, 3.6, 5.0, 7.0]],
  [160, 250, [-1, 0.24, 0.34, 0.50, 0.70, 1.0, 1.4, 2.0, 2.8, 4.0, 5.6, 8.0]],
  [250, 400, [-1, -1, 0.40, 0.56, 0.78, 1.1, 1.6, 2.2, 3.2, 4.4, 6.2, 9.0]],
];

// IT Grade Table normalized to mm (1 μm = 0.001 mm)
const IT_TABLE: [number, number, number[]][] = [
  [0, 3, [0.004, 0.006, 0.010, 0.014, 0.025, 0.040, 0.060, 0.10, 0.14]],
  [3, 6, [0.005, 0.008, 0.012, 0.018, 0.030, 0.048, 0.075, 0.12, 0.18]],
  [6, 10, [0.006, 0.009, 0.015, 0.022, 0.036, 0.058, 0.090, 0.15, 0.22]],
  [10, 18, [0.008, 0.011, 0.018, 0.027, 0.043, 0.070, 0.110, 0.18, 0.27]],
  [18, 30, [0.009, 0.013, 0.021, 0.033, 0.052, 0.084, 0.130, 0.21, 0.33]],
  [30, 50, [0.011, 0.016, 0.025, 0.039, 0.062, 0.100, 0.160, 0.25, 0.39]],
  [50, 80, [0.013, 0.019, 0.030, 0.046, 0.074, 0.120, 0.190, 0.30, 0.46]],
  [80, 120, [0.015, 0.022, 0.035, 0.054, 0.087, 0.140, 0.220, 0.35, 0.54]],
  [120, 180, [0.018, 0.025, 0.040, 0.063, 0.100, 0.160, 0.250, 0.40, 0.63]],
  [180, 250, [0.020, 0.029, 0.046, 0.072, 0.115, 0.185, 0.290, 0.46, 0.72]],
];

const AQL_LEVELS = [0.65, 1.0, 1.5, 2.5, 4.0, 6.5];
const AQL_TABLE: [number, number, number, number[]][] = [
  [2, 8, 2, [0, 0, 0, 0, 1, 1]],
  [9, 15, 2, [0, 0, 0, 0, 1, 1]],
  [16, 25, 3, [0, 0, 0, 1, 1, 2]],
  [26, 50, 5, [0, 0, 1, 1, 2, 3]],
  [51, 90, 5, [0, 0, 1, 1, 2, 3]],
  [91, 150, 8, [0, 1, 1, 2, 3, 4]],
  [151, 280, 13, [1, 1, 2, 3, 4, 6]],
  [281, 500, 20, [1, 2, 3, 4, 6, 8]],
  [501, 1200, 32, [2, 3, 4, 6, 8, 11]],
  [1201, 3200, 50, [3, 4, 6, 8, 11, 15]],
  [3201, 10000, 80, [4, 6, 8, 11, 15, 22]],
  [10001, 35000, 125, [6, 8, 11, 15, 22, 22]],
];

type CalcSection = 'AQL' | 'DCT' | 'IT' | 'DIM' | 'WGT' | 'DEW' | 'PRS' | null;

const B2_Calculators: React.FC = () => {
  const [expandedSection, setExpandedSection] = useState<CalcSection>(null);

  // Unit Conversion states
  const [inch, setInch] = useState('');
  const [mm, setMm] = useState('');
  const [psi, setPsi] = useState('');
  const [mpa, setMpa] = useState('');
  const [kg, setKg] = useState('');
  const [lb, setLb] = useState('');

  // Dew Point states
  const [temp, setTemp] = useState('25');
  const [humidity, setHumidity] = useState('50');
  const [dewPoint, setDewPoint] = useState<string | null>(null);

  // DCT Grade Calculation states
  const [dctIsMetric, setDctIsMetric] = useState(true);
  const [nominalSize, setNominalSize] = useState('');
  const [toleranceVal, setToleranceVal] = useState('');
  const [dctGrade, setDctGrade] = useState<string | null>(null);

  // IT Grade Calculation states
  const [itIsMetric, setItIsMetric] = useState(true);
  const [itNominalSize, setItNominalSize] = useState('');
  const [itToleranceVal, setItToleranceVal] = useState('');
  const [itGrade, setItGrade] = useState<string | null>(null);

  // AQL Sampling Plan states
  const [batchSize, setBatchSize] = useState('');
  const [selectedAql, setSelectedAql] = useState(1.5);
  const [samplingResult, setSamplingResult] = useState<{ n: number, ac: number, re: number } | null>(null);

  // Handlers
  const handleInchChange = (val: string) => {
    setInch(val);
    if (!isNaN(parseFloat(val))) setMm((parseFloat(val) * 25.4).toFixed(3));
    else setMm('');
  };
  const handleMmChange = (val: string) => {
    setMm(val);
    if (!isNaN(parseFloat(val))) setInch((parseFloat(val) / 25.4).toFixed(4));
    else setInch('');
  };
  const handlePsiChange = (val: string) => {
    setPsi(val);
    if (!isNaN(parseFloat(val))) setMpa((parseFloat(val) * 0.00689476).toFixed(4));
    else setMpa('');
  };
  const handleMpaChange = (val: string) => {
    setMpa(val);
    if (!isNaN(parseFloat(val))) setPsi((parseFloat(val) / 0.00689476).toFixed(2));
    else setPsi('');
  };
  const handleKgChange = (val: string) => {
    setKg(val);
    if (!isNaN(parseFloat(val))) setLb((parseFloat(val) * 2.20462).toFixed(2));
    else setLb('');
  };
  const handleLbChange = (val: string) => {
    setLb(val);
    if (!isNaN(parseFloat(val))) setKg((parseFloat(val) / 2.20462).toFixed(2));
    else setKg('');
  };

  // Logic Effects
  useEffect(() => {
    const T = parseFloat(temp);
    const RH = parseFloat(humidity);
    if (!isNaN(T) && !isNaN(RH) && RH > 0) {
      const a = 17.27, b = 237.7;
      const alpha = ((a * T) / (b + T)) + Math.log(RH / 100.0);
      const dp = (b * alpha) / (a - alpha);
      setDewPoint(dp.toFixed(1));
    } else setDewPoint(null);
  }, [temp, humidity]);

  useEffect(() => {
    let size = parseFloat(nominalSize);
    let tol = parseFloat(toleranceVal);
    if (isNaN(size) || isNaN(tol)) { setDctGrade(null); return; }
    if (!dctIsMetric) { size *= 25.4; tol *= 25.4; }
    const row = DCT_TABLE.find(([min, max]) => size > min && size <= max);
    if (!row) { setDctGrade('超出范围'); return; }
    const grades = row[2] as number[];
    let foundGrade = 12;
    for (let i = 0; i < grades.length; i++) {
      if (grades[i] !== -1 && tol <= grades[i]) { foundGrade = i + 1; break; }
    }
    setDctGrade(`DCTG ${foundGrade}`);
  }, [nominalSize, toleranceVal, dctIsMetric]);

  useEffect(() => {
    let size = parseFloat(itNominalSize);
    let tol = parseFloat(itToleranceVal);
    if (isNaN(size) || isNaN(tol)) { setItGrade(null); return; }
    if (!itIsMetric) { size *= 25.4; tol *= 25.4; }
    const row = IT_TABLE.find(([min, max]) => size > min && size <= max);
    if (!row) { setItGrade('超出范围'); return; }
    const grades = row[2] as number[];
    let foundIdx = -1;
    for (let i = 0; i < grades.length; i++) {
      if (tol <= grades[i]) { foundIdx = i; break; }
    }
    setItGrade(foundIdx === -1 ? '超公差' : `IT${foundIdx + 5}`);
  }, [itNominalSize, itToleranceVal, itIsMetric]);

  useEffect(() => {
    const batch = parseInt(batchSize);
    if (isNaN(batch) || batch < 2) { setSamplingResult(null); return; }
    const row = AQL_TABLE.find(([min, max]) => batch >= min && batch <= max);
    if (!row) { setSamplingResult(null); return; }
    const aqlIdx = AQL_LEVELS.indexOf(selectedAql);
    const ac = row[3][aqlIdx];
    setSamplingResult({ n: row[2], ac: ac, re: ac + 1 });
  }, [batchSize, selectedAql]);

  const toggle = (section: CalcSection) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  return (
    <div className="p-4 space-y-3 pb-24">
      {/* AQL sampling */}
      <div className={`bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden transition-all ${expandedSection === 'AQL' ? 'border-emerald-200' : ''}`}>
        <button onClick={() => toggle('AQL')} className="w-full p-4 flex items-center justify-between text-left active:bg-slate-50">
          <div className="flex items-center gap-3">
            <ClipboardList className={`transition-colors ${expandedSection === 'AQL' ? 'text-emerald-500' : 'text-slate-400'}`} size={20} />
            <span style={{ fontSize: '0.85rem' }} className="font-bold text-slate-700">AQL 抽样方案查询</span>
          </div>
          {expandedSection === 'AQL' ? <ChevronDown size={18} className="text-slate-400" /> : <ChevronRight size={18} className="text-slate-300" />}
        </button>
        {expandedSection === 'AQL' && (
          <div className="p-5 pt-0 animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="space-y-1">
                <label style={{ fontSize: '0.7rem' }} className="font-bold text-slate-400 uppercase tracking-widest">批量 (Batch Size)</label>
                <input type="number" value={batchSize} onChange={(e) => setBatchSize(e.target.value)} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold outline-none" style={{ fontSize: '1.1rem' }} placeholder="如: 100" />
              </div>
              <div className="space-y-1">
                <label style={{ fontSize: '0.7rem' }} className="font-bold text-slate-400 uppercase tracking-widest">AQL 水平</label>
                <select value={selectedAql} onChange={(e) => setSelectedAql(parseFloat(e.target.value))} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold outline-none appearance-none" style={{ fontSize: '1.1rem' }}>
                  {AQL_LEVELS.map(level => <option key={level} value={level}>{level}</option>)}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex flex-col items-center">
                <span style={{ fontSize: '0.65rem' }} className="font-bold text-slate-400 uppercase tracking-widest mb-1">样本量 n</span>
                <span style={{ fontSize: '1.1rem' }} className="font-black text-slate-700">{samplingResult?.n ?? '--'}</span>
              </div>
              <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-100 flex flex-col items-center">
                <span style={{ fontSize: '0.65rem' }} className="font-bold text-emerald-600 uppercase tracking-widest mb-1">接收 Ac</span>
                <span style={{ fontSize: '1.1rem' }} className="font-black text-emerald-700">{samplingResult?.ac ?? '--'}</span>
              </div>
              <div className="bg-red-50 p-3 rounded-xl border border-red-100 flex flex-col items-center">
                <span style={{ fontSize: '0.65rem' }} className="font-bold text-red-600 uppercase tracking-widest mb-1">拒绝 Re</span>
                <span style={{ fontSize: '1.1rem' }} className="font-black text-red-700">{samplingResult?.re ?? '--'}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* DCT Grade */}
      <div className={`bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden transition-all ${expandedSection === 'DCT' ? 'border-blue-200' : ''}`}>
        <button onClick={() => toggle('DCT')} className="w-full p-4 flex items-center justify-between text-left active:bg-slate-50">
          <div className="flex items-center gap-3">
            <Box className={`transition-colors ${expandedSection === 'DCT' ? 'text-blue-500' : 'text-slate-400'}`} size={20} />
            <span style={{ fontSize: '0.85rem' }} className="font-bold text-slate-700">DCT 等级自动判定</span>
          </div>
          {expandedSection === 'DCT' ? <ChevronDown size={18} className="text-slate-400" /> : <ChevronRight size={18} className="text-slate-300" />}
        </button>
        {expandedSection === 'DCT' && (
          <div className="p-5 pt-0 animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="flex justify-end mb-3">
              <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200">
                <button onClick={() => setDctIsMetric(true)} className={`px-3 py-1 font-bold rounded-md transition-all ${dctIsMetric ? 'bg-white shadow-sm text-blue-600' : 'text-slate-400'}`} style={{ fontSize: '0.7rem' }}>公制</button>
                <button onClick={() => setDctIsMetric(false)} className={`px-3 py-1 font-bold rounded-md transition-all ${!dctIsMetric ? 'bg-white shadow-sm text-blue-600' : 'text-slate-400'}`} style={{ fontSize: '0.7rem' }}>英制</button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="space-y-1">
                <label style={{ fontSize: '0.7rem' }} className="font-bold text-slate-400 uppercase tracking-widest">额定尺寸 ({dctIsMetric ? 'mm' : 'in'})</label>
                <input type="number" value={nominalSize} onChange={(e) => setNominalSize(e.target.value)} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold outline-none" style={{ fontSize: '1.1rem' }} placeholder="0.0" />
              </div>
              <div className="space-y-1">
                <label style={{ fontSize: '0.7rem' }} className="font-bold text-slate-400 uppercase tracking-widest">公差 ({dctIsMetric ? 'mm' : 'in'})</label>
                <input type="number" value={toleranceVal} onChange={(e) => setToleranceVal(e.target.value)} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold outline-none" style={{ fontSize: '1.1rem' }} placeholder="0.00" />
              </div>
            </div>
            <div className="bg-blue-600 p-4 rounded-xl flex items-center justify-between text-white shadow-md">
              <span style={{ fontSize: '0.7rem' }} className="font-bold uppercase tracking-widest opacity-80">判定等级结果</span>
              <span style={{ fontSize: '1.25rem' }} className="font-black">{dctGrade ?? '--'}</span>
            </div>
          </div>
        )}
      </div>

      {/* IT Grade */}
      <div className={`bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden transition-all ${expandedSection === 'IT' ? 'border-indigo-200' : ''}`}>
        <button onClick={() => toggle('IT')} className="w-full p-4 flex items-center justify-between text-left active:bg-slate-50">
          <div className="flex items-center gap-3">
            <Ruler className={`transition-colors ${expandedSection === 'IT' ? 'text-indigo-500' : 'text-slate-400'}`} size={20} />
            <span style={{ fontSize: '0.85rem' }} className="font-bold text-slate-700">IT 等级判定 (精度)</span>
          </div>
          {expandedSection === 'IT' ? <ChevronDown size={18} className="text-slate-400" /> : <ChevronRight size={18} className="text-slate-300" />}
        </button>
        {expandedSection === 'IT' && (
          <div className="p-5 pt-0 animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="flex justify-end mb-3">
              <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200">
                <button onClick={() => setItIsMetric(true)} className={`px-3 py-1 font-bold rounded-md transition-all ${itIsMetric ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-400'}`} style={{ fontSize: '0.7rem' }}>公制</button>
                <button onClick={() => setItIsMetric(false)} className={`px-3 py-1 font-bold rounded-md transition-all ${!itIsMetric ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-400'}`} style={{ fontSize: '0.7rem' }}>英制</button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="space-y-1">
                <label style={{ fontSize: '0.7rem' }} className="font-bold text-slate-400 uppercase tracking-widest">额定尺寸 ({itIsMetric ? 'mm' : 'in'})</label>
                <input type="number" value={itNominalSize} onChange={(e) => setItNominalSize(e.target.value)} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold outline-none" style={{ fontSize: '1.1rem' }} placeholder="0.0" />
              </div>
              <div className="space-y-1">
                <label style={{ fontSize: '0.7rem' }} className="font-bold text-slate-400 uppercase tracking-widest">公差 ({itIsMetric ? 'mm' : 'in'})</label>
                <input type="number" value={itToleranceVal} onChange={(e) => setItToleranceVal(e.target.value)} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold outline-none" style={{ fontSize: '1.1rem' }} placeholder="0.00" />
              </div>
            </div>
            <div className="bg-indigo-600 p-4 rounded-xl flex items-center justify-between text-white shadow-md">
              <span style={{ fontSize: '0.7rem' }} className="font-bold uppercase tracking-widest opacity-80">IT 判定结果</span>
              <span style={{ fontSize: '1.25rem' }} className="font-black">{itGrade ?? '--'}</span>
            </div>
          </div>
        )}
      </div>

      {/* Dim Conversion */}
      <div className={`bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden transition-all ${expandedSection === 'DIM' ? 'border-blue-200' : ''}`}>
        <button onClick={() => toggle('DIM')} className="w-full p-4 flex items-center justify-between text-left active:bg-slate-50">
          <div className="flex items-center gap-3">
            <ArrowRightLeft className={`transition-colors ${expandedSection === 'DIM' ? 'text-blue-500' : 'text-slate-400'}`} size={20} />
            <span style={{ fontSize: '0.85rem' }} className="font-bold text-slate-700">尺寸互换 (in/mm)</span>
          </div>
          {expandedSection === 'DIM' ? <ChevronDown size={18} className="text-slate-400" /> : <ChevronRight size={18} className="text-slate-300" />}
        </button>
        {expandedSection === 'DIM' && (
          <div className="p-5 pt-0 animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="bg-slate-50 p-2 rounded-lg text-slate-500 mb-4 text-center border border-slate-100" style={{ fontSize: '0.7rem' }}>1 inch = 25.4 mm</div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label style={{ fontSize: '0.7rem' }} className="font-bold text-slate-400 uppercase tracking-widest">英寸 (in)</label>
                <input type="number" value={inch} onChange={(e) => handleInchChange(e.target.value)} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold outline-none" style={{ fontSize: '1.1rem' }} placeholder="0.00" />
              </div>
              <div className="space-y-1">
                <label style={{ fontSize: '0.7rem' }} className="font-bold text-slate-400 uppercase tracking-widest">毫米 (mm)</label>
                <input type="number" value={mm} onChange={(e) => handleMmChange(e.target.value)} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold outline-none" style={{ fontSize: '1.1rem' }} placeholder="0.00" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Weight Conversion */}
      <div className={`bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden transition-all ${expandedSection === 'WGT' ? 'border-orange-200' : ''}`}>
        <button onClick={() => toggle('WGT')} className="w-full p-4 flex items-center justify-between text-left active:bg-slate-50">
          <div className="flex items-center gap-3">
            <Weight className={`transition-colors ${expandedSection === 'WGT' ? 'text-orange-500' : 'text-slate-400'}`} size={20} />
            <span style={{ fontSize: '0.85rem' }} className="font-bold text-slate-700">重量互换 (kg/lb)</span>
          </div>
          {expandedSection === 'WGT' ? <ChevronDown size={18} className="text-slate-400" /> : <ChevronRight size={18} className="text-slate-300" />}
        </button>
        {expandedSection === 'WGT' && (
          <div className="p-5 pt-0 animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="bg-slate-50 p-2 rounded-lg text-slate-500 mb-4 text-center border border-slate-100" style={{ fontSize: '0.7rem' }}>1 kg ≈ 2.2046 lb</div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label style={{ fontSize: '0.7rem' }} className="font-bold text-slate-400 uppercase tracking-widest">千克 (kg)</label>
                <input type="number" value={kg} onChange={(e) => handleKgChange(e.target.value)} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold outline-none" style={{ fontSize: '1.1rem' }} placeholder="0.0" />
              </div>
              <div className="space-y-1">
                <label style={{ fontSize: '0.7rem' }} className="font-bold text-slate-400 uppercase tracking-widest">磅 (lb)</label>
                <input type="number" value={lb} onChange={(e) => handleLbChange(e.target.value)} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold outline-none" style={{ fontSize: '1.1rem' }} placeholder="0.0" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Dew Point */}
      <div className={`bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden transition-all ${expandedSection === 'DEW' ? 'border-blue-200' : ''}`}>
        <button onClick={() => toggle('DEW')} className="w-full p-4 flex items-center justify-between text-left active:bg-slate-50">
          <div className="flex items-center gap-3">
            <Droplets className={`transition-colors ${expandedSection === 'DEW' ? 'text-blue-400' : 'text-slate-400'}`} size={20} />
            <span style={{ fontSize: '0.85rem' }} className="font-bold text-slate-700">露点计算 (Dew Point)</span>
          </div>
          {expandedSection === 'DEW' ? <ChevronDown size={18} className="text-slate-400" /> : <ChevronRight size={18} className="text-slate-300" />}
        </button>
        {expandedSection === 'DEW' && (
          <div className="p-5 pt-0 animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="mb-4 bg-slate-50 p-3 rounded-xl border border-slate-100">
              <code style={{ fontSize: '0.65rem' }} className="text-slate-600 block leading-relaxed">α = ln(RH/100) + 17.27T / (237.7 + T) <br/> Td = 237.7α / (17.27 - α)</code>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="space-y-1">
                <label style={{ fontSize: '0.7rem' }} className="font-bold text-slate-400 uppercase tracking-widest">温度 (°C)</label>
                <input type="number" value={temp} onChange={(e) => setTemp(e.target.value)} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold outline-none" style={{ fontSize: '1.1rem' }} />
              </div>
              <div className="space-y-1">
                <label style={{ fontSize: '0.7rem' }} className="font-bold text-slate-400 uppercase tracking-widest">湿度 (%)</label>
                <input type="number" value={humidity} onChange={(e) => setHumidity(e.target.value)} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold outline-none" style={{ fontSize: '1.1rem' }} />
              </div>
            </div>
            <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex items-center justify-between text-blue-700">
              <span style={{ fontSize: '0.7rem' }} className="font-bold uppercase tracking-widest opacity-80">结果露点</span>
              <span style={{ fontSize: '1.25rem' }} className="font-black">{dewPoint ?? '--'} <span style={{ fontSize: '0.85rem' }}>°C</span></span>
            </div>
          </div>
        )}
      </div>

      {/* Pressure */}
      <div className={`bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden transition-all ${expandedSection === 'PRS' ? 'border-indigo-200' : ''}`}>
        <button onClick={() => toggle('PRS')} className="w-full p-4 flex items-center justify-between text-left active:bg-slate-50">
          <div className="flex items-center gap-3">
            <Gauge className={`transition-colors ${expandedSection === 'PRS' ? 'text-indigo-500' : 'text-slate-400'}`} size={20} />
            <span style={{ fontSize: '0.85rem' }} className="font-bold text-slate-700">压力互换 (PSI/MPa)</span>
          </div>
          {expandedSection === 'PRS' ? <ChevronDown size={18} className="text-slate-400" /> : <ChevronRight size={18} className="text-slate-300" />}
        </button>
        {expandedSection === 'PRS' && (
          <div className="p-5 pt-0 animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="bg-slate-50 p-2 rounded-lg text-slate-500 mb-4 text-center border border-slate-100" style={{ fontSize: '0.7rem' }}>1 PSI ≈ 0.00689 MPa</div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label style={{ fontSize: '0.7rem' }} className="font-bold text-slate-400 uppercase tracking-widest">PSI</label>
                <input type="number" value={psi} onChange={(e) => handlePsiChange(e.target.value)} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold outline-none" style={{ fontSize: '1.1rem' }} placeholder="0" />
              </div>
              <div className="space-y-1">
                <label style={{ fontSize: '0.7rem' }} className="font-bold text-slate-400 uppercase tracking-widest">MPa</label>
                <input type="number" value={mpa} onChange={(e) => handleMpaChange(e.target.value)} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold outline-none" style={{ fontSize: '1.1rem' }} placeholder="0.00" />
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="text-center pb-8 opacity-40">
        <p style={{ fontSize: '0.7rem' }} className="text-slate-500 italic">所有计算结果基于行业标准，仅供工程参考</p>
      </div>
    </div>
  );
};

export default B2_Calculators;

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Zap, 
  TrendingUp, 
  Users, 
  Clock, 
  AlertTriangle, 
  Play, 
  RefreshCw,
  BarChart3,
  PieChart as PieChartIcon,
  Target,
  ShieldCheck
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
  Cell,
  PieChart,
  Pie
} from 'recharts';
import { cn } from '../lib/utils';

interface SimulationParams {
  staffCount: number;
  avgEfficiency: number;
  taskComplexity: number;
  expectedVolume: number;
}

export default function SimulationModule() {
  const [params, setParams] = useState<SimulationParams>({
    staffCount: 45,
    avgEfficiency: 85,
    taskComplexity: 60,
    expectedVolume: 1200
  });

  const [isSimulating, setIsSimulating] = useState(false);
  const [results, setResults] = useState<any>(null);

  const runSimulation = () => {
    setIsSimulating(true);
    // Simulate processing time
    setTimeout(() => {
      const throughput = Math.floor((params.staffCount * (params.avgEfficiency / 100) * 8) / (params.taskComplexity / 20));
      const backlog = Math.max(0, params.expectedVolume - throughput);
      const riskScore = Math.min(100, (params.taskComplexity * 0.6) + (backlog / params.expectedVolume * 40));
      const costPerTask = (params.staffCount * 2500) / throughput;

      const data = [
        { name: 'Mon', throughput: throughput * 0.9, backlog: backlog * 0.2 },
        { name: 'Tue', throughput: throughput * 1.1, backlog: backlog * 0.15 },
        { name: 'Wed', throughput: throughput * 1.0, backlog: backlog * 0.25 },
        { name: 'Thu', throughput: throughput * 0.95, backlog: backlog * 0.3 },
        { name: 'Fri', throughput: throughput * 1.2, backlog: backlog * 0.1 },
      ];

      const pieData = [
        { name: 'Completed', value: throughput, color: '#9333ea' },
        { name: 'Backlog', value: backlog, color: '#f43f5e' },
      ];

      setResults({
        throughput,
        backlog,
        riskScore,
        costPerTask,
        chartData: data,
        pieData
      });
      setIsSimulating(false);
    }, 1500);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Parameters Panel */}
        <div className="lg:col-span-1 bg-white rounded-3xl p-6 border border-neutral-200 shadow-sm space-y-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center">
              <RefreshCw size={20} className={cn(isSimulating && "animate-spin")} />
            </div>
            <div>
              <h3 className="font-bold text-neutral-800">Simulation Config</h3>
              <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest">Adjust Business Variables</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <label className="text-xs font-black text-neutral-500 uppercase tracking-wider">Staff Count</label>
                <span className="text-xs font-black text-purple-600">{params.staffCount}</span>
              </div>
              <input 
                type="range" min="10" max="100" 
                value={params.staffCount}
                onChange={(e) => setParams({...params, staffCount: parseInt(e.target.value)})}
                className="w-full h-1.5 bg-neutral-100 rounded-lg appearance-none cursor-pointer accent-purple-600"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <label className="text-xs font-black text-neutral-500 uppercase tracking-wider">Efficiency (%)</label>
                <span className="text-xs font-black text-emerald-600">{params.avgEfficiency}%</span>
              </div>
              <input 
                type="range" min="50" max="100" 
                value={params.avgEfficiency}
                onChange={(e) => setParams({...params, avgEfficiency: parseInt(e.target.value)})}
                className="w-full h-1.5 bg-neutral-100 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <label className="text-xs font-black text-neutral-500 uppercase tracking-wider">Complexity</label>
                <span className="text-xs font-black text-amber-600">{params.taskComplexity}</span>
              </div>
              <input 
                type="range" min="10" max="100" 
                value={params.taskComplexity}
                onChange={(e) => setParams({...params, taskComplexity: parseInt(e.target.value)})}
                className="w-full h-1.5 bg-neutral-100 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <label className="text-xs font-black text-neutral-500 uppercase tracking-wider">Target Volume</label>
                <span className="text-xs font-black text-blue-600">{params.expectedVolume}</span>
              </div>
              <input 
                type="range" min="500" max="5000" step="100"
                value={params.expectedVolume}
                onChange={(e) => setParams({...params, expectedVolume: parseInt(e.target.value)})}
                className="w-full h-1.5 bg-neutral-100 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
            </div>
          </div>

          <button 
            onClick={runSimulation}
            disabled={isSimulating}
            className={cn(
              "w-full py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all flex items-center justify-center gap-3 shadow-lg shadow-purple-900/20",
              isSimulating ? "bg-neutral-100 text-neutral-400" : "bg-purple-600 text-white hover:bg-purple-700 active:scale-95"
            )}
          >
            {isSimulating ? (
              <>
                <RefreshCw size={18} className="animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Play size={18} fill="currentColor" />
                Run Simulation
              </>
            )}
          </button>
        </div>

        {/* Results Panel */}
        <div className="lg:col-span-2 space-y-6">
          <AnimatePresence mode="wait">
            {!results ? (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-full min-h-[400px] bg-neutral-50 rounded-3xl border-2 border-dashed border-neutral-200 flex flex-col items-center justify-center text-center p-12"
              >
                <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-sm mb-6">
                  <TrendingUp size={32} className="text-neutral-300" />
                </div>
                <h4 className="text-lg font-bold text-neutral-400">Ready for Simulation</h4>
                <p className="text-sm text-neutral-400 max-w-xs mt-2">Adjust the parameters on the left and run the model to see projected business outcomes.</p>
              </motion.div>
            ) : (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-white p-4 rounded-3xl border border-neutral-100 shadow-sm">
                    <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-1">Throughput</p>
                    <p className="text-2xl font-black text-purple-600">{results.throughput}</p>
                    <p className="text-[9px] text-neutral-400 font-bold mt-1">Tasks / Day</p>
                  </div>
                  <div className="bg-white p-4 rounded-3xl border border-neutral-100 shadow-sm">
                    <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-1">Backlog</p>
                    <p className="text-2xl font-black text-rose-500">{results.backlog}</p>
                    <p className="text-[9px] text-neutral-400 font-bold mt-1">Pending Items</p>
                  </div>
                  <div className="bg-white p-4 rounded-3xl border border-neutral-100 shadow-sm">
                    <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-1">Risk Score</p>
                    <p className={cn(
                      "text-2xl font-black",
                      results.riskScore > 70 ? "text-rose-500" : results.riskScore > 40 ? "text-amber-500" : "text-emerald-500"
                    )}>{Math.round(results.riskScore)}%</p>
                    <p className="text-[9px] text-neutral-400 font-bold mt-1">System Stability</p>
                  </div>
                  <div className="bg-white p-4 rounded-3xl border border-neutral-100 shadow-sm">
                    <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-1">Unit Cost</p>
                    <p className="text-2xl font-black text-blue-600">₹{Math.round(results.costPerTask)}</p>
                    <p className="text-[9px] text-neutral-400 font-bold mt-1">Per Task Processed</p>
                  </div>
                </div>

                {/* Charts */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white p-6 rounded-3xl border border-neutral-200 shadow-sm h-[300px]">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-xs font-black text-neutral-800 uppercase tracking-widest">Weekly Projection</h4>
                      <BarChart3 size={16} className="text-neutral-400" />
                    </div>
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={results.chartData}>
                        <defs>
                          <linearGradient id="colorThroughput" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#9333ea" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#9333ea" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 700}} />
                        <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 700}} />
                        <Tooltip 
                          contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                        />
                        <Area type="monotone" dataKey="throughput" stroke="#9333ea" fillOpacity={1} fill="url(#colorThroughput)" strokeWidth={3} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="bg-white p-6 rounded-3xl border border-neutral-200 shadow-sm h-[300px]">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-xs font-black text-neutral-800 uppercase tracking-widest">Volume Distribution</h4>
                      <PieChartIcon size={16} className="text-neutral-400" />
                    </div>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={results.pieData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {results.pieData.map((entry: any, index: number) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Insights */}
                <div className="bg-neutral-900 rounded-3xl p-6 text-white relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-8 opacity-10">
                    <Zap size={120} />
                  </div>
                  <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-4">
                      <ShieldCheck className="text-emerald-400" size={20} />
                      <h4 className="font-bold">Simulation Insights</h4>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <p className="text-xs text-neutral-400 font-bold uppercase tracking-widest">Efficiency Analysis</p>
                        <p className="text-sm text-neutral-200 leading-relaxed">
                          {results.backlog > 0 
                            ? `Current staffing levels are insufficient for the target volume. Expect a backlog of ${results.backlog} units by EOD.`
                            : "System is operating at optimal capacity. All target volumes will be met with current parameters."}
                        </p>
                      </div>
                      <div className="space-y-2">
                        <p className="text-xs text-neutral-400 font-bold uppercase tracking-widest">Risk Mitigation</p>
                        <p className="text-sm text-neutral-200 leading-relaxed">
                          {results.riskScore > 60 
                            ? "High complexity combined with volume targets is stressing the process. Consider temporary staffing or process simplification."
                            : "Risk levels are within acceptable bounds. Process stability is high."}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

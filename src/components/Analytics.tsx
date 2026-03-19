import React from 'react';
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
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { TrendingUp, Users, CheckCircle, Clock } from 'lucide-react';

const productivityData = [
  { name: 'Mon', completed: 45, target: 40 },
  { name: 'Tue', completed: 52, target: 40 },
  { name: 'Wed', completed: 38, target: 40 },
  { name: 'Thu', completed: 65, target: 40 },
  { name: 'Fri', completed: 48, target: 40 },
  { name: 'Sat', completed: 30, target: 30 },
  { name: 'Sun', completed: 0, target: 0 },
];

const departmentData = [
  { name: 'Customer Support', value: 400 },
  { name: 'Sales MIS', value: 300 },
  { name: 'Operations MIS', value: 300 },
  { name: 'Client Data', value: 200 },
];

const COLORS = ['#8b5cf6', '#6366f1', '#a855f7', '#d946ef'];

export default function Analytics() {
  return (
    <div className="space-y-8">
      {/* Stats Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {[
          { label: 'Tasks Completed', value: '142', change: '+12%', icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Avg. Productivity', value: '94%', change: '+5%', icon: TrendingUp, color: 'text-purple-600', bg: 'bg-purple-50' },
          { label: 'Active Employees', value: '24', change: 'Live', icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Avg. Work Hours', value: '6.8h', change: '-2%', icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-4 md:p-6 rounded-2xl md:rounded-3xl border border-neutral-200 shadow-sm">
            <div className="flex items-center justify-between mb-3 md:mb-4">
              <div className={`w-10 h-10 md:w-12 md:h-12 ${stat.bg} ${stat.color} rounded-xl md:rounded-2xl flex items-center justify-center`}>
                <stat.icon size={20} className="md:w-6 md:h-6" />
              </div>
              <span className={`text-[9px] md:text-xs font-bold px-2 py-1 rounded-full ${stat.change === 'Live' ? 'bg-blue-100 text-blue-600' : 'bg-emerald-100 text-emerald-600'}`}>
                {stat.change}
              </span>
            </div>
            <p className="text-neutral-500 text-[10px] md:text-sm font-medium">{stat.label}</p>
            <h3 className="text-lg md:text-2xl font-bold text-neutral-800 mt-1">{stat.value}</h3>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Productivity Chart */}
        <div className="bg-white p-4 md:p-8 rounded-2xl md:rounded-3xl border border-neutral-200 shadow-sm">
          <div className="flex items-center justify-between mb-6 md:mb-8">
            <h3 className="font-bold text-neutral-800 text-base md:text-lg">Weekly Productivity</h3>
            <select className="bg-neutral-50 border-none rounded-xl text-[10px] md:text-xs font-bold text-neutral-500 px-2 md:px-3 py-1.5 md:py-2 outline-none">
              <option>Last 7 Days</option>
              <option>Last 30 Days</option>
            </select>
          </div>
          <div className="h-64 md:h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={productivityData}>
                <defs>
                  <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="completed" stroke="#8b5cf6" strokeWidth={2} fillOpacity={1} fill="url(#colorCompleted)" />
                <Line type="monotone" dataKey="target" stroke="#cbd5e1" strokeDasharray="5 5" strokeWidth={1} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Department Distribution */}
        <div className="bg-white p-4 md:p-8 rounded-2xl md:rounded-3xl border border-neutral-200 shadow-sm relative">
          <h3 className="font-bold text-neutral-800 text-base md:text-lg mb-6 md:mb-8">Department Workload</h3>
          <div className="h-64 md:h-80 w-full flex items-center justify-center relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={departmentData}
                  cx="50%"
                  cy="50%"
                  innerRadius={window.innerWidth < 768 ? 60 : 80}
                  outerRadius={window.innerWidth < 768 ? 90 : 120}
                  paddingAngle={8}
                  dataKey="value"
                >
                  {departmentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute flex flex-col items-center">
              <span className="text-xl md:text-3xl font-bold text-neutral-800">1.2K</span>
              <span className="text-[8px] md:text-[10px] uppercase tracking-widest text-neutral-400 font-bold">Total Records</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 md:gap-4 mt-4">
            {departmentData.map((dept, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full" style={{ backgroundColor: COLORS[i] }} />
                <span className="text-[10px] md:text-xs text-neutral-500 font-medium truncate">{dept.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

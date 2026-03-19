import React from 'react';
import { motion } from 'motion/react';
import { 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  ShieldCheck, 
  Zap, 
  CheckCircle, 
  ArrowRight,
  MessageSquare,
  FileSpreadsheet
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Task } from '../types';
import { cn } from '../lib/utils';

interface TaskPanelProps {
  tasks: Task[];
  onUpdateStatus?: (taskId: string, status: 'Pending' | 'In Progress' | 'Completed') => void;
  onViewAll?: () => void;
}

export default function TaskPanel({ tasks, onUpdateStatus, onViewAll }: TaskPanelProps) {
  const getDeptIcon = (dept: string) => {
    switch (dept) {
      case 'Customer Support': return <MessageSquare size={14} className="text-blue-500" />;
      case 'Sales MIS': return <Zap size={14} className="text-amber-500" />;
      case 'Operations MIS': return <Clock size={14} className="text-purple-500" />;
      case 'Client Data MIS': return <FileSpreadsheet size={14} className="text-emerald-500" />;
      default: return <AlertCircle size={14} className="text-neutral-400" />;
    }
  };

  const handleStatusChange = (taskId: string, status: 'Pending' | 'In Progress' | 'Completed') => {
    if (onUpdateStatus) {
      onUpdateStatus(taskId, status);
      if (status === 'Completed') {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#9333ea', '#10b981', '#6366f1']
        });
      }
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-4 md:p-5 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="font-bold text-neutral-800">Assigned Tasks</h3>
          <div className="flex items-center gap-1 px-1.5 py-0.5 bg-emerald-50 text-emerald-600 rounded-md border border-emerald-100">
            <ShieldCheck size={10} />
            <span className="text-[8px] font-bold uppercase tracking-wider">Verified</span>
          </div>
          <div className="flex items-center gap-1 px-1.5 py-0.5 bg-blue-50 text-blue-600 rounded-md border border-blue-100">
            <ShieldCheck size={10} />
            <span className="text-[8px] font-bold uppercase tracking-wider">Trustable</span>
          </div>
        </div>
        <span className="self-start sm:self-auto text-[10px] font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full uppercase tracking-wider">
          {tasks.length} Active
        </span>
      </div>

      <div className="space-y-4">
        {tasks.map((task) => (
          <motion.div 
            key={task.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -2, scale: 1.01 }}
            className={cn(
              "p-4 rounded-xl border transition-all group relative overflow-hidden",
              task.status === 'Completed' 
                ? "bg-emerald-50/30 border-emerald-100" 
                : "bg-neutral-50/50 border-neutral-100 hover:border-purple-200 hover:shadow-md"
            )}
          >
            {/* Lively Background Accent */}
            <div className={cn(
              "absolute top-0 right-0 w-24 h-24 blur-3xl -mr-12 -mt-12 rounded-full transition-colors",
              task.status === 'Completed' ? "bg-emerald-500/10" : "bg-purple-500/5 group-hover:bg-purple-500/10"
            )} />
            
            <div className="flex items-start justify-between mb-3 md:mb-2 relative z-10">
              <div className="flex-1 mr-2">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <div className="p-1 bg-white rounded-md border border-neutral-100 shadow-sm shrink-0">
                    {getDeptIcon(task.department)}
                  </div>
                  <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">{task.id}</p>
                  {task.status === 'Completed' && (
                    <motion.div 
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="flex items-center gap-1 px-1 py-0.5 bg-emerald-500 text-white rounded text-[8px] font-black uppercase"
                    >
                      <Zap size={8} />
                      Done
                    </motion.div>
                  )}
                </div>
                <h4 className={cn(
                  "font-bold transition-colors text-sm md:text-base",
                  task.status === 'Completed' ? "text-emerald-700" : "text-neutral-800 group-hover:text-purple-700"
                )}>{task.client}</h4>
              </div>
              
              <div className="flex items-center gap-2 shrink-0">
                <select 
                  value={task.status}
                  onChange={(e) => handleStatusChange(task.id, e.target.value as any)}
                  className={cn(
                    "text-[10px] font-bold px-1.5 md:px-2 py-1 rounded-lg border outline-none cursor-pointer transition-all",
                    task.status === 'Completed' 
                      ? "bg-emerald-100 border-emerald-200 text-emerald-700" 
                      : task.status === 'In Progress'
                      ? "bg-amber-100 border-amber-200 text-amber-700"
                      : "bg-neutral-100 border-neutral-200 text-neutral-600"
                  )}
                >
                  <option value="Pending">Pending</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                </select>
                
                {task.status === 'Completed' ? (
                  <CheckCircle2 size={16} className="text-emerald-500 md:w-[18px] md:h-[18px]" />
                ) : task.status === 'In Progress' ? (
                  <Clock size={16} className="text-amber-500 animate-pulse md:w-[18px] md:h-[18px]" />
                ) : (
                  <AlertCircle size={16} className="text-neutral-300 md:w-[18px] md:h-[18px]" />
                )}
              </div>
            </div>

            <p className="text-xs text-neutral-500 mb-3 relative z-10 flex items-center gap-1.5">
              <span className="w-1 h-1 rounded-full bg-neutral-300" />
              {task.type}
            </p>

            <div className="space-y-1.5 relative z-10">
              <div className="flex justify-between text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                <span className="flex items-center gap-1">
                  Progress
                  {task.records_completed > 0 && task.status !== 'Completed' && <span className="w-1 h-1 rounded-full bg-emerald-400 animate-ping" />}
                </span>
                <span className={cn(
                  task.status === 'Completed' ? "text-emerald-600" : "text-purple-600"
                )}>
                  {Math.round((task.records_completed / task.records_required) * 100)}%
                </span>
              </div>
              <div className="h-1.5 bg-neutral-100 rounded-full overflow-hidden relative">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${(task.records_completed / task.records_required) * 100}%` }}
                  transition={{ duration: 1.2, ease: "circOut" }}
                  className={cn(
                    "h-full rounded-full relative z-10",
                    task.status === 'Completed' ? "bg-emerald-500" : "bg-gradient-to-r from-purple-600 to-indigo-600"
                  )}
                >
                  {task.status === 'In Progress' && (
                    <motion.div 
                      animate={{ 
                        x: ['-100%', '200%'],
                      }}
                      transition={{ 
                        duration: 2, 
                        repeat: Infinity, 
                        ease: "linear" 
                      }}
                      className="absolute inset-0 w-1/2 bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-[-20deg]"
                    />
                  )}
                </motion.div>
                
                {/* Subtle track pulse for in-progress tasks */}
                {task.status === 'In Progress' && (
                  <motion.div 
                    animate={{ opacity: [0.3, 0.6, 0.3] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute inset-0 bg-purple-100"
                  />
                )}
              </div>
              <div className="flex justify-between text-[10px] text-neutral-500 font-medium">
                <span className="flex items-center gap-1">
                  <CheckCircle size={10} className={cn(task.status === 'Completed' ? "text-emerald-500" : "text-neutral-400")} />
                  {task.records_completed} Records
                </span>
                <span>Target: {task.records_required}</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <button 
        onClick={onViewAll}
        className="w-full py-2.5 text-xs font-bold text-neutral-400 hover:text-purple-600 transition-colors border-t border-neutral-100 mt-2 flex items-center justify-center gap-2 cursor-pointer"
      >
        View All Tasks
        <ArrowRight size={12} />
      </button>
    </div>
  );
}

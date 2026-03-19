import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  FileText, 
  Upload, 
  Download, 
  Users, 
  Zap, 
  ArrowUpRight,
  PlusCircle,
  FileSpreadsheet,
  Lightbulb,
  Quote,
  Loader2
} from 'lucide-react';
import TaskPanel from './TaskPanel';
import ActivityFeed from './ActivityFeed';
import CompanyLife from './CompanyLife';
import { MOCK_TASKS } from '../constants';
import { User } from '../types';
import { generateDailyContent, DailyInsight } from '../services/geminiService';

interface DashboardHomeProps {
  user: User;
  onNewEntry: () => void;
  onViewTasks: () => void;
}

export default function DashboardHome({ user, onNewEntry, onViewTasks }: DashboardHomeProps) {
  const [insight, setInsight] = useState<DailyInsight | null>(null);
  const [loadingInsight, setLoadingInsight] = useState(true);

  useEffect(() => {
    const fetchInsight = async () => {
      try {
        const today = new Date().toISOString().split('T')[0];
        
        // Try to get existing content first
        const existingRes = await fetch(`/api/daily-content?date=${today}`);
        let content;
        
        if (existingRes.ok) {
          content = await existingRes.json();
        } else {
          // Generate new content if not exists
          try {
            const namesRes = await fetch('/api/users/names');
            const names = await namesRes.json();
            content = await generateDailyContent(today, names);
            
            // Save it for others
            await fetch('/api/daily-content', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ date: today, content })
            });
          } catch (genError) {
            console.warn("Failed to generate content, using dummy content", genError);
            content = {
              insight: {
                quote: "The only way to do great work is to love what you do.",
                author: "Steve Jobs",
                tip: "Focus on one task at a time to increase your productivity by up to 40%."
              }
            };
          }
        }
        
        setInsight(content.insight);
      } catch (error) {
        console.error("Error fetching insight:", error);
        // Final fallback
        setInsight({
          quote: "Success is not final, failure is not fatal: it is the courage to continue that counts.",
          author: "Winston Churchill",
          tip: "Take a 5-minute break every hour to maintain high levels of concentration."
        });
      } finally {
        setLoadingInsight(false);
      }
    };
    fetchInsight();
  }, []);

  const downloadReport = () => {
    const reportData = [
      ["Date", "Client", "Tasks Completed", "Hours Worked", "Productivity"],
      ["2026-03-08", "Amazon", "45", "7h 00m", "112%"],
      ["2026-03-08", "Flipkart", "32", "6h 45m", "98%"],
      ["2026-03-07", "Zomato", "51", "7h 00m", "125%"],
    ];

    const csvContent = "data:text/csv;charset=utf-8," 
      + reportData.map(e => e.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Technotask_MIS_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-6"
      >
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-neutral-800">Welcome back, {user.name.split(' ')[0]}!</h1>
          <p className="text-neutral-500 font-medium text-sm md:text-base">Here's what's happening in Technotask WorkHub today.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button 
            onClick={downloadReport}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-white text-neutral-700 px-4 py-2.5 rounded-xl text-sm font-bold border border-neutral-200 hover:bg-neutral-50 transition-all cursor-pointer shadow-sm active:scale-95"
          >
            <Download size={18} />
            <span className="whitespace-nowrap">Download Report</span>
          </button>
          <button 
            onClick={onNewEntry}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-purple-600 text-white px-4 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-purple-900/20 hover:bg-purple-700 transition-all active:scale-95"
          >
            <PlusCircle size={18} />
            <span className="whitespace-nowrap">New MIS Entry</span>
          </button>
        </div>
      </motion.div>

      {/* Daily Insight Card */}
      <AnimatePresence mode="wait">
        {loadingInsight ? (
          <motion.div 
            key="loading"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white p-6 rounded-3xl border border-neutral-200 shadow-sm flex items-center justify-center gap-3"
          >
            <Loader2 className="w-5 h-5 text-purple-600 animate-spin" />
            <p className="text-neutral-500 text-sm font-bold">Fetching daily productivity insight...</p>
          </motion.div>
        ) : insight && (
          <motion.div 
            key="insight"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            <div className="md:col-span-2 bg-gradient-to-br from-indigo-600 to-purple-700 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
                <Quote size={120} />
              </div>
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-4">
                  <Lightbulb className="text-amber-300" size={20} />
                  <span className="text-xs font-black uppercase tracking-widest text-indigo-200">Daily Motivation</span>
                </div>
                <p className="text-xl md:text-2xl font-serif italic mb-4 leading-relaxed">"{insight.quote}"</p>
                <p className="text-sm font-bold text-indigo-200">— {insight.author}</p>
              </div>
            </div>
            <div className="bg-amber-50 rounded-3xl p-6 border border-amber-100 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <Zap className="text-amber-600" size={20} />
                <span className="text-xs font-black uppercase tracking-widest text-amber-700">Productivity Tip</span>
              </div>
              <p className="text-neutral-800 font-medium leading-relaxed">{insight.tip}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {[
          { label: 'Pending Tasks', value: '08', icon: FileText, color: 'text-purple-600', bg: 'bg-purple-50' },
          { label: 'Records Today', value: '342', icon: FileSpreadsheet, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Team Active', value: '12', icon: Users, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'System Health', value: '99.9%', icon: Zap, color: 'text-amber-600', bg: 'bg-amber-50' },
        ].map((stat, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white p-4 md:p-6 rounded-2xl md:rounded-3xl border border-neutral-200 shadow-sm hover:shadow-md transition-all"
          >
            <div className="flex items-center justify-between mb-3 md:mb-4">
              <div className={`w-10 h-10 md:w-12 md:h-12 ${stat.bg} ${stat.color} rounded-xl md:rounded-2xl flex items-center justify-center`}>
                <stat.icon size={20} className="md:w-6 md:h-6" />
              </div>
              <ArrowUpRight size={18} className="text-neutral-300 hidden sm:block" />
            </div>
            <p className="text-neutral-500 text-[10px] md:text-sm font-medium uppercase md:normal-case tracking-wider md:tracking-normal">{stat.label}</p>
            <h3 className="text-xl md:text-2xl font-bold text-neutral-800 mt-1">{stat.value}</h3>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Left Column: Main Feed & Company Life */}
        <div className="xl:col-span-2 space-y-8">
          <CompanyLife />
        </div>

        {/* Right Column: Tasks & Activity */}
        <div className="xl:col-span-1 space-y-8">
          <TaskPanel tasks={MOCK_TASKS} onViewAll={onViewTasks} />
          <ActivityFeed />
          
          {/* File Upload Quick Access */}
          <div className="bg-gradient-to-br from-purple-600 to-indigo-700 rounded-3xl p-6 text-white shadow-xl">
            <h3 className="font-bold text-lg mb-2">Upload MIS Dataset</h3>
            <p className="text-purple-100 text-xs mb-6">Drag and drop your daily MIS excel files here for processing.</p>
            <div className="border-2 border-dashed border-purple-400/50 rounded-2xl p-8 text-center hover:bg-white/5 transition-all cursor-pointer group">
              <Upload size={32} className="mx-auto mb-2 text-purple-200 group-hover:scale-110 transition-transform" />
              <p className="text-xs font-bold uppercase tracking-widest">Select File</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Activity as ActivityIcon, Clock } from 'lucide-react';
import { Activity } from '../types';
import { formatDistanceToNow } from 'date-fns';

export default function ActivityFeed() {
  const [activities, setActivities] = useState<Activity[]>([]);

  useEffect(() => {
    const fetchActivity = async (retries = 3) => {
      try {
        const response = await fetch('/api/activity');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        if (Array.isArray(data)) {
          setActivities(data);
        } else {
          throw new Error("Data is not an array");
        }
      } catch (err) {
        console.warn("Failed to fetch activity, using mock data (Dummy Mode):", err);
        const mockActivities: Activity[] = [
          { id: 1, user_id: 'SYSTEM', message: 'Daily MIS reconciliation started for Amazon dataset.', timestamp: new Date().toISOString() },
          { id: 2, user_id: 'MIS1001', message: 'Parameswari V updated 45 records for Flipkart.', timestamp: new Date(Date.now() - 600000).toISOString() },
          { id: 3, user_id: 'SYSTEM', message: 'New announcement posted: Office meeting this weekend.', timestamp: new Date(Date.now() - 1200000).toISOString() },
          { id: 4, user_id: 'MIS1003', message: 'Divya S resolved a high priority risk for Zomato.', timestamp: new Date(Date.now() - 1800000).toISOString() },
        ];
        setActivities(mockActivities);
      }
    };

    fetchActivity();
    const interval = setInterval(fetchActivity, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-5 flex flex-col h-full">
      <div className="flex items-center gap-2 mb-6">
        <div className="w-8 h-8 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center">
          <ActivityIcon size={18} />
        </div>
        <h3 className="font-bold text-neutral-800">Live Activity Feed</h3>
      </div>

      <div className="flex-1 overflow-y-auto space-y-6 pl-3 pr-2 custom-scrollbar">
        <AnimatePresence initial={false}>
          {activities.map((activity) => (
            <motion.div 
              key={activity.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative pl-6 border-l-2 border-neutral-100 pb-1"
            >
              <div className="absolute -left-[9px] top-0.5 w-4 h-4 rounded-full bg-white border-2 border-indigo-500 shadow-sm z-10" />
              
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">
                  {activity.user_id === 'SYSTEM' ? 'System Update' : activity.user_id}
                </span>
                <span className="text-[10px] text-neutral-400 flex items-center gap-1">
                  <Clock size={10} />
                  {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                </span>
              </div>
              
              <p className="text-sm text-neutral-700 leading-relaxed">
                {activity.message}
              </p>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <div className="pt-4 mt-4 border-t border-neutral-100">
        <p className="text-[10px] text-center text-neutral-400 font-medium uppercase tracking-widest">
          Real-time Simulation Active
        </p>
      </div>
    </div>
  );
}

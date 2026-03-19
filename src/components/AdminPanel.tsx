import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Megaphone, 
  Users, 
  Briefcase,
  MessageSquare,
  Send,
  Clock,
  ShieldAlert,
  ChevronRight,
  Filter,
  MoreVertical,
  Edit3
} from 'lucide-react';
import { User, LeaveRequest, QueryRisk, Task } from '../types';
import { cn } from '../lib/utils';
import ChatSystem from './ChatSystem';
import { format } from 'date-fns';

interface AdminPanelProps {
  user: User;
}

export default function AdminPanel({ user }: AdminPanelProps) {
  const [activeSubTab, setActiveSubTab] = useState<'leaves' | 'risks' | 'work' | 'announcements' | 'chat'>('leaves');
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [risks, setRisks] = useState<QueryRisk[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [announcement, setAnnouncement] = useState({ title: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    pendingLeaves: 0,
    openRisks: 0,
    activeTasks: 0,
    totalEmployees: 4
  });

  // Mock Data for "Dummy" mode
  const MOCK_LEAVES: LeaveRequest[] = [
    { id: 'L1', userId: 'MIS1001', userName: 'Parameswari V', type: 'Leave', startDate: new Date().toISOString(), endDate: new Date(Date.now() + 86400000).toISOString(), reason: 'Family function', status: 'Pending', appliedAt: new Date().toISOString() },
    { id: 'L2', userId: 'MIS1002', userName: 'R Karthik', type: 'Permission', startDate: new Date().toISOString(), endDate: new Date().toISOString(), reason: 'Personal work (2 hours)', status: 'Pending', appliedAt: new Date().toISOString() },
    { id: 'L3', userId: 'MIS1003', userName: 'Divya S', type: 'On Duty', startDate: new Date().toISOString(), endDate: new Date().toISOString(), reason: 'Client site visit', status: 'Approved', appliedAt: new Date().toISOString() },
  ];

  const MOCK_RISKS: QueryRisk[] = [
    { id: 'R1', userId: 'MIS1001', userName: 'Parameswari V', type: 'Risk', title: 'Amazon API Latency', description: 'High latency observed in Amazon dataset processing.', priority: 'High', status: 'Open', createdAt: new Date().toISOString(), replies: [] },
    { id: 'R2', userId: 'MIS1004', userName: 'Naveen Kumar', type: 'Query', title: 'Flipkart Reconciliation', description: 'Query regarding mismatched records in Flipkart Q3 data.', priority: 'Medium', status: 'Open', createdAt: new Date().toISOString(), replies: [] },
  ];

  const MOCK_TASKS: Task[] = [
    { id: 'T1', client: 'Amazon', department: 'E-commerce', type: 'Data Entry', status: 'In Progress', assigned_to: 'Parameswari V', records_required: 1000, records_completed: 850, created_at: new Date().toISOString() },
    { id: 'T2', client: 'Flipkart', department: 'E-commerce', type: 'Verification', status: 'Pending', assigned_to: 'R Karthik', records_required: 500, records_completed: 0, created_at: new Date().toISOString() },
    { id: 'T3', client: 'Zomato', department: 'Food Tech', type: 'Reconciliation', status: 'In Progress', assigned_to: 'Divya S', records_required: 2000, records_completed: 1200, created_at: new Date().toISOString() },
    { id: 'T4', client: 'Swiggy', department: 'Food Tech', type: 'Audit', status: 'Completed', assigned_to: 'Naveen Kumar', records_required: 800, records_completed: 800, created_at: new Date().toISOString() },
  ];

  const [showRiskModal, setShowRiskModal] = useState(false);
  const [newRisk, setNewRisk] = useState({ title: '', description: '', type: 'Risk' as 'Risk' | 'Query', priority: 'Medium' as 'High' | 'Medium' | 'Low', assignedTo: 'MIS1001' });

  useEffect(() => {
    fetchData();
  }, []);

  const updateStats = (l: LeaveRequest[], r: QueryRisk[], t: Task[]) => {
    setStats({
      pendingLeaves: l.filter((leave) => leave.status === 'Pending').length,
      openRisks: r.filter((risk) => risk.status === 'Open').length,
      activeTasks: t.filter((task) => task.status !== 'Completed').length,
      totalEmployees: 4
    });
  };

  const handleResolveRisk = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/risks/${id}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'Resolved' })
      });
      if (!res.ok) throw new Error('API failed');
      fetchData();
      alert('Risk marked as resolved.');
    } catch (err) {
      console.warn('Failed to resolve risk via API, updating local state (Dummy Mode)', err);
      setRisks(prev => {
        const updated = prev.map(r => r.id === id ? { ...r, status: 'Resolved' } : r);
        updateStats(leaves, updated, tasks);
        return updated;
      });
      alert('Risk marked as resolved (Local).');
    }
  };

  const handleReallocateRisk = async (id: string) => {
    const newAssignee = prompt("Enter Employee ID to re-allocate to (e.g., MIS1002, MIS1003, MIS1004):");
    if (!newAssignee) return;

    try {
      const res = await fetch(`/api/admin/risks/${id}/reallocate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assignedTo: newAssignee })
      });
      if (!res.ok) throw new Error('API failed');
      fetchData();
      alert(`Risk re-allocated to ${newAssignee}`);
    } catch (err) {
      console.warn('Failed to reallocate risk via API, updating local state (Dummy Mode)', err);
      const employeeNames: Record<string, string> = {
        'MIS1001': 'Parameswari V',
        'MIS1002': 'R Karthik',
        'MIS1003': 'Divya S',
        'MIS1004': 'Naveen Kumar'
      };
      setRisks(prev => prev.map(r => r.id === id ? { ...r, userId: newAssignee, userName: employeeNames[newAssignee] || newAssignee } : r));
      alert(`Risk re-allocated to ${newAssignee} (Local)`);
    }
  };

  const handleAllocateRisk = async (e: React.FormEvent) => {
    e.preventDefault();
    const employeeNames: Record<string, string> = {
      'MIS1001': 'Parameswari V',
      'MIS1002': 'R Karthik',
      'MIS1003': 'Divya S',
      'MIS1004': 'Naveen Kumar'
    };

    const riskObj: QueryRisk = {
      id: `R${Date.now()}`,
      userId: newRisk.assignedTo,
      userName: employeeNames[newRisk.assignedTo] || newRisk.assignedTo,
      type: newRisk.type as any,
      title: newRisk.title,
      description: newRisk.description,
      priority: newRisk.priority as any,
      status: 'Open',
      createdAt: new Date().toISOString(),
      replies: []
    };

    try {
      const res = await fetch('/api/admin/risks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(riskObj)
      });
      if (!res.ok) throw new Error('API failed');
      setShowRiskModal(false);
      setNewRisk({ title: '', description: '', type: 'Risk', priority: 'Medium', assignedTo: 'MIS1001' });
      fetchData();
      alert('New risk/query allocated successfully!');
    } catch (err) {
      console.warn('Failed to allocate risk via API, updating local state (Dummy Mode)', err);
      setRisks(prev => {
        const updated = [...prev, riskObj];
        updateStats(leaves, updated, tasks);
        return updated;
      });
      setShowRiskModal(false);
      setNewRisk({ title: '', description: '', type: 'Risk', priority: 'Medium', assignedTo: 'MIS1001' });
      alert('New risk/query allocated successfully (Local)!');
    }
  };

  const fetchData = async () => {
    try {
      const [leavesRes, risksRes, tasksRes] = await Promise.all([
        fetch('/api/admin/leaves'),
        fetch('/api/admin/risks'),
        fetch('/api/tasks/ALL')
      ]);
      
      if (!leavesRes.ok || !risksRes.ok || !tasksRes.ok) throw new Error('API failed');

      const leavesData = await leavesRes.json();
      const risksData = await risksRes.json();
      const tasksData = await tasksRes.json();

      setLeaves(leavesData);
      setRisks(risksData);
      setTasks(tasksData);
      updateStats(leavesData, risksData, tasksData);
    } catch (err) {
      console.warn('Failed to fetch admin data, using mock data (Dummy Mode)', err);
      setLeaves(MOCK_LEAVES);
      setRisks(MOCK_RISKS);
      setTasks(MOCK_TASKS);
      updateStats(MOCK_LEAVES, MOCK_RISKS, MOCK_TASKS);
    }
  };

  const handleLeaveAction = async (id: string, status: 'Approved' | 'Rejected') => {
    try {
      const res = await fetch(`/api/admin/leaves/${id}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (!res.ok) throw new Error('API failed');
      fetchData();
    } catch (err) {
      console.warn('Failed to update leave status via API, updating local state (Dummy Mode)', err);
      setLeaves(prev => {
        const updated = prev.map(l => l.id === id ? { ...l, status } : l);
        updateStats(updated, risks, tasks);
        return updated;
      });
    }
  };

  const handlePostAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!announcement.title || !announcement.message) return;
    
    setLoading(true);
    try {
      const res = await fetch('/api/admin/announcements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...announcement, sender: user.name })
      });
      if (!res.ok) throw new Error('API failed');
      setAnnouncement({ title: '', message: '' });
      alert('Announcement posted and notifications sent to all users!');
    } catch (err) {
      console.warn('Failed to post announcement via API (Dummy Mode)', err);
      setAnnouncement({ title: '', message: '' });
      alert('Announcement posted successfully (Local)!');
    } finally {
      setLoading(false);
    }
  };

  const subTabs = [
    { id: 'leaves', label: 'Leave Approvals', icon: CheckCircle2, count: stats.pendingLeaves },
    { id: 'risks', label: 'Risk Allocation', icon: AlertTriangle, count: stats.openRisks },
    { id: 'work', label: 'Work Overview', icon: Briefcase, count: stats.activeTasks },
    { id: 'announcements', label: 'Announcements', icon: Megaphone },
    { id: 'chat', label: 'Team Chat', icon: MessageSquare },
  ];

  return (
    <div className="space-y-6">
      {/* Admin Header Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Pending Leaves</span>
            <CheckCircle2 className="text-purple-600" size={20} />
          </div>
          <p className="text-3xl font-black text-neutral-800">{stats.pendingLeaves}</p>
          <p className="text-xs text-emerald-500 font-bold mt-1">Requires Action</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Open Risks</span>
            <AlertTriangle className="text-amber-500" size={20} />
          </div>
          <p className="text-3xl font-black text-neutral-800">{stats.openRisks}</p>
          <p className="text-xs text-amber-500 font-bold mt-1">Critical Priority</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Active Tasks</span>
            <Briefcase className="text-blue-500" size={20} />
          </div>
          <p className="text-3xl font-black text-neutral-800">{stats.activeTasks}</p>
          <p className="text-xs text-blue-500 font-bold mt-1">Across all teams</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Team Size</span>
            <Users className="text-indigo-500" size={20} />
          </div>
          <p className="text-3xl font-black text-neutral-800">{stats.totalEmployees}</p>
          <p className="text-xs text-indigo-500 font-bold mt-1">Active Members</p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 overflow-hidden">
        <div className="flex border-b border-neutral-100 overflow-x-auto no-scrollbar scroll-smooth">
          {subTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as any)}
              className={cn(
                "flex items-center gap-2 px-6 py-4 text-sm font-bold transition-all border-b-2 whitespace-nowrap shrink-0",
                activeSubTab === tab.id 
                  ? "border-purple-600 text-purple-600 bg-purple-50/50" 
                  : "border-transparent text-neutral-400 hover:text-neutral-600 hover:bg-neutral-50"
              )}
            >
              <tab.icon size={18} />
              {tab.label}
              {tab.count !== undefined && tab.count > 0 && (
                <span className="ml-1 px-1.5 py-0.5 bg-red-500 text-white text-[10px] rounded-full">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="p-4 md:p-6">
          <AnimatePresence mode="wait">
            {activeSubTab === 'leaves' && (
              <motion.div 
                key="leaves"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                  <h3 className="font-black text-neutral-800 text-lg">Leave Management</h3>
                  <div className="flex gap-2">
                    <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 py-1.5 bg-neutral-100 text-neutral-600 rounded-lg text-xs font-bold hover:bg-neutral-200 transition-colors">
                      <Filter size={14} /> Filter
                    </button>
                    <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 py-1.5 bg-neutral-100 text-neutral-600 rounded-lg text-xs font-bold hover:bg-neutral-200 transition-colors">
                      <Clock size={14} /> History
                    </button>
                  </div>
                </div>

                <div className="overflow-x-auto -mx-4 md:mx-0">
                  <table className="w-full text-left border-collapse min-w-[600px] md:min-w-full">
                    <thead>
                      <tr className="border-b border-neutral-100">
                        <th className="px-4 md:px-0 pb-4 text-[10px] font-black text-neutral-400 uppercase tracking-widest">Employee</th>
                        <th className="pb-4 text-[10px] font-black text-neutral-400 uppercase tracking-widest">Type</th>
                        <th className="pb-4 text-[10px] font-black text-neutral-400 uppercase tracking-widest">Duration</th>
                        <th className="pb-4 text-[10px] font-black text-neutral-400 uppercase tracking-widest">Reason</th>
                        <th className="pb-4 text-[10px] font-black text-neutral-400 uppercase tracking-widest">Status</th>
                        <th className="pb-4 text-[10px] font-black text-neutral-400 uppercase tracking-widest">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-50">
                      {leaves.map((leave) => (
                        <tr key={leave.id} className="group hover:bg-neutral-50/50 transition-colors">
                          <td className="px-4 md:px-0 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center font-bold text-xs shrink-0">
                                {leave.userName.charAt(0)}
                              </div>
                              <div>
                                <p className="text-sm font-bold text-neutral-800 whitespace-nowrap">{leave.userName}</p>
                                <p className="text-[10px] text-neutral-400 font-medium">{leave.userId}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-4">
                            <span className={cn(
                              "px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-wider",
                              leave.type === 'Leave' ? "bg-red-50 text-red-600" : 
                              leave.type === 'Permission' ? "bg-blue-50 text-blue-600" : "bg-emerald-50 text-emerald-600"
                            )}>
                              {leave.type}
                            </span>
                          </td>
                          <td className="py-4">
                            <p className="text-xs font-bold text-neutral-700">{format(new Date(leave.startDate), 'MMM dd')}</p>
                            <p className="text-[10px] text-neutral-400 font-medium">to {format(new Date(leave.endDate), 'MMM dd')}</p>
                          </td>
                          <td className="py-4 max-w-xs">
                            <p className="text-xs text-neutral-600 line-clamp-1">{leave.reason}</p>
                          </td>
                          <td className="py-4">
                            <span className={cn(
                              "px-2 py-1 rounded-full text-[10px] font-black uppercase tracking-wider",
                              leave.status === 'Pending' ? "bg-amber-50 text-amber-600" :
                              leave.status === 'Approved' ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"
                            )}>
                              {leave.status}
                            </span>
                          </td>
                          <td className="py-4">
                            {leave.status === 'Pending' ? (
                              <div className="flex gap-2">
                                <button 
                                  onClick={() => handleLeaveAction(leave.id, 'Approved')}
                                  className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                                  title="Approve"
                                >
                                  <CheckCircle2 size={18} />
                                </button>
                                <button 
                                  onClick={() => handleLeaveAction(leave.id, 'Rejected')}
                                  className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                  title="Reject"
                                >
                                  <XCircle size={18} />
                                </button>
                              </div>
                            ) : (
                              <button className="p-1.5 text-neutral-400 hover:text-neutral-600 rounded-lg transition-colors">
                                <MoreVertical size={18} />
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}

            {activeSubTab === 'risks' && (
              <motion.div 
                key="risks"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-black text-neutral-800 text-lg">Risk & Query Allocation</h3>
                  <button 
                    onClick={() => setShowRiskModal(true)}
                    className="bg-purple-600 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-purple-700 transition-all shadow-lg shadow-purple-900/20"
                  >
                    Allocate New Risk
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {risks.filter(r => r.status === 'Open').map((risk) => (
                    <div key={risk.id} className="bg-neutral-50 rounded-2xl p-5 border border-neutral-100 hover:border-purple-200 transition-all group">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <span className={cn(
                            "px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-wider",
                            risk.type === 'Risk' ? "bg-red-100 text-red-700" : "bg-blue-100 text-blue-700"
                          )}>
                            {risk.type}
                          </span>
                          <span className={cn(
                            "px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-wider",
                            risk.priority === 'High' ? "bg-red-500 text-white" : 
                            risk.priority === 'Medium' ? "bg-amber-500 text-white" : "bg-blue-500 text-white"
                          )}>
                            {risk.priority}
                          </span>
                        </div>
                        <button className="text-neutral-400 hover:text-neutral-600">
                          <MoreVertical size={16} />
                        </button>
                      </div>
                      <h4 className="font-bold text-neutral-800 mb-1">{risk.title}</h4>
                      <p className="text-xs text-neutral-500 leading-relaxed mb-4">{risk.description}</p>
                      <div className="flex items-center justify-between pt-4 border-t border-neutral-200/50">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-neutral-200 flex items-center justify-center text-[10px] font-bold">
                            {risk.userName.charAt(0)}
                          </div>
                          <span className="text-[10px] font-bold text-neutral-600">{risk.userName}</span>
                        </div>
                        <div className="flex gap-2">
                          <button 
                            onClick={() => handleResolveRisk(risk.id)}
                            className="px-3 py-1.5 bg-white border border-neutral-200 rounded-lg text-[10px] font-bold text-neutral-600 hover:bg-neutral-50 transition-colors"
                          >
                            Resolve
                          </button>
                          <button 
                            onClick={() => handleReallocateRisk(risk.id)}
                            className="px-3 py-1.5 bg-purple-600 text-white rounded-lg text-[10px] font-bold hover:bg-purple-700 transition-colors"
                          >
                            Re-allocate
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                  {risks.filter(r => r.status === 'Open').length === 0 && (
                    <div className="col-span-full py-12 text-center bg-neutral-50 rounded-2xl border border-dashed border-neutral-200">
                      <CheckCircle2 className="mx-auto text-emerald-500 mb-2" size={32} />
                      <p className="text-sm text-neutral-500 font-bold">All risks and queries have been resolved!</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {activeSubTab === 'work' && (
              <motion.div 
                key="work"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <h3 className="font-black text-neutral-800 text-lg">Entire Work Overview</h3>
                  <div className="flex gap-2">
                    <button className="flex-1 sm:flex-none p-2 bg-neutral-100 text-neutral-600 rounded-lg hover:bg-neutral-200 transition-colors flex items-center justify-center">
                      <Filter size={18} />
                    </button>
                    <button className="flex-1 sm:flex-none p-2 bg-neutral-100 text-neutral-600 rounded-lg hover:bg-neutral-200 transition-colors flex items-center justify-center">
                      <Edit3 size={18} />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  {tasks.map((task) => (
                    <div key={task.id} className="bg-white border border-neutral-100 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:shadow-md transition-all">
                      <div className="flex items-center gap-4">
                        <div className={cn(
                          "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                          task.status === 'Completed' ? "bg-emerald-100 text-emerald-600" :
                          task.status === 'In Progress' ? "bg-blue-100 text-blue-600" : "bg-amber-100 text-amber-600"
                        )}>
                          <Briefcase size={20} />
                        </div>
                        <div>
                          <h4 className="font-bold text-neutral-800">{task.client} - {task.type}</h4>
                          <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest">{task.department}</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between sm:justify-end gap-4 md:gap-8">
                        <div className="text-left sm:text-right">
                          <p className="text-xs font-bold text-neutral-800">{task.records_completed} / {task.records_required}</p>
                          <div className="w-24 h-1.5 bg-neutral-100 rounded-full mt-1 overflow-hidden">
                            <div 
                              className="h-full bg-purple-600" 
                              style={{ width: `${(task.records_completed / task.records_required) * 100}%` }}
                            />
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <p className="text-xs font-bold text-neutral-700">{task.assigned_to}</p>
                            <p className="text-[10px] text-neutral-400">Assigned</p>
                          </div>
                          <ChevronRight className="text-neutral-300 hidden sm:block" size={20} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {activeSubTab === 'announcements' && (
              <motion.div 
                key="announcements"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="max-w-2xl mx-auto"
              >
                <div className="bg-neutral-900 rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-purple-600/20 rounded-full blur-3xl -mr-32 -mt-32" />
                  <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-12 h-12 bg-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-900/40">
                        <Megaphone size={24} />
                      </div>
                      <div>
                        <h3 className="text-xl font-black">Office Announcement</h3>
                        <p className="text-purple-400 text-xs font-bold uppercase tracking-widest">Broadcast to all employees</p>
                      </div>
                    </div>

                    <form onSubmit={handlePostAnnouncement} className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-neutral-400 uppercase tracking-widest">Announcement Title</label>
                        <input 
                          type="text" 
                          value={announcement.title}
                          onChange={(e) => setAnnouncement({ ...announcement, title: e.target.value })}
                          placeholder="e.g. Mandatory Weekend Meeting"
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-neutral-400 uppercase tracking-widest">Message Content</label>
                        <textarea 
                          rows={4}
                          value={announcement.message}
                          onChange={(e) => setAnnouncement({ ...announcement, message: e.target.value })}
                          placeholder="Enter the details of the announcement..."
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-purple-500 transition-all resize-none"
                        />
                      </div>
                      <button 
                        type="submit"
                        disabled={loading}
                        className="w-full bg-purple-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-purple-700 transition-all shadow-xl shadow-purple-900/40 flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        {loading ? 'Broadcasting...' : (
                          <>
                            <Send size={18} /> Broadcast Announcement
                          </>
                        )}
                      </button>
                    </form>
                  </div>
                </div>

                <div className="mt-8 space-y-4">
                  <h4 className="text-sm font-black text-neutral-400 uppercase tracking-widest">Recent Announcements</h4>
                  <div className="bg-white border border-neutral-100 rounded-2xl p-4 flex items-center gap-4">
                    <div className="w-10 h-10 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center">
                      <ShieldAlert size={20} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-neutral-800">Visit office by coming weekend for meeting</p>
                      <p className="text-[10px] text-neutral-400 font-medium">Posted by Operations Head • 2 hours ago</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeSubTab === 'chat' && (
              <motion.div 
                key="chat"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="h-[calc(100vh-350px)]"
              >
                <ChatSystem currentUser={user} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      {/* Risk Allocation Modal */}
      <AnimatePresence>
        {showRiskModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-black text-neutral-800">Allocate New Risk/Query</h3>
                <button onClick={() => setShowRiskModal(false)} className="text-neutral-400 hover:text-neutral-600">
                  <XCircle size={24} />
                </button>
              </div>
              
              <form onSubmit={handleAllocateRisk} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Title</label>
                  <input 
                    type="text" 
                    required
                    value={newRisk.title}
                    onChange={e => setNewRisk({...newRisk, title: e.target.value})}
                    placeholder="e.g. Amazon API Latency Issue"
                    className="w-full bg-neutral-50 border border-neutral-100 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Description</label>
                  <textarea 
                    required
                    rows={3}
                    value={newRisk.description}
                    onChange={e => setNewRisk({...newRisk, description: e.target.value})}
                    placeholder="Describe the risk or query in detail..."
                    className="w-full bg-neutral-50 border border-neutral-100 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Type</label>
                    <select 
                      value={newRisk.type}
                      onChange={e => setNewRisk({...newRisk, type: e.target.value as any})}
                      className="w-full bg-neutral-50 border border-neutral-100 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                    >
                      <option value="Risk">Risk</option>
                      <option value="Query">Query</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Priority</label>
                    <select 
                      value={newRisk.priority}
                      onChange={e => setNewRisk({...newRisk, priority: e.target.value as any})}
                      className="w-full bg-neutral-50 border border-neutral-100 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                    >
                      <option value="High">High</option>
                      <option value="Medium">Medium</option>
                      <option value="Low">Low</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Assign To</label>
                  <select 
                    value={newRisk.assignedTo}
                    onChange={e => setNewRisk({...newRisk, assignedTo: e.target.value})}
                    className="w-full bg-neutral-50 border border-neutral-100 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                  >
                    <option value="MIS1001">Parameswari V (MIS1001)</option>
                    <option value="MIS1002">R Karthik (MIS1002)</option>
                    <option value="MIS1003">Divya S (MIS1003)</option>
                    <option value="MIS1004">Naveen Kumar (MIS1004)</option>
                  </select>
                </div>
                <button 
                  type="submit"
                  className="w-full bg-purple-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-purple-700 transition-all shadow-xl shadow-purple-900/40 mt-4"
                >
                  Allocate Risk
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Download, 
  Filter, 
  Search, 
  Plus, 
  Trash2, 
  Edit2, 
  X,
  CheckCircle2,
  AlertCircle,
  Clock,
  FileSpreadsheet,
  ArrowRight,
  Calendar,
  MessageSquare,
  Bell,
  CheckCircle,
  ArrowUpDown,
  ChevronUp,
  ChevronDown,
  Zap
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { MISRecord, Task, LogEntry } from '../types';
import { MOCK_MIS_RECORDS, MOCK_TASKS } from '../constants';
import { cn } from '../lib/utils';
import TaskPanel from './TaskPanel';
import SimulationModule from './SimulationModule';
import Toast from './Toast';

const LOG_SUGGESTIONS = [
  "Verified customer details",
  "Updated response status",
  "Followed up with client",
  "Resolved technical issue",
  "Documented meeting notes",
  "Sent confirmation email",
  "Escalated to management",
  "Completed quality check"
];

const ISSUE_TYPES = [
  "Payment Failure",
  "Delivery Delay",
  "Account Verification",
  "Refund Request",
  "Catalog Error",
  "Wrong Item Received",
  "Address Update",
  "Promo Code Issue"
];

const CLIENTS = ["Amazon", "Flipkart", "Meesho", "Zomato", "Swiggy"];
const DEPARTMENTS = ["Customer Support", "Sales MIS", "Operations MIS", "Client Data MIS"];

export default function MISGrid() {
  const [activeTab, setActiveTab] = useState<'data' | 'simulation'>('data');
  const [records, setRecords] = useState<MISRecord[]>(MOCK_MIS_RECORDS);
  const [tasks, setTasks] = useState<Task[]>(MOCK_TASKS);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [showAddModal, setShowAddModal] = useState(false);
  const [isEditingRecord, setIsEditingRecord] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<MISRecord | null>(null);
  const [toast, setToast] = useState<{ message: string; visible: boolean }>({ message: '', visible: false });
  const [newRecord, setNewRecord] = useState<Partial<MISRecord>>({
    clientName: 'Amazon',
    department: 'Customer Support',
    responseStatus: 'Pending'
  });

  // Client Details States
  const [dailyLogs, setDailyLogs] = useState<Record<string, LogEntry[]>>(() => {
    const saved = localStorage.getItem('mis_daily_logs');
    return saved ? JSON.parse(saved) : {};
  });
  const [globalLogs, setGlobalLogs] = useState<LogEntry[]>([]);
  const [meetings, setMeetings] = useState<Record<string, { date: string, time: string, desc: string }[]>>(() => {
    const saved = localStorage.getItem('mis_meetings');
    return saved ? JSON.parse(saved) : {};
  });
  const [reminders, setReminders] = useState<Record<string, string>>(() => {
    const saved = localStorage.getItem('mis_reminders');
    return saved ? JSON.parse(saved) : {};
  });

  useEffect(() => {
    localStorage.setItem('mis_daily_logs', JSON.stringify(dailyLogs));
  }, [dailyLogs]);

  useEffect(() => {
    localStorage.setItem('mis_meetings', JSON.stringify(meetings));
  }, [meetings]);

  useEffect(() => {
    localStorage.setItem('mis_reminders', JSON.stringify(reminders));
  }, [reminders]);
  const [newLog, setNewLog] = useState('');
  const [newMeeting, setNewMeeting] = useState({ date: '', time: '', desc: '' });
  const [newReminder, setNewReminder] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: keyof MISRecord; direction: 'asc' | 'desc' } | null>(null);

  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const updateTaskStatus = (taskId: string, status: 'Pending' | 'In Progress' | 'Completed') => {
    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        return { 
          ...t, 
          status,
          records_completed: status === 'Completed' ? t.records_required : t.records_completed
        };
      }
      return t;
    }));
    
    setToast({ message: `Task ${taskId} updated to ${status}`, visible: true });
    
    if (status === 'Completed') {
      const task = tasks.find(t => t.id === taskId);
      const entry: LogEntry = {
        id: `task-comp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        sender: 'System',
        message: `TASK COMPLETED: ${task?.client} - ${task?.type}`,
        timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
        type: 'system'
      };
      setGlobalLogs(prev => [entry, ...prev].slice(0, 5));
    }
  };

  const getClientLogo = (name: string) => {
    const logos: Record<string, string> = {
      'Amazon': 'https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg',
      'Flipkart': 'https://upload.wikimedia.org/wikipedia/en/7/7a/Flipkart_logo.svg',
      'Zomato': 'https://upload.wikimedia.org/wikipedia/commons/b/bd/Zomato_Logo.svg',
      'Swiggy': 'https://upload.wikimedia.org/wikipedia/en/1/12/Swiggy_logo.svg',
      'Meesho': 'https://upload.wikimedia.org/wikipedia/commons/8/80/Meesho_Logo_Full.png',
    };
    return logos[name] || `https://ui-avatars.com/api/?name=${name}&background=random`;
  };

  // Lively Simulation
  React.useEffect(() => {
    const interval = setInterval(() => {
      const rand = Math.random();
      
      // 20% chance to add a new record (Issue) automatically
      if (rand < 0.2) {
        const client = CLIENTS[Math.floor(Math.random() * CLIENTS.length)];
        const issue = ISSUE_TYPES[Math.floor(Math.random() * ISSUE_TYPES.length)];
        const dept = DEPARTMENTS[Math.floor(Math.random() * DEPARTMENTS.length)];
        
        const newIssue: MISRecord = {
          id: `auto-${Date.now()}`,
          clientName: client,
          department: dept,
          customerId: `CUST${Math.floor(10000 + Math.random() * 90000)}`,
          issueType: issue,
          responseStatus: 'Pending',
          assignedEmployee: 'System Bot',
          remarks: 'Automatically detected by AI Monitor',
          lastUpdated: new Date().toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
        };

        setRecords(prev => [newIssue, ...prev].slice(0, 50)); // Keep last 50
        
        const entry: LogEntry = {
          id: `sim-new-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          sender: 'System Bot',
          message: `NEW ISSUE: ${client} - ${issue}`,
          timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
          type: 'system'
        };

        setGlobalLogs(prev => [entry, ...prev].slice(0, 5));
        
        setToast({ message: `New ${client} issue detected!`, visible: true });

        // 10% chance to generate a new task if one doesn't exist for this client/dept
        const taskExists = tasks.some(t => t.client === client && t.department === dept && t.status !== 'Completed');
        if (Math.random() < 0.5 && !taskExists) {
          const newTask: Task = {
            id: `TASK-${Math.floor(1000 + Math.random() * 9000)}`,
            client: client,
            department: dept,
            type: issue,
            status: 'Pending',
            assigned_to: 'Parameswari V',
            records_required: Math.floor(5 + Math.random() * 10),
            records_completed: 0,
            created_at: new Date().toISOString()
          };
          setTasks(prev => {
            if (prev.some(t => t.id === newTask.id)) return prev;
            return [newTask, ...prev].slice(0, 10);
          });
          
          const taskEntry: LogEntry = {
            id: `sim-task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            sender: 'System Bot',
            message: `NEW TASK ASSIGNED: ${client} - ${dept}`,
            timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
            type: 'system'
          };
          setGlobalLogs(prev => [taskEntry, ...prev].slice(0, 5));
        }
      } 
      // 30% chance to add a lively log update
      else if (rand > 0.7 && records.length > 0) {
        const randomRecord = records[Math.floor(Math.random() * records.length)];
        const randomSuggestion = LOG_SUGGESTIONS[Math.floor(Math.random() * LOG_SUGGESTIONS.length)];
        
        const entry: LogEntry = {
          id: `sim-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          sender: 'System Bot',
          message: `${randomRecord.clientName}: ${randomSuggestion}`,
          timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
          type: 'system'
        };

        setDailyLogs(prev => ({
          ...prev,
          [randomRecord.id]: [...(prev[randomRecord.id] || []), entry]
        }));

        setGlobalLogs(prev => [entry, ...prev].slice(0, 5));
      }
    }, 8000); // Every 8 seconds for better pacing

    return () => clearInterval(interval);
  }, [records]);

  const requestSort = (key: keyof MISRecord) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (key: keyof MISRecord) => {
    if (!sortConfig || sortConfig.key !== key) return <ArrowUpDown size={12} className="opacity-30" />;
    return sortConfig.direction === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />;
  };

  const filteredRecords = useMemo(() => {
    let result = records.filter(r => {
      const matchesSearch = 
        r.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.customerId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.issueType.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesFilter = filterStatus === 'All' || r.responseStatus === filterStatus;
      
      return matchesSearch && matchesFilter;
    });

    if (sortConfig) {
      result.sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];

        if (sortConfig.key === 'lastUpdated') {
          const dateA = new Date(aValue.replace(',', ''));
          const dateB = new Date(bValue.replace(',', ''));
          return sortConfig.direction === 'asc' ? dateA.getTime() - dateB.getTime() : dateB.getTime() - dateA.getTime();
        }

        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [records, searchTerm, filterStatus, sortConfig]);

  const handleAddRecord = (e: React.FormEvent) => {
    e.preventDefault();
    if (isEditingRecord && newRecord.id) {
      setRecords(prev => prev.map(r => r.id === newRecord.id ? { ...r, ...newRecord } as MISRecord : r));
      setToast({ message: 'Record updated successfully!', visible: true });
    } else {
      const record: MISRecord = {
        id: Date.now().toString(),
        clientName: newRecord.clientName || 'Unknown',
        department: newRecord.department || 'General',
        customerId: `CUST${Math.floor(10000 + Math.random() * 90000)}`,
        issueType: newRecord.issueType || 'General Inquiry',
        responseStatus: newRecord.responseStatus as any || 'Pending',
        assignedEmployee: 'Parameswari V',
        remarks: newRecord.remarks || '',
        lastUpdated: new Date().toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
      };

      const updatedRecords = [record, ...records];
      setRecords(updatedRecords);
      setToast({ message: 'New record added successfully!', visible: true });
      
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#9333ea', '#6366f1', '#10b981']
      });

      // Update task progress if it matches a client
      setTasks(prevTasks => prevTasks.map(t => {
        if (t.client === record.clientName && t.status !== 'Completed') {
          const newCompleted = t.records_completed + 1;
          return {
            ...t,
            records_completed: newCompleted,
            status: newCompleted >= t.records_required ? 'Completed' : 'In Progress'
          };
        }
        return t;
      }));
    }
    setShowAddModal(false);
    setIsEditingRecord(false);
    setNewRecord({ clientName: 'Amazon', department: 'Customer Support', responseStatus: 'Pending' });
  };

  const deleteRecord = (id: string) => {
    setRecords(records.filter(r => r.id !== id));
    if (selectedRecord?.id === id) setSelectedRecord(null);
  };

  const updateRecordStatus = (id: string, status: 'Pending' | 'In Progress' | 'Completed') => {
    const oldRecord = records.find(r => r.id === id);
    if (!oldRecord) return;

    const oldStatus = oldRecord.responseStatus;
    
    setRecords(prev => prev.map(r => {
      if (r.id === id) {
        return { 
          ...r, 
          responseStatus: status,
          lastUpdated: new Date().toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
        };
      }
      return r;
    }));
    
    if (selectedRecord?.id === id) {
      setSelectedRecord(prev => prev ? { ...prev, responseStatus: status } : null);
    }

    setToast({ message: `Status updated to ${status}`, visible: true });

    // Add system message to logs
    const systemEntry: LogEntry = {
      id: `sys-${Date.now()}`,
      sender: 'System',
      message: `Status changed to ${status}`,
      timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      type: 'system'
    };
    setDailyLogs(prev => ({
      ...prev,
      [id]: [...(prev[id] || []), systemEntry]
    }));

    if (status === 'Completed') {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#10b981', '#34d399']
      });
    }

    // Update task progress if status changed to/from 'Completed'
    if (oldStatus !== status) {
      if (status === 'Completed') {
        setTasks(prevTasks => prevTasks.map(t => {
          if (t.client === oldRecord.clientName) {
            const newCompleted = t.records_completed + 1;
            return {
              ...t,
              records_completed: newCompleted,
              status: newCompleted >= t.records_required ? 'Completed' : 'In Progress'
            };
          }
          return t;
        }));
      } else if (oldStatus === 'Completed') {
        setTasks(prevTasks => prevTasks.map(t => {
          if (t.client === oldRecord.clientName) {
            const newCompleted = Math.max(0, t.records_completed - 1);
            return {
              ...t,
              records_completed: newCompleted,
              status: newCompleted >= t.records_required ? 'Completed' : 'In Progress'
            };
          }
          return t;
        }));
      }
    }
  };

  const addLog = (id: string, message?: string) => {
    const logText = message || newLog;
    if (!logText.trim()) return;
    
    const entry: LogEntry = {
      id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      sender: 'Parameswari V',
      message: logText,
      timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      type: 'user'
    };

    setDailyLogs(prev => ({
      ...prev,
      [id]: [...(prev[id] || []), entry]
    }));
    setNewLog('');
  };

  const scheduleMeeting = (id: string) => {
    if (!newMeeting.date || !newMeeting.time || !newMeeting.desc) {
      setToast({ message: 'Please fill all meeting details', visible: true });
      return;
    }
    setMeetings(prev => ({
      ...prev,
      [id]: [...(prev[id] || []), newMeeting]
    }));
    setNewMeeting({ date: '', time: '', desc: '' });
    setToast({ message: 'Meeting scheduled successfully!', visible: true });
    
    // Add to logs
    const entry: LogEntry = {
      id: `meet-${Date.now()}`,
      sender: 'System',
      message: `MEETING SCHEDULED: ${newMeeting.date} at ${newMeeting.time}`,
      timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      type: 'system'
    };
    setDailyLogs(prev => ({
      ...prev,
      [id]: [...(prev[id] || []), entry]
    }));
  };

  const setReminder = (id: string) => {
    if (!newReminder) {
      setToast({ message: 'Please select a date and time', visible: true });
      return;
    }
    setReminders(prev => ({
      ...prev,
      [id]: newReminder
    }));
    setToast({ message: `Reminder set for ${new Date(newReminder).toLocaleString()}`, visible: true });
    setNewReminder('');
    
    // Add to logs
    const entry: LogEntry = {
      id: `rem-${Date.now()}`,
      sender: 'System',
      message: `REMINDER SET: ${new Date(newReminder).toLocaleString()}`,
      timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      type: 'system'
    };
    setDailyLogs(prev => ({
      ...prev,
      [id]: [...(prev[id] || []), entry]
    }));
  };

  const exportToCSV = () => {
    const headers = ["Client", "Department", "Customer ID", "Issue Type", "Status", "Last Updated"];
    const rows = filteredRecords.map(r => [
      r.clientName,
      r.department,
      r.customerId,
      r.issueType,
      r.responseStatus,
      r.lastUpdated
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers, ...rows].map(e => e.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Technotask_MIS_Export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setToast({ message: 'Exporting CSV...', visible: true });
  };

  return (
    <div className="space-y-6">
      {/* Tab Switcher */}
      <div className="flex items-center gap-2 bg-neutral-100 p-1 rounded-2xl w-fit">
        <button 
          onClick={() => setActiveTab('data')}
          className={cn(
            "px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
            activeTab === 'data' ? "bg-white text-purple-600 shadow-sm" : "text-neutral-400 hover:text-neutral-600"
          )}
        >
          Data Workspace
        </button>
        <button 
          onClick={() => setActiveTab('simulation')}
          className={cn(
            "px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
            activeTab === 'simulation' ? "bg-white text-purple-600 shadow-sm" : "text-neutral-400 hover:text-neutral-600"
          )}
        >
          Scenario Simulation
        </button>
      </div>

      {activeTab === 'data' ? (
        <div className="flex flex-col lg:flex-row gap-6 h-full">
      {/* Main Grid Section */}
      <div className="flex-1 bg-white rounded-3xl shadow-sm border border-neutral-200 overflow-hidden flex flex-col">
        {/* Toolbar */}
        <div className="p-4 md:p-6 border-b border-neutral-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-neutral-50/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-600 text-white rounded-xl flex items-center justify-center shadow-lg shadow-purple-900/20 shrink-0">
              <FileSpreadsheet size={20} />
            </div>
            <div>
              <h2 className="text-lg md:text-xl font-bold text-neutral-800">MIS Data Workspace</h2>
              <div className="flex items-center gap-2">
                <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-widest">Live Activity: {records.length} Records Online</p>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="relative flex-1 sm:flex-none">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={16} />
              <input 
                type="text" 
                placeholder="Search records..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-4 py-2 bg-white border border-neutral-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 outline-none w-full sm:w-48 lg:w-64 transition-all"
              />
            </div>
            
            <div className="flex items-center gap-2">
              <div className="flex-1 sm:flex-none flex items-center bg-white border border-neutral-200 rounded-xl px-2">
                <Filter size={16} className="text-neutral-400 ml-2" />
                <select 
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="pl-2 pr-8 py-2 text-sm text-neutral-600 outline-none bg-transparent appearance-none cursor-pointer w-full"
                >
                  <option value="All">All Status</option>
                  <option value="Pending">Pending</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>

              <button 
                onClick={() => {
                  setNewRecord({ clientName: 'Amazon', department: 'Customer Support', responseStatus: 'Pending' });
                  setIsEditingRecord(false);
                  setShowAddModal(true);
                }}
                className="flex items-center justify-center gap-2 bg-purple-600 text-white px-4 md:px-5 py-2 rounded-xl text-sm font-bold hover:bg-purple-700 transition-all shadow-lg shadow-purple-900/20 active:scale-95 animate-bounce-subtle shrink-0"
              >
                <Plus size={18} />
                <span className="hidden sm:inline">Add Record</span>
                <span className="sm:hidden">Add</span>
              </button>
            </div>
          </div>
        </div>

        {/* Grid Content */}
        <div className="flex-1 overflow-auto custom-scrollbar">
          {!isMobile ? (
            <table className="w-full text-left border-collapse min-w-[1000px]">
              <thead className="sticky top-0 bg-neutral-50/80 backdrop-blur-md border-b border-neutral-200 z-10">
                <tr>
                  <th 
                    className="px-6 py-4 text-[10px] font-bold text-neutral-400 uppercase tracking-widest cursor-pointer hover:text-purple-600 transition-colors"
                    onClick={() => requestSort('clientName')}
                  >
                    <div className="flex items-center gap-2">
                      Client Details
                      {getSortIcon('clientName')}
                    </div>
                  </th>
                  <th className="px-6 py-4 text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Customer ID</th>
                  <th 
                    className="px-6 py-4 text-[10px] font-bold text-neutral-400 uppercase tracking-widest cursor-pointer hover:text-purple-600 transition-colors"
                    onClick={() => requestSort('issueType')}
                  >
                    <div className="flex items-center gap-2">
                      Issue & Remarks
                      {getSortIcon('issueType')}
                    </div>
                  </th>
                  <th className="px-6 py-4 text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Status</th>
                  <th 
                    className="px-6 py-4 text-[10px] font-bold text-neutral-400 uppercase tracking-widest cursor-pointer hover:text-purple-600 transition-colors"
                    onClick={() => requestSort('lastUpdated')}
                  >
                    <div className="flex items-center gap-2">
                      Timeline
                      {getSortIcon('lastUpdated')}
                    </div>
                  </th>
                  <th className="px-6 py-4 text-[10px] font-bold text-neutral-400 uppercase tracking-widest text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                <AnimatePresence initial={false}>
                  {filteredRecords.map((record) => (
                    <motion.tr 
                      layout
                      initial={{ opacity: 0, backgroundColor: "rgba(139, 92, 246, 0.1)" }}
                      animate={{ 
                        opacity: 1, 
                        backgroundColor: (Date.now() - new Date(record.lastUpdated.replace(',', '')).getTime() < 30000) 
                          ? ["rgba(139, 92, 246, 0.1)", "rgba(255, 255, 255, 0)"] 
                          : "rgba(255, 255, 255, 0)"
                      }}
                      transition={{ duration: 2 }}
                      exit={{ opacity: 0, x: -20 }}
                      key={record.id}
                      onClick={() => setSelectedRecord(record)}
                      className="hover:bg-purple-50/40 transition-colors group cursor-pointer"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {(Date.now() - new Date(record.lastUpdated.replace(',', '')).getTime() < 30000) && (
                            <motion.span 
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="absolute -left-1 w-1 h-8 bg-purple-600 rounded-r-full"
                            />
                          )}
                          <div className={cn(
                            "w-10 h-10 rounded-xl overflow-hidden bg-white border border-neutral-100 p-1 flex items-center justify-center shadow-sm mr-2",
                            record.clientName === 'Meesho' ? "border-pink-200" : ""
                          )}>
                            <img 
                              src={getClientLogo(record.clientName)} 
                              alt={record.clientName} 
                              className="w-full h-full object-contain"
                              referrerPolicy="no-referrer"
                            />
                          </div>
                          <div className={cn(
                            "w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs",
                            record.clientName === 'Amazon' ? "bg-orange-100 text-orange-600" :
                            record.clientName === 'Flipkart' ? "bg-blue-100 text-blue-600" :
                            record.clientName === 'Meesho' ? "bg-pink-100 text-pink-600" :
                            "bg-purple-100 text-purple-600"
                          )}>
                            {record.clientName.charAt(0)}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-bold text-neutral-800">{record.clientName}</p>
                              {(Date.now() - new Date(record.lastUpdated.replace(',', '')).getTime() < 30000) && (
                                <span className="text-[8px] bg-purple-600 text-white px-1.5 py-0.5 rounded-full font-black animate-pulse">NEW</span>
                              )}
                            </div>
                            <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">{record.department}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-mono text-xs bg-neutral-100 px-2 py-1 rounded text-neutral-600 border border-neutral-200">
                          {record.customerId}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-semibold text-neutral-700">{record.issueType}</p>
                        <p className="text-xs text-neutral-400 truncate max-w-[200px]">{record.remarks || 'No additional remarks'}</p>
                      </td>
                      <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                        <div className="relative group/status">
                          <select
                            value={record.responseStatus}
                            onChange={(e) => updateRecordStatus(record.id, e.target.value as any)}
                            className={cn(
                              "appearance-none cursor-pointer pl-3 pr-8 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm outline-none transition-all border",
                              record.responseStatus === 'Completed' ? "bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-100" :
                              record.responseStatus === 'In Progress' ? "bg-amber-50 text-amber-600 border-amber-100 hover:bg-amber-100" :
                              "bg-neutral-50 text-neutral-500 border-neutral-100 hover:bg-neutral-100"
                            )}
                          >
                            <option value="Pending">Pending</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Completed">Completed</option>
                          </select>
                          <div className={cn(
                            "absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none transition-colors",
                            record.responseStatus === 'Completed' ? "text-emerald-600" :
                            record.responseStatus === 'In Progress' ? "text-amber-600" :
                            "text-neutral-400"
                          )}>
                            <ChevronDown size={10} />
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-[11px] font-bold text-neutral-800">{record.lastUpdated.split(' ')[0]} {record.lastUpdated.split(' ')[1]} {record.lastUpdated.split(' ')[2]}</p>
                        <p className="text-[10px] text-neutral-400">{record.lastUpdated.split(' ').slice(3).join(' ')}</p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                          <motion.button 
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={(e) => {
                              e.stopPropagation();
                              setNewRecord(record);
                              setIsEditingRecord(true);
                              setShowAddModal(true);
                            }}
                            className="p-2 text-neutral-400 hover:text-purple-600 hover:bg-purple-100 rounded-xl transition-all"
                          >
                            <Edit2 size={16} />
                          </motion.button>
                          <motion.button 
                            whileHover={{ scale: 1.1, rotate: 5 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={(e) => { e.stopPropagation(); deleteRecord(record.id); }}
                            className="p-2 text-neutral-400 hover:text-red-600 hover:bg-red-100 rounded-xl transition-all"
                          >
                            <Trash2 size={16} />
                          </motion.button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          ) : (
            <div className="p-4 space-y-4">
              <AnimatePresence initial={false}>
                {filteredRecords.map((record) => (
                  <motion.div
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    key={record.id}
                    onClick={() => setSelectedRecord(record)}
                    className="bg-white border border-neutral-200 rounded-2xl p-4 shadow-sm active:scale-[0.98] transition-all"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl overflow-hidden bg-white border border-neutral-100 p-1 flex items-center justify-center shadow-sm">
                          <img 
                            src={getClientLogo(record.clientName)} 
                            alt={record.clientName} 
                            className="w-full h-full object-contain"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-neutral-800">{record.clientName}</h4>
                            {(Date.now() - new Date(record.lastUpdated.replace(',', '')).getTime() < 30000) && (
                              <span className="text-[8px] bg-purple-600 text-white px-1.5 py-0.5 rounded-full font-black animate-pulse">NEW</span>
                            )}
                          </div>
                          <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">{record.department}</p>
                        </div>
                      </div>
                      <div onClick={(e) => e.stopPropagation()}>
                        <select
                          value={record.responseStatus}
                          onChange={(e) => updateRecordStatus(record.id, e.target.value as any)}
                          className={cn(
                            "appearance-none cursor-pointer px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm outline-none transition-all border",
                            record.responseStatus === 'Completed' ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                            record.responseStatus === 'In Progress' ? "bg-amber-50 text-amber-600 border-amber-100" :
                            "bg-neutral-50 text-neutral-500 border-neutral-100"
                          )}
                        >
                          <option value="Pending">Pending</option>
                          <option value="In Progress">In Progress</option>
                          <option value="Completed">Completed</option>
                        </select>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Customer ID</span>
                        <span className="font-mono text-[10px] bg-neutral-100 px-2 py-0.5 rounded text-neutral-600 border border-neutral-200">
                          {record.customerId}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Issue</span>
                        <span className="text-xs font-semibold text-neutral-700">{record.issueType}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Last Updated</span>
                        <span className="text-[10px] font-bold text-neutral-800">{record.lastUpdated.split(' ').slice(3).join(' ')}</span>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-neutral-100 flex items-center justify-end gap-2">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setNewRecord(record);
                          setIsEditingRecord(true);
                          setShowAddModal(true);
                        }}
                        className="p-2 text-neutral-400 hover:text-purple-600 hover:bg-purple-100 rounded-xl transition-all"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); deleteRecord(record.id); }}
                        className="p-2 text-neutral-400 hover:text-red-600 hover:bg-red-100 rounded-xl transition-all"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
          
          {filteredRecords.length === 0 && (
            <div className="py-20 text-center">
              <div className="flex flex-col items-center gap-3 text-neutral-400">
                <Search size={48} className="opacity-20" />
                <p className="font-bold uppercase tracking-widest text-xs">No matching records found</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-neutral-100 bg-neutral-50/50 flex flex-col gap-4">
          <div className="flex items-center justify-between text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
            <div className="flex items-center gap-6">
              <span>Total: {records.length}</span>
              <span className="text-purple-500">Filtered: {filteredRecords.length}</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                Live Sync Active
              </span>
              <button 
                onClick={exportToCSV}
                className="hover:text-purple-600 transition-colors flex items-center gap-1 cursor-pointer"
              >
                Export CSV <ArrowRight size={12} />
              </button>
            </div>
          </div>
          
          {/* Scrolling Ticker */}
          <div className="overflow-hidden bg-neutral-100/50 rounded-lg py-1.5 px-3 border border-neutral-200">
            <div className="flex items-center gap-4 animate-marquee whitespace-nowrap">
              {globalLogs.map((log) => (
                <div key={log.id} className="flex items-center gap-2 shrink-0">
                  <span className="w-1 h-1 bg-purple-400 rounded-full" />
                  <span className="text-[9px] font-bold text-neutral-500 uppercase tracking-wider">{log.timestamp}</span>
                  <span className="text-[9px] font-medium text-neutral-600">{log.message}</span>
                </div>
              ))}
              {globalLogs.length === 0 && (
                <span className="text-[9px] text-neutral-400 italic">Initializing live stream...</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Right Sidebar: Task Panel */}
      <div className="w-full lg:w-80 space-y-6">
        <TaskPanel 
          tasks={tasks} 
          onUpdateStatus={updateTaskStatus} 
          onViewAll={() => setToast({ message: 'You are already in the workspace!', visible: true })}
        />
        
        {/* Global Activity Feed */}
        <div className="bg-white rounded-3xl p-6 border border-neutral-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-neutral-800 text-sm flex items-center gap-2">
              <Zap size={16} className="text-amber-500" />
              Live Activity Feed
            </h3>
            <span className="text-[8px] font-bold text-emerald-500 bg-emerald-50 px-1.5 py-0.5 rounded uppercase tracking-widest animate-pulse">Live</span>
          </div>
          <div className="space-y-3">
            <AnimatePresence initial={false}>
              {globalLogs.map((log) => (
                <motion.div 
                  key={log.id}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="p-2.5 bg-neutral-50 rounded-xl border border-neutral-100 flex flex-col gap-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-bold text-purple-600 uppercase tracking-wider">{log.sender}</span>
                    <span className="text-[8px] text-neutral-400">{log.timestamp}</span>
                  </div>
                  <p className="text-[11px] text-neutral-600 font-medium leading-tight">{log.message}</p>
                </motion.div>
              ))}
            </AnimatePresence>
            {globalLogs.length === 0 && (
              <p className="text-[10px] text-neutral-400 italic text-center py-4">Waiting for activity...</p>
            )}
          </div>
        </div>

        <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-3xl p-6 text-white shadow-xl">
          <h3 className="font-bold text-lg mb-1">Productivity Tip</h3>
          <p className="text-indigo-100 text-xs leading-relaxed">
            Updating records immediately after validation increases accuracy by 40%. Keep the workspace active!
          </p>
        </div>
      </div>

        </div>
      ) : (
        <SimulationModule />
      )}

      {/* Add Record Modal */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden"
            >
              <div className="bg-purple-600 p-6 text-white flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img src="/technotask_logo.png" alt="Logo" className="h-6 brightness-0 invert" />
                  <h3 className="text-xl font-bold">{isEditingRecord ? 'Edit MIS Record' : 'Add New MIS Record'}</h3>
                </div>
                <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-white/20 rounded-full transition-colors">
                  <X size={20} />
                </button>
              </div>
              
              <form onSubmit={handleAddRecord} className="p-4 md:p-8 space-y-4 md:space-y-5 overflow-y-auto max-h-[calc(90vh-80px)]">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] md:text-xs font-bold text-neutral-400 uppercase tracking-wider">Client</label>
                    <select 
                      className="w-full p-2.5 md:p-3 bg-neutral-50 border border-neutral-200 rounded-xl outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                      value={newRecord.clientName}
                      onChange={(e) => setNewRecord({...newRecord, clientName: e.target.value})}
                    >
                      <option>Amazon</option>
                      <option>Flipkart</option>
                      <option>Meesho</option>
                      <option>Zomato</option>
                      <option>Swiggy</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] md:text-xs font-bold text-neutral-400 uppercase tracking-wider">Department</label>
                    <select 
                      className="w-full p-2.5 md:p-3 bg-neutral-50 border border-neutral-200 rounded-xl outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                      value={newRecord.department}
                      onChange={(e) => setNewRecord({...newRecord, department: e.target.value})}
                    >
                      <option>Customer Support</option>
                      <option>Sales MIS</option>
                      <option>Operations MIS</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] md:text-xs font-bold text-neutral-400 uppercase tracking-wider">Issue Type</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Delivery Delay, Refund Request"
                    className="w-full p-2.5 md:p-3 bg-neutral-50 border border-neutral-200 rounded-xl outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                    value={newRecord.issueType || ''}
                    onChange={(e) => setNewRecord({...newRecord, issueType: e.target.value})}
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] md:text-xs font-bold text-neutral-400 uppercase tracking-wider">Status</label>
                  <div className="flex gap-2 md:gap-3">
                    {['Pending', 'In Progress', 'Completed'].map(status => (
                      <button
                        key={status}
                        type="button"
                        onClick={() => setNewRecord({...newRecord, responseStatus: status as any})}
                        className={cn(
                          "flex-1 py-2 rounded-xl text-[10px] md:text-xs font-bold border transition-all",
                          newRecord.responseStatus === status 
                            ? "bg-purple-600 text-white border-purple-600 shadow-lg shadow-purple-900/20" 
                            : "bg-white text-neutral-500 border-neutral-200 hover:border-purple-300"
                        )}
                      >
                        {status}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] md:text-xs font-bold text-neutral-400 uppercase tracking-wider">Remarks</label>
                  <textarea 
                    placeholder="Enter any additional notes..."
                    className="w-full p-2.5 md:p-3 bg-neutral-50 border border-neutral-200 rounded-xl outline-none focus:ring-2 focus:ring-purple-500 h-20 md:h-24 resize-none text-sm"
                    value={newRecord.remarks || ''}
                    onChange={(e) => setNewRecord({...newRecord, remarks: e.target.value})}
                  />
                </div>

                <button 
                  type="submit"
                  className="w-full bg-purple-600 text-white py-3 md:py-4 rounded-2xl font-bold text-base md:text-lg shadow-xl shadow-purple-900/20 hover:bg-purple-700 transition-all mt-2 md:mt-4"
                >
                  {isEditingRecord ? 'Update Record' : 'Create Record'}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Client Details Modal */}
      <AnimatePresence>
        {selectedRecord && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white rounded-3xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              {/* Modal Header */}
              <div className="bg-purple-600 p-4 md:p-6 text-white flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3 md:gap-4">
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-white/20 rounded-xl md:rounded-2xl flex items-center justify-center font-bold text-lg md:text-xl">
                    {selectedRecord.clientName.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-lg md:text-2xl font-bold">{selectedRecord.clientName} Details</h3>
                    <p className="text-purple-100 text-[10px] md:text-xs font-medium uppercase tracking-widest">{selectedRecord.department} • {selectedRecord.customerId}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 md:gap-3">
                  <img src="/technotask_logo.png" alt="Logo" className="h-4 md:h-6 brightness-0 invert mr-2 md:mr-4 hidden xs:block" />
                  <button onClick={() => setSelectedRecord(null)} className="p-2 hover:bg-white/20 rounded-full transition-colors">
                    <X size={20} className="md:w-6 md:h-6" />
                  </button>
                </div>
              </div>

              {/* Modal Body */}
              <div className="flex-1 overflow-y-auto p-4 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 custom-scrollbar">
                {/* Left Column: Info & Status */}
                <div className="space-y-6 md:space-y-8">
                  <section>
                    <h4 className="text-[10px] md:text-xs font-bold text-neutral-400 uppercase tracking-widest mb-3 md:mb-4 flex items-center gap-2">
                      <AlertCircle size={14} className="text-purple-500" />
                      Current Issue
                    </h4>
                    <div className="bg-neutral-50 rounded-2xl p-4 md:p-5 border border-neutral-100">
                      <p className="text-base md:text-lg font-bold text-neutral-800 mb-1 md:mb-2">{selectedRecord.issueType}</p>
                      <p className="text-xs md:text-sm text-neutral-500 leading-relaxed">{selectedRecord.remarks || 'No detailed remarks provided for this record.'}</p>
                    </div>
                  </section>

                  <section>
                    <h4 className="text-[10px] md:text-xs font-bold text-neutral-400 uppercase tracking-widest mb-3 md:mb-4">Update Status</h4>
                    <div className="flex gap-2 md:gap-3">
                      {['Pending', 'In Progress', 'Completed'].map(status => (
                        <button
                          key={status}
                          onClick={() => updateRecordStatus(selectedRecord.id, status as any)}
                          className={cn(
                            "flex-1 py-2 md:py-3 rounded-xl text-[10px] md:text-xs font-bold border transition-all flex flex-col items-center gap-1.5 md:gap-2",
                            selectedRecord.responseStatus === status 
                              ? "bg-purple-600 text-white border-purple-600 shadow-lg" 
                              : "bg-white text-neutral-500 border-neutral-200 hover:border-purple-300"
                          )}
                        >
                          {status === 'Completed' ? <CheckCircle size={16} className="md:w-[18px] md:h-[18px]" /> : 
                           status === 'In Progress' ? <Clock size={16} className="md:w-[18px] md:h-[18px]" /> : 
                           <AlertCircle size={16} className="md:w-[18px] md:h-[18px]" />}
                          {status}
                        </button>
                      ))}
                    </div>
                  </section>

                  <section>
                    <h4 className="text-[10px] md:text-xs font-bold text-neutral-400 uppercase tracking-widest mb-3 md:mb-4 flex items-center gap-2">
                      <Bell size={14} className="text-purple-500" />
                      Set Reminder
                    </h4>
                    
                    {reminders[selectedRecord.id] && (
                      <div className="mb-4 p-3 bg-purple-50 border border-purple-100 rounded-xl flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Clock size={14} className="text-purple-600" />
                          <span className="text-xs font-bold text-purple-700">
                            Active: {new Date(reminders[selectedRecord.id]).toLocaleString()}
                          </span>
                        </div>
                        <button 
                          onClick={() => {
                            const newReminders = { ...reminders };
                            delete newReminders[selectedRecord.id];
                            setReminders(newReminders);
                            setToast({ message: 'Reminder cleared', visible: true });
                          }}
                          className="text-purple-400 hover:text-purple-600 p-1"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    )}

                    <div className="flex flex-col sm:flex-row gap-2">
                      <input 
                        type="datetime-local" 
                        value={newReminder}
                        onChange={(e) => setNewReminder(e.target.value)}
                        className="flex-1 p-2.5 md:p-3 bg-neutral-50 border border-neutral-200 rounded-xl text-xs md:text-sm outline-none focus:ring-2 focus:ring-purple-500"
                      />
                      <button 
                        onClick={() => setReminder(selectedRecord.id)}
                        className="bg-purple-600 text-white px-4 md:px-6 py-2.5 md:py-3 rounded-xl font-bold text-xs md:text-sm hover:bg-purple-700 transition-all"
                      >
                        Set
                      </button>
                    </div>
                  </section>
                </div>

                {/* Right Column: Logs & Meetings */}
                <div className="space-y-6 md:space-y-8">
                  <section>
                    <h4 className="text-[10px] md:text-xs font-bold text-neutral-400 uppercase tracking-widest mb-3 md:mb-4 flex items-center gap-2">
                      <MessageSquare size={14} className="text-purple-500" />
                      Lively Activity Chat
                    </h4>
                    <div className="space-y-4 mb-4 max-h-48 md:max-h-60 overflow-y-auto custom-scrollbar p-1 md:p-2">
                      {(dailyLogs[selectedRecord.id] || []).map((log) => (
                        <motion.div 
                          key={log.id}
                          initial={{ opacity: 0, x: log.type === 'system' ? 0 : -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          className={cn(
                            "flex flex-col gap-1",
                            log.type === 'system' ? "items-center py-2" : ""
                          )}
                        >
                          {log.type === 'system' ? (
                            <div className="px-3 py-1 bg-neutral-100 rounded-full text-[8px] md:text-[9px] font-bold text-neutral-400 uppercase tracking-widest border border-neutral-200">
                              {log.message} • {log.timestamp}
                            </div>
                          ) : (
                            <>
                              <div className="flex items-center gap-2">
                                <div className="w-5 h-5 md:w-6 md:h-6 rounded-full bg-purple-100 flex items-center justify-center text-[9px] md:text-[10px] font-bold text-purple-600 border border-purple-200">
                                  {log.sender.charAt(0)}
                                </div>
                                <span className="text-[9px] md:text-[10px] font-bold text-neutral-500">{log.sender}</span>
                                <span className="text-[8px] text-neutral-400">{log.timestamp}</span>
                              </div>
                              <div className="p-2.5 md:p-3 bg-neutral-50 border border-neutral-100 rounded-2xl rounded-tl-none text-xs md:text-sm text-neutral-700 shadow-sm">
                                {log.message}
                              </div>
                            </>
                          )}
                        </motion.div>
                      ))}
                      {(!dailyLogs[selectedRecord.id] || dailyLogs[selectedRecord.id].length === 0) && (
                        <div className="text-center py-6 md:py-8">
                          <div className="w-10 h-10 md:w-12 md:h-12 bg-neutral-50 rounded-full flex items-center justify-center mx-auto mb-2 text-neutral-300">
                            <MessageSquare size={18} className="md:w-5 md:h-5" />
                          </div>
                          <p className="text-[10px] md:text-xs text-neutral-400 italic">No activity logs yet.</p>
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        placeholder="Type a lively update..."
                        value={newLog}
                        onChange={(e) => setNewLog(e.target.value)}
                        className="flex-1 p-2.5 md:p-3 bg-neutral-50 border border-neutral-200 rounded-xl text-xs md:text-sm outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                        onKeyPress={(e) => e.key === 'Enter' && addLog(selectedRecord.id)}
                      />
                      <button 
                        onClick={() => addLog(selectedRecord.id)}
                        className="bg-purple-600 text-white p-2.5 md:p-3 rounded-xl hover:bg-purple-700 transition-all shadow-lg shadow-purple-900/20"
                      >
                        <Plus size={18} className="md:w-5 md:h-5" />
                      </button>
                    </div>

                    {/* Lively Suggestions */}
                    <div className="flex flex-wrap gap-1.5 md:gap-2 mt-3 md:mt-4">
                      {LOG_SUGGESTIONS.map((suggestion) => (
                        <button
                          key={suggestion}
                          onClick={() => {
                            addLog(selectedRecord.id, suggestion);
                          }}
                          className="text-[9px] md:text-[10px] font-bold text-neutral-500 bg-neutral-100 hover:bg-purple-50 hover:text-purple-600 px-2 py-1 rounded-md transition-all border border-transparent hover:border-purple-100"
                        >
                          + {suggestion}
                        </button>
                      ))}
                    </div>
                  </section>

                  <section>
                    <h4 className="text-[10px] md:text-xs font-bold text-neutral-400 uppercase tracking-widest mb-3 md:mb-4 flex items-center gap-2">
                      <Calendar size={14} className="text-purple-500" />
                      Meeting Schedule
                    </h4>
                    <div className="space-y-2.5 md:space-y-3 mb-3 md:mb-4 max-h-32 md:max-h-40 overflow-y-auto custom-scrollbar">
                      {(meetings[selectedRecord.id] || []).map((m, i) => (
                        <div key={i} className="p-2.5 md:p-3 bg-neutral-50 border border-neutral-100 rounded-xl">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-[9px] md:text-[10px] font-bold text-purple-600 uppercase">{m.date} @ {m.time}</span>
                          </div>
                          <p className="text-[10px] md:text-xs text-neutral-700">{m.desc}</p>
                        </div>
                      ))}
                      {(!meetings[selectedRecord.id] || meetings[selectedRecord.id].length === 0) && (
                        <p className="text-[10px] md:text-xs text-neutral-400 italic">No meetings scheduled.</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <input 
                          type="date" 
                          value={newMeeting.date}
                          onChange={(e) => setNewMeeting({...newMeeting, date: e.target.value})}
                          className="flex-1 p-2 bg-neutral-50 border border-neutral-200 rounded-lg text-[10px] md:text-xs outline-none focus:ring-2 focus:ring-purple-500"
                        />
                        <input 
                          type="time" 
                          value={newMeeting.time}
                          onChange={(e) => setNewMeeting({...newMeeting, time: e.target.value})}
                          className="flex-1 p-2 bg-neutral-50 border border-neutral-200 rounded-lg text-[10px] md:text-xs outline-none focus:ring-2 focus:ring-purple-500"
                        />
                      </div>
                      <div className="flex gap-2">
                        <input 
                          type="text" 
                          placeholder="Meeting description..."
                          value={newMeeting.desc}
                          onChange={(e) => setNewMeeting({...newMeeting, desc: e.target.value})}
                          className="flex-1 p-2 bg-neutral-50 border border-neutral-200 rounded-lg text-[10px] md:text-xs outline-none focus:ring-2 focus:ring-purple-500"
                        />
                        <button 
                          onClick={() => scheduleMeeting(selectedRecord.id)}
                          className="bg-purple-600 text-white px-3 md:px-4 py-2 rounded-lg font-bold text-[10px] md:text-xs hover:bg-purple-700 transition-all"
                        >
                          Schedule
                        </button>
                      </div>
                    </div>
                  </section>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-4 md:p-6 bg-neutral-50 border-t border-neutral-100 flex justify-end gap-2 md:gap-3 shrink-0">
                <button 
                  onClick={() => setSelectedRecord(null)}
                  className="px-4 md:px-6 py-2 rounded-xl text-xs md:text-sm font-bold text-neutral-500 hover:bg-neutral-200 transition-all"
                >
                  Close
                </button>
                <button 
                  onClick={() => updateRecordStatus(selectedRecord.id, 'Completed')}
                  className="px-4 md:px-6 py-2 rounded-xl text-xs md:text-sm font-bold bg-emerald-600 text-white hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-900/20 flex items-center gap-1.5 md:gap-2"
                >
                  <CheckCircle2 size={16} className="md:w-[18px] md:h-[18px]" />
                  <span className="hidden xs:inline">Mark as Finalized</span>
                  <span className="xs:hidden">Finalize</span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Toast Notification */}
      <Toast 
        message={toast.message} 
        isVisible={toast.visible} 
        onClose={() => setToast(prev => ({ ...prev, visible: false }))} 
      />
    </div>
  );
}

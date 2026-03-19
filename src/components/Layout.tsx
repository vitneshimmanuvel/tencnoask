import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LayoutDashboard, 
  Table, 
  MessageSquare, 
  UserCircle, 
  Settings, 
  LogOut, 
  Bell, 
  Clock, 
  Search,
  ChevronRight,
  Menu,
  X,
  Zap,
  CalendarDays,
  Megaphone
} from 'lucide-react';
import { User, Notification } from '../types';
import { useWorkTimer, useIdleDetection } from '../hooks/useWorkHub';
import { cn } from '../lib/utils';
import Logo from './Logo';
import { format } from 'date-fns';

interface LayoutProps {
  user: User;
  onLogout: () => void;
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const TaskReminder = ({ message, onClose }: { message: string, onClose: () => void }) => (
  <motion.div 
    initial={{ x: 300, opacity: 0 }}
    animate={{ x: 0, opacity: 1 }}
    exit={{ x: 300, opacity: 0 }}
    className="fixed bottom-24 right-8 z-50 bg-white rounded-2xl shadow-2xl border-l-4 border-purple-600 p-4 max-w-xs flex items-start gap-3"
  >
    <div className="w-10 h-10 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center flex-shrink-0 animate-bounce">
      <Zap size={20} />
    </div>
    <div>
      <h4 className="font-black text-neutral-800 text-sm">Task Reminder! ⚡</h4>
      <p className="text-xs text-neutral-500 mt-1 leading-relaxed">{message}</p>
      <button 
        onClick={onClose}
        className="text-[10px] font-bold text-purple-600 mt-2 hover:underline"
      >
        Got it, thanks!
      </button>
    </div>
  </motion.div>
);

export default function Layout({ user, onLogout, children, activeTab, setActiveTab }: LayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 768);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showIdleWarning, setShowIdleWarning] = useState(false);
  const [reminder, setReminder] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(() => {
    return localStorage.getItem(`profile_image_${user.id}`);
  });
  const { elapsedTime, remainingTime, isOverLimit } = useWorkTimer();

  useEffect(() => {
    const handleUpdate = () => {
      setProfileImage(localStorage.getItem(`profile_image_${user.id}`));
    };
    window.addEventListener('profile_image_updated', handleUpdate);
    return () => window.removeEventListener('profile_image_updated', handleUpdate);
  }, [user.id]);

  useEffect(() => {
    const fetchNotifications = async (retries = 3) => {
      try {
        const res = await fetch(`/api/notifications/${user.id}`);
        if (!res.ok) {
          const text = await res.text();
          throw new Error(`HTTP error! status: ${res.status}, body: ${text.substring(0, 100)}`);
        }
        const data = await res.json();
        if (Array.isArray(data)) {
          setNotifications(data);
        } else {
          console.error("Notifications data is not an array:", data);
        }
      } catch (err) {
        console.warn('Failed to fetch notifications, using mock data (Dummy Mode):', err);
        const mockNotifications: Notification[] = [
          { id: 1, userId: user.id, title: 'Welcome to WorkHub', message: 'Explore your new MIS dashboard and team chat.', type: 'system', isRead: 0, timestamp: new Date().toISOString() },
          { id: 2, userId: user.id, title: 'System Update', message: 'New features added to the Admin Panel.', type: 'announcement', isRead: 0, timestamp: new Date().toISOString() }
        ];
        setNotifications(mockNotifications);
        
        if (retries > 0 && !err.toString().includes('Failed to fetch')) {
          console.log(`Retrying notifications fetch... (${retries} attempts left)`);
          setTimeout(() => fetchNotifications(retries - 1), 2000);
        }
      }
    };

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // Poll every 30s
    return () => clearInterval(interval);
  }, [user.id]);

  const markNotificationsRead = async () => {
    try {
      await fetch('/api/notifications/read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id })
      });
      setNotifications(notifications.map(n => ({ ...n, isRead: 1 })));
    } catch (err) {
      console.error('Failed to mark notifications as read', err);
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  useIdleDetection(10, () => setShowIdleWarning(true));

  useEffect(() => {
    if (isOverLimit) {
      alert("Daily work limit reached. System will now log you out.");
      onLogout();
    }
  }, [isOverLimit, onLogout]);

  useEffect(() => {
    const reminders = [
      "Don't forget to update the Amazon MIS records!",
      "You have 3 pending tasks in Customer Support.",
      "Time for a quick stretch! Stay productive! 🚀",
      "Check the new client requirements in the Support Center.",
      "Great job so far! Keep the momentum going! ✨"
    ];

    const interval = setInterval(() => {
      if (Math.random() < 0.3) {
        setReminder(reminders[Math.floor(Math.random() * reminders.length)]);
        setTimeout(() => setReminder(null), 6000);
      }
    }, 45000); // Check every 45 seconds

    return () => clearInterval(interval);
  }, []);

  const navItems = [
    { id: 'dashboard', label: 'Work Dashboard', icon: LayoutDashboard },
    { id: 'workspace', label: 'MIS Workspace', icon: Table },
    { id: 'chat', label: 'Team Chat', icon: MessageSquare },
    { id: 'leave', label: 'Support & Leave', icon: CalendarDays },
    { id: 'analytics', label: 'Work Analytics', icon: Zap },
    { id: 'profile', label: 'My Profile', icon: UserCircle },
  ];

  if (user.role === 'Admin') {
    navItems.push({ id: 'admin', label: 'Admin Panel', icon: Settings });
  }

  return (
    <div className="flex h-screen bg-neutral-100 overflow-hidden font-sans relative">
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMobileMenuOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside 
        initial={false}
        animate={{ 
          width: window.innerWidth < 768 ? 260 : (isSidebarOpen ? 260 : 80),
          x: isMobileMenuOpen ? 0 : (window.innerWidth < 768 ? -260 : 0)
        }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className={cn(
          "bg-neutral-900 text-white flex flex-col fixed inset-y-0 left-0 z-50 md:relative",
          !isSidebarOpen && "md:w-20"
        )}
      >
        <div className="p-6 flex items-center justify-between border-b border-neutral-800 overflow-hidden">
          <div className="flex items-center gap-3">
            {(isSidebarOpen || isMobileMenuOpen) ? (
              <Logo className="h-8 w-40" />
            ) : (
              <div className="w-8 h-8 bg-purple-600 rounded-lg flex-shrink-0 flex items-center justify-center mx-auto">
                <Zap size={20} className="text-white" />
              </div>
            )}
          </div>
          <button 
            onClick={() => setIsMobileMenuOpen(false)}
            className="md:hidden text-neutral-400 hover:text-white"
          >
            <X size={24} />
          </button>
        </div>

        <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto custom-scrollbar">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                if (window.innerWidth < 768) setIsMobileMenuOpen(false);
              }}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all group",
                activeTab === item.id 
                  ? "bg-purple-600 text-white shadow-lg shadow-purple-900/20" 
                  : "text-neutral-400 hover:bg-neutral-800 hover:text-white"
              )}
            >
              <item.icon size={22} className={cn(activeTab === item.id ? "text-white" : "group-hover:text-purple-400")} />
              {(isSidebarOpen || isMobileMenuOpen) && <span className="font-medium whitespace-nowrap">{item.label}</span>}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-neutral-800">
          <button 
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-neutral-400 hover:bg-red-500/10 hover:text-red-500 transition-all"
          >
            <LogOut size={22} />
            {(isSidebarOpen || isMobileMenuOpen) && <span className="font-medium">Logout</span>}
          </button>
        </div>

        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="absolute -right-3 top-20 bg-purple-600 text-white p-1 rounded-full shadow-lg border-2 border-neutral-100 hidden md:block"
        >
          {isSidebarOpen ? <ChevronRight size={14} className="rotate-180" /> : <ChevronRight size={14} />}
        </button>
      </motion.aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden w-full">
        {/* Header */}
        <header className="h-16 bg-white border-b border-neutral-200 px-4 md:px-6 flex items-center justify-between z-20">
          <div className="flex items-center gap-3 md:gap-6">
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="md:hidden p-2 text-neutral-600 hover:bg-neutral-100 rounded-lg"
            >
              <Menu size={24} />
            </button>
            <div className="hidden xs:block">
              <Logo className="h-6 md:h-8 w-24 md:w-32" />
            </div>
            <div className="hidden sm:flex items-center gap-2 bg-neutral-100 px-3 py-1.5 rounded-full text-[10px] md:text-xs font-semibold text-neutral-600">
              <Clock size={14} className="text-purple-600" />
              <span>Worked: {elapsedTime}</span>
              <span className="mx-1 text-neutral-300">|</span>
              <span className="text-neutral-400">Rem: {remainingTime}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-4">
            <div className="text-right hidden md:block">
              <p className="text-sm font-bold text-neutral-800">{user.name}</p>
              <p className="text-[10px] uppercase tracking-wider text-neutral-400 font-bold">{user.department}</p>
            </div>
            <div className="relative">
              <button 
                onClick={() => {
                  setShowNotifications(!showNotifications);
                  if (!showNotifications && unreadCount > 0) markNotificationsRead();
                }}
                className="p-2 text-neutral-400 hover:text-purple-600 transition-colors relative"
              >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full border-2 border-white flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>

              <AnimatePresence>
                {showNotifications && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-neutral-100 z-50 overflow-hidden"
                  >
                    <div className="p-4 border-b border-neutral-100 flex items-center justify-between bg-neutral-50/50">
                      <h4 className="font-black text-neutral-800 text-sm">Notifications</h4>
                      <span className="text-[10px] font-bold text-purple-600 uppercase tracking-widest">{unreadCount} New</span>
                    </div>
                    <div className="max-h-[400px] overflow-y-auto">
                      {notifications.length > 0 ? (
                        notifications.map((n) => (
                          <div 
                            key={n.id} 
                            className={cn(
                              "p-4 border-b border-neutral-50 hover:bg-neutral-50 transition-colors cursor-pointer",
                              !n.isRead && "bg-purple-50/30"
                            )}
                          >
                            <div className="flex items-start gap-3">
                              <div className={cn(
                                "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5",
                                n.type === 'announcement' ? "bg-amber-100 text-amber-600" : "bg-purple-100 text-purple-600"
                              )}>
                                {n.type === 'announcement' ? <Megaphone size={14} /> : <Bell size={14} />}
                              </div>
                              <div className="flex-1">
                                <p className="text-xs font-bold text-neutral-800">{n.title}</p>
                                <p className="text-[11px] text-neutral-500 mt-0.5 leading-relaxed">{n.message}</p>
                                <p className="text-[9px] text-neutral-400 font-medium mt-1.5">{format(new Date(n.timestamp), 'MMM dd, hh:mm a')}</p>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="p-8 text-center">
                          <Bell className="mx-auto text-neutral-200 mb-2" size={32} />
                          <p className="text-xs text-neutral-400 font-medium">No notifications yet</p>
                        </div>
                      )}
                    </div>
                    <button className="w-full py-3 text-[10px] font-black text-neutral-400 uppercase tracking-widest hover:bg-neutral-50 transition-colors border-t border-neutral-100">
                      View All Activity
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white font-bold shadow-md overflow-hidden">
              {profileImage ? (
                <img src={profileImage} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                user.name.charAt(0)
              )}
            </div>
          </div>
        </header>

        {/* Scrolling Ticker */}
        <div className="bg-purple-900 text-white py-1.5 overflow-hidden relative">
          <div className="flex whitespace-nowrap animate-marquee">
            <span className="mx-8">📢 New Performance Review cycle starts next week.</span>
            <span className="mx-8">🏆 {user.name} achieved top productivity this week!</span>
            <span className="mx-8">📢 New client dataset uploaded for Amazon MIS processing.</span>
            <span className="mx-8">📢 MIS Department completed 1,200 records today.</span>
            {/* Duplicate for seamless loop */}
            <span className="mx-8">📢 New Performance Review cycle starts next week.</span>
            <span className="mx-8">🏆 {user.name} achieved top productivity this week!</span>
            <span className="mx-8">📢 New client dataset uploaded for Amazon MIS processing.</span>
            <span className="mx-8">📢 MIS Department completed 1,200 records today.</span>
          </div>
        </div>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-neutral-50/50">
          {children}
        </main>
      </div>

      {/* Idle Warning Overlay */}
      <AnimatePresence>
        {reminder && (
          <TaskReminder message={reminder} onClose={() => setReminder(null)} />
        )}
        {showIdleWarning && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-2xl p-8 max-w-sm w-full text-center shadow-2xl"
            >
              <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock size={32} />
              </div>
              <h2 className="text-xl font-bold text-neutral-800 mb-2">Idle Detection</h2>
              <p className="text-neutral-500 mb-6">You have been inactive for 10 minutes. Please resume work to keep your session active.</p>
              <button 
                onClick={() => setShowIdleWarning(false)}
                className="w-full bg-purple-600 text-white py-3 rounded-xl font-bold hover:bg-purple-700 transition-colors"
              >
                Resume Work
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

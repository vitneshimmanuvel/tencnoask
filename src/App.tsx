import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { User } from './types';
import Login from './components/Login';
import Layout from './components/Layout';
import DashboardHome from './components/DashboardHome';
import MISGrid from './components/MISGrid';
import ChatSystem from './components/ChatSystem';
import Analytics from './components/Analytics';
import Profile from './components/Profile';
import LeaveManagement from './components/LeaveManagement';
import AdminPanel from './components/AdminPanel';
import Logo from './components/Logo';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('workhub_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const handleLogin = (userData: User) => {
    setUser(userData);
    localStorage.setItem('workhub_user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('workhub_user');
    localStorage.removeItem('work_start_time');
  };

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-neutral-900">
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center gap-8"
        >
          <motion.div
            animate={{ 
              filter: ["drop-shadow(0 0 0px #8b5cf6)", "drop-shadow(0 0 20px #8b5cf6)", "drop-shadow(0 0 0px #8b5cf6)"]
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Logo className="h-16 w-64" />
          </motion.div>
          <div className="flex flex-col items-center gap-2">
            <div className="w-48 h-1 bg-neutral-800 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ duration: 2, ease: "easeInOut" }}
                className="h-full bg-purple-600"
              />
            </div>
            <p className="text-neutral-500 font-bold uppercase tracking-widest text-[10px]">Initializing Secure WorkHub Portal...</p>
          </div>
        </motion.div>
      </div>
    );
  }

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <Layout 
      user={user} 
      onLogout={handleLogout} 
      activeTab={activeTab} 
      setActiveTab={setActiveTab}
    >
      {activeTab === 'dashboard' && (
        <DashboardHome 
          user={user} 
          onNewEntry={() => setActiveTab('workspace')} 
          onViewTasks={() => setActiveTab('workspace')}
        />
      )}
      {activeTab === 'workspace' && <MISGrid />}
      {activeTab === 'chat' && <ChatSystem currentUser={user} />}
      {activeTab === 'analytics' && <Analytics />}
      {activeTab === 'profile' && <Profile user={user} />}
      {activeTab === 'leave' && <LeaveManagement user={user} />}
      {activeTab === 'admin' && user.role === 'Admin' && (
        <AdminPanel user={user} />
      )}
    </Layout>
  );
}

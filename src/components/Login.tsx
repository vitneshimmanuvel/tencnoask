import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Lock, User, ShieldAlert } from 'lucide-react';
import { User as UserType } from '../types';
import Logo from './Logo';

interface LoginProps {
  onLogin: (user: UserType) => void;
}

export default function Login({ onLogin }: LoginProps) {
  const [employeeId, setEmployeeId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ employeeId, password }),
      });

      const data = await response.json();
      if (data.success) {
        onLogin(data.user);
      } else {
        setError(data.message || 'Invalid credentials');
      }
    } catch (err) {
      setError('Connection failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-100 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden"
      >
        <div className="bg-white p-6 md:p-8 text-center border-b border-neutral-100">
          <Logo className="h-12 md:h-16 w-48 md:w-64 mx-auto mb-4" />
          <h1 className="text-xl md:text-2xl font-bold text-neutral-800">WorkHub Portal</h1>
          <p className="text-neutral-500 text-xs md:text-sm mt-1 font-medium">Advanced MIS CRM System</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-4 md:space-y-6">
          {error && (
            <motion.div 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-red-50 text-red-600 p-3 rounded-lg text-sm flex items-center gap-2"
            >
              <ShieldAlert size={18} />
              {error}
            </motion.div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-semibold text-neutral-700">Employee ID</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={18} />
              <input 
                type="text" 
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
                placeholder="e.g. MIS1001"
                className="w-full pl-10 pr-4 py-2 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-neutral-700">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={18} />
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                required
              />
            </div>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-purple-600 to-indigo-700 text-white py-2 rounded-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {loading ? 'Authenticating...' : 'Login to Dashboard'}
          </button>

          <div className="flex justify-between text-[10px] md:text-xs text-neutral-500 pt-2">
            <button type="button" className="hover:text-purple-600">Forgot Password?</button>
            <button type="button" className="hover:text-purple-600">Contact HR</button>
          </div>
        </form>

        <div className="bg-neutral-50 p-4 text-center border-t border-neutral-100">
          <p className="text-xs text-neutral-400">© 2026 Technotask Business Solutions. All rights reserved.</p>
        </div>
      </motion.div>
    </div>
  );
}

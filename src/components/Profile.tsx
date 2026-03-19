import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Briefcase, 
  Calendar, 
  Building2, 
  Award,
  BookOpen,
  Code,
  Edit3,
  Camera
} from 'lucide-react';
import { User as UserType } from '../types';

interface ProfileProps {
  user: UserType;
}

export default function Profile({ user }: ProfileProps) {
  const [profileImage, setProfileImage] = useState<string | null>(() => {
    return localStorage.getItem(`profile_image_${user.id}`);
  });
  const [isEditing, setIsEditing] = useState(false);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setProfileImage(base64String);
        localStorage.setItem(`profile_image_${user.id}`, base64String);
        // Trigger a custom event to notify other components (like Layout)
        window.dispatchEvent(new Event('profile_image_updated'));
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header Card */}
      <div className="bg-white rounded-3xl shadow-sm border border-neutral-200 overflow-hidden">
        <div className="h-48 bg-gradient-to-r from-purple-600 via-indigo-700 to-purple-900 relative">
          <button 
            onClick={() => setIsEditing(!isEditing)}
            className="absolute top-4 right-4 bg-white/20 hover:bg-white/30 backdrop-blur-md text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-all"
          >
            <Edit3 size={16} />
            {isEditing ? 'Save Profile' : 'Edit Profile'}
          </button>
        </div>
        <div className="px-4 md:px-8 pb-8 flex flex-col md:flex-row gap-6 md:gap-8 items-center md:items-start -mt-16 md:-mt-16 relative">
          <div className="relative group">
            <div className="w-32 h-32 md:w-40 md:h-40 rounded-3xl bg-white p-2 shadow-xl">
              <div className="w-full h-full rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white text-4xl md:text-5xl font-bold overflow-hidden">
                {profileImage ? (
                  <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  user.name.charAt(0)
                )}
              </div>
            </div>
            <label className="absolute bottom-1 right-1 md:bottom-2 md:right-2 p-2 bg-purple-600 text-white rounded-xl shadow-lg hover:bg-purple-700 transition-all cursor-pointer">
              <Camera size={16} className="md:w-[18px] md:h-[18px]" />
              <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
            </label>
          </div>
          
          <div className="flex-1 pt-4 md:pt-16 text-center md:text-left">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-2">
              {isEditing ? (
                <input 
                  type="text" 
                  defaultValue={user.name}
                  className="text-2xl md:text-3xl font-bold text-neutral-800 border-b-2 border-purple-500 outline-none bg-transparent text-center md:text-left"
                />
              ) : (
                <h1 className="text-2xl md:text-3xl font-bold text-neutral-800">{user.name}</h1>
              )}
              <span className="bg-purple-100 text-purple-700 text-[9px] md:text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider">
                {user.role}
              </span>
            </div>
            <p className="text-neutral-500 font-medium flex items-center justify-center md:justify-start gap-2 text-sm md:text-base">
              <Briefcase size={14} className="text-purple-500 md:w-4 md:h-4" />
              {user.position} • {user.department}
            </p>
            
            <div className="flex flex-wrap justify-center md:justify-start gap-4 md:gap-6 mt-6">
              <div className="flex items-center gap-2 text-xs md:text-sm text-neutral-600">
                <Mail size={14} className="text-neutral-400 md:w-4 md:h-4" />
                {user.email}
              </div>
              <div className="flex items-center gap-2 text-xs md:text-sm text-neutral-600">
                <Phone size={14} className="text-neutral-400 md:w-4 md:h-4" />
                {user.phone}
              </div>
              <div className="flex items-center gap-2 text-xs md:text-sm text-neutral-600">
                <MapPin size={14} className="text-neutral-400 md:w-4 md:h-4" />
                {user.location}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Column: Details */}
        <div className="md:col-span-1 space-y-8">
          <div className="bg-white rounded-3xl shadow-sm border border-neutral-200 p-6">
            <h3 className="font-bold text-neutral-800 mb-6 flex items-center gap-2">
              <Building2 size={18} className="text-purple-600" />
              Employment Info
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-neutral-50">
                <span className="text-sm text-neutral-400">Employee ID</span>
                <span className="text-sm font-bold text-neutral-700">{user.id}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-neutral-50">
                <span className="text-sm text-neutral-400">Branch</span>
                <span className="text-sm font-bold text-neutral-700">{user.branch}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-neutral-50">
                <span className="text-sm text-neutral-400">Joining Date</span>
                <span className="text-sm font-bold text-neutral-700">{user.joining_date}</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-sm text-neutral-400">Reporting To</span>
                <span className="text-sm font-bold text-neutral-700">Operations Head</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-sm border border-neutral-200 p-6">
            <h3 className="font-bold text-neutral-800 mb-6 flex items-center gap-2">
              <Code size={18} className="text-purple-600" />
              Technical Skills
            </h3>
            <div className="flex flex-wrap gap-2">
              {['Advanced Excel', 'MIS Reporting', 'Data Analysis', 'SQL', 'Python', 'Power BI'].map(skill => (
                <span key={skill} className="px-3 py-1 bg-neutral-100 text-neutral-600 rounded-lg text-xs font-semibold">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Experience & Projects */}
        <div className="md:col-span-2 space-y-8">
          <div className="bg-white rounded-3xl shadow-sm border border-neutral-200 p-8">
            <h3 className="font-bold text-neutral-800 mb-8 flex items-center gap-2 text-lg md:text-xl">
              <Award size={22} className="text-purple-600" />
              Key Achievements
            </h3>
            <div className="space-y-8">
              <div className="relative pl-6 md:pl-8 border-l-2 border-purple-100">
                <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-white border-2 border-purple-600" />
                <h4 className="font-bold text-neutral-800 text-sm md:text-base">Top Productivity Award - Q4 2025</h4>
                <p className="text-xs md:text-sm text-neutral-500 mt-1">Achieved 120% target completion across all assigned client MIS reports.</p>
              </div>
              <div className="relative pl-6 md:pl-8 border-l-2 border-purple-100">
                <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-white border-2 border-purple-600" />
                <h4 className="font-bold text-neutral-800 text-sm md:text-base">MIS Process Optimization</h4>
                <p className="text-xs md:text-sm text-neutral-500 mt-1">Reduced data entry errors by 40% through implementation of advanced validation scripts.</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-sm border border-neutral-200 p-8">
            <h3 className="font-bold text-neutral-800 mb-8 flex items-center gap-2 text-lg md:text-xl">
              <BookOpen size={22} className="text-purple-600" />
              Education
            </h3>
            <div className="space-y-6">
              <div>
                <h4 className="font-bold text-neutral-800 text-sm md:text-base">Master of Computer Applications (MCA)</h4>
                <p className="text-xs md:text-sm text-neutral-500">Anna University • 2021 - 2023</p>
              </div>
              <div>
                <h4 className="font-bold text-neutral-800 text-sm md:text-base">Bachelor of Science in IT</h4>
                <p className="text-xs md:text-sm text-neutral-500">Bharathiar University • 2018 - 2021</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Megaphone, 
  Calendar, 
  PartyPopper, 
  Image as ImageIcon, 
  ChevronLeft, 
  ChevronRight,
  Heart,
  MessageCircle,
  Share2,
  Trophy,
  Sparkles,
  Loader2
} from 'lucide-react';
import { COMPANY_LIFE_IMAGES } from '../constants';
import { cn } from '../lib/utils';
import { generateDailyContent, Announcement, Highlight } from '../services/geminiService';

export default function CompanyLife() {
  const [currentImage, setCurrentImage] = useState(0);
  const [viewMode, setViewMode] = useState<'carousel' | 'grid'>('carousel');
  const [showPopup, setShowPopup] = useState(false);
  const [popupContent, setPopupContent] = useState({ title: '', message: '', type: 'info' });
  const [loading, setLoading] = useState(true);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [highlights, setHighlights] = useState<Highlight[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const today = new Date().toISOString().split('T')[0];
        
        // Try to get existing content first
        let content;
        try {
          const existingRes = await fetch(`/api/daily-content?date=${today}`);
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
              console.warn("Failed to generate content, using dummy data:", genError);
              content = {
                announcements: [
                  { id: 1, title: "Quarterly Town Hall", date: "25 Mar", message: "Join us for the Q1 town hall meeting in the main conference room.", type: "news" },
                  { id: 2, title: "New Client Onboarding", date: "22 Mar", message: "We are excited to welcome a new major retail client to our Mysore hub.", type: "celebration" },
                  { id: 3, title: "System Maintenance", date: "20 Mar", message: "Scheduled maintenance for the MIS portal this weekend.", type: "alert" }
                ],
                highlights: [
                  { id: 1, user: "Arjun K", status: "Completed 500+ records", time: "2h ago" },
                  { id: 2, user: "Priya M", status: "New team lead for Amazon project", time: "4h ago" },
                  { id: 3, user: "Suresh R", status: "Perfect attendance for 6 months", time: "5h ago" }
                ],
                birthday: { userName: "Rahul S", message: "Wishing Rahul S a very Happy Birthday! 🎂" }
              };
            }
          }
        } catch (fetchError) {
          console.warn("Failed to fetch content, using dummy data:", fetchError);
          content = {
            announcements: [
              { id: 1, title: "Quarterly Town Hall", date: "25 Mar", message: "Join us for the Q1 town hall meeting in the main conference room.", type: "news" },
              { id: 2, title: "New Client Onboarding", date: "22 Mar", message: "We are excited to welcome a new major retail client to our Mysore hub.", type: "celebration" },
              { id: 3, title: "System Maintenance", date: "20 Mar", message: "Scheduled maintenance for the MIS portal this weekend.", type: "alert" }
            ],
            highlights: [
              { id: 1, user: "Arjun K", status: "Completed 500+ records", time: "2h ago" },
              { id: 2, user: "Priya M", status: "New team lead for Amazon project", time: "4h ago" },
              { id: 3, user: "Suresh R", status: "Perfect attendance for 6 months", time: "5h ago" }
            ],
            birthday: { userName: "Rahul S", message: "Wishing Rahul S a very Happy Birthday! 🎂" }
          };
        }
        
        setAnnouncements(content.announcements);
        setHighlights(content.highlights);
        
        // Check if we've already shown the birthday popup today
        const lastShown = sessionStorage.getItem('birthday_popup_shown');
        if (lastShown !== today) {
          // Check for real birthdays first
          try {
            const bdayRes = await fetch('/api/users/birthdays');
            const realBdays = await bdayRes.json();
            
            if (realBdays.length > 0) {
              setPopupContent({
                title: "🎉 Happy Birthday!",
                message: `Join us in wishing ${realBdays[0].name} a very Happy Birthday!`,
                type: "birthday"
              });
              setShowPopup(true);
              sessionStorage.setItem('birthday_popup_shown', today);
            } else if (content.birthday) {
              setPopupContent({
                title: "🎉 Happy Birthday!",
                message: content.birthday.message,
                type: "birthday"
              });
              setTimeout(() => {
                setShowPopup(true);
                sessionStorage.setItem('birthday_popup_shown', today);
              }, 5000);
            }
          } catch (bdayError) {
            console.warn("Failed to fetch birthdays, using content birthday:", bdayError);
            if (content.birthday) {
              setPopupContent({
                title: "🎉 Happy Birthday!",
                message: content.birthday.message,
                type: "birthday"
              });
              setTimeout(() => {
                setShowPopup(true);
                sessionStorage.setItem('birthday_popup_shown', today);
              }, 5000);
            }
          }
        }
      } catch (error) {
        console.error("Error fetching dynamic content:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    const timer = setInterval(() => {
      if (viewMode === 'carousel') {
        setCurrentImage((prev) => (prev + 1) % COMPANY_LIFE_IMAGES.length);
      }
    }, 5000);

    return () => clearInterval(timer);
  }, [viewMode]);

  if (loading) {
    return (
      <div className="h-96 flex flex-col items-center justify-center bg-white rounded-3xl border border-neutral-200 shadow-sm">
        <Loader2 className="w-10 h-10 text-purple-600 animate-spin mb-4" />
        <p className="text-neutral-500 font-bold animate-pulse">Generating daily highlights...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with View Toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-purple-600 text-white rounded-xl flex items-center justify-center shadow-lg shadow-purple-900/20">
            <ImageIcon size={20} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-neutral-800">Company Life</h2>
            <p className="text-xs text-neutral-400 font-medium">Daily updates and team highlights from Technotask Mysore</p>
          </div>
        </div>
        <div className="flex bg-neutral-100 p-1 rounded-xl">
          <button 
            onClick={() => setViewMode('carousel')}
            className={cn(
              "px-4 py-1.5 rounded-lg text-xs font-bold transition-all",
              viewMode === 'carousel' ? "bg-white text-purple-600 shadow-sm" : "text-neutral-400 hover:text-neutral-600"
            )}
          >
            Carousel
          </button>
          <button 
            onClick={() => setViewMode('grid')}
            className={cn(
              "px-4 py-1.5 rounded-lg text-xs font-bold transition-all",
              viewMode === 'grid' ? "bg-white text-purple-600 shadow-sm" : "text-neutral-400 hover:text-neutral-600"
            )}
          >
            Grid Gallery
          </button>
        </div>
      </div>

      {/* Photo Gallery */}
      <div className="relative">
        {viewMode === 'carousel' ? (
          <div className="relative group rounded-2xl md:rounded-3xl overflow-hidden shadow-xl aspect-video md:aspect-[21/9] bg-neutral-900">
            <AnimatePresence mode="wait">
              <motion.img 
                key={currentImage}
                src={COMPANY_LIFE_IMAGES[currentImage].url}
                initial={{ opacity: 0, scale: 1.1 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.8 }}
                className="w-full h-full object-cover opacity-80"
                referrerPolicy="no-referrer"
              />
            </AnimatePresence>
            
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent flex flex-col justify-end p-6 md:p-10">
              <motion.div 
                key={currentImage + '_content'}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="space-y-1 md:space-y-2"
              >
                <div className="flex items-center gap-2 md:gap-3">
                  <span className="bg-purple-600 text-white text-[8px] md:text-[10px] font-bold px-1.5 md:px-2 py-0.5 md:py-1 rounded uppercase tracking-widest">
                    {COMPANY_LIFE_IMAGES[currentImage].category}
                  </span>
                  <span className="text-neutral-400 text-[8px] md:text-[10px] font-bold uppercase tracking-widest flex items-center gap-1">
                    <Calendar size={10} className="md:w-3 md:h-3" />
                    {COMPANY_LIFE_IMAGES[currentImage].date}
                  </span>
                </div>
                <h2 className="text-xl md:text-3xl font-bold text-white line-clamp-1 md:line-clamp-none">{COMPANY_LIFE_IMAGES[currentImage].caption}</h2>
                <p className="text-neutral-300 text-xs md:text-sm max-w-2xl line-clamp-2 md:line-clamp-none">Daily snapshot from our Mysore operations center. Keeping the team spirit high!</p>
              </motion.div>
            </div>

            <button 
              onClick={() => setCurrentImage((prev) => (prev - 1 + COMPANY_LIFE_IMAGES.length) % COMPANY_LIFE_IMAGES.length)}
              className="absolute left-2 md:left-6 top-1/2 -translate-y-1/2 p-2 md:p-3 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full text-white opacity-0 group-hover:opacity-100 transition-all transform -translate-x-2 md:-translate-x-4 group-hover:translate-x-0"
            >
              <ChevronLeft size={20} className="md:w-6 md:h-6" />
            </button>
            <button 
              onClick={() => setCurrentImage((prev) => (prev + 1) % COMPANY_LIFE_IMAGES.length)}
              className="absolute right-2 md:right-6 top-1/2 -translate-y-1/2 p-2 md:p-3 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full text-white opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 md:translate-x-4 group-hover:translate-x-0"
            >
              <ChevronRight size={20} className="md:w-6 md:h-6" />
            </button>

            <div className="absolute top-4 md:top-6 right-6 md:right-10 flex gap-1.5 md:gap-2">
              {COMPANY_LIFE_IMAGES.map((_, i) => (
                <div 
                  key={i}
                  className={cn(
                    "w-1.5 h-1.5 md:w-2 md:h-2 rounded-full transition-all",
                    currentImage === i ? "bg-purple-500 w-4 md:w-6" : "bg-white/30"
                  )}
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {COMPANY_LIFE_IMAGES.map((img, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1 }}
                className="group relative rounded-xl md:rounded-2xl overflow-hidden shadow-md aspect-square bg-neutral-100"
              >
                <img 
                  src={img.url} 
                  alt={img.caption} 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3 md:p-4">
                  <p className="text-white font-bold text-xs md:text-sm leading-tight line-clamp-2">{img.caption}</p>
                  <p className="text-neutral-300 text-[8px] md:text-[10px] mt-1 font-medium">{img.date}</p>
                </div>
                <div className="absolute top-2 md:top-3 left-2 md:left-3">
                  <span className="bg-white/90 backdrop-blur-md text-neutral-800 text-[8px] md:text-[9px] font-bold px-1.5 md:px-2 py-0.5 md:py-1 rounded-lg uppercase tracking-wider shadow-sm">
                    {img.category}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Announcements */}
        <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-4 md:p-6">
          <div className="flex items-center gap-3 mb-4 md:mb-6">
            <div className="w-8 h-8 md:w-10 md:h-10 bg-purple-100 text-purple-600 rounded-lg md:rounded-xl flex items-center justify-center">
              <Megaphone size={18} className="md:w-5 md:h-5" />
            </div>
            <h3 className="font-bold text-neutral-800 text-base md:text-lg">Office Announcements</h3>
          </div>

          <div className="space-y-3 md:space-y-4">
            {announcements.map((item) => (
              <div key={item.id} className="flex gap-3 md:gap-4 p-3 md:p-4 rounded-xl bg-neutral-50 border border-neutral-100 hover:border-purple-200 transition-all group">
                <div className={cn(
                  "w-10 h-10 md:w-12 md:h-12 rounded-lg flex flex-col items-center justify-center flex-shrink-0",
                  item.type === 'holiday' ? "bg-red-100 text-red-600" :
                  item.type === 'celebration' ? "bg-amber-100 text-amber-600" :
                  "bg-blue-100 text-blue-600"
                )}>
                  <span className="text-[8px] md:text-[10px] font-bold uppercase">{item.date.split(' ')[1]}</span>
                  <span className="text-base md:text-lg font-bold leading-none">{item.date.split(' ')[0]}</span>
                </div>
                <div>
                  <h4 className="font-bold text-sm md:text-base text-neutral-800 group-hover:text-purple-700 transition-colors">{item.title}</h4>
                  <p className="text-xs md:text-sm text-neutral-500 mt-0.5 md:mt-1 line-clamp-2">{item.message}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Daily Highlights */}
        <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-4 md:p-6">
          <div className="flex items-center gap-3 mb-4 md:mb-6">
            <div className="w-8 h-8 md:w-10 md:h-10 bg-emerald-100 text-emerald-600 rounded-lg md:rounded-xl flex items-center justify-center">
              <Trophy size={18} className="md:w-5 md:h-5" />
            </div>
            <h3 className="font-bold text-neutral-800 text-base md:text-lg">Daily Highlights</h3>
          </div>

          <div className="space-y-4 md:space-y-6">
            {highlights.map((item) => (
              <div key={item.id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-neutral-100 flex items-center justify-center font-bold text-neutral-500 text-xs md:text-sm">
                    {item.user.charAt(0)}
                  </div>
                  <div>
                    <h4 className="text-xs md:text-sm font-bold text-neutral-800">{item.user}</h4>
                    <p className="text-[10px] md:text-xs text-neutral-500">{item.status}</p>
                  </div>
                </div>
                <span className="text-[8px] md:text-[10px] text-neutral-400 font-medium">{item.time}</span>
              </div>
            ))}
          </div>

          <div className="mt-6 md:mt-8 p-4 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-700 text-white text-center">
            <PartyPopper size={20} className="mx-auto mb-2 md:w-6 md:h-6" />
            <h4 className="font-bold text-sm md:text-base">Top Productivity Award</h4>
            <p className="text-[10px] md:text-xs text-purple-100 mt-1">Divya S achieved 125% target completion today!</p>
          </div>
        </div>
      </div>

      {/* Animated Popup Alert */}
      <AnimatePresence>
        {showPopup && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.8, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 50 }}
            className="fixed bottom-8 right-8 z-50 max-w-sm w-full"
          >
            <div className="bg-white rounded-2xl shadow-2xl border border-neutral-100 p-6 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-indigo-600" />
              <button 
                onClick={() => setShowPopup(false)}
                className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-600"
              >
                <ChevronRight size={20} />
              </button>
              
              <div className="flex gap-4">
                <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <PartyPopper size={24} />
                </div>
                <div>
                  <h4 className="font-bold text-neutral-800">{popupContent.title}</h4>
                  <p className="text-sm text-neutral-500 mt-1">{popupContent.message}</p>
                  <div className="flex gap-4 mt-4">
                    <button className="text-xs font-bold text-purple-600 hover:underline">Wish Now</button>
                    <button className="text-xs font-bold text-neutral-400 hover:underline" onClick={() => setShowPopup(false)}>Dismiss</button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

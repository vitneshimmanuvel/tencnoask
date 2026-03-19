import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, Paperclip, Smile, MoreVertical, Phone, Video, Search, Check, CheckCheck, ChevronLeft, MessageSquare } from 'lucide-react';
import { User, ChatMessage } from '../types';
import { format } from 'date-fns';
import { cn } from '../lib/utils';

interface ChatSystemProps {
  currentUser: User;
}

export default function ChatSystem({ currentUser }: ChatSystemProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [selectedUser, setSelectedUser] = useState<{name: string, id: string} | null>(window.innerWidth > 768 ? { name: 'Divya S', id: 'MIS1003' } : null);
  const [isTyping, setIsTyping] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showChatOptions, setShowChatOptions] = useState(false);
  const [quickReplies, setQuickReplies] = useState<string[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    setShowEmojiPicker(false);
    setShowChatOptions(false);
  }, [selectedUser?.id]);

  const teamMembers = [
    { id: 'MIS1003', name: 'Divya S', status: 'Online', avatar: 'https://picsum.photos/seed/divya/100/100', lastSeen: 'Just now' },
    { id: 'MIS1002', name: 'R Karthik', status: 'Away', avatar: 'https://picsum.photos/seed/karthik/100/100', lastSeen: '15m ago' },
    { id: 'MIS1004', name: 'Naveen Kumar', status: 'Online', avatar: 'https://picsum.photos/seed/naveen/100/100', lastSeen: 'Just now' },
    { id: 'MIS1001', name: 'Parameswari V', status: 'Online', avatar: 'https://picsum.photos/seed/parameswari/100/100', lastSeen: 'Just now' },
    { id: 'ADMIN001', name: 'Admin User', status: 'Online', avatar: 'https://picsum.photos/seed/admin/100/100', lastSeen: 'Just now' },
  ].filter(m => m.id !== currentUser.id);

  useEffect(() => {
    if (!selectedUser) return;
    // Mock history - no backend needed
    const mockHistory: ChatMessage[] = [
      { id: 1, senderId: selectedUser.id, message: `Hello ${currentUser.name}, how can I help you with the MIS reports today?`, timestamp: new Date(Date.now() - 3600000).toISOString(), status: 'seen' },
      { id: 2, senderId: currentUser.id, message: "I need to check the status of the Amazon reconciliation.", timestamp: new Date(Date.now() - 1800000).toISOString(), status: 'seen' },
      { id: 3, senderId: selectedUser.id, message: "Sure, let me check the database logs for you.", timestamp: new Date(Date.now() - 900000).toISOString(), status: 'seen' },
    ];
    setMessages(mockHistory);
  }, [currentUser.id, selectedUser?.id]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const checkIsLiveChat = (uid1: string, uid2: string) => {
    const isAdmin = (id: string) => id === 'ADMIN001' || currentUser.role === 'Admin';
    const isParameswari = (id: string) => id === 'MIS1001';

    // Check if one is Admin and the other is Parameswari
    return (isAdmin(uid1) && isParameswari(uid2)) || (isParameswari(uid1) && isAdmin(uid2));
  };

  const EMOJIS = ['😊', '😂', '👍', '🔥', '🚀', '✅', '🙏', '💯', '👋', '🤔', '✨', '💻', '📊', '📁', '🤝'];

  const handleEmojiSelect = (emoji: string) => {
    setInput(prev => prev + emoji);
    setShowEmojiPicker(false);
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !selectedUser) return;

    const userMessage = input.trim();
    const newMessage: ChatMessage = {
      id: Date.now(),
      senderId: currentUser.id,
      receiverId: selectedUser.id,
      message: userMessage,
      timestamp: new Date().toISOString(),
      status: 'sent'
    };

    // Update local state immediately for responsiveness
    setMessages(prev => [...prev, newMessage]);
    
    // Send via socket
    if (socketRef.current?.connected) {
      socketRef.current.emit('send_message', newMessage);
    }

    setInput('');
    setQuickReplies([]);

    // Check if we should trigger auto-reply
    const isLiveChat = checkIsLiveChat(currentUser.id, selectedUser.id);

    // Professional Auto-Reply Logic
    setIsTyping(true);
    const delay = 1500 + Math.random() * 2000;
    setTimeout(() => {
      setIsTyping(false);
      
      let responseText = "Acknowledged. I'll review the details and provide a comprehensive update shortly.";
      let nextQuickReplies: string[] = ["Thanks!", "Got it", "When can I expect an update?"];
      
      const lowerMsg = userMessage.toLowerCase();

      // Special "Lively" logic for Admin <-> Parameswari
      if (isLiveChat) {
        if (currentUser.role === 'Admin') {
          // Admin is talking to Parameswari
          if (lowerMsg.includes("status") || lowerMsg.includes("update")) {
            responseText = "Sir, I have completed 85% of the Amazon dataset. I am currently cross-verifying the remaining 15% for any discrepancies. Will finish by EOD.";
            nextQuickReplies = ["Good job", "Any blockers?", "Keep it up"];
          } else if (lowerMsg.includes("help") || lowerMsg.includes("issue")) {
            responseText = "I'm facing a slight delay with the SQL server response times, but I've already raised a ticket with IT. It shouldn't affect the deadline.";
            nextQuickReplies = ["Understood", "Let me know", "Priority?"];
          } else {
            responseText = "Yes Sir, I am on it. The MIS reports are being generated as we speak. Is there anything specific you need me to prioritize?";
            nextQuickReplies = ["Amazon MIS", "Flipkart MIS", "Daily Summary"];
          }
        } else {
          // Parameswari is talking to Admin
          if (lowerMsg.includes("done") || lowerMsg.includes("completed")) {
            responseText = "Excellent work, Parameswari. I've reviewed your Q4 productivity stats and they look impressive. Keep maintaining this quality.";
            nextQuickReplies = ["Thank you Sir", "Next targets?", "Appreciate it"];
          } else if (lowerMsg.includes("help") || lowerMsg.includes("issue")) {
            responseText = "I've noted the server issues. I'll speak with the IT head immediately to resolve the latency. Focus on the offline validation for now.";
            nextQuickReplies = ["Okay Sir", "Thanks", "Will do"];
          } else {
            responseText = "Parameswari, please ensure the Zomato reconciliation is completed before the client meeting at 4 PM. Let me know if you need additional resources.";
            nextQuickReplies = ["On it Sir", "Almost done", "Need 15 mins"];
          }
        }
      } else {
        // Standard professional replies for others
        if (lowerMsg.includes("verify") || lowerMsg.includes("check")) {
          responseText = "Understood. I'm initiating the verification process for the specified dataset. I'll cross-reference with the master MIS records.";
          nextQuickReplies = ["Which dataset?", "Is there any discrepancy?", "Proceed"];
        } else if (lowerMsg.includes("hi") || lowerMsg.includes("hello") || lowerMsg.includes("hey")) {
          responseText = `Greetings ${currentUser.name.split(' ')[0]}. I'm ready to assist with any MIS reporting or data validation tasks you have. How can I help you today?`;
          nextQuickReplies = ["Check MIS status", "Verify records", "I have an issue"];
        } else if (lowerMsg.includes("done") || lowerMsg.includes("completed") || lowerMsg.includes("finished")) {
          responseText = "Excellent work. I'll proceed with the final quality audit and synchronize these updates with the client dashboard. Your efficiency is noted!";
          nextQuickReplies = ["Great", "Next task?", "Update client"];
        } else if (lowerMsg.includes("help") || lowerMsg.includes("issue") || lowerMsg.includes("problem")) {
          responseText = "I'm here to help. Please provide the specific Record ID, Client Name, or a screenshot of the error so I can investigate the database logs immediately.";
          nextQuickReplies = ["Record ID: 4521", "Client: Amazon", "It's a login error"];
        }
      }

      const autoReply: ChatMessage = {
        id: Date.now() + 1,
        senderId: selectedUser.id,
        receiverId: currentUser.id,
        message: responseText,
        timestamp: new Date().toISOString(),
        status: 'sent'
      };

      // Update local state
      setMessages(prev => [...prev, autoReply]);

      // Send via socket if connected
      if (socketRef.current?.connected) {
        socketRef.current.emit('send_message', autoReply);
      }
      
      setQuickReplies(nextQuickReplies);
    }, delay);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && selectedUser) {
      const fileMsg: ChatMessage = {
        id: Date.now(),
        senderId: currentUser.id,
        receiverId: selectedUser.id,
        message: `Shared a file: ${file.name}`,
        timestamp: new Date().toISOString(),
        status: 'sent'
      };

      setMessages(prev => [...prev, fileMsg]);

      if (socketRef.current?.connected) {
        socketRef.current.emit('send_message', fileMsg);
      }
      
      // No auto-reply for live chat
      if (checkIsLiveChat(currentUser.id, selectedUser.id)) {
        return;
      }

      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        const autoReply: ChatMessage = {
          id: Date.now() + 1,
          senderId: selectedUser.id,
          receiverId: currentUser.id,
          message: "File successfully received. I'm importing the data into our processing queue for immediate validation.",
          timestamp: new Date().toISOString(),
          status: 'sent'
        };
        setMessages(prev => [...prev, autoReply]);

        if (socketRef.current?.connected) {
          socketRef.current.emit('send_message', autoReply);
        }
      }, 1500);
    }
  };

  const getAvatar = (id: string) => {
    if (id === currentUser.id) {
      return localStorage.getItem(`profile_image_${currentUser.id}`) || `https://picsum.photos/seed/${currentUser.id}/100/100`;
    }
    const member = teamMembers.find(m => m.id === id);
    return member?.avatar || `https://picsum.photos/seed/${id}/100/100`;
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 overflow-hidden flex h-full min-h-[500px]">
      {/* Sidebar */}
      <div className={cn(
        "w-full md:w-80 border-r border-neutral-100 flex flex-col",
        isMobile && selectedUser ? "hidden" : "flex"
      )}>
        <div className="p-4 md:p-6 border-b border-neutral-100">
          <h3 className="font-bold text-neutral-800 text-base md:text-lg mb-4">Team Chat</h3>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={16} />
            <input 
              type="text" 
              placeholder="Search team..." 
              className="w-full pl-10 pr-4 py-2 bg-neutral-50 border border-neutral-100 rounded-xl text-xs md:text-sm outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-3 md:p-4 space-y-2">
          {teamMembers.map((member) => (
            <button
              key={member.id}
              onClick={() => setSelectedUser({ name: member.name, id: member.id })}
              className={cn(
                "w-full flex items-center gap-3 p-2 md:p-3 rounded-xl transition-all",
                selectedUser?.id === member.id ? "bg-purple-50 border border-purple-100" : "hover:bg-neutral-50"
              )}
            >
              <div className="relative">
                <img 
                  src={member.avatar} 
                  alt={member.name}
                  className="w-8 h-8 md:w-10 md:h-10 rounded-full object-cover border border-neutral-200"
                  referrerPolicy="no-referrer"
                />
                <div className={cn(
                  "absolute bottom-0 right-0 w-2.5 h-2.5 md:w-3 md:h-3 rounded-full border-2 border-white",
                  member.status === 'Online' ? "bg-emerald-500" : "bg-amber-500"
                )} />
              </div>
              <div className="text-left">
                <h4 className="text-xs md:text-sm font-bold text-neutral-800">{member.name}</h4>
                <div className="flex items-center gap-1.5">
                  <p className="text-[9px] md:text-[10px] text-neutral-400 font-medium uppercase tracking-wider">{member.status}</p>
                  <span className="text-[9px] md:text-[10px] text-neutral-300">•</span>
                  <p className="text-[9px] md:text-[10px] text-neutral-400 font-medium italic">{member.lastSeen}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className={cn(
        "flex-1 flex flex-col bg-neutral-50/30",
        isMobile && !selectedUser ? "hidden" : "flex"
      )}>
        {selectedUser ? (
          <>
            {/* Header */}
            <div className="p-3 md:p-4 bg-white border-b border-neutral-100 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                {isMobile && (
                  <button 
                    onClick={() => setSelectedUser(null)}
                    className="p-2 -ml-2 text-neutral-400 hover:text-purple-600"
                  >
                    <ChevronLeft size={20} />
                  </button>
                )}
                <img 
                  src={getAvatar(selectedUser.id)} 
                  alt={selectedUser.name}
                  className="w-8 h-8 md:w-10 md:h-10 rounded-full object-cover border border-neutral-200"
                  referrerPolicy="no-referrer"
                />
                <div>
                  <h4 className="font-bold text-neutral-800 text-sm md:text-base">{selectedUser.name}</h4>
                  <div className="flex items-center gap-2">
                    <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-wider">Active Now</p>
                    <span className="text-[10px] text-neutral-300 hidden sm:inline">•</span>
                    <p className="text-[10px] text-neutral-400 font-medium italic hidden sm:inline">Seen {teamMembers.find(m => m.id === selectedUser.id)?.lastSeen}</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1 md:gap-2 relative">
                <button className="p-2 text-neutral-400 hover:text-purple-600 hover:bg-neutral-50 rounded-lg transition-all">
                  <Phone size={18} />
                </button>
                <button className="p-2 text-neutral-400 hover:text-purple-600 hover:bg-neutral-50 rounded-lg transition-all">
                  <Video size={18} />
                </button>
                <button 
                  onClick={() => setShowChatOptions(!showChatOptions)}
                  className={cn(
                    "p-2 transition-all rounded-lg",
                    showChatOptions ? "bg-purple-50 text-purple-600" : "text-neutral-400 hover:text-purple-600 hover:bg-neutral-50"
                  )}
                >
                  <MoreVertical size={18} />
                </button>

                <AnimatePresence>
                  {showChatOptions && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute top-full right-0 mt-2 w-48 bg-white border border-neutral-200 rounded-xl shadow-xl z-50 overflow-hidden"
                    >
                      <div className="p-2 space-y-1">
                        <button className="w-full text-left px-3 py-2 text-xs font-bold text-neutral-600 hover:bg-neutral-50 rounded-lg transition-colors flex items-center gap-2">
                          <Search size={14} /> Search Chat
                        </button>
                        <button className="w-full text-left px-3 py-2 text-xs font-bold text-neutral-600 hover:bg-neutral-50 rounded-lg transition-colors flex items-center gap-2">
                          <MessageSquare size={14} /> Mute Notifications
                        </button>
                        <div className="h-px bg-neutral-100 my-1" />
                        <button className="w-full text-left px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-2">
                          Clear History
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Messages */}
            <div 
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 md:space-y-6 custom-scrollbar min-h-0"
            >
              <AnimatePresence initial={false}>
                {messages.map((msg) => (
                  <motion.div 
                    key={msg.id}
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    className={cn(
                      "flex gap-2 md:gap-3 max-w-[90%] md:max-w-[85%]",
                      msg.senderId === currentUser.id ? "ml-auto flex-row-reverse" : "flex-row"
                    )}
                  >
                    <img 
                      src={getAvatar(msg.senderId)} 
                      alt={msg.senderId}
                      className="w-7 h-7 md:w-8 md:h-8 rounded-full object-cover border border-neutral-200 flex-shrink-0 mt-1 shadow-sm"
                      referrerPolicy="no-referrer"
                    />
                    <div className={cn(
                      "flex flex-col",
                      msg.senderId === currentUser.id ? "items-end" : "items-start"
                    )}>
                      <div className={cn(
                        "px-3 py-2 md:px-4 md:py-3 rounded-2xl text-sm shadow-sm",
                        msg.senderId === currentUser.id 
                          ? "bg-purple-600 text-white rounded-tr-none" 
                          : "bg-white text-neutral-800 border border-neutral-100 rounded-tl-none"
                      )}>
                        {msg.message}
                      </div>
                      <div className="flex items-center gap-1 mt-1">
                        <span className="text-[9px] md:text-[10px] text-neutral-400 font-medium">
                          {format(new Date(msg.timestamp), 'hh:mm a')}
                        </span>
                        {msg.senderId === currentUser.id && (
                          <div className="text-purple-600">
                            {msg.status === 'sent' && <Check size={10} />}
                            {msg.status === 'delivered' && <CheckCheck size={10} className="opacity-50" />}
                            {msg.status === 'seen' && <CheckCheck size={10} />}
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
                {isTyping && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2 text-neutral-400"
                  >
                    <div className="flex gap-1">
                      <span className="w-1.5 h-1.5 bg-neutral-300 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-1.5 h-1.5 bg-neutral-300 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-1.5 h-1.5 bg-neutral-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                    <span className="text-[9px] font-bold uppercase tracking-widest">{selectedUser.name} is typing...</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Input */}
            <div className="bg-white border-t border-neutral-100 shrink-0">
              <AnimatePresence>
                {quickReplies.length > 0 && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="px-4 py-2 flex gap-2 overflow-x-auto no-scrollbar"
                  >
                    {quickReplies.map((reply) => (
                      <button
                        key={reply}
                        onClick={() => {
                          setInput(reply);
                        }}
                        className="px-3 py-1.5 bg-purple-50 text-purple-600 text-[10px] md:text-xs font-bold rounded-full border border-purple-100 hover:bg-purple-100 transition-colors whitespace-nowrap"
                      >
                        {reply}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
              
              <form onSubmit={handleSend} className="p-3 md:p-4">
                <div className="flex items-center gap-2 md:gap-3 bg-neutral-50 border border-neutral-100 rounded-2xl p-1.5 md:p-2">
                <label className="p-2 text-neutral-400 hover:text-purple-600 transition-colors cursor-pointer">
                  <Paperclip size={18} />
                  <input type="file" className="hidden" onChange={handleFileUpload} />
                </label>
                <input 
                  type="text" 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type a message..." 
                  className="flex-1 bg-transparent border-none outline-none text-sm py-1 md:py-2"
                />
                <div className="relative">
                  <button 
                    type="button" 
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    className={cn(
                      "p-2 transition-colors",
                      showEmojiPicker ? "text-purple-600" : "text-neutral-400 hover:text-purple-600"
                    )}
                  >
                    <Smile size={18} />
                  </button>
                  
                  <AnimatePresence>
                    {showEmojiPicker && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.9 }}
                        className="absolute bottom-full right-0 mb-4 p-3 bg-white border border-neutral-200 rounded-2xl shadow-2xl z-50 grid grid-cols-5 gap-2 w-[210px]"
                      >
                        {EMOJIS.map(emoji => (
                          <button
                            key={emoji}
                            type="button"
                            onClick={() => handleEmojiSelect(emoji)}
                            className="w-9 h-9 flex items-center justify-center hover:bg-purple-50 hover:scale-110 rounded-xl transition-all text-xl"
                          >
                            {emoji}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                <button 
                  type="submit"
                  className="bg-purple-600 text-white p-2 rounded-xl hover:bg-purple-700 transition-all shadow-lg shadow-purple-900/20"
                >
                  <Send size={18} />
                </button>
              </div>
            </form>
          </div>
        </>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
          <div className="w-20 h-20 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mb-4">
            <MessageSquare size={40} />
          </div>
          <h3 className="text-xl font-bold text-neutral-800">Select a team member</h3>
          <p className="text-neutral-500 mt-2 max-w-xs">Choose someone from the list to start a secure MIS collaboration session.</p>
        </div>
      )}
    </div>
  </div>
);
}

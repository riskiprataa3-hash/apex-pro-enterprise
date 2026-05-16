import React, { useState, useContext, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Send, ArrowLeft, MapPin, ShieldAlert, 
  User, MessageSquare, Clock, Globe, Trash2
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const ChatCenter: React.FC = () => {
    const navigate = useNavigate();
    const { chatMessages, handleSendMessage, handleClearChatMessages, location, isOnline, user, isAdmin } = useApp();
    const [inputText, setInputText] = useState('');
    const scrollRef = useRef<HTMLDivElement>(null);

    // Auto-scroll ke pesan terbaru
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [chatMessages]);

    const handleSend = async () => {
        if (!inputText.trim()) return;
        // In this architecture, we send 'ALL' as receiverEmail for broadcast chat
        await handleSendMessage(inputText, "ALL");
        setInputText('');
    };

    const shareLocation = async () => {
        if (!location) {
            alert("Sinyal GPS belum terkunci.");
            return;
        }
        const locString = `LOKASI TEPAT: https://www.google.com/maps?q=${location.lat},${location.lng} (KM ${location.lat.toFixed(4)}, ${location.lng.toFixed(4)})`;
        await handleSendMessage(locString, "ALL");
    };

    return (
        <div className="flex flex-col h-screen text-foreground relative z-10 w-full px-4 sm:px-8 max-w-7xl mx-auto pt-4 pb-4">
            {/* TACTICAL HEADER */}
            <header className="p-4 bg-background/40 backdrop-blur-2xl border border-white/20 dark:border-white/5 rounded-[2rem] flex items-center gap-4 shadow-2xl shrink-0 z-50 relative">
                <button onClick={() => navigate('/')} className="p-3 bg-background/20 rounded-2xl hover:bg-background/40 transition-all border border-white/10">
                    <ArrowLeft size={18} className="text-foreground"/>
                </button>
                <div className="flex-1">
                    <div className="flex items-center gap-2">
                        <MessageSquare className="text-primary" size={16} />
                        <h2 className="text-sm font-black italic uppercase tracking-tighter drop-shadow-md">Apex Chat Center</h2>
                    </div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                       <span className={cn("w-1.5 h-1.5 rounded-full animate-pulse", isOnline ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" : "bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.8)]")} />
                       <span className="text-[7px] font-black uppercase text-foreground/50 tracking-widest">
                         {isOnline ? 'Network Secure' : 'Offline Access'}
                       </span>
                    </div>
                </div>
                {isAdmin && (
                    <button 
                        onClick={() => {
                            if (window.confirm('Hapus seluruh riwayat pesan? Tindakan ini tidak dapat dibatalkan.')) {
                                handleClearChatMessages();
                            }
                        }}
                        className="p-3 bg-rose-500/10 text-rose-500 rounded-2xl hover:bg-rose-500 hover:text-white transition-all border border-rose-500/20"
                        title="Hapus Semua Pesan"
                    >
                        <Trash2 size={18} />
                    </button>
                )}
            </header>

            {/* MESSAGES LIST */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 custom-scrollbar pb-12 mt-4 bg-background/10 backdrop-blur-md rounded-[2rem] border border-white/10 dark:border-white/5 shadow-inner">
                {chatMessages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center opacity-10 text-center space-y-4">
                        <ShieldAlert size={64} />
                        <p className="text-[10px] font-black uppercase tracking-[1em]">Awaiting Coordination...</p>
                    </div>
                ) : chatMessages.map((msg: any) => {
                    const isMe = msg.senderEmail?.toLowerCase() === user?.email?.toLowerCase();
                    const isLocation = msg.content.includes('maps?q=');
                    
                    return (
                        <div key={msg.id} className={cn(
                            "flex flex-col max-w-[85%] animate-in fade-in slide-in-from-bottom-2 duration-300",
                            isMe ? "ml-auto items-end" : "items-start"
                        )}>
                            <div className="flex items-center gap-2 mb-1.5 px-2">
                                <span className={cn("text-[8px] font-black uppercase", isMe ? "text-primary/60" : "text-white/30")}>
                                  {isMe ? 'Anda' : (msg.senderEmail?.split('@')[0] || 'Field Unit')}
                                </span>
                                <span className="text-[7px] font-mono text-white/10">
                                  {new Date(msg.timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>

                            <div className={cn(
                                "p-4 rounded-[1.5rem] border text-sm shadow-xl transition-all",
                                isMe 
                                    ? "bg-primary text-black border-primary rounded-tr-none" 
                                    : "bg-white/[0.03] text-white border-white/10 rounded-tl-none"
                            )}>
                                {isLocation ? (
                                    <div className="flex flex-col gap-3">
                                       <div className="flex items-center gap-3">
                                          <div className={cn("p-2 rounded-lg", isMe ? "bg-black/10" : "bg-primary/20")}>
                                             <Globe size={18} className={isMe ? "text-black" : "text-primary"} />
                                          </div>
                                          <span className="font-black italic uppercase tracking-tighter">Signal Beacon Broadcast</span>
                                       </div>
                                       <p className="text-[10px] font-mono opacity-80 leading-relaxed font-bold break-all">
                                          {msg.content.split(' (')[0]}
                                       </p>
                                       <a 
                                          href={msg.content.match(/https:\/\/\S+/)?.[0]} 
                                          target="_blank" 
                                          rel="noreferrer"
                                          className={cn(
                                            "py-3 rounded-xl text-[9px] font-black uppercase text-center transition-all", 
                                            isMe ? "bg-black/10 hover:bg-black/20" : "bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20"
                                          )}
                                       >
                                          Track Unit In Map Engine
                                       </a>
                                    </div>
                                ) : (
                                    <p className="font-bold leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* ACTION INPUT */}
            <div className="p-6 bg-black/40 backdrop-blur-3xl border-t border-white/5">
                <div className="max-w-4xl mx-auto flex gap-3 items-center">
                    <button 
                        onClick={shareLocation}
                        title="Share Live Location"
                        className="p-5 bg-white/5 border border-white/10 text-primary rounded-2xl hover:bg-primary hover:text-black transition-all group"
                    >
                        <MapPin size={24} className="group-hover:scale-110 transition-transform" />
                    </button>
                    <div className="flex-1 relative">
                        <input 
                            placeholder="OPERATIONAL COMMAND..."
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                            className="w-full h-16 bg-white/[0.02] border border-white/10 rounded-2xl px-8 text-sm font-black italic placeholder:text-white/10 focus:border-primary outline-none transition-all"
                        />
                    </div>
                    <button 
                        onClick={handleSend}
                        className="p-5 bg-primary text-black rounded-2xl shadow-xl shadow-primary/20 hover:scale-[1.05] active:scale-95 transition-all"
                    >
                        <Send size={24} />
                    </button>
                </div>
                <div className="mt-4 flex justify-center">
                    <p className="text-[7px] font-black uppercase text-white/10 tracking-[0.6em] italic">Tactical Secure Coordination Channel</p>
                </div>
            </div>
        </div>
    );
};

const cn = (...classes: any[]) => classes.filter(Boolean).join(' ');

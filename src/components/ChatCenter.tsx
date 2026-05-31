import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Send, ArrowLeft, MapPin, ShieldAlert, 
  MessageSquare, Globe, Trash2
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
        <div className="flex flex-col h-screen text-foreground relative z-10 w-full px-0 sm:px-8 max-w-7xl mx-auto pt-4 pb-4">
            {/* TACTICAL HEADER */}
            <header className="p-4 mx-4 bg-card/60 backdrop-blur-2xl border border-border/50 rounded-3xl flex items-center gap-4 shadow-sm shrink-0 z-50 relative">
                <button onClick={() => navigate('/')} className="p-2 sm:p-3 bg-secondary/50 rounded-2xl hover:bg-secondary transition-all border border-border">
                    <ArrowLeft size={18} className="text-foreground"/>
                </button>
                <div className="flex-1">
                    <div className="flex items-center gap-2">
                        <MessageSquare className="text-indigo-600 dark:text-indigo-400" size={16} />
                        <h2 className="text-sm font-black italic uppercase tracking-tighter drop-shadow-sm text-foreground">Pusat Koordinasi</h2>
                    </div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                       <span className={cn("w-1.5 h-1.5 rounded-full animate-pulse", isOnline ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" : "bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]")} />
                       <span className="text-[7px] font-black uppercase text-muted-foreground tracking-widest">
                         {isOnline ? 'Jaringan Aktif' : 'Mode Luring'}
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
            <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-6 sm:p-6 space-y-6 custom-scrollbar pb-12 mt-4">
                {chatMessages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center opacity-30 text-center space-y-4">
                        <ShieldAlert size={64} className="text-muted-foreground" />
                        <p className="text-[10px] font-black uppercase tracking-[0.5em] text-muted-foreground">Persiapkan Pesan Pertama...</p>
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
                                <span className={cn("text-[8px] font-black uppercase", isMe ? "text-indigo-600 dark:text-indigo-400" : "text-muted-foreground")}>
                                  {isMe ? 'Anda' : (msg.senderEmail?.split('@')[0] || 'Unit Lapangan')}
                                </span>
                                <span className="text-[7px] font-mono text-muted-foreground">
                                  {new Date(msg.timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>

                            <div className={cn(
                                "p-4 rounded-3xl border text-sm shadow-md transition-all",
                                isMe 
                                    ? "bg-indigo-600 text-white border-indigo-700/50 rounded-tr-none" 
                                    : "bg-card text-foreground border-border rounded-tl-none"
                            )}>
                                {isLocation ? (
                                    <div className="flex flex-col gap-3">
                                       <div className="flex items-center gap-3">
                                          <div className={cn("p-2 rounded-xl", isMe ? "bg-white/20" : "bg-indigo-100 dark:bg-indigo-900/30")}>
                                             <Globe size={18} className={isMe ? "text-white" : "text-indigo-600 dark:text-indigo-400"} />
                                          </div>
                                          <span className="font-black italic uppercase tracking-tighter">Penyebaran Lokasi</span>
                                       </div>
                                       <p className="text-[10px] font-mono opacity-90 leading-relaxed font-bold break-all">
                                          {msg.content.split(' (')[0]}
                                       </p>
                                       <a 
                                          href={msg.content.match(/https:\/\/\S+/)?.[0]} 
                                          target="_blank" 
                                          rel="noreferrer"
                                          className={cn(
                                            "py-3 rounded-xl text-[9px] font-black uppercase text-center transition-all", 
                                            isMe ? "bg-white/20 hover:bg-white/30 text-white" : "bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100 dark:bg-indigo-900/20 dark:text-indigo-300 dark:border-indigo-800"
                                          )}
                                       >
                                          Lacak di Peta
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
            <div className="p-4 sm:p-6 bg-card/60 backdrop-blur-3xl border-t border-border">
                <div className="max-w-4xl mx-auto flex gap-2 sm:gap-3 items-center">
                    <button 
                        onClick={shareLocation}
                        title="Bagikan Lokasi Langsung"
                        className="p-3 sm:p-4 bg-secondary border border-border text-indigo-600 dark:text-indigo-400 rounded-2xl hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all group shrink-0"
                    >
                        <MapPin size={22} className="group-hover:scale-110 transition-transform" />
                    </button>
                    <div className="flex-1 relative">
                        <input 
                            placeholder="Tulis pesan..."
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                            className="w-full h-12 sm:h-14 bg-background border border-border rounded-2xl px-5 sm:px-6 text-sm font-bold placeholder:text-muted-foreground focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all shadow-sm"
                        />
                    </div>
                    <button 
                        onClick={handleSend}
                        className="p-3 sm:p-4 bg-indigo-600 text-white rounded-2xl shadow-lg shadow-indigo-600/30 hover:scale-[1.05] active:scale-95 transition-all shrink-0"
                    >
                        <Send size={22} />
                    </button>
                </div>
            </div>
        </div>
    );
};

const cn = (...classes: any[]) => classes.filter(Boolean).join(' ');

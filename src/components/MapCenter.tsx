import React, { useContext, useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { 
  ArrowLeft, Globe, MapPin, Navigation, 
  Layers, Layers2, Activity, ShieldCheck, Map as MapIcon 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { cn } from './ui/Base';

// @ts-ignore
import markerIcon from 'leaflet/dist/images/marker-icon.png';
// @ts-ignore
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

// Helper to center map
const RecenterMap = ({ lat, lng }: { lat: number, lng: number }) => {
    const map = useMap();
    useEffect(() => {
        if (lat && lng) {
            map.setView([lat, lng], 13);
        }
    }, [lat, lng, map]);
    return null;
};

import MarkerClusterGroup from 'react-leaflet-cluster';

export const MapCenter: React.FC = () => {
    const navigate = useNavigate();
    const { projects, location, isOnline } = useApp();
    const [mapStyle, setMapStyle] = useState<'streets' | 'satellite' | 'hybrid' | 'terrain'>('hybrid');

    // Flatten all entries for map display
    const allMarkers = projects.flatMap(p => 
        (p.entries || []).map(e => ({
            ...e,
            projectName: p.name,
            projectType: p.type,
            projectId: p.id
        }))
    ).filter(e => e.latitude && e.longitude);

    // Map Tile URLs
    const getMapUrl = (type: string) => {
        const subdomains = ['mt0', 'mt1', 'mt2', 'mt3'];
        const s = subdomains[Math.floor(Math.random() * 4)];
        switch(type) {
            case 'satellite': return `https://${s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}`;
            case 'hybrid': return `https://${s}.google.com/vt/lyrs=s,h&x={x}&y={y}&z={z}`;
            case 'terrain': return `https://${s}.google.com/vt/lyrs=p&x={x}&y={y}&z={z}`;
            default: return `https://${s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}`;
        }
    };

    return (
        <div className="h-screen flex flex-col text-foreground overflow-hidden relative z-10 w-full px-4 sm:px-8 max-w-7xl mx-auto pt-4 pb-4">
            {/* TACTICAL MAP HEADER */}
            <header className="p-4 bg-background/40 backdrop-blur-2xl border border-white/20 dark:border-white/5 rounded-[2rem] flex items-center justify-between z-[1000] shadow-2xl relative mb-4">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate('/')} className="p-3 bg-background/20 rounded-2xl hover:bg-background/40 transition-all border border-white/10 dark:border-white/5 shadow-sm">
                        <ArrowLeft size={20} className="text-foreground"/>
                    </button>
                    <div className="drop-shadow-sm">
                        <div className="flex items-center gap-2">
                            <ShieldCheck className="text-primary" size={16} />
                            <h2 className="text-sm font-black italic uppercase tracking-tighter">Geospatial Command Center</h2>
                        </div>
                        <p className="text-[7px] font-black uppercase text-foreground/50 tracking-[0.4em] mt-0.5">Asset Intelligence & Monitoring</p>
                    </div>
                </div>

                <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
                    {['hybrid', 'satellite', 'streets', 'terrain'].map((style) => (
                        <button 
                            key={style}
                            onClick={() => setMapStyle(style as any)}
                            className={cn(
                                "flex items-center gap-2 backdrop-blur-md border px-4 py-2 rounded-xl text-[9px] font-black uppercase transition-all shadow-md shrink-0",
                                mapStyle === style 
                                    ? "bg-primary text-black border-primary shadow-primary/20" 
                                    : "bg-background/30 border-white/10 text-foreground hover:bg-background/50"
                            )}
                        >
                            {style === 'streets' && <Layers2 size={12}/>}
                            {style === 'satellite' && <Globe size={12}/>}
                            {style === 'hybrid' && <Navigation size={12}/>}
                            {style === 'terrain' && <MapIcon size={12}/>}
                            {style}
                        </button>
                    ))}
                </div>
            </header>

            {/* MAP CONTAINER */}
            <div className="flex-1 relative rounded-[2rem] overflow-hidden border border-white/20 dark:border-white/5 shadow-inner">
                <MapContainer 
                    center={[location?.lat || -6.2, location?.lng || 106.8]} 
                    zoom={10} 
                    className={cn("w-full h-full z-0", mapStyle === 'streets' && "grayscale-[20%]")}
                    zoomControl={false}
                >
                    <TileLayer
                        url={getMapUrl(mapStyle)}
                        attribution='&copy; Satellite Maps'
                    />
                    
                    <MarkerClusterGroup
                        chunkedLoading
                        maxClusterRadius={60}
                        spiderfyOnMaxZoom={true}
                    >
                        {allMarkers.map((m: any) => (
                            <Marker 
                              key={m.id} 
                              position={[m.latitude, m.longitude]}
                              icon={L.divIcon({
                                className: 'custom-pin',
                                html: `
                                  <div class="relative flex items-center justify-center">
                                    <div class="absolute -inset-2 rounded-full animate-ping opacity-20 ${m.status === 'completed' || m.qty >= (m.targetQty || 1) ? 'bg-emerald-500' : 'bg-primary'}"></div>
                                    <div class="w-8 h-8 ${m.status === 'completed' || m.qty >= (m.targetQty || 1) ? 'bg-emerald-500' : 'bg-primary'} rounded-full border-4 border-black shadow-2xl flex items-center justify-center text-[8px] font-black italic text-black">KM ${m.km?.replace('KM ', '') || ''}</div>
                                  </div>
                                `,
                                iconSize: [32, 32],
                                iconAnchor: [16, 16]
                              })}
                            >
                                <Popup className="apex-popup">
                                    <div className="p-2 min-w-[200px] bg-black text-white font-sans">
                                        <p className="text-[10px] font-black text-primary uppercase italic mb-1">{m.projectName}</p>
                                        <h4 className="text-sm font-black uppercase tracking-tighter mb-2">LOKASI: KM {m.km}</h4>
                                        {m.photos100 && m.photos100[0] && (
                                            <img src={m.photos100[0]} className="w-full h-24 object-cover rounded-lg mb-2 border border-white/10" referrerPolicy="no-referrer" />
                                        )}
                                        <div className="flex justify-between items-center text-[8px] font-bold uppercase opacity-60">
                                            <span>LON: {m.longitude.toFixed(4)}</span>
                                            <span>LAT: {m.latitude.toFixed(4)}</span>
                                        </div>
                                        <button 
                                            onClick={() => navigate(`/project/${m.projectId}`)}
                                            className="w-full mt-3 py-2 bg-primary text-black text-[9px] font-black uppercase rounded-lg"
                                        >
                                            Inspect Point
                                        </button>
                                    </div>
                                </Popup>
                            </Marker>
                        ))}
                    </MarkerClusterGroup>

                    {location && (
                        <Marker position={[location.lat, location.lng]} icon={L.divIcon({
                            className: 'custom-div-icon',
                            html: `<div class='w-4 h-4 bg-primary rounded-full border-2 border-white shadow-xl animate-pulse'></div>`,
                            iconSize: [16, 16],
                            iconAnchor: [8, 8]
                        })}>
                            <Popup>Posisi Unit Anda Aktif</Popup>
                        </Marker>
                    )}

                    {location && <RecenterMap lat={location.lat} lng={location.lng} />}
                </MapContainer>

                {/* OVERLAY: LIVE TELEMETRY */}
                <div className="absolute bottom-8 left-8 right-8 z-[1000] flex flex-col md:flex-row gap-4 pointer-events-none">
                    <div className="bg-black/60 backdrop-blur-2xl border border-white/10 p-6 rounded-[2.5rem] flex-1 pointer-events-auto">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                                <Navigation size={20} />
                            </div>
                            <div>
                                <p className="text-[8px] font-black text-white/30 uppercase tracking-widest">Active Tracking</p>
                                <h4 className="text-xl font-black italic uppercase italic tracking-tighter">Satellite Navigation</h4>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                                <p className="text-[7px] font-black opacity-30 uppercase tracking-widest mb-1">LATITUDE</p>
                                <p className="text-sm font-black italic">{location?.lat != null ? location.lat.toFixed(6) : '---'}</p>
                            </div>
                            <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                                <p className="text-[7px] font-black opacity-30 uppercase tracking-widest mb-1">LONGITUDE</p>
                                <p className="text-sm font-black italic">{location?.lng != null ? location.lng.toFixed(6) : '---'}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-primary border border-primary p-6 rounded-[2.5rem] md:w-64 flex flex-col justify-center pointer-events-auto">
                        <p className="text-[8px] font-black text-black/40 uppercase tracking-widest mb-1">Detected Assets</p>
                        <h4 className="text-4xl font-black italic text-black leading-none">{allMarkers.length}</h4>
                        <div className="mt-4 flex items-center gap-2">
                            <Activity size={14} className="text-black/60 animate-pulse" />
                            <span className="text-[9px] font-black uppercase text-black/60 italic">Points Scanned</span>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                .apex-popup .leaflet-popup-content-wrapper {
                    background: black !important;
                    color: white !important;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 20px;
                    padding: 0;
                }
                .apex-popup .leaflet-popup-tip {
                    background: black !important;
                }
                .leaflet-container {
                    background: #050505 !important;
                }
            `}</style>
        </div>
    );
};

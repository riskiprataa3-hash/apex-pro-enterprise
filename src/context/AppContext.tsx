import React, { useState, useEffect, useMemo, createContext, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { User, onAuthStateChanged, signInWithEmailAndPassword, signOut, createUserWithEmailAndPassword, sendEmailVerification, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { collection, onSnapshot, query, orderBy, addDoc, deleteDoc, doc, setDoc, where, limit, updateDoc, arrayUnion, getDocs, or, collectionGroup, writeBatch } from 'firebase/firestore';
import { auth, db, storage } from '../firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { notifyTaskUpdateToExecutant, notifyAdminsForNewIncident, notifyAdminsForEquipmentRequest } from '../services/notificationService';
import fileSaverLib from 'file-saver';
const saveAs = fileSaverLib.saveAs;

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface ProjectEntry {
  id: string;
  km: string;
  kmTo?: string; // For painting ranges
  lajur?: string;
  // Asphalt specific
  panjang?: number;
  lebar?: number;
  tebal?: number;
  density?: number;
  volume?: number;
  tonase?: number;
  materialType?: string;
  // Sign/Planting specific
  signType?: string;
  plantType?: string;
  description?: string;
  qty?: number;
  progress?: number; // 0-100
  status: 'pending' | 'in-progress' | 'completed';
  
  timestamp: number;
  latitude?: number;
  longitude?: number;
  photos0?: string[];
  photos50?: string[];
  photos100?: string[];
  isArchived?: boolean;
  projectId?: string;
}

export interface UploadingPhoto {
  id: string;
  preview: string;
  type: '0' | '50' | '100';
  status: 'compressing' | 'ready' | 'error';
}

export type AspalEntry = ProjectEntry; // Alias for backward compatibility

export interface Project {
  id: string;
  name: string;
  type: 'asphalt' | 'inlet' | 'traffic-sign' | 'painting' | 'planting' | 'other';
  description?: string;
  locationInfo?: string;
  regionalInfo?: string;
  requiredTools?: string[];
  entries: ProjectEntry[];
  createdAt: number;
  targetQty?: number;
}

export interface EquipmentRequest {
  id: string;
  userId: string;
  userEmail: string;
  toolName: string;
  description?: string;
  type: 'new' | 'repair' | 'damaged';
  status: 'pending' | 'in-process' | 'approved' | 'rejected' | 'completed';
  timestamp: number;
  photo?: string;
  adminNote?: string;
  projectId?: string;
}

export interface FuelLog {
  id: string;
  userId: string;
  userEmail: string;
  equipmentName: string;
  liters: number;
  timestamp: number;
  photo?: string;
  note?: string;
  projectId?: string;
}

export interface Activity {
  id: string;
  type: 'project' | 'entry' | 'task' | 'fuel' | 'hse' | 'incident' | 'inventory';
  action: string;
  title: string;
  description: string;
  userId: string;
  userEmail: string;
  timestamp: number;
  projectId?: string;
  metadata?: any;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: number;
  read: boolean;
  ownerId?: string;
}

export interface LoginLog {
  id: string;
  email: string;
  userId: string;
  timestamp: number;
  latitude?: number;
  longitude?: number;
  locationName?: string;
  userAgent: string;
}

export interface AttendanceSettings {
  allowedLat: number;
  allowedLng: number;
  radius: number;
  enabled: boolean;
}

export interface Worker {
  id: string;
  employeeId: string;
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'field-operator';
  dailyRate?: number;
  createdAt: number;
  lastLat?: number;
  lastLng?: number;
  lastUpdate?: number;
  isPinnedToLogin?: boolean;
  geofenceLimit?: {
    lat: number;
    lng: number;
    radius: number; // in meters
    enabled: boolean;
  };
}

export interface TaskHistoryLog {
  id: string;
  taskId: string;
  status: Task['status'];
  userName: string;
  userEmail: string;
  timestamp: number;
  note?: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  photo?: string;
  realizationPhotos?: string[];
  assignedTo: string | string[];
  assignedToEmail: string | string[];
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'in-progress' | 'completed';
  dueDate?: number;
  createdAt: number;
  completedAt?: number;
  createdBy: string;
  documentUrl?: string;
  history?: TaskHistoryLog[];
}

export interface CashAdvance {
  id: string;
  workerEmail: string;
  workerName: string;
  amount: number;
  note: string;
  timestamp: number;
  createdByName: string;
}

export interface ChatMessage {
  id: string;
  content: string;
  photo?: string;
  senderId: string;
  senderEmail: string;
  receiverEmail: string;
  timestamp: number;
}

export interface InventoryItem {
  id: string;
  name: string;
  category: string;
  stock: number;
  unit: string;
  minStock: number;
  updatedAt: number;
}

export interface Attendance {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  timestamp: number;
  type: 'tbm' | 'checkout';
  photo: string;
  projectId?: string;
  projectName?: string;
  location?: string;
  teamNote?: string;
}

export interface HseLog {
  id: string;
  userId: string;
  userEmail: string;
  timestamp: number;
  ppeCheck: boolean;
  toolCheck: boolean;
  environmentCheck: boolean;
  inductionConfirmed: boolean;
  photo?: string;
}

export interface IncidentReport {
  id: string;
  userId: string;
  userEmail: string;
  type: 'emergency' | 'accident' | 'near-miss';
  timestamp: number;
  latitude: number;
  longitude: number;
  description: string;
  photo?: string;
  status: 'open' | 'resolved';
}

export interface APDCheck {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  timestamp: number;
  photo?: string;
  items: {
    helm: boolean;
    rompi: boolean;
    sepatu: boolean;
    kacamata: boolean;
    sarungTangan: boolean;
    masker: boolean;
    harness: boolean;
  };
  status: 'Lengkap' | 'Tidak Lengkap';
  notes?: string;
}

export interface UserProfile {
  id: string;
  email: string;
  displayName?: string;
  lastInductionAt?: number;
  isStaff?: boolean;
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

export const handleFirestoreError = (error: unknown, operationType: OperationType, path: string | null) => {
  const errorMessage = error instanceof Error ? error.message : String(error);
  const isQuotaError = errorMessage.toLowerCase().includes('quota') || 
                       errorMessage.toLowerCase().includes('resource-exhausted') ||
                       errorMessage.toLowerCase().includes('limit exceeded');

  const errInfo: FirestoreErrorInfo = {
    error: errorMessage,
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  const jsonError = JSON.stringify(errInfo);
  console.error('Firestore Error: ', jsonError);
  
  // If it's a quota error, we don't want to throw and crash the whole app
  // The UI should handle it by checking the quotaExceeded state
  if (isQuotaError) {
    if (window.setAppQuotaExceeded) {
      window.setAppQuotaExceeded(true);
    }
    return; // Don't throw for quota errors to prevent app crash
  }

  throw new Error(jsonError);
};

declare global {
  interface Window {
    setAppQuotaExceeded?: (v: boolean) => void;
  }
}

interface AppContextType {
  user: User | null;
  authLoading: boolean;
  isAuthLoading: boolean;
  email: string;
  setEmail: (e: string) => void;
  password: string;
  setPassword: (p: string) => void;
  authError: string;
  handleLogin: (e: React.FormEvent, isPelaksana?: boolean) => Promise<void>;
  handleGoogleLogin: () => Promise<void>;
  handleLogout: () => void;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  
  projects: Project[];
  currentProjectId: string;
  setCurrentProjectId: (id: string) => void;
  currentProject: Project | undefined;
  isNewProjectModalOpen: boolean;
  setIsNewProjectModalOpen: (o: boolean) => void;
  newProjectName: string;
  setNewProjectName: (n: string) => void;
  newProjectType: Project['type'];
  setNewProjectType: (t: Project['type']) => void;
  newProjectDesc: string;
  setNewProjectDesc: (d: string) => void;
  newLocationInfo: string;
  setNewLocationInfo: (l: string) => void;
  newRegionalInfo: string;
  setNewRegionalInfo: (r: string) => void;
  newProjectTargetQty: string;
  setNewProjectTargetQty: (q: string) => void;
  newProjectDocumentUrl: string;
  setNewProjectDocumentUrl: (q: string) => void;
  handleCreateProject: () => Promise<void>;
  projectToDelete: Project | null;
  setProjectToDelete: (p: Project | null) => void;
  isDeleteProjectModalOpen: boolean;
  setIsDeleteProjectModalOpen: (o: boolean) => void;
  executeDeleteProject: () => Promise<void>;
  handleDeleteAllInletData: () => Promise<void>;
  
  userCheckIn: { timestamp: number; lat: number; lng: number } | null;
  handleCheckIn: () => Promise<void>;
  handleCheckOut: () => Promise<void>;
  equipmentList: string[];
  
  isDarkMode: boolean;
  setIsDarkMode: (d: boolean) => void;
  
  dashSearchQuery: string;
  setDashSearchQuery: (q: string) => void;
  dashDateFilter: string;
  setDashDateFilter: (f: string) => void;
  filteredProjects: Project[];
  
  km: string;
  setKm: (k: string) => void;
  lajurDropdown: string;
  setLajurDropdown: (l: string) => void;
  lajurManual: string;
  setLajurManual: (l: string) => void;
  density: string;
  setDensity: (d: string) => void;
  materialType: string;
  setMaterialType: (m: string) => void;
  panjang: string;
  setPanjang: (p: string) => void;
  lebar: string;
  setLebar: (l: string) => void;
  tebal: string;
  setTebal: (t: string) => void;
  location: { lat: number; lng: number } | null;
  setLocation: (loc: { lat: number; lng: number } | null) => void;
  handleGetLocation: () => void;
  isLocating: boolean;
  
  photos0: string[];
  setPhotos0: (p: string[]) => void;
  photos50: string[];
  setPhotos50: (p: string[]) => void;
  photos100: string[];
  equipmentUsed: string;
  setEquipmentUsed: (e: string) => void;
  setPhotos100: (p: string[]) => void;
  uploadingPhotos: UploadingPhoto[];
  removePhoto: (index: number, type: '0' | '50' | '100') => void;
  handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>, type: '0' | '50' | '100') => Promise<void>;
  
  // Generic entry fields
  kmTo: string;
  setKmTo: (k: string) => void;
  signType: string;
  setSignType: (s: string) => void;
  plantType: string;
  setPlantType: (p: string) => void;
  qty: string;
  setQty: (q: string) => void;
  entryStatus: 'pending' | 'in-progress' | 'completed';
  setEntryStatus: (s: 'pending' | 'in-progress' | 'completed') => void;
  entryDesc: string;
  setEntryDesc: (d: string) => void;

  entries: ProjectEntry[];
  handleAddEntry: () => Promise<void>;
  resetEntryForm: () => void;
  handleDeleteEntry: (id: string) => Promise<void>;
  isUploading: boolean;
  
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  filterLajur: string;
  setFilterLajur: (l: string) => void;
  startDate: string;
  setStartDate: (d: string) => void;
  endDate: string;
  setEndDate: (d: string) => void;
  showFilters: boolean;
  setShowFilters: (s: boolean) => void;
  resetFilters: () => void;
  
  viewMode: 'table' | 'charts' | 'report';
  setViewMode: (v: 'table' | 'charts' | 'report') => void;
  isSidebarOpen: boolean;
  setIsSidebarOpen: (o: boolean) => void;
  
  notifications: AppNotification[];
  isNotificationOpen: boolean;
  setIsNotificationOpen: (o: boolean) => void;
  addNotification: (title: string, message: string, type?: 'info' | 'success' | 'warning' | 'error') => Promise<void>;
  markNotifAsRead: (id: string) => Promise<void>;
  
  filteredEntries: AspalEntry[];
  totalTonase: number;
  totalVolume: number;
  lajurData: { name: string; value: number }[];
  timeData: { date: string; tonase: number; volume: number; units: number }[];
  exportExcel: (signature?: { name: string, role: string }) => Promise<void>;
  exportAllProjectsExcel: () => Promise<void>;
  exportInventoryToExcel: () => Promise<void>;
  selectedEntryPhotos: AspalEntry | null;
  setSelectedEntryPhotos: (e: AspalEntry | null) => void;
  
  editingEntryId: string | null;
  setEditingEntryId: (id: string | null) => void;
  handleEditEntry: (entry: ProjectEntry) => void;

  errors: Record<string, string>;
  setErrors: (e: Record<string, string>) => void;

  // User Management
  workers: Worker[];
  activeSessions: any[];
  handleAddWorker: (id: string, name: string, email: string, pass: string, role: Worker['role'], isPinned?: boolean, geofence?: Worker['geofenceLimit']) => Promise<void>;
  handleUpdateWorker: (id: string, name: string, email: string, pass: string, role: Worker['role'], isPinned?: boolean, geofence?: Worker['geofenceLimit']) => Promise<void>;
  handleDeleteWorker: (id: string) => Promise<void>;
  loginLogs: LoginLog[];
  tasks: Task[];
  
  handleCreateTask: (title: string, description: string, assignedTo: string | string[], assignedToEmail: string | string[], priority: Task['priority'], photo?: string, dueDate?: number, documentUrl?: string) => Promise<void>;
  handleUpdateTaskStatus: (taskId: string, status: Task['status'], realizationPhotos?: string[], isJustSavingProgress?: boolean) => Promise<void>;
  handleDeleteTask: (taskId: string) => Promise<void>;
  inventory: InventoryItem[];
  handleUpdateInventory: (itemId: string, newStock: number) => Promise<void>;
  handleAddInventoryItem: (item: Omit<InventoryItem, 'id' | 'updatedAt'>) => Promise<void>;
  handleDeleteInventoryItem: (itemId: string) => Promise<void>;
  
  // HSE & Incident Features
  hseLogs: HseLog[];
  incidents: IncidentReport[];
  attendanceLogs: Attendance[];
  apdChecks: APDCheck[];
  handleCreateAPDCheck: (items: APDCheck['items'], notes?: string, photo?: string) => Promise<void>;
  equipmentRequests: EquipmentRequest[];
  userProfile: UserProfile | null;
  handleCreateHseLog: (log: Omit<HseLog, 'id' | 'userId' | 'userEmail' | 'timestamp'>) => Promise<void>;
  handleSendSOS: (description?: string) => Promise<void>;
  handleReportIncident: (type: IncidentReport['type'], description: string, photo?: string) => Promise<void>;
  handleResolveIncident: (id: string) => Promise<void>;
  handleCreateAttendance: (type: 'tbm' | 'checkout', photo: string, projectId?: string, projectName?: string, note?: string) => Promise<void>;
  handleCreateEquipmentRequest: (req: Omit<EquipmentRequest, 'id' | 'userId' | 'userEmail' | 'timestamp' | 'status'>) => Promise<void>;
  handleUpdateEquipmentRequestStatus: (requestId: string, status: EquipmentRequest['status'], adminNote?: string) => Promise<void>;
  handleDeleteEquipmentRequest: (requestId: string) => Promise<void>;
  generateDPR: (projectId: string) => Promise<void>;
  
  // Fuel & Activity
  fuelLogs: FuelLog[];
  activities: Activity[];
  cashAdvances: CashAdvance[];
  handleUpdateAttendanceSettings: (settings: AttendanceSettings) => Promise<void>;
  handleCreateFuelLog: (log: Omit<FuelLog, 'id' | 'userId' | 'userEmail' | 'timestamp'>) => Promise<void>;
  logActivity: (activity: Omit<Activity, 'id' | 'userId' | 'userEmail' | 'timestamp'>) => Promise<void>;
  handleCreateCashAdvance: (advance: Omit<CashAdvance, 'id' | 'timestamp' | 'createdByName'>) => Promise<void>;
  handleDeleteCashAdvance: (id: string) => Promise<void>;
  
  chatMessages: ChatMessage[];
  handleSendMessage: (content: string, receiverEmail: string, photo?: string) => Promise<void>;
  handleClearChatMessages: () => Promise<void>;
  uploadFileToStorage: (file: File, folder?: string) => Promise<string>;
  compressImage: (file: File, maxWidth?: number, maxHeight?: number, quality?: number) => Promise<string>;
  compressImageToFile: (file: File, maxWidth?: number, maxHeight?: number, quality?: number) => Promise<File>;
  isOnline: boolean;
  quotaExceeded: boolean;
  setQuotaExceeded: (v: boolean) => void;
  isOutsideGeofence: boolean;
  
  isQuotaBlocked: boolean;
  quotaBlockedMessage: string;
  handleForceClearSessions: () => Promise<void>;
  needsInduction: boolean;
  
  showArchived: boolean;
  setShowArchived: (val: boolean) => void;
  handleArchiveEntry: (entryId: string, archive?: boolean) => Promise<void>;
  deferredPrompt: any;
  setDeferredPrompt: (val: any) => void;
  handleInstallApp: () => Promise<void>;
  isInstallModalOpen: boolean;
  setIsInstallModalOpen: (val: boolean) => void;
  
  // Access Key Management for Pelaksana
  activeAccessKeys: any[];
  generatePelaksanaKey: (customKey?: string) => Promise<void>;
  handleSendEmailVerification: () => Promise<void>;

}

export const AppContext = createContext<AppContextType | undefined>(undefined);

const executeWithRetry = async (fn: () => Promise<any>, retries = 3) => {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (err: any) {
      if (err.code === 'auth/network-request-failed' && i < retries - 1) {
        await new Promise(r => setTimeout(r, 1000 * (i + 1)));
        continue;
      }
      throw err;
    }
  }
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [sessionStartTime] = useState(() => Date.now());
  const [isQuotaBlocked, setIsQuotaBlocked] = useState(false);
  const [quotaBlockedMessage, setQuotaBlockedMessage] = useState("");

  const [currentUserData, setCurrentUserData] = useState<Worker | null>(null);
  const [isOutsideGeofence, setIsOutsideGeofence] = useState(false);

  const isSuperAdmin = useMemo(() => {
    if (!user) return false;
    const email = user.email?.toLowerCase();
    // Cleared all hardcoded admins as per user request
    const hardcodedAdmins: string[] = [
      'developmentshaka@gmail.com',
      'admin.shaka01@gmail.com',
      'adminshaka01@gmail.com',
      'riskiprataa3@gmail.com'
    ];
    return hardcodedAdmins.includes(email || '');
  }, [user]);

  const isAdmin = useMemo(() => {
    if (!user) return false;
    const email = user.email?.toLowerCase();
    
    // Strictly define admin accounts - Only based on database role now
    const isHardcodedAdmin = isSuperAdmin;
    const isWorkerAdmin = currentUserData?.role === 'admin';
    const isPelaksana = email === 'pelaksana.shaka@gmail.com';

    return (isHardcodedAdmin || isWorkerAdmin) && !isPelaksana;
  }, [user, currentUserData, isSuperAdmin]);

  const isRoleDetermined = useMemo(() => {
    if (!user) return false;
    // We consider role determined if we have worker data OR it's a superadmin
    return !!currentUserData || isSuperAdmin;
  }, [user, currentUserData, isSuperAdmin]);

  useEffect(() => {
    if (!user) {
      setCurrentUserData(null);
      return;
    }
    
    const rawEmail = user.email?.toLowerCase();
    const mappedEmail = rawEmail === 'adminshaka01@gmail.com' ? 'admin.shaka01@gmail.com' : rawEmail;
    
    // Use onSnapshot for real-time updates of worker settings/geofence
    const q = query(collection(db, 'workers'), where('email', '==', mappedEmail));
    const unsub = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        const docSnap = snapshot.docs[0];
        const data = docSnap.data() as Worker;
        
        // Migration if needed
        if (docSnap.id !== user.uid) {
           setDoc(doc(db, 'workers', user.uid), { ...data, id: user.uid }, { merge: true }).catch(e => console.warn('Migration error:', e));
           setCurrentUserData({ ...data, id: user.uid } as Worker);
        } else {
           setCurrentUserData({ id: docSnap.id, ...data } as Worker);
        }
      }
    }, (err) => {
      console.warn('Worker real-time sync failed:', err.message);
    });

    return () => unsub();
  }, [user]);

  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isLocating, setIsLocating] = useState(false);

  // Global Geofence Enforcement
  useEffect(() => {
    if (!user || isAdmin || !currentUserData?.geofenceLimit?.enabled || !location) {
      setIsOutsideGeofence(false);
      return;
    }

    const checkGeofence = () => {
      const distance = calculateDistance(
        location.lat,
        location.lng,
        currentUserData.geofenceLimit!.lat,
        currentUserData.geofenceLimit!.lng
      );
      
      if (distance > currentUserData.geofenceLimit!.radius) {
        setIsOutsideGeofence(true);
      } else {
        setIsOutsideGeofence(false);
      }
    };

    checkGeofence();
  }, [user, isAdmin, currentUserData, location]);

  const [userCheckIn, setUserCheckIn] = useState<{ timestamp: number; lat: number; lng: number } | null>(null);


  // Geolocation Distance Helper (Haversine)
  useEffect(() => {
    if (!user || !isRoleDetermined) {
      if (!user) setAttendanceLogs([]);
      return;
    }
    const constraints: any[] = [limit(500)];
    if (isAdmin) {
      constraints.push(orderBy('timestamp', 'desc'));
    } else {
      constraints.push(where('userId', '==', user.uid));
      constraints.push(orderBy('timestamp', 'desc'));
    }
    const q = query(collection(db, 'attendance'), ...constraints);
    const unsub = onSnapshot(q, (snapshot) => {
      setAttendanceLogs(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Attendance)));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'attendance');
    });
    return () => unsub();
  }, [user, isRoleDetermined, isAdmin]);

  const handleCreateAttendance = async (type: 'tbm' | 'checkout', photo: string, projectId?: string, projectName?: string, note?: string) => {
    if (!user) return;
    
    // Safety check: Prevent double submissions within short period (e.g. 15 minutes)
    const recentTime = Date.now() - 15 * 60 * 1000;
    const isDuplicate = attendanceLogs.some(log => 
      log.userId === user.uid && 
      log.type === type && 
      log.timestamp > recentTime
    );

    if (isDuplicate) {
      addNotification("Sudah Tercatat", `Anda sudah melakukan absen ${type === 'tbm' ? 'TBM' : 'Keluar'} dalam 15 menit terakhir.`, "warning");
      return;
    }

    try {
      const data: Omit<Attendance, 'id'> = {
        userId: user.uid,
        userEmail: user.email || '',
        userName: currentUserData?.name || user.displayName || user.email?.split('@')[0] || 'User',
        timestamp: Date.now(),
        type,
        photo,
        projectId,
        projectName,
        teamNote: note,
        location: location ? `${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}` : undefined
      };
      
      await addDoc(collection(db, 'attendance'), data);
      
      const title = type === 'tbm' ? 'Absen TBM Dimulai' : 'Absen Selesai Kerja';
      const msg = type === 'tbm' ? `TBM Pekerjaan berhasil dilaporkan oleh ${data.userName}.` : `Laporan selesai kerja berhasil dikirim oleh ${data.userName}.`;
      
      addNotification(title, msg, 'success');
      
      await logActivity({
        type: 'hse',
        action: type === 'tbm' ? 'TBM_START' : 'SHIFT_END',
        title: title,
        description: msg,
        projectId
      });
    } catch (e: any) {
      handleFirestoreError(e, OperationType.CREATE, 'attendance');
    }
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371e3; // metres
    const φ1 = lat1 * Math.PI/180;
    const φ2 = lat2 * Math.PI/180;
    const Δφ = (lat2-lat1) * Math.PI/180;
    const Δλ = (lon2-lon1) * Math.PI/180;
    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const [attendanceSettings, setAttendanceSettings] = useState<AttendanceSettings | null>(null);

  useEffect(() => {
    if (!user) {
      setAttendanceSettings(null);
      return;
    }
    const unsub = onSnapshot(doc(db, 'app_settings', 'attendance'), (docSnap) => {
      if (docSnap.exists()) {
        setAttendanceSettings(docSnap.data() as AttendanceSettings);
      } else {
        // Build initial settings if not exists
        const initial = {
            allowedLat: -6.2088, // Default Jakarta or some coordinate
            allowedLng: 106.8456,
            radius: 100, // 100 meters
            enabled: false
        };
        setAttendanceSettings(initial);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'app_settings/attendance');
    });
    return () => unsub();
  }, []);

  const handleUpdateAttendanceSettings = async (settings: AttendanceSettings) => {
    if (!isAdmin) return;
    try {
      await setDoc(doc(db, 'app_settings', 'attendance'), settings);
      addNotification('Pengaturan Diperbarui', 'Lokasi absen berhasil diperbarui.', 'success');
      
      await logActivity({
        type: 'inventory',
        action: 'UPDATED',
        title: 'Lokasi Absen Diubah',
        description: `Admin ${user?.email} mengubah pengaturan lokasi absen.`
      });
    } catch (e: any) {
      handleFirestoreError(e, OperationType.UPDATE, 'app_settings/attendance');
    }
  };



  // Feature 2: Geofenced Check-in
  const handleCheckIn = async () => {
    let currentLat = location?.lat;
    let currentLng = location?.lng;

    if (!currentLat || !currentLng) {
      addNotification('Sistem GPS', 'Sedang mengambil lokasi presensi (pastikan GPS HP aktif)...', 'info');
      try {
        const pos: any = await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, { 
            enableHighAccuracy: true, 
            timeout: 10000,
            maximumAge: 0
          });
        });
        currentLat = pos.coords.latitude;
        currentLng = pos.coords.longitude;
        setLocation({ lat: currentLat, lng: currentLng });
      } catch (err: any) {
        if (err.code === 1) {
          addNotification('Akses GPS Ditolak', 'Izinkan aplikasi mengakses lokasi di pengaturan HP/Browser Anda.', 'error');
        } else if (err.code === 2) {
          addNotification('GPS Tidak Tersedia', 'Pastikan fitur GPS / Lokasi di HP Anda sudah dinyalakan.', 'error');
        } else {
          addNotification('Gagal', 'Lokasi GPS tidak terdeteksi. Pastikan sinyal GPS baik.', 'warning');
        }
        return;
      }
    }

    // 1. Check Worker-Specific Geofence (if enabled)
    if (currentUserData?.geofenceLimit?.enabled) {
      const distance = calculateDistance(
        currentLat!,
        currentLng!,
        currentUserData.geofenceLimit.lat,
        currentUserData.geofenceLimit.lng
      );
      if (distance > currentUserData.geofenceLimit.radius) {
        addNotification('Gagal Absen', `Anda berada di luar area proyek (${Math.round(distance - currentUserData.geofenceLimit.radius)}m di luar radius).`, 'warning');
        return;
      }
    }
    // 2. Fallback to Global Settings (if enabled and no worker-specific limit)
    else if (attendanceSettings?.enabled) {
      const distance = calculateDistance(
        currentLat!, 
        currentLng!, 
        attendanceSettings.allowedLat, 
        attendanceSettings.allowedLng
      );

      if (distance > attendanceSettings.radius) {
        addNotification('Gagal Absen', `Anda berada ${Math.round(distance)}m dari lokasi kantor. Maksimal radius ${attendanceSettings.radius}m.`, 'warning');
        return;
      }
    }
    
    const checkInData = {
      timestamp: Date.now(),
      lat: currentLat!,
      lng: currentLng!,
      userId: user?.uid,
      userName: currentUserData?.name || userProfile?.displayName || user?.email || 'User'
    };

    try {
      await addDoc(collection(db, 'presensi'), checkInData);
      setUserCheckIn(checkInData);
      localStorage.setItem('user_check_in', JSON.stringify(checkInData));
      addNotification('Berhasil', 'Check-in berhasil dilakukan di lokasi proyek.', 'success');
    } catch (err: any) {
      handleFirestoreError(err, OperationType.CREATE, 'presensi');
    }
  };

  useEffect(() => {
    const saved = localStorage.getItem('user_check_in');
    if (saved) {
      const parsed = JSON.parse(saved);
      // Reset after 12 hours
      if (Date.now() - parsed.timestamp < 43200000) {
        setUserCheckIn(parsed);
      }
    }
  }, []);

  const [equipmentList] = useState(['Dump Truck', 'Excavator', 'Vibratory Roller', 'Asphalt Finisher', 'Crane', 'Mobil Pick-up', 'Lainnya']);
  
  useEffect(() => {
    // Auto-provision requested accounts
    const provisionAccounts = async () => {
        if (!isOnline || !user) return;
        
        const sessionKey = `provision_sync_${user.uid}`;
        if (sessionStorage.getItem(sessionKey)) return;
        
        const userEmail = user.email?.toLowerCase();
        
        try {
            const accounts = [
                { email: 'developmentshaka@gmail.com', pass: 'Riski1310', name: 'DEV SHAKA', id: 'ADMIN-DEV', role: 'admin' },
                { email: 'admin.shaka01@gmail.com', pass: 'Riski1310', name: 'ADMIN SHAKA 01', id: 'ADMIN-01', role: 'admin' },
                { email: 'riskiprataa3@gmail.com', pass: 'Riski1310', name: 'RISKI PRATAMA', id: 'OWNER-01', role: 'admin' },
                { email: 'pelaksana.shaka@gmail.com', pass: '089519451234', name: 'PELAKSANA SHAKA', id: 'EMP-PEL-001', role: 'field-operator' }
            ];
            
            // Sync only non-admin accounts or based on system needs
            // Admin accounts are now managed strictly through the dashboard manually
            
            for (const acc of accounts) {
                // If this is the current user, or if current user is an admin, we can sync
                if (userEmail !== acc.email && !isAdmin) continue;

                const q = query(collection(db, 'workers'), where('email', '==', acc.email));
                const snap = await getDocs(q);
                if (snap.empty) {
                    await addDoc(collection(db, 'workers'), {
                        employeeId: acc.id,
                        name: acc.name,
                        email: acc.email,
                        password: acc.pass,
                        role: acc.role,
                        createdAt: Date.now()
                    });
                } else {
                    const docId = snap.docs[0].id;
                    const existingData = snap.docs[0].data();
                    if (existingData.password !== acc.pass || existingData.role !== acc.role || existingData.name !== acc.name) {
                        await updateDoc(doc(db, 'workers', docId), { 
                          password: acc.pass, 
                          role: acc.role,
                          name: acc.name 
                        });
                    }
                }
            }
            sessionStorage.setItem(sessionKey, 'true');
        } catch (err: any) {
            if (err.code !== 'permission-denied') {
              console.warn('Provisioning check failed:', err.message);
            }
        }
    };
    provisionAccounts();
  }, [isOnline, user]);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');

  const [projectsMetadata, setProjectsMetadata] = useState<Project[]>([]);
  const [currentProjectId, setCurrentProjectId] = useState<string>('');
  const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectType, setNewProjectType] = useState<Project['type']>('asphalt');
  const [newProjectDesc, setNewProjectDesc] = useState('');
  const [newLocationInfo, setNewLocationInfo] = useState('');
  const [newRegionalInfo, setNewRegionalInfo] = useState('');
  const [newProjectRequiredTools, setNewProjectRequiredTools] = useState<string[]>([]);
  const [newProjectTargetQty, setNewProjectTargetQty] = useState('');
  const [newProjectDocumentUrl, setNewProjectDocumentUrl] = useState('');
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
  const [isDeleteProjectModalOpen, setIsDeleteProjectModalOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallModalOpen, setIsInstallModalOpen] = useState(false);

  useEffect(() => {
    const handleBeforeInstall = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  const [isStandalone, setIsStandalone] = React.useState(false);

  React.useEffect(() => {
    // Check if running as installed app
    if (window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone === true) {
      setIsStandalone(true);
    }
  }, []);

  const handleInstallApp = async () => {
    // If in iframe, always just open in new tab
    if (window.self !== window.top) {
      alert('🚀 INISIASI NATIVE ENGINE (1/2):\n\nKeamanan browser memblokir instalasi dari dalam "Preview".\n\nKlik OK untuk membuka aplikasi ke Tab Baru, lalu klik tombol "Download/Install" lagi di sana agar tombol "Pasang Native" muncul.');
      window.open(window.location.href, '_blank');
      return;
    }
    
    // If we have the prompt, try it
    if (deferredPrompt) {
      try {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
          setDeferredPrompt(null);
          setIsInstallModalOpen(false);
          return;
        }
      } catch(e) {
        console.warn("PWA prompt failed:", e);
      }
    }

    // If no prompt or it failed/ignored, show the guidebook
    setIsInstallModalOpen(true);
  };

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const [dashSearchQuery, setDashSearchQuery] = useState('');
  const [dashDateFilter, setDashDateFilter] = useState('');
  const [editingEntryId, setEditingEntryId] = useState<string | null>(null);

  const [km, setKm] = useState('');
  const [kmTo, setKmTo] = useState('');
  const [signType, setSignType] = useState('');
  const [plantType, setPlantType] = useState('');
  const [qty, setQty] = useState('');
  const [entryStatus, setEntryStatus] = useState<'pending' | 'in-progress' | 'completed'>('completed');
  const [entryDesc, setEntryDesc] = useState('');

  const [lajurDropdown, setLajurDropdown] = useState('');
  const [lajurManual, setLajurManual] = useState('');
  const [panjang, setPanjang] = useState('');
  const [lebar, setLebar] = useState('');
  const [tebal, setTebal] = useState('');
  const [density, setDensity] = useState('2.300');
  const [materialType, setMaterialType] = useState('AC-WC');

  const [photos0, setPhotos0] = useState<string[]>([]);
  const [photos50, setPhotos50] = useState<string[]>([]);
  const [photos100, setPhotos100] = useState<string[]>([]);
  const [equipmentUsed, setEquipmentUsed] = useState<string>('');
  const [uploadingPhotos, setUploadingPhotos] = useState<UploadingPhoto[]>([]);
  const [isEntryArchived, setIsEntryArchived] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedEntryPhotos, setSelectedEntryPhotos] = useState<AspalEntry | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterLajur, setFilterLajur] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'table' | 'charts' | 'report'>('table');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [showArchived, setShowArchived] = useState(false);
  const [showArchivedProjects, setShowArchivedProjects] = useState(false);
  const [showArchivedTasks, setShowArchivedTasks] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);

  // --- FORM DRAFT PERSISTENCE (Fix for mobile camera reloads) ---
  useEffect(() => {
    const savedDraft = localStorage.getItem('shaka_entry_draft');
    if (savedDraft) {
      try {
        const d = JSON.parse(savedDraft);
        if (d.km) setKm(d.km);
        if (d.kmTo) setKmTo(d.kmTo);
        if (d.signType) setSignType(d.signType);
        if (d.plantType) setPlantType(d.plantType);
        if (d.qty) setQty(d.qty);
        if (d.entryStatus) setEntryStatus(d.entryStatus);
        if (d.entryDesc) setEntryDesc(d.entryDesc);
        if (d.lajurDropdown) setLajurDropdown(d.lajurDropdown);
        if (d.lajurManual) setLajurManual(d.lajurManual);
        if (d.panjang) setPanjang(d.panjang);
        if (d.lebar) setLebar(d.lebar);
        if (d.tebal) setTebal(d.tebal);
        if (d.density) setDensity(d.density);
        if (d.materialType) setMaterialType(d.materialType);
        if (d.photos0) setPhotos0(d.photos0);
        if (d.photos50) setPhotos50(d.photos50);
        if (d.photos100) setPhotos100(d.photos100);
        if (d.equipmentUsed) setEquipmentUsed(d.equipmentUsed);
      } catch (e) {}
    }
  }, []);

  useEffect(() => {
    // Only save if there's actual data to avoid overwriting with empty defaults on mount
    if (!km && !entryDesc && photos0.length === 0 && photos50.length === 0 && photos100.length === 0) return;
    
    const draft = {
      km, kmTo, signType, plantType, qty, entryStatus, entryDesc,
      lajurDropdown, lajurManual, panjang, lebar, tebal, density, materialType,
      photos0, photos50, photos100, equipmentUsed
    };
    localStorage.setItem('shaka_entry_draft', JSON.stringify(draft));
  }, [km, kmTo, signType, plantType, qty, entryStatus, entryDesc, lajurDropdown, lajurManual, panjang, lebar, tebal, density, materialType, photos0, photos50, photos100, equipmentUsed]);

  const clearFormDraft = () => {
    localStorage.removeItem('shaka_entry_draft');
  };
  // -------------------------------------------------------------

  useEffect(() => {
    if (user?.email?.toLowerCase() === 'pelaksana.shaka@gmail.com') {
      const loginTimestamp = localStorage.getItem('shaka_pelaksana_login_timestamp');
      if (loginTimestamp) {
        const diff = Date.now() - parseInt(loginTimestamp);
        const twentyFourHours = 24 * 60 * 60 * 1000;
        
        if (diff > twentyFourHours) {
          handleLogout();
          addNotification('Sesi Berakhir', 'Sesi login Pelaksana telah berakhir (24 jam). Silakan login kembali.', 'warning');
        }
      }
    }
  }, [user]);

  // Periodic check for 24h logout (every minute)
  useEffect(() => {
    const interval = setInterval(() => {
      if (user?.email?.toLowerCase() === 'pelaksana.shaka@gmail.com') {
        const loginTimestamp = localStorage.getItem('shaka_pelaksana_login_timestamp');
        if (loginTimestamp) {
          const diff = Date.now() - parseInt(loginTimestamp);
          const twentyFourHours = 24 * 60 * 60 * 1000;
          if (diff > twentyFourHours) {
            handleLogout();
            addNotification('Sesi Berakhir', 'Sesi login Pelaksana telah berakhir (24 jam).', 'warning');
          }
        }
      }
    }, 60000); // 1 minute
    return () => clearInterval(interval);
  }, [user]);

  const [toasts, setToasts] = useState<AppNotification[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [quotaExceeded, setQuotaExceeded] = useState(false);

  useEffect(() => {
    window.setAppQuotaExceeded = setQuotaExceeded;
    return () => {
      delete window.setAppQuotaExceeded;
    };
  }, []);

  // --- Monthly Data Cleanup (Admin Only) ---
  useEffect(() => {
    if (isAdmin && user) {
      const autoCleanup = async () => {
        try {
          const lastCleanupKey = `last_monthly_cleanup_${user.uid}`;
          const currentMonth = new Date().getMonth();
          const lastCleanupMonth = localStorage.getItem(lastCleanupKey);

          if (lastCleanupMonth !== currentMonth.toString()) {
            const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
            const collectionsToClean = ['apd_checks', 'incidents', 'hse_logs', 'activities'];
            
            console.log('Starting monthly cleanup of old HSE and Incident data...');
            
            for (const colName of collectionsToClean) {
              const q = query(collection(db, colName), where('timestamp', '<', thirtyDaysAgo));
              const snap = await getDocs(q);
              
              if (!snap.empty) {
                // Process in chunks of 500 (Firestore limit for batch)
                let count = 0;
                let batch = writeBatch(db);
                for (const docSnap of snap.docs) {
                  batch.delete(docSnap.ref);
                  count++;
                  if (count === 500) {
                    await batch.commit();
                    batch = writeBatch(db);
                    count = 0;
                  }
                }
                if (count > 0) await batch.commit();
              }
            }
            
            localStorage.setItem(lastCleanupKey, currentMonth.toString());
            console.log('Monthly data cleanup completed successfully.');
          }
        } catch (err) {
          console.error('Data cleanup error:', err);
        }
      };
      autoCleanup();
    }
  }, [isAdmin, user]);
  // --- End Cleanup Logic ---

  const [workers, setWorkers] = useState<Worker[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [activeAccessKeys, setActiveAccessKeys] = useState<any[]>([]);
  const [isCreatingProject, setIsCreatingProject] = useState(false);
  const [isCreatingTask, setIsCreatingTask] = useState(false);
  const [isAddingEntry, setIsAddingEntry] = useState(false);
  const [isArchiving, setIsArchiving] = useState(false);
  const [loginLogs, setLoginLogs] = useState<LoginLog[]>([]);
  const [activeSessions, setActiveSessions] = useState<any[]>([]);
  const [equipmentRequests, setEquipmentRequests] = useState<EquipmentRequest[]>([]);
  const [sessionId] = useState(() => {
    const saved = localStorage.getItem('shaka_session_id');
    if (saved) return saved;
    const newId = Math.random().toString(36).substring(2) + Date.now().toString(36);
    localStorage.setItem('shaka_session_id', newId);
    return newId;
  });

  // Enforce Single Login
  useEffect(() => {
    if (!user) return;
    
    // 1. Initial set session (if not exists or refresh)
    const syncSession = async () => {
      const sessionRef = doc(db, 'active_sessions', user.uid);
      await setDoc(sessionRef, {
        userId: user.uid,
        email: user.email,
        sessionId: sessionId,
        lastActive: Date.now(),
        userAgent: navigator.userAgent
      }, { merge: true });
    };
    
    syncSession();

    // 2. Listen for session conflict
    const unsubscribe = onSnapshot(doc(db, 'active_sessions', user.uid), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.sessionId !== sessionId) {
          handleLogout();
          addNotification('Sesi Duplikat', 'Akun Anda login di perangkat lain. Sesi ini telah berakhir.', 'warning');
        }
      }
    }, (err) => {
      handleFirestoreError(err, OperationType.GET, `active_sessions/${user.uid}`);
    });

    return () => unsubscribe();
  }, [user, sessionId]);

  // Sync Equipment Requests - Optimized for Quota
  useEffect(() => {
    if (!user) {
      setEquipmentRequests([]);
      return;
    }
    
    const constraints: any[] = [limit(500)];
    if (isAdmin) {
      constraints.push(orderBy('timestamp', 'desc'));
    } else {
      constraints.push(where('userId', '==', user.uid));
      constraints.push(orderBy('timestamp', 'desc'));
    }

    const unsub = onSnapshot(query(collection(db, 'equipment_requests'), ...constraints), (snapshot) => {
      const requests: EquipmentRequest[] = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() as any } as EquipmentRequest));
      setEquipmentRequests(requests);
    }, (err) => {
      console.warn('Equipment requests sync failed:', err.message);
    });
    return () => unsub();
  }, [user, isAdmin]);

  // Sync all active sessions - Real-time
  useEffect(() => {
    if (!user) {
      setActiveSessions([]);
      return;
    }

    const unsub = onSnapshot(query(collection(db, 'active_sessions'), orderBy('startTime', 'desc'), limit(500)), (snapshot) => {
      const sData: any[] = [];
      const now = Date.now();
      snapshot.forEach(docSnap => {
        const data = docSnap.data();
        if (now - (data.lastActive || 0) < 15 * 60 * 1000) {
          sData.push({ id: docSnap.id, ...data });
        }
      });
      setActiveSessions(sData);
    }, (err) => {
      console.warn('Sessions sync failed:', err.message);
    });
    return () => unsub();
  }, [user, isAdmin]);

  // Keep session alive - with unique sessionId
  useEffect(() => {
    if (!user) return;
    
    const updateSession = async () => {
      try {
        const email = user.email?.toLowerCase() || '';
        const role = isAdmin ? 'admin' : (isSuperAdmin ? 'superadmin' : 'pelaksana');
        
        await setDoc(doc(db, 'active_sessions', user.uid), {
          uid: user.uid,
          email,
          role,
          startTime: sessionStartTime,
          lastActive: Date.now(),
          sessionId,
          userAgent: navigator.userAgent
        }, { merge: true });
      } catch (e) {}
    };

    updateSession();
    const interval = setInterval(updateSession, 120000); // Every 2 minutes
    
    return () => {
      clearInterval(interval);
      // Optional: cleanup session on logout/close? 
      // Firestore rules might prevent this if user is already null, so we rely on TTL in syncEffect
    };
  }, [user, isAdmin, isSuperAdmin, sessionId, sessionStartTime]);

  // Disable User Role Limits
  useEffect(() => {
    setIsQuotaBlocked(false);
  }, []);

  const needsInduction = useMemo(() => {
    if (!user || isAdmin) return false;
    if (!userProfile?.lastInductionAt) return true;
    const oneDay = 24 * 60 * 60 * 1000;
    return (Date.now() - userProfile.lastInductionAt) > oneDay;
  }, [user, userProfile, isAdmin]);

  // Sync Workers - Real-time
  useEffect(() => {
    if (!user) {
      setWorkers([]);
      return;
    }
    
    const unsub = onSnapshot(query(collection(db, 'workers'), orderBy('createdAt', 'desc'), limit(1000)), (snapshot) => {
      const wData: Worker[] = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() as any } as Worker));
      setWorkers(wData);
    }, (err) => {
      console.warn('Workers sync failed:', err.message);
    });
    return () => unsub();
  }, [user, isAdmin]);

  // Sync Access Keys for Pelaksana
  useEffect(() => {
    if (!user || !isAdmin) {
      setActiveAccessKeys([]);
      return;
    }
    const unsub = onSnapshot(query(collection(db, 'access_keys'), orderBy('createdAt', 'desc'), limit(500)), (snapshot) => {
      setActiveAccessKeys(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, [user, isAdmin]);

  const handleAddWorker = async (empId: string, name: string, email: string, pass: string, role: Worker['role'], dailyRate?: number, isPinned?: boolean, geofence?: Worker['geofenceLimit']) => {
    if (!isAdmin) return;
    try {
      // User requested limits: Admin max 5, Pelaksana max 7
      const roleLimit = role === 'admin' ? 5 : 7;
      const currentCount = workers.filter(w => w.role === role).length;
      
      if (currentCount >= roleLimit) {
        addNotification('Batas Maksimal', `Jumlah personil ${role.toUpperCase()} sudah mencapai batas maksimal (${roleLimit}).`, 'warning');
        return;
      }

      if (workers.some(w => w.email.toLowerCase() === email.toLowerCase())) {
        addNotification('Email Terdaftar', 'Personil dengan email ini sudah ada dalam sistem.', 'error');
        return;
      }

      const dbEntry = {
        employeeId: empId.trim(),
        name: name.trim(),
        email: ensureFullEmail(email),
        password: pass.trim(),
        role,
        dailyRate: dailyRate || 0,
        isPinnedToLogin: !!isPinned,
        geofenceLimit: geofence || null,
        createdAt: Date.now()
      };
      const docRef = await addDoc(collection(db, 'workers'), dbEntry);
      addNotification('Pekerja Ditambahkan', `${name} (${empId}) telah terdaftar.`, 'success');
    } catch (err) {
      console.error('Failed to add worker:', err);
    }
  };

  const handleUpdateWorker = async (id: string, name: string, email: string, pass: string, role: Worker['role'], dailyRate?: number, isPinned?: boolean, geofence?: Worker['geofenceLimit']) => {
    if (!isAdmin) return;
    try {
      const dbEntry = {
        name: name.trim(),
        email: ensureFullEmail(email),
        password: pass.trim(),
        role,
        dailyRate: dailyRate || 0,
        isPinnedToLogin: !!isPinned,
        geofenceLimit: geofence || null
      };
      await setDoc(doc(db, 'workers', id), dbEntry, { merge: true });
      addNotification('Data Diperbarui', `Pekerja ${name} telah diperbarui.`, 'success');
    } catch (err) {
      console.error('Failed to update worker:', err);
    }
  };

  const handleDeleteWorker = async (id: string) => {
    if (!isAdmin) return;
    try {
      await deleteDoc(doc(db, 'workers', id));
      addNotification('Pekerja Dihapus', 'Data pekerja telah dihapus.', 'warning');
    } catch (err) {
      console.error('Failed to delete worker:', err);
    }
  };
  const [tasks, setTasks] = useState<Task[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [hseLogs, setHseLogs] = useState<HseLog[]>([]);
  const [incidents, setIncidents] = useState<IncidentReport[]>([]);
  const [attendanceLogs, setAttendanceLogs] = useState<Attendance[]>([]);
  const [apdChecks, setApdChecks] = useState<APDCheck[]>([]);
  const [fuelLogs, setFuelLogs] = useState<FuelLog[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [cashAdvances, setCashAdvances] = useState<CashAdvance[]>([]);
  
  // Real-time HSE & Incident Sync - Optimized for Quota
  useEffect(() => {
    if (!user || !isRoleDetermined) return;
    
    // HSE Logs - limit to 500 logic, to prevent load slow and quota exhaustion
    const unsubHse = onSnapshot(query(
      collection(db, 'hse_logs'), 
      ...(isAdmin ? [orderBy('timestamp', 'desc'), limit(5000)] : [where('userId', '==', user.uid), orderBy('timestamp', 'desc'), limit(5000)])
    ), (snapshot) => {
      setHseLogs(snapshot.docs.map(d => ({ id: d.id, ...d.data() as any } as HseLog)));
    }, (err) => {
      if (err.message.includes('quota') || err.message.includes('resource-exhausted')) {
        setIsQuotaBlocked(true);
        setQuotaBlockedMessage('Firestore Quota Exceeded (Reads). Silakan coba lagi beberapa saat lagi atau hubungi Admin.');
      }
    });

    const incConstraints: any[] = [limit(500)];
    if (isAdmin) {
      incConstraints.push(orderBy('timestamp', 'desc'));
    } else {
      incConstraints.push(where('userId', '==', user.uid));
      incConstraints.push(orderBy('timestamp', 'desc'));
    }
    const unsubInc = onSnapshot(query(collection(db, 'incidents'), ...incConstraints), (snapshot) => {
      setIncidents(snapshot.docs.map(d => ({ id: d.id, ...d.data() as any } as IncidentReport)));
    });

    const apdConstraints: any[] = [limit(500)];
    if (isAdmin) {
      apdConstraints.push(orderBy('timestamp', 'desc'));
    } else {
      apdConstraints.push(where('userId', '==', user.uid));
      apdConstraints.push(orderBy('timestamp', 'desc'));
    }
    const unsubApd = onSnapshot(query(collection(db, 'apd_checks'), ...apdConstraints), (snapshot) => {
      setApdChecks(snapshot.docs.map(d => ({ id: d.id, ...d.data() as any } as APDCheck)));
    });

    const unsubCash = onSnapshot(query(
      collection(db, 'cash_advances'),
      orderBy('timestamp', 'desc'),
      limit(500)
    ), (snapshot) => {
      setCashAdvances(snapshot.docs.map(d => ({ id: d.id, ...d.data() as any } as CashAdvance)));
    }, (e) => handleFirestoreError(e, OperationType.GET, 'cash_advances'));

    const fuelConstraints: any[] = [limit(500)];
    if (isAdmin) {
      fuelConstraints.push(orderBy('timestamp', 'desc'));
    } else {
      fuelConstraints.push(where('userId', '==', user.uid));
      fuelConstraints.push(orderBy('timestamp', 'desc'));
    }
    const unsubFuel = onSnapshot(query(collection(db, 'fuel_logs'), ...fuelConstraints), (snapshot) => {
      setFuelLogs(snapshot.docs.map(d => ({ id: d.id, ...d.data() as any } as FuelLog)));
    });

    // Activities - limit to 500 logic, to prevent load slow and quota exhaustion
    const unsubAct = onSnapshot(query(
      collection(db, 'activities'), 
      ...(isAdmin ? [orderBy('timestamp', 'desc'), limit(500)] : [where('userId', '==', user.uid), orderBy('timestamp', 'desc'), limit(500)])
    ), (snapshot) => {
      setActivities(snapshot.docs.map(d => ({ id: d.id, ...d.data() as any } as Activity)));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'activities');
    });

    if (isAdmin) {
      setTimeout(async () => {
        try {
          const twoDaysAgo = Date.now() - (2 * 24 * 60 * 60 * 1000);
          const q = query(collection(db, 'activities'), where('timestamp', '<', twoDaysAgo), limit(200));
          const snap = await getDocs(q);
          if (!snap.empty) {
            const batch = writeBatch(db);
            snap.docs.forEach(d => batch.delete(d.ref));
            await batch.commit();
            console.log(`Cleaned up ${snap.size} old activities`);
          }
        } catch (error: any) {
          if (!error?.message?.includes('permissions')) {
            console.error("Failed to clean up old activities", error);
          }
        }
      }, 5000);
    }

    return () => {
      unsubHse();
      unsubInc();
      unsubFuel();
      unsubAct();
      unsubApd();
      unsubCash();
    };
  }, [user, isRoleDetermined, isAdmin]);

  // Clean up userProfile fetch to use onSnapshot instead of getDocs to keep it updated without double-triggering
  useEffect(() => {
    if (!user) {
      setUserProfile(null);
      return;
    }
    const unsub = onSnapshot(doc(db, 'user_profiles', user.uid), (docSnap) => {
      if (docSnap.exists()) {
        setUserProfile({ id: docSnap.id, ...docSnap.data() as any } as UserProfile);
      } else {
        setUserProfile({ id: user.uid, email: user.email || '' });
      }
    }, (err) => {
      console.warn('Profile sync failed:', err.message);
    });
    return () => unsub();
  }, [user]);

  const handleCreateAPDCheck = async (items: APDCheck['items'], notes?: string, photo?: string) => {
    if (!user) return;
    try {
      const isLengkap = Object.values(items).every(v => v === true);
      const apdData: any = {
        userId: user.uid,
        userEmail: user.email?.toLowerCase(),
        userName: user.displayName || user.email?.split('@')[0],
        timestamp: Date.now(),
        items,
        status: isLengkap ? 'Lengkap' : 'Tidak Lengkap',
      };
      if (notes) apdData.notes = notes;
      if (photo) apdData.photo = photo;

      const docRef = await addDoc(collection(db, 'apd_checks'), apdData);
      addNotification('Inspeksi APD Berkala', isLengkap ? 'Semua kelengkapan APD lengkap.' : 'Terdapat kelengkapan APD yang kurang.', isLengkap ? 'success' : 'warning');
      
      if (!isLengkap) {
        addDoc(collection(db, 'notifications'), {
          title: 'Pelanggaran APD Terdeteksi',
          message: `${apdData.userName} melaporkan APD Tidak Lengkap.`,
          timestamp: Date.now(),
          type: 'warning',
          ownerId: 'SYSTEM'
        }).catch(e => {
          if (e?.code !== 'already-exists' && !e?.message?.includes('already exists')) console.error(e);
        });
      }
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, 'apd_checks');
    }
  };

  const logActivity = async (activity: Omit<Activity, 'id' | 'userId' | 'userEmail' | 'timestamp'>) => {
    if (!user) return;
    try {
      const newAct = {
        ...activity,
        userId: user.uid,
        userEmail: user.email?.toLowerCase(),
        timestamp: Date.now()
      };
      const docRef = await addDoc(collection(db, 'activities'), newAct);
      setActivities(prev => [{ id: docRef.id, ...newAct } as Activity, ...prev]);
    } catch (err) {
      console.warn('Activity logging failed:', err);
    }
  };

  const handleCreateCashAdvance = async (advance: Omit<CashAdvance, 'id' | 'timestamp' | 'createdByName'>) => {
    if (!user || !isAdmin) return;
    
    // Prevent duplicates (same worker, amount, within 2 mins)
    const recent = Date.now() - 120 * 1000;
    const isDup = cashAdvances.some(a => 
      a.workerEmail === advance.workerEmail && 
      a.amount === advance.amount && 
      a.timestamp > recent
    );
    if (isDup) {
      addNotification("Sudah Tercatat", "Kasbon yang sama baru saja diinput untuk personil ini.", "warning");
      return;
    }

    try {
      await addDoc(collection(db, 'cash_advances'), {
        ...advance,
        timestamp: Date.now(),
        createdByName: user.email || 'Admin'
      });
      addNotification('Kasbon Berhasil', `Kasbon senilai Rp ${advance.amount.toLocaleString()} untuk ${advance.workerName} berhasil dicatat.`, 'success');
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'cash_advances');
    }
  };

  const handleDeleteCashAdvance = async (id: string) => {
    if (!isAdmin) return;
    try {
      await deleteDoc(doc(db, 'cash_advances', id));
      addNotification('Kasbon Dihapus', 'Data kasbon telah dihapus.', 'warning');
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `cash_advances/${id}`);
    }
  };

  const handleCreateFuelLog = async (log: Omit<FuelLog, 'id' | 'userId' | 'userEmail' | 'timestamp'>) => {
    if (!user) return;
    try {
      const fuelData = {
        ...log,
        userId: user.uid,
        userEmail: user.email?.toLowerCase(),
        timestamp: Date.now()
      };
      const docRef = await addDoc(collection(db, 'fuel_logs'), fuelData);
      
      await logActivity({
        type: 'fuel',
        action: 'CREATED',
        title: 'Input BBM Baru',
        description: `${user.email} mencatat pengisian BBM ${log.liters}L untuk ${log.equipmentName}`,
        projectId: log.projectId
      });

      addNotification('Berhasil', 'Catatan BBM telah disimpan.', 'success');
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'fuel_logs');
    }
  };

  const handleCreateHseLog = async (log: Omit<HseLog, 'id' | 'userId' | 'userEmail' | 'timestamp'>) => {
    if (!user) return;
    try {
      const hseData = {
        ...log,
        userId: user.uid,
        userEmail: user.email?.toLowerCase(),
        timestamp: Date.now()
      };
      const docRef = await addDoc(collection(db, 'hse_logs'), hseData);
      // Update local profile induction date
      await setDoc(doc(db, 'user_profiles', user.uid), {
        lastInductionAt: Date.now(),
        email: user.email
      }, { merge: true });
      addNotification('HSE Berhasil', 'Checklist keselamatan kerja telah direkam.', 'success');
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'hse_logs');
    }
  };

  const handleSendSOS = async (description = "PANGGILAN DARURAT: SOS") => {
    if (!user) return;
    
    addNotification('SOS', 'Mengambil lokasi presisi untuk bantuan...', 'info');
    
    let lat = location?.lat;
    let lng = location?.lng;
    
    try {
      const pos: any = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, { enableHighAccuracy: true, timeout: 5000 });
      });
      lat = pos.coords.latitude;
      lng = pos.coords.longitude;
      setLocation({ lat, lng });
    } catch (e) {
      console.warn("SOS: Failed to get fresh location, using last known.");
    }

    if (!lat || !lng) {
      addNotification('Gagal SOS', 'Lokasi GPS tidak ditemukan. Pastikan GPS aktif untuk bantuan darurat.', 'warning');
      return;
    }

    try {
      const incData = {
        userId: user.uid,
        userEmail: user.email?.toLowerCase(),
        type: 'emergency' as const,
        timestamp: Date.now(),
        latitude: lat,
        longitude: lng,
        description,
        status: 'open' as const
      };
      const docRef = await addDoc(collection(db, 'incidents'), incData);
      // Also send a system notification to all admins
      addDoc(collection(db, 'notifications'), {
        title: 'DARURAT SOS',
        message: `Bantuan segera dibutuhkan oleh ${user.email} di lokasi GPS!`,
        timestamp: Date.now(),
        type: 'warning',
        ownerId: 'SYSTEM'
      }).catch(e => {
        if (e?.code !== 'already-exists' && !e?.message?.includes('already exists')) console.error(e);
      });
      addNotification('SOS TERKIRIM', 'Admin sedang diberitahu lokasi Anda!', 'warning');
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'incidents');
    }
  };

  const handleReportIncident = async (type: IncidentReport['type'], description: string, photo?: string) => {
    if (!user || !location) return;
    try {
      const incData = {
        userId: user.uid,
        userEmail: user.email?.toLowerCase(),
        type,
        timestamp: Date.now(),
        latitude: location.lat,
        longitude: location.lng,
        description,
        photo: photo || '',
        status: 'open' as const
      };
      const docRef = await addDoc(collection(db, 'incidents'), incData);
      addNotification('Laporan Terkirim', 'Insiden telah dilaporkan ke Admin.', 'success');
      if (user.email) await notifyAdminsForNewIncident(description, user.email, location);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'incidents');
    }
  };

  const handleResolveIncident = async (id: string) => {
    if (!isAdmin) return;
    try {
      await updateDoc(doc(db, 'incidents', id), { status: 'resolved' });
      setIncidents(prev => prev.map(inc => inc.id === id ? { ...inc, status: 'resolved' } : inc));
      addNotification('Insiden Selesai', 'Status insiden telah diubah ke Selesai.', 'success');
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, 'incidents');
    }
  };

  const handleCreateEquipmentRequest = async (req: Omit<EquipmentRequest, 'id' | 'userId' | 'userEmail' | 'timestamp' | 'status'>) => {
    if (!user) return;
    try {
      const data = {
        ...req,
        userId: user.uid,
        userEmail: user.email,
        timestamp: Date.now(),
        status: 'pending' as const
      };
      const docRef = await addDoc(collection(db, 'equipment_requests'), data);
      addNotification('Pengajuan Terkirim', `Permintaan alat ${req.toolName} sedang diproses.`, 'info');
      if (user.email) await notifyAdminsForEquipmentRequest(req.toolName, req.description, user.email);
    } catch (e: any) {
      handleFirestoreError(e, OperationType.CREATE, 'equipment_requests');
    }
  };

  const handleUpdateEquipmentRequestStatus = async (requestId: string, status: EquipmentRequest['status'], adminNote?: string) => {
    if (!isAdmin) return;
    try {
      const updateData: any = { status };
      if (adminNote) updateData.adminNote = adminNote;
      await updateDoc(doc(db, 'equipment_requests', requestId), updateData);
      setEquipmentRequests(prev => prev.map(eq => eq.id === requestId ? { ...eq, ...updateData } : eq));
      addNotification('Status Update', `Permintaan alat telah diperbarui ke "${status}".`, 'success');
    } catch (e: any) {
      handleFirestoreError(e, OperationType.UPDATE, `equipment_requests/${requestId}`);
    }
  };

  const handleDeleteEquipmentRequest = async (requestId: string) => {
    try {
      await deleteDoc(doc(db, 'equipment_requests', requestId));
      setEquipmentRequests(prev => prev.filter(eq => eq.id !== requestId));
      addNotification('Terhapus', 'Permintaan alat telah berhasil dihapus.', 'success');
      
      await logActivity({
        type: 'inventory',
        action: 'DELETED',
        title: 'Pengajuan Alat Dihapus',
        description: `Pengajuan alat oleh ${user?.email} telah dihapus.`
      });
    } catch (e: any) {
      handleFirestoreError(e, OperationType.DELETE, `equipment_requests/${requestId}`);
    }
  };

  const generateDPR = async (projectId: string) => {
    addNotification('Sistem Report', 'Sedang menyiapkan PDF, mohon tunggu...', 'info');
    const project = projects.find(p => p.id === projectId);
    if (!project) return;

    const { jsPDF } = await import('jspdf');
    const autoTable = (await import('jspdf-autotable')).default;
    
    const doc = new jsPDF();
    const now = new Date();
    
    // Header
    doc.setFillColor(15, 23, 42);
    doc.rect(0, 0, 210, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('DAILY PROGRESS REPORT', 105, 20, { align: 'center' });
    doc.setFontSize(10);
    doc.text('PT. SHAKA ANUGERAH KARYA - TOLL GUARD APEX PRO', 105, 30, { align: 'center' });

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);
    doc.text(`Proyek: ${project.name.toUpperCase()}`, 14, 50);
    doc.text(`Lokasi Strategis: ${project.locationInfo || 'Jalan Tol Trans Sumatera'}`, 14, 57);
    doc.text(`Regional: ${project.regionalInfo || 'Regional SUMBAGTENG'}`, 14, 64);
    doc.text(`Kategori: ${project.type.toUpperCase()}`, 140, 50);
    doc.text(`Tanggal: ${now.toLocaleDateString('id-ID')}`, 140, 57);
    doc.text(`Cuaca: Cerah`, 140, 64);

    // Entries Table
    const tableData = project.entries.map((e, index) => [
      index + 1,
      e.km,
      e.status.toUpperCase(),
      e.description || '-',
      e.tonase ? `${e.tonase} t` : e.qty ? `${e.qty} u` : '-'
    ]);

    autoTable(doc, {
      startY: 75,
      head: [['NO', 'LOKASI KM', 'STATUS', 'KETERANGAN', 'VOLUME/TONASE']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [15, 23, 42] }
    });

    // Manpower Section
    const finalY = (doc as any).lastAutoTable.finalY + 10;
    doc.setFont('helvetica', 'bold');
    doc.text('MANAJEMEN TENAGA KERJA & ALAT:', 14, finalY);
    doc.setFont('helvetica', 'normal');
    doc.text(`Total Tenaga Kerja Aktif: ${activeSessions.length} Orang`, 14, finalY + 7);
    doc.text(`Alat Digunakan: ${project.entries.map(e => e.materialType || e.signType || e.plantType).filter((v, i, a) => v && a.indexOf(v) === i).join(', ') || 'Standar Pengerjaan'}`, 14, finalY + 14);

    // HSE Compliance
    doc.setFont('helvetica', 'bold');
    doc.text('KESELAMATAN & KESEHATAN KERJA (K3):', 14, finalY + 25);
    doc.setFont('helvetica', 'normal');
    const todayLogs = hseLogs.filter(l => new Date(l.timestamp).toDateString() === now.toDateString());
    doc.text(`Compliance APD: ${todayLogs.length > 0 ? '100% TERVERIFIKASI' : 'BELUM ADA LOG'}`, 14, finalY + 32);

    // Save
    doc.save(`DPR_${project.name.replace(/\s+/g, '_')}_${now.toISOString().split('T')[0]}.pdf`);
    addNotification('DPR Siap', 'Laporan Kemajuan Harian formal PDF telah diunduh.', 'success');
  };

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);

  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        setAuthLoading(false);
      } else {
        setUser(null);
        setAuthLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  // Sync Projects Metadata - Real-time
  useEffect(() => {
    if (!user) {
      setProjectsMetadata([]);
      return;
    }
    
    const unsub = onSnapshot(query(collection(db, 'projects'), orderBy('createdAt', 'desc'), limit(500)), (snapshot) => {
      const projectsData: Project[] = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() as any } as Project));
      setProjectsMetadata(projectsData);
    }, (err) => {
      console.warn('Projects sync failed:', err.message);
    });
    return () => unsub();
  }, [user]);

  const [allEntries, setAllEntries] = useState<AspalEntry[]>([]);

  const projects = useMemo(() => {
    // Create a map for faster lookup
    const entriesByProject: Record<string, AspalEntry[]> = {};
    
    // Sort all entries once if needed, or just map them
    allEntries.forEach(entry => {
      const pId = entry.projectId || "unknown";
      if (!entriesByProject[pId]) entriesByProject[pId] = [];
      entriesByProject[pId].push(entry);
    });

    return projectsMetadata.map(p => {
      const pEntries = entriesByProject[p.id] || [];
      return {
        ...p,
        entries: pEntries
      };
    });
  }, [projectsMetadata, allEntries]);

  // Sync ALL entries for Dashboard Stats - Real-time
  useEffect(() => {
    if (!user) {
      setAllEntries([]);
      return;
    }
    
    const unsub = onSnapshot(query(collectionGroup(db, 'entries'), orderBy('timestamp', 'desc'), limit(2500)), (snapshot) => {
      const data: AspalEntry[] = [];
      snapshot.forEach(doc => {
        const docData = doc.data();
        const pId = doc.ref.parent.parent?.id;
        if (pId) {
          data.push({ id: doc.id, ...(docData as any), projectId: pId } as AspalEntry);
        }
      });
      setAllEntries(data);
    }, (err) => {
      console.warn('Global entries sync failed:', err.message);
    });
    return () => unsub();
  }, [user, isAdmin]);

  // Sync current project entries - Real-time
  const [entries, setEntries] = useState<AspalEntry[]>([]);
  useEffect(() => {
    if (!currentProjectId || !user) {
      setEntries([]);
      return;
    }
    const unsub = onSnapshot(query(collection(db, 'projects', currentProjectId, 'entries'), orderBy('timestamp', 'desc'), limit(2500)), (snapshot) => {
      const entriesData: AspalEntry[] = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() as any } as AspalEntry));
      setEntries(entriesData);
    }, (err) => {
      console.warn('Local entries sync failed:', err.message);
    });
    return () => unsub();
  }, [currentProjectId, user]);

  // Sync Notifications - Real-time
  useEffect(() => {
    if (!user) {
      setNotifications([]);
      return;
    }
    const userEmail = user.email?.toLowerCase() || '';
    
    const constraints: any[] = [orderBy('timestamp', 'desc'), limit(500)];
    if (!isAdmin) {
      constraints.unshift(or(where('ownerId', '==', user.uid), where('targetEmail', '==', userEmail)));
    }
    
    let isInitialLoad = true;
    const unsub = onSnapshot(query(collection(db, 'notifications'), ...constraints), (snapshot) => {
      const notifs: AppNotification[] = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() as any } as AppNotification));
      
      if (isInitialLoad) {
        isInitialLoad = false;
        
        // Request notification permission if not asked yet
        if (typeof Notification !== 'undefined' && Notification.permission === 'default') {
          Notification.requestPermission().catch(e => console.warn('PWA Push Notification not supported/denied', e));
        }
      } else {
        const newNotifs = snapshot.docChanges().filter(change => change.type === 'added' && !change.doc.data().read);
        if (newNotifs.length > 0) {
          try {
            const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/212/212-preview.mp3');
            audio.play().catch(e => console.log('Audio playback prevented:', e));
          } catch(e) {}
          
          if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
             newNotifs.forEach(change => {
                const data = change.doc.data() as any;
                const title = data.title || "Toll Guard";
                const options: any = {
                   body: data.message || "Anda memiliki pemberitahuan baru.",
                   icon: '/icon.svg',
                   badge: '/icon.svg',
                   vibrate: [200, 100, 200]
                };

                if ('serviceWorker' in navigator) {
                  navigator.serviceWorker.ready.then(registration => {
                    registration.showNotification(title, options);
                  }).catch(() => {
                    const fallbackPush = new Notification(title, options);
                    fallbackPush.onclick = () => { window.focus(); fallbackPush.close(); };
                  });
                } else {
                  const pushMsg = new Notification(title, options);
                  pushMsg.onclick = () => { window.focus(); pushMsg.close(); };
                }
             });
          }
        }
      }
      
      setNotifications(notifs);
    }, (err) => {
      console.warn('Notifications sync failed:', err.message);
    });
    return () => unsub();
  }, [user, isAdmin]);

  // Sync Login Logs - Real-time
  useEffect(() => {
    if (!user || !isAdmin) {
        setLoginLogs([]);
        return;
    }
    const unsub = onSnapshot(query(collection(db, 'login_logs'), orderBy('timestamp', 'desc'), limit(500)), (snapshot) => {
      const logs: LoginLog[] = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() as any } as LoginLog));
      setLoginLogs(logs);
    }, (err) => {
      console.warn('Login logs sync failed:', err.message);
    });
    return () => unsub();
  }, [user, isAdmin]);

  // Sync Tasks & Inventory - Real-time
  useEffect(() => {
    if (!user) {
      setTasks([]);
      setInventory([]);
      return;
    }
    const userEmail = user.email?.toLowerCase() || '';
    
    const taskConstraints: any[] = [orderBy('timestamp', 'desc'), limit(500)];
    if (!isAdmin) {
      taskConstraints.unshift(where('assignedToEmail', 'array-contains', userEmail));
    }
    
    const unsubTasks = onSnapshot(query(collection(db, 'tasks'), ...taskConstraints), (snapshot) => {
      const tasksData: Task[] = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() as any } as Task));
      setTasks(tasksData.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0)));
    }, (err) => {
      console.warn('Tasks sync failed:', err.message);
    });

    const unsubInventory = onSnapshot(query(collection(db, 'inventory'), orderBy('material', 'asc'), limit(500)), (snapshot) => {
      setInventory(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as InventoryItem)));
    }, (err) => {
      console.warn('Inventory sync failed:', err.message);
    });

    return () => {
      unsubTasks();
      unsubInventory();
    };
  }, [user, isAdmin]);

  // Sync Chat Messages - Real-time (Already reactive/polling, let's make it fully real-time)
  useEffect(() => {
    if (!user) {
      setChatMessages([]);
      return;
    }
    const userEmail = user.email?.toLowerCase() || '';
    
    // For chat, real-time is much better than 20s polling
    const q = isAdmin ? 
      query(collection(db, 'chat_messages'), orderBy('timestamp', 'desc'), limit(1000)) :
      query(collection(db, 'chat_messages'), or(where('receiverEmail', 'in', [userEmail, 'ALL']), where('senderEmail', '==', userEmail)), limit(1000));

    const unsub = onSnapshot(q, (snapshot) => {
      const msgs: ChatMessage[] = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() as any } as ChatMessage));
      setChatMessages(msgs.sort((a, b) => a.timestamp - b.timestamp));
    }, (err) => {
      console.warn('Chat sync failed:', err.message);
    });

    return () => unsub();
  }, [user, isAdmin]);

  const generatePelaksanaKey = async (customKey?: string) => {
    if (!isAdmin) return;
    const newKey = customKey && customKey.trim() !== '' 
      ? customKey.trim() 
      : Math.floor(100000 + Math.random() * 900000).toString(); // 6 digit OTP fallback
    
    try {
      // Deactivate old keys
      const q = query(collection(db, 'access_keys'), where('email', '==', 'pelaksana.shaka@gmail.com'), where('status', '==', 'active'));
      const activeKeys = await getDocs(q);
      const batch = writeBatch(db);
      activeKeys.docs.forEach(d => {
        batch.update(d.ref, { status: 'expired', expiredAt: Date.now() });
      });
      
      // Create new key
      const newRef = doc(collection(db, 'access_keys'));
      batch.set(newRef, {
        email: 'pelaksana.shaka@gmail.com',
        password: newKey,
        type: 'one-time',
        status: 'active',
        createdAt: Date.now(),
        createdBy: user?.email
      });
      
      await batch.commit();
      addNotification('Kunci Dibuat', `Kunci sandi baru: ${newKey}`, 'success');
    } catch (err) {
      console.error('Failed to generate key:', err);
      addNotification('Gagal', 'Gagal membuat kunci sandi baru.', 'error');
    }
  };

  const recordLoginLog = async (currentUser: User) => {
    try {
      await addDoc(collection(db, 'login_logs'), {
        type: 'login',
        email: currentUser.email,
        userId: currentUser.uid,
        timestamp: Date.now(),
        latitude: location?.lat || null,
        longitude: location?.lng || null,
        userAgent: navigator.userAgent
      });
    } catch (err) {
      console.error('Failed to record login log:', err);
    }
  };

  const recordLogoutLog = async (currentUser: User) => {
    try {
      await addDoc(collection(db, 'login_logs'), {
        type: 'logout',
        email: currentUser.email,
        userId: currentUser.uid,
        timestamp: Date.now(),
        latitude: location?.lat || null,
        longitude: location?.lng || null,
        userAgent: navigator.userAgent
      });
    } catch (err) {
      console.error('Failed to record logout log:', err);
    }
  };

  const ensureFullEmail = (emailStr: string) => {
    if (!emailStr) return '';
    let lower = emailStr.toLowerCase().trim();
    
    // Autocorrect for Admin Shaka 01 (mapped to no-dot version due to auth lock)
    if (lower === 'admin.shaka01@gmail.com') {
      return 'adminshaka01@gmail.com';
    }

    // Clean up autocomplete errata like spaces and parentheses
    let cleanLower = lower.replace(/[\s()]/g, '');

    // Autocorrect for Pelaksana
    if (cleanLower.startsWith('pelaksana.shaka') || cleanLower === 'pelaksana' || cleanLower.startsWith('pelaksanashaka')) {
      return 'pelaksana.shaka@gmail.com';
    }

    if (!cleanLower.includes('@')) {
      // If it's a known worker id, let the query handle it without forcing gmail
      if (cleanLower.startsWith('emp-')) return cleanLower.toUpperCase();
      return `${cleanLower}@gmail.com`;
    }
    return cleanLower;
  };

  const handleLogin = async (e: React.FormEvent, isPelaksana: boolean = false) => {
    e.preventDefault();
    setAuthError('');
    setIsAuthLoading(true);
    
    const input = isPelaksana ? 'pelaksana.shaka@gmail.com' : email.trim(); 
    const loginEmail = ensureFullEmail(input);
    const userInputPassword = password.trim();
    let firebaseAuthPassword = userInputPassword;

    if (isPelaksana) {
      try {
        const keysRef = collection(db, 'access_keys');
        const keysQuery = query(keysRef, where('email', '==', 'pelaksana.shaka@gmail.com'), where('status', '==', 'active'));
        const keysSnap = await getDocs(keysQuery);
        const activeKeyDoc = keysSnap.docs[0];
        
        if (!activeKeyDoc || activeKeyDoc.data().password !== userInputPassword) {
          setAuthError('Kode Akses (Referral) tidak valid atau sudah kedaluwarsa.');
          setIsAuthLoading(false);
          return;
        }

        const keyData = activeKeyDoc.data();
        if (keyData.type === 'one-time') {
          updateDoc(doc(db, 'access_keys', activeKeyDoc.id), { status: 'used', usedAt: Date.now() }).catch(() => {});
        }

        const workersRef = collection(db, 'workers');
        const pQuery = query(workersRef, where('email', '==', 'pelaksana.shaka@gmail.com'));
        const pSnap = await getDocs(pQuery);
        if (pSnap.docs[0]) {
          firebaseAuthPassword = pSnap.docs[0].data().password.trim();
        }
      } catch (err: any) {
        console.warn("Worker access check error:", err);
        setAuthError('Gagal memverifikasi kode akses. Coba lagi.');
        setIsAuthLoading(false);
        return;
      }
    }
    
    try {
      const workersRef = collection(db, 'workers');
      const dbSearchEmail = loginEmail === 'adminshaka01@gmail.com' ? 'admin.shaka01@gmail.com' : loginEmail;
      
      const qEmail = query(workersRef, where('email', '==', dbSearchEmail));
      const qId = query(workersRef, where('employeeId', '==', input));
      const qIdLower = query(workersRef, where('employeeId', '==', loginEmail));

      const [emailSnap, idSnap, idSnapLower] = await Promise.all([
        getDocs(qEmail).catch(() => null),
        getDocs(qId).catch(() => null),
        getDocs(qIdLower).catch(() => null)
      ]);

      const workerDoc = (emailSnap && emailSnap.docs[0]) || (idSnap && idSnap.docs[0]) || (idSnapLower && idSnapLower.docs[0]);
      let targetAuthEmail = loginEmail;
      
      if (workerDoc) {
        const workerData = workerDoc.data();
        const dbPassword = (workerData.password || '').toString().trim();
        const effectivePass = isPelaksana ? firebaseAuthPassword : dbPassword;
        
        if (userInputPassword !== dbPassword && userInputPassword !== effectivePass) {
          setAuthError('ID / Password salah. Periksa kembali kredensial Anda.');
          setIsAuthLoading(false);
          return;
        }
        
        targetAuthEmail = ensureFullEmail(workerData.email);
        firebaseAuthPassword = effectivePass;
      } else {
        const allowedAdmins = [
          'developmentshaka@gmail.com',
          'admin.shaka01@gmail.com',
          'adminshaka01@gmail.com',
          'riskiprataa3@gmail.com'
        ];
        
        if (!allowedAdmins.includes(loginEmail)) {
           setAuthError('Akun tidak terdaftar dalam sistem operasional.');
           setIsAuthLoading(false);
           return;
        }
      }
      
      const userCredential = await executeWithRetry(() => signInWithEmailAndPassword(auth, targetAuthEmail, firebaseAuthPassword));
      await recordLoginLog(userCredential.user);
    } catch (err: any) {
      console.error("Login detail err:", err.code || err.message, err);
      const errMsg = err.message?.toLowerCase() || '';
      
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found') {
        setAuthError('ID / Password salah. Pastikan kredensial Anda sesuai.');
      } else if (err.code === 'auth/too-many-requests') {
        setAuthError('Terlalu banyak percobaan gagal. Silakan coba lagi nanti.');
      } else if (err.code === 'auth/network-request-failed' || errMsg.includes('network-request-failed')) {
        setAuthError('Koneksi terputus atau Firebase terblokir. (Network Error)');
      } else if (errMsg.includes('quota') || errMsg.includes('resource-exhausted')) {
        setAuthError('ERROR: QUOTA LIMIT EXCEEDED. Firestore mencapai batas harian.');
      } else {
        setAuthError(`Error: ${err.message || 'Gagal login'}`);
      }
    } finally {
      setIsAuthLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setAuthError('');
    setIsAuthLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      const mappedEmail = user.email ? user.email.toLowerCase() : '';
      
      // Check if this Google account is allowed
      const isHardcodedAdmin = ['developmentshaka@gmail.com', 'admin.shaka01@gmail.com', 'adminshaka01@gmail.com', 'pelaksana.shaka@gmail.com', 'riskiprataa3@gmail.com'].includes(mappedEmail);
      
      if (!isHardcodedAdmin) {
        // Not hardcoded, check if exists in workers
        const workersRef = collection(db, 'workers');
        const qEmail = query(workersRef, where('email', '==', mappedEmail));
        const snap = await getDocs(qEmail);
        
        if (snap.empty) {
          // Worker not found
          await signOut(auth);
          setAuthError('Akun Google ini tidak terdaftar di sistem. Silakan hubungi admin lapangan.');
          return;
        }
      }
      
      await recordLoginLog(user);
    } catch (err: any) {
      console.error("Google Login err:", err.code || err.message, err);
      if (err.code !== 'auth/popup-closed-by-user') {
        const errMsg = err.message?.toLowerCase() || '';
        if (err.code === 'auth/network-request-failed' || errMsg.includes('network-request-failed')) {
          setAuthError('Koneksi terputus atau tersendat. Coba refresh aplikasi.');
        } else {
          setAuthError(`Gagal login dengan Google: ${err.message || ''}`);
        }
      }
    } finally {
      setIsAuthLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    if (password.length < 6) {
      setAuthError('Security Key minimal 6 karakter.');
      return;
    }
    let loginEmail = ensureFullEmail(email);
    try {
      await createUserWithEmailAndPassword(auth, loginEmail, password);
      addNotification('Registrasi Berhasil', `ID ${email} telah terdaftar di sistem.`, 'success');
    } catch (err: any) {
      if (err.code === 'auth/email-already-in-use') {
        setAuthError('ID ini sudah terdaftar.');
      } else {
        setAuthError('Gagal mendaftarkan ID.');
      }
      console.error(err);
    }
  };

  const handleCheckOut = async () => {
    if (!userCheckIn) {
      handleLogout();
      return;
    }
    
    try {
      const checkOutData = {
        ...userCheckIn,
        timestamp: Date.now(),
        type: 'check-out',
        projectName: 'Sesi Selesai'
      };
      
      await addDoc(collection(db, 'presensi'), checkOutData);
      
      setUserCheckIn(null);
      localStorage.removeItem('user_check_in');
      addNotification('Sesi Selesai', 'Absensi keluar berhasil direkam. Mengakhiri sesi aplikasi...', 'success');
      
      // Force app logout after short delay
      setTimeout(() => {
        handleLogout();
      }, 1500);
    } catch (err: any) {
      handleFirestoreError(err, OperationType.CREATE, 'presensi');
      // If error (like quota), still logout for safety
      handleLogout();
    }
  };

  const handleForceClearSessions = async () => {
    if (!user) return;
    try {
      const email = user.email?.toLowerCase() || '';
      const isOwner = ['developmentshaka@gmail.com', 'riskiprataa3@gmail.com'].includes(email);
      const role = isOwner ? 'owner' : (isAdmin ? 'admin' : 'pelaksana');
      
      const toDelete: Promise<void>[] = [];
      for (const s of activeSessions) {
        if (s.id !== user.uid) { // preserve my current session entry
           const sEmail = s.email?.toLowerCase() || '';
           const sIsOwner = ['developmentshaka@gmail.com', 'riskiprataa3@gmail.com'].includes(sEmail);
           const sRole = sIsOwner ? 'owner' : (s.role === 'admin' ? 'admin' : 'pelaksana');
           if ((role === 'owner' ? sEmail === email : sRole === role)) {
               toDelete.push(deleteDoc(doc(db, 'active_sessions', s.id)));
           }
        }
      }
      
      await setDoc(doc(db, 'active_sessions', user.uid), {
          uid: user.uid,
          email,
          role: isAdmin ? 'admin' : (isSuperAdmin ? 'superadmin' : 'pelaksana'),
          startTime: sessionStartTime,
          lastActive: Date.now(),
          sessionId,
          userAgent: navigator.userAgent
        }, { merge: true });
        
      await Promise.all(toDelete);
      
      setIsQuotaBlocked(false);
      addNotification("Berhasil", "Semua sesi perangkat lain telah diputus.", "success");
    } catch(e) {
      console.error(e);
      addNotification("Gagal", "Tidak dapat memaksa keluar sesi lain.", "error");
    }
  };

  const handleLogout = async () => {
    if (user) {
      if (user.email?.toLowerCase() === 'pelaksana.shaka@gmail.com') {
        addNotification('Sistem Logout', 'Sesi kerja Anda telah berakhir. Menghapus otorisasi...', 'info');
        await recordLogoutLog(user);
        
        // Ensure any active keys for this user are invalidated immediately if they weren't already
        try {
          const q = query(collection(db, 'access_keys'), where('email', '==', 'pelaksana.shaka@gmail.com'), where('status', '==', 'active'));
          const activeKeys = await getDocs(q);
          const batch = writeBatch(db);
          activeKeys.docs.forEach(d => {
            batch.update(d.ref, { status: 'expired', expiredAt: Date.now(), expiredBy: 'system-logout' });
          });
          if (!activeKeys.empty) await batch.commit();
        } catch (e) {
          console.warn("Could not invalidate keys during logout:", e);
        }
      }
      if (user) {
        deleteDoc(doc(db, 'active_sessions', user.uid)).catch(() => {});
      }
    }
    
    signOut(auth);
    localStorage.removeItem('shaka_pelaksana_login_timestamp');
    localStorage.removeItem('user_check_in');
    setUserCheckIn(null);
    setCurrentProjectId('');
    setAuthError('');
    navigate('/login');
  };

  const handleSendEmailVerification = async () => {
    if (!user) return;
    try {
      await sendEmailVerification(user);
      addNotification('Verifikasi Terkirim', 'Email verifikasi telah dikirim ke alamat anda.', 'success');
    } catch (err: any) {
      console.error('Email verification error:', err);
      addNotification('Gagal', `Gagal mengirim email verifikasi: ${err.message}`, 'error');
    }
  };

  // 24-Hour Expiration logic for non-admins (Pelaksana)
  useEffect(() => {
    if (!user || authLoading || isAdmin) return;

    const checkSessionExpiration = () => {
      try {
        const lastSignInStr = user.metadata.lastSignInTime;
        if (!lastSignInStr) return;
        
        const lastSignInDate = new Date(lastSignInStr).getTime();
        const now = Date.now();
        const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;
        
        if (now - lastSignInDate > TWENTY_FOUR_HOURS) {
          console.log("[AUTH] Session expired for pelaksana. Automatically logging out.");
          addNotification('Sesi Berakhir', 'Sesi Anda telah melewati 24 jam. Sistem membutuhkan login ulang demi keamanan.', 'warning');
          handleLogout();
        }
      } catch (e) {
        console.error("Error checking session expiration:", e);
      }
    };

    // Run check immediately on load or when user object updates
    checkSessionExpiration();

    // Re-check periodically every 1 minute
    const interval = setInterval(checkSessionExpiration, 60000);
    return () => clearInterval(interval);
  }, [user, isAdmin, authLoading]);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    if (!user) {
      setLocation(null);
      return;
    }
    
    // One-time initial location fetch when user logs in/starts
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        (err) => console.warn('Initial GPS failure:', err.message),
        { enableHighAccuracy: true, timeout: 10000 }
      );
    }
  }, [user]);

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      addNotification('Sistem GPS', 'Browser/HP ini tidak mendukung koordinat GPS.', 'warning');
      return;
    }
    setIsLocating(true);
    addNotification('Sistem GPS', 'Sedang mencari lokasi... pastikan GPS aktif.', 'info');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setIsLocating(false);
        addNotification('Sistem GPS', 'Koordinat satelit diperbarui.', 'success');
      },
      (err) => {
        console.error('Manual GPS Error:', err.message);
        if (err.code === 1) {
          addNotification('Gagal Akses GPS', 'Akses lokasi ditolak. Buka pengaturan aplikasi (Browser/PWA) dan izinkan Lokasi.', 'error');
        } else if (err.code === 2) {
           addNotification('Gagal Akses GPS', 'Sinyal GPS hilang atau fitur Lokasi di HP Anda dimatikan.', 'error');
        } else {
          addNotification('Sistem GPS', 'Gagal memuat satelit. Coba di tempat lebih terbuka.', 'warning');
        }
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  };

  const compressImage = (file: File, maxWidth = 600, maxHeight = 600, quality = 0.3): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          // Aggressive scaling calculation
          const maxDim = Math.max(width, height);
          if (maxDim > Math.max(maxWidth, maxHeight)) {
              const scale = Math.max(maxWidth, maxHeight) / maxDim;
              width *= scale;
              height *= scale;
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          if (ctx) {
             ctx.drawImage(img, 0, 0, width, height);

             // Force JPEG with aggressive compression as a data URL
             const dataUrl = canvas.toDataURL('image/jpeg', quality);

             // Check if it's still too large (Firestore doc limit is 1MB)
             // Allow max ~150KB base64 string per image, so multiple images can be saved in one doc.
             if (dataUrl.length > 150 * 1024 && quality > 0.1) {
                 resolve(compressImage(file, Math.floor(maxWidth * 0.8), Math.floor(maxHeight * 0.8), quality - 0.1));
             } else {
                 resolve(dataUrl);
             }
          } else {
             reject(new Error("Failed to get canvas context"));
          }
        };
        img.onerror = (err) => reject(err);
      };
      reader.onerror = (err) => reject(err);
    });
  };

  const uploadFileToStorage = async (file: File, folder = 'uploads'): Promise<string> => {
    if (!file) throw new Error('No file provided');
    // Ensure filename is safe and unique
    const timestamp = Date.now();
    const safeName = file.name.replace(/[^a-z0-9.]/gi, '_').toLowerCase();
    const storagePath = `${folder}/${timestamp}_${safeName}`;
    const storageRef = ref(storage, storagePath);
    
    try {
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      console.log("File uploaded to Storage:", downloadURL);
      return downloadURL;
    } catch (error: any) {
      console.error("Storage upload failed:", error.message);
      if (error.message.includes('quota')) {
        addNotification('Storage Full', 'Kuota Storage penuh.', 'error');
      }
      throw error;
    }
  };

  const compressImageToFile = async (file: File, maxWidth = 1200, maxHeight = 1200, quality = 0.75): Promise<File> => {
    try {
      const dataUrl = await compressImage(file, maxWidth, maxHeight, quality);
      const res = await fetch(dataUrl);
      const blob = await res.blob();
      return new File([blob], file.name.replace(/\.[^/.]+$/, "") + ".jpeg", { type: 'image/jpeg' });
    } catch (e) {
      console.warn("Failed to compress image, using original", e);
      return file;
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: '0' | '50' | '100') => {
    const files = e.target.files;
    if (!files) return;

    setIsUploading(true);
    const newUploads: UploadingPhoto[] = [];
    const filesArray = Array.from(files) as File[];
    
    // Create immediate previews
    for (let i = 0; i < filesArray.length; i++) {
      const file = filesArray[i];
      const id = Math.random().toString(36).substring(2, 9);
      const preview = URL.createObjectURL(file);
      newUploads.push({ id, preview, type, status: 'compressing' });
    }
    
    setUploadingPhotos(prev => [...prev, ...newUploads]);

    try {
      await Promise.all(filesArray.map(async (file, i) => {
        const currentUploadId = newUploads[i].id;
        
        try {
          // Reduce resolution and quality for faster upload
          const compressedFile = await compressImageToFile(file, 800, 800, 0.5);
          
          setUploadingPhotos(prev => prev.map(up => 
            up.id === currentUploadId ? { ...up, status: 'uploading' } : up
          ));

          const folderPath = currentProjectId ? `projects/${currentProjectId}/${type}` : `misc/${type}`;
          const storageUrl = await uploadFileToStorage(compressedFile, folderPath);
          
          if (type === '0') setPhotos0(prev => [...prev, storageUrl]);
          else if (type === '50') setPhotos50(prev => [...prev, storageUrl]);
          else if (type === '100') setPhotos100(prev => [...prev, storageUrl]);
          
          // Remove from uploading list
          setUploadingPhotos(prev => prev.filter(up => up.id !== currentUploadId));
        } catch (err) {
          console.error("Single file upload error:", err);
          setUploadingPhotos(prev => prev.map(up => 
            up.id === currentUploadId ? { ...up, status: 'error' } : up
          ));
        }
      }));
    } catch (err) {
      console.error("Upload process error:", err);
      addNotification('Gagal Unggah', 'Beberapa foto gagal diunggah.', 'warning');
    } finally {
      setIsUploading(false);
      setTimeout(() => {
        for (let i = 0; i < newUploads.length; i++) {
          if (newUploads[i].preview) URL.revokeObjectURL(newUploads[i].preview!);
        }
      }, 5000);
    }
  };

  const removePhoto = (index: number, type: '0' | '50' | '100') => {
    if (type === '0') setPhotos0(prev => prev.filter((_, i) => i !== index));
    else if (type === '50') setPhotos50(prev => prev.filter((_, i) => i !== index));
    else if (type === '100') setPhotos100(prev => prev.filter((_, i) => i !== index));
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!km) newErrors.km = 'Lokasi KM wajib diisi';
    
    if (currentProject?.type === 'asphalt') {
      if (!panjang || parseFloat(panjang) <= 0) newErrors.panjang = 'Panjang harus > 0';
      if (!lebar || parseFloat(lebar) <= 0) newErrors.lebar = 'Lebar harus > 0';
      if (!tebal || parseFloat(tebal) <= 0) newErrors.tebal = 'Tebal harus > 0';
      if (!density || parseFloat(density) <= 0) newErrors.density = 'Density harus > 0';
      if (!lajurDropdown && !lajurManual) newErrors.lajur = 'Pilih atau ketik lajur';
    } else if (currentProject?.type === 'traffic-sign') {
      if (!signType) newErrors.signType = 'Tipe rambu wajib diisi';
    } else if (currentProject?.type === 'planting') {
      if (!plantType) newErrors.plantType = 'Tipe tanaman wajib diisi';
      if (!qty || parseInt(qty) <= 0) newErrors.qty = 'Jumlah harus > 0';
    } else if (currentProject?.type === 'painting') {
      if (!kmTo) newErrors.kmTo = 'KM Akhir wajib diisi';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const currentProject = useMemo(() => projects.find(p => p.id === currentProjectId), [projects, currentProjectId]);

  const handleAddEntry = async () => {
    if (!validate() || !currentProjectId || isAddingEntry) return;

    // Duplicate Check only for NEW entries (not editing)
    if (!editingEntryId) {
      const isDuplicate = entries.some(e => {
        if (currentProject?.type === 'painting') {
          return e.km === km && e.kmTo === kmTo;
        }
        if (currentProject?.type === 'traffic-sign') {
          return e.km === km && e.signType === signType;
        }
        if (currentProject?.type === 'planting') {
          return e.km === km && e.plantType === plantType;
        }
        // Asphalt and others just check KM
        return e.km === km;
      });

      if (isDuplicate) {
        addNotification('Data Duplikat', `File/Data untuk KM ${km} sudah pernah diinput. Silakan edit data yang sudah ada.`, 'warning');
        return;
      }
    }

    setIsAddingEntry(true);
    
    const p = parseFloat(panjang) || 0;
    const l = parseFloat(lebar) || 0;
    const t = (parseFloat(tebal) || 0) / 100;
    const d = parseFloat(density) || 0;
    const volume = p * l * t;
    const tonase = volume * d;

    const entryData: any = {
      km,
      ownerId: user?.uid,
      status: entryStatus,
      description: entryDesc,
      isArchived: isEntryArchived
    };

    if (!editingEntryId) {
      entryData.timestamp = Date.now();
    } else {
      entryData.updatedAt = Date.now();
    }

    if (location?.lat !== undefined) entryData.latitude = location?.lat;
    if (location?.lng !== undefined) entryData.longitude = location?.lng;
    if (equipmentUsed) entryData.equipmentUsed = equipmentUsed;
    if (photos0.length > 0) entryData.photos0 = photos0;
    if (photos50.length > 0) entryData.photos50 = photos50;
    if (photos100.length > 0) entryData.photos100 = photos100;

    // Add type-specific data
    if (currentProject?.type === 'asphalt') {
      entryData.lajur = lajurManual || lajurDropdown;
      entryData.panjang = p;
      entryData.lebar = l;
      entryData.tebal = parseFloat(tebal) || 0;
      entryData.materialType = materialType;
      entryData.density = d;
      entryData.volume = volume;
      entryData.tonase = tonase;
    } else if (currentProject?.type === 'traffic-sign') {
      entryData.signType = signType;
      entryData.qty = parseFloat(qty) || 1;
    } else if (currentProject?.type === 'inlet') {
      entryData.signType = signType;
      entryData.qty = parseFloat(qty) || 1;
    } else if (currentProject?.type === 'painting') {
      entryData.kmTo = kmTo;
      entryData.signType = signType;
      entryData.qty = parseFloat(qty) || 0;
    } else if (currentProject?.type === 'planting') {
      entryData.plantType = plantType;
      entryData.qty = parseFloat(qty) || 0;
    }

    // Clean up undefined completely 
    Object.keys(entryData).forEach(key => entryData[key] === undefined && delete entryData[key]);

    const isEditing = !!editingEntryId;
    const targetDocRef = isEditing
      ? doc(db, 'projects', currentProjectId, 'entries', editingEntryId)
      : doc(collection(db, 'projects', currentProjectId, 'entries'));

    const writePromise = isEditing
      ? updateDoc(targetDocRef, entryData)
      : setDoc(targetDocRef, entryData);

    const logPromise = logActivity({
      type: 'entry',
      action: isEditing ? 'UPDATED' : 'CREATED',
      title: isEditing ? 'Data Proyek Diperbarui' : 'Input Data Baru',
      description: `${user?.email} ${isEditing ? 'memperbarui' : 'menambahkan'} data di KM ${km} (${currentProject?.name})`,
      projectId: currentProjectId,
      metadata: { entryId: targetDocRef.id }
    });

    Promise.all([writePromise, logPromise]).catch((e: any) => {
      console.error('Failed to write entry:', e);
      if (e?.message?.includes('permissions') || e?.code === 'permission-denied') {
        handleFirestoreError(e, OperationType.WRITE, `projects/${currentProjectId}/entries`);
      }
    });

    addNotification(
      isEditing ? 'Data Diperbarui' : 'Data Ditambahkan', 
      `Entry pada ${km} telah ${isEditing ? 'diperbarui' : 'disimpan ke proyek'}. (Akan tersinkronisasi otomatis saat online)`, 
      'success'
    );

    setIsAddingEntry(false);
    resetEntryForm();
  };

  const handleAddEntryManual = async (pId: string, entryData: any) => {
    // Check duplicate before inserting
    const currentProject = projects.find(p => p.id === pId);
    
    // Check against allEntries since this can be offline/background
    const isDuplicate = allEntries.some(e => {
      if (e.projectId !== pId) return false;
      if (currentProject?.type === 'painting') {
        return e.km === entryData.km && e.kmTo === entryData.kmTo;
      }
      if (currentProject?.type === 'traffic-sign') {
        return e.km === entryData.km && e.signType === entryData.signType;
      }
      if (currentProject?.type === 'planting') {
        return e.km === entryData.km && e.plantType === entryData.plantType;
      }
      return e.km === entryData.km;
    });

    if (isDuplicate) {
      addNotification('Sinkronisasi Dilewati', `Data KM ${entryData.km} sudah ada di server (Duplikat).`, 'info');
      // Resolve successfully so the queue removes it
      return; 
    }

    const dbEntry = {
      ...entryData,
      ownerId: user?.uid,
      timestamp: entryData.timestamp || Date.now(),
      status: entryData.status || 'completed'
    };
    
    const docRef = doc(collection(db, 'projects', pId, 'entries'));
    
    try {
      await setDoc(docRef, dbEntry);
      
      const currentProject = projects.find(p => p.id === pId);
      await logActivity({
        type: 'entry',
        action: 'CREATED',
        title: 'Input Data Baru (Lite)',
        description: `${user?.email} menambahkan data di KM ${entryData.km} (${currentProject?.name})`,
        projectId: pId,
        metadata: { entryId: docRef.id, mode: 'lite_sync' }
      });

      setAllEntries(prev => [{ id: docRef.id, projectId: pId, ...dbEntry } as AspalEntry, ...prev]);
      if (currentProjectId === pId) {
        setEntries(prev => [{ id: docRef.id, projectId: pId, ...dbEntry } as AspalEntry, ...prev]);
      }
      
      addNotification('Data Masuk Cloud', `Data KM ${entryData.km} telah sinkron ke server.`, 'success');
    } catch (e: any) {
      console.error('Manual entry failed:', e);
      addNotification('Gagal Sinkron', `Data KM ${entryData.km} gagal diunggah.`, 'error');
      throw e; // Rethrow to prevent LiteModePage from removing it
    }
  };

  const resetEntryForm = () => {
    setKm(''); setKmTo(''); setSignType(''); setPlantType(''); setQty('');
    setEntryDesc(''); setEntryStatus('completed');
    setPanjang(''); setLebar(''); setTebal(''); setLajurManual(''); setEquipmentUsed('');
    setPhotos0([]); setPhotos50([]); setPhotos100([]); setIsEntryArchived(false); setErrors({}); setLocation(null);
    setIsSidebarOpen(false);
    setEditingEntryId(null);
    clearFormDraft();
  };

  const handleEditEntry = (entry: any) => {
    if (!entry) return;
    setEditingEntryId(entry.id);
    setKm(entry.km || '');
    setKmTo(entry.kmTo || '');
    setSignType(entry.signType || '');
    setPlantType(entry.plantType || '');
    setQty(entry.qty?.toString() || '');
    setEntryDesc(entry.description || '');
    setEntryStatus(entry.status || 'pending');
    setEquipmentUsed(entry.equipmentUsed || '');
    
    if (entry.panjang !== undefined) setPanjang(entry.panjang.toString());
    if (entry.lebar !== undefined) setLebar(entry.lebar.toString());
    if (entry.tebal !== undefined) setTebal(entry.tebal.toString());
    if (entry.density !== undefined) setDensity(entry.density.toString());
    if (entry.materialType !== undefined) setMaterialType(entry.materialType);
    if (entry.lajur) {
        setLajurDropdown(entry.lajur);
        setLajurManual(entry.lajur);
    }

    setPhotos0(entry.photos0 || []);
    setPhotos50(entry.photos50 || []);
    setPhotos100(entry.photos100 || []);
    // Auto-unarchive when editing so it is sent back to active data as requested
    setIsEntryArchived(false);
    
    if (entry.latitude !== undefined && entry.longitude !== undefined) {
      setLocation({ lat: entry.latitude, lng: entry.longitude });
    } else {
      setLocation(null);
    }
  };

  const handleDeleteEntry = async (id: string) => {
    if (!currentProjectId) return;
    if (!window.confirm("Apakah Anda yakin ingin menghapus entri ini? Data yang dihapus tidak dapat dikembalikan.")) return;
    try {
      await deleteDoc(doc(db, 'projects', currentProjectId, 'entries', id));
      addNotification('Data Dihapus', 'Entry telah berhasil dihapus.', 'warning');
    } catch (e: any) {
      if (e.message.includes('permissions')) handleFirestoreError(e, OperationType.DELETE, `projects/${currentProjectId}/entries/${id}`);
    }
  };

  const handleArchiveProject = async (projectId: string, currentStatus: boolean = false) => {
    if (!isAdmin) return;
    try {
      const projectRef = doc(db, 'projects', projectId);
      await updateDoc(projectRef, {
        isArchived: !currentStatus,
        updatedAt: Date.now()
      });
      addNotification(
        !currentStatus ? 'Proyek Diarsipkan' : 'Proyek Dipulihkan',
        `Proyek berhasil ${!currentStatus ? 'diarsipkan' : 'dipulihkan'}.`,
        'info'
      );
    } catch (err) {
      console.error('Failed to archive project:', err);
      addNotification('Gagal', 'Gagal memproses arsip proyek.', 'warning');
    }
  };

  const handleArchiveEntry = async (entryId: string, archive: boolean = true) => {
    if (!currentProjectId) return;
    try {
      await updateDoc(doc(db, 'projects', currentProjectId, 'entries', entryId), {
        isArchived: archive
      });
      addNotification('Arsip Data', `Data berhasil ${archive ? 'diarsipkan' : 'dipulihkan'}.`, 'info');
    } catch (e: any) {
      handleFirestoreError(e, OperationType.UPDATE, `projects/${currentProjectId}/entries/${entryId}`);
    }
  };

  const handleCreateProject = async () => {
    if (!newProjectName.trim() || isCreatingProject) return;
    setIsCreatingProject(true);
    const projectData: any = { 
      name: newProjectName, 
      type: newProjectType,
      description: newProjectDesc,
      locationInfo: newLocationInfo || 'Jalan Tol Trans Sumatera',
      regionalInfo: newRegionalInfo || 'Regional SUMBAGTENG',
      requiredTools: newProjectRequiredTools,
      documentUrl: newProjectDocumentUrl,
      createdAt: Date.now(),
      ownerId: user?.uid,
      status: 'active',
      isArchived: false
    };
    if (newProjectTargetQty) {
      projectData.targetQty = parseFloat(newProjectTargetQty) || 0;
    }
    try {
      const docRef = await addDoc(collection(db, 'projects'), projectData);
      
      await logActivity({
        type: 'project',
        action: 'CREATED',
        title: 'Proyek Baru Dibuat',
        description: `${user?.email} membuat proyek baru: ${projectData.name}`,
        projectId: docRef.id
      });

      setCurrentProjectId(docRef.id);
      setNewProjectName('');
      setNewProjectDesc('');
      setNewLocationInfo('');
      setNewRegionalInfo('');
      setNewProjectRequiredTools([]);
      setNewProjectTargetQty('');
      setNewProjectDocumentUrl('');
      setNewProjectType('asphalt');
      setIsNewProjectModalOpen(false);
      addNotification('Proyek Baru', `Proyek "${projectData.name}" (${newProjectType}) telah berhasil dibuat.`, 'success');
    } catch (e: any) {
      console.error("Error creating project:", e);
      addNotification('Gagal', `Gagal membuat proyek: ${e.message}`, 'error');
    } finally {
      setIsCreatingProject(false);
    }
  };

  const executeDeleteProject = async () => {
    if (!projectToDelete) return;
    setIsDeleteProjectModalOpen(false);
    try {
      // First delete all entries in subcollection
      const entriesSnap = await getDocs(collection(db, 'projects', projectToDelete.id, 'entries'));
      const delPromises = entriesSnap.docs.map(d => deleteDoc(d.ref));
      await Promise.all(delPromises);

      await deleteDoc(doc(db, 'projects', projectToDelete.id));
      addNotification('Proyek Dihapus', `Proyek "${projectToDelete.name}" telah berhasil dihapus.`, 'warning');
      if (currentProjectId === projectToDelete.id) {
        navigate('/');
        setCurrentProjectId('');
      }
      setProjectToDelete(null);
    } catch (e: any) {
      if (e.message.includes('permissions')) handleFirestoreError(e, OperationType.DELETE, `projects/${projectToDelete.id}`);
    }
  };

  const handleDeleteAllInletData = async () => {
    if (!isAdmin) return;
    const inletProjects = projects.filter(p => p.type === 'inlet');
    if (inletProjects.length === 0) {
      addNotification('Info', 'Tidak ada data Inlet untuk dihapus.', 'info');
      return;
    }

    try {
      addNotification('Pembersihan Dimulai', 'Sedang menghapus semua data Inlet dari cloud...', 'info');
      
      for (const project of inletProjects) {
        // Delete entries in subcollection
        const entriesSnap = await getDocs(collection(db, 'projects', project.id, 'entries'));
        const deletePromises = entriesSnap.docs.map(d => deleteDoc(d.ref));
        await Promise.all(deletePromises);
        
        // Delete project itself
        await deleteDoc(doc(db, 'projects', project.id));
      }
      
      addNotification('Penghapusan Berhasil', 'Semua input pekerjaan Inlet dan dokumentasinya telah dihapus dari cloud.', 'success');
    } catch (err: any) {
      console.error('Failed to cleanup Inlet data:', err);
      if (err.message?.includes('resource-exhausted')) {
        addNotification('Kuota Terlampaui', 'Gagal menghapus data karena batasan kuota Firestore.', 'warning');
      } else {
        addNotification('Gagal', 'Terjadi kesalahan saat membersihkan data.', 'warning');
      }
    }
  };

  const resetFilters = () => {
    setSearchQuery(''); setFilterLajur(''); setStartDate(''); setEndDate('');
  };

  const sendNotificationToUser = async (targetEmail: string, title: string, message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info') => {
    if (!user) return;
    const newNotif = { 
      title, 
      message, 
      type, 
      timestamp: Date.now(), 
      read: false,
      targetEmail: targetEmail.toLowerCase(),
      ownerId: 'system'
    };
    try {
      await addDoc(collection(db, 'notifications'), newNotif);
    } catch (e: any) {
      if (e?.code === 'already-exists' || e?.message?.includes('already exists')) {
        console.warn("User Notification sync already-exists issue. Safely ignored.");
      } else {
        console.error("Error sending user notification:", e);
      }
    }
  };

  const addNotification = async (title: string, message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info') => {
    if (!user) return;
    const newNotif = { 
      title, 
      message, 
      type, 
      timestamp: Date.now(), 
      read: false,
      ownerId: user.uid
    };
    try {
      await addDoc(collection(db, 'notifications'), newNotif);
      const toastNotif = { ...newNotif, id: Math.random().toString(36).substr(2, 9) };
      setToasts(prev => [...prev, toastNotif]);
      setTimeout(() => setToasts(prev => prev.filter(t => t.id !== toastNotif.id)), 5000);
    } catch (e: any) {
      if (e?.code === 'already-exists' || e?.message?.includes('already exists')) {
        console.warn("Notification sync already-exists issue. Safely ignored.");
      } else {
        console.error("Error notification:", e);
      }
    }
  };

  const markNotifAsRead = async (id: string) => {
    try {
      await setDoc(doc(db, 'notifications', id), { read: true }, { merge: true });
    } catch (e) {
      console.error("Error marking read:", e);
    }
  };

  const filteredProjects = useMemo(() => {
    return projects.filter(p => {
      // Archive Filter
      if (showArchivedProjects) {
        if (!p.isArchived) return false;
        return true; // Bypass filters for archives
      } else {
        if (p.isArchived) return false;
      }

      const pName = p.name || '';
      const matchesSearch = pName.toLowerCase().includes(dashSearchQuery.toLowerCase());
      let projectDate = '';
      try {
        if (p.createdAt) projectDate = new Date(p.createdAt).toISOString().split('T')[0];
      } catch (e) {
        console.warn('Invalid project date:', p.createdAt);
      }
      const matchesDate = !dashDateFilter || projectDate === dashDateFilter;
      return matchesSearch && matchesDate;
    });
  }, [projects, dashSearchQuery, dashDateFilter, showArchivedProjects]);

  const filteredEntries = useMemo(() => {
    return entries.filter(entry => {
      if (!entry) return false;
      // Archive Filter
      if (showArchived) {
        if (!entry.isArchived) return false;
        return true; // Bypass other filters when viewing archives
      } else {
        if (entry.isArchived) return false;
      }

      const kmVal = entry.km || '';
      const lajurVal = entry.lajur || '';
      const matchesSearch = kmVal.toLowerCase().includes(searchQuery.toLowerCase()) || lajurVal.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesLajur = filterLajur === '' || lajurVal === filterLajur;
      let entryDate = '';
      try {
        if (entry.timestamp) entryDate = new Date(entry.timestamp).toISOString().split('T')[0];
      } catch (e) {
        console.warn('Invalid entry date:', entry.timestamp);
      }
      const matchesStartDate = startDate === '' || entryDate >= startDate;
      const matchesEndDate = endDate === '' || entryDate <= endDate;
      return matchesSearch && matchesLajur && matchesStartDate && matchesEndDate;
    });
  }, [entries, searchQuery, filterLajur, startDate, endDate, showArchived]);

  const totalTonase = useMemo(() => filteredEntries.reduce((sum, entry) => sum + (Number(entry.tonase) || 0), 0), [filteredEntries]);
  const totalVolume = useMemo(() => filteredEntries.reduce((sum, entry) => sum + (Number(entry.volume) || 0), 0), [filteredEntries]);

  const lajurData = useMemo(() => {
    const data: Record<string, number> = {};
    filteredEntries.forEach(e => { 
      const l = e.lajur || 'Lain';
      data[l] = (data[l] || 0) + (e.tonase || 0); 
    });
    return Object.entries(data).map(([name, value]) => ({ name, value }));
  }, [filteredEntries]);

  const timeData = useMemo(() => {
    const data: Record<string, { tonase: number; volume: number; units: number }> = {};
    [...filteredEntries]
      .sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0))
      .forEach(e => {
        if (!e.timestamp) return;
        try {
          const date = new Date(e.timestamp).toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit' });
          if (!data[date]) data[date] = { tonase: 0, volume: 0, units: 0 };
          data[date].tonase += (e.tonase || 0);
          data[date].volume += (e.volume || 0);
          data[date].units += (e.qty || 0);
        } catch (e) {}
      });
    return Object.entries(data).map(([date, vals]) => ({ date, ...vals }));
  }, [filteredEntries]);

  const getImageDimensions = (base64: string): Promise<{ width: number; height: number }> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve({ width: img.width, height: img.height });
      img.onerror = () => resolve({ width: 1, height: 1 });
      img.src = base64;
    });
  };

  const exportExcel = async (signature?: { name: string, role: string }) => {
    const dataToExport = filteredEntries.length > 0 ? filteredEntries : entries;
    if (dataToExport.length === 0) {
      addNotification('Sistem Report', 'Tidak ada data spesifik untuk dieksport.', 'warning');
      return;
    }

    const sortedData = [...dataToExport].sort((a, b) => a.timestamp - b.timestamp);
    const today = new Date();
    const dateFormatted = today.toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' });
    const fullDateStr = today.toLocaleDateString('id-ID', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' });

    const ExcelJS = await import('exceljs');
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('DATA_OPERASIONAL');

    // 1. HEADER & BRANDING
    worksheet.mergeCells('A1:I1');
    const headerTitle = worksheet.getCell('A1');
    const projectTypeDisplay = currentProject?.type?.toUpperCase() || 'TOLL-GUARD APEX';
    headerTitle.value = `LAPORAN REKAPITULASI PEKERJAAN ${projectTypeDisplay}`;
    headerTitle.font = { bold: true, size: 16, color: { argb: 'FFFFFFFF' } };
    headerTitle.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0F172A' } }; // Darker Slate
    headerTitle.alignment = { horizontal: 'center', vertical: 'middle' };

    worksheet.mergeCells('A2:I2');
    const companyTitle = worksheet.getCell('A2');
    companyTitle.value = 'PT. SHAKA ANUGERAH KARYA';
    companyTitle.font = { bold: true, size: 14, color: { argb: 'FFFB7185' } }; 
    companyTitle.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E293B' } }; // Slate-800
    companyTitle.alignment = { horizontal: 'center', vertical: 'middle' };

    worksheet.mergeCells('A3:I3');
    const projectSub = worksheet.getCell('A3');
    projectSub.value = `LOKASI: ${currentProject?.name?.toUpperCase()} | TANGGAL: ${fullDateStr.toUpperCase()}`;
    projectSub.font = { bold: true, size: 9, color: { argb: 'FF475569' } };
    projectSub.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF8FAFC' } };
    projectSub.alignment = { horizontal: 'center', vertical: 'middle' };

    // Dashboard Style Summary Row
    const target = currentProject?.targetQty || 0;
    const realized = dataToExport.reduce((sum, e) => {
      if (e.isArchived) return sum;
      if (currentProject?.type === 'asphalt') return sum + (e.tonase || 0);
      return sum + (e.qty || 0);
    }, 0);
    const remaining = Math.max(0, target - realized);
    const progressPerc = target > 0 ? ((realized / target) * 100).toFixed(1) : '0';
    const unitForExcel = currentProject?.type === 'asphalt' ? 'TON' : currentProject?.type === 'painting' ? 'm2' : 'PCS/QTY';

    // Split Summary into 3 Blocks
    worksheet.mergeCells('A4:C4');
    const targetCell = worksheet.getCell('A4');
    targetCell.value = `TARGET: ${target.toLocaleString('id-ID')} ${unitForExcel}`;
    targetCell.font = { bold: true, size: 10 };
    targetCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF1F5F9' } };
    targetCell.alignment = { horizontal: 'center', vertical: 'middle' };
    targetCell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };

    worksheet.mergeCells('D4:F4');
    const realCell = worksheet.getCell('D4');
    realCell.value = `REALISASI: ${realized.toLocaleString('id-ID')} ${unitForExcel} (${progressPerc}%)`;
    realCell.font = { bold: true, size: 10, color: { argb: 'FF047857' } }; // Emerald-700
    realCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFECFDF5' } };
    realCell.alignment = { horizontal: 'center', vertical: 'middle' };
    realCell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };

    worksheet.mergeCells('G4:I4');
    const sisaCell = worksheet.getCell('G4');
    sisaCell.value = `SISA: ${remaining.toLocaleString('id-ID')} ${unitForExcel}`;
    sisaCell.font = { bold: true, size: 10, color: { argb: 'FFB91C1C' } }; // Red-700
    sisaCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFEF2F2' } };
    sisaCell.alignment = { horizontal: 'center', vertical: 'middle' };
    sisaCell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };

    // 2. DYNAMIC COLUMNS BASED ON TYPE
    let columns: any[] = [{ key: 'no', width: 6 }, { key: 'sta', width: 14 }];
    let headers: string[] = ['NO', 'KM / STA'];

    if (currentProject?.type === 'asphalt') {
      headers.push('LAJUR', 'PJG (m)', 'LBR (m)', 'TBL (cm)', 'VOL (m³)', 'TONASE (t)');
      columns.push(
        { key: 'col1', width: 18 }, { key: 'col2', width: 10 }, { key: 'col3', width: 10 },
        { key: 'col4', width: 10 }, { key: 'col5', width: 12 }, { key: 'col6', width: 12 }
      );
    } else if (currentProject?.type === 'painting') {
      headers.push('OBJEK CAT', 'KM AKHIR', 'LUAS (m²)', 'STATUS', 'DESKRIPSI');
      columns.push(
        { key: 'col1', width: 22 }, { key: 'col2', width: 14 }, { key: 'col3', width: 12 }, { key: 'col4', width: 14 }, { key: 'col5', width: 30 }
      );
    } else if (currentProject?.type === 'traffic-sign') {
      headers.push('TIPE RAMBU', 'JUMLAH (UNIT)', 'STATUS', 'DESKRIPSI');
      columns.push(
        { key: 'col1', width: 25 }, { key: 'col2', width: 14 }, { key: 'col3', width: 14 }, { key: 'col4', width: 30 }
      );
    } else if (currentProject?.type === 'inlet') {
      headers.push('UKURAN INLET', 'JUMLAH (UNIT)', 'STATUS', 'DESKRIPSI');
      columns.push(
        { key: 'col1', width: 25 }, { key: 'col2', width: 14 }, { key: 'col3', width: 14 }, { key: 'col4', width: 30 }
      );
    } else if (currentProject?.type === 'planting') {
      headers.push('TIPE TANAMAN', 'JUMLAH (POHON)', 'STATUS', 'DESKRIPSI');
      columns.push(
        { key: 'col1', width: 25 }, { key: 'col2', width: 14 }, { key: 'col3', width: 14 }, { key: 'col4', width: 30 }
      );
    } else {
      headers.push('STATUS', 'DESKRIPSI');
      columns.push({ key: 'col1', width: 14 }, { key: 'col2', width: 40 });
    }

    headers.push('KOORDINAT GPS', 'FOTO 0% (SEBELUM)', 'FOTO 50% (PROSES)', 'FOTO 100% (SELESAI)');
    columns.push(
      { key: 'gps', width: 25 }, 
      { key: 'foto0', width: 42 }, 
      { key: 'foto50', width: 42 }, 
      { key: 'foto100', width: 42 }
    );

    worksheet.getRow(5).values = headers;
    worksheet.columns = columns;

    const headerRow = worksheet.getRow(5);
    headerRow.height = 32;
    headerRow.eachCell((cell) => {
      cell.font = { bold: true, size: 10, color: { argb: 'FF000000' } };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFCC00' } };
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
      cell.border = { top: { style: 'medium' }, left: { style: 'thin' }, bottom: { style: 'medium' }, right: { style: 'thin' } };
    });

    // 3. FILL DATA ROWS
    const rowsToProcess = sortedData.filter(e => e && !e.isArchived);
    for (let i = 0; i < rowsToProcess.length; i++) {
      const entry = rowsToProcess[i];
      if (!entry) continue;
      const hasPhoto = (entry.photos0?.length || 0) + (entry.photos50?.length || 0) + (entry.photos100?.length || 0) > 0;
      const rowData: any = {
        no: i + 1,
        sta: entry.km,
        gps: entry.latitude ? `${entry.latitude.toFixed(6)}, ${entry.longitude?.toFixed(6)}` : '-',
        foto0: '',
        foto50: '',
        foto100: ''
      };

      if (currentProject?.type === 'asphalt') {
        rowData.col1 = entry.lajur?.toUpperCase();
        rowData.col2 = entry.panjang;
        rowData.col3 = entry.lebar;
        rowData.col4 = entry.tebal;
        rowData.col5 = entry.volume;
        rowData.col6 = entry.tonase;
      } else if (currentProject?.type === 'painting') {
        rowData.col1 = entry.signType;
        rowData.col2 = entry.kmTo;
        rowData.col3 = entry.qty;
        rowData.col4 = entry.status?.toUpperCase();
        rowData.col5 = entry.description;
      } else if (currentProject?.type === 'traffic-sign') {
        rowData.col1 = entry.signType;
        rowData.col2 = entry.qty;
        rowData.col3 = entry.status?.toUpperCase();
        rowData.col4 = entry.description;
      } else if (currentProject?.type === 'inlet') {
        rowData.col1 = entry.signType;
        rowData.col2 = entry.qty;
        rowData.col3 = entry.status?.toUpperCase();
        rowData.col4 = entry.description;
      } else if (currentProject?.type === 'planting') {
        rowData.col1 = entry.plantType;
        rowData.col2 = entry.qty;
        rowData.col3 = entry.status?.toUpperCase();
        rowData.col4 = entry.description;
      } else {
        rowData.col1 = entry.status?.toUpperCase();
        rowData.col2 = entry.description;
      }

      const row = worksheet.addRow(rowData);
      row.height = hasPhoto ? 220 : 24; // HD images need more vertical space
      row.eachCell((cell, colNumber) => {
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
        cell.font = { size: 10 };
        cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
        
        if (currentProject?.type === 'asphalt' && colNumber >= 4 && colNumber <= 8) {
          cell.numFmt = '0.0000';
        }
        
        if (i % 2 !== 0) {
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF9FAFB' } };
        }
      });
      
      // Embed photos in their respective columns
      if (hasPhoto) {
        const photoGroups = [
          { data: entry.photos0?.[0], colIdx: columns.length - 3 },
          { data: entry.photos50?.[0], colIdx: columns.length - 2 },
          { data: entry.photos100?.[0], colIdx: columns.length - 1 }
        ].filter(p => p.data);

        // Positioning logic using EMUs for precision
        const emuPerPixel = 9525;
        const padding = 10 * emuPerPixel;
        const boxWidthPx = 250; // Larger images
        const boxHeightPx = 280;
        
        for (let pIdx = 0; pIdx < photoGroups.length; pIdx++) {
          const photoData = photoGroups[pIdx].data;
          const targetColIdx = photoGroups[pIdx].colIdx;
          if (photoData && photoData.startsWith('data:image')) {
            try {
              const base64Data = photoData.split(',')[1];
              const extMatch = photoData.match(/data:image\/([a-zA-Z0-9]+);base64/);
              const extension = extMatch ? extMatch[1] : 'jpeg';
              
              const imageId = workbook.addImage({ base64: base64Data, extension: extension as any });
              const dims = await getImageDimensions(photoData);
              
              const imgRatio = dims.width / dims.height;
              const boxRatio = boxWidthPx / boxHeightPx;
              
              let drawW = boxWidthPx;
              let drawH = boxHeightPx;
              
              if (imgRatio > boxRatio) {
                drawH = drawW / imgRatio;
              } else {
                drawW = drawH * imgRatio;
              }

              worksheet.addImage(imageId, {
                tl: { 
                  col: targetColIdx, 
                  row: row.number - 1, 
                  nativeColOff: padding,
                  nativeRowOff: padding
                },
                ext: { width: drawW, height: drawH },
                editAs: 'oneCell'
              });
            } catch(e) {
              console.error('Error attaching photo to Excel', e);
            }
          }
        }
      }
    }

    // 4. SUMMARY CALCULATION
    const currentLastRow = worksheet.lastRow?.number || 5;
    const footerStart = currentLastRow + 2;

    if (currentProject?.type === 'asphalt') {
      worksheet.mergeCells(`A${footerStart}:F${footerStart}`);
      const summaryLabel = worksheet.getCell(`A${footerStart}`);
      summaryLabel.value = 'TOTAL REKAPITULASI VOLUME & TONASE';
      summaryLabel.font = { bold: true, size: 10 };
      summaryLabel.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE5E7EB' } };
      summaryLabel.alignment = { horizontal: 'right', vertical: 'middle' };

      const totalV = sortedData.reduce((s, e) => s + (Number(e.volume) || 0), 0);
      const totalT = sortedData.reduce((s, e) => s + (Number(e.tonase) || 0), 0);

      const vSumCell = worksheet.getCell(`G${footerStart}`);
      vSumCell.value = totalV;
      vSumCell.numFmt = '#,##0.0000';
      vSumCell.font = { bold: true };
      vSumCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFCC00' } };

      const tSumCell = worksheet.getCell(`H${footerStart}`);
      tSumCell.value = totalT;
      tSumCell.numFmt = '#,##0.0000';
      tSumCell.font = { bold: true };
      tSumCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFCC00' } };
    }

    // 5. SIGNATURE BLOCK (Formal Professional Layout)
    const signRow = footerStart + 4;
    worksheet.mergeCells(`B${signRow}:C${signRow}`);
    worksheet.getCell(`B${signRow}`).value = 'DISETUJUI OLEH,';
    worksheet.getCell(`B${signRow}`).font = { bold: true };
    worksheet.getCell(`B${signRow}`).alignment = { horizontal: 'center' };

    worksheet.mergeCells(`G${signRow}:H${signRow}`);
    worksheet.getCell(`G${signRow}`).value = 'Saksi Lapangan,';
    worksheet.getCell(`G${signRow}`).font = { bold: true };
    worksheet.getCell(`G${signRow}`).alignment = { horizontal: 'center' };

    const signLabelRow = signRow + 4;
    worksheet.mergeCells(`B${signLabelRow}:C${signLabelRow}`);
    worksheet.getCell(`B${signLabelRow}`).value = `( ${signature?.name || '.................................'} )`;
    worksheet.getCell(`B${signLabelRow}`).alignment = { horizontal: 'center' };
    if (signature?.name) worksheet.getCell(`B${signLabelRow}`).font = { bold: true };

    worksheet.mergeCells(`G${signLabelRow}:H${signLabelRow}`);
    worksheet.getCell(`G${signLabelRow}`).value = '( ................................. )';
    worksheet.getCell(`G${signLabelRow}`).alignment = { horizontal: 'center' };
    worksheet.getCell(`G${signLabelRow}`).font = { bold: true };

    if (signature?.role) {
      worksheet.mergeCells(`B${signLabelRow + 1}:C${signLabelRow + 1}`);
      worksheet.getCell(`B${signLabelRow + 1}`).value = signature.role.toUpperCase();
      worksheet.getCell(`B${signLabelRow + 1}`).alignment = { horizontal: 'center' };
      worksheet.getCell(`B${signLabelRow + 1}`).font = { size: 8, italic: true };
    }

    const buffer = await workbook.xlsx.writeBuffer();
    const fileNameBase = currentProject?.type || 'TOLL_GUARD';
    saveAs(new Blob([buffer]), `LAPORAN_${fileNameBase.toUpperCase()}_${currentProject?.name.replace(/\s+/g, '_')}_${dateFormatted.replace(/\//g, '-')}.xlsx`);
    addNotification('Laporan Siap', 'File rekapitulasi operasional telah berhasil diunduh.', 'success');
  };

  const generateAISummary = async (entriesData: any[]) => {
    if (!entriesData || entriesData.length === 0) return "Tidak ada data untuk dianalisis.";
    try {
      const { GoogleGenerativeAI } = await import("@google/generative-ai");
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      const dataSnippet = entriesData.slice(0, 10).map(e => ({
        km: e.km,
        status: e.status,
        desc: e.description,
        timestamp: new Date(e.timestamp).toLocaleDateString()
      }));

      const prompt = `Analisis data progres proyek infrastruktur berikut:
      Total Entry: ${entriesData.length}
      Data (10 terakhir): ${JSON.stringify(dataSnippet)}
      
      Berikan ringkasan sangat singkat (max 3 kalimat) dalam Bahasa Indonesia mengenai status saat ini dan apa yang perlu diperhatikan.`;

      const result = await model.generateContent(prompt);
      return result.response.text();
    } catch (err) {
      console.error('AI Summary failed:', err);
      return "Sistem AI sedang sibuk. Silakan coba lagi nanti.";
    }
  };

  const exportToCSV = (data: any[], filename: string) => {
    if (!data || data.length === 0) return;
    const headers = Object.keys(data[0]).join(',');
    const rows = data.map(row => 
      Object.values(row).map(val => `"${String(val).replace(/"/g, '""')}"`).join(',')
    ).join('\n');
    
    const csvContent = "data:text/csv;charset=utf-8," + headers + "\n" + rows;
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addNotification('CSV Export', 'Data berhasil diekspor ke format CSV.', 'success');
  };

  const exportAllProjectsExcel = async () => {
    if (projects.length === 0) {
      addNotification('Sistem Report', 'Tidak ada data proyek untuk dieksport.', 'warning');
      return;
    }
    
    addNotification('Sistem Report', 'Sedang menyiapkan Excel, mohon tunggu...', 'info');

    const ExcelJS = await import('exceljs');
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('SUMMARY_SELURUH_PROYEK');

    // Header Global
    worksheet.mergeCells('A1:F1');
    const globalHeader = worksheet.getCell('A1');
    globalHeader.value = 'SUMMARY OPERASIONAL SELURUH PROYEK KONSTRUKSI';
    globalHeader.font = { bold: true, size: 14, color: { argb: 'FFFFFFFF' } };
    globalHeader.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF111827' } };
    globalHeader.alignment = { horizontal: 'center', vertical: 'middle' };

    worksheet.getRow(3).values = ['NO', 'NAMA PROYEK', 'TANGGAL DIBUAT', 'JUMLAH DATA', 'TOTAL VOLUME (m³)', 'TOTAL TONASE (t)'];
    worksheet.columns = [
        { key: 'no', width: 8 },
        { key: 'name', width: 35 },
        { key: 'date', width: 20 },
        { key: 'count', width: 15 },
        { key: 'vol', width: 20 },
        { key: 'ton', width: 20 },
    ];

    const hRow = worksheet.getRow(3);
    hRow.eachCell(c => {
        c.font = { bold: true };
        c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFCC00' } };
        c.alignment = { horizontal: 'center' };
    });

    projects.forEach((proj, i) => {
        const pVol = proj.entries?.reduce((s, e) => s + (Number(e.volume) || 0), 0) || 0;
        const pTon = proj.entries?.reduce((s, e) => s + (Number(e.tonase) || 0), 0) || 0;
        
        worksheet.addRow({
            no: i + 1,
            name: `${proj.name.toUpperCase()} (${proj.type?.toUpperCase() || 'LEGACY'})`,
            date: new Date(proj.createdAt).toLocaleDateString('id-ID'),
            count: proj.entries?.length || 0,
            vol: pVol,
            ton: pTon
        }).eachCell(c => {
            c.alignment = { horizontal: 'center' };
            if (typeof c.value === 'number' && Number(c.col) >= 5) c.numFmt = '#,##0.0000';
        });
    });

    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(new Blob([buffer]), `SUMMARY_PROYEK_GLOBAL_${new Date().toISOString().split('T')[0]}.xlsx`);
    addNotification('Summary Siap', 'Global summary report telah berhasil diunduh.', 'success');
  };

  useEffect(() => {
    if (!user || isAdmin) return;

    // Track location if possible
    const trackLocation = () => {
      if ('geolocation' in navigator) {

        navigator.geolocation.getCurrentPosition(
          async (pos) => {
            try {
              const workerRef = doc(db, 'workers', user.uid);
              await updateDoc(workerRef, {
                lastLat: pos.coords.latitude,
                lastLng: pos.coords.longitude,
                lastUpdate: Date.now()
              });
            } catch (e) {
              console.warn("Failed to update worker location", e);
            }
          },
          (err) => console.warn("Geolocation error", err),
          { enableHighAccuracy: true }
        );
      }
    };

    trackLocation();
    const interval = setInterval(trackLocation, 300000); // Every 5 minutes instead of 1 to save quota
    return () => clearInterval(interval);
  }, [user, isAdmin]);

  const handleCreateTask = async (title: string, description: string, assignedTo: string | string[], assignedToEmail: string | string[], priority: Task['priority'], photo?: string, dueDate?: number, documentUrl?: string) => {
    if (!isAdmin || isCreatingTask) return;
    setIsCreatingTask(true);
    try {
        // Always store assignedToEmail as an array for consistent querying
        const normalizedTargetEmail = Array.isArray(assignedToEmail) 
          ? assignedToEmail.map(e => ensureFullEmail(e))
          : [ensureFullEmail(assignedToEmail)];
        
        const normalizedTargetNames = Array.isArray(assignedTo) ? assignedTo : [assignedTo];
          
        const historyEntry: TaskHistoryLog = {
          id: Math.random().toString(36).substr(2, 9),
          taskId: '',
          status: 'pending',
          userName: user?.displayName || user?.email?.split('@')[0] || 'Admin',
          userEmail: user?.email?.toLowerCase() || '',
          timestamp: Date.now(),
          note: 'Tugas dibuat oleh Admin'
        };

        const taskRef = await addDoc(collection(db, 'tasks'), {
            title,
            description,
            photo: photo || '',
            documentUrl: documentUrl || '',
            assignedTo: normalizedTargetNames,
            assignedToEmail: normalizedTargetEmail,
            priority,
            status: 'pending',
            dueDate: dueDate || null,
            createdAt: Date.now(),
            createdBy: user?.email?.toLowerCase(),
            history: [historyEntry],
            isArchived: false
        });
        
        // Update history with doc ID
        const finalHistory = [{ ...historyEntry, taskId: taskRef.id }];
        await setDoc(taskRef, { history: finalHistory }, { merge: true });

        addNotification('Tugas Terkirim', `Tugas "${title}" telah dikirim ke ${normalizedTargetNames.join(', ')}.`, 'success');
        
        // Send persistent notifications to all assignees
        if (normalizedTargetEmail && normalizedTargetEmail.length > 0) {
           for (const targetEmail of normalizedTargetEmail) {
              sendNotificationToUser(targetEmail, 'Tugas Baru', `Admin memberikan tugas baru: ${title}`, 'info');
           }
        }
    } catch (err) {
        console.error('Failed to create task:', err);
        addNotification('Gagal', 'Gagal mengirim tugas. Cek koneksi.', 'warning');
    } finally {
      setIsCreatingTask(false);
    }
  };

  const handleUpdateInventory = async (itemId: string, newStock: number) => {
    try {
      await updateDoc(doc(db, 'inventory', itemId), { stock: newStock, updatedAt: Date.now() });
      
      await logActivity({
        type: 'inventory',
        action: 'UPDATED',
        title: 'Stok Diperbarui',
        description: `${user?.email} mengubah stok material di inventori`,
        metadata: { itemId, newStock }
      });

      addNotification('Stok Diperbarui', 'Jumlah stok material berhasil disinkronkan.', 'success');
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, 'inventory');
    }
  };

  const handleAddInventoryItem = async (item: Omit<InventoryItem, 'id' | 'updatedAt'>) => {
    try {
      const dbEntry = { ...item, updatedAt: Date.now() };
      const docRef = await addDoc(collection(db, 'inventory'), dbEntry);
      addNotification('Material Baru', `Item "${item.name}" ditambahkan ke inventori.`, 'success');
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'inventory');
    }
  };

  const handleDeleteInventoryItem = async (itemId: string) => {
    if (!window.confirm('Hapus item inventori ini?')) return;
    try {
      await deleteDoc(doc(db, 'inventory', itemId));
      addNotification('Item Dihapus', 'Material telah dihapus dari sistem inventori.', 'info');
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, 'inventory');
    }
  };

  const handleUpdateTaskStatus = async (taskId: string, status: Task['status'], realizationPhotos?: string[], isJustSavingProgress?: boolean) => {
    try {
        if (status === 'completed' && !isJustSavingProgress && (!realizationPhotos || realizationPhotos.length === 0)) {
           // check if existing photos exist is handled by client before calling this
        }

        const updateData: any = {};
        if (!isJustSavingProgress) {
            updateData.status = status;
            if (status === 'completed') {
                updateData.completedAt = Date.now();
            } else if (status === 'in-progress') {
                updateData.startedAt = Date.now();
            }
        }

        if (realizationPhotos && realizationPhotos.length > 0) {
            updateData.realizationPhotos = arrayUnion(...realizationPhotos);
        }
        
        const actionLabel = isJustSavingProgress ? 'Progres disimpan' : `Status diubah menjadi ${status}`;
        
        const historyEntry: TaskHistoryLog = {
          id: Math.random().toString(36).substr(2, 9),
          taskId,
          status,
          userName: user?.displayName || user?.email?.split('@')[0] || 'Pegawai',
          userEmail: ensureFullEmail(user?.email || ''),
          timestamp: Date.now(),
          note: actionLabel
        };
        
        updateData.history = arrayUnion(historyEntry);

        const taskRef = doc(db, 'tasks', taskId);
        updateDoc(taskRef, updateData).catch(e => {
            console.error('Failed to update task:', e);
        });
        
        logActivity({
          type: 'task',
          action: isJustSavingProgress ? 'PROGRESS_SAVED' : 'STATUS_UPDATED',
          title: 'Update Tugas',
          description: `${user?.email} ${isJustSavingProgress ? 'mengunggah bukti progres' : `mengubah status tugas menjadi ${status}`}`,
          metadata: { taskId, status }
        }).catch(e => console.error(e));
        
        // Notify all admins if task completed or started
        const adminEmails = [
          'admin.shaka@gmail.com',
          'riskiprataa3@gmail.com',
          'developmentshaka@gmail.com',
          'develop02@gmail.com'
        ];

        const notificationData = {
          title: isJustSavingProgress ? `Progres Tugas Ditambahkan` : `Update Tugas: ${status.toUpperCase()}`,
          message: `${user?.displayName || user?.email?.split('@')[0]} ${isJustSavingProgress ? 'melampirkan foto progres tugas' : `mengubah status tugas menjadi ${status}`}.`,
          type: status === 'completed' && !isJustSavingProgress ? 'success' : 'info',
          read: false,
          timestamp: Date.now(),
        };

        if (!isAdmin) {
           for (const adminEmail of adminEmails) {
             addDoc(collection(db, 'notifications'), { ...notificationData, targetEmail: adminEmail }).catch(e => {
               if (e?.code !== 'already-exists' && !e?.message?.includes('already exists')) console.error(e);
             });
           }
        }

        const taskData = tasks.find(t => t.id === taskId);
        if (taskData) {
          if (typeof taskData.assignedToEmail === 'string') {
             await notifyTaskUpdateToExecutant(taskData.title, status, taskData.assignedToEmail);
          } else if (Array.isArray(taskData.assignedToEmail)) {
             for (const email of taskData.assignedToEmail) {
               await notifyTaskUpdateToExecutant(taskData.title, status, email);
             }
          }
        }

        addNotification('Status Tugas', `Berhasil. Status: ${status}`, 'success');
    } catch (err) {
        console.error('Failed to update task:', err);
        addNotification('Error', 'Gagal memperbarui status tugas.', 'warning');
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!isAdmin) return;
    try {
        await deleteDoc(doc(db, 'tasks', taskId));
        addNotification('Tugas Dihapus', 'Tugas telah berhasil dihapus.', 'warning');
    } catch (err) {
        console.error('Failed to delete task:', err);
    }
  };

  const handleArchiveTask = async (taskId: string, currentStatus: boolean = false) => {
    try {
      const taskRef = doc(db, 'tasks', taskId);
      await updateDoc(taskRef, {
        isArchived: !currentStatus,
        updatedAt: Date.now()
      });
      addNotification(
        !currentStatus ? 'Tugas Diarsipkan' : 'Tugas Dipulihkan',
        `Tugas berhasil ${!currentStatus ? 'diarsipkan' : 'dipulihkan'}.`,
        'info'
      );
    } catch (err) {
      console.error('Failed to archive task:', err);
      addNotification('Gagal', 'Gagal memproses arsip tugas.', 'warning');
    }
  };

  const handleSendMessage = async (content: string, receiverEmail: string, photo?: string) => {
    if (!user) return;
    try {
        const targetEmail = receiverEmail === 'ALL' ? 'ALL' : ensureFullEmail(receiverEmail);
        const msgData = {
            content,
            photo: photo || '',
            senderId: user.uid,
            senderEmail: user.email?.toLowerCase(),
            receiverEmail: targetEmail,
            timestamp: Date.now()
        };
        const docRef = await addDoc(collection(db, 'chat_messages'), msgData);
        addNotification('Pesan Terkirim', 'Pesan telah berhasil dikirim ke server.', 'success');
        
        // Send notification to receiver if it's not ALL
        if (targetEmail !== 'ALL') {
          sendNotificationToUser(targetEmail, 'Pesan Baru', `Anda menerima pesan baru dari ${user.displayName || user.email?.split('@')[0]}`, 'info');
        }
    } catch (err) {
        console.error('Failed to send message:', err);
        addNotification('Gagal Kirim', 'Gagal mengirim pesan chat.', 'warning');
    }
  };

  const handleClearChatMessages = async () => {
    if (!isAdmin) return;
    try {
        const q = query(collection(db, 'chat_messages'));
        const snapshot = await getDocs(q);
        if (snapshot.empty) {
            addNotification('Chat Cleaned', 'Tidak ada pesan untuk dihapus.', 'info');
            return;
        }
        
        const deletePromises = snapshot.docs.map(doc => deleteDoc(doc.ref));
        await Promise.all(deletePromises);
        
        addNotification('Chat Dibersihkan', 'Seluruh riwayat pesan telah dihapus.', 'success');
    } catch (err) {
        console.error('Failed to clear chat:', err);
        addNotification('Gagal', 'Gagal menghapus pesan chat.', 'warning');
    }
  };

  useEffect(() => {
    if (!user || !isAdmin || !isOnline) return;

    const cleanupOldMessages = async () => {
      // Only run cleanup once per session/day to save quota
      const lastCleanup = localStorage.getItem('last_chat_cleanup');
      const now = Date.now();
      if (lastCleanup && now - parseInt(lastCleanup) < 24 * 60 * 60 * 1000) {
        return;
      }

      try {
        const sevenDaysAgo = now - (7 * 24 * 60 * 60 * 1000);
        const q = query(collection(db, 'chat_messages'), where('timestamp', '<', sevenDaysAgo), limit(100));
        const snapshot = await getDocs(q);
        
        if (!snapshot.empty) {
          console.log(`[CLEANUP] Found ${snapshot.size} messages older than 7 days. Deleting...`);
          const deletePromises = snapshot.docs.map(doc => deleteDoc(doc.ref));
          await Promise.all(deletePromises);
          console.log(`[CLEANUP] Successfully deleted old messages.`);
        }
        localStorage.setItem('last_chat_cleanup', now.toString());
      } catch (err) {
        console.error('[CLEANUP] Failed to cleanup old messages:', err);
      }
    };

    // Run cleanup on load for admin
    cleanupOldMessages();
  }, [user, isAdmin, isOnline]);

  const exportInventoryToExcel = async () => {
    if (inventory.length === 0) {
      addNotification('Inventory', 'Tidak ada data inventori untuk diekspor.', 'warning');
      return;
    }
    
    addNotification('Sistem Report', 'Sedang menyiapkan Excel, mohon tunggu...', 'info');

    const ExcelJS = await import('exceljs');
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Inventory Stock');

    // Headers
    worksheet.columns = [
      { header: 'No', key: 'no', width: 5 },
      { header: 'Material Name', key: 'name', width: 30 },
      { header: 'Category', key: 'category', width: 20 },
      { header: 'Current Stock', key: 'stock', width: 15 },
      { header: 'Unit', key: 'unit', width: 10 },
      { header: 'Min Stock', key: 'minStock', width: 15 },
      { header: 'Status', key: 'status', width: 15 },
      { header: 'Last Updated', key: 'updatedAt', width: 25 }
    ];

    // Styling Headers
    worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    worksheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E3A8A' } };
    worksheet.getRow(1).alignment = { horizontal: 'center' };

    // Data
    inventory.forEach((item, index) => {
      const isLow = item.stock <= item.minStock;
      worksheet.addRow({
        no: index + 1,
        name: item.name,
        category: item.category,
        stock: item.stock,
        unit: item.unit,
        minStock: item.minStock,
        status: isLow ? 'LOW STOCK' : 'OK',
        updatedAt: item.updatedAt ? new Date(item.updatedAt).toLocaleString('id-ID') : '-'
      });
    });

    // Formatting
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber > 1) {
        const statusCell = row.getCell('status');
        if (statusCell.value === 'LOW STOCK') {
          statusCell.font = { color: { argb: 'FFFF0000' }, bold: true };
        }
        row.alignment = { vertical: 'middle', horizontal: 'center' };
        row.getCell('name').alignment = { vertical: 'middle', horizontal: 'left' };
      }
    });

    const buffer = await workbook.xlsx.writeBuffer();
    const { saveAs } = await import('file-saver');
    saveAs(new Blob([buffer]), `Inventory_Report_${new Date().toISOString().split('T')[0]}.xlsx`);
    addNotification('Inventory Export', 'Data inventori telah berhasil diunduh.', 'success');
  };

  const value = {
    user, authLoading, isAuthLoading, email, setEmail, password, setPassword, authError, handleLogin, handleGoogleLogin, handleLogout, isAdmin, isSuperAdmin,
    projects, currentProjectId, setCurrentProjectId, currentProject, isNewProjectModalOpen, setIsNewProjectModalOpen,
    newProjectName, setNewProjectName, newProjectType, setNewProjectType, newProjectDesc, setNewProjectDesc,
    newLocationInfo, setNewLocationInfo, newRegionalInfo, setNewRegionalInfo,
    newProjectRequiredTools, setNewProjectRequiredTools,
    newProjectTargetQty, setNewProjectTargetQty,
    newProjectDocumentUrl, setNewProjectDocumentUrl,
    handleCreateProject, projectToDelete, setProjectToDelete,
    isDeleteProjectModalOpen, setIsDeleteProjectModalOpen, executeDeleteProject, handleDeleteAllInletData,
    userCheckIn, handleCheckIn, handleCheckOut, equipmentList,
    isDarkMode, setIsDarkMode,
    dashSearchQuery, setDashSearchQuery, dashDateFilter, setDashDateFilter, filteredProjects,
    km, setKm, kmTo, setKmTo, signType, setSignType, plantType, setPlantType, qty, setQty,
    entryStatus, setEntryStatus, entryDesc, setEntryDesc,
    lajurDropdown, setLajurDropdown, lajurManual, setLajurManual, density, setDensity,
    panjang, setPanjang, lebar, setLebar, tebal, setTebal, location, setLocation, handleGetLocation, isLocating,
    photos0, setPhotos0, photos50, setPhotos50, photos100, setPhotos100, equipmentUsed, setEquipmentUsed, uploadingPhotos, isEntryArchived, setIsEntryArchived, removePhoto, handleFileUpload,
    uploadFileToStorage,
    entries, handleAddEntry, resetEntryForm, handleDeleteEntry, isUploading, searchQuery, setSearchQuery, filterLajur, setFilterLajur,
    startDate, setStartDate, endDate, setEndDate, showFilters, setShowFilters, resetFilters,
    viewMode, setViewMode, isSidebarOpen, setIsSidebarOpen, notifications, isNotificationOpen, setIsNotificationOpen,
    addNotification, markNotifAsRead, filteredEntries, totalTonase, totalVolume, lajurData, timeData, exportExcel, 
    exportAllProjectsExcel,
    attendanceLogs, handleCreateAttendance,
    exportInventoryToExcel, generateAISummary, exportToCSV,
    selectedEntryPhotos, setSelectedEntryPhotos, errors, setErrors, materialType, setMaterialType,
    isCreatingProject, isCreatingTask, isAddingEntry,
    tasks, handleCreateTask, handleUpdateTaskStatus, handleDeleteTask, handleArchiveTask, 
    chatMessages, handleSendMessage, handleClearChatMessages, 
    compressImage, compressImageToFile, loginLogs,
    workers, activeSessions, inventory, handleUpdateInventory, handleAddInventoryItem, handleDeleteInventoryItem,
    hseLogs, incidents, apdChecks, handleCreateAPDCheck, fuelLogs, activities, cashAdvances, attendanceSettings, handleUpdateAttendanceSettings, equipmentRequests, userProfile, handleCreateHseLog, handleSendSOS, handleReportIncident, handleResolveIncident, handleCreateEquipmentRequest, handleUpdateEquipmentRequestStatus, handleDeleteEquipmentRequest, generateDPR, handleCreateFuelLog, logActivity, handleCreateCashAdvance, handleDeleteCashAdvance,
    handleAddWorker, handleUpdateWorker, handleDeleteWorker, handleAddEntryManual,
    handleSendEmailVerification,
    isOnline,
    quotaExceeded, setQuotaExceeded,
    isOutsideGeofence,
    isQuotaBlocked, quotaBlockedMessage, handleForceClearSessions,
    needsInduction,
    deferredPrompt, setDeferredPrompt, handleInstallApp, isInstallModalOpen, setIsInstallModalOpen,
    editingEntryId, setEditingEntryId, handleEditEntry,
    showArchived, setShowArchived, handleArchiveEntry,
    activeAccessKeys, generatePelaksanaKey,
    showArchivedProjects, setShowArchivedProjects, handleArchiveProject,
    showArchivedTasks, setShowArchivedTasks
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) throw new Error('useApp must be used within an AppProvider');
  return context;
};

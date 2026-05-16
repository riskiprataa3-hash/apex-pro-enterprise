import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Calendar,
  Search,
  Layers,
  TrendingUp,
  ArrowRight,
  Database,
  FileSpreadsheet,
  Clock,
  ShieldCheck,
  Activity,
  MapPin,
  LocateFixed,
  Map as MapIcon,
  MessageSquare,
  ClipboardList,
  Camera,
  LogOut,
  Moon,
  Sun,
  X,
  Check,
  UserPlus,
  ArrowLeft,
  ChevronRight,
  User,
  Filter,
  ArrowUpDown,
  History,
  CheckCircle2,
  Wifi,
  WifiOff,
  LayoutDashboard,
  Maximize2,
  Archive,
  ArchiveRestore,
  Plus,
  Trash2,
  Smartphone,
  Target,
  Download,
  Wrench,
  AlertTriangle,
  AlertCircle,
  Star,
  Lock,
  Key,
  ShieldAlert,
  RefreshCw,
  Image as ImageIcon,
  BellRing,
  Settings,
  BarChart3,
  Wallet
} from "lucide-react";
import { SettingsView } from "./SettingsView";
import { DevMonitorTab } from "./DevMonitorTab";
import { AttendanceTab } from "./AttendanceTab";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  BarChart,
  Bar
} from "recharts";
import { useApp, Worker, Task, TaskHistoryLog } from "../context/AppContext";
import { motion, AnimatePresence } from "motion/react";
import { useSwipeable } from 'react-swipeable';
import { Button, Card, Input, cn } from "./ui/Base";
import { ApexLogo } from "./ui/ApexLogo";

const HseCheckbox = ({ label, checked, onChange }: { label: string, checked: boolean, onChange: (v: boolean) => void }) => (
  <button 
    onClick={() => onChange(!checked)}
    className={cn(
      "w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all text-left",
      checked ? "bg-emerald-500/10 border-emerald-500 shadow-lg shadow-emerald-500/10" : "bg-muted/10 border-border opacity-60 grayscale hover:opacity-100 hover:grayscale-0"
    )}
  >
     <div className={cn("w-6 h-6 rounded-lg border-2 flex items-center justify-center shrink-0 transition-all", 
       checked ? "bg-emerald-500 border-emerald-500 text-white" : "border-muted-foreground/30")}>
        {checked && <CheckCircle2 className="w-4 h-4" />}
     </div>
     <span className={cn("text-[10px] font-black uppercase tracking-tight leading-tight", checked ? "text-emerald-700 dark:text-emerald-400" : "text-muted-foreground")}>{label}</span>
  </button>
);

interface EqReqCardProps {
  req: any;
  isAdmin: boolean;
  onUpdateStatus?: (id: string, status: any, note?: string) => Promise<void>;
  onReject?: (id: string) => void;
  onDelete?: (id: string) => void;
}

const EquipmentRequestCard: React.FC<EqReqCardProps> = ({ req, isAdmin, onUpdateStatus, onReject, onDelete }) => {
  const statusColors: any = {
    'pending': 'bg-slate-500',
    'approved': 'bg-emerald-500',
    'rejected': 'bg-rose-500',
    'in-process': 'bg-amber-500',
    'completed': 'bg-blue-500'
  };

  return (
    <div className="bg-card border border-border/50 rounded-[2rem] p-6 hover:shadow-xl transition-all group overflow-hidden relative">
      <div className="relative z-10">
        <div className="flex justify-between items-start mb-4">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className={cn(
                "text-[7px] font-black uppercase px-2 py-0.5 rounded-full text-white",
                req.type === 'new' ? 'bg-emerald-500' : req.type === 'repair' ? 'bg-amber-500' : 'bg-rose-500'
              )}>
                {req.type}
              </span>
              <span className={cn(
                "text-[7px] font-black uppercase px-2 py-0.5 rounded-full text-white",
                statusColors[req.status]
              )}>
                {req.status}
              </span>
            </div>
            <h4 className="text-base font-black italic uppercase tracking-tight">{req.toolName}</h4>
            <p className="text-[9px] font-bold text-muted-foreground uppercase">
              {isAdmin ? `Oleh: ${req.userEmail}` : `Diajukan: ${new Date(req.timestamp).toLocaleDateString()}`}
            </p>
          </div>
          
          {isAdmin && onUpdateStatus && req.status === 'pending' && (
            <div className="flex gap-1">
               <button 
                 onClick={() => onUpdateStatus(req.id, 'in-process')}
                 className="p-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
                >
                 <CheckCircle2 className="w-3.5 h-3.5" />
               </button>
               <button 
                 onClick={() => onReject?.(req.id)}
                 className="p-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition-colors"
               >
                 <X className="w-3.5 h-3.5" />
               </button>
            </div>
          )}
          
          {isAdmin && onUpdateStatus && req.status === 'in-process' && (
            <button 
              onClick={() => onUpdateStatus(req.id, 'completed')}
              className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-1 px-3"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span className="text-[8px] font-black uppercase">Selesai</span>
            </button>
          )}

              {onDelete && (
                <button 
                  onClick={() => onDelete(req.id)}
                  className="p-2 text-muted-foreground hover:text-rose-500 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
        </div>
        
        <p className="text-[11px] text-muted-foreground leading-relaxed italic mb-4 line-clamp-3">"{req.description}"</p>
        
        {req.photo && (
          <div className="mb-4">
            <img src={req.photo} className="w-full h-32 object-cover rounded-2xl border border-border shadow-sm" alt="Evidence" />
          </div>
        )}

        {req.adminNote && (
          <div className={cn(
            "p-3 rounded-xl border flex items-start gap-2",
            req.status === 'rejected' ? 'bg-rose-500/5 border-rose-500/20' : 'bg-muted border-border/50'
          )}>
            <AlertCircle className={cn("w-3.5 h-3.5 shrink-0 mt-0.5", req.status === 'rejected' ? 'text-rose-500' : 'text-primary')} />
            <div>
               <p className="text-[8px] font-black uppercase text-muted-foreground mb-0.5 italic">Respon Admin:</p>
               <p className={cn(
                 "text-[10px] font-bold",
                 req.status === 'rejected' ? 'text-rose-500' : 'text-primary'
               )}>{req.adminNote}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const DashboardPage: React.FC = () => {
  const {
    dashSearchQuery,
    setDashSearchQuery,
    dashDateFilter,
    setDashDateFilter,
    filteredProjects,
    setCurrentProjectId,
    setProjectToDelete,
    setIsDeleteProjectModalOpen,
    setIsNewProjectModalOpen,
    isNewProjectModalOpen,
    newProjectTargetQty,
    setNewProjectTargetQty,
    newProjectDocumentUrl,
    setNewProjectDocumentUrl,
    
    handleCreateProject,
    projects,
    currentProject,
    currentProjectId,
    exportAllProjectsExcel,
    isStandalone,
    user,
    isAdmin,
    isSuperAdmin,
    handleLogout,
    deferredPrompt,
    handleInstallApp,
    tasks,
    handleCreateTask,
    isCreatingProject,
    isCreatingTask,
    handleUpdateTaskStatus,
    handleDeleteTask,
    handleArchiveTask,
    chatMessages,
    handleSendMessage,
    notifications,
    
    hseLogs,
    incidents,
    apdChecks,
    fuelLogs,
    activities,
    equipmentRequests,
    userProfile,
    handleCreateHseLog,
    handleCreateAPDCheck,
    handleSendSOS,
    handleSendEmailVerification,
    handleReportIncident,
    handleResolveIncident,
    handleCreateEquipmentRequest,
    handleUpdateEquipmentRequestStatus,
    handleDeleteEquipmentRequest,
    attendanceSettings,
    handleUpdateAttendanceSettings,
    handleCreateFuelLog,
    generateDPR,
    
    addNotification,
    markNotifAsRead,
    compressImage,
    activeAccessKeys,
    generatePelaksanaKey,
    isDarkMode,
    setIsDarkMode,
    workers,
    activeSessions,
    isQuotaBlocked,
    quotaBlockedMessage,
    handleForceClearSessions,
    cashAdvances,
    handleCreateCashAdvance,
    handleDeleteCashAdvance,
    handleAddWorker,
    handleUpdateWorker,
    handleDeleteWorker,
    isDeleteProjectModalOpen,
    projectToDelete,
    executeDeleteProject,
    handleDeleteAllInletData,
    userCheckIn,
    handleCheckIn,
    handleCheckOut,
    quotaExceeded,
    setQuotaExceeded,
    isOnline,
    location,
    showArchivedProjects, 
    setShowArchivedProjects, 
    handleArchiveProject,
    showArchivedTasks, 
    setShowArchivedTasks,
    newProjectName,
    setNewProjectName,
    newProjectType,
    setNewProjectType,
    newProjectDesc,
    setNewProjectDesc,
    newLocationInfo,
    setNewLocationInfo,
    newRegionalInfo,
    setNewRegionalInfo,
    newProjectRequiredTools,
    setNewProjectRequiredTools,
    timeData,
    inventory,
  } = useApp();
  const navigate = useNavigate();

  // --- DB REPAIR EFFECT ---
  React.useEffect(() => {
    const runTypeValidation = async () => {
      if (!isSuperAdmin || localStorage.getItem('shaka_data_validated') === 'true') return;
      
      try {
        const { collectionGroup, getDocs, updateDoc } = await import('firebase/firestore');
        const { db } = await import('../firebase');
        const snap = await getDocs(collectionGroup(db as any, 'entries'));
        let fixed = 0;
        
        for (const docSnap of snap.docs) {
          const data = docSnap.data();
          let updates: any = {};
          
          if (data.tonase && typeof data.tonase === 'string') updates.tonase = parseFloat(data.tonase) || 0;
          if (data.volume && typeof data.volume === 'string') updates.volume = parseFloat(data.volume) || 0;
          if (data.panjang && typeof data.panjang === 'string') updates.panjang = parseFloat(data.panjang) || 0;
          if (data.lebar && typeof data.lebar === 'string') updates.lebar = parseFloat(data.lebar) || 0;
          if (data.tebal && typeof data.tebal === 'string') updates.tebal = parseFloat(data.tebal) || 0;
          if (data.density && typeof data.density === 'string') updates.density = parseFloat(data.density) || 0;
          if (data.qty && typeof data.qty === 'string') updates.qty = parseFloat(data.qty) || 0;
          
          if (data.km && typeof data.km !== 'string') updates.km = String(data.km);
          if (data.kmTo && typeof data.kmTo !== 'string') updates.kmTo = String(data.kmTo);
          if (data.lajur && typeof data.lajur !== 'string') updates.lajur = String(data.lajur);
      
          if (Object.keys(updates).length > 0) {
            await updateDoc(docSnap.ref, updates);
            fixed++;
          }
        }
        console.log(`[Validation] Fixed data types for ${fixed} entries.`);
        localStorage.setItem('shaka_data_validated', 'true');
      } catch(e) {
        console.error('[Validation Error]', e);
      }
    };
    runTypeValidation();
  }, [isSuperAdmin]);

  const [activeTab, setActiveTab] = React.useState<any>(() => {
    return localStorage.getItem('shaka_active_tab') || "projects";
  });

  React.useEffect(() => {
    localStorage.setItem('shaka_active_tab', activeTab);
  }, [activeTab]);
  const [isTaskModalOpen, setIsTaskModalOpen] = React.useState(false);
  const [notificationPerm, setNotificationPerm] = React.useState<string>(typeof Notification !== 'undefined' ? Notification.permission : 'default');

  const requestNotification = async () => {
    if (typeof Notification !== 'undefined') {
      const p = await Notification.requestPermission();
      setNotificationPerm(p);
    }
  };

  const [isHseModalOpen, setIsHseModalOpen] = React.useState(false);
  const [isCashAdvanceModalOpen, setIsCashAdvanceModalOpen] = React.useState(false);
  const [cashAdvanceWorker, setCashAdvanceWorker] = React.useState<{email: string, name: string} | null>(null);
  const [cashAdvanceAmount, setCashAdvanceAmount] = React.useState("");
  const [cashAdvanceNote, setCashAdvanceNote] = React.useState("");

  // --- START WORK SESSION (SAFETY CHECK) ---
  const [isStartWorkModalOpen, setIsStartWorkModalOpen] = React.useState(false);
  const [safetyChecked, setSafetyChecked] = React.useState({
    helm: false,
    rompi: false,
    sepatu: false
  });
  const isReadyToWork = Object.values(safetyChecked).every(val => val === true);

  const startWorkSession = async () => {
    if (!user || !isReadyToWork) return;
    try {
      const { collection, addDoc } = await import('firebase/firestore');
      const { db } = await import('../firebase');
      
      await addDoc(collection(db, 'activities'), {
        userId: user.uid,
        userEmail: user.email || '',
        type: 'hse',
        action: 'CHECKIN',
        title: 'Mulai Pekerjaan (APD Lengkap)',
        description: 'Pekerja telah melakukan konfirmasi kesiapan APD: Helm, Rompi, dan Sepatu.',
        timestamp: Date.now(),
      });
      
      addNotification("Berhasil", "Sesi pekerjaan dimulai. Selalu utamakan keselamatan!", "success");
      setIsStartWorkModalOpen(false);
      setSafetyChecked({ helm: false, rompi: false, sepatu: false });
    } catch (e: any) {
      addNotification("Gagal", e.message, "error");
    }
  };
  // --- END WORK SESSION ---

  const [isApdModalOpen, setIsApdModalOpen] = React.useState(false);
  
  // States for APD Checklist
  const [apdForm, setApdForm] = React.useState({
    helm: false,
    rompi: false,
    sepatu: false,
    kacamata: false,
    sarungTangan: false,
    masker: false,
    harness: false,
  });
  const [apdNotes, setApdNotes] = React.useState("");
  const [apdPhoto, setApdPhoto] = React.useState("");

  const [isIncidentModalOpen, setIsIncidentModalOpen] = React.useState(false);

  // States for HSE checklist
  const [hsePPE, setHsePPE] = React.useState(false);
  const [hseTools, setHseTools] = React.useState(false);
  const [hseEnv, setHseEnv] = React.useState(false);
  const [hseInduction, setHseInduction] = React.useState(false);
  const [hsePhoto, setHsePhoto] = React.useState("");
  const [checkedTools, setCheckedTools] = React.useState<string[]>([]);

  // States for Incident Report
  const [incType, setIncType] = React.useState<"accident" | "near-miss">("accident");
  const [incDesc, setIncDesc] = React.useState("");
  const [incPhoto, setIncPhoto] = React.useState("");

  // States for Equipment Request
  const [isEqRequestModalOpen, setIsEqRequestModalOpen] = React.useState(false);
  const [isSubmittingEq, setIsSubmittingEq] = React.useState(false);
  const [isSubmittingHse, setIsSubmittingHse] = React.useState(false);
  const [isSubmittingInc, setIsSubmittingInc] = React.useState(false);
  const [isSubmittingApd, setIsSubmittingApd] = React.useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = React.useState(false);
  const [rejectId, setRejectId] = React.useState("");
  const [rejectReason, setRejectReason] = React.useState("");
  const [eqToolName, setEqToolName] = React.useState("");
  const [eqType, setEqType] = React.useState<"new" | "repair" | "damaged">("repair");
  const [eqDescription, setEqDescription] = React.useState("");
  const [eqPhoto, setEqPhoto] = React.useState("");

  // States for Fuel Log
  const [isFuelModalOpen, setIsFuelModalOpen] = React.useState(false);
  const [fuelProject, setFuelProject] = React.useState("");
  const [fuelEquip, setFuelEquip] = React.useState("");
  const [fuelLiters, setFuelLiters] = React.useState("");
  const [fuelNote, setFuelNote] = React.useState("");
  const [fuelPhoto, setFuelPhoto] = React.useState("");
  const [isLoggingFuel, setIsLoggingFuel] = React.useState(false);

  const needsInduction = React.useMemo(() => {
    if (!user || isAdmin) return false;
    if (!userProfile?.lastInductionAt) return true;
    const oneDay = 24 * 60 * 60 * 1000;
    return (Date.now() - userProfile.lastInductionAt) > oneDay;
  }, [user, userProfile, isAdmin]);

  // States for creating task
  const [taskTitle, setTaskTitle] = React.useState("");
  const [taskDesc, setTaskDesc] = React.useState("");
  const [taskPriority, setTaskPriority] = React.useState<Task['priority']>("medium");
  const [taskAssignees, setTaskAssignees] = React.useState<{name: string, email: string}[]>([]);
  const [taskPhoto, setTaskPhoto] = React.useState("");
  const [taskDocumentUrl, setTaskDocumentUrl] = React.useState("");
  const [taskDueDate, setTaskDueDate] = React.useState("");
  const [isUploadingTaskPhoto, setIsUploadingTaskPhoto] = React.useState(false);
  
  // Message states for draft persistence
  const [msgContent, setMsgContent] = React.useState("");
  const [msgReceiver, setMsgReceiver] = React.useState("");
  const [msgPhoto, setMsgPhoto] = React.useState("");

  // --- DASHBOARD FORMS DRAFT PERSISTENCE ---
  React.useEffect(() => {
    const savedDraft = localStorage.getItem('shaka_dashboard_drafts');
    if (savedDraft) {
      try {
        const d = JSON.parse(savedDraft);
        if (d.incDesc) setIncDesc(d.incDesc);
        if (d.incPhoto) setIncPhoto(d.incPhoto);
        if (d.eqToolName) setEqToolName(d.eqToolName);
        if (d.eqDescription) setEqDescription(d.eqDescription);
        if (d.eqPhoto) setEqPhoto(d.eqPhoto);
        if (d.fuelEquip) setFuelEquip(d.fuelEquip);
        if (d.fuelLiters) setFuelLiters(d.fuelLiters);
        if (d.fuelNote) setFuelNote(d.fuelNote);
        if (d.fuelPhoto) setFuelPhoto(d.fuelPhoto);
        if (d.taskTitle) setTaskTitle(d.taskTitle);
        if (d.taskDesc) setTaskDesc(d.taskDesc);
        if (d.taskPhoto) setTaskPhoto(d.taskPhoto);
        if (d.msgContent) setMsgContent(d.msgContent);
        if (d.msgReceiver) setMsgReceiver(d.msgReceiver);
        if (d.msgPhoto) setMsgPhoto(d.msgPhoto);
      } catch (e) {}
    }
  }, []);

  React.useEffect(() => {
    const drafts = {
      incDesc, incPhoto, eqToolName, eqDescription, eqPhoto,
      fuelEquip, fuelLiters, fuelNote, fuelPhoto,
      taskTitle, taskDesc, taskPhoto,
      msgContent, msgReceiver, msgPhoto
    };
    localStorage.setItem('shaka_dashboard_drafts', JSON.stringify(drafts));
  }, [incDesc, incPhoto, eqToolName, eqDescription, eqPhoto, fuelEquip, fuelLiters, fuelNote, fuelPhoto, taskTitle, taskDesc, taskPhoto, msgContent, msgReceiver, msgPhoto]);

  // Helper to clear specific drafts after submission
  const clearDashboardDrafts = () => {
    localStorage.removeItem('shaka_dashboard_drafts');
  };
  // -----------------------------------------

  // Task filtering & sorting
  const [taskFilterStatus, setTaskFilterStatus] = React.useState<string>("all");
  const [taskSortBy, setTaskSortBy] = React.useState<"newest" | "priority">("newest");

  // States for worker management
  const [isWorkerModalOpen, setIsWorkerModalOpen] = React.useState(false);
  const [editingWorkerId, setEditingWorkerId] = React.useState<string | null>(null);
  const [wEmpId, setWEmpId] = React.useState("");
  const [wName, setWName] = React.useState("");
  const [wEmail, setWEmail] = React.useState("");
  const [wPass, setWPass] = React.useState("");
  const [showWPass, setShowWPass] = React.useState(false);
  const [wRole, setWRole] = React.useState<Worker['role']>('field-operator');
  const [wDailyRate, setWDailyRate] = React.useState("");
  const [wIsPinned, setWIsPinned] = React.useState(false);
  const [wGeoEnabled, setWGeoEnabled] = React.useState(false);
  const [wGeoLat, setWGeoLat] = React.useState("");
  const [wGeoLng, setWGeoLng] = React.useState("");
  const [wGeoRadius, setWGeoRadius] = React.useState("500");

  const openWorkerModal = (worker?: Worker) => {
    if (worker) {
      setEditingWorkerId(worker.id);
      setWEmpId(worker.employeeId);
      setWName(worker.name);
      setWEmail(worker.email);
      setWPass(worker.password);
      setWRole(worker.role);
      setWDailyRate(worker.dailyRate?.toString() || "");
      setWIsPinned(!!worker.isPinnedToLogin);
      setWGeoEnabled(!!worker.geofenceLimit?.enabled);
      setWGeoLat(worker.geofenceLimit?.lat?.toString() || "");
      setWGeoLng(worker.geofenceLimit?.lng?.toString() || "");
      setWGeoRadius(worker.geofenceLimit?.radius?.toString() || "500");
    } else {
      setEditingWorkerId(null);
      setWEmpId("");
      setWName("");
      setWEmail("");
      setWPass("");
      setWRole('field-operator');
      setWDailyRate("");
      setWIsPinned(false);
      setWGeoEnabled(false);
      setWGeoLat("");
      setWGeoLng("");
      setWGeoRadius("500");
    }
    setIsWorkerModalOpen(true);
  };

  const handleCreateTaskInternal = async () => {
    if (!taskTitle) {
      addNotification('Gagal', 'Judul tugas harus diisi.', 'warning');
      return;
    }
    if (taskAssignees.length === 0) {
      addNotification('Gagal', 'Pilih minimal satu pelaksana.', 'warning');
      return;
    }
    
    try {
      const names = taskAssignees.map(a => a.name);
      const emails = taskAssignees.map(a => a.email);
      const dueDateTimestamp = taskDueDate ? new Date(taskDueDate).getTime() : undefined;
      
      await handleCreateTask(taskTitle, taskDesc, names, emails, taskPriority, taskPhoto, dueDateTimestamp, taskDocumentUrl);
      setTaskTitle("");
      setTaskDesc("");
      setTaskAssignees([]);
      setTaskPhoto("");
      setTaskDocumentUrl("");
      setTaskPriority("medium");
      setTaskDueDate("");
      setIsTaskModalOpen(false);
      clearDashboardDrafts();
    } catch (err) {
      console.error("Task creation failed:", err);
    }
  };

  const sortedAndFilteredTasks = React.useMemo(() => {
    let filtered = tasks.filter(t => !!t.isArchived === showArchivedTasks);
    if (taskFilterStatus !== "all") {
      filtered = filtered.filter(t => t.status === taskFilterStatus);
    }
    
    return filtered.sort((a, b) => {
      if (taskSortBy === "newest") return (b.createdAt || 0) - (a.createdAt || 0);
      const priorityMap: Record<string, number> = { high: 3, medium: 2, low: 1 };
      const bPrio = priorityMap[b.priority] || 0;
      const aPrio = priorityMap[a.priority] || 0;
      return bPrio - aPrio;
    });
  }, [tasks, taskFilterStatus, taskSortBy, showArchivedTasks]);

  const allEntries = React.useMemo(() => {
    const list: any[] = [];
    projects.forEach(p => {
      if (p.entries) {
        p.entries.forEach(e => list.push({ ...e, projectName: p.name }));
      }
    });
    return list.sort((a, b) => b.timestamp - a.timestamp);
  }, [projects]);

  // States for messaging
  const [isUploadingMsgPhoto, setIsUploadingMsgPhoto] = React.useState(false);

  // States for task realization
  const [realizationPhotos, setRealizationPhotos] = React.useState<Record<string, string[]>>({});
  const [isUploadingRealization, setIsUploadingRealization] = React.useState<Record<string, boolean>>({});

  const handleTaskRealizationUpload = async (e: React.ChangeEvent<HTMLInputElement>, taskId: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const currentPhotos = realizationPhotos[taskId] || [];
    if (currentPhotos.length >= 6) {
      addNotification("Batas Foto", "Maksimal 6 foto bukti pengerjaan.", "warning");
      return;
    }

    setIsUploadingRealization((prev) => ({ ...prev, [taskId]: true }));
    try {
      const compressed = await compressImage(file);
      setRealizationPhotos((prev) => ({
        ...prev,
        [taskId]: [...(prev[taskId] || []), compressed],
      }));
    } catch (err) {
      console.error("Realization upload failed:", err);
    } finally {
      setIsUploadingRealization((prev) => ({ ...prev, [taskId]: false }));
    }
  };

  const totals = React.useMemo(() => {
    let entriesCount = 0;
    let volumeTotal = 0;
    let tonaseTotal = 0;
    let signsTotal = 0;
    let inletsTotal = 0;
    let paintingTotal = 0;
    let plantingTotal = 0;

    let targetSigns = 0;
    let targetInlets = 0;
    let targetPainting = 0;
    let targetPlanting = 0;
    let targetAsphalt = 0;
    
    projects.forEach(p => {
      // Only include metrics from non-archived projects for the global totals
      if (!p.isArchived) {
        // Accumulate targets
        if (p.type === 'traffic-sign') targetSigns += (p.targetQty || 0);
        if (p.type === 'inlet') targetInlets += (p.targetQty || 0);
        if (p.type === 'painting') targetPainting += (p.targetQty || 0);
        if (p.type === 'planting') targetPlanting += (p.targetQty || 0);
        if (p.type === 'asphalt') targetAsphalt += (p.targetQty || 0);

        if (p.entries) {
          p.entries.forEach(e => {
            // Only include non-archived entries in the totals
            if (!e.isArchived) {
              entriesCount++;
              if (p.type === 'asphalt') {
                volumeTotal += (Number(e.volume) || 0);
                tonaseTotal += (Number(e.tonase) || 0);
              } else if (p.type === 'traffic-sign') {
                signsTotal += (Number(e.qty) || 0);
              } else if (p.type === 'inlet') {
                inletsTotal += (Number(e.qty) || 0);
              } else if (p.type === 'painting') {
                paintingTotal += (Number(e.qty) || 0);
              } else if (p.type === 'planting') {
                plantingTotal += (Number(e.qty) || 0);
              }
            }
          });
        }
      }
    });

    const activeProjects = projects.filter(p => !p.isArchived);
    const hasAsphalt = activeProjects.some(p => p.type === 'asphalt');
    const hasSigns = activeProjects.some(p => p.type === 'traffic-sign');
    const hasInlets = activeProjects.some(p => p.type === 'inlet');
    const hasPainting = activeProjects.some(p => p.type === 'painting');
    const hasPlanting = activeProjects.some(p => p.type === 'planting');

    return { 
      entriesCount, 
      volumeCount: volumeTotal, 
      tonaseCount: tonaseTotal,
      signsTotal,
      inletsTotal,
      paintingTotal,
      plantingTotal,
      targetSigns,
      targetInlets,
      targetPainting,
      targetPlanting,
      targetAsphalt,
      hasAsphalt,
      hasSigns,
      hasInlets,
      hasPainting,
      hasPlanting
    };
  }, [projects]);

  const isTrustedAccount = user?.email && [
    'developmentshaka@gmail.com',
    'admin.shaka01@gmail.com',
    'riskiprataa3@gmail.com',
    'pelaksana.shaka@gmail.com'
  ].includes(user?.email?.toLowerCase() || "");

  const isBillingAccount = user?.email && [
    'developmentshaka@gmail.com',
    'riskiprataa3@gmail.com'
  ].includes(user?.email?.toLowerCase() || "");

  const isEmailVerified = user?.emailVerified || isTrustedAccount;

  const navItems = [
    { id: "projects", label: "Proyek", icon: Layers },
    { id: "attendance", label: "Absensi Tim", icon: Calendar },
    { id: "tasks", label: "Tugas", icon: ClipboardList },
    { id: "equipment", label: "Alat", icon: Wrench },
    { id: "activity", label: "Aktivitas", icon: Activity },
    { id: "analytics", label: "Analitik", icon: BarChart3 },
    { id: "hse", label: "K3 (HSE)", icon: ShieldCheck },
    { id: "messages", label: "Pesan", icon: MessageSquare },
    ...(isSuperAdmin ? [
      { id: "workers", label: "Mapping Pelaksana", icon: UserPlus },
    ] : []),
    ...(isAdmin ? [
      { id: "geofence", label: "Setting Lokasi", icon: MapPin },
      { id: "access", label: "Akses Pelaksana", icon: Key },
      { id: "admin", label: "Analitik Operasional", icon: ShieldCheck }
    ] : []),
    ...(isBillingAccount ? [
      { id: "devmonitor", label: "Cloud & Billing", icon: Database }
    ] : []),
    { id: "settings", label: "Pengaturan", icon: Settings }
  ];

  const [isLoadingAnalytics, setIsLoadingAnalytics] = React.useState(false);

  const globalTimeData = React.useMemo(() => {
    const data: Record<string, { tonase: number; volume: number; units: number }> = {};
    [...allEntries]
      .sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0))
      .forEach(e => {
        if (!e.timestamp || e.isArchived) return;
        try {
          const dateStr = new Date(e.timestamp).toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit' });
          if (!data[dateStr]) data[dateStr] = { tonase: 0, volume: 0, units: 0 };
          data[dateStr].tonase += (e.tonase || 0);
          data[dateStr].volume += (e.volume || 0);
          data[dateStr].units += (e.qty || 0);
        } catch (err) {}
      });
    return Object.entries(data).map(([date, vals]) => ({ date, ...vals }));
  }, [allEntries]);

  // Global Material Stock Check
  React.useEffect(() => {
    if (!inventory || inventory.length === 0) return;
    const lowStockItems = inventory.filter(item => item.stock <= (item.minStock || 0));
    if (lowStockItems.length > 0) {
      const names = lowStockItems.map(i => i.name).join(', ');
      // debounce notification so it doesn't spam
      const lastStockWarn = sessionStorage.getItem('lastStockWarn');
      if (lastStockWarn !== new Date().toDateString()) {
        addNotification(
          "Peringatan Stok Menipis", 
          `Stok material berikut menipis dan perlu re-order: ${names}`, 
          "warning"
        );
        sessionStorage.setItem('lastStockWarn', new Date().toDateString());
      }
    }
  }, [inventory, addNotification]);

  // Handle SOS Emergency
  const [isSosLoading, setIsSosLoading] = React.useState(false);

  const handleSOS = async () => {
    if (!user) return;
    
    if (!window.confirm("PERINGATAN! Anda akan mengirimkan sinyal darurat (SOS) ke seluruh sistem. Lanjutkan?")) return;
    
    setIsSosLoading(true);
    try {
      let locationStr = "Lokasi tidak tersedia";
      if ('geolocation' in navigator) {
        try {
          const position = await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 10000 });
          });
          locationStr = `${position.coords.latitude}, ${position.coords.longitude}`;
        } catch (e) {
          console.warn("Geolocation failed", e);
        }
      }
      
      const { collection, addDoc } = await import('firebase/firestore');
      const { db } = await import('../firebase');
      
      await addDoc(collection(db, 'incidents'), {
        userId: user.uid,
        userEmail: user.email || '',
        userName: user.displayName || user.email?.split('@')[0] || 'User',
        type: 'emergency',
        description: `DARURAT! SOS dipicu dari perangkat. Lokasi: ${locationStr}`,
        timestamp: Date.now(),
        status: 'open'
      });
      
      alert("Sinyal Darurat Terkirim! Tim pusat telah dinotifikasi.");
    } catch (error: any) {
      console.error("Gagal kirim SOS", error);
      alert(`Gagal mengirim SOS: ${error.message}`);
    } finally {
      setIsSosLoading(false);
    }
  };

  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => {
      const currentIndex = navItems.findIndex(i => i.id === activeTab);
      if (currentIndex !== -1 && currentIndex < navItems.length - 1) setActiveTab(navItems[currentIndex + 1].id);
    },
    onSwipedRight: () => {
      const currentIndex = navItems.findIndex(i => i.id === activeTab);
      if (currentIndex > 0) setActiveTab(navItems[currentIndex - 1].id);
    },
    preventScrollOnSwipe: false,
    trackMouse: false,
    delta: 100
  });

  return (
    <div className="flex flex-col h-screen text-foreground overflow-hidden font-sans select-none relative z-10 w-full">
      {/* Quota Exceeded Overlay */}
      <AnimatePresence>
        {quotaExceeded && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-0 left-0 right-0 z-[100] bg-rose-600 text-white p-3 shadow-2xl flex items-center justify-center gap-3"
          >
            <AlertTriangle className="w-5 h-5 animate-pulse" />
            <div className="flex flex-col">
              <span className="text-[10px] font-black uppercase tracking-widest leading-none">Limit Penggunaan Tercapai (Blaze Plan)</span>
              <p className="text-[9px] font-bold opacity-80 leading-tight">Sistem mendeteksi penggunaan Resource yang tidak biasa atau limit anggaran tercapai. Harap periksa konsol manajemen untuk detail penggunaan.</p>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              className="ml-4 h-7 text-[8px] font-black uppercase border border-white/30 hover:bg-white/20"
              onClick={() => setQuotaExceeded(false)}
            >
              Tutup
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Connectivity Indicator */}
      {(!isOnline) && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[60] sm:hidden">
          <div className={cn(
            "text-white text-[8px] font-black uppercase tracking-tighter px-4 py-2 rounded-full shadow-2xl flex items-center gap-2 border-2 border-white/20 transition-all bg-rose-500 animate-bounce"
          )}>
            <WifiOff className="w-3 h-3" />
            Mode Offline Aktif
          </div>
        </div>
      )}

      {/* Dynamic Navigation Bar (Floating Desktop/Mobile Top) */}
      <header className="fixed top-4 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-[1400px] z-50 bg-background/80 backdrop-blur-3xl border border-white/20 dark:border-white/5 px-4 py-3 sm:px-8 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.2)] transition-all overflow-hidden">
        {/* Glow effect */}
        <div className="absolute top-0 right-1/4 w-32 h-px bg-gradient-to-r from-transparent via-primary to-transparent opacity-50" />
        
        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center gap-4">
            <ApexLogo className="w-10 h-10" size={20} />
            <div className="drop-shadow-sm hidden xs:block">
              <h1 className="text-sm font-black tracking-tighter uppercase italic leading-none">
                Toll-Guard<br/><span className="text-primary italic">Apex Pro.</span>
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => exportAllProjectsExcel()}
              className="rounded-full h-10 px-4 flex items-center gap-2 border-white/10 hover:border-primary/50 text-foreground group shadow-md"
            >
              <Download className="w-4 h-4 group-hover:text-primary transition-colors" />
              <span className="text-[10px] font-black uppercase tracking-widest hidden md:inline">Master Export</span>
            </Button>
            <div className="hidden sm:flex items-center gap-1.5 bg-muted/50 backdrop-blur-xl px-4 py-2 rounded-2xl border border-white/5 shadow-inner">
              <div className={cn("w-2 h-2 rounded-full", isOnline ? (isStandalone ? "bg-primary animate-pulse shadow-[0_0_8px_#0ea5e9]" : "bg-emerald-500 animate-pulse shadow-[0_0_8px_#10b981]") : "bg-rose-500 shadow-[0_0_8px_#f43f5e]")} />
              <span className="text-[9px] font-black uppercase tracking-widest leading-none">
                {isOnline ? (isStandalone ? 'SYSTEM: NATIVE CORE ACTIVE' : (isTrustedAccount ? 'Blaze-Apex: Online' : 'Apex-Core: Online')) : 'Local Encryption Mode'}
              </span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/lite')}
              className="rounded-full h-10 px-4 flex items-center gap-2 border-primary/20 text-primary hover:bg-primary/20 shadow-md backdrop-blur-md"
              title="Input Data Offline via Lite Mode"
            >
              <LayoutDashboard className="w-4 h-4" />
              <span className="text-[10px] font-black uppercase tracking-widest hidden sm:inline">Mode Lite</span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleInstallApp()}
              className="rounded-full w-10 h-10 shadow-md backdrop-blur-md border border-white/10 text-primary animate-pulse"
              title="Informasi Instalasi Aplikasi"
            >
              <Smartphone className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="rounded-full w-10 h-10 shadow-md backdrop-blur-md border border-white/10"
            >
              {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </Button>

            {notificationPerm !== 'granted' && notificationPerm !== 'denied' && (
              <Button
                variant="outline"
                size="icon"
                onClick={requestNotification}
                className="rounded-full w-10 h-10 shadow-md backdrop-blur-md border hover:bg-amber-500/20 border-amber-500/30 text-amber-500 animate-pulse"
                title="Aktifkan Push Notifikasi"
              >
                <BellRing className="w-4 h-4" />
              </Button>
            )}

            {!window.matchMedia('(display-mode: standalone)').matches && !(navigator as any).standalone && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  handleInstallApp();
                }}
                className="rounded-full h-10 px-4 flex items-center gap-2 border-emerald-500/30 text-emerald-600 bg-emerald-500/10 hover:bg-emerald-500/20 shadow-md animate-pulse"
              >
                <Smartphone className="w-4 h-4" />
                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400">Instal</span>
              </Button>
            )}
            <div className="w-px h-6 bg-border mx-2" />
            <div className="flex items-center gap-3 bg-background/50 backdrop-blur-md p-1.5 border border-white/10 rounded-full pr-4 shadow-inner">
              <div className="w-7 h-7 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-[10px] font-black shadow-lg shadow-primary/30">
                {user?.email?.[0].toUpperCase()}
              </div>
              <span className="text-[10px] font-black uppercase tracking-tight hidden lg:inline truncate max-w-[100px]">
                {user?.email?.split("@")[0]}
              </span>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 ml-2 px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 rounded-full transition-all border border-rose-500/20 group hover:scale-105 active:scale-95 shadow-sm"
                title="Keluar dari Aplikasi"
              >
                <LogOut className="w-3.5 h-3.5 group-hover:rotate-12 transition-transform" />
                <span className="text-[9px] font-black uppercase tracking-widest hidden xs:block">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main {...swipeHandlers} className="flex-1 overflow-y-auto px-4 pt-28 pb-32 sm:px-8 sm:pt-36 custom-scrollbar relative z-10 bg-[radial-gradient(ellipse_at_top,rgba(var(--primary-rgb),0.05),transparent)]">
        <div className="max-w-7xl mx-auto">
          {/* PWA Installation Banner - CRITICAL FOR USER REQUEST */}
          {!window.matchMedia('(display-mode: standalone)').matches && !(navigator as any).standalone && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-10 p-8 rounded-[3rem] bg-emerald-500/10 border border-emerald-500/20 backdrop-blur-3xl relative overflow-hidden group shadow-2xl shadow-emerald-500/10"
            >
              <div className="absolute -top-10 -right-10 p-4 opacity-5 pointer-events-none group-hover:scale-125 transition-transform duration-1000 rotate-12">
                <Smartphone className="w-48 h-48 text-emerald-500" />
              </div>

              <div className="flex flex-col lg:flex-row items-center justify-between gap-8 relative z-10">
                <div className="flex items-center gap-6">
                  <div className="bg-emerald-500/20 p-5 rounded-[2rem] shadow-xl shadow-emerald-500/20 ring-4 ring-emerald-500/10">
                    <Download className="text-emerald-500 w-8 h-8 animate-bounce" />
                  </div>
                  <div>
                    <h4 className="text-xl font-black uppercase italic tracking-tighter leading-none mb-2">Instal APK Mandiri (Standalone)</h4>
                    <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest max-w-md leading-relaxed">
                      Transformasikan menjadi aplikasi mandiri tanpa bar pencarian browser. Performa lebih stabil, akses satu klik dari layar utama, dan memori tetap ringan.
                    </p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
                  <Button 
                    onClick={() => {
                      handleInstallApp();
                    }}
                    className="rounded-2xl h-14 px-10 bg-emerald-500 hover:bg-emerald-600 shadow-xl shadow-emerald-500/30 border-b-4 border-emerald-700 active:border-b-0 active:translate-y-1 transition-all flex items-center justify-center gap-3"
                  >
                    <Smartphone className="w-5 h-5" />
                    <span className="text-sm font-black uppercase tracking-widest leading-none">Pasang Sekarang</span>
                  </Button>
                  
                  <Button 
                    variant="outline"
                    onClick={() => handleInstallApp()}
                    className="rounded-2xl h-14 px-8 text-[10px] font-black uppercase tracking-widest border-emerald-500/30 text-emerald-600 hover:bg-emerald-500/10"
                  >
                    Pelajari Caranya
                  </Button>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-emerald-500/10 flex flex-wrap justify-center lg:justify-start gap-x-8 gap-y-4">
                {[
                  { label: "FULL SCREEN", icon: "âœ”" },
                  { label: "NATIVE FEEL", icon: "âœ”" },
                  { label: "TANPA URL BAR", icon: "âœ”" },
                  { label: "AKSES CEPAT", icon: "âœ”" }
                ].map((feat, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-emerald-500/20 flex items-center justify-center text-[10px] text-emerald-500 font-black">{feat.icon}</div>
                    <p className="text-[9px] font-black text-emerald-600/80 tracking-widest uppercase">{feat.label}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Email Verification Banner */}
          {user && !isEmailVerified && !isAdmin && (
            <div className="mb-8 p-4 rounded-[2rem] bg-amber-500/10 border border-amber-500/20 backdrop-blur-3xl flex flex-col sm:flex-row items-center justify-between gap-4 animate-in fade-in slide-in-from-top-4 duration-500">
               <div className="flex items-center gap-4">
                  <div className="bg-amber-500/20 p-3 rounded-2xl">
                     <Lock className="text-amber-500 w-5 h-5" />
                  </div>
                  <div>
                     <h4 className="text-sm font-black uppercase tracking-widest leading-none">Verifikasi Akun Diperlukan</h4>
                     <p className="text-[10px] text-muted-foreground mt-1 font-bold">Beberapa fitur mungkin terbatas sebelum Anda memverifikasi Gmail Anda.</p>
                  </div>
               </div>
               <Button 
                 onClick={() => handleSendEmailVerification()}
                 variant="outline" 
                 size="sm"
                 className="rounded-full h-10 px-6 text-[10px] sm:text-xs font-black uppercase tracking-widest border-amber-500/30 text-amber-500 hover:bg-amber-500 hover:text-white transition-all shadow-lg shadow-amber-500/10"
               >
                 Kirim Email Verifikasi
               </Button>
            </div>
          )}

          {/* Active Tab Content */}
          <AnimatePresence mode="wait">
            <motion.div 
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="relative will-change-transform"
            >
              {activeTab === "projects" && (
                <div className="space-y-12">
                   {/* Daily Insight Section */}
                   <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      
                      <Card className="p-6 rounded-[2.5rem] bg-background/40 backdrop-blur-3xl border border-white/5 relative overflow-hidden flex flex-col justify-between">
                         <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none">
                            <MapPin className="w-20 h-20" />
                         </div>
                         <div className="relative z-10">
                            <div className="flex items-center gap-3 mb-4">
                               <div className="bg-emerald-500/10 p-3 rounded-2xl border border-emerald-500/20">
                                  <ShieldCheck className="text-emerald-500" size={20} />
                               </div>
                               <div>
                                  <h4 className="text-lg font-black italic uppercase tracking-tighter leading-none">Presensi Digital</h4>
                                  <p className="text-[8px] font-black uppercase tracking-widest text-muted-foreground mt-1">Geofenced Check-in</p>
                               </div>
                            </div>

                            {userCheckIn ? (
                              <div className="bg-emerald-500/10 p-4 rounded-2xl border border-emerald-500/20 space-y-5">
                                 <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-black uppercase text-emerald-600">Otorisasi Aktif</span>
                                    <Clock className="w-4 h-4 text-emerald-600" />
                                 </div>
                                 <div className="space-y-1">
                                    <p className="text-xs font-black uppercase italic italic">Sesi Kerja Berjalan</p>
                                    <p className="text-[10px] opacity-70">Check-in tercatat pada pukul {new Date(userCheckIn.timestamp).toLocaleTimeString('id-ID')}</p>
                                 </div>
                                 
                                 {!isAdmin && (
                                   <Button 
                                     onClick={handleCheckOut} 
                                     className="w-full h-14 rounded-2xl bg-rose-500 hover:bg-rose-600 shadow-lg shadow-rose-500/20 border-b-4 border-rose-700 active:border-b-0 active:translate-y-1 transition-all"
                                   >
                                      <LogOut className="w-4 h-4 mr-2" />
                                      <span className="text-xs font-black uppercase tracking-widest">Logout Sesi & Absen Keluar</span>
                                   </Button>
                                 )}
                              </div>
                            ) : (
                              <div className="space-y-4">
                                 <p className="text-xs text-muted-foreground leading-relaxed">
                                    Rekam kehadiran Anda hari ini sebagai bukti kehadiran di lokasi proyek.
                                 </p>
                                 <Button onClick={handleCheckIn} className="w-full h-14 rounded-2xl shadow-lg shadow-primary/20 bg-primary hover:bg-primary/90">
                                    <MapPin className="w-4 h-4 mr-2" />
                                    <span className="text-xs font-black uppercase tracking-widest leading-none">ABSEN SEKARANG</span>
                                 </Button>
                              </div>
                            )}
                         </div>
                      </Card>

                      <Card className="p-6 rounded-[2.5rem] bg-primary/5 border border-primary/20 relative overflow-hidden flex flex-col justify-between group">
                         <div className="absolute top-0 right-0 p-6 opacity-10 pointer-events-none group-hover:scale-110 transition-transform">
                            <Activity className="w-20 h-20 text-primary" />
                         </div>
                         <div className="relative z-10">
                            <div className="flex items-center gap-3 mb-6">
                               <div className="bg-primary/10 p-3 rounded-2xl">
                                  <TrendingUp className="text-primary" size={20} />
                               </div>
                               <div>
                                  <h4 className="text-lg font-black italic uppercase tracking-tighter leading-none">Status Hari Ini</h4>
                                  <p className="text-[8px] font-black uppercase tracking-widest text-muted-foreground mt-1">Ringkasan Progres Lapangan</p>
                               </div>
                            </div>

                            <div className="space-y-3">
                               <div className="flex justify-between items-center text-xs">
                                  <span className="font-bold text-muted-foreground uppercase tracking-widest text-[9px]">Input Baru</span>
                                  <span className="font-black italic">{allEntries.filter(e => new Date(e.timestamp).toDateString() === new Date().toDateString()).length} Log</span>
                               </div>
                               <div className="flex justify-between items-center text-xs">
                                  <span className="font-bold text-muted-foreground uppercase tracking-widest text-[9px]">Pekerjaan Selesai</span>
                                  <span className="font-black italic text-emerald-500">{allEntries.filter(e => e.status === 'completed' && new Date(e.timestamp).toDateString() === new Date().toDateString()).length} Pcs</span>
                               </div>
                               <div className="pt-2 border-t border-primary/10">
                                  <p className="text-[10px] font-medium italic opacity-70">
                                    "Kondisi mendukung untuk pengerjaan teknis."
                                  </p>
                               </div>
                            </div>
                         </div>
                      </Card>
                   </div>

                  <div className="flex flex-col xl:flex-row gap-6 items-start">
                    <div className="flex-1 w-full space-y-6">
                      {/* Stats Section */}
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      <StatCard label="Total Proyek" value={projects.length} icon={Layers} color="text-rose-500" />
                      
                      {totals.hasAsphalt && (
                        <>
                          <StatCard 
                            label="Total Tonase" 
                            value={totals.tonaseCount > 0 ? `${totals.tonaseCount.toLocaleString('id-ID', { minimumFractionDigits: 3, maximumFractionDigits: 3 })} t` : "0 t"} 
                            unit={totals.targetAsphalt > 0 ? `Target: ${totals.targetAsphalt.toLocaleString('id-ID')} t` : undefined}
                            icon={TrendingUp} 
                            color="text-emerald-500" 
                          />
                          <StatCard 
                            label="Total Volume" 
                            value={totals.volumeCount > 0 ? `${totals.volumeCount.toLocaleString('id-ID', { minimumFractionDigits: 3, maximumFractionDigits: 3 })} m³` : "0 m³"} 
                            icon={Database} 
                            color="text-blue-500" 
                          />
                        </>
                      )}
                      
                      {totals.hasSigns && (
                        <StatCard 
                          label="Total Rambu" 
                          value={`${totals.signsTotal.toLocaleString('id-ID')} PCS`} 
                          unit={totals.targetSigns > 0 
                            ? `Target: ${totals.targetSigns.toLocaleString('id-ID')} | Kurang: ${Math.max(0, totals.targetSigns - totals.signsTotal).toLocaleString('id-ID')}` 
                            : undefined
                          }
                          icon={Activity} 
                          color="text-amber-500" 
                        />
                      )}
                      
                      {totals.hasPainting && (
                        <StatCard 
                          label="Total Marka" 
                          value={`${totals.paintingTotal.toLocaleString('id-ID')} m²`} 
                          unit={totals.targetPainting > 0 
                            ? `Target: ${totals.targetPainting.toLocaleString('id-ID')} | Kurang: ${Math.max(0, totals.targetPainting - totals.paintingTotal).toLocaleString('id-ID')}` 
                            : undefined
                          }
                          icon={Layers} 
                          color="text-purple-500" 
                        />
                      )}
  
                      {totals.hasInlets && (
                        <StatCard 
                          label="Total Inlet" 
                          value={`${totals.inletsTotal.toLocaleString('id-ID')} PCS`} 
                          unit={totals.targetInlets > 0 
                            ? `Target: ${totals.targetInlets.toLocaleString('id-ID')} | Kurang: ${Math.max(0, totals.targetInlets - totals.inletsTotal).toLocaleString('id-ID')}` 
                            : undefined
                          }
                          icon={Database} 
                          color="text-cyan-500" 
                        />
                      )}
  
                      {totals.hasPlanting && (
                        <StatCard 
                          label="Penghijauan" 
                          value={`${totals.plantingTotal.toLocaleString('id-ID')} Phn`} 
                          unit={totals.targetPlanting > 0 
                            ? `Target: ${totals.targetPlanting.toLocaleString('id-ID')} | Kurang: ${Math.max(0, totals.targetPlanting - totals.plantingTotal).toLocaleString('id-ID')}` 
                            : undefined
                          }
                          icon={TrendingUp} 
                          color="text-green-500" 
                        />
                      )}
  
                      <StatCard label="Pekerja Aktif" value={workers.length} icon={UserPlus} color="text-amber-500" />
                    </div>
                  </div>
                </div>

                {/* Actions & Filters */}
                  <div className="flex flex-col sm:flex-row gap-4 items-center justify-between mt-12 bg-muted/30 p-4 rounded-3xl border border-border">
                    <div className="relative flex-1 w-full flex gap-3">
                      <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          placeholder="Cari Proyek..."
                          value={dashSearchQuery}
                          onChange={(e) => setDashSearchQuery(e.target.value)}
                          className="pl-12 h-14 bg-background border-border/50"
                        />
                      </div>
                      <Input
                        type="date"
                        value={dashDateFilter}
                        onChange={(e) => setDashDateFilter(e.target.value)}
                        className="w-auto px-4 h-14 bg-background border-border/50 hidden sm:block"
                      />
                    </div>
                    <div className="flex gap-2 w-full sm:w-auto">
                      <Button variant="outline" onClick={exportAllProjectsExcel} className="flex-1 sm:flex-none h-14 rounded-2xl">
                        <FileSpreadsheet className="w-4 h-4 mr-2 text-emerald-500" />
                        Export
                      </Button>
                      <Button 
                        variant={showArchivedProjects ? "primary" : "outline"} 
                        onClick={() => setShowArchivedProjects(!showArchivedProjects)} 
                        className={cn("flex-1 sm:flex-none h-14 rounded-2xl transition-all", 
                          showArchivedProjects ? "bg-amber-500 hover:bg-amber-600 border-amber-600 text-white shadow-lg shadow-amber-500/20" : ""
                        )}
                      >
                        {showArchivedProjects ? <ArchiveRestore className="w-4 h-4 mr-2" /> : <Archive className="w-4 h-4 mr-2" />}
                        {showArchivedProjects ? "Lihat Proyek Aktif" : "Lihat Arsip Proyek"}
                      </Button>
                      {isAdmin && (
                        <Button onClick={() => setIsNewProjectModalOpen(true)} className="flex-1 sm:flex-none h-14 rounded-2xl">
                          <Plus className="w-4 h-4 mr-2" />
                          Proyek Baru
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Projects Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredProjects.length === 0 ? (
                      <div className="col-span-full py-20 flex flex-col items-center justify-center bg-card/40 rounded-[2.5rem] border border-dashed border-border border-2">
                        <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center text-muted-foreground mb-4">
                          <Layers className="w-8 h-8 opacity-20" />
                        </div>
                        <h3 className="text-sm font-black uppercase italic tracking-widest text-muted-foreground">Tidak Ada Proyek</h3>
                        <p className="text-[10px] text-muted-foreground/60 uppercase mt-1">Gunakan filter atau buat proyek baru</p>
                      </div>
                    ) : (
                      <AnimatePresence mode="popLayout">
                      {filteredProjects.map((p, i) => (
                        <motion.div 
                          key={p.id}
                          layout
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                          transition={{ duration: 0.25, delay: i * 0.05 }}
                        >
                        <ProjectCard
                          project={p}
                          isAdmin={isAdmin}
                          onArchive={handleArchiveProject}
                          onClick={() => {
                            setCurrentProjectId(p.id);
                            navigate(`/project/${p.id}`);
                          }}
                          onDelete={(e: any) => {
                            e.stopPropagation();
                            setProjectToDelete(p);
                            setIsDeleteProjectModalOpen(true);
                          }}
                          index={i}
                        />
                        </motion.div>
                      ))}
                      </AnimatePresence>
                    )}
                  </div>
                </div>
              )}

              {activeTab === "attendance" && (
                <AttendanceTab />
              )}

              {activeTab === "tasks" && (
                <div className="space-y-8">
                  <div className="flex flex-col md:flex-row md:items-center justify-between bg-muted/30 p-6 rounded-[2rem] border border-border gap-4">
                    <div className="flex items-center gap-4">
                      <div className="bg-rose-500/10 p-3 rounded-2xl">
                        <ClipboardList className="w-6 h-6 text-rose-500" />
                      </div>
                      <div>
                        <h2 className="text-xl font-black italic uppercase">Buku Tugas</h2>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-black">Monitoring & Realisasi Lapangan</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 flex-wrap">
                      <div className="flex items-center bg-background rounded-xl px-3 border border-border">
                        <Filter className="w-3.5 h-3.5 text-muted-foreground mr-2" />
                        <select 
                          value={taskFilterStatus} 
                          onChange={e => setTaskFilterStatus(e.target.value)}
                          className="bg-transparent h-10 text-[10px] font-black uppercase outline-none"
                        >
                          <option value="all">Semua Status</option>
                          <option value="pending">Pending</option>
                          <option value="in-progress">Proses</option>
                          <option value="completed">Selesai</option>
                        </select>
                      </div>
                      
                      <button 
                        onClick={() => setTaskSortBy(prev => prev === "newest" ? "priority" : "newest")}
                        className="flex items-center bg-background h-10 px-4 rounded-xl border border-border text-[10px] font-black uppercase hover:bg-muted"
                      >
                        <ArrowUpDown className="w-3.5 h-3.5 mr-2" />
                        {taskSortBy === "newest" ? "Terbaru" : "Prioritas"}
                      </button>

                      <button 
                        onClick={() => setShowArchivedTasks(!showArchivedTasks)}
                        className={cn("flex items-center h-10 px-4 rounded-xl border transition-all text-[10px] font-black uppercase shadow-sm",
                          showArchivedTasks ? "bg-amber-500 border-amber-600 text-white shadow-amber-500/20" : "bg-background border-border hover:bg-muted"
                        )}
                      >
                        {showArchivedTasks ? <ArchiveRestore className="w-3.5 h-3.5 mr-2" /> : <Archive className="w-3.5 h-3.5 mr-2" />}
                        {showArchivedTasks ? "Tugas Aktif" : "Lihat Arsip"}
                      </button>

                      {isAdmin && (
                        <Button onClick={() => setIsTaskModalOpen(true)} className="rounded-xl h-10 px-6">
                          Buat Tugas
                        </Button>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {sortedAndFilteredTasks.length === 0 ? (
                      <div className="col-span-full py-20 flex flex-col items-center justify-center bg-card/40 rounded-[2.5rem] border border-dashed border-border border-2 px-8 text-center">
                        <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center text-muted-foreground mb-6">
                          <ClipboardList className="w-8 h-8 opacity-20" />
                        </div>
                        <h3 className="text-sm font-black uppercase italic tracking-widest text-muted-foreground">Buku Tugas Kosong</h3>
                        <p className="text-[11px] text-muted-foreground/60 uppercase mt-2 max-w-xs leading-relaxed">
                          {tasks.length > 0 
                            ? "Tugas yang Anda cari mungkin berada di filter status lain atau di arsip." 
                            : "Belum ada instruksi tugas yang didelegasikan untuk Anda."
                          }
                        </p>
                        {tasks.length > 0 && (
                          <div className="mt-8 flex flex-wrap justify-center gap-3">
                             <Button 
                               variant="outline" 
                               size="sm" 
                               onClick={() => setTaskFilterStatus('all')}
                               className="text-[9px] font-black uppercase tracking-widest rounded-xl border-primary text-primary px-6"
                             >
                               Lihat Semua Status
                             </Button>
                             {showArchivedTasks && (
                               <Button 
                                 variant="outline" 
                                 size="sm" 
                                 onClick={() => setShowArchivedTasks(false)}
                                 className="text-[9px] font-black uppercase tracking-widest rounded-xl px-6"
                               >
                                 Lihat Tugas Aktif
                               </Button>
                             )}
                          </div>
                        )}
                      </div>
                    ) : (
                      <AnimatePresence mode="popLayout">
                      {sortedAndFilteredTasks.map((task) => (
                        <motion.div 
                          key={task.id}
                          layout
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                          transition={{ duration: 0.25 }}
                        >
                        <TaskCard
                          task={task}
                          isAdmin={isAdmin}
                          currentUserEmail={user?.email}
                          onUpdateStatus={handleUpdateTaskStatus}
                          onDelete={handleDeleteTask}
                          onArchive={handleArchiveTask}
                          uploadingPhoto={isUploadingRealization[task.id]}
                          localRealizationPhotos={realizationPhotos[task.id] || []}
                          onUploadPhoto={(e: any) => handleTaskRealizationUpload(e, task.id)}
                          onClearLocalPhotos={() => setRealizationPhotos(prev => ({ ...prev, [task.id]: [] }))}
                        />
                      </motion.div>
                    ))}
                    </AnimatePresence>
                    )}
                  </div>
                </div>
              )}

              {activeTab === "workers" && isSuperAdmin && (
                <div className="space-y-8">
                  <div className="flex items-center justify-between bg-muted/30 p-6 rounded-[2rem] border border-border">
                    <div className="flex items-center gap-4">
                      <div className="bg-amber-500/10 p-3 rounded-2xl">
                        <Smartphone className="w-6 h-6 text-amber-500" />
                      </div>
                      <div>
                        <h2 className="text-xl font-black italic uppercase">Mapping Unit & Pelaksana</h2>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-black">Konfigurasi Akses Pegawai & Login Gateway</p>
                      </div>
                    </div>
                    <Button onClick={() => openWorkerModal()} className="bg-amber-500 hover:bg-amber-600 rounded-2xl">
                      Tambah Pegawai
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {workers.map(w => (
                      <WorkerCard 
                        key={w.id} 
                        worker={w} 
                        onDelete={handleDeleteWorker} 
                        onEdit={() => openWorkerModal(w)} 
                        isSuperAdmin={isSuperAdmin}
                        onCashAdvance={() => {
                          setCashAdvanceWorker({ email: w.email || '', name: w.name });
                          setIsCashAdvanceModalOpen(true);
                        }}
                      />
                    ))}
                    {workers.length === 0 && (
                      <div className="col-span-full py-24 text-center opacity-20 flex flex-col items-center">
                        <UserPlus className="w-16 h-16 mb-6" />
                        <span className="text-xs font-black uppercase tracking-[0.5em]">Personel Database Empty</span>
                      </div>
                    )}
                  </div>

                  <div className="pt-12 border-t border-border">
                    <div className="flex items-center gap-3 mb-8">
                       <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_#10b981]" />
                       <h3 className="text-sm font-black uppercase italic tracking-widest">Sesi Aktif Real-time</h3>
                       <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">{activeSessions.length} Online</Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                       {activeSessions.map(s => {
                         const worker = workers.find(w => w.employeeId === s.email?.split('@')[0] || w.email === s.email);
                         return (
                           <Card key={s.id} className="p-4 bg-muted/20 border-border group hover:border-emerald-500/50 transition-all">
                              <div className="flex items-center gap-3">
                                 <div className="w-10 h-10 bg-emerald-500/10 rounded-full flex items-center justify-center text-emerald-500">
                                    <Smartphone className="w-5 h-5" />
                                 </div>
                                 <div className="flex-1 min-w-0">
                                    <h4 className="text-[10px] font-black uppercase truncate">{worker?.name || s.email}</h4>
                                    <p className="text-[8px] font-bold text-muted-foreground uppercase">{s.email}</p>
                                 </div>
                              </div>
                              <div className="mt-4 flex items-center justify-between">
                                 <div className="flex flex-col">
                                    <span className="text-[6px] font-black uppercase text-muted-foreground">Login Sejak</span>
                                    <span className="text-[8px] font-bold">{new Date(s.lastActive).toLocaleTimeString()}</span>
                                 </div>
                                 <Badge variant="ghost" className="text-[7px] font-black italic bg-emerald-500/5 text-emerald-600">LIVE</Badge>
                              </div>
                           </Card>
                         )
                       })}
                       {activeSessions.length === 0 && (
                         <div className="col-span-full py-12 text-center bg-muted/10 rounded-3xl border border-dashed border-border">
                            <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Tidak ada sesi aktif saat ini</p>
                         </div>
                       )}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "geofence" && isAdmin && (
                <div className="space-y-8">
                  <div className="flex items-center justify-between bg-muted/30 p-6 rounded-[2rem] border border-border">
                    <div className="flex items-center gap-4">
                      <div className="bg-primary/10 p-3 rounded-2xl">
                        <MapPin className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <h2 className="text-xl font-black italic uppercase">Geofencing & Lokasi Login</h2>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-black">Pengaturan Radius Izin Login Petugas Lapangan</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {workers.map(w => (
                      <GeofenceCard key={w.id} worker={w} onEdit={() => openWorkerModal(w)} />
                    ))}
                    {workers.length === 0 && (
                      <div className="col-span-full py-24 text-center opacity-20 flex flex-col items-center">
                        <MapPin className="w-16 h-16 mb-6" />
                        <span className="text-xs font-black uppercase tracking-[0.5em]">No Personnel to Map</span>
                      </div>
                    )}
                  </div>

                  <div className="p-8 bg-amber-500/5 border border-amber-500/20 rounded-[2rem] flex items-start gap-4">
                     <AlertCircle className="w-6 h-6 text-amber-500 shrink-0" />
                     <div>
                        <h4 className="text-xs font-black uppercase italic text-amber-600 mb-1">Catatan Penting</h4>
                        <p className="text-[10px] font-medium text-amber-700/70 leading-relaxed uppercase">
                           Pastikan koordinat yang dimasukkan akurat. Petugas tidak akan bisa masuk ke sistem jika berada di luar radius yang ditentukan (GPS akan divalidasi saat tombol 'Launch Sesi' ditekan).
                        </p>
                     </div>
                  </div>
                </div>
              )}

               {activeTab === "activity" && (
                <div className="space-y-8">
                  <div className="flex flex-col md:flex-row md:items-center justify-between bg-card p-6 rounded-[2rem] border border-border gap-4 shadow-sm">
                    <div className="flex items-center gap-4">
                      <div className="bg-primary/10 p-3 rounded-2xl">
                        <Activity className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <h2 className="text-xl font-black italic uppercase tracking-tighter">Timeline Aktivitas</h2>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-black">Riwayat Real-time Operasional Proyek</p>
                      </div>
                    </div>
                  </div>

                  <div className="max-w-4xl mx-auto space-y-6">
                    {activities.length === 0 ? (
                      <div className="py-24 text-center opacity-30">
                        <Activity className="w-16 h-16 mx-auto mb-4" />
                        <p className="text-xs font-black uppercase tracking-widest italic">Belum ada rekaman aktivitas</p>
                      </div>
                    ) : (
                      <div className="relative border-l-2 border-border/50 ml-4 pl-8 space-y-8 h-[600px] overflow-y-auto pr-4 custom-scrollbar">
                        {activities.map((act) => (
                          <div key={act.id} className="relative">
                            <div className="absolute -left-[41px] top-4 w-4 h-4 bg-background border-2 border-primary rounded-full z-10" />
                            <div className="bg-card border border-border/50 p-6 rounded-[2rem] shadow-sm hover:shadow-md transition-all">
                              <div className="flex justify-between items-start mb-2">
                                <div className="flex items-center gap-2">
                                  <div className={cn(
                                    "px-2 py-0.5 rounded-full text-[8px] font-black italic uppercase text-white",
                                    act.type === 'incident' ? 'bg-rose-500' : 
                                    act.type === 'project' ? 'bg-blue-500' :
                                    act.type === 'task' ? 'bg-amber-500' : 'bg-emerald-500'
                                  )}>
                                    {act.type}
                                  </div>
                                  <span className="text-[10px] font-black italic opacity-60 text-primary uppercase">{act.action}</span>
                                </div>
                                <span className="text-[9px] font-bold text-muted-foreground">{new Date(act.timestamp).toLocaleString('id-ID')}</span>
                              </div>
                              <h4 className="text-sm font-black italic uppercase mb-1">{act.title}</h4>
                              <p className="text-[11px] text-muted-foreground leading-relaxed italic mb-3">"{act.description}"</p>
                              <div className="flex items-center justify-between pt-2 border-t border-border/50">
                                <div className="flex items-center gap-2">
                                  <div className="w-5 h-5 bg-primary/20 rounded-full flex items-center justify-center text-[8px] font-black text-primary">
                                    {act.userEmail?.[0].toUpperCase()}
                                  </div>
                                  <span className="text-[9px] font-medium text-muted-foreground">{act.userEmail}</span>
                                </div>
                                {act.projectId && projects.find(p => p.id === act.projectId) && (
                                  <Badge variant="ghost" className="text-[8px] font-black uppercase text-muted-foreground">
                                    PROYEK: {projects.find(p => p.id === act.projectId)?.name}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === "analytics" && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="flex flex-col md:flex-row md:items-center justify-between bg-card p-6 rounded-[2rem] border border-border gap-4 shadow-sm">
                    <div className="flex items-center gap-4">
                      <div className="bg-primary/10 p-3 rounded-2xl">
                        <BarChart3 className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <h2 className="text-xl font-black italic uppercase tracking-tighter">Analitik Data</h2>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-black">Rekapitulasi Harian Proyek</p>
                      </div>
                    </div>
                  </div>

                  <Card className="p-8 rounded-[2.5rem] border border-border/50 bg-card overflow-hidden">
                    <div className="flex items-center justify-between mb-6">
                       <h3 className="text-sm font-black uppercase tracking-widest">Volume Harian</h3>
                       {isLoadingAnalytics && <RefreshCw className="w-4 h-4 animate-spin text-muted-foreground" />}
                    </div>
                    <div className="h-[300px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={globalTimeData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                          <XAxis dataKey="date" tick={{fontSize: 10}} tickMargin={10} axisLine={false} tickLine={false} />
                          <YAxis tick={{fontSize: 10}} axisLine={false} tickLine={false} />
                          <Tooltip 
                            contentStyle={{ borderRadius: '1rem', border: '1px solid var(--border)', backgroundColor: 'var(--card)' }}
                            labelStyle={{ fontWeight: 900, marginBottom: '0.5rem' }}
                          />
                          <Bar dataKey="tonase" name="Tonase (t)" fill="#10B981" radius={[4, 4, 0, 0]} />
                          <Bar dataKey="volume" name="Volume (m³)" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                          <Bar dataKey="units" name="Unit/Pcs" fill="#F59E0B" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </Card>
                </div>
              )}

              {activeTab === "hse" && (
                <div className="space-y-8">
                  <div className="flex flex-col md:flex-row md:items-center justify-between bg-muted/30 p-6 rounded-[2rem] border border-border gap-4">
                    <div className="flex items-center gap-4">
                      <div className="bg-emerald-500/10 p-3 rounded-2xl">
                        <ShieldCheck className="w-6 h-6 text-emerald-500" />
                      </div>
                      <div>
                        <h2 className="text-xl font-black italic uppercase">Modul Keselamatan (HSE)</h2>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-black">Standar Keselamatan Kerja Internasional</p>
                      </div>
                    </div>
                    {!isAdmin && (
                      <div className="flex flex-wrap gap-2">
                         <Button onClick={() => setIsApdModalOpen(true)} className="bg-amber-600 hover:bg-amber-700 rounded-2xl h-12 shadow-lg shadow-amber-500/20 text-[10px] sm:text-sm">
                            Inspeksi APD
                         </Button>
                         <Button onClick={() => setIsHseModalOpen(true)} className="bg-emerald-600 hover:bg-emerald-700 rounded-2xl h-12 shadow-lg shadow-emerald-500/20 text-[10px] sm:text-sm">
                            Checklist K3
                         </Button>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* HSE Analytics & Info */}
                    <Card className="p-8 rounded-[2rem] bg-background/40 border-border">
                       <h3 className="text-sm font-black uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                         <Activity className="w-4 h-4 text-primary" /> Statistik K3 Proyek
                       </h3>
                       <div className="grid grid-cols-2 gap-4">
                          <div className="bg-muted/30 p-4 rounded-2xl border border-border">
                             <p className="text-[10px] font-black uppercase text-muted-foreground mb-1">Checklist Selesai</p>
                             <p className="text-2xl font-black italic">{hseLogs.length}</p>
                          </div>
                          <div className="bg-rose-500/5 p-4 rounded-2xl border border-rose-500/20">
                             <p className="text-[10px] font-black uppercase text-rose-500 mb-1">Total Insiden</p>
                             <p className="text-2xl font-black italic text-rose-500">{incidents.length}</p>
                          </div>
                       </div>
                       
                       <div className="mt-8 p-6 bg-primary/5 rounded-3xl border border-primary/10">
                          <h4 className="text-[10px] font-black uppercase tracking-widest mb-3">Health & Safety Policy</h4>
                          <p className="text-[10px] leading-relaxed text-muted-foreground italic">
                            "Keselamatan adalah prioritas utama setiap personil di lapangan. PT. Shaka Anugerah Karya berkomitmen untuk Zero Accident dalam setiap fase operasional."
                          </p>
                       </div>
                    </Card>

                    {/* Incident Reports Card */}
                    <Card className="p-8 rounded-[2rem] bg-background/40 border-border overflow-hidden">
                       <div className="flex items-center justify-between mb-6">
                          <h3 className="text-sm font-black uppercase tracking-[0.2em] flex items-center gap-2">
                            <History className="w-4 h-4 text-rose-500" /> Riwayat Insiden & SOS
                          </h3>
                          {!isAdmin && (
                            <Button onClick={() => setIsIncidentModalOpen(true)} variant="outline" size="sm" className="h-8 text-[8px] font-bold uppercase rounded-full">
                              Lapor Insiden
                            </Button>
                          )}
                       </div>
                       
                       <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                          {incidents.length === 0 ? (
                            <div className="py-12 text-center opacity-30 text-[10px] font-bold uppercase tracking-widest italic">Belum ada laporan insiden</div>
                          ) : (
                            incidents.map(inc => (
                              <div key={inc.id} className={cn("p-4 rounded-2xl border flex items-center justify-between", 
                                inc.status === 'open' ? "bg-rose-500/5 border-rose-500/20" : "bg-muted/20 border-border")}>
                                 <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                       <Badge variant={inc.type === 'emergency' ? 'destructive' : 'outline'} className="text-[8px] font-black italic uppercase">
                                          {inc.type}
                                       </Badge>
                                       <span className="text-[10px] font-black italic opacity-50">{new Date(inc.timestamp).toLocaleTimeString()}</span>
                                    </div>
                                    <p className="text-[10px] font-bold line-clamp-2">{inc.description}</p>
                                    <p className="text-[8px] text-muted-foreground">{inc.userEmail}</p>
                                 </div>
                                 {isAdmin && inc.status === 'open' && (
                                   <Button size="sm" onClick={() => handleResolveIncident(inc.id)} className="h-8 px-4 rounded-xl text-[8px] font-black bg-rose-500 hover:bg-rose-600">Solve</Button>
                                 )}
                              </div>
                            ))
                          )}
                       </div>
                    </Card>

                    {/* APD Reports Card */}
                    <Card className="p-8 rounded-[2rem] bg-background/40 border-border overflow-hidden">
                       <div className="flex items-center justify-between mb-6">
                          <h3 className="text-sm font-black uppercase tracking-[0.2em] flex items-center gap-2">
                            <History className="w-4 h-4 text-amber-500" /> Riwayat Inspeksi APD
                          </h3>
                       </div>
                       
                       <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                          {apdChecks.length === 0 ? (
                            <div className="py-12 text-center opacity-30 text-[10px] font-bold uppercase tracking-widest italic">Belum ada inspeksi APD</div>
                          ) : (
                            apdChecks.map(apd => (
                              <div key={apd.id} className={cn("p-4 rounded-2xl border flex items-center justify-between", 
                                apd.status === 'Tidak Lengkap' ? "bg-amber-500/5 border-amber-500/20" : "bg-muted/20 border-border")}>
                                 <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                       <Badge variant={apd.status === 'Lengkap' ? 'outline' : 'destructive'} className={cn("text-[8px] font-black italic uppercase", apd.status === 'Lengkap' && "text-emerald-500 border-emerald-500/50")}>
                                          {apd.status}
                                       </Badge>
                                       <span className="text-[10px] font-black italic opacity-50">{new Date(apd.timestamp).toLocaleTimeString()}</span>
                                    </div>
                                    <p className="text-[10px] font-bold line-clamp-1">{apd.notes || "Tidak ada catatan"}</p>
                                    <p className="text-[8px] text-muted-foreground">{apd.userName}</p>
                                 </div>
                                 {apd.photo && (
                                    <div className="w-10 h-10 rounded-xl overflow-hidden shrink-0 border border-border">
                                       <img src={apd.photo} alt="APD" className="w-full h-full object-cover" />
                                    </div>
                                 )}
                              </div>
                            ))
                          )}
                       </div>
                    </Card>
                  </div>
                </div>
              )}

               {activeTab === "equipment" && (
                 <div className="space-y-8 animated fadeIn">
                   <div className="flex flex-col md:flex-row md:items-center justify-between bg-card p-6 rounded-[2rem] border border-border gap-4 shadow-sm">
                     <div className="flex items-center gap-4">
                       <div className="bg-amber-500/10 p-3 rounded-2xl">
                         <Wrench className="w-6 h-6 text-amber-500" />
                       </div>
                       <div>
                         <h2 className="text-xl font-black italic uppercase tracking-tighter">Manajemen Alat & Material</h2>
                         <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-black">Status Ketersediaan & Pengajuan</p>
                       </div>
                     </div>
                     {!isAdmin && (
                       <Button onClick={() => setIsEqRequestModalOpen(true)} className="bg-amber-500 hover:bg-amber-600 rounded-2xl h-12 shadow-lg shadow-amber-500/20 text-white font-black italic px-8 transition-all hover:scale-105 active:scale-95">
                          Ajukan Alat / Lapor Rusak
                       </Button>
                     )}
                   </div>

                   {isAdmin ? (
                     <div className="grid gap-6">
                       <div className="flex items-center justify-between">
                         <h3 className="text-sm font-black uppercase tracking-[0.2em] flex items-center gap-2">
                           <History className="w-4 h-4 text-amber-500" /> Antrian Pengajuan ({equipmentRequests.filter(r => r.status === 'pending' || r.status === 'in-process').length})
                         </h3>
                         <div className="flex gap-2">
                            <Badge variant="warning">{equipmentRequests.filter(r => r.status === 'pending').length} Pending</Badge>
                            <Badge variant="info">{equipmentRequests.filter(r => r.status === 'in-process').length} Proses</Badge>
                         </div>
                       </div>
                       
                       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                         {equipmentRequests.length === 0 ? (
                           <div className="col-span-full py-16 text-center border-2 border-dashed border-border rounded-[3rem] opacity-30 italic text-xs font-bold uppercase tracking-widest">
                             Belum ada antrian pengajuan
                           </div>
                         ) : (
                           equipmentRequests
                             .sort((a,b) => b.timestamp - a.timestamp)
                             .map((req) => (
                             <EquipmentRequestCard 
                               key={req.id} 
                               req={req} 
                               isAdmin={true} 
                               onUpdateStatus={handleUpdateEquipmentRequestStatus} 
                               onDelete={handleDeleteEquipmentRequest}
                               onReject={(id) => {
                                 setRejectId(id);
                                 setRejectReason("");
                                 setIsRejectModalOpen(true);
                               }}
                             />
                           ))
                         )}
                       </div>
                     </div>
                   ) : (
                     <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <Card className="p-8 rounded-[3rem] bg-card/40 border-border">
                           <h3 className="text-sm font-black uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                             <Clock className="w-4 h-4 text-amber-500" /> Riwayat Pengajuan Anda
                           </h3>
                           <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                              {equipmentRequests.filter(r => r.userId === user?.uid).length === 0 ? (
                                <div className="py-12 text-center opacity-30 text-[10px] font-bold uppercase tracking-widest italic">
                                  Anda belum pernah membuat pengajuan alat
                                </div>
                              ) : (
                                equipmentRequests
                                  .filter(r => r.userId === user?.uid)
                                  .sort((a, b) => b.timestamp - a.timestamp)
                                  .map(req => (
                                    <EquipmentRequestCard 
                                      key={req.id} 
                                      req={req} 
                                      isAdmin={false} 
                                      onDelete={req.status === 'pending' || isAdmin ? handleDeleteEquipmentRequest : undefined}
                                      onReject={() => {}} 
                                    />
                                  ))
                              )}
                           </div>
                        </Card>

                        <div className="space-y-6">
                          <Card className="p-8 rounded-[3rem] bg-amber-500/5 border-amber-500/10 h-fit">
                             <div className="flex items-center gap-3 mb-6">
                                <AlertCircle className="w-5 h-5 text-amber-600" />
                                <h4 className="text-[10px] font-black uppercase tracking-widest text-amber-800">SOP Pelaporan Sarana</h4>
                             </div>
                             <div className="space-y-4">
                                {[
                                  { t: 'Pengecekan Rutin', d: 'Lakukan pengecekan alat setiap pagi sebelum memulai shift melalui menu HSE.' },
                                  { t: 'Lapor Segera', d: 'Kerusakan alat saat bekerja wajib segera dilaporkan untuk menghindari kendala produksi.' },
                                  { t: 'Dokumentasi', d: 'Lampirkan foto kerusakan yang jelas agar admin dapat memproses perbaikan lebih cepat.' }
                                ].map((item, i) => (
                                  <div key={i} className="flex gap-3">
                                     <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                                     <div>
                                        <p className="text-[11px] font-black uppercase text-amber-900">{item.t}</p>
                                        <p className="text-[10px] text-amber-700 leading-relaxed italic">{item.d}</p>
                                     </div>
                                  </div>
                                ))}
                             </div>
                          </Card>
                          
                          {currentProject?.requiredTools && (
                            <Card className="p-8 rounded-[3rem] bg-card/60 border-border">
                              <h3 className="text-[10px] font-black uppercase tracking-widest mb-6">Daftar Alat Wajib Proyek</h3>
                              <div className="flex flex-wrap gap-2">
                                {currentProject.requiredTools.map(t => (
                                  <div key={t} className="bg-muted px-4 py-2 rounded-xl text-[10px] font-black uppercase border border-border">
                                    {t}
                                  </div>
                                ))}
                              </div>
                            </Card>
                          )}
                        </div>
                     </div>
                   )}
                 </div>
               )}

              {activeTab === "messages" && (
                <div className="max-w-2xl mx-auto">
                  <ChatInterface
                    messages={chatMessages}
                    currentUser={user!}
                    isAdmin={isAdmin}
                    onSendMessage={handleSendMessage}
                    isUploading={isUploadingMsgPhoto}
                    onUploadPhoto={async (e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setIsUploadingMsgPhoto(true);
                        const res = await compressImage(file);
                        setMsgPhoto(res);
                        setIsUploadingMsgPhoto(false);
                      }
                    }}
                    msgPhoto={msgPhoto}
                    setMsgPhoto={setMsgPhoto}
                    msgContent={msgContent}
                    setMsgContent={setMsgContent}
                    msgReceiver={msgReceiver}
                    setMsgReceiver={setMsgReceiver}
                    workers={workers}
                  />
                </div>
              )}

               {activeTab === "access" && isAdmin && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="bg-amber-500/10 p-8 rounded-[2.5rem] border border-amber-500/20">
                    <div className="flex items-center gap-6 mb-8">
                       <div className="bg-amber-500 p-4 rounded-3xl shadow-xl shadow-amber-500/20">
                          <Key className="w-8 h-8 text-white" />
                       </div>
                       <div>
                          <h3 className="text-2xl font-black italic uppercase tracking-tighter">Manajemen Akses Pelaksana</h3>
                          <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold opacity-70">Generate & Monitor Kunci Sandi OTP (One-Time Password)</p>
                       </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                      <Card className="p-8 rounded-[2.5rem] bg-card/60 backdrop-blur-xl border-border flex flex-col justify-between shadow-2xl">
                         <div>
                            <div className="flex items-center gap-2 mb-6">
                               <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                               <h4 className="text-[10px] font-black uppercase tracking-widest opacity-70">Konfigurasi Login</h4>
                            </div>
                            <div className="space-y-4">
                               <div className="bg-background/60 p-5 rounded-2xl border border-border/50">
                                  <p className="text-[9px] font-black uppercase text-muted-foreground mb-1">Email Target</p>
                                  <p className="text-xs font-bold text-primary">pelaksana.shaka@gmail.com</p>
                               </div>
                               <div className="bg-background/60 p-5 rounded-2xl border border-border/50">
                                  <p className="text-[9px] font-black uppercase text-muted-foreground mb-1">Sistem Keamanan</p>
                                  <p className="text-xs font-bold text-amber-500 uppercase italic">Multi-Factor OTP</p>
                               </div>
                            </div>
                         </div>
                         <div className="mt-8 pt-8 border-t border-border/50">
                            <div className="mb-4">
                               <p className="text-[9px] font-black uppercase text-muted-foreground mb-2 px-1">Atur Kunci Manual (Opsional)</p>
                               <input 
                                 type="text" 
                                 id="customKeyInput"
                                 placeholder="Contoh: 123456"
                                 className="w-full bg-background/50 border border-border/50 rounded-xl px-4 py-3 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                                 maxLength={10}
                               />
                            </div>
                            <Button 
                              onClick={() => {
                                const input = document.getElementById('customKeyInput') as HTMLInputElement;
                                generatePelaksanaKey(input?.value);
                                if (input) input.value = '';
                              }}
                              className="w-full h-16 bg-amber-500 hover:bg-amber-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-[0_10px_30px_rgba(245,158,11,0.3)] group transition-all active:scale-95"
                            >
                               <RefreshCw className="mr-3 w-5 h-5 group-hover:rotate-180 transition-transform duration-700" />
                               Update Kunci Akses
                            </Button>
                            <p className="text-[8px] text-center mt-4 text-muted-foreground uppercase font-black tracking-tighter opacity-60">Kosongkan kolom untuk kode otomatis</p>
                         </div>
                      </Card>

                      <div className="lg:col-span-2 space-y-8">
                        <Card className="p-10 rounded-[3rem] border-primary/30 bg-primary/5 min-h-[220px] flex items-center justify-center relative overflow-hidden group">
                           <div className="absolute -top-10 -right-10 p-8 opacity-5 group-hover:rotate-12 transition-transform duration-700">
                              <ShieldCheck size={200} className="text-primary" />
                           </div>
                           <div className="text-center relative z-10">
                              <p className="text-[12px] font-black uppercase tracking-[0.5em] mb-6 opacity-40">Kunci Aktif Saat Ini</p>
                              {activeAccessKeys.find(k => k.status === 'active') ? (
                                <div className="space-y-6">
                                  <div className="relative inline-block">
                                    <h2 className="text-8xl font-black italic tracking-tighter text-primary drop-shadow-2xl animate-in zoom-in spin-in-1 duration-1000">
                                      {activeAccessKeys.find(k => k.status === 'active').password}
                                    </h2>
                                    <div className="absolute -inset-4 bg-primary/10 blur-3xl -z-10 rounded-full" />
                                  </div>
                                  <div className="flex items-center justify-center gap-3">
                                    <div className="flex gap-1">
                                      {[1,2,3].map(i => <div key={i} className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: `${i*0.2}s` }} />)}
                                    </div>
                                    <p className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em]">
                                      Ready for deployment
                                    </p>
                                  </div>
                                </div>
                              ) : (
                                <div className="space-y-6 opacity-30">
                                  <h2 className="text-5xl font-black italic tracking-tighter uppercase">
                                    TIDAK ADA KUNCI
                                  </h2>
                                  <div className="w-16 h-1 w-full max-w-[200px] mx-auto bg-rose-500/20 rounded-full overflow-hidden">
                                     <div className="w-1/3 h-full bg-rose-500 animate-[loading_2s_infinite_linear]" />
                                  </div>
                                  <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest">
                                    Silakan Generate Untuk Akses Pelaksana
                                  </p>
                                </div>
                              )}
                           </div>
                        </Card>

                        <div className="bg-card/40 rounded-[2.5rem] p-8 border border-border/50 shadow-inner">
                           <div className="flex items-center justify-between mb-6">
                              <h5 className="text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-3 opacity-60">
                                <History className="w-4 h-4" /> 
                                Riwayat Penggunaan
                              </h5>
                              <span className="text-[8px] font-black text-muted-foreground uppercase bg-muted px-3 py-1 rounded-full italic">3 Key Terakhir</span>
                           </div>
                           <div className="grid grid-cols-1 gap-4">
                              {activeAccessKeys
                                .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
                                .filter(k => k.status !== 'active')
                                .slice(0, 3)
                                .map((key) => (
                                  <div key={key.id} className="flex items-center justify-between p-5 bg-background/40 hover:bg-background/80 rounded-2xl border border-border/30 transition-all group">
                                     <div className="flex items-center gap-6">
                                        <div className="w-12 h-12 rounded-xl bg-muted/50 flex items-center justify-center group-hover:bg-primary/5 transition-colors">
                                           <span className="text-sm font-black italic text-muted-foreground group-hover:text-primary transition-colors">{key.password}</span>
                                        </div>
                                        <div>
                                           <span className={cn(
                                             "text-[8px] font-black uppercase px-3 py-1 rounded-full inline-block mb-1",
                                             key.status === 'used' ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500"
                                           )}>
                                             {key.status === 'used' ? 'Sudah Terpakai' : 'Kadaluarsa'}
                                           </span>
                                           <p className="text-[9px] font-bold text-muted-foreground/60 uppercase">Created: {new Date(key.createdAt).toLocaleDateString()} {new Date(key.createdAt).toLocaleTimeString()}</p>
                                        </div>
                                     </div>
                                     <div className="text-right">
                                       <p className="text-[10px] font-black text-primary italic">
                                          {key.usedAt ? `USED AT ${new Date(key.usedAt).toLocaleTimeString()}` : 'EXPIRED'}
                                       </p>
                                       <span className="text-[8px] text-muted-foreground opacity-40 uppercase font-bold tracking-tighter">Record ID: {key.id.slice(0,8)}</span>
                                     </div>
                                  </div>
                                ))}
                                {activeAccessKeys.filter(k => k.status !== 'active').length === 0 && (
                                   <div className="text-center py-8 opacity-20 italic text-xs font-bold uppercase tracking-widest border-2 border-dashed border-border rounded-3xl">
                                      Belum ada riwayat kunci
                                   </div>
                                )}
                           </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "admin" && isAdmin && (
                <div className="space-y-8">

                   <div className="bg-muted/30 p-6 rounded-[2rem] border border-border">
                    <div className="flex items-center gap-4">
                      <div className="bg-primary/10 p-3 rounded-2xl">
                        <TrendingUp className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <h2 className="text-xl font-black italic uppercase">Analitik Analitik Operasional</h2>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-black">Statistik Penyelesaian & Performa</p>
                      </div>
                    </div>
                  </div>
                  
                  <TaskAnalytics tasks={tasks} workers={workers} />

                  <div className="pt-12 border-t border-border">
                    <AttendanceSettingsCard 
                      settings={attendanceSettings} 
                      onUpdate={handleUpdateAttendanceSettings} 
                    />
                  </div>

                  <div className="pt-12 border-t border-border">
                    <div className="flex items-center gap-4 mb-8">
                       <div className="bg-emerald-500/10 p-3 rounded-2xl">
                          <TrendingUp className="w-6 h-6 text-emerald-500" />
                       </div>
                       <div>
                          <h3 className="text-xl font-black italic uppercase">Estimasi Biaya Operasional</h3>
                          <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-black">Ringkasan Penggunaan Material & Budget</p>
                       </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                       {[
                         { title: 'Asphalt (Hotmix)', val: totals.tonaseCount * 850000, color: 'text-emerald-500', bg: 'bg-emerald-500/5', icon: Activity },
                         { title: 'Penghijauan', val: totals.plantingTotal * 125000, color: 'text-rose-500', bg: 'bg-rose-500/5', icon: Target },
                       ].map((b, i) => (
                         <Card key={i} className={cn("p-6 border-transparent shadow-sm", b.bg)}>
                            <div className="flex items-center justify-between mb-4">
                               <b.icon className={cn("w-5 h-5", b.color)} />
                               <span className="text-[8px] font-black uppercase text-muted-foreground">Estimated Cost</span>
                            </div>
                            <h4 className="text-[10px] font-black uppercase tracking-widest mb-1">{b.title}</h4>
                            <p className={cn("text-xl font-black italic", b.color)}>
                               Rp {b.val.toLocaleString('id-ID')}
                            </p>
                         </Card>
                       ))}
                    </div>

                    <Card className="mt-6 p-8 bg-primary/5 border-primary/20 rounded-[2.5rem]">
                       <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                          <div className="flex items-center gap-4">
                             <div className="w-16 h-16 bg-primary/10 rounded-3xl flex items-center justify-center text-primary">
                                <Database className="w-8 h-8" />
                             </div>
                             <div>
                                <h4 className="text-sm font-black uppercase italic tracking-tighter">Total Akumulasi Biaya Proyek</h4>
                                <p className="text-xs text-muted-foreground">Total estimasi pengeluaran berdasarkan log material operasional di lapangan.</p>
                             </div>
                          </div>
                          <div className="text-center md:text-right">
                             <p className="text-3xl font-black italic text-primary">
                                Rp {(
                                  totals.tonaseCount * 850000 + 
                                  totals.plantingTotal * 125000
                                ).toLocaleString('id-ID')}
                             </p>
                             <p className="text-[8px] font-black uppercase tracking-[0.3em] opacity-50 mt-1">CURRENCY: INDONESIAN RUPIAH (IDR)</p>
                          </div>
                       </div>
                    </Card>
                  </div>



                  <div className="pt-12 border-t border-border">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="bg-rose-500/10 p-3 rounded-2xl">
                         <Trash2 className="w-6 h-6 text-rose-500" />
                      </div>
                      <div>
                         <h3 className="text-xl font-black italic uppercase">Database Maintenance</h3>
                         <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-black">Alat Pembersihan Data Cloud (Hanya Admin)</p>
                      </div>
                    </div>

                    <Card className="p-8 border-rose-500/20 bg-rose-500/5 rounded-[2rem] overflow-hidden relative">
                       <div className="absolute top-0 right-0 p-8 opacity-5">
                          <Trash2 size={120} />
                       </div>
                       <div className="relative z-10 space-y-4">
                          <h4 className="text-sm font-black uppercase tracking-tight text-rose-600 dark:text-rose-400">Pembersihan Pekerjaan Inlet</h4>
                          <p className="text-xs text-muted-foreground max-w-2xl leading-relaxed">
                            Gunakan alat ini untuk menghapus <strong>seluruh data input pekerjaan Inlet</strong> beserta dokumentasinya dari cloud. 
                            Tindakan ini bersifat permanen dan tidak dapat dibatalkan.
                          </p>
                          <div className="flex pt-4">
                             <Button 
                                variant="outline" 
                                onClick={() => {
                                  if(confirm('PERINGATAN: Anda akan menghapus SELURUH data Inlet dan dokumentasinya secara permanen. Lanjutkan?')) {
                                    handleDeleteAllInletData();
                                  }
                                }}
                                className="h-14 px-8 rounded-2xl border-rose-500 text-rose-500 hover:bg-rose-500 hover:text-white transition-all group"
                             >
                                <Trash2 className="w-5 h-5 mr-3 group-hover:animate-pulse" />
                                <span className="text-xs font-black uppercase tracking-widest">Hapus Semua Data Inlet</span>
                             </Button>
                          </div>
                       </div>
                    </Card>
                  </div>
                </div>
              )}

              {activeTab === "settings" && (
                <SettingsView />
              )}
              
              {activeTab === "devmonitor" && isBillingAccount && (
                <DevMonitorTab />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Ergonomic Floating Nav Bar (Mobile) */}
      <footer className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-4 w-full max-w-2xl">
        <nav className="bg-card/80 backdrop-blur-2xl border border-border/50 rounded-[2rem] p-2 flex items-center justify-between shadow-2xl shadow-black/20 overflow-x-auto hide-scrollbar">
          <div className="flex items-center gap-2 px-2 min-w-max">
            {navItems.map((item) => {
              // Unread notifications for specific tabs
              const unreadNotifs = notifications.filter(n => !n.read);
              let unreadCount = 0;
              let notifsToMark: any[] = [];
              
              if (item.id === 'messages') {
                notifsToMark = unreadNotifs.filter(n => n.title.toLowerCase().includes('pesan'));
              } else if (item.id === 'tasks') {
                notifsToMark = unreadNotifs.filter(n => n.title.toLowerCase().includes('tugas'));
              } else if (item.id === 'admin') {
                notifsToMark = unreadNotifs.filter(n => !n.title.toLowerCase().includes('pesan') && !n.title.toLowerCase().includes('tugas'));
              }
              unreadCount = notifsToMark.length;

              // override actions:
              let action = () => {
                notifsToMark.forEach(n => markNotifAsRead(n.id));
                setActiveTab(item.id as any);
              };
              if (item.id === 'messages') action = () => {
                notifsToMark.forEach(n => markNotifAsRead(n.id));
                navigate('/chat');
              };

              const isActive = activeTab === item.id || (window.location.pathname.includes(item.id));
              
              return (
                <button
                  key={item.id}
                  onClick={action}
                  className={cn(
                    "relative flex-col items-center justify-center gap-1 rounded-2xl transition-all duration-300 min-w-[72px] py-3 px-2 flex",
                    isActive ? "bg-primary text-primary-foreground shadow-lg" : "text-muted-foreground hover:bg-muted"
                  )}
                >
                  <div className="relative">
                    <item.icon className={cn("w-5 h-5", isActive ? "scale-110" : "")} />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1.5 -right-1.5 bg-rose-500 text-white text-[7px] font-black w-4 h-4 rounded-full flex items-center justify-center ring-2 ring-background ring-offset-0 animate-bounce">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </div>
                  <span className="text-[8px] font-black uppercase tracking-widest">{item.label}</span>
                  {isActive && (
                    <motion.div layoutId="nav-glow" className="absolute inset-0 bg-primary/20 blur-xl rounded-full -z-10" />
                  )}
                </button>
              );
            })}
          </div>

          <div className="w-px h-8 bg-border mx-2 flex-shrink-0" />
          
          <button
            onClick={handleLogout}
            className="flex-shrink-0 p-4 text-rose-500 hover:bg-rose-500/10 rounded-2xl transition-all ml-1"
            title="Keluar"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </nav>
      </footer>

      {/* SOS EMERGENCY BUTTON (Worker View) */}
      {!isAdmin && user && (
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => handleSendSOS()}
          className="fixed top-28 right-4 z-[60] w-14 h-14 bg-rose-600 text-white rounded-full shadow-[0_4px_20px_rgba(225,29,72,0.6)] flex items-center justify-center border-4 border-white dark:border-slate-900 group"
        >
           <Activity className="w-6 h-6 animate-pulse" />
           <span className="absolute top-16 right-0 bg-rose-600 text-white text-[8px] font-black px-2 py-1 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap uppercase tracking-widest border border-white/20">
             Help / SOS
           </span>
        </motion.button>
      )}

      {/* Quota Block Overlay */}
      <AnimatePresence>
        {isQuotaBlocked && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[500] bg-background/95 backdrop-blur-2xl flex items-center justify-center p-4 text-center"
          >
             <div className="max-w-md w-full bg-card border-2 border-rose-500/20 rounded-[3rem] p-8 shadow-2xl space-y-6">
                <div className="w-20 h-20 bg-rose-500/10 rounded-full flex items-center justify-center mx-auto border border-rose-500/20">
                   <ShieldAlert className="w-10 h-10 text-rose-500" />
                </div>
                <div className="space-y-2">
                   <h2 className="text-2xl font-black italic uppercase text-rose-600 tracking-tighter">Akses Dibatasi</h2>
                   <p className="text-[11px] font-bold text-muted-foreground uppercase leading-relaxed">
                      {quotaBlockedMessage}
                   </p>
                </div>
                <Button onClick={() => handleLogout()} className="w-full h-14 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-black uppercase italic shadow-lg shadow-rose-500/20">
                   Logout & Keluar
                </Button>
                <div className="pt-2 border-t border-border/50">
                  <Button onClick={() => handleForceClearSessions()} variant="outline" className="w-full h-14 rounded-2xl text-muted-foreground hover:text-primary font-bold uppercase text-[10px] tracking-widest border-2">
                    Akhiri Sesi Lain
                  </Button>
                </div>
             </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* HSE Induction Overlay (Removed from startup as per user request) */}
      {/* 
      <AnimatePresence>
        {needsInduction && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-background flex items-center justify-center p-4 overflow-y-auto"
          >
            <div className="max-w-md w-full bg-card border-border border-2 rounded-[3rem] p-8 shadow-2xl relative overflow-hidden">
               <div className="absolute top-0 right-0 p-8 opacity-5">
                  <ShieldCheck size={120} className="text-primary" />
               </div>
               
               <div className="relative z-10 text-center space-y-8">
                  <div className="w-20 h-20 bg-primary/10 rounded-[2rem] flex items-center justify-center mx-auto mb-4 border border-primary/20 rotate-3">
                     <ShieldCheck className="w-10 h-10 text-primary" />
                  </div>
                  
                  <div>
                    <h2 className="text-2xl font-black italic uppercase tracking-tighter leading-none mb-2">Digital Safety Induction</h2>
                    <p className="text-[10px] text-muted-foreground tracking-widest font-black uppercase">Wajib Diisi Sebelum Memulai Shift</p>
                  </div>

                  <div className="space-y-4 text-left">
                    <div className="space-y-3">
                       <HseCheckbox label="Memakai Alat Pelindung Diri (APD) Lengkap" checked={hsePPE} onChange={setHsePPE} />
                       <HseCheckbox label="Peralatan Kerja dalam Kondisi Layak" checked={hseTools} onChange={setHseTools} />
                       <HseCheckbox label="Area Kerja Aman dari Bahaya Lingkungan" checked={hseEnv} onChange={setHseEnv} />
                       <HseCheckbox label="Memahami Prosedur Darurat & Evakuasi" checked={hseInduction} onChange={setHseInduction} />
                    </div>
                  </div>

                  <div className="pt-4">
                     <Button 
                       onClick={async () => {
                         if (!hsePPE || !hseTools || !hseEnv || !hseInduction) {
                           addNotification('Peringatan', 'Semua poin keselamatan harus disetujui.', 'warning');
                           return;
                         }
                         await handleCreateHseLog({
                           ppeCheck: hsePPE,
                           toolCheck: hseTools,
                           environmentCheck: hseEnv,
                           inductionConfirmed: hseInduction
                         });
                       }}
                       className="w-full h-16 rounded-2xl font-black uppercase tracking-widest italic"
                     >
                       Mulai Shift Sekarang
                     </Button>
                     <p className="text-[8px] text-muted-foreground mt-4 italic uppercase">
                       Dengan menekan tombol di atas, Anda menyatakan telah melakukan pengecekan mandiri dan siap bekerja dengan aman.
                     </p>
                  </div>
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      */}

      {/* Modals */}
      <Modal isOpen={isHseModalOpen} onClose={() => setIsHseModalOpen(false)}>
        <div className="p-8 space-y-6">
           <div className="text-center">
              <h3 className="text-2xl font-black italic uppercase tracking-tighter">Checklist K3 Lapangan</h3>
              <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">Self-Assessment Keselamatan Kerja</p>
           </div>
           <div className="space-y-4">
              <HseCheckbox label="Personil Memakai Rompi & Helm Safety" checked={hsePPE} onChange={setHsePPE} />
              <HseCheckbox label="Area Kerja Sudah Terpasang Safety Cone" checked={hseTools} onChange={setHseTools} />
              <HseCheckbox label="Peralatan Mekanik/Manual Layak Pakai" checked={hseEnv} onChange={setHseEnv} />
              
              {currentProject?.requiredTools && currentProject.requiredTools.length > 0 && (
                <div className="pt-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Kesiapan Alat Kerja ({currentProject.type})</label>
                  <div className="mt-2 space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                    {currentProject.requiredTools.map((tool) => (
                      <div key={tool} className="flex items-center gap-3 p-3 bg-muted/10 rounded-xl border border-border/50">
                        <button 
                          onClick={() => {
                            if (checkedTools.includes(tool)) {
                              setCheckedTools(checkedTools.filter(t => t !== tool));
                            } else {
                              setCheckedTools([...checkedTools, tool]);
                            }
                          }}
                          className={cn(
                            "w-5 h-5 rounded-md border flex items-center justify-center transition-all",
                            checkedTools.includes(tool) ? "bg-primary border-primary text-primary-foreground" : "border-muted-foreground/30"
                          )}
                        >
                          {checkedTools.includes(tool) && <Check className="w-3.5 h-3.5" />}
                        </button>
                        <span className="text-[11px] font-bold uppercase">{tool}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <Button 
                variant="outline" 
                className="w-full h-10 rounded-xl border-dashed border-2 hover:bg-rose-500/5 hover:text-rose-500 hover:border-rose-500/20 text-[10px] font-black uppercase tracking-widest gap-2"
                onClick={() => setIsEqRequestModalOpen(true)}
              >
                <Wrench className="w-3.5 h-3.5" />
                Lapor Alat Kurang/Rusak
              </Button>
              
              <div className="pt-4 space-y-3">
                 <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Foto Bukti Kelengkapan K3</label>
                 <div className="flex gap-4">
                    <div 
                      onClick={() => document.getElementById('hsePhotoInput')?.click()}
                      className="w-24 h-24 bg-muted/20 border-2 border-dashed border-border rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:bg-muted/40 transition-all shrink-0"
                    >
                       {hsePhoto ? (
                         <img src={hsePhoto} className="w-full h-full object-cover rounded-2xl" alt="K3 Proof" />
                       ) : (
                         <>
                            <Camera className="w-6 h-6 text-muted-foreground mb-1" />
                            <span className="text-[8px] font-bold uppercase text-muted-foreground">Ambil Foto</span>
                         </>
                       )}
                    </div>
                    <input 
                       id="hsePhotoInput" 
                       type="file" 
                       accept="image/*" 
                       className="hidden" 
                       capture="environment"
                       onChange={async (e) => {
                         const file = e.target.files?.[0];
                         if (file) {
                           const res = await compressImage(file);
                           setHsePhoto(res);
                         }
                       }}
                    />
                    <div className="flex-1 text-[10px] text-muted-foreground leading-relaxed italic">
                       Ambil foto self-portrait menggunakan APD lengkap di depan objek pengerjaan sebagai bukti otentik.
                    </div>
                 </div>
              </div>
           </div>
           <Button 
             className="w-full h-14 rounded-2xl"
             onClick={async () => {
                if (!hsePPE || !hseTools || !hseEnv || !hsePhoto) {
                  addNotification('Belum Lengkap', 'Penuhi checklist dan lampirkan foto K3.', 'warning');
                  return;
                }
                await handleCreateHseLog({
                  ppeCheck: hsePPE,
                  toolCheck: hseTools,
                  environmentCheck: hseEnv,
                  inductionConfirmed: true,
                  photo: hsePhoto
                });
                setIsHseModalOpen(false);
                setHsePPE(false); setHseTools(false); setHseEnv(false); setHsePhoto("");
             }}
           >
              Verifikasi & Simpan Checklog
           </Button>
        </div>
      </Modal>

      <Modal isOpen={isStartWorkModalOpen} onClose={() => setIsStartWorkModalOpen(false)}>
        <div className="p-8 space-y-6">
           <div className="text-center">
              <h3 className="text-2xl font-black italic uppercase tracking-tighter text-blue-500">Mulai Pekerjaan</h3>
              <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">Konfirmasi Kesiapan APD & Keselamatan Lapangan</p>
           </div>
           
           <div className="space-y-4">
              <HseCheckbox label="Helm Keselamatan Sesuai Standar Dikenakan" checked={safetyChecked.helm} onChange={(v) => setSafetyChecked(p => ({...p, helm: v}))} />
              <HseCheckbox label="Rompi Reflektif Dikenakan" checked={safetyChecked.rompi} onChange={(v) => setSafetyChecked(p => ({...p, rompi: v}))} />
              <HseCheckbox label="Sepatu Safety / Safety Shoes Dikenakan" checked={safetyChecked.sepatu} onChange={(v) => setSafetyChecked(p => ({...p, sepatu: v}))} />
           </div>

           <Button 
                onClick={startWorkSession}
                disabled={!isReadyToWork}
                className={`w-full h-14 rounded-2xl text-[10px] sm:text-xs font-black uppercase tracking-widest shadow-lg ${isReadyToWork ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/20 text-white' : 'bg-muted text-muted-foreground shadow-none'}`}
              >
              Setuju & Mulai Pekerjaan
           </Button>
        </div>
      </Modal>

      <Modal isOpen={isApdModalOpen} onClose={() => setIsApdModalOpen(false)}>
        <div className="p-8 space-y-6">
           <div className="text-center">
              <h3 className="text-2xl font-black italic uppercase tracking-tighter text-amber-500">Inspeksi APD</h3>
              <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">Alat Pelindung Diri & Keselamatan Lapangan</p>
           </div>
           
           <div className="space-y-4">
              <HseCheckbox label="Helm Keselamatan Sesuai Standar" checked={apdForm.helm} onChange={(v) => setApdForm(p => ({...p, helm: v}))} />
              <HseCheckbox label="Rompi Reflektif" checked={apdForm.rompi} onChange={(v) => setApdForm(p => ({...p, rompi: v}))} />
              <HseCheckbox label="Sepatu Safety / Safety Shoes" checked={apdForm.sepatu} onChange={(v) => setApdForm(p => ({...p, sepatu: v}))} />
              <HseCheckbox label="Kacamata Keselamatan (Opsional)" checked={apdForm.kacamata} onChange={(v) => setApdForm(p => ({...p, kacamata: v}))} />
              <HseCheckbox label="Sarung Tangan Kerja" checked={apdForm.sarungTangan} onChange={(v) => setApdForm(p => ({...p, sarungTangan: v}))} />
              <HseCheckbox label="Masker Pernafasan" checked={apdForm.masker} onChange={(v) => setApdForm(p => ({...p, masker: v}))} />
              <HseCheckbox label="Full Body Harness (Pekerjaan Tinggi)" checked={apdForm.harness} onChange={(v) => setApdForm(p => ({...p, harness: v}))} />
           </div>

           <div className="space-y-3">
             <label className="text-[10px] font-black uppercase text-muted-foreground ml-1 tracking-widest transition-colors duration-200">Catatan Kondisi Khusus</label>
             <textarea 
                placeholder="Misal: Rompi sedikit robek, Kacamata baret..."
                value={apdNotes}
                onChange={e => setApdNotes(e.target.value)}
                className="w-full h-24 bg-muted/20 border border-border rounded-xl p-4 text-xs focus:ring-2 ring-primary outline-none transition-shadow duration-300 custom-scrollbar resize-none font-medium"
             />
           </div>

           <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-muted-foreground ml-1 tracking-widest transition-colors duration-200">Foto Bukti Inspeksi (Visual APD Dikenakan)</label>
              <div 
                onClick={() => document.getElementById('apd-photo')?.click()}
                className="w-full h-32 bg-muted/20 border-2 border-dashed border-border rounded-2xl flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-amber-500 hover:bg-amber-500/5 transition-all overflow-hidden relative group"
              >
                 {apdPhoto ? (
                    <img src={apdPhoto} alt="APD Proof" className="w-full h-full object-cover" />
                 ) : (
                   <>
                     <ImageIcon className="w-8 h-8 text-muted-foreground group-hover:text-amber-500 transition-colors" />
                     <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground group-hover:text-amber-500 transition-colors">Ambil / Unggah Selfie APD</span>
                   </>
                 )}
                 <input 
                   id="apd-photo" 
                   type="file" 
                   accept="image/*" 
                   capture="user" 
                   className="hidden"
                   onChange={async (e) => {
                      if (e.target.files && e.target.files[0]) {
                        try {
                           const compressed = await compressImage(e.target.files[0], 800, 800, 0.7);
                           setApdPhoto(compressed);
                        } catch(err) {
                           console.error(err);
                           addNotification('Error', 'Gagal memproses foto', 'warning');
                        }
                      }
                   }}
                 />
              </div>
           </div>

           <Button 
             className="w-full h-14 rounded-2xl font-black uppercase tracking-widest bg-amber-600 hover:bg-amber-500"
             onClick={async () => {
                if (!apdPhoto) {
                   addNotification('Verifikasi Foto', 'Mohon lampirkan foto selfie APD', 'warning');
                   return;
                }
                
                await handleCreateAPDCheck(apdForm, apdNotes, apdPhoto);
                setIsApdModalOpen(false);
                setApdForm({
                  helm: false, rompi: false, sepatu: false, kacamata: false, sarungTangan: false, masker: false, harness: false
                });
                setApdNotes("");
                setApdPhoto("");
             }}
           >
              Kirim Laporan APD
           </Button>
        </div>
      </Modal>

      <Modal isOpen={isIncidentModalOpen} onClose={() => setIsIncidentModalOpen(false)}>
         <div className="p-8 space-y-6">
            <div className="text-center">
              <h3 className="text-2xl font-black italic uppercase tracking-tighter text-rose-500">Lapor Insiden K3</h3>
              <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">Digital Incident Reporting System</p>
            </div>
            <div className="grid grid-cols-2 gap-2">
               <Button variant={incType === 'accident' ? 'destructive' : 'outline'} onClick={() => setIncType('accident')} className="h-10 text-[9px]">Kecelakaan Kerja</Button>
               <Button variant={incType === 'near-miss' ? 'secondary' : 'outline'} onClick={() => setIncType('near-miss')} className="h-10 text-[9px]">Hampir Celaka</Button>
            </div>
            <textarea
               placeholder="Deskripsikan kronologi kejadian secara detail..."
               value={incDesc}
               onChange={e => setIncDesc(e.target.value)}
               className="w-full h-32 bg-background border border-border rounded-2xl p-4 text-xs focus:ring-2 ring-rose-500 outline-none"
            />
            <div className="space-y-3">
               <label className="text-[10px] font-black uppercase text-muted-foreground">Foto Dokumentasi Insiden</label>
               <div 
                 onClick={() => document.getElementById('incPhotoInput')?.click()}
                 className="w-full h-40 bg-rose-500/5 border-2 border-dashed border-rose-500/20 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:bg-rose-500/10 transition-all"
               >
                  {incPhoto ? (
                    <img src={incPhoto} className="w-full h-full object-cover rounded-2xl" alt="Incident" />
                  ) : (
                    <>
                       <Camera className="w-8 h-8 text-rose-500 mb-2 opacity-50" />
                       <span className="text-[10px] font-black uppercase text-rose-500/50">Unggah Foto Kejadian</span>
                    </>
                  )}
               </div>
               <input id="incPhotoInput" type="file" accept="image/*" className="hidden" onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const res = await compressImage(file);
                    setIncPhoto(res);
                  }
               }} />
            </div>
            <Button 
               variant="destructive"
               className="w-full h-14 rounded-2xl"
               onClick={async () => {
                  if (!incDesc) {
                    addNotification('Gagal', 'Berikan deskripsi insiden.', 'warning');
                    return;
                  }
                  await handleReportIncident(incType, incDesc, incPhoto);
                  setIsIncidentModalOpen(false);
                  setIncDesc(""); setIncPhoto("");
                  clearDashboardDrafts();
                  setIncDesc(""); setIncPhoto("");
               }}
            >
               KIRIM LAPORAN INSIDEN
            </Button>
         </div>
      </Modal>

      <Modal isOpen={isWorkerModalOpen} onClose={() => setIsWorkerModalOpen(false)}>
        <div className="p-6 space-y-6">
          <div className="text-center">
            <h3 className="text-2xl font-black italic uppercase tracking-tighter">
              {editingWorkerId ? "Modifikasi Data Pegawai" : "Tambah Pegawai Baru"}
            </h3>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Akses operasional sistem</p>
          </div>
          <div className="space-y-4">
            <Input 
              placeholder="ID Pegawai (Contoh: PKJ-01)" 
              value={wEmpId} 
              onChange={e => setWEmpId(e.target.value)} 
              disabled={!!editingWorkerId}
            />
            <Input placeholder="Nama Lengkap" value={wName} onChange={e => setWName(e.target.value)} />
            {isSuperAdmin && (
              <>
                <Input placeholder="Email Alternatif / Kerja" value={wEmail} onChange={e => setWEmail(e.target.value)} />
                <div className="relative">
                  <Input type={showWPass ? "text" : "password"} placeholder="Password Login" value={wPass} onChange={e => setWPass(e.target.value)} />
                  <button 
                    type="button"
                    onClick={() => setShowWPass(!showWPass)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
                  >
                    {showWPass ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                  </button>
                </div>
              </>
            )}
            <div className="grid grid-cols-2 gap-2">
              <Button variant={wRole === 'field-operator' ? 'primary' : 'outline'} onClick={() => setWRole('field-operator')} className="text-[10px] font-black uppercase tracking-widest">Field Operator</Button>
              <Button variant={wRole === 'admin' ? 'primary' : 'outline'} onClick={() => setWRole('admin')} className="text-[10px] font-black uppercase tracking-widest">Administrator</Button>
            </div>

            <div className="space-y-1">
              <label className="text-[9px] font-black uppercase text-muted-foreground ml-2">Gaji Harian (Rp)</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-black text-muted-foreground">Rp</span>
                <Input 
                  type="number" 
                  placeholder="200000" 
                  value={wDailyRate} 
                  onChange={e => setWDailyRate(e.target.value)} 
                  className="pl-10"
                />
              </div>
            </div>
            <button 
              onClick={() => setWIsPinned(!wIsPinned)}
              className={cn(
                "w-full flex items-center justify-between p-4 rounded-2xl border-2 transition-all",
                wIsPinned ? "border-amber-500/50 bg-amber-500/5" : "border-border bg-transparent opacity-60"
              )}
            >
              <div className="flex items-center gap-3">
                <Star className={cn("w-4 h-4", wIsPinned ? "text-amber-500 fill-amber-500" : "text-muted-foreground")} />
                <span className="text-[10px] font-black uppercase tracking-widest">Pin ke Halaman Login</span>
              </div>
              <div className={cn("w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-all", wIsPinned ? "bg-amber-500 border-amber-500 text-white" : "border-muted-foreground/30")}>
                {wIsPinned && <Check className="w-3 h-3" />}
              </div>
            </button>

            <div className="pt-4 border-t border-border">
               <button 
                  onClick={() => setWGeoEnabled(!wGeoEnabled)}
                  className={cn(
                    "w-full flex items-center justify-between p-4 rounded-2xl border-2 transition-all",
                    wGeoEnabled ? "border-primary/50 bg-primary/5" : "border-border bg-transparent opacity-60"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <MapPin className={cn("w-4 h-4", wGeoEnabled ? "text-primary" : "text-muted-foreground")} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Wajibkan Geofencing Login</span>
                  </div>
                  <div className={cn("w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-all", wGeoEnabled ? "bg-primary border-primary text-white" : "border-muted-foreground/30")}>
                    {wGeoEnabled && <Check className="w-3 h-3" />}
                  </div>
                </button>

                {wGeoEnabled && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="grid grid-cols-2 gap-3 mt-4"
                  >
                    <div className="col-span-2 flex items-center justify-between mb-1 px-2 text-primary">
                      <p className="text-[10px] font-black uppercase tracking-widest">Koordinat Area Izin</p>
                      <button 
                         onClick={() => {
                           if(navigator.geolocation) {
                             navigator.geolocation.getCurrentPosition((pos) => {
                               setWGeoLat(pos.coords.latitude.toFixed(6));
                               setWGeoLng(pos.coords.longitude.toFixed(6));
                             }, (err) => {
                               addNotification('GPS Gagal', 'Gagal mengambil lokasi saat ini.', 'error');
                             });
                           }
                         }}
                         className="flex items-center gap-1.5 hover:scale-105 active:scale-95 transition-all bg-primary/20 p-2 rounded-xl"
                      >
                         <LocateFixed className="w-3 h-3" />
                         <span className="text-[8px] font-black uppercase whitespace-nowrap">Dapatkan Koordinat Anda</span>
                      </button>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[8px] font-black uppercase text-muted-foreground ml-2">Latitude</label>
                      <Input placeholder="-6.1234" value={wGeoLat} onChange={e => setWGeoLat(e.target.value)} className="h-10 text-xs" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[8px] font-black uppercase text-muted-foreground ml-2">Longitude</label>
                      <Input placeholder="106.1234" value={wGeoLng} onChange={e => setWGeoLng(e.target.value)} className="h-10 text-xs" />
                    </div>
                    <div className="col-span-2 space-y-1">
                      <label className="text-[8px] font-black uppercase text-muted-foreground ml-2">Radius Izin (Meter)</label>
                      <Input type="number" placeholder="500" value={wGeoRadius} onChange={e => setWGeoRadius(e.target.value)} className="h-10 text-xs" />
                    </div>
                  </motion.div>
                )}
            </div>
          </div>
          <Button
            className="w-full h-14 rounded-2xl shadow-lg"
            onClick={async () => {
              if(wEmpId && wName && wEmail && wPass) {
                const geo = wGeoEnabled ? {
                  lat: parseFloat(wGeoLat),
                  lng: parseFloat(wGeoLng),
                  radius: parseInt(wGeoRadius),
                  enabled: true
                } : undefined;

                if (editingWorkerId) {
                  await handleUpdateWorker(editingWorkerId, wName, wEmail, wPass, wRole, parseFloat(wDailyRate) || 0, wIsPinned, geo);
                } else {
                  await handleAddWorker(wEmpId, wName, wEmail, wPass, wRole, parseFloat(wDailyRate) || 0, wIsPinned, geo);
                }
                setIsWorkerModalOpen(false);
                setWEmpId(""); setWName(""); setWEmail(""); setWPass("");
                setEditingWorkerId(null);
              } else {
                addNotification("Form Tidak Lengkap", "Harap isi semua kolom.", "warning");
              }
            }}
          >{editingWorkerId ? "Simpan Perubahan" : "Daftarkan Pegawai"}</Button>
        </div>
      </Modal>

      <Modal isOpen={isTaskModalOpen} onClose={() => setIsTaskModalOpen(false)}>
        <div className="p-8 space-y-6">
          <h3 className="text-2xl font-black italic tracking-tighter uppercase">Delegasi Tugas Baru</h3>
          <div className="space-y-4">
            <div className="flex gap-2">
               <button 
                  onClick={() => setTaskPriority('low')}
                  className={cn("flex-1 h-10 rounded-xl text-[10px] font-black uppercase border transition-all", 
                    taskPriority === 'low' ? "bg-emerald-500 text-white border-emerald-500" : "bg-transparent border-border text-muted-foreground")}
               >Low</button>
               <button 
                  onClick={() => setTaskPriority('medium')}
                  className={cn("flex-1 h-10 rounded-xl text-[10px] font-black uppercase border transition-all", 
                    taskPriority === 'medium' ? "bg-amber-500 text-white border-amber-500" : "bg-transparent border-border text-muted-foreground")}
               >Medium</button>
               <button 
                  onClick={() => setTaskPriority('high')}
                  className={cn("flex-1 h-10 rounded-xl text-[10px] font-black uppercase border transition-all", 
                    taskPriority === 'high' ? "bg-rose-500 text-white border-rose-500" : "bg-transparent border-border text-muted-foreground")}
               >High</button>
            </div>
            <Input placeholder="Judul Pekerjaan" value={taskTitle} onChange={e => setTaskTitle(e.target.value)} />
            <Input placeholder="Link Dokumen/File (Drive, OneDrive, dll)" value={taskDocumentUrl} onChange={e => setTaskDocumentUrl(e.target.value)} />
            <textarea
              placeholder="Detail instruksi pengerjaan..."
              value={taskDesc}
              onChange={e => setTaskDesc(e.target.value)}
              className="w-full h-32 bg-background border border-border rounded-xl p-4 text-sm focus:ring-2 ring-primary outline-none"
            />
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-black uppercase text-muted-foreground">Tugaskan Ke (Maksimal 6 Petugas)</label>
                <div className="flex gap-2">
                   <button 
                     onClick={() => {
                       const isMeSelected = taskAssignees.some(a => a.email === user?.email);
                       if (isMeSelected) {
                         setTaskAssignees(prev => prev.filter(a => a.email !== user?.email));
                       } else if (user?.email) {
                         setTaskAssignees(prev => [...prev, { name: user.displayName || 'Me', email: user.email! }]);
                       }
                     }}
                     className={cn("text-[9px] font-black uppercase px-3 py-1 rounded-full border transition-all",
                       taskAssignees.some(a => a.email === user?.email) ? "bg-primary text-white border-primary" : "bg-transparent border-border text-muted-foreground hover:bg-muted"
                     )}
                   >
                     + Saya Sendiri
                   </button>
                </div>
              </div>

              <div className="flex gap-2 mb-2">
                <Input 
                  id="manualEmailInput"
                  placeholder="Link Email Manajer/Pelaksana..."
                  className="h-10 text-[10px] bg-background border-primary/20"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      const val = (e.target as HTMLInputElement).value.trim();
                      if (val) {
                        if (taskAssignees.length >= 6) {
                          addNotification("Batas Petugas", "Maksimal 6 petugas.", "warning");
                          return;
                        }
                        if (taskAssignees.some(a => a.email.toLowerCase() === val.toLowerCase())) {
                           addNotification("Duplikat", "Email sudah terdaftar.", "warning");
                           return;
                        }
                        setTaskAssignees(prev => [...prev, { name: val.split('@')[0], email: val }]);
                        (e.target as HTMLInputElement).value = '';
                      }
                    }
                  }}
                />
                <Button 
                  type="button"
                  variant="outline" 
                  size="sm" 
                  className="h-10 text-[8px] font-black border-primary text-primary"
                  onClick={() => {
                    const input = document.getElementById('manualEmailInput') as HTMLInputElement;
                    const val = input.value.trim();
                    if (val) {
                      if (taskAssignees.length >= 6) {
                        addNotification("Batas Petugas", "Maksimal 6 petugas.", "warning");
                        return;
                      }
                      if (taskAssignees.some(a => a.email.toLowerCase() === val.toLowerCase())) {
                         addNotification("Duplikat", "Email sudah terdaftar.", "warning");
                         return;
                      }
                      setTaskAssignees(prev => [...prev, { name: val.split('@')[0], email: val }]);
                      input.value = '';
                    }
                  }}
                >
                  TAMBAH EMAIL
                </Button>
              </div>
              
              <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto p-1 scrollbar-hide border border-border/50 rounded-2xl bg-muted/20">
                {workers.length === 0 ? (
                  <div className="col-span-2 py-8 text-center flex flex-col items-center justify-center opacity-40">
                    <UserPlus className="w-8 h-8 mb-2" />
                    <p className="text-[10px] font-bold uppercase tracking-widest">Belum ada pekerja terdaftar</p>
                    <p className="text-[8px] font-medium mt-1">Tambahkan di Tab Pekerja untuk delegasi</p>
                  </div>
                ) : (
                  workers.map(w => {
                    const isSelected = taskAssignees.some(a => a.email === w.email);
                    return (
                      <button
                        key={w.id}
                        type="button"
                        onClick={() => {
                          if (isSelected) {
                            setTaskAssignees(prev => prev.filter(a => a.email !== w.email));
                          } else {
                            if (taskAssignees.length >= 6) {
                              addNotification("Batas Petugas", "Maksimal 6 petugas per tugas.", "warning");
                              return;
                            }
                            setTaskAssignees(prev => [...prev, { name: w.name, email: w.email }]);
                          }
                        }}
                        className={cn(
                          "flex flex-col items-start p-3 rounded-xl border text-left transition-all group",
                          isSelected ? "bg-primary text-primary-foreground border-primary shadow-lg scale-[0.98]" : "bg-card border-border hover:border-primary/50"
                        )}
                      >
                        <span className="text-[10px] font-black uppercase truncate w-full">{w.name}</span>
                        <span className={cn("text-[8px] font-bold uppercase opacity-60", isSelected ? "text-white" : "text-muted-foreground")}>{w.employeeId}</span>
                      </button>
                    );
                  })
                )}
              </div>
              {taskAssignees.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-2 border-t border-border/50">
                  {taskAssignees.map(a => (
                    <div key={a.email} className="bg-primary/10 text-primary px-3 py-1 rounded-xl text-[8px] font-black uppercase flex items-center gap-2 border border-primary/20">
                      {a.name}
                      <button 
                        onClick={() => setTaskAssignees(prev => prev.filter(p => p.email !== a.email))}
                        className="hover:text-rose-500"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="space-y-1 mb-4">
              <label className="text-[10px] font-black uppercase text-muted-foreground ml-1 tracking-widest">Batas Waktu (Deadline)</label>
              <Input 
                type="datetime-local" 
                value={taskDueDate} 
                onChange={e => setTaskDueDate(e.target.value)} 
                className="h-12 bg-background border-border/50"
              />
            </div>

            <div className="bg-muted p-4 rounded-2xl border border-dashed border-border mb-4 flex items-center justify-between">
              <span className="text-xs font-bold text-muted-foreground italic">
                {taskPhoto ? "Foto instruksi terpilih" : "Lampiran Foto Opsional"}
              </span>
              <div className="flex gap-2">
                 <label className="w-10 h-10 flex flex-col items-center justify-center bg-background rounded-xl border border-border cursor-pointer hover:bg-secondary transition-all shadow-sm" title="Kamera">
                    <Camera className="w-4 h-4 text-primary mb-0.5" />
                    <span className="text-[6px] font-black uppercase text-primary/80">Kamera</span>
                    <input type="file" className="hidden" accept="image/*" capture="environment" onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if(file) {
                        setIsUploadingTaskPhoto(true);
                        const res = await compressImage(file);
                        setTaskPhoto(res);
                        setIsUploadingTaskPhoto(false);
                      }
                    }} />
                 </label>
                 <label className="w-10 h-10 flex flex-col items-center justify-center bg-background rounded-xl border border-border cursor-pointer hover:bg-secondary transition-all shadow-sm" title="Galeri">
                    <ImageIcon className="w-4 h-4 text-emerald-500 mb-0.5" />
                    <span className="text-[6px] font-black uppercase text-emerald-500/80">Galeri</span>
                    <input type="file" className="hidden" accept="image/*" onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if(file) {
                        setIsUploadingTaskPhoto(true);
                        const res = await compressImage(file);
                        setTaskPhoto(res);
                        setIsUploadingTaskPhoto(false);
                      }
                    }} />
                 </label>
              </div>
            </div>
          </div>
          <Button 
            disabled={isCreatingTask}
            className="w-full h-14 rounded-2xl flex items-center justify-center gap-3" 
            onClick={handleCreateTaskInternal}
          >
            {isCreatingTask ? (
              <>
                <Activity className="w-5 h-5 animate-spin" />
                <span>Memproses Tugas...</span>
              </>
            ) : (
              "Simpan & Kirim Tugas"
            )}
          </Button>
        </div>
      </Modal>

      <Modal isOpen={isFuelModalOpen} onClose={() => setIsFuelModalOpen(false)}>
        <div className="p-8 space-y-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-500/10 rounded-3xl flex items-center justify-center mx-auto mb-4 border border-blue-500/20">
               <Database className="w-8 h-8 text-blue-500" />
            </div>
            <h3 className="text-2xl font-black italic uppercase tracking-tighter">Log Pengisian BBM</h3>
            <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">Catat penggunaan bahan bakar alat berat</p>
          </div>
          
          <div className="space-y-4">
             <div className="space-y-2">
                 <label className="text-[10px] font-black uppercase text-muted-foreground ml-1 tracking-widest">Unit Alat Berat</label>
                 <select 
                   value={fuelEquip} 
                   onChange={e => setFuelEquip(e.target.value)}
                   className="w-full h-12 bg-background border border-border rounded-xl px-4 text-xs font-black uppercase focus:ring-2 ring-blue-500 outline-none appearance-none"
                 >
                   <option value="">Pilih Unit...</option>
                   {['Excavator', 'Vibratory Roller', 'Asphalt Sprayer', 'Dump Truck', 'Genset'].map(e => (
                     <option key={e} value={e}>{e}</option>
                   ))}
                 </select>
             </div>

             <div className="space-y-2">
                 <label className="text-[10px] font-black uppercase text-muted-foreground ml-1 tracking-widest">Jumlah Liter (L)</label>
                 <Input 
                   type="number" 
                   placeholder="Contest: 25" 
                   value={fuelLiters} 
                   onChange={e => setFuelLiters(e.target.value)} 
                   className="h-12 text-blue-600 font-bold"
                 />
             </div>

             <div className="space-y-2">
                 <label className="text-[10px] font-black uppercase text-muted-foreground ml-1 tracking-widest">Catatan (Opsional)</label>
                 <textarea
                   placeholder="Catatan tambahan..."
                   value={fuelNote}
                   onChange={e => setFuelNote(e.target.value)}
                   className="w-full h-20 bg-background border border-border rounded-xl p-4 text-xs focus:ring-2 ring-blue-500 outline-none"
                 />
             </div>

             <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Foto Bukti Pengisian (Opsional)</label>
                <div className="flex gap-4">
                   <div 
                     onClick={() => document.getElementById('fuelPhotoInput')?.click()}
                     className="w-20 h-20 bg-muted/20 border-2 border-dashed border-border rounded-2xl flex flex-col items-center justify-center cursor-pointer overflow-hidden"
                   >
                      {fuelPhoto ? (
                        <img src={fuelPhoto} className="w-full h-full object-cover" alt="Fuel Proof" />
                      ) : (
                        <Camera className="w-5 h-5 text-muted-foreground" />
                      )}
                   </div>
                   <input 
                      id="fuelPhotoInput" type="file" accept="image/*" className="hidden" capture="environment"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const res = await compressImage(file);
                          setFuelPhoto(res);
                        }
                      }}
                   />
                </div>
             </div>
          </div>

          <Button 
            disabled={isLoggingFuel}
            className="w-full h-16 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black uppercase italic tracking-widest flex items-center justify-center gap-3 shadow-lg shadow-blue-500/20"
            onClick={async () => {
              if (!fuelEquip || !fuelLiters) {
                addNotification('Data Kurang', 'Pilih alat dan masukkan jumlah liter.', 'warning');
                return;
              }
              setIsLoggingFuel(true);
              try {
                await handleCreateFuelLog({
                  equipmentName: fuelEquip,
                  liters: Number(fuelLiters),
                  note: fuelNote,
                  photo: fuelPhoto,
                  projectId: currentProjectId
                });
                setIsFuelModalOpen(false);
                setFuelEquip(""); setFuelLiters(""); setFuelNote(""); setFuelPhoto("");
                clearDashboardDrafts();
              } catch (e) {
                console.error(e);
              } finally {
                setIsLoggingFuel(false);
              }
            }}
          >
            {isLoggingFuel ? <Activity className="w-5 h-5 animate-spin" /> : "Simpan Catatan BBM"}
          </Button>
        </div>
      </Modal>

      <Modal isOpen={isEqRequestModalOpen} onClose={() => setIsEqRequestModalOpen(false)}>
        <div className="p-8 space-y-6">
          <div className="text-center">
            <h3 className="text-2xl font-black italic uppercase tracking-tighter">Pengajuan & Pelaporan Alat</h3>
            <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">Ajukan kebutuhan atau lapor alat rusak</p>
          </div>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Nama Alat</label>
              <Input placeholder="Contoh: Blower Asphalt" value={eqToolName} onChange={e => setEqToolName(e.target.value)} />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Tipe Pengajuan</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'new', label: 'Baru', color: 'bg-emerald-500' },
                  { id: 'repair', label: 'Perbaikan', color: 'bg-amber-500' },
                  { id: 'damaged', label: 'Rusak', color: 'bg-rose-500' },
                ].map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setEqType(t.id as any)}
                    className={cn(
                      "p-3 rounded-xl border text-[9px] font-black uppercase transition-all",
                      eqType === t.id ? `${t.color} text-white border-transparent shadow-lg` : "bg-card border-border hover:border-primary/20"
                    )}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Keterangan / Alasan</label>
              <textarea
                placeholder="Jelaskan kebutuhan atau kerusakan alat..."
                value={eqDescription}
                onChange={e => setEqDescription(e.target.value)}
                className="w-full h-24 bg-background border border-border rounded-xl p-4 text-xs focus:ring-2 ring-primary outline-none"
              />
            </div>

            <div className="space-y-3">
               <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Foto Kondisi Alat (Opsional)</label>
               <div className="flex gap-4">
                  <div 
                    onClick={() => document.getElementById('eqPhotoInput')?.click()}
                    className="w-24 h-24 bg-muted/20 border-2 border-dashed border-border rounded-2xl flex flex-col items-center justify-center cursor-pointer"
                  >
                     {eqPhoto ? (
                       <img src={eqPhoto} className="w-full h-full object-cover rounded-2xl" alt="Eq Proof" />
                     ) : (
                       <Camera className="w-6 h-6 text-muted-foreground" />
                     )}
                  </div>
                  <input 
                     id="eqPhotoInput" type="file" accept="image/*" className="hidden" capture
                     onChange={async (e) => {
                       const file = e.target.files?.[0];
                       if (file) {
                         const res = await compressImage(file);
                         setEqPhoto(res);
                       }
                     }}
                  />
               </div>
            </div>
          </div>

          <Button 
            disabled={isSubmittingEq}
            className="w-full h-14 rounded-2xl font-black uppercase italic tracking-widest disabled:opacity-50"
            onClick={async () => {
              if (!eqToolName || !eqDescription) {
                addNotification('Data Kurang', 'Lengkapi nama alat dan keterangannya.', 'warning');
                return;
              }
              setIsSubmittingEq(true);
              try {
                await handleCreateEquipmentRequest({
                  toolName: eqToolName,
                  type: eqType,
                  description: eqDescription,
                  photo: eqPhoto,
                  projectId: currentProjectId
                });
                setIsEqRequestModalOpen(false);
                setEqToolName(""); setEqDescription(""); setEqPhoto("");
                clearDashboardDrafts();
              } catch (err) {
                console.error("Submission error:", err);
              } finally {
                setIsSubmittingEq(false);
              }
            }}
          >
            {isSubmittingEq ? "Mengirim..." : "Kirim Pengajuan"}
          </Button>
        </div>
      </Modal>

      <Modal isOpen={isRejectModalOpen} onClose={() => setIsRejectModalOpen(false)}>
        <div className="p-8 space-y-6">
          <div className="text-center">
            <h3 className="text-2xl font-black italic uppercase tracking-tighter text-rose-500">Tolak Pengajuan</h3>
            <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">Berikan alasan penolakan untuk dikirim ke pelaksana</p>
          </div>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Alasan Penolakan</label>
              <textarea
                placeholder="Contoh: Alat masih tersedia di gudang atau stok habis..."
                value={rejectReason}
                onChange={e => setRejectReason(e.target.value)}
                className="w-full h-32 bg-background border border-border rounded-2xl p-4 text-xs focus:ring-2 ring-rose-500 outline-none"
              />
            </div>

            <div className="flex gap-3">
              <Button 
                variant="outline" 
                className="flex-1 h-12 rounded-xl font-black uppercase italic"
                onClick={() => setIsRejectModalOpen(false)}
              >
                Batal
              </Button>
              <Button 
                className="flex-[2] h-12 bg-rose-500 hover:bg-rose-600 text-white rounded-xl font-black uppercase italic"
                onClick={async () => {
                  if (!rejectReason.trim()) {
                    addNotification('Data Kurang', 'Berikan alasan penolakan.', 'warning');
                    return;
                  }
                  await handleUpdateEquipmentRequestStatus(rejectId, 'rejected', rejectReason);
                  setIsRejectModalOpen(false);
                }}
              >
                Konfirmasi Tolak
              </Button>
            </div>
          </div>
        </div>
      </Modal>

      <Modal isOpen={isNewProjectModalOpen} onClose={() => setIsNewProjectModalOpen(false)}>
        <div className="p-8 space-y-6">
          <div className="text-center">
            <h3 className="text-2xl font-black italic uppercase tracking-tighter">Inisiasi Proyek Baru</h3>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Tentukan spesifikasi dan ruang lingkup</p>
          </div>
          <div className="space-y-4">
             <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-muted-foreground ml-1 tracking-widest">Nama Proyek</label>
                <Input placeholder="Contoh: Perbaikan Saluran Melati" value={newProjectName} onChange={e => setNewProjectName(e.target.value)} />
             </div>
             
             <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-muted-foreground ml-1 tracking-widest">Kategori Proyek</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                   {[
                     { id: 'asphalt', label: 'Asphalt', icon: Activity },
                     { id: 'inlet', label: 'Inlet/Saluran', icon: Database },
                     { id: 'traffic-sign', label: 'Rambu', icon: ShieldCheck },
                     { id: 'painting', label: 'Pengecatan', icon: TrendingUp },
                     { id: 'planting', label: 'Penanaman', icon: Sun },
                     { id: 'other', label: 'Lainnya', icon: Layers },
                   ].map((t) => (
                     <button
                       key={t.id}
                       onClick={() => setNewProjectType(t.id as any)}
                       className={cn(
                         "flex flex-col items-center justify-center p-4 rounded-2xl border transition-all gap-2",
                         newProjectType === t.id ? "bg-primary text-primary-foreground border-primary shadow-lg" : "bg-card border-border hover:border-primary/30"
                       )}
                     >
                       <t.icon className="w-5 h-5" />
                       <span className="text-[9px] font-black uppercase tracking-tighter">{t.label}</span>
                     </button>
                   ))}
                </div>
             </div>

             <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-muted-foreground ml-1 tracking-widest">Deskripsi (Opsional)</label>
                <textarea
                  placeholder="Detail singkat tentang proyek..."
                  value={newProjectDesc}
                  onChange={e => setNewProjectDesc(e.target.value)}
                  className="w-full h-24 bg-background border border-border rounded-xl p-4 text-xs focus:ring-2 ring-primary outline-none"
                />
             </div>

             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
               <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-muted-foreground ml-1 tracking-widest">Lokasi Strategis</label>
                  <Input 
                    placeholder="Contoh: Jalan Tol Trans Sumatera" 
                    value={newLocationInfo} 
                    onChange={e => setNewLocationInfo(e.target.value)} 
                  />
               </div>
               <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-muted-foreground ml-1 tracking-widest">Regional</label>
                  <Input 
                    placeholder="Contoh: Regional SUMBAGTENG" 
                    value={newRegionalInfo} 
                    onChange={e => setNewRegionalInfo(e.target.value)} 
                  />
               </div>
             </div>

             <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-muted-foreground ml-1 tracking-widest">Link Dokumen Master (Opsional)</label>
                <Input 
                  placeholder="Contoh: Link Drive/SOP" 
                  value={newProjectDocumentUrl} 
                  onChange={e => setNewProjectDocumentUrl(e.target.value)} 
                />
             </div>

             <div className="space-y-4">
               <div className="space-y-2">
                 <label className="text-[10px] font-black uppercase text-muted-foreground ml-1 tracking-widest">Alat Kerja Wajib</label>
                 <div className="flex flex-wrap gap-2 mb-2">
                   {newProjectRequiredTools.map((tool, idx) => (
                     <div key={idx} className="flex items-center gap-2 bg-primary/10 text-primary text-[10px] font-black px-3 py-1.5 rounded-full border border-primary/20">
                       <span>{tool}</span>
                       <button onClick={() => setNewProjectRequiredTools(newProjectRequiredTools.filter((_, i) => i !== idx))}>
                         <X className="w-3 h-3" />
                       </button>
                     </div>
                   ))}
                 </div>
                 <div className="flex gap-2">
                   <Input 
                     id="new-tool-input"
                     placeholder="Tambah alat lain..." 
                     className="h-10 text-[11px]"
                     onKeyDown={(e) => {
                       if (e.key === 'Enter') {
                         const val = (e.target as HTMLInputElement).value.trim();
                         if (val) {
                           setNewProjectRequiredTools([...newProjectRequiredTools, val]);
                           (e.target as HTMLInputElement).value = '';
                         }
                       }
                     }}
                   />
                   <Button 
                     size="icon" 
                     className="h-10 w-10 shrink-0"
                     onClick={() => {
                        const input = document.getElementById('new-tool-input') as HTMLInputElement;
                        if (input && input.value.trim()) {
                           setNewProjectRequiredTools([...newProjectRequiredTools, input.value.trim()]);
                           input.value = '';
                        }
                     }}
                   >
                     <Plus className="w-4 h-4" />
                   </Button>
                 </div>
                 <div className="flex gap-2">
                    <button 
                      onClick={() => {
                        const defaults: Record<string, string[]> = {
                          asphalt: ['Blower', 'Sapu', 'Laker', 'Sekop', 'Kereta Sorong', 'Roller'],
                          inlet: ['Cangkul', 'Sekop', 'Kereta Sorong', 'Waterpump'],
                          'traffic-sign': ['Tang', 'Kunci Pas', 'Bor Listrik', 'Tangga'],
                          painting: ['Kuas', 'Roller', 'Mesin Markah', 'Cat'],
                          planting: ['Cangkul', 'Gunting Rumput', 'Tanki Air'],
                          other: ['Standar K3']
                        };
                        setNewProjectRequiredTools(defaults[newProjectType] || []);
                      }}
                      className="text-[9px] font-black uppercase text-primary hover:underline"
                    >
                      Reset ke Standar {newProjectType}
                    </button>
                 </div>
               </div>

               <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-muted-foreground ml-1 tracking-widest">Target Kuantitas / Realisasi</label>
                  <Input 
                    type="number" 
                    placeholder="Contoh: 5000" 
                    value={newProjectTargetQty} 
                    onChange={e => setNewProjectTargetQty(e.target.value)} 
                  />
               </div>
             </div>
          </div>
          <Button
            className="w-full h-16 rounded-2xl text-xs font-black uppercase italic tracking-widest"
            onClick={handleCreateProject}
            disabled={isCreatingProject}
          >
            {isCreatingProject ? <Activity className="w-5 h-5 animate-spin mr-2" /> : null}
            {isCreatingProject ? 'Sedang Memproses...' : 'Aktifkan Proyek Baru'}
          </Button>
        </div>
      </Modal>

      <Modal isOpen={isDeleteProjectModalOpen} onClose={() => setIsDeleteProjectModalOpen(false)}>
        <div className="p-8 space-y-6 text-center">
          <div className="w-20 h-20 bg-rose-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
             <Trash2 className="w-10 h-10 text-rose-500" />
          </div>
          <h3 className="text-2xl font-black italic tracking-tighter uppercase">Konfirmasi Hapus</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Apakah Anda yakin ingin menghapus proyek <span className="font-black text-foreground">"{projectToDelete?.name}"</span>? 
            Seluruh data entry di dalamnya akan hilang permanen.
          </p>
          <div className="flex gap-3">
             <Button variant="outline" onClick={() => setIsDeleteProjectModalOpen(false)} className="flex-1 h-14 rounded-2xl">Batal</Button>
             <Button variant="primary" onClick={executeDeleteProject} className="flex-1 h-14 rounded-2xl bg-rose-600 hover:bg-rose-500">Hapus Permanen</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

/* --- Sub Components --- */


/* --- Sub Components --- */

const AttendanceSettingsCard = ({ settings, onUpdate }: { settings: any, onUpdate: (s: any) => Promise<void> }) => {
  const [lat, setLat] = React.useState(settings?.allowedLat || -6.2088);
  const [lng, setLng] = React.useState(settings?.allowedLng || 106.8456);
  const [radius, setRadius] = React.useState(settings?.radius || 100);
  const [enabled, setEnabled] = React.useState(settings?.enabled || false);

  React.useEffect(() => {
    if (settings) {
      setLat(settings.allowedLat);
      setLng(settings.allowedLng);
      setRadius(settings.radius);
      setEnabled(settings.enabled);
    }
  }, [settings]);

  return (
    <Card className="p-8 border-primary/20 bg-primary/5 rounded-[2rem] overflow-hidden relative">
       <div className="flex items-center gap-4 mb-6">
          <div className="bg-primary/10 p-3 rounded-2xl">
             <MapPin className="w-6 h-6 text-primary" />
          </div>
          <div>
             <h3 className="text-xl font-black italic uppercase tracking-tighter leading-none">Pengaturan Absen (Geofencing)</h3>
             <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-black mt-1">Batasi lokasi absen karyawan di titik koordinat tertentu</p>
          </div>
       </div>

       <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
             <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-muted-foreground ml-1 tracking-[0.2em]">Latitude Kantor</label>
                <div className="flex gap-2">
                  <Input type="number" step="any" className="bg-background/50 h-12" value={lat} onChange={e => setLat(Number(e.target.value))} placeholder="-6.1234" />
                  <Button variant="outline" size="sm" onClick={() => {
                    if (navigator.geolocation) {
                      navigator.geolocation.getCurrentPosition(p => {
                        setLat(parseFloat(p.coords.latitude.toFixed(6)));
                        setLng(parseFloat(p.coords.longitude.toFixed(6)));
                      });
                    }
                  }} className="shrink-0 h-12 px-4 text-[8px] font-black uppercase rounded-xl border-primary/30 text-primary">Deteksi Lokasi</Button>
                </div>
             </div>
             <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-muted-foreground ml-1 tracking-[0.2em]">Longitude Kantor</label>
                <Input type="number" step="any" className="bg-background/50 h-12" value={lng} onChange={e => setLng(Number(e.target.value))} placeholder="106.1234" />
             </div>
          </div>
          <div className="space-y-4">
             <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-muted-foreground ml-1 tracking-[0.2em]">Radius Toleransi (Meter)</label>
                <Input type="number" className="bg-background/50 h-12 font-black" value={radius} onChange={e => setRadius(Number(e.target.value))} placeholder="100" />
             </div>
             <div className="flex items-center gap-4 mt-8">
               <button 
                 onClick={() => setEnabled(!enabled)}
                 className={cn(
                   "flex items-center gap-3 px-6 py-4 rounded-2xl border-2 transition-all font-black uppercase text-[10px] tracking-widest w-full justify-center shadow-lg",
                   enabled ? "bg-emerald-500 border-emerald-500 text-white shadow-emerald-500/20" : "bg-muted/10 border-border opacity-50 grayscale"
                 )}
               >
                 {enabled ? <CheckCircle2 className="w-5 h-5" /> : <X className="w-5 h-5 opacity-30" />}
                 {enabled ? 'GEOFENCING AKTIF' : 'GEOFENCING NONAKTIF'}
               </button>
             </div>
          </div>
       </div>

       <div className="mt-10 flex justify-end">
          <Button 
            onClick={() => onUpdate({ allowedLat: lat, allowedLng: lng, radius, enabled })}
            className="h-16 px-12 rounded-2xl font-black uppercase italic tracking-widest shadow-2xl shadow-primary/30 hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            Simpan Konfigurasi Absensi
          </Button>
       </div>
    </Card>
  );
};

/* --- Analytics --- */

const TaskAnalytics = ({ tasks, workers }: { tasks: Task[], workers: Worker[] }) => {
  const stats = React.useMemo(() => {
    const completed = tasks.filter(t => t.status === 'completed').length;
    const pending = tasks.filter(t => t.status === 'pending').length;
    const inProgress = tasks.filter(t => t.status === 'in-progress').length;
    
    const byPriority = [
      { name: 'Low', value: tasks.filter(t => t.priority === 'low').length, color: '#10b981' },
      { name: 'Medium', value: tasks.filter(t => t.priority === 'medium').length, color: '#f59e0b' },
      { name: 'High', value: tasks.filter(t => t.priority === 'high').length, color: '#f43f5e' },
    ];

    const byStatus = [
      { name: 'Pending', value: pending, color: '#f43f5e' },
      { name: 'In Progress', value: inProgress, color: '#f59e0b' },
      { name: 'Completed', value: completed, color: '#10b981' },
    ];

    return { completed, pending, inProgress, total: tasks.length, byPriority, byStatus };
  }, [tasks]);

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard label="Total Tugas" value={stats.total} icon={ClipboardList} color="text-primary" />
        <StatCard label="Selesai" value={stats.completed} icon={CheckCircle2} color="text-emerald-500" />
        <StatCard label="Proses" value={stats.inProgress} icon={Activity} color="text-amber-500" />
        <StatCard label="Pending" value={stats.pending} icon={Clock} color="text-rose-500" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card className="p-8">
          <h4 className="text-sm font-black uppercase mb-8 italic">Penyebaran Status</h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={stats.byStatus} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                  {stats.byStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-8">
          <h4 className="text-sm font-black uppercase mb-8 italic">Prioritas Pengerjaan</h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.byPriority}>
                <XAxis dataKey="name" fontSize={10} tick={{ fontWeight: 'black' }} />
                <YAxis fontSize={10} />
                <Tooltip />
                <Bar dataKey="value" radius={[10, 10, 0, 0]}>
                   {stats.byPriority.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
};

const LiveOperatorMap = ({ workers }: { workers: Worker[] }) => {
  const operators = workers.filter(w => w.lastLat && w.lastLng);

  return (
    <Card className="p-8 relative overflow-hidden bg-muted/20">
      <div className="absolute top-4 right-4 flex items-center gap-2">
         <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
         <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500">Live Radar</span>
      </div>

      <div className="h-[500px] bg-background border border-border rounded-[2rem] relative overflow-hidden shadow-inner group">
        {/* Simple Stylized Radar Background */}
        <div className="absolute inset-0 opacity-10 pointer-events-none">
           <svg width="100%" height="100%">
             <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
               <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1" />
             </pattern>
             <rect width="100%" height="100%" fill="url(#grid)" />
             <circle cx="50%" cy="50%" r="100" fill="none" stroke="currentColor" strokeWidth="1" />
             <circle cx="50%" cy="50%" r="200" fill="none" stroke="currentColor" strokeWidth="1" />
           </svg>
        </div>

        {operators.length === 0 ? (
          <div className="absolute inset-0 flex items-center justify-center flex-col gap-4">
             <div className="bg-muted p-4 rounded-full">
               <MapPin className="w-8 h-8 text-muted-foreground opacity-30" />
             </div>
             <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Tidak ada petugas yang terpantau</p>
          </div>
        ) : (
          <div className="absolute inset-0 p-8 flex flex-wrap gap-12 items-center justify-center">
             {operators.map(op => (
                <motion.div 
                  key={op.id}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  whileHover={{ scale: 1.1 }}
                  className="flex flex-col items-center gap-3 bg-card p-6 rounded-[2.5rem] border border-border shadow-xl relative"
                >
                   <div className="w-12 h-12 bg-primary flex items-center justify-center rounded-2xl">
                      <User className="w-6 h-6 text-white" />
                   </div>
                   <div className="text-center">
                      <h5 className="text-[10px] font-black uppercase italic tracking-tighter">{op.name}</h5>
                      <p className="text-[8px] font-bold text-muted-foreground uppercase">{op.role}</p>
                   </div>
                   <div className="flex gap-2">
                      <div className="bg-muted px-2 py-1 rounded-lg text-[7px] font-black border border-border">{op.lastLat?.toFixed(4)}</div>
                      <div className="bg-muted px-2 py-1 rounded-lg text-[7px] font-black border border-border">{op.lastLng?.toFixed(4)}</div>
                   </div>
                   <div className="mt-1 text-[6px] font-black text-emerald-500 uppercase">Aktif {Math.floor((Date.now() - (op.lastUpdate || 0)) / 1000 / 60)} Menit Lalu</div>
                </motion.div>
             ))}
          </div>
        )}
      </div>
    </Card>
  );
};

const StatCard = React.memo(({ label, value, icon: Icon, color, unit }: any) => (
  <Card className="p-6 bg-card/40 backdrop-blur-xl border-border/50">
    <div className="flex items-center justify-between mb-4">
      <div className={cn("p-2 rounded-xl bg-muted", color)}>
        <Icon className="w-5 h-5" />
      </div>
      <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{label}</span>
    </div>
    <div className="text-2xl font-black italic tracking-tight">{value}</div>
    {unit && <div className="text-[10px] font-bold text-muted-foreground uppercase mt-1 tracking-widest">{unit}</div>}
  </Card>
));

const ProjectCard = React.memo(({ project, isAdmin, onClick, onDelete, onArchive, index }: any) => {
  const metrics = React.useMemo(() => {
    // Filter non-archived entries for metrics calculation
    const activeEntries = (project.entries || []).filter((e: any) => !e.isArchived);

    if (activeEntries.length === 0) {
      return { 
        primary: { label: 'DATA UTAMA', value: '0' },
        secondary: { label: 'PROGRES', value: project.targetQty ? `0% / ${project.targetQty}` : '0%' }
      };
    }
    
    if (project.targetQty) {
      const realized = activeEntries.reduce((sum: number, e: any) => {
        if (project.type === 'asphalt') return sum + (Number(e.tonase) || 0);
        return sum + (Number(e.qty) || 0);
      }, 0);
      const prog = Math.min(100, Math.round((realized / project.targetQty) * 100));
      const shortage = Math.max(0, project.targetQty - realized);
      const unit = project.type === 'asphalt' ? 't' : project.type === 'painting' ? 'm²' : 'PCS/QTY';
      return {
        primary: { label: 'REALISASI', value: `${realized.toLocaleString('id-ID')} ${unit}` },
        secondary: { label: `SISA: ${shortage.toLocaleString('id-ID')} ${unit}`, value: `${prog}% / ${project.targetQty.toLocaleString('id-ID')}` }
      };
    }

    if (project.type === 'asphalt' || !project.type) {
      const vol = activeEntries.reduce((sum: number, e: any) => sum + (Number(e.volume) || 0), 0);
      const ton = activeEntries.reduce((sum: number, e: any) => sum + (Number(e.tonase) || 0), 0);
      return { 
        primary: { label: 'TOT VOLUME', value: `${vol.toLocaleString('id-ID', { minimumFractionDigits: 3, maximumFractionDigits: 3 })} m³` },
        secondary: { label: 'TOT TONASE', value: `${ton.toLocaleString('id-ID', { minimumFractionDigits: 3, maximumFractionDigits: 3 })} t` }
      };
    }
    
    const qty = activeEntries.reduce((sum: number, e: any) => sum + (Number(e.qty) || 0), 0);
    const completed = activeEntries.filter((e:any) => e.status === 'completed').length;
    const progress = Math.round((completed / activeEntries.length) * 100);
    
    let unit = 'PCS/QTY';
    if(project.type === 'painting') unit = 'm²';
    else if(project.type === 'planting') unit = 'Phn';

    return {
      primary: { label: 'KUANTITAS', value: `${qty.toLocaleString('id-ID')} ${unit}` },
      secondary: { label: 'PROGRES', value: `${progress}% (${completed}/${activeEntries.length})` }
    };
  }, [project]);

  const { generateDPR } = useApp();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      onClick={onClick}
      className="group relative flex flex-col bg-card/60 backdrop-blur-md border border-border/50 p-6 rounded-[2.5rem] hover:border-primary/50 transition-all duration-300 cursor-pointer shadow-sm hover:shadow-2xl hover:shadow-primary/10 overflow-hidden"
    >
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none group-hover:bg-primary/10 transition-colors duration-500" />

      <div className="flex justify-between items-start mb-6 z-10">
        <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary group-hover:scale-110 group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300 shadow-sm border border-primary/20">
          {project.type === 'asphalt' && <Database className="w-7 h-7" />}
          {project.type === 'inlet' && <Layers className="w-7 h-7" />}
          {project.type === 'traffic-sign' && <ShieldCheck className="w-7 h-7" />}
          {project.type === 'painting' && <TrendingUp className="w-7 h-7" />}
          {project.type === 'planting' && <Sun className="w-7 h-7" />}
          {project.type === 'other' && <Activity className="w-7 h-7" />}
          {!project.type && <Database className="w-7 h-7" />}
        </div>
        
        {isAdmin && (
          <div className="flex items-center gap-1 z-20">
            <button 
              onClick={(e) => { e.stopPropagation(); generateDPR(project.id); }} 
              className="p-3 text-emerald-500 hover:bg-emerald-500/10 rounded-2xl transition-all"
              title="Generate Daily Progress Report (PDF)"
            >
              <FileSpreadsheet className="w-5 h-5" />
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); onArchive(project.id, project.isArchived); }} 
              className="p-3 text-muted-foreground/70 hover:text-amber-500 hover:bg-amber-500/10 rounded-2xl transition-all"
              title={project.isArchived ? "Pulihkan" : "Arsipkan"}
            >
              {project.isArchived ? <ArchiveRestore className="w-5 h-5" /> : <Archive className="w-5 h-5" />}
            </button>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onDelete(e);
              }} 
              className="p-3 text-muted-foreground/70 hover:text-rose-500 hover:bg-rose-500/10 rounded-2xl transition-all"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>

      <div className="z-10 flex-grow mb-6">
        <div className="flex items-center gap-2 mb-3">
          <span className={cn(
            "text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full",
            project.type === 'asphalt' ? "bg-blue-500/10 text-blue-500" : "bg-emerald-500/10 text-emerald-500"
          )}>
            {project.type || 'Legacy'}
          </span>
          <div className="w-1 h-1 rounded-full bg-border" />
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            {new Date(project.createdAt).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
          </p>
        </div>
        <h3 className="text-2xl font-black italic tracking-tighter uppercase line-clamp-2 leading-[0.9] mb-3 group-hover:text-primary transition-colors">{project.name}</h3>
        
        <div className="flex flex-col gap-1 mb-3">
          <div className="flex items-center gap-2 text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
            <MapPin className="w-3.5 h-3.5 text-primary/60" />
            <span className="truncate">{project.locationInfo || 'Jalan Tol Trans Sumatera'}</span>
          </div>
          <div className="flex items-center gap-2 text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
            <Layers className="w-3.5 h-3.5 text-primary/60" />
            <span className="truncate">{project.regionalInfo || 'Regional SUMBAGTENG'}</span>
          </div>
        </div>

        {project.description && (
          <p className="text-[11px] text-muted-foreground line-clamp-2 font-medium leading-relaxed italic mb-3">{project.description}</p>
        )}

        {project.documentUrl && (
          <div className="mb-4">
            <a 
               href={project.documentUrl.startsWith('http') ? project.documentUrl : `https://${project.documentUrl}`} 
               target="_blank" 
               rel="noopener noreferrer" 
               className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/5 text-primary rounded-xl border border-primary/20 hover:bg-primary/10 transition-all text-[9px] font-black uppercase"
               onClick={(e) => e.stopPropagation()}
            >
               <FileSpreadsheet className="w-3.5 h-3.5" />
               Manual/SOP Proyek
            </a>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3 mb-6 z-10 w-full">
        <div className="bg-background/50 border border-border/50 rounded-2xl p-4 flex flex-col justify-center">
          <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1.5 block">{metrics.primary.label}</span>
          <span className="text-base font-black text-foreground truncate block">{metrics.primary.value}</span>
        </div>
        <div className="bg-background/50 border border-border/50 rounded-2xl p-4 flex flex-col justify-center">
          <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1.5 block">{metrics.secondary.label}</span>
          <span className="text-base font-black text-foreground truncate block">{metrics.secondary.value}</span>
        </div>
      </div>

      <div className="flex items-center justify-between pt-5 border-t border-border mt-auto z-10">
        <div className="flex flex-col">
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Database</span>
          <span className="text-xs font-black text-primary uppercase">{project.entries?.length || 0} Entries</span>
        </div>
        <div className="w-12 h-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground group-hover:translate-x-1 transition-all duration-300">
          <ArrowRight className="w-5 h-5 -rotate-45 group-hover:rotate-0 transition-all duration-300" />
        </div>
      </div>
    </motion.div>
  );
});

const TaskCard = ({ task, isAdmin, currentUserEmail, onUpdateStatus, onDelete, onArchive, uploadingPhoto, localRealizationPhotos, onUploadPhoto, onClearLocalPhotos }: any) => {
  const isCompleted = task.status === 'completed';
  const isInProgress = task.status === 'in-progress';
  
  const assigneesEmails = React.useMemo(() => {
    const emails = task.assignedToEmail;
    if (Array.isArray(emails)) return emails;
    return emails ? [emails] : [];
  }, [task.assignedToEmail]);

  const assigneesNames = React.useMemo(() => {
    const names = task.assignedTo;
    if (Array.isArray(names)) return names;
    return names ? [names] : [];
  }, [task.assignedTo]);

  const isAssignedToMe = React.useMemo(() => {
    if (!currentUserEmail) return false;
    const email = currentUserEmail.toLowerCase();
    return assigneesEmails.some(e => e?.toLowerCase() === email);
  }, [assigneesEmails, currentUserEmail]);

  const [showHistory, setShowHistory] = React.useState(false);

  const progressMap = {
    'pending': 5,
    'in-progress': 50,
    'completed': 100
  };
  const progress = progressMap[task.status as keyof typeof progressMap] || 0;

  const priorityColors = {
    low: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
    medium: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
    high: 'bg-rose-500/10 text-rose-500 border-rose-500/20',
  };

  const assignees = Array.isArray(task.assignedTo) ? task.assignedTo : [task.assignedTo];

  return (
    <Card className={cn("p-8 relative transition-all border-l-[6px] group", 
      isCompleted ? "border-l-emerald-500" : isInProgress ? "border-l-amber-500" : "border-l-rose-500")}>
      
      {/* Progress Bar */}
      <div className="absolute top-0 left-0 w-full h-1 bg-muted overflow-hidden">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          className={cn("h-full", isCompleted ? "bg-emerald-500" : isInProgress ? "bg-amber-500" : "bg-rose-500")}
        />
      </div>

      <div className="flex items-center justify-between mb-6 pt-2">
        <div className="flex gap-2">
          <Badge variant={task.status === 'completed' ? 'success' : task.status === 'in-progress' ? 'warning' : 'danger'}>
            {task.status}
          </Badge>
          <span className={cn("px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border", priorityColors[task.priority as keyof typeof priorityColors])}>
            {task.priority || 'medium'}
          </span>
        </div>
        <div className="flex items-center gap-2">
           <div className="flex flex-col items-end mr-2">
             <span className="text-[9px] font-bold text-muted-foreground uppercase">Dibuat: {new Date(task.createdAt).toLocaleDateString()}</span>
             {task.dueDate && (
               <span className={cn("text-[9px] font-black uppercase italic tracking-tighter flex items-center gap-1", 
                 Date.now() > task.dueDate ? "text-rose-600 animate-pulse" : "text-amber-600")}>
                 <Clock className="w-3 h-3" /> Deadline: {new Date(task.dueDate).toLocaleString('id-ID', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
               </span>
             )}
           </div>
           <button onClick={() => setShowHistory(!showHistory)} className="text-muted-foreground hover:text-primary transition-colors">
             <History className="w-4 h-4" />
           </button>
           {isAdmin && (
             <div className="flex items-center gap-1">
               <button onClick={() => onArchive(task.id, task.isArchived)} className="text-muted-foreground hover:text-amber-500 p-1" title={task.isArchived ? "Pulihkan" : "Arsipkan"}>
                 {task.isArchived ? <ArchiveRestore className="w-4 h-4" /> : <Archive className="w-4 h-4" />}
               </button>
               <button onClick={() => onDelete(task.id)} className="text-muted-foreground hover:text-rose-500 p-1">
                 <Trash2 className="w-4 h-4" />
               </button>
             </div>
           )}
        </div>
      </div>

      <AnimatePresence>
        {showHistory && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden bg-muted/50 rounded-2xl border border-border mb-6"
          >
            <div className="p-4 space-y-4">
              <h5 className="text-[10px] font-black uppercase italic tracking-tighter flex items-center gap-2 text-primary">
                <History className="w-3.5 h-3.5" /> Log Riwayat Aktivitas Tugas
              </h5>
              <div className="space-y-4 relative before:absolute before:left-[7px] before:top-2 before:bottom-2 before:w-[1.5px] before:bg-border/50">
                 {task.history?.map((log: any, i: number) => (
                    <div key={log.id || i} className="flex gap-4 text-[9px] relative pl-5 py-0.5">
                       <div className="absolute left-0 top-2.5 w-4 h-4 bg-background border-2 border-primary/30 rounded-full flex items-center justify-center -translate-x-[4.5px] z-10 p-0.5">
                          <div className={cn("w-full h-full rounded-full animate-pulse", 
                            log.status === 'completed' ? "bg-emerald-500" : log.status === 'in-progress' ? "bg-amber-500" : "bg-rose-500")} 
                          />
                       </div>
                       <div className="flex-1 bg-background/50 p-4 rounded-2xl border border-white/10 shadow-sm group hover:border-primary/30 transition-all">
                          <div className="flex items-center justify-between mb-2">
                             <div className="flex items-center gap-2">
                               <p className="font-black uppercase tracking-tighter text-primary">{log.userName}</p>
                               <span className="text-[7px] opacity-30 lowercase">{log.userEmail}</span>
                             </div>
                             <p className="text-[8px] opacity-40 font-bold bg-muted px-2 py-0.5 rounded-lg border border-border/50">
                               {new Date(log.timestamp).toLocaleString('id-ID', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                             </p>
                          </div>
                          <div className="flex items-center gap-2">
                             <Badge variant={log.status === 'completed' ? 'success' : log.status === 'in-progress' ? 'warning' : 'danger'}>
                               {log.status}
                             </Badge>
                             <p className="text-muted-foreground font-black uppercase tracking-tighter opacity-80 leading-relaxed italic">"{log.note}"</p>
                          </div>
                       </div>
                    </div>
                 ))}
                 {(!task.history || task.history.length === 0) && (
                   <div className="text-[10px] italic text-muted-foreground opacity-50 p-6 text-center bg-muted/20 rounded-2xl border border-dashed border-border ml-5">
                     Belum ada catatan riwayat aktivitas untuk tugas ini.
                   </div>
                 )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <h3 className="text-2xl font-black italic tracking-tighter uppercase mb-2">{task.title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed mb-4">{task.description}</p>

      {task.documentUrl && (
        <div className="mb-6">
          <a 
             href={task.documentUrl.startsWith('http') ? task.documentUrl : `https://${task.documentUrl}`} 
             target="_blank" 
             rel="noopener noreferrer" 
             className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 text-blue-500 rounded-xl border border-blue-500/20 hover:bg-blue-500/20 transition-all text-[10px] font-black uppercase"
          >
             <FileSpreadsheet className="w-4 h-4" />
             Lihat Dokumen/File Terlampir
          </a>
        </div>
      )}

      {/* Media Grid */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        {task.photo && (
          <div className="space-y-2">
            <span className="text-[8px] font-black uppercase text-muted-foreground opacity-50 px-1">Instruksi Admin</span>
            <div className="aspect-video rounded-3xl overflow-hidden border border-border bg-muted">
              <img src={task.photo} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            </div>
          </div>
        )}
        <div className="space-y-2">
          <span className="text-[8px] font-black uppercase text-primary opacity-50 px-1 flex items-center gap-2">
            Realisasi Lapangan {isCompleted && <CheckCircle2 className="w-2.5 h-2.5 text-emerald-500" />}
          </span>
          <div className="grid grid-cols-3 gap-2">
             {/* Stored Photos */}
             {task.realizationPhotos?.map((p: string, i: number) => (
                <div key={i} className="aspect-square rounded-xl overflow-hidden border border-border shadow-sm">
                  <img src={p} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </div>
             ))}
             {/* Unsaved Draft Photos */}
             {localRealizationPhotos.map((p: string, i: number) => (
                <div key={`d-${i}`} className="aspect-square rounded-xl overflow-hidden border border-primary/50 border-dashed relative group">
                   <img src={p} className="w-full h-full object-cover opacity-60" referrerPolicy="no-referrer" />
                   <div className="absolute inset-x-0 bottom-0 py-1 bg-primary text-[6px] font-black text-white text-center uppercase tracking-tighter">Draft Foto</div>
                </div>
             ))}
             {localRealizationPhotos.length === 0 && (!task.realizationPhotos || task.realizationPhotos.length === 0) && (
                <div className="aspect-square rounded-xl border border-dashed border-border flex items-center justify-center opacity-30">
                  <Camera className="w-4 h-4" />
                </div>
             )}
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-4 pt-6 border-t border-border">
        {(!isAdmin || isAssignedToMe) && !isCompleted && (
          <>
            <div className="flex-[1] flex items-center justify-center gap-2 bg-muted border border-border rounded-2xl h-14">
              <label className="flex-1 h-full flex flex-col items-center justify-center cursor-pointer hover:bg-secondary transition-all rounded-l-2xl border-r border-border" title="Kamera">
                {uploadingPhoto ? <Activity className="w-4 h-4 animate-spin text-primary mb-0.5" /> : <Camera className="w-4 h-4 text-primary mb-0.5" />}
                <span className="text-[7px] font-black uppercase text-primary/80">Kamera</span>
                <input type="file" className="hidden" accept="image/*" capture="environment" onChange={onUploadPhoto} />
              </label>
              <label className="flex-1 h-full flex flex-col items-center justify-center cursor-pointer hover:bg-secondary transition-all rounded-r-2xl" title="Galeri">
                {uploadingPhoto ? <Activity className="w-4 h-4 animate-spin text-emerald-500 mb-0.5" /> : <ImageIcon className="w-4 h-4 text-emerald-500 mb-0.5" />}
                <span className="text-[7px] font-black uppercase text-emerald-500/80">Galeri</span>
                <input type="file" className="hidden" accept="image/*" onChange={onUploadPhoto} />
              </label>
            </div>
            
            {localRealizationPhotos.length > 0 && (
              <Button 
                onClick={() => {
                  // Save progress without completing
                  onUpdateStatus(task.id, task.status, localRealizationPhotos, true);
                  onClearLocalPhotos();
                }}
                className="flex-[1] h-14 rounded-2xl bg-blue-600 hover:bg-blue-500 text-[10px] font-black uppercase tracking-widest"
              >
                Simpan
              </Button>
            )}

            <Button 
              onClick={() => {
                if (isInProgress && localRealizationPhotos.length === 0 && (!task.realizationPhotos || task.realizationPhotos.length === 0)) {
                  alert("Wajib lampirkan minimal 1 foto bukti pengerjaan untuk menyelesaikan tugas.");
                  return;
                }
                const nextStatus = isInProgress ? 'completed' : 'in-progress';
                onUpdateStatus(task.id, nextStatus, localRealizationPhotos);
                onClearLocalPhotos();
              }}
              className="flex-[1.5] h-14 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-[10px] font-black uppercase tracking-widest"
            >
              {isInProgress ? "Selesaikan Tugas" : "Terima Pekerjaan"}
            </Button>
          </>
        )}
        <div className="flex flex-col">
          <span className="text-[8px] font-black text-muted-foreground uppercase opacity-40">Petugas Ditunjuk</span>
          <div className="flex -space-x-2 mt-1">
             {assigneesNames.map((name: string, i: number) => (
                <div key={i} className="w-6 h-6 rounded-full bg-primary flex items-center justify-center border-2 border-background" title={name}>
                   <span className="text-[8px] font-black text-white">{(name || '?').charAt(0)}</span>
                </div>
             ))}
             <span className="text-[10px] font-black uppercase tracking-tight ml-3 self-center">{assigneesNames.length} Petugas</span>
          </div>
        </div>
      </div>
    </Card>
  );
};

const WorkerCard = ({ worker, onDelete, onEdit, onCashAdvance, isSuperAdmin }: any) => (
  <Card className="p-6 flex items-center justify-between group">
    <div className="flex items-center gap-4">
      <div className="w-12 h-12 bg-muted rounded-2xl flex items-center justify-center">
        <User className="w-6 h-6 text-muted-foreground font-black" />
      </div>
      <div>
        <div className="flex items-center gap-2">
           <h4 className="text-sm font-black uppercase italic tracking-tighter leading-none">{worker.name}</h4>
           {worker.isPinnedToLogin && <Star className="w-3 h-3 text-amber-500 fill-amber-500" title="Pinned to Login" />}
        </div>
        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">
           {worker.employeeId} • {worker.role} • Rp {worker.dailyRate?.toLocaleString('id-ID') || 0}/Hari
        </p>
        {isSuperAdmin && (
          <>
            <p className="text-[9px] text-primary font-black uppercase mt-1">E: {worker.email}</p>
            <p className="text-[9px] text-amber-500 font-black uppercase mt-1 tracking-widest leading-none">Security Key: {worker.password}</p>
          </>
        )}
      </div>
    </div>
    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
      <button 
        onClick={onCashAdvance}
        className="p-3 text-muted-foreground hover:text-amber-500 rounded-xl hover:bg-muted transition-all"
        title="Catat Kasbon"
      >
        <Wallet className="w-4 h-4" />
      </button>
      <button onClick={onEdit} className="p-3 text-muted-foreground hover:text-primary rounded-xl hover:bg-muted transition-all">
        <ArrowRight className="w-4 h-4 -rotate-45" />
      </button>
      <button onClick={() => confirm('Hapus akses pegawai ini?') && onDelete(worker.id)} className="p-3 text-muted-foreground hover:text-rose-500 rounded-xl hover:bg-muted transition-all">
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  </Card>
);

const GeofenceCard = ({ worker, onEdit }: any) => {
  const isEnabled = worker.geofenceLimit?.enabled;
  return (
    <Card className="p-6 flex items-center justify-between group bg-muted/10 border-border">
      <div className="flex items-center gap-4">
        <div className={cn(
          "w-12 h-12 rounded-2xl flex items-center justify-center transition-colors shadow-inner",
          isEnabled ? "bg-primary/20 text-primary border border-primary/20" : "bg-muted text-muted-foreground border border-border"
        )}>
          <MapPin className="w-6 h-6" />
        </div>
        <div>
          <h4 className="text-sm font-black uppercase italic tracking-tighter leading-none">{worker.name}</h4>
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">Status: {isEnabled ? 'Radius Aktif' : 'Login Bebas'}</p>
          {isEnabled && worker.geofenceLimit && (
            <div className="flex flex-col gap-1 mt-2">
               <p className="text-[8px] font-black text-primary uppercase bg-primary/10 w-fit px-2 py-0.5 rounded-full">Radius: {worker.geofenceLimit.radius}M</p>
               <p className="text-[7px] font-mono text-muted-foreground truncate max-w-[120px] bg-muted/50 px-2 py-0.5 rounded">Coords: {worker.geofenceLimit.lat}, {worker.geofenceLimit.lng}</p>
            </div>
          )}
        </div>
      </div>
      <Button variant="outline" size="sm" onClick={onEdit} className="rounded-xl h-10 px-4 text-[9px] font-black uppercase tracking-widest border-2 hover:bg-primary hover:text-white transition-all">
        Config Area
      </Button>
    </Card>
  );
};

const ChatInterface = ({ messages, currentUser, workers, onSendMessage, setMsgContent, msgContent, msgReceiver, setMsgReceiver, onUploadPhoto, isUploading, msgPhoto, setMsgPhoto }: any) => {
  const scrollRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <Card className="h-[600px] flex flex-col border-border shadow-2xl relative overflow-hidden bg-muted/20 backdrop-blur-md">
      <div className="p-6 border-b border-border bg-card flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 p-2 rounded-xl">
            <MessageSquare className="w-5 h-5 text-primary" />
          </div>
          <h3 className="font-black italic uppercase text-lg">Communication Lab</h3>
        </div>
        <div className="text-[8px] font-black uppercase bg-emerald-500/10 text-emerald-500 px-3 py-1 rounded-full border border-emerald-500/20">System Online</div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center opacity-30 text-center space-y-4">
             <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center animate-pulse">
                <MessageSquare className="w-8 h-8" />
             </div>
             <div>
                <p className="text-[10px] font-black uppercase tracking-widest">Belum ada percakapan</p>
                <p className="text-[8px] font-bold">Kirim pesan rahasia ke pelaksana lapangan</p>
             </div>
          </div>
        ) : (
          messages.map((m: any) => (
            <div key={m.id} className={cn("flex flex-col gap-2", m.senderEmail?.toLowerCase() === currentUser?.email?.toLowerCase() ? "items-end" : "items-start")}>
              <div className={cn("max-w-[85%] p-5 rounded-[2rem] shadow-sm", 
                m.senderEmail?.toLowerCase() === currentUser?.email?.toLowerCase() ? "bg-primary text-primary-foreground rounded-tr-none" : "bg-card border border-border rounded-tl-none")}>
                {m.photo && <img src={m.photo} className="w-full rounded-2xl mb-4 border border-black/5" referrerPolicy="no-referrer" />}
                <p className="text-sm font-medium leading-relaxed tracking-tight">{m.content}</p>
              </div>
              <span className="text-[8px] font-black uppercase opacity-40 px-3">{(m.senderEmail || '').split('@')[0]} • {new Date(m.timestamp || 0).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
          ))
        )}
      </div>

    <form onSubmit={(e) => {
        e.preventDefault();
        if((msgContent.trim() || msgPhoto) && msgReceiver) {
          onSendMessage(msgContent, msgReceiver, msgPhoto);
          setMsgContent("");
          setMsgPhoto("");
        }
      }} 
      className="p-6 bg-card border-t border-border space-y-4"
    >
      <div className="flex gap-2">
         <select 
            value={msgReceiver} 
            onChange={e => setMsgReceiver(e.target.value)}
            className="flex-1 h-12 bg-muted border border-border rounded-xl px-4 text-[10px] font-black uppercase tracking-widest outline-none transition-all focus:ring-2 ring-primary"
         >
            <option value="">Pilih Penerima</option>
            <option value="ALL">Siaran Seluruh Unit</option>
            {workers.map((w: any) => <option key={w.id} value={w.email}>{w.name} ({w.employeeId})</option>)}
         </select>
         <div className="flex gap-1 h-12">
            <label className="h-full w-12 flex flex-col items-center justify-center bg-muted border border-border rounded-l-xl cursor-pointer hover:bg-secondary border-r-0">
               {isUploading ? <Activity className="w-3 h-3 animate-spin text-primary mb-0.5" /> : <Camera className="w-3 h-3 text-primary mb-0.5" />}
               <span className="text-[5px] font-black uppercase text-primary/80">Kamera</span>
               <input type="file" className="hidden" accept="image/*" capture="environment" onChange={onUploadPhoto} />
            </label>
            <label className="h-full w-12 flex flex-col items-center justify-center bg-muted border border-border rounded-r-xl cursor-pointer hover:bg-secondary">
               {isUploading ? <Activity className="w-3 h-3 animate-spin text-emerald-500 mb-0.5" /> : <ImageIcon className="w-3 h-3 text-emerald-500 mb-0.5" />}
               <span className="text-[5px] font-black uppercase text-emerald-500/80">Galeri</span>
               <input type="file" className="hidden" accept="image/*" onChange={onUploadPhoto} />
            </label>
         </div>
      </div>

      <div className="relative">
        <Input 
          placeholder="Type classified message..." 
          value={msgContent} 
          onChange={e => setMsgContent(e.target.value)} 
          className="h-16 rounded-[1.5rem] pr-16 bg-muted border-none shadow-inner" 
        />
        <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 bg-primary text-primary-foreground p-3 rounded-2xl shadow-xl hover:scale-105 transition-transform">
          <Send className="w-5 h-5" />
        </button>
      </div>
      {msgPhoto && (
        <div className="flex items-center gap-4 bg-muted p-2 rounded-2xl border border-border animate-in slide-in-from-bottom-2">
           <img src={msgPhoto} className="w-12 h-12 rounded-lg object-cover" />
           <span className="text-[8px] font-black uppercase flex-1">Media Attached</span>
           <Button variant="ghost" size="sm" onClick={() => setMsgPhoto("")} className="rounded-full"><X className="w-3 h-3" /></Button>
        </div>
      )}
    </form>
  </Card>
  );
};

const Badge = ({ children, variant = 'info' }: any) => {
  const styles = {
    info: 'bg-primary/10 text-primary border border-primary/20',
    success: 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20',
    warning: 'bg-amber-500/10 text-amber-500 border border-amber-500/20',
    danger: 'bg-rose-500/10 text-rose-500 border border-rose-500/20',
  };
  return (
    <span className={cn("px-4 py-1.5 rounded-full text-[8px] font-black uppercase tracking-[0.2em]", styles[variant])}>
      {children}
    </span>
  );
};

const Modal = ({ isOpen, onClose, children }: { isOpen: boolean; onClose: () => void; children: React.ReactNode }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={onClose} className="absolute inset-0 bg-background/60 backdrop-blur-md" />
      <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} className="relative bg-card/60 backdrop-blur-3xl border border-white/20 dark:border-white/5 w-full max-w-xl rounded-[3rem] shadow-[0_8px_32px_0_rgba(31,38,135,0.37)] overflow-hidden">
        <button onClick={onClose} className="absolute top-8 right-8 text-foreground/50 hover:text-foreground p-2 rounded-full hover:bg-white/10 bg-white/5 transition-all z-10 border border-white/10">
          <X className="w-5 h-5" />
        </button>
        <div className="max-h-[85vh] overflow-y-auto custom-scrollbar">
          {children}
        </div>
      </motion.div>
    </div>
  );
};

const Send = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
  </svg>
);

export default DashboardPage;

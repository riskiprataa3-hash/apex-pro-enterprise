import { FirebaseImage } from "./FirebaseImage";
import { MassImportModal } from "./MassImportModal";
import { NeoDashboard } from "./NeoDashboard";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Home,
  Mail,
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
  RotateCw,
  Image as ImageIcon,
  BellRing,
  Settings,
  BarChart3,
  Wallet,
  HelpCircle,
  Menu,
} from "lucide-react";
import { SettingsView } from "./SettingsView";
import { DevMonitorTab } from "./DevMonitorTab";
import { AttendanceTab } from "./AttendanceTab";
import { DocumentationView } from "./DocumentationView";
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
  Bar,
} from "recharts";
import { useApp, Worker, Task, TaskHistoryLog } from "../context/AppContext";
import { motion, AnimatePresence } from "motion/react";
import { useSwipeable } from "react-swipeable";
import { Button, Card, Input, cn } from "./ui/Base";
import { ApexLogo } from "./ui/ApexLogo";

const HseCheckbox = ({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) => (
  <button
    onClick={() => onChange(!checked)}
    className={cn(
      "w-full flex items-center gap-4 p-4 rounded-2xl border transition-all text-left",
      checked
        ? "bg-emerald-500/10 border-emerald-500 shadow-lg shadow-emerald-500/10"
        : "bg-muted/10 border-border opacity-60 grayscale hover:opacity-100 hover:grayscale-0",
    )}
  >
    <div
      className={cn(
        "w-6 h-6 rounded-lg border flex items-center justify-center shrink-0 transition-all",
        checked
          ? "bg-emerald-500 border-emerald-500 text-white"
          : "border-muted-foreground/30",
      )}
    >
      {checked && <CheckCircle2 className="w-4 h-4" />}
    </div>
    <span
      className={cn(
        "text-xs font-bold uppercase tracking-tight leading-tight",
        checked
          ? "text-emerald-700 dark:text-emerald-400"
          : "text-muted-foreground",
      )}
    >
      {label}
    </span>
  </button>
);

interface EqReqCardProps {
  req: any;
  isAdmin: boolean;
  onUpdateStatus?: (id: string, status: any, note?: string) => Promise<void>;
  onReject?: (id: string) => void;
  onDelete?: (id: string) => void;
}

const EquipmentRequestCard: React.FC<EqReqCardProps> = ({
  req,
  isAdmin,
  onUpdateStatus,
  onReject,
  onDelete,
}) => {
  const statusColors: any = {
    pending: "bg-slate-500",
    approved: "bg-emerald-500",
    rejected: "bg-rose-500",
    "in-process": "bg-amber-500",
    completed: "bg-blue-500",
  };

  return (
    <div className="bg-card border border-border/50 rounded-2xl p-5 hover:shadow-xl transition-all group overflow-hidden relative">
      <div className="relative z-10">
        <div className="flex justify-between items-start mb-4">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={cn(
                  "text-[7px] font-bold uppercase px-2 py-0.5 rounded-full text-white",
                  req.type === "new"
                    ? "bg-emerald-500"
                    : req.type === "repair"
                      ? "bg-amber-500"
                      : "bg-rose-500",
                )}
              >
                {req.type}
              </span>
              <span
                className={cn(
                  "text-[7px] font-bold uppercase px-2 py-0.5 rounded-full text-white",
                  statusColors[req.status],
                )}
              >
                {req.status}
              </span>
            </div>
            <h4 className="text-base font-bold italic uppercase tracking-tight">
              {req.toolName}
            </h4>
            <p className="text-[10px] font-bold text-muted-foreground uppercase">
              {isAdmin
                ? `Oleh: ${req.userEmail}`
                : `Diajukan: ${new Date(req.timestamp).toLocaleDateString()}`}
            </p>
          </div>

          {isAdmin && onUpdateStatus && req.status === "pending" && (
            <div className="flex gap-1">
              <button
                onClick={() => onUpdateStatus(req.id, "in-process")}
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

          {isAdmin && onUpdateStatus && req.status === "in-process" && (
            <button
              onClick={() => onUpdateStatus(req.id, "completed")}
              className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-1 px-3"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span className="text-[10px] font-bold uppercase">Completed</span>
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

        <p className="text-xs text-muted-foreground leading-relaxed italic mb-4 line-clamp-3">
          "{req.description}"
        </p>

        {req.photo && (
          <div className="mb-4">
            <FirebaseImage
              url={req.photo}
              className="w-full h-32 object-cover rounded-2xl border border-border shadow-sm"
              alt="Evidence"
            />
          </div>
        )}

        {req.adminNote && (
          <div
            className={cn(
              "p-3 rounded-xl border flex items-start gap-2",
              req.status === "rejected"
                ? "bg-rose-500/5 border-rose-500/20"
                : "bg-muted border-border/50",
            )}
          >
            <AlertCircle
              className={cn(
                "w-3.5 h-3.5 shrink-0 mt-0.5",
                req.status === "rejected" ? "text-rose-500" : "text-primary",
              )}
            />
            <div>
              <p className="text-[10px] font-bold uppercase text-muted-foreground mb-0.5 italic">
                Respon Admin:
              </p>
              <p
                className={cn(
                  "text-xs font-bold",
                  req.status === "rejected" ? "text-rose-500" : "text-primary",
                )}
              >
                {req.adminNote}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

import { writeBatch, collection, doc } from "firebase/firestore";
import { db } from "../firebase";
import { toast } from "sonner";

const AutomatedDataImporter = ({
  projects,
  entries,
}: {
  projects: any[];
  entries: any[];
}) => {
  return null;
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
    announcementText,
    handleUpdateAnnouncementText,
    headerText,
    handleUpdateHeaderText,
    apdChecks,
    fuelLogs,
    activities,
    handleDeleteActivity,
    equipmentRequests,
    userProfile,
    handleCreateHseLog,
    handleCreateAPDCheck,
    handleSendSOS,
    handleSendEmailVerification,
    handleReportIncident,
    handleResolveIncident,
    handleDeleteIncident,
    handleClearAllIncidents,
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
    isAudit,
  } = useApp();
  const navigate = useNavigate();
  const [isMassImportModalOpen, setIsMassImportModalOpen] =
    React.useState(false);

  // --- DB REPAIR EFFECT ---
  React.useEffect(() => {
    const runTypeValidation = async () => {
      if (
        !isSuperAdmin ||
        localStorage.getItem("shaka_data_validated") === "true"
      )
        return;

      try {
        const { collectionGroup, getDocs, updateDoc } =
          await import("firebase/firestore");
        const { db } = await import("../firebase");
        const snap = await getDocs(collectionGroup(db as any, "entries"));
        let fixed = 0;

        for (const docSnap of snap.docs) {
          const data = docSnap.data();
          let updates: any = {};

          if (data.tonase && typeof data.tonase === "string")
            updates.tonase = parseFloat(data.tonase) || 0;
          if (data.volume && typeof data.volume === "string")
            updates.volume = parseFloat(data.volume) || 0;
          if (data.panjang && typeof data.panjang === "string")
            updates.panjang = parseFloat(data.panjang) || 0;
          if (data.lebar && typeof data.lebar === "string")
            updates.lebar = parseFloat(data.lebar) || 0;
          if (data.tebal && typeof data.tebal === "string")
            updates.tebal = parseFloat(data.tebal) || 0;
          if (data.density && typeof data.density === "string")
            updates.density = parseFloat(data.density) || 0;
          if (data.qty && typeof data.qty === "string")
            updates.qty = parseFloat(data.qty) || 0;

          if (data.km && typeof data.km !== "string")
            updates.km = String(data.km);
          if (data.kmTo && typeof data.kmTo !== "string")
            updates.kmTo = String(data.kmTo);
          if (data.lajur && typeof data.lajur !== "string")
            updates.lajur = String(data.lajur);

          if (Object.keys(updates).length > 0) {
            await updateDoc(docSnap.ref, updates);
            fixed++;
          }
        }
        console.log(`[Validation] Fixed data types for ${fixed} entries.`);
        localStorage.setItem("shaka_data_validated", "true");
      } catch (e) {
        console.error("[Validation Error]", e);
      }
    };
    runTypeValidation();
  }, [isSuperAdmin]);

  const [activeTab, setActiveTab] = React.useState<any>(() => {
    return localStorage.getItem("shaka_active_tab") || "home";
  });

  const [bgImage, setBgImage] = React.useState(
    () => localStorage.getItem("shaka_bg_img") || "",
  );

  React.useEffect(() => {
    const handleBgChange = ((e: CustomEvent) =>
      setBgImage(e.detail)) as EventListener;
    window.addEventListener("bgImageChanged", handleBgChange);
    return () => window.removeEventListener("bgImageChanged", handleBgChange);
  }, []);

  React.useEffect(() => {
    localStorage.setItem("shaka_active_tab", activeTab);
  }, [activeTab]);

  const [isTaskModalOpen, setIsTaskModalOpen] = React.useState(false);
  const [notificationPerm, setNotificationPerm] = React.useState<string>(
    typeof Notification !== "undefined" ? Notification.permission : "default",
  );

  const requestNotification = async () => {
    if (typeof Notification !== "undefined") {
      const p = await Notification.requestPermission();
      setNotificationPerm(p);
    }
  };

  const [isHseModalOpen, setIsHseModalOpen] = React.useState(false);
  const [isCashAdvanceModalOpen, setIsCashAdvanceModalOpen] =
    React.useState(false);
  const [cashAdvanceWorker, setCashAdvanceWorker] = React.useState<{
    email: string;
    name: string;
  } | null>(null);
  const [cashAdvanceAmount, setCashAdvanceAmount] = React.useState("");
  const [cashAdvanceNote, setCashAdvanceNote] = React.useState("");

  // --- START WORK SESSION (SAFETY CHECK) ---
  const [isStartWorkModalOpen, setIsStartWorkModalOpen] = React.useState(false);
  const [safetyChecked, setSafetyChecked] = React.useState({
    helm: false,
    rompi: false,
    sepatu: false,
  });
  const isReadyToWork = Object.values(safetyChecked).every(
    (val) => val === true,
  );

  const startWorkSession = async () => {
    if (!user || !isReadyToWork) return;
    try {
      const { collection, addDoc } = await import("firebase/firestore");
      const { db } = await import("../firebase");

      await addDoc(collection(db, "activities"), {
        userId: user.uid,
        userEmail: user.email || "",
        type: "hse",
        action: "CHECKIN",
        title: "Start Pekerjaan (APD Lengkap)",
        description:
          "Pekerja telah melakukan konfirmasi kesiapan APD: Helm, Rompi, dan Sepatu.",
        timestamp: Date.now(),
      });

      addNotification(
        "Success",
        "Sesi pekerjaan dimulai. Selalu utamakan keselamatan!",
        "success",
      );
      setIsStartWorkModalOpen(false);
      setSafetyChecked({ helm: false, rompi: false, sepatu: false });
    } catch (e: any) {
      addNotification("Failed", e.message, "error");
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
  const [incType, setIncType] = React.useState<"accident" | "near-miss">(
    "accident",
  );
  const [incDesc, setIncDesc] = React.useState("");
  const [incPhoto, setIncPhoto] = React.useState("");

  // States for Equipment Request
  const [isEqRequestModalOpen, setIsEqRequestModalOpen] = React.useState(false);
  const [isSubmittingEq, setIsSubmittingEq] = React.useState(false);
  const [isSubmittingHse, setIsSubmittingHse] = React.useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
  const [isSubmittingInc, setIsSubmittingInc] = React.useState(false);
  const [isSubmittingApd, setIsSubmittingApd] = React.useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = React.useState(false);
  const [rejectId, setRejectId] = React.useState("");
  const [rejectReason, setRejectReason] = React.useState("");
  const [eqToolName, setEqToolName] = React.useState("");
  const [eqType, setEqType] = React.useState<"new" | "repair" | "damaged">(
    "repair",
  );
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
    return Date.now() - userProfile.lastInductionAt > oneDay;
  }, [user, userProfile, isAdmin]);

  // States for creating task
  const [taskTitle, setTaskTitle] = React.useState("");
  const [taskDesc, setTaskDesc] = React.useState("");
  const [taskPriority, setTaskPriority] =
    React.useState<Task["priority"]>("medium");
  const [taskAssignees, setTaskAssignees] = React.useState<
    { name: string; email: string }[]
  >([]);
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
    const savedDraft = localStorage.getItem("shaka_dashboard_drafts");
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
      incDesc,
      incPhoto,
      eqToolName,
      eqDescription,
      eqPhoto,
      fuelEquip,
      fuelLiters,
      fuelNote,
      fuelPhoto,
      taskTitle,
      taskDesc,
      taskPhoto,
      msgContent,
      msgReceiver,
      msgPhoto,
    };
    localStorage.setItem("shaka_dashboard_drafts", JSON.stringify(drafts));
  }, [
    incDesc,
    incPhoto,
    eqToolName,
    eqDescription,
    eqPhoto,
    fuelEquip,
    fuelLiters,
    fuelNote,
    fuelPhoto,
    taskTitle,
    taskDesc,
    taskPhoto,
    msgContent,
    msgReceiver,
    msgPhoto,
  ]);

  // Helper to clear specific drafts after submission
  const clearDashboardDrafts = () => {
    localStorage.removeItem("shaka_dashboard_drafts");
  };
  // -----------------------------------------

  // Task filtering & sorting
  const [taskFilterStatus, setTaskFilterStatus] = React.useState<string>("all");
  const [taskSortBy, setTaskSortBy] = React.useState<"newest" | "priority">(
    "newest",
  );

  // States for worker management
  const [isWorkerModalOpen, setIsWorkerModalOpen] = React.useState(false);
  const [editingWorkerId, setEditingWorkerId] = React.useState<string | null>(
    null,
  );
  const [wEmpId, setWEmpId] = React.useState("");
  const [wName, setWName] = React.useState("");
  const [wEmail, setWEmail] = React.useState("");
  const [wPass, setWPass] = React.useState("");
  const [showWPass, setShowWPass] = React.useState(false);
  const [wRole, setWRole] = React.useState<Worker["role"]>("field-operator");
  const [wDailyRate, setWDailyRate] = React.useState("");
  const [wIsPinned, setWIsPinned] = React.useState(false);
  const [wGeoEnabled, setWGeoEnabled] = React.useState(false);
  const [wGeoLat, setWGeoLat] = React.useState("");
  const [wGeoLng, setWGeoLng] = React.useState("");
  const [wGeoRadius, setWGeoRadius] = React.useState("500");
  const [wRegu, setWRegu] = React.useState("");
  const [wJabatan, setWJabatan] = React.useState("");
  const [wKodeUnit, setWKodeUnit] = React.useState("");
  const [wRegion, setWRegion] = React.useState("");
  const [wUnitInduk, setWUnitInduk] = React.useState("");

  const [isEditingAnnouncement, setIsEditingAnnouncement] =
    React.useState(false);
  const [tempAnnouncement, setTempAnnouncement] = React.useState("");

  const [isEditingHeader, setIsEditingHeader] = React.useState(false);
  const [tempHeader, setTempHeader] = React.useState("");

  const [logoutConfirmOpen, setLogoutConfirmOpen] = React.useState(false);
  const [deleteConfirmParams, setDeleteConfirmParams] = React.useState<{
    isOpen: boolean;
    type: string;
    action: () => void;
    title: string;
    desc: string;
    confirmText?: string;
  } | null>(null);

  React.useEffect(() => {
    const handleTriggerLogout = () => setLogoutConfirmOpen(true);
    window.addEventListener("trigger-logout", handleTriggerLogout);
    return () =>
      window.removeEventListener("trigger-logout", handleTriggerLogout);
  }, []);

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
      setWRegu(worker.regu || "");
      setWJabatan(worker.jabatan || "");
      setWKodeUnit(worker.kodeUnit || "");
      setWRegion(worker.region || "");
      setWUnitInduk(worker.unitInduk || "");
    } else {
      setEditingWorkerId(null);
      setWEmpId("");
      setWName("");
      setWEmail("");
      setWPass("");
      setWRole("field-operator");
      setWDailyRate("");
      setWIsPinned(false);
      setWGeoEnabled(false);
      setWGeoLat("");
      setWGeoLng("");
      setWGeoRadius("500");
      setWRegu("");
      setWJabatan("");
      setWKodeUnit("");
      setWRegion("");
      setWUnitInduk("");
    }
    setIsWorkerModalOpen(true);
  };

  const handleCreateTaskInternal = async () => {
    if (!taskTitle) {
      addNotification("Failed", "Judul tugas harus diisi.", "warning");
      return;
    }
    if (taskAssignees.length === 0) {
      addNotification("Failed", "Select minimal satu pelaksana.", "warning");
      return;
    }

    try {
      const names = taskAssignees.map((a) => a.name);
      const emails = taskAssignees.map((a) => a.email);
      const dueDateTimestamp = taskDueDate
        ? new Date(taskDueDate).getTime()
        : undefined;

      await handleCreateTask(
        taskTitle,
        taskDesc,
        names,
        emails,
        taskPriority,
        taskPhoto,
        dueDateTimestamp,
        taskDocumentUrl,
      );
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
    let filtered = tasks.filter((t) => !!t.isArchived === showArchivedTasks);
    if (taskFilterStatus !== "all") {
      filtered = filtered.filter((t) => t.status === taskFilterStatus);
    }

    return filtered.sort((a, b) => {
      if (taskSortBy === "newest")
        return (b.createdAt || 0) - (a.createdAt || 0);
      const priorityMap: Record<string, number> = {
        high: 3,
        medium: 2,
        low: 1,
      };
      const bPrio = priorityMap[b.priority] || 0;
      const aPrio = priorityMap[a.priority] || 0;
      return bPrio - aPrio;
    });
  }, [tasks, taskFilterStatus, taskSortBy, showArchivedTasks]);

  const allEntries = React.useMemo(() => {
    const list: any[] = [];
    projects.forEach((p) => {
      if (p.entries) {
        p.entries.forEach((e) => list.push({ ...e, projectName: p.name }));
      }
    });
    return list.sort((a, b) => b.timestamp - a.timestamp);
  }, [projects]);

  // States for messaging
  const [isUploadingMsgPhoto, setIsUploadingMsgPhoto] = React.useState(false);

  // States for task realization
  const [realizationPhotos, setRealizationPhotos] = React.useState<
    Record<string, string[]>
  >({});
  const [isUploadingRealization, setIsUploadingRealization] = React.useState<
    Record<string, boolean>
  >({});

  const handleTaskRealizationUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    taskId: string,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const currentPhotos = realizationPhotos[taskId] || [];
    if (currentPhotos.length >= 6) {
      addNotification(
        "Batas Foto",
        "Maksimal 6 foto bukti pengerjaan.",
        "warning",
      );
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

    projects.forEach((p) => {
      // Only include metrics from non-archived projects for the global totals
      if (!p.isArchived) {
        // Accumulate targets
        if (p.type === "traffic-sign") targetSigns += p.targetQty || 0;
        if (p.type === "inlet") targetInlets += p.targetQty || 0;
        if (p.type === "painting") targetPainting += p.targetQty || 0;
        if (p.type === "planting") targetPlanting += p.targetQty || 0;
        if (p.type === "asphalt") targetAsphalt += p.targetQty || 0;

        let projectDbQty = 0;
        if (p.entries) {
          p.entries.forEach((e) => {
            // Only include non-archived entries in the totals
            if (!e.isArchived) {
              entriesCount++;
              if (p.type === "asphalt") {
                volumeTotal += Number(e.volume) || 0;
                tonaseTotal += Number(e.tonase) || 0;
              } else if (p.type === "traffic-sign") {
                signsTotal += Number(e.qty) || 0;
              } else if (p.type === "inlet") {
                projectDbQty += Number(e.qty) || 0;
              } else if (p.type === "painting") {
                paintingTotal += Number(e.qty) || 0;
              } else if (p.type === "planting") {
                plantingTotal += Number(e.qty) || 0;
              }
            }
          });
        }

        if (p.type === "inlet") {
          const isPekanbaruDumaiInlet = p.name?.toUpperCase()?.includes("PEKANBARU-DUMAI");
          const manualAddition = isPekanbaruDumaiInlet ? 401 : 0;
          inletsTotal += projectDbQty + manualAddition;
        }
      }
    });

    const activeProjects = projects.filter((p) => !p.isArchived);
    const hasAsphalt = activeProjects.some((p) => p.type === "asphalt");
    const hasSigns = activeProjects.some((p) => p.type === "traffic-sign");
    const hasInlets = activeProjects.some((p) => p.type === "inlet");
    const hasPainting = activeProjects.some((p) => p.type === "painting");
    const hasPlanting = activeProjects.some((p) => p.type === "planting");

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
      hasPlanting,
    };
  }, [projects]);

  const isBillingAccount =
    user?.email &&
    ["developmentshaka@gmail.com", "riskiprataa3@gmail.com"].includes(
      user?.email?.toLowerCase() || "",
    );

  const isDevAccount =
    user?.email &&
    [
      "developmentshaka@gmail.com",
      "development.shaka@gmail.com",
      "riskiprataa3@gmail.com",
    ].includes(user?.email?.toLowerCase() || "");

  const isTrustedAccount =
    isBillingAccount ||
    (user?.email &&
      /^(admin|pelaksana)\.shaka\d{0,2}@gmail\.com$/.test(
        user.email.toLowerCase(),
      ));

  const isEmailVerified = user?.emailVerified || isTrustedAccount;

  let navItems = [
    { id: "projects", label: "Projects", icon: Layers },
    { id: "attendance", label: "Team Attendance", icon: Calendar },
    { id: "tasks", label: "Tasks", icon: ClipboardList },
    { id: "equipment", label: "Equipment", icon: Wrench },
    { id: "activity", label: "History", icon: Activity },
    { id: "analytics", label: "Analytics", icon: BarChart3 },
    { id: "hse", label: "HSE", icon: ShieldCheck },
    { id: "messages", label: "Messages", icon: MessageSquare },
    ...(isSuperAdmin
      ? [{ id: "workers", label: "Operator Accounts", icon: UserPlus }]
      : []),
    ...(isAdmin
      ? [
          { id: "geofence", label: "Location Settings", icon: MapPin },
          { id: "access", label: "Operator Access", icon: Key },
          { id: "admin", label: "Operational Analytics", icon: ShieldCheck },
        ]
      : []),
    ...(isBillingAccount
      ? [{ id: "devmonitor", label: "Cloud & Billing", icon: Database }]
      : []),
    { id: "help", label: "Documentation", icon: HelpCircle },
  ];

  if (isAudit) {
    navItems = [
      { id: "projects", label: "Projects & Progress", icon: Layers },
      { id: "analytics", label: "Analytics", icon: BarChart3 },
    ];
  }

  const [isLoadingAnalytics, setIsLoadingAnalytics] = React.useState(false);

  const globalTimeData = React.useMemo(() => {
    const data: Record<
      string,
      { tonase: number; volume: number; units: number }
    > = {};
    [...allEntries]
      .sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0))
      .forEach((e) => {
        if (!e.timestamp || e.isArchived) return;
        try {
          const dateStr = new Date(e.timestamp).toLocaleDateString("id-ID", {
            day: "2-digit",
            month: "2-digit",
          });
          if (!data[dateStr])
            data[dateStr] = { tonase: 0, volume: 0, units: 0 };
          data[dateStr].tonase += e.tonase || 0;
          data[dateStr].volume += e.volume || 0;
          data[dateStr].units += e.qty || 0;
        } catch (err) {}
      });
    return Object.entries(data).map(([date, vals]) => ({ date, ...vals }));
  }, [allEntries]);

  // Global Material Stock Check
  React.useEffect(() => {
    if (!inventory || inventory.length === 0) return;
    const lowStockItems = inventory.filter(
      (item) => item.stock <= (item.minStock || 0),
    );
    if (lowStockItems.length > 0) {
      const names = lowStockItems.map((i) => i.name).join(", ");
      // debounce notification so it doesn't spam
      const lastStockWarn = sessionStorage.getItem("lastStockWarn");
      if (lastStockWarn !== new Date().toDateString()) {
        addNotification(
          "Warning Stok Menipis",
          `Stok material berikut menipis dan perlu re-order: ${names}`,
          "warning",
        );
        sessionStorage.setItem("lastStockWarn", new Date().toDateString());
      }
    }
  }, [inventory, addNotification]);

  // Handle SOS Emergency
  const [isSosLoading, setIsSosLoading] = React.useState(false);

  const handleSOS = async () => {
    if (!user) return;

    if (
      !window.confirm(
        "PERINGATAN! Anda akan mengirimkan sinyal darurat (SOS) ke seluruh sistem. Lanjutkan?",
      )
    )
      return;

    setIsSosLoading(true);
    try {
      let locationStr = "Location tidak tersedia";
      if ("geolocation" in navigator) {
        try {
          const position = await new Promise<GeolocationPosition>(
            (resolve, reject) => {
              navigator.geolocation.getCurrentPosition(resolve, reject, {
                timeout: 10000,
              });
            },
          );
          locationStr = `${position.coords.latitude}, ${position.coords.longitude}`;
        } catch (e) {
          console.warn("Geolocation failed", e);
        }
      }

      const { collection, addDoc } = await import("firebase/firestore");
      const { db } = await import("../firebase");

      await addDoc(collection(db, "incidents"), {
        userId: user.uid,
        userEmail: user.email || "",
        userName: user.displayName || user.email?.split("@")[0] || "User",
        type: "emergency",
        description: `DARURAT! SOS dipicu dari perangkat. Location: ${locationStr}`,
        timestamp: Date.now(),
        status: "open",
      });

      alert("Sinyal Darurat Terkirim! Tim pusat telah dinotifikasi.");
    } catch (error: any) {
      console.error("Failed kirim SOS", error);
      alert(`Failed mengirim SOS: ${error.message}`);
    } finally {
      setIsSosLoading(false);
    }
  };

  const handleTabChange = React.useCallback(
    (tabId: string) => {
      if (activeTab === tabId) return;
      React.startTransition(() => {
        setActiveTab(tabId);
      });
    },
    [activeTab],
  );

  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => {
      const currentIndex = navItems.findIndex((i) => i.id === activeTab);
      if (currentIndex !== -1 && currentIndex < navItems.length - 1)
        handleTabChange(navItems[currentIndex + 1].id);
    },
    onSwipedRight: () => {
      const currentIndex = navItems.findIndex((i) => i.id === activeTab);
      if (currentIndex > 0) handleTabChange(navItems[currentIndex - 1].id);
    },
    preventScrollOnSwipe: false,
    trackMouse: false,
    delta: 100,
  });

  return (
    <div className="flex h-screen text-foreground bg-background overflow-hidden font-sans select-none relative z-10 w-full">
      {/* Background Layer */}
      {bgImage && (
        <>
          <div
            className="absolute inset-0 z-[-2]"
            style={{
              backgroundImage: `url(${bgImage})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundAttachment: "fixed",
            }}
          />
          <div className="absolute inset-0 bg-background/80 backdrop-blur-md z-[-1]" />
        </>
      )}

      {/* Quota Exceeded Overlay */}
      <AnimatePresence>
        {quotaExceeded && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="fixed top-0 left-0 right-0 z-[100] bg-rose-600 text-white p-3 shadow-md flex items-center justify-center gap-3"
          >
            <AlertTriangle className="w-5 h-5 animate-pulse" />
            <div className="flex flex-col">
              <span className="text-xs font-bold uppercase tracking-widest leading-none">
                Limit Useran Tercapai (Blaze Plan)
              </span>
              <p className="text-[10px] font-bold opacity-80 leading-tight">
                Sistem mendeteksi penggunaan Resource yang tidak biasa atau
                limit anggaran tercapai. Harap periksa konsol manajemen untuk
                detail penggunaan.
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="ml-4 h-7 text-[10px] font-bold uppercase border border-white/30 hover:bg-white/20"
              onClick={() => setQuotaExceeded(false)}
            >
              Tutup
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Connectivity Indicator */}
      {!isOnline && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[60] sm:bottom-28">
          <div
            className={cn(
              "text-white text-[10px] sm:text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full shadow-md flex items-center gap-2 border border-white/20 transition-all bg-rose-500 animate-pulse backdrop-blur-md",
            )}
          >
            <WifiOff className="w-3 h-3" />
            <span className="flex flex-col text-left">
              <span>Mode Offline</span>
              <span className="text-[7px] text-white/80">
                Antrian Sinkronisasi Otomatis Aktif
              </span>
            </span>
          </div>
        </div>
      )}

      {/* Sidebar logic removed, everything relies on the new home grid in mobile/desktop */}

      {/* Main Context */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
        {isAdmin && (
          <AutomatedDataImporter projects={projects} entries={allEntries} />
        )}

        {/* Top Action Bar */}
        <header className="flex items-center justify-between px-4 md:px-6 pt-5 pb-3 z-30 relative bg-transparent">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="w-12 h-12 flex items-center justify-center bg-white dark:bg-slate-800 rounded-full shadow-md border-2 border-slate-200 dark:border-slate-700 hover:scale-105 transition-transform cursor-pointer focus:outline-none focus:ring-4 focus:ring-indigo-500/20"
              aria-label="Main Menu"
            >
              <Menu
                className="w-6 h-6 text-slate-800 dark:text-slate-200"
                strokeWidth={2.5}
              />
            </button>
            {activeTab === "home" ? (
              <div className="flex items-center gap-3">
                <div className="hidden sm:flex w-12 h-12 items-center justify-center bg-white dark:bg-slate-800 rounded-full shadow-md border-2 border-slate-200 dark:border-slate-700">
                  <ApexLogo className="w-8 h-8" size={16} showText={false} />
                </div>
              </div>
            ) : (
              <button
                onClick={() => handleTabChange("home")}
                className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full transition-all border-none font-bold shadow-md focus:outline-none focus:ring-4 focus:ring-indigo-500/30"
              >
                <ArrowRight className="w-5 h-5 rotate-180" strokeWidth={2.5} />
                <span className="font-black text-xs tracking-wider uppercase">
                  Home
                </span>
              </button>
            )}
          </div>

          <div className="hidden lg:flex items-center gap-4">
            {activeTab !== "home" &&
              (() => {
                const curTab = navItems.find((i) => i.id === activeTab);
                if (!curTab) return null;
                return (
                  <h2 className="text-xl font-bold capitalize flex items-center gap-2 text-foreground drop-shadow-sm">
                    <curTab.icon className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                    {curTab.label}
                  </h2>
                );
              })()}
          </div>

          <div className="flex items-center gap-2">
            {!isAdmin && user && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleSendSOS();
                }}
                className="flex items-center justify-center bg-rose-600 hover:bg-rose-700 text-white rounded-full shadow-md h-10 px-3 sm:px-4 gap-2 transition-all ring-1 ring-rose-500/50 mr-1"
                title="DARURAT SOS"
              >
                <Activity className="w-4 h-4 animate-pulse" />
                <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest hidden sm:inline-block">
                  SOS
                </span>
              </button>
            )}
            <div className="hidden sm:flex items-center gap-2 bg-white/50 dark:bg-slate-800/50 px-3 py-2 rounded-full border border-border/50 shadow-sm backdrop-blur-md">
              <div
                className={cn(
                  "w-2 h-2 rounded-full shadow-sm",
                  isOnline
                    ? isStandalone
                      ? "bg-indigo-500 animate-pulse"
                      : "bg-emerald-500 animate-pulse"
                    : "bg-rose-500",
                )}
              />
              <span className="text-[10px] font-black uppercase tracking-widest text-foreground">
                {isOnline
                  ? isStandalone
                    ? "Native Core"
                    : "Online"
                  : "Offline"}
              </span>
            </div>

            {notificationPerm !== "granted" &&
              notificationPerm !== "denied" && (
                <Button
                  variant="outline"
                  size="icon"
                  onClick={requestNotification}
                  className="rounded-full w-10 h-10 shadow-md border-none bg-amber-100 hover:bg-amber-200 dark:bg-amber-900/30 text-amber-600 animate-pulse transition-all ring-1 ring-black/5 dark:ring-white/10"
                  title="Aktifkan Push Notifikasi"
                >
                  <BellRing className="w-4 h-4" />
                </Button>
              )}

            <Button
              variant="outline"
              size="icon"
              onClick={() => navigate("/lite")}
              className="rounded-full w-10 h-10 flex items-center justify-center bg-white hover:bg-slate-50 dark:bg-slate-800 border-none shadow-md text-emerald-600 dark:hover:bg-slate-700 transition-all ring-1 ring-black/5 dark:ring-white/10"
              title="Lite / Offline Mode"
            >
              <WifiOff className="w-4 h-4" />
            </Button>

            <Button
              variant="outline"
              size="icon"
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="rounded-full w-10 h-10 flex items-center justify-center bg-slate-500 border-none text-white hover:bg-slate-600 transition-all shadow-md ring-1 ring-black/5 dark:ring-white/10"
            >
              {isDarkMode ? (
                <Sun className="w-4 h-4" />
              ) : (
                <Moon className="w-4 h-4" />
              )}
            </Button>

            <Button
              variant="outline"
              size="icon"
              onClick={() => window.location.reload()}
              className="rounded-full w-10 h-10 flex items-center justify-center bg-white hover:bg-slate-50 dark:bg-slate-800 border-none shadow-md text-blue-600 dark:hover:bg-slate-700 transition-all ring-1 ring-black/5 dark:ring-white/10"
              title="Refresh Data"
            >
              <RefreshCw className="w-4 h-4" />
            </Button>

            <Button
              variant="outline"
              size="icon"
              onClick={() => exportAllProjectsExcel()}
              className="rounded-full w-10 h-10 flex items-center justify-center bg-white hover:bg-slate-50 dark:bg-slate-800 border-none shadow-md text-foreground dark:hover:bg-slate-700 transition-all ring-1 ring-black/5 dark:ring-white/10"
              title="Download Excel"
            >
              <Download className="w-4 h-4" />
            </Button>

            {!isStandalone && (
              <Button
                variant="outline"
                size="icon"
                onClick={handleInstallApp}
                className="rounded-full w-10 h-10 md:hidden bg-indigo-600 border-none shadow-md text-white hover:bg-indigo-700 transition-all flex items-center justify-center ring-1 ring-black/5"
                title="Install Aplikasi"
              >
                <Smartphone className="w-4 h-4" strokeWidth={2.5} />
              </Button>
            )}

            <Button
              variant="ghost"
              onClick={() => handleTabChange("settings")}
              className="rounded-full w-10 h-10 flex items-center justify-center bg-white hover:bg-slate-50 dark:bg-slate-800 border-none shadow-md text-foreground dark:hover:bg-slate-700 transition-all ring-1 ring-black/5 dark:ring-white/10"
            >
              <Settings className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              onClick={() => setLogoutConfirmOpen(true)}
              className="rounded-full w-10 h-10 flex items-center justify-center bg-rose-50 hover:bg-rose-100 dark:bg-rose-500/10 border-none shadow-md text-rose-500 dark:hover:bg-rose-500/20 transition-all ring-1 ring-black/5 dark:ring-white/10"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </header>

        {/* Scrollable Main Content */}
        <main
          {...swipeHandlers}
          className="flex-1 overflow-y-auto px-4 pt-6 pb-24 lg:px-12 lg:pb-12 custom-scrollbar relative z-10 bg-transparent"
        >
          <div className="max-w-7xl mx-auto">
            {/* Active Tab Content */}
            <AnimatePresence mode="wait">
              {activeTab === "home" ? (
                <motion.div
                  key="home"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{
                    type: "spring",
                    stiffness: 800,
                    damping: 40,
                    ease: "easeOut",
                  }}
                  className="space-y-6 pt-2"
                >
                  <NeoDashboard />

                  {/* The Account Information and Menu Grid have been moved to the sidebar */}
                </motion.div>
              ) : (
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{
                    type: "spring",
                    stiffness: 800,
                    damping: 40,
                    ease: "easeOut",
                  }}
                  className="relative will-change-transform"
                >
                  {activeTab === "projects" && (
                    <div className="space-y-6">
                      <div className="flex flex-col xl:flex-row gap-5 items-start">
                        <div className="flex-1 w-full space-y-6">
                          {/* Stats Section */}
                          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            <StatCard
                              label="Total Projects"
                              value={projects.length}
                              icon={Layers}
                              color="text-rose-500"
                            />

                            {totals.hasAsphalt && (
                              <>
                                <StatCard
                                  label="Total Tonase"
                                  value={
                                    totals.tonaseCount > 0
                                      ? `${totals.tonaseCount.toLocaleString("id-ID", { minimumFractionDigits: 3, maximumFractionDigits: 3 })} t`
                                      : "0 t"
                                  }
                                  unit={
                                    totals.targetAsphalt > 0
                                      ? `Target: ${totals.targetAsphalt.toLocaleString("id-ID")} t`
                                      : undefined
                                  }
                                  icon={TrendingUp}
                                  color="text-emerald-500"
                                />
                                <StatCard
                                  label="Total Volume"
                                  value={
                                    totals.volumeCount > 0
                                      ? `${totals.volumeCount.toLocaleString("id-ID", { minimumFractionDigits: 3, maximumFractionDigits: 3 })} m³`
                                      : "0 m³"
                                  }
                                  icon={Database}
                                  color="text-blue-500"
                                />
                              </>
                            )}

                            {totals.hasSigns && (
                              <StatCard
                                label="Total Rambu"
                                value={`${totals.signsTotal.toLocaleString("id-ID")} PCS`}
                                unit={
                                  totals.targetSigns > 0
                                    ? `Target: ${totals.targetSigns.toLocaleString("id-ID")} | Kurang: ${Math.max(0, totals.targetSigns - totals.signsTotal).toLocaleString("id-ID")}`
                                    : undefined
                                }
                                icon={Activity}
                                color="text-amber-500"
                              />
                            )}

                            {totals.hasPainting && (
                              <StatCard
                                label="Total Marka"
                                value={`${totals.paintingTotal.toLocaleString("id-ID")} m²`}
                                unit={
                                  totals.targetPainting > 0
                                    ? `Target: ${totals.targetPainting.toLocaleString("id-ID")} | Kurang: ${Math.max(0, totals.targetPainting - totals.paintingTotal).toLocaleString("id-ID")}`
                                    : undefined
                                }
                                icon={Layers}
                                color="text-purple-500"
                              />
                            )}

                            {totals.hasInlets && (
                              <StatCard
                                label="Total Inlet"
                                value={`${totals.inletsTotal.toLocaleString("id-ID")} PCS`}
                                unit={
                                  totals.targetInlets > 0
                                    ? `Target: ${totals.targetInlets.toLocaleString("id-ID")} | Kurang: ${Math.max(0, totals.targetInlets - totals.inletsTotal).toLocaleString("id-ID")}`
                                    : undefined
                                }
                                icon={Database}
                                color="text-cyan-500"
                              />
                            )}

                            {totals.hasPlanting && (
                              <StatCard
                                label="Penghijauan"
                                value={`${totals.plantingTotal.toLocaleString("id-ID")} Phn`}
                                unit={
                                  totals.targetPlanting > 0
                                    ? `Target: ${totals.targetPlanting.toLocaleString("id-ID")} | Kurang: ${Math.max(0, totals.targetPlanting - totals.plantingTotal).toLocaleString("id-ID")}`
                                    : undefined
                                }
                                icon={TrendingUp}
                                color="text-green-500"
                              />
                            )}

                            <StatCard
                              label="Pekerja Aktif"
                              value={workers.length}
                              icon={UserPlus}
                              color="text-amber-500"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Actions & Filters */}
                      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between mt-6 bg-white p-4 md:p-5 rounded-2xl border-none shadow-sm">
                        <div className="relative flex-1 w-full flex gap-3">
                          <div className="relative flex-1">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <Input
                              placeholder="Search Projects..."
                              value={dashSearchQuery}
                              onChange={(e) =>
                                setDashSearchQuery(e.target.value)
                              }
                              className="pl-12 h-14 bg-slate-100 border-none rounded-2xl focus:ring-0 text-foreground text-sm md:text-base font-bold placeholder:font-bold placeholder:text-slate-400"
                            />
                          </div>
                          <Input
                            type="date"
                            value={dashDateFilter}
                            onChange={(e) => setDashDateFilter(e.target.value)}
                            className="w-auto px-4 h-14 bg-slate-100 border-none rounded-2xl hidden sm:block text-foreground font-extrabold focus:ring-0"
                          />
                        </div>
                        <div className="flex gap-2 w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0 hide-scrollbar">
                          <Button
                            variant="outline"
                            onClick={exportAllProjectsExcel}
                            className="shrink-0 h-14 rounded-2xl bg-card border border-border/50 border-none text-muted-foreground hover:bg-accent shadow-none flex items-center justify-center font-bold tracking-widest text-xs px-6 uppercase mt-1"
                          >
                            <FileSpreadsheet className="w-4 h-4 mr-2 text-emerald-600 shrink-0" />
                            Export
                          </Button>
                          <Button
                            variant={
                              showArchivedProjects ? "primary" : "outline"
                            }
                            onClick={() =>
                              setShowArchivedProjects(!showArchivedProjects)
                            }
                            className={cn(
                              "shrink-0 h-14 rounded-2xl transition-all font-bold tracking-widest text-xs px-6 border-none shadow-none uppercase flex items-center justify-center mt-1",
                              showArchivedProjects
                                ? "bg-amber-500 hover:bg-amber-600 text-white"
                                : "bg-card border border-border/50 hover:bg-accent text-muted-foreground",
                            )}
                          >
                            {showArchivedProjects ? (
                              <ArchiveRestore className="w-4 h-4 mr-2 shrink-0 text-white" />
                            ) : (
                              <Archive className="w-4 h-4 mr-2 text-amber-600 shrink-0" />
                            )}
                            {showArchivedProjects
                              ? "Projects Aktif"
                              : "Archive Projects"}
                          </Button>
                          {isDevAccount && (
                            <Button
                              onClick={() => setIsMassImportModalOpen(true)}
                              className="shrink-0 h-14 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-none px-4 flex items-center justify-center border-none ml-2 mt-1"
                            >
                              <Database className="w-4 h-4 mr-2" />
                              Impor Massal
                            </Button>
                          )}
                          {isAdmin && (
                            <Button
                              onClick={() => setIsNewProjectModalOpen(true)}
                              className="shrink-0 h-14 w-14 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white shadow-none px-0 flex items-center justify-center border-none ml-2 mt-1"
                            >
                              <Plus className="w-6 h-6" />
                            </Button>
                          )}
                        </div>
                      </div>

                      {/* Projects Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 pt-4">
                        {filteredProjects.length === 0 ? (
                          <div className="col-span-full py-20 flex flex-col items-center justify-center bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
                            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-gray-400 mb-4 shadow-sm border border-gray-100">
                              <Layers className="w-8 h-8 opacity-40" />
                            </div>
                            <h3 className="text-sm font-bold text-gray-500 tracking-wide">
                              Tidak There are Projects
                            </h3>
                            <p className="text-xs text-gray-400 mt-1">
                              Gunakan filter atau buat proyek baru
                            </p>
                          </div>
                        ) : (
                          <AnimatePresence mode="popLayout">
                            {filteredProjects.map((p, i) => (
                              <motion.div
                                key={p.id}
                                layout
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{
                                  opacity: 0,
                                  scale: 0.95,
                                  transition: {
                                    type: "spring",
                                    stiffness: 800,
                                    damping: 40,
                                  },
                                }}
                                transition={{
                                  type: "spring",
                                  stiffness: 800,
                                  damping: 40,
                                  delay: i * 0.05,
                                }}
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

                  {activeTab === "attendance" && <AttendanceTab />}

                  {activeTab === "tasks" && (
                    <div className="space-y-8">
                      <div className="flex flex-col md:flex-row md:items-center justify-between bg-muted/30 p-5 rounded-2xl border border-border gap-4">
                        <div className="flex items-center gap-4">
                          <div className="bg-rose-500/10 p-3 rounded-2xl">
                            <ClipboardList className="w-6 h-6 text-rose-500" />
                          </div>
                          <div>
                            <h2 className="text-xl font-bold italic uppercase">
                              Buku Tasks
                            </h2>
                            <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold">
                              Monitoring & Realization Lapangan
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 flex-wrap">
                          <div className="flex items-center bg-background rounded-xl px-3 border border-border">
                            <Filter className="w-3.5 h-3.5 text-muted-foreground mr-2" />
                            <select
                              value={taskFilterStatus}
                              onChange={(e) =>
                                setTaskFilterStatus(e.target.value)
                              }
                              className="bg-transparent h-10 text-xs font-bold uppercase outline-none"
                            >
                              <option value="all">Semua Status</option>
                              <option value="pending">Pending</option>
                              <option value="in-progress">Processing</option>
                              <option value="completed">Completed</option>
                            </select>
                          </div>

                          <button
                            onClick={() =>
                              setTaskSortBy((prev) =>
                                prev === "newest" ? "priority" : "newest",
                              )
                            }
                            className="flex items-center bg-background h-10 px-4 rounded-xl border border-border text-xs font-bold uppercase hover:bg-muted"
                          >
                            <ArrowUpDown className="w-3.5 h-3.5 mr-2" />
                            {taskSortBy === "newest" ? "Terbaru" : "Prioritas"}
                          </button>

                          <button
                            onClick={() =>
                              setShowArchivedTasks(!showArchivedTasks)
                            }
                            className={cn(
                              "flex items-center h-10 px-4 rounded-xl border transition-all text-xs font-bold uppercase shadow-sm",
                              showArchivedTasks
                                ? "bg-amber-500 border-amber-600 text-white shadow-amber-500/20"
                                : "bg-background border-border hover:bg-muted",
                            )}
                          >
                            {showArchivedTasks ? (
                              <ArchiveRestore className="w-3.5 h-3.5 mr-2" />
                            ) : (
                              <Archive className="w-3.5 h-3.5 mr-2" />
                            )}
                            {showArchivedTasks ? "Tasks Aktif" : "Lihat Archive"}
                          </button>

                          {isAdmin && (
                            <Button
                              onClick={() => setIsTaskModalOpen(true)}
                              className="rounded-xl h-10 px-6"
                            >
                              Buat Tasks
                            </Button>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        {sortedAndFilteredTasks.length === 0 ? (
                          <div className="col-span-full py-20 flex flex-col items-center justify-center bg-card/40 rounded-2xl border border-dashed border-border border px-8 text-center">
                            <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center text-muted-foreground mb-6">
                              <ClipboardList className="w-8 h-8 opacity-20" />
                            </div>
                            <h3 className="text-sm font-bold uppercase italic tracking-widest text-muted-foreground">
                              Buku Tasks Kosong
                            </h3>
                            <p className="text-xs text-muted-foreground/60 uppercase mt-2 max-w-xs leading-relaxed">
                              {tasks.length > 0
                                ? "Tasks yang Anda cari mungkin berada di filter status lain atau di arsip."
                                : "None yet instruksi tugas yang didelegasikan untuk Anda."}
                            </p>
                            {tasks.length > 0 && (
                              <div className="mt-8 flex flex-wrap justify-center gap-3">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setTaskFilterStatus("all")}
                                  className="text-[10px] font-bold uppercase tracking-widest rounded-xl border-primary text-primary px-6"
                                >
                                  Lihat Semua Status
                                </Button>
                                {showArchivedTasks && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setShowArchivedTasks(false)}
                                    className="text-[10px] font-bold uppercase tracking-widest rounded-xl px-6"
                                  >
                                    Lihat Tasks Aktif
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
                                exit={{
                                  opacity: 0,
                                  scale: 0.95,
                                  transition: {
                                    type: "spring",
                                    stiffness: 800,
                                    damping: 40,
                                  },
                                }}
                                transition={{
                                  type: "spring",
                                  stiffness: 800,
                                  damping: 40,
                                }}
                              >
                                <TaskCard
                                  task={task}
                                  isAdmin={isAdmin}
                                  currentUserEmail={user?.email}
                                  onUpdateStatus={handleUpdateTaskStatus}
                                  onDelete={(id: string) =>
                                    setDeleteConfirmParams({
                                      isOpen: true,
                                      type: "task",
                                      action: () => handleDeleteTask(id),
                                      title: "Delete Tasks",
                                      desc: "Apakah Anda yakin ingin menghapus tugas ini?",
                                    })
                                  }
                                  onArchive={handleArchiveTask}
                                  uploadingPhoto={
                                    isUploadingRealization[task.id]
                                  }
                                  localRealizationPhotos={
                                    realizationPhotos[task.id] || []
                                  }
                                  onUploadPhoto={(e: any) =>
                                    handleTaskRealizationUpload(e, task.id)
                                  }
                                  onClearLocalPhotos={() =>
                                    setRealizationPhotos((prev) => ({
                                      ...prev,
                                      [task.id]: [],
                                    }))
                                  }
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
                      <div className="flex items-center justify-between bg-muted/30 p-5 rounded-2xl border border-border">
                        <div className="flex items-center gap-4">
                          <div className="bg-amber-500/10 p-3 rounded-2xl">
                            <Smartphone className="w-6 h-6 text-amber-500" />
                          </div>
                          <div>
                            <h2 className="text-xl font-bold italic uppercase">
                              Mapping Unit & Pelaksana
                            </h2>
                            <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold">
                              Konfigurasi Akses Pegawai & Login Gateway
                            </p>
                          </div>
                        </div>
                        {isDevAccount && (
                          <Button
                            onClick={() => openWorkerModal()}
                            className="bg-amber-500 hover:bg-amber-600 rounded-2xl"
                          >
                            Add Pegawai
                          </Button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {workers.map((w) => (
                          <WorkerCard
                            key={w.id}
                            worker={w}
                            onDelete={(id: string) =>
                              setDeleteConfirmParams({
                                isOpen: true,
                                type: "worker",
                                action: () => handleDeleteWorker(id),
                                title: "Delete Pegawai",
                                desc: "Apakah Anda yakin ingin menghapus data pegawai ini?",
                              })
                            }
                            onEdit={() => openWorkerModal(w)}
                            isSuperAdmin={isSuperAdmin}
                            isDevAccount={isDevAccount}
                            onCashAdvance={() => {
                              setCashAdvanceWorker({
                                email: w.email || "",
                                name: w.name,
                              });
                              setIsCashAdvanceModalOpen(true);
                            }}
                          />
                        ))}
                        {workers.length === 0 && (
                          <div className="col-span-full py-24 text-center opacity-20 flex flex-col items-center">
                            <UserPlus className="w-16 h-16 mb-6" />
                            <span className="text-xs font-bold uppercase tracking-[0.5em]">
                              Personel Database Empty
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="pt-12 border-t border-border">
                        <div className="flex items-center gap-3 mb-8">
                          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_#10b981]" />
                          <h3 className="text-sm font-bold uppercase italic tracking-widest">
                            Sesi Aktif Real-time
                          </h3>
                          <Badge
                            variant="outline"
                            className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                          >
                            {activeSessions.length} Online
                          </Badge>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                          {activeSessions.map((s) => {
                            const worker = workers.find(
                              (w) =>
                                w.employeeId === s.email?.split("@")[0] ||
                                w.email === s.email,
                            );
                            return (
                              <Card
                                key={s.id}
                                className="p-4 bg-muted/20 border-border group hover:border-emerald-500/50 transition-all"
                              >
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 bg-emerald-500/10 rounded-full flex items-center justify-center text-emerald-500">
                                    <Smartphone className="w-5 h-5" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <h4 className="text-xs font-bold uppercase truncate">
                                      {worker?.name || s.email}
                                    </h4>
                                    <p className="text-[10px] font-bold text-muted-foreground uppercase">
                                      {s.email}
                                    </p>
                                  </div>
                                </div>
                                <div className="mt-4 flex items-center justify-between">
                                  <div className="flex flex-col">
                                    <span className="text-[6px] font-bold uppercase text-muted-foreground">
                                      Login Sejak
                                    </span>
                                    <span className="text-[10px] font-bold">
                                      {new Date(
                                        s.lastActive,
                                      ).toLocaleTimeString()}
                                    </span>
                                  </div>
                                  <Badge
                                    variant="ghost"
                                    className="text-[7px] font-bold italic bg-emerald-500/5 text-emerald-600"
                                  >
                                    LIVE
                                  </Badge>
                                </div>
                              </Card>
                            );
                          })}
                          {activeSessions.length === 0 && (
                            <div className="col-span-full py-12 text-center bg-muted/10 rounded-2xl border border-dashed border-border">
                              <p className="text-xs font-bold uppercase text-muted-foreground tracking-widest">
                                Tidak ada sesi aktif saat ini
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === "geofence" && isAdmin && (
                    <div className="space-y-8">
                      <div className="flex items-center justify-between bg-muted/30 p-5 rounded-2xl border border-border">
                        <div className="flex items-center gap-4">
                          <div className="bg-primary/10 p-3 rounded-2xl">
                            <MapPin className="w-6 h-6 text-primary" />
                          </div>
                          <div>
                            <h2 className="text-xl font-bold italic uppercase">
                              Geofencing & Location Login
                            </h2>
                            <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold">
                              Pengaturan Radius Izin Login Petugas Lapangan
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {workers.map((w) => (
                          <GeofenceCard
                            key={w.id}
                            worker={w}
                            onEdit={() => openWorkerModal(w)}
                          />
                        ))}
                        {workers.length === 0 && (
                          <div className="col-span-full py-24 text-center opacity-20 flex flex-col items-center">
                            <MapPin className="w-16 h-16 mb-6" />
                            <span className="text-xs font-bold uppercase tracking-[0.5em]">
                              No Personnel to Map
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="p-5 bg-amber-500/5 border border-amber-500/20 rounded-2xl flex items-start gap-4">
                        <AlertCircle className="w-6 h-6 text-amber-500 shrink-0" />
                        <div>
                          <h4 className="text-xs font-bold uppercase italic text-amber-600 mb-1">
                            Notes Penting
                          </h4>
                          <p className="text-xs font-medium text-amber-700/70 leading-relaxed uppercase">
                            Pastikan koordinat yang dimasukkan akurat. Petugas
                            tidak akan bisa masuk ke sistem jika berada di luar
                            radius yang ditentukan (GPS akan divalidasi saat
                            tombol 'Launch Sesi' ditekan).
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === "activity" && (
                    <div className="space-y-8">
                      <div className="flex flex-col md:flex-row md:items-center justify-between bg-card p-5 rounded-2xl border border-border gap-4 shadow-sm">
                        <div className="flex items-center gap-4">
                          <div className="bg-primary/10 p-3 rounded-2xl">
                            <Activity className="w-6 h-6 text-primary" />
                          </div>
                          <div>
                            <h2 className="text-xl font-bold italic uppercase tracking-tighter">
                              Timeline History
                            </h2>
                            <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold">
                              History Real-time Operasional Projects
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="max-w-4xl mx-auto space-y-6">
                        {activities.length === 0 ? (
                          <div className="py-24 text-center opacity-30">
                            <Activity className="w-16 h-16 mx-auto mb-4" />
                            <p className="text-xs font-bold uppercase tracking-widest italic">
                              None yet rekaman aktivitas
                            </p>
                          </div>
                        ) : (
                          <div className="relative border-l-2 border-border/50 ml-4 pl-8 space-y-8 h-[600px] overflow-y-auto pr-4 custom-scrollbar">
                            {activities.map((act) => (
                              <div key={act.id} className="relative">
                                <div className="absolute -left-[41px] top-4 w-4 h-4 bg-background border border-primary rounded-full z-10" />
                                <div className="bg-card border border-border/50 p-5 rounded-2xl shadow-sm hover:shadow-md transition-all">
                                  <div className="flex justify-between items-start mb-2">
                                    <div className="flex items-center gap-2">
                                      <div
                                        className={cn(
                                          "px-2 py-0.5 rounded-full text-[10px] font-bold italic uppercase text-white",
                                          act.type === "incident"
                                            ? "bg-rose-500"
                                            : act.type === "project"
                                              ? "bg-blue-500"
                                              : act.type === "task"
                                                ? "bg-amber-500"
                                                : "bg-emerald-500",
                                        )}
                                      >
                                        {act.type}
                                      </div>
                                      <span className="text-xs font-bold italic opacity-60 text-primary uppercase">
                                        {act.action}
                                      </span>
                                    </div>
                                    <span className="text-[10px] font-bold text-muted-foreground">
                                      {new Date(act.timestamp).toLocaleString(
                                        "id-ID",
                                      )}
                                    </span>
                                  </div>
                                  <h4 className="text-sm font-bold italic uppercase mb-1">
                                    {act.title}
                                  </h4>
                                  <p className="text-xs text-muted-foreground leading-relaxed italic mb-3">
                                    "{act.description}"
                                  </p>
                                  <div className="flex items-center justify-between pt-2 border-t border-border/50">
                                    <div className="flex items-center gap-2">
                                      <div className="w-5 h-5 bg-primary/20 rounded-full flex items-center justify-center text-[10px] font-bold text-primary">
                                        {act.userEmail?.[0].toUpperCase()}
                                      </div>
                                      <span className="text-[10px] font-medium text-muted-foreground">
                                        {act.userEmail}
                                      </span>
                                    </div>
                                    {isAdmin && (
                                      <button
                                        onClick={() =>
                                          setDeleteConfirmParams({
                                            isOpen: true,
                                            type: "act",
                                            action: () =>
                                              handleDeleteActivity(act.id),
                                            title: "Delete History",
                                            desc: "Menghapus riwayat aktivitas ini secara permanen?",
                                          })
                                        }
                                        className="p-1 hover:bg-rose-500/10 text-rose-500 rounded transition-colors ml-2"
                                        title="Delete History"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </button>
                                    )}
                                    {act.projectId &&
                                      projects.find(
                                        (p) => p.id === act.projectId,
                                      ) && (
                                        <Badge
                                          variant="ghost"
                                          className="text-[10px] font-bold uppercase text-muted-foreground"
                                        >
                                          PROYEK:{" "}
                                          {
                                            projects.find(
                                              (p) => p.id === act.projectId,
                                            )?.name
                                          }
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
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
                      <div className="flex flex-col md:flex-row md:items-center justify-between bg-card p-5 rounded-2xl border border-border gap-4 shadow-sm">
                        <div className="flex items-center gap-4">
                          <div className="bg-primary/10 p-3 rounded-2xl">
                            <BarChart3 className="w-6 h-6 text-primary" />
                          </div>
                          <div>
                            <h2 className="text-xl font-bold italic uppercase tracking-tighter">
                              Analytics Data
                            </h2>
                            <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold">
                              Rekapitulasi Dayan Projects
                            </p>
                          </div>
                        </div>
                      </div>

                      <Card className="p-5 rounded-2xl border border-border/50 bg-card overflow-hidden">
                        <div className="flex items-center justify-between mb-6">
                          <h3 className="text-sm font-bold uppercase tracking-widest">
                            Volume Dayan
                          </h3>
                          {isLoadingAnalytics && (
                            <RefreshCw className="w-4 h-4 animate-spin text-muted-foreground" />
                          )}
                        </div>
                        <div className="h-[300px] w-full">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                              data={globalTimeData}
                              margin={{
                                top: 10,
                                right: 10,
                                left: -20,
                                bottom: 0,
                              }}
                            >
                              <XAxis
                                dataKey="date"
                                tick={{ fontSize: 10 }}
                                tickMargin={10}
                                axisLine={false}
                                tickLine={false}
                              />
                              <YAxis
                                tick={{ fontSize: 10 }}
                                axisLine={false}
                                tickLine={false}
                              />
                              <Tooltip
                                contentStyle={{
                                  borderRadius: "1rem",
                                  border: "1px solid var(--border)",
                                  backgroundColor: "var(--card)",
                                }}
                                labelStyle={{
                                  fontWeight: 900,
                                  marginBottom: "0.5rem",
                                }}
                              />
                              <Bar
                                dataKey="tonase"
                                name="Tonase (t)"
                                fill="#10B981"
                                radius={[4, 4, 0, 0]}
                              />
                              <Bar
                                dataKey="volume"
                                name="Volume (m³)"
                                fill="#3B82F6"
                                radius={[4, 4, 0, 0]}
                              />
                              <Bar
                                dataKey="units"
                                name="Unit/Pcs"
                                fill="#F59E0B"
                                radius={[4, 4, 0, 0]}
                              />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </Card>
                    </div>
                  )}

                  {activeTab === "hse" && (
                    <div className="space-y-8">
                      <div className="flex flex-col md:flex-row md:items-center justify-between bg-muted/30 p-5 rounded-2xl border border-border gap-4">
                        <div className="flex items-center gap-4">
                          <div className="bg-emerald-500/10 p-3 rounded-2xl">
                            <ShieldCheck className="w-6 h-6 text-emerald-500" />
                          </div>
                          <div>
                            <h2 className="text-xl font-bold italic uppercase">
                              Safety Module (HSE)
                            </h2>
                            <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold">
                              International Works Safety Standards
                            </p>
                          </div>
                        </div>
                        {!isAdmin && (
                          <div className="flex flex-wrap gap-2">
                            <Button
                              onClick={() => setIsApdModalOpen(true)}
                              className="bg-amber-600 hover:bg-amber-700 rounded-2xl h-12 shadow-lg shadow-amber-500/20 text-xs sm:text-sm"
                            >
                              Inspeksi APD
                            </Button>
                            <Button
                              onClick={() => setIsHseModalOpen(true)}
                              className="bg-emerald-600 hover:bg-emerald-700 rounded-2xl h-12 shadow-lg shadow-emerald-500/20 text-xs sm:text-sm"
                            >
                              Checklist K3
                            </Button>
                          </div>
                        )}
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                        {/* HSE Analytics & Info */}
                        <Card className="p-5 rounded-2xl bg-background/40 border-border">
                          <h3 className="text-sm font-bold uppercase tracking-[0.2em] mb-6 flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <Activity className="w-4 h-4 text-primary" />{" "}
                              Statistik K3 Projects
                            </div>
                            {isAdmin && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                  setDeleteConfirmParams({
                                    isOpen: true,
                                    type: "all_hse_incidents",
                                    action: () => {
                                      (window as any).clearIncidentsAndHSE?.();
                                    },
                                    title: "Delete Semua Data K3 & Insiden",
                                    desc: "Apakah Anda yakin ingin menghapus total seluruh data checklist APD, data K3, dan riwayat insiden untuk semua proyek dari database? Tindakan ini tidak dapat dibatalkan.",
                                    confirmText: "Delete Total Data",
                                  });
                                }}
                                className="text-[10px] text-rose-500 hover:text-rose-600 hover:bg-rose-500/10"
                              >
                                Wipe Data
                              </Button>
                            )}
                          </h3>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="bg-muted/30 p-4 rounded-2xl border border-border">
                              <p className="text-xs font-bold uppercase text-muted-foreground mb-1">
                                Checklist Completed
                              </p>
                              <p className="text-2xl font-bold italic">
                                {hseLogs.length}
                              </p>
                            </div>
                            <div className="bg-rose-500/5 p-4 rounded-2xl border border-rose-500/20">
                              <p className="text-xs font-bold uppercase text-rose-500 mb-1">
                                Total Insiden
                              </p>
                              <p className="text-2xl font-bold italic text-rose-500">
                                {incidents.length}
                              </p>
                            </div>
                          </div>

                          <div className="mt-8 p-5 bg-primary/5 rounded-2xl border border-primary/10">
                            <h4 className="text-xs font-bold uppercase tracking-widest mb-3">
                              Health & Safety Policy
                            </h4>
                            <p className="text-xs leading-relaxed text-muted-foreground italic">
                              "Safety is the main priority every
                              personil di lapangan. PT. Shaka Anugerah Karya
                              berkomitmen untuk Zero Accident dalam setiap fase
                              operasional."
                            </p>
                          </div>
                        </Card>

                        {/* Incident Reports Card */}
                        <Card className="p-5 rounded-2xl bg-background/40 border-border overflow-hidden">
                          <div className="flex items-center justify-between mb-6">
                            <h3 className="text-sm font-bold uppercase tracking-[0.2em] flex items-center gap-2">
                              <History className="w-4 h-4 text-rose-500" />{" "}
                              History Insiden & SOS
                            </h3>
                            {isAdmin ? (
                              incidents.length > 0 && (
                                <Button
                                  onClick={() => {
                                    setDeleteConfirmParams({
                                      isOpen: true,
                                      type: "all_incidents",
                                      action: () => handleClearAllIncidents(),
                                      title: "Delete History Insiden",
                                      desc: "Apakah Anda yakin ingin menghapus total seluruh riwayat insiden secara permanen dari database? Tindakan ini tidak dapat dibatalkan.",
                                      confirmText: "Delete Total",
                                    });
                                  }}
                                  variant="destructive"
                                  size="sm"
                                  className="h-8 text-[10px] font-bold uppercase rounded-xl bg-rose-600 hover:bg-rose-700"
                                >
                                  Delete Semua
                                </Button>
                              )
                            ) : (
                              <Button
                                onClick={() => setIsIncidentModalOpen(true)}
                                variant="outline"
                                size="sm"
                                className="h-8 text-[10px] font-bold uppercase rounded-full"
                              >
                                Report Insiden
                              </Button>
                            )}
                          </div>

                          <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                            {incidents.length === 0 ? (
                              <div className="py-12 text-center opacity-30 text-xs font-bold uppercase tracking-widest italic">
                                None yet laporan insiden
                              </div>
                            ) : (
                              incidents.map((inc) => (
                                <div
                                  key={inc.id}
                                  className={cn(
                                    "p-4 rounded-2xl border flex items-center justify-between",
                                    inc.status === "open"
                                      ? "bg-rose-500/5 border-rose-500/20"
                                      : "bg-muted/20 border-border",
                                  )}
                                >
                                  <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                      <Badge
                                        variant={
                                          inc.type === "emergency"
                                            ? "destructive"
                                            : "outline"
                                        }
                                        className="text-[10px] font-bold italic uppercase"
                                      >
                                        {inc.type}
                                      </Badge>
                                      <span className="text-xs font-bold italic opacity-50 text-right">
                                        {new Date(inc.timestamp).toLocaleString(
                                          "id-ID",
                                          {
                                            day: "2-digit",
                                            month: "2-digit",
                                            year: "2-digit",
                                            hour: "2-digit",
                                            minute: "2-digit",
                                          },
                                        )}
                                      </span>
                                    </div>
                                    <p className="text-xs font-bold line-clamp-2">
                                      {inc.description}
                                    </p>
                                    <p className="text-[10px] text-muted-foreground">
                                      {inc.userEmail}
                                    </p>
                                  </div>
                                  <div className="flex items-center gap-1.5 whitespace-nowrap">
                                    {isAdmin && inc.status === "open" && (
                                      <Button
                                        size="sm"
                                        onClick={() => {
                                          setDeleteConfirmParams({
                                            isOpen: true,
                                            type: "resolve_incident",
                                            action: () => handleResolveIncident(inc.id),
                                            title: "Completedkan Insiden",
                                            desc: "Apakah Anda yakin ingin menandai insiden ini sebagai selesai (solved)?",
                                            confirmText: "Ya, Completed",
                                          });
                                        }}
                                        className="h-8 px-3 rounded-xl text-[10px] font-bold bg-rose-500 hover:bg-rose-600 text-white shrink-0"
                                      >
                                        Solve
                                      </Button>
                                    )}
                                    {isAdmin && (
                                      <Button
                                        size="icon"
                                        variant="ghost"
                                        onClick={() => {
                                          setDeleteConfirmParams({
                                            isOpen: true,
                                            type: "delete_incident",
                                            action: () => handleDeleteIncident(inc.id),
                                            title: "Delete Report Insiden",
                                            desc: "Apakah Anda yakin ingin menghapus permanen laporan insiden ini? Tindakan ini tidak dapat dibatalkan.",
                                            confirmText: "Delete Permanen",
                                          });
                                        }}
                                        className="h-8 w-8 text-rose-500 hover:text-rose-600 hover:bg-rose-500/10 rounded-xl shrink-0"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </Button>
                                    )}
                                  </div>
                                </div>
                              ))
                            )}
                          </div>
                        </Card>

                        {/* APD Reports Card */}
                        <Card className="p-5 rounded-2xl bg-background/40 border-border overflow-hidden">
                          <div className="flex items-center justify-between mb-6">
                            <h3 className="text-sm font-bold uppercase tracking-[0.2em] flex items-center gap-2">
                              <History className="w-4 h-4 text-amber-500" />{" "}
                              History Inspeksi APD
                            </h3>
                          </div>

                          <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                            {apdChecks.length === 0 ? (
                              <div className="py-12 text-center opacity-30 text-xs font-bold uppercase tracking-widest italic">
                                None yet inspeksi APD
                              </div>
                            ) : (
                              apdChecks.map((apd) => (
                                <div
                                  key={apd.id}
                                  className={cn(
                                    "p-4 rounded-2xl border flex items-center justify-between",
                                    apd.status === "Tidak Lengkap"
                                      ? "bg-amber-500/5 border-amber-500/20"
                                      : "bg-muted/20 border-border",
                                  )}
                                >
                                  <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                      <Badge
                                        variant={
                                          apd.status === "Lengkap"
                                            ? "outline"
                                            : "destructive"
                                        }
                                        className={cn(
                                          "text-[10px] font-bold italic uppercase",
                                          apd.status === "Lengkap" &&
                                            "text-emerald-500 border-emerald-500/50",
                                        )}
                                      >
                                        {apd.status}
                                      </Badge>
                                      <span className="text-xs font-bold italic opacity-50 text-right">
                                        {new Date(apd.timestamp).toLocaleString(
                                          "id-ID",
                                          {
                                            day: "2-digit",
                                            month: "2-digit",
                                            year: "2-digit",
                                            hour: "2-digit",
                                            minute: "2-digit",
                                          },
                                        )}
                                      </span>
                                    </div>
                                    <p className="text-xs font-bold line-clamp-1">
                                      {apd.notes || "Tidak ada catatan"}
                                    </p>
                                    <p className="text-[10px] text-muted-foreground">
                                      {apd.userName}
                                    </p>
                                  </div>
                                  {apd.photo && (
                                    <div className="w-10 h-10 rounded-xl overflow-hidden shrink-0 border border-border">
                                      <FirebaseImage
                                        url={apd.photo}
                                        alt="APD"
                                        className="w-full h-full object-cover"
                                      />
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
                      <div className="flex flex-col md:flex-row md:items-center justify-between bg-card p-5 rounded-2xl border border-border gap-4 shadow-sm">
                        <div className="flex items-center gap-4">
                          <div className="bg-amber-500/10 p-3 rounded-2xl">
                            <Wrench className="w-6 h-6 text-amber-500" />
                          </div>
                          <div>
                            <h2 className="text-xl font-bold italic uppercase tracking-tighter">
                              Manajemen Equipment & Material
                            </h2>
                            <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold">
                              Status Ketersediaan & Pengajuan
                            </p>
                          </div>
                        </div>
                        {!isAdmin && (
                          <Button
                            onClick={() => setIsEqRequestModalOpen(true)}
                            className="bg-amber-500 hover:bg-amber-600 rounded-2xl h-12 shadow-lg shadow-amber-500/20 text-white font-bold italic px-8 transition-all hover:scale-105 active:scale-95"
                          >
                            Ajukan Equipment / Report Rusak
                          </Button>
                        )}
                      </div>

                      {isAdmin ? (
                        <div className="grid gap-5">
                          <div className="flex items-center justify-between">
                            <h3 className="text-sm font-bold uppercase tracking-[0.2em] flex items-center gap-2">
                              <History className="w-4 h-4 text-amber-500" />{" "}
                              Antrian Pengajuan (
                              {
                                equipmentRequests.filter(
                                  (r) =>
                                    r.status === "pending" ||
                                    r.status === "in-process",
                                ).length
                              }
                              )
                            </h3>
                            <div className="flex gap-2">
                              <Badge variant="warning">
                                {
                                  equipmentRequests.filter(
                                    (r) => r.status === "pending",
                                  ).length
                                }{" "}
                                Pending
                              </Badge>
                              <Badge variant="info">
                                {
                                  equipmentRequests.filter(
                                    (r) => r.status === "in-process",
                                  ).length
                                }{" "}
                                Processing
                              </Badge>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                            {equipmentRequests.length === 0 ? (
                              <div className="col-span-full py-16 text-center border border-dashed border-border rounded-2xl opacity-30 italic text-xs font-bold uppercase tracking-widest">
                                None yet antrian pengajuan
                              </div>
                            ) : (
                              equipmentRequests
                                .sort((a, b) => b.timestamp - a.timestamp)
                                .map((req) => (
                                  <EquipmentRequestCard
                                    key={req.id}
                                    req={req}
                                    isAdmin={true}
                                    onUpdateStatus={
                                      handleUpdateEquipmentRequestStatus
                                    }
                                    onDelete={(id) =>
                                      setDeleteConfirmParams({
                                        isOpen: true,
                                        type: "eq",
                                        action: () =>
                                          handleDeleteEquipmentRequest(id),
                                        title: "Delete Request",
                                        desc: "Delete pengajuan alat ini secara permanen?",
                                      })
                                    }
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
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                          <Card className="p-5 rounded-2xl bg-card/40 border-border">
                            <h3 className="text-sm font-bold uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                              <Clock className="w-4 h-4 text-amber-500" />{" "}
                              History Pengajuan Anda
                            </h3>
                            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                              {equipmentRequests.filter(
                                (r) => r.userId === user?.uid,
                              ).length === 0 ? (
                                <div className="py-12 text-center opacity-30 text-xs font-bold uppercase tracking-widest italic">
                                  Anda belum pernah membuat pengajuan alat
                                </div>
                              ) : (
                                equipmentRequests
                                  .filter((r) => r.userId === user?.uid)
                                  .sort((a, b) => b.timestamp - a.timestamp)
                                  .map((req) => (
                                    <EquipmentRequestCard
                                      key={req.id}
                                      req={req}
                                      isAdmin={false}
                                      onDelete={
                                        req.status === "pending" || isAdmin
                                          ? (id) =>
                                              setDeleteConfirmParams({
                                                isOpen: true,
                                                type: "eq",
                                                action: () =>
                                                  handleDeleteEquipmentRequest(
                                                    id,
                                                  ),
                                                title: "Delete Request",
                                                desc: "Delete pengajuan alat ini secara permanen?",
                                              })
                                          : undefined
                                      }
                                      onReject={() => {}}
                                    />
                                  ))
                              )}
                            </div>
                          </Card>

                          <div className="space-y-6">
                            <Card className="p-5 rounded-2xl bg-amber-500/5 border-amber-500/10 h-fit">
                              <div className="flex items-center gap-3 mb-6">
                                <AlertCircle className="w-5 h-5 text-amber-600" />
                                <h4 className="text-xs font-bold uppercase tracking-widest text-amber-800">
                                  SOP Pelaporan Sarana
                                </h4>
                              </div>
                              <div className="space-y-4">
                                {[
                                  {
                                    t: "Pengecekan Rutin",
                                    d: "Lakukan pengecekan alat setiap pagi sebelum memulai shift melalui menu HSE.",
                                  },
                                  {
                                    t: "Report Segera",
                                    d: "Kerusakan alat saat bekerja wajib segera dilaporkan untuk menghindari kendala produksi.",
                                  },
                                  {
                                    t: "Dokumentasi",
                                    d: "Lampirkan foto kerusakan yang jelas agar admin dapat memproses perbaikan lebih cepat.",
                                  },
                                ].map((item, i) => (
                                  <div key={i} className="flex gap-3">
                                    <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                                    <div>
                                      <p className="text-xs font-bold uppercase text-amber-900">
                                        {item.t}
                                      </p>
                                      <p className="text-xs text-amber-700 leading-relaxed italic">
                                        {item.d}
                                      </p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </Card>

                            {currentProject?.requiredTools && (
                              <Card className="p-5 rounded-2xl bg-card/60 border-border">
                                <h3 className="text-xs font-bold uppercase tracking-widest mb-6">
                                  Daftar Equipment Wajib Projects
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                  {currentProject.requiredTools.map((t) => (
                                    <div
                                      key={t}
                                      className="bg-muted px-4 py-2 rounded-xl text-xs font-bold uppercase border border-border"
                                    >
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
                        onUploadPhoto={async (e: any) => {
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
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
                      <div className="bg-amber-500/10 p-5 rounded-2xl border border-amber-500/20">
                        <div className="flex items-center gap-5 mb-8">
                          <div className="bg-amber-500 p-4 rounded-2xl shadow-xl shadow-amber-500/20">
                            <Key className="w-8 h-8 text-white" />
                          </div>
                          <div>
                            <h3 className="text-2xl font-bold italic uppercase tracking-tighter">
                              Manajemen Akses Pelaksana
                            </h3>
                            <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold opacity-70">
                              Generate & Monitor Kunci Sandi OTP (One-Time
                              Password)
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                          <Card className="p-5 rounded-2xl bg-card/60 backdrop-blur-xl border-border flex flex-col justify-between shadow-md">
                            <div>
                              <div className="flex items-center gap-2 mb-6">
                                <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                                <h4 className="text-xs font-bold uppercase tracking-widest opacity-70">
                                  Konfigurasi Login
                                </h4>
                              </div>
                              <div className="space-y-4">
                                <div className="bg-background/60 p-5 rounded-2xl border border-border/50">
                                  <p className="text-[10px] font-bold uppercase text-muted-foreground mb-1">
                                    Email Target
                                  </p>
                                  <p className="text-xs font-bold text-primary">
                                    pelaksana.shaka@gmail.com
                                  </p>
                                </div>
                                <div className="bg-background/60 p-5 rounded-2xl border border-border/50">
                                  <p className="text-[10px] font-bold uppercase text-muted-foreground mb-1">
                                    Sistem Keamanan
                                  </p>
                                  <p className="text-xs font-bold text-amber-500 uppercase italic">
                                    Multi-Factor OTP
                                  </p>
                                </div>
                              </div>
                            </div>
                            <div className="mt-8 pt-8 border-t border-border/50">
                              <div className="mb-4">
                                <p className="text-[10px] font-bold uppercase text-muted-foreground mb-2 px-1">
                                  Atur Kunci Manual (Opsional)
                                </p>
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
                                  const input = document.getElementById(
                                    "customKeyInput",
                                  ) as HTMLInputElement;
                                  generatePelaksanaKey(input?.value);
                                  if (input) input.value = "";
                                }}
                                className="w-full h-16 bg-amber-500 hover:bg-amber-600 text-white rounded-2xl text-xs font-bold uppercase tracking-widest shadow-[0_10px_30px_rgba(245,158,11,0.3)] group transition-all active:scale-95"
                              >
                                <RefreshCw className="mr-3 w-5 h-5 group-hover:rotate-180 transition-transform duration-500" />
                                Update Kunci Akses
                              </Button>
                              <p className="text-[10px] text-center mt-4 text-muted-foreground uppercase font-bold tracking-tighter opacity-60">
                                Kosongkan kolom untuk kode otomatis
                              </p>
                            </div>
                          </Card>

                          <div className="lg:col-span-2 space-y-8">
                            <Card className="p-10 rounded-2xl border-primary/30 bg-primary/5 min-h-[220px] flex items-center justify-center relative overflow-hidden group">
                              <div className="absolute -top-10 -right-10 p-5 opacity-5 group-hover:rotate-12 transition-transform duration-500">
                                <ShieldCheck
                                  size={200}
                                  className="text-primary"
                                />
                              </div>
                              <div className="text-center relative z-10">
                                <p className="text-[12px] font-bold uppercase tracking-[0.5em] mb-6 opacity-40">
                                  Kunci Aktif Saat Ini
                                </p>
                                {activeAccessKeys.find(
                                  (k) => k.status === "active",
                                ) ? (
                                  <div className="space-y-6">
                                    <div className="relative inline-block">
                                      <h2 className="text-8xl font-bold italic tracking-tighter text-primary drop-shadow-md animate-in zoom-in spin-in-1 duration-700">
                                        {
                                          activeAccessKeys.find(
                                            (k) => k.status === "active",
                                          ).password
                                        }
                                      </h2>
                                      <div className="absolute -inset-4 bg-primary/10 blur-3xl -z-10 rounded-full" />
                                    </div>
                                    <div className="flex items-center justify-center gap-3">
                                      <div className="flex gap-1">
                                        {[1, 2, 3].map((i) => (
                                          <div
                                            key={i}
                                            className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce"
                                            style={{
                                              animationDelay: `${i * 0.2}s`,
                                            }}
                                          />
                                        ))}
                                      </div>
                                      <p className="text-xs font-bold text-emerald-500 uppercase tracking-[0.2em]">
                                        Ready for deployment
                                      </p>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="space-y-6 opacity-30">
                                    <h2 className="text-5xl font-bold italic tracking-tighter uppercase">
                                      TIDAK ADA KUNCI
                                    </h2>
                                    <div className="w-16 h-1 w-full max-w-[200px] mx-auto bg-rose-500/20 rounded-full overflow-hidden">
                                      <div className="w-1/3 h-full bg-rose-500 animate-[loading_2s_infinite_linear]" />
                                    </div>
                                    <p className="text-xs font-bold text-rose-500 uppercase tracking-widest">
                                      Silakan Generate Untuk Akses Pelaksana
                                    </p>
                                  </div>
                                )}
                              </div>
                            </Card>

                            <div className="bg-card/40 rounded-2xl p-5 border border-border/50 shadow-sm">
                              <div className="flex items-center justify-between mb-6">
                                <h5 className="text-xs font-bold uppercase tracking-[0.3em] flex items-center gap-3 opacity-60">
                                  <History className="w-4 h-4" />
                                  History Useran
                                </h5>
                                <span className="text-[10px] font-bold text-muted-foreground uppercase bg-muted px-3 py-1 rounded-full italic">
                                  3 Key Terakhir
                                </span>
                              </div>
                              <div className="grid grid-cols-1 gap-4">
                                {activeAccessKeys
                                  .sort(
                                    (a, b) =>
                                      (b.createdAt || 0) - (a.createdAt || 0),
                                  )
                                  .filter((k) => k.status !== "active")
                                  .slice(0, 3)
                                  .map((key) => (
                                    <div
                                      key={key.id}
                                      className="flex items-center justify-between p-5 bg-background/40 hover:bg-background/80 rounded-2xl border border-border/30 transition-all group"
                                    >
                                      <div className="flex items-center gap-5">
                                        <div className="w-12 h-12 rounded-xl bg-muted/50 flex items-center justify-center group-hover:bg-primary/5 transition-colors">
                                          <span className="text-sm font-bold italic text-muted-foreground group-hover:text-primary transition-colors">
                                            {key.password}
                                          </span>
                                        </div>
                                        <div>
                                          <span
                                            className={cn(
                                              "text-[10px] font-bold uppercase px-3 py-1 rounded-full inline-block mb-1",
                                              key.status === "used"
                                                ? "bg-emerald-500/10 text-emerald-500"
                                                : "bg-rose-500/10 text-rose-500",
                                            )}
                                          >
                                            {key.status === "used"
                                              ? "Sudah Terpakai"
                                              : "Kadaluarsa"}
                                          </span>
                                          <p className="text-[10px] font-bold text-muted-foreground/60 uppercase">
                                            Created:{" "}
                                            {new Date(
                                              key.createdAt,
                                            ).toLocaleDateString()}{" "}
                                            {new Date(
                                              key.createdAt,
                                            ).toLocaleTimeString()}
                                          </p>
                                        </div>
                                      </div>
                                      <div className="text-right">
                                        <p className="text-xs font-bold text-primary italic">
                                          {key.usedAt
                                            ? `USED AT ${new Date(key.usedAt).toLocaleTimeString()}`
                                            : "EXPIRED"}
                                        </p>
                                        <span className="text-[10px] text-muted-foreground opacity-40 uppercase font-bold tracking-tighter">
                                          Record ID: {key.id.slice(0, 8)}
                                        </span>
                                      </div>
                                    </div>
                                  ))}
                                {activeAccessKeys.filter(
                                  (k) => k.status !== "active",
                                ).length === 0 && (
                                  <div className="text-center py-8 opacity-20 italic text-xs font-bold uppercase tracking-widest border border-dashed border-border rounded-2xl">
                                    None yet riwayat kunci
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
                      <div className="bg-muted/30 p-5 rounded-2xl border border-border">
                        <div className="flex items-center gap-4">
                          <div className="bg-primary/10 p-3 rounded-2xl">
                            <TrendingUp className="w-6 h-6 text-primary" />
                          </div>
                          <div>
                            <h2 className="text-xl font-bold italic uppercase">
                              Analytics Analytics Operasional
                            </h2>
                            <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold">
                              Statistik Penyelesaian & Performa
                            </p>
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
                            <h3 className="text-xl font-bold italic uppercase">
                              Estimasi Biaya Operasional
                            </h3>
                            <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold">
                              Ringkasan Useran Material & Budget
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                          {[
                            {
                              title: "Asphalt (Hotmix)",
                              val: totals.tonaseCount * 850000,
                              color: "text-emerald-500",
                              bg: "bg-emerald-500/5",
                              icon: Activity,
                            },
                            {
                              title: "Penghijauan",
                              val: totals.plantingTotal * 125000,
                              color: "text-rose-500",
                              bg: "bg-rose-500/5",
                              icon: Target,
                            },
                          ].map((b, i) => (
                            <Card
                              key={i}
                              className={cn(
                                "p-5 border-transparent shadow-sm",
                                b.bg,
                              )}
                            >
                              <div className="flex items-center justify-between mb-4">
                                <b.icon className={cn("w-5 h-5", b.color)} />
                                <span className="text-[10px] font-bold uppercase text-muted-foreground">
                                  Estimated Cost
                                </span>
                              </div>
                              <h4 className="text-xs font-bold uppercase tracking-widest mb-1">
                                {b.title}
                              </h4>
                              <p
                                className={cn(
                                  "text-xl font-bold italic",
                                  b.color,
                                )}
                              >
                                Rp {b.val.toLocaleString("id-ID")}
                              </p>
                            </Card>
                          ))}
                        </div>

                        <Card className="mt-6 p-5 bg-primary/5 border-primary/20 rounded-2xl">
                          <div className="flex flex-col md:flex-row justify-between items-center gap-5">
                            <div className="flex items-center gap-4">
                              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                                <Database className="w-8 h-8" />
                              </div>
                              <div>
                                <h4 className="text-sm font-bold uppercase italic tracking-tighter">
                                  Total Akumulasi Biaya Projects
                                </h4>
                                <p className="text-xs text-muted-foreground">
                                  Total estimasi pengeluaran berdasarkan log
                                  material operasional di lapangan.
                                </p>
                              </div>
                            </div>
                            <div className="text-center md:text-right">
                              <p className="text-3xl font-bold italic text-primary">
                                Rp{" "}
                                {(
                                  totals.tonaseCount * 850000 +
                                  totals.plantingTotal * 125000
                                ).toLocaleString("id-ID")}
                              </p>
                              <p className="text-[10px] font-bold uppercase tracking-[0.3em] opacity-50 mt-1">
                                CURRENCY: INDONESIAN RUPIAH (IDR)
                              </p>
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
                            <h3 className="text-xl font-bold italic uppercase">
                              Database Maintenance
                            </h3>
                            <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold">
                              Equipment Pembersihan Data Cloud (Hanya Admin)
                            </p>
                          </div>
                        </div>

                        <Card className="p-5 border-rose-500/20 bg-rose-500/5 rounded-2xl overflow-hidden relative">
                          <div className="absolute top-0 right-0 p-5 opacity-5">
                            <Trash2 size={120} />
                          </div>
                          <div className="relative z-10 space-y-4">
                            <h4 className="text-sm font-bold uppercase tracking-tight text-rose-600 dark:text-rose-400">
                              Pembersihan Pekerjaan Inlet
                            </h4>
                            <p className="text-xs text-muted-foreground max-w-2xl leading-relaxed">
                              Gunakan alat ini untuk menghapus{" "}
                              <strong>
                                seluruh data input pekerjaan Inlet
                              </strong>{" "}
                              beserta dokumentasinya dari cloud. Tindakan ini
                              bersifat permanen dan tidak dapat dibatalkan.
                            </p>
                            <div className="flex pt-4">
                              <Button
                                variant="outline"
                                onClick={() => {
                                  if (
                                    confirm(
                                      "PERINGATAN: Anda akan menghapus SELURUH data Inlet dan dokumentasinya secara permanen. Lanjutkan?",
                                    )
                                  ) {
                                    handleDeleteAllInletData();
                                  }
                                }}
                                className="h-14 px-8 rounded-2xl border-rose-500 text-rose-500 hover:bg-rose-500 hover:text-white transition-all group"
                              >
                                <Trash2 className="w-5 h-5 mr-3 group-hover:animate-pulse" />
                                <span className="text-xs font-bold uppercase tracking-widest">
                                  Delete Semua Data Inlet
                                </span>
                              </Button>
                            </div>
                          </div>
                        </Card>
                      </div>
                    </div>
                  )}

                  {activeTab === "settings" && <SettingsView />}

                  {activeTab === "devmonitor" && isBillingAccount && (
                    <DevMonitorTab />
                  )}

                  {activeTab === "help" && <DocumentationView />}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </main>

        {/* Sleek Mobile Bottom Nav removed as part of user request to move to Sidebar */}

        {/* Sidebar Overlay */}
        <AnimatePresence>
          {isSidebarOpen && (
            <div className="fixed inset-0 z-[200] flex">
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsSidebarOpen(false)}
                className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              />

              {/* Sidebar Content */}
              <motion.div
                initial={{ x: "-100%" }}
                animate={{ x: 0 }}
                exit={{ x: "-100%" }}
                transition={{ type: "spring", damping: 40, stiffness: 800 }}
                className="relative w-4/5 max-w-sm h-full bg-white dark:bg-slate-950 shadow-2xl flex flex-col z-[201] overflow-y-auto"
              >
                {/* Account Header */}
                <div className="p-6 bg-gradient-to-br from-indigo-600 to-blue-700 text-white">
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-16 h-16 rounded-2xl bg-white/20 border border-white/30 flex items-center justify-center overflow-hidden shadow-inner p-1">
                      <img
                        src="/icon.svg"
                        alt="Shaka Logo"
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <button
                      onClick={() => setIsSidebarOpen(false)}
                      className="w-8 h-8 flex items-center justify-center rounded-full bg-black/20 hover:bg-black/30 text-white transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <h2 className="text-xl font-bold truncate tracking-tight">
                    {user?.displayName || "User"}
                  </h2>
                  <p className="text-sm text-blue-100 truncate mt-0.5">
                    {user?.email}
                  </p>
                  <div className="mt-4 flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-widest bg-white text-indigo-700 px-3 py-1 rounded-full shadow-sm">
                      {userProfile?.role || "Worker"}
                    </span>
                    <span className="text-[10px] font-black uppercase tracking-widest bg-blue-500 text-white px-3 py-1 rounded-full border border-blue-400">
                      {isOnline ? "Online" : "Offline"}
                    </span>
                  </div>
                </div>

                {/* Navigation Menu */}
                <div className="flex-1 px-4 py-6 space-y-8 overflow-y-auto">
                  <div className="space-y-1">
                    <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3 px-3">
                      Main Menu
                    </h3>
                    {navItems
                      .filter((item) => {
                        if (item.id === "devmonitor" && !isBillingAccount)
                          return false;
                        return true;
                      })
                      .map((item) => (
                        <button
                          key={item.id}
                          onClick={() => {
                            handleTabChange(item.id);
                            setIsSidebarOpen(false);
                          }}
                          className={cn(
                            "w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all text-left font-semibold",
                            activeTab === item.id
                              ? "bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400"
                              : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900",
                          )}
                        >
                          <item.icon
                            className={cn(
                              "w-5 h-5",
                              activeTab === item.id
                                ? "text-indigo-600 dark:text-indigo-400"
                                : "text-slate-400",
                            )}
                          />
                          <span className="flex-1">{item.label}</span>
                          {activeTab === item.id && (
                            <div className="w-1.5 h-1.5 rounded-full bg-indigo-600 dark:bg-indigo-400" />
                          )}
                        </button>
                      ))}
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="p-4 border-t border-slate-100 dark:border-slate-800 space-y-2 pb-safe">
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsSidebarOpen(false);
                    }}
                    className="w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all text-left font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10"
                  >
                    <LogOut className="w-5 h-5 text-rose-500" />
                    <span>Logout Akun</span>
                  </button>
                </div>
              </motion.div>
            </div>
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
            <div className="max-w-md w-full bg-card border-border border rounded-2xl p-5 shadow-md relative overflow-hidden">
               <div className="absolute top-0 right-0 p-5 opacity-5">
                  <ShieldCheck size={120} className="text-primary" />
               </div>
               
               <div className="relative z-10 text-center space-y-8">
                  <div className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-primary/20 rotate-3">
                     <ShieldCheck className="w-10 h-10 text-primary" />
                  </div>
                  
                  <div>
                    <h2 className="text-2xl font-bold italic uppercase tracking-tighter leading-none mb-2">Digital Safety Induction</h2>
                    <p className="text-xs text-muted-foreground tracking-widest font-bold uppercase">Wajib Diisi Sebelum Memulai Shift</p>
                  </div>

                  <div className="space-y-4 text-left">
                    <div className="space-y-3">
                       <HseCheckbox label="Memakai Equipment Pelindung Diri (APD) Lengkap" checked={hsePPE} onChange={setHsePPE} />
                       <HseCheckbox label="Peralatan Kerja dalam Condition Layak" checked={hseTools} onChange={setHseTools} />
                       <HseCheckbox label="Area Kerja Aman dari Bahaya Lingkungan" checked={hseEnv} onChange={setHseEnv} />
                       <HseCheckbox label="Memahami Prosedur Darurat & Evakuasi" checked={hseInduction} onChange={setHseInduction} />
                    </div>
                  </div>

                  <div className="pt-4">
                     <Button 
                       onClick={async () => {
                         if (!hsePPE || !hseTools || !hseEnv || !hseInduction) {
                           addNotification('Warning', 'Semua poin keselamatan harus disetujui.', 'warning');
                           return;
                         }
                         await handleCreateHseLog({
                           ppeCheck: hsePPE,
                           toolCheck: hseTools,
                           environmentCheck: hseEnv,
                           inductionConfirmed: hseInduction
                         });
                       }}
                       className="w-full h-16 rounded-2xl font-bold uppercase tracking-widest italic"
                     >
                       Start Shift Sekarang
                     </Button>
                     <p className="text-[10px] text-muted-foreground mt-4 italic uppercase">
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
          <div className="p-5 space-y-6">
            <div className="text-center">
              <h3 className="text-2xl font-bold italic uppercase tracking-tighter">
                Checklist K3 Lapangan
              </h3>
              <p className="text-xs text-muted-foreground uppercase font-bold tracking-widest">
                Work Safety Self-Assessment
              </p>
            </div>
            <div className="space-y-4">
              <HseCheckbox
                label="Personil Memakai Rompi & Helm Safety"
                checked={hsePPE}
                onChange={setHsePPE}
              />
              <HseCheckbox
                label="Area Kerja Sudah Terpasang Safety Cone"
                checked={hseTools}
                onChange={setHseTools}
              />
              <HseCheckbox
                label="Peralatan Mekanik/Manual Layak Pakai"
                checked={hseEnv}
                onChange={setHseEnv}
              />

              {currentProject?.requiredTools &&
                currentProject.requiredTools.length > 0 && (
                  <div className="pt-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">
                      Kesiapan Equipment Kerja ({currentProject.type})
                    </label>
                    <div className="mt-2 space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                      {currentProject.requiredTools.map((tool) => (
                        <div
                          key={tool}
                          className="flex items-center gap-3 p-3 bg-muted/10 rounded-xl border border-border/50"
                        >
                          <button
                            onClick={() => {
                              if (checkedTools.includes(tool)) {
                                setCheckedTools(
                                  checkedTools.filter((t) => t !== tool),
                                );
                              } else {
                                setCheckedTools([...checkedTools, tool]);
                              }
                            }}
                            className={cn(
                              "w-5 h-5 rounded-md border flex items-center justify-center transition-all",
                              checkedTools.includes(tool)
                                ? "bg-primary border-primary text-primary-foreground"
                                : "border-muted-foreground/30",
                            )}
                          >
                            {checkedTools.includes(tool) && (
                              <Check className="w-3.5 h-3.5" />
                            )}
                          </button>
                          <span className="text-xs font-bold uppercase">
                            {tool}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              <Button
                variant="outline"
                className="w-full h-10 rounded-xl border-dashed border hover:bg-rose-500/5 hover:text-rose-500 hover:border-rose-500/20 text-xs font-bold uppercase tracking-widest gap-2"
                onClick={() => setIsEqRequestModalOpen(true)}
              >
                <Wrench className="w-3.5 h-3.5" />
                Report Equipment Kurang/Rusak
              </Button>

              <div className="pt-4 space-y-3">
                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                  Foto Bukti Completeness K3
                </label>
                <div className="flex gap-4">
                  <div
                    onClick={() =>
                      document.getElementById("hsePhotoInput")?.click()
                    }
                    className="w-24 h-24 bg-muted/20 border border-dashed border-border rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:bg-muted/40 transition-all shrink-0"
                  >
                    {hsePhoto ? (
                      <FirebaseImage
                        url={hsePhoto}
                        className="w-full h-full object-cover rounded-2xl"
                        alt="K3 Proof"
                      />
                    ) : (
                      <>
                        <Camera className="w-6 h-6 text-muted-foreground mb-1" />
                        <span className="text-[10px] font-bold uppercase text-muted-foreground">
                          Ambil Foto
                        </span>
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
                  <div className="flex-1 text-xs text-muted-foreground leading-relaxed italic">
                    Ambil foto self-portrait menggunakan APD lengkap di depan
                    objek pengerjaan sebagai bukti otentik.
                  </div>
                </div>
              </div>
            </div>
            <Button
              className="w-full h-14 rounded-2xl"
              onClick={async () => {
                if (!hsePPE || !hseTools || !hseEnv || !hsePhoto) {
                  addNotification(
                    "Belum Lengkap",
                    "Penuhi checklist dan lampirkan foto K3.",
                    "warning",
                  );
                  return;
                }
                await handleCreateHseLog({
                  ppeCheck: hsePPE,
                  toolCheck: hseTools,
                  environmentCheck: hseEnv,
                  inductionConfirmed: true,
                  photo: hsePhoto,
                });
                setIsHseModalOpen(false);
                setHsePPE(false);
                setHseTools(false);
                setHseEnv(false);
                setHsePhoto("");
              }}
            >
              Verifikasi & Save Checklog
            </Button>
          </div>
        </Modal>

        <Modal
          isOpen={isStartWorkModalOpen}
          onClose={() => setIsStartWorkModalOpen(false)}
        >
          <div className="p-5 space-y-6">
            <div className="text-center">
              <h3 className="text-2xl font-bold italic uppercase tracking-tighter text-blue-500">
                Start Pekerjaan
              </h3>
              <p className="text-xs text-muted-foreground uppercase font-bold tracking-widest">
                Confirm PPE Readiness & Field Safety
              </p>
            </div>

            <div className="space-y-4">
              <HseCheckbox
                label="Safety Helmet According to Standard Worn"
                checked={safetyChecked.helm}
                onChange={(v) => setSafetyChecked((p) => ({ ...p, helm: v }))}
              />
              <HseCheckbox
                label="Rompi Reflektif Dikenakan"
                checked={safetyChecked.rompi}
                onChange={(v) => setSafetyChecked((p) => ({ ...p, rompi: v }))}
              />
              <HseCheckbox
                label="Sepatu Safety / Safety Shoes Dikenakan"
                checked={safetyChecked.sepatu}
                onChange={(v) => setSafetyChecked((p) => ({ ...p, sepatu: v }))}
              />
            </div>

            <Button
              onClick={startWorkSession}
              disabled={!isReadyToWork}
              className={`w-full h-14 rounded-2xl text-xs sm:text-xs font-bold uppercase tracking-widest shadow-lg ${isReadyToWork ? "bg-blue-600 hover:bg-blue-700 shadow-blue-500/20 text-white" : "bg-muted text-muted-foreground shadow-none"}`}
            >
              Setuju & Start Pekerjaan
            </Button>
          </div>
        </Modal>

        <Modal isOpen={isApdModalOpen} onClose={() => setIsApdModalOpen(false)}>
          <div className="p-5 space-y-6">
            <div className="text-center">
              <h3 className="text-2xl font-bold italic uppercase tracking-tighter text-amber-500">
                Inspeksi APD
              </h3>
              <p className="text-xs text-muted-foreground uppercase font-bold tracking-widest">
                Personal Protective Equipment & Field Safety
              </p>
            </div>

            <div className="space-y-4">
              <HseCheckbox
                label="Standard Safety Helmet"
                checked={apdForm.helm}
                onChange={(v) => setApdForm((p) => ({ ...p, helm: v }))}
              />
              <HseCheckbox
                label="Rompi Reflektif"
                checked={apdForm.rompi}
                onChange={(v) => setApdForm((p) => ({ ...p, rompi: v }))}
              />
              <HseCheckbox
                label="Sepatu Safety / Safety Shoes"
                checked={apdForm.sepatu}
                onChange={(v) => setApdForm((p) => ({ ...p, sepatu: v }))}
              />
              <HseCheckbox
                label="Safety Glasses (Optional)"
                checked={apdForm.kacamata}
                onChange={(v) => setApdForm((p) => ({ ...p, kacamata: v }))}
              />
              <HseCheckbox
                label="Sarung Tangan Kerja"
                checked={apdForm.sarungTangan}
                onChange={(v) => setApdForm((p) => ({ ...p, sarungTangan: v }))}
              />
              <HseCheckbox
                label="Masker Pernafasan"
                checked={apdForm.masker}
                onChange={(v) => setApdForm((p) => ({ ...p, masker: v }))}
              />
              <HseCheckbox
                label="Full Body Harness (Pekerjaan Tinggi)"
                checked={apdForm.harness}
                onChange={(v) => setApdForm((p) => ({ ...p, harness: v }))}
              />
            </div>

            <div className="space-y-3">
              <label className="text-xs font-bold uppercase text-muted-foreground ml-1 tracking-widest transition-colors duration-200">
                Notes Condition Khusus
              </label>
              <textarea
                placeholder="Misal: Rompi sedikit robek, Kacamata baret..."
                value={apdNotes}
                onChange={(e) => setApdNotes(e.target.value)}
                className="w-full h-24 bg-muted/20 border border-border rounded-xl p-4 text-xs focus:ring-2 ring-primary outline-none transition-shadow duration-300 custom-scrollbar resize-none font-medium"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase text-muted-foreground ml-1 tracking-widest transition-colors duration-200">
                Foto Bukti Inspeksi (Visual APD Dikenakan)
              </label>
              <div
                onClick={() => document.getElementById("apd-photo")?.click()}
                className="w-full h-32 bg-muted/20 border border-dashed border-border rounded-2xl flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-amber-500 hover:bg-amber-500/5 transition-all overflow-hidden relative group"
              >
                {apdPhoto ? (
                  <FirebaseImage
                    url={apdPhoto}
                    alt="APD Proof"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <>
                    <ImageIcon className="w-8 h-8 text-muted-foreground group-hover:text-amber-500 transition-colors" />
                    <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground group-hover:text-amber-500 transition-colors">
                      Ambil / Unggah Selfie APD
                    </span>
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
                        const compressed = await compressImage(
                          e.target.files[0],
                          800,
                          800,
                          0.7,
                        );
                        setApdPhoto(compressed);
                      } catch (err) {
                        console.error(err);
                        addNotification(
                          "Error",
                          "Failed memproses foto",
                          "warning",
                        );
                      }
                    }
                  }}
                />
              </div>
            </div>

            <Button
              className="w-full h-14 rounded-2xl font-bold uppercase tracking-widest bg-amber-600 hover:bg-amber-500"
              onClick={async () => {
                if (!apdPhoto) {
                  addNotification(
                    "Verifikasi Foto",
                    "Mohon lampirkan foto selfie APD",
                    "warning",
                  );
                  return;
                }

                await handleCreateAPDCheck(apdForm, apdNotes, apdPhoto);
                setIsApdModalOpen(false);
                setApdForm({
                  helm: false,
                  rompi: false,
                  sepatu: false,
                  kacamata: false,
                  sarungTangan: false,
                  masker: false,
                  harness: false,
                });
                setApdNotes("");
                setApdPhoto("");
              }}
            >
              Kirim Report APD
            </Button>
          </div>
        </Modal>

        <Modal
          isOpen={isIncidentModalOpen}
          onClose={() => setIsIncidentModalOpen(false)}
        >
          <div className="p-5 space-y-6">
            <div className="text-center">
              <h3 className="text-2xl font-bold italic uppercase tracking-tighter text-rose-500">
                Report Insiden K3
              </h3>
              <p className="text-xs text-muted-foreground uppercase font-bold tracking-widest">
                Digital Incident Reporting System
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant={incType === "accident" ? "destructive" : "outline"}
                onClick={() => setIncType("accident")}
                className="h-10 text-[10px]"
              >
                Kecelakaan Kerja
              </Button>
              <Button
                variant={incType === "near-miss" ? "secondary" : "outline"}
                onClick={() => setIncType("near-miss")}
                className="h-10 text-[10px]"
              >
                Hampir Celaka
              </Button>
            </div>
            <textarea
              placeholder="Descriptionkan kronologi kejadian secara detail..."
              value={incDesc}
              onChange={(e) => setIncDesc(e.target.value)}
              className="w-full h-32 bg-background border border-border rounded-2xl p-4 text-xs focus:ring-2 ring-rose-500 outline-none"
            />
            <div className="space-y-3">
              <label className="text-xs font-bold uppercase text-muted-foreground">
                Foto Dokumentasi Insiden
              </label>
              <div
                onClick={() =>
                  document.getElementById("incPhotoInput")?.click()
                }
                className="w-full h-40 bg-rose-500/5 border border-dashed border-rose-500/20 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:bg-rose-500/10 transition-all"
              >
                {incPhoto ? (
                  <FirebaseImage
                    url={incPhoto}
                    className="w-full h-full object-cover rounded-2xl"
                    alt="Incident"
                  />
                ) : (
                  <>
                    <Camera className="w-8 h-8 text-rose-500 mb-2 opacity-50" />
                    <span className="text-xs font-bold uppercase text-rose-500/50">
                      Unggah Foto Kejadian
                    </span>
                  </>
                )}
              </div>
              <input
                id="incPhotoInput"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const res = await compressImage(file);
                    setIncPhoto(res);
                  }
                }}
              />
            </div>
            <Button
              variant="destructive"
              className="w-full h-14 rounded-2xl"
              onClick={async () => {
                if (!incDesc) {
                  addNotification(
                    "Failed",
                    "Berikan deskripsi insiden.",
                    "warning",
                  );
                  return;
                }
                await handleReportIncident(incType, incDesc, incPhoto);
                setIsIncidentModalOpen(false);
                setIncDesc("");
                setIncPhoto("");
                clearDashboardDrafts();
                setIncDesc("");
                setIncPhoto("");
              }}
            >
              KIRIM LAPORAN INSIDEN
            </Button>
          </div>
        </Modal>

        <Modal
          isOpen={isWorkerModalOpen}
          onClose={() => setIsWorkerModalOpen(false)}
        >
          <div className="p-5 space-y-6">
            <div className="text-center">
              <h3 className="text-2xl font-bold italic uppercase tracking-tighter">
                {editingWorkerId
                  ? "Modifikasi Data Pegawai"
                  : "Add Pegawai New"}
              </h3>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                Akses operasional sistem
              </p>
            </div>
            <div className="space-y-4">
              <Input
                placeholder="ID Pegawai"
                value={wEmpId}
                onChange={(e) => setWEmpId(e.target.value)}
                disabled={!isDevAccount}
              />
              <Input
                placeholder="Nama Lengkap"
                value={wName}
                onChange={(e) => setWName(e.target.value)}
                disabled={!isDevAccount}
              />
              {isSuperAdmin && (
                <>
                  <Input
                    placeholder="Email Alternatif / Kerja"
                    value={wEmail}
                    onChange={(e) => setWEmail(e.target.value)}
                    disabled={!isDevAccount}
                  />
                  <div className="relative">
                    <Input
                      type={showWPass ? "text" : "password"}
                      placeholder="Password Login"
                      value={wPass}
                      onChange={(e) => setWPass(e.target.value)}
                      disabled={!isDevAccount}
                    />
                    <button
                      type="button"
                      onClick={() => setShowWPass(!showWPass)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
                      disabled={!isDevAccount}
                    >
                      {showWPass ? (
                        <Sun className="w-4 h-4" />
                      ) : (
                        <Moon className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <Button
                  variant={wRole === "field-operator" ? "primary" : "outline"}
                  onClick={() => setWRole("field-operator")}
                  className="text-xs font-bold uppercase tracking-widest"
                  disabled={!isDevAccount}
                >
                  Field Operator
                </Button>
                <Button
                  variant={wRole === "admin" ? "primary" : "outline"}
                  onClick={() => setWRole("admin")}
                  className="text-xs font-bold uppercase tracking-widest"
                  disabled={!isDevAccount}
                >
                  Administrator
                </Button>
                <Button
                  variant={wRole === "viewer" ? "primary" : "outline"}
                  onClick={() => setWRole("viewer")}
                  className="text-xs font-bold uppercase tracking-widest bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500 hover:text-white border-emerald-500"
                  disabled={!isDevAccount}
                >
                  Tim Audit / Bos
                </Button>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-muted-foreground ml-2">
                  Gaji Dayan (Rp)
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground">
                    Rp
                  </span>
                  <Input
                    type="number"
                    placeholder="200000"
                    value={wDailyRate}
                    onChange={(e) => setWDailyRate(e.target.value)}
                    className="pl-10"
                    disabled={!isDevAccount}
                  />
                </div>
              </div>
              <button
                onClick={() => setWIsPinned(!wIsPinned)}
                className={cn(
                  "w-full flex items-center justify-between p-4 rounded-2xl border transition-all",
                  wIsPinned
                    ? "border-amber-500/50 bg-amber-500/5"
                    : "border-border bg-transparent opacity-60",
                )}
              >
                <div className="flex items-center gap-3">
                  <Star
                    className={cn(
                      "w-4 h-4",
                      wIsPinned
                        ? "text-amber-500 fill-amber-500"
                        : "text-muted-foreground",
                    )}
                  />
                  <span className="text-xs font-bold uppercase tracking-widest">
                    Pin ke Halaman Login
                  </span>
                </div>
                <div
                  className={cn(
                    "w-5 h-5 rounded-lg border flex items-center justify-center transition-all",
                    wIsPinned
                      ? "bg-amber-500 border-amber-500 text-white"
                      : "border-muted-foreground/30",
                  )}
                >
                  {wIsPinned && <Check className="w-3 h-3" />}
                </div>
              </button>

              <div className="pt-4 border-t border-border">
                <button
                  onClick={() => setWGeoEnabled(!wGeoEnabled)}
                  className={cn(
                    "w-full flex items-center justify-between p-4 rounded-2xl border transition-all",
                    wGeoEnabled
                      ? "border-primary/50 bg-primary/5"
                      : "border-border bg-transparent opacity-60",
                  )}
                >
                  <div className="flex items-center gap-3">
                    <MapPin
                      className={cn(
                        "w-4 h-4",
                        wGeoEnabled ? "text-primary" : "text-muted-foreground",
                      )}
                    />
                    <span className="text-xs font-bold uppercase tracking-widest">
                      Wajibkan Geofencing Login
                    </span>
                  </div>
                  <div
                    className={cn(
                      "w-5 h-5 rounded-lg border flex items-center justify-center transition-all",
                      wGeoEnabled
                        ? "bg-primary border-primary text-white"
                        : "border-muted-foreground/30",
                    )}
                  >
                    {wGeoEnabled && <Check className="w-3 h-3" />}
                  </div>
                </button>

                {wGeoEnabled && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="grid grid-cols-2 gap-3 mt-4"
                  >
                    <div className="col-span-2 flex items-center justify-between mb-1 px-2 text-primary">
                      <p className="text-xs font-bold uppercase tracking-widest">
                        Koordinat Area Izin
                      </p>
                      <button
                        onClick={() => {
                          if (navigator.geolocation) {
                            navigator.geolocation.getCurrentPosition(
                              (pos) => {
                                setWGeoLat(pos.coords.latitude.toFixed(6));
                                setWGeoLng(pos.coords.longitude.toFixed(6));
                              },
                              (err) => {
                                addNotification(
                                  "GPS Failed",
                                  "Failed mengambil lokasi saat ini.",
                                  "error",
                                );
                              },
                            );
                          }
                        }}
                        className="flex items-center gap-1.5 hover:scale-105 active:scale-95 transition-all bg-primary/20 p-2 rounded-xl"
                      >
                        <LocateFixed className="w-3 h-3" />
                        <span className="text-[10px] font-bold uppercase whitespace-nowrap">
                          Dapatkan Koordinat Anda
                        </span>
                      </button>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase text-muted-foreground ml-2">
                        Latitude
                      </label>
                      <Input
                        placeholder="-6.1234"
                        value={wGeoLat}
                        onChange={(e) => setWGeoLat(e.target.value)}
                        className="h-10 text-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase text-muted-foreground ml-2">
                        Longitude
                      </label>
                      <Input
                        placeholder="106.1234"
                        value={wGeoLng}
                        onChange={(e) => setWGeoLng(e.target.value)}
                        className="h-10 text-xs"
                      />
                    </div>
                    <div className="col-span-2 space-y-1">
                      <label className="text-[10px] font-bold uppercase text-muted-foreground ml-2">
                        Radius Izin (Meter)
                      </label>
                      <Input
                        type="number"
                        placeholder="500"
                        value={wGeoRadius}
                        onChange={(e) => setWGeoRadius(e.target.value)}
                        className="h-10 text-xs"
                      />
                    </div>
                  </motion.div>
                )}
              </div>

              {[
                "developmentshaka@gmail.com",
                "development.shaka@gmail.com",
              ].includes(user?.email?.toLowerCase() || "") && (
                <div className="space-y-4 pt-4 border-t border-border">
                  <h4 className="text-sm font-bold uppercase text-cyan-600">
                    Edit Data Diri (Dev Only)
                  </h4>
                  <Input
                    placeholder="Regu"
                    value={wRegu}
                    onChange={(e) => setWRegu(e.target.value)}
                  />
                  <Input
                    placeholder="Jabatan"
                    value={wJabatan}
                    onChange={(e) => setWJabatan(e.target.value)}
                  />
                  <Input
                    placeholder="Kode Unit"
                    value={wKodeUnit}
                    onChange={(e) => setWKodeUnit(e.target.value)}
                  />
                  <Input
                    placeholder="Region"
                    value={wRegion}
                    onChange={(e) => setWRegion(e.target.value)}
                  />
                  <Input
                    placeholder="Unit Induk"
                    value={wUnitInduk}
                    onChange={(e) => setWUnitInduk(e.target.value)}
                  />
                </div>
              )}
            </div>
            {isDevAccount && (
              <Button
                className="w-full h-14 rounded-2xl shadow-lg bg-amber-500 hover:bg-amber-600 text-white"
                onClick={async () => {
                  if (wEmpId && wName && wEmail && wPass) {
                    const geo = wGeoEnabled
                      ? {
                          lat: parseFloat(wGeoLat),
                          lng: parseFloat(wGeoLng),
                          radius: parseInt(wGeoRadius),
                          enabled: true,
                        }
                      : undefined;

                    const profileData = {
                      regu: wRegu,
                      jabatan: wJabatan,
                      kodeUnit: wKodeUnit,
                      region: wRegion,
                      unitInduk: wUnitInduk,
                    };

                    if (editingWorkerId) {
                      await handleUpdateWorker(
                        editingWorkerId,
                        wName,
                        wEmail,
                        wPass,
                        wRole,
                        parseFloat(wDailyRate) || 0,
                        wIsPinned,
                        geo,
                        profileData,
                      );
                    } else {
                      await handleAddWorker(
                        wEmpId,
                        wName,
                        wEmail,
                        wPass,
                        wRole,
                        parseFloat(wDailyRate) || 0,
                        wIsPinned,
                        geo,
                        profileData,
                      );
                    }
                    setIsWorkerModalOpen(false);
                    setWEmpId("");
                    setWName("");
                    setWEmail("");
                    setWPass("");
                    setEditingWorkerId(null);
                  } else {
                    addNotification(
                      "Form Tidak Lengkap",
                      "Harap isi semua kolom.",
                      "warning",
                    );
                  }
                }}
              >
                {editingWorkerId ? "Save Perubahan" : "Daftarkan Pegawai"}
              </Button>
            )}
          </div>
        </Modal>

        <Modal
          isOpen={isTaskModalOpen}
          onClose={() => setIsTaskModalOpen(false)}
        >
          <div className="p-5 space-y-6">
            <h3 className="text-2xl font-bold italic tracking-tighter uppercase">
              Delegasi Tasks New
            </h3>
            <div className="space-y-4">
              <div className="flex gap-2">
                <button
                  onClick={() => setTaskPriority("low")}
                  className={cn(
                    "flex-1 h-10 rounded-xl text-xs font-bold uppercase border transition-all",
                    taskPriority === "low"
                      ? "bg-emerald-500 text-white border-emerald-500"
                      : "bg-transparent border-border text-muted-foreground",
                  )}
                >
                  Low
                </button>
                <button
                  onClick={() => setTaskPriority("medium")}
                  className={cn(
                    "flex-1 h-10 rounded-xl text-xs font-bold uppercase border transition-all",
                    taskPriority === "medium"
                      ? "bg-amber-500 text-white border-amber-500"
                      : "bg-transparent border-border text-muted-foreground",
                  )}
                >
                  Medium
                </button>
                <button
                  onClick={() => setTaskPriority("high")}
                  className={cn(
                    "flex-1 h-10 rounded-xl text-xs font-bold uppercase border transition-all",
                    taskPriority === "high"
                      ? "bg-rose-500 text-white border-rose-500"
                      : "bg-transparent border-border text-muted-foreground",
                  )}
                >
                  High
                </button>
              </div>
              <Input
                placeholder="Judul Pekerjaan"
                value={taskTitle}
                onChange={(e) => setTaskTitle(e.target.value)}
              />
              <Input
                placeholder="Link Dokumen/File (Drive, OneDrive, dll)"
                value={taskDocumentUrl}
                onChange={(e) => setTaskDocumentUrl(e.target.value)}
              />
              <textarea
                placeholder="Detail instruksi pengerjaan..."
                value={taskDesc}
                onChange={(e) => setTaskDesc(e.target.value)}
                className="w-full h-32 bg-background border border-border rounded-xl p-4 text-sm focus:ring-2 ring-primary outline-none"
              />
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase text-muted-foreground">
                    Taskskan Ke (Maksimal 6 Petugas)
                  </label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        const isMeSelected = taskAssignees.some(
                          (a) => a.email === user?.email,
                        );
                        if (isMeSelected) {
                          setTaskAssignees((prev) =>
                            prev.filter((a) => a.email !== user?.email),
                          );
                        } else if (user?.email) {
                          setTaskAssignees((prev) => [
                            ...prev,
                            {
                              name: user.displayName || "Me",
                              email: user.email!,
                            },
                          ]);
                        }
                      }}
                      className={cn(
                        "text-[10px] font-bold uppercase px-3 py-1 rounded-full border transition-all",
                        taskAssignees.some((a) => a.email === user?.email)
                          ? "bg-primary text-white border-primary"
                          : "bg-transparent border-border text-muted-foreground hover:bg-muted",
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
                    className="h-10 text-xs bg-background border-primary/20"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        const val = (e.target as HTMLInputElement).value.trim();
                        if (val) {
                          if (taskAssignees.length >= 6) {
                            addNotification(
                              "Batas Petugas",
                              "Maksimal 6 petugas.",
                              "warning",
                            );
                            return;
                          }
                          if (
                            taskAssignees.some(
                              (a) =>
                                a.email.toLowerCase() === val.toLowerCase(),
                            )
                          ) {
                            addNotification(
                              "Duplikat",
                              "Email sudah terdaftar.",
                              "warning",
                            );
                            return;
                          }
                          setTaskAssignees((prev) => [
                            ...prev,
                            { name: val.split("@")[0], email: val },
                          ]);
                          (e.target as HTMLInputElement).value = "";
                        }
                      }
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-10 text-[10px] font-bold border-primary text-primary"
                    onClick={() => {
                      const input = document.getElementById(
                        "manualEmailInput",
                      ) as HTMLInputElement;
                      const val = input.value.trim();
                      if (val) {
                        if (taskAssignees.length >= 6) {
                          addNotification(
                            "Batas Petugas",
                            "Maksimal 6 petugas.",
                            "warning",
                          );
                          return;
                        }
                        if (
                          taskAssignees.some(
                            (a) => a.email.toLowerCase() === val.toLowerCase(),
                          )
                        ) {
                          addNotification(
                            "Duplikat",
                            "Email sudah terdaftar.",
                            "warning",
                          );
                          return;
                        }
                        setTaskAssignees((prev) => [
                          ...prev,
                          { name: val.split("@")[0], email: val },
                        ]);
                        input.value = "";
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
                      <p className="text-xs font-bold uppercase tracking-widest">
                        None yet pekerja terdaftar
                      </p>
                      <p className="text-[10px] font-medium mt-1">
                        Addkan di Tab Pekerja untuk delegasi
                      </p>
                    </div>
                  ) : (
                    workers.map((w) => {
                      const isSelected = taskAssignees.some(
                        (a) => a.email === w.email,
                      );
                      return (
                        <button
                          key={w.id}
                          type="button"
                          onClick={() => {
                            if (isSelected) {
                              setTaskAssignees((prev) =>
                                prev.filter((a) => a.email !== w.email),
                              );
                            } else {
                              if (taskAssignees.length >= 6) {
                                addNotification(
                                  "Batas Petugas",
                                  "Maksimal 6 petugas per tugas.",
                                  "warning",
                                );
                                return;
                              }
                              setTaskAssignees((prev) => [
                                ...prev,
                                { name: w.name, email: w.email },
                              ]);
                            }
                          }}
                          className={cn(
                            "flex flex-col items-start p-3 rounded-xl border text-left transition-all group",
                            isSelected
                              ? "bg-primary text-primary-foreground border-primary shadow-lg scale-[0.98]"
                              : "bg-card border-border hover:border-primary/50",
                          )}
                        >
                          <span className="text-xs font-bold uppercase truncate w-full">
                            {w.name}
                          </span>
                          <span
                            className={cn(
                              "text-[10px] font-bold uppercase opacity-60",
                              isSelected
                                ? "text-white"
                                : "text-muted-foreground",
                            )}
                          >
                            {w.employeeId}
                          </span>
                        </button>
                      );
                    })
                  )}
                </div>
                {taskAssignees.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-2 border-t border-border/50">
                    {taskAssignees.map((a) => (
                      <div
                        key={a.email}
                        className="bg-primary/10 text-primary px-3 py-1 rounded-xl text-[10px] font-bold uppercase flex items-center gap-2 border border-primary/20"
                      >
                        {a.name}
                        <button
                          onClick={() =>
                            setTaskAssignees((prev) =>
                              prev.filter((p) => p.email !== a.email),
                            )
                          }
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
                <label className="text-xs font-bold uppercase text-muted-foreground ml-1 tracking-widest">
                  Batas Time (Deadline)
                </label>
                <Input
                  type="datetime-local"
                  value={taskDueDate}
                  onChange={(e) => setTaskDueDate(e.target.value)}
                  className="h-12 bg-background border-border/50"
                />
              </div>

              <div className="bg-muted p-4 rounded-2xl border border-dashed border-border mb-4 flex items-center justify-between">
                <span className="text-xs font-bold text-muted-foreground italic">
                  {taskPhoto
                    ? "Foto instruksi terpilih"
                    : "Lampiran Foto Opsional"}
                </span>
                <div className="flex gap-2">
                  <label
                    className="w-10 h-10 flex flex-col items-center justify-center bg-background rounded-xl border border-border cursor-pointer hover:bg-secondary transition-all shadow-sm"
                    title="Camera"
                  >
                    <Camera className="w-4 h-4 text-primary mb-0.5" />
                    <span className="text-[6px] font-bold uppercase text-primary/80">
                      Camera
                    </span>
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      capture="environment"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setIsUploadingTaskPhoto(true);
                          const res = await compressImage(file);
                          setTaskPhoto(res);
                          setIsUploadingTaskPhoto(false);
                        }
                      }}
                    />
                  </label>
                  <label
                    className="w-10 h-10 flex flex-col items-center justify-center bg-background rounded-xl border border-border cursor-pointer hover:bg-secondary transition-all shadow-sm"
                    title="Gallery"
                  >
                    <ImageIcon className="w-4 h-4 text-emerald-500 mb-0.5" />
                    <span className="text-[6px] font-bold uppercase text-emerald-500/80">
                      Gallery
                    </span>
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setIsUploadingTaskPhoto(true);
                          const res = await compressImage(file);
                          setTaskPhoto(res);
                          setIsUploadingTaskPhoto(false);
                        }
                      }}
                    />
                  </label>
                </div>
              </div>
            </div>
            <Button
              disabled={isCreatingTask}
              className="w-full h-14 rounded-2xl flex items-center justify-center gap-3"
              onClick={() => {
                if (window.confirm("Save tugas baru ini?"))
                  handleCreateTaskInternal();
              }}
            >
              {isCreatingTask ? (
                <>
                  <Activity className="w-5 h-5 animate-spin" />
                  <span>Memproses Tasks...</span>
                </>
              ) : (
                "Save & Kirim Tasks"
              )}
            </Button>
          </div>
        </Modal>

        <Modal
          isOpen={isFuelModalOpen}
          onClose={() => setIsFuelModalOpen(false)}
        >
          <div className="p-5 space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-blue-500/20">
                <Database className="w-8 h-8 text-blue-500" />
              </div>
              <h3 className="text-2xl font-bold italic uppercase tracking-tighter">
                Log Pengisian BBM
              </h3>
              <p className="text-xs text-muted-foreground uppercase font-bold tracking-widest">
                Catat penggunaan bahan bakar alat berat
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-muted-foreground ml-1 tracking-widest">
                  Unit Equipment Berat
                </label>
                <select
                  value={fuelEquip}
                  onChange={(e) => setFuelEquip(e.target.value)}
                  className="w-full h-12 bg-background border border-border rounded-xl px-4 text-xs font-bold uppercase focus:ring-2 ring-blue-500 outline-none appearance-none"
                >
                  <option value="">Select Unit...</option>
                  {[
                    "Excavator",
                    "Vibratory Roller",
                    "Asphalt Sprayer",
                    "Dump Truck",
                    "Genset",
                  ].map((e) => (
                    <option key={e} value={e}>
                      {e}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-muted-foreground ml-1 tracking-widest">
                  Amount Liter (L)
                </label>
                <Input
                  type="number"
                  placeholder="Contest: 25"
                  value={fuelLiters}
                  onChange={(e) => setFuelLiters(e.target.value)}
                  className="h-12 text-blue-600 font-bold"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-muted-foreground ml-1 tracking-widest">
                  Notes (Opsional)
                </label>
                <textarea
                  placeholder="Notes tambahan..."
                  value={fuelNote}
                  onChange={(e) => setFuelNote(e.target.value)}
                  className="w-full h-20 bg-background border border-border rounded-xl p-4 text-xs focus:ring-2 ring-blue-500 outline-none"
                />
              </div>

              <div className="space-y-3">
                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                  Foto Bukti Pengisian (Opsional)
                </label>
                <div className="flex gap-4">
                  <div
                    onClick={() =>
                      document.getElementById("fuelPhotoInput")?.click()
                    }
                    className="w-20 h-20 bg-muted/20 border border-dashed border-border rounded-2xl flex flex-col items-center justify-center cursor-pointer overflow-hidden"
                  >
                    {fuelPhoto ? (
                      <FirebaseImage
                        url={fuelPhoto}
                        className="w-full h-full object-cover"
                        alt="Fuel Proof"
                      />
                    ) : (
                      <Camera className="w-5 h-5 text-muted-foreground" />
                    )}
                  </div>
                  <input
                    id="fuelPhotoInput"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    capture="environment"
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
              className="w-full h-16 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold uppercase italic tracking-widest flex items-center justify-center gap-3 shadow-lg shadow-blue-500/20"
              onClick={async () => {
                if (!fuelEquip || !fuelLiters) {
                  addNotification(
                    "Data Kurang",
                    "Select alat dan masukkan jumlah liter.",
                    "warning",
                  );
                  return;
                }
                setIsLoggingFuel(true);
                try {
                  await handleCreateFuelLog({
                    equipmentName: fuelEquip,
                    liters: Number(fuelLiters),
                    note: fuelNote,
                    photo: fuelPhoto,
                    projectId: currentProjectId,
                  });
                  setIsFuelModalOpen(false);
                  setFuelEquip("");
                  setFuelLiters("");
                  setFuelNote("");
                  setFuelPhoto("");
                  clearDashboardDrafts();
                } catch (e) {
                  console.error(e);
                } finally {
                  setIsLoggingFuel(false);
                }
              }}
            >
              {isLoggingFuel ? (
                <Activity className="w-5 h-5 animate-spin" />
              ) : (
                "Save Notes BBM"
              )}
            </Button>
          </div>
        </Modal>

        <Modal
          isOpen={isEqRequestModalOpen}
          onClose={() => setIsEqRequestModalOpen(false)}
        >
          <div className="p-5 space-y-6">
            <div className="text-center">
              <h3 className="text-2xl font-bold italic uppercase tracking-tighter">
                Pengajuan & Pelaporan Equipment
              </h3>
              <p className="text-xs text-muted-foreground uppercase font-bold tracking-widest">
                Ajukan kebutuhan atau lapor alat rusak
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">
                  Nama Equipment
                </label>
                <Input
                  placeholder="Contoh: Blower Asphalt"
                  value={eqToolName}
                  onChange={(e) => setEqToolName(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">
                  Tipe Pengajuan
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: "new", label: "New", color: "bg-emerald-500" },
                    { id: "repair", label: "Perbaikan", color: "bg-amber-500" },
                    { id: "damaged", label: "Rusak", color: "bg-rose-500" },
                  ].map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setEqType(t.id as any)}
                      className={cn(
                        "p-3 rounded-xl border text-[10px] font-bold uppercase transition-all",
                        eqType === t.id
                          ? `${t.color} text-white border-transparent shadow-lg`
                          : "bg-card border-border hover:border-primary/20",
                      )}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">
                  Keterangan / Alasan
                </label>
                <textarea
                  placeholder="Jelaskan kebutuhan atau kerusakan alat..."
                  value={eqDescription}
                  onChange={(e) => setEqDescription(e.target.value)}
                  className="w-full h-24 bg-background border border-border rounded-xl p-4 text-xs focus:ring-2 ring-primary outline-none"
                />
              </div>

              <div className="space-y-3">
                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                  Foto Condition Equipment (Opsional)
                </label>
                <div className="flex gap-4">
                  <div
                    onClick={() =>
                      document.getElementById("eqPhotoInput")?.click()
                    }
                    className="w-24 h-24 bg-muted/20 border border-dashed border-border rounded-2xl flex flex-col items-center justify-center cursor-pointer"
                  >
                    {eqPhoto ? (
                      <FirebaseImage
                        url={eqPhoto}
                        className="w-full h-full object-cover rounded-2xl"
                        alt="Eq Proof"
                      />
                    ) : (
                      <Camera className="w-6 h-6 text-muted-foreground" />
                    )}
                  </div>
                  <input
                    id="eqPhotoInput"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    capture
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
              className="w-full h-14 rounded-2xl font-bold uppercase italic tracking-widest disabled:opacity-50"
              onClick={async () => {
                if (!eqToolName || !eqDescription) {
                  addNotification(
                    "Data Kurang",
                    "Lengkapi nama alat dan keterangannya.",
                    "warning",
                  );
                  return;
                }
                setIsSubmittingEq(true);
                try {
                  await handleCreateEquipmentRequest({
                    toolName: eqToolName,
                    type: eqType,
                    description: eqDescription,
                    photo: eqPhoto,
                    projectId: currentProjectId,
                  });
                  setIsEqRequestModalOpen(false);
                  setEqToolName("");
                  setEqDescription("");
                  setEqPhoto("");
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

        <Modal
          isOpen={isRejectModalOpen}
          onClose={() => setIsRejectModalOpen(false)}
        >
          <div className="p-5 space-y-6">
            <div className="text-center">
              <h3 className="text-2xl font-bold italic uppercase tracking-tighter text-rose-500">
                Tolak Pengajuan
              </h3>
              <p className="text-xs text-muted-foreground uppercase font-bold tracking-widest">
                Berikan alasan penolakan untuk dikirim ke pelaksana
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">
                  Alasan Penolakan
                </label>
                <textarea
                  placeholder="Contoh: Equipment masih tersedia di gudang atau stok habis..."
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  className="w-full h-32 bg-background border border-border rounded-2xl p-4 text-xs focus:ring-2 ring-rose-500 outline-none"
                />
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1 h-12 rounded-xl font-bold uppercase italic"
                  onClick={() => setIsRejectModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-[2] h-12 bg-rose-500 hover:bg-rose-600 text-white rounded-xl font-bold uppercase italic"
                  onClick={async () => {
                    if (!rejectReason.trim()) {
                      addNotification(
                        "Data Kurang",
                        "Berikan alasan penolakan.",
                        "warning",
                      );
                      return;
                    }
                    await handleUpdateEquipmentRequestStatus(
                      rejectId,
                      "rejected",
                      rejectReason,
                    );
                    setIsRejectModalOpen(false);
                  }}
                >
                  Konfirmasi Tolak
                </Button>
              </div>
            </div>
          </div>
        </Modal>

        <MassImportModal
          isOpen={isMassImportModalOpen}
          onClose={() => setIsMassImportModalOpen(false)}
        />

        <Modal
          isOpen={isNewProjectModalOpen}
          onClose={() => setIsNewProjectModalOpen(false)}
        >
          <div className="p-5 space-y-6">
            <div className="text-center">
              <h3 className="text-2xl font-bold italic uppercase tracking-tighter">
                Inisiasi Projects New
              </h3>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                Tentukan spesifikasi dan ruang lingkup
              </p>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-muted-foreground ml-1 tracking-widest">
                  Nama Projects
                </label>
                <Input
                  placeholder="Contoh: Perbaikan Saluran Melati"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-muted-foreground ml-1 tracking-widest">
                  Kategori Projects
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[
                    { id: "asphalt", label: "Asphalt", icon: Activity },
                    { id: "inlet", label: "Inlet/Saluran", icon: Database },
                    { id: "traffic-sign", label: "Rambu", icon: ShieldCheck },
                    { id: "painting", label: "Pengecatan", icon: TrendingUp },
                    { id: "planting", label: "Penanaman", icon: Sun },
                    { id: "other", label: "Lainnya", icon: Layers },
                  ].map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setNewProjectType(t.id as any)}
                      className={cn(
                        "flex flex-col items-center justify-center p-4 rounded-2xl border transition-all gap-2",
                        newProjectType === t.id
                          ? "bg-primary text-primary-foreground border-primary shadow-lg"
                          : "bg-card border-border hover:border-primary/30",
                      )}
                    >
                      <t.icon className="w-5 h-5" />
                      <span className="text-[10px] font-bold uppercase tracking-tighter">
                        {t.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-muted-foreground ml-1 tracking-widest">
                  Description (Opsional)
                </label>
                <textarea
                  placeholder="Detail singkat tentang proyek..."
                  value={newProjectDesc}
                  onChange={(e) => setNewProjectDesc(e.target.value)}
                  className="w-full h-24 bg-background border border-border rounded-xl p-4 text-xs focus:ring-2 ring-primary outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-muted-foreground ml-1 tracking-widest">
                    Location Strategis
                  </label>
                  <Input
                    placeholder="Contoh: Jalan Tol Trans Sumatera"
                    value={newLocationInfo}
                    onChange={(e) => setNewLocationInfo(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-muted-foreground ml-1 tracking-widest">
                    Regional
                  </label>
                  <Input
                    placeholder="Contoh: Regional SUMBAGTENG"
                    value={newRegionalInfo}
                    onChange={(e) => setNewRegionalInfo(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-muted-foreground ml-1 tracking-widest">
                  Link Dokumen Master (Opsional)
                </label>
                <Input
                  placeholder="Contoh: Link Drive/SOP"
                  value={newProjectDocumentUrl}
                  onChange={(e) => setNewProjectDocumentUrl(e.target.value)}
                />
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-muted-foreground ml-1 tracking-widest">
                    Equipment Kerja Wajib
                  </label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {newProjectRequiredTools.map((tool, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-2 bg-primary/10 text-primary text-xs font-bold px-3 py-1.5 rounded-full border border-primary/20"
                      >
                        <span>{tool}</span>
                        <button
                          onClick={() =>
                            setNewProjectRequiredTools(
                              newProjectRequiredTools.filter(
                                (_, i) => i !== idx,
                              ),
                            )
                          }
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      id="new-tool-input"
                      placeholder="Add alat lain..."
                      className="h-10 text-xs"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          const val = (
                            e.target as HTMLInputElement
                          ).value.trim();
                          if (val) {
                            setNewProjectRequiredTools([
                              ...newProjectRequiredTools,
                              val,
                            ]);
                            (e.target as HTMLInputElement).value = "";
                          }
                        }
                      }}
                    />
                    <Button
                      size="icon"
                      className="h-10 w-10 shrink-0"
                      onClick={() => {
                        const input = document.getElementById(
                          "new-tool-input",
                        ) as HTMLInputElement;
                        if (input && input.value.trim()) {
                          setNewProjectRequiredTools([
                            ...newProjectRequiredTools,
                            input.value.trim(),
                          ]);
                          input.value = "";
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
                          asphalt: [
                            "Blower",
                            "Sapu",
                            "Laker",
                            "Sekop",
                            "Kereta Sorong",
                            "Roller",
                          ],
                          inlet: [
                            "Cangkul",
                            "Sekop",
                            "Kereta Sorong",
                            "Waterpump",
                          ],
                          "traffic-sign": [
                            "Tang",
                            "Kunci Pas",
                            "Bor Listrik",
                            "Tangga",
                          ],
                          painting: ["Kuas", "Roller", "Mesin Markah", "Cat"],
                          planting: ["Cangkul", "Gunting Rumput", "Tanki Air"],
                          other: ["Standar K3"],
                        };
                        setNewProjectRequiredTools(
                          defaults[newProjectType] || [],
                        );
                      }}
                      className="text-[10px] font-bold uppercase text-primary hover:underline"
                    >
                      Reset ke Standar {newProjectType}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-muted-foreground ml-1 tracking-widest">
                    Target Kuantitas / Realization
                  </label>
                  <Input
                    type="number"
                    placeholder="Contoh: 5000"
                    value={newProjectTargetQty}
                    onChange={(e) => setNewProjectTargetQty(e.target.value)}
                  />
                </div>
              </div>
            </div>
            <Button
              className="w-full h-16 rounded-2xl text-xs font-bold uppercase italic tracking-widest"
              onClick={() => {
                if (window.confirm("Verifikasi Aktifkan Projects New?"))
                  handleCreateProject();
              }}
              disabled={isCreatingProject}
            >
              {isCreatingProject ? (
                <Activity className="w-5 h-5 animate-spin mr-2" />
              ) : null}
              {isCreatingProject
                ? "Sedang Memproses..."
                : "Aktifkan Projects New"}
            </Button>
          </div>
        </Modal>

        <Modal
          isOpen={isDeleteProjectModalOpen}
          onClose={() => setIsDeleteProjectModalOpen(false)}
        >
          <div className="p-5 space-y-6 text-center">
            <div className="w-20 h-20 bg-rose-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-10 h-10 text-rose-500" />
            </div>
            <h3 className="text-2xl font-bold italic tracking-tighter uppercase">
              Konfirmasi Delete
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Apakah Anda yakin ingin menghapus proyek{" "}
              <span className="font-bold text-foreground">
                "{projectToDelete?.name}"
              </span>
              ? Seluruh data entry di dalamnya akan hilang permanen.
            </p>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setIsDeleteProjectModalOpen(false)}
                className="flex-1 h-14 rounded-2xl"
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={executeDeleteProject}
                className="flex-1 h-14 rounded-2xl bg-rose-600 hover:bg-rose-500"
              >
                Delete Permanen
              </Button>
            </div>
          </div>
        </Modal>
        <Modal
          isOpen={logoutConfirmOpen}
          onClose={() => setLogoutConfirmOpen(false)}
        >
          <div className="p-5 space-y-6 text-center">
            <div className="w-20 h-20 bg-rose-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <LogOut className="w-10 h-10 text-rose-500" />
            </div>
            <h3 className="text-2xl font-bold italic tracking-tighter uppercase">
              Konfirmasi Logout
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Apakah Anda yakin ingin keluar dari aplikasi?
            </p>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setLogoutConfirmOpen(false)}
                className="flex-1 h-14 rounded-2xl"
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={() => {
                  setLogoutConfirmOpen(false);
                  handleLogout();
                }}
                className="flex-1 h-14 rounded-2xl bg-rose-600 hover:bg-rose-500"
              >
                Ya, Logout
              </Button>
            </div>
          </div>
        </Modal>

        <Modal
          isOpen={deleteConfirmParams?.isOpen || false}
          onClose={() =>
            setDeleteConfirmParams({
              isOpen: false,
              type: "",
              action: () => {},
              title: "",
              desc: "",
            })
          }
        >
          <div className="p-5 space-y-6 text-center">
            {deleteConfirmParams?.type === "resolve_incident" ? (
              <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                <CheckCircle2 className="w-10 h-10 text-emerald-500" />
              </div>
            ) : deleteConfirmParams?.type === "all_hse_incidents" || deleteConfirmParams?.type === "all_incidents" ? (
              <div className="w-20 h-20 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-10 h-10 text-amber-500" />
              </div>
            ) : (
              <div className="w-20 h-20 bg-rose-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-10 h-10 text-rose-500" />
              </div>
            )}
            <h3 className="text-2xl font-bold italic tracking-tighter uppercase">
              {deleteConfirmParams?.title}
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {deleteConfirmParams?.desc}
            </p>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() =>
                  setDeleteConfirmParams({
                    isOpen: false,
                    type: "",
                    action: () => {},
                    title: "",
                    desc: "",
                  })
                }
                className="flex-1 h-14 rounded-2xl"
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={() => {
                  deleteConfirmParams?.action();
                  setDeleteConfirmParams({
                    isOpen: false,
                    type: "",
                    action: () => {},
                    title: "",
                    desc: "",
                  });
                }}
                className={cn(
                  "flex-1 h-14 rounded-2xl text-white font-bold transition-all",
                  deleteConfirmParams?.type === "resolve_incident"
                    ? "bg-emerald-600 hover:bg-emerald-500 shadow-emerald-500/10 hover:shadow-emerald-500/20"
                    : deleteConfirmParams?.type === "all_hse_incidents" || deleteConfirmParams?.type === "all_incidents"
                    ? "bg-amber-600 hover:bg-amber-500 shadow-amber-500/10 hover:shadow-amber-500/20"
                    : "bg-rose-600 hover:bg-rose-500 shadow-rose-500/10 hover:shadow-rose-500/20"
                )}
              >
                {deleteConfirmParams?.confirmText || "Delete Permanen"}
              </Button>
            </div>
          </div>
        </Modal>

        {/* End main context wrapper */}
      </div>
    </div>
  );
};

/* --- Sub Components --- */

/* --- Sub Components --- */

const AttendanceSettingsCard = ({
  settings,
  onUpdate,
}: {
  settings: any;
  onUpdate: (s: any) => Promise<void>;
}) => {
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
    <Card className="p-5 border-primary/20 bg-primary/5 rounded-2xl overflow-hidden relative">
      <div className="flex items-center gap-4 mb-6">
        <div className="bg-primary/10 p-3 rounded-2xl">
          <MapPin className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h3 className="text-xl font-bold italic uppercase tracking-tighter leading-none">
            Pengaturan Absen (Geofencing)
          </h3>
          <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold mt-1">
            Batasi lokasi absen karyawan di titik koordinat tertentu
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase text-muted-foreground ml-1 tracking-[0.2em]">
              Latitude Kantor
            </label>
            <div className="flex gap-2">
              <Input
                type="number"
                step="any"
                className="bg-background/50 h-12"
                value={lat}
                onChange={(e) => setLat(Number(e.target.value))}
                placeholder="-6.1234"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition((p) => {
                      setLat(parseFloat(p.coords.latitude.toFixed(6)));
                      setLng(parseFloat(p.coords.longitude.toFixed(6)));
                    });
                  }
                }}
                className="shrink-0 h-12 px-4 text-[10px] font-bold uppercase rounded-xl border-primary/30 text-primary"
              >
                Deteksi Location
              </Button>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase text-muted-foreground ml-1 tracking-[0.2em]">
              Longitude Kantor
            </label>
            <Input
              type="number"
              step="any"
              className="bg-background/50 h-12"
              value={lng}
              onChange={(e) => setLng(Number(e.target.value))}
              placeholder="106.1234"
            />
          </div>
        </div>
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase text-muted-foreground ml-1 tracking-[0.2em]">
              Radius Toleransi (Meter)
            </label>
            <Input
              type="number"
              className="bg-background/50 h-12 font-bold"
              value={radius}
              onChange={(e) => setRadius(Number(e.target.value))}
              placeholder="100"
            />
          </div>
          <div className="flex items-center gap-4 mt-8">
            <button
              onClick={() => setEnabled(!enabled)}
              className={cn(
                "flex items-center gap-3 px-6 py-4 rounded-2xl border transition-all font-bold uppercase text-xs tracking-widest w-full justify-center shadow-lg",
                enabled
                  ? "bg-emerald-500 border-emerald-500 text-white shadow-emerald-500/20"
                  : "bg-muted/10 border-border opacity-50 grayscale",
              )}
            >
              {enabled ? (
                <CheckCircle2 className="w-5 h-5" />
              ) : (
                <X className="w-5 h-5 opacity-30" />
              )}
              {enabled ? "GEOFENCING AKTIF" : "GEOFENCING NONAKTIF"}
            </button>
          </div>
        </div>
      </div>

      <div className="mt-10 flex justify-end">
        <Button
          onClick={() =>
            onUpdate({ allowedLat: lat, allowedLng: lng, radius, enabled })
          }
          className="h-16 px-12 rounded-2xl font-bold uppercase italic tracking-widest shadow-md shadow-primary/30 hover:scale-[1.02] active:scale-[0.98] transition-all"
        >
          Save Konfigurasi Absensi
        </Button>
      </div>
    </Card>
  );
};

/* --- Analytics --- */

const TaskAnalytics = ({
  tasks,
  workers,
}: {
  tasks: Task[];
  workers: Worker[];
}) => {
  const stats = React.useMemo(() => {
    const completed = tasks.filter((t) => t.status === "completed").length;
    const pending = tasks.filter((t) => t.status === "pending").length;
    const inProgress = tasks.filter((t) => t.status === "in-progress").length;

    const byPriority = [
      {
        name: "Low",
        value: tasks.filter((t) => t.priority === "low").length,
        color: "#10b981",
      },
      {
        name: "Medium",
        value: tasks.filter((t) => t.priority === "medium").length,
        color: "#f59e0b",
      },
      {
        name: "High",
        value: tasks.filter((t) => t.priority === "high").length,
        color: "#f43f5e",
      },
    ];

    const byStatus = [
      { name: "Pending", value: pending, color: "#f43f5e" },
      { name: "In Progress", value: inProgress, color: "#f59e0b" },
      { name: "Completed", value: completed, color: "#10b981" },
    ];

    return {
      completed,
      pending,
      inProgress,
      total: tasks.length,
      byPriority,
      byStatus,
    };
  }, [tasks]);

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          label="Total Tasks"
          value={stats.total}
          icon={ClipboardList}
          color="text-primary"
        />
        <StatCard
          label="Completed"
          value={stats.completed}
          icon={CheckCircle2}
          color="text-emerald-500"
        />
        <StatCard
          label="Processing"
          value={stats.inProgress}
          icon={Activity}
          color="text-amber-500"
        />
        <StatCard
          label="Pending"
          value={stats.pending}
          icon={Clock}
          color="text-rose-500"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Card className="p-5">
          <h4 className="text-sm font-bold uppercase mb-8 italic">
            Penyebaran Status
          </h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.byStatus}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label
                >
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

        <Card className="p-5">
          <h4 className="text-sm font-bold uppercase mb-8 italic">
            Prioritas Pengerjaan
          </h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.byPriority}>
                <XAxis
                  dataKey="name"
                  fontSize={10}
                  tick={{ fontWeight: "black" }}
                />
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
  const operators = workers.filter((w: any) => w.lastLat && w.lastLng);

  return (
    <Card className="p-5 relative overflow-hidden bg-card border border-border/50 rounded-2xl shadow-sm">
      <div className="absolute top-5 right-8 flex items-center gap-2 z-10 bg-white/80 backdrop-blur px-3 py-1.5 rounded-full border border-gray-200">
        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
        <span className="text-xs font-bold uppercase tracking-widest text-emerald-600">
          Live Radar
        </span>
      </div>

      <div className="h-[400px] bg-gray-50/50 rounded-2xl border border-dashed border-gray-200 relative overflow-hidden flex items-center justify-center">
        {/* Soft Background grid instead of brutalist */}
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03]"></div>

        {operators.length === 0 ? (
          <div className="absolute inset-0 flex items-center justify-center flex-col gap-4">
            <div className="w-16 h-16 bg-white shadow-sm flex items-center justify-center rounded-2xl border border-gray-100">
              <MapPin className="w-8 h-8 text-gray-300" />
            </div>
            <p className="text-xs font-bold uppercase text-gray-400 tracking-[0.2em] px-4 py-2">
              Belum There are Sinyal Aktif
            </p>
          </div>
        ) : (
          <div className="absolute inset-0 p-5 flex flex-wrap gap-5 items-center justify-center">
            {operators.map((op: any) => (
              <motion.div
                key={op.id}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                whileHover={{ scale: 1.05 }}
                className="flex flex-col items-center gap-3 bg-white p-4 rounded-2xl border border-gray-100 shadow-xl relative z-10"
              >
                <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                  <User className="w-6 h-6" />
                </div>
                <div className="text-center w-full px-2">
                  <h5 className="text-sm font-bold truncate mb-1 text-gray-900">
                    {op.name}
                  </h5>
                  <p className="text-[10px] font-bold text-gray-500 uppercase">
                    {op.role}
                  </p>
                </div>
                <div className="flex gap-2 w-full mt-2">
                  <div className="flex-1 bg-gray-50 text-gray-600 py-1.5 rounded-lg text-center text-[10px] font-mono font-medium border border-gray-100">
                    {op.lastLat?.toFixed(4)}
                  </div>
                  <div className="flex-1 bg-gray-50 text-gray-600 py-1.5 rounded-lg text-center text-[10px] font-mono font-medium border border-gray-100">
                    {op.lastLng?.toFixed(4)}
                  </div>
                </div>
                <div className="w-full bg-emerald-50 text-emerald-600 mt-1 py-1.5 rounded-lg text-center text-[10px] font-bold">
                  Aktif{" "}
                  {Math.floor((Date.now() - (op.lastUpdate || 0)) / 1000 / 60)}
                  mnt lalu
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
};

const StatCard = React.memo(
  ({ label, value, icon: Icon, color, unit }: any) => (
    <Card className="p-4 sm:p-5 bg-card border border-border/50 rounded-[2rem] shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all overflow-hidden relative">
      <div className="flex items-center gap-3 mb-3 relative z-10">
        <div
          className={cn(
            "p-2.5 sm:p-3 bg-white/5 dark:bg-black/10 rounded-2xl flex items-center justify-center",
            color,
          )}
        >
          <Icon
            className="w-5 h-5 sm:w-6 sm:h-6 text-current"
            strokeWidth={2.5}
          />
        </div>
        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-tight">
          {label}
        </span>
      </div>
      <div className="text-2xl sm:text-3xl font-black tracking-tight text-foreground relative z-10">
        {value}
      </div>
      {unit && (
        <div className="text-[9px] font-black tracking-widest text-indigo-600 dark:text-indigo-400 mt-3 inline-block px-3 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-900/20 relative z-10">
          {unit}
        </div>
      )}
    </Card>
  ),
);

const ProjectCard = React.memo(
  ({ project, isAdmin, onClick, onDelete, onArchive, index }: any) => {
    const metrics = React.useMemo(() => {
      // Filter non-archived entries for metrics calculation
      const activeEntries = (project.entries || []).filter(
        (e: any) => !e.isArchived,
      );

      const isPekanbaruDumaiInlet =
        project.name?.toUpperCase()?.includes("PEKANBARU-DUMAI") &&
        project.type === "inlet";

      if (activeEntries.length === 0 && !isPekanbaruDumaiInlet) {
        return {
          primary: { label: "DATA UTAMA", value: "0" },
          secondary: {
            label: "PROGRES",
            value: project.targetQty ? `0% / ${project.targetQty}` : "0%",
          },
        };
      }

      if (project.targetQty) {
        const dbQty = activeEntries.reduce((sum: number, e: any) => {
          if (project.type === "asphalt") return sum + (Number(e.tonase) || 0);
          return sum + (Number(e.qty) || 0);
        }, 0);

        const manualAddition = isPekanbaruDumaiInlet ? 401 : 0;
        const realized = dbQty + manualAddition;

        const prog = Math.min(
          100,
          Math.round((realized / project.targetQty) * 100),
        );
        const shortage = Math.max(0, project.targetQty - realized);
        const unit =
          project.type === "asphalt"
            ? "t"
            : project.type === "painting"
              ? "m²"
              : "PCS/QTY";
        return {
          primary: {
            label: "REALISASI",
            value: `${realized.toLocaleString("id-ID")} ${unit}`,
          },
          secondary: {
            label: `SISA: ${shortage.toLocaleString("id-ID")} ${unit}`,
            value: `${prog}% / ${project.targetQty.toLocaleString("id-ID")}`,
          },
        };
      }

      if (project.type === "asphalt" || !project.type) {
        const vol = activeEntries.reduce(
          (sum: number, e: any) => sum + (Number(e.volume) || 0),
          0,
        );
        const ton = activeEntries.reduce(
          (sum: number, e: any) => sum + (Number(e.tonase) || 0),
          0,
        );
        return {
          primary: {
            label: "TOT VOLUME",
            value: `${vol.toLocaleString("id-ID", { minimumFractionDigits: 3, maximumFractionDigits: 3 })} m³`,
          },
          secondary: {
            label: "TOT TONASE",
            value: `${ton.toLocaleString("id-ID", { minimumFractionDigits: 3, maximumFractionDigits: 3 })} t`,
          },
        };
      }

      const qty = activeEntries.reduce(
        (sum: number, e: any) => sum + (Number(e.qty) || 0),
        0,
      );
      const completed = activeEntries.filter(
        (e: any) => e.status === "completed",
      ).length;
      const progress = Math.round((completed / activeEntries.length) * 100);

      let unit = "PCS/QTY";
      if (project.type === "painting") unit = "m²";
      else if (project.type === "planting") unit = "Phn";

      return {
        primary: {
          label: "KUANTITAS",
          value: `${qty.toLocaleString("id-ID")} ${unit}`,
        },
        secondary: {
          label: "PROGRES",
          value: `${progress}% (${completed}/${activeEntries.length})`,
        },
      };
    }, [project]);

    const { generateDPR } = useApp();

    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05 }}
        onClick={onClick}
        className="group relative flex flex-col bg-card border border-border/50 p-6 rounded-[2rem] hover:-translate-y-1 hover:shadow-lg transition-all duration-300 cursor-pointer overflow-hidden shadow-sm"
      >
        <div className="flex justify-between items-start mb-6 z-10 w-full relative">
          <div className="w-16 h-16 rounded-[1.5rem] bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform duration-300 shrink-0 shadow-inner">
            {project.type === "asphalt" && (
              <Database className="w-8 h-8" strokeWidth={2} />
            )}
            {project.type === "inlet" && (
              <Layers className="w-8 h-8" strokeWidth={2} />
            )}
            {project.type === "traffic-sign" && (
              <ShieldCheck className="w-8 h-8" strokeWidth={2} />
            )}
            {project.type === "painting" && (
              <TrendingUp className="w-8 h-8" strokeWidth={2} />
            )}
            {project.type === "planting" && (
              <Sun className="w-8 h-8" strokeWidth={2} />
            )}
            {project.type === "other" && (
              <Activity className="w-8 h-8" strokeWidth={2} />
            )}
            {!project.type && <Database className="w-8 h-8" strokeWidth={2} />}
          </div>

          {isAdmin && (
            <div className="flex items-center gap-3 z-20 pt-1 pr-1 bg-background/50 backdrop-blur-md px-3 py-2 rounded-full border border-border/50 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={(e: any) => {
                  e.stopPropagation();
                  generateDPR(project.id);
                }}
                className="text-emerald-500 hover:text-emerald-600 transition-colors bg-transparent border-none p-0 hover:scale-110"
                title="Generate Daily Progress Report (PDF)"
              >
                <FileSpreadsheet className="w-4 h-4" />
              </button>
              <button
                onClick={(e: any) => {
                  e.stopPropagation();
                  onArchive(project.id, project.isArchived);
                }}
                className="text-amber-500 hover:text-amber-600 transition-colors bg-transparent border-none p-0 hover:scale-110"
                title={project.isArchived ? "Pulihkan" : "Archivekan"}
              >
                {project.isArchived ? (
                  <ArchiveRestore className="w-4 h-4" />
                ) : (
                  <Archive className="w-4 h-4" />
                )}
              </button>
              <button
                onClick={(e: any) => {
                  e.stopPropagation();
                  onDelete(e);
                }}
                className="text-rose-500 hover:text-rose-600 transition-colors bg-transparent border-none p-0 hover:scale-110"
                title="Delete Permanen"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        <div className="z-10 flex-grow mb-6 space-y-4 relative">
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full border border-indigo-200 dark:border-indigo-900/50 text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-900/20 max-w-fit shadow-sm">
              {project.type || "Legacy"}
            </span>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              {new Date(project.createdAt)
                .toLocaleDateString("id-ID", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })
                .toUpperCase()}
            </p>
          </div>

          <h3 className="text-xl md:text-2xl font-black tracking-tight leading-tight group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors text-foreground">
            {project.name}
          </h3>

          <div className="flex flex-col gap-2 px-0.5 mt-2">
            <div className="flex items-center gap-3 text-[11px] md:text-xs font-bold text-muted-foreground tracking-wide">
              <MapPin className="w-4 h-4 text-rose-500 shrink-0" />
              <span className="truncate uppercase">
                {project.locationInfo || "TIDAK DITETAPKAN"}
              </span>
            </div>
            <div className="flex items-center gap-3 text-[11px] md:text-xs font-bold text-muted-foreground tracking-wide">
              <Layers className="w-4 h-4 text-emerald-500 shrink-0" />
              <span className="truncate uppercase">
                {project.regionalInfo || "SUMBAGTENG"}
              </span>
            </div>
          </div>

          {project.description && (
            <p className="text-[10px] md:text-[11px] text-muted-foreground font-black uppercase tracking-widest mt-4 line-clamp-2 bg-secondary/50 p-3 rounded-xl border border-border/50">
              {project.description}
            </p>
          )}

          {project.documentUrl && (
            <div className="pt-2">
              <a
                href={
                  project.documentUrl.startsWith("http")
                    ? project.documentUrl
                    : `https://${project.documentUrl}`
                }
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 rounded-xl font-black uppercase text-[10px] tracking-widest transition-colors border border-indigo-100 dark:border-indigo-800"
                onClick={(e) => e.stopPropagation()}
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                Manual / SOP Info
              </a>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3 mb-6 z-10 w-full">
          <div className="bg-secondary/40 border border-border/50 p-4 rounded-2xl flex flex-col justify-center">
            <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mb-1.5">
              {metrics.primary.label}
            </span>
            <span className="text-sm font-black text-indigo-600 dark:text-indigo-400 truncate block uppercase">
              {metrics.primary.value}
            </span>
          </div>
          <div className="bg-secondary/20 border border-border/50 p-4 rounded-2xl flex flex-col justify-center">
            <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mb-1.5">
              {metrics.secondary.label}
            </span>
            <span className="text-sm font-black text-foreground truncate block uppercase">
              {metrics.secondary.value}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-5 border-t border-border/50 mt-auto z-10">
          <div className="flex flex-col">
            <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mb-0.5">
              Database Entries
            </span>
            <span className="text-xs font-black text-foreground uppercase">
              {project.entries?.length || 0} Records
            </span>
          </div>
          <div className="w-10 h-10 rounded-full bg-secondary text-muted-foreground flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300 shadow-sm border border-border">
            <ArrowRight
              className="w-4 h-4 -rotate-45 group-hover:rotate-0 transition-transform duration-300"
              strokeWidth={2.5}
            />
          </div>
        </div>
      </motion.div>
    );
  },
);

const TaskCard = ({
  task,
  isAdmin,
  currentUserEmail,
  onUpdateStatus,
  onDelete,
  onArchive,
  uploadingPhoto,
  localRealizationPhotos,
  onUploadPhoto,
  onClearLocalPhotos,
}: any) => {
  const isCompleted = task.status === "completed";
  const isInProgress = task.status === "in-progress";

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
    return assigneesEmails.some((e: any) => e?.toLowerCase() === email);
  }, [assigneesEmails, currentUserEmail]);

  const [showHistory, setShowHistory] = React.useState(false);

  const progressMap = {
    pending: 5,
    "in-progress": 50,
    completed: 100,
  };
  const progress = progressMap[task.status as keyof typeof progressMap] || 0;

  const priorityColors = {
    low: "bg-emerald-500/10 text-emerald-500 border-emerald-500",
    medium: "bg-amber-500/10 text-amber-500 border-amber-500",
    high: "bg-rose-500/10 text-rose-500 border-rose-500",
  };

  const assignees = Array.isArray(task.assignedTo)
    ? task.assignedTo
    : [task.assignedTo];

  return (
    <Card
      className={cn(
        "p-5 sm:p-6 relative transition-all rounded-[2rem] border overflow-hidden group shadow-sm hover:shadow-md",
        isCompleted
          ? "border-emerald-500/30 bg-emerald-50/30 dark:bg-emerald-900/10"
          : isInProgress
            ? "border-amber-500/30 bg-amber-50/30 dark:bg-amber-900/10"
            : "border-border/50 bg-card",
      )}
    >
      {/* Progress Bar */}
      <div className="absolute top-0 left-0 w-full h-1 bg-secondary overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          className={cn(
            "h-full",
            isCompleted
              ? "bg-emerald-500"
              : isInProgress
                ? "bg-amber-500"
                : "bg-rose-500",
          )}
        />
      </div>

      <div className="flex items-center justify-between mb-5 pt-2">
        <div className="flex flex-wrap gap-2">
          <Badge
            variant={
              task.status === "completed"
                ? "success"
                : task.status === "in-progress"
                  ? "warning"
                  : "danger"
            }
            className="uppercase font-black text-[9px] tracking-widest px-3"
          >
            {task.status}
          </Badge>
          <span
            className={cn(
              "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border",
              priorityColors[task.priority as keyof typeof priorityColors],
            )}
          >
            {task.priority || "medium"}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex flex-col items-end mr-2">
            <span className="text-[10px] font-bold text-muted-foreground uppercase">
              Dibuat: {new Date(task.createdAt).toLocaleDateString()}
            </span>
            {task.dueDate && (
              <span
                className={cn(
                  "text-[10px] font-bold uppercase italic tracking-tighter flex items-center gap-1",
                  Date.now() > task.dueDate
                    ? "text-rose-600 animate-pulse"
                    : "text-amber-600",
                )}
              >
                <Clock className="w-3 h-3" /> Deadline:{" "}
                {new Date(task.dueDate).toLocaleString("id-ID", {
                  day: "2-digit",
                  month: "short",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            )}
          </div>
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="text-muted-foreground hover:text-primary transition-colors"
          >
            <History className="w-4 h-4" />
          </button>
          {isAdmin && (
            <div className="flex items-center gap-1">
              <button
                onClick={() => onArchive(task.id, task.isArchived)}
                className="text-muted-foreground hover:text-amber-500 p-1"
                title={task.isArchived ? "Pulihkan" : "Archivekan"}
              >
                {task.isArchived ? (
                  <ArchiveRestore className="w-4 h-4" />
                ) : (
                  <Archive className="w-4 h-4" />
                )}
              </button>
              <button
                onClick={() => onDelete(task.id)}
                className="text-muted-foreground hover:text-rose-500 p-1"
              >
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
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden bg-muted/50 rounded-2xl border border-border mb-6"
          >
            <div className="p-4 space-y-4">
              <h5 className="text-xs font-bold uppercase italic tracking-tighter flex items-center gap-2 text-primary">
                <History className="w-3.5 h-3.5" /> Log History Activity Tasks
              </h5>
              <div className="space-y-4 relative before:absolute before:left-[7px] before:top-2 before:bottom-2 before:w-[1.5px] before:bg-border/50">
                {task.history?.map((log: any, i: number) => (
                  <div
                    key={log.id || i}
                    className="flex gap-4 text-[10px] relative pl-5 py-0.5"
                  >
                    <div className="absolute left-0 top-2.5 w-4 h-4 bg-background border border-primary/30 rounded-full flex items-center justify-center -translate-x-[4.5px] z-10 p-0.5">
                      <div
                        className={cn(
                          "w-full h-full rounded-full animate-pulse",
                          log.status === "completed"
                            ? "bg-emerald-500"
                            : log.status === "in-progress"
                              ? "bg-amber-500"
                              : "bg-rose-500",
                        )}
                      />
                    </div>
                    <div className="flex-1 bg-background/50 p-4 rounded-2xl border border-white/10 shadow-sm group hover:border-primary/30 transition-all">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <p className="font-bold uppercase tracking-tighter text-primary">
                            {log.userName}
                          </p>
                          <span className="text-[7px] opacity-30 lowercase">
                            {log.userEmail}
                          </span>
                        </div>
                        <p className="text-[10px] opacity-40 font-bold bg-muted px-2 py-0.5 rounded-lg border border-border/50">
                          {new Date(log.timestamp).toLocaleString("id-ID", {
                            day: "2-digit",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={
                            log.status === "completed"
                              ? "success"
                              : log.status === "in-progress"
                                ? "warning"
                                : "danger"
                          }
                        >
                          {log.status}
                        </Badge>
                        <p className="text-muted-foreground font-bold uppercase tracking-tighter opacity-80 leading-relaxed italic">
                          "{log.note}"
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
                {(!task.history || task.history.length === 0) && (
                  <div className="text-xs italic text-muted-foreground opacity-50 p-5 text-center bg-muted/20 rounded-2xl border border-dashed border-border ml-5">
                    None yet catatan riwayat aktivitas untuk tugas ini.
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <h3 className="text-2xl font-bold italic tracking-tighter uppercase mb-2">
        {task.title}
      </h3>
      <p className="text-sm text-muted-foreground leading-relaxed mb-4">
        {task.description}
      </p>

      {task.documentUrl && (
        <div className="mb-6">
          <a
            href={
              task.documentUrl.startsWith("http")
                ? task.documentUrl
                : `https://${task.documentUrl}`
            }
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 text-blue-500 rounded-xl border border-blue-500/20 hover:bg-blue-500/20 transition-all text-xs font-bold uppercase"
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
            <span className="text-[10px] font-bold uppercase text-muted-foreground opacity-50 px-1">
              Instruksi Admin
            </span>
            <div className="aspect-video rounded-2xl overflow-hidden border border-border bg-muted">
              <FirebaseImage
                url={task.photo}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>
        )}
        <div className="space-y-2">
          <span className="text-[10px] font-bold uppercase text-primary opacity-50 px-1 flex items-center gap-2">
            Realization Lapangan{" "}
            {isCompleted && (
              <CheckCircle2 className="w-2.5 h-2.5 text-emerald-500" />
            )}
          </span>
          <div className="grid grid-cols-3 gap-2">
            {/* Stored Photos */}
            {task.realizationPhotos?.map((p: string, i: number) => (
              <div
                key={i}
                className="aspect-square rounded-xl overflow-hidden border border-border shadow-sm"
              >
                <FirebaseImage
                  url={p}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
            ))}
            {/* Unsaved Draft Photos */}
            {localRealizationPhotos.map((p: string, i: number) => (
              <div
                key={`d-${i}`}
                className="aspect-square rounded-xl overflow-hidden border border-primary/50 border-dashed relative group"
              >
                <FirebaseImage
                  url={p}
                  className="w-full h-full object-cover opacity-60"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-x-0 bottom-0 py-1 bg-primary text-[6px] font-bold text-white text-center uppercase tracking-tighter">
                  Draft Foto
                </div>
              </div>
            ))}
            {localRealizationPhotos.length === 0 &&
              (!task.realizationPhotos ||
                task.realizationPhotos.length === 0) && (
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
              <label
                className="flex-1 h-full flex flex-col items-center justify-center cursor-pointer hover:bg-secondary transition-all rounded-l-2xl border-r border-border"
                title="Camera"
              >
                {uploadingPhoto ? (
                  <Activity className="w-4 h-4 animate-spin text-primary mb-0.5" />
                ) : (
                  <Camera className="w-4 h-4 text-primary mb-0.5" />
                )}
                <span className="text-[7px] font-bold uppercase text-primary/80">
                  Camera
                </span>
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  capture="environment"
                  onChange={onUploadPhoto}
                />
              </label>
              <label
                className="flex-1 h-full flex flex-col items-center justify-center cursor-pointer hover:bg-secondary transition-all rounded-r-2xl"
                title="Gallery"
              >
                {uploadingPhoto ? (
                  <Activity className="w-4 h-4 animate-spin text-emerald-500 mb-0.5" />
                ) : (
                  <ImageIcon className="w-4 h-4 text-emerald-500 mb-0.5" />
                )}
                <span className="text-[7px] font-bold uppercase text-emerald-500/80">
                  Gallery
                </span>
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={onUploadPhoto}
                />
              </label>
            </div>

            {localRealizationPhotos.length > 0 && (
              <Button
                onClick={() => {
                  // Save progress without completing
                  onUpdateStatus(
                    task.id,
                    task.status,
                    localRealizationPhotos,
                    true,
                  );
                  onClearLocalPhotos();
                }}
                className="flex-[1] h-14 rounded-2xl bg-blue-600 hover:bg-blue-500 text-xs font-bold uppercase tracking-widest"
              >
                Save
              </Button>
            )}

            <Button
              onClick={() => {
                if (
                  isInProgress &&
                  localRealizationPhotos.length === 0 &&
                  (!task.realizationPhotos ||
                    task.realizationPhotos.length === 0)
                ) {
                  alert(
                    "Wajib lampirkan minimal 1 foto bukti pengerjaan untuk menyelesaikan tugas.",
                  );
                  return;
                }
                const nextStatus = isInProgress ? "completed" : "in-progress";
                onUpdateStatus(task.id, nextStatus, localRealizationPhotos);
                onClearLocalPhotos();
              }}
              className="flex-[1.5] h-14 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-xs font-bold uppercase tracking-widest"
            >
              {isInProgress ? "Completedkan Tasks" : "Terima Pekerjaan"}
            </Button>
          </>
        )}
        <div className="flex flex-col">
          <span className="text-[10px] font-bold text-muted-foreground uppercase opacity-40">
            Petugas Ditunjuk
          </span>
          <div className="flex -space-x-2 mt-1">
            {assigneesNames.map((name: string, i: number) => (
              <div
                key={i}
                className="w-6 h-6 rounded-full bg-primary flex items-center justify-center border border-background"
                title={name}
              >
                <span className="text-[10px] font-bold text-white">
                  {(name || "?").charAt(0)}
                </span>
              </div>
            ))}
            <span className="text-xs font-bold uppercase tracking-tight ml-3 self-center">
              {assigneesNames.length} Petugas
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
};

const WorkerCard = ({
  worker,
  onDelete,
  onEdit,
  onCashAdvance,
  isSuperAdmin,
  isDevAccount,
}: any) => (
  <Card className="group flex flex-col bg-card border-border border rounded-2xl p-5 relative overflow-hidden transition-all hover:border-primary/50 hover:shadow-xl dark:shadow-none hover:-translate-y-1">
    <div className="flex items-center gap-5 z-10 w-full mb-6 pb-4 border-b border-border/50">
      <div className="w-16 h-16 bg-muted/30 border border-border/50 rounded-2xl flex items-center justify-center shrink-0 shadow-sm p-1">
        <img
          src="/icon.svg"
          alt="Worker"
          className="w-full h-full object-contain opacity-80"
        />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-3">
          <h4 className="text-xl font-bold truncate leading-tight">
            {worker.name}
          </h4>
          {worker.isPinnedToLogin && (
            <span title="Pinned to Login" className="shrink-0 drop-shadow-sm">
              <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
            </span>
          )}
        </div>
        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mt-1 bg-muted/50 px-3 py-1 rounded-full inline-block border border-border/50">
          {worker.employeeId} • {worker.role}
        </p>
      </div>
    </div>

    <div className="grid grid-cols-2 gap-4 mb-6 w-full">
      <div className="bg-muted/30 p-4 rounded-2xl border border-border/50 flex flex-col justify-center">
        <span className="text-[10px] font-bold text-primary uppercase tracking-[0.2em] mb-1.5 flex items-center gap-1.5">
          <Wallet className="w-3.5 h-3.5" /> Rate Dayan
        </span>
        <span className="text-sm font-bold text-foreground truncate block">
          Rp {worker.dailyRate?.toLocaleString("id-ID") || 0}
        </span>
      </div>
      {isSuperAdmin ? (
        <div className="bg-rose-500/5 p-4 rounded-2xl border border-rose-500/10 flex flex-col justify-center">
          <span className="text-[10px] font-bold text-rose-500 uppercase tracking-[0.2em] mb-1.5">
            Security Key
          </span>
          <span className="text-xs font-mono font-bold text-foreground truncate block bg-background/50 px-2 py-1 rounded-md border border-rose-500/20">
            {worker.password}
          </span>
        </div>
      ) : (
        <div className="bg-muted/30 p-4 rounded-2xl flex flex-col justify-center border border-dashed border-border/50 opacity-50">
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] text-center">
            Confidential
          </span>
        </div>
      )}
    </div>

    {isSuperAdmin && (
      <div className="mb-6 px-4 py-3 bg-primary/5 border-l-2 border-primary rounded-r-xl">
        <p className="text-[10px] font-bold uppercase tracking-widest text-primary/70">
          System Email:{" "}
          <span className="lowercase font-bold text-primary">
            {worker.email}
          </span>
        </p>
      </div>
    )}

    <div className="flex gap-2 mt-auto">
      <button
        onClick={onCashAdvance}
        className="flex-1 py-3 px-2 rounded-xl bg-amber-500/10 text-amber-600 font-bold text-xs uppercase tracking-widest hover:bg-amber-500 hover:text-white transition-all flex justify-center items-center gap-1.5"
        title="Catat Kasbon"
      >
        <Wallet className="w-4 h-4" /> Kasbon
      </button>
      <button
        onClick={onEdit}
        className="flex-[1] py-3 px-2 rounded-xl bg-primary/10 text-primary font-bold text-xs uppercase tracking-widest hover:bg-primary hover:text-white transition-all flex justify-center items-center gap-1.5"
      >
        <ArrowRight className="w-4 h-4 -rotate-45" /> Edit
      </button>
      {isDevAccount && (
        <button
          onClick={() =>
            confirm("Delete akses pegawai ini?") && onDelete(worker.id)
          }
          className="w-12 rounded-xl bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white transition-all flex items-center justify-center shrink-0"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      )}
    </div>
  </Card>
);

const GeofenceCard = ({ worker, onEdit }: any) => {
  const isEnabled = worker.geofenceLimit?.enabled;
  return (
    <Card className="flex flex-col bg-card border border-border/50 rounded-2xl p-5 transition-all shadow-sm hover:shadow-xl hover:-translate-y-1">
      <div className="flex items-center gap-4 mb-6 pb-6 border-b border-border/50">
        <div
          className={cn(
            "w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 border shadow-sm",
            isEnabled
              ? "bg-primary/10 text-primary border-primary/20"
              : "bg-muted text-muted-foreground border-border/50",
          )}
        >
          <MapPin className="w-6 h-6" />
        </div>
        <div className="min-w-0">
          <h4 className="text-xl font-bold truncate leading-tight mb-2">
            {worker.name}
          </h4>
          <span
            className={cn(
              "text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full inline-block border",
              isEnabled
                ? "border-primary/30 bg-primary/5 text-primary"
                : "border-border text-muted-foreground bg-muted/50",
            )}
          >
            {isEnabled ? "Geo-Radius Aktif" : "Login Area Bebas"}
          </span>
        </div>
      </div>

      {isEnabled && worker.geofenceLimit ? (
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-primary/5 border border-primary/10 rounded-2xl p-4 flex flex-col justify-center">
            <span className="text-[10px] font-bold uppercase tracking-widest text-primary/70 mb-1">
              Limit Radius
            </span>
            <span className="text-sm font-bold text-foreground">
              {worker.geofenceLimit.radius} Meter
            </span>
          </div>
          <div className="bg-muted/30 p-4 rounded-2xl flex flex-col justify-center border border-border/50">
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">
              Coordinates
            </span>
            <span className="text-xs font-mono font-bold truncate opacity-80">
              {worker.geofenceLimit.lat.toFixed(4)},{" "}
              {worker.geofenceLimit.lng.toFixed(4)}
            </span>
          </div>
        </div>
      ) : (
        <div className="h-20 mb-6 rounded-2xl flex items-center justify-center border border-dashed border-border/50 bg-muted/20">
          <span className="text-xs font-bold uppercase text-muted-foreground tracking-[0.2em] opacity-40">
            Proteksi Dinonaktifkan
          </span>
        </div>
      )}

      <button
        onClick={onEdit}
        className="w-full py-3.5 rounded-xl bg-muted/50 text-foreground font-bold text-xs uppercase tracking-[0.2em] hover:bg-foreground hover:text-background transition-colors border border-border/50"
      >
        Konfigurasi Area Absensi
      </button>
    </Card>
  );
};

const ChatInterface = ({
  messages,
  currentUser,
  workers,
  onSendMessage,
  setMsgContent,
  msgContent,
  msgReceiver,
  setMsgReceiver,
  onUploadPhoto,
  isUploading,
  msgPhoto,
  setMsgPhoto,
}: any) => {
  const scrollRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <Card className="h-[600px] flex flex-col border-border shadow-md relative overflow-hidden bg-muted/20 backdrop-blur-md">
      <div className="p-5 border-b border-border bg-card flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 p-2 rounded-xl">
            <MessageSquare className="w-5 h-5 text-primary" />
          </div>
          <h3 className="font-bold italic uppercase text-lg">
            Communication Lab
          </h3>
        </div>
        <div className="text-[10px] font-bold uppercase bg-emerald-500/10 text-emerald-500 px-3 py-1 rounded-full border border-emerald-500/20">
          System Online
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-5 space-y-6 custom-scrollbar"
      >
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center opacity-30 text-center space-y-4">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center animate-pulse">
              <MessageSquare className="w-8 h-8" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest">
                None yet percakapan
              </p>
              <p className="text-[10px] font-bold">
                Kirim pesan rahasia ke pelaksana lapangan
              </p>
            </div>
          </div>
        ) : (
          messages.map((m: any) => (
            <div
              key={m.id}
              className={cn(
                "flex flex-col gap-2",
                m.senderEmail?.toLowerCase() ===
                  currentUser?.email?.toLowerCase()
                  ? "items-end"
                  : "items-start",
              )}
            >
              <div
                className={cn(
                  "max-w-[85%] p-5 rounded-2xl shadow-sm",
                  m.senderEmail?.toLowerCase() ===
                    currentUser?.email?.toLowerCase()
                    ? "bg-primary text-primary-foreground rounded-tr-none"
                    : "bg-card border border-border rounded-tl-none",
                )}
              >
                {m.photo && (
                  <FirebaseImage
                    url={m.photo}
                    className="w-full rounded-2xl mb-4 border border-black/5"
                    referrerPolicy="no-referrer"
                  />
                )}
                <p className="text-sm font-medium leading-relaxed tracking-tight">
                  {m.content}
                </p>
              </div>
              <span className="text-[10px] font-bold uppercase opacity-40 px-3">
                {(m.senderEmail || "").split("@")[0]} •{" "}
                {new Date(m.timestamp || 0).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          ))
        )}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          if ((msgContent.trim() || msgPhoto) && msgReceiver) {
            onSendMessage(msgContent, msgReceiver, msgPhoto);
            setMsgContent("");
            setMsgPhoto("");
          }
        }}
        className="p-5 bg-card border-t border-border space-y-4"
      >
        <div className="flex gap-2">
          <select
            value={msgReceiver}
            onChange={(e) => setMsgReceiver(e.target.value)}
            className="flex-1 h-12 bg-muted border border-border rounded-xl px-4 text-xs font-bold uppercase tracking-widest outline-none transition-all focus:ring-2 ring-primary"
          >
            <option value="">Select Penerima</option>
            <option value="ALL">Siaran Seluruh Unit</option>
            {workers.map((w: any) => (
              <option key={w.id} value={w.email}>
                {w.name} ({w.employeeId})
              </option>
            ))}
          </select>
          <div className="flex gap-1 h-12">
            <label className="h-full w-12 flex flex-col items-center justify-center bg-muted border border-border rounded-l-xl cursor-pointer hover:bg-secondary border-r-0">
              {isUploading ? (
                <Activity className="w-3 h-3 animate-spin text-primary mb-0.5" />
              ) : (
                <Camera className="w-3 h-3 text-primary mb-0.5" />
              )}
              <span className="text-[5px] font-bold uppercase text-primary/80">
                Camera
              </span>
              <input
                type="file"
                className="hidden"
                accept="image/*"
                capture="environment"
                onChange={onUploadPhoto}
              />
            </label>
            <label className="h-full w-12 flex flex-col items-center justify-center bg-muted border border-border rounded-r-xl cursor-pointer hover:bg-secondary">
              {isUploading ? (
                <Activity className="w-3 h-3 animate-spin text-emerald-500 mb-0.5" />
              ) : (
                <ImageIcon className="w-3 h-3 text-emerald-500 mb-0.5" />
              )}
              <span className="text-[5px] font-bold uppercase text-emerald-500/80">
                Gallery
              </span>
              <input
                type="file"
                className="hidden"
                accept="image/*"
                onChange={onUploadPhoto}
              />
            </label>
          </div>
        </div>

        <div className="relative">
          <Input
            placeholder="Type classified message..."
            value={msgContent}
            onChange={(e) => setMsgContent(e.target.value)}
            className="h-16 rounded-2xl pr-16 bg-muted border-none shadow-sm"
          />
          <button
            type="submit"
            className="absolute right-3 top-1/2 -translate-y-1/2 bg-primary text-primary-foreground p-3 rounded-2xl shadow-xl hover:scale-105 transition-transform"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
        {msgPhoto && (
          <div className="flex items-center gap-4 bg-muted p-2 rounded-2xl border border-border animate-in slide-in-from-bottom-2">
            <FirebaseImage
              url={msgPhoto}
              className="w-12 h-12 rounded-lg object-cover"
            />
            <span className="text-[10px] font-bold uppercase flex-1">
              Media Attached
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMsgPhoto("")}
              className="rounded-full"
            >
              <X className="w-3 h-3" />
            </Button>
          </div>
        )}
      </form>
    </Card>
  );
};

const Badge = ({ children, variant = "info" }: any) => {
  const styles = {
    info: "bg-blue-100/50 text-blue-600 border border-blue-200",
    success: "bg-emerald-50 text-emerald-600 border border-emerald-200",
    warning: "bg-amber-50 text-amber-600 border border-amber-200",
    danger: "bg-rose-50 text-rose-600 border border-rose-200",
  };
  return (
    <span
      className={cn(
        "px-2 py-1 flex items-center justify-center rounded-lg text-[10px] font-bold uppercase tracking-widest",
        styles[variant as keyof typeof styles],
      )}
    >
      {children}
    </span>
  );
};

const Modal = ({
  isOpen,
  onClose,
  children,
}: {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        onClick={onClose}
        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative bg-card w-full max-w-xl rounded-[2rem] shadow-xl overflow-hidden border border-border/50"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-foreground/50 hover:text-foreground hover:bg-muted p-2 rounded-full transition-all z-10"
        >
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
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
    />
  </svg>
);

export default DashboardPage;

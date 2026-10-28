import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  User,
  Employee,
  Department,
  Branch,
  WorkSchedule,
  AttendanceRecord,
  AttendanceCorrection,
  LeaveType,
  LeaveRequest,
  OvertimeRequest,
  NotificationItem,
  Announcement,
  AuditLog,
  UserRole,
} from '../types/hris';
import { ParsedEmployeeRow } from '../utils/bulkImport';
import {
  INITIAL_BRANCHES,
  INITIAL_DEPARTMENTS,
  INITIAL_POSITIONS,
  INITIAL_SCHEDULES,
  INITIAL_LEAVE_TYPES,
  INITIAL_USERS,
  INITIAL_EMPLOYEES,
  INITIAL_ATTENDANCE,
  INITIAL_LEAVE_REQUESTS,
  INITIAL_OVERTIME_REQUESTS,
  INITIAL_ATTENDANCE_CORRECTIONS,
  INITIAL_ANNOUNCEMENTS,
  INITIAL_NOTIFICATIONS,
  INITIAL_AUDIT_LOGS,
} from '../data/seedData';
import {
  validateCheckIn,
  calculateWorkDurationMinutes,
  validateLeaveRequest,
  calculateLeaveWorkingDays,
  validateWorkLocationConfig,
} from '../utils/rules';

export type AppTab =
  | 'beranda'
  | 'absensi'
  | 'pengajuan'
  | 'riwayat'
  | 'profil'
  | 'approvals'
  | 'employees'
  | 'locations'
  | 'reports'
  | 'audit'
  | 'docs';

interface HrisContextType {
  currentUser: User;
  currentEmployee: Employee;
  allUsers: User[];
  employees: Employee[];
  departments: Department[];
  branches: Branch[];
  schedules: WorkSchedule[];
  leaveTypes: LeaveType[];
  attendanceRecords: AttendanceRecord[];
  leaveRequests: LeaveRequest[];
  overtimeRequests: OvertimeRequest[];
  attendanceCorrections: AttendanceCorrection[];
  announcements: Announcement[];
  notifications: NotificationItem[];
  auditLogs: AuditLog[];
  activeTab: AppTab;
  setActiveTab: (tab: AppTab) => void;
  deviceMode: 'mobile' | 'fluid';
  setDeviceMode: (mode: 'mobile' | 'fluid') => void;
  activeBranch: Branch;
  setActiveBranch: (branch: Branch) => void;
  activeSchedule: WorkSchedule;
  setActiveSchedule: (schedule: WorkSchedule) => void;
  
  // Actions
  switchUserByRole: (role: UserRole) => void;
  switchUserById: (userId: string) => void;
  performCheckIn: (params: {
    lat: number;
    lng: number;
    method: 'GPS + Swafoto' | 'Fingerprint Toko';
    photoUrl?: string;
    bypassGeofence?: boolean;
    customTime?: string;
  }) => { success: boolean; message: string };
  performCheckOut: (params: {
    lat: number;
    lng: number;
    customTime?: string;
  }) => { success: boolean; message: string };
  submitLeave: (params: {
    leaveTypeId: string;
    startDate: string;
    endDate: string;
    reason: string;
    attachmentUrl?: string;
  }) => { success: boolean; message: string };
  submitOvertime: (params: {
    date: string;
    plannedStartTime: string;
    plannedEndTime: string;
    reason: string;
    taskDescription: string;
  }) => { success: boolean; message: string };
  submitAttendanceCorrection: (params: {
    date: string;
    proposedCheckIn: string;
    proposedCheckOut: string;
    reason: string;
  }) => { success: boolean; message: string };
  decideLeave: (
    requestId: string,
    action: 'APPROVE' | 'REJECT',
    notes: string
  ) => { success: boolean; message: string };
  decideOvertime: (
    requestId: string,
    action: 'APPROVE' | 'REJECT',
    notes: string
  ) => { success: boolean; message: string };
  decideCorrection: (
    correctionId: string,
    action: 'APPROVE' | 'REJECT',
    notes: string
  ) => { success: boolean; message: string };
  addEmployee: (employee: Partial<Employee>) => void;
  updateEmployee: (id: string, updates: Partial<Employee>) => void;
  toggleEmployeeStatus: (id: string) => void;
  addDepartment: (params: { name: string; code: string }) => { success: boolean; message: string };
  bulkImportEmployees: (rows: ParsedEmployeeRow[]) => { success: boolean; importedCount: number; message: string };
  addBranch: (branchData: Omit<Branch, 'id'>) => { success: boolean; message: string; branch?: Branch };
  updateBranch: (id: string, updates: Partial<Branch>) => { success: boolean; message: string };
  toggleBranchStatus: (id: string) => { success: boolean; message: string };
  deleteBranch: (id: string) => { success: boolean; message: string };
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  unreadNotificationCount: number;
  pendingApprovalsCount: number;
  todayAttendanceRecord?: AttendanceRecord;
}

const HrisContext = createContext<HrisContextType | null>(null);

export const HrisProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Current user defaults to Employee (Rian Pratama) for retail mobile experience
  const [currentUser, setCurrentUser] = useState<User>(() => {
    const saved = localStorage.getItem('niceso_current_user');
    return saved ? JSON.parse(saved) : INITIAL_USERS[3]; // Rian Pratama
  });

  const [employees, setEmployees] = useState<Employee[]>(() => {
    const saved = localStorage.getItem('niceso_employees');
    return saved ? JSON.parse(saved) : INITIAL_EMPLOYEES;
  });

  const [departments, setDepartments] = useState<Department[]>(() => {
    const saved = localStorage.getItem('niceso_departments');
    return saved ? JSON.parse(saved) : INITIAL_DEPARTMENTS;
  });

  const [branches, setBranches] = useState<Branch[]>(() => {
    const saved = localStorage.getItem('niceso_branches_v2');
    return saved ? JSON.parse(saved) : INITIAL_BRANCHES;
  });
  const [schedules] = useState<WorkSchedule[]>(INITIAL_SCHEDULES);
  const [leaveTypes] = useState<LeaveType[]>(INITIAL_LEAVE_TYPES);

  const [activeBranch, setActiveBranch] = useState<Branch>(() => {
    const savedBranches = localStorage.getItem('niceso_branches_v2');
    if (savedBranches) {
      try {
        const parsed = JSON.parse(savedBranches);
        if (parsed.length > 1) return parsed[1];
        if (parsed.length > 0) return parsed[0];
      } catch (e) {
        // Fallback
      }
    }
    return INITIAL_BRANCHES[1]; // Niceso Ciputat
  });
  const [activeSchedule, setActiveSchedule] = useState<WorkSchedule>(INITIAL_SCHEDULES[0]); // Reguler Toko

  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>(() => {
    const saved = localStorage.getItem('niceso_attendance');
    return saved ? JSON.parse(saved) : INITIAL_ATTENDANCE;
  });

  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>(() => {
    const saved = localStorage.getItem('niceso_leaves');
    return saved ? JSON.parse(saved) : INITIAL_LEAVE_REQUESTS;
  });

  const [overtimeRequests, setOvertimeRequests] = useState<OvertimeRequest[]>(() => {
    const saved = localStorage.getItem('niceso_overtimes');
    return saved ? JSON.parse(saved) : INITIAL_OVERTIME_REQUESTS;
  });

  const [attendanceCorrections, setAttendanceCorrections] = useState<AttendanceCorrection[]>(() => {
    const saved = localStorage.getItem('niceso_corrections');
    return saved ? JSON.parse(saved) : INITIAL_ATTENDANCE_CORRECTIONS;
  });

  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    const saved = localStorage.getItem('niceso_notifications');
    return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
  });

  const [announcements] = useState<Announcement[]>(INITIAL_ANNOUNCEMENTS);

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    const saved = localStorage.getItem('niceso_audit_logs');
    return saved ? JSON.parse(saved) : INITIAL_AUDIT_LOGS;
  });

  const [activeTab, setActiveTab] = useState<AppTab>('beranda');
  const [deviceMode, setDeviceMode] = useState<'mobile' | 'fluid'>('mobile');

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem('niceso_current_user', JSON.stringify(currentUser));
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('niceso_employees', JSON.stringify(employees));
  }, [employees]);

  useEffect(() => {
    localStorage.setItem('niceso_departments', JSON.stringify(departments));
  }, [departments]);

  useEffect(() => {
    localStorage.setItem('niceso_branches_v2', JSON.stringify(branches));
  }, [branches]);

  useEffect(() => {
    localStorage.setItem('niceso_attendance', JSON.stringify(attendanceRecords));
  }, [attendanceRecords]);

  useEffect(() => {
    localStorage.setItem('niceso_leaves', JSON.stringify(leaveRequests));
  }, [leaveRequests]);

  useEffect(() => {
    localStorage.setItem('niceso_overtimes', JSON.stringify(overtimeRequests));
  }, [overtimeRequests]);

  useEffect(() => {
    localStorage.setItem('niceso_corrections', JSON.stringify(attendanceCorrections));
  }, [attendanceCorrections]);

  useEffect(() => {
    localStorage.setItem('niceso_notifications', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem('niceso_audit_logs', JSON.stringify(auditLogs));
  }, [auditLogs]);

  // Find matching employee for current user
  const currentEmployee =
    employees.find((e) => e.userId === currentUser.id) || employees[3];

  const logAudit = (action: string, module: string, details: string) => {
    const newLog: AuditLog = {
      id: `LOG-${Date.now()}`,
      userId: currentUser.id,
      userName: `${currentUser.fullName} (${currentUser.role})`,
      role: currentUser.role,
      action,
      module,
      details,
      ipAddress: '182.253.120.' + (Math.floor(Math.random() * 200) + 1),
      timestamp: new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' }) + ' WIB',
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  };

  const addNotification = (
    userId: string,
    title: string,
    message: string,
    type: NotificationItem['type'],
    linkTab?: string
  ) => {
    const newNotif: NotificationItem = {
      id: `NOTIF-${Date.now()}`,
      userId,
      title,
      message,
      type,
      isRead: false,
      createdAt: new Date().toLocaleString('id-ID', {
        timeZone: 'Asia/Jakarta',
        hour: '2-digit',
        minute: '2-digit',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      }),
      linkTab,
    };
    setNotifications((prev) => [newNotif, ...prev]);
  };

  const switchUserByRole = (role: UserRole) => {
    const targetUser = INITIAL_USERS.find((u) => u.role === role) || INITIAL_USERS[3];
    setCurrentUser(targetUser);
    logAudit('SWITCH_ROLE', 'Sistem & Autentikasi', `Beralih ke akun role: ${role}`);
  };

  const switchUserById = (userId: string) => {
    const targetUser = INITIAL_USERS.find((u) => u.id === userId);
    if (targetUser) {
      setCurrentUser(targetUser);
      logAudit('SWITCH_USER', 'Sistem & Autentikasi', `Beralih ke profil: ${targetUser.fullName}`);
    }
  };

  // Check today's attendance record for current employee
  const todayStr = '2026-10-27'; // Consistent simulated date matching environment context
  const todayAttendanceRecord = attendanceRecords.find(
    (att) => att.employeeId === currentEmployee.id && att.date === todayStr
  );

  const performCheckIn = (params: {
    lat: number;
    lng: number;
    method: 'GPS + Swafoto' | 'Fingerprint Toko';
    photoUrl?: string;
    bypassGeofence?: boolean;
    customTime?: string;
  }) => {
    if (todayAttendanceRecord && todayAttendanceRecord.checkInTime) {
      return { success: false, message: 'Anda sudah melakukan Check-in hari ini.' };
    }

    const now = new Date();
    const timeStr =
      params.customTime ||
      `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const validation = validateCheckIn({
      checkInTime: timeStr,
      schedule: {
        startTime: activeSchedule.startTime,
        endTime: activeSchedule.endTime,
        toleranceMinutes: activeSchedule.toleranceMinutes,
        breakMinutes: activeSchedule.breakMinutes,
      },
      userLat: params.lat,
      userLng: params.lng,
      branchGeofence: {
        latitude: activeBranch.latitude,
        longitude: activeBranch.longitude,
        radiusMeters: activeBranch.radiusMeters,
        name: activeBranch.name,
        isActive: activeBranch.isActive !== false,
      },
      bypassGeofence: params.bypassGeofence,
    });

    if (!validation.allowed) {
      return { success: false, message: validation.message };
    }

    const newRecord: AttendanceRecord = {
      id: `ATT-${Date.now()}`,
      employeeId: currentEmployee.id,
      employeeName: currentEmployee.fullName,
      employeeNik: currentEmployee.nik,
      department: currentEmployee.department,
      branch: activeBranch.name,
      date: todayStr,
      scheduleId: activeSchedule.id,
      scheduleName: activeSchedule.name,
      scheduledIn: activeSchedule.startTime,
      scheduledOut: activeSchedule.endTime,
      checkInTime: timeStr,
      checkInLat: params.lat,
      checkInLng: params.lng,
      checkInAddress: `${activeBranch.name}, ${activeBranch.address}`,
      checkInMethod: params.method,
      checkInPhoto: params.photoUrl || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
      status: validation.status,
      lateMinutes: validation.lateMinutes,
      workDurationMinutes: 0,
      notes: validation.isLate ? `Terlambat ${validation.lateMinutes} menit` : 'Tepat Waktu',
    };

    setAttendanceRecords((prev) => [
      newRecord,
      ...prev.filter(
        (r) => !(r.employeeId === currentEmployee.id && r.date === todayStr)
      ),
    ]);

    logAudit(
      'CHECK_IN',
      'Absensi',
      `Check-in berhasil (${validation.status}) pada ${timeStr} WIB di ${activeBranch.name}`
    );

    addNotification(
      currentUser.id,
      'Check-in Berhasil Dicatat',
      `Presensi masuk Anda tercatat pada ${timeStr} WIB (${validation.status}).`,
      'CHECKIN_REMINDER'
    );

    return { success: true, message: validation.message };
  };

  const performCheckOut = (params: {
    lat: number;
    lng: number;
    customTime?: string;
  }) => {
    if (!todayAttendanceRecord || !todayAttendanceRecord.checkInTime) {
      return { success: false, message: 'Harap lakukan Check-in terlebih dahulu sebelum Check-out.' };
    }

    if (todayAttendanceRecord.checkOutTime) {
      return { success: false, message: 'Anda sudah melakukan Check-out hari ini.' };
    }

    const now = new Date();
    const timeStr =
      params.customTime ||
      `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const durationMin = calculateWorkDurationMinutes(
      todayAttendanceRecord.checkInTime,
      timeStr,
      activeSchedule.breakMinutes
    );

    const updatedRecord: AttendanceRecord = {
      ...todayAttendanceRecord,
      checkOutTime: timeStr,
      checkOutLat: params.lat,
      checkOutLng: params.lng,
      workDurationMinutes: durationMin,
    };

    setAttendanceRecords((prev) =>
      prev.map((r) => (r.id === todayAttendanceRecord.id ? updatedRecord : r))
    );

    logAudit(
      'CHECK_OUT',
      'Absensi',
      `Check-out berhasil pada ${timeStr} WIB. Total durasi kerja: ${Math.floor(durationMin / 60)}j ${durationMin % 60}m.`
    );

    addNotification(
      currentUser.id,
      'Check-out Berhasil Dicatat',
      `Terima kasih atas kerja keras Anda hari ini! Check-out dicatat pada ${timeStr} WIB.`,
      'CHECKOUT_REMINDER'
    );

    return {
      success: true,
      message: `Check-out berhasil pada ${timeStr} WIB. Total kerja: ${Math.floor(durationMin / 60)} jam ${durationMin % 60} menit.`,
    };
  };

  const submitLeave = (params: {
    leaveTypeId: string;
    startDate: string;
    endDate: string;
    reason: string;
    attachmentUrl?: string;
  }) => {
    const leaveType = leaveTypes.find((lt) => lt.id === params.leaveTypeId);
    if (!leaveType) {
      return { success: false, message: 'Jenis cuti tidak ditemukan.' };
    }

    const workingDays = calculateLeaveWorkingDays(params.startDate, params.endDate);
    if (workingDays <= 0) {
      return { success: false, message: 'Tanggal pengajuan cuti tidak valid atau hanya berisi hari libur.' };
    }

    const validation = validateLeaveRequest({
      currentBalance: currentEmployee.remainingAnnualLeave,
      requestedDays: workingDays,
      deductsAnnualQuota: leaveType.deductsAnnualQuota,
    });

    if (!validation.valid) {
      return { success: false, message: validation.message };
    }

    const newRequest: LeaveRequest = {
      id: `LR-${Date.now()}`,
      employeeId: currentEmployee.id,
      employeeName: currentEmployee.fullName,
      employeeNik: currentEmployee.nik,
      department: currentEmployee.department,
      leaveTypeId: leaveType.id,
      leaveTypeName: leaveType.name,
      startDate: params.startDate,
      endDate: params.endDate,
      totalDays: workingDays,
      reason: params.reason,
      attachmentUrl: params.attachmentUrl,
      status: 'Menunggu Persetujuan',
      createdAt: new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' }),
    };

    setLeaveRequests((prev) => [newRequest, ...prev]);

    logAudit(
      'SUBMIT_LEAVE',
      'Manajemen Cuti',
      `Mengajukan ${leaveType.name} (${workingDays} hari: ${params.startDate} s/d ${params.endDate})`
    );

    // Notify Manager (Ahmad Fauzi)
    addNotification(
      'USR-03',
      'Pengajuan Cuti Baru',
      `${currentEmployee.fullName} mengajukan ${leaveType.name} selama ${workingDays} hari kerja.`,
      'LEAVE_SUBMISSION',
      'approvals'
    );

    return {
      success: true,
      message: `Pengajuan cuti berhasil dikirim! Menunggu persetujuan Store Manager (${workingDays} hari kerja).`,
    };
  };

  const submitOvertime = (params: {
    date: string;
    plannedStartTime: string;
    plannedEndTime: string;
    reason: string;
    taskDescription: string;
  }) => {
    const [sH, sM] = params.plannedStartTime.split(':').map(Number);
    const [eH, eM] = params.plannedEndTime.split(':').map(Number);
    let diff = eH * 60 + eM - (sH * 60 + sM);
    if (diff < 0) diff += 24 * 60;
    const hours = Math.round((diff / 60) * 10) / 10;

    if (hours <= 0) {
      return { success: false, message: 'Jam lembur tidak valid.' };
    }

    const newOvertime: OvertimeRequest = {
      id: `OT-${Date.now()}`,
      employeeId: currentEmployee.id,
      employeeName: currentEmployee.fullName,
      employeeNik: currentEmployee.nik,
      department: currentEmployee.department,
      date: params.date,
      plannedStartTime: params.plannedStartTime,
      plannedEndTime: params.plannedEndTime,
      plannedDurationHours: hours,
      reason: params.reason,
      taskDescription: params.taskDescription,
      status: 'Menunggu Persetujuan',
      createdAt: new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' }),
    };

    setOvertimeRequests((prev) => [newOvertime, ...prev]);

    logAudit(
      'SUBMIT_OVERTIME',
      'Lembur',
      `Mengajukan lembur ${params.date} (${hours} jam: ${params.plannedStartTime} - ${params.plannedEndTime})`
    );

    addNotification(
      'USR-03',
      'Pengajuan Lembur Baru',
      `${currentEmployee.fullName} mengajukan lembur pada ${params.date} durasi ${hours} jam.`,
      'OVERTIME_SUBMISSION',
      'approvals'
    );

    return {
      success: true,
      message: `Pengajuan lembur berhasil diajukan (${hours} jam). Menunggu persetujuan atasan.`,
    };
  };

  const submitAttendanceCorrection = (params: {
    date: string;
    proposedCheckIn: string;
    proposedCheckOut: string;
    reason: string;
  }) => {
    const newCorr: AttendanceCorrection = {
      id: `AC-${Date.now()}`,
      employeeId: currentEmployee.id,
      employeeName: currentEmployee.fullName,
      department: currentEmployee.department,
      date: params.date,
      proposedCheckIn: params.proposedCheckIn,
      proposedCheckOut: params.proposedCheckOut,
      reason: params.reason,
      status: 'Menunggu Persetujuan',
      createdAt: new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' }),
    };

    setAttendanceCorrections((prev) => [newCorr, ...prev]);

    logAudit(
      'SUBMIT_CORRECTION',
      'Koreksi Absensi',
      `Mengajukan koreksi absensi tanggal ${params.date} (${params.proposedCheckIn} - ${params.proposedCheckOut})`
    );

    addNotification(
      'USR-03',
      'Permintaan Koreksi Absensi',
      `${currentEmployee.fullName} mengajukan koreksi jam absensi untuk tanggal ${params.date}.`,
      'ATTENDANCE_CORRECTION',
      'approvals'
    );

    return {
      success: true,
      message: 'Koreksi absensi berhasil dikirim untuk ditinjau oleh atasan/HR.',
    };
  };

  const decideLeave = (
    requestId: string,
    action: 'APPROVE' | 'REJECT',
    notes: string
  ) => {
    const target = leaveRequests.find((r) => r.id === requestId);
    if (!target) return { success: false, message: 'Pengajuan tidak ditemukan.' };

    const status = action === 'APPROVE' ? 'Disetujui' : 'Ditolak';

    setLeaveRequests((prev) =>
      prev.map((r) =>
        r.id === requestId
          ? {
              ...r,
              status,
              approverId: currentUser.id,
              approverName: currentUser.fullName,
              decisionNote: notes,
              decidedAt: new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' }),
            }
          : r
      )
    );

    // If approved and deducts annual quota, deduct employee balance
    const leaveType = leaveTypes.find((lt) => lt.id === target.leaveTypeId);
    if (action === 'APPROVE' && leaveType && leaveType.deductsAnnualQuota) {
      setEmployees((prev) =>
        prev.map((emp) =>
          emp.id === target.employeeId
            ? {
                ...emp,
                remainingAnnualLeave: Math.max(0, emp.remainingAnnualLeave - target.totalDays),
              }
            : emp
        )
      );
    }

    logAudit(
      action === 'APPROVE' ? 'APPROVE_LEAVE' : 'REJECT_LEAVE',
      'Manajemen Cuti',
      `${action === 'APPROVE' ? 'Menyetujui' : 'Menolak'} cuti ${target.employeeName} (${target.totalDays} hari). Catatan: ${notes}`
    );

    const emp = employees.find((e) => e.id === target.employeeId);
    if (emp) {
      addNotification(
        emp.userId,
        `Pengajuan Cuti Anda ${status}`,
        `Pengajuan cuti Anda (${target.leaveTypeName}, ${target.startDate}) telah ${status.toLowerCase()} oleh ${currentUser.fullName}.`,
        'LEAVE_DECISION',
        'riwayat'
      );
    }

    return { success: true, message: `Pengajuan cuti berhasil ${status.toLowerCase()}.` };
  };

  const decideOvertime = (
    requestId: string,
    action: 'APPROVE' | 'REJECT',
    notes: string
  ) => {
    const target = overtimeRequests.find((r) => r.id === requestId);
    if (!target) return { success: false, message: 'Pengajuan tidak ditemukan.' };

    const status = action === 'APPROVE' ? 'Disetujui' : 'Ditolak';

    setOvertimeRequests((prev) =>
      prev.map((r) =>
        r.id === requestId
          ? {
              ...r,
              status,
              approverId: currentUser.id,
              approverName: currentUser.fullName,
              decisionNote: notes,
              decidedAt: new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' }),
            }
          : r
      )
    );

    logAudit(
      action === 'APPROVE' ? 'APPROVE_OVERTIME' : 'REJECT_OVERTIME',
      'Lembur',
      `${action === 'APPROVE' ? 'Menyetujui' : 'Menolak'} lembur ${target.employeeName} (${target.plannedDurationHours} jam).`
    );

    const emp = employees.find((e) => e.id === target.employeeId);
    if (emp) {
      addNotification(
        emp.userId,
        `Pengajuan Lembur Anda ${status}`,
        `Pengajuan lembur pada tanggal ${target.date} telah ${status.toLowerCase()} oleh ${currentUser.fullName}.`,
        'OVERTIME_DECISION',
        'riwayat'
      );
    }

    return { success: true, message: `Pengajuan lembur berhasil ${status.toLowerCase()}.` };
  };

  const decideCorrection = (
    correctionId: string,
    action: 'APPROVE' | 'REJECT',
    notes: string
  ) => {
    const target = attendanceCorrections.find((c) => c.id === correctionId);
    if (!target) return { success: false, message: 'Permintaan tidak ditemukan.' };

    const status = action === 'APPROVE' ? 'Disetujui' : 'Ditolak';

    setAttendanceCorrections((prev) =>
      prev.map((c) =>
        c.id === correctionId
          ? {
              ...c,
              status,
              approverId: currentUser.id,
              approverName: currentUser.fullName,
              decisionNote: notes,
              decidedAt: new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' }),
            }
          : c
      )
    );

    // If approved, update attendance record
    if (action === 'APPROVE') {
      const durationMin = calculateWorkDurationMinutes(
        target.proposedCheckIn,
        target.proposedCheckOut,
        activeSchedule.breakMinutes
      );

      setAttendanceRecords((prev) => {
        const existing = prev.find(
          (r) => r.employeeId === target.employeeId && r.date === target.date
        );
        if (existing) {
          return prev.map((r) =>
            r.id === existing.id
              ? {
                  ...r,
                  checkInTime: target.proposedCheckIn,
                  checkOutTime: target.proposedCheckOut,
                  workDurationMinutes: durationMin,
                  status: 'Hadir',
                  isCorrected: true,
                  notes: `Dikoreksi oleh ${currentUser.fullName} (${notes || 'Permintaan disetujui'})`,
                }
              : r
          );
        } else {
          return [
            {
              id: `ATT-CORR-${Date.now()}`,
              employeeId: target.employeeId,
              employeeName: target.employeeName,
              employeeNik: 'NC-CORR',
              department: target.department,
              branch: activeBranch.name,
              date: target.date,
              scheduleId: activeSchedule.id,
              scheduleName: activeSchedule.name,
              scheduledIn: activeSchedule.startTime,
              scheduledOut: activeSchedule.endTime,
              checkInTime: target.proposedCheckIn,
              checkOutTime: target.proposedCheckOut,
              checkInMethod: 'Koreksi Disetujui',
              status: 'Hadir',
              lateMinutes: 0,
              workDurationMinutes: durationMin,
              isCorrected: true,
              notes: `Koreksi manual disetujui: ${notes}`,
            },
            ...prev,
          ];
        }
      });
    }

    logAudit(
      action === 'APPROVE' ? 'APPROVE_CORRECTION' : 'REJECT_CORRECTION',
      'Koreksi Absensi',
      `${action === 'APPROVE' ? 'Menyetujui' : 'Menolak'} koreksi absensi ${target.employeeName} (${target.date})`
    );

    const emp = employees.find((e) => e.id === target.employeeId);
    if (emp) {
      addNotification(
        emp.userId,
        `Koreksi Absensi ${status}`,
        `Koreksi absensi Anda untuk tanggal ${target.date} telah ${status.toLowerCase()} oleh ${currentUser.fullName}.`,
        'ATTENDANCE_CORRECTION',
        'riwayat'
      );
    }

    return { success: true, message: `Koreksi absensi berhasil ${status.toLowerCase()}.` };
  };

  const addEmployee = (empData: Partial<Employee>) => {
    const newId = `EMP-${Date.now().toString().slice(-4)}`;
    const newNik = `NC-${Math.floor(1000 + Math.random() * 9000)}`;
    const fullEmployee: Employee = {
      id: newId,
      userId: `USR-${newId}`,
      nik: empData.nik || newNik,
      fullName: empData.fullName || 'Karyawan Baru',
      gender: empData.gender || 'Laki-laki',
      avatarUrl:
        empData.avatarUrl ||
        'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      email: empData.email || `${newNik.toLowerCase()}@niceso.co.id`,
      phone: empData.phone || '0812-3456-7890',
      department: empData.department || 'Retail Store Operations',
      departmentId: empData.departmentId || 'DEP-01',
      position: empData.position || 'Retail Associate',
      positionId: empData.positionId || 'POS-04',
      branch: empData.branch || 'Niceso Ciputat',
      branchId: empData.branchId || 'BR-002',
      hireDate: empData.hireDate || '2026-10-01',
      employmentType: empData.employmentType || 'PKWT',
      employeeStatus: 'Aktif',
      accountStatus: 'Aktif',
      remainingAnnualLeave: 12,
      emergencyContact: empData.emergencyContact || {
        name: 'Keluarga',
        relationship: 'Keluarga',
        phone: '0812-0000-0000',
      },
    };

    setEmployees((prev) => [fullEmployee, ...prev]);
    logAudit('CREATE_EMPLOYEE', 'Data Karyawan', `Menambahkan karyawan baru: ${fullEmployee.fullName} (${fullEmployee.nik})`);
  };

  const updateEmployee = (id: string, updates: Partial<Employee>) => {
    setEmployees((prev) =>
      prev.map((e) => (e.id === id ? { ...e, ...updates } : e))
    );
    logAudit('UPDATE_EMPLOYEE', 'Data Karyawan', `Memperbarui data karyawan ID: ${id}`);
  };

  const toggleEmployeeStatus = (id: string) => {
    setEmployees((prev) =>
      prev.map((e) =>
        e.id === id
          ? {
              ...e,
              employeeStatus: e.employeeStatus === 'Aktif' ? 'Nonaktif' : 'Aktif',
              accountStatus: e.accountStatus === 'Aktif' ? 'Ditangguhkan' : 'Aktif',
            }
          : e
      )
    );
    logAudit('TOGGLE_STATUS_EMPLOYEE', 'Data Karyawan', `Mengubah status aktif/nonaktif karyawan ID: ${id}`);
  };

  const addDepartment = (params: { name: string; code: string }) => {
    const trimmedName = params.name.trim();
    const trimmedCode = params.code.trim().toUpperCase();

    if (!trimmedName || !trimmedCode) {
      return { success: false, message: 'Nama dan kode departemen wajib diisi.' };
    }

    const nameExists = departments.some(
      (d) => d.name.toLowerCase() === trimmedName.toLowerCase() || d.code.toUpperCase() === trimmedCode
    );
    if (nameExists) {
      return { success: false, message: `Departemen atau kode "${trimmedCode}" sudah ada di sistem.` };
    }

    const newDept: Department = {
      id: `DEP-${Date.now().toString().slice(-4)}`,
      name: trimmedName,
      code: trimmedCode,
      employeeCount: 0,
    };

    setDepartments((prev) => [...prev, newDept]);
    logAudit(
      'CREATE_DEPARTMENT',
      'Master Data',
      `Menambahkan departemen baru: ${trimmedName} (${trimmedCode})`
    );

    addNotification(
      currentUser.id,
      'Departemen Baru Ditambahkan',
      `Departemen ${trimmedName} (${trimmedCode}) telah resmi dibuat dan dapat digunakan untuk penempatan staf.`,
      'ANNOUNCEMENT',
      'employees'
    );

    return {
      success: true,
      message: `Departemen "${trimmedName}" (${trimmedCode}) berhasil ditambahkan dan langsung aktif di sistem.`,
    };
  };

  const bulkImportEmployees = (rows: ParsedEmployeeRow[]) => {
    if (rows.length === 0) {
      return { success: false, importedCount: 0, message: 'Tidak ada data baris valid untuk diimpor.' };
    }

    const newEmployees: Employee[] = [];
    const deptCountMap: Record<string, number> = {};

    rows.forEach((row, i) => {
      const empId = `EMP-B${Date.now().toString().slice(-4)}-${i + 1}`;
      const matchingDept =
        departments.find((d) => d.name.toLowerCase() === row.department.toLowerCase()) ||
        departments[0];

      const matchingBranch =
        branches.find((b) => b.name.toLowerCase().includes(row.branch.toLowerCase())) ||
        branches[1];

      deptCountMap[matchingDept.id] = (deptCountMap[matchingDept.id] || 0) + 1;

      const employee: Employee = {
        id: empId,
        userId: `USR-${empId}`,
        nik: row.nik,
        fullName: row.fullName,
        gender: i % 2 === 0 ? 'Laki-laki' : 'Perempuan',
        avatarUrl: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80`,
        email: row.email,
        phone: row.phone,
        department: matchingDept.name,
        departmentId: matchingDept.id,
        position: row.position,
        positionId: 'POS-04',
        branch: matchingBranch.name,
        branchId: matchingBranch.id,
        hireDate: row.hireDate,
        employmentType: row.employmentType,
        employeeStatus: 'Aktif',
        accountStatus: 'Aktif',
        remainingAnnualLeave: 12,
        emergencyContact: {
          name: 'Keluarga',
          relationship: 'Keluarga',
          phone: row.phone,
        },
      };

      newEmployees.push(employee);
    });

    setEmployees((prev) => [...newEmployees, ...prev]);

    // Update department counts
    setDepartments((prev) =>
      prev.map((d) =>
        deptCountMap[d.id]
          ? { ...d, employeeCount: d.employeeCount + deptCountMap[d.id] }
          : d
      )
    );

    logAudit(
      'BULK_IMPORT_EMPLOYEES',
      'Data Karyawan',
      `Berhasil mengimpor massal ${rows.length} karyawan baru ke dalam sistem Niceso HRIS.`
    );

    addNotification(
      currentUser.id,
      'Import Massal Karyawan Selesai',
      `Sebanyak ${rows.length} akun dan profil karyawan baru berhasil dimasukkan ke sistem Niceso HRIS.`,
      'ANNOUNCEMENT',
      'employees'
    );

    return {
      success: true,
      importedCount: rows.length,
      message: `Sukses! Sebanyak ${rows.length} data akun dan karyawan baru berhasil diimpor ke sistem.`,
    };
  };

  const addBranch = (branchData: Omit<Branch, 'id'>) => {
    if (currentUser.role !== 'SUPER_ADMIN' && currentUser.role !== 'HR_ADMIN') {
      return {
        success: false,
        message: 'Akses Ditolak: Hanya Super Admin dan HR Admin yang dapat menambah lokasi kerja.',
      };
    }

    const validation = validateWorkLocationConfig({
      name: branchData.name,
      code: branchData.code,
      latitude: branchData.latitude,
      longitude: branchData.longitude,
      radiusMeters: branchData.radiusMeters,
      address: branchData.address,
    });

    if (!validation.valid) {
      return { success: false, message: validation.errors[0] };
    }

    const exists = branches.some(
      (b) => b.code.trim().toUpperCase() === branchData.code.trim().toUpperCase()
    );
    if (exists) {
      return {
        success: false,
        message: `Kode lokasi "${branchData.code}" sudah digunakan oleh cabang lain.`,
      };
    }

    const newBranch: Branch = {
      ...branchData,
      id: `BR-${String(branches.length + 1).padStart(3, '0')}`,
      name: branchData.name.trim(),
      code: branchData.code.trim().toUpperCase(),
      isActive: branchData.isActive !== false,
      updatedAt: new Date().toISOString(),
      updatedBy: currentUser.fullName,
    };

    setBranches((prev) => [...prev, newBranch]);

    logAudit(
      'CREATE_WORK_LOCATION',
      'Pengaturan Lokasi & Radius',
      `Menambahkan lokasi kerja baru: ${newBranch.name} (${newBranch.code}) radius ${newBranch.radiusMeters}m di (${newBranch.latitude}, ${newBranch.longitude})`
    );

    addNotification(
      currentUser.id,
      'Lokasi Kerja Baru Ditambahkan',
      `Lokasi kerja "${newBranch.name}" (${newBranch.code}) telah ditambahkan dengan radius absensi ${newBranch.radiusMeters} meter.`,
      'ANNOUNCEMENT',
      'locations'
    );

    return {
      success: true,
      message: `Lokasi "${newBranch.name}" berhasil disimpan dengan radius ${newBranch.radiusMeters} meter.`,
      branch: newBranch,
    };
  };

  const updateBranch = (id: string, updates: Partial<Branch>) => {
    if (currentUser.role !== 'SUPER_ADMIN' && currentUser.role !== 'HR_ADMIN') {
      return {
        success: false,
        message: 'Akses Ditolak: Hanya Super Admin dan HR Admin yang dapat mengubah lokasi kerja.',
      };
    }

    const target = branches.find((b) => b.id === id);
    if (!target) {
      return { success: false, message: 'Lokasi kerja tidak ditemukan.' };
    }

    if (
      updates.latitude !== undefined &&
      (isNaN(updates.latitude) || updates.latitude < -90 || updates.latitude > 90)
    ) {
      return { success: false, message: 'Koordinat Latitude tidak valid (-90 s/d 90).' };
    }
    if (
      updates.longitude !== undefined &&
      (isNaN(updates.longitude) || updates.longitude < -180 || updates.longitude > 180)
    ) {
      return { success: false, message: 'Koordinat Longitude tidak valid (-180 s/d 180).' };
    }
    if (
      updates.radiusMeters !== undefined &&
      (isNaN(updates.radiusMeters) || updates.radiusMeters < 10 || updates.radiusMeters > 5000)
    ) {
      return { success: false, message: 'Radius absensi harus antara 10 meter hingga 5.000 meter.' };
    }

    const updatedBranch: Branch = {
      ...target,
      ...updates,
      updatedAt: new Date().toISOString(),
      updatedBy: currentUser.fullName,
    };

    setBranches((prev) => prev.map((b) => (b.id === id ? updatedBranch : b)));

    if (activeBranch.id === id) {
      setActiveBranch(updatedBranch);
    }

    if (updates.name && updates.name !== target.name) {
      setEmployees((prev) =>
        prev.map((e) => (e.branchId === id ? { ...e, branch: updates.name! } : e))
      );
    }

    logAudit(
      'UPDATE_WORK_LOCATION',
      'Pengaturan Lokasi & Radius',
      `Memperbarui lokasi ${target.name}: koordinat (${updatedBranch.latitude}, ${updatedBranch.longitude}), radius ${updatedBranch.radiusMeters}m, status ${updatedBranch.isActive ? 'Aktif' : 'Nonaktif'}`
    );

    return {
      success: true,
      message: `Pengaturan lokasi "${updatedBranch.name}" berhasil diperbarui.`,
    };
  };

  const toggleBranchStatus = (id: string) => {
    if (currentUser.role !== 'SUPER_ADMIN' && currentUser.role !== 'HR_ADMIN') {
      return {
        success: false,
        message: 'Akses Ditolak: Hanya Super Admin dan HR Admin yang dapat mengubah status lokasi.',
      };
    }

    const target = branches.find((b) => b.id === id);
    if (!target) {
      return { success: false, message: 'Lokasi kerja tidak ditemukan.' };
    }

    const newStatus = !target.isActive;
    const updated: Branch = {
      ...target,
      isActive: newStatus,
      updatedAt: new Date().toISOString(),
      updatedBy: currentUser.fullName,
    };

    setBranches((prev) => prev.map((b) => (b.id === id ? updated : b)));

    if (activeBranch.id === id) {
      setActiveBranch(updated);
    }

    logAudit(
      newStatus ? 'ACTIVATE_WORK_LOCATION' : 'DEACTIVATE_WORK_LOCATION',
      'Pengaturan Lokasi & Radius',
      `Mengubah status lokasi ${target.name} menjadi ${newStatus ? 'Aktif' : 'Nonaktif'}`
    );

    return {
      success: true,
      message: `Status lokasi "${target.name}" berhasil diubah menjadi ${newStatus ? 'Aktif' : 'Nonaktif'}.`,
    };
  };

  const deleteBranch = (id: string) => {
    if (currentUser.role !== 'SUPER_ADMIN' && currentUser.role !== 'HR_ADMIN') {
      return {
        success: false,
        message: 'Akses Ditolak: Hanya Super Admin dan HR Admin yang dapat menghapus lokasi kerja.',
      };
    }

    const target = branches.find((b) => b.id === id);
    if (!target) {
      return { success: false, message: 'Lokasi kerja tidak ditemukan.' };
    }

    const assignedCount = employees.filter(
      (e) => e.branchId === id || e.branch === target.name
    ).length;
    if (assignedCount > 0) {
      return {
        success: false,
        message: `Tidak dapat menghapus "${target.name}" karena masih ada ${assignedCount} karyawan aktif yang bertugas di lokasi ini. Anda dapat menonaktifkan status lokasi sebagai alternatif yang aman.`,
      };
    }

    setBranches((prev) => prev.filter((b) => b.id !== id));

    logAudit(
      'DELETE_WORK_LOCATION',
      'Pengaturan Lokasi & Radius',
      `Menghapus lokasi kerja: ${target.name} (${target.code})`
    );

    return {
      success: true,
      message: `Lokasi "${target.name}" berhasil dihapus dari sistem.`,
    };
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  const markAllNotificationsAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const unreadNotificationCount = notifications.filter(
    (n) => !n.isRead && (n.userId === currentUser.id || currentUser.role === 'SUPER_ADMIN')
  ).length;

  const pendingApprovalsCount =
    leaveRequests.filter((r) => r.status === 'Menunggu Persetujuan').length +
    overtimeRequests.filter((r) => r.status === 'Menunggu Persetujuan').length +
    attendanceCorrections.filter((c) => c.status === 'Menunggu Persetujuan').length;

  return (
    <HrisContext.Provider
      value={{
        currentUser,
        currentEmployee,
        allUsers: INITIAL_USERS,
        employees,
        departments,
        branches,
        schedules,
        leaveTypes,
        attendanceRecords,
        leaveRequests,
        overtimeRequests,
        attendanceCorrections,
        announcements,
        notifications,
        auditLogs,
        activeTab,
        setActiveTab,
        deviceMode,
        setDeviceMode,
        activeBranch,
        setActiveBranch,
        activeSchedule,
        setActiveSchedule,
        switchUserByRole,
        switchUserById,
        performCheckIn,
        performCheckOut,
        submitLeave,
        submitOvertime,
        submitAttendanceCorrection,
        decideLeave,
        decideOvertime,
        decideCorrection,
        addEmployee,
        updateEmployee,
        toggleEmployeeStatus,
        addDepartment,
        bulkImportEmployees,
        addBranch,
        updateBranch,
        toggleBranchStatus,
        deleteBranch,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        unreadNotificationCount,
        pendingApprovalsCount,
        todayAttendanceRecord,
      }}
    >
      {children}
    </HrisContext.Provider>
  );
};

export const useHris = () => {
  const context = useContext(HrisContext);
  if (!context) {
    throw new Error('useHris must be used within an HrisProvider');
  }
  return context;
};

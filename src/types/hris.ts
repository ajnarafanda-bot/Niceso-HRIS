/**
 * Data Models & Types for NICESO HRIS
 * Covers all 24 relational entities specified in the system architecture.
 */

export type UserRole = 'SUPER_ADMIN' | 'HR_ADMIN' | 'MANAGER' | 'EMPLOYEE';

export type AttendanceStatus =
  | 'Hadir'
  | 'Terlambat'
  | 'Izin'
  | 'Cuti'
  | 'Sakit'
  | 'Tidak Hadir'
  | 'Dinas Luar'
  | 'Menunggu Koreksi';

export type RequestStatus =
  | 'Draft'
  | 'Menunggu Persetujuan'
  | 'Disetujui'
  | 'Ditolak'
  | 'Dibatalkan';

export type OvertimeStatus =
  | 'Draft'
  | 'Menunggu Persetujuan'
  | 'Disetujui'
  | 'Ditolak'
  | 'Sedang Berjalan'
  | 'Menunggu Verifikasi'
  | 'Selesai'
  | 'Dibatalkan';

export interface User {
  id: string;
  nik: string;
  email: string;
  fullName: string;
  role: UserRole;
  avatarUrl: string;
  isActive: boolean;
  departmentId: string;
  branchId: string;
  positionId: string;
  lastLogin?: string;
}

export interface Employee {
  id: string;
  userId: string;
  nik: string;
  fullName: string;
  gender: 'Laki-laki' | 'Perempuan';
  avatarUrl: string;
  email: string;
  phone: string;
  department: string;
  departmentId: string;
  position: string;
  positionId: string;
  branch: string;
  branchId: string;
  directSupervisorId?: string;
  directSupervisorName?: string;
  hireDate: string; // YYYY-MM-DD
  employmentType: 'PKWT' | 'PKWTT' | 'Magang' | 'Harian Lepas';
  employeeStatus: 'Aktif' | 'Cuti Melahirkan' | 'Nonaktif' | 'Resign';
  accountStatus: 'Aktif' | 'Terkunci' | 'Ditangguhkan';
  remainingAnnualLeave: number;
  bankAccountMasked?: string;
  nationalIdMasked?: string;
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
  };
}

export interface Department {
  id: string;
  name: string;
  code: string;
  managerId?: string;
  employeeCount: number;
}

export interface Position {
  id: string;
  title: string;
  code: string;
  departmentId: string;
  level: number;
}

export type LocationType =
  | 'KANTOR_PUSAT'
  | 'TOKO_RETAIL'
  | 'GUDANG_LOGISTIK'
  | 'DISTRIBUTION_CENTER';

export interface Branch {
  id: string;
  name: string;
  code: string;
  latitude: number;
  longitude: number;
  radiusMeters: number;
  address: string;
  city: string;
  timezone: 'Asia/Jakarta' | 'Asia/Makassar' | 'Asia/Jayapura';
  isActive: boolean;
  type?: LocationType;
  description?: string;
  updatedAt?: string;
  updatedBy?: string;
}

export interface WorkSchedule {
  id: string;
  name: string;
  code: string;
  startTime: string; // "08:30"
  endTime: string;   // "17:30"
  toleranceMinutes: number;
  breakMinutes: number;
  isNightShift: boolean;
  daysOfWeek: number[]; // 1=Mon, 2=Tue, ... 7=Sun
}

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeNik: string;
  department: string;
  branch: string;
  date: string; // YYYY-MM-DD
  scheduleId: string;
  scheduleName: string;
  scheduledIn: string;
  scheduledOut: string;
  checkInTime?: string; // HH:mm
  checkOutTime?: string; // HH:mm
  checkInLat?: number;
  checkInLng?: number;
  checkInAddress?: string;
  checkInMethod?: 'GPS + Swafoto' | 'Fingerprint Toko' | 'Koreksi Disetujui';
  checkInPhoto?: string;
  checkOutLat?: number;
  checkOutLng?: number;
  status: AttendanceStatus;
  lateMinutes: number;
  workDurationMinutes: number;
  notes?: string;
  isCorrected?: boolean;
}

export interface AttendanceCorrection {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  attendanceId?: string;
  date: string; // YYYY-MM-DD
  originalCheckIn?: string;
  originalCheckOut?: string;
  proposedCheckIn: string;
  proposedCheckOut: string;
  reason: string;
  attachmentUrl?: string;
  status: RequestStatus;
  approverId?: string;
  approverName?: string;
  decisionNote?: string;
  decidedAt?: string;
  createdAt: string;
}

export interface LeaveType {
  id: string;
  name: string;
  code: string;
  defaultQuota: number;
  deductsAnnualQuota: boolean;
  requiresAttachment: boolean;
  description: string;
}

export interface LeaveBalance {
  id: string;
  employeeId: string;
  leaveTypeId: string;
  leaveTypeName: string;
  year: number;
  totalQuota: number;
  usedQuota: number;
  remainingQuota: number;
}

export interface LeaveTransaction {
  id: string;
  employeeId: string;
  leaveTypeId: string;
  transactionType: 'CREDIT' | 'DEBIT' | 'ADJUSTMENT';
  amount: number;
  balanceAfter: number;
  referenceId?: string;
  notes: string;
  createdAt: string;
}

export interface LeaveRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeNik: string;
  department: string;
  leaveTypeId: string;
  leaveTypeName: string;
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
  totalDays: number;
  reason: string;
  attachmentUrl?: string;
  status: RequestStatus;
  approverId?: string;
  approverName?: string;
  decisionNote?: string;
  decidedAt?: string;
  createdAt: string;
}

export interface OvertimeRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeNik: string;
  department: string;
  date: string; // YYYY-MM-DD
  plannedStartTime: string; // HH:mm
  plannedEndTime: string;   // HH:mm
  plannedDurationHours: number;
  reason: string;
  taskDescription: string;
  status: OvertimeStatus;
  actualStartTime?: string;
  actualEndTime?: string;
  actualDurationHours?: number;
  realizationNotes?: string;
  approverId?: string;
  approverName?: string;
  decisionNote?: string;
  decidedAt?: string;
  createdAt: string;
}

export interface ApprovalRecord {
  id: string;
  referenceType: 'LEAVE' | 'OVERTIME' | 'CORRECTION';
  referenceId: string;
  employeeName: string;
  requesterId: string;
  approverId: string;
  approverName: string;
  action: 'APPROVE' | 'REJECT';
  notes: string;
  decidedAt: string;
}

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  type:
    | 'CHECKIN_REMINDER'
    | 'CHECKOUT_REMINDER'
    | 'LEAVE_SUBMISSION'
    | 'LEAVE_DECISION'
    | 'OVERTIME_SUBMISSION'
    | 'OVERTIME_DECISION'
    | 'ATTENDANCE_CORRECTION'
    | 'SCHEDULE_CHANGE'
    | 'ANNOUNCEMENT';
  isRead: boolean;
  createdAt: string;
  linkTab?: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  authorName: string;
  date: string;
  category: 'HR' | 'Operasional' | 'Kesehatan' | 'Event Toko';
  priority: 'NORMAL' | 'IMPORTANT';
}

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  role: string;
  action: string;
  module: string;
  details: string;
  ipAddress: string;
  timestamp: string;
}

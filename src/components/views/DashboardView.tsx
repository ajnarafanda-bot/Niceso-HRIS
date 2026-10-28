import React, { useState, useEffect } from 'react';
import {
  Clock,
  MapPin,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  FilePlus2,
  CalendarCheck2,
  Users,
  BarChart3,
  BellRing,
  Info,
  ShieldAlert,
  ChevronRight,
  X,
} from 'lucide-react';
import { useHris } from '../../context/HrisContext';
import { Announcement } from '../../types/hris';

export const DashboardView: React.FC = () => {
  const {
    currentUser,
    currentEmployee,
    activeBranch,
    activeSchedule,
    todayAttendanceRecord,
    setActiveTab,
    announcements,
    employees,
    attendanceRecords,
    leaveRequests,
    overtimeRequests,
    pendingApprovalsCount,
  } = useHris();

  // Live Clock in Asia/Jakarta
  const [currentTime, setCurrentTime] = useState<string>('');
  const [currentDateFormatted, setCurrentDateFormatted] = useState<string>('');
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('id-ID', {
          timeZone: 'Asia/Jakarta',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        })
      );
      const day = String(now.getDate()).padStart(2, '0');
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const year = now.getFullYear();
      const daysIndo = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
      setCurrentDateFormatted(`${daysIndo[now.getDay()]}, ${day}-${month}-${year}`);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Determine greeting based on Jakarta hour
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 11) return 'Selamat Pagi';
    if (hour < 15) return 'Selamat Siang';
    if (hour < 18) return 'Selamat Sore';
    return 'Selamat Malam';
  };

  // HR Stats calculations from actual database
  const todayDateStr = '2026-10-27';
  const todayRecords = attendanceRecords.filter((r) => r.date === todayDateStr);
  const totalEmployeesCount = employees.filter((e) => e.employeeStatus === 'Aktif').length;
  const hadirTodayCount = todayRecords.filter((r) => r.status === 'Hadir').length;
  const terlambatTodayCount = todayRecords.filter((r) => r.status === 'Terlambat').length;
  const cutiTodayCount = todayRecords.filter((r) => r.status === 'Cuti').length;

  return (
    <div className="p-4 space-y-4 max-w-2xl mx-auto pb-20">
      {/* Employee Greeting & Live Time */}
      <div className="bg-gradient-to-r from-rose-600 to-rose-700 text-white rounded-2xl p-4 shadow-sm relative overflow-hidden">
        <div className="relative z-10 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <img
              src={currentUser.avatarUrl}
              alt={currentUser.fullName}
              className="w-12 h-12 rounded-full border-2 border-white/80 object-cover shadow-xs"
            />
            <div>
              <p className="text-xs text-rose-100 font-medium">
                {getGreeting()},
              </p>
              <h2 className="text-base font-bold text-white tracking-tight leading-tight">
                {currentUser.fullName}
              </h2>
              <p className="text-[11px] text-rose-200 mt-0.5">
                {currentEmployee.position} · {activeBranch.name}
              </p>
            </div>
          </div>

          <div className="text-right">
            <div className="font-mono text-lg font-bold tracking-tight text-white leading-none">
              {currentTime || '08:00:00'}
            </div>
            <p className="text-[10px] text-rose-200 mt-1 font-medium">
              {currentDateFormatted}
            </p>
          </div>
        </div>

        {/* Shift Badge Strip */}
        <div className="mt-3 pt-3 border-t border-rose-500/50 flex items-center justify-between text-xs text-rose-100">
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-rose-200" />
            <span>
              Jadwal:{' '}
              <strong className="text-white font-semibold">
                {activeSchedule.name} ({activeSchedule.startTime} - {activeSchedule.endTime} WIB)
              </strong>
            </span>
          </div>
          <span className="text-[10px] bg-rose-800/60 px-2 py-0.5 rounded text-white font-medium">
            Toleransi {activeSchedule.toleranceMinutes}m
          </span>
        </div>
      </div>

      {/* Today Attendance Status Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-rose-600 animate-pulse" />
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Status Presensi Hari Ini
            </span>
          </div>
          {todayAttendanceRecord?.status ? (
            <span
              className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${
                todayAttendanceRecord.status === 'Hadir'
                  ? 'bg-emerald-100 text-emerald-800'
                  : todayAttendanceRecord.status === 'Terlambat'
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-blue-100 text-blue-800'
              }`}
            >
              {todayAttendanceRecord.status}
            </span>
          ) : (
            <span className="text-xs px-2.5 py-0.5 rounded-full font-medium bg-slate-100 text-slate-600">
              Belum Absen
            </span>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3 py-3">
          <div className="bg-slate-50 rounded-lg p-2.5">
            <p className="text-[11px] text-slate-500 font-medium">Jam Masuk (Check-in)</p>
            <p className="text-base font-bold text-slate-800 mt-0.5">
              {todayAttendanceRecord?.checkInTime ? (
                <span>{todayAttendanceRecord.checkInTime} <span className="text-xs font-normal text-slate-500">WIB</span></span>
              ) : (
                <span className="text-slate-400 font-normal">--:--</span>
              )}
            </p>
            {todayAttendanceRecord?.lateMinutes ? (
              <p className="text-[10px] text-amber-700 font-semibold mt-1">
                Terlambat {todayAttendanceRecord.lateMinutes} menit
              </p>
            ) : todayAttendanceRecord?.checkInTime ? (
              <p className="text-[10px] text-emerald-700 font-semibold mt-1">
                Tepat Waktu
              </p>
            ) : null}
          </div>

          <div className="bg-slate-50 rounded-lg p-2.5">
            <p className="text-[11px] text-slate-500 font-medium">Jam Pulang (Check-out)</p>
            <p className="text-base font-bold text-slate-800 mt-0.5">
              {todayAttendanceRecord?.checkOutTime ? (
                <span>{todayAttendanceRecord.checkOutTime} <span className="text-xs font-normal text-slate-500">WIB</span></span>
              ) : (
                <span className="text-slate-400 font-normal">--:--</span>
              )}
            </p>
            {todayAttendanceRecord?.workDurationMinutes ? (
              <p className="text-[10px] text-slate-600 font-medium mt-1">
                Durasi: {Math.floor(todayAttendanceRecord.workDurationMinutes / 60)}j {todayAttendanceRecord.workDurationMinutes % 60}m
              </p>
            ) : null}
          </div>
        </div>

        <div className="pt-2 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 truncate">
            <MapPin className="w-3.5 h-3.5 text-rose-600 shrink-0" />
            <span className="truncate">{activeBranch.name} (Radius {activeBranch.radiusMeters}m)</span>
          </div>

          <button
            onClick={() => setActiveTab('absensi')}
            className="shrink-0 px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <span>{todayAttendanceRecord?.checkInTime ? 'Buka Presensi' : 'Check-in Sekarang'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Role-Specific Metric Overview */}
      {(currentUser.role === 'HR_ADMIN' || currentUser.role === 'SUPER_ADMIN') && (
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-rose-600" />
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Monitoring Kehadiran Seluruh Karyawan (HR)
              </h3>
            </div>
            <button
              onClick={() => setActiveTab('reports')}
              className="text-xs text-rose-600 hover:text-rose-800 font-semibold flex items-center gap-1"
            >
              <span>Laporan Lengkap</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-4 gap-2 text-center">
            <div className="p-2 bg-slate-50 rounded-lg">
              <p className="text-lg font-extrabold text-slate-800">{totalEmployeesCount}</p>
              <p className="text-[10px] text-slate-500 font-medium">Total Karyawan</p>
            </div>
            <div className="p-2 bg-emerald-50 rounded-lg">
              <p className="text-lg font-extrabold text-emerald-700">{hadirTodayCount}</p>
              <p className="text-[10px] text-emerald-800 font-medium">Hadir Tepat</p>
            </div>
            <div className="p-2 bg-amber-50 rounded-lg">
              <p className="text-lg font-extrabold text-amber-700">{terlambatTodayCount}</p>
              <p className="text-[10px] text-amber-800 font-medium">Terlambat</p>
            </div>
            <div className="p-2 bg-blue-50 rounded-lg">
              <p className="text-lg font-extrabold text-blue-700">{cutiTodayCount}</p>
              <p className="text-[10px] text-blue-800 font-medium">Cuti / Izin</p>
            </div>
          </div>

          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 text-slate-600">
              <MapPin className="w-3.5 h-3.5 text-rose-600 shrink-0" />
              <span>Titik Lokasi Kerja & Radius GPS: Gerai, Gudang & Kantor Pusat</span>
            </div>
            <button
              onClick={() => setActiveTab('locations')}
              className="text-xs font-bold text-rose-600 hover:text-rose-800 flex items-center gap-1 bg-rose-50 hover:bg-rose-100 px-2.5 py-1 rounded-md border border-rose-200 transition-colors"
            >
              <span>Kelola Peta & Radius</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Manager Approval Banner */}
      {(currentUser.role === 'MANAGER' || currentUser.role === 'HR_ADMIN') && pendingApprovalsCount > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 flex items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-amber-100 flex items-center justify-center shrink-0">
              <ShieldAlert className="w-5 h-5 text-amber-700" />
            </div>
            <div>
              <p className="text-xs font-bold text-amber-900">
                Ada {pendingApprovalsCount} Pengajuan Menunggu Keputusan Anda
              </p>
              <p className="text-[11px] text-amber-700">
                Cuti tahunan, lembur toko, atau koreksi absensi staf.
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveTab('approvals')}
            className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold shrink-0 transition-colors"
          >
            Tinjau Sekarang
          </button>
        </div>
      )}

      {/* Personal Summary Stats */}
      <div className="grid grid-cols-3 gap-2.5">
        <div className="bg-white rounded-xl border border-slate-200 p-3 shadow-xs">
          <p className="text-[11px] text-slate-500 font-medium">Sisa Cuti</p>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-xl font-extrabold text-slate-900">
              {currentEmployee.remainingAnnualLeave}
            </span>
            <span className="text-xs text-slate-400">/ 12 hari</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5">Tahun 2026</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-3 shadow-xs">
          <p className="text-[11px] text-slate-500 font-medium">Lembur Bulan Ini</p>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-xl font-extrabold text-slate-900">3.2</span>
            <span className="text-xs text-slate-400">jam</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5">Disetujui</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-3 shadow-xs">
          <p className="text-[11px] text-slate-500 font-medium">Pengajuan Aktif</p>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-xl font-extrabold text-slate-900">
              {leaveRequests.filter((r) => r.employeeId === currentEmployee.id && r.status === 'Menunggu Persetujuan').length +
                overtimeRequests.filter((r) => r.employeeId === currentEmployee.id && r.status === 'Menunggu Persetujuan').length}
            </span>
            <span className="text-xs text-slate-400">menunggu</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5">Proses Review</p>
        </div>
      </div>

      {/* Quick Action Shortcuts */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3">
          Aksi Cepat
        </h3>
        <div className="grid grid-cols-4 gap-2">
          <button
            onClick={() => setActiveTab('absensi')}
            className="flex flex-col items-center p-2 rounded-lg hover:bg-slate-50 transition-colors text-slate-700"
          >
            <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center text-rose-600 mb-1">
              <Clock className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-medium text-center">Presensi</span>
          </button>

          <button
            onClick={() => setActiveTab('pengajuan')}
            className="flex flex-col items-center p-2 rounded-lg hover:bg-slate-50 transition-colors text-slate-700"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 mb-1">
              <CalendarCheck2 className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-medium text-center">Ajukan Cuti</span>
          </button>

          <button
            onClick={() => setActiveTab('pengajuan')}
            className="flex flex-col items-center p-2 rounded-lg hover:bg-slate-50 transition-colors text-slate-700"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 mb-1">
              <FilePlus2 className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-medium text-center">Ajukan Lembur</span>
          </button>

          <button
            onClick={() => setActiveTab('riwayat')}
            className="flex flex-col items-center p-2 rounded-lg hover:bg-slate-50 transition-colors text-slate-700"
          >
            <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600 mb-1">
              <Calendar className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-medium text-center">Riwayat</span>
          </button>
        </div>
      </div>

      {/* Announcements */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <BellRing className="w-4 h-4 text-rose-600" />
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Pengumuman Perusahaan Niceso
            </h3>
          </div>
          <span className="text-[11px] text-slate-400 font-medium">Terbaru</span>
        </div>

        <div className="space-y-2.5">
          {announcements.map((ann) => (
            <div
              key={ann.id}
              onClick={() => setSelectedAnnouncement(ann)}
              className="p-3 bg-slate-50 hover:bg-slate-100/80 rounded-lg border border-slate-100 cursor-pointer transition-colors"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                      ann.priority === 'IMPORTANT'
                        ? 'bg-rose-100 text-rose-700'
                        : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {ann.category}
                  </span>
                  <span className="text-[11px] text-slate-400 font-medium">
                    {ann.date}
                  </span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              </div>
              <h4 className="text-xs font-bold text-slate-800 mt-1.5 leading-snug">
                {ann.title}
              </h4>
              <p className="text-[11px] text-slate-600 line-clamp-2 mt-1">
                {ann.content}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Announcement Detail Modal */}
      {selectedAnnouncement && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-5 shadow-xl relative animate-in fade-in">
            <button
              onClick={() => setSelectedAnnouncement(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-bold px-2 py-0.5 rounded bg-rose-100 text-rose-700">
                {selectedAnnouncement.category}
              </span>
              <span className="text-xs text-slate-400">{selectedAnnouncement.date}</span>
            </div>
            <h3 className="text-base font-bold text-slate-900 leading-snug">
              {selectedAnnouncement.title}
            </h3>
            <p className="text-xs text-slate-500 mt-1 pb-3 border-b border-slate-100">
              Oleh: {selectedAnnouncement.authorName}
            </p>
            <div className="mt-4 text-xs text-slate-700 whitespace-pre-line leading-relaxed">
              {selectedAnnouncement.content}
            </div>
            <div className="mt-5 text-right">
              <button
                onClick={() => setSelectedAnnouncement(null)}
                className="px-4 py-2 bg-rose-600 text-white rounded-lg text-xs font-semibold hover:bg-rose-700"
              >
                Tutup Pengumuman
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

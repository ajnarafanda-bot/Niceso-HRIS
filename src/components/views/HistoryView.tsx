import React, { useState } from 'react';
import {
  CalendarDays,
  Clock,
  FileCheck2,
  Filter,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ChevronRight,
  X,
  FileEdit,
} from 'lucide-react';
import { useHris } from '../../context/HrisContext';
import { formatDateIndo } from '../../utils/rules';
import { AttendanceRecord, LeaveRequest, OvertimeRequest, AttendanceCorrection } from '../../types/hris';

export const HistoryView: React.FC = () => {
  const {
    currentEmployee,
    attendanceRecords,
    leaveRequests,
    overtimeRequests,
    attendanceCorrections,
    currentUser,
  } = useHris();

  // Active sub-tab: 'absensi' | 'cuti' | 'lembur' | 'koreksi'
  const [activeTab, setActiveTab] = useState<'absensi' | 'cuti' | 'lembur' | 'koreksi'>('absensi');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Detail Modal state
  const [selectedRecord, setSelectedRecord] = useState<{
    type: 'ATTENDANCE' | 'LEAVE' | 'OVERTIME' | 'CORRECTION';
    data: any;
  } | null>(null);

  // Filter records by employee (or all for manager/HR)
  const isManagement = currentUser.role !== 'EMPLOYEE';

  const myAttendance = isManagement
    ? attendanceRecords
    : attendanceRecords.filter((r) => r.employeeId === currentEmployee.id);

  const myLeaves = isManagement
    ? leaveRequests
    : leaveRequests.filter((r) => r.employeeId === currentEmployee.id);

  const myOvertimes = isManagement
    ? overtimeRequests
    : overtimeRequests.filter((r) => r.employeeId === currentEmployee.id);

  const myCorrections = isManagement
    ? attendanceCorrections
    : attendanceCorrections.filter((c) => c.employeeId === currentEmployee.id);

  return (
    <div className="p-4 space-y-4 max-w-2xl mx-auto pb-24">
      {/* Title */}
      <div>
        <h2 className="text-lg font-bold text-slate-900 tracking-tight">
          Riwayat & Rekam Jejak
        </h2>
        <p className="text-xs text-slate-500">
          Daftar rekam kehadiran, riwayat cuti, lembur, dan koreksi absensi
        </p>
      </div>

      {/* Sub-tab navigation */}
      <div className="grid grid-cols-4 gap-1 bg-slate-200/80 p-1 rounded-xl">
        <button
          onClick={() => {
            setActiveTab('absensi');
            setStatusFilter('ALL');
          }}
          className={`py-2 text-xs font-semibold rounded-lg transition-all text-center ${
            activeTab === 'absensi'
              ? 'bg-white text-rose-600 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Absensi
        </button>

        <button
          onClick={() => {
            setActiveTab('cuti');
            setStatusFilter('ALL');
          }}
          className={`py-2 text-xs font-semibold rounded-lg transition-all text-center ${
            activeTab === 'cuti'
              ? 'bg-white text-rose-600 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Cuti
        </button>

        <button
          onClick={() => {
            setActiveTab('lembur');
            setStatusFilter('ALL');
          }}
          className={`py-2 text-xs font-semibold rounded-lg transition-all text-center ${
            activeTab === 'lembur'
              ? 'bg-white text-rose-600 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Lembur
        </button>

        <button
          onClick={() => {
            setActiveTab('koreksi');
            setStatusFilter('ALL');
          }}
          className={`py-2 text-xs font-semibold rounded-lg transition-all text-center ${
            activeTab === 'koreksi'
              ? 'bg-white text-rose-600 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Koreksi
        </button>
      </div>

      {/* LIST 1: Riwayat Absensi */}
      {activeTab === 'absensi' && (
        <div className="space-y-2.5">
          {myAttendance.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-xl border border-slate-200 text-slate-400 text-xs">
              Belum ada data presensi tercatat.
            </div>
          ) : (
            myAttendance.map((rec) => (
              <div
                key={rec.id}
                onClick={() => setSelectedRecord({ type: 'ATTENDANCE', data: rec })}
                className="bg-white rounded-xl border border-slate-200 p-3.5 hover:border-slate-300 transition-colors cursor-pointer shadow-xs"
              >
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-800">
                      {formatDateIndo(rec.date)}
                    </span>
                    <span className="text-[11px] text-slate-500">
                      · {rec.scheduleName}
                    </span>
                  </div>
                  <span
                    className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                      rec.status === 'Hadir'
                        ? 'bg-emerald-100 text-emerald-800'
                        : rec.status === 'Terlambat'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {rec.status}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 mt-2.5 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-medium">Masuk</span>
                    <span className="font-bold text-slate-800">
                      {rec.checkInTime ? `${rec.checkInTime} WIB` : '-'}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 block font-medium">Pulang</span>
                    <span className="font-bold text-slate-800">
                      {rec.checkOutTime ? `${rec.checkOutTime} WIB` : '-'}
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block font-medium">Total Durasi</span>
                    <span className="font-bold text-slate-800">
                      {rec.workDurationMinutes > 0
                        ? `${Math.floor(rec.workDurationMinutes / 60)}j ${rec.workDurationMinutes % 60}m`
                        : '-'}
                    </span>
                  </div>
                </div>

                {isManagement && (
                  <p className="text-[10px] text-slate-500 mt-2 pt-2 border-t border-slate-100">
                    Staf: <strong>{rec.employeeName}</strong> ({rec.department})
                  </p>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* LIST 2: Riwayat Cuti */}
      {activeTab === 'cuti' && (
        <div className="space-y-2.5">
          {myLeaves.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-xl border border-slate-200 text-slate-400 text-xs">
              Belum ada permohonan cuti.
            </div>
          ) : (
            myLeaves.map((leave) => (
              <div
                key={leave.id}
                onClick={() => setSelectedRecord({ type: 'LEAVE', data: leave })}
                className="bg-white rounded-xl border border-slate-200 p-3.5 hover:border-slate-300 transition-colors cursor-pointer shadow-xs"
              >
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <span className="text-xs font-bold text-slate-800">
                    {leave.leaveTypeName}
                  </span>
                  <span
                    className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                      leave.status === 'Disetujui'
                        ? 'bg-emerald-100 text-emerald-800'
                        : leave.status === 'Ditolak'
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {leave.status}
                  </span>
                </div>

                <div className="mt-2 text-xs">
                  <p className="font-semibold text-slate-800">
                    {formatDateIndo(leave.startDate)} s/d {formatDateIndo(leave.endDate)} ({leave.totalDays} hari kerja)
                  </p>
                  <p className="text-slate-600 line-clamp-1 mt-0.5">
                    Alasan: {leave.reason}
                  </p>
                  {leave.decisionNote && (
                    <p className="text-[11px] text-emerald-800 mt-1 font-medium bg-emerald-50 p-1.5 rounded">
                      Catatan: {leave.decisionNote} ({leave.approverName})
                    </p>
                  )}
                </div>

                {isManagement && (
                  <p className="text-[10px] text-slate-500 mt-2 pt-2 border-t border-slate-100">
                    Pemohon: <strong>{leave.employeeName}</strong> ({leave.department})
                  </p>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* LIST 3: Riwayat Lembur */}
      {activeTab === 'lembur' && (
        <div className="space-y-2.5">
          {myOvertimes.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-xl border border-slate-200 text-slate-400 text-xs">
              Belum ada data pengajuan lembur.
            </div>
          ) : (
            myOvertimes.map((ot) => (
              <div
                key={ot.id}
                onClick={() => setSelectedRecord({ type: 'OVERTIME', data: ot })}
                className="bg-white rounded-xl border border-slate-200 p-3.5 hover:border-slate-300 transition-colors cursor-pointer shadow-xs"
              >
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <span className="text-xs font-bold text-slate-800">
                    Lembur: {formatDateIndo(ot.date)}
                  </span>
                  <span
                    className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                      ot.status === 'Selesai' || ot.status === 'Disetujui'
                        ? 'bg-emerald-100 text-emerald-800'
                        : ot.status === 'Ditolak'
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {ot.status}
                  </span>
                </div>

                <div className="mt-2 text-xs">
                  <p className="font-semibold text-slate-800">
                    {ot.plannedStartTime} - {ot.plannedEndTime} WIB ({ot.plannedDurationHours} jam)
                  </p>
                  <p className="text-slate-600 line-clamp-1 mt-0.5">
                    Alasan: {ot.reason}
                  </p>
                </div>

                {isManagement && (
                  <p className="text-[10px] text-slate-500 mt-2 pt-2 border-t border-slate-100">
                    Karyawan: <strong>{ot.employeeName}</strong>
                  </p>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* LIST 4: Riwayat Koreksi */}
      {activeTab === 'koreksi' && (
        <div className="space-y-2.5">
          {myCorrections.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-xl border border-slate-200 text-slate-400 text-xs">
              Belum ada permohonan koreksi absensi.
            </div>
          ) : (
            myCorrections.map((corr) => (
              <div
                key={corr.id}
                onClick={() => setSelectedRecord({ type: 'CORRECTION', data: corr })}
                className="bg-white rounded-xl border border-slate-200 p-3.5 hover:border-slate-300 transition-colors cursor-pointer shadow-xs"
              >
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <span className="text-xs font-bold text-slate-800">
                    Koreksi Tanggal {formatDateIndo(corr.date)}
                  </span>
                  <span
                    className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                      corr.status === 'Disetujui'
                        ? 'bg-emerald-100 text-emerald-800'
                        : corr.status === 'Ditolak'
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {corr.status}
                  </span>
                </div>

                <div className="mt-2 text-xs">
                  <p className="font-semibold text-slate-800">
                    Usulan Jam: {corr.proposedCheckIn} - {corr.proposedCheckOut} WIB
                  </p>
                  <p className="text-slate-600 mt-0.5">Alasan: {corr.reason}</p>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Detail Audit Modal */}
      {selectedRecord && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-5 shadow-xl relative animate-in fade-in">
            <button
              onClick={() => setSelectedRecord(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
              Rincian Transaksi & Audit Log
            </h3>

            <div className="mt-3 space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">ID Transaksi:</span>
                <span className="font-mono font-bold text-slate-800">{selectedRecord.data.id}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Nama Staf:</span>
                <span className="font-bold text-slate-800">{selectedRecord.data.employeeName}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Departemen:</span>
                <span className="text-slate-800">{selectedRecord.data.department}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Status Resmi:</span>
                <span className="font-bold text-rose-600">{selectedRecord.data.status}</span>
              </div>

              {selectedRecord.data.decisionNote && (
                <div className="p-2.5 bg-slate-50 rounded-lg mt-2">
                  <p className="text-[11px] font-bold text-slate-700">Catatan Verifikator:</p>
                  <p className="text-slate-600 mt-0.5">{selectedRecord.data.decisionNote}</p>
                  <p className="text-[10px] text-slate-400 mt-1">
                    Diputuskan oleh: {selectedRecord.data.approverName} ({selectedRecord.data.decidedAt})
                  </p>
                </div>
              )}
            </div>

            <div className="mt-4 text-right">
              <button
                onClick={() => setSelectedRecord(null)}
                className="px-4 py-2 bg-slate-800 text-white rounded-lg text-xs font-semibold hover:bg-slate-900"
              >
                Tutup Rincian
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

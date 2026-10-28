import React, { useState } from 'react';
import {
  CheckCircle2,
  XCircle,
  Clock,
  CalendarDays,
  FileEdit,
  AlertCircle,
  FileText,
  User,
  ArrowRight,
  Shield,
  X,
} from 'lucide-react';
import { useHris } from '../../context/HrisContext';
import { formatDateIndo } from '../../utils/rules';
import { LeaveRequest, OvertimeRequest, AttendanceCorrection } from '../../types/hris';

export const ApprovalView: React.FC = () => {
  const {
    leaveRequests,
    overtimeRequests,
    attendanceCorrections,
    decideLeave,
    decideOvertime,
    decideCorrection,
    currentUser,
  } = useHris();

  // Active queue tab: 'cuti' | 'lembur' | 'koreksi'
  const [activeQueue, setActiveQueue] = useState<'cuti' | 'lembur' | 'koreksi'>('cuti');

  // Decision Modal state
  const [modalItem, setModalItem] = useState<{
    category: 'LEAVE' | 'OVERTIME' | 'CORRECTION';
    id: string;
    action: 'APPROVE' | 'REJECT';
    title: string;
    requester: string;
    details: string;
  } | null>(null);

  const [decisionNotes, setDecisionNotes] = useState('');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const pendingLeaves = leaveRequests.filter((r) => r.status === 'Menunggu Persetujuan');
  const pendingOvertimes = overtimeRequests.filter((r) => r.status === 'Menunggu Persetujuan');
  const pendingCorrections = attendanceCorrections.filter((c) => c.status === 'Menunggu Persetujuan');

  const handleExecuteDecision = () => {
    if (!modalItem) return;

    if (modalItem.action === 'REJECT' && !decisionNotes.trim()) {
      setFeedback({ type: 'error', message: 'Wajib memberikan alasan penolakan pada kolom catatan.' });
      return;
    }

    let res = { success: false, message: '' };

    if (modalItem.category === 'LEAVE') {
      res = decideLeave(modalItem.id, modalItem.action, decisionNotes);
    } else if (modalItem.category === 'OVERTIME') {
      res = decideOvertime(modalItem.id, modalItem.action, decisionNotes);
    } else if (modalItem.category === 'CORRECTION') {
      res = decideCorrection(modalItem.id, modalItem.action, decisionNotes);
    }

    setFeedback({
      type: res.success ? 'success' : 'error',
      message: res.message,
    });

    setModalItem(null);
    setDecisionNotes('');
  };

  return (
    <div className="p-4 space-y-4 max-w-2xl mx-auto pb-24">
      {/* Title */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">
            Pusat Persetujuan (Approval)
          </h2>
          <p className="text-xs text-slate-500">
            Kewenangan: <strong className="text-rose-600">{currentUser.fullName} ({currentUser.role})</strong>
          </p>
        </div>
      </div>

      {/* Feedback banner */}
      {feedback && (
        <div
          className={`p-3 rounded-xl border flex items-start gap-2.5 text-xs animate-in fade-in ${
            feedback.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : 'bg-rose-50 border-rose-200 text-rose-900'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          )}
          <span className="leading-relaxed font-semibold">{feedback.message}</span>
        </div>
      )}

      {/* Segmented Queue Switcher */}
      <div className="grid grid-cols-3 gap-1 bg-slate-200/80 p-1 rounded-xl">
        <button
          onClick={() => setActiveQueue('cuti')}
          className={`py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
            activeQueue === 'cuti'
              ? 'bg-white text-rose-600 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <span>Persetujuan Cuti</span>
          {pendingLeaves.length > 0 && (
            <span className="bg-rose-600 text-white text-[10px] px-1.5 py-0.2 rounded-full font-bold">
              {pendingLeaves.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveQueue('lembur')}
          className={`py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
            activeQueue === 'lembur'
              ? 'bg-white text-rose-600 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <span>Persetujuan Lembur</span>
          {pendingOvertimes.length > 0 && (
            <span className="bg-rose-600 text-white text-[10px] px-1.5 py-0.2 rounded-full font-bold">
              {pendingOvertimes.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveQueue('koreksi')}
          className={`py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
            activeQueue === 'koreksi'
              ? 'bg-white text-rose-600 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <span>Koreksi Absen</span>
          {pendingCorrections.length > 0 && (
            <span className="bg-rose-600 text-white text-[10px] px-1.5 py-0.2 rounded-full font-bold">
              {pendingCorrections.length}
            </span>
          )}
        </button>
      </div>

      {/* QUEUE 1: Persetujuan Cuti */}
      {activeQueue === 'cuti' && (
        <div className="space-y-3">
          {pendingLeaves.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-xl border border-slate-200 text-slate-400 text-xs">
              Tidak ada permohonan cuti yang menunggu persetujuan saat ini.
            </div>
          ) : (
            pendingLeaves.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">
                      {item.employeeName} ({item.employeeNik})
                    </h4>
                    <p className="text-[11px] text-slate-500">{item.department}</p>
                  </div>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                    Menunggu Persetujuan
                  </span>
                </div>

                <div className="bg-slate-50 rounded-lg p-2.5 text-xs space-y-1">
                  <p>
                    Jenis Cuti: <strong className="text-slate-900">{item.leaveTypeName}</strong>
                  </p>
                  <p>
                    Periode:{' '}
                    <strong className="text-slate-900">
                      {formatDateIndo(item.startDate)} s/d {formatDateIndo(item.endDate)} ({item.totalDays} hari kerja)
                    </strong>
                  </p>
                  <p className="text-slate-600">Alasan: {item.reason}</p>
                  {item.attachmentUrl && (
                    <p className="text-[11px] text-blue-600 font-medium">
                      ✓ Memiliki Lampiran Dokumen
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    onClick={() =>
                      setModalItem({
                        category: 'LEAVE',
                        id: item.id,
                        action: 'REJECT',
                        title: `Tolak Pengajuan Cuti: ${item.leaveTypeName}`,
                        requester: item.employeeName,
                        details: `Periode: ${item.startDate} s/d ${item.endDate} (${item.totalDays} hari)`,
                      })
                    }
                    className="px-3 py-1.5 border border-rose-300 text-rose-700 hover:bg-rose-50 rounded-lg text-xs font-semibold transition-colors"
                  >
                    Tolak Cuti
                  </button>

                  <button
                    onClick={() =>
                      setModalItem({
                        category: 'LEAVE',
                        id: item.id,
                        action: 'APPROVE',
                        title: `Setujui Pengajuan Cuti: ${item.leaveTypeName}`,
                        requester: item.employeeName,
                        details: `Periode: ${item.startDate} s/d ${item.endDate} (${item.totalDays} hari)`,
                      })
                    }
                    className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors"
                  >
                    Setujui Cuti
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* QUEUE 2: Persetujuan Lembur */}
      {activeQueue === 'lembur' && (
        <div className="space-y-3">
          {pendingOvertimes.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-xl border border-slate-200 text-slate-400 text-xs">
              Tidak ada pengajuan lembur yang menunggu persetujuan.
            </div>
          ) : (
            pendingOvertimes.map((ot) => (
              <div
                key={ot.id}
                className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">
                      {ot.employeeName} ({ot.employeeNik})
                    </h4>
                    <p className="text-[11px] text-slate-500">{ot.department}</p>
                  </div>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                    Menunggu Persetujuan
                  </span>
                </div>

                <div className="bg-slate-50 rounded-lg p-2.5 text-xs space-y-1">
                  <p>
                    Tanggal Lembur: <strong className="text-slate-900">{formatDateIndo(ot.date)}</strong>
                  </p>
                  <p>
                    Waktu:{' '}
                    <strong className="text-slate-900">
                      {ot.plannedStartTime} - {ot.plannedEndTime} WIB ({ot.plannedDurationHours} jam)
                    </strong>
                  </p>
                  <p className="text-slate-700 font-medium">Alasan: {ot.reason}</p>
                  <p className="text-slate-600">Rincian Tugas: {ot.taskDescription}</p>
                </div>

                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    onClick={() =>
                      setModalItem({
                        category: 'OVERTIME',
                        id: ot.id,
                        action: 'REJECT',
                        title: `Tolak Pengajuan Lembur`,
                        requester: ot.employeeName,
                        details: `Tanggal: ${ot.date} (${ot.plannedDurationHours} jam)`,
                      })
                    }
                    className="px-3 py-1.5 border border-rose-300 text-rose-700 hover:bg-rose-50 rounded-lg text-xs font-semibold transition-colors"
                  >
                    Tolak Lembur
                  </button>

                  <button
                    onClick={() =>
                      setModalItem({
                        category: 'OVERTIME',
                        id: ot.id,
                        action: 'APPROVE',
                        title: `Setujui Surat Perintah Lembur`,
                        requester: ot.employeeName,
                        details: `Tanggal: ${ot.date} (${ot.plannedDurationHours} jam)`,
                      })
                    }
                    className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors"
                  >
                    Setujui Lembur
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* QUEUE 3: Persetujuan Koreksi */}
      {activeQueue === 'koreksi' && (
        <div className="space-y-3">
          {pendingCorrections.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-xl border border-slate-200 text-slate-400 text-xs">
              Tidak ada permohonan koreksi absensi yang menunggu.
            </div>
          ) : (
            pendingCorrections.map((corr) => (
              <div
                key={corr.id}
                className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">
                      {corr.employeeName}
                    </h4>
                    <p className="text-[11px] text-slate-500">{corr.department}</p>
                  </div>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                    Menunggu Verifikasi
                  </span>
                </div>

                <div className="bg-slate-50 rounded-lg p-2.5 text-xs space-y-1">
                  <p>
                    Tanggal Kehadiran:{' '}
                    <strong className="text-slate-900">{formatDateIndo(corr.date)}</strong>
                  </p>
                  <p>
                    Usulan Jam Masuk/Pulang:{' '}
                    <strong className="text-slate-900">
                      {corr.proposedCheckIn} - {corr.proposedCheckOut} WIB
                    </strong>
                  </p>
                  <p className="text-slate-600">Alasan Permohonan: {corr.reason}</p>
                </div>

                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    onClick={() =>
                      setModalItem({
                        category: 'CORRECTION',
                        id: corr.id,
                        action: 'REJECT',
                        title: `Tolak Permohonan Koreksi`,
                        requester: corr.employeeName,
                        details: `Tanggal: ${corr.date} (${corr.proposedCheckIn} - ${corr.proposedCheckOut})`,
                      })
                    }
                    className="px-3 py-1.5 border border-rose-300 text-rose-700 hover:bg-rose-50 rounded-lg text-xs font-semibold transition-colors"
                  >
                    Tolak Koreksi
                  </button>

                  <button
                    onClick={() =>
                      setModalItem({
                        category: 'CORRECTION',
                        id: corr.id,
                        action: 'APPROVE',
                        title: `Setujui Perubahan Rekam Absensi`,
                        requester: corr.employeeName,
                        details: `Tanggal: ${corr.date} (${corr.proposedCheckIn} - ${corr.proposedCheckOut})`,
                      })
                    }
                    className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors"
                  >
                    Setujui Koreksi
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Decision Confirmation Modal */}
      {modalItem && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-sm w-full p-5 shadow-xl relative animate-in fade-in">
            <button
              onClick={() => {
                setModalItem(null);
                setDecisionNotes('');
              }}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-2">
              <span
                className={`text-xs font-bold px-2 py-0.5 rounded ${
                  modalItem.action === 'APPROVE'
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-rose-100 text-rose-800'
                }`}
              >
                {modalItem.action === 'APPROVE' ? 'Persetujuan' : 'Penolakan'}
              </span>
            </div>

            <h3 className="text-sm font-bold text-slate-900 leading-tight">
              {modalItem.title}
            </h3>

            <div className="bg-slate-50 p-2.5 rounded-lg my-3 text-xs">
              <p className="font-semibold text-slate-800">{modalItem.requester}</p>
              <p className="text-slate-500 mt-0.5">{modalItem.details}</p>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-700">
                Catatan Keputusan {modalItem.action === 'REJECT' && <span className="text-rose-600">*Wajib</span>}
              </label>
              <textarea
                rows={3}
                value={decisionNotes}
                onChange={(e) => setDecisionNotes(e.target.value)}
                placeholder={
                  modalItem.action === 'APPROVE'
                    ? 'Contoh: Disetujui, harap koordinasikan shift pengganti dengan rekan kerja...'
                    : 'Contoh: Ditolak karena jadwal stock opname memerlukan kehadiran lengkap...'
                }
                className="w-full text-xs p-2.5 border rounded-lg focus:outline-hidden focus:border-rose-500"
                required={modalItem.action === 'REJECT'}
              />
            </div>

            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setModalItem(null);
                  setDecisionNotes('');
                }}
                className="px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleExecuteDecision}
                className={`px-4 py-2 text-white text-xs font-bold rounded-lg transition-colors ${
                  modalItem.action === 'APPROVE'
                    ? 'bg-emerald-600 hover:bg-emerald-700'
                    : 'bg-rose-600 hover:bg-rose-700'
                }`}
              >
                {modalItem.action === 'APPROVE' ? 'Konfirmasi Setujui' : 'Konfirmasi Tolak'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

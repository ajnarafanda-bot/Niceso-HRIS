import React, { useState } from 'react';
import {
  CalendarDays,
  Clock,
  FileEdit,
  CheckCircle2,
  AlertCircle,
  Upload,
  Info,
  CalendarCheck2,
  ArrowRight,
} from 'lucide-react';
import { useHris } from '../../context/HrisContext';
import { calculateLeaveWorkingDays, calculateOvertimeHours } from '../../utils/rules';

export const RequestView: React.FC = () => {
  const {
    currentEmployee,
    leaveTypes,
    submitLeave,
    submitOvertime,
    submitAttendanceCorrection,
    setActiveTab,
  } = useHris();

  // Active form tab: 'cuti' | 'lembur' | 'koreksi'
  const [formType, setFormType] = useState<'cuti' | 'lembur' | 'koreksi'>('cuti');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Form State: Cuti
  const [leaveTypeId, setLeaveTypeId] = useState<string>(leaveTypes[0]?.id || 'LT-01');
  const [startDate, setStartDate] = useState<string>('2026-11-09');
  const [endDate, setEndDate] = useState<string>('2026-11-10');
  const [leaveReason, setLeaveReason] = useState<string>('');
  const [leaveAttachment, setLeaveAttachment] = useState<string>('');

  // Form State: Lembur
  const [otDate, setOtDate] = useState<string>('2026-10-29');
  const [otStartTime, setOtStartTime] = useState<string>('17:30');
  const [otEndTime, setOtEndTime] = useState<string>('20:30');
  const [otReason, setOtReason] = useState<string>('Persiapan Stock Opname Akhir Bulan Toko Niceso');
  const [otTaskDesc, setOtTaskDesc] = useState<string>('Menghitung fisik barang inventaris dan input sistem ERP.');

  // Form State: Koreksi Absensi
  const [corrDate, setCorrDate] = useState<string>('2026-10-26');
  const [proposedCheckIn, setProposedCheckIn] = useState<string>('08:30');
  const [proposedCheckOut, setProposedCheckOut] = useState<string>('17:45');
  const [corrReason, setCorrReason] = useState<string>('Lupa check-out karena langsung membantu customer di kasir.');

  // Calculations
  const selectedLeaveType = leaveTypes.find((lt) => lt.id === leaveTypeId) || leaveTypes[0];
  const calculatedWorkingDays = calculateLeaveWorkingDays(startDate, endDate);
  const calculatedOtHours = calculateOvertimeHours(otStartTime, otEndTime);

  // Handle Leave Submission
  const handleLeaveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    if (!leaveReason.trim()) {
      setFeedback({ type: 'error', message: 'Harap isi alasan pengajuan cuti dengan jelas.' });
      return;
    }

    if (selectedLeaveType.requiresAttachment && !leaveAttachment) {
      setFeedback({
        type: 'error',
        message: `Jenis ${selectedLeaveType.name} mewajibkan unggah dokumen bukti (misal: Surat Keterangan Dokter).`,
      });
      return;
    }

    const res = submitLeave({
      leaveTypeId,
      startDate,
      endDate,
      reason: leaveReason,
      attachmentUrl: leaveAttachment || undefined,
    });

    setFeedback({
      type: res.success ? 'success' : 'error',
      message: res.message,
    });

    if (res.success) {
      setLeaveReason('');
      setLeaveAttachment('');
    }
  };

  // Handle Overtime Submission
  const handleOvertimeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    if (!otReason.trim() || !otTaskDesc.trim()) {
      setFeedback({ type: 'error', message: 'Harap lengkapi alasan dan deskripsi tugas lembur.' });
      return;
    }

    const res = submitOvertime({
      date: otDate,
      plannedStartTime: otStartTime,
      plannedEndTime: otEndTime,
      reason: otReason,
      taskDescription: otTaskDesc,
    });

    setFeedback({
      type: res.success ? 'success' : 'error',
      message: res.message,
    });
  };

  // Handle Correction Submission
  const handleCorrectionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    if (!corrReason.trim()) {
      setFeedback({ type: 'error', message: 'Harap isi alasan permohonan koreksi absensi.' });
      return;
    }

    const res = submitAttendanceCorrection({
      date: corrDate,
      proposedCheckIn,
      proposedCheckOut,
      reason: corrReason,
    });

    setFeedback({
      type: res.success ? 'success' : 'error',
      message: res.message,
    });
  };

  return (
    <div className="p-4 space-y-4 max-w-2xl mx-auto pb-24">
      {/* Header */}
      <div>
        <h2 className="text-lg font-bold text-slate-900 tracking-tight">
          Pusat Pengajuan Karyawan
        </h2>
        <p className="text-xs text-slate-500">
          Formulir pengajuan cuti tahunan/khusus, lembur toko, dan koreksi kehadiran
        </p>
      </div>

      {/* Segmented Switcher */}
      <div className="grid grid-cols-3 gap-1 bg-slate-200/80 p-1 rounded-xl">
        <button
          onClick={() => {
            setFormType('cuti');
            setFeedback(null);
          }}
          className={`py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
            formType === 'cuti'
              ? 'bg-white text-rose-600 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <CalendarDays className="w-3.5 h-3.5" />
          <span>Pengajuan Cuti</span>
        </button>

        <button
          onClick={() => {
            setFormType('lembur');
            setFeedback(null);
          }}
          className={`py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
            formType === 'lembur'
              ? 'bg-white text-rose-600 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Pengajuan Lembur</span>
        </button>

        <button
          onClick={() => {
            setFormType('koreksi');
            setFeedback(null);
          }}
          className={`py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
            formType === 'koreksi'
              ? 'bg-white text-rose-600 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <FileEdit className="w-3.5 h-3.5" />
          <span>Koreksi Absen</span>
        </button>
      </div>

      {/* Feedback Banner */}
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
          <div className="flex-1">
            <p className="leading-relaxed font-semibold">{feedback.message}</p>
            {feedback.type === 'success' && (
              <button
                onClick={() => setActiveTab('riwayat')}
                className="mt-1 text-xs text-emerald-700 underline font-medium hover:text-emerald-900"
              >
                Lihat di Tab Riwayat →
              </button>
            )}
          </div>
        </div>
      )}

      {/* FORM 1: Pengajuan Cuti */}
      {formType === 'cuti' && (
        <form onSubmit={handleLeaveSubmit} className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Formulir Pengajuan Cuti / Izin
            </h3>
            <span className="text-xs text-slate-500">
              Sisa Cuti Tahunan: <strong className="text-rose-600">{currentEmployee.remainingAnnualLeave} hari</strong>
            </span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Jenis Cuti
            </label>
            <select
              value={leaveTypeId}
              onChange={(e) => setLeaveTypeId(e.target.value)}
              className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:outline-hidden focus:border-rose-500 bg-white"
            >
              {leaveTypes.map((lt) => (
                <option key={lt.id} value={lt.id}>
                  {lt.name} ({lt.deductsAnnualQuota ? 'Memotong Saldo Tahunan' : 'Hak Khusus / Non-Potong'})
                </option>
              ))}
            </select>
            <p className="text-[11px] text-slate-500 mt-1">
              {selectedLeaveType.description}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Tanggal Mulai
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:outline-hidden focus:border-rose-500"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Tanggal Selesai
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:outline-hidden focus:border-rose-500"
                required
              />
            </div>
          </div>

          {/* Working days counter box */}
          <div className="p-3 bg-slate-50 rounded-lg flex items-center justify-between text-xs">
            <span className="text-slate-600 font-medium">
              Durasi Hari Kerja Efektif:
            </span>
            <span className="font-extrabold text-slate-900 text-sm">
              {calculatedWorkingDays} Hari Kerja
            </span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Alasan Pengajuan Cuti
            </label>
            <textarea
              rows={3}
              value={leaveReason}
              onChange={(e) => setLeaveReason(e.target.value)}
              placeholder="Contoh: Keperluan keluarga mendesak dan renovasi rumah tinggal..."
              className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:outline-hidden focus:border-rose-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Dokumen / Lampiran Pendukung {selectedLeaveType.requiresAttachment && <span className="text-rose-600">*Wajib</span>}
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={leaveAttachment}
                onChange={(e) => setLeaveAttachment(e.target.value)}
                placeholder="Tautan URL dokumen atau simulasi lampiran foto..."
                className="flex-1 text-xs p-2.5 rounded-lg border border-slate-200 focus:outline-hidden focus:border-rose-500"
              />
              <button
                type="button"
                onClick={() => setLeaveAttachment('https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=600&auto=format&fit=crop&q=80')}
                className="px-3 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium shrink-0 flex items-center gap-1"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Simulasi Bukti</span>
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
          >
            Kirim Pengajuan Cuti ke Store Manager
          </button>
        </form>
      )}

      {/* FORM 2: Pengajuan Lembur */}
      {formType === 'lembur' && (
        <form onSubmit={handleOvertimeSubmit} className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Surat Perintah Lembur (SPL)
            </h3>
            <span className="text-xs text-slate-500">
              Estimasi: <strong className="text-rose-600">{calculatedOtHours} jam</strong>
            </span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Tanggal Pelaksanaan Lembur
            </label>
            <input
              type="date"
              value={otDate}
              onChange={(e) => setOtDate(e.target.value)}
              className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:outline-hidden focus:border-rose-500"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Jam Mulai Direncanakan
              </label>
              <input
                type="time"
                value={otStartTime}
                onChange={(e) => setOtStartTime(e.target.value)}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:outline-hidden focus:border-rose-500"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Jam Selesai Direncanakan
              </label>
              <input
                type="time"
                value={otEndTime}
                onChange={(e) => setOtEndTime(e.target.value)}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:outline-hidden focus:border-rose-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Alasan Lembur
            </label>
            <input
              type="text"
              value={otReason}
              onChange={(e) => setOtReason(e.target.value)}
              placeholder="Contoh: Stock Opname Bulanan & Promosi Toko..."
              className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:outline-hidden focus:border-rose-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Rincian Pekerjaan Retail / Toko yang Diselesaikan
            </label>
            <textarea
              rows={3}
              value={otTaskDesc}
              onChange={(e) => setOtTaskDesc(e.target.value)}
              placeholder="Jelaskan secara spesifik barang/aktivitas yang dikerjakan..."
              className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:outline-hidden focus:border-rose-500"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
          >
            Kirim Pengajuan Lembur ke Atasan
          </button>
        </form>
      )}

      {/* FORM 3: Koreksi Absensi */}
      {formType === 'koreksi' && (
        <form onSubmit={handleCorrectionSubmit} className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Permohonan Koreksi Kehadiran
            </h3>
            <span className="text-xs text-amber-700 font-medium">Audit Trail Tercatat</span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Tanggal Presensi yang Ingin Dikoreksi
            </label>
            <input
              type="date"
              value={corrDate}
              onChange={(e) => setCorrDate(e.target.value)}
              className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:outline-hidden focus:border-rose-500"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Usulan Jam Masuk (Check-in)
              </label>
              <input
                type="time"
                value={proposedCheckIn}
                onChange={(e) => setProposedCheckIn(e.target.value)}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:outline-hidden focus:border-rose-500"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Usulan Jam Pulang (Check-out)
              </label>
              <input
                type="time"
                value={proposedCheckOut}
                onChange={(e) => setProposedCheckOut(e.target.value)}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:outline-hidden focus:border-rose-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Alasan Koreksi
            </label>
            <textarea
              rows={3}
              value={corrReason}
              onChange={(e) => setCorrReason(e.target.value)}
              placeholder="Jelaskan alasan kendala teknis (misal: GPS error cuaca, battery habis saat pergantian shift kasir)..."
              className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:outline-hidden focus:border-rose-500"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
          >
            Kirim Permohonan Koreksi ke HR / Manager
          </button>
        </form>
      )}
    </div>
  );
};

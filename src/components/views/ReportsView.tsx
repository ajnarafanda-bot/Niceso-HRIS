import React, { useState } from 'react';
import {
  BarChart3,
  Download,
  Printer,
  Calendar,
  Filter,
  Users,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
} from 'lucide-react';
import { useHris } from '../../context/HrisContext';
import { formatDateIndo } from '../../utils/rules';
import { NICESO_LOGO_URL } from '../../constants/assets';

export const ReportsView: React.FC = () => {
  const {
    attendanceRecords,
    employees,
    leaveRequests,
    overtimeRequests,
    branches,
  } = useHris();

  // Report type: 'HARIAN' | 'BULANAN' | 'KETERLAMBATAN' | 'CUTI' | 'LEMBUR'
  const [reportType, setReportType] = useState<'HARIAN' | 'BULANAN' | 'KETERLAMBATAN' | 'CUTI' | 'LEMBUR'>('HARIAN');
  const [selectedBranch, setSelectedBranch] = useState('ALL');
  const [showPrintModal, setShowPrintModal] = useState(false);

  // Filtered attendance
  const filteredAttendance = attendanceRecords.filter((rec) => {
    return selectedBranch === 'ALL' || rec.branch.includes(selectedBranch);
  });

  const lateRecords = filteredAttendance.filter((rec) => rec.lateMinutes > 0);
  const approvedLeaves = leaveRequests.filter((r) => r.status === 'Disetujui');
  const completedOvertimes = overtimeRequests.filter((r) => r.status === 'Selesai' || r.status === 'Disetujui');

  const exportCsv = () => {
    let headers = '';
    let rows: string[] = [];
    let filename = '';

    if (reportType === 'HARIAN' || reportType === 'BULANAN') {
      headers = 'ID,Tanggal,Nama_Karyawan,NIK,Departemen,Cabang,Jam_Masuk,Jam_Pulang,Status,Menit_Terlambat,Durasi_Menit';
      rows = filteredAttendance.map(
        (r) =>
          `"${r.id}","${r.date}","${r.employeeName}","${r.employeeNik}","${r.department}","${r.branch}","${r.checkInTime || '-'}","${r.checkOutTime || '-'}","${r.status}","${r.lateMinutes}","${r.workDurationMinutes}"`
      );
      filename = `rekap_absensi_${reportType.toLowerCase()}_${Date.now()}.csv`;
    } else if (reportType === 'KETERLAMBATAN') {
      headers = 'ID,Tanggal,Nama,NIK,Cabang,Jam_Masuk,Menit_Terlambat';
      rows = lateRecords.map(
        (r) =>
          `"${r.id}","${r.date}","${r.employeeName}","${r.employeeNik}","${r.branch}","${r.checkInTime}","${r.lateMinutes}"`
      );
      filename = `laporan_keterlambatan_${Date.now()}.csv`;
    } else if (reportType === 'CUTI') {
      headers = 'ID,Nama,NIK,Jenis_Cuti,Mulai,Selesai,Total_Hari,Status,Alasan';
      rows = approvedLeaves.map(
        (r) =>
          `"${r.id}","${r.employeeName}","${r.employeeNik}","${r.leaveTypeName}","${r.startDate}","${r.endDate}","${r.totalDays}","${r.status}","${r.reason}"`
      );
      filename = `laporan_cuti_${Date.now()}.csv`;
    } else {
      headers = 'ID,Nama,Tanggal,Jam_Mulai,Jam_Selesai,Durasi_Jam,Alasan,Status';
      rows = completedOvertimes.map(
        (r) =>
          `"${r.id}","${r.employeeName}","${r.date}","${r.plannedStartTime}","${r.plannedEndTime}","${r.plannedDurationHours}","${r.reason}","${r.status}"`
      );
      filename = `laporan_lembur_${Date.now()}.csv`;
    }

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-4 space-y-4 max-w-3xl mx-auto pb-24">
      {/* Title */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">
            Laporan & Rekapitulasi HR
          </h2>
          <p className="text-xs text-slate-500">
            Ekspor rekapitulasi absensi bulanan, evaluasi keterlambatan, dan pemanfaatan cuti
          </p>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setShowPrintModal(true)}
            className="px-3 py-1.5 border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50 text-xs font-semibold flex items-center gap-1"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Cetak PDF</span>
          </button>

          <button
            onClick={exportCsv}
            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow-xs"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Ekspor Excel/CSV</span>
          </button>
        </div>
      </div>

      {/* Report Type Selector */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 text-xs">
        <button
          onClick={() => setReportType('HARIAN')}
          className={`px-3 py-2 rounded-lg font-semibold shrink-0 transition-colors ${
            reportType === 'HARIAN'
              ? 'bg-rose-600 text-white'
              : 'bg-white border text-slate-600 hover:bg-slate-50'
          }`}
        >
          Absensi Harian
        </button>

        <button
          onClick={() => setReportType('BULANAN')}
          className={`px-3 py-2 rounded-lg font-semibold shrink-0 transition-colors ${
            reportType === 'BULANAN'
              ? 'bg-rose-600 text-white'
              : 'bg-white border text-slate-600 hover:bg-slate-50'
          }`}
        >
          Rekap Bulanan
        </button>

        <button
          onClick={() => setReportType('KETERLAMBATAN')}
          className={`px-3 py-2 rounded-lg font-semibold shrink-0 transition-colors ${
            reportType === 'KETERLAMBATAN'
              ? 'bg-rose-600 text-white'
              : 'bg-white border text-slate-600 hover:bg-slate-50'
          }`}
        >
          Keterlambatan
        </button>

        <button
          onClick={() => setReportType('CUTI')}
          className={`px-3 py-2 rounded-lg font-semibold shrink-0 transition-colors ${
            reportType === 'CUTI'
              ? 'bg-rose-600 text-white'
              : 'bg-white border text-slate-600 hover:bg-slate-50'
          }`}
        >
          Saldo & Cuti
        </button>

        <button
          onClick={() => setReportType('LEMBUR')}
          className={`px-3 py-2 rounded-lg font-semibold shrink-0 transition-colors ${
            reportType === 'LEMBUR'
              ? 'bg-rose-600 text-white'
              : 'bg-white border text-slate-600 hover:bg-slate-50'
          }`}
        >
          Lembur Toko
        </button>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-4 gap-2 text-center">
        <div className="bg-white rounded-xl border p-3 shadow-xs">
          <p className="text-lg font-extrabold text-slate-900">{filteredAttendance.length}</p>
          <p className="text-[10px] text-slate-500 font-medium">Total Presensi</p>
        </div>
        <div className="bg-white rounded-xl border p-3 shadow-xs">
          <p className="text-lg font-extrabold text-emerald-600">
            {filteredAttendance.filter((r) => r.status === 'Hadir').length}
          </p>
          <p className="text-[10px] text-slate-500 font-medium">Hadir Tepat</p>
        </div>
        <div className="bg-white rounded-xl border p-3 shadow-xs">
          <p className="text-lg font-extrabold text-amber-600">{lateRecords.length}</p>
          <p className="text-[10px] text-slate-500 font-medium">Terlambat</p>
        </div>
        <div className="bg-white rounded-xl border p-3 shadow-xs">
          <p className="text-lg font-extrabold text-blue-600">{approvedLeaves.length}</p>
          <p className="text-[10px] text-slate-500 font-medium">Cuti Disetujui</p>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="px-4 py-2.5 bg-slate-50 border-b flex items-center justify-between text-xs font-semibold text-slate-700">
          <span>Rincian Baris Laporan ({reportType})</span>
          <span className="text-[11px] text-slate-400">Periode: Oktober 2026</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100/75 border-b text-[11px] text-slate-600 uppercase">
              <tr>
                <th className="py-2.5 px-3">Tanggal</th>
                <th className="py-2.5 px-3">Karyawan</th>
                <th className="py-2.5 px-3">Cabang</th>
                <th className="py-2.5 px-3">Masuk/Pulang</th>
                <th className="py-2.5 px-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredAttendance.map((row) => (
                <tr key={row.id} className="hover:bg-slate-50">
                  <td className="py-2.5 px-3 font-medium text-slate-800">
                    {formatDateIndo(row.date)}
                  </td>
                  <td className="py-2.5 px-3">
                    <p className="font-bold text-slate-900">{row.employeeName}</p>
                    <p className="text-[10px] text-slate-400 font-mono">{row.employeeNik}</p>
                  </td>
                  <td className="py-2.5 px-3 text-slate-600">{row.branch}</td>
                  <td className="py-2.5 px-3 font-mono text-slate-700">
                    {row.checkInTime || '-'} / {row.checkOutTime || '-'}
                  </td>
                  <td className="py-2.5 px-3">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        row.status === 'Hadir'
                          ? 'bg-emerald-100 text-emerald-800'
                          : row.status === 'Terlambat'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {row.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* PRINT / PDF OFFICIAL PREVIEW MODAL */}
      {showPrintModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            {/* Header Letterhead */}
            <div className="border-b-2 border-slate-900 pb-3 flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2.5">
                  <img
                    src={NICESO_LOGO_URL}
                    alt="Logo Niceso"
                    className="h-8 w-auto object-contain rounded border border-slate-200 p-0.5"
                  />
                  <h3 className="text-base font-extrabold text-rose-600 tracking-tight">
                    PT NICESO SUKSES INDONESIA
                  </h3>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Divisi Human Resource Information System (HRIS) & Kepegawaian
                </p>
                <p className="text-[10px] text-slate-400">
                  Head Office: Jl. Jend. Sudirman Kav. 52-53, Jakarta Selatan
                </p>
              </div>

              <div className="text-right">
                <span className="text-xs font-bold text-slate-900 block">DOKUMEN RESMI</span>
                <span className="text-[10px] text-slate-400">Dicetak: 27-10-2026</span>
              </div>
            </div>

            <div className="my-4 text-center">
              <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                REKAPITULASI KEHADIRAN KARYAWAN TOKO NICESO
              </h4>
              <p className="text-xs text-slate-500">
                Periode: Oktober 2026 · Format: Standar Audit ISO/Ketenagakerjaan
              </p>
            </div>

            <table className="w-full text-xs border border-slate-300">
              <thead className="bg-slate-100 border-b border-slate-300 font-bold">
                <tr>
                  <th className="p-2 border-r">NIK</th>
                  <th className="p-2 border-r">Nama Karyawan</th>
                  <th className="p-2 border-r">Cabang</th>
                  <th className="p-2 border-r">Tanggal</th>
                  <th className="p-2 border-r">Jam Masuk</th>
                  <th className="p-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredAttendance.slice(0, 8).map((r) => (
                  <tr key={r.id} className="border-b border-slate-200">
                    <td className="p-2 border-r font-mono">{r.employeeNik}</td>
                    <td className="p-2 border-r font-bold">{r.employeeName}</td>
                    <td className="p-2 border-r">{r.branch}</td>
                    <td className="p-2 border-r">{formatDateIndo(r.date)}</td>
                    <td className="p-2 border-r font-mono">{r.checkInTime || '-'}</td>
                    <td className="p-2 font-semibold">{r.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Signature Block */}
            <div className="mt-8 pt-4 flex justify-between text-xs text-center">
              <div>
                <p className="text-slate-500">Dibuat Oleh,</p>
                <div className="h-14" />
                <p className="font-bold text-slate-900 underline">Siti Rahmawati, S.Psi</p>
                <p className="text-[10px] text-slate-500">HR & People Operations Lead</p>
              </div>

              <div>
                <p className="text-slate-500">Disetujui Oleh,</p>
                <div className="h-14" />
                <p className="font-bold text-slate-900 underline">Ahmad Fauzi</p>
                <p className="text-[10px] text-slate-500">Retail Operations Head</p>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2 border-t pt-3">
              <button
                onClick={() => setShowPrintModal(false)}
                className="px-4 py-2 border rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Tutup
              </button>
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-rose-600 text-white rounded-lg text-xs font-bold hover:bg-rose-700 flex items-center gap-1.5"
              >
                <Printer className="w-4 h-4" />
                <span>Cetak Lembar Resmi</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

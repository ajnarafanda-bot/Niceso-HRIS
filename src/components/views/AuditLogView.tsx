import React, { useState } from 'react';
import {
  ShieldAlert,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Terminal,
} from 'lucide-react';
import { useHris } from '../../context/HrisContext';

export const AuditLogView: React.FC = () => {
  const { auditLogs } = useHris();
  const [search, setSearch] = useState('');
  const [moduleFilter, setModuleFilter] = useState('ALL');

  const filteredLogs = auditLogs.filter((log) => {
    const matchesSearch =
      log.action.toLowerCase().includes(search.toLowerCase()) ||
      log.userName.toLowerCase().includes(search.toLowerCase()) ||
      log.details.toLowerCase().includes(search.toLowerCase());

    const matchesModule =
      moduleFilter === 'ALL' || log.module === moduleFilter;

    return matchesSearch && matchesModule;
  });

  return (
    <div className="p-4 space-y-4 max-w-3xl mx-auto pb-24">
      {/* Title */}
      <div>
        <h2 className="text-lg font-bold text-slate-900 tracking-tight">
          Audit Trail & Log Keamanan Sistem
        </h2>
        <p className="text-xs text-slate-500">
          Catatan riwayat transaksi administratif, validasi persetujuan, dan perubahan master data
        </p>
      </div>

      {/* Search & Filter */}
      <div className="bg-white rounded-xl border border-slate-200 p-3 shadow-xs grid grid-cols-3 gap-2">
        <div className="col-span-2 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari aksi, nama aktor, atau detail aktivitas..."
            className="w-full text-xs pl-9 pr-3 py-2 border rounded-lg focus:outline-hidden focus:border-rose-500"
          />
        </div>

        <select
          value={moduleFilter}
          onChange={(e) => setModuleFilter(e.target.value)}
          className="text-xs p-2 border rounded-lg bg-white"
        >
          <option value="ALL">Semua Modul</option>
          <option value="Absensi">Absensi</option>
          <option value="Manajemen Cuti">Manajemen Cuti</option>
          <option value="Lembur">Lembur</option>
          <option value="Koreksi Absensi">Koreksi Absensi</option>
          <option value="Data Karyawan">Data Karyawan</option>
          <option value="Sistem & Autentikasi">Sistem & Autentikasi</option>
        </select>
      </div>

      {/* Log Feed */}
      <div className="space-y-2">
        {filteredLogs.map((log) => (
          <div
            key={log.id}
            className="bg-white rounded-xl border border-slate-200 p-3 hover:border-slate-300 transition-colors shadow-xs"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-1.5 text-[11px]">
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded">
                  {log.action}
                </span>
                <span className="text-slate-500 font-semibold">{log.module}</span>
              </div>
              <span className="font-mono text-slate-400">{log.timestamp}</span>
            </div>

            <p className="text-xs text-slate-800 mt-2 font-medium">
              {log.details}
            </p>

            <div className="mt-2 pt-2 border-t border-slate-50 flex items-center justify-between text-[10px] text-slate-400">
              <span>
                Aktor: <strong className="text-slate-600">{log.userName}</strong>
              </span>
              <span className="font-mono">IP: {log.ipAddress}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

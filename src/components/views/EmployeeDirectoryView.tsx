import React, { useState } from 'react';
import {
  Users,
  Search,
  Filter,
  UserPlus,
  Download,
  Building2,
  Mail,
  Phone,
  Calendar,
  CheckCircle2,
  Shield,
  Edit3,
  Archive,
  X,
  ChevronRight,
  UploadCloud,
  FileSpreadsheet,
  AlertTriangle,
  FolderPlus,
  Sparkles,
  Check,
  FileText,
  MapPin,
} from 'lucide-react';
import { useHris } from '../../context/HrisContext';
import { Employee, Department } from '../../types/hris';
import { formatDateIndo } from '../../utils/rules';
import {
  generateEmployeeCsvTemplate,
  parseCsvString,
  validateEmployeeBatch,
  generateSyntheticBatch,
  ParsedEmployeeRow,
} from '../../utils/bulkImport';

export const EmployeeDirectoryView: React.FC = () => {
  const {
    employees,
    departments,
    branches,
    addEmployee,
    updateEmployee,
    toggleEmployeeStatus,
    addDepartment,
    bulkImportEmployees,
    currentUser,
    setActiveTab,
  } = useHris();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBranch, setSelectedBranch] = useState('ALL');
  const [selectedDepartment, setSelectedDepartment] = useState('ALL');
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeptModal, setShowDeptModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);

  // Department Modal State
  const [newDeptName, setNewDeptName] = useState('');
  const [newDeptCode, setNewDeptCode] = useState('');
  const [deptFeedback, setDeptFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Bulk Import Modal State
  const [bulkMode, setBulkMode] = useState<'upload' | 'simulate'>('simulate');
  const [pastedCsv, setPastedCsv] = useState('');
  const [stagedRows, setStagedRows] = useState<ParsedEmployeeRow[]>([]);
  const [bulkErrors, setBulkErrors] = useState<{ rowNumber: number; reason: string }[]>([]);
  const [bulkFeedback, setBulkFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [isImporting, setIsImporting] = useState(false);

  // Single Add Employee Form State
  const [newFullName, setNewFullName] = useState('');
  const [newNik, setNewNik] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('0812-3456-7890');
  const [newDept, setNewDept] = useState(departments[0]?.name || 'Retail Store Operations');
  const [newPos, setNewPos] = useState('Retail Associate');
  const [newBranch, setNewBranch] = useState(branches[1]?.name || 'Niceso Ciputat');
  const [newEmploymentType, setNewEmploymentType] = useState<'PKWT' | 'PKWTT'>('PKWT');

  // Filter employees
  const filteredEmployees = employees.filter((emp) => {
    const matchesSearch =
      emp.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.nik.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.position.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesBranch =
      selectedBranch === 'ALL' || emp.branch === selectedBranch;

    const matchesDept =
      selectedDepartment === 'ALL' || emp.department === selectedDepartment;

    return matchesSearch && matchesBranch && matchesDept;
  });

  const handleCreateEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFullName.trim()) return;

    addEmployee({
      fullName: newFullName,
      nik: newNik || `NC-${Math.floor(1000 + Math.random() * 9000)}`,
      email: newEmail || `${newFullName.toLowerCase().replace(/\s+/g, '.')}@niceso.co.id`,
      phone: newPhone,
      department: newDept,
      position: newPos,
      branch: newBranch,
      employmentType: newEmploymentType,
      hireDate: '2026-10-27',
    });

    setShowAddModal(false);
    setNewFullName('');
    setNewNik('');
    setNewEmail('');
  };

  const handleCreateDepartment = (e: React.FormEvent) => {
    e.preventDefault();
    setDeptFeedback(null);

    const res = addDepartment({
      name: newDeptName,
      code: newDeptCode,
    });

    setDeptFeedback({
      type: res.success ? 'success' : 'error',
      message: res.message,
    });

    if (res.success) {
      setNewDeptName('');
      setNewDeptCode('');
    }
  };

  const handleDownloadTemplate = () => {
    const templateContent = generateEmployeeCsvTemplate();
    const encodedUri = encodeURI('data:text/csv;charset=utf-8,' + templateContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'template_import_karyawan_niceso.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setPastedCsv(text);
      processCsvContent(text);
    };
    reader.readAsText(file);
  };

  const processCsvContent = (csvText: string) => {
    setBulkFeedback(null);
    const rawRecords = parseCsvString(csvText);
    const existingNiks = new Set(employees.map((e) => e.nik));
    const availableDeptNames = departments.map((d) => d.name);
    const availableBranchNames = branches.map((b) => b.name);

    const validation = validateEmployeeBatch(
      rawRecords,
      existingNiks,
      availableDeptNames,
      availableBranchNames
    );

    setStagedRows(validation.validRows);
    setBulkErrors(validation.errorRows);

    if (validation.validRows.length === 0 && rawRecords.length > 0) {
      setBulkFeedback({
        type: 'error',
        message: 'Tidak ada data valid yang dapat diproses. Periksa format kolom CSV Anda.',
      });
    } else if (validation.errorRows.length > 0) {
      setBulkFeedback({
        type: 'error',
        message: `Terbaca ${validation.validRows.length} data valid dan ${validation.errorRows.length} baris tidak valid/duplikat.`,
      });
    } else {
      setBulkFeedback({
        type: 'success',
        message: `Semua ${validation.validRows.length} baris data CSV valid dan siap diimpor.`,
      });
    }
  };

  const handleSimulateSyntheticBatch = (count: number) => {
    setBulkFeedback(null);
    const maxNikNumber = Math.max(
      1000,
      ...employees
        .map((e) => parseInt(e.nik.replace(/\D/g, ''), 10))
        .filter((n) => !isNaN(n))
    );

    const generated = generateSyntheticBatch(
      count,
      maxNikNumber + 1,
      departments.map((d) => d.name),
      branches.map((b) => b.name)
    );

    setStagedRows(generated);
    setBulkErrors([]);
    setBulkFeedback({
      type: 'success',
      message: `Berhasil men-generate simulasi ${count} data staf ritel toko baru siap impor!`,
    });
  };

  const handleExecuteBulkImport = () => {
    if (stagedRows.length === 0) return;
    setIsImporting(true);

    setTimeout(() => {
      const res = bulkImportEmployees(stagedRows);
      setIsImporting(false);

      if (res.success) {
        setBulkFeedback({ type: 'success', message: res.message });
        setStagedRows([]);
        setPastedCsv('');
        setTimeout(() => {
          setShowBulkModal(false);
          setBulkFeedback(null);
        }, 1500);
      } else {
        setBulkFeedback({ type: 'error', message: res.message });
      }
    }, 500);
  };

  const exportCsv = () => {
    const headers = ['ID,NIK,Nama,Departemen,Jabatan,Cabang,Tipe,Status,Sisa_Cuti'];
    const rows = employees.map((e) =>
      `"${e.id}","${e.nik}","${e.fullName}","${e.department}","${e.position}","${e.branch}","${e.employmentType}","${e.employeeStatus}","${e.remainingAnnualLeave}"`
    );
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `niceso_data_karyawan_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-4 space-y-4 max-w-2xl mx-auto pb-24">
      {/* Title & Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">
            Direktori Data Karyawan
          </h2>
          <p className="text-xs text-slate-500">
            Total <strong className="text-slate-800">{employees.length} Karyawan</strong> di {departments.length} Departemen & {branches.length} Cabang
          </p>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          {/* Departemen Button */}
          <button
            onClick={() => {
              setShowDeptModal(true);
              setDeptFeedback(null);
            }}
            title="Kelola & Tambah Departemen"
            className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
          >
            <FolderPlus className="w-3.5 h-3.5 text-rose-600" />
            <span>Departemen</span>
          </button>

          {/* Lokasi & Radius Button */}
          <button
            onClick={() => setActiveTab('locations')}
            title="Kelola Titik Lokasi Kerja & Radius GPS"
            className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
          >
            <MapPin className="w-3.5 h-3.5 text-rose-600" />
            <span>Lokasi Kerja</span>
          </button>

          {/* Bulk Import Button */}
          <button
            onClick={() => {
              setShowBulkModal(true);
              setBulkFeedback(null);
            }}
            title="Import Ratusan/Ribuan User via CSV"
            className="px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors"
          >
            <UploadCloud className="w-3.5 h-3.5 text-blue-600" />
            <span>Import Massal</span>
          </button>

          {/* Export CSV */}
          <button
            onClick={exportCsv}
            title="Ekspor CSV"
            className="p-1.5 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 text-xs font-semibold flex items-center gap-1"
          >
            <Download className="w-3.5 h-3.5" />
          </button>

          {/* Add Single Employee */}
          <button
            onClick={() => setShowAddModal(true)}
            className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 transition-colors shadow-xs"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Tambah</span>
          </button>
        </div>
      </div>

      {/* Search & Dynamic Filter Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-3 shadow-xs space-y-2">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nama karyawan, NIK, atau jabatan..."
            className="w-full text-xs pl-9 pr-3 py-2 border rounded-lg focus:outline-hidden focus:border-rose-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <select
            value={selectedBranch}
            onChange={(e) => setSelectedBranch(e.target.value)}
            className="p-2 border rounded-lg bg-white"
          >
            <option value="ALL">Semua Cabang Toko ({branches.length})</option>
            {branches.map((b) => (
              <option key={b.id} value={b.name}>
                {b.name}
              </option>
            ))}
          </select>

          {/* Dynamically populated from departments state */}
          <select
            value={selectedDepartment}
            onChange={(e) => setSelectedDepartment(e.target.value)}
            className="p-2 border rounded-lg bg-white"
          >
            <option value="ALL">Semua Departemen ({departments.length})</option>
            {departments.map((d) => (
              <option key={d.id} value={d.name}>
                {d.name} ({d.code})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Employee List */}
      <div className="space-y-2.5">
        {filteredEmployees.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-xl border border-slate-200 text-slate-400 text-xs">
            Tidak ada data karyawan yang cocok dengan filter pencarian.
          </div>
        ) : (
          filteredEmployees.map((emp) => (
            <div
              key={emp.id}
              onClick={() => setSelectedEmployee(emp)}
              className="bg-white rounded-xl border border-slate-200 p-3 hover:border-slate-300 transition-colors cursor-pointer shadow-xs flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3 min-w-0">
                <img
                  src={emp.avatarUrl}
                  alt={emp.fullName}
                  className="w-10 h-10 rounded-full object-cover border border-slate-200 shrink-0"
                />
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-bold text-slate-900 truncate">
                      {emp.fullName}
                    </h4>
                    <span
                      className={`text-[9px] px-1.5 py-0.2 rounded font-semibold ${
                        emp.employeeStatus === 'Aktif'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {emp.employeeStatus}
                    </span>
                  </div>
                  <p className="text-[11px] text-rose-600 font-semibold truncate">
                    {emp.position} · <span className="text-slate-500 font-normal">{emp.department}</span>
                  </p>
                  <p className="text-[10px] text-slate-400 font-mono">
                    NIK: {emp.nik} · {emp.branch}
                  </p>
                </div>
              </div>

              <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
            </div>
          ))
        )}
      </div>

      {/* MODAL 1: KELOLA DEPARTEMEN */}
      {showDeptModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-5 shadow-xl relative animate-in fade-in max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowDeptModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 border-b border-slate-100 pb-2 mb-3">
              <Building2 className="w-5 h-5 text-rose-600" />
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Manajemen Departemen Niceso
                </h3>
                <p className="text-[11px] text-slate-500">
                  Kelola dan tambah struktur departemen baru ke seluruh sistem
                </p>
              </div>
            </div>

            {deptFeedback && (
              <div
                className={`p-2.5 rounded-lg text-xs mb-3 flex items-center gap-2 ${
                  deptFeedback.type === 'success'
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-rose-50 text-rose-800 border border-rose-200'
                }`}
              >
                {deptFeedback.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                )}
                <span>{deptFeedback.message}</span>
              </div>
            )}

            {/* Existing Departments List */}
            <div className="mb-4">
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Departemen Aktif Saat Ini ({departments.length})
              </label>
              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {departments.map((dept) => (
                  <div
                    key={dept.id}
                    className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-bold text-slate-800">{dept.name}</span>
                      <span className="ml-2 font-mono text-[10px] text-slate-500 bg-white px-1.5 py-0.5 rounded border">
                        {dept.code}
                      </span>
                    </div>
                    <span className="text-[10px] bg-slate-200/80 text-slate-700 font-semibold px-2 py-0.5 rounded-full">
                      {employees.filter((e) => e.department === dept.name).length} Staf
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Add New Department Form */}
            <form onSubmit={handleCreateDepartment} className="border-t border-slate-100 pt-3 space-y-3">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Tambah Departemen Baru
              </h4>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Nama Departemen *
                </label>
                <input
                  type="text"
                  value={newDeptName}
                  onChange={(e) => setNewDeptName(e.target.value)}
                  placeholder="Contoh: Digital Marketing & E-Commerce, Legal & Compliance..."
                  className="w-full text-xs p-2 border rounded-lg focus:outline-hidden focus:border-rose-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Kode Singkatan Departemen *
                </label>
                <input
                  type="text"
                  value={newDeptCode}
                  onChange={(e) => setNewDeptCode(e.target.value)}
                  placeholder="Contoh: ECM, LGL, QC, MKT..."
                  className="w-full text-xs p-2 border rounded-lg focus:outline-hidden focus:border-rose-500 uppercase"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold transition-colors shadow-xs"
              >
                Simpan & Aktifkan Departemen
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: IMPORT MASSAL RATUSAN/RIBUAN USER (BULK IMPORT) */}
      {showBulkModal && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-3 sm:p-5">
          <div className="bg-white rounded-2xl max-w-xl w-full p-5 shadow-2xl relative animate-in fade-in max-h-[92vh] flex flex-col">
            <button
              onClick={() => {
                setShowBulkModal(false);
                setStagedRows([]);
                setBulkFeedback(null);
              }}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3 shrink-0">
              <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <UploadCloud className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Import Massal Akun Karyawan (Bulk Onboarding)
                </h3>
                <p className="text-[11px] text-slate-500">
                  Mendukung penambahan ratusan hingga ribuan user secara instan via CSV atau Batch Generator
                </p>
              </div>
            </div>

            {/* Mode Selector */}
            <div className="grid grid-cols-2 gap-1 bg-slate-100 p-1 rounded-lg my-3 shrink-0 text-xs">
              <button
                onClick={() => setBulkMode('simulate')}
                className={`py-1.5 font-bold rounded-md transition-colors flex items-center justify-center gap-1.5 ${
                  bulkMode === 'simulate'
                    ? 'bg-white text-blue-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                <span>Simulasi Cepat (150-300 Staf)</span>
              </button>

              <button
                onClick={() => setBulkMode('upload')}
                className={`py-1.5 font-bold rounded-md transition-colors flex items-center justify-center gap-1.5 ${
                  bulkMode === 'upload'
                    ? 'bg-white text-blue-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-blue-600" />
                <span>Unggah File CSV Resmi</span>
              </button>
            </div>

            {/* Feedback alert */}
            {bulkFeedback && (
              <div
                className={`p-2.5 rounded-lg text-xs mb-3 shrink-0 flex items-center gap-2 ${
                  bulkFeedback.type === 'success'
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-rose-50 text-rose-800 border border-rose-200'
                }`}
              >
                {bulkFeedback.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                )}
                <span>{bulkFeedback.message}</span>
              </div>
            )}

            {/* Body per Mode */}
            <div className="overflow-y-auto flex-1 space-y-3 pr-1 text-xs">
              {bulkMode === 'simulate' ? (
                <div className="space-y-3">
                  <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl">
                    <p className="font-bold text-blue-900 mb-1">
                      Uji Kecepatan Import Massal:
                    </p>
                    <p className="text-slate-600 leading-relaxed text-[11px]">
                      Fitur ini men-generate data karyawan ritel baru (NIK berurutan, nama Indonesia, email <code>@niceso.co.id</code>, nomor handphone, penempatan toko, dan hak akses) untuk menguji performa sistem saat memproses ratusan user sekaligus.
                    </p>
                    <div className="mt-3 flex items-center gap-2 flex-wrap">
                      <button
                        type="button"
                        onClick={() => handleSimulateSyntheticBatch(50)}
                        className="px-3 py-1.5 bg-white border border-blue-300 hover:bg-blue-100 text-blue-700 font-bold rounded-lg text-xs"
                      >
                        + 50 Karyawan Toko
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSimulateSyntheticBatch(150)}
                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs shadow-xs"
                      >
                        + 150 Karyawan (Batch Cabang Baru)
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSimulateSyntheticBatch(300)}
                        className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg text-xs"
                      >
                        + 300 Karyawan (Nasional)
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-slate-50 border rounded-xl">
                    <div>
                      <p className="font-bold text-slate-800">1. Unduh Template Standar CSV</p>
                      <p className="text-[11px] text-slate-500">
                        Format kolom: NIK, Nama, Email, Telepon, Departemen, Jabatan, Cabang, Tipe, Tanggal
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleDownloadTemplate}
                      className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg font-semibold flex items-center gap-1"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download .CSV</span>
                    </button>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-800 mb-1">
                      2. Pilih File CSV atau Tempel Teks CSV
                    </label>
                    <input
                      type="file"
                      accept=".csv,text/csv"
                      onChange={handleFileUpload}
                      className="block w-full text-xs text-slate-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 mb-2"
                    />

                    <textarea
                      rows={4}
                      value={pastedCsv}
                      onChange={(e) => {
                        setPastedCsv(e.target.value);
                        processCsvContent(e.target.value);
                      }}
                      placeholder="Atau paste isi baris CSV Anda di sini..."
                      className="w-full p-2 border rounded-lg font-mono text-[10px]"
                    />
                  </div>
                </div>
              )}

              {/* Preview Staged Rows */}
              {stagedRows.length > 0 && (
                <div className="border border-slate-200 rounded-xl p-3 bg-slate-50">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-slate-800">
                      Pratinjau Data ({stagedRows.length} Calon User Valid)
                    </span>
                    <span className="text-[10px] text-emerald-700 bg-emerald-100 font-bold px-2 py-0.5 rounded-full">
                      Valid & Terverifikasi
                    </span>
                  </div>

                  <div className="max-h-40 overflow-y-auto border rounded-lg bg-white">
                    <table className="w-full text-left text-[11px]">
                      <thead className="bg-slate-100 border-b font-bold sticky top-0 text-[10px]">
                        <tr>
                          <th className="p-1.5 border-r">NIK</th>
                          <th className="p-1.5 border-r">Nama</th>
                          <th className="p-1.5 border-r">Departemen</th>
                          <th className="p-1.5 border-r">Jabatan</th>
                          <th className="p-1.5">Cabang</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {stagedRows.slice(0, 10).map((row, idx) => (
                          <tr key={idx} className="hover:bg-slate-50">
                            <td className="p-1.5 border-r font-mono font-bold text-slate-800">{row.nik}</td>
                            <td className="p-1.5 border-r">{row.fullName}</td>
                            <td className="p-1.5 border-r">{row.department}</td>
                            <td className="p-1.5 border-r">{row.position}</td>
                            <td className="p-1.5">{row.branch}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {stagedRows.length > 10 && (
                    <p className="text-[10px] text-slate-400 text-center mt-1">
                      Menampilkan 10 dari total {stagedRows.length} baris data yang siap diimpor.
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between shrink-0">
              <span className="text-[11px] text-slate-500">
                {stagedRows.length > 0
                  ? `${stagedRows.length} akun siap ditambahkan ke database.`
                  : 'Pilih simulasi atau unggah file untuk memulai.'}
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowBulkModal(false)}
                  className="px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleExecuteBulkImport}
                  disabled={stagedRows.length === 0 || isImporting}
                  className={`px-4 py-2 rounded-lg text-xs font-bold text-white shadow-xs transition-all flex items-center gap-1.5 ${
                    stagedRows.length > 0 && !isImporting
                      ? 'bg-blue-600 hover:bg-blue-700 active:scale-95'
                      : 'bg-slate-300 cursor-not-allowed'
                  }`}
                >
                  <Check className="w-4 h-4" />
                  <span>
                    {isImporting
                      ? 'Sedang Memproses...'
                      : `Eksekusi Import ${stagedRows.length} User`}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: TAMBAH SATU KARYAWAN MANUAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-5 shadow-xl relative animate-in fade-in max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2 mb-3">
              Formulir Tambah Karyawan Baru
            </h3>

            <form onSubmit={handleCreateEmployee} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Nama Lengkap Karyawan *
                </label>
                <input
                  type="text"
                  value={newFullName}
                  onChange={(e) => setNewFullName(e.target.value)}
                  placeholder="Contoh: Muhammad Ilham"
                  className="w-full p-2 border rounded-lg"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    NIK Karyawan
                  </label>
                  <input
                    type="text"
                    value={newNik}
                    onChange={(e) => setNewNik(e.target.value)}
                    placeholder="Contoh: NC-0045"
                    className="w-full p-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Tipe Kontrak
                  </label>
                  <select
                    value={newEmploymentType}
                    onChange={(e) => setNewEmploymentType(e.target.value as any)}
                    className="w-full p-2 border rounded-lg bg-white"
                  >
                    <option value="PKWT">PKWT (Kontrak)</option>
                    <option value="PKWTT">PKWTT (Tetap)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Departemen Penempatan
                </label>
                <select
                  value={newDept}
                  onChange={(e) => setNewDept(e.target.value)}
                  className="w-full p-2 border rounded-lg bg-white"
                >
                  {departments.map((d) => (
                    <option key={d.id} value={d.name}>
                      {d.name} ({d.code})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Jabatan
                  </label>
                  <input
                    type="text"
                    value={newPos}
                    onChange={(e) => setNewPos(e.target.value)}
                    placeholder="Kasir / Retail Associate"
                    className="w-full p-2 border rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Penempatan Cabang
                  </label>
                  <select
                    value={newBranch}
                    onChange={(e) => setNewBranch(e.target.value)}
                    className="w-full p-2 border rounded-lg bg-white"
                  >
                    {branches.map((b) => (
                      <option key={b.id} value={b.name}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-bold"
                >
                  Simpan Karyawan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DETAIL MODAL: Employee Detail */}
      {selectedEmployee && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-5 shadow-xl relative animate-in fade-in max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedEmployee(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
              <img
                src={selectedEmployee.avatarUrl}
                alt={selectedEmployee.fullName}
                className="w-14 h-14 rounded-xl object-cover border"
              />
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  {selectedEmployee.fullName}
                </h3>
                <p className="text-xs font-bold text-rose-600">{selectedEmployee.position}</p>
                <p className="text-xs text-slate-500 font-mono">NIK: {selectedEmployee.nik}</p>
              </div>
            </div>

            <div className="py-3 space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Cabang Penempatan:</span>
                <span className="font-semibold text-slate-800">{selectedEmployee.branch}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Departemen:</span>
                <span className="text-slate-800">{selectedEmployee.department}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Email Perusahaan:</span>
                <span className="text-slate-800">{selectedEmployee.email}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Nomor Telepon:</span>
                <span className="text-slate-800">{selectedEmployee.phone}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Tanggal Mulai Bekerja:</span>
                <span className="text-slate-800">{formatDateIndo(selectedEmployee.hireDate)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Status Hubungan Kerja:</span>
                <span className="font-semibold text-slate-800">{selectedEmployee.employmentType}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Sisa Cuti Tahunan:</span>
                <span className="font-bold text-rose-600">{selectedEmployee.remainingAnnualLeave} Hari</span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  toggleEmployeeStatus(selectedEmployee.id);
                  setSelectedEmployee((prev) =>
                    prev
                      ? {
                          ...prev,
                          employeeStatus: prev.employeeStatus === 'Aktif' ? 'Nonaktif' : 'Aktif',
                        }
                      : null
                  );
                }}
                className={`px-3 py-2 rounded-lg text-xs font-semibold ${
                  selectedEmployee.employeeStatus === 'Aktif'
                    ? 'border border-rose-300 text-rose-700 hover:bg-rose-50'
                    : 'bg-emerald-600 text-white hover:bg-emerald-700'
                }`}
              >
                {selectedEmployee.employeeStatus === 'Aktif'
                  ? 'Nonaktifkan Akun (Arsip)'
                  : 'Aktifkan Kembali'}
              </button>

              <button
                type="button"
                onClick={() => setSelectedEmployee(null)}
                className="px-4 py-2 bg-slate-800 text-white rounded-lg text-xs font-semibold hover:bg-slate-900"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

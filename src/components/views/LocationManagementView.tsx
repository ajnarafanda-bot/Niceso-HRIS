import React, { useState } from 'react';
import {
  MapPin,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Building2,
  Warehouse,
  Store,
  Compass,
  Edit3,
  Trash2,
  ShieldAlert,
  ArrowRight,
  Sliders,
  Copy,
  Check,
  Navigation,
  Info,
  Layers,
  Sparkles,
  ChevronRight,
  X,
  AlertTriangle,
} from 'lucide-react';
import { useHris } from '../../context/HrisContext';
import { Branch, LocationType } from '../../types/hris';
import { InteractiveGeofenceMap } from '../common/InteractiveGeofenceMap';

export const LocationManagementView: React.FC = () => {
  const {
    currentUser,
    branches,
    employees,
    addBranch,
    updateBranch,
    toggleBranchStatus,
    deleteBranch,
    setActiveBranch,
    setActiveTab,
  } = useHris();

  const isAuthorized =
    currentUser.role === 'SUPER_ADMIN' || currentUser.role === 'HR_ADMIN';

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  // Modal / Form state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);

  // Form fields
  const [formName, setFormName] = useState('');
  const [formCode, setFormCode] = useState('');
  const [formType, setFormType] = useState<LocationType>('TOKO_RETAIL');
  const [formAddress, setFormAddress] = useState('');
  const [formCity, setFormCity] = useState('Jakarta');
  const [formLat, setFormLat] = useState<number>(-6.2297);
  const [formLng, setFormLng] = useState<number>(106.8295);
  const [formRadius, setFormRadius] = useState<number>(80);
  const [formIsActive, setFormIsActive] = useState<boolean>(true);
  const [formDescription, setFormDescription] = useState('');
  const [formTimezone, setFormTimezone] = useState<'Asia/Jakarta' | 'Asia/Makassar' | 'Asia/Jayapura'>('Asia/Jakarta');

  const [formFeedback, setFormFeedback] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Quick preview modal on map
  const [previewBranch, setPreviewBranch] = useState<Branch | null>(null);

  // Access Control Guard
  if (!isAuthorized) {
    return (
      <div className="p-6 max-w-lg mx-auto text-center space-y-4 my-12">
        <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto shadow-sm">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-lg font-bold text-slate-800">
          Akses Terbatas: Khusus HR & Super Admin
        </h2>
        <p className="text-xs text-slate-600 leading-relaxed">
          Modul <strong>Pengaturan Titik Lokasi & Radius Absensi GPS</strong> hanya
          dapat diakses oleh Super Admin dan HR Admin untuk menjamin integritas
          dan kepatuhan kehadiran perusahaan Niceso.
        </p>
        <div className="pt-2">
          <button
            onClick={() => setActiveTab('beranda')}
            className="px-4 py-2 bg-slate-800 text-white rounded-lg text-xs font-semibold hover:bg-slate-700 transition-colors"
          >
            Kembali ke Beranda
          </button>
        </div>
      </div>
    );
  }

  // Filtered branches
  const filteredBranches = branches.filter((branch) => {
    const matchesSearch =
      branch.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      branch.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      branch.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      branch.city.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType =
      filterType === 'ALL' || branch.type === filterType;

    const matchesStatus =
      filterStatus === 'ALL' ||
      (filterStatus === 'ACTIVE' && branch.isActive) ||
      (filterStatus === 'INACTIVE' && !branch.isActive);

    return matchesSearch && matchesType && matchesStatus;
  });

  // Location type counts
  const totalLocations = branches.length;
  const activeLocations = branches.filter((b) => b.isActive).length;
  const storeCount = branches.filter((b) => b.type === 'TOKO_RETAIL').length;
  const warehouseCount = branches.filter(
    (b) => b.type === 'GUDANG_LOGISTIK' || b.type === 'DISTRIBUTION_CENTER'
  ).length;

  const openCreateModal = () => {
    setEditingBranch(null);
    setFormName('');
    setFormCode(`NCS-TK-${Math.floor(100 + Math.random() * 900)}`);
    setFormType('TOKO_RETAIL');
    setFormAddress('');
    setFormCity('Jakarta');
    setFormLat(-6.2297);
    setFormLng(106.8295);
    setFormRadius(80);
    setFormIsActive(true);
    setFormDescription('');
    setFormTimezone('Asia/Jakarta');
    setFormFeedback(null);
    setIsFormOpen(true);
  };

  const openEditModal = (branch: Branch) => {
    setEditingBranch(branch);
    setFormName(branch.name);
    setFormCode(branch.code);
    setFormType(branch.type || 'TOKO_RETAIL');
    setFormAddress(branch.address);
    setFormCity(branch.city);
    setFormLat(branch.latitude);
    setFormLng(branch.longitude);
    setFormRadius(branch.radiusMeters);
    setFormIsActive(branch.isActive);
    setFormDescription(branch.description || '');
    setFormTimezone(branch.timezone || 'Asia/Jakarta');
    setFormFeedback(null);
    setIsFormOpen(true);
  };

  const handleCoordinatesChangeFromMap = (lat: number, lng: number) => {
    setFormLat(lat);
    setFormLng(lng);
  };

  const handleAddressSelectFromMap = (addr: string, city: string) => {
    setFormAddress(addr);
    if (city) setFormCity(city);
  };

  const handleUseCurrentGps = () => {
    if (!navigator.geolocation) {
      setFormFeedback({
        type: 'error',
        message: 'Geolocation browser tidak didukung di perangkat ini.',
      });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = Number(pos.coords.latitude.toFixed(6));
        const lng = Number(pos.coords.longitude.toFixed(6));
        setFormLat(lat);
        setFormLng(lng);
        setFormFeedback({
          type: 'success',
          message: `Titik GPS berhasil disesuaikan dengan posisi GPS Anda (${lat}, ${lng}) dengan akurasi ${Math.round(pos.coords.accuracy)}m.`,
        });
      },
      (err) => {
        setFormFeedback({
          type: 'error',
          message: `Gagal membaca GPS: ${err.message}. Harap izinkan akses lokasi di browser Anda.`,
        });
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  const handleSaveLocation = (e: React.FormEvent) => {
    e.preventDefault();
    setFormFeedback(null);

    if (editingBranch) {
      // Update
      const res = updateBranch(editingBranch.id, {
        name: formName,
        code: formCode,
        type: formType,
        address: formAddress,
        city: formCity,
        latitude: formLat,
        longitude: formLng,
        radiusMeters: formRadius,
        isActive: formIsActive,
        description: formDescription,
        timezone: formTimezone,
      });

      setFormFeedback({
        type: res.success ? 'success' : 'error',
        message: res.message,
      });

      if (res.success) {
        setTimeout(() => setIsFormOpen(false), 900);
      }
    } else {
      // Create
      const res = addBranch({
        name: formName,
        code: formCode,
        type: formType,
        address: formAddress,
        city: formCity,
        latitude: formLat,
        longitude: formLng,
        radiusMeters: formRadius,
        isActive: formIsActive,
        description: formDescription,
        timezone: formTimezone,
      });

      setFormFeedback({
        type: res.success ? 'success' : 'error',
        message: res.message,
      });

      if (res.success) {
        setTimeout(() => setIsFormOpen(false), 900);
      }
    }
  };

  const handleCopyCoords = (branch: Branch) => {
    navigator.clipboard?.writeText(`${branch.latitude}, ${branch.longitude}`);
    setCopiedId(branch.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getTypeBadge = (type?: LocationType) => {
    switch (type) {
      case 'KANTOR_PUSAT':
        return (
          <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-800">
            <Building2 className="w-3 h-3" /> Kantor Pusat
          </span>
        );
      case 'GUDANG_LOGISTIK':
      case 'DISTRIBUTION_CENTER':
        return (
          <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
            <Warehouse className="w-3 h-3" /> Gudang / DC
          </span>
        );
      case 'TOKO_RETAIL':
      default:
        return (
          <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
            <Store className="w-3 h-3" /> Toko Retail
          </span>
        );
    }
  };

  return (
    <div className="p-4 space-y-4 max-w-4xl mx-auto pb-24">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 shrink-0">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold text-slate-800 tracking-tight">
                  Pengaturan Titik Lokasi & Radius GPS
                </h1>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-100 text-rose-700">
                  HR & Admin
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Kelola titik koordinat GPS pusat kerja, radius batas toleransi (meter),
                dan status aktif gerai toko, gudang, maupun kantor pusat Niceso.
              </p>
            </div>
          </div>

          <button
            onClick={openCreateModal}
            className="px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-xs shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Lokasi Kerja</span>
          </button>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-4 gap-2 mt-4 pt-3 border-t border-slate-100 text-center">
          <div className="p-2 bg-slate-50 rounded-lg">
            <p className="text-base font-bold text-slate-800">{totalLocations}</p>
            <p className="text-[10px] text-slate-500">Total Lokasi</p>
          </div>
          <div className="p-2 bg-emerald-50 rounded-lg">
            <p className="text-base font-bold text-emerald-700">{activeLocations}</p>
            <p className="text-[10px] text-emerald-800">Status Aktif</p>
          </div>
          <div className="p-2 bg-rose-50 rounded-lg">
            <p className="text-base font-bold text-rose-700">{storeCount}</p>
            <p className="text-[10px] text-rose-800">Toko Retail</p>
          </div>
          <div className="p-2 bg-blue-50 rounded-lg">
            <p className="text-base font-bold text-blue-700">{warehouseCount}</p>
            <p className="text-[10px] text-blue-800">Gudang / DC</p>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-3 shadow-xs space-y-2.5">
        <div className="flex flex-col sm:flex-row gap-2">
          {/* Search Input */}
          <div className="relative flex-1">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama lokasi, kode gerai, alamat, atau kota..."
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-rose-600 focus:bg-white"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          </div>

          {/* Type Filter */}
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-rose-600"
          >
            <option value="ALL">Semua Tipe Lokasi</option>
            <option value="TOKO_RETAIL">Toko Retail Niceso</option>
            <option value="DISTRIBUTION_CENTER">Gudang & Hub Logistik (DC)</option>
            <option value="KANTOR_PUSAT">Kantor Pusat (Head Office)</option>
          </select>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-rose-600"
          >
            <option value="ALL">Semua Status</option>
            <option value="ACTIVE">Hanya Aktif</option>
            <option value="INACTIVE">Hanya Nonaktif</option>
          </select>
        </div>
      </div>

      {/* Location Cards List */}
      <div className="space-y-3">
        {filteredBranches.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-slate-500">
            <MapPin className="w-8 h-8 mx-auto text-slate-300 mb-2" />
            <p className="text-xs font-semibold text-slate-700">
              Tidak ada lokasi kerja yang sesuai dengan filter pencarian.
            </p>
            <p className="text-[11px] text-slate-400 mt-1">
              Coba ubah kata kunci atau tambah lokasi baru melalui tombol di atas.
            </p>
          </div>
        ) : (
          filteredBranches.map((branch) => {
            const assignedEmployeesCount = employees.filter(
              (e) => e.branchId === branch.id || e.branch === branch.name
            ).length;

            return (
              <div
                key={branch.id}
                className={`bg-white rounded-xl border transition-all shadow-xs p-4 ${
                  branch.isActive
                    ? 'border-slate-200 hover:border-slate-300'
                    : 'border-slate-200 bg-slate-50/70 opacity-80'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  {/* Left Info */}
                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-bold px-2 py-0.5 bg-slate-100 rounded text-slate-700">
                        {branch.code}
                      </span>
                      <h3 className="text-sm font-bold text-slate-900">
                        {branch.name}
                      </h3>
                      {getTypeBadge(branch.type)}
                      {branch.isActive ? (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                          <CheckCircle2 className="w-2.5 h-2.5" /> Aktif
                        </span>
                      ) : (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 border border-slate-300 flex items-center gap-1">
                          <XCircle className="w-2.5 h-2.5" /> Nonaktif
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-600 leading-snug">
                      {branch.address}, <span className="font-medium">{branch.city}</span>
                    </p>

                    {branch.description && (
                      <p className="text-[11px] text-slate-400 italic">
                        {branch.description}
                      </p>
                    )}

                    {/* Geofence Parameters HUD */}
                    <div className="flex flex-wrap items-center gap-3 pt-2 text-xs text-slate-600">
                      <div className="flex items-center gap-1 px-2.5 py-1 bg-rose-50 border border-rose-100 rounded-md text-rose-800 font-semibold">
                        <Compass className="w-3.5 h-3.5 text-rose-600" />
                        <span>Radius Geofence: {branch.radiusMeters} meter</span>
                      </div>

                      <div className="flex items-center gap-1 px-2.5 py-1 bg-slate-100 rounded-md text-slate-700 font-mono text-[11px]">
                        <span>
                          {branch.latitude.toFixed(6)}, {branch.longitude.toFixed(6)}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopyCoords(branch)}
                          title="Salin Koordinat GPS"
                          className="p-0.5 hover:text-slate-900 transition-colors ml-1"
                        >
                          {copiedId === branch.id ? (
                            <Check className="w-3 h-3 text-emerald-600" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                      </div>

                      <div className="text-[11px] text-slate-500">
                        Bertugas: <strong>{assignedEmployeesCount}</strong> karyawan
                      </div>
                    </div>
                  </div>

                  {/* Actions Column */}
                  <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                    <div className="flex items-center gap-1.5">
                      {/* Preview Button */}
                      <button
                        type="button"
                        onClick={() => setPreviewBranch(branch)}
                        className="px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg flex items-center gap-1 transition-colors"
                      >
                        <Layers className="w-3.5 h-3.5 text-slate-600" />
                        <span>Peta</span>
                      </button>

                      {/* Edit Button */}
                      <button
                        type="button"
                        onClick={() => openEditModal(branch)}
                        className="px-2.5 py-1.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg flex items-center gap-1 transition-colors shadow-xs"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </button>
                    </div>

                    {/* Status Toggle Switch */}
                    <div className="flex items-center gap-2">
                      <label className="text-[11px] text-slate-500 font-medium cursor-pointer">
                        {branch.isActive ? 'Nonaktifkan' : 'Aktifkan'}
                      </label>
                      <button
                        type="button"
                        onClick={() => toggleBranchStatus(branch.id)}
                        role="switch"
                        aria-checked={branch.isActive}
                        className={`w-9 h-5 flex items-center rounded-full p-0.5 transition-colors ${
                          branch.isActive ? 'bg-emerald-600' : 'bg-slate-300'
                        }`}
                      >
                        <div
                          className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                            branch.isActive ? 'translate-x-4' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Create / Edit Work Location Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-4 sm:p-6 shadow-2xl relative my-auto animate-in fade-in max-h-[92vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-rose-100 flex items-center justify-center text-rose-600">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-800">
                    {editingBranch ? 'Edit Titik Lokasi & Radius' : 'Tambah Lokasi Kerja Niceso'}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Tentukan titik koordinat dan luas radius kehadiran GPS toko/kantor
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-md"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Form Body */}
            <form onSubmit={handleSaveLocation} className="flex-1 overflow-y-auto py-3 space-y-4">
              {formFeedback && (
                <div
                  className={`p-3 rounded-lg text-xs flex items-center gap-2 ${
                    formFeedback.type === 'success'
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : 'bg-rose-50 text-rose-800 border border-rose-200'
                  }`}
                >
                  {formFeedback.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                  )}
                  <span>{formFeedback.message}</span>
                </div>
              )}

              {/* Basic Fields Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Nama Lokasi Kerja *
                  </label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="Contoh: Niceso Cabang Bintaro Xchange"
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus:outline-rose-600"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Kode Lokasi / Gerai *
                  </label>
                  <input
                    type="text"
                    required
                    value={formCode}
                    onChange={(e) => setFormCode(e.target.value.toUpperCase())}
                    placeholder="Contoh: NCS-BX"
                    className="w-full px-3 py-2 text-xs font-mono uppercase bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus:outline-rose-600"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Tipe Unit Kerja
                  </label>
                  <select
                    value={formType}
                    onChange={(e) => setFormType(e.target.value as LocationType)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-rose-600"
                  >
                    <option value="TOKO_RETAIL">Toko Retail Niceso</option>
                    <option value="DISTRIBUTION_CENTER">Gudang / Distribution Center (DC)</option>
                    <option value="KANTOR_PUSAT">Kantor Pusat (Head Office)</option>
                    <option value="GUDANG_LOGISTIK">Gudang Transit</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Kota / Wilayah
                  </label>
                  <input
                    type="text"
                    value={formCity}
                    onChange={(e) => setFormCity(e.target.value)}
                    placeholder="Contoh: Tangerang Selatan, Bekasi, Depok"
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus:outline-rose-600"
                  />
                </div>
              </div>

              {/* Address Field */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Alamat Lengkap *
                </label>
                <textarea
                  rows={2}
                  required
                  value={formAddress}
                  onChange={(e) => setFormAddress(e.target.value)}
                  placeholder="Jl. Boulevard Bintaro Jaya Sektor 7 Blok B7, Tangerang Selatan"
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus:outline-rose-600"
                />
              </div>

              {/* Interactive Map & Geofence Adjustment Panel */}
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-rose-600" />
                    <span className="text-xs font-bold text-slate-800">
                      Peta Interaktif Penentuan Titik & Radius
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={handleUseCurrentGps}
                    className="px-2.5 py-1 text-[11px] font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-md border border-rose-200 flex items-center gap-1 transition-colors"
                  >
                    <Navigation className="w-3 h-3 text-rose-600" />
                    <span>Gunakan GPS Saya Saat Ini</span>
                  </button>
                </div>

                {/* Leaflet Map with OpenStreetMap */}
                <InteractiveGeofenceMap
                  latitude={formLat}
                  longitude={formLng}
                  radiusMeters={formRadius}
                  locationName={formName || 'Lokasi Baru'}
                  onCoordinatesChange={handleCoordinatesChangeFromMap}
                  onAddressSelect={handleAddressSelectFromMap}
                  interactive={true}
                  className="h-64 sm:h-72 w-full"
                />
              </div>

              {/* Radius Control Slider & Presets */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Sliders className="w-3.5 h-3.5 text-rose-600" />
                    <span>Batas Radius Absensi:</span>
                  </label>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="number"
                      min={10}
                      max={5000}
                      step={5}
                      value={formRadius}
                      onChange={(e) => setFormRadius(Math.max(10, Math.min(5000, Number(e.target.value))))}
                      className="w-20 px-2 py-1 text-center font-bold text-xs bg-white border border-slate-300 rounded text-slate-900 focus:outline-rose-600"
                    />
                    <span className="text-xs font-semibold text-slate-600">meter</span>
                  </div>
                </div>

                {/* Range Slider */}
                <input
                  type="range"
                  min={20}
                  max={500}
                  step={5}
                  value={formRadius}
                  onChange={(e) => setFormRadius(Number(e.target.value))}
                  className="w-full accent-rose-600 cursor-pointer"
                />

                {/* Preset Radius Buttons */}
                <div className="flex flex-wrap gap-1.5 text-[11px]">
                  <span className="text-slate-400 font-medium py-1 text-[10px] uppercase">Rekomendasi:</span>
                  <button
                    type="button"
                    onClick={() => setFormRadius(50)}
                    className={`px-2.5 py-1 rounded-md border text-xs font-semibold transition-colors ${
                      formRadius === 50
                        ? 'bg-rose-600 text-white border-rose-600'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    50m (Toko Minimalis)
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormRadius(80)}
                    className={`px-2.5 py-1 rounded-md border text-xs font-semibold transition-colors ${
                      formRadius === 80
                        ? 'bg-rose-600 text-white border-rose-600'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    80m (Standar Toko Ritel)
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormRadius(100)}
                    className={`px-2.5 py-1 rounded-md border text-xs font-semibold transition-colors ${
                      formRadius === 100
                        ? 'bg-rose-600 text-white border-rose-600'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    100m (Kantor Pusat)
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormRadius(250)}
                    className={`px-2.5 py-1 rounded-md border text-xs font-semibold transition-colors ${
                      formRadius === 250
                        ? 'bg-rose-600 text-white border-rose-600'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    250m (Gudang & Hub DC)
                  </button>
                </div>
              </div>

              {/* Exact Latitude & Longitude Manual Input */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Latitude
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={formLat}
                    onChange={(e) => setFormLat(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-1.5 text-xs font-mono bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-rose-600"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Longitude
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={formLng}
                    onChange={(e) => setFormLng(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-1.5 text-xs font-mono bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-rose-600"
                  />
                </div>
              </div>

              {/* Status and Description */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="formIsActive"
                  checked={formIsActive}
                  onChange={(e) => setFormIsActive(e.target.checked)}
                  className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500 accent-rose-600"
                />
                <label htmlFor="formIsActive" className="text-xs font-semibold text-slate-800 cursor-pointer">
                  Aktifkan lokasi ini untuk presensi absensi karyawan
                </label>
              </div>

              {/* Modal Action Buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition-colors shadow-xs"
                >
                  {editingBranch ? 'Simpan Perubahan Lokasi' : 'Simpan Lokasi Baru'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Quick Preview Modal on Map */}
      {previewBranch && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-5 shadow-2xl space-y-3 relative">
            <button
              onClick={() => setPreviewBranch(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 rounded-md"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold px-2 py-0.5 bg-slate-100 rounded text-slate-700">
                  {previewBranch.code}
                </span>
                <h3 className="text-base font-bold text-slate-900">
                  {previewBranch.name}
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">{previewBranch.address}</p>
            </div>

            <InteractiveGeofenceMap
              latitude={previewBranch.latitude}
              longitude={previewBranch.longitude}
              radiusMeters={previewBranch.radiusMeters}
              locationName={previewBranch.name}
              onCoordinatesChange={() => {}}
              interactive={false}
              className="h-64 w-full"
            />

            <div className="flex items-center justify-between text-xs pt-1 text-slate-600">
              <span>Radius: <strong>{previewBranch.radiusMeters} m</strong></span>
              <span>Status: <strong className={previewBranch.isActive ? 'text-emerald-700' : 'text-slate-500'}>{previewBranch.isActive ? 'Aktif' : 'Nonaktif'}</strong></span>
            </div>

            <div className="pt-2 text-right">
              <button
                onClick={() => setPreviewBranch(null)}
                className="px-4 py-1.5 bg-slate-800 text-white rounded-lg text-xs font-semibold hover:bg-slate-700"
              >
                Tutup Peta
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

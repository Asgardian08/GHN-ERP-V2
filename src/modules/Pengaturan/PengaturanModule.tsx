import React, { useState, useEffect } from 'react';
import { DatabaseSchema, FarmSettings, User, UserPermissions } from '../../types/database';
import { db } from '../../services/db';
import { formatRupiah } from '../../services/pdfGenerator';
import { 
  Settings, 
  Save, 
  ShieldCheck, 
  UserCheck, 
  RotateCcw, 
  Download, 
  Upload, 
  CheckCircle2, 
  AlertTriangle,
  Building,
  DollarSign,
  UserPlus,
  Trash2,
  Edit3,
  Key,
  Lock,
  Mail,
  Phone,
  Eye,
  EyeOff,
  X,
  Sparkles,
  Users,
  Database,
  AlertOctagon,
  RefreshCw
} from 'lucide-react';

interface PengaturanModuleProps {
  data: DatabaseSchema;
}

export const PengaturanModule: React.FC<PengaturanModuleProps> = ({ data }) => {
  const [formSettings, setFormSettings] = useState<FarmSettings>({ ...data.settings });
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sync settings when data changes
  useEffect(() => {
    setFormSettings({ ...data.settings });
  }, [data.settings]);

  // Reset Features Modals State
  const [isResetAllModalOpen, setIsResetAllModalOpen] = useState(false);
  const [isResetDemoModalOpen, setIsResetDemoModalOpen] = useState(false);
  const [openingCashInput, setOpeningCashInput] = useState<number>(0);
  const [clearCustomersCheckbox, setClearCustomersCheckbox] = useState<boolean>(false);
  const [resetFarmSettingsCheckbox, setResetFarmSettingsCheckbox] = useState<boolean>(false);

  // Staff Management State
  const [isAddStaffOpen, setIsAddStaffOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<User | null>(null);
  const [passwordModalUser, setPasswordModalUser] = useState<User | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [newPasswordConfirm, setNewPasswordConfirm] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);

  // Form states for adding/editing staff
  const [staffForm, setStaffForm] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    role: 'staff' as 'staff' | 'operator' | 'owner',
    permissions: {
      canAccessDashboard: true,
      canAccessProduksi: true,
      canAccessKasir: true,
      canAccessPreOrder: true,
      canAccessStok: true,
      canAccessPelanggan: true,
      canAccessKeuangan: false,
      canAccessLaporan: false,
      canAccessPengaturan: false,
    } as UserPermissions,
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [visiblePasswords, setVisiblePasswords] = useState<Record<string, boolean>>({});

  const isOwner = data.currentUser.role === 'owner';

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isOwner) {
      alert('Hanya Owner yang memiliki izin mengubah pengaturan identitas farm.');
      return;
    }

    db.updateSettings(formSettings);
    showToast('Pengaturan identitas farm berhasil disimpan!');
  };

  // Staff Handlers
  const handleOpenAddStaff = () => {
    setStaffForm({
      name: '',
      email: '',
      password: '',
      phone: '',
      role: 'staff',
      permissions: {
        canAccessDashboard: true,
        canAccessProduksi: true,
        canAccessKasir: true,
        canAccessPreOrder: true,
        canAccessStok: true,
        canAccessPelanggan: true,
        canAccessKeuangan: false,
        canAccessLaporan: false,
        canAccessPengaturan: false,
      },
    });
    setFormError(null);
    setIsAddStaffOpen(true);
  };

  const handleOpenEditStaff = (user: User) => {
    setEditingStaff(user);
    setStaffForm({
      name: user.name,
      email: user.email,
      password: user.password || '',
      phone: user.phone || '',
      role: user.role,
      permissions: user.permissions || {
        canAccessDashboard: true,
        canAccessProduksi: true,
        canAccessKasir: true,
        canAccessPreOrder: true,
        canAccessStok: true,
        canAccessPelanggan: true,
        canAccessKeuangan: false,
        canAccessLaporan: false,
        canAccessPengaturan: false,
      },
    });
    setFormError(null);
  };

  const handleSaveNewStaff = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!staffForm.name.trim()) {
      setFormError('Nama lengkap staff wajib diisi.');
      return;
    }
    if (!staffForm.email.trim()) {
      setFormError('Email login wajib diisi.');
      return;
    }
    if (!staffForm.password || staffForm.password.length < 4) {
      setFormError('Kata sandi minimal 4 karakter.');
      return;
    }

    const res = db.addStaff({
      name: staffForm.name,
      email: staffForm.email,
      password: staffForm.password,
      phone: staffForm.phone,
      role: staffForm.role,
      permissions: staffForm.permissions,
    });

    if (res.success) {
      setIsAddStaffOpen(false);
      showToast(`Staff baru "${staffForm.name}" berhasil ditambahkan!`);
    } else {
      setFormError(res.error || 'Gagal menambahkan staff.');
    }
  };

  const handleSaveEditStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStaff) return;
    setFormError(null);

    if (!staffForm.name.trim()) {
      setFormError('Nama lengkap staff wajib diisi.');
      return;
    }
    if (!staffForm.email.trim()) {
      setFormError('Email login wajib diisi.');
      return;
    }

    const updates: Partial<User> = {
      name: staffForm.name,
      email: staffForm.email,
      phone: staffForm.phone,
      role: staffForm.role,
      permissions: staffForm.permissions,
    };

    if (staffForm.password) {
      updates.password = staffForm.password;
    }

    const res = db.updateStaff(editingStaff.id, updates);
    if (res.success) {
      setEditingStaff(null);
      showToast(`Data staff "${staffForm.name}" berhasil diperbarui!`);
    } else {
      setFormError(res.error || 'Gagal memperbarui staff.');
    }
  };

  const handleDeleteStaff = (user: User) => {
    if (user.email.toLowerCase() === 'septywanf@gmail.com' || user.role === 'owner') {
      alert('Akun Owner utama tidak dapat dihapus.');
      return;
    }
    const confirm = window.confirm(
      `Apakah Anda yakin ingin menghapus akun staff "${user.name}" (${user.email})?`
    );
    if (confirm) {
      const res = db.deleteStaff(user.id);
      if (res.success) {
        showToast(`Staff "${user.name}" telah dihapus.`);
      } else {
        alert(res.error || 'Gagal menghapus staff.');
      }
    }
  };

  const handleToggleStaffStatus = (user: User) => {
    if (user.email.toLowerCase() === 'septywanf@gmail.com' || user.role === 'owner') {
      alert('Akun Owner utama tidak dapat dinonaktifkan.');
      return;
    }
    const res = db.toggleStaffStatus(user.id);
    if (res.success) {
      const newStatus = user.isActive === false ? 'diaktifkan' : 'dinonaktifkan';
      showToast(`Status akun "${user.name}" telah ${newStatus}.`);
    } else {
      alert(res.error || 'Gagal mengubah status.');
    }
  };

  const handleSavePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordModalUser) return;
    setPasswordError(null);

    if (!newPassword || newPassword.length < 4) {
      setPasswordError('Kata sandi baru minimal 4 karakter.');
      return;
    }
    if (newPassword !== newPasswordConfirm) {
      setPasswordError('Konfirmasi kata sandi tidak cocok.');
      return;
    }

    const res = db.updateStaff(passwordModalUser.id, { password: newPassword });
    if (res.success) {
      setPasswordModalUser(null);
      setNewPassword('');
      setNewPasswordConfirm('');
      showToast(`Kata sandi akun "${passwordModalUser.name}" berhasil diubah!`);
    } else {
      setPasswordError(res.error || 'Gagal mengubah kata sandi.');
    }
  };

  const togglePasswordVisibility = (userId: string) => {
    setVisiblePasswords((prev) => ({
      ...prev,
      [userId]: !prev[userId],
    }));
  };

  // Export / Import
  const handleExportBackup = () => {
    const jsonStr = db.exportToJson();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `GHN_ERP_Backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const success = db.importFromJson(content);
        if (success) {
          showToast('Data backup berhasil di-restore!');
        } else {
          alert('Gagal memuat file JSON backup. Pastikan format valid.');
        }
      }
    };
    reader.readAsText(file);
  };

  // Reset Handlers
  const handleExecuteResetAll = () => {
    if (!isOwner) {
      alert('Hanya Owner yang memiliki izin mereset database.');
      return;
    }
    const res = db.resetAllData({
      openingCash: Number(openingCashInput) || 0,
      clearCustomers: clearCustomersCheckbox,
      resetFarmSettings: resetFarmSettingsCheckbox,
    });
    setFormSettings({ ...db.getData().settings });
    setIsResetAllModalOpen(false);
    showToast(res.message);
  };

  const handleExecuteResetDemo = () => {
    if (!isOwner) {
      alert('Hanya Owner yang memiliki izin memuat data demo.');
      return;
    }
    const res = db.resetToDemoData();
    setFormSettings({ ...db.getData().settings });
    setIsResetDemoModalOpen(false);
    showToast(res.message);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-gray-200 text-gray-800">
              <Settings className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-bold text-gray-900">
              Pengaturan Sistem Farm & Manajemen Staff
            </h2>
          </div>
          <p className="text-xs text-gray-500 mt-0.5">
            Konfigurasi profil usaha, penambahan & manajemen staff, hak akses pengguna, serta cadangan database.
          </p>
        </div>

        {/* Current Active User Badge */}
        <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-gray-200 text-xs shadow-2xs">
          <span className="text-gray-500 font-medium">Akun Aktif:</span>
          <span className="font-bold text-gray-900">{data.currentUser.name}</span>
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
              isOwner ? 'bg-[#D4AF37]/20 text-[#0A3622] border border-[#D4AF37]/40' : 'bg-gray-100 text-gray-700'
            }`}
          >
            {data.currentUser.role}
          </span>
        </div>
      </div>

      {/* Toast Alert */}
      {toastMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 1: MANAJEMEN STAFF & PENGGUNA (REQUESTED FEATURE) */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100">
          <div>
            <h3 className="font-extrabold text-gray-900 text-base flex items-center gap-2">
              <Users className="w-5 h-5 text-[#0F5132]" />
              Manajemen Pengguna & Penambahan Staff Manual
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Kelola akun login untuk Owner dan seluruh Staff Peternakan GHN Egg Farm Nusantara.
            </p>
          </div>

          <button
            type="button"
            onClick={handleOpenAddStaff}
            className="flex items-center gap-2 bg-[#0F5132] hover:bg-[#0A3622] text-white px-3.5 py-2 rounded-xl text-xs font-bold shadow-xs transition-all active:scale-95 cursor-pointer shrink-0"
          >
            <UserPlus className="w-4 h-4" />
            <span>+ Tambah Staff Manual</span>
          </button>
        </div>

        {/* Staff Table / Cards */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-gray-200 text-gray-400 font-bold uppercase tracking-wider">
                <th className="py-2.5 px-3">Pengguna & Nama</th>
                <th className="py-2.5 px-3">Email Login</th>
                <th className="py-2.5 px-3">Kata Sandi</th>
                <th className="py-2.5 px-3">Peran / Role</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data.users.map((user) => {
                const isThisOwner = user.email.toLowerCase() === 'septywanf@gmail.com' || user.role === 'owner';
                const isCurrentActive = data.currentUser.id === user.id;
                const showPass = visiblePasswords[user.id];

                return (
                  <tr
                    key={user.id}
                    className={`hover:bg-[#FAF9F6] transition-colors ${
                      isCurrentActive ? 'bg-emerald-50/50' : ''
                    }`}
                  >
                    {/* User Info */}
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-8 h-8 rounded-xl flex items-center justify-center text-white font-bold text-xs ${
                            isThisOwner ? 'bg-[#0F5132]' : 'bg-slate-600'
                          }`}
                        >
                          {user.name.charAt(0)}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-gray-900">{user.name}</span>
                            {isCurrentActive && (
                              <span className="text-[9px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.2 rounded-sm">
                                Anda
                              </span>
                            )}
                          </div>
                          {user.phone && (
                            <span className="text-[11px] text-gray-500 block font-mono">
                              {user.phone}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Email */}
                    <td className="py-3 px-3 font-mono text-gray-700">
                      {user.email}
                    </td>

                    {/* Password View */}
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-gray-800 font-medium">
                          {showPass ? user.password || '••••••••' : '••••••••'}
                        </span>
                        <button
                          type="button"
                          onClick={() => togglePasswordVisibility(user.id)}
                          className="p-1 text-gray-400 hover:text-gray-700 rounded transition-colors"
                          title={showPass ? 'Sembunyikan sandi' : 'Tampilkan sandi'}
                        >
                          {showPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </td>

                    {/* Role */}
                    <td className="py-3 px-3">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${
                          isThisOwner
                            ? 'bg-[#FEF9E7] text-[#0A3622] border border-[#D4AF37]/50'
                            : 'bg-gray-100 text-gray-700 border border-gray-200'
                        }`}
                      >
                        {isThisOwner ? (
                          <>
                            <ShieldCheck className="w-3 h-3 text-[#D4AF37]" />
                            <span>Owner</span>
                          </>
                        ) : (
                          <>
                            <UserCheck className="w-3 h-3 text-emerald-600" />
                            <span>{user.role}</span>
                          </>
                        )}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="py-3 px-3">
                      <span
                        className={`inline-flex items-center gap-1 text-[11px] font-bold ${
                          user.isActive !== false ? 'text-emerald-700' : 'text-rose-600'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            user.isActive !== false ? 'bg-emerald-500' : 'bg-rose-500'
                          }`}
                        />
                        {user.isActive !== false ? 'Aktif' : 'Non-aktif'}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-3 text-right">
                      <div className="inline-flex items-center gap-1">
                        {/* Change Password */}
                        <button
                          type="button"
                          onClick={() => {
                            setPasswordModalUser(user);
                            setNewPassword('');
                            setNewPasswordConfirm('');
                            setPasswordError(null);
                          }}
                          className="p-1.5 rounded-lg text-gray-500 hover:text-amber-700 hover:bg-amber-50 transition-colors"
                          title="Ganti kata sandi"
                        >
                          <Key className="w-3.5 h-3.5" />
                        </button>

                        {/* Edit Staff */}
                        <button
                          type="button"
                          onClick={() => handleOpenEditStaff(user)}
                          className="p-1.5 rounded-lg text-gray-500 hover:text-[#0F5132] hover:bg-emerald-50 transition-colors"
                          title="Edit detail staff"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>

                        {/* Toggle Status (Disabled for main owner) */}
                        {!isThisOwner && (
                          <button
                            type="button"
                            onClick={() => handleToggleStaffStatus(user)}
                            className={`p-1.5 rounded-lg transition-colors ${
                              user.isActive !== false
                                ? 'text-emerald-700 hover:text-rose-600 hover:bg-rose-50'
                                : 'text-rose-600 hover:text-emerald-700 hover:bg-emerald-50'
                            }`}
                            title={user.isActive !== false ? 'Nonaktifkan akun' : 'Aktifkan akun'}
                          >
                            {user.isActive !== false ? 'Nonaktifkan' : 'Aktifkan'}
                          </button>
                        )}

                        {/* Delete (Disabled for owner) */}
                        {!isThisOwner && (
                          <button
                            type="button"
                            onClick={() => handleDeleteStaff(user)}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                            title="Hapus akun staff"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Security & Access info */}
        <div className="p-3 bg-[#FAF9F6] rounded-xl border border-gray-200 text-xs text-gray-600 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#0F5132]" />
            <span>
              <strong>Keamanan Akun:</strong> Kata sandi tersimpan secara terenkripsi di sistem lokal. Gunakan tombol mata (<Eye className="w-3 h-3 inline text-gray-500" />) atau kunci (<Key className="w-3 h-3 inline text-gray-500" />) jika ingin mengganti sandi.
            </span>
          </div>
          <span className="text-[11px] text-gray-500">
            Staff yang baru ditambahkan dapat langsung login menggunakan email & kata sandi yang telah ditentukan.
          </span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECTION 2: PENGATURAN IDENTITAS FARM & REKENING */}
      {/* ========================================================================= */}
      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* COL 1 & 2: Main Business Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Identitas Peternakan */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-200 shadow-xs space-y-4">
            <h3 className="font-bold text-gray-900 text-base flex items-center gap-2 pb-2 border-b border-gray-100">
              <Building className="w-4 h-4 text-[#0F5132]" />
              Identitas Peternakan & Usaha
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Nama Peternakan</label>
                <input
                  type="text"
                  disabled={!isOwner}
                  value={formSettings.farmName}
                  onChange={(e) => setFormSettings({ ...formSettings, farmName: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#0F5132] disabled:bg-gray-100"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Tagline / Slogan</label>
                <input
                  type="text"
                  disabled={!isOwner}
                  value={formSettings.tagline}
                  onChange={(e) => setFormSettings({ ...formSettings, tagline: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#0F5132] disabled:bg-gray-100"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-bold text-gray-700 mb-1">Alamat Kandang & Kantor</label>
                <input
                  type="text"
                  disabled={!isOwner}
                  value={formSettings.address}
                  onChange={(e) => setFormSettings({ ...formSettings, address: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#0F5132] disabled:bg-gray-100"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Nomor Telepon / WhatsApp</label>
                <input
                  type="text"
                  disabled={!isOwner}
                  value={formSettings.phone}
                  onChange={(e) => setFormSettings({ ...formSettings, phone: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#0F5132] disabled:bg-gray-100"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Email Resmi Peternakan</label>
                <input
                  type="email"
                  disabled={!isOwner}
                  value={formSettings.email}
                  onChange={(e) => setFormSettings({ ...formSettings, email: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#0F5132] disabled:bg-gray-100"
                  required
                />
              </div>
            </div>
          </div>

          {/* Patokan Harga & Parameter Kandang */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-200 shadow-xs space-y-4">
            <h3 className="font-bold text-gray-900 text-base flex items-center gap-2 pb-2 border-b border-gray-100">
              <DollarSign className="w-4 h-4 text-[#D4AF37]" />
              Patokan Harga & Parameter Operasional
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  Harga Patokan Telur Default (Rp / kg)
                </label>
                <input
                  type="number"
                  disabled={!isOwner}
                  value={formSettings.defaultEggPrice}
                  onChange={(e) =>
                    setFormSettings({ ...formSettings, defaultEggPrice: Number(e.target.value) })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 font-bold focus:ring-2 focus:ring-[#0F5132] disabled:bg-gray-100"
                  min="0"
                  required
                />
                <span className="text-[10px] text-gray-500 mt-1 block">
                  Otomatis terisi saat Kasir POS dibuka
                </span>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Total Populasi Ayam Layer (Ekor)</label>
                <input
                  type="number"
                  disabled={!isOwner}
                  value={formSettings.chickenPopulation}
                  onChange={(e) =>
                    setFormSettings({ ...formSettings, chickenPopulation: Number(e.target.value) })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 font-bold focus:ring-2 focus:ring-[#0F5132] disabled:bg-gray-100"
                  min="0"
                  required
                />
                <span className="text-[10px] text-gray-500 mt-1 block">
                  Dasar perhitungan HDP (%) harian
                </span>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Ambang Batas Stok Menipis (kg)</label>
                <input
                  type="number"
                  disabled={!isOwner}
                  value={formSettings.lowStockThresholdKg}
                  onChange={(e) =>
                    setFormSettings({ ...formSettings, lowStockThresholdKg: Number(e.target.value) })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 font-bold focus:ring-2 focus:ring-[#0F5132] disabled:bg-gray-100"
                  min="0"
                  required
                />
                <span className="text-[10px] text-gray-500 mt-1 block">
                  Peringatan lonceng notifikasi di atas
                </span>
              </div>

              <div className="sm:col-span-3">
                <label className="block font-bold text-gray-700 mb-1">
                  Catatan Kaki Struk Kasir 58mm (Receipt Footer)
                </label>
                <input
                  type="text"
                  disabled={!isOwner}
                  value={formSettings.receiptFooter}
                  onChange={(e) =>
                    setFormSettings({ ...formSettings, receiptFooter: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#0F5132] disabled:bg-gray-100"
                  required
                />
              </div>
            </div>
          </div>

          {/* Rekening Pembayaran Bank */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-200 shadow-xs space-y-4">
            <h3 className="font-bold text-gray-900 text-base flex items-center gap-2 pb-2 border-b border-gray-100">
              <Building className="w-4 h-4 text-[#0F5132]" />
              Rekening Bank Resmi Farm (Untuk Faktur & Pre Order)
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Nama Bank</label>
                <input
                  type="text"
                  disabled={!isOwner}
                  value={formSettings.bankName}
                  onChange={(e) => setFormSettings({ ...formSettings, bankName: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#0F5132] disabled:bg-gray-100"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Nomor Rekening</label>
                <input
                  type="text"
                  disabled={!isOwner}
                  value={formSettings.bankAccount}
                  onChange={(e) =>
                    setFormSettings({ ...formSettings, bankAccount: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 font-mono font-bold focus:ring-2 focus:ring-[#0F5132] disabled:bg-gray-100"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Atas Nama Pemilik Rekening</label>
                <input
                  type="text"
                  disabled={!isOwner}
                  value={formSettings.bankAccountName}
                  onChange={(e) =>
                    setFormSettings({ ...formSettings, bankAccountName: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#0F5132] disabled:bg-gray-100"
                />
              </div>
            </div>
          </div>

          {/* Save Button */}
          {isOwner && (
            <div className="flex justify-end">
              <button
                type="submit"
                className="flex items-center gap-2 bg-[#0F5132] hover:bg-[#0A3622] text-white px-6 py-3 rounded-xl font-bold text-sm shadow-md transition-all active:scale-95 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Simpan Perubahan Identitas Farm</span>
              </button>
            </div>
          )}
        </div>

        {/* COL 3: Backup & Database Recovery */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-xs space-y-4">
            <h3 className="font-bold text-gray-900 text-sm sm:text-base pb-2 border-b">
              Backup & Pemulihan Database
            </h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              Seluruh transaksi, stok, pelanggan, dan akun tersimpan secara lokal dan terpadu. Ekspor data sewaktu-waktu untuk cadangan aman.
            </p>

            <div className="space-y-2">
              <button
                type="button"
                onClick={handleExportBackup}
                className="w-full py-2.5 px-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Download Backup JSON</span>
              </button>

              <label className="w-full py-2.5 px-3 rounded-xl border border-gray-300 hover:bg-gray-50 text-gray-700 text-xs font-bold transition-colors flex items-center justify-center gap-2 cursor-pointer">
                <Upload className="w-4 h-4" />
                <span>Restore dari File JSON</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportBackup}
                  className="hidden"
                />
              </label>

              {/* Reset Database Management Area */}
              {isOwner && (
                <div className="pt-3 border-t border-gray-100 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
                      <Database className="w-3.5 h-3.5 text-gray-500" />
                      Opsi Reset Sistem
                    </span>
                    <span className="text-[10px] text-gray-500 font-semibold bg-gray-100 px-1.5 py-0.5 rounded">
                      Khusus Owner
                    </span>
                  </div>

                  {/* Tombol 1: Reset All Data (Kosongkan) */}
                  <button
                    type="button"
                    onClick={() => {
                      setOpeningCashInput(0);
                      setClearCustomersCheckbox(false);
                      setResetFarmSettingsCheckbox(false);
                      setIsResetAllModalOpen(true);
                    }}
                    className="w-full p-3 rounded-xl border border-rose-200 bg-rose-50/80 hover:bg-rose-100/70 hover:border-rose-300 text-left transition-all group flex items-start gap-2.5 cursor-pointer shadow-2xs"
                  >
                    <div className="p-2 rounded-lg bg-rose-100 text-rose-700 shrink-0 mt-0.5 group-hover:scale-105 transition-transform">
                      <Trash2 className="w-4 h-4 text-rose-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-extrabold text-rose-900 group-hover:text-rose-700">
                          Reset All Data (Kosongkan)
                        </p>
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-rose-200 text-rose-800 uppercase">
                          Mulai 0
                        </span>
                      </div>
                      <p className="text-[10px] text-rose-700/80 mt-0.5 leading-tight">
                        Bersihkan seluruh transaksi panen, kasir, pesanan PO, stok (0 kg) & kas. Akun login tetap aman.
                      </p>
                    </div>
                  </button>

                  {/* Tombol 2: Muat Data Demo */}
                  <button
                    type="button"
                    onClick={() => setIsResetDemoModalOpen(true)}
                    className="w-full p-3 rounded-xl border border-emerald-200 bg-emerald-50/80 hover:bg-emerald-100/70 hover:border-emerald-300 text-left transition-all group flex items-start gap-2.5 cursor-pointer shadow-2xs"
                  >
                    <div className="p-2 rounded-lg bg-emerald-100 text-[#0F5132] shrink-0 mt-0.5 group-hover:scale-105 transition-transform">
                      <Sparkles className="w-4 h-4 text-[#D4AF37]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-extrabold text-[#0A3622] group-hover:text-[#0F5132]">
                          Muat Ulang Data Demo
                        </p>
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-[#FEF9E7] text-[#0A3622] border border-[#D4AF37]/50 uppercase">
                          Sept 2026
                        </span>
                      </div>
                      <p className="text-[10px] text-emerald-800/80 mt-0.5 leading-tight">
                        Isi ulang database dengan contoh komprehensif September 2026 (produksi panen telur, kasir POS & buku kas).
                      </p>
                    </div>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </form>

      {/* ========================================================================= */}
      {/* MODAL 1: TAMBAH STAFF BARU MANUAL */}
      {/* ========================================================================= */}
      {isAddStaffOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-gray-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-emerald-50 text-[#0F5132]">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-base">Tambah Staff Farm Manual</h3>
                  <p className="text-[11px] text-gray-500">Buat kredensial login untuk petugas kandang / kasir</p>
                </div>
              </div>
              <button
                onClick={() => setIsAddStaffOpen(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSaveNewStaff} className="mt-4 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Nama Lengkap Staff *</label>
                <input
                  type="text"
                  value={staffForm.name}
                  onChange={(e) => setStaffForm({ ...staffForm, name: e.target.value })}
                  placeholder="Contoh: Budi Santoso"
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#0F5132]"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Email Login *</label>
                  <input
                    type="email"
                    value={staffForm.email}
                    onChange={(e) => setStaffForm({ ...staffForm, email: e.target.value })}
                    placeholder="budi@ghneggfarm.id"
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#0F5132]"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Kata Sandi (Password) *</label>
                  <input
                    type="text"
                    value={staffForm.password}
                    onChange={(e) => setStaffForm({ ...staffForm, password: e.target.value })}
                    placeholder="Minimal 4 karakter"
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#0F5132] font-mono"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">No. WhatsApp / HP</label>
                  <input
                    type="tel"
                    value={staffForm.phone}
                    onChange={(e) => setStaffForm({ ...staffForm, phone: e.target.value })}
                    placeholder="08123456789"
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#0F5132]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Peran Akun (Role)</label>
                  <select
                    value={staffForm.role}
                    onChange={(e) =>
                      setStaffForm({
                        ...staffForm,
                        role: e.target.value as 'staff' | 'operator' | 'owner',
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#0F5132] font-medium"
                  >
                    <option value="staff">Staff Operasional (Kandang / Logistik)</option>
                    <option value="operator">Operator Kasir & Penjualan</option>
                    <option value="owner">Owner / Wakil Pemilik</option>
                  </select>
                </div>
              </div>

              {/* Hak Akses Modul */}
              <div className="pt-2 border-t border-gray-100">
                <label className="block font-bold text-gray-800 mb-2">Hak Akses Modul:</label>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <label className="flex items-center gap-2 cursor-pointer p-2 rounded-lg bg-gray-50 hover:bg-gray-100">
                    <input
                      type="checkbox"
                      checked={staffForm.permissions.canAccessProduksi}
                      onChange={(e) =>
                        setStaffForm({
                          ...staffForm,
                          permissions: {
                            ...staffForm.permissions,
                            canAccessProduksi: e.target.checked,
                          },
                        })
                      }
                      className="rounded text-[#0F5132] focus:ring-[#0F5132]"
                    />
                    <span>Catat Produksi</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer p-2 rounded-lg bg-gray-50 hover:bg-gray-100">
                    <input
                      type="checkbox"
                      checked={staffForm.permissions.canAccessKasir}
                      onChange={(e) =>
                        setStaffForm({
                          ...staffForm,
                          permissions: {
                            ...staffForm.permissions,
                            canAccessKasir: e.target.checked,
                          },
                        })
                      }
                      className="rounded text-[#0F5132] focus:ring-[#0F5132]"
                    />
                    <span>Kasir POS (Penjualan)</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer p-2 rounded-lg bg-gray-50 hover:bg-gray-100">
                    <input
                      type="checkbox"
                      checked={staffForm.permissions.canAccessPreOrder}
                      onChange={(e) =>
                        setStaffForm({
                          ...staffForm,
                          permissions: {
                            ...staffForm.permissions,
                            canAccessPreOrder: e.target.checked,
                          },
                        })
                      }
                      className="rounded text-[#0F5132] focus:ring-[#0F5132]"
                    />
                    <span>Pre Order Telur</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer p-2 rounded-lg bg-gray-50 hover:bg-gray-100">
                    <input
                      type="checkbox"
                      checked={staffForm.permissions.canAccessStok}
                      onChange={(e) =>
                        setStaffForm({
                          ...staffForm,
                          permissions: {
                            ...staffForm.permissions,
                            canAccessStok: e.target.checked,
                          },
                        })
                      }
                      className="rounded text-[#0F5132] focus:ring-[#0F5132]"
                    />
                    <span>Stok Telur & Pakan</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer p-2 rounded-lg bg-gray-50 hover:bg-gray-100">
                    <input
                      type="checkbox"
                      checked={staffForm.permissions.canAccessPelanggan}
                      onChange={(e) =>
                        setStaffForm({
                          ...staffForm,
                          permissions: {
                            ...staffForm.permissions,
                            canAccessPelanggan: e.target.checked,
                          },
                        })
                      }
                      className="rounded text-[#0F5132] focus:ring-[#0F5132]"
                    />
                    <span>Data Pelanggan</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer p-2 rounded-lg bg-gray-50 hover:bg-gray-100">
                    <input
                      type="checkbox"
                      checked={staffForm.permissions.canAccessKeuangan}
                      onChange={(e) =>
                        setStaffForm({
                          ...staffForm,
                          permissions: {
                            ...staffForm.permissions,
                            canAccessKeuangan: e.target.checked,
                          },
                        })
                      }
                      className="rounded text-[#0F5132] focus:ring-[#0F5132]"
                    />
                    <span>Keuangan & Buku Kas</span>
                  </label>
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsAddStaffOpen(false)}
                  className="px-4 py-2 rounded-xl border border-gray-300 text-gray-700 font-bold hover:bg-gray-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#0F5132] hover:bg-[#0A3622] text-white font-bold shadow-xs cursor-pointer"
                >
                  Simpan Staff Baru
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: EDIT DETAIL STAFF */}
      {/* ========================================================================= */}
      {editingStaff && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-gray-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-blue-50 text-blue-700">
                  <Edit3 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-base">Edit Akun Pengguna</h3>
                  <p className="text-[11px] text-gray-500">Perbarui profil dan wewenang {editingStaff.name}</p>
                </div>
              </div>
              <button
                onClick={() => setEditingStaff(null)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSaveEditStaff} className="mt-4 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Nama Lengkap *</label>
                <input
                  type="text"
                  value={staffForm.name}
                  onChange={(e) => setStaffForm({ ...staffForm, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#0F5132]"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Email Login *</label>
                  <input
                    type="email"
                    value={staffForm.email}
                    onChange={(e) => setStaffForm({ ...staffForm, email: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#0F5132]"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">No. WhatsApp / HP</label>
                  <input
                    type="tel"
                    value={staffForm.phone}
                    onChange={(e) => setStaffForm({ ...staffForm, phone: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#0F5132]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Peran Akun (Role)</label>
                <select
                  value={staffForm.role}
                  onChange={(e) =>
                    setStaffForm({
                      ...staffForm,
                      role: e.target.value as 'staff' | 'operator' | 'owner',
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#0F5132] font-medium"
                >
                  <option value="staff">Staff Operasional (Kandang / Logistik)</option>
                  <option value="operator">Operator Kasir & Penjualan</option>
                  <option value="owner">Owner / Pemilik Peternakan</option>
                </select>
              </div>

              {/* Hak Akses Modul */}
              <div className="pt-2 border-t border-gray-100">
                <label className="block font-bold text-gray-800 mb-2">Hak Akses Modul:</label>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <label className="flex items-center gap-2 cursor-pointer p-2 rounded-lg bg-gray-50 hover:bg-gray-100">
                    <input
                      type="checkbox"
                      checked={staffForm.permissions.canAccessProduksi}
                      onChange={(e) =>
                        setStaffForm({
                          ...staffForm,
                          permissions: {
                            ...staffForm.permissions,
                            canAccessProduksi: e.target.checked,
                          },
                        })
                      }
                      className="rounded text-[#0F5132] focus:ring-[#0F5132]"
                    />
                    <span>Catat Produksi</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer p-2 rounded-lg bg-gray-50 hover:bg-gray-100">
                    <input
                      type="checkbox"
                      checked={staffForm.permissions.canAccessKasir}
                      onChange={(e) =>
                        setStaffForm({
                          ...staffForm,
                          permissions: {
                            ...staffForm.permissions,
                            canAccessKasir: e.target.checked,
                          },
                        })
                      }
                      className="rounded text-[#0F5132] focus:ring-[#0F5132]"
                    />
                    <span>Kasir POS</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer p-2 rounded-lg bg-gray-50 hover:bg-gray-100">
                    <input
                      type="checkbox"
                      checked={staffForm.permissions.canAccessPreOrder}
                      onChange={(e) =>
                        setStaffForm({
                          ...staffForm,
                          permissions: {
                            ...staffForm.permissions,
                            canAccessPreOrder: e.target.checked,
                          },
                        })
                      }
                      className="rounded text-[#0F5132] focus:ring-[#0F5132]"
                    />
                    <span>Pre Order Telur</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer p-2 rounded-lg bg-gray-50 hover:bg-gray-100">
                    <input
                      type="checkbox"
                      checked={staffForm.permissions.canAccessStok}
                      onChange={(e) =>
                        setStaffForm({
                          ...staffForm,
                          permissions: {
                            ...staffForm.permissions,
                            canAccessStok: e.target.checked,
                          },
                        })
                      }
                      className="rounded text-[#0F5132] focus:ring-[#0F5132]"
                    />
                    <span>Stok Telur & Pakan</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer p-2 rounded-lg bg-gray-50 hover:bg-gray-100">
                    <input
                      type="checkbox"
                      checked={staffForm.permissions.canAccessPelanggan}
                      onChange={(e) =>
                        setStaffForm({
                          ...staffForm,
                          permissions: {
                            ...staffForm.permissions,
                            canAccessPelanggan: e.target.checked,
                          },
                        })
                      }
                      className="rounded text-[#0F5132] focus:ring-[#0F5132]"
                    />
                    <span>Data Pelanggan</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer p-2 rounded-lg bg-gray-50 hover:bg-gray-100">
                    <input
                      type="checkbox"
                      checked={staffForm.permissions.canAccessKeuangan}
                      onChange={(e) =>
                        setStaffForm({
                          ...staffForm,
                          permissions: {
                            ...staffForm.permissions,
                            canAccessKeuangan: e.target.checked,
                          },
                        })
                      }
                      className="rounded text-[#0F5132] focus:ring-[#0F5132]"
                    />
                    <span>Keuangan & Kas</span>
                  </label>
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setEditingStaff(null)}
                  className="px-4 py-2 rounded-xl border border-gray-300 text-gray-700 font-bold hover:bg-gray-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#0F5132] hover:bg-[#0A3622] text-white font-bold shadow-xs cursor-pointer"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: GANTI KATA SANDI STAFF */}
      {/* ========================================================================= */}
      {passwordModalUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-gray-200">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-amber-50 text-amber-700">
                  <Key className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-sm sm:text-base">Ganti Kata Sandi</h3>
                  <p className="text-[11px] text-gray-500 font-mono truncate max-w-[190px]">
                    {passwordModalUser.email}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setPasswordModalUser(null)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {passwordError && (
              <div className="mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{passwordError}</span>
              </div>
            )}

            <form onSubmit={handleSavePasswordChange} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Kata Sandi Baru *</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Minimal 4 karakter"
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#0F5132]"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Konfirmasi Kata Sandi *</label>
                <input
                  type="password"
                  value={newPasswordConfirm}
                  onChange={(e) => setNewPasswordConfirm(e.target.value)}
                  placeholder="Ulangi kata sandi baru"
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#0F5132]"
                  required
                />
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setPasswordModalUser(null)}
                  className="px-4 py-2 rounded-xl border border-gray-300 text-gray-700 font-bold hover:bg-gray-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#0F5132] hover:bg-[#0A3622] text-white font-bold shadow-xs cursor-pointer"
                >
                  Simpan Sandi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* ========================================================================= */}
      {/* MODAL 4: KONFIRMASI RESET ALL DATA (KOSONGKAN SELURUH DATA DARI 0) */}
      {/* ========================================================================= */}
      {isResetAllModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-rose-200">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-rose-100 text-rose-700">
                  <AlertOctagon className="w-5 h-5 text-rose-600" />
                </div>
                <div>
                  <h3 className="font-extrabold text-gray-900 text-base">Reset All Data (Kosongkan)</h3>
                  <p className="text-[11px] text-gray-500">Mulai pembukuan peternakan segar dari nol</p>
                </div>
              </div>
              <button
                onClick={() => setIsResetAllModalOpen(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 space-y-3.5 text-xs text-gray-600">
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 leading-relaxed">
                <p className="font-bold mb-1 flex items-center gap-1.5 text-rose-900">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                  Peringatan Pengosongan Database:
                </p>
                <ul className="list-disc list-inside space-y-0.5 text-[11px] text-rose-800">
                  <li>Seluruh histori produksi telur harian akan dihapus.</li>
                  <li>Seluruh transaksi kasir POS & struk akan dihapus.</li>
                  <li>Daftar Pre Order telur aktif & selesai akan dihapus.</li>
                  <li>Stok telur & pakan akan di-set ke <strong>0 kg</strong>.</li>
                  <li>Buku kas, mutasi kas masuk/keluar & laporan bulanan akan bersih.</li>
                  <li className="font-bold text-emerald-800 mt-1">Akun login Owner ({data.currentUser.email}) dan akun staff tetap aman.</li>
                </ul>
              </div>

              {/* Saldo Awal Baru */}
              <div>
                <label className="block font-bold text-gray-800 mb-1">
                  Saldo Awal Kas Baru (Rp)
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400 font-bold">
                    Rp
                  </span>
                  <input
                    type="number"
                    value={openingCashInput}
                    onChange={(e) => setOpeningCashInput(Number(e.target.value) || 0)}
                    placeholder="0"
                    min="0"
                    step="10000"
                    className="w-full pl-10 pr-3 py-2 rounded-xl border border-gray-300 font-bold text-gray-900 focus:ring-2 focus:ring-rose-500"
                  />
                </div>
                <span className="text-[10px] text-gray-400 mt-1 block">
                  Masukkan modal kas tunai awal peternakan Anda (atau isi 0).
                </span>
              </div>

              {/* Opsi Tambahan */}
              <div className="space-y-1.5 pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none text-gray-700">
                  <input
                    type="checkbox"
                    checked={clearCustomersCheckbox}
                    onChange={(e) => setClearCustomersCheckbox(e.target.checked)}
                    className="rounded text-rose-600 focus:ring-rose-500"
                  />
                  <span>Hapus juga buku kontak pelanggan (mulai pelanggan dari 0)</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer select-none text-gray-700">
                  <input
                    type="checkbox"
                    checked={resetFarmSettingsCheckbox}
                    onChange={(e) => setResetFarmSettingsCheckbox(e.target.checked)}
                    className="rounded text-rose-600 focus:ring-rose-500"
                  />
                  <span>Reset identitas nama farm ke default</span>
                </label>
              </div>
            </div>

            <div className="mt-5 pt-3 flex justify-end gap-2 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setIsResetAllModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-gray-300 text-gray-700 font-bold hover:bg-gray-50 cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleExecuteResetAll}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold shadow-md cursor-pointer flex items-center gap-1.5 active:scale-95 transition-all"
              >
                <Trash2 className="w-4 h-4" />
                <span>Ya, Kosongkan Semua Data</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 5: KONFIRMASI MUAT ULANG DATA DEMO SEPTEMBER 2026 */}
      {/* ========================================================================= */}
      {isResetDemoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-emerald-200">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-100 text-[#0F5132]">
                  <Sparkles className="w-5 h-5 text-[#D4AF37]" />
                </div>
                <div>
                  <h3 className="font-extrabold text-gray-900 text-base">Muat Ulang Data Demo</h3>
                  <p className="text-[11px] text-gray-500">Contoh data transaksi resmi September 2026</p>
                </div>
              </div>
              <button
                onClick={() => setIsResetDemoModalOpen(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 space-y-3 text-xs text-gray-600 leading-relaxed">
              <p>
                Apakah Anda ingin memuat kembali seluruh dataset percontohan <strong>GHN Egg Farm Nusantara</strong>?
              </p>

              <div className="p-3 bg-emerald-50/80 border border-emerald-200 rounded-xl space-y-1.5 text-emerald-900">
                <p className="font-bold text-[#0F5132]">Dataset Demo Mencakup:</p>
                <ul className="list-disc list-inside space-y-0.5 text-[11px] text-emerald-800">
                  <li>Catatan panen telur harian & grafik performa HDP</li>
                  <li>Riwayat transaksi kasir POS & struk 58mm siap cetak</li>
                  <li>Pesanan Pre Order aktif (belum lunas & selesai)</li>
                  <li>Stok riil telur segar, pakan layer konsentrat & jagung</li>
                  <li>Buku kas tunai, beban listrik/gaji, dan laporan bulanan</li>
                </ul>
              </div>

              <p className="text-[11px] text-gray-500">
                Data transaksi Anda saat ini akan ditimpa dengan paket data simulasi ini. Akun login Owner tetap dipertahankan.
              </p>
            </div>

            <div className="mt-5 pt-3 flex justify-end gap-2 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setIsResetDemoModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-gray-300 text-gray-700 font-bold hover:bg-gray-50 cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleExecuteResetDemo}
                className="px-5 py-2 rounded-xl bg-[#0F5132] hover:bg-[#0A3622] text-white font-bold shadow-md cursor-pointer flex items-center gap-1.5 active:scale-95 transition-all"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Ya, Muat Data Demo Sekarang</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

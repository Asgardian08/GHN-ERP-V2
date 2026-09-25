import React, { useState } from 'react';
import { db } from '../../services/db';
import { DatabaseSchema, User } from '../../types/database';
import { 
  Bell, 
  ShieldCheck, 
  UserCheck, 
  Egg, 
  PlusCircle, 
  AlertTriangle,
  Calendar,
  LogOut,
  ChevronDown,
  User as UserIcon,
  Settings,
  Users
} from 'lucide-react';

interface HeaderProps {
  data: DatabaseSchema;
  activeModule: string;
  onOpenQuickAction: (actionType: 'production' | 'sale' | 'preorder' | 'expense' | 'feedUsage') => void;
  onNavigate: (module: string) => void;
  onLogout?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  data,
  onOpenQuickAction,
  onNavigate,
  onLogout,
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showQuickMenu, setShowQuickMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  // Check low stock
  const lowStockItems = data.inventory.filter((item) => item.stock <= item.minStock);
  // Check overdue POs
  const today = new Date().toISOString().split('T')[0];
  const overduePOs = data.preorders.filter(
    (po) => po.status !== 'selesai' && po.status !== 'dibatalkan' && po.pickupDate < today
  );
  const todaysPOs = data.preorders.filter(
    (po) => po.status !== 'selesai' && po.status !== 'dibatalkan' && po.pickupDate === today
  );

  const totalAlerts = lowStockItems.length + overduePOs.length;

  const toggleRole = () => {
    const nextRole = data.currentUser.role === 'owner' ? 'operator' : 'owner';
    db.setCurrentUser(nextRole);
  };

  const currentDateFormatted = new Intl.DateTimeFormat('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date());

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-gray-200 px-4 lg:px-8 py-3 shadow-xs">
      <div className="flex items-center justify-between gap-2 max-w-7xl mx-auto">
        {/* Brand & Mobile Title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0F5132] to-[#0A3622] flex items-center justify-center text-white shadow-sm ring-2 ring-[#D4AF37]/30">
            <Egg className="w-6 h-6 text-[#FEF9E7]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg tracking-tight text-[#0F5132]">
                GHN ERP <span className="text-[#D4AF37] font-semibold text-xs px-1.5 py-0.5 rounded-sm bg-[#0F5132]/10 border border-[#D4AF37]/30">LITE V2</span>
              </span>
            </div>
            <p className="text-[11px] text-gray-500 font-medium hidden sm:block">
              {data.settings.farmName}
            </p>
          </div>
        </div>

        {/* Date & Quick Status */}
        <div className="hidden md:flex items-center gap-2 bg-[#FAF9F6] border border-gray-200 rounded-lg px-3 py-1.5 text-xs text-gray-600 font-medium">
          <Calendar className="w-3.5 h-3.5 text-[#0F5132]" />
          <span>{currentDateFormatted}</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse ml-1" title="Sistem Aktif & Terhubung"></span>
        </div>

        {/* Actions & Role Switcher */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick Action Button */}
          <div className="relative">
            <button
              onClick={() => setShowQuickMenu(!showQuickMenu)}
              className="flex items-center gap-1.5 bg-[#0F5132] hover:bg-[#0A3622] text-white px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-lg text-xs sm:text-sm font-semibold shadow-xs transition-all active:scale-95"
            >
              <PlusCircle className="w-4 h-4" />
              <span className="hidden sm:inline">Aksi Cepat</span>
            </button>

            {showQuickMenu && (
              <>
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setShowQuickMenu(false)} 
                />
                <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="px-3 py-1 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                    Input Transaksi
                  </div>
                  <button
                    onClick={() => {
                      setShowQuickMenu(false);
                      onOpenQuickAction('sale');
                    }}
                    className="w-full text-left px-3.5 py-2 text-xs text-gray-700 hover:bg-[#E8F5E9] hover:text-[#0F5132] flex items-center gap-2.5 font-medium"
                  >
                    <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                    Kasir Penjualan Telur
                  </button>
                  <button
                    onClick={() => {
                      setShowQuickMenu(false);
                      onOpenQuickAction('production');
                    }}
                    className="w-full text-left px-3.5 py-2 text-xs text-gray-700 hover:bg-[#E8F5E9] hover:text-[#0F5132] flex items-center gap-2.5 font-medium"
                  >
                    <span className="w-2 h-2 rounded-full bg-[#0F5132]"></span>
                    Catat Panen Produksi
                  </button>
                  <button
                    onClick={() => {
                      setShowQuickMenu(false);
                      onOpenQuickAction('preorder');
                    }}
                    className="w-full text-left px-3.5 py-2 text-xs text-gray-700 hover:bg-[#E8F5E9] hover:text-[#0F5132] flex items-center gap-2.5 font-medium"
                  >
                    <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                    Pre Order Baru
                  </button>
                  <button
                    onClick={() => {
                      setShowQuickMenu(false);
                      onOpenQuickAction('expense');
                    }}
                    className="w-full text-left px-3.5 py-2 text-xs text-gray-700 hover:bg-[#E8F5E9] hover:text-[#0F5132] flex items-center gap-2.5 font-medium"
                  >
                    <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                    Catat Pengeluaran
                  </button>
                  <button
                    onClick={() => {
                      setShowQuickMenu(false);
                      onOpenQuickAction('feedUsage');
                    }}
                    className="w-full text-left px-3.5 py-2 text-xs text-gray-700 hover:bg-[#E8F5E9] hover:text-[#0F5132] flex items-center gap-2.5 font-medium"
                  >
                    <span className="w-2 h-2 rounded-full bg-amber-700"></span>
                    Penggunaan Pakan
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Notifications Trigger */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-lg text-gray-600 hover:text-[#0F5132] hover:bg-gray-100 transition-colors"
              title="Notifikasi & Peringatan Stok"
            >
              <Bell className="w-5 h-5" />
              {totalAlerts > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-rose-600 text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-white">
                  {totalAlerts}
                </span>
              )}
            </button>

            {showNotifications && (
              <>
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setShowNotifications(false)} 
                />
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-200 py-3 px-3.5 z-50 animate-in fade-in">
                  <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                    <span className="font-bold text-xs text-gray-800">Pemberitahuan Sistem</span>
                    <span className="text-[10px] text-gray-400 font-medium">{totalAlerts} Perhatian</span>
                  </div>

                  <div className="mt-2 max-h-72 overflow-y-auto space-y-2">
                    {lowStockItems.length > 0 && (
                      <div>
                        <p className="text-[11px] font-semibold text-amber-700 flex items-center gap-1 mb-1">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          Stok Dibawah Batas Minimum:
                        </p>
                        {lowStockItems.map((item) => (
                          <div
                            key={item.id}
                            onClick={() => {
                              setShowNotifications(false);
                              onNavigate('stok');
                            }}
                            className="text-xs p-2 rounded bg-amber-50 hover:bg-amber-100 cursor-pointer text-gray-800 transition-colors flex justify-between items-center"
                          >
                            <span className="font-medium">{item.name}</span>
                            <span className="text-amber-800 font-bold">
                              {item.stock} {item.unit} (Min {item.minStock})
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    {overduePOs.length > 0 && (
                      <div className="pt-2">
                        <p className="text-[11px] font-semibold text-rose-700 flex items-center gap-1 mb-1">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          Pre Order Lewat Jadwal Ambil:
                        </p>
                        {overduePOs.map((po) => (
                          <div
                            key={po.id}
                            onClick={() => {
                              setShowNotifications(false);
                              onNavigate('preorder');
                            }}
                            className="text-xs p-2 rounded bg-rose-50 hover:bg-rose-100 cursor-pointer text-gray-800 transition-colors flex justify-between items-center"
                          >
                            <div>
                              <p className="font-semibold text-rose-900">{po.customerName}</p>
                              <p className="text-[10px] text-gray-500">{po.quantityKg} kg • {po.pickupDate}</p>
                            </div>
                            <span className="text-[10px] bg-rose-200 text-rose-800 px-1.5 py-0.5 rounded font-bold">
                              Telat
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    {todaysPOs.length > 0 && (
                      <div className="pt-2">
                        <p className="text-[11px] font-semibold text-emerald-700 flex items-center gap-1 mb-1">
                          <Egg className="w-3.5 h-3.5" />
                          Pre Order Ambil Hari Ini ({todaysPOs.length}):
                        </p>
                        {todaysPOs.map((po) => (
                          <div
                            key={po.id}
                            onClick={() => {
                              setShowNotifications(false);
                              onNavigate('preorder');
                            }}
                            className="text-xs p-2 rounded bg-emerald-50 hover:bg-emerald-100 cursor-pointer text-gray-800 transition-colors flex justify-between items-center"
                          >
                            <span className="font-medium">{po.customerName}</span>
                            <span className="font-bold text-emerald-800">{po.quantityKg} kg</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {totalAlerts === 0 && todaysPOs.length === 0 && (
                      <p className="text-xs text-gray-400 text-center py-4">
                        Semua operasional farm berjalan lancar tanpa peringatan.
                      </p>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* User Profile & Account Menu */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className={`flex items-center gap-2 px-2.5 py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                data.currentUser.role === 'owner'
                  ? 'bg-[#FEF9E7] border-[#D4AF37]/60 text-[#0A3622] hover:bg-[#FDF3D0]'
                  : 'bg-gray-50 border-gray-300 text-gray-700 hover:bg-gray-100'
              }`}
              title="Menu Akun & Pengguna"
            >
              <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-white text-[11px] font-bold ${
                data.currentUser.role === 'owner' ? 'bg-[#0F5132]' : 'bg-slate-600'
              }`}>
                {data.currentUser.name.charAt(0)}
              </div>

              <div className="text-left hidden sm:block">
                <p className="text-xs font-bold leading-tight truncate max-w-[110px]">
                  {data.currentUser.name}
                </p>
                <p className="text-[10px] text-gray-500 font-normal capitalize">
                  {data.currentUser.role === 'owner' ? 'Owner Farm' : 'Staff Farm'}
                </p>
              </div>

              <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
            </button>

            {showUserMenu && (
              <>
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setShowUserMenu(false)} 
                />
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-gray-200 py-3 z-50 animate-in fade-in slide-in-from-top-2 text-xs">
                  {/* User Profile Header */}
                  <div className="px-4 py-2 border-b border-gray-100">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-xs ${
                        data.currentUser.role === 'owner' ? 'bg-[#0F5132]' : 'bg-slate-600'
                      }`}>
                        {data.currentUser.name.charAt(0)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-bold text-gray-900 truncate">
                          {data.currentUser.name}
                        </p>
                        <p className="text-[11px] text-gray-500 truncate font-mono">
                          {data.currentUser.email}
                        </p>
                        <span className={`inline-block mt-0.5 px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          data.currentUser.role === 'owner' 
                            ? 'bg-[#D4AF37]/20 text-[#0A3622] border border-[#D4AF37]/40' 
                            : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        }`}>
                          {data.currentUser.role === 'owner' ? '👑 Owner Utama' : '👤 Staff Peternakan'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Switch Account Quick List */}
                  <div className="px-3 pt-2 pb-1">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider px-2 mb-1 flex items-center justify-between">
                      <span>Beralih Pengguna</span>
                      <Users className="w-3 h-3" />
                    </p>
                    <div className="space-y-1">
                      {data.users.map((u) => {
                        const isSelected = u.id === data.currentUser.id;
                        return (
                          <button
                            key={u.id}
                            onClick={() => {
                              db.setCurrentUserById(u.id);
                              setShowUserMenu(false);
                            }}
                            className={`w-full text-left px-2.5 py-1.5 rounded-lg flex items-center justify-between transition-colors ${
                              isSelected
                                ? 'bg-emerald-50 text-[#0F5132] font-bold ring-1 ring-emerald-300'
                                : 'text-gray-700 hover:bg-gray-50 font-medium'
                            }`}
                          >
                            <span className="truncate">{u.name}</span>
                            <span className={`text-[10px] px-1.5 py-0.5 rounded capitalize ${
                              u.role === 'owner' ? 'bg-[#FEF9E7] text-[#0A3622]' : 'bg-gray-100 text-gray-600'
                            }`}>
                              {u.role}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Menu Links */}
                  <div className="pt-2 border-t border-gray-100 px-1">
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        onNavigate('pengaturan');
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg text-gray-700 hover:bg-[#FAF9F6] hover:text-[#0F5132] flex items-center gap-2 font-medium"
                    >
                      <Settings className="w-4 h-4 text-gray-400" />
                      <span>Manajemen Staff & Pengaturan</span>
                    </button>

                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        if (onLogout) {
                          onLogout();
                        } else {
                          db.logout();
                        }
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg text-rose-600 hover:bg-rose-50 flex items-center gap-2 font-medium mt-0.5"
                    >
                      <LogOut className="w-4 h-4 text-rose-500" />
                      <span>Keluar (Logout)</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

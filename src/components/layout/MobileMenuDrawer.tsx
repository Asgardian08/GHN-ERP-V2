import React from 'react';
import { 
  Boxes, 
  Users, 
  Wallet, 
  FileSpreadsheet, 
  Settings, 
  X, 
  ChevronRight,
  ShieldCheck,
  UserCheck,
  LogOut
} from 'lucide-react';
import { DatabaseSchema } from '../../types/database';
import { db } from '../../services/db';

interface MobileMenuDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activeModule: string;
  onNavigate: (module: string) => void;
  data: DatabaseSchema;
  onLogout?: () => void;
}

export const MobileMenuDrawer: React.FC<MobileMenuDrawerProps> = ({
  isOpen,
  onClose,
  activeModule,
  onNavigate,
  data,
  onLogout,
}) => {
  if (!isOpen) return null;

  const lowStockCount = data.inventory.filter((i) => i.stock <= i.minStock).length;

  interface MenuItem {
    id: string;
    label: string;
    icon: any;
    badge?: string | null;
    badgeColor?: string;
  }

  const OTHER_ITEMS: MenuItem[] = [
    { id: 'stok', label: 'Manajemen Stok & Pakan', icon: Boxes, badge: lowStockCount > 0 ? `${lowStockCount} Rendah` : null, badgeColor: 'bg-rose-100 text-rose-800' },
    { id: 'pelanggan', label: 'Buku Pelanggan & Piutang', icon: Users, badge: null },
    { id: 'keuangan', label: 'Keuangan, Kas, Hutang & Modal', icon: Wallet, badge: null },
    { id: 'laporan', label: 'Laporan & Tutup Buku PDF', icon: FileSpreadsheet, badge: 'PDF', badgeColor: 'bg-emerald-100 text-emerald-800' },
    { id: 'pengaturan', label: 'Pengaturan Sistem Farm', icon: Settings, badge: null },
  ];

  const toggleRole = () => {
    const nextRole = data.currentUser.role === 'owner' ? 'operator' : 'owner';
    db.setCurrentUser(nextRole);
  };

  return (
    <div className="fixed inset-0 z-50 md:hidden animate-in fade-in duration-200">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />

      {/* Drawer */}
      <div className="fixed bottom-0 left-0 right-0 max-h-[85vh] bg-white rounded-t-2xl shadow-2xl p-5 flex flex-col z-10 animate-in slide-in-from-bottom duration-250">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <div>
            <h3 className="font-bold text-gray-900 text-base">Menu GHN ERP Lite</h3>
            <p className="text-xs text-gray-500">Semua Modul Terpadu Farm</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-gray-400 hover:text-gray-700 bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Role Card */}
        <div className="my-3 p-3 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            {data.currentUser.role === 'owner' ? (
              <ShieldCheck className="w-5 h-5 text-[#D4AF37]" />
            ) : (
              <UserCheck className="w-5 h-5 text-gray-500" />
            )}
            <div>
              <p className="text-xs font-bold text-gray-800">{data.currentUser.name}</p>
              <p className="text-[11px] text-gray-500 capitalize">
                Role: {data.currentUser.role === 'owner' ? 'Owner (Akses Penuh)' : 'Staff Peternakan'}
              </p>
            </div>
          </div>
          {onLogout && (
            <button
              onClick={() => {
                onClose();
                onLogout();
              }}
              className="text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-100 active:scale-95 transition-all shadow-2xs flex items-center gap-1"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Keluar</span>
            </button>
          )}
        </div>

        {/* Items */}
        <div className="space-y-1.5 overflow-y-auto max-h-[50vh] py-1">
          {OTHER_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeModule === item.id;

            return (
              <button
                key={item.id}
                onClick={() => {
                  onNavigate(item.id);
                  onClose();
                }}
                className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${
                  isActive
                    ? 'bg-[#0F5132] text-white'
                    : 'text-gray-700 hover:bg-gray-50 active:bg-gray-100'
                }`}
              >
                <Icon
                  className={`w-5 h-5 ${
                    isActive ? 'text-[#FEF9E7]' : 'text-gray-400'
                  }`}
                />
                <span className="flex-1 text-left">{item.label}</span>
                {item.badge && (
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      isActive ? 'bg-white/20 text-white' : item.badgeColor || 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
                <ChevronRight className={`w-4 h-4 ${isActive ? 'text-white/60' : 'text-gray-400'}`} />
              </button>
            );
          })}
        </div>

        <div className="pt-3 mt-2 border-t border-gray-100 text-center text-[11px] text-gray-400">
          {data.settings.farmName} • v2.0
        </div>
      </div>
    </div>
  );
};

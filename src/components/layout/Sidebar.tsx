import React from 'react';
import { 
  LayoutDashboard, 
  Egg, 
  ShoppingCart, 
  CalendarClock, 
  Boxes, 
  Users, 
  Wallet, 
  FileSpreadsheet, 
  Settings,
  ChevronRight,
  LogOut,
  ShieldCheck,
  UserCheck
} from 'lucide-react';
import { DatabaseSchema } from '../../types/database';

interface SidebarProps {
  activeModule: string;
  onNavigate: (module: string) => void;
  data: DatabaseSchema;
  onLogout?: () => void;
}

export const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, badge: null },
  { id: 'produksi', label: 'Produksi', icon: Egg, badge: null },
  { id: 'kasir', label: 'Kasir (POS)', icon: ShoppingCart, badge: null },
  { id: 'preorder', label: 'Pre Order', icon: CalendarClock, countKey: 'preorders' },
  { id: 'stok', label: 'Stok', icon: Boxes, warningKey: 'lowStock' },
  { id: 'pelanggan', label: 'Pelanggan', icon: Users, badge: null },
  { id: 'keuangan', label: 'Keuangan', icon: Wallet, badge: null },
  { id: 'laporan', label: 'Laporan', icon: FileSpreadsheet, badge: null },
  { id: 'pengaturan', label: 'Pengaturan', icon: Settings, badge: null },
] as const;

export const Sidebar: React.FC<SidebarProps> = ({ activeModule, onNavigate, data, onLogout }) => {
  // Count active POs
  const activePOCount = data.preorders.filter(
    (p) => p.status !== 'selesai' && p.status !== 'dibatalkan'
  ).length;

  // Check low stock count
  const lowStockCount = data.inventory.filter((i) => i.stock <= i.minStock).length;

  const isOwner = data.currentUser.role === 'owner';

  return (
    <aside className="hidden md:flex flex-col w-64 bg-white border-r border-gray-200 min-h-[calc(100vh-61px)] p-4 shrink-0 shadow-xs">
      <div className="space-y-1">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeModule === item.id;

          let badgeNode = null;
          if (item.id === 'preorder' && activePOCount > 0) {
            badgeNode = (
              <span className="ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-800">
                {activePOCount}
              </span>
            );
          } else if (item.id === 'stok' && lowStockCount > 0) {
            badgeNode = (
              <span className="ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-rose-100 text-rose-800 animate-pulse">
                {lowStockCount} Min
              </span>
            );
          }

          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all group cursor-pointer ${
                isActive
                  ? 'bg-[#0F5132] text-white shadow-xs'
                  : 'text-gray-600 hover:bg-[#FAF9F6] hover:text-[#0F5132]'
              }`}
            >
              <Icon
                className={`w-4.5 h-4.5 transition-transform group-hover:scale-110 ${
                  isActive ? 'text-[#FEF9E7]' : 'text-gray-400 group-hover:text-[#0F5132]'
                }`}
              />
              <span className="tracking-tight">{item.label}</span>
              {badgeNode}
              {isActive && !badgeNode && (
                <ChevronRight className="w-4 h-4 ml-auto text-emerald-200" />
              )}
            </button>
          );
        })}
      </div>

      {/* Farm Quick Badge & Current User Card */}
      <div className="mt-auto pt-4 space-y-3">
        {/* User Card */}
        <div className="p-3 rounded-2xl bg-gray-50 border border-gray-200 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div
              className={`w-8 h-8 rounded-xl flex items-center justify-center text-white font-bold text-xs shrink-0 ${
                isOwner ? 'bg-[#0F5132]' : 'bg-slate-600'
              }`}
            >
              {data.currentUser.name.charAt(0)}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-gray-900 truncate">
                {data.currentUser.name}
              </p>
              <p className="text-[10px] text-gray-500 truncate font-mono">
                {data.currentUser.email}
              </p>
            </div>
          </div>

          {onLogout && (
            <button
              onClick={onLogout}
              className="p-1.5 rounded-lg text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
              title="Keluar (Logout)"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="p-3 rounded-xl bg-gradient-to-br from-[#FAF9F6] to-emerald-50/50 border border-emerald-900/10">
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-[#0F5132]"></span>
            <p className="text-[11px] font-bold text-[#0F5132] uppercase tracking-wider">
              {data.settings.currency} Terpadu
            </p>
          </div>
          <p className="text-[10px] text-gray-500 leading-snug">
            Input sekali → Stok telur, kasir, keuangan & laporan ter-update seketika.
          </p>
        </div>
      </div>
    </aside>
  );
};

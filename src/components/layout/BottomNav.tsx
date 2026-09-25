import React from 'react';
import { 
  LayoutDashboard, 
  Egg, 
  ShoppingCart, 
  CalendarClock, 
  MoreHorizontal
} from 'lucide-react';
import { DatabaseSchema } from '../../types/database';

interface BottomNavProps {
  activeModule: string;
  onNavigate: (module: string) => void;
  data: DatabaseSchema;
  onOpenMoreMenu: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeModule,
  onNavigate,
  data,
  onOpenMoreMenu,
}) => {
  const activePOCount = data.preorders.filter(
    (p) => p.status !== 'selesai' && p.status !== 'dibatalkan'
  ).length;

  interface TabItem {
    id: 'dashboard' | 'produksi' | 'kasir' | 'preorder';
    label: string;
    icon: any;
    count?: number;
  }

  const PRIMARY_TABS: TabItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'produksi', label: 'Produksi', icon: Egg },
    { id: 'kasir', label: 'Kasir', icon: ShoppingCart },
    { id: 'preorder', label: 'Pre Order', icon: CalendarClock, count: activePOCount },
  ];

  const isMoreActive = ['stok', 'pelanggan', 'keuangan', 'laporan', 'pengaturan'].includes(activeModule);

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 px-2 py-1.5 shadow-lg flex items-center justify-around">
      {PRIMARY_TABS.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeModule === tab.id;

        return (
          <button
            key={tab.id}
            onClick={() => onNavigate(tab.id)}
            className={`flex flex-col items-center justify-center py-1 px-3 rounded-lg relative transition-colors ${
              isActive ? 'text-[#0F5132]' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <div className="relative">
              <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-[1.75]'}`} />
              {Boolean(tab.count && tab.count > 0) && (
                <span className="absolute -top-1 -right-2 bg-amber-500 text-white text-[9px] font-bold px-1 rounded-full">
                  {tab.count}
                </span>
              )}
            </div>
            <span className={`text-[10px] mt-0.5 ${isActive ? 'font-bold' : 'font-medium'}`}>
              {tab.label}
            </span>
          </button>
        );
      })}

      {/* More / Menu Button */}
      <button
        onClick={onOpenMoreMenu}
        className={`flex flex-col items-center justify-center py-1 px-3 rounded-lg relative transition-colors ${
          isMoreActive ? 'text-[#0F5132]' : 'text-gray-400 hover:text-gray-600'
        }`}
      >
        <MoreHorizontal className={`w-5 h-5 ${isMoreActive ? 'stroke-[2.5]' : 'stroke-[1.75]'}`} />
        <span className={`text-[10px] mt-0.5 ${isMoreActive ? 'font-bold' : 'font-medium'}`}>
          Lainnya
        </span>
      </button>
    </nav>
  );
};

import React, { useState, useEffect } from 'react';
import { db } from './services/db';
import { DatabaseSchema, User } from './types/database';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { BottomNav } from './components/layout/BottomNav';
import { MobileMenuDrawer } from './components/layout/MobileMenuDrawer';
import { QuickActionsModal } from './components/common/QuickActionsModal';
import { LoginView } from './components/auth/LoginView';

// Modules
import { DashboardModule } from './modules/Dashboard/DashboardModule';
import { ProduksiModule } from './modules/Produksi/ProduksiModule';
import { KasirModule } from './modules/Kasir/KasirModule';
import { PreOrderModule } from './modules/PreOrder/PreOrderModule';
import { StokModule } from './modules/Stok/StokModule';
import { PelangganModule } from './modules/Pelanggan/PelangganModule';
import { KeuanganModule } from './modules/Keuangan/KeuanganModule';
import { LaporanModule } from './modules/Laporan/LaporanModule';
import { PengaturanModule } from './modules/Pengaturan/PengaturanModule';

// Icons
import { ShieldAlert, ArrowLeft, Key } from 'lucide-react';

export default function App() {
  const [data, setData] = useState<DatabaseSchema>(db.getData());
  const [sessionUser, setSessionUser] = useState<User | null>(() => db.getAuthSession());
  const [activeModule, setActiveModule] = useState<string>('dashboard');
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState<boolean>(false);
  const [quickActionType, setQuickActionType] = useState<
    'production' | 'sale' | 'preorder' | 'expense' | 'feedUsage' | null
  >(null);

  // Subscribe to DB updates & sync auth session
  useEffect(() => {
    const unsubscribe = db.subscribe(() => {
      const currentData = db.getData();
      setData({ ...currentData });
      setSessionUser(db.getAuthSession());
    });
    return () => unsubscribe();
  }, []);

  const handleNavigate = (mod: string) => {
    setActiveModule(mod);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLogout = () => {
    db.logout();
    setSessionUser(null);
  };

  // If not logged in, display the Login View
  if (!sessionUser) {
    return (
      <LoginView
        data={data}
        onLoginSuccess={(user) => {
          setSessionUser(user);
        }}
      />
    );
  }

  // Permission checks
  const isOwner = sessionUser.role === 'owner';
  const hasAccessToKeuangan = isOwner || sessionUser.permissions?.canAccessKeuangan;
  const hasAccessToPengaturan = isOwner || sessionUser.permissions?.canAccessPengaturan;

  const renderAccessDenied = (moduleName: string) => (
    <div className="max-w-md mx-auto my-12 bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-sm text-center">
      <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-4">
        <ShieldAlert className="w-7 h-7" />
      </div>
      <h3 className="text-lg font-bold text-gray-900 mb-1">
        Hak Akses Terbatas: {moduleName}
      </h3>
      <p className="text-xs text-gray-500 mb-6 leading-relaxed">
        Akun Anda ({sessionUser.name} - {sessionUser.role}) tidak memiliki izin untuk membuka modul {moduleName}.
        Silakan hubungi Owner (<strong>septywanf@gmail.com</strong>) untuk membuka izin akses.
      </p>
      <div className="space-y-2">
        <button
          onClick={() => setActiveModule('dashboard')}
          className="w-full py-2.5 px-4 rounded-xl bg-[#0F5132] text-white font-bold text-xs hover:bg-[#0A3622] transition-colors flex items-center justify-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Dashboard</span>
        </button>
        <button
          onClick={handleLogout}
          className="w-full py-2.5 px-4 rounded-xl border border-gray-300 text-gray-700 font-bold text-xs hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
        >
          <Key className="w-4 h-4 text-gray-400" />
          <span>Login dengan Akun Lain</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F9FA] text-[#1F2937]">
      {/* Top Header */}
      <Header
        data={data}
        activeModule={activeModule}
        onOpenQuickAction={(action) => setQuickActionType(action)}
        onNavigate={handleNavigate}
        onLogout={handleLogout}
      />

      {/* Main Container */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto pb-20 md:pb-8">
        {/* Desktop Sidebar */}
        <Sidebar
          activeModule={activeModule}
          onNavigate={handleNavigate}
          data={data}
          onLogout={handleLogout}
        />

        {/* Content Area */}
        <main className="flex-1 p-3.5 sm:p-6 lg:p-8 min-w-0 max-w-full">
          {activeModule === 'dashboard' && (
            <DashboardModule
              data={data}
              onNavigate={handleNavigate}
              onOpenQuickAction={(action) => setQuickActionType(action)}
            />
          )}

          {activeModule === 'produksi' && <ProduksiModule data={data} />}

          {activeModule === 'kasir' && <KasirModule data={data} />}

          {activeModule === 'preorder' && <PreOrderModule data={data} />}

          {activeModule === 'stok' && <StokModule data={data} />}

          {activeModule === 'pelanggan' && <PelangganModule data={data} />}

          {activeModule === 'keuangan' &&
            (hasAccessToKeuangan ? (
              <KeuanganModule data={data} />
            ) : (
              renderAccessDenied('Keuangan')
            ))}

          {activeModule === 'laporan' && <LaporanModule data={data} />}

          {activeModule === 'pengaturan' &&
            (hasAccessToPengaturan ? (
              <PengaturanModule data={data} />
            ) : (
              renderAccessDenied('Pengaturan Farm')
            ))}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <BottomNav
        activeModule={activeModule}
        onNavigate={handleNavigate}
        data={data}
        onOpenMoreMenu={() => setIsMobileDrawerOpen(true)}
      />

      {/* Mobile Menu Drawer for extra modules */}
      <MobileMenuDrawer
        isOpen={isMobileDrawerOpen}
        onClose={() => setIsMobileDrawerOpen(false)}
        activeModule={activeModule}
        onNavigate={handleNavigate}
        data={data}
        onLogout={handleLogout}
      />

      {/* Global Quick Action Modal */}
      <QuickActionsModal
        actionType={quickActionType}
        onClose={() => setQuickActionType(null)}
        data={data}
        onNavigate={handleNavigate}
      />
    </div>
  );
}

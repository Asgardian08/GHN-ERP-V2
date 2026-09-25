import React, { useState } from 'react';
import { db } from '../../services/db';
import { DatabaseSchema, User } from '../../types/database';
import { 
  Egg, 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  AlertCircle,
  Sparkles,
  CheckCircle2,
  ShieldAlert
} from 'lucide-react';

interface LoginViewProps {
  onLoginSuccess: (user: User) => void;
  data: DatabaseSchema;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLoginSuccess, data }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email.trim() || !password) {
      setErrorMessage('Silakan masukkan email dan kata sandi.');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      const result = db.login(email, password);
      setIsLoading(false);

      if (result.success && result.user) {
        onLoginSuccess(result.user);
      } else {
        setErrorMessage(result.error || 'Email atau kata sandi tidak cocok.');
      }
    }, 300);
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-[#0A3622] via-[#0F5132] to-[#17442F] p-4 sm:p-6 lg:p-8 text-white relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-[#D4AF37]/10 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-emerald-400/10 blur-3xl pointer-events-none" />

      {/* Main Login Card */}
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl text-gray-900 border border-[#D4AF37]/30 overflow-hidden relative z-10 animate-in fade-in zoom-in-95 duration-300">
        {/* Header Ribbon */}
        <div className="bg-gradient-to-r from-[#0F5132] to-[#145A32] p-6 sm:p-8 text-white text-center relative">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md ring-2 ring-[#D4AF37]/50 shadow-inner mb-3">
            <Egg className="w-9 h-9 text-[#FEF9E7]" />
          </div>
          
          <h1 className="text-2xl font-black tracking-tight text-white flex items-center justify-center gap-2">
            GHN ERP <span className="text-[#D4AF37] text-xs font-bold px-2 py-0.5 rounded bg-black/20 border border-[#D4AF37]/40 uppercase tracking-widest">LITE V2</span>
          </h1>
          <p className="text-xs text-emerald-100 font-medium mt-1">
            {data.settings.farmName || 'GHN Egg Farm Nusantara'}
          </p>
          <div className="mt-2 inline-flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-full bg-white/10 text-emerald-200 border border-white/10">
            <Sparkles className="w-3 h-3 text-[#D4AF37]" />
            <span>Sistem Operasi Terintegrasi Peternakan Telur</span>
          </div>
        </div>

        {/* Card Body */}
        <div className="p-6 sm:p-8 space-y-6">
          {/* Error Message */}
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2.5 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="flex-1 font-medium">{errorMessage}</div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                Email Pengguna
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Masukkan email Anda..."
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-300 text-xs sm:text-sm focus:ring-2 focus:ring-[#0F5132] focus:border-[#0F5132] transition-all bg-[#FAF9F6]"
                  autoComplete="email"
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-xs font-bold text-gray-700">
                  Kata Sandi (Password)
                </label>
                <span className="text-[11px] text-gray-400">Peka huruf besar/kecil</span>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan kata sandi..."
                  className="w-full pl-9 pr-10 py-2.5 rounded-xl border border-gray-300 text-xs sm:text-sm focus:ring-2 focus:ring-[#0F5132] focus:border-[#0F5132] transition-all bg-[#FAF9F6]"
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center gap-2 cursor-pointer select-none text-gray-600">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-gray-300 text-[#0F5132] focus:ring-[#0F5132]"
                />
                <span>Ingat sesi saya</span>
              </label>
              <button
                type="button"
                className="text-[11px] text-[#0F5132] font-semibold hover:underline cursor-pointer"
                onClick={() => alert('Untuk bantuan kata sandi atau akun, silakan hubungi Owner Peternakan.')}
              >
                Bantuan Login
              </button>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 bg-[#0F5132] hover:bg-[#0A3622] text-white py-3 px-4 rounded-xl font-bold text-sm shadow-md hover:shadow-lg transition-all active:scale-98 disabled:opacity-75 disabled:cursor-not-allowed cursor-pointer"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Memverifikasi Akun...</span>
                </>
              ) : (
                <>
                  <span>Masuk ke GHN ERP</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Keamanan Informasi */}
          <div className="pt-2 text-center">
            <p className="text-[11px] text-gray-400 flex items-center justify-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-gray-400" />
              <span>Hanya untuk personil berwenang GHN Egg Farm</span>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-[#FAF9F6] border-t border-gray-100 px-6 py-3 text-center text-[11px] text-gray-500 flex items-center justify-center gap-2">
          <CheckCircle2 className="w-3.5 h-3.5 text-[#0F5132]" />
          <span>Satu Basis Data • Input Sekali Otomatis Terhubung</span>
        </div>
      </div>

      <p className="text-xs text-white/60 mt-6 text-center">
        © 2026 GHN Egg Farm Nusantara • Seluruh Hak Cipta Dilindungi
      </p>
    </div>
  );
};

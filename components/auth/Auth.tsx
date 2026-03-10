"use client";

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Mail, Lock, ArrowRight } from 'lucide-react';

interface AuthProps {
  onLogin: (user: any) => void;
}

export function Auth({ onLogin }: AuthProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // Placeholder for Supabase Google Login
  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      // Logic for Supabase Google Auth will go here
      // const { data, error } = await supabase.auth.signInWithOAuth({ provider: 'google' });
      console.log("Initiating Google Login...");
      onLogin({ name: 'Mẹ Bỉm Sữa', email: 'google-user@gmail.com' });
    } catch (error) {
      console.error("Google Login Error:", error);
    } finally {
      setLoading(false);
    }
  };

  // Placeholder for Supabase Email/Password Login
  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isLogin) {
        // const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        console.log("Logging in with Email...");
      } else {
        // const { data, error } = await supabase.auth.signUp({ email, password });
        console.log("Signing up with Email...");
      }
      onLogin({ email, name: email.split('@')[0] });
    } catch (error) {
      console.error("Email Auth Error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[300] bg-white flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-20 h-20 bg-[#0EA5E9] rounded-3xl mx-auto mb-6 flex items-center justify-center shadow-xl shadow-blue-500/20"
          >
            <h1 className="text-white text-4xl font-black tracking-tighter">C</h1>
          </motion.div>
          <h2 className="text-3xl font-black tracking-tight text-[#0F172A]">CAO AI</h2>
          <p className="text-gray-500 mt-2 font-medium">Trợ lý dinh dưỡng chuẩn WHO</p>
        </div>

        <div className="space-y-4">
          <button 
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full py-4 px-6 bg-white border-2 border-gray-100 rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-gray-50 transition-colors shadow-sm"
          >
            <svg width="20" height="20" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-1 .67-2.28 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.67-.35-1.39-.35-2.09s.13-1.42.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Tiếp tục với Google
          </button>
        </div>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-100"></div>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-4 text-gray-400 font-bold tracking-widest">HOẶC DÙNG EMAIL</span>
          </div>
        </div>

        <form onSubmit={handleEmailAuth} className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Email</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input 
                type="email" 
                required
                placeholder="me@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-gray-50 border-none rounded-2xl py-4 pl-12 pr-6 font-bold focus:ring-2 focus:ring-blue-500 transition-all"
              />
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center ml-1">
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Mật khẩu</label>
              {isLogin && (
                <button type="button" className="text-xs font-bold text-blue-600 hover:underline">Quên mật khẩu?</button>
              )}
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input 
                type="password" 
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-gray-50 border-none rounded-2xl py-4 pl-12 pr-6 font-bold focus:ring-2 focus:ring-blue-500 transition-all"
              />
            </div>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-[#0EA5E9] text-white rounded-2xl font-bold text-lg flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 hover:bg-[#0284C7] transition-colors"
          >
            {isLogin ? 'Đăng nhập' : 'Đăng ký'} <ArrowRight className="w-5 h-5" />
          </button>
        </form>

        <p className="text-center text-sm font-medium text-gray-500">
          {isLogin ? 'Chưa có tài khoản?' : 'Đăng ký ngay'} {' '}
          <button 
            onClick={() => setIsLogin(!isLogin)}
            className="text-blue-600 font-bold hover:underline"
          >
            {isLogin ? 'Đăng ký ngay' : 'Đăng nhập'}
          </button>
        </p>
      </div>
    </div>
  );
}

"use client";

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowRight, User, Ruler, Weight, Activity, Target, Check } from 'lucide-react';

interface OnboardingProps {
  onComplete: (profile: any) => void;
}

export function Onboarding({ onComplete }: OnboardingProps) {
  const [step, setStep] = useState(1);
  const [profile, setProfile] = useState({
    name: '',
    gender: 'male',
    age: 13,
    height: 150,
    weight: 45,
    activityLevel: 'moderate',
    goal: 'gain',
  });

  const nextStep = () => setStep(step + 1);
  const prevStep = () => setStep(step - 1);

  const handleSubmit = () => {
    if (!profile.name) {
      alert("Vui lòng nhập tên của bé");
      return;
    }
    onComplete(profile);
  };

  return (
    <div className="fixed inset-0 z-[200] bg-white flex flex-col items-center justify-center px-6 overflow-y-auto pt-10 pb-10">
      <div className="w-full max-w-md">
        {/* Progress Bar */}
        <div className="flex gap-2 mb-12">
          {[1, 2, 3].map((s) => (
            <div 
              key={s} 
              className={`h-1.5 flex-1 rounded-full transition-colors ${s <= step ? 'bg-[#0EA5E9]' : 'bg-gray-100'}`}
            />
          ))}
        </div>

        {step === 1 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-8"
          >
            <div>
              <h1 className="text-3xl font-black tracking-tight mb-2">Thông tin của bé</h1>
              <p className="text-gray-500 font-medium">Hãy cho CAO AI biết một chút về bé để tính toán phác đồ chuẩn WHO nhé.</p>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3 ml-1">Tên của bé</label>
                <input 
                  type="text" 
                  placeholder="Ví dụ: Tuấn Anh"
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  className="w-full bg-gray-50 border-none rounded-2xl py-4 px-6 font-bold text-lg focus:ring-2 focus:ring-blue-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3 ml-1 flex items-center gap-2">
                  Giới tính
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <button 
                    onClick={() => setProfile({ ...profile, gender: 'male' })}
                    className={`py-4 rounded-2xl font-bold border-2 transition-all ${profile.gender === 'male' ? 'border-blue-500 bg-blue-50 text-blue-600' : 'border-gray-100 text-gray-500'}`}
                  >
                    Nam
                  </button>
                  <button 
                    onClick={() => setProfile({ ...profile, gender: 'female' })}
                    className={`py-4 rounded-2xl font-bold border-2 transition-all ${profile.gender === 'female' ? 'border-blue-500 bg-blue-50 text-blue-600' : 'border-gray-100 text-gray-500'}`}
                  >
                    Nữ
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3 ml-1">Tuổi (8 - 18 tuổi)</label>
                <input 
                  type="number" 
                  min="8"
                  max="18"
                  value={profile.age}
                  onChange={(e) => setProfile({ ...profile, age: parseInt(e.target.value) })}
                  className="w-full bg-gray-50 border-none rounded-2xl py-4 px-6 font-bold text-lg focus:ring-2 focus:ring-blue-500 transition-all"
                />
              </div>
            </div>

            <button 
              onClick={nextStep}
              className="w-full py-4 bg-[#0EA5E9] text-white rounded-2xl font-bold text-lg flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20"
            >
              Tiếp theo <ArrowRight className="w-5 h-5" />
            </button>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-8"
          >
            <div>
              <h1 className="text-3xl font-bold mb-2">Chỉ số cơ thể</h1>
              <p className="text-gray-500 dark:text-gray-400">Chiều cao và cân nặng hiện tại của bạn.</p>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold mb-3 flex items-center gap-2">
                  <Ruler className="w-4 h-4 text-emerald-500" /> Chiều cao (cm)
                </label>
                <input 
                  type="number" 
                  value={profile.height}
                  onChange={(e) => setProfile({ ...profile, height: parseInt(e.target.value) })}
                  className="w-full bg-gray-50 dark:bg-zinc-900 border-none rounded-2xl py-4 px-6 font-bold text-lg focus:ring-2 focus:ring-emerald-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-bold mb-3 flex items-center gap-2">
                  <Weight className="w-4 h-4 text-emerald-500" /> Cân nặng (kg)
                </label>
                <input 
                  type="number" 
                  value={profile.weight}
                  onChange={(e) => setProfile({ ...profile, weight: parseInt(e.target.value) })}
                  className="w-full bg-gray-50 dark:bg-zinc-900 border-none rounded-2xl py-4 px-6 font-bold text-lg focus:ring-2 focus:ring-emerald-500 transition-all"
                />
              </div>
            </div>

            <div className="flex gap-4">
              <button 
                onClick={prevStep}
                className="flex-1 py-4 bg-gray-100 dark:bg-zinc-800 rounded-2xl font-bold text-lg"
              >
                Quay lại
              </button>
              <button 
                onClick={nextStep}
                className="flex-[2] py-4 bg-emerald-500 text-white rounded-2xl font-bold text-lg flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
              >
                Tiếp theo <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-8"
          >
            <div>
              <h1 className="text-3xl font-bold mb-2">Lối sống & Mục tiêu</h1>
              <p className="text-gray-500 dark:text-gray-400">Cuối cùng, hãy chọn mức độ vận động và mục tiêu của bạn.</p>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold mb-3 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-emerald-500" /> Mức độ vận động
                </label>
                <select 
                  value={profile.activityLevel}
                  onChange={(e) => setProfile({ ...profile, activityLevel: e.target.value })}
                  className="w-full bg-gray-50 dark:bg-zinc-900 border-none rounded-2xl py-4 px-6 font-bold text-lg focus:ring-2 focus:ring-emerald-500 transition-all appearance-none"
                >
                  <option value="sedentary">Ít vận động</option>
                  <option value="light">Vận động nhẹ</option>
                  <option value="moderate">Vận động vừa phải</option>
                  <option value="active">Vận động nhiều</option>
                  <option value="very_active">Vận động rất nhiều</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold mb-3 flex items-center gap-2">
                  <Target className="w-4 h-4 text-emerald-500" /> Mục tiêu
                </label>
                <select 
                  value={profile.goal}
                  onChange={(e) => setProfile({ ...profile, goal: e.target.value })}
                  className="w-full bg-gray-50 dark:bg-zinc-900 border-none rounded-2xl py-4 px-6 font-bold text-lg focus:ring-2 focus:ring-emerald-500 transition-all appearance-none"
                >
                  <option value="lose">Giảm cân</option>
                  <option value="maintain">Duy trì cân nặng</option>
                  <option value="gain">Tăng cân</option>
                </select>
              </div>
            </div>

            <div className="flex gap-4">
              <button 
                onClick={prevStep}
                className="flex-1 py-4 bg-gray-100 dark:bg-zinc-800 rounded-2xl font-bold text-lg"
              >
                Quay lại
              </button>
              <button 
                onClick={handleSubmit}
                className="flex-[2] py-4 bg-emerald-500 text-white rounded-2xl font-bold text-lg flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
              >
                Bắt đầu ngay <Check className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

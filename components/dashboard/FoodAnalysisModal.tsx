"use client";

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Image from 'next/image';
import { X, Check, Loader2, AlertCircle, Zap } from 'lucide-react';

interface FoodAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  isLoading: boolean;
  imageSrc: string | null;
  result: any | null;
  error: string | null;
  onSave: (meal: any) => void;
}

export function FoodAnalysisModal({
  isOpen,
  onClose,
  isLoading,
  imageSrc,
  result,
  error,
  onSave,
}: FoodAnalysisModalProps) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4 sm:p-0">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        />
        <motion.div
          initial={{ opacity: 0, y: 100, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 100, scale: 0.95 }}
          className="relative w-full max-w-md bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="flex justify-between items-center p-4 border-b border-gray-100 dark:border-zinc-800">
            <h3 className="font-bold text-lg">Ghi lại bữa ăn</h3>
            <button
              onClick={onClose}
              className="p-2 rounded-full bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="overflow-y-auto flex-1 p-4">
            {/* Image Preview */}
            {imageSrc && (
              <div className="relative w-full h-48 rounded-2xl overflow-hidden mb-6 bg-gray-100 dark:bg-zinc-800">
                <Image 
                  src={imageSrc} 
                  alt="Food preview" 
                  fill 
                  className="object-cover"
                  referrerPolicy="no-referrer"
                />
                {isLoading && (
                  <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-white z-10">
                    <Loader2 className="w-8 h-8 animate-spin mb-2" />
                    <p className="font-medium animate-pulse">AI đang ngửi mùi món ăn...</p>
                  </div>
                )}
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="bg-red-50 dark:bg-red-500/10 text-red-600 p-4 rounded-2xl flex items-start gap-3">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <p className="text-sm font-medium">{error}</p>
              </div>
            )}

            {/* Result State */}
            {!isLoading && result && (
              <div className="space-y-6">
                {!result.is_food ? (
                  <div className="bg-orange-50 dark:bg-orange-500/10 text-orange-600 p-4 rounded-2xl flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                    <p className="text-sm font-medium">Hình như đây không phải là đồ ăn. Vui lòng chụp lại nhé!</p>
                  </div>
                ) : (
                  <>
                    <div>
                      <h4 className="text-xl font-bold mb-1">{result.meal_name}</h4>
                      <div className="flex items-center justify-between">
                        <div className="flex items-end gap-2">
                          <span className="text-3xl font-black text-emerald-500">{result.total_calories}</span>
                          <span className="text-gray-500 dark:text-gray-400 font-medium mb-1">kcal</span>
                        </div>
                        <div className="bg-blue-50 px-4 py-2 rounded-2xl flex items-center gap-2 border border-blue-100">
                          <Zap className="w-4 h-4 text-blue-500" />
                          <span className="font-black text-blue-600">+{result.xp_earned} XP</span>
                        </div>
                      </div>
                    </div>

                    {/* Macros */}
                    <div className="grid grid-cols-4 gap-2">
                      <div className="bg-emerald-50 p-2 rounded-xl text-center">
                        <p className="text-[9px] font-black text-emerald-600 uppercase tracking-wider mb-0.5">Đạm</p>
                        <p className="font-bold text-xs text-emerald-700">{result.total_macros.protein}g</p>
                      </div>
                      <div className="bg-blue-50 p-2 rounded-xl text-center">
                        <p className="text-[9px] font-black text-blue-600 uppercase tracking-wider mb-0.5">Canxi</p>
                        <p className="font-bold text-xs text-blue-700">{result.total_macros.calcium}mg</p>
                      </div>
                      <div className="bg-amber-50 p-2 rounded-xl text-center">
                        <p className="text-[9px] font-black text-amber-600 uppercase tracking-wider mb-0.5">D3</p>
                        <p className="font-bold text-xs text-amber-700">{result.total_macros.vitamin_d3}IU</p>
                      </div>
                      <div className="bg-indigo-50 p-2 rounded-xl text-center">
                        <p className="text-[9px] font-black text-indigo-600 uppercase tracking-wider mb-0.5">K2</p>
                        <p className="font-bold text-xs text-indigo-700">{result.total_macros.vitamin_k2}mcg</p>
                      </div>
                    </div>

                    {/* AI Response Sections */}
                    <div className="space-y-4">
                      {/* Recognition */}
                      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                        <h5 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">👩‍🍳 Nhận diện từ chuyên gia</h5>
                        <p className="text-sm text-gray-700 leading-relaxed">{result.recognition_text}</p>
                      </div>

                      {/* WHO Analysis */}
                      <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100">
                        <h5 className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-2">📊 Phân tích theo WHO</h5>
                        <p className="text-sm text-emerald-900 leading-relaxed font-medium">{result.who_analysis}</p>
                      </div>

                      {/* Education Corner */}
                      <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100">
                        <h5 className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-2">💡 Góc Giáo Dục Y Khoa</h5>
                        <p className="text-sm text-blue-900 leading-relaxed italic">{result.education_corner}</p>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Footer Actions */}
          {!isLoading && result && result.is_food && (
            <div className="p-4 border-t border-gray-100 bg-white">
              <button
                onClick={() => onSave(result)}
                className="w-full py-4 bg-[#0EA5E9] hover:bg-[#0284C7] text-white rounded-2xl font-bold text-lg flex items-center justify-center gap-2 transition-colors shadow-lg shadow-blue-500/20"
              >
                <Check className="w-6 h-6" />
                ✅ Lưu bữa ăn & Nhận {result.xp_earned} XP
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

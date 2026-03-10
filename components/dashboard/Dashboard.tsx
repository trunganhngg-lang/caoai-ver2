"use client";

import React, { useState, useRef, useCallback } from 'react';
import { ProgressRing } from '@/components/ui/ProgressRing';
import { Camera, Flame, Sun, Bone, Beef, Target, Trophy, Moon, Zap, ShoppingCart } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { FoodAnalysisModal } from './FoodAnalysisModal';

import Image from 'next/image';
import { GoogleGenAI, Type } from "@google/genai";
import { Onboarding } from './Onboarding';
import { Auth } from '@/components/auth/Auth';

export function Dashboard() {
  const [user, setUser] = useState<any | null>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [streak, setStreak] = useState(5);
  const [exerciseDone, setExerciseDone] = useState(false);
  const [sleepDone, setSleepDone] = useState(false);
  const [dailyXP, setDailyXP] = useState(0);
  const [showEndDayFeedback, setShowEndDayFeedback] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getWHOTargetHeight = (age: number, gender: string) => {
    // Simplified WHO Height-for-age 50th percentile (cm)
    const standards: any = {
      male: { 9: 133.3, 10: 138.4, 11: 143.5, 12: 149.1, 13: 156.2, 14: 163.8, 15: 170.1, 16: 173.4, 17: 175.2, 18: 176.1 },
      female: { 9: 133.3, 10: 138.6, 11: 144.0, 12: 151.2, 13: 157.1, 14: 159.8, 15: 161.7, 16: 162.5, 17: 162.9, 18: 163.7 }
    };
    return standards[gender]?.[age] || (gender === 'male' ? 176 : 163);
  };

  const getWHONutrientGoals = (age: number) => {
    if (age >= 9 && age <= 13) {
      return { calcium: 1000, vitamin_d3: 600, vitamin_k2: 60 };
    } else if (age >= 14 && age <= 18) {
      return { calcium: 1300, vitamin_d3: 600, vitamin_k2: 75 };
    }
    return { calcium: 1200, vitamin_d3: 600, vitamin_k2: 90 };
  };

  const analyzeMeal = async (base64Data: string, mimeType: string) => {
    try {
      const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error("Vui lòng cấu hình API Key trong mục Settings > Secrets.");
      }

      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: {
          parts: [
            {
              inlineData: {
                data: base64Data,
                mimeType: mimeType,
              },
            },
            {
              text: `Bạn là một CHUYÊN GIA DINH DƯỠNG Y KHOA siêu tận tâm, thấu hiểu nỗi vất vả của người mẹ Việt Nam.
Nhiệm vụ của bạn là phân tích mâm cơm cho bé ${profile?.name} (${profile?.age} tuổi, ${profile?.gender === 'male' ? 'Nam' : 'Nữ'}) để giúp bé đạt chuẩn WHO.

Nguyên tắc tư vấn:
1. Tuyệt đối không trách móc khi bữa ăn thiếu chất.
2. Luôn kết thúc bằng một giải pháp thực tế cho bữa ăn tiếp theo từ nguyên liệu chợ Việt Nam (VD: tôm tép nhỏ, rau cải ngọt, trứng, đậu phụ...).
3. Văn phong ấm áp, khích lệ, coi mình là người đồng hành cùng mẹ.

Cấu trúc phản hồi JSON phải bao gồm:
1. is_food: boolean
2. meal_name: string
3. total_calories: number
4. total_macros: { protein: number, calcium: number, vitamin_d3: number, vitamin_k2: number }
5. recognition_text: Lời khen ngợi ấm áp về nỗ lực của mẹ.
6. who_analysis: Phân tích nhẹ nhàng dựa trên chuẩn WHO.
7. education_corner: Giải thích y khoa ngắn gọn và ĐƯA RA GIẢI PHÁP thực tế từ nguyên liệu chợ Việt cho bữa sau.
8. xp_earned: number (Tối đa 50 XP).

CHỈ TRẢ VỀ ĐỊNH DẠNG JSON, KHÔNG THÊM VĂN BẢN NGOÀI JSON.`,
            },
          ],
        },
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              is_food: { type: Type.BOOLEAN },
              meal_name: { type: Type.STRING },
              total_calories: { type: Type.NUMBER },
              total_macros: {
                type: Type.OBJECT,
                properties: {
                  protein: { type: Type.NUMBER },
                  calcium: { type: Type.NUMBER },
                  vitamin_d3: { type: Type.NUMBER },
                  vitamin_k2: { type: Type.NUMBER },
                },
              },
              recognition_text: { type: Type.STRING },
              who_analysis: { type: Type.STRING },
              education_corner: { type: Type.STRING },
              xp_earned: { type: Type.NUMBER },
            },
            required: ["is_food", "meal_name", "total_calories", "total_macros", "recognition_text", "who_analysis", "education_corner", "xp_earned"],
          },
        },
      });

      if (!response.text) {
        throw new Error("AI không trả về kết quả. Vui lòng thử lại.");
      }

      return JSON.parse(response.text);
    } catch (err: any) {
      console.error("Gemini Error:", err);
      if (err.message?.includes("API key not valid")) {
        throw new Error("API Key không hợp lệ. Vui lòng kiểm tra lại trong mục Settings > Secrets.");
      }
      throw err;
    }
  };

  // User Profile and Goals
  const [goals, setGoals] = useState({
    calories: 2000,
    protein: 150,
    calcium: 1200,
    vitamin_d3: 600,
    vitamin_k2: 90,
  });

  const [consumed, setConsumed] = useState({
    calories: 0,
    protein: 0,
    calcium: 0,
    vitamin_d3: 0,
    vitamin_k2: 0,
  });

  const [meals, setMeals] = useState<any[]>([]);

  const calculateGoals = useCallback((userProfile: any) => {
    const { gender, age, height, weight, activityLevel, goal } = userProfile;
    setProfile(userProfile);
    
    // BMR (Mifflin-St Jeor Equation)
    let bmr = (10 * weight) + (6.25 * height) - (5 * age);
    bmr = gender === 'male' ? bmr + 5 : bmr - 161;
    
    // TDEE
    const multipliers: any = {
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      active: 1.725,
      very_active: 1.9
    };
    let tdee = bmr * (multipliers[activityLevel] || 1.2);
    
    // Goal Adjustment
    if (goal === 'lose') tdee -= 500;
    if (goal === 'gain') tdee += 500;
    
    const calorieGoal = Math.round(tdee);
    const proteinGoal = Math.round(weight * 1.8); // 1.8g per kg
    
    const whoNutrients = getWHONutrientGoals(age);

    setGoals({
      calories: calorieGoal,
      protein: proteinGoal,
      ...whoNutrients
    });
    
    localStorage.setItem('user_profile', JSON.stringify(userProfile));
    setShowOnboarding(false);
  }, []);

  // Check for existing profile on mount
  React.useEffect(() => {
    const savedUser = localStorage.getItem('user_session');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }

    const savedProfile = localStorage.getItem('user_profile');
    if (savedProfile) {
      calculateGoals(JSON.parse(savedProfile));
    } else {
      setShowOnboarding(true);
    }

    const savedMeals = localStorage.getItem('today_meals');
    if (savedMeals) {
      const parsedMeals = JSON.parse(savedMeals);
      setMeals(parsedMeals);
      
      const totals = parsedMeals.reduce((acc: any, meal: any) => ({
        calories: acc.calories + meal.calories,
        protein: acc.protein + meal.macros.p,
        calcium: acc.calcium + meal.macros.ca,
        vitamin_d3: acc.vitamin_d3 + (meal.macros.d3 || 0),
        vitamin_k2: acc.vitamin_k2 + (meal.macros.k2 || 0),
        xp: acc.xp + (meal.xp || 0),
      }), { calories: 0, protein: 0, calcium: 0, vitamin_d3: 0, vitamin_k2: 0, xp: 0 });
      
      setConsumed(totals);
      setDailyXP(prev => Math.min(100, totals.xp + (exerciseDone ? 25 : 0) + (sleepDone ? 25 : 0)));
    }

    const savedHabits = localStorage.getItem('today_habits');
    if (savedHabits) {
      const { exercise, sleep } = JSON.parse(savedHabits);
      setExerciseDone(exercise);
      setSleepDone(sleep);
    }
  }, [calculateGoals, exerciseDone, sleepDone]);

  const toggleExercise = () => {
    const newState = !exerciseDone;
    setExerciseDone(newState);
    localStorage.setItem('today_habits', JSON.stringify({ exercise: newState, sleep: sleepDone }));
  };

  const toggleSleep = () => {
    const newState = !sleepDone;
    setSleepDone(newState);
    localStorage.setItem('today_habits', JSON.stringify({ exercise: exerciseDone, sleep: newState }));
  };

  const handleLogin = (userData: any) => {
    setUser(userData);
    localStorage.setItem('user_session', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user_session');
  };

  const handleCameraClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Reset state
    setError(null);
    setAnalysisResult(null);
    setIsModalOpen(true);
    setIsLoading(true);

    // Create object URL for preview
    const objectUrl = URL.createObjectURL(file);
    setImageSrc(objectUrl);

    try {
      // Convert to base64
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = async () => {
        const base64String = reader.result as string;
        // Extract base64 data and mime type
        const matches = base64String.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
        
        if (matches && matches.length === 3) {
          const mimeType = matches[1];
          const base64Data = matches[2];
          
          // Call Gemini API directly from client
          const result = await analyzeMeal(base64Data, mimeType);
          setAnalysisResult(result);
        } else {
          throw new Error("Invalid image format");
        }
        setIsLoading(false);
      };
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Có lỗi xảy ra khi phân tích ảnh. Vui lòng thử lại.");
      setIsLoading(false);
    }
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSaveMeal = (mealData: any) => {
    if (!mealData || !mealData.is_food) return;

    const newMeal = {
      id: Date.now(),
      name: mealData.meal_name,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      calories: mealData.total_calories,
      macros: {
        p: mealData.total_macros.protein || 0,
        ca: mealData.total_macros.calcium || 0,
        d3: mealData.total_macros.vitamin_d3 || 0,
        k2: mealData.total_macros.vitamin_k2 || 0,
      },
      xp: mealData.xp_earned || 0,
      image: imageSrc || 'https://picsum.photos/seed/newmeal/100/100',
    };

    const updatedMeals = [newMeal, ...meals];
    setMeals(updatedMeals);
    localStorage.setItem('today_meals', JSON.stringify(updatedMeals));

    setConsumed({
      calories: consumed.calories + newMeal.calories,
      protein: consumed.protein + newMeal.macros.p,
      calcium: consumed.calcium + newMeal.macros.ca,
      vitamin_d3: consumed.vitamin_d3 + newMeal.macros.d3,
      vitamin_k2: consumed.vitamin_k2 + newMeal.macros.k2,
    });
    setIsModalOpen(false);
  };

  const pProgress = Math.min((consumed.protein / goals.protein) * 100, 100);
  const caProgress = Math.min((consumed.calcium / goals.calcium) * 100, 100);
  const d3Progress = Math.min((consumed.vitamin_d3 / goals.vitamin_d3) * 100, 100);
  const k2Progress = Math.min((consumed.vitamin_k2 / goals.vitamin_k2) * 100, 100);

  const targetHeight = getWHOTargetHeight(profile?.age || 13, profile?.gender || 'male');
  const heightDifference = Math.max(0, targetHeight - (profile?.height || 0)).toFixed(1);

  const currentXP = Math.min(100, (meals.reduce((sum, m) => sum + (m.xp || 0), 0)) + (exerciseDone ? 25 : 0) + (sleepDone ? 25 : 0));

  const handleEndDay = () => {
    setShowEndDayFeedback(true);
  };

  const getEndDayMessage = () => {
    if (currentXP >= 100) {
      return {
        title: "Tuyệt vời mẹ ơi! 🎉",
        content: "Bé đã nạp đủ 100% năng lượng để kích hoạt Gene cao hôm nay. Đêm nay xương bé sẽ có đủ nguyên liệu để dài thêm trong lúc ngủ đó mẹ!",
        fact: "Fact y khoa: 90% sự phát triển chiều cao diễn ra vào ban đêm khi bé ngủ sâu.",
        button: "Hẹn gặp mẹ sáng mai!"
      };
    } else {
      return {
        title: "Mẹ con mình đã cố gắng rất tốt! 💪",
        content: `Hôm nay bé đạt ${currentXP} XP. Mẹ đừng lo lắng nhé, hành trình này là một cuộc chạy marathon.`,
        fact: "Gợi ý cho mai: Bữa nay hơi thiếu K2, ngày mai mẹ nhớ thêm món trứng rán hoặc đậu phụ nhé. Hẹn gặp mẹ vào sáng mai!",
        button: "Lưu tiến độ & Nghỉ ngơi"
      };
    }
  };

  const feedback = getEndDayMessage();

  return (
    <div className="max-w-md mx-auto px-6 pt-12 pb-24 relative min-h-screen bg-[#F8FAFC]">
      {!user && <Auth onLogin={handleLogin} />}
      {user && showOnboarding && <Onboarding onComplete={calculateGoals} />}
      
      {/* Header with Streak */}
      <header className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-orange-50 flex items-center justify-center shadow-sm">
            <Flame className={`w-7 h-7 ${currentXP >= 100 ? 'text-orange-500 fill-orange-500' : 'text-gray-300'}`} />
          </div>
          <div>
            <h1 className="text-xl font-black text-[#0F172A] leading-none">{streak} Ngày</h1>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Chuỗi Kỷ Lục 🔥</p>
          </div>
        </div>
        <button 
          onClick={handleLogout}
          className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden relative border-2 border-white shadow-sm"
        >
          <Image 
            src={`https://picsum.photos/seed/${user?.email || 'avatar'}/100/100`} 
            alt="Profile" 
            fill 
            className="object-cover"
            referrerPolicy="no-referrer"
          />
        </button>
      </header>

      {/* Growth Progress Ring (Duolingo Style) */}
      <section className="mb-10 flex flex-col items-center">
        <div className="relative w-64 h-64 flex items-center justify-center">
          <ProgressRing 
            size={256} 
            strokeWidth={24} 
            progress={currentXP} 
            colorClass="text-blue-500"
          />
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8">
            <Zap className="w-8 h-8 text-blue-500 mb-2" />
            <h2 className="text-4xl font-black text-[#0F172A]">{currentXP}</h2>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">XP Hôm Nay</p>
            <p className="text-[11px] font-bold text-blue-600 mt-2 leading-tight">Năng lượng tạo xương</p>
          </div>
        </div>
        <p className="mt-6 text-sm font-bold text-gray-500 text-center px-4">
          {currentXP === 100 
            ? "Tuyệt vời! Bé đã nạp đủ 100% năng lượng để kích hoạt Gene cao hôm nay! 🚀" 
            : "Hoàn thành thêm nhiệm vụ để giữ vững chuỗi 🔥 kỷ lục mẹ nhé!"}
        </p>
      </section>

      {/* Child's Journey Section (Retention & Motivation) */}
      <section className="mb-10">
        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-6 rounded-3xl text-white shadow-xl shadow-blue-500/20 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl" />
          <h2 className="text-sm font-black uppercase tracking-widest mb-4 flex items-center gap-2 opacity-90">
            <Target className="w-4 h-4" /> Hành trình của {profile?.name || 'bé'}
          </h2>
          <div className="flex items-end gap-3 mb-4">
            <span className="text-4xl font-black">+{profile?.age && profile.age < 15 ? '8.5' : '4.2'}</span>
            <span className="text-xl font-bold mb-1 opacity-80">mm / tháng</span>
          </div>
          <p className="text-sm font-medium leading-relaxed opacity-90">
            Nếu mẹ giữ vững chuỗi ������ này trong 30 ngày tới, {profile?.name || 'bé'} có thể tăng thêm khoảng <span className="font-black underline">{(profile?.age && profile.age < 15 ? 8.5 : 4.2)}mm</span>.
          </p>
          <div className="mt-6 h-2 bg-white/20 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${(streak / 30) * 100}%` }}
              className="h-full bg-white rounded-full"
            />
          </div>
          <div className="flex justify-between mt-2 text-[10px] font-black uppercase tracking-widest opacity-70">
            <span>Ngày {streak}</span>
            <span>Mục tiêu 30 ngày</span>
          </div>
        </div>
      </section>

      {/* Daily Micro-habits */}
      <section className="grid grid-cols-2 gap-4 mb-10">
        <button 
          onClick={toggleExercise}
          className={`p-5 rounded-3xl border-2 transition-all flex flex-col items-center gap-3 ${exerciseDone ? 'bg-emerald-50 border-emerald-500 text-emerald-700' : 'bg-white border-gray-100 text-gray-400'}`}
        >
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${exerciseDone ? 'bg-emerald-500 text-white' : 'bg-gray-50 text-gray-400'}`}>
            <Trophy className="w-5 h-5" />
          </div>
          <div className="text-center">
            <p className="text-[10px] font-black uppercase tracking-widest mb-1">Vận Động</p>
            <p className="text-xs font-bold leading-tight">Nhảy dây 15&apos;</p>
          </div>
          <div className="mt-1 font-black text-xs">+25 XP</div>
        </button>

        <button 
          onClick={toggleSleep}
          className={`p-5 rounded-3xl border-2 transition-all flex flex-col items-center gap-3 ${sleepDone ? 'bg-indigo-50 border-indigo-500 text-indigo-700' : 'bg-white border-gray-100 text-gray-400'}`}
        >
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${sleepDone ? 'bg-indigo-500 text-white' : 'bg-gray-50 text-gray-400'}`}>
            <Moon className="w-5 h-5" />
          </div>
          <div className="text-center">
            <p className="text-[10px] font-black uppercase tracking-widest mb-1">Giấc Ngủ</p>
            <p className="text-xs font-bold leading-tight">Ngủ trước 22h</p>
          </div>
          <div className="mt-1 font-black text-xs">+25 XP</div>
        </button>
      </section>

      {/* Bone Building Nutrients (Simplified) */}
      <section className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 mb-10">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-sm font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
            <Bone className="w-4 h-4" /> Dinh Dưỡng (+50 XP)
          </h2>
          <span className="text-xs font-black text-blue-600">+{Math.min(50, Math.round((caProgress + d3Progress + k2Progress) / 6))} XP</span>
        </div>
        
        <div className="space-y-6">
          {/* Calcium */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-bold">
              <span className="text-gray-600">Canxi</span>
              <span className="text-[#0F172A]">{consumed.calcium} / {goals.calcium}mg</span>
            </div>
            <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${caProgress}%` }}
                className="h-full bg-blue-500 rounded-full"
              />
            </div>
          </div>

          {/* Vitamin D3 & K2 Combined for simplicity */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex justify-between text-[10px] font-bold">
                <span className="text-gray-600">D3</span>
                <span className="text-[#0F172A]">{Math.round(d3Progress)}%</span>
              </div>
              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${d3Progress}%` }}
                  className="h-full bg-amber-500 rounded-full"
                />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-[10px] font-bold">
                <span className="text-gray-600">K2</span>
                <span className="text-[#0F172A]">{Math.round(k2Progress)}%</span>
              </div>
              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${k2Progress}%` }}
                  className="h-full bg-indigo-500 rounded-full"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Gamified CTA (Updated for MVP Strategy) */}
      <section className="mb-10">
        {currentXP >= 100 ? (
          <motion.button 
            onClick={handleEndDay}
            animate={{ scale: [1, 1.02, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="w-full py-5 bg-gradient-to-r from-amber-400 to-orange-500 text-white rounded-3xl font-black text-lg uppercase tracking-wider shadow-xl shadow-orange-500/30 flex items-center justify-center gap-3"
          >
            🏆 Hoàn thành xuất sắc! Khóa chuỗi 🔥
          </motion.button>
        ) : (
          <button 
            onClick={handleEndDay}
            className="w-full py-5 bg-[#0EA5E9] text-white rounded-3xl font-black text-lg uppercase tracking-wider shadow-xl shadow-blue-500/30 flex items-center justify-center gap-3"
          >
            💪 Lưu tiến độ & Chuẩn bị cho ngày mai
          </button>
        )}
      </section>

      {/* End of Day Feedback Modal */}
      <AnimatePresence>
        {showEndDayFeedback && (
          <div className="fixed inset-0 z-[500] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setShowEndDayFeedback(false)}
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-sm bg-white rounded-[40px] p-8 text-center shadow-2xl"
            >
              <div className="w-20 h-20 bg-blue-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
                {currentXP >= 100 ? <Trophy className="w-10 h-10 text-amber-500" /> : <Sun className="w-10 h-10 text-blue-500" />}
              </div>
              <h3 className="text-2xl font-black text-[#0F172A] mb-4">{feedback.title}</h3>
              <p className="text-gray-600 font-medium mb-6 leading-relaxed">
                {feedback.content}
              </p>
              <div className="bg-gray-50 p-5 rounded-3xl mb-8 border border-gray-100">
                <p className="text-sm text-gray-700 font-bold leading-relaxed italic">
                  {feedback.fact}
                </p>
              </div>
              <button 
                onClick={() => setShowEndDayFeedback(false)}
                className="w-full py-4 bg-[#0EA5E9] text-white rounded-2xl font-black text-lg shadow-lg shadow-blue-500/20"
              >
                {feedback.button}
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Meals List */}
      <section>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-[#0F172A]">Nhật ký mâm cơm</h2>
          <button className="text-emerald-600 text-sm font-bold">Xem tất cả</button>
        </div>
        
        <div className="space-y-3">
          {meals.length === 0 ? (
            <div className="bg-white p-8 rounded-3xl border border-dashed border-gray-200 text-center">
              <p className="text-gray-400 text-sm">Chưa có bữa ăn nào. Hãy chụp ảnh mâm cơm để bắt đầu!</p>
            </div>
          ) : (
            meals.map((meal) => (
              <motion.div 
                key={meal.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center p-3 bg-white rounded-2xl shadow-sm border border-gray-100"
              >
                <div className="w-14 h-14 rounded-xl overflow-hidden relative shrink-0">
                  <Image 
                    src={meal.image} 
                    alt={meal.name} 
                    fill 
                    className="object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="ml-4 flex-1">
                  <h3 className="font-bold text-sm text-[#0F172A]">{meal.name}</h3>
                  <p className="text-[10px] text-gray-400 font-bold uppercase mt-0.5">{meal.time}</p>
                  <div className="flex gap-2 mt-1.5 text-[9px] font-black uppercase">
                    <span className="text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">Đạm: {meal.macros.p}g</span>
                    <span className="text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">Ca: {meal.macros.ca}mg</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-black text-sm text-[#0F172A]">{meal.calories}</p>
                  <p className="text-[9px] text-gray-400 font-bold uppercase">kcal</p>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </section>

      {/* Hidden File Input */}
      <input 
        type="file" 
        accept="image/*" 
        capture="environment"
        ref={fileInputRef} 
        onChange={handleFileChange} 
        className="hidden" 
      />

      {/* Floating Action Button (Camera) */}
      <div className="fixed bottom-6 left-0 right-0 flex justify-center pointer-events-none z-50">
        <button 
          onClick={handleCameraClick}
          className="pointer-events-auto flex items-center justify-center w-16 h-16 bg-[#0EA5E9] text-white rounded-full shadow-lg shadow-blue-500/30 hover:scale-105 active:scale-95 transition-transform"
        >
          <Camera className="w-7 h-7" />
        </button>
      </div>

      {/* Analysis Modal */}
      <FoodAnalysisModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        isLoading={isLoading}
        imageSrc={imageSrc}
        result={analysisResult}
        error={error}
        onSave={handleSaveMeal}
      />
    </div>
  );
}

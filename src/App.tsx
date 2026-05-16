import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Clock, 
  Calendar, 
  BookOpen, 
  Settings, 
  ChevronRight, 
  ChevronLeft, 
  Timer, 
  GraduationCap,
  Calculator,
  AlertCircle
} from 'lucide-react';
import { SUBJECTS, TARGET_DATE, SUBJECT_HOURS, TargetLevel } from './constants';

type TimeFormat = 'minutes' | 'hours' | 'days-hours' | 'precise';

export default function App() {
  const [now, setNow] = useState(new Date());
  const [format, setFormat] = useState<TimeFormat>('days-hours');
  const [hoursStudied, setHoursStudied] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<'countdown' | 'study' | 'subjects'>('countdown');
  const [targetLevel, setTargetLevel] = useState<TargetLevel>('smart');

  // Update timer every second
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const diffMs = TARGET_DATE.getTime() - now.getTime();
  const isPast = diffMs < 0;

  const timeStats = useMemo(() => {
    const totalSeconds = Math.max(0, Math.floor(diffMs / 1000));
    const totalMinutes = Math.max(0, Math.floor(diffMs / (1000 * 60)));
    const totalHours = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60)));
    const days = Math.floor(totalHours / 24);
    const remainingHours = totalHours % 24;
    const remainingMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    const remainingSeconds = Math.floor((diffMs % (1000 * 60)) / 1000);

    return {
      days,
      hours: remainingHours,
      minutes: remainingMinutes,
      seconds: remainingSeconds,
      totalHours,
      totalMinutes,
      totalSeconds
    };
  }, [diffMs]);

  const currentSubjectHours = useMemo(() => SUBJECT_HOURS[targetLevel], [targetLevel]);
  const totalCurriculumHours = useMemo(() => 
    SUBJECTS.reduce((acc, s) => acc + (currentSubjectHours[s.id] || 0), 0)
  , [currentSubjectHours]);
  const remainingStudyHours = Math.max(0, totalCurriculumHours - hoursStudied);
  
  const dailyHoursNeeded = useMemo(() => {
    const totalDaysRemaining = diffMs / (1000 * 60 * 60 * 24);
    if (totalDaysRemaining <= 0) return 0;
    return remainingStudyHours / totalDaysRemaining;
  }, [remainingStudyHours, diffMs]);

  const [dailyRate, setDailyRate] = useState<number>(8); // Hours per day study rate

  const totalPossibleStudyHours = useMemo(() => {
    const totalDaysRemaining = Math.max(0, diffMs / (1000 * 60 * 60 * 24));
    return totalDaysRemaining * dailyRate;
  }, [diffMs, dailyRate]);

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#1A1A1A] font-sans selection:bg-blue-100" dir="rtl">
      {/* ... existing header ... */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-50 backdrop-blur-md bg-white/80">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 rounded-xl text-white shadow-lg shadow-blue-200">
              <GraduationCap size={24} />
            </div>
            <div>
              <h1 className="font-bold text-xl tracking-tight leading-none">عداد السادس</h1>
              <p className="text-xs text-gray-500 font-medium mt-1">طريقك نحو الوزاري 2026</p>
            </div>
          </div>
          <div className="flex gap-1 p-1 bg-gray-100 rounded-lg border border-gray-200">
             {(['countdown', 'study', 'subjects'] as const).map((tab) => (
               <button
                 key={tab}
                 onClick={() => setActiveTab(tab)}
                 className={`px-4 py-1.5 rounded-md text-sm font-semibold transition-all duration-200 ${
                   activeTab === tab 
                     ? 'bg-white text-blue-600 shadow-sm' 
                     : 'text-gray-500 hover:text-gray-900'
                 }`}
               >
                 {tab === 'countdown' ? 'العداد' : tab === 'study' ? 'المخطط' : 'المواد'}
               </button>
             ))}
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        <AnimatePresence mode="wait">
          {activeTab === 'countdown' && (
            <motion.div
              key="countdown"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              {/* Main Countdown Display */}
              <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 text-center relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-full h-1 bg-blue-600/10">
                  <motion.div 
                    className="h-full bg-blue-600"
                    initial={{ width: '0%' }}
                    animate={{ width: '100%' }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                  />
                </div>
                
                <h2 className="text-gray-500 font-bold uppercase tracking-widest text-xs mb-8">الوقت المتبقي حتى 13 حزيران 2026</h2>
                
                <div className="flex flex-wrap justify-center gap-4 md:gap-8 mb-10">
                  {format === 'precise' && (
                    <>
                      <TimeUnit value={timeStats.days} label="أيام" />
                      <TimeUnit value={timeStats.hours} label="ساعات" />
                      <TimeUnit value={timeStats.minutes} label="دقائق" />
                      <TimeUnit value={timeStats.seconds} label="ثواني" />
                    </>
                  )}
                  {format === 'days-hours' && (
                    <>
                      <TimeUnit value={timeStats.days} label="أيام" />
                      <TimeUnit value={timeStats.hours} label="ساعات" />
                    </>
                  )}
                  {format === 'hours' && (
                    <TimeUnit value={timeStats.totalHours} label="ساعة كاملة" extraLarge />
                  )}
                  {format === 'minutes' && (
                    <TimeUnit value={timeStats.totalMinutes} label="دقيقة كاملة" extraLarge />
                  )}
                </div>

                <div className="flex flex-col items-center gap-4 mt-8">
                  <div className="flex justify-center gap-2 p-1.5 bg-gray-50 border border-gray-100 rounded-2xl w-fit">
                     {(['precise', 'days-hours', 'hours', 'minutes'] as const).map((f) => (
                       <button
                         key={f}
                         onClick={() => setFormat(f)}
                         className={`px-4 py-2 rounded-xl text-xs font-bold transition-all uppercase ${
                           format === f 
                             ? 'bg-blue-600 text-white shadow-md shadow-blue-100' 
                             : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                         }`}
                       >
                         {f === 'precise' ? 'دقيق' : f === 'days-hours' ? 'أيام وساعات' : f === 'hours' ? 'ساعات' : 'دقائق'}
                       </button>
                     ))}
                  </div>

                  <div className="flex justify-center gap-2 p-1.5 bg-gray-100 border border-gray-200 rounded-2xl w-fit">
                     {(['high', 'smart'] as const).map((level) => (
                       <button
                         key={level}
                         onClick={() => setTargetLevel(level)}
                         className={`px-6 py-2 rounded-xl text-xs font-bold transition-all ${
                           targetLevel === level 
                             ? 'bg-white text-gray-900 shadow-sm border border-gray-200' 
                             : 'text-gray-400 hover:text-gray-600'
                         }`}
                       >
                         {level === 'high' ? 'دراسة شاملة (من الجلاد للجلاد 90%+)' : 'دراسة بذكاء (ثوابت ووزاريات 60-70%)'}
                       </button>
                     ))}
                  </div>
                </div>
              </div>

              {/* Target Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white rounded-2xl p-6 border border-gray-100 flex items-center gap-4 shadow-sm">
                  <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
                    <Calendar size={24} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-gray-900 leading-none">تاريخ الامتحان</h3>
                    <p className="text-xs text-gray-500 mt-1 font-medium italic">13 حزيران 2026، الساعة 6:00 صباحاً</p>
                  </div>
                </div>
                <div className="bg-white rounded-2xl p-6 border border-gray-100 flex items-center gap-4 shadow-sm">
                  <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                    <Clock size={24} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-gray-900 leading-none">الوضع الحالي</h3>
                    <p className="text-xs text-gray-500 mt-1 font-medium">{isPast ? 'انتهى الوقت' : 'العد التنازلي مستمر'}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'study' && (
            <motion.div
              key="study"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.02 }}
              className="space-y-6"
            >
              <div className="bg-blue-600 rounded-3xl p-8 text-white shadow-xl shadow-blue-100 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl pointer-events-none" />
                <div className="relative z-10">
                  <h2 className="text-lg font-bold opacity-80 mb-1">مخطط الساعات الدراسية</h2>
                  <p className="text-3xl font-black tracking-tight mb-8">كم درست اليوم؟</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
                    <div className="space-y-4">
                      <label className="text-xs font-bold uppercase tracking-wider opacity-90 block">الساعات التي درستها حتى الآن</label>
                      <div className="flex gap-3">
                        <input 
                          type="number" 
                          value={hoursStudied || ''}
                          onChange={(e) => setHoursStudied(Number(e.target.value))}
                          className="bg-white/20 border border-white/20 rounded-2xl px-6 py-4 text-2xl font-black w-full focus:outline-none focus:ring-2 focus:ring-white/50 transition-all placeholder:text-white/30"
                          placeholder="مثلاً: 10"
                        />
                      </div>
                    </div>

                    <div className="p-6 bg-white/10 rounded-2xl border border-white/20">
                      <p className="text-xs font-bold uppercase mb-4 opacity-80">ساعات الدراسة اليومية المتوقعة</p>
                      <input 
                        type="range" 
                        min="1" 
                        max="18" 
                        step="0.5"
                        value={dailyRate}
                        onChange={(e) => setDailyRate(Number(e.target.value))}
                        className="w-full accent-white"
                      />
                      <div className="flex justify-between mt-2 text-xl font-black tracking-tighter">
                        <span>{dailyRate} ساعة/يوم</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
                  <p className="text-gray-400 text-xs font-bold uppercase mb-2">إجمالي الساعات الممكنة حتى الامتحان</p>
                  <p className="text-5xl font-black text-emerald-600 tracking-tighter tabular-nums">{Math.floor(totalPossibleStudyHours)} <span className="text-sm font-bold text-gray-400">ساعة</span></p>
                  <p className="text-[10px] text-gray-400 mt-4 leading-arabic">بناءً على معدل {dailyRate} ساعة يومياً والوقت المتبقي.</p>
                </div>
                
                <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-center">
                  <div className="flex items-center gap-3 mb-2">
                    <AlertCircle size={16} className="text-orange-500" />
                    <p className="text-gray-400 text-xs font-bold uppercase">الحالة المنهجية</p>
                  </div>
                  {totalPossibleStudyHours >= remainingStudyHours ? (
                    <p className="text-emerald-600 font-bold text-lg leading-arabic">نعم! يمكنك إكمال المنهج بمعدلك الحالي والاستراحة أيضاً.</p>
                  ) : (
                    <p className="text-rose-500 font-bold text-lg leading-arabic">تحذير: بمعدلك الحالي لن تتمكن من إنهاء الـ {remainingStudyHours} ساعة المتبقية. ستحتاج لزيادة معدلك إلى {dailyHoursNeeded.toFixed(1)} ساعة.</p>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'subjects' && (
            <motion.div
              key="subjects"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
                <div className="flex items-center gap-4 mb-8">
                  <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
                    <BookOpen size={24} />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">تقدير الساعات للمواد</h2>
                    <p className="text-sm text-gray-500 font-medium italic">الصف السادس العلمي - المنهاج العراقي</p>
                  </div>
                </div>

                <div className="space-y-6">
                  {SUBJECTS.map((subject, idx) => {
                    const subHours = currentSubjectHours[subject.id];
                    return (
                      <motion.div 
                        key={subject.id} 
                        className="group"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                      >
                        <div className="flex justify-between items-end mb-2">
                          <span className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors uppercase">{subject.name}</span>
                          <div className="flex flex-col items-end">
                             <span className="text-xs font-black text-gray-400 bg-gray-50 px-3 py-1 rounded-full">{subHours} ساعة للإكمال</span>
                             <span className="text-[9px] text-emerald-600 font-bold mt-1">
                               معدل { (subHours / (diffMs / (1000 * 60 * 60 * 24))).toFixed(1) } ساعة يومياً لإكمالها وحدها
                             </span>
                          </div>
                        </div>
                        <div className="h-4 bg-gray-100 rounded-full overflow-hidden border border-gray-100">
                          <motion.div 
                            className={`h-full bg-gradient-to-r ${
                              idx === 0 ? 'from-emerald-400 to-emerald-500' :
                              idx === 1 ? 'from-blue-400 to-blue-500' :
                              idx === 2 ? 'from-indigo-400 to-indigo-500' :
                              'from-purple-400 to-purple-500'
                            }`}
                            initial={{ width: '0%' }}
                            animate={{ width: `${(subHours / 180) * 100}%` }}
                            transition={{ duration: 1, delay: 0.5 + idx * 0.1 }}
                          />
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
                
                <div className="mt-10 p-6 bg-blue-50/50 rounded-2xl border border-blue-100">
                  <div className="flex gap-4">
                    <div className="p-2 bg-blue-100 text-blue-600 h-fit rounded-lg">
                      <Calculator size={20} />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-blue-900 tracking-tight">نصيحة الخبير (دراسة بذكاء)</h4>
                      <p className="text-[11px] text-blue-700 mt-2 leading-relaxed leading-arabic">
                        {targetLevel === 'smart' ? (
                          <>
                            <strong>كخبير في منهاج السادس العلمي:</strong> بما أن هدفك 60 إلى 70 فلا تقرأ المنهج "من الجلاد للجلاد". ركز فقط على <strong>الثوابت والأفكار الوزارية المتكررة</strong>.
                            في <strong>الفيزياء</strong>: ركز على مسائل (الفصل الأول، الثاني، الثالث) واسئلة الفصل للحديثة. 
                            في <strong>الأحياء</strong>: رسومات الفصل الأول والتعاريف والمقارنات الوزارية. 
                            في <strong>العربي</strong>: ثوابت القواعد (الاستفهام، النفي) وشعراء الأدب المكررين.
                            هذه الساعات المحسوبة هي لدراسة "الزبدة والخلاصة" بتركيز عالٍ جداً بدون تضييع وقت في الاستنتاجات المعقدة.
                          </>
                        ) : (
                          <>
                            تم رصد تقديرات الساعات بناءً على إحصائيات طلاب العراق للمعدلات العالية. الأحياء والفيزياء هي المواد الأكثر استهلاكاً للوقت. تحتاج للإحاطة بكل تفاصيل المنهج للحصول على درجة 90 فما فوق.
                          </>
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer className="max-w-4xl mx-auto px-6 py-12 text-center text-gray-400">
        <p className="text-xs font-bold uppercase tracking-widest mb-2">عداد السادس العلمي 2026</p>
        <p className="text-[10px] opacity-70">صُنع لمساعدة الطلاب على إدارة وقتهم في الأيام الحاسمة</p>
      </footer>
    </div>
  );
}

function TimeUnit({ value, label, extraLarge }: { value: number, label: string, extraLarge?: boolean }) {
  return (
    <div className="flex flex-col items-center">
      <div className={`font-black tracking-tighter tabular-nums ${extraLarge ? 'text-6xl md:text-8xl text-blue-600' : 'text-4xl md:text-5xl text-gray-900'}`}>
        {value.toLocaleString('ar-IQ')}
      </div>
      <div className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-gray-400 mt-2">
        {label}
      </div>
    </div>
  );
}

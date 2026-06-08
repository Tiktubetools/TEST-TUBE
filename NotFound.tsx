import React, { useEffect, useState } from "react";
import { Home, ArrowLeft, AlertTriangle, RefreshCw, Compass } from "lucide-react";
import { motion } from "motion/react";

interface NotFoundProps {
  lang: "ar" | "en";
  setCurrentTab: (tab: any, suite?: any, sub?: any) => void;
}

export default function NotFound({ lang, setCurrentTab }: NotFoundProps) {
  const isAr = lang === "ar";
  const [countdown, setCountdown] = useState(10);

  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setCurrentTab("home");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [setCurrentTab]);

  const handleGoBack = () => {
    if (window.history.length > 2) {
      window.history.back();
    } else {
      setCurrentTab("home");
    }
  };

  const t = {
    ar: {
      errorCode: "رمز الخطأ 404",
      title: "عذراً، الصفحة المطلوبة غير موجودة!",
      description: "يبدو أنك سلكت مساراً خاطئاً أو أن الرابط الذي تحاول الوصول إليه غير متوفر حالياً أو تم نقله إلى مكان آخر في تحديثات المنصة الأخيرة.",
      backHome: "العودة للرئيسية",
      goBack: "العودة للوراّء",
      autoRedirect: "سيتم توجيهك تلقائياً إلى الصفحة الرئيسية خلال {sec} ثوانٍ...",
    },
    en: {
      errorCode: "Error Code 404",
      title: "Oops, Page Not Found!",
      description: "It looks like you've landed on a broken link, or the page you are trying to access has been deprecated or moved across recent structural optimizations.",
      backHome: "Go to Homepage",
      goBack: "Go Back",
      autoRedirect: "Redirecting you back to safety in {sec} seconds...",
    }
  }[lang];

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center py-12 px-4 relative text-center">
      {/* Visual background lights */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-red-600/10 blur-[80px] rounded-full pointer-events-none z-0" />

      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", duration: 0.6 }}
        className="relative z-10 max-w-lg w-full space-y-8 bg-zinc-900/40 border border-zinc-800 p-8 md:p-12 rounded-3xl backdrop-blur-md"
      >
        <div className="flex justify-center">
          <div className="relative">
            <motion.div
              animate={{ rotate: [0, -5, 5, -5, 0] }}
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
              className="p-5 bg-red-650/10 border border-red-500/20 rounded-2xl text-red-500"
            >
              <Compass className="h-12 w-12 stroke-[1.5]" />
            </motion.div>
            <div className="absolute -top-1 -right-1 bg-amber-500 text-zinc-950 p-1 rounded-lg border-2 border-zinc-900 font-black flex items-center justify-center text-[10px] animate-pulse">
              <AlertTriangle className="h-3 w-3" />
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <span className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold bg-zinc-950 px-3 py-1 rounded-full border border-zinc-850 inline-block font-mono">
            {t.errorCode}
          </span>
          <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight leading-snug">
            {t.title}
          </h1>
          <p className="text-xs md:text-sm text-zinc-400 font-normal leading-relaxed">
            {t.description}
          </p>
        </div>

        {/* Auto redirect Countdown progress */}
        <div className="space-y-2 py-2">
          <div className="text-[11px] text-zinc-500 font-medium">
            {t.autoRedirect.replace("{sec}", String(countdown))}
          </div>
          <div className="h-1.5 w-full bg-zinc-950 rounded-full overflow-hidden border border-zinc-850">
            <motion.div
              initial={{ width: "100%" }}
              animate={{ width: "0%" }}
              transition={{ duration: 10, ease: "linear" }}
              className="h-full bg-red-650"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            onClick={handleGoBack}
            className="flex-1 px-5 py-3 bg-zinc-900 border border-zinc-800 hover:bg-zinc-805 hover:border-zinc-700 text-white font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <ArrowLeft className={`h-4 w-4 text-zinc-400 ${isAr ? "rotate-0" : "rotate-180"}`} />
            <span>{t.goBack}</span>
          </button>

          <button
            onClick={() => setCurrentTab("home")}
            className="flex-1 px-5 py-3 bg-red-600 hover:bg-red-550 text-white font-extrabold text-xs rounded-xl shadow-[0_0_15px_rgba(220,38,38,0.15)] active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <Home className="h-4 w-4" />
            <span>{t.backHome}</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
}

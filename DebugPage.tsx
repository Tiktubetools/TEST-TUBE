import React, { useState, useEffect } from "react";
import { Shield, Hammer, RefreshCw, Trash2, CheckCircle2, AlertOctagon } from "lucide-react";

interface DebugPageProps {
  lang: "ar" | "en";
}

export default function DebugPage({ lang }: DebugPageProps) {
  const [debugLog, setDebugLog] = useState<any>(null);
  
  const isAr = lang === "ar";
  
  const loadDebugLog = () => {
    try {
      const stored = localStorage.getItem("tiktube_last_debug_info");
      if (stored) {
        setDebugLog(JSON.parse(stored));
      } else {
        setDebugLog(null);
      }
    } catch (e) {
      console.error("Failed to load debug log from storage:", e);
    }
  };

  useEffect(() => {
    loadDebugLog();
    // Set an interval to auto-refresh the debug page values
    const interval = setInterval(loadDebugLog, 2000);
    return () => clearInterval(interval);
  }, []);

  const clearLog = () => {
    localStorage.removeItem("tiktube_last_debug_info");
    setDebugLog(null);
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6 space-y-6 bg-zinc-950/40 border border-zinc-850 rounded-2xl backdrop-blur-xl">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-zinc-850 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-red-650/10 text-red-500 rounded-xl">
            <Hammer className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-white">
              {isAr ? "لوحة تصحيح ومراقبة التحميل (Debug)" : "Download Debug & Diagnostic Dashboard"}
            </h2>
            <p className="text-xs text-zinc-400">
              {isAr 
                ? "راقب وحلل العمليات البرمجية لفك الروابط ومطابقة بروتوكولات الفيديو" 
                : "Monitor and analyze the program flow of extraction parameters and content headers."}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadDebugLog}
            className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-300 transition-all cursor-pointer"
            title="تحديث البيانات"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
          <button
            onClick={clearLog}
            className="p-2 rounded-lg bg-red-650/10 border border-red-500/20 hover:bg-red-600/20 text-red-400 transition-all cursor-pointer"
            title="تطهير السجل"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {!debugLog ? (
        <div className="p-8 text-center bg-zinc-900/25 border border-dashed border-zinc-850 rounded-xl space-y-3">
          <Shield className="h-8 w-8 text-zinc-500 mx-auto" />
          <h3 className="text-sm font-bold text-zinc-300">
            {isAr ? "لا توجد عمليات مسجلة حالياً" : "No operations recorded yet"}
          </h3>
          <p className="text-xs text-zinc-500 max-w-md mx-auto">
            {isAr 
              ? "قم بتجربة فك الروابط وتنزيل الفيديوهات من فيسبوك أو Kick مسبقاً، وستظهر تفاصيل العملية والمعالجة الخادومية هنا فوراً." 
              : "Try parsing and downloading facebook videos or Kick streams first, and raw program details will instantly appear here."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 w-fit text-xs font-bold text-zinc-300">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
            <span>{isAr ? `المنصة الحالية: ${debugLog.platform}` : `Selected Platform: ${debugLog.platform}`}</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-zinc-900/30 border border-zinc-850 rounded-xl space-y-1">
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
                {isAr ? "الرابط الأصلي" : "Original URL"}
              </span>
              <p className="text-xs font-mono text-zinc-200 select-all break-all bg-black/45 p-2 rounded-md border border-zinc-850/40">
                {debugLog.originalUrl}
              </p>
            </div>

            <div className="p-4 bg-zinc-900/30 border border-zinc-850 rounded-xl space-y-1">
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
                {isAr ? "الرابط المستخرج" : "Extracted URL"}
              </span>
              <p className="text-xs font-mono text-zinc-200 select-all break-all bg-black/45 p-2 rounded-md border border-zinc-850/40">
                {debugLog.extractedUrl || (isAr ? "لم يستخرج الرابط" : "Not extracted")}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 bg-zinc-900/30 border border-zinc-850 rounded-xl space-y-1">
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
                {isAr ? "نوع الملف (Content-Type)" : "File Type (Content-Type)"}
              </span>
              <p className="text-xs font-mono text-white bg-black/45 p-2 rounded-md border border-zinc-850/40">
                {debugLog.fileType}
              </p>
            </div>

            <div className="p-4 bg-zinc-900/30 border border-zinc-850 rounded-xl space-y-1">
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
                {isAr ? "حالة طلب الخدمة" : "Request Status Code"}
              </span>
              <div className="flex items-center gap-1.5 bg-black/45 p-2 rounded-md border border-zinc-850/40 font-mono text-xs font-bold">
                {debugLog.status === 200 || debugLog.status === "success" ? (
                  <>
                    <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                    <span className="text-green-400">{debugLog.status}</span>
                  </>
                ) : (
                  <>
                    <AlertOctagon className="h-3.5 w-3.5 text-red-500" />
                    <span className="text-red-400">{debugLog.status}</span>
                  </>
                )}
              </div>
            </div>

            <div className="p-4 bg-zinc-900/30 border border-zinc-850 rounded-xl space-y-1">
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
                {isAr ? "نتيجة الفحص البرمجي" : "Verification Results"}
              </span>
              <p className="text-xs font-semibold text-white bg-black/45 p-2 rounded-md border border-zinc-850/40">
                {debugLog.extractedUrl ? (isAr ? "المرور صالح ورابط مباشر" : "Valid Direct stream link") : (isAr ? "فشل التحقق" : "Verification Failed")}
              </p>
            </div>
          </div>

          <div className="p-4 bg-zinc-900/30 border border-zinc-850 rounded-xl space-y-1">
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
              {isAr ? "سبب الفشل / رسالة الخطأ الأخيرة" : "Reason For Failure / Error Message"}
            </span>
            <div className="p-3 bg-red-650/5 border border-red-500/10 rounded-lg text-xs font-mono text-zinc-300">
              {debugLog.error || (isAr ? "لا توجد أخطاء مسجلة" : "No registered errors")}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import React, { useState } from "react";
import { Download, Play, Video, ShieldAlert, Sparkles, CheckCircle, AlertTriangle, Link, RefreshCw } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { downloadFile, verifyDownload } from "../../utils/downloader";

interface FacebookDownloaderProps {
  lang: "ar" | "en";
  onActionTriggered: () => void;
}

export default function FacebookDownloader({ lang, onActionTriggered }: FacebookDownloaderProps) {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");
  const [downloadingIndices, setDownloadingIndices] = useState<Record<number, boolean>>({});

  const getStages = () => {
    const p = progress;
    const isCompleted = p >= 100;

    return [
      {
        id: "verify-link",
        labelAr: "التحقق من الرابط",
        labelEn: "Verifying video link",
        isActive: p >= 0 && p < 15,
        isDone: isCompleted || (p >= 15)
      },
      {
        id: "extract-info",
        labelAr: "استخراج معلومات الفيديو",
        labelEn: "Extracting video information",
        isActive: p >= 15 && p < 35,
        isDone: isCompleted || (p >= 35)
      },
      {
        id: "find-file",
        labelAr: "العثور على الملف",
        labelEn: "Locating matching stream files",
        isActive: p >= 35 && p < 55,
        isDone: isCompleted || (p >= 55)
      },
      {
        id: "prepare-quality",
        labelAr: "تجهيز الجودة المطلوبة",
        labelEn: "Configuring requested resolution parameters",
        isActive: p >= 55 && p < 75,
        isDone: isCompleted || (p >= 75)
      },
      {
        id: "process-video",
        labelAr: "معالجة الفيديو",
        labelEn: "Processing stream through transcode engine",
        isActive: p >= 75 && p < 90,
        isDone: isCompleted || (p >= 90)
      },
      {
        id: "create-download",
        labelAr: "إنشاء رابط التحميل",
        labelEn: "Packaging compliant download endpoint",
        isActive: p >= 90 && p < 100,
        isDone: isCompleted || (p >= 100)
      },
      {
        id: "done",
        labelAr: "اكتملت العملية بنجاح",
        labelEn: "Completed successfully!",
        isActive: isCompleted,
        isDone: isCompleted
      }
    ];
  };

  const handleDownload = async (proxyUrl: string, filename: string, index: number) => {
    try {
      console.log("Download button clicked");
      console.log("Download URL:", proxyUrl);
      
      setDownloadingIndices(prev => ({ ...prev, [index]: true }));
      await downloadFile(proxyUrl, filename);
      if (typeof onActionTriggered === "function") {
        try { onActionTriggered(); } catch (e) {}
      }
    } catch (err: any) {
      console.error("Facebook download click failed:", err);
    } finally {
      setDownloadingIndices(prev => ({ ...prev, [index]: false }));
    }
  };

  const isAr = lang === "ar";

  const t = {
    ar: {
      title: "أداة تحميل فيديوهات فيسبوك العامة",
      description: "حمل مقاطع الفيديو العامة والريلز من فيسبوك بجودة عالية وبمختلف الصيغ المتاحة للموبايل والكمبيوتر مجاناً.",
      placeholder: "الصق رابط فيديو فيسبوك أو ريلز هنا...",
      btnFetch: "استخراج جودات الفيديو",
      btnLoading: "جاري تحليل صفحة فيسبوك...",
      btnDownload: "تحميل",
      quality: "الجودة المتاحة",
      mediaTitle: "معلومات الفيديو المستخرج:",
      auth: "الناشر:",
      noVideos: "لم نتمكن من استخراج روابط تحميل لهذا الفيديو. تأكد من أنه منشور عام وليس خاص بالخصوصية.",
      errorUrl: "الرابط المدخل غير صالح أو غير مدعوم.",
      limitReached: "تم الوصول للحد الأقصى للتحميل، يرجى المحاولة بعد قليل.",
      step1: "انسخ رابط الفيديو أو الريلز من فيسبوك",
      step2: "الصق رابط الفيديو في الصندوق بالأعلى",
      step3: "اختر الجودة المطلوبة وحمل الفيديو فوراً",
      whyFreeTitle: "لماذا TikTube مجاني وآمن؟",
      whyFreeDesc: "نحن في TikTube نستخدم تقنيات خادومية لفك التشفير مباشرة على جانب الخادم دون تخزين بيانات المستخدمين أو ملفاتهم لضمان خصوصيتك الكاملة."
    },
    en: {
      title: "Facebook Video Downloader HD",
      description: "Download public Facebook videos and reels in high quality HD 1080p, 720p or SD. Fast, free, compatible with mobile and desktop.",
      placeholder: "Paste Facebook video or reel link here...",
      btnFetch: "Extract Video Qualities",
      btnLoading: "Analyzing FB page...",
      btnDownload: "Download",
      quality: "Quality Level",
      mediaTitle: "Extracted Media Details:",
      auth: "Publisher:",
      noVideos: "Cannot extract download links for this video. Make sure it is public and accessible without logging in.",
      errorUrl: "The entered URL is invalid or unsupported.",
      limitReached: "Rate limit reached. Please wait a few minutes and try again.",
      step1: "Copy Facebook video or reel share link",
      step2: "Paste the URL inside the text-box above",
      step3: "Select your desired quality and download instantly",
      whyFreeTitle: "Why TikTube is Free & Secured?",
      whyFreeDesc: "We decode video pointers server-side, serving direct cached proxy media with 0 private logs stored. All file processing is completely volatile and safe."
    }
  }[lang];

  const handleFetch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;

    setLoading(true);
    setError("");
    setResult(null);
    setProgress(0);

    let currentProgress = 0;
    const interval = setInterval(() => {
      if (currentProgress < 98) {
        const step = currentProgress < 50 ? 6 : currentProgress < 85 ? 3 : 1;
        currentProgress = Math.min(98, currentProgress + step);
        setProgress(currentProgress);
      }
    }, 120);

    try {
      const BASE_URL = import.meta.env.VITE_API_URL || "";
      const res = await fetch(BASE_URL + "/api/facebook-download", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim() })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        // Pre-verify download URLs
        if (data.qualities && data.qualities.length > 0) {
          const verifiedQualities = [];
          for (const q of data.qualities) {
            const isValid = await verifyDownload(q.proxyUrl);
            if (isValid) {
              verifiedQualities.push(q);
            }
          }
          if (verifiedQualities.length === 0) {
            clearInterval(interval);
            localStorage.setItem("tiktube_last_debug_info", JSON.stringify({
              platform: "Facebook",
              originalUrl: url.trim(),
              extractedUrl: "",
              fileType: "None",
              status: res.status,
              error: isAr ? "جميع الروابط المستخرجة فشلت في التحقق الأولي" : "All extracted stream links failed verification"
            }));
            setError(t.noVideos);
            setLoading(false);
            return;
          }
          data.qualities = verifiedQualities;
        }

        clearInterval(interval);
        setProgress(100);
        await new Promise(resolve => setTimeout(resolve, 600));
        
        localStorage.setItem("tiktube_last_debug_info", JSON.stringify({
          platform: "Facebook",
          originalUrl: url.trim(),
          extractedUrl: data.qualities?.[0]?.url || "",
          fileType: data.qualities?.[0]?.container || "MP4",
          status: res.status,
          error: "Success"
        }));

        setResult(data);
        onActionTriggered();
      } else {
        clearInterval(interval);
        localStorage.setItem("tiktube_last_debug_info", JSON.stringify({
          platform: "Facebook",
          originalUrl: url.trim(),
          extractedUrl: "",
          fileType: "None",
          status: res.status,
          error: data.error || t.errorUrl
        }));
        setError(data.error || t.errorUrl);
      }
    } catch (err: any) {
      clearInterval(interval);
      localStorage.setItem("tiktube_last_debug_info", JSON.stringify({
        platform: "Facebook",
        originalUrl: url.trim(),
        extractedUrl: "",
        fileType: "None",
        status: 500,
        error: err.message || "Network Error"
      }));
      setError(isAr ? "حدث خطأ غير متوقع بالاتصال مع الخادم." : "Could not connect to database downloading servers.");
    } finally {
      clearInterval(interval);
      setLoading(false);
    }
  };

  const clearSearch = () => {
    setUrl("");
    setResult(null);
    setError("");
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8 font-sans">
      {/* Hero Header Banner */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-mono font-medium">
          <Sparkles className="h-3 w-3" />
          <span>FACEBOOK_MP4_DECRYPTOR</span>
        </div>
        <h2 className="text-3xl font-extrabold text-white tracking-tight sm:text-4xl">
          {t.title}
        </h2>
        <p className="text-sm text-neutral-400 max-w-xl mx-auto leading-relaxed">
          {t.description}
        </p>
      </div>

      {/* Input box Form */}
      <div className="rounded-2xl border border-white/5 bg-neutral-900/50 p-6 backdrop-blur-xl">
        <form onSubmit={handleFetch} className="space-y-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-neutral-500">
              <Link className="h-5 w-5" />
            </div>
            <input
              type="url"
              required
              className="w-full pl-12 pr-4 py-4 text-sm bg-neutral-950/60 text-white placeholder-neutral-500 rounded-xl border border-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all text-left"
              placeholder={t.placeholder}
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="flex justify-between items-center gap-4 flex-wrap">
            <button
              type="button"
              onClick={clearSearch}
              className="px-4 py-3 text-xs font-bold text-neutral-400 bg-neutral-950/40 hover:bg-neutral-950 rounded-lg transition-colors border border-white/5"
            >
              {isAr ? "إعادة تعيين" : "Reset"}
            </button>
            <button
              type="submit"
              disabled={loading || !url.trim()}
              className="flex-1 md:flex-initial px-8 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:from-neutral-800 disabled:to-neutral-800 disabled:text-neutral-500 text-black font-extrabold text-sm rounded-xl transition-all shadow-lg hover:shadow-blue-500/10 flex items-center justify-center gap-2 min-w-[200px]"
            >
              {loading ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin text-black" />
                  <span>{t.btnLoading}</span>
                </>
              ) : (
                <>
                  <Download className="h-4 w-4" />
                  <span>{t.btnFetch}</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Animated Progress Bar & Stages Checklist */}
        <AnimatePresence>
          {loading && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-6 p-6 rounded-xl border border-white/5 bg-neutral-950/45 space-y-6 overflow-hidden"
            >
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs text-neutral-400 font-mono">
                  <span>{isAr ? "تحليل ومعالجة مقطع فيسبوك..." : "Analyzing & extracting Facebook video..."}</span>
                  <span className="text-blue-400 font-bold">{progress}%</span>
                </div>
                <div className="w-full bg-neutral-900 rounded-full h-3 overflow-hidden p-[2px]">
                  <div 
                    className="bg-gradient-to-r from-blue-500 via-indigo-400 to-cyan-500 h-2 rounded-full transition-all duration-300 shadow-md"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              {/* Checklist stages */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 select-none">
                {getStages().map((stage) => {
                  const label = isAr ? stage.labelAr : stage.labelEn;
                  let checkColor = "text-neutral-600 border-neutral-800 bg-neutral-900/40";
                  let checkIcon = <span className="w-1.5 h-1.5 rounded-full bg-neutral-700 animate-pulse"></span>;
                  let textColor = "text-neutral-500";

                  if (stage.isDone) {
                    checkColor = "bg-green-500/10 border-green-500/20 text-green-400";
                    checkIcon = (
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    );
                    textColor = "text-neutral-300 font-medium";
                  } else if (stage.isActive) {
                    checkColor = "bg-blue-500/15 border-blue-500/30 text-blue-400";
                    checkIcon = <RefreshCw className="h-3 w-3 text-blue-400 animate-spin" />;
                    textColor = "text-white font-semibold";
                  }

                  return (
                    <div 
                      key={stage.id} 
                      className={`flex items-center gap-3 p-2 rounded-lg border transition-all duration-300 ${
                        stage.isActive 
                          ? "bg-neutral-900/60 border-neutral-800" 
                          : stage.isDone
                            ? "bg-neutral-950/20 border-neutral-900/30"
                            : "bg-transparent border-transparent"
                      }`}
                    >
                      <div className={`h-5 w-5 rounded border flex items-center justify-center shrink-0 ${checkColor}`}>
                        {checkIcon}
                      </div>
                      <span className={`text-[11px] transition-colors duration-300 ${textColor}`}>
                        {label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Diagnostic Errors panel */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mt-4 p-4 rounded-xl border border-rose-500/15 bg-rose-500/10 text-rose-400 text-xs flex items-start gap-3 z-10"
            >
              <ShieldAlert className="h-5 w-5 shrink-0" />
              <div className="space-y-1">
                <span className="font-bold underline">
                  {isAr ? "فشل الاستخراج:" : "Extraction Exception:"}
                </span>
                <p className="leading-relaxed">{error}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Extracted Results Panel */}
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            className="rounded-2xl border border-white/5 bg-neutral-900/40 p-6 backdrop-blur-xl space-y-6"
          >
            <div className="border-b border-white/10 pb-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-400" />
                <span>{t.mediaTitle}</span>
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Media Card Thumbnail info */}
              <div className="relative group rounded-xl overflow-hidden aspect-video border border-white/10 bg-neutral-950">
                <img
                  src={result.thumbnail}
                  alt={result.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-neutral-950/40 flex items-center justify-center">
                  <div className="h-12 w-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
                    <Video className="h-6 w-6 text-white" />
                  </div>
                </div>
              </div>

              {/* Text specs & properties */}
              <div className="md:col-span-2 space-y-4 flex flex-col justify-between">
                <div>
                  <h4 className="text-white text-base font-bold leading-snug">
                    {result.title}
                  </h4>
                  <p className="text-xs text-neutral-400 mt-2">
                    <span className="font-semibold">{t.auth}</span> {result.author}
                  </p>
                </div>

                {/* Qualities download buttons table */}
                <div className="space-y-3">
                  {result.qualities && result.qualities.map((item: any, idx: number) => (
                    <div
                      key={idx}
                      className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 rounded-xl bg-neutral-950/75 border border-white/5 hover:border-white/10 transition-all gap-4 shadow-inner"
                    >
                      <div className="space-y-2 min-w-0 flex-1">
                        <div className="flex items-center gap-2.5">
                          <div className="p-1 px-2 rounded-md bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-bold font-mono">
                            {item.resolution || (item.quality.includes("1080p") ? "1920x1080" : "1280x720")}
                          </div>
                          <span className="text-xs font-extrabold text-white font-mono break-all leading-none">
                            {item.quality}
                          </span>
                        </div>
                        
                        {/* High polish specs grid */}
                        <div className="flex flex-wrap gap-x-3 gap-y-1.5 text-[10px] text-zinc-400 font-mono">
                          <div className="flex items-center gap-1">
                            <span className="text-[9px] bg-neutral-800 text-neutral-300 px-1.5 py-0.5 rounded border border-white/5">Video:</span>
                            <span className="font-semibold text-zinc-200">{item.codecVideo || "H.264 (AVC)"}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="text-[9px] bg-neutral-800 text-neutral-300 px-1.5 py-0.5 rounded border border-white/5">Audio:</span>
                            <span className="font-semibold text-zinc-200">{item.codecAudio || "AAC"}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="text-[9px] bg-neutral-800 text-neutral-300 px-1.5 py-0.5 rounded border border-white/5">Container:</span>
                            <span className="font-semibold text-green-400">{item.container || "MP4"}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-end">
                        <button
                          disabled={!!downloadingIndices[idx]}
                          onClick={() => handleDownload(item.proxyUrl, `Facebook_${item.resolution || "1080p"}_${Date.now()}.mp4`, idx)}
                          className="w-full sm:w-auto px-5 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-400 hover:to-indigo-400 disabled:opacity-50 text-black text-xs font-black rounded-xl transition-all hover:scale-[1.03] active:scale-[0.98] flex items-center justify-center gap-2 whitespace-nowrap shadow-md shadow-blue-500/10 cursor-pointer"
                        >
                          {downloadingIndices[idx] ? (
                            <>
                              <RefreshCw className="h-3.5 w-3.5 animate-spin text-black" />
                              <span>{isAr ? "جاري التجهيز والتحميل..." : "Downloading..."}</span>
                            </>
                          ) : (
                            <>
                              <Download className="h-3.5 w-3.5 text-black" />
                              <span>{t.btnDownload}</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Explanatory dynamic guide cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="rounded-xl border border-white/5 bg-neutral-950/30 p-4 text-center space-y-2">
          <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-blue-500/10 text-blue-400 text-xs font-bold">1</span>
          <h4 className="text-white text-xs font-bold">{t.step1}</h4>
        </div>
        <div className="rounded-xl border border-white/5 bg-neutral-950/30 p-4 text-center space-y-2">
          <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-blue-500/10 text-blue-400 text-xs font-bold">2</span>
          <h4 className="text-white text-xs font-bold">{t.step2}</h4>
        </div>
        <div className="rounded-xl border border-white/5 bg-neutral-950/30 p-4 text-center space-y-2">
          <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-blue-500/10 text-blue-400 text-xs font-bold">3</span>
          <h4 className="text-white text-xs font-bold">{t.step3}</h4>
        </div>
      </div>
    </div>
  );
}

import React, { useState, useEffect, useRef } from "react";
import { apiFetch } from "../../lib/apiClient";
import { 
  Download, Play, ShieldAlert, RefreshCw, Terminal, 
  Video, Eye, Heart, Sparkles, CheckCircle, AlertTriangle 
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { downloadFile } from "../../utils/downloader";

interface TikTokDownloaderHDProps {
  lang: "ar" | "en";
  onActionTriggered: () => void;
}

export default function TikTokDownloaderHD({ lang, onActionTriggered }: TikTokDownloaderHDProps) {
  const [url, setUrl] = useState("");
  const [quality, setQuality] = useState<"360p" | "720p" | "1080p">("1080p");
  
  // Job Queue Polling States
  const [jobId, setJobId] = useState<string | null>(null);
  const [jobState, setJobState] = useState<any>(null);
  const [polling, setPolling] = useState(false);
  const [error, setError] = useState("");
  const [logsOpen, setLogsOpen] = useState(true);
  const [downloading, setDownloading] = useState(false);

  const logsEndRef = useRef<HTMLDivElement | null>(null);

  const DEBUG_MODE = false;

  const getStages = () => {
    const p = jobState?.progress || 0;
    const status = jobState?.status || "waiting";
    const isCompleted = status === "completed";

    return [
      {
        id: "verify-link",
        labelAr: "التحقق من الرابط",
        labelEn: "Verifying video link",
        isActive: status === "active" && p >= 5 && p < 20,
        isDone: isCompleted || (status === "active" && p >= 20)
      },
      {
        id: "extract-info",
        labelAr: "استخراج معلومات الفيديو",
        labelEn: "Extracting video information",
        isActive: status === "active" && p >= 20 && p < 35,
        isDone: isCompleted || (status === "active" && p >= 35)
      },
      {
        id: "find-file",
        labelAr: "العثور على الملف",
        labelEn: "Locating matching stream files",
        isActive: status === "active" && p >= 35 && p < 50,
        isDone: isCompleted || (status === "active" && p >= 50)
      },
      {
        id: "prepare-quality",
        labelAr: "تجهيز الجودة المطلوبة",
        labelEn: "Configuring requested resolution parameters",
        isActive: status === "active" && p >= 50 && p < 65,
        isDone: isCompleted || (status === "active" && p >= 65)
      },
      {
        id: "process-video",
        labelAr: "معالجة الفيديو",
        labelEn: "Processing stream through transcode engine",
        isActive: status === "active" && p >= 65 && p < 90,
        isDone: isCompleted || (status === "active" && p >= 90)
      },
      {
        id: "create-download",
        labelAr: "إنشاء رابط التحميل",
        labelEn: "Packaging compliant download endpoint",
        isActive: status === "active" && p >= 90 && p < 100,
        isDone: isCompleted || (status === "active" && p >= 100)
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

  const handleDownloadHD = async () => {
    if (!jobState?.result?.downloadUrl) return;
    try {
      setDownloading(true);
      await downloadFile(jobState.result.downloadUrl, `TikTok_HD_${quality}_${Date.now()}.mp4`);
      if (typeof onActionTriggered === "function") {
        try { onActionTriggered(); } catch (e) {}
      }
    } catch (err) {
      console.error("TikTok HD download click failed:", err);
    } finally {
      setDownloading(false);
    }
  };

  const isAr = lang === "ar";

  const t = {
    ar: {
      title: "تنزيل تيك توك فائق الجودة HD (H.264 + AAC)",
      subtitle: "صيغة متوافقة 100% مع كافة برامج المونتاج والتشغيل مع خيارات الجودة المتعددة ودعم معالجة المهام الخلفية.",
      labelUrl: "أدخل رابط فيديو التيك توك",
      placeholderUrl: "https://www.tiktok.com/@username/video/123456789...",
      btnSubmit: "بدأ معالجة وتنزيل الفيديو HD",
      qualityLabel: "اختر جودة التصدير:",
      loadingQueue: "جاري حجز موعد في طابور المعالجة...",
      statusWaiting: "في جدول الانتظار (من طراز BullMQ)...",
      statusActive: "جاري التحميل وتغيير الكوداك بنجاح...",
      statusCompleted: "اكتملت المعالجة بنجاح!",
      statusFailed: "فشلت عملية المعالجة",
      showLogs: "عرض سجل الخادم التراكمي",
      mediaTitle: "بيانات الوسائط المعالجة:",
      likes: "الإعجابات",
      views: "المشاهدات",
      author: "صاحب الفيديو",
      duration: "المدة",
      btnDownload: "تحميل الفيديو الآن (المعدل جاهز)",
      btnNew: "تنزيل فيديو آخر",
      codecInfo: "كوداك الفيديو والصوت المدمج:",
      resCheck: "جودة التصدير المطلوبة:",
    },
    en: {
      title: "TikTok HD Video Downloader (H.264 + AAC)",
      subtitle: "100% compliant MP4 with multiple resolutions, AVC/H.264 video, AAC audio, and live progress queues.",
      labelUrl: "TikTok Video Link",
      placeholderUrl: "https://www.tiktok.com/@username/video/123456789...",
      btnSubmit: "Transcode & Process Video HD",
      qualityLabel: "Select Export Quality:",
      loadingQueue: "Reserving slot in backend transcode queue...",
      statusWaiting: "Waiting in Schedule Queue (BullMQ style)...",
      statusActive: "Active Stream Buffering & Transcoding...",
      statusCompleted: "Transcode Job Finished Successfully!",
      statusFailed: "Transcoding Failed",
      showLogs: "Detailed Server Telemetry Logs",
      mediaTitle: "Processed Media Information:",
      likes: "Likes",
      views: "Views",
      author: "Creator",
      duration: "Duration",
      btnDownload: "Download Processed MP4 Now",
      btnNew: "Transcode Another Video",
      codecInfo: "Container Standard:",
      resCheck: "Target Scale Resolution:",
    }
  }[lang];

  // Auto scroll logs
  useEffect(() => {
    if (logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [jobState?.logs]);

  // Handle Submit
  const handleQueueSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;

    setError("");
    setJobId(null);
    setJobState(null);
    setPolling(true);

    try {
      const data = await apiFetch("/api/queue/submit", {
        method: "POST",
        body: JSON.stringify({
          type: "tiktok-hd",
          url: url.trim(),
          quality
        })
      });

      if (data && data.success) {
        setJobId(data.jobId);
        onActionTriggered();
      } else {
        setError(data.error || "Failed to process TikTok queue job.");
        setPolling(false);
      }
    } catch {
      setError("Server connection disrupted.");
      setPolling(false);
    }
  };

  // Poll job status
  useEffect(() => {
    if (!jobId || !polling) return;

    const interval = setInterval(async () => {
      try {
        const data = await apiFetch(`/api/queue/status/${jobId}`);
        if (data && data.success && data.job) {
          setJobState(data.job);
          
          if (data.job.status === "completed") {
            clearInterval(interval);
            setPolling(false);
          } else if (data.job.status === "failed") {
            clearInterval(interval);
            setPolling(false);
            setError(data.job.error || "Backend worker reported a failure.");
          }
        }
      } catch {
        clearInterval(interval);
        setPolling(false);
        setError("Polling connection disrupted.");
      }
    }, 1500);

    return () => clearInterval(interval);
  }, [jobId, polling]);

  const handleReset = () => {
    setUrl("");
    setJobId(null);
    setJobState(null);
    setError("");
    setPolling(false);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden" id="tk-downloader-hd-card">
      <div className="absolute top-0 right-0 p-4 opacity-10">
        <Video className="h-24 w-24 text-cyan-500" />
      </div>

      <div className="flex items-center gap-3 mb-6">
        <div className="h-10 w-10 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-400">
          <Sparkles className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            {t.title}
            <span className="text-[10px] uppercase tracking-wider bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded-full font-mono">HD Queue</span>
          </h2>
          <p className="text-sm text-slate-400 mt-0.5">{t.subtitle}</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-950/40 border border-red-500/20 text-red-400 p-4 rounded-xl mb-6 flex items-start gap-3 text-sm">
          <AlertTriangle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">{isAr ? "حدثت عقبة أثناء المعالجة" : "Transcode Obstacle Detected"}</p>
            <p className="text-red-400/80 mt-1 font-mono text-xs">{error}</p>
          </div>
        </div>
      )}

      {/* Inputs Form */}
      {!jobId && (
        <form onSubmit={handleQueueSubmit} className="space-y-5">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 block">{t.qualityLabel}</label>
            <div className="grid grid-cols-3 gap-3">
              {(["360p", "720p", "1080p"] as const).map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => setQuality(q)}
                  className={`py-2.5 px-4 rounded-xl text-sm font-semibold transition-all border ${
                    quality === q 
                      ? "bg-cyan-500 border-cyan-400 text-white shadow-lg shadow-cyan-500/20" 
                      : "bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white"
                  }`}
                >
                  {q === "1080p" ? `${q} (Full HD)` : q === "720p" ? `${q} (HD)` : `${q} (SD)`}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="tk_hd_url" className="text-xs font-semibold text-slate-300 block">{t.labelUrl}</label>
            <input
              id="tk_hd_url"
              type="text"
              dir="ltr"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder={t.placeholderUrl}
              className="w-full bg-slate-950 text-white rounded-xl border border-slate-800 px-4 py-3 placeholder:text-slate-600 text-sm focus:outline-none focus:border-cyan-500 font-mono"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-sm font-bold py-3.5 px-6 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
          >
            <Download className="h-4 w-4" />
            {t.btnSubmit}
          </button>
        </form>
      )}

      {/* Progress queue Panel */}
      {jobId && (
        <div className="space-y-6">
          {DEBUG_MODE ? (
            <>
              <div className="bg-slate-950/90 border border-slate-800 rounded-xl p-5">
                <div className="flex items-center justify-between mb-3 text-xs text-slate-400 font-mono">
                  <span>JOB ID: {jobId}</span>
                  <span className="capitalize px-2.5 py-0.5 rounded-full bg-slate-800 font-semibold text-cyan-400">
                    {jobState?.status || "Waiting"}
                  </span>
                </div>

                {/* Simulated Queue States and Progress line */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-300 font-medium">
                      {jobState?.status === "waiting" && t.statusWaiting}
                      {jobState?.status === "active" && t.statusActive}
                      {jobState?.status === "completed" && t.statusCompleted}
                      {jobState?.status === "failed" && t.statusFailed}
                    </span>
                    <span className="font-mono font-bold text-cyan-400 text-xs">
                      {jobState?.progress || 0}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-900 rounded-full h-2.5 overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-cyan-500 to-blue-500 h-2.5 rounded-full transition-all duration-300"
                      style={{ width: `${jobState?.progress || 0}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* TELEMETRY LOGS */}
              {logsOpen && (
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-4">
                  <div className="flex items-center justify-between border-b border-slate-900 pb-2 mb-3 text-xs text-slate-400 font-mono">
                    <span className="flex items-center gap-1.5 font-semibold text-slate-300">
                      <Terminal className="h-3.5 w-3.5 text-cyan-400" />
                      {t.showLogs}
                    </span>
                    <span className="text-[10px] text-cyan-500/80">LIVE POLLING</span>
                  </div>
                  
                  <div className="h-36 overflow-y-auto font-mono text-[11px] text-zinc-400 space-y-1.5 scrollbar-thin scrollbar-thumb-zinc-800">
                    {jobState?.logs?.map((log: string, idx: number) => (
                      <div key={idx} className="whitespace-pre-wrap leading-relaxed py-0.5">
                        <span className="text-zinc-600 font-bold">&gt;&gt;</span> {log}
                      </div>
                    ))}
                    {!jobState?.logs?.length && (
                      <div className="text-zinc-600 italic">Initializing scheduler...</div>
                    )}
                    <div ref={logsEndRef} />
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 space-y-5" id="tk-progress-checklist">
              <div className="flex items-center justify-between border-b border-slate-900 pb-3 mb-2 pointer-events-none select-none">
                <span className="flex items-center gap-2 text-sm font-bold text-slate-200">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
                  {isAr ? "مراحل معالجة وتحسين الفيديو" : "HD Video Processing Stages"}
                </span>
                <span className="text-xs font-mono font-bold text-cyan-400 bg-cyan-955/30 px-2.5 py-0.5 rounded-full">
                  {jobState?.progress || 0}%
                </span>
              </div>

              {/* Progress Bar with running gradients */}
              <div className="relative pt-1">
                <div className="w-full bg-slate-900 rounded-full h-3 overflow-hidden p-[2px]">
                  <div 
                    className="bg-gradient-to-r from-emerald-500 via-cyan-400 to-blue-500 h-2 rounded-full transition-all duration-500 shadow-md"
                    style={{ width: `${jobState?.progress || 0}%` }}
                  />
                </div>
              </div>

              {/* Checklist stages */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 select-none pointer-events-none">
                {getStages().map((stage, idx) => {
                  const label = isAr ? stage.labelAr : stage.labelEn;
                  let checkColor = "text-slate-650 border-slate-800 bg-slate-900/40";
                  let checkIcon = <span className="w-1.5 h-1.5 rounded-full bg-slate-700 animate-pulse"></span>;
                  let textColor = "text-slate-500";

                  if (stage.isDone) {
                    checkColor = "bg-emerald-500/10 border-emerald-500/20 text-emerald-400";
                    checkIcon = (
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    );
                    textColor = "text-slate-300 font-medium";
                  } else if (stage.isActive) {
                    checkColor = "bg-cyan-500/10 border-cyan-400/40 text-cyan-400";
                    checkIcon = <RefreshCw className="h-3.5 w-3.5 text-cyan-400 animate-spin" />;
                    textColor = "text-white font-semibold";
                  } else if (jobState?.status === "failed") {
                    const isLastActive = (idx > 0 && getStages()[idx - 1].isDone && !stage.isDone) || (idx === 0);
                    if (isLastActive) {
                      checkColor = "bg-red-500/10 border-red-500/20 text-red-400";
                      checkIcon = <AlertTriangle className="h-3.5 w-3.5 text-red-500 animate-pulse" />;
                      textColor = "text-red-400 font-medium";
                    }
                  }

                  return (
                    <div 
                      key={stage.id} 
                      className={`flex items-center gap-3 p-2.5 rounded-xl border transition-all duration-300 ${
                        stage.isActive 
                          ? "bg-slate-900/60 border-slate-800" 
                          : stage.isDone
                            ? "bg-slate-950/20 border-slate-900/30"
                            : "bg-transparent border-transparent"
                      }`}
                    >
                      <div className={`h-6 w-6 rounded-lg border flex items-center justify-center shrink-0 ${checkColor}`}>
                        {checkIcon}
                      </div>
                      <span className={`text-xs transition-colors duration-300 ${textColor}`}>
                        {label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* COMPLETED ARTIFACT ACTIONS */}
          <AnimatePresence>
            {jobState?.status === "completed" && jobState.result && (
              <motion.div 
                initial={{ opacity: 0, y: 15 }} 
                animate={{ opacity: 1, y: 0 }} 
                className="space-y-5"
              >
                <div className="bg-cyan-950/10 border border-cyan-500/10 rounded-xl p-4 flex flex-col md:flex-row gap-4 items-center">
                  <div className="h-28 w-24 relative overflow-hidden rounded-lg bg-black border border-slate-800 shrink-0">
                    <img 
                      src={jobState.result.cover} 
                      alt="TikTok Cover" 
                      className="w-full h-full object-cover" 
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                      <Play className="h-7 w-7 text-white fill-white" />
                    </div>
                  </div>

                  <div className="flex-1 text-center md:text-right space-y-2.5">
                    <h3 className="text-sm font-semibold text-white line-clamp-2 pr-1">{jobState.result.title}</h3>
                    
                    <div className="grid grid-cols-2 gap-2 text-xs font-mono text-slate-400">
                      <div className="bg-slate-950/60 p-2 rounded-lg border border-slate-900">
                        <span className="text-slate-500 font-sans block">{t.author}</span>
                        <span className="font-bold text-cyan-400">{jobState.result.author}</span>
                      </div>
                      <div className="bg-slate-950/60 p-2 rounded-lg border border-slate-900">
                        <span className="text-slate-500 font-sans block">{t.duration}</span>
                        <span className="font-bold text-white">{jobState.result.duration}</span>
                      </div>
                      <div className="bg-slate-950/60 p-2 rounded-lg border border-slate-900">
                        <span className="text-slate-500 font-sans block">{t.likes}</span>
                        <span className="font-bold text-rose-400">{jobState.result.likes}</span>
                      </div>
                      <div className="bg-slate-950/60 p-2 rounded-lg border border-slate-900">
                        <span className="text-slate-500 font-sans block">{t.views}</span>
                        <span className="font-bold text-emerald-400">{jobState.result.views}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2 text-xs text-slate-400 font-mono">
                  <div className="flex justify-between items-center">
                    <span>{t.codecInfo}</span>
                    <span className="text-white font-bold">{jobState.result.codec}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>{t.resCheck}</span>
                    <span className="text-cyan-400 font-bold">{jobState.result.resolution}</span>
                  </div>
                </div>

                <div className="flex flex-col md:flex-row gap-3">
                  <button
                    disabled={downloading}
                    onClick={handleDownloadHD}
                    className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-slate-900 text-sm font-extrabold py-3.5 px-6 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 hover:scale-[1.01]"
                  >
                    {downloading ? (
                      <>
                        <RefreshCw className="h-4 w-4 animate-spin text-slate-900" />
                        <span>{isAr ? "جاري التحميل..." : "Downloading..."}</span>
                      </>
                    ) : (
                      <>
                        <Download className="h-4 w-4 text-slate-900" />
                        <span>{t.btnDownload}</span>
                      </>
                    )}
                  </button>
                  <button
                    onClick={handleReset}
                    className="bg-slate-800 hover:bg-slate-700 text-white text-sm font-semibold py-3.5 px-5 rounded-xl transition-all"
                  >
                    {t.btnNew}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {jobState?.status === "failed" && (
            <button
              onClick={handleReset}
              className="w-full bg-slate-800 hover:bg-zinc-700 text-white text-sm font-bold py-3 px-6 rounded-xl transition-all"
            >
              {isAr ? "العودة والاستمرار" : "Reset & Back"}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

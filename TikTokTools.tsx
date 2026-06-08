import React, { useState } from "react";
import { apiFetch } from "../../lib/apiClient";
import { 
  Music, Download, Sparkles, MessageCircle, AlertCircle, Play, 
  CheckCircle, Search, RefreshCw, Smartphone, TrendingUp, HelpCircle, Hash
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import TikTokDownloaderHD from "./TikTokDownloaderHD";
import { downloadFile, verifyDownload } from "../../utils/downloader";

interface TikTokToolsProps {
  lang: "ar" | "en";
  onActionTriggered: () => void;
  initialSubTool?: string;
}

export default function TikTokTools({ lang, onActionTriggered, initialSubTool }: TikTokToolsProps) {
  const [activeSubTool, setActiveSubTool] = useState<"downloader_hd" | "downloader" | "mp3" | "captions" | "hooks" | "titles">("downloader_hd");

  React.useEffect(() => {
    if (initialSubTool) {
      if (initialSubTool === "downloader_hd" || initialSubTool === "downloader" || initialSubTool === "mp3" || initialSubTool === "captions" || initialSubTool === "hooks" || initialSubTool === "titles") {
        setActiveSubTool(initialSubTool);
      }
    }
  }, [initialSubTool]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Downloader & Mp3 states
  const [tkUrl, setTkUrl] = useState("");
  const [videoData, setVideoData] = useState<any>(null);
  const [downloadingVideo, setDownloadingVideo] = useState(false);
  const [downloadingAudio, setDownloadingAudio] = useState(false);

  const downloadTikTokFile = async (proxyUrl: string, filename: string, type: "video" | "audio") => {
    const setLoader = type === "video" ? setDownloadingVideo : setDownloadingAudio;
    try {
      setLoader(true);
      await downloadFile(proxyUrl, filename);
      if (typeof onActionTriggered === "function") {
        try { onActionTriggered(); } catch (e) {}
      }
    } catch (err) {
      console.error("TikTok tool download failed:", err);
    } finally {
      setLoader(false);
    }
  };

  // Captions states
  const [captionSummary, setCaptionSummary] = useState("");
  const [captionVibe, setCaptionVibe] = useState("كوميدي ومضحك");
  const [captionAudience, setCaptionAudience] = useState("الشباب والـ Gen-Z");
  const [captionResult, setCaptionResult] = useState("");

  // Hooks states
  const [hookNiche, setHookNiche] = useState("عملات رقمية وبزنس");
  const [hookTopic, setHookTopic] = useState("");
  const [hookResult, setHookResult] = useState("");

  // Titles states
  const [titleConcept, setTitleConcept] = useState("");
  const [titleCategory, setTitleCategory] = useState("شروحات وتكنولوجيا");
  const [titleStyle, setTitleStyle] = useState("تشويقي وغامض");
  const [titleResult, setTitleResult] = useState("");

  const t = {
    ar: {
      btnGenerate: "توليد كابشن مميز",
      btnHooks: "صياغة خطافات التيك توك",
      btnDownload: "تنزيل الفيديو بدون علامة مائية",
      btnAudioMsg: "تحميل نغمة MP3 الصوتية",
      urlLabel: "رابط فيديو تيك توك",
      urlPlaceholder: "https://www.tiktok.com/@username/video/...",
      loading: "جاري ربط الخادم وجلب روابط التحميل المتاحة...",
      resultHeader: "روابط التحميل المتاحة والمعالجة",
      stats: "إحصائيات المنشور الحالية",
    },
    en: {
      btnGenerate: "Generate Caption",
      btnHooks: "Craft TikTok Hooks",
      btnDownload: "Download Video (No Watermark)",
      btnAudioMsg: "Download Audio track MP3",
      urlLabel: "TikTok Video URL",
      urlPlaceholder: "https://www.tiktok.com/@username/video/...",
      loading: "Connecting proxy nodes to extract clean TikTok media...",
      resultHeader: "Parsed Download Endpoints",
      stats: "Live Metadata Analytics",
    }
  }[lang];

  const handleDownloadRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tkUrl) return;
    setLoading(true);
    setError("");
    setVideoData(null);

    try {
      const data = await apiFetch("/api/tiktok/download", {
        method: "POST",
        body: JSON.stringify({ url: tkUrl })
      });
      if (data && data.success) {
        setVideoData(data);
        setSuccess(lang === "ar" ? "تم فك تشفير معلومات الفيديو وجاهز للتحميل!" : "TikTok decrypted and ready!");
        onActionTriggered();
      } else {
        setError((data && data.error) || "روابط تيك توك فارغة أو غير صحيحة");
      }
    } catch {
      setError("فشل فك الروابط");
    } finally {
      setLoading(false);
    }
  };

  const handleCaptionGenerate = async () => {
    if (!captionSummary) {
      setError(lang === "ar" ? "يرجى تعبئة خلاصة موضوع الفيديو" : "Please fill summaries");
      return;
    }
    setLoading(true);
    setError("");
    setCaptionResult("");

    try {
      const data = await apiFetch("/api/tiktok/caption-generator", {
        method: "POST",
        body: JSON.stringify({
          videoSummary: captionSummary,
          vibe: captionVibe,
          audience: captionAudience
        })
      });
      if (data) {
        setCaptionResult(data.result);
        onActionTriggered();
      }
    } catch {
      setError("Caption synthesis issue");
    } finally {
      setLoading(false);
    }
  };

  const handleHookGenerate = async () => {
    if (!hookTopic) {
      setError(lang === "ar" ? "يرجى إكمال تفاصيل الفكرة أولاً" : "Topic missing");
      return;
    }
    setLoading(true);
    setError("");
    setHookResult("");

    try {
      const data = await apiFetch("/api/tiktok/hook-generator", {
        method: "POST",
        body: JSON.stringify({
          niche: hookNiche,
          topic: hookTopic
        })
      });
      if (data) {
        setHookResult(data.result);
        onActionTriggered();
      }
    } catch {
      setError("Hook synthesis failure");
    } finally {
      setLoading(false);
    }
  };

  const handleTitleGenerate = async () => {
    if (!titleConcept) {
      setError(lang === "ar" ? "يرجى كتابة فكرة أو موضوع الفيديو أولاً" : "Please provide a concept first");
      return;
    }
    setLoading(true);
    setError("");
    setTitleResult("");

    try {
      const data = await apiFetch("/api/tiktok/title-generator", {
        method: "POST",
        body: JSON.stringify({
          concept: titleConcept,
          category: titleCategory,
          style: titleStyle
        })
      });
      if (data) {
        setTitleResult(data.result);
        onActionTriggered();
      }
    } catch {
      setError("Title generation failure");
    } finally {
      setLoading(false);
    }
  };

  const renderAIResponse = (text: string) => {
    if (!text) return null;
    return (
      <div className="space-y-4 text-neutral-200 text-sm leading-relaxed text-right font-sans">
        {text.split("\n").map((line, idx) => {
          const trimmed = line.trim();
          if (trimmed.startsWith("###")) {
            return <h4 key={idx} className="text-md font-bold text-cyan-400 mt-4 border-r-2 border-cyan-500 pr-2">{trimmed.replace("###", "")}</h4>;
          }
          if (trimmed.startsWith("##")) {
            return <h3 key={idx} className="text-lg font-extrabold text-white mt-5 border-r-4 border-cyan-500 pr-2.5">{trimmed.replace("##", "")}</h3>;
          }
          if (trimmed.startsWith("#")) {
            return <h2 key={idx} className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-400 mt-6">{trimmed.replace("#", "")}</h2>;
          }
          if (trimmed.startsWith("-") || trimmed.startsWith("*")) {
            return <div key={idx} className="flex justify-end gap-2 pr-4 text-neutral-300">• <span>{trimmed.substring(1).trim()}</span></div>;
          }
          if (/^\d+\./.test(trimmed)) {
            return <div key={idx} className="bg-neutral-950/60 p-3.5 rounded-xl border border-white/5 my-2.5 leading-normal">{trimmed}</div>;
          }
          return trimmed ? <p key={idx} className="text-neutral-300">{trimmed}</p> : <div key={idx} className="h-2" />;
        })}
      </div>
    );
  };

  return (
    <div className="space-y-8" id="tiktok-creator-suite">
      {/* Sub tabs navigation */}
      <div className="flex flex-wrap items-center gap-1.5 justify-end border-b border-white/5 pb-4 overflow-x-auto">
        <button
          onClick={() => { setActiveSubTool("titles"); setError(""); }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${activeSubTool === "titles" ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20" : "text-neutral-400 hover:text-white"}`}
        >
          <Hash className="h-4 w-4" />
          <span>{lang === "ar" ? "توليد عناوين مع الهاشتاغ" : "Viral Titles & Tags"}</span>
        </button>

        <button
          onClick={() => { setActiveSubTool("hooks"); setError(""); }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${activeSubTool === "hooks" ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20" : "text-neutral-400 hover:text-white"}`}
        >
          <TrendingUp className="h-4 w-4" />
          <span>{lang === "ar" ? "أفكار وهوكس تيك توك" : "Viral TikTok Hooks"}</span>
        </button>

        <button
          onClick={() => { setActiveSubTool("captions"); setError(""); }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${activeSubTool === "captions" ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20" : "text-neutral-400 hover:text-white"}`}
        >
          <MessageCircle className="h-4 w-4" />
          <span>{lang === "ar" ? "مولد الكابشن والهاشتاقات" : "Tik Cap & Hashtags"}</span>
        </button>

        <button
          onClick={() => { setActiveSubTool("mp3"); setError(""); }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${activeSubTool === "mp3" ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20" : "text-neutral-400 hover:text-white"}`}
        >
          <Music className="h-4 w-4" />
          <span>{lang === "ar" ? "محمل نغمات TikTok MP3" : "Sound/Audio Extractor"}</span>
        </button>

        <button
          onClick={() => { setActiveSubTool("downloader"); setError(""); }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${activeSubTool === "downloader" ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20" : "text-neutral-400 hover:text-white"}`}
        >
          <Download className="h-4 w-4" />
          <span>{lang === "ar" ? "تحميل بسيط مباشر" : "Direct Downloader"}</span>
        </button>

        <button
          onClick={() => { setActiveSubTool("downloader_hd"); setError(""); }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${activeSubTool === "downloader_hd" ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20" : "text-neutral-400 hover:text-white"}`}
        >
          <Sparkles className="h-4 w-4 text-cyan-400" />
          <span>{lang === "ar" ? "تحميل فائق الجودة HD" : "TikTok Downloader HD"}</span>
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-200 text-xs flex items-start gap-3 justify-end text-right">
          <span className="font-semibold leading-normal">{error}</span>
          <AlertCircle className="h-4.5 w-4.5 text-red-400 shrink-0" />
        </div>
      )}

      {success && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-200 text-xs flex items-start gap-3 justify-end text-right">
          <span className="font-semibold">{success}</span>
          <CheckCircle className="h-4.5 w-4.5 text-emerald-400 shrink-0" />
        </div>
      )}

      {activeSubTool === "downloader_hd" ? (
        <TikTokDownloaderHD lang={lang} onActionTriggered={onActionTriggered} />
      ) : (
        /* PAIR DISPLAY */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Input panel (Left/Span 5) */}
        <div className="lg:col-span-12 xl:col-span-5 p-6 rounded-2xl border border-white/5 bg-neutral-900/60 backdrop-blur-xl relative overflow-hidden text-right space-y-5">
          <div className="absolute top-0 right-0 h-[2px] w-1/3 bg-gradient-to-r from-transparent to-cyan-400" />

          {/* Sub-tool 1 & 2: TikTok MP4 or MP3 Downloader UI */}
          {(activeSubTool === "downloader" || activeSubTool === "mp3") && (
            <form onSubmit={handleDownloadRequest} className="space-y-4">
              <div className="flex items-center gap-2.5 justify-end">
                <h3 className="text-lg font-bold text-white">
                  {activeSubTool === "downloader" ? "تنزيل فيديوهات تيك توك بدون علامة" : "استخراج الصوت MP3 من تيك توك"}
                </h3>
                {activeSubTool === "downloader" ? <Smartphone className="h-5 w-5 text-cyan-400" /> : <Music className="h-5 w-5 text-cyan-400" />}
              </div>
              <p className="text-xs text-neutral-400">
                {activeSubTool === "downloader" 
                  ? "قم بلصق الرابط لفك ضغط المقالات وتلقين الخلويات بدون العلامة المائية للتداول الحر." 
                  : "استخرج المسار الصوتي الصافي للموسيقى التريند المدمجة داخل أي فيديو تيك توك بضغطة واحدة."}
              </p>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-neutral-300 block">{t.urlLabel}</label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={tkUrl}
                    onChange={(e) => setTkUrl(e.target.value)}
                    placeholder={t.urlPlaceholder}
                    className="w-full bg-neutral-950 border border-white/10 rounded-xl py-3 pr-4 pl-10 text-xs text-white focus:outline-none focus:border-cyan-500 text-left"
                  />
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-cyan-500 hover:bg-cyan-400 text-black font-bold rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                <span>استخراج وتحليل الرابط</span>
              </button>
            </form>
          )}

          {/* Sub-tool 3: Captions */}
          {activeSubTool === "captions" && (
            <div className="space-y-4">
              <div className="flex items-center gap-2.5 justify-end">
                <h3 className="text-lg font-bold text-white">صنع كابشنز فيروسية تكتسح الـ FYP</h3>
                <Sparkles className="h-5 w-5 text-cyan-400" />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-neutral-300 block">فكرة أو خلاصة تفاصيل الفيديو</label>
                <textarea
                  value={captionSummary}
                  onChange={(e) => setCaptionSummary(e.target.value)}
                  placeholder="مثال: فيديو فلوج سريع لتجربة مطعم شاورما بالجبن فخم جداً بالرياض"
                  className="w-full bg-neutral-950 border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-cyan-500 h-20 text-right"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 text-right">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-neutral-300 block">المود العام للفيديو</label>
                  <select
                    value={captionVibe}
                    onChange={(e) => setCaptionVibe(e.target.value)}
                    className="w-full bg-neutral-950 border border-white/10 rounded-xl p-2.5 text-xs text-neutral-200 text-right"
                  >
                    <option value="كوميدي ومضحك">كوميدي ومزاح</option>
                    <option value="ملهم ومحفز">تحفيز مادي وروحي</option>
                    <option value="استعراض فخم">فخامة وسرد هادئ</option>
                    <option value="جدال ونقاش غامض">مواضيع تثير الآراء</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-neutral-300 block">الجمهور المستهدف</label>
                  <select
                    value={captionAudience}
                    onChange={(e) => setCaptionAudience(e.target.value)}
                    className="w-full bg-neutral-950 border border-white/10 rounded-xl p-2.5 text-xs text-neutral-200 text-right"
                  >
                    <option value="الشباب والـ Gen-Z">الجيل الجديد (Gen-Z)</option>
                    <option value="عشاق الأطعمة والطبخ">مهتمي الطبخ والسفر</option>
                    <option value="رواد الأعمال">المستثمرين والمبرمجين</option>
                    <option value="الجمهور العام">تداول عام وشهرة مطلقة</option>
                  </select>
                </div>
              </div>

              <button
                onClick={handleCaptionGenerate}
                disabled={loading}
                className="w-full py-3 bg-cyan-500 hover:bg-cyan-400 text-black font-bold rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                <span>{t.btnGenerate}</span>
              </button>
            </div>
          )}

          {/* Sub-tool 4: Hook Generator */}
          {activeSubTool === "hooks" && (
            <div className="space-y-4">
              <div className="flex items-center gap-2.5 justify-end">
                <h3 className="text-lg font-bold text-white">تريند هوكس مخصصة لصورة التمرير</h3>
                <Sparkles className="h-5 w-5 text-cyan-400" />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-neutral-300 block">مستوى والمجال المستهدف (Niche)</label>
                <select
                  value={hookNiche}
                  onChange={(e) => setHookNiche(e.target.value)}
                  className="w-full bg-neutral-950 border border-white/10 rounded-xl p-2.5 text-xs text-neutral-200 text-right"
                >
                  <option value="عملات رقمية وبزنس">ريادة الأعمال وصناعة المال</option>
                  <option value="تكنولوجيا ومواقع">شروحات الويب والذكاء الاصطناعي</option>
                  <option value="لايف ستايل وبثوث">الفلوجات والحياة اليومية</option>
                  <option value="مراجعات كتب وتنمية">تطوير الذات والدفاع عن النفس</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-neutral-300 block">الموضوع المعين للـ Hooks</label>
                <input
                  type="text"
                  value={hookTopic}
                  onChange={(e) => setHookTopic(e.target.value)}
                  placeholder="مثال: 3 عادات يومية دمرت هاتفك الذكي بالكامل دون علمك"
                  className="w-full bg-neutral-950 border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-cyan-500 text-right"
                />
              </div>

              <button
                onClick={handleHookGenerate}
                disabled={loading}
                className="w-full py-3 bg-cyan-500 hover:bg-cyan-400 text-black font-bold rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer"
              >
                {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                <span>{t.btnHooks}</span>
              </button>
            </div>
          )}

          {/* Sub-tool 5: Title & Hashtags Generator */}
          {activeSubTool === "titles" && (
            <div className="space-y-4 text-right">
              <div className="flex items-center gap-2.5 justify-end">
                <h3 className="text-lg font-bold text-white font-sans">توليد عناوين تيك توك وتصنيفها مع الهاشتاغات</h3>
                <Hash className="h-5 w-5 text-cyan-400" />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-neutral-300 block">فكرة الفيديو الإجمالية أو موضوع الفلوج</label>
                <textarea
                  value={titleConcept}
                  onChange={(e) => setTitleConcept(e.target.value)}
                  placeholder="مثال: تجربة شراء سيارة كهربائية ذكية بذكاء اصطناعي لأول مرة بالرياض ومميزاتها وعيوبها"
                  className="w-full bg-neutral-950 border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-cyan-500 h-20 text-right font-sans"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 text-right">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-neutral-300 block">الفلوج / التصنيف</label>
                  <select
                    value={titleCategory}
                    onChange={(e) => setTitleCategory(e.target.value)}
                    className="w-full bg-neutral-950 border border-white/10 rounded-xl p-2.5 text-xs text-neutral-200 text-right font-sans"
                  >
                    <option value="شروحات وتكنولوجيا">تقنية وشروحات</option>
                    <option value="سيارات ومحركات">سيارات ومحركات</option>
                    <option value="بزنس ومشاريع">بزنس ومشاريع مالية</option>
                    <option value="لايف ستايل ويوميات">لايف ستايل وفلوجات</option>
                    <option value="سفر سياحة وطعام">سياحة وسفر ومطاعم</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-neutral-300 block">أسلوب السرد</label>
                  <select
                    value={titleStyle}
                    onChange={(e) => setTitleStyle(e.target.value)}
                    className="w-full bg-neutral-950 border border-white/10 rounded-xl p-2.5 text-xs text-neutral-200 text-right font-sans"
                  >
                    <option value="تشويقي وغامض">غموض وإثارة (Clifhanger)</option>
                    <option value="تحدي وصدمة">تحدي مذهل وصدمة</option>
                    <option value="تعليمي مبسط وبسيط">شرح مبسط ومباشر</option>
                    <option value="طريف وكوميدي">فكاهي ومزاح ترفيهي</option>
                  </select>
                </div>
              </div>

              <button
                onClick={handleTitleGenerate}
                disabled={loading}
                className="w-full py-3 bg-cyan-500 hover:bg-cyan-400 text-black font-bold rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                <span>{lang === "ar" ? "توليد العناوين والهاشتاغات" : "Generate Titles & Tags"}</span>
              </button>
            </div>
          )}
        </div>

        {/* Output metrics panel (Right/Span 7) */}
        <div className="lg:col-span-12 xl:col-span-7 flex flex-col h-full min-h-[460px]">
          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center text-center h-full flex-grow p-8 border border-white/5 bg-neutral-900/30 rounded-2xl gap-4"
              >
                <div className="h-10 w-10 rounded-full border-4 border-cyan-500/20 border-t-cyan-400 animate-spin" />
                <div>
                  <h4 className="font-bold text-white">{lang === "ar" ? "فك تشفير روابط تيك توك..." : "Decrypting TikTok links..."}</h4>
                  <p className="text-xs text-neutral-400 mt-1 max-w-sm leading-relaxed">{t.loading}</p>
                </div>
              </motion.div>
            ) : videoData && (activeSubTool === "downloader" || activeSubTool === "mp3") ? (
              <motion.div
                key="video-result"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-6 rounded-2xl border border-white/5 bg-neutral-900/40 text-right space-y-6 flex-grow"
              >
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <span className="text-xs text-cyan-400 font-bold bg-cyan-500/10 px-2.5 py-1 rounded">{videoData.author}</span>
                  <h4 className="font-bold text-white">{t.resultHeader}</h4>
                </div>

                <div className="flex flex-col md:flex-row gap-5 items-stretch">
                  {/* Miniature Player */}
                  <div className="w-full md:w-1/3 rounded-xl overflow-hidden bg-neutral-950 flex flex-col justify-between border border-white/5 aspect-[9/16] max-h-[280px]">
                    <div className="relative flex-grow flex items-center justify-center overflow-hidden">
                      <video 
                        src={videoData.downloadLinks.rawNoWatermark || videoData.downloadLinks.noWatermark} 
                        className="w-full h-full object-cover" 
                        controls
                        playsInline
                        muted
                      />
                    </div>
                  </div>

                  {/* Descriptions and specific downloads */}
                  <div className="flex-grow flex flex-col justify-between space-y-4 text-right">
                    <div className="space-y-2">
                      <p className="text-sm font-bold text-white leading-relaxed">{videoData.title}</p>
                      <span className="text-xs text-neutral-400 block font-mono">ID: {videoData.videoId} | {videoData.duration}</span>
                    </div>

                    {/* Stats metric bar */}
                    <div className="bg-neutral-950 p-3 rounded-xl border border-white/5 grid grid-cols-4 gap-2 text-center" id="tiktok-parsed-stats">
                      <div>
                        <span className="block text-xs font-bold text-white">{videoData.stats.likes}</span>
                        <span className="text-[9px] text-neutral-500">لايك</span>
                      </div>
                      <div>
                        <span className="block text-xs font-bold text-white">{videoData.stats.views}</span>
                        <span className="text-[9px] text-neutral-500">مشاهدة</span>
                      </div>
                      <div>
                        <span className="block text-xs font-bold text-white">{videoData.stats.comments}</span>
                        <span className="text-[9px] text-neutral-500">تعليق</span>
                      </div>
                      <div>
                        <span className="block text-xs font-bold text-white">{videoData.stats.shares}</span>
                        <span className="text-[9px] text-neutral-500">مشاركة</span>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {activeSubTool === "downloader" ? (
                        <>
                          <div className="flex items-center gap-1.5 justify-center md:justify-end bg-cyan-950/20 px-3 py-1.5 rounded-lg border border-cyan-500/10 text-[10px] text-cyan-400 font-bold select-none">
                            <CheckCircle className="h-3.5 w-3.5 text-cyan-500 shrink-0" />
                            <span>
                              {lang === "ar" 
                                ? "صيغة الفيديو المعالجة: MP4 (H.264 + AAC) ✓" 
                                : "Transcoded Output: MP4 (H.264 + AAC) ✓"}
                            </span>
                          </div>
                          <button
                            disabled={downloadingVideo}
                            onClick={() => downloadTikTokFile(videoData.downloadLinks.noWatermark, `TikTok_NoWatermark_${videoData.videoId}.mp4`, "video")}
                            className="w-full py-3 bg-gradient-to-r from-cyan-500 to-indigo-500 hover:from-cyan-400 hover:to-indigo-400 disabled:opacity-50 text-black font-extrabold text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-all"
                          >
                            {downloadingVideo ? (
                              <>
                                <RefreshCw className="h-4 w-4 animate-spin text-black" />
                                <span>{lang === "ar" ? "جاري التحميل..." : "Downloading..."}</span>
                              </>
                            ) : (
                              <>
                                <Download className="h-4 w-4" />
                                <span>{t.btnDownload}</span>
                              </>
                            )}
                          </button>
                        </>
                      ) : (
                        <>
                          {/* Display the original link as requested */}
                          <div className="flex flex-col gap-2 bg-neutral-950 p-4 rounded-xl border border-white/5 text-right">
                            <span className="text-[10px] text-neutral-400 font-bold block">
                              {lang === "ar" ? "رابط تيك توك المستخدم لاستخراج الصوت:" : "TikTok Link Used for Audio Extraction:"}
                            </span>
                            <span className="text-[11px] text-cyan-400 font-mono select-all break-all block text-left bg-neutral-900/50 p-2.5 rounded border border-white/5">
                              {tkUrl}
                            </span>
                          </div>

                          {/* MP3 Format and Bitrate label */}
                          <div className="flex items-center justify-between bg-emerald-500/10 px-4 py-3 rounded-xl border border-emerald-500/20 text-xs text-emerald-400 font-bold">
                            <span className="font-mono text-xs">320kbps High Fidelity</span>
                            <span className="flex items-center gap-1.5">
                              {lang === "ar" ? (
                                <>
                                  <span>صيغة التحميل المعتمدة:</span>
                                  <span className="bg-emerald-500/20 px-2.5 py-1 rounded text-[11px] font-extrabold text-emerald-400">✅ MP3 - 320 kbps</span>
                                </>
                              ) : (
                                <>
                                  <span>Download Format:</span>
                                  <span className="bg-emerald-500/20 px-2.5 py-1 rounded text-[11px] font-extrabold text-emerald-400">✅ MP3 - 320 kbps</span>
                                </>
                              )}
                            </span>
                          </div>

                          <button
                            disabled={downloadingAudio}
                            onClick={() => downloadTikTokFile(videoData.downloadLinks.audioMP3, `TikTok_Audio_${videoData.videoId}.mp3`, "audio")}
                            className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-450 hover:to-teal-450 disabled:opacity-50 text-black font-extrabold text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-all shadow-lg shadow-emerald-500/15"
                          >
                            {downloadingAudio ? (
                              <>
                                <RefreshCw className="h-4.5 w-4.5 animate-spin text-black" />
                                <span>{lang === "ar" ? "جاري التحميل..." : "Downloading..."}</span>
                              </>
                            ) : (
                              <>
                                <Music className="h-4.5 w-4.5 text-black" />
                                <span>
                                  {lang === "ar" ? "تحميل الصوت بصيغة ✅ MP3 - 320 kbps" : "Download Audio as ✅ MP3 - 320 kbps"}
                                </span>
                              </>
                            )}
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : captionResult || hookResult || titleResult ? (
              <motion.div
                key="ai-output"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-6 rounded-2xl border border-white/5 bg-neutral-900/40 relative overflow-hidden flex-grow text-right"
              >
                <div className="absolute top-0 right-0 h-[2px] w-1/2 bg-gradient-to-r from-transparent via-cyan-400 to-transparent" />
                <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-5">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-emerald-400" />
                    <span className="text-xs font-semibold text-emerald-400 font-mono">TikTok Virality Engine v1 Active</span>
                  </div>
                  <h4 className="font-bold text-white text-md flex items-center gap-2">
                    <span>{lang === "ar" ? "النتائج المقترحة" : "AI Viral Blueprint"}</span>
                    <Sparkles className="h-4.5 w-4.5 text-cyan-400" />
                  </h4>
                </div>

                <div className="space-y-4 max-h-[460px] overflow-y-auto pr-1">
                  {renderAIResponse(
                    activeSubTool === "captions" 
                      ? captionResult 
                      : (activeSubTool === "hooks" ? hookResult : titleResult)
                  )}
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center text-center h-full flex-grow p-10 border border-white/5 bg-neutral-900/30 rounded-2xl text-neutral-500"
              >
                <Smartphone className="h-12 w-12 text-neutral-700 mb-3" />
                <h4 className="text-sm font-semibold text-neutral-300">{lang === "ar" ? "بانتظار الرابط الخاص بك" : "TikTok URL Input Pending"}</h4>
                <p className="text-xs text-neutral-400 mt-1 max-w-xs leading-relaxed">
                  {lang === "ar" 
                    ? "أدخل الرابط في الحقل الجانبي الأيسر لعرض معلومات التفاعل ومعدلات التحميل المباشرة الفورية." 
                    : "Supply the TikTok video or topic on the left to extract the specific MP4 outputs and trend metrics."}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      )}
    </div>
  );
}

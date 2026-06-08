import React, { useState } from "react";
import { apiFetch } from "../../lib/apiClient";
import { 
  Youtube, Download, Sparkles, Image as ImageIcon, LineChart, Hash, 
  AlertCircle, CheckCircle, Search, Eye, Upload, RefreshCw, FileText
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { downloadFile } from "../../utils/downloader";

interface YouTubeToolsProps {
  lang: "ar" | "en";
  onActionTriggered: () => void;
  initialSubTool?: string;
}

export default function YouTubeTools({ lang, onActionTriggered, initialSubTool }: YouTubeToolsProps) {
  const [activeSubTool, setActiveSubTool] = useState<"downloader" | "titles" | "hooks" | "analyzer" | "performance" | "seo" | "transcript">("downloader");

  React.useEffect(() => {
    if (initialSubTool) {
      setActiveSubTool(initialSubTool as any);
    }
  }, [initialSubTool]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Universal state containers
  const [ytUrl, setYtUrl] = useState("");
  const [thumbnailData, setThumbnailData] = useState<any>(null);

  // Transcript Generator states
  const [transcriptUrl, setTranscriptUrl] = useState("");
  const [transcriptAIResult, setTranscriptAIResult] = useState("");

  // Title Generator states
  const [titleTopic, setTitleTopic] = useState("");
  const [titleCategory, setTitleCategory] = useState("تكنولوجيا");
  const [titleTone, setTitleTone] = useState("حماسي وتشويقي");
  const [titleKeywords, setTitleKeywords] = useState("");
  const [titleAIResult, setTitleAIResult] = useState("");

  // Hook Generator states
  const [hookConcept, setHookConcept] = useState("");
  const [hookType, setHookType] = useState("سؤال صادم");
  const [hookAIResult, setHookAIResult] = useState("");

  // Thumbnail Analyzer states
  const [analyzerImage, setAnalyzerImage] = useState<string | null>(null);
  const [analyzerContext, setAnalyzerContext] = useState("");
  const [analyzerAIResult, setAnalyzerAIResult] = useState("");

  // Performance states
  const [perfImpressions, setPerfImpressions] = useState("10000");
  const [perfCtr, setPerfCtr] = useState("4.2");
  const [perfRetention, setPerfRetention] = useState("35");
  const [perfAvd, setPerfAvd] = useState("3.5");
  const [perfDuration, setPerfDuration] = useState("10");
  const [perfAIResult, setPerfAIResult] = useState("");

  // SEO states
  const [seoTopic, setSeoTopic] = useState("");
  const [seoKeywords, setSeoKeywords] = useState("");
  const [seoIntent, setSeoIntent] = useState("تعليمي");
  const [seoAIResult, setSeoAIResult] = useState("");

  const t = {
    ar: {
      btnGenerate: "توليد بالذكاء الاصطناعي",
      btnAnalyze: "بدأ التحليل الذكي",
      btnDownload: "تحميل الصورة المصغرة",
      loadingText: "جاري تحليل البيانات وصياغة الرد...",
      uploaderText: "اسحب الصورة المصغرة هنا أو اضغط لرفعها",
      uploaderHint: "صيغ PNG, JPG حتي 10 ميجا",
      promptError: "الرجاء تعبئة كافة الحقول المطلوبة للمواصلة",
      resultTitle: "التقرير والنتيجة المقترحة",
    },
    en: {
      btnGenerate: "Generate with AI",
      btnAnalyze: "Begin AI Analysis",
      btnDownload: "Download Thumbnail",
      loadingText: "Processing AI response...",
      uploaderText: "Drag & drop thumbnail or click to upload",
      uploaderHint: "PNG, JPG up to 10MB",
      promptError: "Please fill all required parameters to execute",
      resultTitle: "Result & Strategic Report",
    }
  }[lang];

  // Helper to format custom styled markdown responses safely without packages
  const renderAIResponse = (text: string) => {
    if (!text) return null;
    return (
      <div className="space-y-4 text-neutral-200 text-sm leading-relaxed text-right font-sans" id="ai-formatted-markdown">
        {text.split("\n").map((line, idx) => {
          const trimmed = line.trim();
          if (trimmed.startsWith("###")) {
            return <h4 key={idx} className="text-md font-bold text-red-400 mt-4 border-r-2 border-red-500 pr-2">{trimmed.replace("###", "")}</h4>;
          }
          if (trimmed.startsWith("##")) {
            return <h3 key={idx} className="text-lg font-extrabold text-white mt-5 border-r-4 border-red-500 pr-2.5">{trimmed.replace("##", "")}</h3>;
          }
          if (trimmed.startsWith("#")) {
            return <h2 key={idx} className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-amber-400 mt-6">{trimmed.replace("#", "")}</h2>;
          }
          if (trimmed.startsWith("-") || trimmed.startsWith("*")) {
            return <div key={idx} className="flex justify-end gap-2 pr-4 text-neutral-300">• <span>{trimmed.substring(1).trim()}</span></div>;
          }
          if (/^\d+\./.test(trimmed)) {
            return <div key={idx} className="bg-neutral-950/60 p-3.5 rounded-xl border border-white/5 my-2.5 font-sans leading-normal">{trimmed}</div>;
          }
          return trimmed ? <p key={idx} className="text-neutral-300">{trimmed}</p> : <div key={idx} className="h-2" />;
        })}
      </div>
    );
  };

  // 1. Thumbnail Downloader
  const handleThumbnailRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ytUrl) return;
    setLoading(true);
    setError("");
    setThumbnailData(null);

    try {
      const data = await apiFetch("/api/youtube/download-thumbnail", {
        method: "POST",
        body: JSON.stringify({ url: ytUrl })
      });
      if (data) {
        setThumbnailData(data);
        setSuccessMsg(lang === "ar" ? "تم العثور على الصورة المصغرة بنجاح!" : "Thumbnail extracted successfully!");
        onActionTriggered();
      }
    } catch (err) {
      setError("تعذر الاتصال بخادم المعالجة");
    } finally {
      setLoading(false);
    }
  };

  // 2. Title Generator
  const handleTitleGenerate = async () => {
    if (!titleTopic) {
      setError(t.promptError);
      return;
    }
    setLoading(true);
    setError("");
    setTitleAIResult("");

    try {
      const data = await apiFetch("/api/youtube/title-generator", {
        method: "POST",
        body: JSON.stringify({
          topic: titleTopic,
          category: titleCategory,
          tone: titleTone,
          keywords: titleKeywords,
          language: lang
        })
      });
      if (data) {
        setTitleAIResult(data.result);
        onActionTriggered();
      }
    } catch (err) {
      setError("عطل في الاتصال بالخادم");
    } finally {
      setLoading(false);
    }
  };

  // 3. Hook Generator
  const handleHookGenerate = async () => {
    if (!hookConcept) {
      setError(t.promptError);
      return;
    }
    setLoading(true);
    setError("");
    setHookAIResult("");

    try {
      const data = await apiFetch("/api/youtube/hook-generator", {
        method: "POST",
        body: JSON.stringify({
          videoConcept: hookConcept,
          hookType,
          language: lang
        })
      });
      if (data) {
        setHookAIResult(data.result);
        onActionTriggered();
      }
    } catch (err) {
      setError("Error");
    } finally {
      setLoading(false);
    }
  };

  // 4. Thumbnail Analyzer
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAnalyzerImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyzeThumbnail = async () => {
    if (!analyzerImage) {
      setError(lang === "ar" ? "برجاء رفع صورة مصغرة أولاً" : "Please upload a thumbnail first");
      return;
    }
    setLoading(true);
    setError("");
    setAnalyzerAIResult("");

    try {
      const data = await apiFetch("/api/youtube/analyze-thumbnail", {
        method: "POST",
        body: JSON.stringify({
          imageBase64: analyzerImage,
          videoContext: analyzerContext
        })
      });
      if (data) {
        setAnalyzerAIResult(data.result);
        onActionTriggered();
      }
    } catch (err) {
      setError("Error analyzing thumbnail");
    } finally {
      setLoading(false);
    }
  };

  // 5. Performance Analyzer
  const handlePerfAnalyze = async () => {
    setLoading(true);
    setError("");
    setPerfAIResult("");

    try {
      const data = await apiFetch("/api/youtube/video-performance", {
        method: "POST",
        body: JSON.stringify({
          impressions: perfImpressions,
          ctr: perfCtr,
          retention: perfRetention,
          avd: perfAvd,
          duration: perfDuration
        })
      });
      if (data) {
        setPerfAIResult(data.result);
        onActionTriggered();
      }
    } catch (err) {
      setError("Error calling diagnostics API");
    } finally {
      setLoading(false);
    }
  };

  // 6. SEO Generator
  const handleSEOGenerate = async () => {
    if (!seoTopic) {
      setError(t.promptError);
      return;
    }
    setLoading(true);
    setError("");
    setSeoAIResult("");

    try {
      const data = await apiFetch("/api/youtube/seo-generator", {
        method: "POST",
        body: JSON.stringify({
          topic: seoTopic,
          primaryKeywords: seoKeywords,
          searchIntent: seoIntent
        })
      });
      if (data) {
        setSeoAIResult(data.result);
        onActionTriggered();
      }
    } catch (err) {
      setError("SEO Error");
    } finally {
      setLoading(false);
    }
  };

  // 7. Transcript Generator
  const handleTranscriptGenerate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!transcriptUrl) {
      setError(t.promptError);
      return;
    }
    setLoading(true);
    setError("");
    setTranscriptAIResult("");

    try {
      const data = await apiFetch("/api/youtube/transcript-generator", {
        method: "POST",
        body: JSON.stringify({
          url: transcriptUrl,
          language: lang
        })
      });
      if (data) {
        setTranscriptAIResult(data.result);
        onActionTriggered();
      }
    } catch (err) {
      setError("عجز في الاتصال بالقنوات السحابية");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8" id="youtube-creator-suite">
      {/* Sub tabs navigation */}
      <div className="flex flex-wrap items-center gap-1.5 justify-end border-b border-white/5 pb-4 overflow-x-auto">
        <button
          onClick={() => { setActiveSubTool("transcript"); setError(""); }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${activeSubTool === "transcript" ? "bg-red-500/10 text-red-400 border border-red-500/20" : "text-neutral-400 hover:text-white"}`}
        >
          <FileText className="h-4 w-4" />
          <span>{lang === "ar" ? "مستخرج ومفرغ النصوص" : "Caption Transcript"}</span>
        </button>

        <button
          onClick={() => { setActiveSubTool("seo"); setError(""); }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${activeSubTool === "seo" ? "bg-red-500/10 text-red-400 border border-red-500/20" : "text-neutral-400 hover:text-white"}`}
        >
          <Hash className="h-4 w-4" />
          <span>{lang === "ar" ? "مولد السيو والوصف" : "Tags & SEO Builder"}</span>
        </button>

        <button
          onClick={() => { setActiveSubTool("performance"); setError(""); }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${activeSubTool === "performance" ? "bg-red-500/10 text-red-400 border border-red-500/20" : "text-neutral-400 hover:text-white"}`}
        >
          <LineChart className="h-4 w-4" />
          <span>{lang === "ar" ? "تحليل أداء الفيديو" : "Analytics Diagnostic"}</span>
        </button>

        <button
          onClick={() => { setActiveSubTool("analyzer"); setError(""); }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${activeSubTool === "analyzer" ? "bg-red-500/10 text-red-400 border border-red-500/20" : "text-neutral-400 hover:text-white"}`}
        >
          <ImageIcon className="h-4 w-4" />
          <span>{lang === "ar" ? "تحليل الصورة المصغرة" : "Thumbnail Analyzer"}</span>
        </button>

        <button
          onClick={() => { setActiveSubTool("hooks"); setError(""); }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${activeSubTool === "hooks" ? "bg-red-500/10 text-red-400 border border-red-500/20" : "text-neutral-400 hover:text-white"}`}
        >
          <Sparkles className="h-4 w-4" />
          <span>{lang === "ar" ? "صانع خطافات الفيديو" : "CTR Intro Hooks"}</span>
        </button>

        <button
          onClick={() => { setActiveSubTool("titles"); setError(""); }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${activeSubTool === "titles" ? "bg-red-500/10 text-red-400 border border-red-500/20" : "text-neutral-400 hover:text-white"}`}
        >
          <Sparkles className="h-4 w-4" />
          <span>{lang === "ar" ? "مولد عناوين فيروسية" : "Viral Titles"}</span>
        </button>

        <button
          onClick={() => { setActiveSubTool("downloader"); setError(""); }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${activeSubTool === "downloader" ? "bg-red-500/10 text-red-400 border border-red-500/20" : "text-neutral-400 hover:text-white"}`}
        >
          <Download className="h-4 w-4" />
          <span>{lang === "ar" ? "تحميل الصورة المصغرة" : "Thumbnail Extractor"}</span>
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-200 text-xs flex items-start gap-3 justify-end text-right">
          <span className="font-semibold leading-normal">{error}</span>
          <AlertCircle className="h-4.5 w-4.5 text-red-400 shrink-0" />
        </div>
      )}

      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-200 text-xs flex items-start gap-3 justify-end text-right">
          <span className="font-semibold leading-normal">{successMsg}</span>
          <CheckCircle className="h-4.5 w-4.5 text-emerald-400 shrink-0" />
        </div>
      )}

      {/* RENDER ACTIVE SUBTOOL INPUT PANEL */}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Input parameters panel (Left/Span 5) */}
        <div className="lg:col-span-5 p-6 rounded-2xl border border-white/5 bg-neutral-900/60 backdrop-blur-xl relative overflow-hidden text-right space-y-5">
          <div className="absolute top-0 right-0 h-[2px] w-1/3 bg-gradient-to-r from-transparent to-red-500" />
          
          {/* Sub-tool 1: Thumbnail Downloader UI */}
          {activeSubTool === "downloader" && (
            <form onSubmit={handleThumbnailRequest} className="space-y-4">
              <div className="flex items-center gap-2.5 justify-end">
                <h3 className="text-lg font-bold text-white">تحميل الصورة المصغرة لليوتيوب</h3>
                <Download className="h-5 w-5 text-red-500" />
              </div>
              <p className="text-xs text-neutral-400">أدخل رابط فيديو يوتيوب أو الـ Video ID لاستخراج الصور بجميع الجودات المتوفرة.</p>
              
              <div className="space-y-2">
                <label className="text-xs font-semibold text-neutral-300 block">رابط الفيديو</label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={ytUrl}
                    onChange={(e) => setYtUrl(e.target.value)}
                    placeholder="https://www.youtube.com/watch?v=..."
                    className="w-full bg-neutral-950 border border-white/10 rounded-xl py-3 pr-4 pl-10 text-xs text-white focus:outline-none focus:border-red-500 text-left"
                  />
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-red-600 hover:bg-red-500 transition-colors rounded-xl text-xs font-bold text-white flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Eye className="h-4 w-4" />}
                <span>استخراج الصورة المصغرة</span>
              </button>
            </form>
          )}

          {/* Sub-tool 2: Viral titles tool */}
          {activeSubTool === "titles" && (
            <div className="space-y-4">
              <div className="flex items-center gap-2.5 justify-end">
                <h3 className="text-lg font-bold text-white">توليد عناوين يوتيوب مغناطيسية</h3>
                <Sparkles className="h-5 w-5 text-red-500" />
              </div>
              
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-neutral-300 block">موضوع أو فكرة الفيديو</label>
                <textarea
                  value={titleTopic}
                  onChange={(e) => setTitleTopic(e.target.value)}
                  placeholder="مثال: رحلتي في تعلم البرمجة من الصفر كطالب بالجامعة"
                  className="w-full bg-neutral-950 border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-red-500 h-20 text-right"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-neutral-300 block">التصنيف</label>
                  <select
                    value={titleCategory}
                    onChange={(e) => setTitleCategory(e.target.value)}
                    className="w-full bg-neutral-950 border border-white/10 rounded-xl p-2.5 text-xs text-neutral-200 focus:outline-none text-right"
                  >
                    <option value="تكنولوجيا">تكنولوجيا وتعليم</option>
                    <option value="طبخ وسياحة">سفر وتدوين يومي</option>
                    <option value="رياضة وألعاب">ألعاب إلكترونية</option>
                    <option value="مال وأعمال">تجارة وصناعة ثروة</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-neutral-300 block">نبرة العنوان</label>
                  <select
                    value={titleTone}
                    onChange={(e) => setTitleTone(e.target.value)}
                    className="w-full bg-neutral-950 border border-white/10 rounded-xl p-2.5 text-xs text-neutral-200 focus:outline-none text-right"
                  >
                    <option value="حماسي وجاذب">حماسي وجاذب جداً</option>
                    <option value="علمي وموثق">علمي وأكاديمي</option>
                    <option value="قصصي درامي">قصصي مبهم وغامض</option>
                    <option value="قوائم وأرقام">جاذبية الأرقام (Lists)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-neutral-300 block">الكلمات الدلالية المرافقة (اختياري)</label>
                <input
                  type="text"
                  value={titleKeywords}
                  onChange={(e) => setTitleKeywords(e.target.value)}
                  placeholder="مثال: تودو ، رياكت ، تصميم"
                  className="w-full bg-neutral-950 border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-red-500 text-right"
                />
              </div>

              <button
                onClick={handleTitleGenerate}
                disabled={loading}
                className="w-full py-3 bg-red-600 hover:bg-red-500 rounded-xl text-xs font-bold text-white flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                <span>{t.btnGenerate}</span>
              </button>
            </div>
          )}

          {/* Sub-tool 3: Hook Generator */}
          {activeSubTool === "hooks" && (
            <div className="space-y-4">
              <div className="flex items-center gap-2.5 justify-end">
                <h3 className="text-lg font-bold text-white">صنع خطافات وفتات يوتيوب</h3>
                <Sparkles className="h-5 w-5 text-red-500" />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-neutral-300 block">فكرة أو ملخص الفيديو</label>
                <textarea
                  value={hookConcept}
                  onChange={(e) => setHookConcept(e.target.value)}
                  placeholder="مثال: كيف تستثمر 50$ شهرياً لبناء مليون ليرة بالذهب"
                  className="w-full bg-neutral-950 border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none h-20 text-right"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-neutral-300 block">تصنيف ونوع الخطاف</label>
                <select
                  value={hookType}
                  onChange={(e) => setHookType(e.target.value)}
                  className="w-full bg-neutral-950 border border-white/10 rounded-xl p-2.5 text-xs text-neutral-200 text-right"
                >
                  <option value="سؤال صادم">سؤال فوري يضرب المشاهد بالفضول</option>
                  <option value="إحصائية غريبة">إحصائية أو حقيقة غير مألوفة</option>
                  <option value="سيناريو غامض">جملة غامضة: ما الذي حدث هنا؟</option>
                  <option value="تحدي 30 يوم">صيغة تحدي وتغيير جذري ملموس</option>
                </select>
              </div>

              <button
                onClick={handleHookGenerate}
                disabled={loading}
                className="w-full py-3 bg-red-600 hover:bg-red-500 rounded-xl text-xs font-bold text-white flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                <span>تأليف أفضل بداية</span>
              </button>
            </div>
          )}

          {/* Sub-tool 4: Thumbnail Analyzer */}
          {activeSubTool === "analyzer" && (
            <div className="space-y-4">
              <div className="flex items-center gap-2.5 justify-end">
                <h3 className="text-lg font-bold text-white">تحليل الصورة المصغرة بالذكاء الاصطناعي</h3>
                <ImageIcon className="h-5 w-5 text-red-500" />
              </div>

              {/* Uploader */}
              <div className="relative border-2 border-dashed border-white/10 rounded-2xl hover:border-red-500/50 p-6 flex flex-col items-center justify-center gap-3 transition-all cursor-pointer bg-neutral-950/40 overflow-hidden">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
                {analyzerImage ? (
                  <div className="relative w-full aspect-video rounded-xl overflow-hidden">
                    <img src={analyzerImage} className="w-full h-full object-cover" alt="To Analyze" referrerPolicy="no-referrer" />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-xs text-white font-bold opacity-0 hover:opacity-100 transition-opacity">تحديث الصورة</div>
                  </div>
                ) : (
                  <>
                    <Upload className="h-8 w-8 text-neutral-500" />
                    <div className="text-center">
                      <p className="text-xs font-bold text-white">{t.uploaderText}</p>
                      <p className="text-[10px] text-neutral-500 mt-1">{t.uploaderHint}</p>
                    </div>
                  </>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-neutral-300 block">سياق الفيديو الأصلي (اختياري)</label>
                <input
                  type="text"
                  value={analyzerContext}
                  onChange={(e) => setAnalyzerContext(e.target.value)}
                  placeholder="مثال: فيديو تحدي البقاء في الغابة لمدة 24 ساعة"
                  className="w-full bg-neutral-950 border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-red-500 text-right"
                />
              </div>

              <button
                onClick={handleAnalyzeThumbnail}
                disabled={loading || !analyzerImage}
                className="w-full py-3 bg-red-600 hover:bg-red-500 rounded-xl text-xs font-bold text-white flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <ImageIcon className="h-4 w-4" />}
                <span>{t.btnAnalyze}</span>
              </button>
            </div>
          )}

          {/* Sub-tool 5: Video analytics diagnostic */}
          {activeSubTool === "performance" && (
            <div className="space-y-4">
              <div className="flex items-center gap-2.5 justify-end">
                <h3 className="text-lg font-bold text-white">تحليل تفصيلي لأداء الفيديو</h3>
                <LineChart className="h-5 w-5 text-red-500" />
              </div>

              <div className="grid grid-cols-2 gap-3 text-right">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-neutral-300 block">مرات الظهور</label>
                  <input
                    type="number"
                    value={perfImpressions}
                    onChange={(e) => setPerfImpressions(e.target.value)}
                    className="w-full bg-neutral-950 border border-white/10 rounded-xl p-2.5 text-xs text-white focus:outline-none text-left"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-neutral-300 block">نسبة النقر CTR %</label>
                  <input
                    type="text"
                    value={perfCtr}
                    onChange={(e) => setPerfCtr(e.target.value)}
                    className="w-full bg-neutral-950 border border-white/10 rounded-xl p-2.5 text-xs text-white focus:outline-none text-left"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-right">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-neutral-300 block">الاحتفاظ بالجمهور %(Retention)</label>
                  <input
                    type="number"
                    value={perfRetention}
                    onChange={(e) => setPerfRetention(e.target.value)}
                    className="w-full bg-neutral-950 border border-white/10 rounded-xl p-2.5 text-xs text-white focus:outline-none text-left"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-neutral-300 block">طول الفيديو (دقيقة)</label>
                  <input
                    type="number"
                    value={perfDuration}
                    onChange={(e) => setPerfDuration(e.target.value)}
                    className="w-full bg-neutral-950 border border-white/10 rounded-xl p-2.5 text-xs text-white focus:outline-none text-left"
                  />
                </div>
              </div>

              <button
                onClick={handlePerfAnalyze}
                disabled={loading}
                className="w-full py-3 bg-red-600 hover:bg-red-500 rounded-xl text-xs font-bold text-white flex items-center justify-center gap-2 cursor-pointer"
              >
                {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <LineChart className="h-4 w-4" />}
                <span>تفقد تقرير الأداء وحل المشاكل</span>
              </button>
            </div>
          )}

          {/* Sub-tool 6: SEO tag generator */}
          {activeSubTool === "seo" && (
            <div className="space-y-4">
              <div className="flex items-center gap-2.5 justify-end">
                <h3 className="text-lg font-bold text-white">محسن السيو والوصف الشامل</h3>
                <Hash className="h-5 w-5 text-red-500" />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-neutral-300 block">عنوان أو تخصص الفيديو</label>
                <input
                  type="text"
                  value={seoTopic}
                  onChange={(e) => setSeoTopic(e.target.value)}
                  placeholder="مثال: شرح تصميم موقع احترافي بـ Tailwind"
                  className="w-full bg-neutral-950 border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-red-500 text-right"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-neutral-300 block">الكلمات الدلالية الأساسية لربطها</label>
                <textarea
                  value={seoKeywords}
                  onChange={(e) => setSeoKeywords(e.target.value)}
                  placeholder="مثال: تصميم مواقع، تعلم تيلويند، كورس واجهات"
                  className="w-full bg-neutral-950 border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none h-16 text-right"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-neutral-300 block">نية البحث وقصد الجمهور</label>
                <select
                  value={seoIntent}
                  onChange={(e) => setSeoIntent(e.target.value)}
                  className="w-full bg-neutral-950 border border-white/10 rounded-xl p-2.5 text-xs text-neutral-200 text-right"
                >
                  <option value="تعليمي">تعليمي وشرح مبسط</option>
                  <option value="شراء واستهلاك">تجاري ومقارنة لابتوبات</option>
                  <option value="تسلية">منشور رائج ولتفت الأنظار</option>
                </select>
              </div>

              <button
                onClick={handleSEOGenerate}
                disabled={loading}
                className="w-full py-3 bg-red-600 hover:bg-red-500 rounded-xl text-xs font-bold text-white flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Hash className="h-4 w-4" />}
                <span>صناعة الأكواد والوصف</span>
              </button>
            </div>
          )}

          {/* Sub-tool 7: Transcript Generator */}
          {activeSubTool === "transcript" && (
            <form onSubmit={handleTranscriptGenerate} className="space-y-4">
              <div className="flex items-center gap-2.5 justify-end">
                <h3 className="text-lg font-bold text-white">تفريغ يوتيوب النصي والملخص</h3>
                <FileText className="h-5 w-5 text-red-500" />
              </div>
              <p className="text-xs text-neutral-400">أدخل رابط فيديو يوتيوب لاستخراجه بالكامل كملخص ومقال وخط زمني منسق.</p>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-neutral-300 block">رابط الفيديو</label>
                <input
                  type="text"
                  required
                  value={transcriptUrl}
                  onChange={(e) => setTranscriptUrl(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="w-full bg-neutral-950 border border-white/10 rounded-xl py-3 pr-4 text-xs text-white focus:outline-none focus:border-red-500 text-left"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-red-600 hover:bg-red-500 transition-colors rounded-xl text-xs font-bold text-white flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />}
                <span>بدء التفريغ بالذكاء الاصطناعي</span>
              </button>
            </form>
          )}
        </div>

        {/* OUTPUT PANEL (Right/Span 7) */}
        <div className="lg:col-span-7 flex flex-col h-full min-h-[480px]">
          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div
                key="loading-panel"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center h-full flex-grow p-8 border border-white/5 bg-neutral-900/30 rounded-2xl text-center gap-4"
              >
                <div className="relative">
                  <div className="h-12 w-12 rounded-full border-4 border-red-500/20 border-t-red-500 animate-spin" />
                  <Youtube className="h-5 w-5 text-red-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                </div>
                <div>
                  <h4 className="font-bold text-white">{lang === "ar" ? "يعمل الذكاء الاصطناعي الآن..." : "AI Engine is synthesizing..."}</h4>
                  <p className="text-xs text-neutral-400 mt-1 max-w-xs mx-auto leading-relaxed">{t.loadingText}</p>
                </div>
              </motion.div>
            ) : thumbnailData && activeSubTool === "downloader" ? (
              <motion.div
                key="downloader-results"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-6 rounded-2xl border border-white/5 bg-neutral-900/40 text-right space-y-5 flex-grow"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-sans font-mono bg-neutral-950 px-2.5 py-1 rounded border border-white/5 text-neutral-400">ID: {thumbnailData.videoId}</span>
                  <p className="font-bold text-white">{lang === "ar" ? "الصور المستخرجة" : "Extracted Images"}</p>
                </div>

                {/* Primary Preview */}
                <div className="relative rounded-2xl overflow-hidden aspect-video border border-white/10 group bg-neutral-950">
                  <img src={thumbnailData.thumbnails[0].url} className="w-full h-full object-cover" alt="Main Preview" referrerPolicy="no-referrer" />
                  <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black to-transparent flex items-end justify-between">
                    <button
                      onClick={() => downloadFile(thumbnailData.thumbnails[0].url, `YouTube_MaxHD_${Date.now()}.jpg`)}
                      className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 transition-colors text-xs font-bold text-white flex items-center gap-1 cursor-pointer"
                    >
                      <Download className="h-3.5 w-3.5" />
                      <span>{lang === "ar" ? "تنزيل الآن" : "Download Max HD"}</span>
                    </button>
                    <span className="text-xs text-white font-bold bg-black/60 px-2 py-1 rounded">1280 x 720</span>
                  </div>
                </div>

                {/* Other resolution grids */}
                <div className="grid grid-cols-3 gap-3">
                  {thumbnailData.thumbnails.slice(1).map((thumb: any, index: number) => (
                    <div key={index} className="rounded-xl border border-white/5 overflow-hidden bg-neutral-950 flex flex-col justify-between">
                      <div className="aspect-video relative overflow-hidden bg-white/5">
                        <img src={thumb.url} className="w-full h-full object-cover" alt="Resolution preview" referrerPolicy="no-referrer" />
                      </div>
                      <div className="p-2 border-t border-white/5 flex items-center justify-between">
                        <button
                          onClick={() => downloadFile(thumb.url, `YouTube_Thumb_${thumb.width}x${thumb.height}_${Date.now()}.jpg`)}
                          className="p-1.5 rounded bg-white/5 hover:bg-white/10 text-white transition-all cursor-pointer"
                        >
                          <Download className="h-3 w-3" />
                        </button>
                        <span className="text-[10px] font-mono font-bold text-neutral-400">{thumb.width} x {thumb.height}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            ) : titleAIResult || hookAIResult || analyzerAIResult || perfAIResult || seoAIResult || transcriptAIResult ? (
              <motion.div
                key="ai-output"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-6 rounded-2xl border border-white/5 bg-neutral-900/40 relative overflow-hidden flex-grow"
              >
                <div className="absolute top-0 right-0 h-[2px] w-1/2 bg-gradient-to-r from-transparent via-red-500 to-transparent" />
                <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-5">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-emerald-400" />
                    <span className="text-xs font-semibold text-emerald-400 font-mono">TikTube AI model-v3.5 active</span>
                  </div>
                  <h4 className="font-bold text-white text-md flex items-center gap-2">
                    <span>{t.resultTitle}</span>
                    <FileText className="h-4.5 w-4.5 text-red-500" />
                  </h4>
                </div>
                
                <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
                  {renderAIResponse(
                    activeSubTool === "titles" ? titleAIResult :
                    activeSubTool === "hooks" ? hookAIResult :
                    activeSubTool === "analyzer" ? analyzerAIResult :
                    activeSubTool === "performance" ? perfAIResult :
                    activeSubTool === "transcript" ? transcriptAIResult :
                    seoAIResult
                  )}
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="empty-panel"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center text-center h-full flex-grow p-10 border border-white/5 bg-neutral-900/30 rounded-2xl text-neutral-500"
              >
                <Youtube className="h-12 w-12 text-neutral-700 mb-3" />
                <h4 className="text-sm font-semibold text-neutral-300">{lang === "ar" ? "في انتظار تزويد البيانات" : "Waiting for inputs..."}</h4>
                <p className="text-xs text-neutral-400 mt-1 max-w-xs leading-relaxed">
                  {lang === "ar" 
                    ? "قم بإكمال البيانات المطلوبة في الحقول الجانبية يساراً ثم اضغط زر التشغيل المفعل لعرض التقرير الفوري." 
                    : "Fill out the parameters on the left and trigger the AI generation model to evaluate report metrics."}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

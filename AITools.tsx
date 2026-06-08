import React, { useState } from "react";
import { apiFetch } from "../../lib/apiClient";
import { 
  Sparkles, Calendar, FileText, List, AlertCircle, CheckCircle, 
  RefreshCw, Copy, Send, Laptop 
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface AIToolsProps {
  lang: "ar" | "en";
  onActionTriggered: () => void;
}

export default function AITools({ lang, onActionTriggered }: AIToolsProps) {
  const [activeSubTool, setActiveSubTool] = useState<"writer" | "script" | "ideas" | "planner">("writer");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copiedText, setCopiedText] = useState(false);

  // Writer states
  const [writerPrompt, setWriterPrompt] = useState("");
  const [writerLength, setWriterLength] = useState("medium");
  const [writerFormat, setWriterFormat] = useState("مقالة");
  const [writerResult, setWriterResult] = useState("");

  // Script states
  const [scriptTopic, setScriptTopic] = useState("");
  const [scriptChannel, setScriptChannel] = useState("تطوير ذات");
  const [scriptPlatform, setScriptPlatform] = useState("YouTube Shorts");
  const [scriptDuration, setScriptDuration] = useState("60");
  const [scriptResult, setScriptResult] = useState("");

  // Ideas states
  const [ideasTopic, setIdeasTopic] = useState("");
  const [ideasAudience, setIdeasAudience] = useState("تداول وإلكترونيات");
  const [ideasResult, setIdeasResult] = useState("");

  // Planner states
  const [plannerFocus, setPlannerFocus] = useState("");
  const [plannerResult, setPlannerResult] = useState("");

  const t = {
    ar: {
      btnGenerate: "توليد المحتوى الإبداعي",
      btnScript: "صياغة سيناريو الفيديو",
      btnIdeas: "توليد الأفكار الفيروسية",
      btnPlanner: "إنشاء روزنامة المحتوى المنسقة",
      promptError: "يرجى تعبئة الحقول المطلوبة للمواصلة",
      resultHeader: "النص والسرود المنتجة",
      copyBtn: "نسخ النص كود",
      copied: "تم النسخ!",
    },
    en: {
      btnGenerate: "Generate Creative Writing",
      btnScript: "Generate Video Script",
      btnIdeas: "Brainstorm Viral Ideas",
      btnPlanner: "Design 7-Day Calendar Grid",
      promptError: "Required inputs are missing",
      resultHeader: "Produced Creative Copywords",
      copyBtn: "Copy produced text",
      copied: "Copied!",
    }
  }[lang];

  const handleWriterRequest = async () => {
    if (!writerPrompt) {
      setError(t.promptError);
      return;
    }
    setLoading(true);
    setError("");
    setWriterResult("");

    try {
      const data = await apiFetch("/api/ai/writer", {
        method: "POST",
        body: JSON.stringify({
          prompt: writerPrompt,
          length: writerLength,
          format: writerFormat
        })
      });
      if (data) {
        setWriterResult(data.result);
        onActionTriggered();
      }
    } catch {
      setError("AI Writer network error.");
    } finally {
      setLoading(false);
    }
  };

  const handleScriptRequest = async () => {
    if (!scriptTopic) {
      setError(t.promptError);
      return;
    }
    setLoading(true);
    setError("");
    setScriptResult("");

    try {
      const data = await apiFetch("/api/ai/script-generator", {
        method: "POST",
        body: JSON.stringify({
          topic: scriptTopic,
          channelType: scriptChannel,
          platform: scriptPlatform,
          durationSeconds: scriptDuration
        })
      });
      if (data) {
        setScriptResult(data.result);
        onActionTriggered();
      }
    } catch {
      setError("AI Script network error.");
    } finally {
      setLoading(false);
    }
  };

  const handleIdeasRequest = async () => {
    if (!ideasTopic) {
      setError(t.promptError);
      return;
    }
    setLoading(true);
    setError("");
    setIdeasResult("");

    try {
      const data = await apiFetch("/api/ai/idea-generator", {
        method: "POST",
        body: JSON.stringify({
          channelTopic: ideasTopic,
          audienceInterest: ideasAudience
        })
      });
      if (data) {
        setIdeasResult(data.result);
        onActionTriggered();
      }
    } catch {
      setError("AI Idea Network issue");
    } finally {
      setLoading(false);
    }
  };

  const handlePlannerRequest = async () => {
    if (!plannerFocus) {
      setError(t.promptError);
      return;
    }
    setLoading(true);
    setError("");
    setPlannerResult("");

    try {
      const data = await apiFetch("/api/ai/content-planner", {
        method: "POST",
        body: JSON.stringify({
          mainFocus: plannerFocus
        })
      });
      if (data) {
        setPlannerResult(data.result);
        onActionTriggered();
      }
    } catch {
      setError("AI Content Calendar issue");
    } finally {
      setLoading(false);
    }
  };

  const currentResult = 
    activeSubTool === "writer" ? writerResult :
    activeSubTool === "script" ? scriptResult :
    activeSubTool === "ideas" ? ideasResult :
    plannerResult;

  const handleCopyText = () => {
    navigator.clipboard.writeText(currentResult);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  const renderAIResponse = (text: string) => {
    if (!text) return null;
    return (
      <div className="space-y-4 text-neutral-200 text-sm leading-relaxed text-right font-sans">
        {text.split("\n").map((line, idx) => {
          const trimmed = line.trim();
          if (trimmed.startsWith("###")) {
            return <h4 key={idx} className="text-md font-bold text-amber-400 mt-4 border-r-2 border-amber-500 pr-2">{trimmed.replace("###", "")}</h4>;
          }
          if (trimmed.startsWith("##")) {
            return <h3 key={idx} className="text-lg font-extrabold text-white mt-5 border-r-4 border-amber-500 pr-2.5">{trimmed.replace("##", "")}</h3>;
          }
          if (trimmed.startsWith("#")) {
            return <h2 key={idx} className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-red-400 mt-6">{trimmed.replace("#", "")}</h2>;
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
    <div className="space-y-8" id="ai-writers-hub">
      {/* Sub tabs nav */}
      <div className="flex flex-wrap items-center gap-1.5 justify-end border-b border-white/5 pb-4 overflow-x-auto">
        <button
          onClick={() => { setActiveSubTool("planner"); setError(""); }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${activeSubTool === "planner" ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" : "text-neutral-400 hover:text-white"}`}
        >
          <Calendar className="h-4 w-4" />
          <span>{lang === "ar" ? "جدول محتوى تفصيلي 7 أيام" : "7-Day Content Calendar"}</span>
        </button>

        <button
          onClick={() => { setActiveSubTool("ideas"); setError(""); }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${activeSubTool === "ideas" ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" : "text-neutral-400 hover:text-white"}`}
        >
          <List className="h-4 w-4" />
          <span>{lang === "ar" ? "توليد 10 أفكار فيروسية" : "Viral Ideation"}</span>
        </button>

        <button
          onClick={() => { setActiveSubTool("script"); setError(""); }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${activeSubTool === "script" ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" : "text-neutral-400 hover:text-white"}`}
        >
          <Laptop className="h-4 w-4" />
          <span>{lang === "ar" ? "مولد سيناريو كامل (Script)" : "Video Script Creator"}</span>
        </button>

        <button
          onClick={() => { setActiveSubTool("writer"); setError(""); }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${activeSubTool === "writer" ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" : "text-neutral-400 hover:text-white"}`}
        >
          <FileText className="h-4 w-4" />
          <span>{lang === "ar" ? "الكاتب الإبداعي الشامل" : "General AI Writer"}</span>
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-200 text-xs flex items-start gap-3 justify-end text-right">
          <span className="font-semibold">{error}</span>
          <AlertCircle className="h-4.5 w-4.5 text-red-400 shrink-0" />
        </div>
      )}

      {/* PAIRS DISPLAY */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Input (Span 5) */}
        <div className="lg:col-span-12 xl:col-span-5 p-6 rounded-2xl border border-white/5 bg-neutral-900/60 backdrop-blur-xl relative overflow-hidden text-right space-y-5">
          <div className="absolute top-0 right-0 h-[2px] w-1/3 bg-gradient-to-r from-transparent to-amber-500" />

          {/* Sub-tool 1: Writer UI */}
          {activeSubTool === "writer" && (
            <div className="space-y-4">
              <div className="flex items-center gap-2.5 justify-end">
                <h3 className="text-lg font-bold text-white">الكاتب المساعد والتحرير الإبداعي</h3>
                <FileText className="h-5 w-5 text-amber-400" />
              </div>
              
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-neutral-300 block">حول ماذا تريد الكتابة؟</label>
                <textarea
                  value={writerPrompt}
                  onChange={(e) => setWriterPrompt(e.target.value)}
                  placeholder="مثال: أهمية استخدام تيلويند سي إس إس في تصميم واجهات المستخدم السريعة والمستجيبة ومميزاتها الرئيسية مقارنة ببوتستراب..."
                  className="w-full bg-neutral-950 border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-amber-500 h-28 text-right"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 text-right">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-neutral-300 block">شكل وتأطير النص</label>
                  <select
                    value={writerFormat}
                    onChange={(e) => setWriterFormat(e.target.value)}
                    className="w-full bg-neutral-950 border border-white/10 rounded-xl p-2.5 text-xs text-neutral-200 text-right"
                  >
                    <option value="مقالة كاملة">مقالة كاملة (بأقسام)</option>
                    <option value="بريد إلكتروني">رسالة بريد ترويجية</option>
                    <option value="خلاصة مدونة">تدوينة سريعة</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-neutral-300 block">طول النص والعمق</label>
                  <select
                    value={writerLength}
                    onChange={(e) => setWriterLength(e.target.value)}
                    className="w-full bg-neutral-950 border border-white/10 rounded-xl p-2.5 text-xs text-neutral-200 text-right"
                  >
                    <option value="short">سرد مقتضب وبقعة سريعة</option>
                    <option value="medium">متوسط وشامل وممتع</option>
                    <option value="long">مستفيض وعميق جداً</option>
                  </select>
                </div>
              </div>

              <button
                onClick={handleWriterRequest}
                disabled={loading}
                className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                <span>{t.btnGenerate}</span>
              </button>
            </div>
          )}

          {/* Sub-tool 2: Script Generator */}
          {activeSubTool === "script" && (
            <div className="space-y-4">
              <div className="flex items-center gap-2.5 justify-end">
                <h3 className="text-lg font-bold text-white">صنع سيناريو فيديو كامل</h3>
                <Laptop className="h-5 w-5 text-amber-400" />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-neutral-300 block">موضوع أو فكرة الفيديو</label>
                <textarea
                  value={scriptTopic}
                  onChange={(e) => setScriptTopic(e.target.value)}
                  placeholder="مثال: خمس خطوات تمكنك من تعلم المونتاج وتحقيق أول 1000$ في البيت"
                  className="w-full bg-neutral-950 border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none h-20 text-right"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 text-right">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-neutral-300 block">المنصة المستهدفة</label>
                  <select
                    value={scriptPlatform}
                    onChange={(e) => setScriptPlatform(e.target.value)}
                    className="w-full bg-neutral-950 border border-white/10 rounded-xl p-2.5 text-xs text-neutral-200 text-right"
                  >
                    <option value="YouTube Long Video">يوتيوب طويل</option>
                    <option value="YouTube Shorts">شورتس سريعة</option>
                    <option value="TikTok / Reels">تيك توك / ريلز</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-neutral-300 block">مدة السيناريو (ثانية)</label>
                  <input
                    type="number"
                    value={scriptDuration}
                    onChange={(e) => setScriptDuration(e.target.value)}
                    className="w-full bg-neutral-950 border border-white/10 rounded-xl p-2.5 text-xs text-white focus:outline-none text-left"
                  />
                </div>
              </div>

              <button
                onClick={handleScriptRequest}
                disabled={loading}
                className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer"
              >
                {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                <span>{t.btnScript}</span>
              </button>
            </div>
          )}

          {/* Sub-tool 3: Ideas Generator */}
          {activeSubTool === "ideas" && (
            <div className="space-y-4">
              <div className="flex items-center gap-2.5 justify-end">
                <h3 className="text-lg font-bold text-white">العصف الذهني لعشرة أفكار فيروسية</h3>
                <List className="h-5 w-5 text-amber-400" />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-neutral-300 block">تخصص قناتك ومحتواك الرئيسي</label>
                <input
                  type="text"
                  value={ideasTopic}
                  onChange={(e) => setIdeasTopic(e.target.value)}
                  placeholder="مثال: تعليم الذكاء الاصطناعي والأتمتة"
                  className="w-full bg-neutral-950 border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none text-right"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-neutral-300 block">الجمهور واهتماماتهم</label>
                <select
                  value={ideasAudience}
                  onChange={(e) => setIdeasAudience(e.target.value)}
                  className="w-full bg-neutral-950 border border-white/10 rounded-xl p-2.5 text-xs text-neutral-200 text-right"
                >
                  <option value="الشباب ورواد الأعمال">عشاق التقنية وتأسيس البزنس</option>
                  <option value="صناع محتوى يوتيوب">صناع المحتوى والمحررين</option>
                  <option value="الجمهور العام">تداول عام ومتوسط الذكاء</option>
                </select>
              </div>

              <button
                onClick={handleIdeasRequest}
                disabled={loading}
                className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer"
              >
                {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                <span>{t.btnIdeas}</span>
              </button>
            </div>
          )}

          {/* Sub-tool 4: Content Planner calendar */}
          {activeSubTool === "planner" && (
            <div className="space-y-4">
              <div className="flex items-center gap-2.5 justify-end">
                <h3 className="text-lg font-bold text-white">جدولة وتخطيط محتوى أسبوع كامل</h3>
                <Calendar className="h-5 w-5 text-amber-400" />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-neutral-300 block">التركيز والهدف الأساسي للأسبوع</label>
                <textarea
                  value={plannerFocus}
                  onChange={(e) => setPlannerFocus(e.target.value)}
                  placeholder="مثال: إطلاق كورس ويب جديد مجاني بهدف جمع مبيعات وقوائم مهتمين"
                  className="w-full bg-neutral-950 border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none h-24 text-right"
                />
              </div>

              <button
                onClick={handlePlannerRequest}
                disabled={loading}
                className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer"
              >
                {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Calendar className="h-4 w-4" />}
                <span>{t.btnPlanner}</span>
              </button>
            </div>
          )}
        </div>

        {/* Right Output Dashboard (Span 7) */}
        <div className="lg:col-span-12 xl:col-span-7 flex flex-col h-full min-h-[460px]">
          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center text-center h-full flex-grow p-8 border border-white/5 bg-neutral-900/30 rounded-2xl gap-4 animate-pulse"
              >
                <div className="h-10 w-10 rounded-full border-4 border-amber-500/20 border-t-amber-400 animate-spin animate-spin-slow" />
                <div>
                  <h4 className="font-bold text-white">{lang === "ar" ? "يعمل كاتب الذكاء الاصطناعي التبادلي..." : "Writing neural output..."}</h4>
                  <p className="text-xs text-neutral-400 mt-1 max-w-xs">{lang === "ar" ? "جاري القيام بعملية صياغة النصوص والترجمة وتعديل فواصل السيو." : "Formulating content calendar modules and formatting markdown blueprints..."}</p>
                </div>
              </motion.div>
            ) : currentResult ? (
              <motion.div
                key="ai-result"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-6 rounded-2xl border border-white/5 bg-neutral-900/40 relative overflow-hidden flex-grow text-right space-y-4"
              >
                <div className="absolute top-0 right-0 h-[2px] w-1/2 bg-gradient-to-r from-transparent via-amber-500 to-transparent" />
                
                <div className="flex items-center justify-between border-b border-white/15 pb-4 mb-3">
                  <button
                    onClick={handleCopyText}
                    className="flex items-center gap-1.5 py-1 px-2.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 text-[10px] text-white font-semibold cursor-pointer"
                  >
                    {copiedText ? <CheckCircle className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                    <span>{copiedText ? t.copied : t.copyBtn}</span>
                  </button>
                  <h4 className="font-bold text-white text-md flex items-center gap-2">
                    <span>{t.resultHeader}</span>
                    <Sparkles className="h-4.5 w-4.5 text-amber-400" />
                  </h4>
                </div>

                <div className="space-y-4 max-h-[480px] overflow-y-auto pr-1">
                  {renderAIResponse(currentResult)}
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center text-center h-full flex-grow p-10 border border-white/5 bg-neutral-900/30 rounded-2xl text-neutral-500"
              >
                <FileText className="h-12 w-12 text-neutral-700 mb-3" />
                <h4 className="text-sm font-semibold text-neutral-300">{lang === "ar" ? "بانتظار تفضيلات العصف الذهني" : "Brain brainstorming parameters pending"}</h4>
                <p className="text-xs text-neutral-400 mt-1 max-w-sm leading-relaxed">
                  {lang === "ar" 
                    ? "اختر طريقتك من التبويبات أعلاه، املأ تفاصيل المحتوى والجمهور واضغط زر التوليد الذكي لصناعة النصوص الفورية." 
                    : "Configure content subjects on the left parameters and trigger writing systems for rapid script development."}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

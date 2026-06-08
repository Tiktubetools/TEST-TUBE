import React, { useState } from "react";
import { Send, CheckCircle, RefreshCw, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface ContactProps {
  lang: "ar" | "en";
}

export default function Contact({ lang }: ContactProps) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  const isAr = lang === "ar";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) {
      setError(isAr ? "الرجاء ملء كل الخانات المطلوبة بالكامل" : "Please fill in all required forms");
      return;
    }
    setLoading(true);
    setError("");

    // Simulate sending support ticket
    setTimeout(() => {
      setSuccess(isAr 
        ? "تم إرسال رسالتك لفريق الدعم الفني بنجاح! سنقوم بالرد عليك عبر البريد في أقرب وقت." 
        : "Your support card has been queued successfully! We will contact you back shortly.");
      setLoading(false);
      setName("");
      setEmail("");
      setSubject("");
      setMessage("");
    }, 1500);
  };

  const t = {
    ar: {
      title: "تواصل مع مهندسي TikTube Tools",
      subtitle: "هل واجهت عطل؟ أو ترغب بطلب ميزة خاصة؟ أفرغ ما بجعبتك لفريقنا وسنجيبك بأقصى سرعة.",
      formHeader: "نموذج اتصال مباشر فوري",
      name: "الاسم بالكامل",
      email: "بريد الاتصال الإلكتروني",
      subject: "نوع الاستفسار / العنوان",
      message: "تفاصيل رسالتك أو شكواك",
      sendBtn: "إرسال بطاقة الدعم الآن",
      detailsHeader: "معلومات المكتب الرسمي",
    },
    en: {
      title: "Contact TikTube Support",
      subtitle: "Encountered a bug or need custom API keys? Message our platform support desk below.",
      formHeader: "Direct Support Ticket",
      name: "Full Name",
      email: "Contact Email Address",
      subject: "Ticket Subject Topic",
      message: "Query details or feature requested",
      sendBtn: "Dispatch Support Ticket",
      detailsHeader: "Corporate Channels",
    }
  }[lang];

  return (
    <div className="py-12 text-white max-w-3xl mx-auto px-4 text-right space-y-12" id="contact-screen">
      <div className="space-y-4 max-w-2xl mx-auto text-center md:text-right">
        <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-amber-400">{t.title}</h2>
        <p className="text-sm text-neutral-400 leading-relaxed">{t.subtitle}</p>
      </div>

      <div className="max-w-2xl mx-auto">
        
        {/* Inputs form */}
        <div className="p-6 md:p-8 rounded-2xl border border-white/5 bg-neutral-900/60 backdrop-blur-xl relative overflow-hidden space-y-5">
          <div className="absolute top-0 right-0 h-[2px] w-1/3 bg-gradient-to-r from-transparent to-red-500" />
          <h3 className="font-extrabold text-white text-lg">{t.formHeader}</h3>

          <AnimatePresence mode="wait">
            {error && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-200 text-xs flex items-center justify-end gap-2">
                <span>{error}</span>
                <AlertCircle className="h-4 w-4 text-red-400" />
              </motion.div>
            )}

            {success && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-200 text-xs flex items-center justify-end gap-2.5">
                <span className="font-semibold">{success}</span>
                <CheckCircle className="h-5 w-5 text-emerald-400 shrink-0" />
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-neutral-300 block text-right">{t.name}</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-neutral-950 border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-red-500 text-right"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-neutral-300 block text-right">{t.email}</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-neutral-950 border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-red-500 text-left"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-neutral-300 block text-right">{t.subject}</label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder=""
                className="w-full bg-neutral-950 border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-red-500 text-right"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-neutral-300 block text-right">{t.message}</label>
              <textarea
                required
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full bg-neutral-950 border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-red-500 h-28 text-right"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-red-600 hover:bg-red-500 text-white font-extrabold text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-colors"
            >
              {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              <span>{t.sendBtn}</span>
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}

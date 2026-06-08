import React from "react";
import { FileText, ShieldAlert, CheckCircle } from "lucide-react";

interface TermsProps {
  lang: "ar" | "en";
}

export default function Terms({ lang }: TermsProps) {
  const isAr = lang === "ar";

  const t = {
    ar: {
      title: "شروط الخدمة والاستخدام العادل",
      subtitle: "يرجى قراءة شروط الخدمة لـ TikTube Tools لضمان الاستخدام العادل للأدوات وحماية الحقوق وصناعة المحتوى بشكل سليم.",
      sections: [
        {
          title: "1. طبيعة الخدمة والشمولية المجانية",
          desc: "منصة TikTube Tools هي منصة عامة مجانية بالكامل لصالح صناع المحتوى ومحرري الفيديوهات. لا تطالب المنصة بأي تفاصيل دفع أو بطاقات الائتمان، ويحق لجميع الزوار استخدام كافة الأدوات بلا قيود استهلاكية يومية أو شهرية."
        },
        {
          title: "2. سياسة الاستخدام العادل للأدوات",
          desc: "يُحظر استخدام برمجيات الزحف الذاتي أو هجمات الإغراق ضد APIs المنصة مما قد يعيب الخدمة للزوار العاديين. يحظر استخدام مخرجات الذكاء الاصطناعي لإنشاء محتوى يخالف الأعراف والقوانين المحلية والدولية."
        },
        {
          title: "3. إخلاء المسؤولية عن الروابط التابعة والإعلانات",
          desc: "يتم تمويل البنية التحتية للخوادم والخدمات من خلال المواد الإعلانية المعروضة والروابط التابعة (Affiliate). لا نتحمل مسؤولية أي معاملات تجريها على المواقع المعلنة أو الخدمات الخارجية التي تشتريها عبر روابط الإحالة."
        }
      ]
    },
    en: {
      title: "Terms of Service & Fair Usage Policy",
      subtitle: "Please read the terms guiding TikTube Tools regarding automated queries, advertisement compliance, and content ownership.",
      sections: [
        {
          title: "1. Nature of Public Unrestricted Services",
          desc: "TikTube Tools operates as a 100% public free toolkit. No registration, credentials, or premium subscription plans exist. Visitors can utilize all visual, copywriting, and media suites with no daily or monthly limits."
        },
        {
          title: "2. Fair Use Guidelines",
          desc: "You are forbidden from launching automated DDoS loops, executing programmatic heavy-scraping of our proxy pipelines, or attempting to flood the Gemini AI API backplane with synthetic spam entries."
        },
        {
          title: "3. Sponsored Links & External Actions",
          desc: "We leverage third-party visual banners, Google AdSense, and affiliate referrers. We hold no liability over agreements, payments, or third-party interactions performed on recommended services outside our domain."
        }
      ]
    }
  }[lang];

  return (
    <div className="py-12 text-white max-w-4xl mx-auto px-4 text-right space-y-10" id="terms-screen">
      <div className="space-y-4 max-w-xl ml-auto border-b border-white/5 pb-6">
        <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-amber-400 flex items-center justify-end gap-3 font-sans">
          <span>{t.title}</span>
          <FileText className="h-6 w-6 text-red-500" />
        </h2>
        <p className="text-xs text-neutral-400 leading-relaxed font-normal">{t.subtitle}</p>
      </div>

      <div className="space-y-8">
        {t.sections.map((sect, i) => (
          <div key={i} className="p-6 rounded-2xl border border-white/5 bg-neutral-900/40 text-right space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center justify-end gap-2 font-sans">
              <span>{sect.title}</span>
              <CheckCircle className="h-4 w-4 text-emerald-400" />
            </h3>
            <p className="text-xs text-neutral-400 leading-relaxed font-normal">{sect.desc}</p>
          </div>
        ))}
      </div>

      <div className="p-5 rounded-xl bg-red-500/5 border border-red-500/10 flex items-start gap-4 text-right">
        <div className="flex-grow text-xs text-neutral-300 leading-relaxed font-normal">
          {isAr 
            ? "بتصفحك واستعمالك لأدوات تيك تيوب، فإنك تقر وتوافق على عدم إساءة استخدام البنية الأساسية لخوادمنا وتأكيد احترامك لبيئة المبدعين الأحرار."
            : "By accessing and utilizing any creative suite tool on this platform, you agree to comply with our fair-use thresholds to protect server stability."}
        </div>
        <ShieldAlert className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
      </div>
    </div>
  );
}

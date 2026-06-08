import React from "react";
import { ShieldAlert, KeyRound, Lock, Eye } from "lucide-react";

interface PrivacyProps {
  lang: "ar" | "en";
}

export default function Privacy({ lang }: PrivacyProps) {
  const isAr = lang === "ar";

  const t = {
    ar: {
      title: "سياسة الأمان والخصوصية والمعلومات",
      subtitle: "نحن في TikTube Tools نأخذ خصوصيتك وأمان بيانات التوليد الخاصة بك بجدية مطلقة ولا نتهاون بها.",
      sections: [
        {
          title: "1. جمع ومعالجة النصوص والميديا",
          desc: "جميع المدخلات والصور والروابط التي تقوم برفعها أو تداولها عبر أدوات يوتيوب أو تيك توك تتم معالجتها لحظياً عبر واجهات Google Gemini الآمنة والمستقرة، ولا نحتفظ بنسخ مادية أو ملفات مخزنة على أي خادم بشكل دائم إلا ما تستوجبه التحليلات والعد لمرات السرد."
        },
        {
          title: "2. أمن الحساب والمقاييس الشخصية",
          desc: "كلمات السر والبيانات الشخصية يتم تشفيرها وتخزينها بأحدث درجات التجزئة الأمنية ومحمية من قبل جدار حماية (WAF). لا نشارك تفاصيل أو استخدام حسابات المشتركين مع أي أطراف ترويجية أو إعلانية خارجية."
        },
        {
          title: "3. استخدام الـ Cookies والأرشفة",
          desc: "نستخدم ملفات كوكيز محلية آمنة لحفظ جلسة تسجيل دخولك ونوع اللغة المفضلة التي اخترتها (مثال: العربية) لضمان عدم اضطرارك لتعديله مع كل عملية تصفح للموقع."
        }
      ]
    },
    en: {
      title: "Privacy Policy & Safe Harbor Rules",
      subtitle: "How we track, securely compile, and protect your queries and credentials on TikTube Tools.",
      sections: [
        {
          title: "1. Prompt and Media Transcriptions Processing Strategy",
          desc: "All prompt subjects, uploaded files, and parsed URLs are processed in-memory directly on Google Gemini cloud endpoints. No static visual or audio resources are persistent unless requested to be cached for custom user dashboard listings."
        },
        {
          title: "2. Encryption Keys & Account Isolation",
          desc: "Passwords and developer tokens are fully encrypted client-side and server-side. No API keys or transactional statements are saved in plain text, guarding your accounts strictly from visual exposures."
        },
        {
          title: "3. Device Cookies & Session Identifiers",
          desc: "We utilize standard client-side browser tokens solely to persist session sign-ins, preferred translation states (e.g. Arabic), and selected tool categories."
        }
      ]
    }
  }[lang];

  return (
    <div className="py-12 text-white max-w-4xl mx-auto px-4 text-right space-y-10" id="privacy-screen">
      <div className="space-y-4 max-w-xl ml-auto border-b border-white/5 pb-6">
        <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-amber-400 flex items-center justify-end gap-3">
          <span>{t.title}</span>
          <Lock className="h-6 w-6 text-red-500" />
        </h2>
        <p className="text-xs text-neutral-400 leading-relaxed">{t.subtitle}</p>
      </div>

      <div className="space-y-8">
        {t.sections.map((sect, i) => (
          <div key={i} className="p-6 rounded-2xl border border-white/5 bg-neutral-900/40 text-right space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center justify-end gap-2">
              <span>{sect.title}</span>
              <Eye className="h-4 w-4 text-neutral-500" />
            </h3>
            <p className="text-xs text-neutral-400 leading-relaxed font-sans">{sect.desc}</p>
          </div>
        ))}
      </div>

      <div className="p-5 rounded-xl bg-red-500/5 border border-red-500/10 flex items-start gap-4 text-right">
        <div className="flex-grow text-xs text-neutral-300 leading-relaxed">
          {isAr 
            ? "في حال كان لديك أي شكاوى حول انتهاك الخصوصية أو ترغب بطلب حذف حسابك وكامل بياناتك المخزنة نهائياً، يرجى تقديم تذكرة فورية عبر صفحة اتصل بنا وسيقوم مهندس الدعم بتلبيتها في دقائق معدودة."
            : "If you want your credentials and history logs permanently deleted from our proxy databases, submit a support ticket under the Contact Form and we will perform standard database purge scripts."}
        </div>
        <ShieldAlert className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
      </div>
    </div>
  );
}

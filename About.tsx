import React from "react";
import { Users, Target, Shield, Heart, Landmark, Youtube } from "lucide-react";

interface AboutProps {
  lang: "ar" | "en";
}

export default function About({ lang }: AboutProps) {
  const isAr = lang === "ar";

  const t = {
    ar: {
      title: "عن TikTube Tools",
      description: "من نحن والأهداف التي نسعى لتوفيرها لكل صانع محتوى في الوطن العربي والدول المجاورة.",
      mission: "رسالتنا ورؤيتنا",
      missionTxt: "توفير حلول مبتكرة وذكية، مستندة إلى أفضل نماذج الذكاء الاصطناعي العالمية لتمكين صناع المحتوى ورواد الأعمال من تحقيق أعلى نسب ومرات تفوق في السيو والأرقام بدون الحاجة لبرمجة أو مهارات تصميم تعجيزية.",
      values: "القيم والمبادئ الموجهة",
      grid: [
        {
          title: "التركيز على النتيجة",
          desc: "جميع أدواتنا ليست مجرد واجهات، بل أدوات توليدية تزيد من معدل التحويل وسرعة الأرشفة الفورية."
        },
        {
          title: "سيادة الأمان والأخلاقيات",
          desc: "نحمي بيانات المشتركين 100% ونوفر حماية دبلوماسية فائقة لكل استبيان أو نصوص مسجلة."
        },
        {
          title: "أحدث التقنيات",
          desc: "نحدث نماذج التوليد من Google Gemini فور تبلغها بإصدارات لضمان مخرجات ذات جودة فائقة."
        }
      ]
    },
    en: {
      title: "About TikTube Tools Workspace",
      description: "Our dedicated software team's architectural focus and design boundaries for global creators.",
      mission: "Our Mission & Principles",
      missionTxt: "Empowering content creators with smart workflows containing automated AI pipelines, thumbnail decoders, and format compilers to maximize CTR on YouTube and TikTok, without software drag.",
      values: "Values & Directives",
      grid: [
        {
          title: "Result Oriented Focus",
          desc: "Every generator yields highly optimized titles, tags, and drafts engineered to maximize immediate conversion rates."
        },
        {
          title: "Strict Privacy Ethics",
          desc: "We prioritize security loops, employing WAF parameters and strict rate-limits to protect user queries completely."
        },
        {
          title: "Cutting-Edge Pipelines",
          desc: "Continuous model synchronizations with Gemini parameters to deliver premium semantic recommendations."
        }
      ]
    }
  }[lang];

  return (
    <div className="py-12 text-white max-w-5xl mx-auto px-4 text-right space-y-12" id="about-us-screen">
      <div className="space-y-4 max-w-xl ml-auto">
        <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-amber-400">{t.title}</h2>
        <p className="text-sm text-neutral-400 leading-relaxed">{t.description}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        {/* Mission card */}
        <div className="p-6 rounded-2xl border border-white/5 bg-neutral-900/40 relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 right-0 h-[2px] w-1/3 bg-gradient-to-r from-transparent to-red-500" />
          <div className="space-y-3">
            <h3 className="text-lg font-bold text-white flex items-center justify-end gap-2.5">
              <span>{t.mission}</span>
              <Target className="h-5 w-5 text-red-500" />
            </h3>
            <p className="text-xs text-neutral-300 leading-relaxed">{t.missionTxt}</p>
          </div>
        </div>

        {/* Brand visual aesthetic card */}
        <div className="p-6 rounded-2xl border border-white/5 bg-neutral-900/40 relative overflow-hidden flex flex-col justify-center text-center items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-red-600/10 flex items-center justify-center text-red-500">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <h4 className="font-extrabold text-white text-md">TikTube Engineering Guild</h4>
            <p className="text-[11px] text-neutral-400 mt-1">SaaS, AI models & SEO Specialists since 2024</p>
          </div>
        </div>
      </div>

      <div className="space-y-6 pt-4">
        <h3 className="text-xl font-bold border-b border-white/5 pb-3 text-neutral-200">{t.values}</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {t.grid.map((item, index) => (
            <div key={index} className="p-5 rounded-xl border border-white/5 bg-neutral-950/40 text-right space-y-2">
              <h4 className="font-bold text-white text-sm">{item.title}</h4>
              <p className="text-xs text-neutral-400 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

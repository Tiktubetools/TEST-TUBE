import React from "react";
import { Check, Shield, Zap, Sparkles, Heart, Globe, Unlock, HelpCircle, Flame, MessageSquare } from "lucide-react";
import { motion } from "motion/react";

interface WhyFreeProps {
  lang: "ar" | "en";
}

export default function WhyFree({ lang }: WhyFreeProps) {
  const isAr = lang === "ar";

  const t = {
    ar: {
      title: "لماذا منصة TikTube Tools مجانية بالكامل؟",
      subtitle: "نحن نؤمن بتمكين المبدعين وصناع المحتوى حول العالم دون حواجز مادية، دون اشتراكات، ودون قيود على إنتاجيتك الإبداعية.",
      philosophyTitle: "فلسفة الوصول المفتوح للجميع",
      philosophyDesc: "سوق صناعة المحتوى اليوم يتطلب سرعة ومرونة عالية. من غير العادل أن يتم تقييد المبدعين والناشئين بجدران دفع واشتراكات شهرية مكلفة لمجرد القيام بأعمال أساسية أو توليد نصوص بالذكاء الاصطناعي. منصتنا ممولة بالكامل من خلال إعلانات الرعاة وشراكات الأفلييت التابعة، مما يسمح لنا بإبقاء جميع الخدمات 100% مجانية دائماً وأبداً.",
      missionTitle: "مهمتنا الأساسية",
      missionDesc: "بناء أقوى حزمة أدوات متكاملة لمبدعي يوتيوب وتيك توك وتسهيل وصولهم لأقوى نماذج الذكاء الاصطناعي مجاناً، لتحسين معدلات النقر (CTR)، وزيادة رواج الفيديوهات وتصدر التريند العالمي لجميع المنشئين.",
      featuresHeading: "أدوات متميزة بلا حدود، بلا حساب وبلا قيود",
      faqTitle: "الأسئلة الشائعة حول نموذجنا المجاني",
    },
    en: {
      title: "Why TikTube Tools Is 100% Free",
      subtitle: "We believe in empowering worldwide creators and video editors without paywalls, monthly plans, or credit-card requirements.",
      philosophyTitle: "Open-Access Philosophy",
      philosophyDesc: "Modern creative workspace apps demand fast, unconstrained performance. We believe that budget constraints should never block viral creators, independent film editors, or beginners from optimizing their workflows. By shifting to a sponsor and advertisement-funded monetization model, we sustain high-cost infrastructure while granting you unlimited accessibility.",
      missionTitle: "Our Ultimate Mission",
      missionDesc: "We provide state-of-the-art tools to upgrade your CTR, scrap precise caption logs, analyze thumbnails via high-end AI, and write storyboards, with no premium limits, quotas, or credentials required.",
      featuresHeading: "Unconstrained Public Power Tools",
      faqTitle: "Free Access Frequently Asked Questions",
    }
  }[lang];

  const valueProps = [
    {
      icon: <Unlock className="h-6 w-6 text-red-500" />,
      titleAr: "وصول غير محدود 100%",
      titleEn: "100% Unlimited Queries",
      descAr: "لا وجود للعدادات أو نقاط الاستهلاك الشهرية. يمكنك توليد آلاف النصوص وتحميل الفيديوهات بلا سقف للاستخدام.",
      descEn: "No credits, token systems, or daily search limits. Fetch any media files and generate scripts continuously."
    },
    {
      icon: <Globe className="h-6 w-6 text-cyan-400" />,
      titleAr: "لا حاجة لإنشاء حساب",
      titleEn: "No Account Required",
      descAr: "زر الموقع وابدأ استخدام الأدوات على الفور. لا تسجيل عبر البريد ولا كلمات مرور تفقدها.",
      descEn: "No register or sign-in screens. Just open any tool to execute your requests smoothly with complete anonymity."
    },
    {
      icon: <Sparkles className="h-6 w-6 text-amber-400" />,
      titleAr: "مدعوم بنماذج ذكاء رائدة",
      titleEn: "Premium AI Backplanes",
      descAr: "نعتمد على نماذج Google Gemini 3.5-flash المتطورة لمعالجة النصوص والصور وقراءة الملفات بأداء نفاث.",
      descEn: "Harness robust AI engines for content scheduling, copywriting, and instant OCR transcriptions."
    },
    {
      icon: <Heart className="h-6 w-6 text-emerald-400" />,
      titleAr: "بنية تحتية آمنة ونظيفة",
      titleEn: "Sponsored and Sustainable",
      descAr: "تتم تغطية تكلفة خوادم التشغيل والسحابة من العوائد الإعلانية التي يوفرها الرعاة والأفلييت الموثوق.",
      descEn: "Server load maintenance and API costs are fully sustained through elegant banner ads and direct affiliates."
    }
  ];

  const featuresList = [
    {
      nameAr: "حقيبة يوتيوب لزيادة الـ CTR",
      nameEn: "YouTube Suite For Max CTR",
      descAr: "تنزيل الصورة المصغرة بجودة HD مذهلة، توليد عناوين جذابة تجلب النقرات، واستخراج وسوم السيو الأكثر تأثيراً.",
      descEn: "Download original full-resolution video thumbnails, generate magnetic titles, and build localized tags."
    },
    {
      nameAr: "تنزيل فيديوهات تيك توك بدون علامة",
      nameEn: "Watermark-Free TikTok Downloads",
      descAr: "احصل على الفيديو المباشر الأصلي بدون علامات مائية وبنقرة واحدة، مع خيار تحميل الصوت MP3 الأصلي بنقاء ممتاز.",
      descEn: "Fetch raw videos without watermark directly via proxy and download full-fidelity MP3 music tracks."
    },
    {
      nameAr: "مساعد التحرير والصور الذكي",
      nameEn: "Visual & OCR Studio",
      descAr: "فك الشفرة من الصور واللافتات بنظام OCR متقدم، توليد صور خيالية بكلماتك عبر الذكاء الاصطناعي، وضغط ملفات الصور فوراً.",
      descEn: "Extract texts inside thumbnails with server-grade OCR, convert designs to WebP, and utilize image compressors."
    },
    {
      nameAr: "سيناريست ومخطط المحتوى الآلي",
      nameEn: "AI Copywriter & Planner",
      descAr: "انسج خططاً إبداعية وجداول نـشر لـ 7 أيام متواصلة، وصغ سكريبتات فيديوهات قصيرة وطويلة بتوجيهات إخراجية مدهشة.",
      descEn: "Create cohesive 7-day publication calendars and write deep scripts with audio cue guidelines."
    }
  ];

  const faqs = [
    {
      qAr: "كيف يمكن للمنصة البقاء مجانية دون اشتراكات مدفوعة؟",
      qEn: "How does the platform remain sustainable without premium cards?",
      aAr: "نموذج أعمالنا يعتمد كلياً على الإعلانات وشراكات الأفلييت (التسويق بالعمولة). عندما تضغط على إعلان راعي أو تشتري خدمة نوصي بها، تنال المنصة عمولة بسيطة تساهم في تسديد فواتير الخوادم والـ APIs باهظة التكلفة، مما يحفظ خدماتنا مجانية ومكشوفة للجميع دون حاجة لحلب جيوب صناع المحتوى.",
      aEn: "Our operations are entirely sponsored via visual advertisements, Google AdSense, and affiliate commissions. When you view ads or subscribe to recommended tools, we receive minor referral revenues that fund our server stacks and API limits. This keeps us public, free, and accessible to everyone indefinitely."
    },
    {
      qAr: "هل سيتغير هذا النظام في المستقبل ويصبح مدفوعاً؟",
      qEn: "Will you change this setup in the future and activate paid plans?",
      aAr: "كلا على الإطلاق! التزامنا أبدي بأن نبقى بوابتك المجانية الأسهل. لن نقوم بفرض أي اشتراكات أو قفل أي خاصية خلف جدران دفع. رسالتنا هي بقاء حزم الأدوات مجانية بالكامل ومفتوحة المصدر للمجتمع العربي والعالمي.",
      aEn: "Absolutely not. TikTube Tools is pledged to remain free. We harbor no long-term plans for gating features, setting pricing models, or restricting access coefficients. Our core infrastructure is engineered to run on advertising models forever."
    },
    {
      qAr: "هل استخدام الأدوات آمن ولا يتطلب جمع بياناتي الشخصية؟",
      qEn: "Is my privacy guaranteed since I use this without accounts?",
      aAr: "نعم بنسبة 100%. لأننا قمنا بإلغاء نظام الحسابات والتسجيل بالكامل، فإنك تتصفح وتصنع كشخص مجهول بالكامل. لا نخزن بريدك، ولا تاريخ توليدك، ولا صورك المرفوعة. تتم معالجة المدخلات فوراً ومحوها بصورة لحظية لحماية ملكيتك وصحائف خصوصياتك.",
      aEn: "Yes, completely. By removing all registration and database session tables, you navigate other suites anonymously. We do not cache personal emails, tracking cookies, or custom generated content. Everything is processed instantly and purged immediately."
    }
  ];

  return (
    <div className="py-12 md:py-20 text-white max-w-6xl mx-auto px-4 space-y-20 text-right" id="why-free-viewport" dir={isAr ? "rtl" : "ltr"}>
      
      {/* 1. HERO MISSION SECTION */}
      <div className="text-center max-w-3xl mx-auto space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-xs font-bold text-red-400 select-none">
          <Heart className="h-3.5 w-3.5 fill-red-500/30 text-red-500" />
          <span>{isAr ? "منصة حرة للمبدعين للأبد" : "100% Free Creator Workspace Forever"}</span>
        </div>
        
        <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-[1.15] text-transparent bg-clip-text bg-gradient-to-b from-white to-zinc-400">
          {t.title}
        </h1>
        
        <p className="text-sm md:text-md text-zinc-400 leading-relaxed font-normal">
          {t.subtitle}
        </p>

        <div className="pt-2 flex justify-center">
          <div className="h-1 w-20 bg-gradient-to-r from-red-500 to-amber-500 rounded-full" />
        </div>
      </div>

      {/* 2. OPEN ACCESS PHILOSOPHY vs CORE MISSION */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch pt-6">
        <div className="p-8 rounded-2xl border border-zinc-800 bg-zinc-950/40 relative overflow-hidden flex flex-col justify-between hover:border-zinc-700/60 transition-all">
          <div className="absolute top-0 right-0 h-1 w-24 bg-red-500" />
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-white flex items-center justify-start gap-2.5 flex-row-reverse">
              <Globe className="h-5.5 w-5.5 text-red-500" />
              <span>{t.philosophyTitle}</span>
            </h3>
            <p className="text-zinc-400 text-xs leading-relaxed font-normal">
              {t.philosophyDesc}
            </p>
          </div>
        </div>

        <div className="p-8 rounded-2xl border border-zinc-800 bg-zinc-950/40 relative overflow-hidden flex flex-col justify-between hover:border-zinc-700/60 transition-all">
          <div className="absolute top-0 right-0 h-1 w-24 bg-amber-500" />
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-white flex items-center justify-start gap-2.5 flex-row-reverse">
              <Zap className="h-5.5 w-5.5 text-amber-500" />
              <span>{t.missionTitle}</span>
            </h3>
            <p className="text-zinc-400 text-xs leading-relaxed font-normal">
              {t.missionDesc}
            </p>
          </div>
        </div>
      </div>

      {/* 3. CORE BENEFITS METRICS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5 pt-4">
        {valueProps.map((item, idx) => (
          <div 
            key={idx} 
            className="p-6 rounded-2xl border border-zinc-850 bg-zinc-900/10 backdrop-blur-sm space-y-4 flex flex-col justify-start hover:border-zinc-800 transition-all text-right"
          >
            <div className="p-2.5 rounded-xl bg-zinc-900 w-fit self-end">
              {item.icon}
            </div>
            <div className="space-y-1.5">
              <h4 className="font-extrabold text-white text-sm">{isAr ? item.titleAr : item.titleEn}</h4>
              <p className="text-zinc-400 text-[11px] leading-relaxed font-normal">
                {isAr ? item.descAr : item.descEn}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* 4. UNLIMITED SUITES OVERVIEW */}
      <div className="space-y-8 pt-4">
        <h3 className="text-2xl font-extrabold text-white text-center">{t.featuresHeading}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {featuresList.map((f, i) => (
            <div key={i} className="p-6 rounded-2xl border border-zinc-850 bg-zinc-900/20 hover:bg-zinc-900/40 transition-all text-right flex gap-4 flex-row-reverse">
              <div className="h-7 w-7 rounded-full bg-red-500/10 text-red-400 shrink-0 flex items-center justify-center font-bold text-xs">
                {i + 1}
              </div>
              <div className="space-y-1.5 flex-grow">
                <h4 className="font-bold text-white text-sm">{isAr ? f.nameAr : f.nameEn}</h4>
                <p className="text-zinc-400 text-xs leading-relaxed font-normal">{isAr ? f.descAr : f.descEn}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 5. DETAILED FAQ */}
      <div className="space-y-8 pt-4">
        <div className="text-center space-y-2 max-w-xl mx-auto">
          <h3 className="text-2xl font-extrabold text-white flex items-center justify-center gap-2">
            <span>{t.faqTitle}</span>
            <HelpCircle className="h-5 w-5 text-red-500" />
          </h3>
          <p className="text-xs text-zinc-500">{isAr ? "تعرف بالتفصيل على طريقة تشغيل وصيانة وتطوير المنصة" : "Discover how the platform stays up, runs, and updates continuously for creators"}</p>
        </div>

        <div className="space-y-4 max-w-4xl mx-auto">
          {faqs.map((faq, i) => (
            <div key={i} className="p-6 rounded-2xl bg-zinc-950/40 border border-zinc-850 hover:border-zinc-800 transition-all text-right space-y-3">
              <h4 className="font-extrabold text-white text-sm leading-normal flex items-start justify-start gap-2.5 flex-row-reverse pr-2.5 border-r-2 border-red-500">
                <MessageSquare className="h-4.5 w-4.5 text-red-500 shrink-0 mt-0.5" />
                <span>{isAr ? faq.qAr : faq.qEn}</span>
              </h4>
              <p className="text-zinc-400 text-xs leading-relaxed font-normal">
                {isAr ? faq.aAr : faq.aEn}
              </p>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}

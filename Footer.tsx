import React from "react";
import Logo from "./Logo";
import { Heart, Shield, Mail, FileText, Settings } from "lucide-react";

interface FooterProps {
  lang: "ar" | "en";
  setCurrentTab: (tab: string) => void;
  brandingSettings?: any;
}

export default function Footer({ lang, setCurrentTab, brandingSettings }: FooterProps) {
  const isAr = lang === "ar";

  const t = {
    ar: {
      bio: "منصة ويب متكاملة وذكية تجمع أقوى أدوات صناع المحتوى لليوتيوب والتيك توك وصناعة الصور والذكاء الاصطناعي في مكان واحد آمن وسريع ومجاني للأبد.",
      rights: "جميع الحقوق محفوظة. فريق عمل TikTube Tools",
      by: "بني بكل حب لصناع المحتوى والمبدعين الأحرار",
      contact: "اتصل بنا",
      terms: "شروط الاستخدام العادل",
      privacy: "سياسة الأمان والخصوصية",
      blog: "المدونة الإبداعية",
      whyFree: "لماذا تيك تيوب مجاني؟",
      admin: "بوابة الإدارة للإعلانات والمدونة"
    },
    en: {
      bio: "A comprehensive SaaS workspace designed to expand digital video creators boundaries with state-of-the-art visual, copywriting, and proxy tools.",
      rights: "All rights reserved. TikTube Tools Hub & Sponsors",
      by: "Crafted with visual care for global publishers",
      contact: "Support & Contact",
      terms: "Fair Use Terms",
      privacy: "Privacy Regulations",
      blog: "Guides Blog",
      whyFree: "Why is it Free?",
      admin: "Admin Control Center"
    }
  }[lang];

  const bioText = isAr 
    ? (brandingSettings?.footerBioAr || t.bio)
    : (brandingSettings?.footerBioEn || t.bio);

  const copyrightText = isAr
    ? (brandingSettings?.copyrightTextAr || t.rights)
    : (brandingSettings?.copyrightTextEn || t.rights);

  const logoUrl = brandingSettings?.logoUrl || "";
  const customFooterHtml = brandingSettings?.footerHtml || "";

  return (
    <footer className="border-t border-zinc-900 bg-[#09090b] text-white py-12 px-6 mt-auto relative z-10 selection:bg-red-500/30 selection:text-white" id="main-global-footer">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-8 items-start text-right">
        
        {/* Bio column */}
        <div className="md:col-span-12 lg:col-span-5 space-y-4 md:pr-4 flex flex-col items-center lg:items-end">
          <Logo className="h-14 cursor-pointer" showText={false} onClick={() => setCurrentTab("home")} logoUrl={logoUrl} />
          <p className="text-xs text-neutral-400 leading-relaxed text-center lg:text-right max-w-sm">
            {bioText}
          </p>
        </div>
 
        {/* Navigation / Pages list */}
        <div className="md:col-span-6 lg:col-span-3 space-y-3 flex flex-col items-center lg:items-end text-right w-full">
          <h4 className="text-xs font-extrabold uppercase tracking-wider text-neutral-300">{isAr ? "أقسام المنصة" : "Navigation Links"}</h4>
          <div className="flex flex-col gap-2.5 text-xs text-zinc-400">
            <button onClick={() => setCurrentTab("tools")} className="hover:text-red-400 text-center lg:text-right cursor-pointer">
              {isAr ? "تصفح صندوق الأدوات" : "Explore Toolkit"}
            </button>
            <button onClick={() => setCurrentTab("why-free")} className="hover:text-red-400 text-center lg:text-right cursor-pointer">
              {t.whyFree}
            </button>
            <button onClick={() => setCurrentTab("blog")} className="hover:text-red-400 text-center lg:text-right cursor-pointer">
              {t.blog}
            </button>
          </div>
        </div>

        {/* Legals / Rules list */}
        <div className="md:col-span-6 lg:col-span-4 space-y-3 flex flex-col items-center lg:items-end text-right w-full">
          <h4 className="text-xs font-extrabold uppercase tracking-wider text-neutral-300">{isAr ? "الشؤون القانونية والأمان" : "Compliance & Security"}</h4>
          <div className="flex flex-col gap-2.5 text-xs text-zinc-400">
            <button onClick={() => setCurrentTab("privacy")} className="hover:text-red-400 flex items-center justify-end gap-1.5 cursor-pointer">
              <span>{t.privacy}</span>
              <Shield className="h-3.5 w-3.5 text-red-500" />
            </button>
            <button onClick={() => setCurrentTab("terms")} className="hover:text-red-400 flex items-center justify-end gap-1.5 cursor-pointer">
              <span>{t.terms}</span>
              <FileText className="h-3.5 w-3.5 text-red-500" />
            </button>
            <button onClick={() => setCurrentTab("contact")} className="hover:text-red-400 flex items-center justify-end gap-1.5 cursor-pointer">
              <span>{t.contact}</span>
              <Mail className="h-3.5 w-3.5 text-red-500" />
            </button>
          </div>
        </div>

      </div>

      {/* Dynamic Simple HTML block with live updates if enabled */}
      {customFooterHtml && (
        <div 
          className="max-w-7xl mx-auto border-t border-zinc-900/60 mt-8 pt-6 text-xs text-neutral-400 text-center lg:text-right leading-relaxed"
          dangerouslySetInnerHTML={{ __html: customFooterHtml }}
        />
      )}

      {/* Underbar Copyrights and discrete Admin panel trigger hook */}
      <div className="max-w-7xl mx-auto border-t border-zinc-900 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between text-[11px] text-zinc-500 gap-3">
        <div className="flex items-center gap-1.5">
          <span>{t.by}</span>
          <Heart className="h-3 w-3 text-red-600 fill-red-600" />
        </div>
        
        <div className="flex items-center gap-4 flex-wrap justify-center">
          <p className="text-center font-mono">&copy; {new Date().getFullYear()} TikTube Tools. {copyrightText}.</p>
          <button 
            onClick={() => {
              setCurrentTab("dashboard");
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className="flex items-center gap-1 text-[10px] text-zinc-700 hover:text-red-500/60 font-medium transition-colors cursor-pointer border border-[#16161a] hover:border-zinc-800/40 px-2 py-0.5 rounded"
          >
            <Settings className="h-3 w-3" />
            <span>{t.admin}</span>
          </button>
        </div>
      </div>
    </footer>
  );
}

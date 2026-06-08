import React, { useState, useEffect } from "react";
import { apiFetch } from "./lib/apiClient";
import { 
  Sparkles, Youtube, Smartphone, Image as ImageIcon, FileText, 
  ArrowRight, Shield, Zap, HelpCircle, Users, Activity, Lock,
  Facebook, Tv, RefreshCw
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Dashboard from "./components/Dashboard";
import AdZoneWrapper from "./components/AdZoneWrapper";

// Tools
import YouTubeTools from "./components/Tools/YouTubeTools";
import TikTokTools from "./components/Tools/TikTokTools";
import ImageTools from "./components/Tools/ImageTools";
import AITools from "./components/Tools/AITools";
import FacebookDownloader from "./components/Tools/FacebookDownloader";

// Pages
import WhyFree from "./components/Pages/WhyFree";
import Blog from "./components/Pages/Blog";
import About from "./components/Pages/About";
import Contact from "./components/Pages/Contact";
import Privacy from "./components/Pages/Privacy";
import Terms from "./components/Pages/Terms";
import DebugPage from "./components/Pages/DebugPage";
import NotFound from "./components/Pages/NotFound";

import { SEO_DICTIONARY } from "./config/seo-data";

export default function App() {
  const [lang, setLang] = useState<"ar" | "en">("ar");
  const [currentTab, setCurrentTab] = useState<"home" | "tools" | "why-free" | "blog" | "about" | "contact" | "privacy" | "terms" | "dashboard" | "debug" | "404">("home");
  const [selectedSuite, setSelectedSuite] = useState<"youtube" | "tiktok" | "image" | "ai" | "facebook" | "youtube_downloader">("youtube");
  const [subTool, setSubTool] = useState<string>("");
  const [siteStats, setSiteStats] = useState({
    activeUsers: 0,
    imagesProcessed: 0,
    videosProcessed: 0,
    dailyRequests: 0
  });
  const [brandingSettings, setBrandingSettings] = useState<any>(null);

  const loadBrandingSettings = async () => {
    try {
      const data = await apiFetch("/api/admin/settings");
      if (data && data.success && data.settings) {
        setBrandingSettings(data.settings);
      }
    } catch (err) {
      console.error("Failed to load global brand identity records:", err);
    }
  };

  useEffect(() => {
    loadBrandingSettings();
  }, [currentTab]);

  useEffect(() => {
    if (brandingSettings && brandingSettings.faviconUrl) {
      let iconLink = document.querySelector("link[rel='icon']") || document.querySelector("link[rel='shortcut icon']");
      if (!iconLink) {
        iconLink = document.createElement("link");
        iconLink.setAttribute("rel", "icon");
        document.head.appendChild(iconLink);
      }
      iconLink.setAttribute("href", brandingSettings.faviconUrl);
    }
  }, [brandingSettings]);

  // Universal Routing Mapper & History Push
  const navigateTo = (tab: typeof currentTab, suite?: typeof selectedSuite, sub?: string) => {
    setCurrentTab(tab);
    if (suite) setSelectedSuite(suite);
    if (sub) setSubTool(sub);

    // Compute Address URL
    let newPath = "/";
    if (tab !== "home") {
      if (tab === "tools") {
        if (suite === "youtube") {
          if (sub === "downloader") newPath = "/tools/youtube-thumbnail-downloader";
          else if (sub === "transcript") newPath = "/tools/youtube-transcript-generator";
          else if (sub === "hooks") newPath = "/tools/youtube-hook-generator";
          else if (sub === "titles") newPath = "/tools/youtube-title-generator";
          else if (sub === "seo") newPath = "/tools/youtube-description-generator";
          else if (sub === "analyzer") newPath = "/tools/youtube-hashtag-generator";
          else newPath = "/tools/youtube-suite";
        } else if (suite === "tiktok") {
          if (sub === "downloader_hd") newPath = "/tools/tiktok-downloader";
          else if (sub === "mp3") newPath = "/tools/tiktok-mp3";
          else newPath = "/tools/tiktok-suite";
        } else if (suite === "image") {
          if (sub === "remove_bg") newPath = "/tools/remove-background";
          else if (sub === "compress") newPath = "/tools/image-compressor";
          else if (sub === "ocr") newPath = "/tools/image-to-text";
          else newPath = "/tools/image-suite";
        } else if (suite === "facebook") {
          newPath = "/tools/facebook-video-downloader";
        } else if (suite === "youtube_downloader") {
          newPath = "/tools/youtube-video-downloader";
        } else {
          newPath = "/tools";
        }
      } else {
        newPath = `/${tab}`;
      }
    }

    if (window.location.pathname !== newPath) {
      window.history.pushState({ tab, suite, sub }, "", newPath);
    }
    updateSEOMeta(newPath);
  };

  const generateSchemaJson = (path: string, meta: any) => {
    const localeSelection = lang === "ar" ? "ar" : "en";
    const localized = meta[localeSelection] || meta["ar"];

    // 1. Base WebSite Schema with SearchAction
    const websiteSchema = {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "name": "TikTube Tools",
      "url": "https://tiktube-suite.run",
      "potentialAction": {
        "@type": "SearchAction",
        "target": "https://tiktube-suite.run/tools?q={search_term_string}",
        "query-input": "required name=search_term_string"
      }
    };

    // 2. Organization Schema
    const orgSchema = {
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": "TikTube Tools",
      "url": "https://tiktube-suite.run",
      "logo": "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?auto=format&fit=crop&w=1200&q=80",
      "contactPoint": {
        "@type": "ContactPoint",
        "contactType": "customer service",
        "email": "support@tiktube-suite.run"
      }
    };

    // 3. BreadcrumbList Schema
    const pathParts = path.split("/").filter(Boolean);
    const breadbulbList = [
      {
        "@type": "ListItem",
        "position": 1,
        "name": lang === "ar" ? "الرئيسية" : "Home",
        "item": "https://tiktube-suite.run"
      }
    ];
    let rollingPath = "https://tiktube-suite.run";
    pathParts.forEach((part, index) => {
      rollingPath += `/${part}`;
      breadbulbList.push({
        "@type": "ListItem",
        "position": index + 2,
        "name": part.replace(/-/g, " "),
        "item": rollingPath
      });
    });
    
    const breadcrumbSchema = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": breadbulbList
    };

    const schemas: any[] = [websiteSchema, orgSchema, breadcrumbSchema];

    // 4. FAQ Schema
    if (localized && localized.faqs && localized.faqs.length > 0) {
      const faqSchema = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": localized.faqs.map((f: any) => ({
          "@type": "Question",
          "name": f.q,
          "acceptedAnswer": {
            "@type": "Answer",
            "text": f.a
          }
        }))
      };
      schemas.push(faqSchema);
    }

    // 5. SoftwareApplication Schema for tools
    if (path.startsWith("/tools/")) {
      const appSchema = {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        "name": localized.title,
        "operatingSystem": "All",
        "applicationCategory": "MultimediaApplication",
        "offers": {
          "@type": "Offer",
          "price": "0",
          "priceCurrency": "USD"
        }
      };
      schemas.push(appSchema);
    }

    return schemas;
  };

  const updateSEOMeta = (path: string) => {
    let key = path === "/" ? "/" : path;
    const meta = SEO_DICTIONARY[key] || SEO_DICTIONARY["/"];
    const localeData = meta[lang] || meta["ar"];

    // Update <title>
    document.title = localeData.title;

    // Update Description
    let descMeta = document.querySelector('meta[name="description"]');
    if (!descMeta) {
      descMeta = document.createElement("meta");
      descMeta.setAttribute("name", "description");
      document.head.appendChild(descMeta);
    }
    descMeta.setAttribute("content", localeData.description);

    // Update Keywords
    let kwMeta = document.querySelector('meta[name="keywords"]');
    if (!kwMeta) {
      kwMeta = document.createElement("meta");
      kwMeta.setAttribute("name", "keywords");
      document.head.appendChild(kwMeta);
    }
    kwMeta.setAttribute("content", localeData.keywords.join(", "));

    // Update Canonical Link
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.setAttribute("rel", "canonical");
      document.head.appendChild(canonical);
    }
    canonical.setAttribute("href", `https://tiktube-suite.run${path}`);

    // Update OpenGraph
    const ogTags = {
      "og:title": localeData.title,
      "og:description": localeData.description,
      "og:url": `https://tiktube-suite.run${path}`,
      "og:type": "website",
      "og:image": "https://tiktube-suite.run/api/placeholder/1200/630"
    };

    Object.entries(ogTags).forEach(([property, value]) => {
      let tag = document.querySelector(`meta[property="${property}"]`);
      if (!tag) {
        tag = document.createElement("meta");
        tag.setAttribute("property", property);
        document.head.appendChild(tag);
      }
      tag.setAttribute("content", value);
    });

    // Update Twitter Cards
    const twitterTags = {
      "twitter:card": "summary_large_image",
      "twitter:title": localeData.title,
      "twitter:description": localeData.description,
      "twitter:image": "https://tiktube-suite.run/api/placeholder/1200/630"
    };

    Object.entries(twitterTags).forEach(([name, value]) => {
      let tag = document.querySelector(`meta[name="${name}"]`);
      if (!tag) {
        tag = document.createElement("meta");
        tag.setAttribute("name", name);
        document.head.appendChild(tag);
      }
      tag.setAttribute("content", value);
    });

    // Dynamically inject JSON-LD Schema markup into document.head
    let schemaScript = document.getElementById("seo-schema-jsonld");
    if (!schemaScript) {
      schemaScript = document.createElement("script");
      schemaScript.setAttribute("type", "application/ld+json");
      schemaScript.setAttribute("id", "seo-schema-jsonld");
      document.head.appendChild(schemaScript);
    }
    schemaScript.textContent = JSON.stringify(generateSchemaJson(path, meta));
  };

  const handleSetTab = (tab: typeof currentTab) => {
    navigateTo(tab, tab === "tools" ? selectedSuite : undefined, tab === "tools" ? subTool : undefined);
  };

  const isAr = lang === "ar";

  const fetchStats = async () => {
    try {
      const data = await apiFetch("/api/stats");
      if (data) {
        setSiteStats({
          activeUsers: data.activeUsers || 0,
          imagesProcessed: data.imagesProcessed || 0,
          videosProcessed: data.videosProcessed || 0,
          dailyRequests: data.dailyRequests || 0
        });
      }
    } catch {
      // Keep state
    }
  };

  // 1. Initial Pathname Mapper and Analytics Trigger
  useEffect(() => {
    const path = window.location.pathname;
    
    // Initial dynamic route booster
    if (path === "/") {
      navigateTo("home");
    } else if (path === "/why-free") {
      navigateTo("why-free");
    } else if (path === "/blog") {
      navigateTo("blog");
    } else if (path === "/about") {
      navigateTo("about");
    } else if (path === "/contact") {
      navigateTo("contact");
    } else if (path === "/privacy") {
      navigateTo("privacy");
    } else if (path === "/terms") {
      navigateTo("terms");
    } else if (path === "/dashboard") {
      navigateTo("dashboard");
    } else if (path === "/tools/youtube-thumbnail-downloader") {
      navigateTo("tools", "youtube", "downloader");
    } else if (path === "/tools/youtube-transcript-generator") {
      navigateTo("tools", "youtube", "transcript");
    } else if (path === "/tools/youtube-hook-generator") {
      navigateTo("tools", "youtube", "hooks");
    } else if (path === "/tools/youtube-title-generator") {
      navigateTo("tools", "youtube", "titles");
    } else if (path === "/tools/youtube-description-generator") {
      navigateTo("tools", "youtube", "seo");
    } else if (path === "/tools/youtube-hashtag-generator") {
      navigateTo("tools", "youtube", "analyzer");
    } else if (path === "/tools/tiktok-downloader" || path === "/tools/tiktok-video-downloader" || path === "/download-tiktok-video-without-watermark") {
      navigateTo("tools", "tiktok", "downloader_hd");
    } else if (path === "/tools/tiktok-mp3") {
      navigateTo("tools", "tiktok", "mp3");
    } else if (path === "/tools/remove-background" || path === "/remove-image-background-online") {
      navigateTo("tools", "image", "remove_bg");
    } else if (path === "/tools/image-compressor") {
      navigateTo("tools", "image", "compress");
    } else if (path === "/tools/image-to-text") {
      navigateTo("tools", "image", "ocr");
    } else if (path === "/tools/facebook-video-downloader") {
      navigateTo("tools", "facebook", "");
    } else if (path === "/tools/youtube-video-downloader") {
      navigateTo("tools", "youtube_downloader", "");
    } else if (path === "/404") {
      navigateTo("404");
    } else {
      navigateTo("404");
    }

    const trackPageVisit = async () => {
      try {
        await apiFetch("/api/analytics/visit", {
          method: "POST",
          body: JSON.stringify({ page_url: path })
        });
      } catch (err) {
        // Silent block
      }
    };
    trackPageVisit();
    fetchStats();

    // Handle back/forward actions
    const handlePopState = (e: PopStateEvent) => {
      if (e.state) {
        setCurrentTab(e.state.tab || "home");
        if (e.state.suite) setSelectedSuite(e.state.suite);
        if (e.state.sub) setSubTool(e.state.sub);
        updateSEOMeta(window.location.pathname);
      }
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [lang]);

  // 2. Poll statistics every 5 seconds for automatic real-time updates
  useEffect(() => {
    const pollInterval = setInterval(() => {
      fetchStats();
    }, 5000);

    return () => clearInterval(pollInterval);
  }, []);

  const handleActionTriggered = () => {
    fetchStats();
  };

  const t = {
    ar: {
      heroTitle: "بوابتك الذكية لتصدّر التريند وصناعة محتوى تكتسح به الأرقام",
      heroSubtitle: "ثبّت حضورك الاجتماعي وضاعف الـ CTR لروابطك بصحبة أقوى نماذج الذكاء الاصطناعي مخصصة لليوتيوب والتيك توك وصناعة الصور والتحرير الفاخر مجاناً.",
      ctaStart: "ابدأ التصميم الآن",
      ctaExplore: "استكشف أدوات المنصة",
      statsTitle: "أرقام تدعم مسيرتك بشكل لحظي ومستمر",
      statsUsers: "منشئ محتوى نشط",
      statsImages: "صورة تمت معالجتها",
      statsVideos: "فيديو تم فك ضغطه",
      statsAI: "طلب ذكاء اصطناعي",
      suiteHeading: "اختر نوع وتصنيف حزمة العمل الإبداعي",
      faqTitle: "الأسئلة الأكثر شيوعاً واستفسارات",
    },
    en: {
      heroTitle: "Accelerate Search Rankings & Script Viral Audio Streams",
      heroSubtitle: "Optimize your YouTube CTR, transcode TikTok files watermark-free, utilize server-grade AI OCR, and write drafts powered by Gemini pipelines completely free.",
      ctaStart: "Start Creating Now",
      ctaExplore: "Explore Workspace Suites",
      statsTitle: "Real-Time Cloud Platform Metrics",
      statsUsers: "Active Cloud Creators",
      statsImages: "Images Rendered",
      statsVideos: "TikTok Videos Decrypted",
      statsAI: "Daily AI Executions",
      suiteHeading: "Explore Integrated Creative Tool Suites",
      faqTitle: "Frequently Asked Questions",
    }
  }[lang];

  const faqs = [
    {
      qAr: "هل هذه المنصة مجانية حقاً وبلا قيود أو اشتراكات؟",
      qEn: "Is TikTube Tools really free without limits or cards?",
      aAr: "نعم بنسبة 100%! قمنا بإلغاء جدران الدفع والاشتراكات نهائياً. يمكنك استخدام كافة أدوات التوليد، تحميل فيديوهات تيك توك، وضغط الصور بشكل غير محدود ومجاني للأبد بفضل تمويل إعلانات ومساهمات الرعاة.",
      aEn: "Yes, 100%! We have permanently removed subscriptions and logins. Feel free to use all tools, download raw videos, and compress files with zero limits, funded solely by non-intrusive sponsor ads."
    },
    {
      qAr: "هل يتطلب استخدام الأدوات تسجيل الدخول أو ربط حسابي؟",
      qEn: "Do I need to sign up or authenticate to use tools?",
      aAr: "لا على الإطلاق. لا نجمع بريدك ولا نلزمك بأي حساب. كل ما عليك هو فتح الأداة والبدء في تنفيذ طلبك فوراً وبأعلى درجات الخصوصية والأمان.",
      aEn: "No register or log-in required. Users can start converting TikTok data, extracting labels, or writing copy completely anonymously with absolute peace of mind."
    },
    {
      qAr: "كيف يتم تمويل المنصة لتشغيل خوادم الذكاء الاصطناعي المكلفة؟",
      qEn: "How are the expensive server and AI costs funded?",
      aAr: "يتم تسديد فواتير الخوادم والـ APIs من العوائد التي توفرها الإعلانات المعروضة وروابط الأفلييت التابعة. لا نسألك مبالغ مالية، ورؤيتك للإعلانات تعيننا على مسرك المفتوح.",
      aEn: "We sustain high cloud load expenses through elegant banner ads, AdSense, and affiliate placements. Support us by interacting with our recommended partners."
    }
  ];

  return (
    <div className="min-h-screen bg-[#09090b] font-sans text-zinc-100 antialiased flex flex-col relative overflow-x-hidden selection:bg-red-600/30 selection:text-white" dir={isAr ? "rtl" : "ltr"}>
      
      {/* 1. AD PLACEMENT: HEADER BANNER (Top of entire screen) */}
      <AdZoneWrapper zoneId="header_banner" lang={lang} />

      {/* Absolute Glow Background Accent */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-red-600/5 blur-[120px] rounded-full pointer-events-none z-0" />
      
      {/* Dynamic Navbar */}
      <Navbar 
        currentTab={currentTab}
        setCurrentTab={handleSetTab}
        lang={lang}
        setLang={setLang}
        activeUser={null} // No accounts!
        onOpenAuth={() => {}} // Disabled
        onLogout={() => {}} // Disabled
        brandingSettings={brandingSettings}
      />

      {/* Main content stream */}
      <main className="flex-grow flex flex-col justify-start relative z-10">
        
        {/* 2. AD PLACEMENT: ABOVE HERO SECTION */}
        {currentTab === "home" && <AdZoneWrapper zoneId="above_hero" lang={lang} />}

        {/* Responsive layout with side skyscrapers */}
        <div className="flex justify-center w-full max-w-7xl mx-auto px-2 relative z-10">
          
          {/* 4. AD PLACEMENT: SIDEBAR LEFT skyscraper */}
          {(currentTab === "home" || currentTab === "tools") && (
            <AdZoneWrapper zoneId="sidebar_left" lang={lang} />
          )}

          {/* Central Workspace Canvas */}
          <div className="flex-grow w-full max-w-4xl min-h-[60vh] flex flex-col justify-start">
            <AnimatePresence mode="wait">
              
              {/* HOME WORKSPACE */}
              {currentTab === "home" && (
                <motion.div
                  key="home-page"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="py-8 md:py-12 space-y-16 w-full"
                >
                  {/* BRAND HERO TITLE */}
                  <div className="text-center max-w-3xl mx-auto space-y-6">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-805 text-xs font-medium text-zinc-400 mb-2 select-none">
                      <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                      <span>{isAr ? "منصة مفتوحة ومجانية 100%" : "100% Free Open Platform Mode"}</span>
                    </div>

                    <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-[1.12] text-transparent bg-clip-text bg-gradient-to-b from-white via-zinc-200 to-zinc-400 pb-2">
                      {t.heroTitle}
                    </h1>

                    <p className="text-xs md:text-sm text-zinc-400 leading-relaxed max-w-2xl mx-auto font-normal">
                      {t.heroSubtitle}
                    </p>

                    <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
                      <button
                        onClick={() => handleSetTab("tools")}
                        className="px-8 py-3.5 bg-red-600 hover:bg-red-550 text-white font-extrabold text-xs rounded-xl shadow-[0_0_20px_rgba(220,38,38,0.25)] active:scale-95 transition-all cursor-pointer flex items-center gap-2"
                      >
                        <span>{t.ctaStart}</span>
                        <ArrowRight className={`h-4 w-4 ${isAr ? "rotate-180" : ""}`} />
                      </button>
                      <button
                        onClick={() => handleSetTab("why-free")}
                        className="px-8 py-3.5 bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-xs rounded-xl border border-zinc-850 transition-all cursor-pointer"
                      >
                        {isAr ? "لماذا نحن مجانيون؟" : "Why Free?"}
                      </button>
                    </div>
                  </div>

                  {/* 3. AD PLACEMENT: BELOW HERO SECTION */}
                  <AdZoneWrapper zoneId="below_hero" lang={lang} />

                  {/* REAL-TIME PLATFORM METRICS */}
                  <div className="pt-2">
                    <div className="text-center space-y-1 mb-6">
                      <h3 className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">{t.statsTitle}</h3>
                      <div className="h-[2px] w-12 bg-red-650 bg-gradient-to-r from-red-600 to-amber-500 mx-auto rounded-full mt-1.5" />
                    </div>

                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 bg-zinc-900/15 border border-zinc-90 w-full border-zinc-850 p-6 rounded-2xl backdrop-blur-xs" id="live-dynamic-statistics">
                      <div className={`p-2.5 text-center space-y-1 ${isAr ? "border-l border-zinc-800/40" : "border-r border-zinc-800/40"}`}>
                        <Users className="h-4.5 w-4.5 text-red-500 mx-auto opacity-80" />
                        <span className="block text-xl font-black font-mono text-white mt-1.5">{siteStats.activeUsers.toLocaleString()}+</span>
                        <span className="text-[9px] text-zinc-500 uppercase tracking-wider font-bold">{t.statsUsers}</span>
                      </div>

                      <div className={`p-2.5 text-center space-y-1 ${isAr ? "border-l border-zinc-800/40" : "border-r border-zinc-800/40"}`}>
                        <ImageIcon className="h-4.5 w-4.5 text-amber-500 mx-auto opacity-80" />
                        <span className="block text-xl font-black font-mono text-white mt-1.5">{siteStats.imagesProcessed.toLocaleString()}+</span>
                        <span className="text-[9px] text-zinc-500 uppercase tracking-wider font-bold">{t.statsImages}</span>
                      </div>

                      <div className={`p-2.5 text-center space-y-1 ${isAr ? "border-l border-zinc-800/40" : "border-r border-zinc-800/40"}`}>
                        <Smartphone className="h-4.5 w-4.5 text-cyan-400 mx-auto opacity-80" />
                        <span className="block text-xl font-black font-mono text-white mt-1.5">{siteStats.videosProcessed.toLocaleString()}+</span>
                        <span className="text-[9px] text-zinc-500 uppercase tracking-wider font-bold">{t.statsVideos}</span>
                      </div>

                      <div className="p-2.5 text-center space-y-1">
                        <Sparkles className="h-4.5 w-4.5 text-purple-400 mx-auto opacity-80" />
                        <span className="block text-xl font-black font-mono text-white mt-1.5">{siteStats.dailyRequests.toLocaleString()}+</span>
                        <span className="text-[9px] text-zinc-500 uppercase tracking-wider font-bold">{t.statsAI}</span>
                      </div>
                    </div>
                  </div>

                  {/* 5. AD PLACEMENT: BETWEEN TOOL SECTIONS (Above portal grid) */}
                  <AdZoneWrapper zoneId="between_sections" lang={lang} />

                  {/* CORE INTEG SUITE EXP */}
                  <div className="space-y-6">
                    <div className="text-center space-y-1">
                      <h2 className="text-lg md:text-xl font-black text-white">{t.suiteHeading}</h2>
                      <p className="text-[10px] text-zinc-500">{isAr ? "اضغط على أي بوابة للفتح والتنقل التلقائي" : "Click any hub portal to navigate instantly"}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* YouTube suite link */}
                      <div
                        onClick={() => navigateTo("tools", "youtube", "downloader")}
                        className="p-5 rounded-2xl border border-zinc-850 hover:border-red-500/50 bg-zinc-905/40 hover:bg-zinc-950/70 transition-all text-right space-y-4 cursor-pointer group relative overflow-hidden"
                      >
                        <div className="absolute top-0 right-0 h-1 w-1/4 bg-red-650 bg-gradient-to-r from-red-600 to-amber-500" />
                        <Youtube className="h-7 w-7 text-red-500 transition-transform group-hover:scale-105" />
                        <div>
                          <h4 className="font-extrabold text-white text-sm">{isAr ? "حقيبة اليوتيوب الاحترافية" : "YouTube Suite Pro"}</h4>
                          <p className="text-[11px] text-zinc-400 mt-1 leading-normal font-normal">{isAr ? "تحميل المصغرات بجودة HD، فحص سيو الكلمات، صانع عناوين تريند، وتوليد خطافات وفصول الفيديو." : "Extract images, compose magnetic display titles, build SEO parameters."}</p>
                        </div>
                      </div>

                      {/* TikTok suite link */}
                      <div
                        onClick={() => navigateTo("tools", "tiktok", "downloader_hd")}
                        className="p-5 rounded-2xl border border-zinc-850 hover:border-red-500/50 bg-zinc-905/40 hover:bg-zinc-950/70 transition-all text-right space-y-4 cursor-pointer group relative overflow-hidden"
                      >
                        <div className="absolute top-0 right-0 h-1 w-1/4 bg-cyan-400" />
                        <Smartphone className="h-7 w-7 text-cyan-400 transition-transform group-hover:scale-105" />
                        <div>
                          <h4 className="font-extrabold text-white text-sm">{isAr ? "أدوات التيك توك الفيروسية" : "TikTok Studio Suite"}</h4>
                          <p className="text-[11px] text-zinc-400 mt-1 leading-normal font-normal">{isAr ? "محمل الفيديو المباشر الأصلي بدون علامات مائية مجهول الهوية، جلب كبشن وموسيقى، وتوليد كفريت." : "Decrypt clear videos, transcode direct MP3 streams, compose engaging captions."}</p>
                        </div>
                      </div>

                      {/* Image suite link */}
                      <div
                        onClick={() => navigateTo("tools", "image", "remove_bg")}
                        className="p-5 rounded-2xl border border-zinc-850 hover:border-red-500/50 bg-zinc-905/40 hover:bg-zinc-950/70 transition-all text-right space-y-4 cursor-pointer group relative overflow-hidden"
                      >
                        <div className="absolute top-0 right-0 h-1 w-1/4 bg-emerald-400" />
                        <ImageIcon className="h-7 w-7 text-emerald-400 transition-transform group-hover:scale-105" />
                        <div>
                          <h4 className="font-extrabold text-white text-sm">{isAr ? "أدوات تحرير وضغط الصور وعيون الذكاء" : "Image Processing Hub"}</h4>
                          <p className="text-[11px] text-zinc-400 mt-1 leading-normal font-normal">{isAr ? "سيرفر ضغط وتوحيد أحجام الصور، وذكاء OCR لقراءة واستخراج النصوص من الصور." : "Surgical image compressors, WebP converters, and robust server layout OCR."}</p>
                        </div>
                      </div>

                      {/* AI Writing suite link */}
                      <div
                        onClick={() => navigateTo("tools", "ai", "")}
                        className="p-5 rounded-2xl border border-zinc-850 hover:border-red-500/50 bg-zinc-905/40 hover:bg-zinc-950/70 transition-all text-right space-y-4 cursor-pointer group relative overflow-hidden"
                      >
                        <div className="absolute top-0 right-0 h-1 w-1/4 bg-purple-500" />
                        <FileText className="h-7 w-7 text-purple-500 transition-transform group-hover:scale-105" />
                        <div>
                          <h4 className="font-extrabold text-white text-sm">{isAr ? "محرر الذكاء الاصطناعي وباني خطط المحتوى" : "Copywriting & Planning AI"}</h4>
                          <p className="text-[11px] text-zinc-400 mt-1 leading-normal font-normal">{isAr ? "تأليف مقالات للووردبريس، كتابة سكريبت سيناريو يوتيوب وتيك توك، وعصف أفكار لمتسع الانتشار." : "Generate articles, write script storyboards with sound effects, plan content agendas."}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* SECURITY CERTIFICATION BANNER */}
                  <div className="p-6 rounded-2xl border border-zinc-850 bg-zinc-950/40 grid grid-cols-1 md:grid-cols-12 gap-4 items-center text-right">
                    <div className="md:col-span-3 flex justify-center md:justify-end shrink-0">
                      <div className="p-3 bg-red-500/10 text-red-500 rounded-full">
                        <Shield className="h-5 w-5" />
                      </div>
                    </div>
                    <div className="md:col-span-9 space-y-1">
                      <h4 className="font-bold text-white text-xs">{isAr ? "نظام أمان وحماية فوري ومصنف" : "Certified Security Shields Enabled"}</h4>
                      <p className="text-[10px] text-zinc-400 leading-relaxed font-normal">
                        {isAr 
                          ? "المنصة محمية ومراقبة بالكامل لضمان سلامة طلباتك. نستخدم جدران حماية لمنع هجمات الحرمان من الخدمة (DDoS)، فحص XSS/CSRF، وتوجيه آمن 100%." 
                          : "We leverage rate limit matrices, secure HTTP headers, WAF patterns, and SSL compliance layers to prevent exploitation and data manipulation entirely."}
                      </p>
                    </div>
                  </div>

                  {/* FAQ CONTAINER */}
                  <div className="space-y-6 pt-4">
                    <h3 className="text-lg font-black text-center flex items-center justify-center gap-2 text-zinc-100">
                      <span>{t.faqTitle}</span>
                      <HelpCircle className="h-4.5 w-4.5 text-red-500" />
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                      {faqs.map((faq, i) => (
                        <div key={i} className="p-5 rounded-2xl bg-zinc-950/40 border border-zinc-850 text-right space-y-2 font-sans">
                          <h4 className="font-bold text-xs text-white leading-normal flex items-start justify-end gap-2 pr-1 border-r-2 border-red-500">
                            {isAr ? faq.qAr : faq.qEn}
                          </h4>
                          <p className="text-[10px] text-zinc-400 leading-normal font-normal">
                            {isAr ? faq.aAr : faq.aEn}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                </motion.div>
              )}

              {/* TOOLS HUB */}
              {currentTab === "tools" && (
                <motion.div
                  key="tools-page"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="py-8 w-fullspace-y-8"
                >
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 bg-zinc-950 p-1.5 rounded-2xl border border-zinc-850 max-w-4xl mx-auto mb-10 relative z-10">
                    <button
                      onClick={() => navigateTo("tools", "ai", "")}
                      className={`py-3 px-2 rounded-xl text-xs font-bold transition-all flex flex-col md:flex-row items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap ${selectedSuite === "ai" ? "bg-red-600 text-white shadow-lg shadow-red-500/20" : "text-zinc-400 hover:text-white"}`}
                    >
                      <FileText className="h-4 w-4" />
                      <span>{isAr ? "أدوات تفكير وكتابة" : "AI Writing"}</span>
                    </button>
                    <button
                      onClick={() => navigateTo("tools", "image", "compress")}
                      className={`py-3 px-2 rounded-xl text-xs font-bold transition-all flex flex-col md:flex-row items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap ${selectedSuite === "image" ? "bg-red-600 text-white shadow-lg shadow-red-500/20" : "text-zinc-400 hover:text-white"}`}
                    >
                      <ImageIcon className="h-4 w-4" />
                      <span>{isAr ? "تحرير الصور" : "Image Tools"}</span>
                    </button>
                    <button
                      onClick={() => navigateTo("tools", "tiktok", "downloader_hd")}
                      className={`py-3 px-2 rounded-xl text-xs font-bold transition-all flex flex-col md:flex-row items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap ${selectedSuite === "tiktok" ? "bg-red-600 text-white shadow-lg shadow-red-500/20" : "text-zinc-400 hover:text-white"}`}
                    >
                      <Smartphone className="h-4 w-4" />
                      <span>{isAr ? "حقيبة TikTok" : "TikTok Tools"}</span>
                    </button>
                    <button
                      onClick={() => navigateTo("tools", "youtube", "downloader")}
                      className={`py-3 px-2 rounded-xl text-xs font-bold transition-all flex flex-col md:flex-row items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap ${selectedSuite === "youtube" ? "bg-red-600 text-white shadow-lg shadow-red-500/20" : "text-zinc-400 hover:text-white"}`}
                    >
                      <Youtube className="h-4 w-4" />
                      <span>{isAr ? "حقيبة يوتيوب" : "YouTube Suite"}</span>
                    </button>
                    <button
                      onClick={() => navigateTo("tools", "facebook", "")}
                      className={`py-3 px-2 rounded-xl text-xs font-bold transition-all flex flex-col md:flex-row items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap ${selectedSuite === "facebook" ? "bg-red-600 text-white shadow-lg shadow-red-500/20" : "text-zinc-400 hover:text-white"}`}
                    >
                      <Facebook className="h-4 w-4" />
                      <span>{isAr ? "تحميل فيسبوك" : "Facebook Down"}</span>
                    </button>
                  </div>

                  <div>
                    {selectedSuite === "youtube" && <YouTubeTools lang={lang} onActionTriggered={handleActionTriggered} initialSubTool={subTool} />}
                    {selectedSuite === "tiktok" && <TikTokTools lang={lang} onActionTriggered={handleActionTriggered} initialSubTool={subTool} />}
                    {selectedSuite === "image" && <ImageTools lang={lang} onActionTriggered={handleActionTriggered} initialSubTool={subTool} />}
                    {selectedSuite === "ai" && <AITools lang={lang} onActionTriggered={handleActionTriggered} />}
                    {selectedSuite === "facebook" && <FacebookDownloader lang={lang} onActionTriggered={handleActionTriggered} />}
                  </div>

                </motion.div>
              )}

              {/* WHY FREE PAGE */}
              {currentTab === "why-free" && (
                <motion.div key="why-free" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <WhyFree lang={lang} />
                </motion.div>
              )}

              {/* BLOG PAGE */}
              {currentTab === "blog" && (
                <motion.div key="blog" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <Blog lang={lang} />
                </motion.div>
              )}

              {/* ABOUT PAGE */}
              {currentTab === "about" && (
                <motion.div key="about" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <About lang={lang} />
                </motion.div>
              )}

              {/* CONTACT PAGE */}
              {currentTab === "contact" && (
                <motion.div key="contact" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <Contact lang={lang} />
                </motion.div>
              )}

              {/* PRIVACY POLICY */}
              {currentTab === "privacy" && (
                <motion.div key="privacy" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <Privacy lang={lang} />
                </motion.div>
              )}

              {/* TERMS POLICY */}
              {currentTab === "terms" && (
                <motion.div key="terms" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <Terms lang={lang} />
                </motion.div>
              )}

              {/* ADMIN CONTROL PANEL */}
              {currentTab === "dashboard" && (
                <motion.div key="dashboard-tab" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-2 sm:p-4 max-w-7xl mx-auto w-full">
                  <Dashboard lang={lang} activeSession={{ role: "admin", username: "peeling.mask17" }} onRefreshSession={() => {}} />
                </motion.div>
              )}

              {/* DEBUG PAGE */}
              {currentTab === "debug" && (
                <motion.div key="debug-tab" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-2 sm:p-4 max-w-7xl mx-auto w-full">
                  <DebugPage lang={lang} />
                </motion.div>
              )}

              {/* NOT FOUND PAGE 404 */}
              {currentTab === "404" && (
                <motion.div key="not-found-tab" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-2 sm:p-4 max-w-7xl mx-auto w-full">
                  <NotFound lang={lang} setCurrentTab={handleSetTab} />
                </motion.div>
              )}

            </AnimatePresence>
          </div>

          {/* 6. AD PLACEMENT: SIDEBAR RIGHT skyscraper */}
          {(currentTab === "home" || currentTab === "tools") && (
            <AdZoneWrapper zoneId="sidebar_right" lang={lang} />
          )}

        </div>

        {/* 7. AD PLACEMENT: ABOVE FOOTER */}
        <AdZoneWrapper zoneId="above_footer" lang={lang} />

      </main>

      {/* 8. AD PLACEMENT: FOOTER BANNER & Global Footer component */}
      <AdZoneWrapper zoneId="footer_banner" lang={lang} />
      <Footer lang={lang} setCurrentTab={handleSetTab} brandingSettings={brandingSettings} />

    </div>
  );
}

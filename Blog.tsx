import React, { useEffect, useState } from "react";
import { apiFetch } from "../../lib/apiClient";
import { Search, Calendar, User, Clock, ArrowLeft, Newspaper, Sparkles, BookOpen } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import AdSense from "../AdSense";

export interface BlogPost {
  id: string;
  title: string;
  titleAr: string;
  excerpt: string;
  excerptAr: string;
  content: string;
  contentAr: string;
  author: string;
  authorAr: string;
  date: string;
  readTime: string;
  readTimeAr: string;
  tags: string[];
  bannerUrl: string;
}

interface BlogProps {
  lang: "ar" | "en";
}

export default function Blog({ lang }: BlogProps) {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTag, setSelectedTag] = useState<string>("All");
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);

  const isAr = lang === "ar";

  // Pre-seed offline-first fallback posts in case api is reloading
  const fallbacksAr: BlogPost[] = [
    {
      id: "post-1",
      title: "How to Double Your YouTube CTR with Strategic Thumbnail Color Palettes",
      titleAr: "كيف تضاعف نسبة النقر CTR لليوتيوب باستخدام لوحات ألوان ذكية للمصغرات",
      excerpt: "Colors speak louder than titles. Discover the high-contrast combinations that force viewers to click.",
      excerptAr: "الألوان تتحدث بصوت أعلى من الكلمات. اكتشف تجميعات الألوان فائقة التباين التي تجبر المشاهد على النقر والفتح.",
      content: "First impressions are lasting. In the layout theory of YouTube CTR, thumbnails drive 90% of the initial organic look coefficient. To optimize this, leverage complimentary color splits like cyan and sunset magenta with a dark charcoal outline overlay. Keep visual content centered and text aligned within the right grid margins.",
      contentAr: "الانطباعات الأولى تدوم طويلاً! في علم وتصميم اليوتيوب، تقود الصورة المصغرة أكثر من 90% من قرار المشاهد بالنقر والمشاهدة. لتسريع نمو قناتك:\n\n1. افصل العناصر بخلفية داكنة تماماً وثبّت لوحة ألوان ثنائية (مثل الأزرق الفيروزي مع البرتقالي المتوهج).\n2. قلّص الكلمات داخل الصورة إلى كلمة أو اثنتين بحد أقصى واستخدم خطوطاً غليظة متباعدة.\n3. ضع وجهاً بشرياً يعبر عن انفعال قوي في ثلث الصورة الأيمن لتوجيه العين تلقائياً.\n\nمن خلال الالتزام بهذه الخواص الثلاث، ستلاحظ ارتقاءً لحظياً في حركات نقر الرابط وسجلات سيو الفيديو.",
      author: "Yousef Al-Masri",
      authorAr: "يوسف المصري",
      date: "2026-06-05",
      readTime: "4 min read",
      readTimeAr: "قراءة في 4 دقائق",
      tags: ["YouTube", "CTR", "Design"],
      bannerUrl: "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?auto=format&fit=crop&w=800&q=80"
    },
    {
      id: "post-2",
      title: "Cracking the 2026 TikTok Short-Form Feed Algorithm: Hook Secrets Revealed",
      titleAr: "فك تشفير خوارزمية تيك توك 2026: أسرار الخطاف الافتتاحي الذهبي للفيديو",
      excerpt: "The first 3 seconds decide your virality. Here are 5 dynamic script hooks that hold attention.",
      excerptAr: "أول 3 ثوانٍ تحدد مصير الفيديو إما الشهرة أو النسيان. إليك 5 خطافات احترافية لضمان تداول الفيديوهات.",
      content: "Retention rate is the holy grail of micro-form video feeds. TikTok's sorting cluster weights watch-time completion above likes and comments. To capture this flow, structure scripts with direct negative-outcome warnings in the first frames. Example: 'Stop editing your videos this way if you want views.'",
      contentAr: "معدل الاحتفاظ بالمشاهد (Retention) هو الوقود الفعلي لانتشار الفيديوهات القصيرة على تيك توك وريلز. نظام تصفية تيك توك يزن نسبة إتمام المشاهدة الكاملة أعلى بكثير من الإعجابات الباردة.\n\nإليك كيف تجمع الاهتمام في اللحظة الأولى:\n1. ابدأ بفرضية صادمة أو حقيقة تضرب السائد: (مثال: 'توقف عن كتابة سكريبتاتك بهذه الطريقة إذا كنت تريد مشاهدات').\n2. استخدم مؤثرات انتقال بصرية (Transition Loops) كل ثانيتين لمنع العين من الملل وتثبيت حركة الأصابع.\n3. أشر للنتيجة في البداية ثم ابنِ الفضول خلف كيفية نيلها.\n\nتأكد كذلك من توليد نصوص كابشن جذابة باستخدام أدوات ذكاء تيك تيوب لتوسيع دلالات السيو للبحث.",
      author: "Sarah Karim",
      authorAr: "سارة كريم",
      date: "2026-06-02",
      readTime: "5 min read",
      readTimeAr: "قراءة في 5 دقائق",
      tags: ["TikTok", "AI", "Writing"],
      bannerUrl: "https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=800&q=80"
    },
    {
      id: "post-3",
      title: "AI Automation in Modern Copywriting: Scriptwriting in The Era of Gemini 3.5",
      titleAr: "أتمتة صناعة المحتوى الذكي: قواعد صياغة الاسكريبت مع Gemini 3.5",
      excerpt: "Leverage standard prompts to write production-ready screenplays in seconds with correct emotional cues.",
      excerptAr: "استغل نماذج الذكاء الاصطناعي لإنشاء سيناريوهات متكاملة لليوتيوب فوراً، مع توزيع المؤثرات الصوتية والتعليمات البصرية.",
      content: "Writing is planning. Modern scriptwriters utilize prompt workflows to engineer stories that evoke rapid emotional responses. By incorporating sound design ideas inside brackets, the creator builds an immediate audio-visual storyboard.",
      contentAr: "الكتابة لم تعد عملاً شاقاً يتطلب أياماً! مع تحول الذكاء الاصطناعي إلى شريك حقيقي، يمكنك توليد أفكار مبهرة وسيناريوهات متكاملة بلمح البصر:\n\n1. وظف الذكاء الاصطناعي لكتابة أفكار مع زوايا فيروسية مخصصة أولاً.\n2. اطلب تحويل الفكرة الناجحة لمخطط تفصيلي يوزع النبرات الصوتية وحركة المشاهد السريعة.\n3. ضع التعليمات الإخراجية والمؤثرات الصوتية مثل [صوت رياح، زووم سريع للكاميرا] لتبسيط التحرير.\n\nمن خلال التخطيط الذكي، يمكنك صناعة وإنتاج حزمة فيديوهات أسبوعية كاملة بجهد يوم واحد فقط.",
      author: "Admin Team",
      authorAr: "فريق الإشراف",
      date: "2026-05-28",
      readTime: "3 min read",
      readTimeAr: "قراءة في 3 دقائق",
      tags: ["AI", "Copywriting", "Tips"],
      bannerUrl: "https://images.unsplash.com/photo-1542435503-956c469947f6?auto=format&fit=crop&w=800&q=80"
    }
  ];

  const fetchBlogPosts = async () => {
    try {
      const data = await apiFetch("/api/blog");
      if (data && data.length > 0) {
        setPosts(data);
        return;
      }
      setPosts(fallbacksAr);
    } catch {
      setPosts(fallbacksAr);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogPosts();
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");
    if (id && posts.length > 0) {
      const found = posts.find(p => p.id === id);
      if (found) {
        setSelectedPost(found);
      }
    }
  }, [posts]);

  const t = {
    ar: {
      header: "مدونة TikTube الإبداعية",
      subheader: "دليلك الشامل لتعلم أسرار يوتيوب وتيك توك، صياغة الاسكريبتات الابتكارية، وتحسين أداء CTR لروابطك وقناتك.",
      searchPlaceholder: "ابحث في المقالات والأسرار...",
      noResults: "عذراً، لم نتمكن من العثور على مقالات تطابق بحثك.",
      back: "العودة للمقالات",
      tags: ["الكل", "YouTube", "TikTok", "AI", "Design", "Writing"],
    },
    en: {
      header: "TikTube Creator Blog",
      subheader: "Your ultimate handbook to unlocking algorithms, engineering viral titles, improving CTR color graphics, and learning professional script patterns.",
      searchPlaceholder: "Search guides and algorithms...",
      noResults: "No articles matching your query found.",
      back: "Back to Blog",
      tags: ["All", "YouTube", "TikTok", "AI", "Design", "Writing"],
    }
  }[lang];

  // Extract all tags dynamically + add "All" / "الكل"
  const allTags = isAr ? ["الكل", "YouTube", "TikTok", "AI", "Design", "Writing"] : ["All", "YouTube", "TikTok", "AI", "Design", "Writing"];

  const filteredPosts = posts.filter(post => {
    const titleText = isAr ? post.titleAr : post.title;
    const excerptText = isAr ? post.excerptAr : post.excerpt;
    const contentText = isAr ? post.contentAr : post.content;
    const matchesSearch = 
      titleText.toLowerCase().includes(searchTerm.toLowerCase()) ||
      excerptText.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contentText.toLowerCase().includes(searchTerm.toLowerCase());

    const isAllTag = selectedTag === "All" || selectedTag === "الكل";
    const matchesTag = isAllTag || post.tags.some(tag => tag.toLowerCase() === selectedTag.toLowerCase());

    return matchesSearch && matchesTag;
  });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4 text-white">
        <Clock className="h-8 w-8 text-red-500 animate-spin" />
        <span className="text-sm text-zinc-400">{isAr ? "جاري تحميل المدونة وحزم المقالات..." : "Loading creative blog streams..."}</span>
      </div>
    );
  }

  return (
    <div className="py-12 md:py-20 max-w-6xl mx-auto px-4 text-right" id="blog-workspace" dir={isAr ? "rtl" : "ltr"}>
      
      <AnimatePresence mode="wait">
        {!selectedPost ? (
          <motion.div
            key="list-view"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-12"
          >
            {/* Blog title content */}
            <div className="text-center max-w-2xl mx-auto space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-xs font-bold text-red-400 select-none">
                <Newspaper className="h-3.5 w-3.5" />
                <span>{isAr ? "أسرار نمو القنوات وصناعة المحتوى" : "Creator University Guides"}</span>
              </div>
              <h2 className="text-3xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-zinc-400">
                {t.header}
              </h2>
              <p className="text-xs md:text-sm text-zinc-400 leading-relaxed font-normal">
                {t.subheader}
              </p>
            </div>

            <AdSense className="my-2" slot="ad-blog-list-top" />

            {/* Filter and Search board */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-zinc-900/30 p-4 border border-zinc-900 rounded-2xl">
              {/* Tag filtering capsules */}
              <div className="flex flex-wrap items-center gap-1.5 justify-end w-full md:w-auto">
                {allTags.map((tag) => {
                  const isCurrent = selectedTag === tag;
                  return (
                    <button
                      key={tag}
                      onClick={() => setSelectedTag(tag)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${isCurrent ? "bg-red-600 text-white shadow-md shadow-red-600/20" : "bg-zinc-950 text-zinc-400 border border-zinc-800 hover:text-white"}`}
                    >
                      {tag}
                    </button>
                  );
                })}
              </div>

              {/* Search text field */}
              <div className="relative w-full md:w-72">
                <input
                  type="text"
                  placeholder={t.searchPlaceholder}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-3 pr-10 py-2.5 bg-zinc-950 text-xs text-white placeholder-zinc-500 rounded-xl border border-zinc-850 focus:outline-none focus:border-red-500/50 transition-all font-sans text-right"
                />
                <Search className={`absolute top-3 h-4 w-4 text-zinc-500 ${isAr ? "right-3.5" : "left-3.5"}`} />
              </div>
            </div>

            {/* Grid display of articles */}
            {filteredPosts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {filteredPosts.map((post) => (
                  <div
                    key={post.id}
                    onClick={() => {
                      setSelectedPost(post);
                      window.history.pushState({ tab: "blog", suite: "", sub: "" }, "", `/blog?id=${post.id}`);
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    className="p-5 rounded-2xl bg-zinc-950/40 border border-zinc-850 hover:border-zinc-700/60 transition-all flex flex-col justify-between text-right cursor-pointer group hover:bg-zinc-950/80"
                  >
                    <div className="space-y-4">
                      {/* Image header */}
                      <div className="w-full aspect-[16/10] bg-zinc-900 rounded-xl overflow-hidden relative border border-white/5 shadow-inner">
                        <img
                          src={post.bannerUrl}
                          alt={isAr ? post.titleAr : post.title}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <div className="absolute top-3 left-3 bg-zinc-950/90 text-zinc-300 text-[9px] font-bold py-1 px-2.5 rounded-md border border-white/5 uppercase">
                          {post.tags[0]}
                        </div>
                      </div>

                      {/* Content block */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-3 text-[10px] text-zinc-500 justify-end font-semibold">
                          <span className="flex items-center gap-1 font-mono">{post.date} <Calendar className="h-3 w-3" /></span>
                          <span>•</span>
                          <span className="flex items-center gap-1">{isAr ? post.authorAr : post.author} <User className="h-3 w-3" /></span>
                        </div>

                        <h4 className="font-extrabold text-sm text-white group-hover:text-red-400 transition-colors leading-snug">
                          {isAr ? post.titleAr : post.title}
                        </h4>

                        <p className="text-zinc-400 text-xs lines-clamp-3 leading-relaxed font-normal">
                          {isAr ? post.excerptAr : post.excerpt}
                        </p>
                      </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-zinc-900 flex items-center justify-between">
                      <span className="text-[10px] text-zinc-500 font-bold flex items-center gap-1 font-mono">
                        <Clock className="h-3 w-3" /> {isAr ? post.readTimeAr : post.readTime}
                      </span>
                      <span className="text-red-400 font-bold text-[10px] flex items-center gap-1 hover:underline">
                        <span>{isAr ? "اقرأ المقال كاملة" : "Read Full Article"}</span>
                        <ArrowLeft className={`h-3 w-3 ${isAr ? "" : "rotate-180"}`} />
                      </span>
                    </div>

                  </div>
                ))}
              </div>
            ) : (
              <div className="py-24 text-center space-y-3 bg-zinc-900/10 border border-dashed border-zinc-850 rounded-2xl">
                <BookOpen className="h-10 w-10 text-zinc-600 mx-auto" />
                <p className="text-sm text-zinc-400 font-medium">{t.noResults}</p>
              </div>
            )}

          </motion.div>
        ) : (
          <motion.div
            key="reader-view"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="max-w-3xl mx-auto space-y-10"
          >
            {/* Back button */}
            <button
              onClick={() => {
                setSelectedPost(null);
                window.history.pushState({ tab: "blog", suite: "", sub: "" }, "", "/blog");
              }}
              className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-bold text-white rounded-xl cursor-pointer flex items-center gap-2"
            >
              <ArrowLeft className={`h-4 w-4 ${isAr ? "" : "rotate-180"}`} />
              <span>{t.back}</span>
            </button>

            {/* Article Structure */}
            <article className="space-y-6 text-right">
              {/* Aspect banner */}
              <div className="w-full aspect-video rounded-3xl overflow-hidden bg-zinc-950 border border-zinc-800 shadow-xl relative select-none">
                <img
                  src={selectedPost.bannerUrl}
                  alt={isAr ? selectedPost.titleAr : selectedPost.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                <div className="absolute bottom-6 right-6 left-6 space-y-2">
                  <span className="px-3 py-1 bg-red-600 text-white text-[10px] font-extrabold rounded-lg inline-block w-fit">
                    {selectedPost.tags.join(" • ")}
                  </span>
                  <h1 className="text-2xl md:text-4xl font-black text-white leading-tight">
                    {isAr ? selectedPost.titleAr : selectedPost.title}
                  </h1>
                </div>
              </div>

              {/* Metadata row */}
              <div className="flex border-b border-zinc-800 pb-4 justify-between items-center text-xs text-zinc-500 font-semibold flex-row-reverse">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-red-500" />
                  <span className="text-zinc-300 font-bold">{isAr ? selectedPost.authorAr : selectedPost.author}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1 font-mono">{selectedPost.date} <Calendar className="h-3.5 w-3.5" /></span>
                  <span>•</span>
                  <span className="flex items-center gap-1">{isAr ? selectedPost.readTimeAr : selectedPost.readTime} <Clock className="h-3.5 w-3.5" /></span>
                </div>
              </div>

              <AdSense className="mt-4" slot="ad-article-top" />

              {/* Styled content text body - Markdown-style support */}
              <div className="text-zinc-300 text-sm md:text-md leading-relaxed font-normal whitespace-pre-wrap space-y-4 pt-4 tracking-wide text-justify" id="article-markdown-body">
                {isAr ? selectedPost.contentAr : selectedPost.content}
              </div>

              <AdSense className="my-6" slot="ad-article-bottom" />

            </article>

            {/* Author card promo */}
            <div className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800 flex gap-4 flex-row-reverse text-right items-center">
              <div className="h-12 w-12 rounded-xl bg-red-650 bg-gradient-to-tr from-red-600 to-amber-500 flex items-center justify-center font-bold text-lg text-white">
                YT
              </div>
              <div className="space-y-1">
                <h5 className="font-extrabold text-white text-xs">{isAr ? "تحرير فريق تيك تيوب" : "TikTube Editorial Team"}</h5>
                <p className="text-[10px] text-zinc-500 leading-normal font-normal">
                  {isAr 
                    ? "نحن نؤلف ونشارك أحدث المستجدات وخوارزميات محركات البحث يوتيوب والذكاء الاصطناعي لمساعدتك في قيادة قناتك وسك الفيديوهات الفيروسية." 
                    : "Providing actionable analytics, tools guidance, and direct design assets for digital video content makers."}
                </p>
              </div>
            </div>

          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}

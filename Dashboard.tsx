import React, { useEffect, useState } from "react";
import { 
  BarChart, Users, Laptop, Activity, Key, ShieldCheck, RefreshCw, 
  CheckCircle2, Copy, AlertTriangle, FileText, Sparkles, Sliders, 
  Plus, Edit2, Trash2, Calendar, Link, Image, Landmark, Send, Lock, Eye
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import DebugPage from "./Pages/DebugPage";

const BASE_URL = import.meta.env.VITE_API_URL || "";

interface DashboardProps {
  lang: "ar" | "en";
  activeSession: any;
  onRefreshSession: () => void;
}

export default function Dashboard({ lang, activeSession, onRefreshSession }: DashboardProps) {
  // Passcode gate state
  const [isAdminUnlocked, setIsAdminUnlocked] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [passcode, setPasscode] = useState("");
  const [passcodeError, setPasscodeError] = useState("");

  // Tabs state
  const [selectedTab, setSelectedTab] = useState<"overview" | "ads" | "blog" | "wordpress" | "identity" | "debug">("overview");

  // Ads management states
  const [ads, setAds] = useState<any[]>([]);
  const [editingAdId, setEditingAdId] = useState<string | null>(null);
  const [adForm, setAdForm] = useState<any>({
    title: "", enabled: true, code: "", type: "banner", link: "", imageUrl: "", publisherId: "", adSlotId: "", scheduleStart: "", scheduleEnd: ""
  });

  // Blog management states
  const [blogPosts, setBlogPosts] = useState<any[]>([]);
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [isAddingPost, setIsAddingPost] = useState(false);
  const [blogForm, setBlogForm] = useState<any>({
    title: "", titleAr: "", excerpt: "", excerptAr: "", content: "", contentAr: "",
    author: "", authorAr: "", tags: "", bannerUrl: "", readTime: "5 min read", readTimeAr: "قراءة في 5 دقائق"
  });

  // General metrics state
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [systemMetrics, setSystemMetrics] = useState<any>({
    totalRequests: 0,
    activeUsers: 0,
    adsDisplayed: 0,
    adClicks: 0,
    activeIntegrations: 0
  });

  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [toolUsage, setToolUsage] = useState<any[]>([]);
  const [dailyStats, setDailyStats] = useState<any[]>([]);
  const [monthlyStats, setMonthlyStats] = useState<any[]>([]);
  const [registrations, setRegistrations] = useState(0);
  const [logins, setLogins] = useState(0);

  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // WordPress interactive connection state and synchronizers
  const [wpConnStatus, setWpConnStatus] = useState<"idle" | "testing" | "success" | "error">("idle");
  const [wpConnMessage, setWpConnMessage] = useState("");
  const [wpConnDetail, setWpConnDetail] = useState("");
  const [wpSyncing, setWpSyncing] = useState(false);
  const [wpSyncMessage, setWpSyncMessage] = useState("");

  // Site Identity Settings management states
  const [identitySettings, setIdentitySettings] = useState<any>({
    logoUrl: "",
    faviconUrl: "",
    footerBioAr: "",
    footerBioEn: "",
    footerHtml: "",
    copyrightTextAr: "",
    copyrightTextEn: "",
    youtubeCookies: ""
  });
  const [logoPreview, setLogoPreview] = useState<string>("");
  const [faviconPreview, setFaviconPreview] = useState<string>("");
  const [savingIdentity, setSavingIdentity] = useState(false);
  const [saveError, setSaveError] = useState("");

  const isAr = lang === "ar";

  const fetchIdentitySettings = async () => {
    try {
      const res = await fetch(BASE_URL + "/api/admin/settings");
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.settings) {
          setIdentitySettings(data.settings);
          setLogoPreview(data.settings.logoUrl || "");
          setFaviconPreview(data.settings.faviconUrl || "");
        }
      }
    } catch (err) {
      console.error("Failed to fetch general identity info in dashboard:", err);
    }
  };

  useEffect(() => {
    if (selectedTab === "identity") {
      fetchIdentitySettings();
    }
  }, [selectedTab]);

  const handleLogoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setLogoPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleFaviconFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setFaviconPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSaveIdentity = async () => {
    setSavingIdentity(true);
    setSaveError("");
    try {
      let finalLogoUrl = identitySettings.logoUrl;
      let finalFaviconUrl = identitySettings.faviconUrl;

      // 1. Upload Logo if base64 is present
      if (logoPreview && logoPreview.startsWith("data:")) {
        const resLogo = await fetch(BASE_URL + "/api/admin/upload-file", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ filename: "logo.png", base64Data: logoPreview })
        });
        if (resLogo.ok) {
          const lData = await resLogo.json();
          if (lData.success) finalLogoUrl = lData.url;
        } else {
          throw new Error("Failed to upload custom Logo asset to branding storage.");
        }
      }

      // 2. Upload Favicon if base64 is present
      if (faviconPreview && faviconPreview.startsWith("data:")) {
        const resFav = await fetch(BASE_URL + "/api/admin/upload-file", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ filename: "favicon.png", base64Data: faviconPreview })
        });
        if (resFav.ok) {
          const fData = await resFav.json();
          if (fData.success) finalFaviconUrl = fData.url;
        } else {
          throw new Error("Failed to upload custom Favicon asset to branding storage.");
        }
      }

      // 3. Save all configurations together
      const updatedPayload = {
        ...identitySettings,
        logoUrl: finalLogoUrl,
        faviconUrl: finalFaviconUrl
      };

      const res = await fetch(BASE_URL + "/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedPayload)
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setIdentitySettings(data.settings);
          setLogoPreview(data.settings.logoUrl || "");
          setFaviconPreview(data.settings.faviconUrl || "");
          setSuccessMsg(isAr ? "تم حفظ الهوية وتحديث الشعار وخلفية الفوتر بنجاح!" : "All layout identity and footer preferences uploaded and updated!");
          setTimeout(() => setSuccessMsg(""), 4500);
        }
      } else {
        throw new Error("Failed to synchronize configurations with the primary server database.");
      }
    } catch (err: any) {
      console.error(err);
      setSaveError(err.message || "Settings write error.");
    } finally {
      setSavingIdentity(false);
    }
  };

  const handleResetIdentity = async () => {
    if (!window.confirm(isAr ? "هل أنت متأكد من رغبتك في إعادة تعيين الهوية بالكامل إلى الإعدادات الأساسية؟" : "Are you sure you want to revert all branding elements back to original defaults?")) return;
    setSavingIdentity(true);
    try {
      const res = await fetch(BASE_URL + "/api/admin/settings/reset", { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setIdentitySettings(data.settings);
          setLogoPreview(data.settings.logoUrl || "");
          setFaviconPreview(data.settings.faviconUrl || "");
          setSuccessMsg(isAr ? "تمت إعادة الهوية والفوتر إلى قيم النظام الأصلية بنجاح!" : "Sites styling variables successfully reset to generic defaults!");
          setTimeout(() => setSuccessMsg(""), 4000);
        }
      }
    } catch (err: any) {
      console.error(err);
      setSaveError(err.message || "Failed to reset.");
    } finally {
      setSavingIdentity(false);
    }
  };

  const triggerCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleTestWpConnection = async () => {
    setWpConnStatus("testing");
    setWpConnMessage(isAr ? "جاري فحص الاتصال بمدونة ووردبريس وتجربة الـ REST API..." : "Testing WordPress REST API connectivity...");
    setWpConnDetail("");
    try {
      const res = await fetch(BASE_URL + "/api/wordpress/test-connection");
      const data = await res.json();
      if (res.ok && data.success) {
        setWpConnStatus("success");
        setWpConnMessage(data.message || (isAr ? "تم الاتصال بنجاح ووردبريس جاهز للاستخدام!" : "Connected successfully, WordPress is ready!"));
      } else {
        setWpConnStatus("error");
        setWpConnMessage(data.error || (isAr ? "فشل الاتصال بمدونة ووردبريس" : "WordPress Connection Failed"));
        setWpConnDetail(data.detail || "");
      }
    } catch (err: any) {
      setWpConnStatus("error");
      setWpConnMessage(isAr ? "فشل جلب خادم الاتصال بـ ووردبريس" : "Failed to fetch WordPress connection diagnostics");
      setWpConnDetail(err?.message || String(err));
    }
  };

  const handlePullWpSync = async () => {
    setWpSyncing(true);
    setWpSyncMessage(isAr ? "جاري سحب ومزامنة المقالات من ووردبريس..." : "Pulling and syncing latest posts from WordPress...");
    try {
      const res = await fetch(BASE_URL + "/api/wordpress/sync", { 
        method: "POST", 
        headers: { "Content-Type": "application/json" }, 
        body: JSON.stringify({ pull: true }) 
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setWpSyncMessage(data.message || (isAr ? "تمت مزامنة المقالات بنجاح!" : "Managed to sync posts successfully!"));
        setTimeout(() => {
          fetchAdminData();
        }, 1000);
      } else {
        setWpSyncMessage((isAr ? "خطأ في المزامنة: " : "Sync failed: ") + (data.error || ""));
      }
    } catch (err: any) {
      setWpSyncMessage((isAr ? "فشل الاتصال بالخادم: " : "Network error: ") + (err?.message || String(err)));
    } finally {
      setWpSyncing(false);
    }
  };

  // 1. Fetching all ads and blog metadata from server
  const fetchAdminData = async (isManual = false) => {
    if (isManual) {
      setIsRefreshing(true);
    }

    try {
      const adsRes = await fetch(BASE_URL + "/api/ads/config");
      let activeAdsCount = 0;
      if (adsRes.ok) {
        const adsData = await adsRes.json();
        setAds(adsData.ads || []);
        activeAdsCount = (adsData.ads || []).filter((a: any) => a.enabled).length;
      }

      const blogRes = await fetch(BASE_URL + "/api/blog");
      if (blogRes.ok) {
        const blogData = await blogRes.json();
        setBlogPosts(blogData || []);
      }

      const statsRes = await fetch(BASE_URL + "/api/dashboard/stats");
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        if (statsData.siteMetrics) {
          setSystemMetrics({
            totalRequests: statsData.siteMetrics.totalRequests || 0,
            activeUsers: statsData.siteMetrics.activeUsers || 0,
            adsDisplayed: statsData.siteMetrics.imagesProcessed || 0,
            adClicks: statsData.siteMetrics.videosProcessed || 0,
            activeIntegrations: activeAdsCount
          });
        }
        setAuditLogs(statsData.auditLogs || []);
        setToolUsage(statsData.toolUsage || []);
        setDailyStats(statsData.dailyStatistics || []);
        setMonthlyStats(statsData.monthlyStatistics || []);
        setRegistrations(statsData.registrationsCount || 0);
        setLogins(statsData.loginsCount || 0);
      }

      if (isManual) {
        setSuccessMsg(isAr ? "تم تحديث وجلب البيانات الحية الحقيقية بنجاح من قاعدة البيانات المباشرة!" : "Live data fetched and synced successfully from local database storage!");
        setTimeout(() => setSuccessMsg(""), 4500);
      }
    } catch (e) {
      // Safe fallbacks
    } finally {
      if (isManual) {
        setIsRefreshing(false);
      }
    }
  };

  useEffect(() => {
    if (isAdminUnlocked) {
      fetchAdminData();
      const interval = setInterval(() => {
        fetchAdminData();
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [isAdminUnlocked]);

  // Handle Passcode Unlock securely via server-side verification: NO KEYS EXPOSED!
  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passcode) return;
    setIsVerifying(true);
    setPasscodeError("");
    try {
      const res = await fetch(BASE_URL + "/api/admin/verify-gate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ passcode })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setIsAdminUnlocked(true);
        setPasscodeError("");
      } else {
        setPasscodeError(isAr ? "رمز المرور غير صحيح! الرجاء المحاولة مرة أخرى." : data.error || "Incorrect passcode! Please try again.");
      }
    } catch (err) {
      setPasscodeError(isAr ? "حدث خطأ أثناء فحص رمز المرور على الخادم." : "An error occurred during server validation.");
    } finally {
      setIsVerifying(false);
    }
  };

  const getAdRecommendedSizeInfo = (adId: string) => {
    switch (adId) {
      case "header_banner":
        return {
          size: "728 × 90 px أو 970 × 90 px",
          sizeEn: "728 x 90 px or 970 x 90 px",
          type: "أفقي (Leaderboard)",
          typeEn: "Horizontal (Leaderboard)",
          desc: "يظهر في أعلى الهيدر، ممتاز للفتات الإعلانية الأفقية العريضة.",
          descEn: "Displays at the top header, best for wide horizontal banner ads."
        };
      case "above_hero":
        return {
          size: "728 × 90 px أو 970 × 90 px",
          sizeEn: "728 x 90 px or 970 x 90 px",
          type: "أفقي علوي (Above Hero)",
          typeEn: "Horizontal (Above Hero)",
          desc: "يظهر مباشرة فوق العنوان الرئيسي ك لافتة ترويجية لافتة للنظر.",
          descEn: "Displays directly above the main hero text as an eye-catching banner."
        };
      case "below_hero":
        return {
          size: "728 × 90 px أو 336 × 280 px",
          sizeEn: "728 x 90 px or 336 x 280 px",
          type: "أفقي / مربع متجاوب",
          typeEn: "Horizontal / Responsive Box",
          desc: "يظهر أسفل العنوان وأعلى حقول البحث والأدوات للفت الانتباه الفوري.",
          descEn: "Displays below the title and above the tool search input to catch user pathing."
        };
      case "sidebar_left":
        return {
          size: "160 × 600 px أو 300 × 600 px",
          sizeEn: "160 x 600 px or 300 x 600 px",
          type: "عمودي برج (Left Skyscraper)",
          typeEn: "Vertical Skyscraper (Left)",
          desc: "البرج الإعلاني على العمود الأيسر للموقع، مثالي للبانرات الطولية.",
          descEn: "Vertical skyscraper banner on the left sidebar, perfect for tall creatives."
        };
      case "sidebar_right":
        return {
          size: "160 × 600 px أو 300 × 600 px",
          sizeEn: "160 x 600 px or 300 x 600 px",
          type: "عمودي برج (Right Skyscraper)",
          typeEn: "Vertical Skyscraper (Right)",
          desc: "البرج الإعلاني على العمود الأيمن للموقع، مثالي للبانرات الطولية.",
          descEn: "Vertical skyscraper banner on the right sidebar, perfect for tall creatives."
        };
      case "between_sections":
        return {
          size: "728 × 90 px أو 970 × 250 px",
          sizeEn: "728 x 90 px or 970 x 250 px",
          type: "أفقي عريض (Between Sections)",
          typeEn: "Wide Horizontal (Between Sections)",
          desc: "يظهر كفاصل إعلاني مميز بين أقسام حزم الأدوات المتنوعة.",
          descEn: "Placed as a distinct visual break between different tool sections."
        };
      case "above_footer":
        return {
          size: "728 × 90 px أو 970 × 90 px",
          sizeEn: "728 x 90 px or 970 x 90 px",
          type: "أفقي (Above Footer)",
          typeEn: "Horizontal (Above Footer)",
          desc: "يظهر أسفل الصفحة تماماً قبل بداية الهامش الكروي السفلي.",
          descEn: "Displays at the bottom right before the footer wrapper starts."
        };
      case "footer_banner":
        return {
          size: "468 × 60 px أو 728 × 90 px",
          sizeEn: "468 x 60 px or 728 x 90 px",
          type: "أفقي صغير (Footer Banner)",
          typeEn: "Small Horizontal (Footer Banner)",
          desc: "منطقة إعلانية مدمجة ومبسطة تظهر داخل نطاق الفوتر والروابط السفلية.",
          descEn: "Compact banner slot embedded cleanly inside the footer and copyrights bar."
        };
      default:
        return {
          size: "تلقائي / متجاوب",
          sizeEn: "Responsive",
          type: "متجاوب",
          typeEn: "Responsive Banner",
          desc: "يتكيف تلقائياً مع حجم الشاشة والمكان المخصص له.",
          descEn: "Adapts automatically based on the device width and parent viewport."
        };
    }
  };

  // Save/Update Ad Placement
  const handleSelectAdZone = (ad: any) => {
    setEditingAdId(ad.id);
    setAdForm({
      title: ad.title || "",
      enabled: ad.enabled,
      code: ad.code || "",
      type: ad.type,
      link: ad.link || "",
      imageUrl: ad.imageUrl || "",
      publisherId: ad.publisherId || "",
      adSlotId: ad.adSlotId || "",
      scheduleStart: ad.scheduleStart || "",
      scheduleEnd: ad.scheduleEnd || ""
    });
  };

  const handleSaveAd = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`/api/ads/update/${editingAdId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(adForm)
      });
      if (res.ok) {
        setSuccessMsg(isAr ? "تم تحديث إعدادات الإعلان بنجاح!" : "Ad zone configured successfully!");
        fetchAdminData();
        setEditingAdId(null);
        setTimeout(() => setSuccessMsg(""), 3000);
      }
    } catch {
      //
    } finally {
      setLoading(false);
    }
  };

  // Manage Blog Posts
  const handleStartAddPost = () => {
    setIsAddingPost(true);
    setEditingPostId(null);
    setBlogForm({
      title: "How to Build an Intentional Brand with YouTube Analytics",
      titleAr: "قواعد بناء علامة تجارية شخصية ناطقة عبر إحصائيات اليوتيوب",
      excerpt: "Analyze CTR layouts, audio retention, and keyword tags for optimal distribution.",
      excerptAr: "كيف تحلل معدلات حفظ المشاهد وقوة سيو الكلمات لضمان انتشار الفيديوهات.",
      content: "Retention rate is key...",
      contentAr: "معدل الاحتباس الصوتي والبصري هو الركن الأساسي...",
      author: "Admin Editorial",
      authorAr: "رئيس تحرير تيك تيوب",
      tags: "YouTube, Analytics, Tips",
      bannerUrl: "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?auto=format&fit=crop&w=800&q=80",
      readTime: "4 min read",
      readTimeAr: "قراءة في 4 دقائق"
    });
  };

  const handleEditPost = (post: any) => {
    setEditingPostId(post.id);
    setIsAddingPost(false);
    setBlogForm({
      title: post.title,
      titleAr: post.titleAr,
      excerpt: post.excerpt,
      excerptAr: post.excerptAr,
      content: post.content,
      contentAr: post.contentAr,
      author: post.author,
      authorAr: post.authorAr,
      tags: post.tags.join(", "),
      bannerUrl: post.bannerUrl,
      readTime: post.readTime,
      readTimeAr: post.readTimeAr
    });
  };

  const handleSaveBlogPost = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const postPayload = {
      ...blogForm,
      tags: blogForm.tags.split(",").map((t: string) => t.trim())
    };

    const url = editingPostId ? `/api/blog/posts/update/${editingPostId}` : "/api/blog/posts/create";
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(postPayload)
      });
      if (res.ok) {
        setSuccessMsg(isAr ? "تم حفظ المقالة بنجاح!" : "Blog article published successfully!");
        fetchAdminData();
        setIsAddingPost(false);
        setEditingPostId(null);
        setTimeout(() => setSuccessMsg(""), 3000);
      }
    } catch {
      //
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePost = async (id: string) => {
    if (deleteConfirmId !== id) {
      setDeleteConfirmId(id);
      // Auto cancel tag after 4 seconds
      setTimeout(() => {
        setDeleteConfirmId(currentId => currentId === id ? null : currentId);
      }, 4000);
      return;
    }
    try {
      const res = await fetch(`/api/blog/posts/delete/${id}`, { method: "POST" });
      if (res.ok) {
        setSuccessMsg(isAr ? "تم حذف المقالة من الموقع وقاعدة البيانات كلياً!" : "Blog article removed completely from server and DB!");
        setDeleteConfirmId(null);
        fetchAdminData();
        setTimeout(() => setSuccessMsg(""), 4000);
      }
    } catch {
      // Fallback
    }
  };

  const t = {
    ar: {
      gateTitle: "بوابة الإدارة المركزية",
      gateSubtitle: "",
      gateHint: "",
      submitGate: "فتح قفل الإدارة",
      title: "لوحة تحكم الإشراف والإعلانات",
      status: "حالة النظام الإعلاني",
      statusActive: "مستقر ونشط",
      metricsTitle: "إحصائيات المنصة الحية (آخر 24 ساعة)",
      requests: "إجمالي طلبات الأدوات المنجزة",
      adViews: "إجمالي مرات ظهور الإعلانات",
      adClicks: "إجمالي نقرات الإعلانات",
      activeIntegrations: "قنوات الربط والدمج النشطة",
      tabOverview: "نظرة عامة",
      tabAds: "مدير الإعلانات (8 مناطق)",
      tabBlog: "إدارة المقالات (WordPress style)",
      tabWordPress: "طبقة دمج WordPress",
      tabIdentity: "الهوية والفوتر واللوجو",
      tabDebug: "تصحيح ومراقبة التحميل (Debug)",
      refresh: "تحديث البيانات الحية",
      zoneHeading: "اختر منطقة إعلانية لإعدادها وتعديل الشفرة",
      editAdZone: "تعديل إعدادات الإعلان",
      saveAd: "حفظ الشفرة وتنشيط المسار",
      cancel: "إلغاء الأمر",
    },
    en: {
      gateTitle: "Central Administration Gate",
      gateSubtitle: "",
      gateHint: "",
      submitGate: "Unlock Control Panel",
      title: "Admin & Sponsors Control Center",
      status: "Ad Engine Health",
      statusActive: "Operational",
      metricsTitle: "Real-time Platform Activity Indices (24h)",
      requests: "Total API Tool executions",
      adViews: "Aggregated Ad Impressions",
      adClicks: "Total Direct Ad Clicks",
      activeIntegrations: "WordPress Sync Webhooks",
      tabOverview: "Live Insights",
      tabAds: "Ad Manager (8 Zones)",
      tabBlog: "SaaS Blog Editor",
      tabWordPress: "WordPress Integration Studio",
      tabIdentity: "Site Settings & Branding",
      tabDebug: "Download Debugger",
      refresh: "Refresh Dashboard",
      zoneHeading: "Select an active placement zone to configure HTML scripts",
      editAdZone: "Configure Creative & Schedule Filters",
      saveAd: "Deploy Configuration Changes",
      cancel: "Cancel",
    }
  }[lang];

  // Passcode entry layout
  if (!isAdminUnlocked) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center py-10 px-4 text-white" id="admin-passcode-gate">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md p-8 bg-zinc-950 border border-zinc-850 rounded-3xl shadow-xl space-y-6 text-right"
        >
          <div className="flex flex-col items-center text-center space-y-3">
            <div className="h-12 w-12 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500">
              <Lock className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold text-white font-sans">{t.gateTitle}</h3>
            {t.gateSubtitle && <p className="text-xs text-zinc-400 font-normal leading-relaxed">{t.gateSubtitle}</p>}
          </div>

          <form onSubmit={handleUnlock} className="space-y-4">
            <div className="space-y-1 text-right">
              <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">{isAr ? "كود المرور" : "Passcode Entry"}</label>
              <input
                type="password"
                placeholder="••••••••"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                disabled={isVerifying}
                className="w-full px-4 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-center text-white focus:outline-none focus:border-red-500 text-sm font-bold disabled:opacity-50"
              />
              {passcodeError && <p className="text-[10px] text-red-400 font-semibold mt-1 text-center">{passcodeError}</p>}
            </div>

            <button 
              type="submit"
              disabled={isVerifying}
              className="w-full py-2.5 bg-red-600 hover:bg-red-550 text-white font-bold text-xs rounded-xl shadow-md transition-all active:scale-95 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isVerifying ? (
                <>
                  <span className="h-3 w-3 rounded-full border-2 border-white border-t-transparent animate-spin inline-block" />
                  <span>{isAr ? "جاري تسجيل الدخول..." : "Verifying code..."}</span>
                </>
              ) : (
                <span>{t.submitGate}</span>
              )}
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="space-y-8 text-right text-white max-w-7xl mx-auto px-4 py-6" id="unlocked-admin-portal" dir={isAr ? "rtl" : "ltr"}>
      
      {/* 1. Portal header with glowing offline mode banner */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 border-b border-zinc-850 pb-6">
        <div className="flex items-center gap-3 justify-end flex-row-reverse text-right">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-red-600 to-amber-500 flex items-center justify-center shadow-md">
            <Sliders className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-white">{t.title}</h2>
            <div className="flex items-center gap-2 mt-1 justify-end flex-row-reverse text-right">
              <span className="text-[10px] text-emerald-400 font-extrabold uppercase">{t.statusActive}</span>
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-bounce"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
              </span>
              <span className="text-[10px] text-zinc-500">| {t.status}:</span>
            </div>
          </div>
        </div>

        <button
          onClick={() => fetchAdminData(true)}
          disabled={isRefreshing}
          className="flex items-center gap-2 text-xs font-bold py-2 px-4 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white transition-all cursor-pointer self-start disabled:opacity-60 disabled:cursor-not-allowed"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
          <span>{isRefreshing ? (isAr ? "جاري جلب البيانات..." : "Refreshing...") : t.refresh}</span>
        </button>
      </div>

      {/* Success alert message toast */}
      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-600/10 border border-emerald-500/20 text-emerald-400 font-bold text-xs flex items-center gap-2 justify-end">
          <span>{successMsg}</span>
          <CheckCircle2 className="h-4.5 w-4.5" />
        </div>
      )}

      {/* 2. Admin Portal Navigation Bars */}
      <div className="flex items-center gap-1.5 border-b border-zinc-850 pb-2 justify-end overflow-x-auto">
        <button
          onClick={() => setSelectedTab("debug")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${selectedTab === "debug" ? "bg-red-600 text-white" : "text-zinc-400 hover:text-white"}`}
        >
          {t.tabDebug}
        </button>
        <button
          onClick={() => setSelectedTab("identity")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${selectedTab === "identity" ? "bg-red-600 text-white" : "text-zinc-400 hover:text-white"}`}
        >
          {t.tabIdentity}
        </button>
        <button
          onClick={() => setSelectedTab("wordpress")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${selectedTab === "wordpress" ? "bg-red-600 text-white" : "text-zinc-400 hover:text-white"}`}
        >
          {t.tabWordPress}
        </button>
        <button
          onClick={() => setSelectedTab("blog")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${selectedTab === "blog" ? "bg-red-600 text-white" : "text-zinc-400 hover:text-white"}`}
        >
          {t.tabBlog}
        </button>
        <button
          onClick={() => setSelectedTab("ads")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${selectedTab === "ads" ? "bg-red-600 text-white" : "text-zinc-400 hover:text-white"}`}
        >
          {t.tabAds}
        </button>
        <button
          onClick={() => setSelectedTab("overview")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${selectedTab === "overview" ? "bg-red-600 text-white" : "text-zinc-400 hover:text-white"}`}
        >
          {t.tabOverview}
        </button>
      </div>

      {/* 3. CONDITIONAL TABS CONTENT */}

      {selectedTab === "overview" && (
        <div className="space-y-8" id="overview-dashboard-tab">
          
          {/* Main live database statistics panel */}
          <div className="border border-zinc-850 bg-zinc-950/30 rounded-3xl p-6 space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-850/60 pb-4">
              <div className="text-right">
                <h3 className="text-sm font-black text-white flex items-center gap-1.5 justify-end">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>{isAr ? "إحصائيات وقراءات قاعدة البيانات اللحظية" : "Live Database Analytical Telemetry"}</span>
                </h3>
                <p className="text-[10px] text-zinc-500 mt-1">
                  {isAr 
                    ? "تحديث تلقائي مستمر عبر الاتصال المباشر لخدمة خادم TikTube كل 5 ثوانٍ" 
                    : "Continuous live polling directly connecting server database files every 5 seconds"}
                </p>
              </div>
              <div className="px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-extrabold text-emerald-400">
                {isAr ? "متصل بقاعدة البيانات" : "DATABASE SECURED & CONNECTED"}
              </div>
            </div>

            {/* 6-Grid Stats Bento */}
            <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
              <div className="p-4 rounded-2xl border border-zinc-850 bg-zinc-900/10 text-center space-y-1">
                <span className="block text-[9px] text-zinc-500 font-bold uppercase tracking-wider">{isAr ? "إجمالي الزيارات" : "Total Visits"}</span>
                <span className="block text-xl font-black text-white font-mono">{systemMetrics.totalRequests}</span>
              </div>
              <div className="p-4 rounded-2xl border border-zinc-850 bg-zinc-900/10 text-center space-y-1">
                <span className="block text-[9px] text-zinc-500 font-bold uppercase tracking-wider">{isAr ? "زوار فريدون" : "Unique Visitors"}</span>
                <span className="block text-xl font-black text-white font-mono">{systemMetrics.activeUsers}</span>
              </div>
              <div className="p-4 rounded-2xl border border-zinc-850 bg-zinc-900/10 text-center space-y-1">
                <span className="block text-[9px] text-zinc-500 font-bold uppercase tracking-wider">{isAr ? "ظهور الإعلانات" : "Ad Impressions"}</span>
                <span className="block text-xl font-black text-amber-500 font-mono">{systemMetrics.adsDisplayed}</span>
              </div>
              <div className="p-4 rounded-2xl border border-zinc-850 bg-zinc-900/10 text-center space-y-1">
                <span className="block text-[9px] text-zinc-500 font-bold uppercase tracking-wider">{isAr ? "نقرات الإعلانات" : "Ad Clicks"}</span>
                <span className="block text-xl font-black text-red-500 font-mono">{systemMetrics.adClicks}</span>
              </div>
              <div className="p-4 rounded-2xl border border-zinc-850 bg-zinc-900/10 text-center space-y-1">
                <span className="block text-[9px] text-zinc-500 font-bold uppercase tracking-wider">{isAr ? "التسجيلات" : "Registrations"}</span>
                <span className="block text-xl font-black text-cyan-400 font-mono">{registrations}</span>
              </div>
              <div className="p-4 rounded-2xl border border-zinc-850 bg-zinc-900/10 text-center space-y-1">
                <span className="block text-[9px] text-zinc-500 font-bold uppercase tracking-wider">{isAr ? "جلسات الدخول" : "User Logins"}</span>
                <span className="block text-xl font-black text-purple-400 font-mono">{logins}</span>
              </div>
            </div>
          </div>

          {/* Daily & Monthly history summaries */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Daily stats logs */}
            <div className="p-6 rounded-3xl border border-zinc-850 bg-zinc-950/40 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-zinc-500">[{dailyStats.length} days]</span>
                <h3 className="text-xs font-extrabold text-white">{isAr ? "تقرير الزيارات والعدادات اليومية" : "Daily Statistics Report"}</h3>
              </div>
              
              <div className="overflow-x-auto max-h-[250px] overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-800">
                <table className="w-full text-[10px] text-zinc-400 text-right">
                  <thead className="bg-zinc-900/50 text-zinc-300 font-bold border-b border-zinc-850">
                    <tr>
                      <th className="p-2 font-mono text-left">{isAr ? "التاريخ" : "Date"}</th>
                      <th className="p-2 font-mono">{isAr ? "الزيارات" : "Visits"}</th>
                      <th className="p-2 font-mono">{isAr ? "الفريدون" : "Unique"}</th>
                      <th className="p-2 font-mono text-amber-500">{isAr ? "ظهور" : "Views"}</th>
                      <th className="p-2 font-mono text-red-500">{isAr ? "نقر" : "Clicks"}</th>
                      <th className="p-2 font-mono text-emerald-400">{isAr ? "نقر/ظهور" : "CTR"}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-850/50">
                    {dailyStats.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-4 text-center text-zinc-600 font-bold">{isAr ? "لا توجد سجلات بعد" : "No structured logs yet."}</td>
                      </tr>
                    ) : (
                      dailyStats.slice().reverse().map((stat: any) => (
                        <tr key={stat.id} className="hover:bg-zinc-900/20">
                          <td className="p-2 font-mono text-left">{stat.date}</td>
                          <td className="p-2 font-mono text-white">{stat.visits}</td>
                          <td className="p-2 font-mono">{stat.unique_visitors}</td>
                          <td className="p-2 font-mono text-amber-500">{stat.ad_impressions}</td>
                          <td className="p-2 font-mono text-red-500">{stat.ad_clicks}</td>
                          <td className="p-2 font-mono text-emerald-400 font-bold">{stat.ctr}%</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Monthly stats logs */}
            <div className="p-6 rounded-3xl border border-zinc-850 bg-zinc-950/40 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-zinc-500">[{monthlyStats.length} months]</span>
                <h3 className="text-xs font-extrabold text-white">{isAr ? "تقرير الأداء والمقاييس الشهرية" : "Monthly Compiled Metrics"}</h3>
              </div>
              
              <div className="overflow-x-auto max-h-[250px] overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-800">
                <table className="w-full text-[10px] text-zinc-400 text-right">
                  <thead className="bg-zinc-900/50 text-zinc-300 font-bold border-b border-zinc-850">
                    <tr>
                      <th className="p-2 font-mono text-left">{isAr ? "الشهر" : "Month"}</th>
                      <th className="p-2 font-mono">{isAr ? "زيارة" : "Visits"}</th>
                      <th className="p-2 font-mono text-amber-500">{isAr ? "ظهور إعلان" : "Imps"}</th>
                      <th className="p-2 font-mono text-red-500">{isAr ? "نقرة" : "Clicks"}</th>
                      <th className="p-2 font-mono text-cyan-400">{isAr ? "أدوات" : "Usage"}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-850/50">
                    {monthlyStats.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-4 text-center text-zinc-600 font-bold">{isAr ? "لا توجد سجلات بعد" : "No structured logs yet."}</td>
                      </tr>
                    ) : (
                      monthlyStats.slice().reverse().map((m: any) => (
                        <tr key={m.month} className="hover:bg-zinc-900/10">
                          <td className="p-2 font-mono text-left">{m.month}</td>
                          <td className="p-2 font-mono text-white">{m.visits}</td>
                          <td className="p-2 font-mono text-amber-500">{m.ad_impressions}</td>
                          <td className="p-2 font-mono text-red-500">{m.ad_clicks}</td>
                          <td className="p-2 font-mono text-cyan-400 font-bold">{m.tool_usage}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>

          {/* Activity Logs & Tools Rankings */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Real audit activity logs */}
            <div className="lg:col-span-2 p-6 rounded-3xl border border-zinc-850 bg-zinc-950/40 space-y-4">
              <h3 className="text-xs font-extrabold text-white text-right">{isAr ? "سجل المعاملات والعمليات النشط في القنوات والمنصة" : "Active Feed: Real-time Live Database Audit Logs"}</h3>
              
              <div className="overflow-y-auto max-h-[300px] space-y-2.5 pr-1 scrollbar-thin scrollbar-thumb-zinc-800">
                {auditLogs.length === 0 ? (
                  <p className="text-[11px] text-zinc-500 text-center py-8">{isAr ? "لا توجد عمليات مسجلة حالياً" : "Zero database transactions currently."}</p>
                ) : (
                  auditLogs.map((log: any) => (
                    <div key={log.id} className="flex items-center justify-between p-3 rounded-2xl bg-zinc-900/15 border border-zinc-850/60 hover:border-zinc-800 transition-all text-right">
                      <span className="text-[9px] font-mono text-zinc-500">{new Date(log.timestamp).toLocaleTimeString()}</span>
                      <div className="space-y-0.5">
                        <span className="block text-[10px] text-white font-semibold">{log.toolName}</span>
                        <div className="flex items-center gap-1.5 justify-end text-[9px] text-zinc-500 font-mono">
                          <span>User: {log.username}</span>
                          <span>•</span>
                          <span>IP: {log.ipAddress}</span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Popular tools count */}
            <div className="p-6 rounded-3xl border border-zinc-850 bg-zinc-950/40 space-y-4">
              <h3 className="text-xs font-extrabold text-white text-right">{isAr ? "ترتيب الأدوات المنفذة حسب الاستخدام" : "Usage Rank: Popular Tools Executed"}</h3>
              
              <div className="space-y-3">
                {toolUsage.slice(0, 7).map((item: any, idx: number) => (
                  <div key={item.toolId} className="space-y-1 text-right">
                    <div className="flex justify-between items-center text-[10px]">
                      <span className="font-mono text-zinc-500 font-bold">{item.count} {isAr ? "تنفيذ" : "Uses"}</span>
                      <span className="text-zinc-300 font-semibold">{idx+1}. {isAr ? item.nameAr : item.name}</span>
                    </div>
                    <div className="w-full h-1 bg-zinc-900 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-red-650 to-red-500 rounded-full" 
                        style={{ width: `${Math.min(100, Math.max(5, (item.count / (toolUsage[0]?.count || 1) * 100)))}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          <div className="p-6 rounded-2xl border border-zinc-850 bg-zinc-950/40 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-1.5 justify-end">
              <ShieldCheck className="h-4.5 w-4.5 text-red-500" />
              <span>إعدادات النظام والخصوصية الفعالة</span>
            </h3>
            <p className="text-[11px] text-zinc-400 leading-relaxed font-normal text-right">
              {isAr
                ? "المنصة تعمل بنظام التشغيل الحر (Public mode). تم إغلاق وحذف كافة سجلات قواعد البيانات المرتبطة بالحسابات، الفواتير، ونظام Stripe. جميع الزوار يحصلون على تحويل تيك توك وسيناريوهات يوتيوب غير محدودة وبسرعة استثنائية."
                : "Platform runs in account-less Free Public Mode. All relational tables for billing, payments, and subscriptions are purged. Visitors get unlimited, proxy-speed TikTok content and high-quality Gemini copywriting calendars."}
            </p>
          </div>

        </div>
      )}

      {selectedTab === "ads" && (
        <div className="space-y-6" id="ads-management-tab">
          <h3 className="text-lg font-black text-white">{t.zoneHeading}</h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* List of ad places */}
            <div className="lg:col-span-1 space-y-6">
              
              {/* SECTION A: Vertical Sidebar Ads */}
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-zinc-850 pb-2">
                  <span className="text-[9px] px-2 py-0.5 rounded bg-red-500/10 text-red-400 font-extrabold font-mono tracking-wider">NEW SKY-BANNER</span>
                  <h4 className="text-xs font-black text-zinc-400 uppercase">
                    {isAr ? "إعدادات إعلانات الأعمدة الجانبية" : "Vertical Sidebar Ads Settings"}
                  </h4>
                </div>

                <div className="space-y-2.5">
                  {ads.filter((ad: any) => ad.id === "sidebar_right" || ad.id === "sidebar_left").map((ad: any) => {
                    const isSelected = editingAdId === ad.id;
                    return (
                      <div
                        key={ad.id}
                        onClick={() => handleSelectAdZone(ad)}
                        className={`p-4 rounded-2xl border transition-all cursor-pointer text-right space-y-2 relative overflow-hidden group ${isSelected ? "bg-red-950/20 border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.2)]" : "bg-zinc-950/40 border-zinc-850 hover:border-zinc-800"}`}
                      >
                        {/* Accent visual strip on active */}
                        <div className={`absolute left-0 inset-y-0 w-1 ${ad.enabled ? "bg-emerald-500" : "bg-zinc-700"}`} />
                        
                        <div className="flex items-center justify-between">
                          <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded uppercase ${ad.enabled ? "bg-emerald-500/15 text-emerald-400" : "bg-zinc-800 text-zinc-500"}`}>
                            {ad.enabled ? "ON" : "OFF"}
                          </span>
                          <h4 className="font-black text-xs text-white group-hover:text-red-400 transition-colors">
                            {isAr 
                              ? (ad.id === "sidebar_right" ? "إعدادات إعلان العمود الأيمن" : "إعدادات إعلان العمود الأيسر")
                              : ad.name}
                          </h4>
                        </div>
                        <div className="flex justify-between items-center text-[10px] text-zinc-500 select-none">
                          <span className="font-mono">{ad.stats.clicks} Clicks</span>
                          <span className="font-mono">{ad.stats.views} Views</span>
                        </div>
                        <div className="pt-1.5 border-t border-zinc-900/50 flex flex-wrap gap-1.5 justify-end">
                          <span className="text-[9px] bg-red-950/20 text-red-500 font-extrabold border border-red-500/10 px-2 py-0.5 rounded-md font-mono">
                            {isAr ? "المقاس:" : "Size:"} {isAr ? getAdRecommendedSizeInfo(ad.id).size : getAdRecommendedSizeInfo(ad.id).sizeEn}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* SECTION B: General Content Ads */}
              <div className="space-y-3">
                <div className="border-b border-zinc-850 pb-2">
                  <h4 className="text-xs font-black text-zinc-400 uppercase text-right">
                    {isAr ? "باقي أقسام ومناطق الإعلانات" : "Standard Placements (6 Zones)"}
                  </h4>
                </div>

                <div className="space-y-2.5">
                  {ads.filter((ad: any) => ad.id !== "sidebar_right" && ad.id !== "sidebar_left").map((ad: any) => {
                    const isSelected = editingAdId === ad.id;
                    return (
                      <div
                        key={ad.id}
                        onClick={() => handleSelectAdZone(ad)}
                        className={`p-3.5 rounded-2xl border transition-all cursor-pointer text-right space-y-2 ${isSelected ? "bg-red-950/10 border-red-500" : "bg-zinc-950/40 border-zinc-850 hover:border-zinc-800"}`}
                      >
                        <div className="flex items-center justify-between">
                          <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded uppercase ${ad.enabled ? "bg-emerald-500/15 text-emerald-400" : "bg-zinc-800 text-zinc-500"}`}>
                            {ad.enabled ? "ON" : "OFF"}
                          </span>
                          <h4 className="font-bold text-[11px] text-zinc-350">
                            {isAr ? ad.nameAr : ad.name}
                          </h4>
                        </div>
                        <div className="flex justify-between items-center text-[9px] text-zinc-650 font-mono select-none">
                          <span>{ad.stats.clicks} Clicks</span>
                          <span>{ad.stats.views} Views</span>
                        </div>
                        <div className="pt-1.5 border-t border-zinc-900/40 flex flex-wrap gap-1.5 justify-end font-sans">
                          <span className="text-[9px] bg-red-950/20 text-red-500 font-extrabold border border-red-500/10 px-2 py-0.5 rounded-md font-mono">
                            {isAr ? "المقاس:" : "Size:"} {isAr ? getAdRecommendedSizeInfo(ad.id).size : getAdRecommendedSizeInfo(ad.id).sizeEn}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>

            {/* Editing Box */}
            <div className="lg:col-span-2">
              <AnimatePresence mode="wait">
                {editingAdId ? (
                  <motion.form
                    key={editingAdId}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    onSubmit={handleSaveAd}
                    className="p-6 bg-zinc-950/40 border border-zinc-850 rounded-3xl space-y-5 text-right"
                  >
                    <h3 className="text-md font-bold text-white border-b border-zinc-850 pb-3">
                      {t.editAdZone} - [{editingAdId}]
                    </h3>

                    {/* Dynamic Ad Size Recommendation Banner */}
                    <div className="p-4 bg-zinc-900/60 border border-zinc-800 rounded-2xl text-right space-y-3 font-sans">
                      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800/40 pb-2">
                        <span className="text-[10px] bg-red-500/10 border border-red-500/20 text-red-500 font-extrabold px-2.5 py-1 rounded-lg uppercase tracking-wider">
                          {isAr ? "المقاس الموصى به" : "RECOMMENDED SIZE"}
                        </span>
                        <span className="text-sm font-black text-white font-mono select-all">
                          {isAr ? getAdRecommendedSizeInfo(editingAdId).size : getAdRecommendedSizeInfo(editingAdId).sizeEn}
                        </span>
                      </div>
                      <div className="flex flex-col md:flex-row-reverse justify-between items-start md:items-center gap-2 text-[11px] text-zinc-400">
                        <span className="text-[10px] text-red-400 bg-red-950/15 border border-red-500/10 px-2 py-0.5 rounded font-mono font-bold">
                          [{isAr ? getAdRecommendedSizeInfo(editingAdId).type : getAdRecommendedSizeInfo(editingAdId).typeEn}]
                        </span>
                        <p className="font-semibold text-zinc-300">
                          {isAr ? getAdRecommendedSizeInfo(editingAdId).desc : getAdRecommendedSizeInfo(editingAdId).descEn}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Toggle */}
                      <div className="space-y-2">
                        <label className="text-[10px] text-zinc-500 font-bold uppercase block">{isAr ? "حالة التمكين" : "Status Enabled"}</label>
                        <div className="flex justify-end pt-1">
                          <label className="relative inline-flex items-center cursor-pointer select-none">
                            <input
                              type="checkbox"
                              checked={adForm.enabled}
                              onChange={(e) => setAdForm({ ...adForm, enabled: e.target.checked })}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:right-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                          </label>
                        </div>
                      </div>

                      {/* Type Selection */}
                      <div className="space-y-2">
                        <label className="text-[10px] text-zinc-500 font-bold uppercase block">{isAr ? "نوع الإعلان" : "Ad Unit Type"}</label>
                        <select
                          value={adForm.type}
                          onChange={(e) => setAdForm({ ...adForm, type: e.target.value })}
                          className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-xs font-bold text-white focus:outline-none focus:border-red-500"
                        >
                          <option value="google_adsense">Google AdSense</option>
                          <option value="medianet">Media.net Ads</option>
                          <option value="banner">Standard Banners</option>
                          <option value="affiliate">Affiliate Link Offer</option>
                          <option value="custom_html">Custom Raw HTML / CSS</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-4 pt-2">
                      <div className="space-y-1.5">
                        <label className="text-[10px] text-zinc-500 font-bold uppercase block">{isAr ? "العنوان أو العنوان الفرعي للراعي" : "Sponsor/Affiliate Title Header"}</label>
                        <input
                          type="text"
                          value={adForm.title}
                          onChange={(e) => setAdForm({ ...adForm, title: e.target.value })}
                          className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-white focus:outline-none"
                          placeholder="e.g. Try Canva Pro for Content editing"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-[10px] text-zinc-500 font-bold uppercase block">{isAr ? "رابط الإحالة / التوجيه" : "Destination Referral Link"}</label>
                          <input
                            type="text"
                            value={adForm.link}
                            onChange={(e) => setAdForm({ ...adForm, link: e.target.value })}
                            className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-white focus:outline-none text-left"
                            placeholder="https://partner.com?id=tiktube"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[10px] text-zinc-500 font-bold uppercase block">{isAr ? "رابط الصورة أو الشعار" : "Sponsor Asset Image URL"}</label>
                          <input
                            type="text"
                            value={adForm.imageUrl}
                            onChange={(e) => setAdForm({ ...adForm, imageUrl: e.target.value })}
                            className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-white focus:outline-none text-left"
                            placeholder="https://images.com/banner.png"
                          />
                        </div>
                      </div>

                      {/* Google AdSense Credentials */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-zinc-900/40 pt-3">
                        <div className="space-y-1.5">
                          <label className="text-[10px] text-zinc-500 font-bold uppercase block">
                            {isAr ? "رقم معرف الناشر (Publisher ID)" : "Google Publisher ID"}
                          </label>
                          <input
                            type="text"
                            value={adForm.publisherId || ""}
                            onChange={(e) => setAdForm({ ...adForm, publisherId: e.target.value })}
                            className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-white focus:outline-none text-left"
                            placeholder="ca-pub-XXXXXXXXXXXXXXXX"
                          />
                          <p className="text-[9px] text-zinc-500/80 text-right">مثال: ca-pub-1234567890123456</p>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[10px] text-zinc-500 font-bold uppercase block">
                            {isAr ? "رقم فتحة الإعلان (Ad Slot ID)" : "Ad Slot ID"}
                          </label>
                          <input
                            type="text"
                            value={adForm.adSlotId || ""}
                            onChange={(e) => setAdForm({ ...adForm, adSlotId: e.target.value })}
                            className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-white focus:outline-none text-left"
                            placeholder="1234567890"
                          />
                          <p className="text-[9px] text-zinc-500/80 text-right">مثال: 9876543210</p>
                        </div>
                      </div>

                      {/* Scheduling */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-[10px] text-zinc-500 font-bold uppercase block">{isAr ? "جدولة الظهور: تاريخ البدء" : "Scheduling: Start Date"}</label>
                          <input
                            type="date"
                            value={adForm.scheduleStart}
                            onChange={(e) => setAdForm({ ...adForm, scheduleStart: e.target.value })}
                            className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-white focus:outline-none"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[10px] text-zinc-500 font-bold uppercase block">{isAr ? "جدولة الظهور: تاريخ الانتهاء" : "Scheduling: End Date"}</label>
                          <input
                            type="date"
                            value={adForm.scheduleEnd}
                            onChange={(e) => setAdForm({ ...adForm, scheduleEnd: e.target.value })}
                            className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-white focus:outline-none"
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] text-zinc-500 font-bold uppercase block">{isAr ? "شفرة الإعلان (Ad Code / raw HTML / script)" : "Creative Banner Code / Raw HTML / AdSense Script"}</label>
                        <textarea
                          rows={4}
                          value={adForm.code}
                          onChange={(e) => setAdForm({ ...adForm, code: e.target.value })}
                          className="w-full p-3 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-red-500 text-left"
                          placeholder="<div class='custom'>...</div> or Google AdSense script"
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-3 justify-end pt-4 border-t border-zinc-850">
                      <button
                        type="button"
                        onClick={() => setEditingAdId(null)}
                        className="px-4 py-2 text-xs font-bold bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white rounded-lg cursor-pointer"
                      >
                        {t.cancel}
                      </button>
                      <button
                        type="submit"
                        disabled={loading}
                        className="px-5 py-2 text-xs font-bold bg-red-650 hover:bg-red-600 bg-red-600 text-white rounded-lg flex items-center gap-1.5 cursor-pointer"
                      >
                        {loading && <RefreshCw className="h-3.5 w-3.5 animate-spin" />}
                        <span>{t.saveAd}</span>
                      </button>
                    </div>

                  </motion.form>
                ) : (
                  <div className="h-full py-24 border border-dashed border-zinc-850 rounded-3xl flex flex-col items-center justify-center gap-3 bg-zinc-900/10">
                    <Sliders className="h-10 w-10 text-zinc-600" />
                    <p className="text-xs text-zinc-400 font-medium">
                      {isAr ? "اختر منطقة إعلانية للتحكم بمحتواها المعروض من لوحة المسودة" : "Select an active zone card on the left panel to begin setting up."}
                    </p>
                  </div>
                )}
              </AnimatePresence>
            </div>

          </div>
        </div>
      )}

      {selectedTab === "blog" && (
        <div className="space-y-6" id="blog-management-tab">
          
          <div className="flex items-center justify-between border-b border-zinc-850 pb-3">
            <button
              onClick={handleStartAddPost}
              className="px-4 py-2 rounded-xl bg-red-650 hover:bg-red-600 bg-red-600 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>{isAr ? "تدوين مقالة إبداعية جديدة" : "Write Creator Guide"}</span>
            </button>
            <h3 className="text-lg font-black text-white">{isAr ? "إدارة مدونة صناع المحتوى" : "SaaS Creative Blog Index"}</h3>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* List of articles */}
            <div className="lg:col-span-1 space-y-3">
              {blogPosts.map((post: any) => (
                <div key={post.id} className="p-4 bg-zinc-950/40 border border-zinc-850 rounded-2xl flex flex-col justify-between gap-3 text-right">
                  <div className="space-y-1.5">
                    <h4 className="font-extrabold text-xs text-white overflow-hidden text-ellipsis whitespace-nowrap">
                      {isAr ? post.titleAr : post.title}
                    </h4>
                    <p className="text-[10px] text-zinc-500 font-mono flex items-center justify-end gap-1 select-none">
                      <span>{post.date}</span>
                      <Calendar className="h-3 w-3" />
                    </p>
                  </div>
                  <div className="flex items-center gap-2 pt-2 border-t border-zinc-900 justify-end">
                    <button
                      onClick={() => handleDeletePost(post.id)}
                      className={`p-1.5 transition-all flex items-center gap-1 rounded-lg cursor-pointer ${
                        deleteConfirmId === post.id
                          ? "text-white bg-red-700 animate-pulse font-bold text-[10px] px-2.5 shadow-md shadow-red-900/30 border border-red-500"
                          : "text-zinc-500 hover:text-red-400 bg-zinc-900 border border-zinc-850"
                      }`}
                      title={deleteConfirmId === post.id ? (isAr ? "تأكيد الحذف النهائي" : "Confirm permanent delete") : (isAr ? "إزالة" : "Delete")}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      {deleteConfirmId === post.id && (
                        <span>{isAr ? "أكيد؟" : "Confirm?"}</span>
                      )}
                    </button>
                    <button
                      onClick={() => handleEditPost(post)}
                      className="p-1.5 text-zinc-500 hover:text-white bg-zinc-900 border border-zinc-850 rounded-lg cursor-pointer"
                      title="تعديل"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Editing post form */}
            <div className="lg:col-span-2">
              <AnimatePresence mode="wait">
                {(isAddingPost || editingPostId) ? (
                  <motion.form
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    onSubmit={handleSaveBlogPost}
                    className="p-6 bg-zinc-950/40 border border-zinc-850 rounded-3xl space-y-5 text-right font-sans"
                  >
                    <h4 className="text-sm font-bold text-white border-b border-zinc-850 pb-2">
                      {editingPostId ? (isAr ? "تعديل محتوى المقالة" : "Edit Digital Guide Article") : (isAr ? "تأليف مقال إرشادي" : "Syndicate New Blog Content")}
                    </h4>

                    {/* Bilingual Titles */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] text-zinc-500 font-bold block">{isAr ? "العنوان بالعربية" : "Title (Arabic)"}</label>
                        <input
                          type="text"
                          required
                          value={blogForm.titleAr}
                          onChange={(e) => setBlogForm({ ...blogForm, titleAr: e.target.value })}
                          className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-white focus:outline-none"
                          placeholder="مثال: كيف تصمم صورة مصغرة ترفع الـ CTR"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] text-zinc-500 font-bold block">{isAr ? "العنوان بالإنجليزية" : "Title (English)"}</label>
                        <input
                          type="text"
                          required
                          value={blogForm.title}
                          onChange={(e) => setBlogForm({ ...blogForm, title: e.target.value })}
                          className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-white focus:outline-none text-left"
                          placeholder="e.g. Design High CTR Thumbnails"
                        />
                      </div>
                    </div>

                    {/* Excerpts */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] text-zinc-500 font-bold block">{isAr ? "مقتطف سريع (بالعربية)" : "Excerpt (Arabic)"}</label>
                        <textarea
                          rows={2}
                          value={blogForm.excerptAr}
                          onChange={(e) => setBlogForm({ ...blogForm, excerptAr: e.target.value })}
                          className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-white focus:outline-none"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] text-zinc-500 font-bold block">{isAr ? "مقتطف سريع (بالإنجليزية)" : "Excerpt (English)"}</label>
                        <textarea
                          rows={2}
                          value={blogForm.excerpt}
                          onChange={(e) => setBlogForm({ ...blogForm, excerpt: e.target.value })}
                          className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-white focus:outline-none text-left"
                        />
                      </div>
                    </div>

                    {/* Metadata fields */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] text-zinc-500 font-bold block">{isAr ? "الكاتب" : "Author Name (English)"}</label>
                        <input
                          type="text"
                          value={blogForm.author}
                          onChange={(e) => setBlogForm({ ...blogForm, author: e.target.value })}
                          className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-white focus:outline-none text-left"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] text-zinc-500 font-bold block">{isAr ? "اسم الكاتب بالعربية" : "Author Name (Arabic)"}</label>
                        <input
                          type="text"
                          value={blogForm.authorAr}
                          onChange={(e) => setBlogForm({ ...blogForm, authorAr: e.target.value })}
                          className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-white focus:outline-none"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] text-zinc-500 font-bold block">{isAr ? "الوسوم (مفصولة بفواصل)" : "Tags (comma separated)"}</label>
                        <input
                          type="text"
                          value={blogForm.tags}
                          onChange={(e) => setBlogForm({ ...blogForm, tags: e.target.value })}
                          className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-white focus:outline-none"
                          placeholder="YouTube, CTR, Tips"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-1.5 md:col-span-2">
                        <label className="text-[10px] text-zinc-500 font-bold block">{isAr ? "رابط صورة غلاف المقالة" : "Cover Asset Banner URL"}</label>
                        <input
                          type="text"
                          value={blogForm.bannerUrl}
                          onChange={(e) => setBlogForm({ ...blogForm, bannerUrl: e.target.value })}
                          className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-white focus:outline-none text-left"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] text-zinc-500 font-bold block">{isAr ? "زمن القراءة المقدر" : "Estimated Read Time"}</label>
                        <input
                          type="text"
                          value={blogForm.readTime}
                          onChange={(e) => setBlogForm({ ...blogForm, readTime: e.target.value })}
                          className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-white focus:outline-none text-left"
                        />
                      </div>
                    </div>

                    {/* Bilingual Contents */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] text-zinc-500 font-bold block">{isAr ? "محتوى المقالة بالعربية" : "Article Body Content (Arabic)"}</label>
                      <textarea
                        rows={8}
                        required
                        value={blogForm.contentAr}
                        onChange={(e) => setBlogForm({ ...blogForm, contentAr: e.target.value })}
                        className="w-full p-3 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white focus:outline-none focus:border-red-500"
                        placeholder="اكتب تفاصيل مقالك هنا..."
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] text-zinc-500 font-bold block">{isAr ? "محتوى المقالة بالإنجليزية" : "Article Body Content (English)"}</label>
                      <textarea
                        rows={8}
                        required
                        value={blogForm.content}
                        onChange={(e) => setBlogForm({ ...blogForm, content: e.target.value })}
                        className="w-full p-3 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white text-left focus:outline-none focus:border-red-500"
                        placeholder="Write English text copy of the guide..."
                      />
                    </div>

                    <div className="flex items-center gap-3 justify-end pt-4 border-t border-zinc-850">
                      <button
                        type="button"
                        onClick={() => { setIsAddingPost(false); setEditingPostId(null); }}
                        className="px-4 py-2 text-xs font-bold bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white rounded-lg cursor-pointer"
                      >
                        {t.cancel}
                      </button>
                      <button
                        type="submit"
                        disabled={loading}
                        className="px-5 py-2 text-xs font-bold bg-red-650 hover:bg-red-600 bg-red-600 text-white rounded-lg flex items-center gap-1.5 cursor-pointer"
                      >
                        {loading && <RefreshCw className="h-3.5 w-3.5 animate-spin" />}
                        <span>{isAr ? "نشر التدوينة الآن" : "Publish to Public Feed"}</span>
                      </button>
                    </div>

                  </motion.form>
                ) : (
                  <div className="h-full py-24 border border-dashed border-zinc-850 rounded-3xl flex flex-col items-center justify-center gap-3 bg-zinc-900/10">
                    <FileText className="h-10 w-10 text-zinc-600" />
                    <p className="text-xs text-zinc-400 font-medium">
                      {isAr ? "اختر مقالة للتعديل أو اضغط على تدوين مقالة جديدة لبدء الإدراج الفوري للمحتوى." : "Select an existing article card on the left panel, or click write new to begin."}
                    </p>
                  </div>
                )}
              </AnimatePresence>
            </div>

          </div>

        </div>
      )}

      {selectedTab === "wordpress" && (
        <div className="p-6 bg-zinc-950/40 border border-zinc-850 rounded-3xl space-y-8 text-right" id="wordpress-integration-layer-panel">
          <div className="flex flex-col md:flex-row-reverse justify-between items-start gap-4 pb-4 border-b border-zinc-850/60">
            <div>
              <h3 className="text-lg font-black text-white">طبقة التكامل مع ووردبريس والمواقع الصديقة (WordPress Integration Studio)</h3>
              <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                {isAr 
                  ? "قم بفحص ومكاملة خادم TikTube Tools للاتصال التلقائي عالي الأداء بمدونات WordPress ومواقع الويب المتوافقة." 
                  : "Connect and syndicate with compatible WordPress sites using direct REST queries and secure synchronization endpoints."}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleTestWpConnection}
                disabled={wpConnStatus === "testing"}
                className="px-3.5 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs font-bold hover:bg-zinc-850 hover:text-white transition-all text-zinc-300 disabled:opacity-50 flex items-center gap-2 cursor-pointer"
              >
                <span>{wpConnStatus === "testing" ? (isAr ? "جاري الفحص..." : "Testing...") : (isAr ? "فحص الاتصال" : "Test Connection")}</span>
              </button>
              <button
                onClick={handlePullWpSync}
                disabled={wpSyncing}
                className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-red-650 to-red-500 text-xs font-bold hover:opacity-90 transition-all text-white disabled:opacity-50 flex items-center gap-2 cursor-pointer"
              >
                <span>{wpSyncing ? (isAr ? "جاري المزامنة..." : "Syncing...") : (isAr ? "مزامنة المقالات الآن" : "Sync Posts Now")}</span>
              </button>
            </div>
          </div>

          {/* Connection diagnostics display bar */}
          {(wpConnStatus !== "idle" || wpSyncMessage) && (
            <div className="p-5 rounded-2xl bg-zinc-900/10 border border-zinc-850 space-y-3">
              <h4 className="text-xs font-extrabold text-white">{isAr ? "نتائج التشخيص والعمليات" : "Connectivity Diagnostics & Activity"}</h4>
              
              {/* Connection Status Box */}
              {wpConnStatus !== "idle" && (
                <div className={`p-3 rounded-xl text-xs flex flex-col gap-1.5 ${
                  wpConnStatus === "testing" 
                    ? "bg-zinc-900 border border-zinc-800 text-zinc-400" 
                    : wpConnStatus === "success"
                      ? "bg-emerald-500/5 border border-emerald-500/15 text-emerald-400"
                      : "bg-red-500/5 border border-red-500/15 text-red-400"
                }`}>
                  <div className="flex flex-row-reverse justify-between font-bold">
                    <span>{isAr ? "حالة الاتصال بالـ REST API:" : "REST API Connection Status:"}</span>
                    <span className="uppercase font-mono">[{wpConnStatus}]</span>
                  </div>
                  <p className="font-semibold">{wpConnMessage}</p>
                  {wpConnDetail && (
                    <div className="mt-2 p-2 rounded bg-black/40 text-left font-mono text-[10px] text-zinc-500 overflow-x-auto whitespace-pre">
                      {wpConnDetail}
                    </div>
                  )}
                </div>
              )}

              {/* Sync Status Box */}
              {wpSyncMessage && (
                <div className="p-3 bg-red-500/5 border border-red-500/15 rounded-xl text-xs text-red-400 flex flex-col gap-1">
                  <div className="flex flex-row-reverse justify-between font-bold">
                    <span>{isAr ? "نتيجة مزامنة المقالات الحية:" : "Active Blog Synchronization Result:"}</span>
                    <span className="uppercase font-mono">{wpSyncing ? "..." : "[DONE]"}</span>
                  </div>
                  <p className="font-semibold">{wpSyncMessage}</p>
                </div>
              )}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Quick Webhook API */}
            <div className="p-5 rounded-2xl bg-zinc-900/30 border border-zinc-850 space-y-4">
              <h4 className="font-extrabold text-xs text-white flex items-center gap-1.5 justify-end">
                <span>تزامن إعلانات المدونة واللافتات (Banners dynamic JSON API)</span>
                <Link className="h-4 w-4 text-red-500" />
              </h4>

              <div className="space-y-1">
                <span className="text-[10px] text-zinc-500 font-extrabold font-mono uppercase block">{isAr ? "رابط الاستعلام لجلب الإعلانات" : "GET Ads configuration end-point"}</span>
                <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-800 text-left text-[11px] font-mono text-zinc-300 flex items-center justify-between gap-3">
                  <button
                    onClick={() => triggerCopy(`${window.location.origin}/api/ads/config`, "ads-api")}
                    className="p-1 rounded bg-zinc-900 border border-zinc-800 font-sans font-bold hover:text-white transition-all text-[9px] cursor-pointer"
                  >
                    {copiedCode === "ads-api" ? "Copied!" : "Copy URL"}
                  </button>
                  <span className="overflow-hidden text-ellipsis whitespace-nowrap">{window.location.origin}/api/ads/config</span>
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] text-zinc-500 font-extrabold font-mono uppercase block">{isAr ? "رابط الاستعلام لجلب المقالات" : "GET Blogposts dynamic feed URL"}</span>
                <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-800 text-left text-[11px] font-mono text-zinc-300 flex items-center justify-between gap-3">
                  <button
                    onClick={() => triggerCopy(`${window.location.origin}/api/blog`, "blog-api")}
                    className="p-1 rounded bg-zinc-900 border border-zinc-800 font-sans font-bold hover:text-white transition-all text-[9px] cursor-pointer"
                  >
                    {copiedCode === "blog-api" ? "Copied!" : "Copy URL"}
                  </button>
                  <span className="overflow-hidden text-ellipsis whitespace-nowrap">{window.location.origin}/api/blog</span>
                </div>
              </div>
            </div>

            {/* Embed instructions */}
            <div className="p-5 rounded-2xl bg-zinc-900/30 border border-zinc-850 space-y-4">
              <h4 className="font-extrabold text-xs text-white flex items-center gap-1.5 justify-end">
                <span>دمج الأدوات في WordPress IFrame Widget</span>
                <Laptop className="h-4 w-4 text-amber-500" />
              </h4>

              <div className="space-y-1">
                <span className="text-[10px] text-zinc-500 font-semibold block">{isAr ? "كود تضمين الأدوات مباشرة في مشاركات ووردبريس" : "Copy-paste Iframe widget inside WordPress Classic Editor / Gutenberg HTML Block"}</span>
                <textarea
                  readOnly
                  rows={4}
                  className="w-full p-2 bg-zinc-950 border border-zinc-800 text-left font-mono rounded-xl text-[10px] text-zinc-400 select-all"
                  value={`<iframe \n  src="${window.location.origin}/?tab=tools" \n  width="100%" \n  height="750px" \n  style="border:none; border-radius:16px; background:#09090b;">\n</iframe>`}
                />
              </div>

              <div className="p-3 rounded-lg bg-amber-500/5 text-amber-400 text-[10px] leading-relaxed border border-amber-500/10">
                {isAr 
                  ? "تلميح: الأدوات في وضع التضمين متوافقة 100% مع الهواتف المحمولة وتتكيف مع الوضع المظلم المحيط بصفحة ووردبريس تلقائياً لتجربة مبهرة."
                  : "Tip: Embedded tools automatically scale, adjust colors with seamless dark aesthetics, and preserve responsive aspect behaviors on mobile displays."}
              </div>
            </div>
          </div>

        </div>
      )}

      {selectedTab === "identity" && (
        <div className="space-y-8 text-right" id="site-identity-corporate-settings-layer">
          
          {/* Header Description */}
          <div className="p-6 bg-zinc-950/40 border border-zinc-850 rounded-3xl">
            <h3 className="text-lg font-black text-white flex items-center gap-2 justify-end">
              <span>إعدادات الهوية العامة والمظهر (Site Identity & Global Footer Banners)</span>
            </h3>
            <p className="text-xs text-zinc-400 mt-1.5 leading-relaxed">
              {isAr 
                ? "تتيح لك هذه القائمة تحديث شعار الموقع والأيقونة المفضلة (Favicon) بلمسة زر واحدة، إلى جانب تخصيص تذييل الموقع باللغتين العربية والإنجليزية لدعم الشفرات ومحركات البحث باحترافية كاملة."
                : "Manage company brands, global page footer copy, search index metadata parameters, and direct tracker tag elements dynamically from the database settings."}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* COLUMN 1: Visual Branding Assets (Logo & Favicon Upload Form) */}
            <div className="p-6 bg-zinc-950/40 border border-zinc-850 rounded-3xl space-y-6">
              <h4 className="text-sm font-black text-white border-b border-zinc-850 pb-3">
                {isAr ? "تحميل أصول الهوية البصرية" : "Corporate Visual Branding Assets"}
              </h4>

              {/* Logo Upload Section */}
              <div className="space-y-3">
                <label className="block text-xs font-bold text-zinc-300" htmlFor="logo-image-file-input">
                  {isAr ? "شعار الموقع الحالي (Logo - PNG / JPG / SVG)" : "Site Primary Logo"}
                </label>
                
                {/* Drag / Drop / Select area */}
                <div className="flex items-center gap-4 flex-row-reverse">
                  <div className="flex-1">
                    <div className="border border-dashed border-zinc-850 bg-zinc-950 rounded-2xl p-4 text-center hover:border-zinc-700 transition-all cursor-pointer relative group">
                      <input 
                        type="file" 
                        accept="image/*"
                        onChange={handleLogoFileChange}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                        id="logo-image-file-input"
                      />
                      <p className="text-xs font-semibold text-zinc-400 group-hover:text-red-400 transition-colors">
                        {isAr ? "اسحب وأسقط الشعار أو انقر للرفع" : "Drag and drop or select logo image"}
                      </p>
                      <p className="text-[10px] text-zinc-500 mt-1">PNG, JPG, SVG - max width 350px</p>
                    </div>
                  </div>

                  {/* Preview container */}
                  <div className="w-24 h-20 bg-zinc-950 rounded-2xl border border-zinc-850 flex items-center justify-center p-2 relative overflow-hidden">
                    {logoPreview ? (
                      <img 
                        src={logoPreview} 
                        alt="Logo Brand" 
                        className="max-w-full max-h-full object-contain"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <span className="text-[10px] text-zinc-600 font-mono text-center">{isAr ? "لا يوجد شعار" : "No Logo"}</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Favicon Upload Section */}
              <div className="space-y-3">
                <label className="block text-xs font-bold text-zinc-300" htmlFor="favicon-image-file-input">
                  {isAr ? "أيقونة المفضلة للمتصفح (Favicon - ICO / PNG)" : "Browser Page Favicon"}
                </label>

                {/* Drag / Drop / Select area */}
                <div className="flex items-center gap-4 flex-row-reverse">
                  <div className="flex-1">
                    <div className="border border-dashed border-zinc-850 bg-zinc-950 rounded-2xl p-4 text-center hover:border-zinc-700 transition-all cursor-pointer relative group">
                      <input 
                        type="file" 
                        accept="image/png, image/x-icon, image/ico, image/vnd.microsoft.icon"
                        onChange={handleFaviconFileChange}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                        id="favicon-image-file-input"
                      />
                      <p className="text-xs font-semibold text-zinc-400 group-hover:text-red-400 transition-colors">
                        {isAr ? "اسحب وأسقط الأيقونة أو انقر للتصفح" : "Drag & drop file or browse icon"}
                      </p>
                      <p className="text-[10px] text-zinc-500 mt-1">PNG, ICO - recommended 32x32px or 64x64px</p>
                    </div>
                  </div>

                  {/* Preview container */}
                  <div className="w-20 h-20 bg-zinc-950 rounded-2xl border border-zinc-850 flex items-center justify-center p-2 relative">
                    {faviconPreview ? (
                      <img 
                        src={faviconPreview} 
                        alt="Favicon Brand" 
                        className="w-10 h-10 object-contain"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <span className="text-[10px] text-zinc-600 font-mono text-center">{isAr ? "افتراضي" : "Default"}</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Clear feedback error banner if any */}
              {saveError && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-xs font-bold text-center leading-relaxed">
                  {saveError}
                </div>
              )}

              {/* Action Operations Bar */}
              <div className="pt-4 border-t border-zinc-850/60 flex items-center justify-between gap-4">
                <button
                  type="button"
                  onClick={handleResetIdentity}
                  disabled={savingIdentity}
                  className="px-4 py-2 text-xs font-bold text-zinc-400 hover:text-white bg-zinc-900 border border-zinc-850 rounded-xl hover:bg-zinc-850 transition-all cursor-pointer shadow-sm disabled:opacity-50"
                >
                  {isAr ? "إعادة التعيين للافتراضي" : "Reset to Default Presets"}
                </button>

                <button
                  type="button"
                  onClick={handleSaveIdentity}
                  disabled={savingIdentity}
                  className="px-6 py-2 rounded-xl bg-gradient-to-r from-red-650 to-red-500 text-xs font-extrabold hover:brightness-110 active:scale-95 text-white shadow-[0_8px_24px_-8px_rgba(239,68,68,0.4)] transition-all cursor-pointer disabled:opacity-50 flex items-center gap-1.5 animate-pulse-subtle"
                >
                  {savingIdentity ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white/35 border-t-white rounded-full animate-spin" />
                      <span>{isAr ? "جاري الحفظ والرفع..." : "Saving & Uploading..."}</span>
                    </>
                  ) : (
                    <>
                      <span>{isAr ? "حفظ التغييرات وتطبيقها" : "Save General Settings"}</span>
                    </>
                  )}
                </button>
              </div>

            </div>

            {/* COLUMN 2: Footer Settings, Social bios and Custom HTML */}
            <div className="p-6 bg-zinc-950/40 border border-zinc-850 rounded-3xl space-y-6">
              <h4 className="text-sm font-black text-white border-b border-zinc-850 pb-3">
                {isAr ? "إعدادات ومعلومات تذييل الموقع (Footer Text & Bio Controls)" : "Global Footer Content & Metadata Settings"}
              </h4>

              {/* Arabic Bio field */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-zinc-300">
                  {isAr ? "نبذة الفوتر باللغة العربية" : "Footer Bio Info (Arabic)"}
                </label>
                <textarea
                  rows={2}
                  value={identitySettings.footerBioAr || ""}
                  onChange={(e) => setIdentitySettings({ ...identitySettings, footerBioAr: e.target.value })}
                  placeholder="صندوق أدوات صناع السينما وصناع المحتوى..."
                  className="w-full text-xs p-3 bg-zinc-950 rounded-xl border border-zinc-850 text-right text-zinc-300 focus:border-red-500/60 focus:ring-1 focus:ring-red-500/60 focus:outline-none"
                />
              </div>

              {/* English Bio field */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-zinc-300">
                  {isAr ? "نبذة الفوتر باللغة الإنجليزية" : "Footer Bio Info (English)"}
                </label>
                <textarea
                  rows={2}
                  value={identitySettings.footerBioEn || ""}
                  onChange={(e) => setIdentitySettings({ ...identitySettings, footerBioEn: e.target.value })}
                  placeholder="SaaS hub workspace designed to expand..."
                  className="w-full text-xs p-3 bg-zinc-950 rounded-xl border border-zinc-850 text-left text-zinc-300 focus:border-red-500/60 focus:ring-1 focus:ring-red-500/60 focus:outline-none"
                />
              </div>

              {/* Arabic & English Copyrights side-by-side */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-zinc-300">
                    {isAr ? "حقوق النشر (عربي)" : "Copyright Label (Arabic)"}
                  </label>
                  <input
                    type="text"
                    value={identitySettings.copyrightTextAr || ""}
                    onChange={(e) => setIdentitySettings({ ...identitySettings, copyrightTextAr: e.target.value })}
                    className="w-full text-xs p-3 bg-zinc-950 rounded-xl border border-zinc-850 text-right text-zinc-300 focus:border-red-500/60 focus:ring-1 focus:ring-red-500/60 focus:outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-zinc-300">
                    {isAr ? "حقوق النشر (إنجليزي)" : "Copyright Label (English)"}
                  </label>
                  <input
                    type="text"
                    value={identitySettings.copyrightTextEn || ""}
                    onChange={(e) => setIdentitySettings({ ...identitySettings, copyrightTextEn: e.target.value })}
                    className="w-full text-xs p-3 bg-zinc-950 rounded-xl border border-zinc-850 text-left text-zinc-300 focus:border-red-500/60 focus:ring-1 focus:ring-red-500/60 focus:outline-none"
                  />
                </div>
              </div>

              {/* Custom Raw HTML blocks editor */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-zinc-300">
                  {isAr ? "شفرة تتبع أو روابط تذييل مخصصة (Custom HTML / Scripts Codes)" : "Custom raw footer block markup HTML/JS Tracker Codes"}
                </label>
                <textarea
                  rows={3}
                  value={identitySettings.footerHtml || ""}
                  onChange={(e) => setIdentitySettings({ ...identitySettings, footerHtml: e.target.value })}
                  placeholder="<!-- <a href='/custom-link' className='text-red-400'>My Custom Sponsor Link</a> -->"
                  className="w-full text-xs p-3 font-mono bg-zinc-950 rounded-xl border border-zinc-850 text-left text-zinc-400 focus:border-red-500/60 focus:ring-1 focus:ring-red-500/60 focus:outline-none"
                />
                <p className="text-[10px] text-zinc-500">
                  {isAr 
                    ? "ملاحظة: يمكنك إدراج شفرات HTML بسيطة أو روابط نصية مخصصة أو شفرات تتبع وسيتم دمجه بأمان في جميع صفحات المظهر للموقع."
                    : "Note: Custom raw markup and track codes will be safely integrated within the structural template."}
                </p>
              </div>

            </div>

          </div>

          {/* YouTube Bypass Cookies Panel */}
          <div className="p-6 bg-zinc-950/40 border border-zinc-850 rounded-3xl space-y-4">
            <div className="flex flex-col sm:flex-row-reverse items-start sm:items-center justify-between gap-2 border-b border-zinc-850 pb-3">
              <h4 className="text-sm font-black text-white flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                <span>{isAr ? "تخطي حظر وفحوصات روبوتات يوتيوب (YouTube Bot Bypass & Cookies)" : "YouTube Bypass & Cookies Engine"}</span>
              </h4>
              <span className="text-[10px] bg-zinc-900 border border-zinc-800 text-zinc-400 px-2.5 py-1 rounded font-mono font-bold select-none">
                Netscape Cookie File Format
              </span>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed text-right">
              {isAr 
                ? "إذا واجه خادم الموقع قيودًا أو خطأ يطلب تسجيل الدخول لتأكيد الهوية (Sign in to confirm you're not a bot) أثناء معالجة فيديوهات يوتيوب، قم بإنتاج وتصدير الكوكيز لحساب يوتيوب بصيغة Netscape (عبر إضافات المتصفح مثل 'Get cookies.txt LOCALLY' أثناء وجودك بصفحة يوتيوب) ثم الصق النص كاملاً هنا. سيستخدمه الخادم فوراً لإتمام طلبات yt-dlp ومطابقة المتصفح الشخصي لتجاوز القيود بنجاح وبشكل آمن تماماً."
                : "Should you encounter 'Sign in to confirm you're not a bot' error flags, use safe browser extensions to retrieve netscape cookies from youtube.com and paste the absolute text below. This enables server-side matching variables."}
            </p>
            <textarea
              rows={6}
              value={identitySettings.youtubeCookies || ""}
              onChange={(e) => setIdentitySettings({ ...identitySettings, youtubeCookies: e.target.value })}
              placeholder="# Netscape HTTP Cookie File..."
              className="w-full text-xs p-3 font-mono bg-zinc-950 rounded-xl border border-zinc-850 text-left text-zinc-300 focus:border-red-500/60 focus:ring-1 focus:ring-red-500/60 focus:outline-none"
            />
            <div className="flex flex-row-reverse justify-between items-center text-[10px] text-zinc-500">
              <span>{isAr ? "ملاحظة: للحفاظ على سلامة الحساب يفضل استخدام حساب تجريبي/مستقل لإنتاج ملف الكوكيز" : "Recommended: Keep dynamic files synced."}</span>
              <span className="font-mono">{identitySettings.youtubeCookies ? `${identitySettings.youtubeCookies.length} byte` : "Empty"}</span>
            </div>
          </div>

        </div>
      )}

      {selectedTab === "debug" && (
        <div id="debug-dashboard-tab" className="space-y-6">
          <DebugPage lang={lang} />
        </div>
      )}

    </div>
  );
}

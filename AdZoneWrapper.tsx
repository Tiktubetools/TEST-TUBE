import React, { useEffect, useState } from "react";
import { ExternalLink, Sparkles } from "lucide-react";
import { motion } from "motion/react";

/* =========================================================================
   1. TYPES & INTERFACES (SECTION 1)
   ========================================================================= */

export interface AdZone {
  id: string; // 'header_banner' | 'above_hero' | 'below_hero' | 'sidebar_left' | 'sidebar_right' | 'between_sections' | 'above_footer' | 'footer_banner'
  name: string;
  nameAr: string;
  enabled: boolean;
  code: string; // custom script or HTML string
  type: 'google_adsense' | 'medianet' | 'custom_html' | 'banner' | 'affiliate';
  title?: string;
  link?: string;
  imageUrl?: string;
  publisherId?: string; // Google Publisher ID (e.g., ca-pub-XXXX)
  adSlotId?: string;    // Ad Slot ID (e.g., 1234567890)
  scheduleStart?: string;
  scheduleEnd?: string;
  stats: {
    views: number;
    clicks: number;
  };
}

interface AdZoneWrapperProps {
  zoneId: string;
  lang: "ar" | "en";
  refreshTrigger?: number;
}


/* =========================================================================
   2. VALIDATION & LOGIC ENGINE (SECTION 2 - JAVASCRIPT)
   ========================================================================= */

/**
 * Validate that values do not contain dummy placeholders or template strings.
 * This prevents mock/demo IDs like "ca-pub-XXXX" or empty default configurations from showing up.
 */
export function isDummyOrPlaceholder(value?: string): boolean {
  if (!value) return true;
  const val = value.trim().toLowerCase();
  if (val === "") return true;
  if (
    val.includes("xxxx") || 
    val.includes("yyyy") || 
    val.includes("1234567") || 
    val.includes("placeholder") ||
    val === "ca-pub-xxxx" ||
    val === "data-ad-slot-xxxx" ||
    val === "#"
  ) {
    return true;
  }
  if (val.length < 3) return true;
  return false;
}

/**
 * Priority system logic calculator:
 * Priority 1: Ad Code (Ad Code / RAW HTML / Script)
 * Priority 2: Google AdSense / AdSense
 * Priority 3: Standard Banner (صورة + عنوان + رابط)
 * Priority 4: Hide (عدم عرض شيء إذا لا توجد بيانات)
 */
export function getActivePriority(ad: AdZone | null): 1 | 2 | 3 | 4 {
  if (!ad || !ad.enabled) {
    return 4; // Hide ad completamente
  }

  // 1. Ad Code Priority
  const hasAdCode = ad.code && !isDummyOrPlaceholder(ad.code) && ad.type === "custom_html";
  if (hasAdCode) {
    return 1;
  }

  // 2. Google AdSense / AdSense Priority
  const hasAdSense = 
    ad.publisherId && 
    ad.adSlotId && 
    !isDummyOrPlaceholder(ad.publisherId) && 
    !isDummyOrPlaceholder(ad.adSlotId);
  if (hasAdSense) {
    return 2;
  }

  // Fallback check: custom code can count as Priority 1 if specified in any field
  const hasAnyCodeForce = ad.code && !isDummyOrPlaceholder(ad.code) && ad.type !== "google_adsense";
  if (hasAnyCodeForce) {
    return 1;
  }

  // 3. Standard Banner Priority
  const hasTitle = ad.title && !isDummyOrPlaceholder(ad.title);
  const hasLink = ad.link && !isDummyOrPlaceholder(ad.link);
  const hasImage = ad.imageUrl && !isDummyOrPlaceholder(ad.imageUrl);
  if (hasTitle || hasLink || hasImage) {
    return 3;
  }

  // 4. Hide completely if empty database details
  return 4;
}


/* =========================================================================
   3. FORMATTING & TAILWIND DESIGN LAYOUTS (SECTION 3 - CSS classes map)
   ========================================================================= */

const ZONE_STYLING: Record<string, string> = {
  header_banner: "max-w-7xl py-2 bg-gradient-to-r from-red-600/10 via-zinc-900 to-amber-500/10 border-b border-zinc-800 text-center relative w-full mx-auto",
  above_hero: "max-w-4xl px-4 py-4 relative w-full mx-auto",
  below_hero: "max-w-4xl px-4 py-4 relative w-full mx-auto",
  above_footer: "max-w-4xl px-4 py-4 relative w-full mx-auto",
  between_sections: "max-w-5xl px-4 py-6 relative w-full mx-auto",
  footer_banner: "max-w-6xl px-4 py-3 bg-zinc-950/40 border-t border-zinc-900 relative w-full mx-auto",
  sidebar_left: "hidden xl:block w-[160px] sticky top-24 shrink-0 mx-3 self-start",
  sidebar_right: "hidden xl:block w-[160px] sticky top-24 shrink-0 mx-3 self-start"
};


/* =========================================================================
   4. PRESENTATION & SUB-COMPONENTS (SECTION 4 - JSX / HTML)
   ========================================================================= */

/**
 * Google AdSense Responsive Unit Component
 */
function AdSenseResponsiveUnit({ publisherId, adSlotId, isVertical = false }: { publisherId: string; adSlotId: string; isVertical?: boolean }) {
  useEffect(() => {
    // Dynamically inject the formal AdSense script directly to head
    const scriptSrc = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${publisherId}`;
    const existingScript = document.querySelector(`script[src*="adsbygoogle.js"]`);
    
    if (!existingScript) {
      const scriptElement = document.createElement("script");
      scriptElement.async = true;
      scriptElement.src = scriptSrc;
      scriptElement.crossOrigin = "anonymous";
      document.head.appendChild(scriptElement);
    }

    // Trigger standard Google AdSense render push loop
    try {
      ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
    } catch (e) {
      console.warn("Google AdSense auto-layout responsive error:", e);
    }
  }, [publisherId, adSlotId]);

  return (
    <div className="ads-adsense-responsive-container w-full overflow-hidden flex justify-center items-center py-5 px-3 bg-zinc-950/30 rounded-2xl border border-zinc-850">
      {/* AdSense Responsive Element */}
      <ins
        className="adsbygoogle"
        style={{ display: "block", minHeight: isVertical ? "450px" : "90px", width: "100%" }}
        data-ad-client={publisherId} // ca-pub-XXXX slot placement
        data-ad-slot={adSlotId}     // data-ad-slot ID placement
        data-ad-format={isVertical ? "vertical" : "auto"}
        data-full-width-responsive="true"
      />
    </div>
  );
}

/**
 * Vertical Standard Banner Component (Specifically for Sidebars)
 */
function VerticalStandardBannerUnit({
  ad,
  lang,
  onAdClick
}: {
  ad: AdZone;
  lang: "ar" | "en";
  onAdClick: () => void;
}) {
  const isAr = lang === "ar";
  const titleText = ad.title || (isAr ? "احصل على خدماتنا الاحترافية مجاناً" : "Professional Creative Suite Services");
  const hasImage = ad.imageUrl && !isDummyOrPlaceholder(ad.imageUrl);

  return (
    <motion.a
      href={ad.link || "#"}
      target="_blank"
      rel="noopener noreferrer"
      onClick={onAdClick}
      className="block group relative overflow-hidden rounded-2xl border border-zinc-800 bg-gradient-to-b from-zinc-900 via-zinc-950 to-zinc-900 hover:border-red-505/40 transition-all shadow-lg p-3.5 flex flex-col items-center justify-between gap-4 text-center w-full min-h-[350px] sm:min-h-[480px]"
      whileHover={{ scale: 1.015 }}
    >
      {/* Subtle colorful edge accent at top */}
      <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-red-650 via-red-500 to-amber-500" />
      
      <span className="text-[8px] font-bold text-zinc-400 tracking-wider uppercase font-mono px-2 py-0.5 bg-zinc-950 rounded-full border border-zinc-850 shadow-sm">
        {ad.type === "affiliate" ? (isAr ? "شريك موصى به" : "PARTNER") : (isAr ? "إعلان ممول" : "SPONSOR")}
      </span>

      <div className="flex flex-col items-center gap-3 w-full my-auto">
        {/* Skyscraper Banner Image */}
        {hasImage ? (
          <div className="w-full aspect-[4/5] rounded-xl bg-zinc-900 overflow-hidden border border-zinc-800 flex items-center justify-center relative shadow-inner">
            <img src={ad.imageUrl} alt={titleText} referrerPolicy="no-referrer" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />
          </div>
        ) : (
          <div className="w-11 h-11 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500">
            <Sparkles className="h-5 w-5 animate-pulse" />
          </div>
        )}
        
        <div className="space-y-1.5 w-full">
          <h5 className="font-extrabold text-[11px] text-zinc-100 leading-normal group-hover:text-red-400 transition-colors">
            {titleText}
          </h5>
          <p className="text-[10px] text-zinc-400 leading-relaxed font-normal line-clamp-4">
            {ad.code && !isDummyOrPlaceholder(ad.code) ? ad.code : (isAr ? "انضم لأهم الأدوات والخدمات لمساعدة صناع المحتوى ومضاعفة أرباحهم." : "Maximize audience metrics, evaluate creative layouts, and expand CTR conversions.")}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-1 w-full justify-center text-[9px] text-red-400 font-extrabold bg-red-500/10 border border-red-500/10 px-2.5 py-1.5 rounded-xl hover:bg-red-550 hover:text-white transition-all whitespace-nowrap mt-2">
        <span>{isAr ? "الذهاب للرابط" : "Visit Link"}</span>
        <ExternalLink className="h-2.5 w-2.5" />
      </div>
    </motion.a>
  );
}

/**
 * Standard Banner Component (Horizontal for Content Sections)
 */
function StandardBannerUnit({
  ad,
  lang,
  onAdClick
}: {
  ad: AdZone;
  lang: "ar" | "en";
  onAdClick: () => void;
}) {
  const isAr = lang === "ar";
  const titleText = ad.title || (isAr ? "احصل على ترقية لمحتواك الإبداعي الآن" : "Optimize your video engagement blueprint");
  
  return (
    <motion.a
      href={ad.link || "#"}
      target="_blank"
      rel="noopener noreferrer"
      onClick={onAdClick}
      className="block group relative overflow-hidden rounded-xl border border-zinc-800/80 bg-gradient-to-r from-zinc-900/90 to-zinc-950 hover:border-red-500/30 transition-all shadow-md p-4 flex flex-col md:flex-row items-center justify-between gap-4 text-right"
      whileHover={{ scale: 1.005 }}
    >
      {/* Subtle colorful edge accent */}
      <div className="absolute top-0 right-0 h-[2px] w-24 bg-gradient-to-r from-red-500 to-amber-500" />
      
      <span className="text-[8px] font-bold text-zinc-650 tracking-wider absolute top-1.5 left-2.5 uppercase font-mono text-zinc-500">
        {ad.type === "affiliate" ? (isAr ? "شريك موصى به" : "RECOMMENDED PARTNER") : (isAr ? "إعلان ممول" : "SPONSORED AD")}
      </span>

      <div className="flex items-center gap-3 w-full md:w-auto flex-row-reverse text-right">
        {/* Banner branding asset */}
        <div className="h-12 w-12 rounded-lg bg-zinc-900 overflow-hidden border border-white/5 shrink-0 flex items-center justify-center">
          {ad.imageUrl && !isDummyOrPlaceholder(ad.imageUrl) ? (
            <img src={ad.imageUrl} alt={titleText} referrerPolicy="no-referrer" className="h-full w-full object-cover" />
          ) : (
            <Sparkles className="h-5 w-5 text-amber-500" />
          )}
        </div>
        <div>
          <h5 className="font-extrabold text-xs text-white group-hover:text-red-400 transition-colors flex items-center gap-1.5 justify-end flex-row-reverse">
            <span>{titleText}</span>
            <Sparkles className="h-3 w-3 text-red-500" />
          </h5>
          <p className="text-[10px] text-zinc-400 mt-1 line-clamp-1 max-w-lg font-normal leading-normal">
            {ad.code && !isDummyOrPlaceholder(ad.code) ? ad.code : (isAr ? "انضم لأهم الأدوات والخدمات لمساعدة صناع المحتوى ومضاعفة أرباحهم." : "Maximize CTR metrics, evaluate layouts, and accelerate audience retention.")}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-1.5 text-[10px] text-red-400 font-extrabold bg-red-500/10 border border-red-500/10 px-3 py-1.5 rounded-lg whitespace-nowrap shrink-0 hover:bg-red-550 hover:text-white transition-all">
        <span>{isAr ? "اكتشف العرض" : "Claim Offer"}</span>
        <ExternalLink className="h-3 w-3" />
      </div>
    </motion.a>
  );
}


/* =========================================================================
   5. ORCHESTRATION BANNER WRAPPER (MAIN CONTAINER PORTAL)
   ========================================================================= */

export default function AdZoneWrapper({ zoneId, lang, refreshTrigger = 0 }: AdZoneWrapperProps) {
  const [ad, setAd] = useState<AdZone | null>(null);
  const [loading, setLoading] = useState(true);

  const isAr = lang === "ar";
  const stylingClasses = ZONE_STYLING[zoneId] || "w-full mx-auto relative";
  const isVertical = zoneId === "sidebar_left" || zoneId === "sidebar_right";

  useEffect(() => {
    let active = true;
    const fetchAdConfig = async () => {
      try {
        const res = await fetch(`/api/ads/zone/${zoneId}`);
        if (res.ok && active) {
          const data = await res.json();
          setAd(data.ad);
          
          // Increment tracking view statistic asynchronously
          if (data.ad && data.ad.enabled) {
            fetch(`/api/ads/increment-view/${zoneId}`, { method: "POST" }).catch(() => {});
          }
        }
      } catch {
        // Suppress connection failure logs inside preview mode
      } finally {
        if (active) setLoading(false);
      }
    };
    fetchAdConfig();
    return () => {
      active = false;
    };
  }, [zoneId, refreshTrigger]);

  const handleUpdateClickStat = () => {
    fetch(`/api/ads/increment-click/${zoneId}`, { method: "POST" }).catch(() => {});
  };

  // Determine active priority level based on user specifications
  const activePriority = getActivePriority(ad);

  // loading phase or Priority 4 (Render absolutely nothing: zero space or frames occupied)
  if (loading || activePriority === 4 || !ad) {
    return null;
  }

  return (
    <div className={stylingClasses} id={`ad-holder-portal-${zoneId}`}>
      {/* High concept minimal design label */}
      <span className="text-[8px] font-bold text-zinc-600 absolute top-1 right-3 tracking-widest pointer-events-none uppercase">
        {isAr ? "مساحة إعلانية" : "SPONSOR AD"}
      </span>

      <div className="relative pt-3.5">
        
        {/* PRIORITY 1: Ad Code (Ad Code / RAW HTML / Script) */}
        {activePriority === 1 && (
          <div onClick={handleUpdateClickStat} className="w-full">
            <div 
              className={`overflow-hidden rounded-xl border border-zinc-850 bg-zinc-950 p-3 text-center text-[10px] text-zinc-400 font-mono flex items-center justify-center w-full ${isVertical ? "min-h-[450px]" : "min-h-[50px]"}`}
              dangerouslySetInnerHTML={{ __html: ad.code }}
            />
          </div>
        )}

        {/* PRIORITY 2: Google AdSense Unit */}
        {activePriority === 2 && ad.publisherId && ad.adSlotId && (
          <div onClick={handleUpdateClickStat} className="w-full">
            <AdSenseResponsiveUnit 
              publisherId={ad.publisherId} 
              adSlotId={ad.adSlotId} 
              isVertical={isVertical}
            />
          </div>
        )}

        {/* PRIORITY 3: Standard Banner Unit (Vertical or Horizontal) */}
        {activePriority === 3 && (
          isVertical ? (
            <VerticalStandardBannerUnit 
              ad={ad} 
              lang={lang} 
              onAdClick={handleUpdateClickStat} 
            />
          ) : (
            <StandardBannerUnit 
              ad={ad} 
              lang={lang} 
              onAdClick={handleUpdateClickStat} 
            />
          )
        )}

      </div>
    </div>
  );
}

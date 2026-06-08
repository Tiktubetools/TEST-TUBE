import React, { useEffect, useState, useRef } from "react";
import { Sparkles, ShieldCheck } from "lucide-react";

interface AdSenseProps {
  slot: string;
  client?: string;
  format?: "auto" | "fluid" | "rectangle" | "horizontal" | "vertical";
  responsive?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export default function AdSense({
  slot,
  client = "ca-pub-98826767512", // Default publisher identification
  format = "auto",
  responsive = true,
  className = "",
  style = {}
}: AdSenseProps) {
  const [adLoaded, setAdLoaded] = useState(false);
  const [blockedByAdBlock, setBlockedByAdBlock] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let isMounted = true;

    // Lazy Loading intersection observer
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            loadAdsenseUnit();
            observer.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "250px" } // Load before scrolling in
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    function loadAdsenseUnit() {
      // Avoid loading empty clients
      if (!client || !slot) return;

      try {
        // Enlist adsbygoogle globally
        const gWindow = window as any;
        gWindow.adsbygoogle = gWindow.adsbygoogle || [];
        
        // Push ad unit call
        gWindow.adsbygoogle.push({});
        
        if (isMounted) {
          setAdLoaded(true);
        }
      } catch (err) {
        console.warn("AdSense push rejected (blocked or script missing)", err);
        if (isMounted) {
          setBlockedByAdBlock(true);
        }
      }
    }

    // Secondary check for adblock via detecting helper visibility
    const checkTimeout = setTimeout(() => {
      if (containerRef.current && containerRef.current.offsetHeight === 0) {
        setBlockedByAdBlock(true);
      }
    }, 1200);

    return () => {
      isMounted = false;
      observer.disconnect();
      clearTimeout(checkTimeout);
    };
  }, [slot, client]);

  // Compute fixed min-height values based on responsive options to solve Cumulative Layout Shift (CLS)
  const getMinHeight = () => {
    switch (format) {
      case "horizontal":
        return "90px";
      case "vertical":
        return "600px";
      case "rectangle":
        return "250px";
      default:
        return "110px";
    }
  };

  return (
    <div
      ref={containerRef}
      className={`relative w-full overflow-hidden rounded-xl border border-white/5 bg-neutral-950/40 p-1.5 transition-all duration-300 ${className}`}
      style={{
        minHeight: getMinHeight(),
        ...style
      }}
      id={`adsense-container-${slot}`}
    >
      {/* 1. Real Google AdSense Script slot */}
      {!blockedByAdBlock && (
        <ins
          className="adsbygoogle"
          style={{ display: "block", textDecoration: "none" }}
          data-ad-client={client}
          data-ad-slot={slot}
          data-ad-format={format}
          data-full-width-responsive={responsive ? "true" : "false"}
        />
      )}

      {/* 2. Sleek local sponsored fallback banner (shown on initial load OR if Adblocker triggers) to optimize monetization and keep 0 CLS */}
      {(!adLoaded || blockedByAdBlock) && (
        <div className="flex flex-col md:flex-row items-center justify-between p-4 h-full w-full gap-4 min-h-[90px] text-right font-sans">
          <div className="flex items-center gap-3 justify-end flex-wrap leading-tight">
            <span className="text-[10px] tracking-wider uppercase bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 px-2.5 py-0.5 rounded font-mono font-bold select-none h-fit">
              SPONSORED AD
            </span>
            <div>
              <h4 className="text-xs font-bold text-white leading-normal">
                حمل فيديوهات اليوتيوب تيك توك وفيسبوك مجانا وبمنتهى السهولة
              </h4>
              <p className="text-[10px] text-neutral-400 mt-1 max-w-lg leading-relaxed">
                استعن بأقوى حزم الذكاء الاصطناعي السحابى لتحري الفهارس وتصميم المصغرات بنقرة واحدة مع TikTube Tools.
              </p>
            </div>
            <Sparkles className="h-4 w-4 text-cyan-400 hidden sm:block shrink-0" />
          </div>

          <a
            href="/#why-free"
            className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-indigo-500 hover:from-cyan-400 hover:to-indigo-400 text-black text-xs font-bold rounded-lg transition-transform hover:scale-105 whitespace-nowrap"
          >
            استكشف المزيد
          </a>
        </div>
      )}
    </div>
  );
}

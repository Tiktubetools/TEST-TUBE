import React from "react";

interface LogoProps {
  className?: string;
  showText?: boolean;
  textClassName?: string;
  onClick?: () => void;
  logoUrl?: string; // Custom logo override URL
}

export default function Logo({ className = "h-10", showText = false, textClassName = "text-xl", onClick, logoUrl }: LogoProps) {
  const isCustomLogo = logoUrl && logoUrl.trim() !== "";

  return (
    <div className={`flex items-center gap-3 select-none ${onClick ? "cursor-pointer" : ""}`} onClick={onClick} id="tiktube-logo-container">
      {isCustomLogo ? (
        <img
          src={logoUrl}
          alt="Site Logo"
          referrerPolicy="no-referrer"
          className={`object-contain rounded-md ${className}`}
        />
      ) : (
        /* Dynamic Chromatic Abberation TikTok/Youtube Badge */
        <div className={`relative flex-shrink-0 aspect-[14/10] ${className}`} id="logo-icon-wrapper">
          <svg
            viewBox="0 0 140 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full filter drop-shadow-[0_4px_12px_rgba(239,68,68,0.25)]"
          >
            {/* Main YouTube style background Play Shape */}
            <path
              d="M125 50C125 72 110 90 85 90H45C20 90 5 72 5 50C5 28 20 10 45 10H85C110 10 125 28 125 50Z"
              fill="#EF4444"
            />
            
            {/* Styled White Play Triangle */}
            <path
              d="M85 50L60 35V65L85 50Z"
              fill="white"
            />

            {/* TikTok 'J' Style Glyphs behind to create the iconic twin aberration shadow */}
            {/* Cyan layer */}
            <path
              d="M52 22V65C52 72 46 78 38 78C30 78 24 72 24 64C24 56 30 50 38 50V38C22 38 10 50 10 64C10 78 22 90 38 90C54 90 66 78 66 62V34C74 34 80 40 82 44V32C74 32 64 26 52 22Z"
              fill="#00F2FE"
              className="opacity-80 mix-blend-screen transform -translate-x-[2px] -translate-y-[1px]"
            />

            {/* Magenta layer */}
            <path
              d="M52 22V65C52 72 46 78 38 78C30 78 24 72 24 64C24 56 30 50 38 50V38C22 38 10 50 10 64C10 78 22 90 38 90C54 90 66 78 66 62V34C74 34 80 40 82 44V32C74 32 64 26 52 22Z"
              fill="#FE0979"
              className="opacity-80 mix-blend-screen transform translate-x-[2px] translate-y-[1px]"
            />

            {/* Solid Top Black 'J' */}
            <path
              d="M52 22V65C52 72 46 78 38 78C30 78 24 72 24 64C24 56 30 50 38 50V38C22 38 10 50 10 64C10 78 22 90 38 90C54 90 66 78 66 62V34C74 34 80 40 82 44V32C74 32 64 26 52 22Z"
              fill="#111111"
            />
          </svg>
        </div>
      )}

      {showText && (
        <div className="flex flex-col line-clamp-1 leading-none" id="logo-text-section">
          <span className={`font-extrabold tracking-tight dark:text-white text-neutral-900 ${textClassName}`}>
            Tik<span className="text-blue-500">Tube</span>
          </span>
          <span className="text-[10px] uppercase font-bold tracking-[0.25em] text-neutral-400 dark:text-neutral-500">
            Tools
          </span>
        </div>
      )}
    </div>
  );
}

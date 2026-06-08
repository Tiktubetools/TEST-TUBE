import React, { useState } from "react";
import { Menu, X, Globe } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import Logo from "./Logo";

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: any) => void;
  lang: "ar" | "en";
  setLang: (lang: "ar" | "en") => void;
  activeUser: any; // Kept in signature as null check to prevent breaking components
  onOpenAuth: () => void;
  onLogout: () => void;
  brandingSettings?: any;
}

export default function Navbar({ 
  currentTab, setCurrentTab, lang, setLang, brandingSettings 
}: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const isAr = lang === "ar";

  const navItems = [
    { id: "home", labelAr: "الرئيسية", labelEn: "Home" },
    { id: "tools", labelAr: "الأدوات", labelEn: "Tools" },
    { id: "why-free", labelAr: "لماذا نحن مجانيون؟", labelEn: "Why Free?" },
    { id: "blog", labelAr: "المدونة", labelEn: "Blog" },
    { id: "about", labelAr: "من نحن", labelEn: "About" },
    { id: "contact", labelAr: "اتصل بنا", labelEn: "Contact" },
  ];

  return (
    <nav className="sticky top-0 z-45 w-full border-b border-zinc-800 bg-[#09090b]/80 backdrop-blur-md text-white select-none" id="main-global-navbar">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between md:justify-start gap-4 md:gap-10">
          
          {/* Logo Section - Positioned next to the nav items */}
          <div className="flex items-center cursor-pointer select-none shrink-0" onClick={() => setCurrentTab("home")} id="nav-logo-trigger">
            <Logo className="h-11 md:h-13 max-h-13" logoUrl={brandingSettings?.logoUrl} showText={false} />
          </div>

          {/* Desktop Navigation Link Tabs & Actions */}
          <div className="hidden md:flex items-center gap-6">
            
            <div className="flex items-center gap-1.5">
              {navItems.map((item) => {
                const isActive = currentTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setCurrentTab(item.id)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${isActive ? "bg-zinc-900 text-red-500" : "text-zinc-400 hover:text-white"}`}
                  >
                    {isAr ? item.labelAr : item.labelEn}
                  </button>
                );
              })}
            </div>

            {/* Quick Language switcher */}
            <div className="h-4 w-[1px] bg-zinc-800" />
            
            <button
              onClick={() => setLang(isAr ? "en" : "ar")}
              className="p-2.5 rounded-xl text-neutral-400 hover:text-white hover:bg-white/5 transition-all flex items-center gap-1.5 text-xs font-bold select-none cursor-pointer"
              title="تغيير اللغة | Switch Language"
              id="language-switcher"
            >
              <Globe className="h-4 w-4" />
              <span>{isAr ? "EN" : "العربية"}</span>
            </button>
          </div>

          {/* Mobile menu triggers */}
          <div className="md:hidden flex items-center gap-2">
            {/* Mobile lang switcher */}
            <button
              onClick={() => setLang(isAr ? "en" : "ar")}
              className="p-2 rounded-lg text-neutral-400 hover:text-white hover:bg-white/5 transition-all text-xs font-bold select-none cursor-pointer"
            >
              <Globe className="h-4 w-4" />
            </button>

            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="p-2 rounded-lg text-neutral-400 hover:text-white focus:outline-none"
              id="mobile-menu-toggle"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Menu Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-zinc-800 bg-zinc-950 px-4 py-4 space-y-3 text-right"
            id="mobile-drawer"
          >
            <div className="flex flex-col gap-1">
              {navItems.map((item) => {
                const isActive = currentTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => { setCurrentTab(item.id); setMobileOpen(false); }}
                    className={`w-full py-2.5 px-3 rounded-lg text-xs font-bold text-right transition-all ${isActive ? "bg-zinc-900 text-red-500 font-extrabold" : "text-zinc-400 hover:bg-zinc-900"}`}
                  >
                    {isAr ? item.labelAr : item.labelEn}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </nav>
  );
}

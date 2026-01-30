import React, { useState, useRef, useEffect } from "react";
import { Outlet, useNavigate, useLocation, Link } from "react-router-dom";
import {
  Menu,
  Settings,
  ChevronRight,
  Check,
  X,
  Mail,
  MoreHorizontal,
} from "lucide-react";

import { useStore } from "../store";
import { useI18n } from "../hooks/useI18n";
import { cn } from "../utils/cn";
import { ConsoleLogo } from "../components/UI";
import LanguageSwitcher from "../components/LanguageSwitcher";

type MenuItem = {
  label: string;
  path: string;
  activePrefix?: string;
};

const MainLayout: React.FC = () => {
  const { session, logout, setMarketplace, setStore, stores, refreshStoreData } = useStore();
  const { t } = useI18n();
  const navigate = useNavigate();
  const location = useLocation();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMktOpen, setIsMktOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isStoreOpen, setIsStoreOpen] = useState(false);

  const mktRef = useRef<HTMLDivElement>(null);
  const settingsRef = useRef<HTMLDivElement>(null);
  const storeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (mktRef.current && !mktRef.current.contains(event.target as Node)) setIsMktOpen(false);
      if (settingsRef.current && !settingsRef.current.contains(event.target as Node)) setIsSettingsOpen(false);
      if (storeRef.current && !storeRef.current.contains(event.target as Node)) setIsStoreOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Load stores when component mounts
  useEffect(() => {
    if (stores.length === 0) {
      refreshStoreData();
    }
  }, [stores.length, refreshStoreData]);

  const menuItems: MenuItem[] = [
    { label: t('dashboard'), path: "/app/dashboard" },
    { label: t('manageAllInventory'), path: "/app/inventory" },
    { label: t('manageOrders'), path: "/app/orders" },
    { label: t('campaignManager'), path: "/app/ads" },
    { label: t('shipments'), path: "/app/shipments" },
    { label: t('accountHealth'), path: "/app/performance" },
    { label: t('performanceNotifications'), path: "/app/performance-notifications" },
    { label: t('addProducts'), path: "/app/add-products" },
    { label: t('manageStores'), path: "/app/stores" },
    {
      label: t('businessReports'),
      path: "/app/business-reports/sales-dashboard",
      activePrefix: "/app/business-reports",
    },
    { label: t('voc'), path: "/app/voc" },
    { label: t('analytics'), path: "/app/analytics" },
    { label: t('productOpportunities'), path: "/app/product-opportunities" },
    { label: t('addProductsUpload'), path: "/app/add-products-upload" },
    { label: t('sellingApps'), path: "/app/selling-apps" },
  ];

  // ========= Layout width rule =========
  const forceFullWidthPages = [
    "/app/inventory",
    "/app/orders",
    "/app/business-reports",
  ];

  const useFullWidth =
    forceFullWidthPages.some((p) => location.pathname.startsWith(p));


  const isMenuActive = (item: MenuItem) => {
    if (item.activePrefix) return location.pathname.startsWith(item.activePrefix);
    if (item.path === "/app/dashboard") return location.pathname === item.path;
    
    // 特殊处理：避免 /app/performance-notifications 匹配 /app/performance
    if (item.path === "/app/performance") {
      return location.pathname === "/app/performance" || 
             (location.pathname.startsWith("/app/performance/") && !location.pathname.startsWith("/app/performance-notifications"));
    }
    
    return location.pathname.startsWith(item.path);
  };

  const navLinkClass = (active: boolean, variant: "top" | "drawer") => {
    if (variant === "top") {
      return cn(
        "px-2 h-full flex items-center whitespace-nowrap border-b-[3px] transition-colors text-[12px] font-medium",
        active
          ? "border-amazon-teal bg-white/5 text-white"
          : "border-transparent text-gray-300 hover:text-white"
      );
    }
    return cn(
      "block w-full px-4 py-2 text-[13px] leading-5 text-gray-900 hover:bg-gray-100",
      active ? "font-semibold bg-gray-100" : ""
    );
  };

  return (
    <div className="amz-console min-h-screen flex flex-col">
      {/* GLOBAL DRAWER (LEFT MENU) */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-[100] transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        >
          <div
            className="w-60 h-full bg-white shadow-2xl animate-in slide-in-from-left duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-amazon-headerTeal h-12 px-3 flex items-center justify-between text-white">
              <div className="scale-[0.92] origin-left leading-none">
                <ConsoleLogo />
              </div>
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="hover:bg-white/10 p-1 rounded"
              >
                <X size={22} />
              </button>
            </div>

            <nav className="overflow-y-auto h-[calc(100vh-48px)] py-2">
              {menuItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsSidebarOpen(false)}
                  className={navLinkClass(isMenuActive(item), "drawer")}
                >
                  {item.label}
                </Link>
              ))}

              <div className="h-px bg-gray-100 my-4" />

              <button
                onClick={() => {
                  navigate("/app/settings");
                  setIsSidebarOpen(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-2 text-[13px] font-medium text-gray-700 hover:bg-gray-100"
              >
                <Settings size={18} />
                Account Info
              </button>

              <button
                onClick={logout}
                className="w-full flex items-center gap-3 px-4 py-2 text-[13px] font-medium text-amazon-error hover:bg-red-50"
              >
                <X size={18} />
                Sign Out
              </button>
            </nav>
          </div>
        </div>
      )}

      {/* HEADER - Amazon Deep Teal */}
      <header className="sticky top-0 bg-amazon-headerTeal h-[41px] flex items-center px-2 z-[60] text-white shadow-[inset_0_-1px_0_rgba(255,255,255,0.10)]">
        {/* Left */}
        <div className="flex items-center h-full shrink-0">
          {/* Hamburger button */}
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="w-[32px] h-full flex items-center justify-center hover:bg-white/10 transition-colors mr-1"
            aria-label="Open menu"
          >
            <Menu size={16} />
          </button>

          {/* Brand logo */}
          <div
            className="cursor-pointer flex items-center leading-none px-1"
            onClick={() => navigate("/app/dashboard")}
          >
            <ConsoleLogo />
          </div>

          {/* Divider */}
          <div className="h-[24px] w-[1px] bg-white/20 mx-3" />

          {/* Store & Marketplace Unified Selector */}
          <div className="flex items-center bg-white rounded-[2px] border border-black/10 h-[24px] shadow-[0_1px_2px_rgba(0,0,0,0.05)] ml-1">
            {/* Store selector part */}
            <div className="relative" ref={storeRef}>
              <div
                onClick={() => {
                  setIsStoreOpen(!isStoreOpen);
                  setIsMktOpen(false);
                }}
                className={cn(
                  "flex items-center px-1.5 cursor-pointer transition-colors hover:bg-gray-50 h-[24px]",
                  isStoreOpen && "ring-1 ring-amazon-orange rounded-[2px]"
                )}
              >
                <span className="text-[11px] font-bold text-amazon-headerTeal truncate max-w-[120px] leading-none mb-[1.5px]">
                  {session.store?.name || 'Select Store'}
                </span>
              </div>

              {isStoreOpen && (
                <div className="absolute top-[28px] left-[-4px] w-72 bg-white shadow-xl border border-gray-200 py-1 rounded-sm animate-in fade-in slide-in-from-top-1 z-[100]">
                  <div className="px-4 py-2 text-[11px] font-bold text-gray-400 uppercase tracking-wide border-b bg-gray-50">
                    {t("selectStore")}
                  </div>
                  {stores.map((store: any) => (
                    <div
                      key={store.id}
                      onClick={() => {
                        setStore(store);
                        setIsStoreOpen(false);
                      }}
                      className="px-4 py-3 hover:bg-blue-50 flex items-center justify-between cursor-pointer group border-b border-transparent hover:border-blue-100 last:mb-0"
                    >
                      <span className={cn("text-[13px] text-amazon-text", session.store?.id === store.id ? "font-bold" : "font-normal")}>
                        {store.name}
                      </span>
                      {session.store?.id === store.id && <Check size={16} className="text-amazon-teal" />}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Middle Divider Pipe */}
            <div className="w-[1px] h-[14px] bg-gray-300 mx-0.5" />

            {/* Marketplace selector part */}
            <div className="relative" ref={mktRef}>
              <div
                onClick={() => {
                  setIsMktOpen(!isMktOpen);
                  setIsStoreOpen(false);
                }}
                className={cn(
                  "flex items-center px-1.5 cursor-pointer transition-colors hover:bg-gray-50 h-[24px]",
                  isMktOpen && "ring-1 ring-amazon-orange rounded-[2px]"
                )}
              >
                <span className="text-[11px] font-normal text-[#0F1111] flex items-center gap-1 leading-none mb-[1px]">
                  {session.marketplace === 'United States' ? 'US United States' : session.marketplace}
                </span>
              </div>

              {isMktOpen && (
                <div className="absolute top-[28px] left-[-20px] min-w-[200px] bg-white shadow-xl border border-gray-200 py-1 rounded-sm animate-in fade-in slide-in-from-top-1 z-[100]">
                  <div className="px-4 py-2 text-[11px] font-bold text-gray-400 uppercase tracking-wide border-b bg-gray-50">
                    {t("selectMarketplace")}
                  </div>
                  {[
                    { code: 'US', name: 'United States' },
                    { code: 'JP', name: 'Japan' },
                    { code: 'UK', name: 'United Kingdom' },
                    { code: 'DE', name: 'Germany' },
                    { code: 'EU', name: 'Europe' }
                  ].map((m) => (
                    <div
                      key={m.name}
                      onClick={() => {
                        setMarketplace(m.name);
                        setIsMktOpen(false);
                      }}
                      className={cn(
                        "px-4 py-2 text-[12px] text-amazon-text cursor-pointer hover:bg-gray-100 transition-colors flex items-center justify-between group",
                        session.marketplace === m.name && "bg-blue-50 text-[#007185] font-medium"
                      )}
                    >
                      <span className="flex-1">{m.code} {m.name}</span>
                      {session.marketplace === m.name && (
                        <div className="w-1.5 h-1.5 rounded-full bg-amazon-orange" />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Center - Search */}
        <div className="flex-1 flex justify-center px-2">
          <div className="w-full max-w-[340px] flex items-center">
            <input
              className="w-full h-[28px] px-3 text-[12px] text-white outline-none placeholder:text-white/80 placeholder:italic border border-[rgba(255,255,255,0.16)] rounded-l-[2px]"
              placeholder={t('search')}
              style={{ backgroundColor: "rgba(18,120,128,0.42)" }}
            />
            <button
              className="w-[36px] h-[28px] flex items-center justify-center border border-l-0 border-[rgba(255,255,255,0.16)] rounded-r-[2px] hover:brightness-95 transition-colors"
              aria-label="Search"
              style={{ backgroundColor: "rgba(18,120,128,0.82)" }}
            >

              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path
                  d="M21 21l-4.3-4.3m1.8-5.2a7 7 0 11-14 0 7 7 0 0114 0z"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Right */}
        <div className="flex items-center gap-3 h-full shrink-0">
          <div className="flex items-center gap-1 px-1">
            <div className="w-7 h-4 rounded-full bg-white/20 relative cursor-pointer">
              <div className="w-3 h-3 rounded-full bg-white absolute top-0.5 left-0.5" />
            </div>
          </div>

          <span className="text-[11px] font-bold text-gray-100 whitespace-nowrap">
            New Seller Central
          </span>

          <button className="w-[28px] h-[28px] flex items-center justify-center hover:bg-white/10 rounded transition-colors mr-1">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
              {/* Big star - left-center */}
              <path d="M8 4L10 9.5L15.5 11L10 12.5L8 18L6 12.5L0.5 11L6 9.5L8 4Z" />
              {/* Small star - top-right */}
              <path d="M19 3L19.8 5.2L22 6L19.8 6.8L19 9L18.2 6.8L16 6L18.2 5.2L19 3Z" />
            </svg>
          </button>

          <button className="w-[28px] h-[28px] flex items-center justify-center hover:bg-white/10 rounded transition-colors" title="Messages" aria-label="Messages">
            <Mail size={16} className="text-white" />
          </button>


          <div className="relative" ref={settingsRef}>
            <button
              className="w-[30px] h-[30px] flex items-center justify-center hover:bg-white/10 rounded transition-colors"
              title="Settings"
              onClick={() => setIsSettingsOpen(!isSettingsOpen)}
              aria-label="Settings"
            >
              <Settings size={18} className="text-white" />
            </button>
            {isSettingsOpen && (
              <div className="absolute right-0 top-11 w-64 bg-white shadow-xl border border-gray-200 py-2 rounded-sm animate-in fade-in slide-in-from-top-1 z-[100]">
                <div className="px-4 py-2 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b mb-1">{t('accountManagement')}</div>
                <button onClick={() => navigate("/app/settings/store-info")} className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center justify-between cursor-pointer text-[13px] font-medium text-amazon-text">
                  <span>{t('accountInfo')}</span>
                  <ChevronRight size={14} className="text-gray-400" />
                </button>
                <button onClick={() => navigate("/app/settings")} className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center justify-between cursor-pointer text-[13px] font-medium text-amazon-text">
                  <span>Manage Accounts</span>
                  <ChevronRight size={14} className="text-gray-400" />
                </button>
                <button className="w-full text-left px-4 py-2 hover:bg-gray-50 text-[13px] font-medium text-amazon-text cursor-pointer">
                  Notification Preferences
                </button>
                <button className="w-full text-left px-4 py-2 hover:bg-gray-50 text-[13px] font-medium text-amazon-text cursor-pointer">
                  Login Settings
                </button>
                <button onClick={() => navigate("/app/settings/shipping-returns")} className="w-full text-left px-4 py-2 hover:bg-gray-50 text-[13px] font-medium text-amazon-text cursor-pointer">
                  {t('shippingReturns')}
                </button>
                <button className="w-full text-left px-4 py-2 hover:bg-gray-50 text-[13px] font-medium text-amazon-text cursor-pointer">
                  Gift Options
                </button>
                <button onClick={() => navigate("/app/settings/shipping-returns")} className="w-full text-left px-4 py-2 hover:bg-gray-50 text-[13px] font-medium text-amazon-text cursor-pointer">
                  Shipping Settings
                </button>
                <button onClick={() => navigate("/app/settings/tax-info")} className="w-full text-left px-4 py-2 hover:bg-gray-50 text-[13px] font-medium text-amazon-text cursor-pointer">
                  {t('taxInfo')}
                </button>
                <button className="w-full text-left px-4 py-2 hover:bg-gray-50 text-[13px] font-medium text-amazon-text cursor-pointer">
                  User Permissions
                </button>
                <button className="w-full text-left px-4 py-2 hover:bg-gray-50 text-[13px] font-medium text-amazon-text cursor-pointer">
                  Fulfillment by Amazon
                </button>
                <div className="h-px bg-gray-100 my-2" />
                <button onClick={logout} className="w-full text-left px-4 py-2 hover:bg-red-50 text-[13px] font-medium text-amazon-error cursor-pointer">
                  {t('logout')}
                </button>
              </div>
            )}
          </div>

          <LanguageSwitcher />

          <button
            className="h-full flex items-center px-2 text-[11px] font-bold text-gray-200 hover:text-white hover:bg-white/10 rounded transition-colors"
            onClick={() => navigate("/app/help")}
            aria-label="Help"
          >
            Help
          </button>
        </div>
      </header>

      {/* SUB-MENU */}
      <nav className="sticky top-[41px] bg-amazon-subHeaderDark h-[41px] flex items-center px-3 border-t border-[rgba(0,0,0,0.2)] shadow-[inset_0_-1px_0_rgba(255,255,255,0.08)] z-50 text-white">

        <div className="flex h-full w-full items-center justify-between">
          <div className="flex h-full items-center overflow-x-auto no-scrollbar scroll-smooth">
            <span className="mr-2 inline-flex items-center justify-center w-6 h-6 rounded-[2px] hover:bg-white/10 cursor-pointer">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                  d="M7 4.8h10c.7 0 1.2.5 1.2 1.2v14.2l-6-2.7-6 2.7V6c0-.7.5-1.2 1.2-1.2z"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinejoin="round"
                />
              </svg>
            </span>

            {menuItems.map((item) => (
              <Link key={item.path} to={item.path} className={navLinkClass(isMenuActive(item), "top")}>
                {item.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-2 ml-4 whitespace-nowrap">
            <button
              className="w-8 h-7 flex items-center justify-center rounded-[2px] hover:bg-white/10 transition-colors"
              aria-label="More"
            >
              <MoreHorizontal size={16} className="opacity-90" />
            </button>
            <button className="flex items-center px-3 py-0 h-[22px] text-[11px] font-bold text-gray-300 hover:text-white transition-colors bg-white/5 rounded-[2px] border border-white/10">
              {t('edit')}
            </button>
          </div>
        </div>
      </nav>

      {/* Main content */}
      <main className={cn(
        'flex-1 py-4',
        useFullWidth
          ? 'max-w-full px-5'
          : location.pathname === '/app/dashboard'
            ? 'dashboard-container px-0'
            : 'max-w-full px-5'
      )}>
        <Outlet />
      </main>

      <footer className="mt-20 border-t bg-white py-12 text-center border-gray-200">
        <div className="flex justify-center gap-8 text-[12px] font-bold text-amazon-link mb-4">
          <a href="#" className="hover:underline">{t('termsCondition')}</a>
          <a href="#" className="hover:underline">{t('privacyNotice')}</a>
          <a href="#" className="hover:underline">{t('help')}</a>
        </div>
        <p className="text-[11px] text-gray-500 font-medium">
          © 1999-2025, Amazon.com, Inc. or its affiliates. Amazon, Amazon Seller Central and all
          related logos are trademarks of Amazon.com, Inc. or its affiliates.
        </p>
      </footer>
    </div>
  );
};

export default MainLayout;

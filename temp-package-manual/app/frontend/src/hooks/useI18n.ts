import { useStore } from "../store";
import { translations, LangType, marketplaceConfigs } from "../i18n";

// 你的 store 里目前用的是 "EN" / "ZH"，但 i18n 表用的是 "en-US" / "zh-CN"
// 这里做一次兼容映射，避免切换语言时崩溃。
const normalizeLang = (raw: unknown): LangType => {
  if (raw === "ZH") return "zh-CN";
  if (raw === "EN") return "en-US";
  if (raw === "zh-CN" || raw === "en-US") return raw;
  return "en-US";
};

export const useI18n = () => {
  const rawLanguage = useStore((state: any) => state?.session?.language);
  const marketplace = useStore((state: any) => state?.session?.marketplace);
  const language = normalizeLang(rawLanguage);

  const t = (key: keyof (typeof translations)["zh-CN"] | string, params?: Record<string, any>) => {
    // translations[language] 一定存在（normalizeLang 兜底）
    let translation = (translations[language] as any)?.[key] ?? key;
    
    // 替换参数
    if (params && typeof translation === 'string') {
      Object.entries(params).forEach(([param, value]) => {
        translation = translation.replace(new RegExp(`\\{${param}\\}`, 'g'), String(value));
      });
    }
    
    return translation;
  };

  // Currency formatting based on marketplace
  const formatCurrency = (amount: number, options?: { showSymbol?: boolean; precision?: number }) => {
    const { showSymbol = true, precision = 2 } = options || {};
    const marketplaceConfig = marketplaceConfigs[marketplace] || marketplaceConfigs['United States'];
    const currencySymbol = marketplaceConfig.currency;
    
    // Format number with locale-specific formatting
    const locale = language === 'zh-CN' ? 'zh-CN' : 'en-US';
    const formattedAmount = amount.toLocaleString(locale, {
      minimumFractionDigits: precision,
      maximumFractionDigits: precision
    });
    
    return showSymbol ? `${currencySymbol}${formattedAmount}` : formattedAmount;
  };

  // Number formatting
  const formatNumber = (num: number, options?: { precision?: number }) => {
    const { precision } = options || {};
    const locale = language === 'zh-CN' ? 'zh-CN' : 'en-US';
    
    return num.toLocaleString(locale, {
      minimumFractionDigits: precision,
      maximumFractionDigits: precision
    });
  };

  // Date formatting
  const formatDate = (date: Date | string, options?: { 
    dateStyle?: 'full' | 'long' | 'medium' | 'short';
    timeStyle?: 'full' | 'long' | 'medium' | 'short';
    includeTime?: boolean;
  }) => {
    const { dateStyle = 'medium', timeStyle = 'short', includeTime = false } = options || {};
    const locale = language === 'zh-CN' ? 'zh-CN' : 'en-US';
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    if (includeTime) {
      return dateObj.toLocaleString(locale, { dateStyle, timeStyle });
    } else {
      return dateObj.toLocaleDateString(locale, { dateStyle });
    }
  };

  // Percentage formatting
  const formatPercentage = (value: number, options?: { precision?: number }) => {
    const { precision = 1 } = options || {};
    const locale = language === 'zh-CN' ? 'zh-CN' : 'en-US';
    
    return (value / 100).toLocaleString(locale, {
      style: 'percent',
      minimumFractionDigits: precision,
      maximumFractionDigits: precision
    });
  };

  // Get currency symbol for current marketplace
  const getCurrencySymbol = () => {
    const marketplaceConfig = marketplaceConfigs[marketplace] || marketplaceConfigs['United States'];
    return marketplaceConfig.currency;
  };

  // Get currency code for current marketplace
  const getCurrencyCode = () => {
    const marketplaceConfig = marketplaceConfigs[marketplace] || marketplaceConfigs['United States'];
    return marketplaceConfig.symbol;
  };

  return { 
    t, 
    language,
    formatCurrency,
    formatNumber,
    formatDate,
    formatPercentage,
    getCurrencySymbol,
    getCurrencyCode
  };
};

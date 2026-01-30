import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useI18n } from '../hooks/useI18n';
import { Eye, MessageSquare, Heart } from 'lucide-react';

// ==================== Shared Card UI tokens ====================
const outerCard = "bg-white border border-[#E3E6E6] rounded-[8px] shadow-none";
const cardHeaderRow = "flex items-center justify-between px-4 pt-4 pb-3";
const cardTitleLeft = "flex items-center gap-2";
const cardTitleText = "text-[16px] font-semibold text-amazon-headerTeal";
const infoIcon = "inline-flex h-3.5 w-3.5 items-center justify-center rounded-full border-2 border-[#AAB7B8] text-[10px] text-[#6F7373] leading-none";
const badgeCount = "inline-flex min-w-[20px] h-5 items-center justify-center rounded-full bg-amazon-headerTeal text-white text-[12px] px-2";
const kebabButton = "inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-[#F7F8FA] text-[#6F7373] transition-colors";
const divider = "border-t border-[#E3E6E6]";

// ==================== ActionsCard Component ====================
// ==================== ActionsCard Component ====================
export function ActionsCard({ actions }: { actions?: any[] }) {
  const navigate = useNavigate();
  const { t } = useI18n();

  // Use dynamic action if available, otherwise fallback to default
  const primaryAction = actions?.[0] || {
    id: "shipmentPerformance",
    title: t('shipmentPerformance'),
    description: t('outstandingShipmentProblems', { count: 0 }),
    subtext: t('shipmentPerformanceSub')
  };

  return (
    <div className={`${outerCard} ring-2 ring-[#007185] ring-offset-2 ring-offset-white`}>
      {/* Header */}
      <div className={cardHeaderRow}>
        <div className={cardTitleLeft}>
          <div className={cardTitleText}>{t('actions')}</div>
          <div className={infoIcon}>i</div>
        </div>
        <div className={badgeCount}>{actions?.length || 1}</div>
      </div>

      {/* Body */}
      <div className="mx-4 mb-4 rounded-[8px] border border-[#E3E6E6] bg-white px-4 py-3">
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate('/app/shipments')}
            className="text-[13px] font-semibold text-[#007185] hover:underline"
          >
            {primaryAction.title || primaryAction.text}
          </button>
          <button className={kebabButton}>⋮</button>
        </div>
        <div className="mt-1 text-[12px] text-[#565959] leading-5">
          {primaryAction.description || t('outstandingShipmentProblems', { count: 0 })}
        </div>
        <div className="text-[12px] text-[#565959] leading-5">
          {primaryAction.subtext || t('shipmentPerformanceSub')}
        </div>
      </div>
    </div>
  );
}

// ==================== SVG Icons ====================
const EyeIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#565959]">
    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const CommentIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#565959]">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);

const HeartIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#565959]">
    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
  </svg>
);

// ==================== CommunicationsCard Component ====================
export function CommunicationsCard({ communications }: { communications?: any[] }) {
  const { t } = useI18n();

  // Split communications into forums and news if dynamic data is present
  const isCommArray = Array.isArray(communications);
  const dynamicForums = isCommArray ? communications.filter(c => c.post_type === 'FORUM') : [];
  const dynamicNews = isCommArray ? communications.filter(c => c.post_type === 'NEWS') : [];

  // Mock data fallbacks for initial empty state
  const sellerForums = dynamicForums.length > 0 ? dynamicForums.map(f => ({
    id: f.id,
    title: f.title,
    date: f.post_date ? new Date(f.post_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Jan 5',
    views: f.views?.toString() || '0',
    replies: f.comments?.toString() || '0'
  })) : [
    { id: 1, title: "Is the Buy Box really open to everyone, or only to certain sellers?", date: "Jan 5", views: "172", replies: "6" },
    { id: 2, title: "I really need help from someone who knows this process.", date: "Jan 6", views: "104", replies: "3" },
    { id: 3, title: "Deposit Method Account Error", date: "Jan 6", views: "42", replies: "5" }
  ];

  const sellerNews = dynamicNews.length > 0 ? dynamicNews.map(n => ({
    id: n.id,
    title: n.title,
    date: n.post_date ? new Date(n.post_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Jan 6',
    views: n.views?.toString() || '0',
    reactions: n.likes?.toString() || '0'
  })) : [
    { id: 1, title: "Changes to review sharing across product variations starting Feb 12", date: "Jan 7", views: "4.3K", comments: "22" },
    { id: 2, title: "Track Amazon Business customer patterns with new metrics", date: "Jan 6", views: "2.8K", reactions: "12" },
    { id: 3, title: "Find VAT and EPR providers easily with new Service Hub", date: "Jan 5", views: "3.0K", reactions: "9" }
  ];

  return (
    <div className={outerCard}>
      {/* Header */}
      <div className={cardHeaderRow}>
        <div className={cardTitleLeft}>
          <div className={cardTitleText}>{t('communications')}</div>
          <div className={infoIcon}>i</div>
        </div>
      </div>

      {/* Body */}
      <div>
        {/* Seller Forums Section */}
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[13px] font-semibold text-amazon-headerTeal">{t('sellerForums')}</div>
              <a href="#" className="block text-[12px] text-[#007185] hover:underline">
                {t('seeAll')}
              </a>
            </div>
            <button className={kebabButton}>⋮</button>
          </div>

          <div className="mt-3">
            {sellerForums.map((item, index) => (
              <div key={item.id}>
                <div className="text-[13px] text-[#0F1111] leading-5 line-clamp-2">
                  {item.title}
                </div>
                <div className="mt-1 flex items-center text-[11px] text-[#565959] gap-[25px]">
                  <span className="flex-shrink-0">{item.date}</span>
                  <div className="flex items-center gap-4 text-[#888C8C]">
                    <span className="inline-flex items-center gap-1">
                      <Eye size={13} strokeWidth={2.5} className="opacity-70" /> {item.views}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <MessageSquare size={11} strokeWidth={2.5} className="opacity-70" /> {item.replies}
                    </span>
                  </div>
                </div>
                {index < sellerForums.length - 1 && <div className="border-t border-[#E3E6E6] my-3"></div>}
              </div>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div className={divider}></div>

        {/* Seller News Section */}
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[13px] font-semibold text-amazon-headerTeal">{t('sellerNews')}</div>
              <a href="#" className="block text-[12px] text-[#007185] hover:underline">
                {t('seeAll')}
              </a>
            </div>
            <button className={kebabButton}>⋮</button>
          </div>

          <div className="mt-3">
            {sellerNews.map((item, index) => (
              <div key={item.id}>
                <div className="text-[13px] text-[#0F1111] leading-5 line-clamp-2">
                  {item.title}
                </div>
                <div className="mt-1 flex items-center text-[11px] text-[#565959] gap-[25px]">
                  <span className="flex-shrink-0">{item.date}</span>
                  <div className="flex items-center gap-4 text-[#888C8C]">
                    <span className="inline-flex items-center gap-1">
                      <Eye size={13} strokeWidth={2.5} className="opacity-70" /> {item.views}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Heart size={11} strokeWidth={2.5} className="opacity-70 fill-[#888C8C]" /> {item.reactions}
                    </span>
                  </div>
                </div>
                {index < sellerNews.length - 1 && <div className="border-t border-[#E3E6E6] my-3"></div>}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ==================== Demo Wrapper Component ====================
export function LeftColumnDemo() {
  return (
    <div className="flex flex-col gap-4">
      <ActionsCard />
      <CommunicationsCard />
    </div>
  );
}
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, ChevronDown, X } from 'lucide-react';
import { SidebarConfig, SidebarMenuItem } from '../nav/sidebar.config.tsx';
import { useI18n } from '../hooks/useI18n';
import { cn } from '../utils/cn';

interface SidebarProps {
  config: SidebarConfig;
  onClose?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ config, onClose }) => {
  const location = useLocation();
  const { t } = useI18n();
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});

  // 检查菜单项是否激活
  const isActive = (item: SidebarMenuItem): boolean => {
    if (item.activePrefix) {
      // 精确匹配：确保不会误匹配相似路径
      if (item.activePrefix === '/app/performance') {
        // 特殊处理：只匹配 /app/performance 开头但不包含 /app/performance-notifications
        return location.pathname.startsWith('/app/performance') && !location.pathname.startsWith('/app/performance-notifications');
      }
      return location.pathname.startsWith(item.activePrefix);
    }
    return location.pathname === item.path;
  };

  // 切换菜单项的展开状态
  const toggleSection = (id: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // 渲染菜单项
  const renderMenuItem = (item: SidebarMenuItem, level: number = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const isItemActive = isActive(item);
    // 对于有子菜单的父项，强制不显示激活状态
    const shouldShowActive = hasChildren ? false : isItemActive;
    const isSectionExpanded = expandedSections[item.id] || hasChildren && item.children.some(child => isActive(child));

    if (item.isHeader) {
      return (
        <div
          key={item.id}
          className="mx-2 px-2 py-1 bg-[#E9EBEB] text-[13px] font-bold text-[#0F1111] mt-4 first:mt-0 leading-tight"
        >
          {t(item.label)}
        </div>
      );
    }

    if (item.className) {
      return (
        <div key={item.id} className={cn(item.className, "whitespace-normal leading-tight")}>
          {t(item.label)}
        </div>
      );
    }

    return (
      <div key={item.id}>
        {hasChildren ? (
          <div
            className={cn(
              "flex items-center justify-between px-4 py-2 text-[13px] cursor-pointer transition-colors whitespace-normal leading-tight",
              shouldShowActive ? "bg-white text-[#007185] font-bold" : "text-[#007185] hover:bg-white/50",
              level > 0 && "pl-8"
            )}
            onClick={() => toggleSection(item.id)}
          >
            <div className="flex items-center flex-1">
              {item.icon && <span className="mr-3">{item.icon}</span>}
              <span>{t(item.label)}</span>
            </div>
            {isSectionExpanded ? <ChevronDown size={14} className="ml-2 flex-shrink-0" /> : <ChevronRight size={14} className="ml-2 flex-shrink-0" />}
          </div>
        ) : (
          <Link
            to={item.path}
            className={cn(
              "flex items-center px-4 py-2 text-[13px] transition-colors whitespace-normal leading-tight",
              shouldShowActive ? "bg-white text-[#007185] font-bold" : "text-[#007185] hover:bg-white/50",
              level > 0 || (!item.isHeader && item.id !== 'sales-dashboard' && !item.children) ? "pl-8" : "pl-4"
            )}
          >
            {item.icon && <span className="mr-3">{item.icon}</span>}
            <span className="flex-1">{t(item.label)}</span>
          </Link>
        )}

        {hasChildren && isSectionExpanded && (
          <div className="mt-0">
            {item.children!.map(child => renderMenuItem(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-full bg-[#EAEDED] h-full overflow-y-auto">
      <div
        className="flex items-center space-x-2 px-4 py-4 bg-[#EAEDED] border-b border-[#D5D9D9]/50 text-[#007185] cursor-pointer hover:bg-gray-200 transition-colors"
        onClick={onClose}
      >
        <X size={16} />
        <span className="text-[13px] font-bold uppercase tracking-tight">{t('closeReportsMenu')}</span>
      </div>
      <div className="py-2">
        {config.items.map(item => renderMenuItem(item))}
      </div>
    </div>
  );
};

export default Sidebar;

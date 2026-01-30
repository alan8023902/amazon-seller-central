import { ReactNode } from 'react';
import { Activity, FileText, Package, ShoppingCart, Tag, Users } from 'lucide-react';

// 定义侧边栏菜单项类型
export interface SidebarMenuItem {
  id: string;
  label: string;
  path: string;
  icon?: ReactNode;
  children?: SidebarMenuItem[];
  activePrefix?: string;
  isHeader?: boolean;
  className?: string;
}

// 定义侧边栏配置类型
export interface SidebarConfig {
  id: string;
  label: string;
  items: SidebarMenuItem[];
}

// Reports 侧边栏配置
export const reportsSidebar: SidebarConfig = {
  id: 'reports',
  label: 'reports',
  items: [
    {
      id: 'header-dashboards',
      label: 'dashboards',
      path: '',
      isHeader: true
    },
    {
      id: 'sales-dashboard',
      label: 'salesDashboard',
      path: '/app/business-reports/sales-dashboard',
      activePrefix: '/app/business-reports/sales-dashboard'
    },
    {
      id: 'header-business-reports',
      label: 'businessReports',
      path: '',
      isHeader: true
    },
    {
      id: 'header-by-date',
      label: 'byDate',
      path: '',
      isHeader: false,
      className: 'text-[#0F1111] font-normal px-4 py-2 text-[13px] mt-2'
    },
    {
      id: 'sales-and-traffic',
      label: 'salesAndTraffic',
      path: '/app/business-reports/by-date/sales-traffic'
    },
    {
      id: 'detail-page-sales',
      label: 'detailPageSales',
      path: '/app/business-reports/by-date/detail-page-sales'
    },
    {
      id: 'seller-performance',
      label: 'sellerPerformance',
      path: '/app/business-reports/by-date/seller-performance'
    },
    {
      id: 'header-by-asin',
      label: 'byAsin',
      path: '',
      className: 'text-[#0F1111] font-normal px-4 py-2 text-[13px] mt-2'
    },
    {
      id: 'asin-detail-page-sales',
      label: 'asinDetailSales',
      path: '/app/business-reports/by-asin/detail-sales'
    },
    {
      id: 'asin-parent-item',
      label: 'asinParentItem',
      path: '/app/business-reports/by-asin/parent'
    },
    {
      id: 'asin-child-item',
      label: 'asinChildItem',
      path: '/app/business-reports/by-asin/child'
    },
    {
      id: 'header-other',
      label: 'other',
      path: '',
      className: 'text-[#0F1111] font-normal px-4 py-2 text-[13px] mt-2'
    },
    {
      id: 'sales-by-month',
      label: 'salesByMonth',
      path: '/app/business-reports/other/sales-by-month'
    }
  ]
};

// Settings 侧边栏配置
export const settingsSidebar: SidebarConfig = {
  id: 'settings',
  label: 'accountSettings',
  items: [
    {
      id: 'account-overview',
      label: 'accountOverview',
      path: '/app/settings',
      icon: <Users size={12} />
    },
    {
      id: 'store-info',
      label: 'storeInfo',
      path: '/app/settings/store-info',
      icon: <Package size={12} />
    },
    {
      id: 'business-info',
      label: 'businessInfo',
      path: '/app/settings/business-info',
      icon: <FileText size={12} />
    },
    {
      id: 'payment-info',
      label: 'paymentInfo',
      path: '/app/settings/payment-info',
      icon: <Tag size={12} />
    },
    {
      id: 'shipping-returns',
      label: 'shippingReturns',
      path: '/app/settings/shipping-returns',
      icon: <ShoppingCart size={12} />
    },
    {
      id: 'tax-info',
      label: 'taxInfo',
      path: '/app/settings/tax-info',
      icon: <FileText size={12} />
    },
    {
      id: 'account-management',
      label: 'accountManagement',
      path: '/app/settings/account-management',
      icon: <Users size={12} />
    }
  ]
};

// Inventory 侧边栏配置
export const inventorySidebar: SidebarConfig = {
  id: 'inventory',
  label: 'inventory',
  items: [
    {
      id: 'manage-all',
      label: 'manageAllInventory',
      path: '/app/inventory',
      icon: <Package size={12} />
    },
    {
      id: 'add-products',
      label: 'addProducts',
      path: '/app/add-products',
      icon: <Package size={12} />
    },
    {
      id: 'fba-inventory',
      label: 'fbaInventory',
      path: '/app/inventory/fba',
      icon: <Package size={12} />
    }
  ]
};

// Orders 侧边栏配置
export const ordersSidebar: SidebarConfig = {
  id: 'orders',
  label: 'orders',
  items: [
    {
      id: 'manage-orders',
      label: 'manageOrders',
      path: '/app/orders',
      icon: <ShoppingCart size={12} />
    },
    {
      id: 'returns',
      label: 'returns',
      path: '/app/orders/returns',
      icon: <ShoppingCart size={12} />
    },
    {
      id: 'order-reports',
      label: 'orderReports',
      path: '/app/orders/reports',
      icon: <FileText size={12} />
    }
  ]
};

// Ads 侧边栏配置
export const adsSidebar: SidebarConfig = {
  id: 'ads',
  label: 'advertising',
  items: [
    {
      id: 'campaigns',
      label: 'campaigns',
      path: '/app/ads',
      icon: <Tag size={12} />
    },
    {
      id: 'ad-groups',
      label: 'adGroups',
      path: '/app/ads/groups',
      icon: <Tag size={12} />
    },
    {
      id: 'keywords',
      label: 'keywords',
      path: '/app/ads/keywords',
      icon: <Tag size={12} />
    }
  ]
};

// Performance 侧边栏配置
export const performanceSidebar: SidebarConfig = {
  id: 'performance',
  label: 'performance',
  items: [
    {
      id: 'account-health',
      label: 'accountHealth',
      path: '', // 父菜单项不可导航
      // 移除 activePrefix，父菜单项不应该显示激活状态
      icon: <Activity size={12} />,
      children: [
        {
          id: 'account-health-overview',
          label: 'Account Health',
          path: '/app/performance',
        },
        {
          id: 'customer-service-performance',
          label: 'Customer Service Performance',
          path: '/app/performance/customer-service',
        },
        {
          id: 'product-policy-compliance',
          label: 'Product Policy Compliance',
          path: '/app/performance/product-policy',
        },
        {
          id: 'shipping-performance',
          label: 'Shipping Performance',
          path: '/app/performance/shipping',
        },
        {
          id: 'reports',
          label: 'Reports',
          path: '/app/performance/reports',
        },
        {
          id: 'eligibilities',
          label: 'Eligibilities',
          path: '/app/performance/eligibilities',
        },
        {
          id: 'voice-of-customer',
          label: 'Voice of the Customer',
          path: '/app/performance/voice-of-customer',
        }
      ]
    },
    {
      id: 'performance-notifications',
      label: 'performanceNotifications',
      path: '/app/performance-notifications',
      icon: <Activity size={12} />
    }
  ]
};

// 根据路径获取对应的侧边栏配置
export const getSidebarByPath = (path: string): SidebarConfig | null => {
  if (path.startsWith('/app/business-reports')) {
    return reportsSidebar;
  }
  if (path.startsWith('/app/settings')) {
    return settingsSidebar;
  }
  if (path.startsWith('/app/inventory')) {
    return inventorySidebar;
  }
  if (path.startsWith('/app/orders')) {
    return ordersSidebar;
  }
  if (path.startsWith('/app/ads')) {
    return adsSidebar;
  }
  // 修复路径匹配逻辑：先检查更具体的路径
  if (path.startsWith('/app/performance-notifications')) {
    return performanceSidebar;
  }
  if (path.startsWith('/app/performance')) {
    return performanceSidebar;
  }
  return null;
};

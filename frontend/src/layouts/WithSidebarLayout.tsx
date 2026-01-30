import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { getSidebarByPath } from '../nav/sidebar.config';
import { cn } from '../utils/cn';
import { Menu } from 'lucide-react';

const WithSidebarLayout: React.FC = () => {
  const location = useLocation();
  const sidebarConfig = getSidebarByPath(location.pathname);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // 当路径变化时，重置侧边栏状态
  useEffect(() => {
    setIsSidebarCollapsed(false);
  }, [location.pathname]);

  return (
    <div className="flex h-full">
      {/* Sidebar - only show if config exists and not collapsed */}
      {sidebarConfig && !isSidebarCollapsed && (
        <aside className="w-[260px] min-w-[260px] bg-[#EEF0F3] border-r border-gray-200 shrink-0 sticky top-0 h-screen overflow-hidden">
          <Sidebar
            config={sidebarConfig}
            onClose={() => setIsSidebarCollapsed(true)}
          />
        </aside>
      )}

      {/* Main content - no p-6 to allow stretched look like VOC */}
      <main
        className={cn(
          "flex-1 transition-all duration-300",
          (sidebarConfig && !isSidebarCollapsed) ? "" : "w-full"
        )}
      >
        <Outlet />
      </main>
    </div>
  );
};

export default WithSidebarLayout;
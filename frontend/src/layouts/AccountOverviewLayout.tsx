
import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { cn } from '../utils/cn';
import { AlertTriangle, ChevronRight, Layout, Info, User, Landmark, ShieldCheck, FileText, Settings } from 'lucide-react';

const AccountOverviewLayout: React.FC = () => {
  const navItems = [
    { label: 'Account Overview', path: '/app/settings/store-status', icon: <Layout size={14}/> },
    { label: 'Store Info', path: '/app/settings/store-info', icon: <Settings size={14}/> },
    { label: 'Payment Information', path: '/app/settings/payment-info', icon: <Landmark size={14}/> },
    { label: 'Business Information', path: '/app/settings/business-info', icon: <ShieldCheck size={14}/> },
    { label: 'Shipping and Returns Information', path: '/app/settings/shipping-returns', icon: <FileText size={14}/> },
    { label: 'Tax Information', path: '/app/settings/tax-info', icon: <FileText size={14}/> },
    { label: 'Account management', path: '/app/settings/account-management', icon: <User size={14}/> },
  ];

  return (
    <div className="max-w-[1440px] mx-auto animate-fade-in">
      {/* Verification Banner */}
      <div className="mb-6 bg-white border border-[#D5D9D9] p-5 rounded-[4px] shadow-sm flex items-start gap-4">
        <AlertTriangle className="text-[#C40000] shrink-0 mt-0.5" size={20} />
        <div className="flex-1">
          <p className="text-[17px] font-bold text-[#0F1111]">You currently have limited access to Amazon selling services.</p>
          <p className="text-[13px] text-[#565959] mt-1 leading-relaxed">
            To comply with regulations, Amazon needs to collect and verify information about your Selling on Amazon account. Currently, you have one or more verification action items pending. 
            Please go to below link to provide information and continue the verification: <a href="#" className="amz-link font-bold underline">Identity Information</a>
          </p>
          <div className="mt-4">
             <button className="bg-[#008296] text-white font-bold py-1 px-6 rounded-sm text-xs shadow-sm hover:bg-[#007185]">Canada</button>
          </div>
        </div>
      </div>

      <div className="flex gap-6 items-start">
        {/* Left Settings Sidebar */}
        <aside className="w-72 shrink-0 bg-[#F7FAFA] border border-[#D5D9D9] rounded-[4px] overflow-hidden sticky top-32">
          <nav className="divide-y divide-gray-100">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  cn(
                    "flex items-center justify-between px-4 py-3.5 text-sm-amz transition-all border-l-[4px]",
                    isActive
                      ? "bg-white text-amazon-teal border-amazon-teal font-bold shadow-sm"
                      : "text-[#565959] border-transparent hover:bg-gray-50 hover:text-amazon-link"
                  )
                }
              >
                <div className="flex items-center gap-3">
                   <span className="opacity-60">{item.icon}</span>
                   <span>{item.label}</span>
                </div>
                <ChevronRight size={14} className="opacity-30" />
              </NavLink>
            ))}
          </nav>
        </aside>

        {/* Settings Content Area */}
        <main className="flex-1 min-w-0 space-y-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AccountOverviewLayout;

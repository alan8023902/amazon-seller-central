import React from 'react';
import { Card } from '../components/UI';
import { User, Shield, Key, Settings, CheckCircle2, ChevronRight } from 'lucide-react';

const AccountManagement: React.FC = () => {
  const accountSections = [
    {
      name: 'User Permissions',
      description: 'Manage user access to your Amazon seller account.',
      icon: <User size={20} />,
      path: '/app/settings/account-management/user-permissions',
    },
    {
      name: 'Login Settings',
      description: 'Manage your login credentials and two-step verification.',
      icon: <Key size={20} />,
      path: '/app/settings/account-management/login-settings',
    },
    {
      name: 'Account Security',
      description: 'Review and update your account security settings.',
      icon: <Shield size={20} />,
      path: '/app/settings/account-management/security',
    },
    {
      name: 'Notification Preferences',
      description: 'Set up notifications for account activity and performance.',
      icon: <Settings size={20} />,
      path: '/app/settings/account-management/notifications',
    },
  ];

  return (
    <div className="max-w-4xl animate-in fade-in duration-300">
      <h1 className="text-[22px] font-bold text-[#0F1111] mb-6 uppercase tracking-tight">Account Management</h1>

      <div className="space-y-6">
        {/* Account Management Overview */}
        <Card title="Account Management Overview">
          <div className="p-1">
            <div className="text-[13px] text-[#565959] leading-relaxed mb-4">
              Manage your account settings, user permissions, and security preferences to keep your seller account secure and organized.
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {accountSections.map((section, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-[#F7F8FA] rounded-[4px] border border-[#D5D9D9] hover:border-[#008296] cursor-pointer transition-colors">
                  <div className="text-[#008296] mt-0.5">{section.icon}</div>
                  <div className="flex-1">
                    <div className="font-bold text-[14px] mb-1">{section.name}</div>
                    <div className="text-[12px] text-[#565959] mb-2">{section.description}</div>
                  </div>
                  <ChevronRight size={16} className="text-[#D5D9D9] mt-1" />
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Account Activity */}
        <Card title="Recent Account Activity" headerAction={<button className="text-[13px] text-amazon-link font-bold hover:underline">View All Activity</button>}>
          <div className="p-1">
            <div className="overflow-x-auto">
              <table className="w-full text-[13px]">
                <thead className="bg-[#F0F2F2] border-b border-[#D5D9D9]">
                  <tr>
                    <th className="py-2 px-4 text-left font-bold text-[#565959] uppercase text-[11px]">Date</th>
                    <th className="py-2 px-4 text-left font-bold text-[#565959] uppercase text-[11px]">Activity</th>
                    <th className="py-2 px-4 text-left font-bold text-[#565959] uppercase text-[11px]">IP Address</th>
                    <th className="py-2 px-4 text-left font-bold text-[#565959] uppercase text-[11px]">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#D5D9D9]">
                  <tr className="hover:bg-[#F0F2F2]">
                    <td className="py-3 px-4">2026-01-11 14:30</td>
                    <td className="py-3 px-4">Login to Seller Central</td>
                    <td className="py-3 px-4">192.168.1.1</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5">
                        <CheckCircle2 size={14} className="text-[#007600]" />
                        <span className="text-[11px] font-bold text-[#007600]">Successful</span>
                      </div>
                    </td>
                  </tr>
                  <tr className="hover:bg-[#F0F2F2]">
                    <td className="py-3 px-4">2026-01-11 10:15</td>
                    <td className="py-3 px-4">Updated payment information</td>
                    <td className="py-3 px-4">192.168.1.1</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5">
                        <CheckCircle2 size={14} className="text-[#007600]" />
                        <span className="text-[11px] font-bold text-[#007600]">Successful</span>
                      </div>
                    </td>
                  </tr>
                  <tr className="hover:bg-[#F0F2F2]">
                    <td className="py-3 px-4">2026-01-10 16:45</td>
                    <td className="py-3 px-4">Viewed business reports</td>
                    <td className="py-3 px-4">192.168.1.1</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5">
                        <CheckCircle2 size={14} className="text-[#007600]" />
                        <span className="text-[11px] font-bold text-[#007600]">Successful</span>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </Card>

        {/* Security Tips */}
        <Card title="Account Security Tips">
          <div className="p-1">
            <div className="text-[13px] text-[#565959] leading-relaxed mb-4">
              Follow these best practices to keep your seller account secure:
            </div>
            
            <ul className="space-y-2">
              <li className="flex items-start gap-2 text-[13px] text-[#565959]">
                <CheckCircle2 size={14} className="text-[#007600] mt-1 flex-shrink-0" />
                <span>Enable two-step verification for added security</span>
              </li>
              <li className="flex items-start gap-2 text-[13px] text-[#565959]">
                <CheckCircle2 size={14} className="text-[#007600] mt-1 flex-shrink-0" />
                <span>Use strong, unique passwords for your account</span>
              </li>
              <li className="flex items-start gap-2 text-[13px] text-[#565959]">
                <CheckCircle2 size={14} className="text-[#007600] mt-1 flex-shrink-0" />
                <span>Review account activity regularly for unauthorized access</span>
              </li>
              <li className="flex items-start gap-2 text-[13px] text-[#565959]">
                <CheckCircle2 size={14} className="text-[#007600] mt-1 flex-shrink-0" />
                <span>Keep your contact information up to date</span>
              </li>
            </ul>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AccountManagement;

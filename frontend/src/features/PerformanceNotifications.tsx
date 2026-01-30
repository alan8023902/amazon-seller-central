
import React from 'react';
import { Bell, AlertCircle, Info, ChevronRight, Search, Filter, MailOpen, Mail } from 'lucide-react';
import { Card, Button } from '../components/UI';

const PerformanceNotifications: React.FC = () => {
  const notifications = [
    { id: 1, title: 'Your Selling on Amazon payment account', date: 'Mar 12, 2024', read: false, type: 'Policy' },
    { id: 2, title: 'Action Required: Verify your selling account', date: 'Mar 08, 2024', read: true, type: 'Verification' },
    { id: 3, title: 'Notification of Restricted Products Policy Violation', date: 'Feb 25, 2024', read: true, type: 'Warning' },
    { id: 4, title: 'Changes to FBA storage fees', date: 'Feb 10, 2024', read: true, type: 'General' },
  ];

  return (
    <div className="animate-in fade-in duration-500 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Performance Notifications</h1>
        <div className="text-xs-amz text-amazon-link font-bold hover:underline cursor-pointer flex items-center gap-1">
          <Info size={14} /> Help with notifications
        </div>
      </div>

      <Card className="!p-0 overflow-hidden shadow-md">
        <div className="p-4 border-b bg-gray-50 flex items-center justify-between">
           <div className="flex items-center gap-4">
              <div className="relative">
                <input 
                  className="border border-gray-300 rounded-sm py-1.5 pl-10 pr-4 text-sm-amz w-80 amz-input-focus"
                  placeholder="Search notifications"
                />
                <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
              </div>
              <Button variant="white" className="w-auto px-4 font-bold h-8.5 flex items-center gap-2">
                <Filter size={14} /> Filters
              </Button>
           </div>
           <div className="text-xs-amz text-gray-500 font-bold">
             Page 1 of 1
           </div>
        </div>

        <div className="divide-y divide-gray-100">
          {notifications.map(n => (
            <div key={n.id} className={`p-4 flex items-start gap-4 hover:bg-gray-50 cursor-pointer transition-colors ${!n.read ? 'bg-blue-50/30' : ''}`}>
              <div className="mt-1 shrink-0">
                {n.read ? <MailOpen size={18} className="text-gray-400" /> : <Mail size={18} className="text-amazon-teal" />}
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start mb-1">
                  <h4 className={`text-sm-amz ${!n.read ? 'font-bold text-amazon-text' : 'text-gray-700'}`}>
                    {n.title}
                  </h4>
                  <span className="text-[11px] text-gray-400 font-medium">{n.date}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase font-black tracking-widest text-gray-400">{n.type}</span>
                  {!n.read && <span className="w-1.5 h-1.5 bg-amazon-teal rounded-full" />}
                </div>
              </div>
              <ChevronRight size={16} className="text-gray-300 self-center" />
            </div>
          ))}
        </div>
      </Card>

      <div className="mt-10 p-6 bg-white border border-dashed border-gray-300 rounded-sm text-center">
         <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Bell className="text-gray-200" size={32} />
         </div>
         <h3 className="text-base-amz font-bold text-gray-400">No new critical notifications</h3>
         <p className="text-xs text-gray-400 mt-1">We'll alert you here if there are any issues affecting your account performance or status.</p>
      </div>
    </div>
  );
};

export default PerformanceNotifications;

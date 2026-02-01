
import React from 'react';
import { Card, Button } from '../components/UI';
import { CreditCard, Landmark, ChevronRight, Info, AlertCircle } from 'lucide-react';
import { useI18n } from '../hooks/useI18n';

const PaymentInfo: React.FC = () => {
  const { t } = useI18n();

  return (
    <div className="max-w-4xl animate-in fade-in duration-300">
      <h1 className="text-[22px] font-bold text-[#0F1111] mb-6 uppercase tracking-tight">Payment Information</h1>

      <div className="space-y-6">
        {/* Deposit Methods Section */}
        <Card title="Deposit Methods" headerAction={<button className="text-[13px] text-amazon-link font-bold hover:underline">Manage Deposit Methods</button>}>
          <div className="p-1">
            <p className="text-[13px] text-[#565959] mb-6">
              You must specify a bank account to your seller account before you can receive payments.
            </p>
            
            <div className="border border-[#D5D9D9] rounded-[4px] overflow-hidden">
              <table className="w-full text-[13px]">
                <thead className="bg-[#F0F2F2] border-b border-[#D5D9D9]">
                  <tr>
                    <th className="py-2 px-4 text-left font-bold text-[#565959] uppercase text-[11px]">Marketplace</th>
                    <th className="py-2 px-4 text-left font-bold text-[#565959] uppercase text-[11px]">Bank Account</th>
                    <th className="py-2 px-4 text-right font-bold text-[#565959] uppercase text-[11px]">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#D5D9D9]">
                  <tr className="hover:bg-[#F0F2F2] cursor-pointer">
                    <td className="py-3 px-4 font-bold text-amazon-link">Amazon.com (US)</td>
                    <td className="py-3 px-4">JP MORGAN CHASE (...4117)</td>
                    <td className="py-3 px-4 text-right">
                       <span className="text-[#007600] font-bold">Verified</span>
                    </td>
                  </tr>
                  <tr className="hover:bg-[#F0F2F2] cursor-pointer">
                    <td className="py-3 px-4 font-bold text-amazon-link">Amazon.co.jp</td>
                    <td className="py-3 px-4">Mizuho Bank (...8802)</td>
                    <td className="py-3 px-4 text-right">
                       <span className="text-[#007600] font-bold">Verified</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </Card>

        {/* Charge Methods Section */}
        <Card title="Charge Methods" headerAction={<button className="text-[13px] text-amazon-link font-bold hover:underline">Manage Charge Methods</button>}>
          <div className="p-1">
            <div className="flex items-start gap-4 p-4 bg-[#F7FAFA] border border-[#D5D9D9] rounded-[4px]">
               <CreditCard className="text-[#565959] mt-1" size={24} />
               <div className="flex-1">
                  <div className="font-bold text-[14px]">Visa ending in 4117</div>
                  <div className="text-[12px] text-[#565959] mt-0.5">Expires 12/2028</div>
                  <div className="mt-3 flex items-center gap-2">
                     <span className="text-[11px] bg-[#007600] text-white px-1.5 py-0.5 rounded-sm font-black uppercase">Active</span>
                     <span className="text-[11px] text-[#565959]">Used for subscription fees and advertising</span>
                  </div>
               </div>
               <ChevronRight size={20} className="text-[#D5D9D9]" />
            </div>
          </div>
        </Card>

        {/* Alert Card */}
        <div className="bg-[#FFF4F4] border border-[#C40000]/20 p-4 rounded-[4px] flex items-start gap-3">
           <AlertCircle className="text-[#C40000] shrink-0" size={18} />
           <div>
              <p className="text-[13px] font-bold text-[#0F1111]">Verify your credit card information</p>
              <p className="text-[12px] text-[#565959] mt-1 leading-relaxed">
                If your card has expired or been replaced, please update it immediately to avoid disruptions in your selling services. 
                <a href="#" className="text-amazon-link hover:underline ml-1">Learn more about valid charge methods.</a>
              </p>
           </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentInfo;

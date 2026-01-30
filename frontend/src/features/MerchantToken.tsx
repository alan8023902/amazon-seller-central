
import React from 'react';
import { Card, Button } from '../components/UI';
import { Info, Copy } from 'lucide-react';

const MerchantToken: React.FC = () => {
  const token = "A3N9Z6EXAMPLE4117";

  const copyToClipboard = () => {
    navigator.clipboard.writeText(token);
    alert('Merchant Token copied to clipboard');
  };

  return (
    <div className="max-w-3xl animate-in fade-in duration-300">
      <h1 className="text-[22px] font-bold text-[#0F1111] mb-6 uppercase tracking-tight">Merchant Token</h1>

      <Card>
         <div className="p-2">
            <p className="text-[13px] text-[#565959] leading-relaxed mb-8">
               Your Merchant Token is a unique identifier used by developers and third-party applications to interact with your Amazon Seller account via APIs. 
               <span className="font-bold text-[#0F1111]"> Do not share this token with unauthorized parties.</span>
            </p>

            <div className="bg-[#F7FAFA] border border-[#D5D9D9] p-6 rounded-[4px] flex flex-col items-center">
               <div className="text-[11px] font-black text-[#565959] uppercase tracking-[0.2em] mb-3">Your Secure Merchant Token</div>
               <div className="text-[24px] font-mono font-black text-[#0F1111] tracking-wider mb-6 select-all">
                  {token}
               </div>
               <Button onClick={copyToClipboard} variant="white" className="w-auto px-8 font-bold flex items-center gap-2 h-10 shadow-sm border-[#ADB1B8]">
                  <Copy size={16} /> Copy Token
               </Button>
            </div>

            <div className="mt-10 pt-6 border-t border-[#EDF0F0]">
               <h4 className="text-[13px] font-bold text-[#0F1111] mb-2 flex items-center gap-2">
                  <Info size={16} className="text-amazon-teal" /> Need Help?
               </h4>
               <p className="text-[12px] text-[#565959]">
                  If you are integrating a third-party service, they will typically ask for this token along with your Marketplace ID. 
                  <a href="#" className="text-amazon-link hover:underline ml-1">Visit the Developer Documentation for more details.</a>
               </p>
            </div>
         </div>
      </Card>
    </div>
  );
};

export default MerchantToken;

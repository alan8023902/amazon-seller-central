
import React from 'react';
import { Card } from '../components/UI';
// Fix: Import ChevronRight from lucide-react
import { CheckCircle2, Globe, HelpCircle, ChevronRight } from 'lucide-react';
import { cn } from '../utils/cn';

const StoreStatus: React.FC = () => {
  const regions = [
    {
      name: 'Americas',
      marketplaces: [
        { name: 'Mexico', status: 'Inactive', color: 'text-orange-600' },
        { name: 'Canada', status: 'Active', color: 'text-amazon-success' },
        { name: 'Brazil', status: 'Inactive', color: 'text-orange-600' },
        { name: 'United States', status: 'Active', color: 'text-amazon-success' },
      ]
    },
    {
      name: 'Asia-Pacific',
      marketplaces: [
        { name: 'Japan', status: 'Active', color: 'text-amazon-success' },
        { name: 'Australia', status: 'Active', color: 'text-amazon-success' },
      ]
    },
    {
      name: 'Europe',
      marketplaces: [
        { name: 'France', status: 'Active', color: 'text-amazon-success' },
      ]
    }
  ];

  const services = [
    { name: 'Selling On Amazon', status: 'Registered', color: 'bg-[#007600]' },
    { name: 'Amazon Pay', status: 'Not registered', color: 'bg-[#37475A]' },
    { name: 'Sponsored Products', status: 'Registered', color: 'bg-[#007600]' },
    { name: 'Customer Service by Amazon', status: 'Registered', color: 'bg-[#007600]' },
    { name: 'Fulfillment by Amazon', status: 'Registered', color: 'bg-[#007600]' },
    { name: 'Amazon Business (B2B)', status: 'Registered', color: 'bg-[#007600]' },
  ];

  return (
    <div className="grid grid-cols-12 gap-6 pb-20">
      {/* Left Column: Store Status Table */}
      <div className="col-span-12 lg:col-span-7">
        <Card title="Store Status" className="!p-0 border-amazon-border overflow-hidden" headerAction={<button className="text-amazon-link text-xs-amz font-bold">Vacation Settings</button>}>
           <div className="p-5 border-b border-gray-100">
             <p className="text-xs-amz text-amazon-secondaryText leading-relaxed">
               If you are preparing to leave on vacation, or if you would like to temporarily remove your open listings from the Amazon stores, use this feature. Any Buyer-Seller message received while on vacation will still require a response in 24 hours.
               <br/><a href="#" className="amz-link">Learn more about listing a status for vacation, holidays, and other absences.</a>
             </p>
           </div>
           
           <div className="overflow-x-auto">
             <table className="w-full text-sm-amz">
                <thead className="bg-[#F0F2F2] text-[11px] font-bold text-[#565959] uppercase">
                   <tr>
                      <th className="py-2 px-5 text-left border-b border-gray-200">Country</th>
                      <th className="py-2 px-5 text-left border-b border-gray-200 flex items-center gap-1">Listing Status <HelpCircle size={10}/></th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                   {regions.map(region => (
                     <React.Fragment key={region.name}>
                       <tr className="bg-gray-50/50"><td colSpan={2} className="px-5 py-2 text-[11px] font-black text-gray-400 uppercase tracking-widest">{region.name}</td></tr>
                       {region.marketplaces.map(m => (
                         <tr key={m.name} className="hover:bg-gray-50">
                            <td className="px-10 py-3.5 flex items-center gap-3">
                               <span className="text-lg">{m.name === 'United States' ? '🇺🇸' : m.name === 'Mexico' ? '🇲🇽' : m.name === 'Canada' ? '🇨🇦' : m.name === 'Brazil' ? '🇧🇷' : m.name === 'Japan' ? '🇯🇵' : m.name === 'Australia' ? '🇦🇺' : '🇫🇷'}</span>
                               <span className="font-medium text-gray-700">{m.name}</span>
                            </td>
                            <td className={cn("px-5 py-3.5 font-bold uppercase text-[10px] tracking-widest", m.color)}>{m.status}</td>
                         </tr>
                       ))}
                     </React.Fragment>
                   ))}
                </tbody>
             </table>
           </div>
        </Card>
      </div>

      {/* Right Column: Manage Your Services List */}
      <div className="col-span-12 lg:col-span-5">
        <Card title="Manage Your Services" className="border-amazon-border">
           <p className="text-[13px] text-amazon-secondaryText mb-6">You can manage your existing services and register for new services to grow your business.</p>
           
           <div className="space-y-4">
              {services.map((s, i) => (
                <div key={i} className="flex flex-col py-3 border-b border-gray-100 last:border-0 group">
                   <div className="flex justify-between items-center mb-1">
                      <span className="text-[15px] font-bold text-[#0F1111] group-hover:text-amazon-teal transition-colors">{s.name}</span>
                      <div className={cn("px-2 py-0.5 rounded-full text-white text-[9px] font-black uppercase flex items-center gap-1", s.color)}>
                         {s.status === 'Registered' && <div className="w-3 h-3 bg-white rounded-full flex items-center justify-center"><CheckCircle2 size={8} className="text-[#007600]"/></div>}
                         {s.status}
                         <ChevronRight size={10} />
                      </div>
                   </div>
                   <div className="text-[11px] text-[#565959]">Professional Registered in {i % 2 === 0 ? '16' : '1'} countries</div>
                </div>
              ))}
           </div>
           
           <div className="mt-8 pt-4 border-t border-gray-100">
              <button className="text-amazon-link font-bold text-[12px] hover:underline">Add More Services ›</button>
           </div>
        </Card>
      </div>
    </div>
  );
};

export default StoreStatus;


import React from 'react';
import { Store, Layout, Edit, Globe, ChevronRight, HelpCircle, ExternalLink, Image as ImageIcon } from 'lucide-react';
import { Card, Button } from '../components/UI';
import { useI18n } from '../hooks/useI18n';

const ManageStores: React.FC = () => {
  const { t } = useI18n();
  
  return (
    <div className="max-w-5xl mx-auto animate-in fade-in duration-500 pb-20">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">{t('manageStores')}</h1>
        <button className="flex items-center gap-1 text-xs-amz text-amazon-link hover:underline font-bold">
          <HelpCircle size={14} /> Storefront help
        </button>
      </div>

      <Card className="bg-amazon-dark text-white mb-8 !p-10 relative overflow-hidden rounded-md border-0">
         <div className="relative z-10 max-w-2xl">
            <h2 className="text-2xl font-black mb-3 tracking-tight">Showcase your brand with a Store</h2>
            <p className="text-sm opacity-90 mb-8 leading-relaxed">A Store is your brand's home on Amazon. It's a free, self-service destination to inspire customers and help them discover your complete product range.</p>
            <div className="flex gap-4">
               <Button className="w-auto px-8 py-2.5 font-bold text-amazon-text h-auto shadow-xl">Manage your Store</Button>
               <Button variant="white" className="w-auto px-8 py-2.5 font-bold bg-transparent text-white border-white/40 hover:bg-white/10 h-auto">View Store insights</Button>
            </div>
         </div>
         <Store size={220} className="absolute -right-16 -bottom-16 text-white/5 rotate-12" />
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
         <div className="lg:col-span-8 space-y-6">
            <Card title="Active Storefronts" className="shadow-sm">
               <div className="flex items-center gap-6">
                  <div className="w-24 h-24 bg-gray-50 border rounded-sm flex items-center justify-center shrink-0">
                     <ImageIcon className="text-gray-200" size={40} />
                  </div>
                  <div className="flex-1">
                     <div className="flex justify-between items-start">
                        <div>
                           <h3 className="font-bold text-lg leading-tight">EnShZhiXun Official Store</h3>
                           <div className="flex items-center gap-2 text-xs text-amazon-teal font-bold mt-1">
                              <Globe size={14} /> amazon.com/enshzhixun
                           </div>
                        </div>
                        <span className="bg-green-100 text-green-800 text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider">Live</span>
                     </div>
                     <div className="flex gap-4 mt-4">
                        <button className="text-xs-amz font-bold text-amazon-link hover:underline flex items-center gap-1">
                           <Edit size={14} /> Edit Store
                        </button>
                        <div className="w-px h-4 bg-gray-200" />
                        <button className="text-xs-amz font-bold text-amazon-link hover:underline flex items-center gap-1">
                           <Layout size={14} /> Version history
                        </button>
                        <div className="w-px h-4 bg-gray-200" />
                        <button className="text-xs-amz font-bold text-amazon-link hover:underline flex items-center gap-1">
                           <ExternalLink size={14} /> Preview
                        </button>
                     </div>
                  </div>
               </div>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <h4 className="font-bold text-sm-amz mb-2">Build brand awareness</h4>
                  <p className="text-xs text-gray-500 leading-relaxed">Use high-quality images and video to tell your brand story and increase customer loyalty.</p>
               </Card>
               <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <h4 className="font-bold text-sm-amz mb-2">Drive traffic</h4>
                  <p className="text-xs text-gray-500 leading-relaxed">Integrate your Store URL in all your Amazon advertising campaigns to improve conversions.</p>
               </Card>
            </div>
         </div>

         <div className="lg:col-span-4">
            <Card title="Store Insights" className="shadow-sm">
               <div className="space-y-6">
                  <div>
                     <div className="text-[11px] text-gray-500 font-bold uppercase mb-1">Store visitors (30d)</div>
                     <div className="text-2xl font-bold">4,120</div>
                     <div className="text-[10px] text-green-600 font-bold mt-1">+12.5% vs previous period</div>
                  </div>
                  <div className="pt-4 border-t">
                     <div className="text-[11px] text-gray-500 font-bold uppercase mb-1">Store Sales (30d)</div>
                     <div className="text-2xl font-bold">$18,450.00</div>
                  </div>
                  <div className="pt-6">
                     <Button variant="white" className="font-bold text-xs py-2 h-auto shadow-sm">View all insights</Button>
                  </div>
               </div>
            </Card>
         </div>
      </div>
    </div>
  );
};

export default ManageStores;

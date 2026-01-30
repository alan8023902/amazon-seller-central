
import React from 'react';
import { Target, TrendingUp, Star } from 'lucide-react';
import { Card, Button } from '../components/UI';
import { useI18n } from '../hooks/useI18n';

const ProductOpportunities: React.FC = () => {
  const { t } = useI18n();

  return (
    <div className="animate-in fade-in duration-500">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">{t('opportunities')}</h1>
        <div className="flex gap-3">
          <button className="text-xs-amz font-bold text-amazon-link hover:underline">{t('nicheResearch')}</button>
          <button className="text-xs-amz font-bold text-amazon-link hover:underline">Selection Advice</button>
        </div>
      </div>

      <Card className="bg-amazon-dark text-white mb-8 !p-8 relative overflow-hidden rounded-md">
         <div className="relative z-10 max-w-xl">
            <h2 className="text-2xl font-bold mb-3">Expand your selection with high-demand products</h2>
            <p className="text-sm opacity-80 mb-6 leading-relaxed">Based on your sales history and customer demand trends, we've identified these opportunities to grow your business in the United States marketplace.</p>
            <Button className="w-auto px-10 py-2.5 font-bold text-amazon-text h-auto">View personalized recommendations</Button>
         </div>
         <Target size={180} className="absolute -right-10 -bottom-10 text-amazon-teal/20 rotate-12" />
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
         <Card title={t('restock')} className="shadow-md">
            <div className="flex gap-4 items-start mb-4">
               <div className="p-3 bg-red-50 text-red-600 rounded">
                  <TrendingUp size={24} />
               </div>
               <div>
                  <h4 className="text-sm-amz font-bold">Out of stock risk</h4>
                  <p className="text-xs text-gray-500 mt-0.5">3 items are projected to sell out within 5 days.</p>
               </div>
            </div>
            <div className="space-y-3">
               {[
                 { name: 'Ergonomic Mouse (BT)', uplift: '+$1,200', days: 2 },
                 { name: 'ANC Headphones', uplift: '+$2,450', days: 4 },
               ].map(item => (
                 <div key={item.name} className="p-3 bg-gray-50 rounded border border-gray-100 flex justify-between items-center group cursor-pointer hover:bg-white transition-all">
                    <div>
                       <div className="text-xs-amz font-bold">{item.name}</div>
                       <div className="text-[10px] text-red-600 font-bold uppercase mt-0.5">{item.days} days left</div>
                    </div>
                    <div className="text-right">
                       <div className="text-xs-amz font-bold text-green-600">{item.uplift}</div>
                       <div className="text-[9px] text-gray-400 uppercase font-black">Est. Sales Uplift</div>
                    </div>
                 </div>
               ))}
            </div>
            <Button variant="white" className="mt-4 text-xs font-bold py-2 shadow-sm">View all restock items</Button>
         </Card>

         <Card title="New Niche Opportunities" className="shadow-md">
            <div className="flex gap-4 items-start mb-4">
               <div className="p-3 bg-amazon-teal/10 text-amazon-teal rounded">
                  <Star size={24} />
               </div>
               <div>
                  <h4 className="text-sm-amz font-bold">Category Trends</h4>
                  <p className="text-xs text-gray-500 mt-0.5">High demand for eco-friendly home office accessories.</p>
               </div>
            </div>
            <div className="space-y-3">
               {[
                 { category: 'Sustainable Keyboards', searchVol: 'High', competition: 'Medium' },
                 { category: 'Bamboo Monitor Stands', searchVol: 'Growing', competition: 'Low' },
               ].map(niche => (
                 <div key={niche.category} className="p-3 bg-gray-50 rounded border border-gray-100 flex justify-between items-center hover:bg-white transition-all cursor-pointer">
                    <div>
                       <div className="text-xs-amz font-bold">{niche.category}</div>
                       <div className="text-[10px] text-gray-500 uppercase mt-0.5">Search Volume: {niche.searchVol}</div>
                    </div>
                    <div className="text-right">
                       <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-tight ${
                         niche.competition === 'Low' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                       }`}>
                          {niche.competition} Competition
                       </span>
                    </div>
                 </div>
               ))}
            </div>
            <Button variant="white" className="mt-4 text-xs font-bold py-2 shadow-sm">Explore Niche Finder</Button>
         </Card>
      </div>
    </div>
  );
};

export default ProductOpportunities;


import React from 'react';
import { Search, TrendingUp, BarChart3, Users, ExternalLink, HelpCircle, ChevronDown, Download } from 'lucide-react';
import { Card, Button } from '../components/UI';

const Analytics: React.FC = () => {
  const topSearchTerms = [
    { term: '4k smart projector', rank: 1, clickShare: '12.4%', convShare: '8.2%' },
    { term: 'ergonomic mouse wireless', rank: 2, clickShare: '9.8%', convShare: '11.5%' },
    { term: 'mechanical keyboard gaming', rank: 3, clickShare: '7.5%', convShare: '6.9%' },
    { term: 'noise cancelling headphones', rank: 4, clickShare: '5.2%', convShare: '4.8%' },
    { term: 'usb-c docking station', rank: 5, clickShare: '4.1%', convShare: '3.9%' },
  ];

  return (
    <div className="animate-in fade-in duration-500">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Brand Analytics</h1>
        <div className="flex gap-2">
           <button className="flex items-center gap-1 text-xs-amz text-amazon-link hover:underline font-bold">
             <HelpCircle size={14} /> Learn more
           </button>
           <Button variant="white" className="w-auto px-4 font-bold h-8 flex items-center gap-2">
             <Download size={14} /> Export report
           </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="border-l-4 border-l-amazon-teal shadow-sm">
          <div className="flex items-center gap-3 mb-3">
             <Search className="text-amazon-teal" size={20} />
             <h3 className="font-bold text-sm-amz">Amazon Search Terms</h3>
          </div>
          <p className="text-xs text-gray-600 mb-4">Discover what products are winning the most clicks and conversions for the most popular search terms.</p>
          <Button variant="white" className="text-xs font-bold py-1.5 h-auto">Search Terms Report</Button>
        </Card>
        
        <Card className="border-l-4 border-l-blue-500 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
             <Users className="text-blue-500" size={20} />
             <h3 className="font-bold text-sm-amz">Market Basket Analysis</h3>
          </div>
          <p className="text-xs text-gray-600 mb-4">Identify which products your customers are buying together to improve your bundling strategy.</p>
          <Button variant="white" className="text-xs font-bold py-1.5 h-auto">View Basket Data</Button>
        </Card>

        <Card className="border-l-4 border-l-orange-500 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
             <TrendingUp className="text-orange-500" size={20} />
             <h3 className="font-bold text-sm-amz">Repeat Purchase Behavior</h3>
          </div>
          <p className="text-xs text-gray-600 mb-4">Analyze how many customers are making repeat purchases for your brand's products.</p>
          <Button variant="white" className="text-xs font-bold py-1.5 h-auto">Repeat Purchase Report</Button>
        </Card>
      </div>

      <Card title="Top Amazon Search Terms - Current Week" className="!p-0 overflow-hidden shadow-md">
        <div className="bg-gray-50 p-4 border-b flex items-center justify-between">
           <div className="flex items-center gap-4">
              <div className="relative">
                <input className="border border-gray-300 rounded-sm py-1.5 pl-10 pr-4 text-sm-amz w-80 amz-input-focus" placeholder="Search for terms or ASINs" />
                <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
              </div>
           </div>
        </div>
        <table className="w-full text-xs-amz">
          <thead>
            <tr className="bg-white border-b text-gray-500 font-bold uppercase text-[10px] tracking-wider">
              <th className="px-6 py-4 text-left">Search Term</th>
              <th className="px-6 py-4 text-center">Search Frequency Rank</th>
              <th className="px-6 py-4 text-center">#1 Clicked ASIN</th>
              <th className="px-6 py-4 text-right">Click Share</th>
              <th className="px-6 py-4 text-right">Conversion Share</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {topSearchTerms.map(row => (
              <tr key={row.term} className="hover:bg-gray-50">
                <td className="px-6 py-4 font-bold text-amazon-text">{row.term}</td>
                <td className="px-6 py-4 text-center font-medium">#{row.rank}</td>
                <td className="px-6 py-4 text-center">
                   <div className="text-amazon-link font-bold hover:underline cursor-pointer">B0CP5W1RVX</div>
                   <div className="text-[10px] text-gray-400 mt-0.5">Brand: Generic</div>
                </td>
                <td className="px-6 py-4 text-right font-bold text-amazon-teal">{row.clickShare}</td>
                <td className="px-6 py-4 text-right font-bold text-amazon-text">{row.convShare}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="p-4 bg-gray-50 text-right">
           <button className="text-xs-amz text-amazon-link font-bold hover:underline">View full report ›</button>
        </div>
      </Card>
    </div>
  );
};

export default Analytics;

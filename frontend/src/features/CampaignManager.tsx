
import React, { useState, useEffect } from 'react';
import { 
  BarChart2, TrendingUp, DollarSign, Target, Plus, 
  HelpCircle, ChevronDown, Filter, Search 
} from 'lucide-react';
import { Card, Button } from '../components/UI';
import { useStore } from '../store';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend 
} from 'recharts';
import { useI18n } from '../hooks/useI18n';

const data = [
  { name: 'Mar 1', spend: 45, sales: 120 },
  { name: 'Mar 2', spend: 52, sales: 180 },
  { name: 'Mar 3', spend: 48, sales: 150 },
  { name: 'Mar 4', spend: 70, sales: 310 },
  { name: 'Mar 5', spend: 65, sales: 280 },
  { name: 'Mar 6', spend: 58, sales: 240 },
  { name: 'Mar 7', spend: 62, sales: 290 },
];

const CampaignManager: React.FC = () => {
  const { t } = useI18n();
  const { currentStore } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [campaigns, setCampaigns] = useState([
    { name: 'SP - Projector - Auto', status: 'Delivering', type: 'Sponsored Products', budget: '$25.00', spend: '$42.10', sales: '$189.90', acos: '22.1%' },
    { name: 'SB - Brand Store - Video', status: 'Delivering', type: 'Sponsored Brands', budget: '$50.00', spend: '$120.45', sales: '$650.00', acos: '18.5%' },
    { name: 'SP - Mouse - Manual Exact', status: 'Paused', type: 'Sponsored Products', budget: '$15.00', spend: '$8.30', sales: '$45.98', acos: '18.1%' },
    { name: 'SD - Retargeting - High Intent', status: 'Delivering', type: 'Sponsored Display', budget: '$30.00', spend: '$171.27', sales: '$684.12', acos: '25.0%' },
  ]);
  const [filteredCampaigns, setFilteredCampaigns] = useState(campaigns);
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  // Handle search functionality
  const handleSearch = () => {
    let filtered = campaigns;

    // Apply search term filter
    if (searchTerm.trim()) {
      filtered = filtered.filter(campaign => 
        campaign.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        campaign.type.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter) {
      filtered = filtered.filter(campaign => campaign.status === statusFilter);
    }

    // Apply type filter
    if (typeFilter) {
      filtered = filtered.filter(campaign => campaign.type === typeFilter);
    }

    setFilteredCampaigns(filtered);
  };

  // Handle clear filters
  const handleClearFilters = () => {
    setSearchTerm('');
    setStatusFilter('');
    setTypeFilter('');
    setFilteredCampaigns(campaigns);
  };

  // Auto-search when filters change
  useEffect(() => {
    handleSearch();
  }, [searchTerm, statusFilter, typeFilter, campaigns]);

  // Handle search input change
  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleSearchKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="animate-in fade-in duration-500">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">{t('ads')}</h1>
        <div className="flex gap-2 flex-shrink-0">
          <Button variant="white" className="px-4 font-bold flex items-center gap-2 whitespace-nowrap">
            <Target size={14} /> Portfolios
          </Button>
          <Button className="px-6 font-bold flex items-center gap-2 whitespace-nowrap">
            <Plus size={16} /> Create campaign
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {[
          { label: 'Spend', value: '$342.12', trend: '+12%', icon: <DollarSign size={20} className="text-gray-400" /> },
          { label: 'Sales', value: '$1,570.00', trend: '+18%', icon: <TrendingUp size={20} className="text-green-500" /> },
          { label: 'ROAS', value: '4.59', trend: '+5%', icon: <Target size={20} className="text-amazon-teal" /> },
          { label: 'ACOS', value: '21.79%', trend: '-2%', icon: <BarChart2 size={20} className="text-blue-500" /> },
        ].map(stat => (
          <Card key={stat.label} className="shadow-sm">
            <div className="flex justify-between items-start mb-2">
              <span className="text-xs-amz font-bold text-gray-500 uppercase">{stat.label}</span>
              {stat.icon}
            </div>
            <div className="text-2xl font-bold mb-1">{stat.value}</div>
            <div className={`text-xs font-bold ${stat.trend.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
              {stat.trend} vs last 7 days
            </div>
          </Card>
        ))}
      </div>

      <Card className="mb-8 shadow-md" title="Advertising Performance Over Time">
        <div className="h-80 w-full mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
              <XAxis dataKey="name" fontSize={11} axisLine={false} tickLine={false} dy={10} />
              <YAxis fontSize={11} axisLine={false} tickLine={false} dx={-10} />
              <Tooltip 
                contentStyle={{ borderRadius: '4px', border: '1px solid #d5d9d9', fontSize: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                itemStyle={{ fontWeight: 'bold' }}
              />
              <Legend verticalAlign="top" height={36} iconType="circle" />
              <Line type="monotone" dataKey="sales" name="Sales" stroke="#007185" strokeWidth={3} dot={{ r: 4, fill: '#007185' }} activeDot={{ r: 6 }} />
              <Line type="monotone" dataKey="spend" name="Spend" stroke="#f0c14b" strokeWidth={3} dot={{ r: 4, fill: '#f0c14b' }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card className="!p-0 overflow-hidden shadow-md">
        <div className="p-4 border-b bg-gray-50 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              <input 
                className="border border-gray-300 rounded-sm py-1.5 pl-10 pr-4 text-sm-amz w-64 amz-input-focus"
                placeholder="Find a campaign"
                value={searchTerm}
                onChange={handleSearchInputChange}
                onKeyPress={handleSearchKeyPress}
              />
              <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
            </div>
            <div className="flex gap-2">
              <select 
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border border-gray-300 rounded-sm py-1.5 px-3 text-sm-amz amz-input-focus"
              >
                <option value="">All Status</option>
                <option value="Delivering">Delivering</option>
                <option value="Paused">Paused</option>
                <option value="Ended">Ended</option>
              </select>
              <select 
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="border border-gray-300 rounded-sm py-1.5 px-3 text-sm-amz amz-input-focus"
              >
                <option value="">All Types</option>
                <option value="Sponsored Products">Sponsored Products</option>
                <option value="Sponsored Brands">Sponsored Brands</option>
                <option value="Sponsored Display">Sponsored Display</option>
              </select>
              <Button 
                variant="white" 
                className="w-auto px-4 font-bold flex items-center gap-2 py-1.5"
                onClick={handleClearFilters}
              >
                Clear Filters
              </Button>
            </div>
          </div>
          <div className="text-xs-amz text-gray-500 font-bold flex items-center gap-1">
            <HelpCircle size={14} /> Help with columns
          </div>
        </div>
        <table className="w-full text-xs-amz">
          <thead>
            <tr className="bg-gray-100 border-b text-gray-600 font-bold text-[10px] uppercase">
              <th className="px-4 py-3 text-left w-8"><input type="checkbox" className="w-4 h-4" /></th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-left">Campaign Name</th>
              <th className="px-4 py-3 text-left">Type</th>
              <th className="px-4 py-3 text-right">Budget</th>
              <th className="px-4 py-3 text-right">Spend</th>
              <th className="px-4 py-3 text-right">Sales</th>
              <th className="px-4 py-3 text-center">ACOS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredCampaigns.map(campaign => (
              <tr key={campaign.name} className="hover:bg-blue-50/20 transition-colors">
                <td className="px-4 py-4"><input type="checkbox" className="w-4 h-4" /></td>
                <td className="px-4 py-4">
                  <div className="flex items-center gap-2 font-bold">
                    <div className={`w-2.5 h-2.5 rounded-full ${campaign.status === 'Delivering' ? 'bg-green-500' : 'bg-gray-400'}`} />
                    {campaign.status}
                  </div>
                </td>
                <td className="px-4 py-4 font-bold text-amazon-link hover:underline cursor-pointer">{campaign.name}</td>
                <td className="px-4 py-4 text-gray-500">{campaign.type}</td>
                <td className="px-4 py-4 text-right font-medium">{campaign.budget}/day</td>
                <td className="px-4 py-4 text-right font-bold">{campaign.spend}</td>
                <td className="px-4 py-4 text-right font-bold">{campaign.sales}</td>
                <td className="px-4 py-4 text-center">
                  <span className="bg-gray-100 px-2 py-1 rounded-sm font-bold">{campaign.acos}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
};

export default CampaignManager;

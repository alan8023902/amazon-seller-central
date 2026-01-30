
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Search, Filter, ChevronDown, Download, HelpCircle, 
  Printer, Mail, MoreHorizontal, Calendar, FileText, RefreshCw
} from 'lucide-react';
import { useStore } from '../store';
import { useI18n } from '../hooks/useI18n';
import { Card, Button } from '../components/UI';
import { marketplaceConfigs } from '../i18n';
import { fetchOrders } from '../services/api';
import { cn } from '../utils/cn';

const ManageOrders: React.FC = () => {
  const { session, currentStore } = useStore();
  const { t } = useI18n();
  const [activeTab, setActiveTab] = useState(t('unshipped'));
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('last365Days');
  const [isSearching, setIsSearching] = useState(false);
  
  const { data: orders, isLoading, isRefetching, refetch } = useQuery({
    queryKey: ['orders', currentStore?.id, activeTab, searchTerm, dateFilter],
    queryFn: async () => {
      if (!currentStore?.id) return [];
      
      try {
        const params = new URLSearchParams();
        params.append('store_id', currentStore.id);
        
        // Map translated tab names back to English status values for API
        const statusMap: Record<string, string> = {
          [t('pending')]: 'Pending',
          [t('unshipped')]: 'Unshipped', 
          [t('cancelled')]: 'Cancelled',
          [t('shipped')]: 'Shipped'
        };
        const englishStatus = statusMap[activeTab] || activeTab;
        params.append('status', englishStatus);
        
        if (searchTerm.trim()) {
          params.append('search', searchTerm.trim());
        }
        
        if (dateFilter && dateFilter !== 'last365Days') {
          params.append('dateFilter', dateFilter);
        }
        
        const response = await fetch(`/api/orders?${params.toString()}`);
        const data = await response.json();
        
        if (data.success) {
          return data.data || [];
        }
        
        // Fallback to original fetchOrders if new API fails
        return await fetchOrders();
      } catch (error) {
        console.error('Failed to fetch orders:', error);
        return await fetchOrders();
      }
    },
    enabled: !!currentStore?.id,
  });

  // Handle search functionality
  const handleSearch = async () => {
    if (isSearching) return;
    
    setIsSearching(true);
    try {
      await refetch();
    } finally {
      setTimeout(() => setIsSearching(false), 500);
    }
  };

  // Handle tab change
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setTimeout(() => refetch(), 100);
  };

  // Handle search input with Enter key support
  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleSearchKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // Handle date filter change
  const handleDateFilterChange = (filter: string) => {
    setDateFilter(filter);
    setTimeout(() => refetch(), 100);
  };

  const currencySymbol = marketplaceConfigs[session.marketplace]?.currency || '$';
  const tabs = [t('pending'), t('unshipped'), t('cancelled'), t('shipped')];
  
  // Use orders data directly since filtering is now done on backend
  const filteredOrders = orders || [];

  return (
    <div className="animate-in fade-in slide-in-from-top-2 duration-500">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold">{t('orderManagement')}</h1>
        <div className="flex items-center gap-3 text-xs-amz font-bold text-amazon-link">
           <button className="flex items-center gap-1 hover:underline">
             <HelpCircle size={14} /> {t('orderLearnMore')}
           </button>
           <button className="flex items-center gap-1 hover:underline">
             <Download size={14} /> {t('downloadReport')}
           </button>
        </div>
      </div>

      <div className="flex border-b border-amazon-border mb-4 overflow-x-auto no-scrollbar bg-white rounded-t-sm shadow-sm">
        {tabs.map(tab => (
          <button
            key={tab}
            onClick={() => handleTabChange(tab)}
            className={cn(
              "px-5 py-3 text-sm-amz font-bold whitespace-nowrap transition-all border-b-2",
              activeTab === tab 
                ? 'border-amazon-teal text-amazon-teal bg-blue-50/30' 
                : 'border-transparent text-gray-500 hover:text-amazon-text hover:bg-gray-50'
            )}
          >
            {tab} ({orders?.filter(o => {
              // Map translated tab names back to English status values for counting
              const statusMap: Record<string, string> = {
                [t('pending')]: 'Pending',
                [t('unshipped')]: 'Unshipped', 
                [t('cancelled')]: 'Cancelled',
                [t('shipped')]: 'Shipped'
              };
              const englishStatus = statusMap[tab] || tab;
              return o.status === englishStatus;
            }).length || 0})
          </button>
        ))}
      </div>

      <Card className="!p-3 mb-4 shadow-sm border-0">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2 text-xs-amz font-bold text-gray-700 cursor-pointer hover:bg-gray-50 p-1.5 rounded transition-colors border border-transparent hover:border-gray-200">
            <Calendar size={14} className="text-gray-400" />
            <select 
              value={dateFilter}
              onChange={(e) => handleDateFilterChange(e.target.value)}
              className="bg-transparent border-none outline-none cursor-pointer"
            >
              <option value="last365Days">{t('last365Days')}</option>
              <option value="last30Days">Last 30 Days</option>
              <option value="last7Days">Last 7 Days</option>
              <option value="today">Today</option>
            </select>
            <ChevronDown size={14} />
          </div>
          <div className="h-6 w-px bg-gray-200"></div>
          <div className="relative flex-1 min-w-[300px]">
            <input 
              className="w-full border border-gray-300 rounded-sm py-1.5 pl-10 pr-4 text-sm-amz amz-input-focus shadow-inner"
              placeholder={t('searchByOrderId')}
              value={searchTerm}
              onChange={handleSearchInputChange}
              onKeyPress={handleSearchKeyPress}
            />
            <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
          </div>
          <Button 
            variant="white" 
            className="w-auto px-4 py-1.5 text-xs font-bold shadow-sm"
            onClick={handleSearch}
            disabled={isSearching}
          >
            {isSearching ? (
              <div className="w-4 h-4 border-2 border-amazon-teal border-t-transparent rounded-full animate-spin" />
            ) : (
              <Filter size={14} />
            )}
            {isSearching ? 'Searching...' : t('refineSearch')}
          </Button>
        </div>
      </Card>

      <Card className="!p-0 overflow-hidden shadow-md border-0 relative">
        <div className="bg-gray-100 px-4 py-2.5 border-b border-amazon-border flex justify-between items-center text-[10px] font-bold text-gray-500 uppercase tracking-widest">
           <div className="flex items-center gap-4">
              <input type="checkbox" className="w-4 h-4 rounded-sm border-gray-300" />
              <span className="cursor-pointer hover:text-amazon-text transition-colors flex items-center gap-1">{t('bulkAction')} (0 {t('selected')}) <ChevronDown size={12} /></span>
           </div>
           <div className="flex items-center gap-4">
              {isRefetching && <RefreshCw size={12} className="animate-spin text-amazon-teal" />}
              <div className="bg-white px-2 py-0.5 rounded border border-gray-200 text-amazon-text lowercase font-bold">{filteredOrders.length} {activeTab} {t('ordersFound')}</div>
           </div>
        </div>
        <div className="overflow-x-auto min-h-[400px]">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
               <RefreshCw className="animate-spin text-amazon-teal" size={32} />
               <p className="text-xs-amz text-gray-500 font-bold uppercase tracking-widest">{t('syncingOrders')}</p>
            </div>
          ) : (
            <table className="w-full text-xs-amz border-collapse">
              <thead>
                <tr className="bg-gray-50/50 border-b text-gray-500 text-left font-bold uppercase tracking-wider text-[10px]">
                  <th className="px-4 py-3 w-8"><input type="checkbox" className="w-4 h-4 rounded-sm border-gray-300" /></th>
                  <th className="px-4 py-3 w-40">{t('orderDate')}</th>
                  <th className="px-4 py-3 min-w-[250px]">{t('orderDetails')}</th>
                  <th className="px-4 py-3">{t('orderStatus')}</th>
                  <th className="px-4 py-3">{t('buyer')}</th>
                  <th className="px-4 py-3 text-right">{t('orderTotal')}</th>
                  <th className="px-4 py-3 text-center">{t('actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {filteredOrders.map(order => (
                  <tr key={order.id} className="hover:bg-blue-50/20 transition-colors group">
                    <td className="px-4 py-5 align-top"><input type="checkbox" className="w-4 h-4 mt-1 rounded-sm border-gray-300" /></td>
                    <td className="px-4 py-5 align-top">
                      <div className="font-bold text-amazon-text">{order.date}</div>
                      <div className="text-[10px] text-gray-400 mt-1 uppercase font-bold tracking-tight">{t('standardShipping')}</div>
                    </td>
                    <td className="px-4 py-5 align-top">
                      <div className="text-amazon-link font-black hover:underline cursor-pointer mb-1 text-sm-amz tracking-tight">
                        {order.id}
                      </div>
                      <div className="font-bold text-gray-700 leading-snug line-clamp-1 group-hover:text-amazon-text transition-colors">
                        {order.productName}
                      </div>
                      <div className="text-[10px] text-gray-500 mt-2 flex items-center gap-2">
                        {t('orderQty')}: <span className="font-black text-amazon-text bg-gray-100 px-1.5 rounded-sm">{order.quantity}</span> 
                        <span className="text-gray-300">|</span> 
                        ASIN: <span className="text-amazon-text font-black">{order.asin}</span>
                      </div>
                    </td>
                    <td className="px-4 py-5 align-top">
                      <div className={cn(
                        "inline-flex items-center px-2 py-0.5 rounded-sm text-[10px] font-black uppercase tracking-tighter border",
                        order.status === 'Unshipped' ? 'bg-orange-50 text-orange-700 border-orange-100' : 
                        order.status === 'Shipped' ? 'bg-green-50 text-green-700 border-green-100' : 'bg-gray-50 text-gray-600 border-gray-200'
                      )}>
                        {order.status === 'Pending' ? t('pending') :
                         order.status === 'Unshipped' ? t('unshipped') :
                         order.status === 'Cancelled' ? t('cancelled') :
                         order.status === 'Shipped' ? t('shipped') : order.status}
                      </div>
                    </td>
                    <td className="px-4 py-5 align-top">
                      <div className="font-black text-amazon-text">{order.buyerName}</div>
                      <button className="text-[10px] text-amazon-link hover:underline font-black mt-1.5 flex items-center gap-1.5 group/msg uppercase tracking-tighter">
                         <Mail size={12} className="group-hover/msg:scale-110 transition-transform text-amazon-teal"/> {t('contactBuyer')}
                      </button>
                    </td>
                    <td className="px-4 py-5 align-top text-right">
                      <div className="font-black text-sm-amz">{currencySymbol}{order.total.toFixed(2)}</div>
                    </td>
                    <td className="px-4 py-5 align-top text-center">
                      <div className="flex flex-col gap-2 max-w-[140px] mx-auto">
                         {order.status === 'Unshipped' ? (
                           <>
                             <Button variant="yellow" className="py-1 px-2 text-[11px] font-black h-7 uppercase tracking-tight">{t('confirmShipment')}</Button>
                             <Button variant="white" className="py-1 px-2 text-[11px] font-black h-7 uppercase tracking-tight border-gray-300 shadow-sm">
                               <Printer size={12} className="shrink-0" /> {t('printSlip')}
                             </Button>
                           </>
                         ) : (
                           <Button variant="white" className="py-1 px-2 text-[11px] font-black h-7 uppercase tracking-tight">{t('viewDetails')}</Button>
                         )}
                         <div className="flex items-center justify-center gap-4 mt-1 opacity-20 hover:opacity-100 transition-opacity">
                            <MoreHorizontal size={14} className="text-gray-400 cursor-pointer hover:text-amazon-text" />
                         </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {!isLoading && filteredOrders.length === 0 && (
            <div className="py-24 text-center text-gray-400 flex flex-col items-center">
               <FileText size={64} className="mb-4 opacity-10" />
               <p className="text-base-amz font-black text-gray-500 uppercase tracking-widest">{t('noMatchingOrders')}</p>
               <p className="text-xs text-gray-400 mt-2">{t('adjustFiltersToSeeMore')}</p>
               <button onClick={() => { setSearchTerm(''); setActiveTab(t('unshipped')); }} className="mt-6 text-amazon-link font-black hover:underline text-xs-amz uppercase tracking-widest">{t('clearSearch')}</button>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default ManageOrders;

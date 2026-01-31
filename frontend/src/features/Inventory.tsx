
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { 
  Search, Filter, ChevronDown, Plus, 
  HelpCircle, ArrowUpDown, Image as ImageIcon, RefreshCw, MoreVertical, Edit2
} from 'lucide-react';
import { useStore } from '../store';
import { useI18n } from '../hooks/useI18n';
import { Card, Button } from '../components/UI';
import { fetchInventory } from '../services/api';
import { marketplaceConfigs } from '../i18n';
import { cn } from '../utils/cn';

const Inventory: React.FC = () => {
  const { session, currentStore } = useStore();
  const { t } = useI18n();
  const navigate = useNavigate();
  const [filter, setFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const { data: inventory, isLoading, isRefetching, refetch } = useQuery({
    queryKey: ['inventory', currentStore?.id, searchTerm, filter],
    queryFn: async () => {
      if (!currentStore?.id) return [];
      
      try {
        const params = new URLSearchParams();
        params.append('store_id', currentStore.id);
        
        if (searchTerm.trim()) {
          params.append('search', searchTerm.trim());
        }
        
        if (filter && filter !== 'All' && filter !== t('all')) {
          // Map translated filter back to English for API
          const filterMap: Record<string, string> = {
            [t('active')]: 'Active',
            [t('inactive')]: 'Inactive', 
            [t('outOfStock')]: 'Out of Stock'
          };
          const englishFilter = filterMap[filter] || filter;
          params.append('status', englishFilter);
        }
        
        // Use the same API endpoint as Dashboard for consistency
        const response = await fetch(`/api/products?${params.toString()}`);
        const data = await response.json();
        
        if (data.success) {
          // Transform the data to match the expected inventory format
          return (data.data || []).map((product: any) => ({
            id: product.id,
            name: product.title || product.name,
            sku: product.sku,
            asin: product.asin,
            status: product.status,
            units: product.inventory || 0,
            price: product.price || 0,
            image: product.image_url || product.image,
            sales_amount: product.sales_amount || 0,
            units_sold: product.units_sold || 0
          }));
        }
        
        // Fallback to fetchInventory if new API fails
        return await fetchInventory();
      } catch (error) {
        console.error('Failed to fetch inventory:', error);
        return await fetchInventory();
      }
    },
    enabled: !!currentStore?.id,
  });

  // Handle search with debouncing
  const handleSearch = async () => {
    if (isSearching) return;
    
    setIsSearching(true);
    try {
      await refetch();
    } finally {
      setTimeout(() => setIsSearching(false), 500);
    }
  };

  // Handle filter change
  const handleFilterChange = (newFilter: string) => {
    setFilter(newFilter);
    // Trigger refetch when filter changes
    setTimeout(() => refetch(), 100);
  };

  // Handle search input change with Enter key support
  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleSearchKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const currencySymbol = marketplaceConfigs[session.marketplace]?.currency || '$';
  const statuses = [t('all'), t('active'), t('inactive'), t('outOfStock')];

  // Use inventory data directly since filtering is now done on backend
  const filteredItems = inventory || [];

  return (
    <div className="animate-in fade-in slide-in-from-top-2 duration-500">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-[22px] font-semibold text-amazon-text">{t('inventoryManagement')}</h1>
        <div className="flex items-center gap-4 text-[13px] font-medium text-amazon-link">
           <button 
             onClick={() => navigate('/app/help')}
             className="flex items-center gap-1.5 hover:underline"
           >
             <HelpCircle size={14} /> {t('documentation')}
           </button>
           <Button 
             variant="yellow" 
             onClick={() => navigate('/app/add-products')}
             className="w-auto px-5 py-2 flex items-center gap-2 font-black shadow-md border-amazon-yellowBorder"
           >
             <Plus size={16} /> {t('addAProduct')}
           </Button>
        </div>
      </div>

      <div className="flex border-b border-amazon-border mb-4 overflow-x-auto no-scrollbar bg-white rounded-t-sm shadow-sm">
        {statuses.map(status => (
          <button
            key={status}
            onClick={() => handleFilterChange(status)}
            className={cn(
              "px-6 py-3.5 text-xs-amz font-black whitespace-nowrap transition-all border-b-2 uppercase tracking-widest",
              filter === status 
                ? 'border-amazon-teal text-amazon-teal bg-blue-50/20' 
                : 'border-transparent text-gray-500 hover:text-amazon-text hover:bg-gray-50'
            )}
          >
            {status} ({status === t('all') ? (inventory?.length || 0) : (inventory?.filter(i => {
              const statusMap: Record<string, string> = {
                [t('active')]: 'Active',
                [t('inactive')]: 'Inactive',
                [t('outOfStock')]: 'Out of Stock'
              };
              const englishStatus = statusMap[status] || status;
              return i.status === englishStatus;
            }).length || 0)})
          </button>
        ))}
      </div>

      <Card className="!p-4 mb-6 shadow-sm border-0">
        <div className="flex flex-wrap items-center gap-4">
          <div className="relative flex-1 min-w-[350px]">
            <input 
              className="w-full border border-gray-300 rounded-sm py-2 pl-11 pr-4 text-sm-amz amz-input-focus shadow-inner bg-white"
              placeholder={t('searchByProduct')}
              value={searchTerm}
              onChange={handleSearchInputChange}
              onKeyPress={handleSearchKeyPress}
            />
            <Search className="absolute left-4 top-2.5 text-gray-400" size={18} />
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={handleSearch}
              disabled={isSearching}
              className={cn(
                "border border-gray-300 px-4 py-2 rounded-sm text-xs-amz font-black bg-white hover:bg-gray-50 shadow-sm flex items-center gap-2 uppercase tracking-widest transition-all active:scale-95",
                isSearching ? "opacity-60 cursor-wait" : ""
              )}
            >
              {isSearching ? (
                <div className="w-4 h-4 border-2 border-amazon-teal border-t-transparent rounded-full animate-spin" />
              ) : (
                <Search size={14} className="text-amazon-teal" />
              )}
              {isSearching ? t('searching') || 'Searching...' : t('search') || 'Search'}
            </button>
            <button className="border border-gray-300 px-4 py-2 rounded-sm text-xs-amz font-black bg-white hover:bg-gray-50 shadow-sm flex items-center gap-2 uppercase tracking-widest transition-all active:scale-95">
              <Filter size={14} className="text-amazon-teal" /> {t('preferences')} <ChevronDown size={14} className="opacity-50" />
            </button>
          </div>
        </div>
      </Card>

      <Card className={cn(
        "!p-0 overflow-hidden shadow-xl border-0 transition-all duration-300",
        isRefetching ? 'opacity-60 ring-2 ring-amazon-teal/20' : ''
      )}>
        <div className="bg-gray-100/80 px-5 py-3 border-b border-amazon-border flex justify-between items-center text-[10px] font-black text-gray-500 uppercase tracking-[0.15em]">
           <div className="flex items-center gap-5">
              <input type="checkbox" className="w-4 h-4 rounded-sm border-gray-300" />
              <span className="cursor-pointer hover:text-amazon-text transition-colors flex items-center gap-1.5">{t('actionOnSelected')} <ChevronDown size={12} /></span>
           </div>
           <div className="flex items-center gap-4">
              {isRefetching && <RefreshCw size={12} className="animate-spin text-amazon-teal" />}
              <div className="bg-white px-3 py-1 rounded-sm border border-gray-200 text-amazon-text font-black lowercase tracking-tight">{filteredItems.length} {t('productsFound')}</div>
           </div>
        </div>
        
        <div className="overflow-x-auto min-h-[400px]">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-28 gap-4">
               <div className="w-12 h-12 border-4 border-amazon-teal border-t-transparent rounded-full animate-spin"></div>
               <p className="text-xs-amz text-amazon-secondaryText font-black uppercase tracking-[0.2em] italic">{t('accessingMerchantCatalog')}</p>
            </div>
          ) : (
            <table className="w-full text-[13px] border-collapse">
              <thead>
                <tr className="bg-white border-b text-amazon-secondaryText text-left font-black uppercase tracking-[0.15em] text-[9px]">
                  <th className="px-5 py-4 w-10"><input type="checkbox" className="w-4 h-4 rounded-sm border-gray-300" /></th>
                  <th className="px-5 py-4 w-16 text-center">{t('media')}</th>
                  <th className="px-5 py-4 min-w-[300px]">{t('productIdentification')} <ArrowUpDown className="inline ml-1 opacity-40" size={10}/></th>
                  <th className="px-5 py-4">{t('inventoryStatus')}</th>
                  <th className="px-5 py-4 text-right">{t('inventoryQty')} <ArrowUpDown className="inline ml-1 opacity-40" size={10}/></th>
                  <th className="px-5 py-4 text-right">{t('unitPrice')}</th>
                  <th className="px-5 py-4 text-center">{t('offerControl')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {filteredItems.map(item => (
                  <tr key={item.id} className="hover:bg-blue-50/40 transition-all group cursor-pointer">
                    <td className="px-5 py-5 align-top pt-7"><input type="checkbox" className="w-4 h-4 rounded-sm border-gray-300" /></td>
                    <td className="px-5 py-5 align-top pt-6">
                      <div className="w-14 h-14 border bg-white rounded-sm flex items-center justify-center overflow-hidden shadow-sm group-hover:scale-105 transition-transform">
                        {item.image ? <img src={item.image} alt={item.sku} className="w-full h-full object-contain" /> : <ImageIcon className="text-gray-100" size={32} />}
                      </div>
                    </td>
                    <td className="px-5 py-5 align-top pt-6">
                      <div className="text-amazon-link font-black line-clamp-2 hover:underline mb-2 leading-tight text-[14px]">{item.name}</div>
                      <div className="text-[10px] text-gray-500 flex items-center gap-4 font-bold uppercase tracking-wider">
                         <span className="bg-gray-100 px-1.5 py-0.5 rounded-sm">SKU: <b className="text-amazon-text ml-1">{item.sku}</b></span>
                         <span className="bg-gray-100 px-1.5 py-0.5 rounded-sm">ASIN: <b className="text-amazon-text ml-1">{item.asin}</b></span>
                      </div>
                    </td>
                    <td className="px-5 py-5 align-top pt-7">
                      <span className={cn(
                        "px-2.5 py-1 rounded-sm text-[10px] font-black border uppercase tracking-widest",
                        item.status === 'Active' ? 'bg-green-50 text-green-700 border-green-200' : 
                        item.status === 'Inactive' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-gray-50 text-gray-500 border-gray-200'
                      )}>
                        {item.status}
                      </span>
                    </td>
                    <td className="px-5 py-5 align-top pt-7 text-right">
                       <div className={cn("font-black text-base", item.units < 50 ? "text-amazon-error" : "text-amazon-text")}>{item.units}</div>
                       <div className="text-[9px] font-black text-amazon-secondaryText uppercase tracking-widest mt-0.5">{t('available')}</div>
                    </td>
                    <td className="px-5 py-5 align-top pt-7 text-right">
                      <div className="font-black text-amazon-text text-[14px]">{currencySymbol}{item.price.toFixed(2)}</div>
                      <div className="text-[9px] text-amazon-teal font-black uppercase tracking-widest mt-0.5">{t('shipping')}</div>
                    </td>
                    <td className="px-5 py-5 align-top pt-6 text-center">
                       <div className="flex flex-col gap-2 items-center">
                          <Button 
                            variant="white" 
                            onClick={() => navigate(`/app/inventory/edit/${item.id}`)}
                            className="py-1 px-4 text-[11px] font-black w-auto uppercase tracking-wider shadow-sm border-gray-300 h-8 flex items-center gap-1.5 hover:border-amazon-teal transition-all"
                          >
                             <Edit2 size={12} /> {t('inventoryEdit')}
                          </Button>
                          <button 
                            onClick={() => navigate(`/app/inventory/copy/${item.id}`)}
                            className="text-[10px] text-amazon-link font-black hover:underline uppercase tracking-widest opacity-60 hover:opacity-100 transition-opacity"
                          >
                            {t('copyToNew')}
                          </button>
                       </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {!isLoading && filteredItems.length === 0 && (
            <div className="py-32 text-center text-gray-400 flex flex-col items-center">
               <ImageIcon size={64} className="mb-6 opacity-5" />
               <p className="text-lg font-black text-gray-400 uppercase tracking-[0.2em]">{t('inventoryLogEmpty')}</p>
               <p className="text-xs text-gray-400 mt-2 font-medium">{t('noItemsMatchingCriteria')}</p>
               <button onClick={() => { setSearchTerm(''); setFilter(t('all')); }} className="mt-8 text-amazon-link font-black hover:underline text-sm-amz uppercase tracking-widest">{t('resetGlobalFilters')}</button>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default Inventory;

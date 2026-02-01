
import React, { useState, useEffect } from 'react';
import { Search, Plus, Upload, HelpCircle, ChevronRight, Info, PackageSearch, Store, LayoutGrid, FileText } from 'lucide-react';
import { Card, Button } from '../components/UI';
import { useStore } from '../store';
import { useI18n } from '../hooks/useI18n';
import { cn } from '../utils/cn';

const AddProducts: React.FC = () => {
  const { t } = useI18n();
  const { currentStore } = useStore();
  const [isSearching, setIsSearching] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showResults, setShowResults] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchValue.trim()) return;
    
    setIsSearching(true);
    setShowResults(false);
    
    try {
      // Simulate API call to Amazon catalog search
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock search results
      const mockResults = [
        {
          id: 1,
          title: 'Wireless Bluetooth Headphones - Premium Sound Quality',
          asin: 'B08XYZ1234',
          brand: 'TechSound',
          category: 'Electronics > Audio',
          image: 'https://via.placeholder.com/100',
          price: '$49.99',
          rating: 4.5,
          reviews: 1250,
          availability: 'In Stock'
        },
        {
          id: 2,
          title: 'Smart Home Security Camera with Night Vision',
          asin: 'B09ABC5678',
          brand: 'SecureHome',
          category: 'Electronics > Security',
          image: 'https://via.placeholder.com/100',
          price: '$89.99',
          rating: 4.3,
          reviews: 890,
          availability: 'In Stock'
        },
        {
          id: 3,
          title: 'Portable External SSD 1TB - High Speed USB 3.0',
          asin: 'B07DEF9012',
          brand: 'DataMax',
          category: 'Electronics > Storage',
          image: 'https://via.placeholder.com/100',
          price: '$129.99',
          rating: 4.7,
          reviews: 2100,
          availability: 'Limited Stock'
        }
      ];
      
      setSearchResults(mockResults);
      setShowResults(true);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleAddToInventory = (product: any) => {
    // Handle adding product to inventory
    console.log('Adding product to inventory:', product);
    alert(`Adding "${product.title}" to your inventory. This would redirect to product setup page.`);
  };

  const handleClearSearch = () => {
    setSearchValue('');
    setSearchResults([]);
    setShowResults(false);
  };

  return (
    <div className="max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 pb-24">
      <div className="flex items-center justify-between mb-8 px-1">
        <h1 className="text-2xl font-black text-amazon-text uppercase tracking-tighter">{t('addProductsToInventory')}</h1>
        <button className="flex items-center gap-1.5 text-xs-amz text-amazon-link font-black hover:underline uppercase tracking-widest">
          <HelpCircle size={16} /> {t('helpDocumentation')}
        </button>
      </div>

      <Card className="mb-10 shadow-xl border-amazon-border relative overflow-hidden group">
        <div className="relative z-10">
          <h2 className="text-xl font-black mb-2 text-amazon-text tracking-tight uppercase">{t('searchAmazonGlobalCatalog')}</h2>
          <p className="text-sm-amz text-amazon-secondaryText mb-8 max-w-3xl font-medium">
            {t('avoidDuplicateListings')}
          </p>
          
          <form onSubmit={handleSearch} className="flex gap-0 group/search max-w-4xl relative">
            <div className="relative flex-1">
              <input 
                className="w-full border-2 border-gray-300 rounded-l-sm px-5 py-3.5 text-base-amz amz-input-focus shadow-inner font-medium placeholder:text-gray-400 border-r-0 focus:border-amazon-orange transition-all"
                placeholder={t('productNameUpcEan')}
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
              />
              <PackageSearch className="absolute right-4 top-4 text-gray-300" size={24} />
            </div>
            <button 
              type="submit" 
              className={cn(
                "bg-amazon-yellow border-2 border-amazon-yellowBorder rounded-r-sm px-10 font-black text-amazon-text uppercase tracking-[0.15em] shadow-md hover:bg-amazon-yellowHover active:bg-amazon-orange/10 transition-all flex items-center justify-center min-w-[160px]",
                isSearching ? "opacity-80 cursor-wait" : ""
              )}
              disabled={isSearching}
            >
              {isSearching ? <div className="w-5 h-5 border-2 border-amazon-text border-t-transparent rounded-full animate-spin"></div> : t('searchCatalog')}
            </button>
          </form>
          
          {showResults && (
            <div className="mt-6 flex items-center justify-between">
              <div className="text-sm font-medium text-gray-600">
                Found {searchResults.length} products matching "{searchValue}"
              </div>
              <button 
                onClick={handleClearSearch}
                className="text-sm text-amazon-link hover:underline font-medium"
              >
                Clear Search
              </button>
            </div>
          )}
          
          <div className="mt-6 flex items-start gap-3 text-[11px] text-amazon-secondaryText bg-gray-50/80 p-3 rounded border border-gray-200 border-dashed max-w-2xl">
            <Info size={16} className="text-amazon-teal shrink-0 mt-0.5" />
            <span className="font-medium">
              {t('importantAccurateId')}
            </span>
          </div>
        </div>
        <div className="absolute -top-10 -right-10 w-48 h-48 bg-amazon-teal/5 rounded-full blur-3xl group-hover:bg-amazon-orange/5 transition-all"></div>
      </Card>

      {/* Search Results */}
      {showResults && searchResults.length > 0 && (
        <Card className="mb-10 shadow-xl border-amazon-border">
          <h3 className="text-lg font-black mb-4 text-amazon-text uppercase tracking-tight">Search Results</h3>
          <div className="space-y-4">
            {searchResults.map((product) => (
              <div key={product.id} className="flex items-center gap-4 p-4 border border-gray-200 rounded-sm hover:bg-gray-50 transition-colors">
                <img src={product.image} alt={product.title} className="w-20 h-20 object-cover rounded border" />
                <div className="flex-1">
                  <h4 className="font-bold text-amazon-text mb-1">{product.title}</h4>
                  <div className="text-sm text-gray-600 mb-2">
                    <span className="font-medium">ASIN:</span> {product.asin} | 
                    <span className="font-medium"> Brand:</span> {product.brand} | 
                    <span className="font-medium"> Category:</span> {product.category}
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="font-bold text-amazon-text">{product.price}</span>
                    <div className="flex items-center gap-1">
                      <div className="flex">
                        {[1,2,3,4,5].map(star => (
                          <svg key={star} className={`w-4 h-4 ${star <= product.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                      <span className="text-gray-500">({product.reviews})</span>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-bold ${
                      product.availability === 'In Stock' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {product.availability}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <Button 
                    variant="yellow" 
                    className="px-4 py-2 text-sm font-black"
                    onClick={() => handleAddToInventory(product)}
                  >
                    Add to Inventory
                  </Button>
                  <button className="text-sm text-amazon-link hover:underline font-medium">
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        <div className="flex flex-col h-full bg-white border border-amazon-border rounded-sm shadow-amz-card hover:shadow-xl transition-all group cursor-pointer border-l-[6px] border-l-amazon-teal">
           <div className="p-6 flex-1">
              <div className="w-12 h-12 bg-amazon-teal/10 rounded-sm flex items-center justify-center mb-6 text-amazon-teal group-hover:scale-110 transition-transform">
                <Store size={28} />
              </div>
              <h3 className="font-black text-base-amz mb-3 uppercase tracking-tight text-amazon-text">{t('privateLabelNewBrand')}</h3>
              <p className="text-[13px] text-amazon-secondaryText leading-relaxed font-medium">
                {t('addingProductNotOnAmazon')}
              </p>
           </div>
           <div className="px-6 py-4 bg-gray-50 border-t flex justify-between items-center group-hover:bg-blue-50 transition-colors">
              <span className="text-xs-amz font-black text-amazon-link uppercase tracking-widest">{t('createNewListing')}</span>
              <ChevronRight size={16} className="text-amazon-teal group-hover:translate-x-1 transition-transform" />
           </div>
        </div>

        <div className="flex flex-col h-full bg-white border border-amazon-border rounded-sm shadow-amz-card hover:shadow-xl transition-all group cursor-pointer border-l-[6px] border-l-blue-500">
           <div className="p-6 flex-1">
              <div className="w-12 h-12 bg-blue-50 rounded-sm flex items-center justify-center mb-6 text-blue-500 group-hover:scale-110 transition-transform">
                <LayoutGrid size={28} />
              </div>
              <h3 className="font-black text-base-amz mb-3 uppercase tracking-tight text-amazon-text">{t('bulkInventoryOperations')}</h3>
              <p className="text-[13px] text-amazon-secondaryText leading-relaxed font-medium">
                {t('uploadFileMultipleProducts')}
              </p>
           </div>
           <div className="px-6 py-4 bg-gray-50 border-t flex justify-between items-center group-hover:bg-blue-50 transition-colors">
              <span className="text-xs-amz font-black text-amazon-link uppercase tracking-widest">{t('uploadInventoryFile')}</span>
              <ChevronRight size={16} className="text-amazon-teal group-hover:translate-x-1 transition-transform" />
           </div>
        </div>

        <div className="flex flex-col h-full bg-white border border-amazon-border rounded-sm shadow-amz-card hover:shadow-xl transition-all group cursor-pointer border-l-[6px] border-l-amazon-orange">
           <div className="p-6 flex-1">
              <div className="w-12 h-12 bg-orange-50 rounded-sm flex items-center justify-center mb-6 text-amazon-orange group-hover:scale-110 transition-transform">
                <FileText size={28} />
              </div>
              <h3 className="font-black text-base-amz mb-3 uppercase tracking-tight text-amazon-text">{t('applicationCenter')}</h3>
              <p className="text-[13px] text-amazon-secondaryText leading-relaxed font-medium">
                {t('checkStatusProductApplications')}
              </p>
           </div>
           <div className="px-6 py-4 bg-gray-50 border-t flex justify-between items-center group-hover:bg-blue-50 transition-colors">
              <span className="text-xs-amz font-black text-amazon-link uppercase tracking-widest">{t('viewStatus')}</span>
              <ChevronRight size={16} className="text-amazon-teal group-hover:translate-x-1 transition-transform" />
           </div>
        </div>
      </div>

      <div className="mt-4 bg-white border border-amazon-border rounded-sm shadow-amz-card">
        <div className="px-6 py-4 border-b bg-gray-100 flex justify-between items-center">
          <span className="font-black text-xs-amz text-amazon-secondaryText uppercase tracking-[0.2em]">{t('auditTrailRecentSubmissions')}</span>
          <button className="text-[10px] font-black text-amazon-link uppercase tracking-widest hover:underline">{t('viewHistoricalData')}</button>
        </div>
        <div className="p-16 text-center">
          <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner border border-gray-100">
            <Upload className="text-gray-200" size={36} />
          </div>
          <h4 className="text-base-amz font-black text-gray-400 uppercase tracking-widest">{t('noActiveSubmissions')}</h4>
          <p className="text-xs text-gray-400 mt-2 font-medium max-w-sm mx-auto">{t('noSubmissionsLast30Days')}</p>
        </div>
      </div>
    </div>
  );
};

export default AddProducts;

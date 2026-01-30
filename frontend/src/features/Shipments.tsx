
import React, { useState, useEffect } from 'react';
import { Truck, Package, ChevronRight, HelpCircle, Calendar, Search, Filter } from 'lucide-react';
import { Card, Button } from '../components/UI';
import { useStore } from '../store';
import { useI18n } from '../hooks/useI18n';

const Shipments: React.FC = () => {
  const { t } = useI18n();
  const { currentStore } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('All Shipments');
  const [shipments] = useState([
    { id: 'FBA15Z9X2L8J', name: 'STA (03/10/2024 14:22)-1', date: 'Mar 10, 2024', status: 'In Transit', units: 48, destination: 'LGB8 - Rialto, CA' },
    { id: 'FBA15Y8W1K7H', name: 'STA (03/05/2024 09:15)-1', date: 'Mar 05, 2024', status: 'Delivered', units: 120, destination: 'ONT8 - Moreno Valley, CA' },
    { id: 'FBA15X7V0J6G', name: 'STA (02/28/2024 16:45)-1', date: 'Feb 28, 2024', status: 'Closed', units: 96, destination: 'SNA4 - Rialto, CA' },
  ]);
  const [filteredShipments, setFilteredShipments] = useState(shipments);
  const [showAdvancedFilter, setShowAdvancedFilter] = useState(false);

  // Handle search functionality
  const handleSearch = () => {
    let filtered = shipments;

    // Apply search term filter
    if (searchTerm.trim()) {
      filtered = filtered.filter(shipment => 
        shipment.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        shipment.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        shipment.destination.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply tab filter
    if (activeTab !== 'All Shipments') {
      filtered = filtered.filter(shipment => shipment.status === activeTab);
    }

    setFilteredShipments(filtered);
  };

  // Handle tab change
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  // Auto-search when filters change
  useEffect(() => {
    handleSearch();
  }, [searchTerm, activeTab, shipments]);

  // Handle search input change
  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleSearchKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // Handle clear search
  const handleClearSearch = () => {
    setSearchTerm('');
    setActiveTab('All Shipments');
  };

  return (
    <div className="animate-in fade-in duration-500">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">{t('shipments')}</h1>
        <div className="flex gap-2 flex-shrink-0">
          <Button variant="white" className="px-4 font-bold flex items-center gap-2 whitespace-nowrap">
            <Calendar size={14} /> Shipping History
          </Button>
          <Button className="px-6 font-bold flex items-center gap-2 whitespace-nowrap">
            Send to Amazon
          </Button>
        </div>
      </div>

      <div className="flex gap-6 mb-8 overflow-x-auto no-scrollbar pb-2 border-b border-gray-200">
        {['All Shipments', 'Working', 'Shipped', 'In Transit', 'Delivered', 'Closed'].map((tab, i) => (
          <button 
            key={tab}
            onClick={() => handleTabChange(tab)}
            className={`px-4 py-2 text-sm-amz font-bold whitespace-nowrap border-b-2 transition-all ${
              activeTab === tab ? 'border-amazon-teal text-amazon-teal' : 'border-transparent text-gray-500 hover:text-amazon-text'
            }`}
          >
            {tab} ({tab === 'All Shipments' ? shipments.length : shipments.filter(s => s.status === tab).length})
          </button>
        ))}
      </div>

      <Card className="!p-0 overflow-hidden shadow-md">
        <div className="p-4 border-b bg-gray-50 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              <input 
                className="border border-gray-300 rounded-sm py-1.5 pl-10 pr-4 text-sm-amz w-64 amz-input-focus"
                placeholder="Search shipment ID or name"
                value={searchTerm}
                onChange={handleSearchInputChange}
                onKeyPress={handleSearchKeyPress}
              />
              <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
            </div>
            <button 
              onClick={() => setShowAdvancedFilter(!showAdvancedFilter)}
              className="text-xs-amz font-bold text-amazon-link hover:underline flex items-center gap-1"
            >
              <Filter size={14} /> Advanced Filter
            </button>
            {(searchTerm || activeTab !== 'All Shipments') && (
              <button 
                onClick={handleClearSearch}
                className="text-xs-amz font-bold text-gray-500 hover:text-amazon-text"
              >
                Clear Filters
              </button>
            )}
          </div>
          <div className="text-xs-amz text-gray-500 font-bold">
            Showing {filteredShipments.length} shipments
          </div>
        </div>

        {showAdvancedFilter && (
          <div className="p-4 bg-blue-50 border-b">
            <div className="flex gap-4 items-center">
              <select className="border border-gray-300 rounded-sm py-1.5 px-3 text-sm-amz">
                <option>All Destinations</option>
                <option>LGB8 - Rialto, CA</option>
                <option>ONT8 - Moreno Valley, CA</option>
                <option>SNA4 - Rialto, CA</option>
              </select>
              <select className="border border-gray-300 rounded-sm py-1.5 px-3 text-sm-amz">
                <option>All Date Ranges</option>
                <option>Last 7 days</option>
                <option>Last 30 days</option>
                <option>Last 90 days</option>
              </select>
              <Button variant="white" className="px-4 py-1.5 text-xs font-bold">
                Apply Filters
              </Button>
            </div>
          </div>
        )}

        <table className="w-full text-xs-amz">
          <thead>
            <tr className="bg-white border-b text-gray-600 font-bold uppercase text-[10px] tracking-wider">
              <th className="px-6 py-4 text-left">Shipment Name / ID</th>
              <th className="px-6 py-4 text-left">Created</th>
              <th className="px-6 py-4 text-left">Status</th>
              <th className="px-6 py-4 text-center">Units Received</th>
              <th className="px-6 py-4 text-left">Destination</th>
              <th className="px-6 py-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredShipments.map(s => (
              <tr key={s.id} className="hover:bg-blue-50/20 transition-colors">
                <td className="px-6 py-5">
                  <div className="font-bold text-amazon-link hover:underline cursor-pointer">{s.name}</div>
                  <div className="text-[10px] text-gray-400 mt-1">{s.id}</div>
                </td>
                <td className="px-6 py-5 text-gray-600">{s.date}</td>
                <td className="px-6 py-5">
                  <span className={`px-2 py-1 rounded-sm font-bold text-[10px] ${
                    s.status === 'In Transit' ? 'bg-blue-100 text-blue-700' :
                    s.status === 'Delivered' ? 'bg-green-100 text-green-700' :
                    'bg-gray-100 text-gray-600'
                  }`}>
                    {s.status.toUpperCase()}
                  </span>
                </td>
                <td className="px-6 py-5 text-center font-bold">
                  {s.status === 'Closed' ? `${s.units} / ${s.units}` : `0 / ${s.units}`}
                </td>
                <td className="px-6 py-5 text-gray-600 font-medium">{s.destination}</td>
                <td className="px-6 py-5 text-center">
                  <Button variant="white" className="py-1 px-3 text-[11px] font-bold w-auto inline-block">Track shipment</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        <Card className="shadow-sm border-l-4 border-l-blue-500">
          <div className="flex gap-4">
            <Truck className="text-blue-500" size={24} />
            <div>
              <h4 className="text-sm-amz font-bold mb-1">Carrier updates</h4>
              <p className="text-xs text-gray-600">LGB8 is experiencing high volume. Inbound processing may take up to 48 hours longer than usual.</p>
            </div>
          </div>
        </Card>
        <Card className="shadow-sm">
          <div className="flex gap-4">
            <Package className="text-amazon-teal" size={24} />
            <div>
              <h4 className="text-sm-amz font-bold mb-1">FBA inventory storage</h4>
              <p className="text-xs text-gray-600">You have 1,420 cubic feet of storage remaining for standard-size items.</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Shipments;

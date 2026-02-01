
import React from 'react';
import { Search, Filter, HelpCircle, FileText, ChevronDown, CheckCircle, Clock } from 'lucide-react';
import { Card, Button } from '../components/UI';

const SellingApplications: React.FC = () => {
  const applications = [
    { id: 'APP-10293', brand: 'Sony', category: 'Electronics', status: 'Approved', date: 'Mar 01, 2024' },
    { id: 'APP-10115', brand: 'Nike', category: 'Apparel', status: 'Under Review', date: 'Mar 05, 2024' },
  ];

  return (
    <div className="animate-in fade-in duration-500">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Selling Applications</h1>
        <button className="flex items-center gap-1 text-xs-amz text-amazon-link hover:underline font-bold">
          <HelpCircle size={14} /> Help
        </button>
      </div>

      <Card className="!p-0 overflow-hidden shadow-md">
        <div className="p-4 border-b bg-gray-50 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              <input 
                className="border border-gray-300 rounded-sm py-1.5 pl-10 pr-4 text-sm-amz w-64 amz-input-focus"
                placeholder="Search by brand or category"
              />
              <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
            </div>
            <Button variant="white" className="w-auto px-4 font-bold h-8.5 flex items-center gap-2">
              <Filter size={14} /> Status <ChevronDown size={14} />
            </Button>
          </div>
        </div>

        <table className="w-full text-xs-amz">
          <thead>
            <tr className="bg-white border-b text-gray-600 font-bold uppercase text-[10px] tracking-wider">
              <th className="px-6 py-4 text-left">Case ID</th>
              <th className="px-6 py-4 text-left">Brand / Category</th>
              <th className="px-6 py-4 text-left">Status</th>
              <th className="px-6 py-4 text-left">Submitted</th>
              <th className="px-6 py-4 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {applications.map(app => (
              <tr key={app.id} className="hover:bg-blue-50/10 transition-colors">
                <td className="px-6 py-5 text-amazon-link font-bold hover:underline cursor-pointer">{app.id}</td>
                <td className="px-6 py-5 font-medium">
                  <div>{app.brand}</div>
                  <div className="text-[10px] text-gray-400 font-normal uppercase tracking-tight">{app.category}</div>
                </td>
                <td className="px-6 py-5">
                  <div className="flex items-center gap-2">
                    {app.status === 'Approved' ? <CheckCircle size={14} className="text-green-600" /> : <Clock size={14} className="text-orange-500" />}
                    <span className={`font-bold ${app.status === 'Approved' ? 'text-green-600' : 'text-orange-600'}`}>
                      {app.status}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-5 text-gray-500">{app.date}</td>
                <td className="px-6 py-5 text-center">
                  <button className="text-amazon-link font-bold hover:underline">View case</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {applications.length === 0 && (
          <div className="py-20 text-center text-gray-400">
            <FileText size={48} className="mx-auto mb-4 opacity-10" />
            <p className="text-sm-amz">No applications found.</p>
          </div>
        )}
      </Card>
    </div>
  );
};

export default SellingApplications;

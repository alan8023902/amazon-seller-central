import React from 'react';
import { Card } from '../components/UI';
import { Truck, Package, Clock, CheckCircle2 } from 'lucide-react';

const ShippingReturns: React.FC = () => {
  const shippingSettings = [
    {
      name: 'Shipping Settings',
      description: 'Manage your shipping rates, delivery times, and carrier preferences.',
      icon: <Truck size={20} />,
      status: 'Complete',
    },
    {
      name: 'Return Settings',
      description: 'Set up your return policy and manage return requests from customers.',
      icon: <Package size={20} />,
      status: 'Complete',
    },
    {
      name: 'Fulfillment by Amazon (FBA)',
      description: 'Enroll in FBA to let Amazon handle storage, shipping, and customer service.',
      icon: <Truck size={20} />,
      status: 'Complete',
    },
    {
      name: 'Shipping Templates',
      description: 'Create and manage shipping templates for different product categories.',
      icon: <Package size={20} />,
      status: 'Incomplete',
    },
  ];

  return (
    <div className="max-w-4xl animate-in fade-in duration-300">
      <h1 className="text-[22px] font-bold text-[#0F1111] mb-6 uppercase tracking-tight">Shipping and Returns Information</h1>

      <div className="space-y-6">
        {/* Shipping and Returns Overview */}
        <Card title="Shipping and Returns Overview">
          <div className="p-1">
            <div className="text-[13px] text-[#565959] leading-relaxed mb-4">
              Manage your shipping and return settings to provide a great customer experience. Complete all sections to ensure your account is fully set up.
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {shippingSettings.map((setting, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-[#F7F8FA] rounded-[4px] border border-[#D5D9D9]">
                  <div className="text-[#008296] mt-0.5">{setting.icon}</div>
                  <div className="flex-1">
                    <div className="font-bold text-[14px] mb-1">{setting.name}</div>
                    <div className="text-[12px] text-[#565959] mb-2">{setting.description}</div>
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 size={14} className={setting.status === 'Complete' ? 'text-[#007600]' : 'text-[#C40000]'} />
                      <span className={`text-[11px] font-bold uppercase ${setting.status === 'Complete' ? 'text-[#007600]' : 'text-[#C40000]'}`}>
                        {setting.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Shipping Rates */}
        <Card title="Shipping Rates" headerAction={<button className="text-[13px] text-amazon-link font-bold hover:underline">Edit Shipping Rates</button>}>
          <div className="p-1">
            <div className="overflow-x-auto">
              <table className="w-full text-[13px]">
                <thead className="bg-[#F0F2F2] border-b border-[#D5D9D9]">
                  <tr>
                    <th className="py-2 px-4 text-left font-bold text-[#565959] uppercase text-[11px]">Shipping Method</th>
                    <th className="py-2 px-4 text-left font-bold text-[#565959] uppercase text-[11px]">Rate</th>
                    <th className="py-2 px-4 text-left font-bold text-[#565959] uppercase text-[11px]">Delivery Time</th>
                    <th className="py-2 px-4 text-left font-bold text-[#565959] uppercase text-[11px]">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#D5D9D9]">
                  <tr className="hover:bg-[#F0F2F2]">
                    <td className="py-3 px-4 font-bold">Standard Shipping</td>
                    <td className="py-3 px-4">$4.99</td>
                    <td className="py-3 px-4">3-5 business days</td>
                    <td className="py-3 px-4">
                      <span className="text-[11px] bg-[#007600] text-white px-1.5 py-0.5 rounded-sm font-black uppercase">Active</span>
                    </td>
                  </tr>
                  <tr className="hover:bg-[#F0F2F2]">
                    <td className="py-3 px-4 font-bold">Expedited Shipping</td>
                    <td className="py-3 px-4">$8.99</td>
                    <td className="py-3 px-4">1-3 business days</td>
                    <td className="py-3 px-4">
                      <span className="text-[11px] bg-[#007600] text-white px-1.5 py-0.5 rounded-sm font-black uppercase">Active</span>
                    </td>
                  </tr>
                  <tr className="hover:bg-[#F0F2F2]">
                    <td className="py-3 px-4 font-bold">Free Shipping</td>
                    <td className="py-3 px-4">Free on orders over $35</td>
                    <td className="py-3 px-4">3-5 business days</td>
                    <td className="py-3 px-4">
                      <span className="text-[11px] bg-[#007600] text-white px-1.5 py-0.5 rounded-sm font-black uppercase">Active</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </Card>

        {/* Return Policy */}
        <Card title="Return Policy" headerAction={<button className="text-[13px] text-amazon-link font-bold hover:underline">Edit Return Policy</button>}>
          <div className="p-1">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="font-bold text-[14px] mb-2">Return Window</div>
                <div className="text-[13px] text-[#565959]">30 days from delivery date</div>
              </div>
              <div>
                <div className="font-bold text-[14px] mb-2">Return Shipping</div>
                <div className="text-[13px] text-[#565959]">Buyer pays return shipping</div>
              </div>
              <div>
                <div className="font-bold text-[14px] mb-2">Refund Method</div>
                <div className="text-[13px] text-[#565959]">Original payment method</div>
              </div>
              <div>
                <div className="font-bold text-[14px] mb-2">Restocking Fee</div>
                <div className="text-[13px] text-[#565959]">No restocking fee</div>
              </div>
            </div>
            
            <div className="mt-6">
              <div className="font-bold text-[14px] mb-2">Return Policy Details</div>
              <div className="text-[13px] text-[#565959] leading-relaxed whitespace-pre-line">
                We accept returns within 30 days of delivery for most items in new, unused condition.
                
                To initiate a return, please contact customer service. Items must be returned in their original packaging with all accessories and documentation.
                
                Refunds will be processed to your original payment method within 5-7 business days after we receive your returned item.
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ShippingReturns;

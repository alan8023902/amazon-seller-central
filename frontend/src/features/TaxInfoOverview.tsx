import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Info, X } from 'lucide-react';

const TaxInfoOverview: React.FC = () => {
  const navigate = useNavigate();
  const [showBanner, setShowBanner] = useState(true);

  return (
    <div className="min-h-screen bg-[#f2f3f3]" style={{ fontFamily: 'Arial, Helvetica, sans-serif' }}>
      {/* Top info banner */}
      {showBanner && (
        <div className="px-6 pt-4">
          <div className="max-w-[1280px] mx-auto">
            <div className="bg-[#e8f3ff] border border-[#c7dbf5] border-l-[4px] border-l-[#2a61d8] px-4 py-3 flex items-start justify-between">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 text-[#2a61d8]">
                  <Info size={18} />
                </div>
                <div className="text-[14px] leading-5 text-[#0f1111] font-semibold">
                  You can use the links below to change the setting for the store you're currently browsing. You can
                  change the store via the country drop-down menu in the navigation bar.
                </div>
              </div>

              <button
                type="button"
                className="ml-4 text-[#0f1111] opacity-70 hover:opacity-100"
                aria-label="Close"
                onClick={() => setShowBanner(false)}
              >
                <X size={18} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Card */}
      <div className="px-6">
        <div className="max-w-[1280px] mx-auto">
          <div className="mt-10">
            <div className="bg-white border border-[#d5d9d9] shadow-[0_4px_12px_rgba(0,0,0,0.25)] rounded-sm">
               <div className="px-12 py-8">
                <h1 className="text-[44px] leading-[52px] font-normal text-[#232f3e]">
                  Tax Information
                </h1>

                {/* Links */}
                <div className="mt-8 space-y-4">
                  <button
                    type="button"
                    className="block text-[14px] text-[#2f6f87] hover:text-[#007185] hover:underline"
                    onClick={() => navigate('/app/settings/tax-info/details')}
                  >
                    Tax Information
                  </button>

                  <button
                    type="button"
                    className="block text-[14px] text-[#2f6f87] hover:text-[#007185] hover:underline"
                    onClick={() => navigate('/app/settings/tax-info/vat-gst')}
                  >
                    VAT/GST Registration Numbers
                  </button>

                  <button
                    type="button"
                    className="block text-[14px] text-[#2f6f87] hover:text-[#007185] hover:underline"
                    onClick={() => navigate('/app/settings/tax-info/rfc')}
                  >
                    RFC ID
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaxInfoOverview;


import React from 'react';
import { Upload, FileText, Download, HelpCircle, AlertCircle, Clock, ChevronRight } from 'lucide-react';
import { Card, Button } from '../components/UI';
import { useI18n } from '../hooks/useI18n';

const AddProductsUpload: React.FC = () => {
  const { t } = useI18n();
  
  return (
    <div className="max-w-4xl mx-auto animate-in fade-in duration-500 pb-20">
      <h1 className="text-2xl font-bold mb-6">{t('addProductsViaUpload')}</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="border border-amazon-teal bg-blue-50/50 p-4 rounded-sm">
          <div className="text-xs font-black uppercase tracking-widest text-amazon-teal mb-2">{t('step1')}</div>
          <h3 className="font-bold text-sm-amz mb-1">{t('downloadInventoryFile')}</h3>
          <p className="text-[11px] text-gray-600 mb-4">{t('chooseCategoriesYouWant')}</p>
          <Button variant="white" className="h-8 py-0 font-bold text-xs">{t('chooseCategory')}</Button>
        </div>
        <div className="border border-gray-200 p-4 rounded-sm opacity-50">
          <div className="text-xs font-black uppercase tracking-widest text-gray-400 mb-2">{t('step2')}</div>
          <h3 className="font-bold text-sm-amz mb-1">{t('fillOutTemplate')}</h3>
          <p className="text-[11px] text-gray-600">{t('openInExcelFillDetails')}</p>
        </div>
        <div className="border border-gray-200 p-4 rounded-sm opacity-50">
          <div className="text-xs font-black uppercase tracking-widest text-gray-400 mb-2">{t('step3')}</div>
          <h3 className="font-bold text-sm-amz mb-1">{t('uploadYourFile')}</h3>
          <p className="text-[11px] text-gray-600">{t('checkErrorsBeforeSubmitting')}</p>
        </div>
      </div>

      <Card className="mb-8">
        <h2 className="text-lg font-bold mb-4">{t('uploadYourInventoryFile')}</h2>
        <div className="border-2 border-dashed border-gray-200 rounded-lg p-12 flex flex-col items-center justify-center bg-gray-50 hover:bg-white hover:border-amazon-teal transition-all cursor-pointer group">
           <Upload className="text-gray-300 group-hover:text-amazon-teal mb-4" size={48} />
           <p className="text-sm-amz font-bold text-gray-500 group-hover:text-amazon-text">{t('dragAndDropFile')}</p>
           <p className="text-xs text-gray-400 mt-1">{t('acceptsFormats')}</p>
           <Button className="w-auto px-8 mt-6 font-bold">{t('selectFile')}</Button>
        </div>
        <div className="mt-4 flex items-center gap-2 text-xs-amz text-gray-500">
           <AlertCircle size={14} className="text-amazon-teal" />
           <span>{t('recommendUploadLimit')}</span>
        </div>
      </Card>

      <Card title={t('spreadsheetUploadStatus')} className="!p-0 overflow-hidden shadow-sm">
        <table className="w-full text-xs-amz">
          <thead>
            <tr className="bg-gray-100 border-b text-gray-600 font-bold uppercase text-[10px]">
              <th className="px-6 py-3 text-left">{t('batchId')}</th>
              <th className="px-6 py-3 text-left">{t('status')}</th>
              <th className="px-6 py-3 text-right">{t('items')}</th>
              <th className="px-6 py-3 text-left">{t('submitted')}</th>
              <th className="px-6 py-3 text-center">{t('uploadActions')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            <tr>
              <td className="px-6 py-4 font-bold text-amazon-link">50129384756</td>
              <td className="px-6 py-4">
                 <div className="flex items-center gap-2">
                    <Clock size={14} className="text-blue-500" />
                    <span>{t('inProgress')} (45%)</span>
                 </div>
              </td>
              <td className="px-6 py-4 text-right">120</td>
              <td className="px-6 py-4">Today, 11:30 AM</td>
              <td className="px-6 py-4 text-center">
                 <button className="text-gray-400 font-bold cursor-not-allowed" disabled>{t('processing')}</button>
              </td>
            </tr>
            <tr className="bg-gray-50/30">
              <td className="px-6 py-4 font-bold text-amazon-link">50128991234</td>
              <td className="px-6 py-4">
                 <div className="flex items-center gap-2 text-green-600">
                    <FileText size={14} />
                    <span className="font-bold">{t('done')}</span>
                 </div>
              </td>
              <td className="px-6 py-4 text-right">85</td>
              <td className="px-6 py-4">Mar 12, 2024</td>
              <td className="px-6 py-4 text-center">
                 <button className="text-amazon-link font-bold hover:underline flex items-center justify-center gap-1 mx-auto">
                    <Download size={14} /> {t('report')}
                 </button>
              </td>
            </tr>
          </tbody>
        </table>
      </Card>
    </div>
  );
};

export default AddProductsUpload;

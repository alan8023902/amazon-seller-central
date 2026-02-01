
import React, { useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Upload, Download, RefreshCw, Database, FileJson, AlertCircle, CheckCircle2, Wand2, Trash2, Globe } from 'lucide-react';
import { Card, Button } from '../components/UI';
import { useStore } from '../store';
import { parseCSV } from '../services/api';

const DevData: React.FC = () => {
  const { session, dashboard, importData } = useStore();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      try {
        let dataToImport: any = {};
        if (file.name.endsWith('.json')) {
          dataToImport = JSON.parse(content);
        } else if (file.name.endsWith('.csv')) {
          dataToImport = parseCSV(content);
        }
        
        importData(dataToImport);
        queryClient.invalidateQueries();
        alert('Data successfully injected into persistent storage.');
      } catch (err) {
        alert('Failed to parse file. Please ensure the format is correct.');
      }
    };
    reader.readAsText(file);
  };

  const generateRandomData = () => {
    const randomSales = Math.floor(Math.random() * 50000) + 5000;
    const randomOrders = Math.floor(Math.random() * 500) + 100;
    importData({
      salesToday: randomSales,
      openOrders: randomOrders,
      messages: Math.floor(Math.random() * 15),
    });
    queryClient.invalidateQueries();
    alert('Mock state generated successfully!');
  };

  const downloadState = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(dashboard, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "amazon_seller_state.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const handleReset = () => {
    if (confirm('This will wipe all local data including session, marketplace settings and inventory. Continue?')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  return (
    <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="flex items-center gap-3 mb-6">
        <Database className="text-amazon-teal" size={28} />
        <h1 className="text-2xl font-bold">Data & Developer Tools</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card title="Mock State Manager" className="shadow-md">
          <p className="text-sm-amz text-gray-600 mb-6 leading-relaxed">
            Quickly test different UI scenarios by injecting JSON/CSV data. 
            You can export your current state as a backup or use "Chaos Mode" for randomized metrics.
          </p>
          
          <div className="space-y-4">
            <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept=".json,.csv" />
            
            <div className="p-5 border border-dashed border-gray-300 rounded bg-gray-50 flex flex-col items-center">
              <FileJson size={40} className="text-gray-300 mb-3" />
              <div className="text-[11px] font-black text-gray-500 mb-6 uppercase tracking-widest">
                Current Buffer: ~{Math.round(JSON.stringify(dashboard).length / 1024)} KB
              </div>
              
              <div className="flex flex-col gap-3 w-full">
                <Button onClick={() => fileInputRef.current?.click()} className="font-bold flex items-center justify-center gap-2 h-10">
                  <Upload size={14} /> Import Data File
                </Button>
                <div className="flex gap-3">
                  <Button variant="white" onClick={downloadState} className="flex-1 font-bold flex items-center justify-center gap-2 h-10">
                    <Download size={14} /> Export State
                  </Button>
                  <Button variant="white" onClick={generateRandomData} className="flex-1 font-bold flex items-center justify-center gap-2 text-amazon-orange border-amazon-orange/30 hover:bg-orange-50 h-10">
                    <Wand2 size={14} /> Chaos Mode
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </Card>

        <Card title="System Environment" className="shadow-sm">
           <div className="space-y-4">
              <div className="flex items-center justify-between p-3.5 bg-green-50 rounded border border-green-200">
                 <div className="flex items-center gap-2.5">
                    <CheckCircle2 size={18} className="text-green-600" />
                    <span className="text-sm-amz font-black text-green-800">React Query Provider</span>
                 </div>
                 <span className="text-[10px] bg-green-200 text-green-800 px-2 py-0.5 rounded font-black uppercase">Active</span>
              </div>
              
              <div className="flex items-center justify-between p-3.5 bg-blue-50 rounded border border-blue-200">
                 <div className="flex items-center gap-2.5">
                    <Globe size={18} className="text-blue-600" />
                    <span className="text-sm-amz font-black text-blue-800">Marketplace: {session.marketplace}</span>
                 </div>
                 <span className="text-[10px] bg-blue-200 text-blue-800 px-2 py-0.5 rounded font-black uppercase">{session.language}</span>
              </div>

              <div className="pt-6 mt-6 border-t border-gray-100">
                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Internal Manifest</h4>
                <div className="text-[11px] text-gray-500 space-y-2">
                  <div className="flex justify-between"><span>Architecture</span> <span className="font-mono">Vite-SPA</span></div>
                  <div className="flex justify-between"><span>Render Strategy</span> <span className="font-mono">CSR (React 18)</span></div>
                  <div className="flex justify-between"><span>UI Kit</span> <span className="font-mono">Tailwind JIT</span></div>
                  <div className="flex justify-between"><span>Charts</span> <span className="font-mono">Recharts SVG</span></div>
                </div>
              </div>
           </div>
        </Card>
      </div>
      
      <div className="mt-12 p-8 bg-amazon-dark text-white rounded-sm flex flex-col md:flex-row items-center justify-between shadow-2xl relative overflow-hidden group border border-white/10">
        <div className="flex items-center gap-5 relative z-10">
           <div className="p-3 bg-amazon-error/20 rounded-full border border-amazon-error/30">
              <AlertCircle size={32} className="text-amazon-orange" />
           </div>
           <div>
              <div className="text-lg font-black tracking-tight mb-1">Total System Reset</div>
              <div className="text-xs opacity-70 max-w-md">Clear all session cookies, local storage keys, and persistent state buffers. Use this to troubleshoot data corruption or start fresh.</div>
           </div>
        </div>
        <Button variant="white" onClick={handleReset} className="w-auto px-10 font-black text-amazon-error border-amazon-error/40 hover:bg-amazon-error hover:text-white mt-6 md:mt-0 relative z-10 transition-all">
          <Trash2 size={16} className="mr-2" /> Reset Everything
        </Button>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl group-hover:bg-white/10 transition-colors"></div>
      </div>
    </div>
  );
};

export default DevData;

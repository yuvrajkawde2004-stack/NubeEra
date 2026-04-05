import React from 'react';
import { Terminal, ExternalLink, Info } from 'lucide-react';

const Playground: React.FC = () => {
  const playgroundUrl = 'https://play.veriton.tech/';

  return (
    <div className="max-w-[1400px] mx-auto space-y-8 animate-in fade-in duration-700 pb-10">
      {/* Page Header */}
      <section className="ag-hero group p-8 rounded-3xl bg-gradient-to-br from-indigo-600/10 to-violet-600/5 border border-slate-900/5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full -mr-32 -mt-32 blur-3xl group-hover:bg-indigo-500/20 transition-all duration-700"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-full">
              <Terminal className="w-3.5 h-3.5 text-indigo-600" />
              <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest leading-none">Interactive Lab</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
              Interactive <span className="text-gradient">Playground</span>
            </h1>
            <p className="text-slate-500 text-sm font-medium max-w-xl">
              Access your cloud-based terminal environment directly within the platform.
            </p>
          </div>

          <a 
            href={playgroundUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-2xl font-bold text-sm hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/10 group/btn"
          >
            <span>Open in New Tab</span>
            <ExternalLink className="w-4 h-4 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
          </a>
        </div>
      </section>

      {/* Info Alert */}
      <div className="bg-indigo-500/5 border border-indigo-500/10 rounded-2xl p-4 flex items-start gap-4">
        <div className="shrink-0 w-10 h-10 bg-indigo-500/10 rounded-xl flex items-center justify-center">
          <Info className="w-5 h-5 text-indigo-600" />
        </div>
        <div className="space-y-1">
          <h4 className="text-sm font-bold text-slate-900">Lab Environment</h4>
          <p className="text-[13px] text-slate-600 font-medium">
            This playground provides a secure, isolated sandbox for hands-on practice. If the terminal below does not appear, please use the button above.
          </p>
        </div>
      </div>

      {/* Main Viewport */}
      <div className="ag-panel overflow-hidden border-slate-900/10 shadow-2xl bg-black h-[calc(100vh-320px)] min-h-[700px] relative rounded-[32px]">
        <iframe 
          src={playgroundUrl} 
          title="Interactive Playground" 
          className="w-full h-full border-none"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
        />
        
        {/* Loading Overlay */}
        <div className="absolute inset-0 -z-10 flex items-center justify-center bg-slate-900">
          <div className="text-center space-y-4">
             <Terminal className="w-12 h-12 text-indigo-500 animate-pulse mx-auto" />
             <p className="text-indigo-300 font-bold uppercase tracking-widest text-[11px]">Initializing Environment...</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Playground;

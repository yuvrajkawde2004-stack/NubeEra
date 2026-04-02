import React, { useState, useRef } from 'react';
import { toast } from 'sonner';
import api from '../services/api';
import { UploadCloud, FileVideo, X, CheckCircle, ArrowRight, PlayCircle, Loader2 } from 'lucide-react';

const UploadVideo: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.type.startsWith('video/')) {
        setFile(droppedFile);
        setUploadedUrl(null);
      } else {
        toast.error('Invalid format. Please upload a video file.');
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setUploadedUrl(null);
    }
  };

  const removeFile = () => {
    setFile(null);
    setUploadProgress(0);
    setUploadedUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleUpload = async () => {
    if (!file) return;
    
    setLoading(true);
    setUploadProgress(10);
    
    const formData = new FormData();
    formData.append('file', file);

    try {
      // Simulate progress for UI purposes
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
           if (prev >= 90) {
             clearInterval(progressInterval);
             return 90;
           }
           return prev + 10;
        });
      }, 300);

      const res = await api.post('/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      setUploadedUrl(res.data.url);
      toast.success('Media block synchronized with cloud storage');
    } catch (error: any) {
      toast.error('Upload protocol failed. Internal server error.');
      setUploadProgress(0);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (uploadedUrl) {
      navigator.clipboard.writeText(uploadedUrl);
      toast.success('Media URL copied to clipboard');
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-10 animate-in fade-in duration-1000 pb-16">
      
      <div className="bg-white rounded-[40px] shadow-premium border border-slate-100 overflow-hidden relative group mt-10">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 blur-[120px] rounded-full -mr-20 -mt-20"></div>
        
        <div className="p-10 border-b border-slate-50 flex items-center justify-between bg-slate-50/30 relative z-10">
           <div className="flex items-center gap-6">
              <div className="w-14 h-14 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-emerald-500 shadow-sm">
                 <UploadCloud className="w-8 h-8" />
              </div>
              <div>
                 <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Media Ingestion Portal</h2>
                 <p className="text-sm text-slate-500 font-medium">Upload and process instructional video nodes to the global network.</p>
              </div>
           </div>
        </div>

        <div className="p-12 relative z-10">
          {!file ? (
            <div 
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-[32px] p-16 text-center cursor-pointer transition-all duration-300 flex flex-col items-center justify-center min-h-[400px] ${
                dragActive 
                  ? 'border-emerald-500 bg-emerald-50/30 scale-[1.02]' 
                  : 'border-slate-200 hover:border-emerald-500/50 hover:bg-slate-50'
              }`}
            >
              <input 
                ref={fileInputRef}
                type="file" 
                accept="video/*" 
                onChange={handleChange} 
                className="hidden" 
              />
              <div className={`w-24 h-24 rounded-full flex items-center justify-center mb-6 transition-colors duration-300 ${dragActive ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                <UploadCloud className="w-12 h-12" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 tracking-tight mb-2">Initialize Media Link</h3>
              <p className="text-slate-500 font-medium text-lg max-w-sm">Drag and drop your video file here, or click to browse system drives.</p>
              
              <div className="mt-8 flex items-center gap-3 validate-types opacity-60">
                 <span className="px-3 py-1 rounded-md bg-slate-200 text-[10px] font-bold uppercase tracking-widest text-slate-600">MP4</span>
                 <span className="px-3 py-1 rounded-md bg-slate-200 text-[10px] font-bold uppercase tracking-widest text-slate-600">WEBM</span>
                 <span className="px-3 py-1 rounded-md bg-slate-200 text-[10px] font-bold uppercase tracking-widest text-slate-600">MOV</span>
              </div>
            </div>
          ) : (
            <div className="bg-slate-50 border border-slate-100 rounded-[32px] p-10 animate-in zoom-in-95 duration-500">
               <div className="flex flex-col md:flex-row items-center gap-8">
                  <div className="w-32 h-32 rounded-3xl bg-black flex items-center justify-center shrink-0 border-4 border-white shadow-xl relative overflow-hidden group">
                     <FileVideo className="w-12 h-12 text-slate-600" />
                     <div className="absolute inset-0 bg-emerald-500/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                        <PlayCircle className="w-10 h-10 text-white" />
                     </div>
                  </div>
                  
                  <div className="flex-1 w-full text-center md:text-left">
                     <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                        <div>
                           <h3 className="text-xl font-bold text-slate-900 truncate tracking-tight">{file.name}</h3>
                           <p className="text-sm font-bold text-slate-500 mt-1 uppercase tracking-widest">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                        </div>
                        {!loading && !uploadedUrl && (
                          <button onClick={removeFile} className="w-10 h-10 rounded-full bg-white border border-slate-200 text-slate-500 hover:text-rose-600 hover:bg-rose-50 flex items-center justify-center transition-all shadow-sm shrink-0">
                             <X className="w-5 h-5" />
                          </button>
                        )}
                     </div>

                     {/* Progress Bar Area */}
                     {(loading || uploadProgress > 0) && !uploadedUrl && (
                        <div className="space-y-3 mt-6">
                           <div className="flex justify-between text-xs font-bold uppercase tracking-widest">
                              <span className="text-emerald-600 flex items-center gap-2">
                                 {loading && <Loader2 className="w-3 h-3 animate-spin" />}
                                 {uploadProgress === 100 ? 'Finalizing Sync...' : 'Uploading Node...'}
                              </span>
                              <span className="text-slate-600">{uploadProgress}%</span>
                           </div>
                           <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-emerald-500 rounded-full transition-all duration-300 relative overflow-hidden" 
                                style={{ width: `${uploadProgress}%` }}
                              >
                                 <div className="absolute inset-0 bg-white/20 w-full h-full animate-[shimmer_1s_infinite] -skew-x-12 translate-x-[-100%]"></div>
                              </div>
                           </div>
                        </div>
                     )}

                     {uploadedUrl && (
                        <div className="mt-6 p-5 bg-emerald-50 border border-emerald-100 rounded-2xl animate-in slide-in-from-bottom-4">
                           <div className="flex items-center gap-3 mb-3">
                              <CheckCircle className="w-5 h-5 text-emerald-600" />
                              <span className="font-bold text-emerald-800 text-sm tracking-tight">Sync Completed Successfully</span>
                           </div>
                           <div className="flex gap-3">
                              <input 
                                readOnly 
                                value={uploadedUrl} 
                                className="flex-1 px-4 py-2.5 bg-white border border-emerald-200 rounded-xl text-xs font-mono text-slate-700 outline-none"
                              />
                              <button onClick={copyToClipboard} className="px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold uppercase tracking-widest transition-colors shadow-sm">
                                Copy Link
                              </button>
                           </div>
                        </div>
                     )}

                     {!loading && !uploadedUrl && (
                       <div className="mt-8 flex justify-end">
                          <button onClick={handleUpload} className="ag-btn ag-btn-primary !bg-emerald-600 hover:!bg-emerald-700 !rounded-2xl px-10 py-3.5 shadow-lg shadow-emerald-500/20 flex items-center gap-3 font-bold uppercase tracking-widest text-[11px]">
                             Commence Upload <ArrowRight className="w-4 h-4" />
                          </button>
                       </div>
                     )}
                     
                     {uploadedUrl && (
                        <div className="mt-6 flex justify-end">
                           <button onClick={removeFile} className="text-[10px] font-bold uppercase tracking-widest text-slate-500 hover:text-indigo-600 transition-colors">
                              Process Successive Node →
                           </button>
                        </div>
                     )}
                  </div>
               </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UploadVideo;

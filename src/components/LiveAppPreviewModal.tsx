import React, { useState } from 'react';
import {
  X,
  ExternalLink,
  Laptop,
  Tablet,
  Smartphone,
  RefreshCw,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';

interface LiveAppPreviewModalProps {
  url: string;
  title: string;
  onClose: () => void;
}

export const LiveAppPreviewModal: React.FC<LiveAppPreviewModalProps> = ({
  url,
  title,
  onClose,
}) => {
  const [device, setDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [iframeKey, setIframeKey] = useState(0);

  const getContainerWidth = () => {
    switch (device) {
      case 'mobile':
        return 'max-w-[400px] h-[720px]';
      case 'tablet':
        return 'max-w-[768px] h-[780px]';
      case 'desktop':
      default:
        return 'w-full h-[80vh]';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md">
      <div className="relative w-full max-w-6xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl flex flex-col overflow-hidden max-h-[95vh]">
        {/* Header Bar */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-800 bg-slate-900/90 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center">
              <Laptop className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white truncate max-w-xs sm:max-w-md">
                Testing: {title}
              </h3>
              <p className="text-[11px] font-mono text-slate-400 truncate max-w-sm">
                {url}
              </p>
            </div>
          </div>

          {/* Viewport switchers */}
          <div className="flex items-center space-x-1 p-1 bg-slate-800 rounded-lg border border-slate-700/60">
            <button
              onClick={() => setDevice('desktop')}
              className={`p-1.5 rounded-md text-xs transition-colors ${
                device === 'desktop'
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Desktop viewport"
            >
              <Laptop className="w-4 h-4" />
            </button>
            <button
              onClick={() => setDevice('tablet')}
              className={`p-1.5 rounded-md text-xs transition-colors ${
                device === 'tablet'
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Tablet viewport"
            >
              <Tablet className="w-4 h-4" />
            </button>
            <button
              onClick={() => setDevice('mobile')}
              className={`p-1.5 rounded-md text-xs transition-colors ${
                device === 'mobile'
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Mobile viewport"
            >
              <Smartphone className="w-4 h-4" />
            </button>
          </div>

          {/* Controls */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIframeKey((prev) => prev + 1)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Reload sandbox frame"
            >
              <RefreshCw className="w-4 h-4" />
            </button>

            <a
              href={url}
              target="_blank"
              rel="noreferrer"
              className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-200 hover:text-white hover:bg-slate-700 border border-slate-700 text-xs font-medium inline-flex items-center space-x-1.5"
            >
              <span>Open in Window</span>
              <ExternalLink className="w-3 h-3" />
            </a>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Sandbox Frame Container */}
        <div className="flex-1 overflow-auto bg-slate-950 p-4 flex items-center justify-center">
          <div
            className={`transition-all duration-300 rounded-xl overflow-hidden border border-slate-700 shadow-2xl bg-white flex flex-col ${getContainerWidth()}`}
          >
            <div className="h-6 bg-slate-200 border-b border-slate-300 flex items-center px-3 space-x-1.5 shrink-0">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-400"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
              <span className="text-[10px] text-slate-500 font-mono truncate ml-2">
                {url}
              </span>
            </div>
            <iframe
              key={iframeKey}
              src={url}
              title={`Live Preview of ${title}`}
              className="w-full flex-1 border-0"
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
            />
          </div>
        </div>

        {/* Info footer */}
        <div className="px-5 py-2.5 border-t border-slate-800 bg-slate-900/90 text-xs text-slate-400 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Interactive sandbox preview with secure iframe isolation.</span>
          </div>
          <span className="text-[11px] text-slate-500">
            If external site denies framing (X-Frame-Options), use 'Open in Window'.
          </span>
        </div>
      </div>
    </div>
  );
};

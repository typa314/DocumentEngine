import React from 'react';
import { Layers, FileCode2, UploadCloud, FolderSearch, BookOpen, Sparkles, FolderOpen } from 'lucide-react';

interface HeaderProps {
  activeTab: 'explorer' | 'rules' | 'ingest' | 'scanner';
  setActiveTab: (tab: 'explorer' | 'rules' | 'ingest' | 'scanner') => void;
  onOpenIngestModal: () => void;
  onOpenScannerModal: () => void;
  totalFiles: number;
  violationCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onOpenIngestModal,
  onOpenScannerModal,
  totalFiles,
  violationCount,
}) => {
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between px-6 py-3.5 bg-slate-900/95 border-b border-slate-800 backdrop-blur-md">
      {/* Zone 1: Single text element Brand Zone */}
      <div className="flex items-center gap-3">
        <a 
          href="#home" 
          onClick={(e) => { e.preventDefault(); setActiveTab('explorer'); }}
          className="text-base font-bold tracking-tight text-slate-100 flex items-center gap-2.5 hover:text-white transition-colors"
        >
          <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
            <Layers className="w-4 h-4" />
          </div>
          <span>ArtifactEngine</span>
        </a>
        <span className="hidden sm:inline-block text-xs text-slate-400 border-l border-slate-800 pl-3">
          硬體與 Agent 結構化索引系統
        </span>
      </div>

      {/* Zone 2: Navigation Links */}
      <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-slate-400">
        <button
          onClick={() => setActiveTab('explorer')}
          className={`flex items-center gap-1.5 transition-colors whitespace-nowrap cursor-pointer ${
            activeTab === 'explorer' ? 'text-blue-400 font-semibold' : 'hover:text-slate-200'
          }`}
        >
          <FolderSearch className="w-3.5 h-3.5" />
          <span>檔案庫與關聯檢索</span>
          <span className="text-[11px] text-slate-500 font-mono">({totalFiles})</span>
        </button>

        <button
          onClick={() => setActiveTab('rules')}
          className={`flex items-center gap-1.5 transition-colors whitespace-nowrap cursor-pointer ${
            activeTab === 'rules' ? 'text-blue-400 font-semibold' : 'hover:text-slate-200'
          }`}
        >
          <FileCode2 className="w-3.5 h-3.5" />
          <span>Agent 規範產生器</span>
        </button>

        <button
          onClick={() => setActiveTab('ingest')}
          className={`flex items-center gap-1.5 transition-colors whitespace-nowrap cursor-pointer ${
            activeTab === 'ingest' ? 'text-blue-400 font-semibold' : 'hover:text-slate-200'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>自動校驗與結構化入庫</span>
          {violationCount > 0 && (
            <span className="text-[11px] text-amber-400 font-mono">({violationCount} 待修復)</span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('scanner')}
          className={`flex items-center gap-1.5 transition-colors whitespace-nowrap cursor-pointer ${
            activeTab === 'scanner' ? 'text-blue-400 font-semibold' : 'hover:text-slate-200'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>本地目錄掃描與改名</span>
        </button>
      </nav>

      {/* Zone 3: Primary Actions */}
      <div className="flex items-center gap-2.5">
        {/* Real Local Directory Mount */}
        <button
          onClick={onOpenScannerModal}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 active:bg-slate-800 rounded-md border border-slate-700/80 transition-colors cursor-pointer whitespace-nowrap shadow-sm"
        >
          <FolderOpen className="w-3.5 h-3.5 text-sky-400" />
          <span>開啟本機資料夾</span>
          {totalFiles > 0 && (
            <span className="text-[10px] bg-slate-700 text-slate-300 font-mono px-1 rounded">
              {totalFiles}
            </span>
          )}
        </button>

        {/* Add File / Ingest */}
        <button
          onClick={onOpenIngestModal}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 active:bg-blue-700 rounded-md transition-colors shadow-sm cursor-pointer whitespace-nowrap"
        >
          <UploadCloud className="w-3.5 h-3.5" />
          <span>+ 新增檔案入庫</span>
        </button>
      </div>
    </header>
  );
};

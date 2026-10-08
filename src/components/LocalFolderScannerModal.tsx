import React, { useState } from 'react';
import { 
  X, 
  FolderSearch, 
  CheckCircle2, 
  AlertCircle, 
  Terminal, 
  Download, 
  Copy, 
  Check, 
  FolderOpen,
  HardDrive
} from 'lucide-react';
import { ArtifactFile } from '../types';
import { autoFixArtifact, validateArtifact } from '../utils/schemaValidator';

interface LocalFolderScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBatchImport: (newFiles: ArtifactFile[]) => void;
}

export const LocalFolderScannerModal: React.FC<LocalFolderScannerModalProps> = ({
  isOpen,
  onClose,
  onBatchImport,
}) => {
  const [scannedFiles, setScannedFiles] = useState<
    {
      originalName: string;
      originalContent: string;
      size: number;
      lastModified?: number;
      compliance: ReturnType<typeof validateArtifact>;
      suggestedFix: ReturnType<typeof autoFixArtifact>;
    }[]
  >([]);
  const [copiedScript, setCopiedScript] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [folderName, setFolderName] = useState<string>('');

  if (!isOpen) return null;

  // Modern browser File System Access API
  const handleOpenNativeDirectory = async () => {
    if ('showDirectoryPicker' in window) {
      try {
        setIsScanning(true);
        // @ts-ignore
        const dirHandle = await window.showDirectoryPicker();
        setFolderName(dirHandle.name);

        const results: any[] = [];

        async function readDir(handle: any, currentPath = '') {
          for await (const entry of handle.values()) {
            if (entry.kind === 'file') {
              const name: string = entry.name;
              if (
                name.endsWith('.md') ||
                name.endsWith('.txt') ||
                name.endsWith('.log') ||
                name.endsWith('.sch') ||
                name.endsWith('.kicad_sch') ||
                name.endsWith('.json') ||
                name.endsWith('.yaml') ||
                name.endsWith('.yml') ||
                name.endsWith('.pdf') ||
                name.endsWith('.csv')
              ) {
                const file = await entry.getFile();
                let text = '';
                try {
                  if (name.endsWith('.pdf') || file.size > 2500000) {
                    text = `# ${name}\n[二進位檔案 / 尺寸: ${file.size} bytes]`;
                  } else {
                    text = await file.text();
                  }
                } catch {
                  text = `# ${name}`;
                }

                const compliance = validateArtifact(name, text);
                const suggestedFix = autoFixArtifact(name, text);

                results.push({
                  originalName: name,
                  originalContent: text,
                  size: file.size,
                  lastModified: file.lastModified,
                  compliance,
                  suggestedFix,
                });
              }
            } else if (entry.kind === 'directory' && !entry.name.startsWith('.') && entry.name !== 'node_modules') {
              await readDir(entry, `${currentPath}/${entry.name}`);
            }
          }
        }

        await readDir(dirHandle);
        setScannedFiles(results);
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          console.error('Directory picker error:', err);
        }
      } finally {
        setIsScanning(false);
      }
    } else {
      document.getElementById('fallback-folder-input')?.click();
    }
  };

  // Fallback via webkitdirectory input
  const handleFolderSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsScanning(true);
    setFolderName(files[0].webkitRelativePath?.split('/')[0] || '本機資料夾');
    const results = [];

    for (let i = 0; i < files.length; i++) {
      const f = files[i];
      if (
        f.name.endsWith('.md') ||
        f.name.endsWith('.txt') ||
        f.name.endsWith('.log') ||
        f.name.endsWith('.sch') ||
        f.name.endsWith('.kicad_sch') ||
        f.name.endsWith('.json') ||
        f.name.endsWith('.yaml') ||
        f.name.endsWith('.yml') ||
        f.name.endsWith('.pdf') ||
        f.name.endsWith('.csv')
      ) {
        let text = '';
        try {
          if (f.name.endsWith('.pdf') || f.size > 2500000) {
            text = `# ${f.name}\n[二進位檔案]`;
          } else {
            text = await f.text();
          }
        } catch {
          text = `# ${f.name}`;
        }

        const compliance = validateArtifact(f.name, text);
        const suggestedFix = autoFixArtifact(f.name, text);

        results.push({
          originalName: f.name,
          originalContent: text,
          size: f.size,
          lastModified: f.lastModified,
          compliance,
          suggestedFix,
        });
      }
    }

    setScannedFiles(results);
    setIsScanning(false);
  };

  const compliantCount = scannedFiles.filter((f) => f.compliance.isCompliant).length;
  const violationCount = scannedFiles.length - compliantCount;

  // Generate batch rename script (bash)
  const generateBashScript = () => {
    let script = '#!/usr/bin/env bash\n# Hardware Artifact Batch Rename Script\n# Generated by ArtifactEngine\n\n';
    scannedFiles.forEach((f) => {
      if (!f.compliance.isCompliant) {
        script += `mv "${f.originalName}" "${f.suggestedFix.fixedFilename}"\n`;
      }
    });
    return script;
  };

  const handleCopyBashScript = () => {
    navigator.clipboard.writeText(generateBashScript());
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 2000);
  };

  const handleImportAllToApp = () => {
    const newItems: ArtifactFile[] = scannedFiles.map((f, idx) => {
      const fixed = f.suggestedFix;
      return {
        id: `f-local-${Date.now()}-${idx}`,
        filename: fixed.fixedFilename,
        path: `/local/${folderName || 'workspace'}/${fixed.fixedFilename}`,
        sizeBytes: f.size,
        updatedAt: f.lastModified ? new Date(f.lastModified).toISOString() : new Date().toISOString(),
        source: 'LOCAL' as const,
        metadata: fixed.extractedMetadata,
        content: fixed.fixedContent,
        ruleCompliance: validateArtifact(fixed.fixedFilename, fixed.fixedContent),
      };
    });

    onBatchImport(newItems);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6">
      <div 
        className="w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <HardDrive className="w-4 h-4 text-sky-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <span>本地電腦檔案目錄掃描與入庫</span>
                {folderName && (
                  <span className="text-xs font-mono text-sky-400 bg-sky-950/60 px-2 py-0.5 rounded border border-sky-800/40">
                    {folderName}
                  </span>
                )}
              </h3>
              <p className="text-xs text-slate-400">
                選取您硬碟中存放電路圖、規格書、Bug 測試與 Agent 日誌的資料夾，系統將讀取並建立結構化索引
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-200 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Bar */}
        <div className="p-6 bg-slate-950/40 border-b border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={handleOpenNativeDirectory}
              disabled={isScanning}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-lg text-xs font-semibold cursor-pointer shadow-sm transition-colors"
            >
              <FolderOpen className="w-4 h-4" />
              <span>{isScanning ? '正在讀取本機檔案...' : '選取本地真實資料夾'}</span>
            </button>

            {/* Fallback input */}
            <input
              id="fallback-folder-input"
              type="file"
              // @ts-ignore
              webkitdirectory=""
              directory=""
              multiple
              onChange={handleFolderSelect}
              className="hidden"
            />
          </div>

          {scannedFiles.length > 0 && (
            <div className="flex items-center gap-4 text-xs font-mono">
              <span className="text-slate-400">已掃描: {scannedFiles.length} 份檔案</span>
              <span className="text-emerald-400 font-semibold">{compliantCount} 合規</span>
              <span className="text-amber-400 font-semibold">{violationCount} 待改名</span>
            </div>
          )}
        </div>

        {/* Content list */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-950/20">
          {scannedFiles.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center text-slate-400 space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500">
                <FolderSearch className="w-7 h-7 text-sky-400" />
              </div>
              <h4 className="text-sm font-semibold text-slate-200">
                尚未選取本地資料夾
              </h4>
              <p className="text-xs text-slate-400 max-w-md leading-relaxed">
                點擊上方「<strong>選取本地真實資料夾</strong>」，選擇您本地存放 Agent 日誌、電路圖 (.kicad_sch/.sch)、規格書 (.pdf/.md) 或 Bug 測試的資料夾。
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-400 mb-1">
                <span>檔案清單與建議改名對照 (Original &rarr; Canonical)</span>
                {violationCount > 0 && (
                  <button
                    onClick={handleCopyBashScript}
                    className="flex items-center gap-1.5 text-blue-400 hover:text-blue-300 cursor-pointer font-mono text-[11px]"
                  >
                    {copiedScript ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>複製 batch_rename.sh 改名腳本</span>
                  </button>
                )}
              </div>

              <div className="divide-y divide-slate-800 border border-slate-800 rounded-lg overflow-hidden bg-slate-900/60">
                {scannedFiles.map((f, i) => (
                  <div key={i} className="p-3 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-slate-800/40">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        {f.compliance.isCompliant ? (
                          <span className="text-emerald-400 flex items-center gap-1 font-mono text-[11px]">
                            <CheckCircle2 className="w-3.5 h-3.5" /> 命名合規
                          </span>
                        ) : (
                          <span className="text-amber-400 flex items-center gap-1 font-mono text-[11px]">
                            <AlertCircle className="w-3.5 h-3.5" /> 需標準化改名
                          </span>
                        )}
                        <span className="font-mono text-slate-400 line-through truncate max-w-xs">
                          {f.originalName}
                        </span>
                      </div>
                      <div className="font-mono text-xs text-blue-300 font-semibold truncate">
                        &rarr; {f.suggestedFix.fixedFilename}
                      </div>
                    </div>

                    <div className="text-[11px] font-mono text-slate-400 shrink-0">
                      推導類別: {f.suggestedFix.extractedMetadata.category} / {f.suggestedFix.extractedMetadata.subsystem}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-800 flex items-center justify-end gap-3 bg-slate-950/70">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs text-slate-400 hover:text-slate-200 cursor-pointer"
          >
            取消
          </button>
          <button
            disabled={scannedFiles.length === 0}
            onClick={handleImportAllToApp}
            className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg shadow-sm transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>將掃描之檔案匯入索引庫 ({scannedFiles.length})</span>
          </button>
        </div>
      </div>
    </div>
  );
};

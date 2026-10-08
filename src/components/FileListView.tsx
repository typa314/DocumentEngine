import React from 'react';
import { 
  Cpu, 
  FileText, 
  AlertTriangle, 
  Terminal, 
  Binary, 
  FileQuestion, 
  Eye, 
  Wrench, 
  Link2, 
  CheckCircle2, 
  AlertCircle, 
  Copy, 
  Check, 
  FolderOpen, 
  HardDrive 
} from 'lucide-react';
import { ArtifactFile } from '../types';

interface FileListViewProps {
  files: ArtifactFile[];
  onSelectFile: (file: ArtifactFile) => void;
  onAutoFixFile: (file: ArtifactFile) => void;
  onOpenScanner?: () => void;
}

export const FileListView: React.FC<FileListViewProps> = ({
  files,
  onSelectFile,
  onAutoFixFile,
  onOpenScanner,
}) => {
  const [copiedId, setCopiedId] = React.useState<string | null>(null);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'SCHEMATIC':
        return <Cpu className="w-4 h-4 text-sky-400 shrink-0" />;
      case 'SPECIFICATION':
        return <FileText className="w-4 h-4 text-emerald-400 shrink-0" />;
      case 'BUG_ANALYSIS':
        return <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />;
      case 'AGENT_LOG':
        return <Terminal className="w-4 h-4 text-purple-400 shrink-0" />;
      case 'FIRMWARE':
        return <Binary className="w-4 h-4 text-cyan-400 shrink-0" />;
      default:
        return <FileQuestion className="w-4 h-4 text-slate-400 shrink-0" />;
    }
  };

  const getSeverityStyle = (severity?: string) => {
    switch (severity) {
      case 'CRITICAL':
        return 'text-rose-400 font-semibold';
      case 'HIGH':
        return 'text-amber-400 font-semibold';
      case 'MEDIUM':
        return 'text-blue-300';
      case 'LOW':
        return 'text-slate-400';
      default:
        return 'text-slate-500';
    }
  };

  const handleCopyName = (e: React.MouseEvent, filename: string, id: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(filename);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1800);
  };

  if (files.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-12 text-center text-slate-400 space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500 shadow-sm">
          <HardDrive className="w-7 h-7 text-sky-400" />
        </div>
        <div>
          <h4 className="text-base font-bold text-slate-100 mb-1">
            目前索引資料庫中尚無檔案
          </h4>
          <p className="text-xs text-slate-400 max-w-md leading-relaxed">
            您可以直接點擊下方「<strong>開啟本機資料夾</strong>」，系統將自動讀取您本地端存放的電路圖、規格書、Bug 測試分析與 Agent 日誌並建立結構化索引。
          </p>
        </div>

        <div className="pt-2">
          {onOpenScanner && (
            <button
              onClick={onOpenScanner}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold cursor-pointer shadow-sm transition-colors"
            >
              <FolderOpen className="w-4 h-4" />
              <span>開啟本機資料夾 (載入我的真實檔案)</span>
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-x-auto overflow-y-auto">
      <table className="w-full text-left border-collapse">
        <thead className="sticky top-0 z-10 bg-slate-900/90 backdrop-blur border-b border-slate-800 text-[11px] font-semibold text-slate-400">
          <tr>
            <th className="py-2.5 px-4 w-12 text-center">狀態</th>
            <th className="py-2.5 px-4 min-w-[340px]">標準檔名 / 摘要說明</th>
            <th className="py-2.5 px-3 min-w-[120px]">專案與子系統</th>
            <th className="py-2.5 px-3 min-w-[160px]">相關晶片 / 元件</th>
            <th className="py-2.5 px-3 min-w-[110px]">硬體版本</th>
            <th className="py-2.5 px-3 min-w-[100px] text-right font-mono">規範分</th>
            <th className="py-2.5 px-4 w-28 text-right">操作</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800/60 text-xs">
          {files.map((file) => {
            const isCompliant = file.ruleCompliance.isCompliant;
            const relatedCount = file.metadata.related_docs?.length || 0;

            return (
              <tr
                key={file.id}
                onClick={() => onSelectFile(file)}
                className="hover:bg-slate-800/40 transition-colors group cursor-pointer"
              >
                {/* Column 1: Compliance Icon */}
                <td className="py-2.5 px-4 text-center">
                  {isCompliant ? (
                    <span title="符合業界規範">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 inline-block" />
                    </span>
                  ) : (
                    <span title="檔名或標頭違規，點擊一鍵修復">
                      <AlertCircle className="w-4 h-4 text-amber-400 inline-block" />
                    </span>
                  )}
                </td>

                {/* Column 2: Filename & Summary */}
                <td className="py-2.5 px-4">
                  <div className="flex items-center gap-2">
                    {getCategoryIcon(file.metadata.category)}
                    <span className="font-mono text-xs text-slate-200 group-hover:text-blue-300 font-medium tracking-tight truncate max-w-lg">
                      {file.filename}
                    </span>

                    <button
                      onClick={(e) => handleCopyName(e, file.filename, file.id)}
                      className="opacity-0 group-hover:opacity-100 p-1 text-slate-500 hover:text-slate-300 transition-opacity rounded cursor-pointer"
                      title="複製檔名"
                    >
                      {copiedId === file.id ? (
                        <Check className="w-3 h-3 text-emerald-400" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </button>
                  </div>

                  {/* Clean unboxed metadata with typographic separators */}
                  <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-400 line-clamp-1">
                    <span className="text-slate-300">{file.metadata.summary}</span>
                    {relatedCount > 0 && (
                      <>
                        <span aria-hidden="true" className="text-slate-600">·</span>
                        <span className="flex items-center gap-1 text-sky-400">
                          <Link2 className="w-3 h-3" />
                          {relatedCount} 關聯檔
                        </span>
                      </>
                    )}
                    {file.metadata.severity && (
                      <>
                        <span aria-hidden="true" className="text-slate-600">·</span>
                        <span className={getSeverityStyle(file.metadata.severity)}>
                          {file.metadata.severity}
                        </span>
                      </>
                    )}
                  </div>
                </td>

                {/* Column 3: Project & Subsystem */}
                <td className="py-2.5 px-3">
                  <div className="font-medium text-slate-200">{file.metadata.project}</div>
                  <div className="text-[11px] text-slate-400">{file.metadata.subsystem}</div>
                </td>

                {/* Column 4: Components (ICs) */}
                <td className="py-2.5 px-3">
                  {file.metadata.components && file.metadata.components.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {file.metadata.components.slice(0, 2).map((comp) => (
                        <span key={comp} className="font-mono text-[11px] text-slate-300">
                          {comp}
                        </span>
                      ))}
                      {file.metadata.components.length > 2 && (
                        <span className="text-[10px] text-slate-500">
                          +{file.metadata.components.length - 2}
                        </span>
                      )}
                    </div>
                  ) : (
                    <span className="text-slate-600 text-[11px]">—</span>
                  )}
                </td>

                {/* Column 5: Hardware Rev & Date */}
                <td className="py-2.5 px-3">
                  <div className="font-mono text-xs text-slate-300">{file.metadata.hardware_rev || 'Rev-A'}</div>
                  <div className="text-[11px] font-mono text-slate-400 tabular-nums">
                    {file.updatedAt ? file.updatedAt.slice(0, 10) : '—'}
                  </div>
                </td>

                {/* Column 6: Rule Score */}
                <td className="py-2.5 px-3 text-right">
                  <span
                    className={`font-mono text-xs font-semibold tabular-nums ${
                      file.ruleCompliance.score >= 90
                        ? 'text-emerald-400'
                        : file.ruleCompliance.score >= 70
                        ? 'text-blue-400'
                        : 'text-amber-400'
                    }`}
                  >
                    {file.ruleCompliance.score}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">/100</span>
                </td>

                {/* Column 7: Actions */}
                <td className="py-2.5 px-4 text-right">
                  <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                    {!isCompliant && (
                      <button
                        onClick={() => onAutoFixFile(file)}
                        className="p-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 rounded transition-colors cursor-pointer border border-amber-500/30 flex items-center gap-1 text-[11px] px-2"
                        title="依據標準自動修復檔名與生成 Frontmatter"
                      >
                        <Wrench className="w-3 h-3" />
                        <span>修復</span>
                      </button>
                    )}
                    <button
                      onClick={() => onSelectFile(file)}
                      className="p-1.5 hover:bg-slate-700 text-slate-400 hover:text-white rounded transition-colors cursor-pointer"
                      title="檢視詳細資料與關聯"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

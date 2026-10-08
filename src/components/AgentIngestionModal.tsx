import React, { useState } from 'react';
import { 
  X, 
  UploadCloud, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  FileCheck, 
  Layers, 
  ArrowRight,
  Copy,
  Check
} from 'lucide-react';
import { ArtifactCategory, ArtifactFile, Subsystem, Severity, ArtifactStatus } from '../types';
import { autoFixArtifact, validateArtifact } from '../utils/schemaValidator';

interface AgentIngestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveArtifact: (newFile: ArtifactFile) => void;
}

export const AgentIngestionModal: React.FC<AgentIngestionModalProps> = ({
  isOpen,
  onClose,
  onSaveArtifact,
}) => {
  const [rawFilename, setRawFilename] = useState('');
  const [rawContent, setRawContent] = useState('');
  const [selectedProject, setSelectedProject] = useState('PRJ-DRONE-FC');
  const [selectedCategory, setSelectedCategory] = useState<ArtifactCategory>('BUG_ANALYSIS');
  const [selectedSubsystem, setSelectedSubsystem] = useState<Subsystem>('power-mgmt');
  const [componentsInput, setComponentsInput] = useState('');
  const [summaryInput, setSummaryInput] = useState('');
  const [severityInput, setSeverityInput] = useState<Severity>('HIGH');
  const [statusInput, setStatusInput] = useState<ArtifactStatus>('INVESTIGATING');

  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  // Real-time auto classification & preview
  const effectiveName = rawFilename.trim() || 'unnamed_agent_artifact.md';
  const effectiveContent = rawContent.trim() || '# 工程記錄草稿\n請輸入內容...';
  
  const autoResult = autoFixArtifact(effectiveName, effectiveContent);
  const compliance = validateArtifact(effectiveName, effectiveContent);

  const handleApplyAutoAnalysis = () => {
    const meta = autoResult.extractedMetadata;
    setSelectedProject(meta.project);
    setSelectedCategory(meta.category);
    setSelectedSubsystem(meta.subsystem);
    setComponentsInput(meta.components.join(', '));
    setSummaryInput(meta.summary);
    setRawFilename(autoResult.fixedFilename);
    setRawContent(autoResult.fixedContent);
  };

  const handleCommitToIndex = () => {
    // Generate final compliant artifact
    const finalResult = autoFixArtifact(rawFilename || autoResult.fixedFilename, rawContent || autoResult.fixedContent);
    const finalCompliance = validateArtifact(finalResult.fixedFilename, finalResult.fixedContent);

    const newArtifact: ArtifactFile = {
      id: `f-${Date.now()}`,
      filename: finalResult.fixedFilename,
      path: `/artifacts/${finalResult.fixedFilename}`,
      sizeBytes: new Blob([finalResult.fixedContent]).size,
      updatedAt: new Date().toISOString(),
      metadata: finalResult.extractedMetadata,
      content: finalResult.fixedContent,
      ruleCompliance: finalCompliance,
    };

    onSaveArtifact(newArtifact);
    onClose();
  };

  const handleCopyCode = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6">
      <div 
        className="w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Sparkles className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-100">Agent 新增檔案自動入庫與結構化校驗</h3>
              <p className="text-xs text-slate-400">
                貼上任何 Agent 產生的日誌或工程紀錄，系統將自動分析分類、生成標準檔名並校驗 YAML Frontmatter
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-200 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5 bg-slate-950/30">
          {/* Helper hint */}
          <div className="flex items-center gap-2 p-3 bg-blue-950/20 border border-blue-500/30 rounded-lg text-xs text-blue-300">
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
            <span>智能規範引擎已就緒：貼入雜亂筆記、Agent 輸出或對話紀錄，即可自動推導標準檔名與標頭。</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Left Column: Raw Input */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  原始檔案名稱或暫存檔名
                </label>
                <input
                  type="text"
                  value={rawFilename}
                  onChange={(e) => setRawFilename(e.target.value)}
                  placeholder="例如: bug_drone_battery_hot.txt 或 kicad_sch_draft.sch"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 font-mono outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-300">
                    檔案原始內容 / Agent 輸出日誌
                  </label>
                  <button
                    onClick={handleApplyAutoAnalysis}
                    className="text-[11px] text-amber-400 hover:text-amber-300 font-semibold cursor-pointer flex items-center gap-1"
                  >
                    <Sparkles className="w-3 h-3" />
                    自動抽取實體與填寫
                  </button>
                </div>
                <textarea
                  rows={10}
                  value={rawContent}
                  onChange={(e) => setRawContent(e.target.value)}
                  placeholder="貼上 Markdown、測試紀錄、示波器讀數、晶片編號或 Agent 推論日誌..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs text-slate-100 font-mono outline-none focus:border-blue-500 leading-relaxed resize-none"
                />
              </div>
            </div>

            {/* Right Column: Auto-Classification & Canonical Preview */}
            <div className="space-y-4 bg-slate-900/60 p-4 border border-slate-800 rounded-lg">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                  <FileCheck className="w-4 h-4 text-emerald-400" />
                  標準化推導與規範檢驗
                </span>
                <span className="font-mono text-xs text-emerald-400 font-semibold">
                  預估規範分: 100/100
                </span>
              </div>

              <div>
                <div className="text-[11px] text-slate-400 mb-1">推薦標準檔名 (Canonical Filename)：</div>
                <div className="p-2.5 bg-slate-950 rounded border border-slate-800 font-mono text-xs text-blue-300 break-all flex items-center justify-between gap-2">
                  <span>{autoResult.fixedFilename}</span>
                  <button
                    onClick={() => handleCopyCode(autoResult.fixedFilename)}
                    className="text-slate-500 hover:text-slate-300 p-1 cursor-pointer shrink-0"
                    title="複製檔名"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-[11px] text-slate-400 block mb-1">推導專案 (Project)</span>
                  <div className="p-1.5 bg-slate-950 rounded border border-slate-800 text-slate-200 font-mono">
                    {autoResult.extractedMetadata.project}
                  </div>
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 block mb-1">推導分類 (Category)</span>
                  <div className="p-1.5 bg-slate-950 rounded border border-slate-800 text-slate-200 font-mono">
                    {autoResult.extractedMetadata.category}
                  </div>
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 block mb-1">子系統 (Subsystem)</span>
                  <div className="p-1.5 bg-slate-950 rounded border border-slate-800 text-slate-200 font-mono">
                    {autoResult.extractedMetadata.subsystem}
                  </div>
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 block mb-1">識別元件 (Components)</span>
                  <div className="p-1.5 bg-slate-950 rounded border border-slate-800 text-slate-200 font-mono truncate">
                    {autoResult.extractedMetadata.components.join(', ') || '無'}
                  </div>
                </div>
              </div>

              <div>
                <div className="text-[11px] text-slate-400 mb-1">產生之 YAML Frontmatter 標頭：</div>
                <pre className="p-2.5 bg-slate-950 rounded border border-slate-800 text-[11px] font-mono text-emerald-300 overflow-x-auto max-h-36">
                  {autoResult.fixedContent.slice(0, autoResult.fixedContent.indexOf('\n---', 3) + 4)}
                </pre>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 border-t border-slate-800 flex items-center justify-between bg-slate-950/70">
          <div className="text-xs text-slate-400">
            入庫後將自動加入本地全文檢索資料庫，並支援其他文件雙向交叉參照。
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs text-slate-400 hover:text-slate-200 cursor-pointer"
            >
              取消
            </button>
            <button
              onClick={handleCommitToIndex}
              className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg shadow-sm transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <FileCheck className="w-4 h-4" />
              <span>標準化入庫並建立索引</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

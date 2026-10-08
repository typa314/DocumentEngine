import React, { useState } from 'react';
import { 
  X, 
  Copy, 
  Check, 
  Download, 
  Link2, 
  CheckCircle2, 
  AlertCircle, 
  FileCode, 
  Cpu, 
  Activity, 
  Terminal, 
  FileText,
  Wrench,
  ShieldCheck,
  Share2
} from 'lucide-react';
import { ArtifactFile } from '../types';

interface FilePreviewModalProps {
  file: ArtifactFile | null;
  onClose: () => void;
  onNavigateToFile: (filename: string) => void;
  onAutoFix: (file: ArtifactFile) => void;
}

export const FilePreviewModal: React.FC<FilePreviewModalProps> = ({
  file,
  onClose,
  onNavigateToFile,
  onAutoFix,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'domain' | 'raw' | 'compliance'>('overview');
  const [copied, setCopied] = useState(false);

  if (!file) return null;

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([file.content], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6">
      <div 
        className="w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between gap-4 bg-slate-950/50">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono text-xs font-semibold text-blue-400">
                {file.metadata.category} / {file.metadata.subsystem}
              </span>
              <span className="text-slate-600">·</span>
              <span className="font-mono text-xs text-slate-400">{file.metadata.project}</span>
              <span className="text-slate-600">·</span>
              <span className="font-mono text-xs text-slate-400">{file.metadata.hardware_rev}</span>
            </div>
            <h3 className="font-mono text-sm sm:text-base font-bold text-slate-100 truncate tracking-tight">
              {file.filename}
            </h3>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => handleCopy(file.filename)}
              className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
              title="複製標準檔名"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
            <button
              onClick={handleDownload}
              className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
              title="下載檔案"
            >
              <Download className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
              title="關閉"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Nav Tabs */}
        <div className="px-6 bg-slate-900 border-b border-slate-800 flex items-center gap-6 text-xs font-medium">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-3 border-b-2 cursor-pointer transition-colors ${
              activeTab === 'overview'
                ? 'border-blue-500 text-blue-400 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            結構化資訊與關聯
          </button>

          <button
            onClick={() => setActiveTab('domain')}
            className={`py-3 border-b-2 cursor-pointer transition-colors flex items-center gap-1.5 ${
              activeTab === 'domain'
                ? 'border-blue-500 text-blue-400 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            {file.metadata.category === 'SCHEMATIC' && <Cpu className="w-3.5 h-3.5 text-sky-400" />}
            {file.metadata.category === 'BUG_ANALYSIS' && <Activity className="w-3.5 h-3.5 text-amber-400" />}
            {file.metadata.category === 'AGENT_LOG' && <Terminal className="w-3.5 h-3.5 text-purple-400" />}
            {file.metadata.category === 'SPECIFICATION' && <FileText className="w-3.5 h-3.5 text-emerald-400" />}
            <span>專屬領域預覽</span>
          </button>

          <button
            onClick={() => setActiveTab('raw')}
            className={`py-3 border-b-2 cursor-pointer transition-colors ${
              activeTab === 'raw'
                ? 'border-blue-500 text-blue-400 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            原始文本 (YAML+Markdown)
          </button>

          <button
            onClick={() => setActiveTab('compliance')}
            className={`py-3 border-b-2 cursor-pointer transition-colors flex items-center gap-1.5 ${
              activeTab === 'compliance'
                ? 'border-blue-500 text-blue-400 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
            <span>規範診斷 ({file.ruleCompliance.score}分)</span>
          </button>
        </div>

        {/* Modal Content Body */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-950/40">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Executive Summary */}
              <div className="p-4 rounded-lg bg-slate-900 border border-slate-800">
                <div className="text-[11px] font-semibold text-slate-400 mb-1">文件摘要 (EXECUTIVE SUMMARY)</div>
                <p className="text-sm text-slate-200 leading-relaxed">{file.metadata.summary}</p>
              </div>

              {/* Grid Metadata */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-lg">
                  <div className="text-[11px] text-slate-400 mb-0.5">文件編號 (DOC ID)</div>
                  <div className="font-mono text-xs font-semibold text-slate-200">{file.metadata.doc_id}</div>
                </div>
                <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-lg">
                  <div className="text-[11px] text-slate-400 mb-0.5">狀態 (STATUS)</div>
                  <div className="font-mono text-xs font-semibold text-slate-200">{file.metadata.status}</div>
                </div>
                <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-lg">
                  <div className="text-[11px] text-slate-400 mb-0.5">建立者 (AUTHOR)</div>
                  <div className="text-xs text-slate-200 truncate">{file.metadata.author}</div>
                </div>
                <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-lg">
                  <div className="text-[11px] text-slate-400 mb-0.5">建立時間 (CREATED)</div>
                  <div className="font-mono text-xs text-slate-200 tabular-nums">
                    {file.metadata.created_at?.slice(0, 16).replace('T', ' ')}
                  </div>
                </div>
              </div>

              {/* Related Components */}
              <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-lg">
                <div className="text-[11px] font-semibold text-slate-400 mb-2">關聯半導體 / 元件清單 (COMPONENTS)</div>
                <div className="flex flex-wrap gap-2">
                  {file.metadata.components && file.metadata.components.length > 0 ? (
                    file.metadata.components.map((comp) => (
                      <span
                        key={comp}
                        className="px-2.5 py-1 text-xs font-mono bg-slate-800 text-slate-200 rounded border border-slate-700/60"
                      >
                        {comp}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-slate-500">無登錄元件</span>
                  )}
                </div>
              </div>

              {/* CRITICAL: Cross-References Relation Chain */}
              <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-xs font-semibold text-slate-200 flex items-center gap-2">
                    <Link2 className="w-4 h-4 text-blue-400" />
                    <span>雙向關聯鏈條 (CROSS-REFERENCE RELATION CHAIN)</span>
                  </div>
                  <span className="text-[11px] text-slate-400 font-mono">
                    {file.metadata.related_docs?.length || 0} 篇關聯文檔
                  </span>
                </div>

                {file.metadata.related_docs && file.metadata.related_docs.length > 0 ? (
                  <div className="space-y-2">
                    {file.metadata.related_docs.map((docName) => (
                      <div
                        key={docName}
                        onClick={() => onNavigateToFile(docName)}
                        className="flex items-center justify-between p-2.5 bg-slate-950/70 hover:bg-blue-950/30 border border-slate-800 hover:border-blue-500/40 rounded-lg transition-colors cursor-pointer group"
                      >
                        <div className="flex items-center gap-2 truncate">
                          <Link2 className="w-3.5 h-3.5 text-blue-400 group-hover:text-blue-300 shrink-0" />
                          <span className="font-mono text-xs text-slate-200 group-hover:text-blue-200 truncate">
                            {docName}
                          </span>
                        </div>
                        <span className="text-[11px] text-blue-400 group-hover:underline whitespace-nowrap pl-2">
                          快速跳轉檢視 &rarr;
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-xs text-slate-500 py-2">
                    尚未建立跨檔案關聯。可在 Frontmatter 的 related_docs 欄位加入對應的電路圖或測試紀錄。
                  </div>
                )}
              </div>

              {/* Tags */}
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <span className="text-[11px] text-slate-400">檢索標籤：</span>
                {file.metadata.tags?.map((t) => (
                  <span key={t} className="text-[11px] text-slate-400 font-mono">
                    #{t}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: DOMAIN SPECIFIC VIEWER */}
          {activeTab === 'domain' && (
            <div className="space-y-6">
              {/* SCHEMATIC: Circuit Netlist & Pins */}
              {file.metadata.category === 'SCHEMATIC' && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-xs font-semibold text-slate-200 flex items-center gap-2">
                      <Cpu className="w-4 h-4 text-sky-400" />
                      <span>關鍵網表與測試接點 (NETLIST & PINS)</span>
                    </h4>
                    <span className="text-[11px] text-slate-400 font-mono">KiCad / Altium 仿真檢視</span>
                  </div>

                  {file.extraDetails?.schematicNets ? (
                    <div className="border border-slate-800 rounded-lg overflow-hidden bg-slate-900/60">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead className="bg-slate-900 border-b border-slate-800 text-[11px] text-slate-400 font-mono">
                          <tr>
                            <th className="py-2 px-3">網表名稱 (NET)</th>
                            <th className="py-2 px-3">額定電壓 / 訊號</th>
                            <th className="py-2 px-3">連接接腳 (PINS)</th>
                            <th className="py-2 px-3 text-right">狀態</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/60 font-mono">
                          {file.extraDetails.schematicNets.map((net) => (
                            <tr key={net.name} className="hover:bg-slate-800/30">
                              <td className="py-2 px-3 font-semibold text-sky-300">{net.name}</td>
                              <td className="py-2 px-3 text-slate-300">{net.voltage}</td>
                              <td className="py-2 px-3 text-slate-400">
                                {net.pins.join(', ')}
                              </td>
                              <td className="py-2 px-3 text-right text-emerald-400">{net.status || 'OK'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="p-4 bg-slate-900/40 border border-slate-800 rounded text-xs text-slate-400">
                      此檔案包含標準 KiCad / Altium 向量符號與圖面定義。
                    </div>
                  )}
                </div>
              )}

              {/* BUG_ANALYSIS: Oscilloscope Waveforms & 5-Why */}
              {file.metadata.category === 'BUG_ANALYSIS' && (
                <div className="space-y-5">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-semibold text-slate-200 flex items-center gap-2">
                      <Activity className="w-4 h-4 text-amber-400" />
                      <span>示波器 / 實測熱熱保護波形 (OSCILLOSCOPE TELEMETRY)</span>
                    </h4>
                    <span className="text-[11px] text-amber-400 font-mono font-semibold">165°C 熱跳脫觸發點 (48s)</span>
                  </div>

                  {file.extraDetails?.waveformData && (
                    <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-lg space-y-3">
                      <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                        <span>時間 (ms/s)</span>
                        <span>輸出電壓 (V) · 負載 (A) · 晶片溫度 (°C)</span>
                      </div>

                      <div className="space-y-1.5 font-mono text-xs">
                        {file.extraDetails.waveformData.map((row, idx) => (
                          <div key={idx} className="flex items-center gap-3">
                            <span className="w-16 text-slate-500 tabular-nums">{row.timeMs}s</span>
                            <div className="flex-1 bg-slate-950 h-5 rounded px-2 flex items-center justify-between border border-slate-800/80">
                              <span className={`text-xs ${row.vRail < 1 ? 'text-rose-400 font-bold' : 'text-emerald-400'}`}>
                                Vout: {row.vRail.toFixed(2)}V
                              </span>
                              <span className="text-xs text-blue-300">Iout: {row.currentA}A</span>
                              <span className={`text-xs ${row.tempC > 150 ? 'text-rose-400 font-bold' : 'text-amber-300'}`}>
                                Temp: {row.tempC.toFixed(1)}°C
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* AGENT_LOG: Step Reasoning Trace */}
              {file.metadata.category === 'AGENT_LOG' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-semibold text-slate-200 flex items-center gap-2">
                      <Terminal className="w-4 h-4 text-purple-400" />
                      <span>Agent 自動化推論與工具呼叫軌跡 (EXECUTION TRACE)</span>
                    </h4>
                    <span className="text-[11px] text-slate-400 font-mono">Run #12 · 4 Steps</span>
                  </div>

                  {file.extraDetails?.agentTrace ? (
                    <div className="space-y-3">
                      {file.extraDetails.agentTrace.map((step) => (
                        <div key={step.step} className="p-3.5 bg-slate-900/80 border border-slate-800 rounded-lg space-y-2">
                          <div className="flex items-center justify-between text-xs font-mono">
                            <span className="font-semibold text-purple-300">步驟 {step.step}: {step.action}</span>
                            <span className="text-slate-500 tabular-nums">{step.timestamp}</span>
                          </div>
                          <p className="text-xs text-slate-300">{step.thought}</p>
                          <div className="p-2 bg-slate-950 rounded border border-slate-800/80 font-mono text-[11px] text-slate-400 flex items-center justify-between">
                            <span className="text-purple-400">{step.tool}()</span>
                            <span className="text-emerald-400 truncate max-w-sm">{step.result}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-xs text-slate-500">此日誌為連續執行流。</div>
                  )}
                </div>
              )}

              {/* SPECIFICATION: Technical Limits */}
              {file.metadata.category === 'SPECIFICATION' && (
                <div>
                  <h4 className="text-xs font-semibold text-slate-200 mb-3 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-emerald-400" />
                    <span>極限電氣特性與參數規範 (ELECTRICAL LIMITS)</span>
                  </h4>
                  {file.extraDetails?.specTables ? (
                    <div className="border border-slate-800 rounded-lg overflow-hidden bg-slate-900/60">
                      <table className="w-full text-left border-collapse text-xs font-mono">
                        <thead className="bg-slate-900 border-b border-slate-800 text-[11px] text-slate-400">
                          <tr>
                            <th className="py-2 px-3">參數說明</th>
                            <th className="py-2 px-2 text-right">Min</th>
                            <th className="py-2 px-2 text-right">Typ</th>
                            <th className="py-2 px-2 text-right">Max</th>
                            <th className="py-2 px-2">單位</th>
                            <th className="py-2 px-3">測試條件</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/60">
                          {file.extraDetails.specTables.map((s, idx) => (
                            <tr key={idx} className="hover:bg-slate-800/30">
                              <td className="py-2 px-3 text-slate-200">{s.param}</td>
                              <td className="py-2 px-2 text-right text-slate-400">{s.min}</td>
                              <td className="py-2 px-2 text-right text-emerald-400 font-semibold">{s.typ}</td>
                              <td className="py-2 px-2 text-right text-slate-400">{s.max}</td>
                              <td className="py-2 px-2 text-slate-500">{s.unit}</td>
                              <td className="py-2 px-3 text-slate-400">{s.testCond}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : null}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: RAW CONTENT */}
          {activeTab === 'raw' && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="font-mono">檔案內容 ({file.sizeBytes} bytes)</span>
                <button
                  onClick={() => handleCopy(file.content)}
                  className="flex items-center gap-1 text-blue-400 hover:text-blue-300 cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>複製全文</span>
                </button>
              </div>
              <pre className="p-4 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono text-slate-300 overflow-x-auto whitespace-pre leading-relaxed max-h-[500px]">
                {file.content}
              </pre>
            </div>
          )}

          {/* TAB 4: COMPLIANCE DIAGNOSTICS */}
          {activeTab === 'compliance' && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-900 border border-slate-800 rounded-lg flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold text-slate-200">結構化規則符合性評分</div>
                  <div className="text-xs text-slate-400 mt-0.5">
                    檢驗標準：[PROJECT]_[CAT]_[SUBSYS]_[ID]_[SLUG]_[REV]_[YYYYMMDD].[EXT] + YAML Header
                  </div>
                </div>
                <div className="text-right">
                  <div className={`font-mono text-2xl font-bold ${file.ruleCompliance.score >= 90 ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {file.ruleCompliance.score}
                    <span className="text-xs text-slate-500 font-normal"> / 100</span>
                  </div>
                </div>
              </div>

              {/* Checklist */}
              <div className="space-y-2">
                <div className="flex items-center justify-between p-3 bg-slate-900/60 border border-slate-800 rounded-lg text-xs">
                  <span className="text-slate-300">1. 檔名正規表達式結構 (Canonical Regex)</span>
                  {file.ruleCompliance.namingFormatValid ? (
                    <span className="text-emerald-400 flex items-center gap-1 font-mono">
                      <CheckCircle2 className="w-3.5 h-3.5" /> 合格
                    </span>
                  ) : (
                    <span className="text-amber-400 flex items-center gap-1 font-mono">
                      <AlertCircle className="w-3.5 h-3.5" /> 不符合規範
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between p-3 bg-slate-900/60 border border-slate-800 rounded-lg text-xs">
                  <span className="text-slate-300">2. YAML Frontmatter 標頭完整度</span>
                  {file.ruleCompliance.frontmatterValid ? (
                    <span className="text-emerald-400 flex items-center gap-1 font-mono">
                      <CheckCircle2 className="w-3.5 h-3.5" /> 合格
                    </span>
                  ) : (
                    <span className="text-amber-400 flex items-center gap-1 font-mono">
                      <AlertCircle className="w-3.5 h-3.5" /> 缺失
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between p-3 bg-slate-900/60 border border-slate-800 rounded-lg text-xs">
                  <span className="text-slate-300">3. 子系統與分類受控詞彙 (Taxonomy)</span>
                  {file.ruleCompliance.taxonomyValid ? (
                    <span className="text-emerald-400 flex items-center gap-1 font-mono">
                      <CheckCircle2 className="w-3.5 h-3.5" /> 合格
                    </span>
                  ) : (
                    <span className="text-amber-400 flex items-center gap-1 font-mono">
                      <AlertCircle className="w-3.5 h-3.5" /> 詞彙不符
                    </span>
                  )}
                </div>
              </div>

              {/* Issues list if any */}
              {file.ruleCompliance.issues.length > 0 && (
                <div className="p-4 bg-amber-950/20 border border-amber-500/30 rounded-lg space-y-2">
                  <div className="text-xs font-semibold text-amber-300">待修正項目清單：</div>
                  <ul className="space-y-1.5 text-xs text-amber-200/80">
                    {file.ruleCompliance.issues.map((iss, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="font-mono text-[10px] bg-amber-900/40 px-1 py-0.5 rounded text-amber-300 shrink-0">
                          {iss.rule}
                        </span>
                        <span>{iss.message}</span>
                      </li>
                    ))}
                  </ul>

                  {!file.ruleCompliance.isCompliant && (
                    <div className="pt-2">
                      <button
                        onClick={() => onAutoFix(file)}
                        className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-xs rounded transition-colors cursor-pointer flex items-center gap-1.5"
                      >
                        <Wrench className="w-3.5 h-3.5" />
                        <span>一鍵自動標準化修正 (自動產生標準檔名與標頭)</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { 
  X, 
  Copy, 
  Check, 
  Download, 
  FileCode2, 
  Terminal, 
  BookOpen, 
  Code2, 
  ShieldCheck, 
  CheckCircle2 
} from 'lucide-react';
import { 
  generateCursorRules, 
  generateClaudeMarkdown, 
  generateOpenAIFunctionSchema, 
  generatePythonPreCommitHook 
} from '../utils/agentRuleGenerators';

interface AgentRulesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AgentRulesModal: React.FC<AgentRulesModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'cursor' | 'claude' | 'schema' | 'hook' | 'taxonomy'>('cursor');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const cursorRulesText = generateCursorRules();
  const claudeMdText = generateClaudeMarkdown();
  const schemaText = generateOpenAIFunctionSchema();
  const hookText = generatePythonPreCommitHook();

  const getCurrentText = () => {
    switch (activeTab) {
      case 'cursor':
        return { text: cursorRulesText, filename: '.cursorrules' };
      case 'claude':
        return { text: claudeMdText, filename: 'CLAUDE.md' };
      case 'schema':
        return { text: schemaText, filename: 'save_artifact_tool.json' };
      case 'hook':
        return { text: hookText, filename: 'validate_agent_artifact.py' };
      default:
        return { text: cursorRulesText, filename: '.cursorrules' };
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadCurrent = () => {
    const { text, filename } = getCurrentText();
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
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
              <FileCode2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-100">
                Agent 規範產生器：業界最通用架構 (.cursorrules / CLAUDE.md / Tool Schema)
              </h3>
              <p className="text-xs text-slate-400">
                直接導出設定檔給其他 Agent (Cursor, Claude Code, AutoGPT, LangChain)，讓它們在儲存檔案時自動遵守規範
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-200 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab selection */}
        <div className="px-6 bg-slate-900 border-b border-slate-800 flex items-center gap-4 text-xs font-medium overflow-x-auto">
          <button
            onClick={() => setActiveTab('cursor')}
            className={`py-3 border-b-2 cursor-pointer transition-colors whitespace-nowrap ${
              activeTab === 'cursor'
                ? 'border-blue-500 text-blue-400 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            .cursorrules (Cursor / Windsurf)
          </button>

          <button
            onClick={() => setActiveTab('claude')}
            className={`py-3 border-b-2 cursor-pointer transition-colors whitespace-nowrap ${
              activeTab === 'claude'
                ? 'border-blue-500 text-blue-400 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            CLAUDE.md (Claude Code / AutoGPT)
          </button>

          <button
            onClick={() => setActiveTab('schema')}
            className={`py-3 border-b-2 cursor-pointer transition-colors whitespace-nowrap ${
              activeTab === 'schema'
                ? 'border-blue-500 text-blue-400 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            JSON Schema (OpenAI / Tool Calling)
          </button>

          <button
            onClick={() => setActiveTab('hook')}
            className={`py-3 border-b-2 cursor-pointer transition-colors whitespace-nowrap ${
              activeTab === 'hook'
                ? 'border-blue-500 text-blue-400 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Git Pre-Commit Hook (Python 檢查器)
          </button>

          <button
            onClick={() => setActiveTab('taxonomy')}
            className={`py-3 border-b-2 cursor-pointer transition-colors whitespace-nowrap ${
              activeTab === 'taxonomy'
                ? 'border-blue-500 text-blue-400 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            受控詞彙與標準速查表
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-950/40">
          {activeTab !== 'taxonomy' ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="font-mono text-slate-300">
                  {getCurrentText().filename} · 可直接複製或下載放入專案根目錄
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleCopy(getCurrentText().text)}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded font-medium transition-colors cursor-pointer flex items-center gap-1.5 text-xs border border-slate-700/60"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? '已複製！' : '一鍵複製'}</span>
                  </button>
                  <button
                    onClick={handleDownloadCurrent}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded font-medium transition-colors cursor-pointer flex items-center gap-1.5 text-xs shadow-sm"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>下載檔案</span>
                  </button>
                </div>
              </div>

              <pre className="p-4 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono text-slate-300 overflow-x-auto whitespace-pre leading-relaxed max-h-[500px]">
                {getCurrentText().text}
              </pre>
            </div>
          ) : (
            <div className="space-y-6">
              <div>
                <h4 className="text-xs font-bold text-slate-200 mb-2">
                  1. Johnny.Decimal 分類代碼標準 (Categories)
                </h4>
                <div className="border border-slate-800 rounded-lg overflow-hidden bg-slate-900/60 text-xs">
                  <table className="w-full text-left">
                    <thead className="bg-slate-900 border-b border-slate-800 text-[11px] text-slate-400 font-mono">
                      <tr>
                        <th className="py-2.5 px-3">類別代碼</th>
                        <th className="py-2.5 px-3">J.D 區間</th>
                        <th className="py-2.5 px-3">適用檔案範圍</th>
                        <th className="py-2.5 px-3">常見副檔名</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 font-mono">
                      <tr>
                        <td className="py-2.5 px-3 text-sky-400 font-semibold">SCH</td>
                        <td className="py-2.5 px-3 text-slate-300">10-19</td>
                        <td className="py-2.5 px-3 text-slate-300">電路圖、BOM表、網表、圖紙</td>
                        <td className="py-2.5 px-3 text-slate-400">.kicad_sch, .sch, .pdf</td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-3 text-emerald-400 font-semibold">SPEC</td>
                        <td className="py-2.5 px-3 text-slate-300">20-29</td>
                        <td className="py-2.5 px-3 text-slate-300">元件手冊、技術規格、極限特性</td>
                        <td className="py-2.5 px-3 text-slate-400">.pdf, .md, .csv</td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-3 text-amber-400 font-semibold">TEST</td>
                        <td className="py-2.5 px-3 text-slate-300">30-39</td>
                        <td className="py-2.5 px-3 text-slate-300">Bug 報告、波形數據、5-Why 分析</td>
                        <td className="py-2.5 px-3 text-slate-400">.md, .csv, .log</td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-3 text-purple-400 font-semibold">AGENT</td>
                        <td className="py-2.5 px-3 text-slate-300">40-49</td>
                        <td className="py-2.5 px-3 text-slate-300">Agent 推論軌跡、工具調用日誌</td>
                        <td className="py-2.5 px-3 text-slate-400">.log, .json, .md</td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-3 text-cyan-400 font-semibold">FW</td>
                        <td className="py-2.5 px-3 text-slate-300">50-59</td>
                        <td className="py-2.5 px-3 text-slate-300">暫存器對照表、HAL驅動、通訊協議</td>
                        <td className="py-2.5 px-3 text-slate-400">.md, .h, .json</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold text-slate-200 mb-2">
                  2. 硬體子系統受控詞彙 (Subsystem Vocabularies)
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg">
                    <div className="font-mono text-xs font-bold text-blue-400">PWR (power-mgmt)</div>
                    <div className="text-[11px] text-slate-400 mt-1">DC-DC 降壓/升壓, LDO, 電源樹, 電源濾波</div>
                  </div>
                  <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg">
                    <div className="font-mono text-xs font-bold text-blue-400">RF (rf-telemetry)</div>
                    <div className="text-[11px] text-slate-400 mt-1">2.4GHz BLE, Wi-Fi, LoRa, 天線匹配</div>
                  </div>
                  <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg">
                    <div className="font-mono text-xs font-bold text-blue-400">ESC (motor-esc)</div>
                    <div className="text-[11px] text-slate-400 mt-1">BLDC 馬達, 閘極驅動, 相電流檢測</div>
                  </div>
                  <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg">
                    <div className="font-mono text-xs font-bold text-blue-400">IMU (sensor-imu)</div>
                    <div className="text-[11px] text-slate-400 mt-1">陀螺儀, 加速計, 氣壓計, 姿態解算</div>
                  </div>
                  <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg">
                    <div className="font-mono text-xs font-bold text-blue-400">BMS (battery-bms)</div>
                    <div className="text-[11px] text-slate-400 mt-1">電芯監測, 被動均衡, 充電防護</div>
                  </div>
                  <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg">
                    <div className="font-mono text-xs font-bold text-blue-400">BUS (interface-bus)</div>
                    <div className="text-[11px] text-slate-400 mt-1">CAN-FD, SPI 高速匯流排, I2C, UART</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 flex items-center justify-between bg-slate-950/70 text-xs">
          <div className="flex items-center gap-1.5 text-emerald-400">
            <CheckCircle2 className="w-4 h-4" />
            <span>規格已符合 IEEE / ADR / Johnny.Decimal 雙重標準相容性</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded font-medium cursor-pointer"
          >
            關閉
          </button>
        </div>
      </div>
    </div>
  );
};

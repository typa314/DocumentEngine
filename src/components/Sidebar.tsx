import React from 'react';
import { 
  Cpu, 
  FileText, 
  AlertTriangle, 
  Terminal, 
  Binary, 
  Folder, 
  CheckCircle2, 
  AlertCircle,
  Hash,
  ShieldCheck
} from 'lucide-react';
import { ArtifactCategory, ProjectSummary, Subsystem } from '../types';

interface SidebarProps {
  projects: ProjectSummary[];
  selectedProject: string | 'ALL';
  onSelectProject: (id: string | 'ALL') => void;
  selectedCategory: ArtifactCategory | 'ALL';
  onSelectCategory: (cat: ArtifactCategory | 'ALL') => void;
  selectedSubsystem: Subsystem | 'ALL';
  onSelectSubsystem: (sub: Subsystem | 'ALL') => void;
  totalCount: number;
  compliantCount: number;
  violationCount: number;
  onOpenRules: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  projects,
  selectedProject,
  onSelectProject,
  selectedCategory,
  onSelectCategory,
  selectedSubsystem,
  onSelectSubsystem,
  totalCount,
  compliantCount,
  violationCount,
  onOpenRules,
}) => {
  const categories: { key: ArtifactCategory | 'ALL'; label: string; code: string; icon: React.ReactNode }[] = [
    { key: 'ALL', label: '全部檔案類別', code: '00-59', icon: <Folder className="w-3.5 h-3.5" /> },
    { key: 'SCHEMATIC', label: '電路圖 (Schematics)', code: '10-19 [SCH]', icon: <Cpu className="w-3.5 h-3.5 text-sky-400" /> },
    { key: 'SPECIFICATION', label: '規格書與手冊 (Specs)', code: '20-29 [SPEC]', icon: <FileText className="w-3.5 h-3.5 text-emerald-400" /> },
    { key: 'BUG_ANALYSIS', label: 'Bug 測試分析 (QA/Tests)', code: '30-39 [TEST]', icon: <AlertTriangle className="w-3.5 h-3.5 text-amber-400" /> },
    { key: 'AGENT_LOG', label: 'Agent 紀錄日誌 (Runs)', code: '40-49 [AGENT]', icon: <Terminal className="w-3.5 h-3.5 text-purple-400" /> },
    { key: 'FIRMWARE', label: '韌體與暫存器 (FW)', code: '50-59 [FW]', icon: <Binary className="w-3.5 h-3.5 text-cyan-400" /> },
  ];

  const subsystems: { key: Subsystem | 'ALL'; label: string; code: string }[] = [
    { key: 'ALL', label: '全部子系統', code: 'ALL' },
    { key: 'power-mgmt', label: '電源管理 (Buck/LDO)', code: 'PWR' },
    { key: 'rf-telemetry', label: '射頻通訊 (BLE/WiFi)', code: 'RF' },
    { key: 'motor-esc', label: '馬達驅動 (BLDC/ESC)', code: 'ESC' },
    { key: 'sensor-imu', label: '傳感感知 (IMU/Baro)', code: 'IMU' },
    { key: 'mcu-core', label: '微控制器 (STM32/ESP)', code: 'MCU' },
    { key: 'battery-bms', label: '電池管理 (BMS/Cell)', code: 'BMS' },
    { key: 'interface-bus', label: '通訊匯流排 (CAN/SPI)', code: 'BUS' },
  ];

  const complianceRate = totalCount > 0 ? Math.round((compliantCount / totalCount) * 100) : 100;

  return (
    <aside className="w-64 shrink-0 bg-slate-900/60 border-r border-slate-800/80 flex flex-col h-[calc(100vh-53px)] overflow-y-auto">
      {/* Section 1: Projects */}
      <div className="p-4 border-b border-slate-800/60">
        <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400 mb-2.5">
          <span>專案目錄 (PROJECTS)</span>
          <button 
            onClick={() => onSelectProject('ALL')}
            className={`cursor-pointer hover:text-slate-200 ${selectedProject === 'ALL' ? 'text-blue-400' : ''}`}
          >
            全部顯示
          </button>
        </div>

        <div className="space-y-1">
          <button
            onClick={() => onSelectProject('ALL')}
            className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs transition-colors cursor-pointer text-left ${
              selectedProject === 'ALL'
                ? 'bg-blue-600/15 text-blue-300 font-medium border border-blue-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <div className="flex items-center gap-2 truncate">
              <Folder className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="truncate">所有專案</span>
            </div>
            <span className="text-[11px] font-mono text-slate-400">{totalCount}</span>
          </button>

          {projects.map((p) => {
            const isSelected = selectedProject === p.id;
            return (
              <button
                key={p.id}
                onClick={() => onSelectProject(p.id)}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs transition-colors cursor-pointer text-left ${
                  isSelected
                    ? 'bg-blue-600/15 text-blue-300 font-medium border border-blue-500/20'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <Hash className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">{p.code}</span>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] font-mono">
                  {p.bugCount > 0 && (
                    <span className="text-amber-400 font-semibold">{p.bugCount}B</span>
                  )}
                  <span className="text-slate-400">{p.fileCount}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Section 2: Johnny Decimal Classification */}
      <div className="p-4 border-b border-slate-800/60">
        <div className="text-[11px] font-semibold text-slate-400 mb-2.5">
          <span>JOHNNY.DECIMAL 結構分類</span>
        </div>

        <div className="space-y-1">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat.key;
            return (
              <button
                key={cat.key}
                onClick={() => onSelectCategory(cat.key)}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs transition-colors cursor-pointer text-left ${
                  isSelected
                    ? 'bg-blue-600/15 text-blue-300 font-medium border border-blue-500/20'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  {cat.icon}
                  <span className="truncate">{cat.label}</span>
                </div>
                <span className="text-[10px] font-mono text-slate-400">{cat.code}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Section 3: Subsystems */}
      <div className="p-4 border-b border-slate-800/60">
        <div className="text-[11px] font-semibold text-slate-400 mb-2.5">
          <span>硬體子系統 (SUBSYSTEMS)</span>
        </div>

        <div className="space-y-1">
          {subsystems.map((sub) => {
            const isSelected = selectedSubsystem === sub.key;
            return (
              <button
                key={sub.key}
                onClick={() => onSelectSubsystem(sub.key)}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs transition-colors cursor-pointer text-left ${
                  isSelected
                    ? 'bg-blue-600/15 text-blue-300 font-medium border border-blue-500/20'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <span className="truncate">{sub.label}</span>
                <span className="text-[10px] font-mono text-slate-400">{sub.code}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Section 4: Index Rule Compliance Health */}
      <div className="p-4 mt-auto bg-slate-950/40 border-t border-slate-800/60">
        <div className="flex items-center justify-between text-xs mb-2">
          <span className="font-semibold text-slate-300 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
            規範符合率
          </span>
          <span className="font-mono text-xs font-semibold text-slate-200">{complianceRate}%</span>
        </div>

        <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mb-3">
          <div 
            className={`h-full transition-all duration-300 ${
              complianceRate >= 90 ? 'bg-emerald-500' : complianceRate >= 70 ? 'bg-blue-500' : 'bg-amber-500'
            }`} 
            style={{ width: `${complianceRate}%` }} 
          />
        </div>

        <div className="flex items-center justify-between text-[11px] text-slate-400 mb-3">
          <span className="flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            {compliantCount} 合規
          </span>
          <span className="flex items-center gap-1">
            <AlertCircle className="w-3 h-3 text-amber-400" />
            {violationCount} 違規/待改
          </span>
        </div>

        <button
          onClick={onOpenRules}
          className="w-full py-1.5 px-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-medium rounded transition-colors text-center cursor-pointer border border-slate-700/60"
        >
          查看規範與命名標準
        </button>
      </div>
    </aside>
  );
};

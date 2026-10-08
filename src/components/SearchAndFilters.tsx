import React from 'react';
import { Search, X, SlidersHorizontal, ArrowUpDown, Sparkles } from 'lucide-react';
import { FilterState, Severity } from '../types';

interface SearchAndFiltersProps {
  filter: FilterState;
  setFilter: React.Dispatch<React.SetStateAction<FilterState>>;
  totalMatches: number;
}

export const SearchAndFilters: React.FC<SearchAndFiltersProps> = ({
  filter,
  setFilter,
  totalMatches,
}) => {
  const quickKeywords = [
    { label: '電源熱關斷', query: 'thermal-shutdown' },
    { label: 'TPS54302', query: 'TPS54302' },
    { label: '電芯均衡過熱', query: 'cell-balancing' },
    { label: 'BQ76952', query: 'BQ76952' },
    { label: 'ESP32 射頻', query: 'esp32-s3' },
    { label: 'CRITICAL', query: 'CRITICAL' },
    { label: 'FAIL 測試', query: 'FAIL' },
  ];

  const handleClearSearch = () => {
    setFilter((prev) => ({ ...prev, searchQuery: '' }));
  };

  const handleResetAll = () => {
    setFilter({
      searchQuery: '',
      selectedProject: 'ALL',
      selectedCategory: 'ALL',
      selectedSubsystem: 'ALL',
      selectedStatus: 'ALL',
      selectedSeverity: 'ALL',
      complianceOnly: 'ALL',
      sortBy: 'date_desc',
    });
  };

  const isFiltered =
    filter.searchQuery ||
    filter.selectedProject !== 'ALL' ||
    filter.selectedCategory !== 'ALL' ||
    filter.selectedSubsystem !== 'ALL' ||
    filter.selectedStatus !== 'ALL' ||
    filter.selectedSeverity !== 'ALL' ||
    filter.complianceOnly !== 'ALL';

  return (
    <div className="bg-slate-900/40 border-b border-slate-800/80 px-6 py-4 space-y-3">
      {/* Row 1: Global Search & Sort */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={filter.searchQuery}
            onChange={(e) => setFilter((prev) => ({ ...prev, searchQuery: e.target.value }))}
            placeholder="全域快速檢索：輸入晶片型號 (TPS54302)、檔名、故障現象 (過熱/掉電)、Agent ID 或標籤..."
            className="w-full bg-slate-950/70 border border-slate-800 focus:border-blue-500/80 focus:ring-1 focus:ring-blue-500/40 rounded-lg pl-9 pr-9 py-2 text-xs text-slate-100 placeholder-slate-500 transition-all outline-none"
          />
          {filter.searchQuery && (
            <button
              onClick={handleClearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Compliance Filter Tabs (Functional segmented controls) */}
        <div className="flex items-center gap-1 p-1 bg-slate-950/60 border border-slate-800/80 rounded-lg shrink-0">
          <button
            onClick={() => setFilter((prev) => ({ ...prev, complianceOnly: 'ALL' }))}
            className={`px-2.5 py-1 text-xs font-medium rounded transition-colors cursor-pointer ${
              filter.complianceOnly === 'ALL'
                ? 'bg-slate-800 text-white'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            全部
          </button>
          <button
            onClick={() => setFilter((prev) => ({ ...prev, complianceOnly: 'COMPLIANT' }))}
            className={`px-2.5 py-1 text-xs font-medium rounded transition-colors cursor-pointer ${
              filter.complianceOnly === 'COMPLIANT'
                ? 'bg-emerald-950/70 text-emerald-300 border border-emerald-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            規範合格
          </button>
          <button
            onClick={() => setFilter((prev) => ({ ...prev, complianceOnly: 'VIOLATIONS' }))}
            className={`px-2.5 py-1 text-xs font-medium rounded transition-colors cursor-pointer ${
              filter.complianceOnly === 'VIOLATIONS'
                ? 'bg-amber-950/70 text-amber-300 border border-amber-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            待修復檔名
          </button>
        </div>

        {/* Severity Filter */}
        <div className="flex items-center gap-2 shrink-0">
          <select
            value={filter.selectedSeverity}
            onChange={(e) => setFilter((prev) => ({ ...prev, selectedSeverity: e.target.value as Severity | 'ALL' }))}
            className="bg-slate-950/60 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 outline-none cursor-pointer focus:border-slate-700"
          >
            <option value="ALL">全部嚴重度</option>
            <option value="CRITICAL">CRITICAL (嚴重)</option>
            <option value="HIGH">HIGH (高)</option>
            <option value="MEDIUM">MEDIUM (中)</option>
            <option value="LOW">LOW (低)</option>
            <option value="NORMAL">NORMAL (正常)</option>
          </select>
        </div>

        {/* Sort Dropdown */}
        <div className="flex items-center gap-1.5 shrink-0 bg-slate-950/60 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-300">
          <ArrowUpDown className="w-3.5 h-3.5 text-slate-500" />
          <select
            value={filter.sortBy}
            onChange={(e) => setFilter((prev) => ({ ...prev, sortBy: e.target.value as any }))}
            className="bg-transparent border-none text-slate-300 outline-none cursor-pointer text-xs"
          >
            <option value="date_desc">依更新時間 (新到舊)</option>
            <option value="date_asc">依更新時間 (舊到新)</option>
            <option value="name">依檔案名稱 (A-Z)</option>
            <option value="score">依規範符合分數 (低到高)</option>
          </select>
        </div>
      </div>

      {/* Row 2: Fast Keywords & Results bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex flex-wrap items-center gap-1.5 text-slate-400">
          <span className="flex items-center gap-1 text-[11px] text-slate-400 mr-1">
            <Sparkles className="w-3 h-3 text-blue-400" />
            快速熱搜：
          </span>
          {quickKeywords.map((kw) => (
            <button
              key={kw.label}
              onClick={() => setFilter((prev) => ({ ...prev, searchQuery: kw.query }))}
              className="text-[11px] px-2 py-0.5 rounded bg-slate-800/60 hover:bg-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer border border-slate-800"
            >
              {kw.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3 text-slate-400 text-xs">
          <span>
            檢索結果：<strong className="text-slate-100 font-mono font-medium">{totalMatches}</strong> 件檔案
          </span>
          {isFiltered && (
            <button
              onClick={handleResetAll}
              className="text-blue-400 hover:text-blue-300 underline cursor-pointer"
            >
              重設所有條件
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

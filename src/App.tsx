import React, { useState, useMemo } from 'react';
import { 
  ArtifactCategory, 
  ArtifactFile, 
  FilterState, 
  Subsystem, 
  Severity, 
  ArtifactStatus 
} from './types';
import { computeProjectsFromFiles } from './data/mockData';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { SearchAndFilters } from './components/SearchAndFilters';
import { FileListView } from './components/FileListView';
import { FilePreviewModal } from './components/FilePreviewModal';
import { AgentIngestionModal } from './components/AgentIngestionModal';
import { AgentRulesModal } from './components/AgentRulesModal';
import { LocalFolderScannerModal } from './components/LocalFolderScannerModal';
import { autoFixArtifact, validateArtifact } from './utils/schemaValidator';
import { 
  Sparkles, 
  CheckCircle2, 
  FolderOpen
} from 'lucide-react';

export default function App() {
  const [files, setFiles] = useState<ArtifactFile[]>(() => {
    const saved = localStorage.getItem('artifact_indexer_files_v3');
    if (saved) {
      try {
        const parsed: ArtifactFile[] = JSON.parse(saved);
        // Exclude any legacy demo files
        return parsed.filter((f) => f.source !== 'DEMO' && !f.id.startsWith('f-00'));
      } catch {
        return [];
      }
    }
    return [];
  });

  const [activeNavTab, setActiveNavTab] = useState<'explorer' | 'rules' | 'ingest' | 'scanner'>('explorer');

  // Filter state
  const [filter, setFilter] = useState<FilterState>({
    searchQuery: '',
    selectedProject: 'ALL',
    selectedCategory: 'ALL',
    selectedSubsystem: 'ALL',
    selectedStatus: 'ALL',
    selectedSeverity: 'ALL',
    complianceOnly: 'ALL',
    sortBy: 'date_desc',
  });

  // Modals state
  const [selectedFile, setSelectedFile] = useState<ArtifactFile | null>(null);
  const [isIngestModalOpen, setIsIngestModalOpen] = useState(false);
  const [isRulesModalOpen, setIsRulesModalOpen] = useState(false);
  const [isScannerModalOpen, setIsScannerModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const saveFilesToStorage = (updated: ArtifactFile[]) => {
    setFiles(updated);
    try {
      localStorage.setItem('artifact_indexer_files_v3', JSON.stringify(updated));
    } catch {
      // Storage fallback
    }
  };

  // Dynamically compute real projects from actual files
  const dynamicProjects = useMemo(() => {
    return computeProjectsFromFiles(files);
  }, [files]);

  // Filtered and sorted files
  const filteredFiles = useMemo(() => {
    return files
      .filter((file) => {
        // Query search
        if (filter.searchQuery.trim()) {
          const q = filter.searchQuery.toLowerCase().trim();
          const matchFilename = file.filename.toLowerCase().includes(q);
          const matchSummary = file.metadata.summary?.toLowerCase().includes(q);
          const matchProject = file.metadata.project?.toLowerCase().includes(q);
          const matchSubsystem = file.metadata.subsystem?.toLowerCase().includes(q);
          const matchDocId = file.metadata.doc_id?.toLowerCase().includes(q);
          const matchSeverity = file.metadata.severity?.toLowerCase().includes(q);
          const matchTags = file.metadata.tags?.some((t) => t.toLowerCase().includes(q));
          const matchComps = file.metadata.components?.some((c) => c.toLowerCase().includes(q));
          const matchContent = file.content.toLowerCase().includes(q);

          if (
            !matchFilename &&
            !matchSummary &&
            !matchProject &&
            !matchSubsystem &&
            !matchDocId &&
            !matchSeverity &&
            !matchTags &&
            !matchComps &&
            !matchContent
          ) {
            return false;
          }
        }

        // Project filter
        if (filter.selectedProject !== 'ALL' && file.metadata.project !== filter.selectedProject) {
          return false;
        }

        // Category filter
        if (filter.selectedCategory !== 'ALL' && file.metadata.category !== filter.selectedCategory) {
          return false;
        }

        // Subsystem filter
        if (filter.selectedSubsystem !== 'ALL' && file.metadata.subsystem !== filter.selectedSubsystem) {
          return false;
        }

        // Status filter
        if (filter.selectedStatus !== 'ALL' && file.metadata.status !== filter.selectedStatus) {
          return false;
        }

        // Severity filter
        if (filter.selectedSeverity !== 'ALL' && file.metadata.severity !== filter.selectedSeverity) {
          return false;
        }

        // Compliance filter
        if (filter.complianceOnly === 'COMPLIANT' && !file.ruleCompliance.isCompliant) {
          return false;
        }
        if (filter.complianceOnly === 'VIOLATIONS' && file.ruleCompliance.isCompliant) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (filter.sortBy === 'date_desc') {
          return new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime();
        }
        if (filter.sortBy === 'date_asc') {
          return new Date(a.updatedAt || 0).getTime() - new Date(b.updatedAt || 0).getTime();
        }
        if (filter.sortBy === 'name') {
          return a.filename.localeCompare(b.filename);
        }
        if (filter.sortBy === 'score') {
          return a.ruleCompliance.score - b.ruleCompliance.score;
        }
        return 0;
      });
  }, [files, filter]);

  // Aggregate stats
  const totalCount = files.length;
  const compliantCount = files.filter((f) => f.ruleCompliance.isCompliant).length;
  const violationCount = totalCount - compliantCount;

  // Auto-fix handler
  const handleAutoFix = (fileToFix: ArtifactFile) => {
    const { fixedFilename, fixedContent, extractedMetadata } = autoFixArtifact(
      fileToFix.filename,
      fileToFix.content
    );
    const newCompliance = validateArtifact(fixedFilename, fixedContent);

    const updated = files.map((f) => {
      if (f.id === fileToFix.id) {
        return {
          ...f,
          filename: fixedFilename,
          path: `/artifacts/${fixedFilename}`,
          content: fixedContent,
          metadata: extractedMetadata,
          ruleCompliance: newCompliance,
          updatedAt: new Date().toISOString(),
        };
      }
      return f;
    });

    saveFilesToStorage(updated);
    if (selectedFile?.id === fileToFix.id) {
      setSelectedFile({
        ...fileToFix,
        filename: fixedFilename,
        content: fixedContent,
        metadata: extractedMetadata,
        ruleCompliance: newCompliance,
      });
    }
    showToast(`已成功將「${fileToFix.filename}」依規範標準化更名為「${fixedFilename}」！`);
  };

  // Add new file handler
  const handleSaveNewArtifact = (newFile: ArtifactFile) => {
    const fileWithSource: ArtifactFile = {
      ...newFile,
      source: 'LOCAL',
    };
    const updated = [fileWithSource, ...files];
    saveFilesToStorage(updated);
    showToast(`新檔案「${newFile.filename}」已成功入庫並完成結構化索引！`);
  };

  // Batch import from scanner
  const handleBatchImport = (newItems: ArtifactFile[]) => {
    const updated = [...newItems, ...files];
    saveFilesToStorage(updated);
    showToast(`成功讀取並匯入 ${newItems.length} 件本地檔案至系統！`);
  };

  // Cross-reference link jump
  const handleNavigateToFile = (targetFilename: string) => {
    const found = files.find((f) => f.filename === targetFilename);
    if (found) {
      setSelectedFile(found);
    } else {
      setFilter((prev) => ({ ...prev, searchQuery: targetFilename }));
      setSelectedFile(null);
      showToast(`已為您在檔案庫中搜尋「${targetFilename}」`);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Toast notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-blue-600 text-white text-xs font-semibold px-4 py-2.5 rounded-lg shadow-xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-300" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Bar */}
      <Header
        activeTab={activeNavTab}
        setActiveTab={(tab) => {
          setActiveNavTab(tab);
          if (tab === 'rules') setIsRulesModalOpen(true);
          else if (tab === 'ingest') setIsIngestModalOpen(true);
          else if (tab === 'scanner') setIsScannerModalOpen(true);
        }}
        onOpenIngestModal={() => setIsIngestModalOpen(true)}
        onOpenScannerModal={() => setIsScannerModalOpen(true)}
        totalFiles={totalCount}
        violationCount={violationCount}
      />

      {/* Main Workspace Frame */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        <Sidebar
          projects={dynamicProjects}
          selectedProject={filter.selectedProject}
          onSelectProject={(proj) => setFilter((prev) => ({ ...prev, selectedProject: proj }))}
          selectedCategory={filter.selectedCategory}
          onSelectCategory={(cat) => setFilter((prev) => ({ ...prev, selectedCategory: cat }))}
          selectedSubsystem={filter.selectedSubsystem}
          onSelectSubsystem={(sub) => setFilter((prev) => ({ ...prev, selectedSubsystem: sub }))}
          totalCount={totalCount}
          compliantCount={compliantCount}
          violationCount={violationCount}
          onOpenRules={() => setIsRulesModalOpen(true)}
        />

        {/* Center Main Viewport */}
        <main className="flex-1 flex flex-col h-[calc(100vh-53px)] overflow-hidden bg-slate-950">
          {/* Quick Stats banner if there are violations */}
          {violationCount > 0 && filter.complianceOnly === 'ALL' && (
            <div className="bg-amber-950/30 border-b border-amber-500/20 px-6 py-2 flex items-center justify-between text-xs text-amber-200/90">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                <span>
                  偵測到有 <strong>{violationCount}</strong> 個檔案命名或標頭不符合標準架構，建議執行一鍵自動標準化修正。
                </span>
              </div>
              <button
                onClick={() => setFilter((prev) => ({ ...prev, complianceOnly: 'VIOLATIONS' }))}
                className="text-amber-300 hover:text-white font-semibold underline cursor-pointer ml-3 whitespace-nowrap"
              >
                僅檢視需修復檔案 &rarr;
              </button>
            </div>
          )}

          {/* Search & Filter Bar */}
          <SearchAndFilters
            filter={filter}
            setFilter={setFilter}
            totalMatches={filteredFiles.length}
          />

          {/* High Density File List */}
          <FileListView
            files={filteredFiles}
            onSelectFile={(f) => setSelectedFile(f)}
            onAutoFixFile={handleAutoFix}
            onOpenScanner={() => setIsScannerModalOpen(true)}
          />
        </main>
      </div>

      {/* Modals */}
      <FilePreviewModal
        file={selectedFile}
        onClose={() => setSelectedFile(null)}
        onNavigateToFile={handleNavigateToFile}
        onAutoFix={handleAutoFix}
      />

      <AgentIngestionModal
        isOpen={isIngestModalOpen}
        onClose={() => setIsIngestModalOpen(false)}
        onSaveArtifact={handleSaveNewArtifact}
      />

      <AgentRulesModal
        isOpen={isRulesModalOpen}
        onClose={() => setIsRulesModalOpen(false)}
      />

      <LocalFolderScannerModal
        isOpen={isScannerModalOpen}
        onClose={() => setIsScannerModalOpen(false)}
        onBatchImport={handleBatchImport}
      />
    </div>
  );
}

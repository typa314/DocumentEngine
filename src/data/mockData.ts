import { ArtifactFile, ProjectSummary } from '../types';

export const INITIAL_PROJECTS: ProjectSummary[] = [];
export const INITIAL_ARTIFACTS: ArtifactFile[] = [];

/**
 * Dynamically extract and aggregate project statistics from real loaded files
 */
export function computeProjectsFromFiles(files: ArtifactFile[]): ProjectSummary[] {
  const map = new Map<string, { count: number; bugs: number; lastDate: string; revs: Set<string> }>();

  files.forEach((f) => {
    const prj = f.metadata.project || 'PRJ-MAIN';
    const existing = map.get(prj) || { 
      count: 0, 
      bugs: 0, 
      lastDate: f.updatedAt || '',
      revs: new Set<string>() 
    };
    existing.count += 1;
    if (f.metadata.category === 'BUG_ANALYSIS' || f.metadata.severity === 'CRITICAL' || f.metadata.severity === 'HIGH') {
      existing.bugs += 1;
    }
    if (f.metadata.hardware_rev) {
      existing.revs.add(f.metadata.hardware_rev);
    }
    if (f.updatedAt && (!existing.lastDate || f.updatedAt > existing.lastDate)) {
      existing.lastDate = f.updatedAt;
    }
    map.set(prj, existing);
  });

  return Array.from(map.entries()).map(([code, stats]) => {
    const latestRev = Array.from(stats.revs).pop() || 'Rev-A';
    return {
      id: code,
      code,
      name: code,
      description: `專案包含 ${stats.count} 份結構化工程檔案`,
      activeRev: latestRev,
      fileCount: stats.count,
      bugCount: stats.bugs,
      lastUpdated: stats.lastDate ? stats.lastDate.slice(0, 16).replace('T', ' ') : '—',
    };
  });
}

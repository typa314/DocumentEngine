export type ArtifactCategory = 
  | 'SCHEMATIC'      // 電路圖 (SCH)
  | 'SPECIFICATION'  // 規格書 (SPEC)
  | 'BUG_ANALYSIS'   // BUG測試分析 (TEST)
  | 'AGENT_LOG'      // AGENT紀錄檔 (AGENT)
  | 'FIRMWARE';      // 韌體與暫存器 (FW)

export type Subsystem = 
  | 'power-mgmt'     // 電源管理 / DC-DC / LDO
  | 'rf-telemetry'   // 射頻無線通訊 / BLE / WiFi / LoRa
  | 'motor-esc'      // 馬達驅動 / 電調
  | 'sensor-imu'     // 感知傳感器 / 陀螺儀 / 氣壓計
  | 'mcu-core'       // 主控微控制器 / STM32 / ESP32
  | 'battery-bms'    // 電池管理系統 / 均衡 / 充電
  | 'interface-bus'; // CAN / SPI / I2C / UART 通訊匯流排

export type ArtifactStatus = 
  | 'DRAFT' 
  | 'IN_REVIEW' 
  | 'APPROVED' 
  | 'INVESTIGATING' 
  | 'RESOLVED' 
  | 'CRITICAL' 
  | 'OBSOLETE';

export type Severity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'NORMAL';

export interface ArtifactMetadata {
  schema_version: string;
  doc_id: string;
  project: string;
  category: ArtifactCategory;
  subsystem: Subsystem;
  hardware_rev: string;
  status: ArtifactStatus;
  severity?: Severity;
  author: string;
  created_at: string;
  components: string[];
  related_docs: string[];
  tags: string[];
  summary: string;
}

export interface ValidationIssue {
  level: 'error' | 'warning' | 'info';
  field: string;
  rule: string;
  message: string;
  fixable: boolean;
  suggestedFix?: string;
}

export interface RuleCompliance {
  isCompliant: boolean;
  score: number; // 0 to 100
  issues: ValidationIssue[];
  namingFormatValid: boolean;
  frontmatterValid: boolean;
  taxonomyValid: boolean;
  crossRefsValid: boolean;
}

export interface ArtifactFile {
  id: string;
  filename: string;
  path: string;
  sizeBytes: number;
  updatedAt: string;
  source?: 'LOCAL' | 'DEMO';
  metadata: ArtifactMetadata;
  content: string;
  ruleCompliance: RuleCompliance;
  extraDetails?: {
    schematicNets?: { name: string; voltage: string; pins: string[]; status?: string }[];
    waveformData?: { timeMs: number; vRail: number; currentA: number; tempC: number }[];
    agentTrace?: {
      step: number;
      timestamp: string;
      thought: string;
      action: string;
      tool: string;
      result: string;
    }[];
    specTables?: { param: string; min: string; typ: string; max: string; unit: string; testCond: string }[];
  };
}

export interface ProjectSummary {
  id: string;
  name: string;
  code: string;
  description: string;
  activeRev: string;
  fileCount: number;
  bugCount: number;
  lastUpdated: string;
}

export interface FilterState {
  searchQuery: string;
  selectedProject: string | 'ALL';
  selectedCategory: ArtifactCategory | 'ALL';
  selectedSubsystem: Subsystem | 'ALL';
  selectedStatus: ArtifactStatus | 'ALL';
  selectedSeverity: Severity | 'ALL';
  complianceOnly: 'ALL' | 'COMPLIANT' | 'VIOLATIONS';
  sortBy: 'date_desc' | 'date_asc' | 'name' | 'severity' | 'score';
}

export interface NamingConventionSpec {
  pattern: string;
  regex: RegExp;
  description: string;
  example: string;
  explanation: {
    part: string;
    description: string;
    allowedValues?: string[];
  }[];
}

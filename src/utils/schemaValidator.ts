import { ArtifactCategory, ArtifactMetadata, RuleCompliance, Subsystem, ValidationIssue, Severity, ArtifactStatus } from '../types';

export const CATEGORY_CODE_MAP: Record<ArtifactCategory, string> = {
  SCHEMATIC: 'SCH',
  SPECIFICATION: 'SPEC',
  BUG_ANALYSIS: 'TEST',
  AGENT_LOG: 'AGENT',
  FIRMWARE: 'FW',
};

export const CODE_TO_CATEGORY_MAP: Record<string, ArtifactCategory> = {
  SCH: 'SCHEMATIC',
  SPEC: 'SPECIFICATION',
  TEST: 'BUG_ANALYSIS',
  BUG: 'BUG_ANALYSIS',
  AGENT: 'AGENT_LOG',
  LOG: 'AGENT_LOG',
  FW: 'FIRMWARE',
};

export const SUBSYSTEM_CODE_MAP: Record<Subsystem, string> = {
  'power-mgmt': 'PWR',
  'rf-telemetry': 'RF',
  'motor-esc': 'ESC',
  'sensor-imu': 'IMU',
  'mcu-core': 'MCU',
  'battery-bms': 'BMS',
  'interface-bus': 'BUS',
};

export const CODE_TO_SUBSYSTEM_MAP: Record<string, Subsystem> = {
  PWR: 'power-mgmt',
  RF: 'rf-telemetry',
  ESC: 'motor-esc',
  IMU: 'sensor-imu',
  MCU: 'mcu-core',
  BMS: 'battery-bms',
  BUS: 'interface-bus',
};

// Strict Industry Filename Regex
// Format: PRJ-NAME_CAT_SUBSYS_XXXX_Slug-Description_RevOrStage_YYYYMMDD.ext
export const CANONICAL_FILENAME_REGEX = /^([A-Z0-9-]+)_([A-Z]{2,5})_([A-Z]{2,4})_([A-Z0-9]{3,6})_([a-zA-Z0-9-]+)_(Rev-[A-Z0-9]+|v[0-9.]+|PASS|FAIL|DRAFT|RUN-\d+)_(\d{8})\.([a-z0-9_]+)$/;

/**
 * Minimalist robust YAML Frontmatter parser for browser & Node
 */
export function extractFrontmatter(rawContent: string): { frontmatter: Record<string, any>; body: string; hasFrontmatter: boolean } {
  const trimmed = rawContent.trimStart();
  if (!trimmed.startsWith('---')) {
    return { frontmatter: {}, body: rawContent, hasFrontmatter: false };
  }

  const endIdx = trimmed.indexOf('\n---', 3);
  if (endIdx === -1) {
    return { frontmatter: {}, body: rawContent, hasFrontmatter: false };
  }

  const yamlBlock = trimmed.slice(3, endIdx).trim();
  const body = trimmed.slice(endIdx + 4).trimStart();
  const frontmatter: Record<string, any> = {};

  const lines = yamlBlock.split('\n');
  let currentKey = '';
  let inList = false;

  for (const line of lines) {
    const cleanLine = line.trim();
    if (!cleanLine || cleanLine.startsWith('#')) continue;

    if (cleanLine.startsWith('- ') && inList && currentKey) {
      const val = cleanLine.slice(2).trim().replace(/^["']|["']$/g, '');
      if (Array.isArray(frontmatter[currentKey])) {
        frontmatter[currentKey].push(val);
      }
      continue;
    }

    const colonIdx = line.indexOf(':');
    if (colonIdx > 0) {
      const key = line.slice(0, colonIdx).trim();
      let valueStr = line.slice(colonIdx + 1).trim();

      // Check inline comment
      const commentIdx = valueStr.indexOf(' #');
      if (commentIdx !== -1) {
        valueStr = valueStr.slice(0, commentIdx).trim();
      }

      if (valueStr === '' || valueStr === '[]') {
        currentKey = key;
        inList = true;
        frontmatter[key] = [];
      } else if (valueStr.startsWith('[') && valueStr.endsWith(']')) {
        inList = false;
        currentKey = '';
        const items = valueStr
          .slice(1, -1)
          .split(',')
          .map((s) => s.trim().replace(/^["']|["']$/g, ''))
          .filter(Boolean);
        frontmatter[key] = items;
      } else {
        inList = false;
        currentKey = '';
        // Strip quotes
        const unquoted = valueStr.replace(/^["']|["']$/g, '');
        if (unquoted === 'true') frontmatter[key] = true;
        else if (unquoted === 'false') frontmatter[key] = false;
        else if (!isNaN(Number(unquoted)) && unquoted !== '') frontmatter[key] = Number(unquoted);
        else frontmatter[key] = unquoted;
      }
    }
  }

  return { frontmatter, body, hasFrontmatter: true };
}

/**
 * Serialize metadata to formatted YAML frontmatter
 */
export function generateYamlFrontmatter(metadata: Partial<ArtifactMetadata>): string {
  const lines: string[] = ['---'];
  lines.push(`schema_version: "${metadata.schema_version || '2.1.0'}"`);
  lines.push(`doc_id: "${metadata.doc_id || 'DOC-001'}"`);
  lines.push(`project: "${metadata.project || 'PRJ-CORE'}"`);
  lines.push(`category: "${metadata.category || 'BUG_ANALYSIS'}"`);
  lines.push(`subsystem: "${metadata.subsystem || 'power-mgmt'}"`);
  lines.push(`hardware_rev: "${metadata.hardware_rev || 'Rev-A'}"`);
  lines.push(`status: "${metadata.status || 'DRAFT'}"`);
  if (metadata.severity) {
    lines.push(`severity: "${metadata.severity}"`);
  }
  lines.push(`author: "${metadata.author || 'agent-worker'}"`);
  lines.push(`created_at: "${metadata.created_at || new Date().toISOString()}"`);

  // Components
  const comps = metadata.components || [];
  if (comps.length > 0) {
    lines.push(`components: [${comps.map((c) => `"${c}"`).join(', ')}]`);
  } else {
    lines.push('components: []');
  }

  // Related Docs
  const related = metadata.related_docs || [];
  if (related.length > 0) {
    lines.push('related_docs:');
    related.forEach((r) => lines.push(`  - "${r}"`));
  } else {
    lines.push('related_docs: []');
  }

  // Tags
  const tags = metadata.tags || [];
  if (tags.length > 0) {
    lines.push(`tags: [${tags.map((t) => `"${t}"`).join(', ')}]`);
  } else {
    lines.push('tags: []');
  }

  lines.push(`summary: "${(metadata.summary || '').replace(/"/g, '\\"')}"`);
  lines.push('---');
  return lines.join('\n');
}

/**
 * Validate file name and metadata against full industry rules
 */
export function validateArtifact(filename: string, rawContent: string): RuleCompliance {
  const issues: ValidationIssue[] = [];
  let score = 100;

  // 1. Filename validation
  const match = filename.match(CANONICAL_FILENAME_REGEX);
  const namingFormatValid = !!match;

  if (!match) {
    score -= 30;
    issues.push({
      level: 'error',
      field: 'filename',
      rule: 'RULE_NAME_CONVENTION',
      message: `檔名未符合標準規範：[PROJECT]_[CAT]_[SUBSYS]_[ID]_[SLUG]_[REV]_[YYYYMMDD].[EXT]`,
      fixable: true,
      suggestedFix: `請使用標準命名，如 PRJ-DRONE_TEST_PWR_0301_Buck-Overheat_FAIL_20261007.md`,
    });
  } else {
    const [, prj, catCode, subCode] = match;
    if (!CODE_TO_CATEGORY_MAP[catCode]) {
      score -= 10;
      issues.push({
        level: 'warning',
        field: 'filename',
        rule: 'RULE_UNKNOWN_CAT_CODE',
        message: `檔名中的分類縮寫 "${catCode}" 不在標準清單中 (SCH, SPEC, TEST, AGENT, FW)`,
        fixable: true,
      });
    }
    if (!CODE_TO_SUBSYSTEM_MAP[subCode]) {
      score -= 10;
      issues.push({
        level: 'warning',
        field: 'filename',
        rule: 'RULE_UNKNOWN_SUBSYS_CODE',
        message: `檔名中的子系統代碼 "${subCode}" 不在標準清單中 (PWR, RF, ESC, IMU, MCU, BMS, BUS)`,
        fixable: true,
      });
    }
  }

  // 2. Frontmatter Validation
  const { frontmatter, hasFrontmatter } = extractFrontmatter(rawContent);
  const frontmatterValid = hasFrontmatter;

  if (!hasFrontmatter) {
    score -= 30;
    issues.push({
      level: 'error',
      field: 'frontmatter',
      rule: 'RULE_MISSING_FRONTMATTER',
      message: `缺少 YAML Frontmatter 結構化元數據標頭 (以 --- 開頭與結尾)`,
      fixable: true,
      suggestedFix: '自動產生標準 YAML Frontmatter 標頭',
    });
  } else {
    // Check required fields
    const requiredFields = ['schema_version', 'doc_id', 'project', 'category', 'subsystem', 'hardware_rev', 'status', 'author', 'created_at'];
    for (const req of requiredFields) {
      if (!frontmatter[req]) {
        score -= 6;
        issues.push({
          level: 'error',
          field: req,
          rule: `RULE_MISSING_${req.toUpperCase()}`,
          message: `Frontmatter 缺少必填欄位: "${req}"`,
          fixable: true,
        });
      }
    }

    // Check tags & summary
    if (!frontmatter.summary || String(frontmatter.summary).trim().length < 5) {
      score -= 5;
      issues.push({
        level: 'warning',
        field: 'summary',
        rule: 'RULE_SHORT_SUMMARY',
        message: '缺少有效的概要說明 (summary)，建議提供至少 5 個字元的說明以利快速搜尋',
        fixable: false,
      });
    }

    if (!Array.isArray(frontmatter.tags) || frontmatter.tags.length === 0) {
      score -= 5;
      issues.push({
        level: 'info',
        field: 'tags',
        rule: 'RULE_NO_TAGS',
        message: '未定義搜尋標籤 (tags)，建議加入關鍵字提高檢索命中率',
        fixable: true,
      });
    }
  }

  // 3. Taxonomy Check
  let taxonomyValid = true;
  if (frontmatter.category && !CATEGORY_CODE_MAP[frontmatter.category as ArtifactCategory]) {
    taxonomyValid = false;
    score -= 10;
    issues.push({
      level: 'error',
      field: 'category',
      rule: 'RULE_INVALID_CATEGORY_ENUM',
      message: `不支援的分類: "${frontmatter.category}". 僅允許: SCHEMATIC, SPECIFICATION, BUG_ANALYSIS, AGENT_LOG, FIRMWARE`,
      fixable: true,
    });
  }

  if (frontmatter.subsystem && !SUBSYSTEM_CODE_MAP[frontmatter.subsystem as Subsystem]) {
    taxonomyValid = false;
    score -= 10;
    issues.push({
      level: 'error',
      field: 'subsystem',
      rule: 'RULE_INVALID_SUBSYSTEM_ENUM',
      message: `不支援的子系統: "${frontmatter.subsystem}". 僅允許: power-mgmt, rf-telemetry, motor-esc, sensor-imu, mcu-core, battery-bms, interface-bus`,
      fixable: true,
    });
  }

  // 4. Cross-references check
  let crossRefsValid = true;
  if (Array.isArray(frontmatter.related_docs)) {
    for (const doc of frontmatter.related_docs) {
      if (typeof doc === 'string' && doc.includes(' ') && !doc.endsWith('.md') && !doc.endsWith('.sch') && !doc.endsWith('.pdf')) {
        crossRefsValid = false;
        issues.push({
          level: 'warning',
          field: 'related_docs',
          rule: 'RULE_DIRTY_CROSS_REF',
          message: `關聯文件參照 "${doc}" 似乎包含空白或非常規命名`,
          fixable: false,
        });
      }
    }
  }

  score = Math.max(0, Math.min(100, score));

  return {
    isCompliant: score >= 85 && namingFormatValid && frontmatterValid,
    score,
    issues,
    namingFormatValid,
    frontmatterValid,
    taxonomyValid,
    crossRefsValid,
  };
}

/**
 * Build standard canonical filename from metadata
 */
export function buildCanonicalFilename(meta: Partial<ArtifactMetadata>, extension = 'md'): string {
  const prj = (meta.project || 'PRJ-CORE').toUpperCase().replace(/[^A-Z0-9-]/g, '');
  const cat = meta.category ? CATEGORY_CODE_MAP[meta.category] || 'DOC' : 'DOC';
  const subsys = meta.subsystem ? SUBSYSTEM_CODE_MAP[meta.subsystem] || 'SYS' : 'SYS';
  const id = (meta.doc_id || '0101').replace(/[^a-zA-Z0-9]/g, '').slice(-4).padStart(4, '0');
  
  let slug = (meta.summary || 'Hardware-Artifact')
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .slice(0, 30);
  if (!slug) slug = 'Artifact';

  let rev = meta.hardware_rev || 'Rev-A';
  if (meta.category === 'BUG_ANALYSIS' && meta.status === 'CRITICAL') {
    rev = 'FAIL';
  } else if (meta.category === 'AGENT_LOG') {
    rev = 'RUN-01';
  }

  const dateStr = meta.created_at 
    ? new Date(meta.created_at).toISOString().slice(0, 10).replace(/-/g, '')
    : new Date().toISOString().slice(0, 10).replace(/-/g, '');

  return `${prj}_${cat}_${subsys}_${id}_${slug}_${rev}_${dateStr}.${extension}`;
}

/**
 * Automatically clean and fix non-conforming file and generate compliant file
 */
export function autoFixArtifact(rawFilename: string, rawContent: string): {
  fixedFilename: string;
  fixedContent: string;
  extractedMetadata: ArtifactMetadata;
} {
  const { frontmatter, body } = extractFrontmatter(rawContent);

  // Deduce project
  let project = frontmatter.project || 'PRJ-MAIN';
  if (!frontmatter.project) {
    if (/drone|uav|flight/i.test(rawFilename + rawContent)) project = 'PRJ-DRONE-FC';
    else if (/bms|battery|cell|pack/i.test(rawFilename + rawContent)) project = 'PRJ-BMS-EV';
    else if (/iot|esp32|ble|sensor-hub/i.test(rawFilename + rawContent)) project = 'PRJ-IOT-HUB';
    else if (/motor|esc|robot|arm/i.test(rawFilename + rawContent)) project = 'PRJ-ROBOT-ARM';
  }

  // Deduce category
  let category: ArtifactCategory = frontmatter.category || 'BUG_ANALYSIS';
  if (!frontmatter.category) {
    if (/sch|schematic|kicad|altium|pinout|pcb|gerber|circuit/i.test(rawFilename + rawContent)) category = 'SCHEMATIC';
    else if (/spec|datasheet|specification|limits|ratings|srs/i.test(rawFilename + rawContent)) category = 'SPECIFICATION';
    else if (/bug|fail|test|error|wave|oscilloscope|thermal|crash/i.test(rawFilename + rawContent)) category = 'BUG_ANALYSIS';
    else if (/agent|log|step|thought|tool_call|prompt|trace/i.test(rawFilename + rawContent)) category = 'AGENT_LOG';
    else if (/fw|firmware|register|hal|i2c|spi|driver/i.test(rawFilename + rawContent)) category = 'FIRMWARE';
  }

  // Deduce subsystem
  let subsystem: Subsystem = frontmatter.subsystem || 'power-mgmt';
  if (!frontmatter.subsystem) {
    if (/power|buck|boost|ldo|voltage|rail|vcc|current/i.test(rawFilename + rawContent)) subsystem = 'power-mgmt';
    else if (/rf|wifi|bluetooth|ble|antenna|telemetry|lora/i.test(rawFilename + rawContent)) subsystem = 'rf-telemetry';
    else if (/motor|esc|pwm|mosfet|gate|rpm/i.test(rawFilename + rawContent)) subsystem = 'motor-esc';
    else if (/imu|gyro|accel|magneto|baro|sensor/i.test(rawFilename + rawContent)) subsystem = 'sensor-imu';
    else if (/mcu|stm32|esp32|cortex|flash|dma|clock/i.test(rawFilename + rawContent)) subsystem = 'mcu-core';
    else if (/bms|battery|cell|balance|soc|soh/i.test(rawFilename + rawContent)) subsystem = 'battery-bms';
    else if (/can|i2c|spi|uart|rs485|bus/i.test(rawFilename + rawContent)) subsystem = 'interface-bus';
  }

  // Deduce components
  const foundComponents: string[] = Array.isArray(frontmatter.components) ? [...frontmatter.components] : [];
  const compPatterns = ['STM32[A-Z0-9]+', 'ESP32[A-Z0-9-]*', 'TPS[0-9]+[A-Z0-9]*', 'MPU[0-9]+', 'BQ[0-9]+[A-Z0-9]*', 'DRV[0-9]+', 'INA[0-9]+'];
  compPatterns.forEach((p) => {
    const r = new RegExp(p, 'gi');
    const matches = (rawFilename + ' ' + rawContent).match(r);
    if (matches) {
      matches.forEach((m) => {
        const upper = m.toUpperCase();
        if (!foundComponents.includes(upper)) foundComponents.push(upper);
      });
    }
  });

  // Deduce severity & status
  let severity: Severity = frontmatter.severity || 'MEDIUM';
  let status: ArtifactStatus = frontmatter.status || 'INVESTIGATING';
  if (/critical|burn|overheat|shutdown|destructive/i.test(rawContent)) {
    severity = 'CRITICAL';
    status = 'INVESTIGATING';
  } else if (/pass|verified|approved|fixed/i.test(rawContent)) {
    status = 'RESOLVED';
  }

  const extractedMetadata: ArtifactMetadata = {
    schema_version: '2.1.0',
    doc_id: frontmatter.doc_id || `DOC-${Math.floor(1000 + Math.random() * 9000)}`,
    project,
    category,
    subsystem,
    hardware_rev: frontmatter.hardware_rev || 'Rev-B1',
    status,
    severity,
    author: frontmatter.author || 'AutoIngest-Agent',
    created_at: frontmatter.created_at || new Date().toISOString(),
    components: foundComponents.length ? foundComponents : ['GENERAL_IC'],
    related_docs: Array.isArray(frontmatter.related_docs) ? frontmatter.related_docs : [],
    tags: Array.isArray(frontmatter.tags) && frontmatter.tags.length ? frontmatter.tags : [project.toLowerCase(), subsystem, category.toLowerCase()],
    summary: frontmatter.summary || (body.slice(0, 100).trim().replace(/\n/g, ' ') || '工程檔案與分析報告'),
  };

  const ext = rawFilename.includes('.') ? rawFilename.split('.').pop()! : 'md';
  const fixedFilename = buildCanonicalFilename(extractedMetadata, ext);
  const fixedYaml = generateYamlFrontmatter(extractedMetadata);
  const fixedContent = `${fixedYaml}\n\n${body || '# ' + extractedMetadata.summary}`;

  return {
    fixedFilename,
    fixedContent,
    extractedMetadata,
  };
}

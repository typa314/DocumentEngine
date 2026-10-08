export function generateCursorRules(): string {
  return `# Hardware & Agent Artifact Filing Standards (.cursorrules)
# Version: 2.1.0
# Description: Strict protocol for generating, naming, and indexing engineering files.

[CORE_DIRECTIVE]
Whenever you (the Agent) create or propose any file relating to:
1. Circuit Schematics / Pinouts / KiCad / Altium (SCH)
2. Hardware Specifications / Component Datasheets (SPEC)
3. Bug Test Reports / Oscilloscope Waveforms / Root Cause (TEST)
4. Agent Execution Logs / Reasoning Traces / Run Logs (AGENT)
5. Firmware / HAL / Register definitions (FW)

YOU MUST ADHERE TO THE FOLLOWING 2 MANDATORY REQUIREMENTS:

--------------------------------------------------------------------------------
1. CANONICAL FILENAME FORMAT
--------------------------------------------------------------------------------
Pattern:
[PROJECT]_[CAT]_[SUBSYS]_[DOC_ID]_[SLUG]_[REV/STAGE]_[YYYYMMDD].[ext]

Variables:
- [PROJECT]: Project code in uppercase (e.g., PRJ-DRONE-FC, PRJ-BMS-EV, PRJ-IOT-HUB)
- [CAT]: Strict category acronym:
    * SCH   -> Schematic / Circuit Diagram / BOM
    * SPEC  -> Specification / Component Datasheet
    * TEST  -> Bug & QA Test Analysis / Oscilloscope Waveforms
    * AGENT -> Agent Run Logs / Reasoning Traces
    * FW    -> Firmware Registers / Drivers
- [SUBSYS]: Subsystem acronym:
    * PWR (Power Management / Buck / Boost / LDO)
    * RF  (Radio Frequency / BLE / WiFi / LoRa)
    * ESC (Motor / Electronic Speed Controller)
    * IMU (Sensor / Gyro / Accel / Barometer)
    * MCU (Microcontroller Core / STM32 / ESP32)
    * BMS (Battery Management System)
    * BUS (CAN / I2C / SPI / UART)
- [DOC_ID]: 4-digit sequence number or doc identifier (e.g., 0102, 0301)
- [SLUG]: Concise kebab-case description (max 30 chars, no spaces)
- [REV/STAGE]: Revision or outcome (e.g., RevB, Rev-1.2, PASS, FAIL, RUN-88)
- [YYYYMMDD]: Current ISO date (e.g., 20261007)

Example:
- PRJ-DRONE-FC_SCH_PWR_0102_5V-Buck-Converter_RevB_20261005.kicad_sch
- PRJ-DRONE-FC_TEST_PWR_0301_Thermal-Shutdown-Analysis_FAIL_20261007.md
- PRJ-DRONE-FC_AGENT_NAV_0401_Kalman-Tuning-Session_RUN-88_20261007.log

--------------------------------------------------------------------------------
2. MANDATORY YAML FRONTMATTER
--------------------------------------------------------------------------------
Every generated Markdown, Log, or Spec text file MUST begin with this exact header:

---
schema_version: "2.1.0"
doc_id: "DOC-XXXX"
project: "PRJ-DRONE-FC"
category: "BUG_ANALYSIS"      # SCHEMATIC | SPECIFICATION | BUG_ANALYSIS | AGENT_LOG | FIRMWARE
subsystem: "power-mgmt"       # power-mgmt | rf-telemetry | motor-esc | sensor-imu | mcu-core | battery-bms | interface-bus
hardware_rev: "Rev-B2"
status: "INVESTIGATING"       # DRAFT | IN_REVIEW | APPROVED | INVESTIGATING | RESOLVED | OBSOLETE
severity: "HIGH"              # CRITICAL | HIGH | MEDIUM | LOW | NORMAL
author: "Agent-HardwareQA"
created_at: "2026-10-07T14:30:00Z"
components: ["TPS54302", "L1-10uH", "Cout-22uF"]
related_docs:
  - "PRJ-DRONE-FC_SCH_PWR_0102_5V-Buck-Converter_RevB_20261005.kicad_sch"
tags: ["buck-converter", "thermal-shutdown", "ripple-noise"]
summary: "Under 2.5A load, 5V buck converter triggers thermal shutdown after 42s."
---

# [Document Title]
... document body ...
`;
}

export function generateClaudeMarkdown(): string {
  return `# CLAUDE.md - Multi-Agent Artifact Storage & Indexing Protocol

## 1. Objective
Ensure all autonomous Agents write engineering artifacts into the local repository using a single, uniform taxonomy, standard naming schema, and structured frontmatter. This guarantees 100% automated indexing and instant cross-reference search.

## 2. Directory Layout (Johnny.Decimal Hybrid)
\`\`\`
/artifacts/
  ├── 10-19_SCHEMATICS/        # [SCH] Schematics, Altium, KiCad, Gerber, Netlists
  ├── 20-29_SPECIFICATIONS/    # [SPEC] Datasheets, Component SRS, Pinout Tables
  ├── 30-39_BUG_ANALYSIS/      # [TEST] Bug reports, DVT Logs, Waveforms, 5-Why
  ├── 40-49_AGENT_LOGS/        # [AGENT] Run traces, Tool executions, Reasoning dumps
  └── 50-59_FIRMWARE/          # [FW] Registers, Driver definitions, HAL maps
\`\`\`

## 3. Strict Naming Syntax
\`\`\`
^[A-Z0-9-]+_[A-Z]{2,5}_[A-Z]{2,4}_[A-Z0-9]{3,6}_[a-zA-Z0-9-]+_(Rev-[A-Z0-9]+|v[0-9.]+|PASS|FAIL|DRAFT|RUN-\\d+)_\\d{8}\\.[a-z0-9_]+$
\`\`\`

## 4. Subsystem Code Dictionary
| Code | Category Key | Domain Description |
| :--- | :--- | :--- |
| **PWR** | \`power-mgmt\` | Buck/Boost DC-DC, LDO, Power rails, Noise filtering |
| **RF** | \`rf-telemetry\` | 2.4GHz BLE, WiFi, LoRa, Antenna matching, RSSI |
| **ESC** | \`motor-esc\` | BLDC motor driving, MOSFET bridge, Gate driver, Current sense |
| **IMU** | \`sensor-imu\` | 6-DOF / 9-DOF Gyroscope, Accelerometer, Barometer |
| **MCU** | \`mcu-core\` | Microcontroller core, Clocks, NVIC, Reset circuitry |
| **BMS** | \`battery-bms\` | LiPo / 18650 cell monitoring, Passive balancing, Protection |
| **BUS** | \`interface-bus\` | CAN-FD, SPI high-speed, I2C pull-ups, UART debug |

## 5. Bidirectional Cross-Referencing
When a Bug Report or Agent Debug Session is written:
- In \`related_docs:\`, you MUST include the filename of the target Schematic and Datasheet being analyzed.
- In \`components:\`, list exact IC part numbers (e.g., \`["BQ76952", "INA226", "STM32G474"]\`).
`;
}

export function generatePythonPreCommitHook(): string {
  return `#!/usr/bin/env python3
"""
Hardware & Agent Artifact Pre-Commit Validator (validate_agent_artifact.py)
Validates that newly committed files match canonical naming and YAML frontmatter.
Place in .git/hooks/pre-commit or run via CI/CD.
"""

import sys
import re
import os

FILENAME_PATTERN = re.compile(
    r'^[A-Z0-9-]+_[A-Z]{2,5}_[A-Z]{2,4}_[A-Z0-9]{3,6}_[a-zA-Z0-9-]+_(Rev-[A-Z0-9]+|v[0-9.]+|PASS|FAIL|DRAFT|RUN-\\d+)_\\d{8}\\.[a-z0-9_]+$'
)

VALID_CATEGORIES = {'SCH', 'SPEC', 'TEST', 'AGENT', 'FW'}
VALID_SUBSYSTEMS = {'PWR', 'RF', 'ESC', 'IMU', 'MCU', 'BMS', 'BUS'}

def validate_file(filepath):
    filename = os.path.basename(filepath)
    errors = []

    # 1. Check Filename
    if not FILENAME_PATTERN.match(filename):
        errors.append(f"[FAIL] Filename '{filename}' violates convention: [PROJECT]_[CAT]_[SUBSYS]_[ID]_[SLUG]_[REV]_[YYYYMMDD].[EXT]")
        return False, errors

    parts = filename.split('_')
    cat, subsys = parts[1], parts[2]
    if cat not in VALID_CATEGORIES:
        errors.append(f"[WARN] Unknown category '{cat}', expected: {VALID_CATEGORIES}")
    if subsys not in VALID_SUBSYSTEMS:
        errors.append(f"[WARN] Unknown subsystem '{subsys}', expected: {VALID_SUBSYSTEMS}")

    # 2. Check Frontmatter for Markdown / Log / Text
    if filepath.endswith(('.md', '.log', '.txt', '.yaml')):
        try:
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read(1024) # check first 1KB
                if not content.startswith('---'):
                    errors.append("[FAIL] Missing YAML Frontmatter (must begin with '---')")
                elif 'schema_version:' not in content or 'doc_id:' not in content:
                    errors.append("[FAIL] Incomplete Frontmatter: missing schema_version or doc_id")
        except Exception as e:
            errors.append(f"[FAIL] Could not read file: {e}")

    return len(errors) == 0, errors

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print("Usage: python validate_agent_artifact.py <file1> <file2> ...")
        sys.exit(0)

    has_error = False
    for path in sys.argv[1:]:
        ok, errs = validate_file(path)
        if not ok:
            has_error = True
            for err in errs:
                print(f"{path}: {err}", file=sys.stderr)
        else:
            print(f"[OK] {os.path.basename(path)} conforms to spec.")

    if has_error:
        sys.exit(1)
    print("All artifacts passed validation!")
`;
}

export function generateOpenAIFunctionSchema(): string {
  return JSON.stringify(
    {
      name: "save_engineering_artifact",
      description: "Saves a new engineering document, circuit schematic note, bug report, or agent execution log conforming to the strict organizational taxonomy.",
      parameters: {
        type: "object",
        properties: {
          project: {
            type: "string",
            description: "Standard project identifier, e.g. PRJ-DRONE-FC, PRJ-BMS-EV"
          },
          category: {
            type: "string",
            enum: ["SCHEMATIC", "SPECIFICATION", "BUG_ANALYSIS", "AGENT_LOG", "FIRMWARE"],
            description: "High-level artifact category"
          },
          subsystem: {
            type: "string",
            enum: ["power-mgmt", "rf-telemetry", "motor-esc", "sensor-imu", "mcu-core", "battery-bms", "interface-bus"],
            description: "Target hardware or software subsystem"
          },
          hardware_rev: {
            type: "string",
            description: "Hardware revision or stage, e.g. Rev-B2, Rev-A, v1.0"
          },
          status: {
            type: "string",
            enum: ["DRAFT", "IN_REVIEW", "APPROVED", "INVESTIGATING", "RESOLVED", "CRITICAL", "OBSOLETE"]
          },
          severity: {
            type: "string",
            enum: ["CRITICAL", "HIGH", "MEDIUM", "LOW", "NORMAL"]
          },
          slug_description: {
            type: "string",
            description: "Short kebab-case description for filename, e.g. 5v-buck-converter"
          },
          components: {
            type: "array",
            items: { type: "string" },
            description: "List of relevant ICs, semiconductors, or component part numbers"
          },
          related_docs: {
            type: "array",
            items: { type: "string" },
            description: "Filenames of related schematics, specs, or bug reports"
          },
          tags: {
            type: "array",
            items: { type: "string" },
            description: "Search keywords"
          },
          summary: {
            type: "string",
            description: "One sentence executive summary of the artifact"
          },
          content_body: {
            type: "string",
            description: "Full markdown/text content of the file"
          }
        },
        required: ["project", "category", "subsystem", "slug_description", "summary", "content_body"]
      }
    },
    null,
    2
  );
}

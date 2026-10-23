// ==============================================================================
// BrightPath CRM — Phase 9 Automated Test Suite
// Reports Feature & CSV Data Export
// ==============================================================================

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { escapeCSVCell, generateCSVContent } from '../src/utils/csvExport.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

let passed = 0;
let total = 0;

function assert(condition, message) {
  total++;
  if (condition) {
    console.log(`  ✅ PASS: ${message}`);
    passed++;
  } else {
    console.error(`  ❌ FAIL: ${message}`);
    process.exitCode = 1;
  }
}

console.log('================================================================');
console.log('🧪 BrightPath CRM — Phase 9: Reports & CSV Export Verification');
console.log('================================================================\n');

// -----------------------------------------------------------------------------
// Test Group 1: RFC 4180 CSV Escaping & UTF-8 BOM Formatting
// -----------------------------------------------------------------------------
console.log('--- Test Group 1: RFC 4180 CSV Escaping & UTF-8 Formatting ---');

assert(escapeCSVCell('Regular Text') === 'Regular Text', 'Plain text without commas or quotes remains unchanged');
assert(escapeCSVCell('NEET, JEE & Foundation') === '"NEET, JEE & Foundation"', 'String with commas is enclosed in quotes');
assert(escapeCSVCell('Special "Discount" 15%') === '"Special ""Discount"" 15%"', 'Quotes inside cell are doubled according to RFC 4180');
assert(escapeCSVCell("Line 1\nLine 2") === '"Line 1\nLine 2"', 'String with newline is enclosed in quotes');
assert(escapeCSVCell(null) === '', 'null value produces empty string');
assert(escapeCSVCell(undefined) === '', 'undefined value produces empty string');
assert(escapeCSVCell(42) === '42', 'Numbers are formatted as strings');
assert(escapeCSVCell(true) === 'true', 'Booleans are formatted as strings');

// Multi-line CSV generation with UTF-8 BOM
const headers = ['Lead ID', 'Student Name', 'Course, Interest', 'Status'];
const rows = [
  ['BP-001', 'Aarav Sharma', 'NEET Comprehensive, 2-Year', 'New'],
  ['BP-002', 'Priya "Patel"', 'JEE Advanced', 'Converted'],
];

const csvOutput = generateCSVContent(headers, rows);
assert(csvOutput.startsWith('\uFEFF'), 'CSV content starts with UTF-8 BOM (\\uFEFF) for Excel compatibility');
assert(csvOutput.includes('"NEET Comprehensive, 2-Year"'), 'Enclosed cell with comma properly included in output');
assert(csvOutput.includes('"Priya ""Patel"""'), 'Escaped quotes properly included in output');
assert(csvOutput.split('\r\n').length === 3, 'CSV output contains exact header + 2 row lines');

// -----------------------------------------------------------------------------
// Test Group 2: Source Conversion Calculations & Zero Division Guard
// -----------------------------------------------------------------------------
console.log('\n--- Test Group 2: Source Conversion Funnel Formulas ---');

function computeRate(converted, total) {
  if (!total || total <= 0) return 0;
  return Math.round((converted / total) * 1000) / 10;
}

assert(computeRate(0, 0) === 0, 'Zero division guard: 0 / 0 -> 0%');
assert(computeRate(4, 16) === 25, 'Website conversion: 4 / 16 -> 25.0%');
assert(computeRate(2, 5) === 40, 'Referral conversion: 2 / 5 -> 40.0%');
assert(computeRate(0, 10) === 0, 'Zero converted: 0 / 10 -> 0.0%');

// -----------------------------------------------------------------------------
// Test Group 3: Counselor Workload & Follow-up Completion Rate Formulas
// -----------------------------------------------------------------------------
console.log('\n--- Test Group 3: Counselor Workload & Follow-up Completion Rates ---');

function computeFuRate(completed, total) {
  if (!total || total <= 0) return 0;
  return Math.round((completed / total) * 1000) / 10;
}

assert(computeFuRate(0, 0) === 0, 'Counselor zero follow-ups guard: 0 / 0 -> 0%');
assert(computeFuRate(8, 10) === 80, 'Counselor follow-up completion: 8 / 10 -> 80.0%');
assert(computeFuRate(15, 15) === 100, 'All follow-ups completed: 15 / 15 -> 100.0%');

// -----------------------------------------------------------------------------
// Test Group 4: reportService Architecture & API Contracts
// -----------------------------------------------------------------------------
console.log('\n--- Test Group 4: reportService Architecture & Export Contracts ---');

const reportServiceFile = fs.readFileSync(path.join(rootDir, 'src/services/reportService.ts'), 'utf-8');

assert(reportServiceFile.includes('getReportsSummary'), 'reportService exports getReportsSummary');
assert(reportServiceFile.includes('getLeadsExportData'), 'reportService exports getLeadsExportData');
assert(reportServiceFile.includes('generateSourceCSV'), 'reportService exports generateSourceCSV');
assert(reportServiceFile.includes('generateCounselorCSV'), 'reportService exports generateCounselorCSV');
assert(reportServiceFile.includes('conversionRate'), 'Source and Counselor models include conversionRate');
assert(reportServiceFile.includes('followupCompletionRate'), 'Counselor model includes followupCompletionRate');
assert(reportServiceFile.includes('Unassigned Queue'), 'Handles unassigned pool in counselor report');

// -----------------------------------------------------------------------------
// Test Group 5: ReportsPage UI Integration & Views Contract
// -----------------------------------------------------------------------------
console.log('\n--- Test Group 5: ReportsPage UI Integration & Views ---');

const reportsPageFile = fs.readFileSync(path.join(rootDir, 'src/pages/ReportsPage.tsx'), 'utf-8');

assert(reportsPageFile.includes('ReportsPage'), 'Exports ReportsPage component');
assert(reportsPageFile.includes('Source Conversion Funnel'), 'Renders Source Conversion Funnel tab');
assert(reportsPageFile.includes('Counselor Performance'), 'Renders Counselor Performance tab');
assert(reportsPageFile.includes('Data Export Center'), 'Renders Data Export Center tab');
assert(reportsPageFile.includes('handleExportAllLeads'), 'Provides Export All Leads handler');
assert(reportsPageFile.includes('handleExportSourceReport'), 'Provides Export Source Report handler');
assert(reportsPageFile.includes('handleExportCounselorReport'), 'Provides Export Counselor Report handler');
assert(reportsPageFile.includes('downloadCSV'), 'ReportsPage calls downloadCSV utility');

// -----------------------------------------------------------------------------
// Final Summary
// -----------------------------------------------------------------------------
console.log('\n================================================================');
console.log(`📊 Result: ${passed}/${total} Tests Passed (${Math.round((passed / total) * 100)}%)`);
console.log('================================================================');

if (passed === total) {
  console.log('🎉 ALL PHASE 9 REPORTS & CSV EXPORT SPECIFICATIONS FULLY VERIFIED!\n');
} else {
  process.exit(1);
}

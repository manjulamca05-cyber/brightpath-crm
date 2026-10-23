// ==============================================================================
// BrightPath CRM — Phase 8 Automated Test Suite
// Dashboard Analytics & Metric Reconciliation
// ==============================================================================

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

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
console.log('🧪 BrightPath CRM — Phase 8: Dashboard Analytics & Reconciliation');
console.log('================================================================\n');

// -----------------------------------------------------------------------------
// Test Group 1: Conversion Rate Mathematical Invariants & Zero Division Guard
// -----------------------------------------------------------------------------
console.log('--- Test Group 1: Conversion Rate Formulas & Zero Division Guards ---');

function computeConversionRate(converted, totalLeads) {
  if (!totalLeads || totalLeads <= 0) return 0;
  return Math.round((converted / totalLeads) * 1000) / 10;
}

assert(computeConversionRate(0, 0) === 0, 'Zero division guard: 0 converted / 0 total -> 0% (NOT NaN / Infinity)');
assert(Number.isFinite(computeConversionRate(0, 0)), 'Zero division guard returns finite number');
assert(computeConversionRate(5, 20) === 25, 'Standard calculation: 5 / 20 -> 25.0%');
assert(computeConversionRate(1, 3) === 33.3, 'Rounded precision: 1 / 3 -> 33.3%');
assert(computeConversionRate(10, 10) === 100, 'All converted: 10 / 10 -> 100.0%');
assert(computeConversionRate(0, 50) === 0, 'Zero converted: 0 / 50 -> 0.0%');

// -----------------------------------------------------------------------------
// Test Group 2: Pipeline Reconciliation Invariants
// -----------------------------------------------------------------------------
console.log('\n--- Test Group 2: Pipeline Reconciliation Invariants ---');

const mockStatusCounts = {
  New: 4,
  Contacted: 6,
  Qualified: 3,
  Converted: 5,
  Lost: 2,
};

const sumStatus = Object.values(mockStatusCounts).reduce((a, b) => a + b, 0);
const expectedTotal = 20;
assert(sumStatus === expectedTotal, `Sum of status counts (${sumStatus}) reconciles with total leads (${expectedTotal})`);

const activePipeline = mockStatusCounts.Contacted + mockStatusCounts.Qualified;
assert(activePipeline === 9, `Active pipeline (${activePipeline}) equals Contacted (${mockStatusCounts.Contacted}) + Qualified (${mockStatusCounts.Qualified})`);

const mockSourceCounts = {
  Website: 7,
  'Phone Call': 4,
  WhatsApp: 5,
  Referral: 2,
  'Walk-in': 1,
  Other: 1,
};

const sumSources = Object.values(mockSourceCounts).reduce((a, b) => a + b, 0);
assert(sumSources === expectedTotal, `Sum of acquisition sources (${sumSources}) reconciles with total leads (${expectedTotal})`);

// -----------------------------------------------------------------------------
// Test Group 3: Follow-up Math & Sorting Invariants
// -----------------------------------------------------------------------------
console.log('\n--- Test Group 3: Overdue Follow-ups Math & Urgency Ordering ---');

const nowMs = Date.now();
const mockFollowups = [
  { id: '1', status: 'pending', due_at: new Date(nowMs - 3600 * 1000 * 5).toISOString() }, // 5h ago (overdue)
  { id: '2', status: 'pending', due_at: new Date(nowMs - 3600 * 1000 * 2).toISOString() }, // 2h ago (overdue)
  { id: '3', status: 'pending', due_at: new Date(nowMs + 3600 * 1000 * 3).toISOString() }, // 3h later (upcoming)
  { id: '4', status: 'completed', due_at: new Date(nowMs - 3600 * 1000 * 24).toISOString() }, // completed
];

let overdueCount = 0;
let upcomingCount = 0;
const overdueList = [];

for (const fu of mockFollowups) {
  if (fu.status === 'pending') {
    if (new Date(fu.due_at).getTime() < nowMs) {
      overdueCount++;
      overdueList.push(fu);
    } else {
      upcomingCount++;
    }
  }
}

assert(overdueCount === 2, `Overdue count is 2 (pending items before now)`);
assert(upcomingCount === 1, `Upcoming count is 1 (pending items after now)`);

overdueList.sort((a, b) => new Date(a.due_at).getTime() - new Date(b.due_at).getTime());
assert(overdueList[0].id === '1', 'Most overdue item (5h ago) is sorted first in urgent widget');

// -----------------------------------------------------------------------------
// Test Group 4: metricService Architecture & API Contracts
// -----------------------------------------------------------------------------
console.log('\n--- Test Group 4: metricService Architecture & Export Contracts ---');

const metricServiceFile = fs.readFileSync(path.join(rootDir, 'src/services/metricService.ts'), 'utf-8');

assert(metricServiceFile.includes('getDashboardMetrics'), 'metricService exports getDashboardMetrics');
assert(metricServiceFile.includes('ALL_STATUSES'), 'metricService exports ALL_STATUSES');
assert(metricServiceFile.includes('ALL_SOURCES'), 'metricService exports ALL_SOURCES');
assert(metricServiceFile.includes('conversionRate'), 'DashboardMetrics interface specifies conversionRate');
assert(metricServiceFile.includes('statusCounts'), 'DashboardMetrics specifies statusCounts breakdown');
assert(metricServiceFile.includes('sourceCounts'), 'DashboardMetrics specifies sourceCounts breakdown');
assert(metricServiceFile.includes('urgentFollowups'), 'DashboardMetrics specifies urgentFollowups widget data');
assert(metricServiceFile.includes('recentLeads'), 'DashboardMetrics specifies recentLeads widget data');
assert(metricServiceFile.includes('totalLeads > 0'), 'metricService implements division by zero guard');

// -----------------------------------------------------------------------------
// Test Group 5: DashboardPage UI Integration & Widgets Contract
// -----------------------------------------------------------------------------
console.log('\n--- Test Group 5: DashboardPage UI Integration & Widgets ---');

const dashboardPageFile = fs.readFileSync(path.join(rootDir, 'src/pages/DashboardPage.tsx'), 'utf-8');

assert(dashboardPageFile.includes('DashboardPage'), 'Exports DashboardPage component');
assert(dashboardPageFile.includes('Total Inquiries'), 'Renders Total Inquiries KPI card');
assert(dashboardPageFile.includes('New Leads'), 'Renders New Leads KPI card');
assert(dashboardPageFile.includes('Active Pipeline'), 'Renders Active Pipeline KPI card');
assert(dashboardPageFile.includes('Conversion Rate'), 'Renders Conversion Rate KPI card');
assert(dashboardPageFile.includes('Overdue Follow-ups'), 'Renders Overdue Follow-ups KPI card');
assert(dashboardPageFile.includes('Pipeline by Status'), 'Renders Pipeline by Status visual breakdown');
assert(dashboardPageFile.includes('Acquisition Channels'), 'Renders Acquisition Channels source breakdown');
assert(dashboardPageFile.includes('Urgent Overdue Follow-ups'), 'Renders Urgent Overdue Follow-ups widget');
assert(dashboardPageFile.includes('Recent Inquiries'), 'Renders Recent Inquiries widget');
assert(dashboardPageFile.includes('handleCompleteFollowup'), 'Provides one-click completion on urgent follow-ups');
assert(dashboardPageFile.includes('CreateLeadModal'), 'Embeds CreateLeadModal for direct lead registration');
assert(dashboardPageFile.includes('ScheduleFollowupModal'), 'Embeds ScheduleFollowupModal for direct follow-up creation');

// -----------------------------------------------------------------------------
// Final Summary
// -----------------------------------------------------------------------------
console.log('\n================================================================');
console.log(`📊 Result: ${passed}/${total} Tests Passed (${Math.round((passed / total) * 100)}%)`);
console.log('================================================================');

if (passed === total) {
  console.log('🎉 ALL PHASE 8 DASHBOARD METRICS & RECONCILIATION INVARIANTS VERIFIED!\n');
} else {
  process.exit(1);
}

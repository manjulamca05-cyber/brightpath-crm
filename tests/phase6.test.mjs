// ==============================================================================
// BrightPath CRM — Phase 6 Automated Test Suite
// Follow-ups Engine & Notification Logic
// ==============================================================================

import {
  isFollowupOverdue,
  formatDateTime,
  formatDate,
  getRelativeTimeDescription,
  toDatetimeLocalInputString,
  getPresetDate,
} from '../src/utils/dateUtils.ts';

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
console.log('🧪 BrightPath CRM — Phase 6: Follow-ups Engine & Date Math');
console.log('================================================================\n');

// -----------------------------------------------------------------------------
// Test Group 1: Strict Overdue Date Math Invariants
// -----------------------------------------------------------------------------
console.log('--- Test Group 1: Strict Overdue Date Math Invariants ---');

const now = Date.now();
const oneHourAgo = new Date(now - 3600 * 1000).toISOString();
const yesterday = new Date(now - 86400 * 1000).toISOString();
const threeDaysAgo = new Date(now - 86400 * 1000 * 3).toISOString();

const oneHourLater = new Date(now + 3600 * 1000).toISOString();
const tomorrow = new Date(now + 86400 * 1000).toISOString();
const nextWeek = new Date(now + 86400 * 1000 * 7).toISOString();

assert(isFollowupOverdue(oneHourAgo, 'pending') === true, '1 hour ago (pending) -> Overdue: true');
assert(isFollowupOverdue(yesterday, 'pending') === true, 'Yesterday (pending) -> Overdue: true');
assert(isFollowupOverdue(threeDaysAgo, 'pending') === true, '3 days ago (pending) -> Overdue: true');

assert(isFollowupOverdue(oneHourLater, 'pending') === false, '1 hour later (pending) -> Overdue: false');
assert(isFollowupOverdue(tomorrow, 'pending') === false, 'Tomorrow (pending) -> Overdue: false');
assert(isFollowupOverdue(nextWeek, 'pending') === false, 'Next week (pending) -> Overdue: false');

// Completed items must NEVER appear overdue, even if due_at was in the past
assert(isFollowupOverdue(oneHourAgo, 'completed') === false, '1 hour ago (completed) -> Overdue: false (NEVER OVERDUE)');
assert(isFollowupOverdue(yesterday, 'completed') === false, 'Yesterday (completed) -> Overdue: false');
assert(isFollowupOverdue(threeDaysAgo, 'completed') === false, '3 days ago (completed) -> Overdue: false');

// Cancelled items must NEVER appear overdue
assert(isFollowupOverdue(oneHourAgo, 'cancelled') === false, '1 hour ago (cancelled) -> Overdue: false');
assert(isFollowupOverdue(yesterday, 'cancelled') === false, 'Yesterday (cancelled) -> Overdue: false');

// Invalid date edge case
assert(isFollowupOverdue('invalid-date-string', 'pending') === false, 'Invalid date string -> Overdue: false');

// -----------------------------------------------------------------------------
// Test Group 2: Relative Time Description Calculations
// -----------------------------------------------------------------------------
console.log('\n--- Test Group 2: Relative Time Descriptions ---');

const relHourAgo = getRelativeTimeDescription(oneHourAgo, 'pending');
assert(relHourAgo.toLowerCase().includes('overdue by 1 hour'), `1 hour ago text contains "overdue by 1 hour"`);

const relYesterday = getRelativeTimeDescription(yesterday, 'pending');
assert(relYesterday.toLowerCase().includes('overdue by 1 day'), `Yesterday text contains "overdue by 1 day"`);

const relTomorrow = getRelativeTimeDescription(tomorrow, 'pending');
assert(relTomorrow.toLowerCase().includes('due tomorrow'), `Tomorrow text contains "due tomorrow"`);

const relCompleted = getRelativeTimeDescription(yesterday, 'completed');
assert(relCompleted === 'Completed', `Completed item text is "Completed"`);

const relCancelled = getRelativeTimeDescription(yesterday, 'cancelled');
assert(relCancelled === 'Cancelled', `Cancelled item text is "Cancelled"`);

// -----------------------------------------------------------------------------
// Test Group 3: Localized Date Formatting & Presets
// -----------------------------------------------------------------------------
console.log('\n--- Test Group 3: Localized Date Formatting & Presets ---');

const formattedDt = formatDateTime('2026-10-24T15:30:00.000Z');
assert(typeof formattedDt === 'string' && formattedDt !== 'Invalid date', `formatDateTime valid`);

const formattedD = formatDate('2026-10-24T15:30:00.000Z');
assert(typeof formattedD === 'string' && formattedD !== 'Invalid date', `formatDate valid`);

const preset2h = getPresetDate('plus2hours');
assert(preset2h.getTime() > now, `Preset +2h is in the future`);

const presetTom = getPresetDate('tomorrow10am');
assert(presetTom.getHours() === 10, `Preset tomorrow 10am has hour 10`);

const inputStr = toDatetimeLocalInputString(presetTom);
assert(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(inputStr), `toDatetimeLocalInputString produces HTML format: "${inputStr}"`);

// -----------------------------------------------------------------------------
// Test Group 4: Source Files Structure & API Contracts
// -----------------------------------------------------------------------------
console.log('\n--- Test Group 4: Source Files & API Contracts ---');

const followupServiceContent = fs.readFileSync(path.join(rootDir, 'src/services/followupService.ts'), 'utf-8');
assert(followupServiceContent.includes('getFollowups'), 'followupService exports getFollowups');
assert(followupServiceContent.includes('getFollowupCounts'), 'followupService exports getFollowupCounts');
assert(followupServiceContent.includes('createFollowup'), 'followupService exports createFollowup');
assert(followupServiceContent.includes('completeFollowup'), 'followupService exports completeFollowup');
assert(followupServiceContent.includes('cancelFollowup'), 'followupService exports cancelFollowup');

const followupsPageContent = fs.readFileSync(path.join(rootDir, 'src/pages/FollowupsPage.tsx'), 'utf-8');
assert(followupsPageContent.includes('ScheduleFollowupModal'), 'FollowupsPage renders ScheduleFollowupModal');
assert(followupsPageContent.includes('FollowupCard'), 'FollowupsPage renders FollowupCard');
assert(followupsPageContent.includes("setActiveTab('overdue')"), 'FollowupsPage supports Overdue tab');
assert(followupsPageContent.includes("setActiveTab('upcoming')"), 'FollowupsPage supports Upcoming tab');
assert(followupsPageContent.includes("setActiveTab('completed')"), 'FollowupsPage supports Completed tab');

// -----------------------------------------------------------------------------
// Final Summary
// -----------------------------------------------------------------------------
console.log('\n================================================================');
console.log(`📊 Result: ${passed}/${total} Tests Passed (${Math.round((passed / total) * 100)}%)`);
console.log('================================================================');

if (passed === total) {
  console.log('🎉 ALL PHASE 6 SPECIFICATIONS FULLY VERIFIED!\n');
} else {
  process.exit(1);
}

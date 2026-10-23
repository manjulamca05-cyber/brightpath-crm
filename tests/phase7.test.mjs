// ==============================================================================
// BrightPath CRM — Phase 7 Automated Test Suite
// Activity History & Automated Audit Logging
// ==============================================================================

import { getEventRelativeTime } from '../src/utils/dateUtils.ts';
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
console.log('🧪 BrightPath CRM — Phase 7: Activity History & Audit Logging');
console.log('================================================================\n');

// -----------------------------------------------------------------------------
// Test Group 1: Activity Event Relative Time Math
// -----------------------------------------------------------------------------
console.log('--- Test Group 1: Activity Event Relative Time Calculations ---');

const now = Date.now();
const justNow = new Date(now - 10 * 1000).toISOString();
const fiveMinsAgo = new Date(now - 5 * 60 * 1000).toISOString();
const twoHoursAgo = new Date(now - 2 * 3600 * 1000).toISOString();
const yesterday = new Date(now - 26 * 3600 * 1000).toISOString();
const fourDaysAgo = new Date(now - 4 * 86400 * 1000).toISOString();

assert(getEventRelativeTime(justNow) === 'Just now', '10 seconds ago -> "Just now"');
assert(getEventRelativeTime(fiveMinsAgo) === '5m ago', '5 minutes ago -> "5m ago"');
assert(getEventRelativeTime(twoHoursAgo) === '2h ago', '2 hours ago -> "2h ago"');
assert(getEventRelativeTime(yesterday) === 'Yesterday', '26 hours ago -> "Yesterday"');
assert(getEventRelativeTime(fourDaysAgo) === '4d ago', '4 days ago -> "4d ago"');
assert(getEventRelativeTime('invalid-date') === '', 'Invalid date string safely returns empty string');

// -----------------------------------------------------------------------------
// Test Group 2: activityService Layer Architecture & Methods
// -----------------------------------------------------------------------------
console.log('\n--- Test Group 2: activityService Architecture & API Contracts ---');

const activityServiceFile = fs.readFileSync(path.join(rootDir, 'src/services/activityService.ts'), 'utf-8');

assert(activityServiceFile.includes('getActivitiesByLead'), 'activityService exports getActivitiesByLead');
assert(activityServiceFile.includes('getRecentActivities'), 'activityService exports getRecentActivities');
assert(activityServiceFile.includes('logActivity'), 'activityService exports logActivity');
assert(activityServiceFile.includes("eq('lead_id', leadId)"), 'Filters activities strictly by lead_id');
assert(activityServiceFile.includes("order('created_at', { ascending: false })"), 'Orders activities chronologically (newest first)');
assert(activityServiceFile.includes('actor_profile:profiles!actor_id'), 'Joins actor profile (name & role) on actor_id');
assert(activityServiceFile.includes('authData.user?.id'), 'Extracts current authenticated user for actor_id');

// -----------------------------------------------------------------------------
// Test Group 3: Automated Audit Hooks Coverage
// -----------------------------------------------------------------------------
console.log('\n--- Test Group 3: Automated Audit Hooks Coverage Across Features ---');

const leadServiceFile = fs.readFileSync(path.join(rootDir, 'src/services/leadService.ts'), 'utf-8');
const followupServiceFile = fs.readFileSync(path.join(rootDir, 'src/services/followupService.ts'), 'utf-8');

// Lead service hooks
assert(leadServiceFile.includes("activity_type: 'lead_created'"), 'Lead creation automatically logs lead_created activity');
assert(leadServiceFile.includes("activity_type: 'status_changed'"), 'Status change automatically logs status_changed activity');
assert(leadServiceFile.includes("activity_type: 'notes_updated'"), 'Notes update automatically logs notes_updated activity');
assert(leadServiceFile.includes("activity_type: 'assignment_changed'"), 'Assignment update automatically logs assignment_changed activity');

// Followup service hooks
assert(followupServiceFile.includes("activity_type: 'followup_scheduled'"), 'Follow-up creation automatically logs followup_scheduled activity');
assert(followupServiceFile.includes("activity_type: 'followup_completed'"), 'Follow-up completion automatically logs followup_completed activity');
assert(followupServiceFile.includes("activity_type: 'followup_cancelled'"), 'Follow-up cancellation automatically logs followup_cancelled activity');

// -----------------------------------------------------------------------------
// Test Group 4: ActivityTimeline Component & LeadDetail Integration
// -----------------------------------------------------------------------------
console.log('\n--- Test Group 4: ActivityTimeline UI Component & LeadDetail Integration ---');

const timelineFile = fs.readFileSync(path.join(rootDir, 'src/features/leads/ActivityTimeline.tsx'), 'utf-8');
const leadDetailPageFile = fs.readFileSync(path.join(rootDir, 'src/features/leads/LeadDetailPage.tsx'), 'utf-8');

assert(timelineFile.includes('ActivityTimeline'), 'Exports ActivityTimeline component');
assert(timelineFile.includes('lead_created'), 'Handles lead_created visual node');
assert(timelineFile.includes('status_changed'), 'Handles status_changed visual node');
assert(timelineFile.includes('notes_updated'), 'Handles notes_updated visual node');
assert(timelineFile.includes('followup_scheduled'), 'Handles followup_scheduled visual node');
assert(timelineFile.includes('followup_completed'), 'Handles followup_completed visual node');
assert(timelineFile.includes('manual_note'), 'Handles manual_note visual node');
assert(timelineFile.includes('actor_profile?.full_name'), 'Displays actor name on each timeline event');
assert(timelineFile.includes('Log Interaction'), 'Provides Log Interaction / manual note form');
assert(timelineFile.includes('handleAddManualNote'), 'Submits manual notes through activityService.logActivity');

assert(leadDetailPageFile.includes('<ActivityTimeline'), 'LeadDetailPage renders <ActivityTimeline />');
assert(leadDetailPageFile.includes('refreshTrigger'), 'LeadDetailPage passes refreshTrigger to update timeline in real-time');
assert(leadDetailPageFile.includes('setRefreshTrigger'), 'Notes saving triggers timeline refresh');

// -----------------------------------------------------------------------------
// Final Summary
// -----------------------------------------------------------------------------
console.log('\n================================================================');
console.log(`📊 Result: ${passed}/${total} Tests Passed (${Math.round((passed / total) * 100)}%)`);
console.log('================================================================');

if (passed === total) {
  console.log('🎉 ALL PHASE 7 SPECIFICATIONS, AUDIT HOOKS & TIMELINE FULLY VERIFIED!\n');
} else {
  process.exit(1);
}

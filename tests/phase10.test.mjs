// ==============================================================================
// BrightPath CRM — Phase 10 Automated Test Suite
// Accessibility, Global Error Handling & Mobile Polish
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
console.log('🧪 BrightPath CRM — Phase 10: Accessibility & Error Handling');
console.log('================================================================\n');

// -----------------------------------------------------------------------------
// Test Group 1: ErrorBoundary Component Architecture & Recovery Controls
// -----------------------------------------------------------------------------
console.log('--- Test Group 1: Global ErrorBoundary Architecture & Recovery ---');

const errorBoundaryPath = path.join(rootDir, 'src/components/common/ErrorBoundary.tsx');
assert(fs.existsSync(errorBoundaryPath), 'ErrorBoundary component file exists in src/components/common/');

const errorBoundaryContent = fs.readFileSync(errorBoundaryPath, 'utf-8');
assert(errorBoundaryContent.includes('class ErrorBoundary extends Component'), 'ErrorBoundary is implemented as a React Component');
assert(errorBoundaryContent.includes('getDerivedStateFromError'), 'Implements getDerivedStateFromError static lifecycle');
assert(errorBoundaryContent.includes('componentDidCatch'), 'Implements componentDidCatch for diagnostic logging');
assert(errorBoundaryContent.includes('role="alert"'), 'Render root specifies role="alert" for assistive technology');
assert(errorBoundaryContent.includes('aria-live="assertive"'), 'Specifies aria-live="assertive" for immediate screen reader priority');
assert(errorBoundaryContent.includes('Try Again'), 'Provides "Try Again" state reset recovery action');
assert(errorBoundaryContent.includes('Reload Page'), 'Provides "Reload Page" recovery action');
assert(errorBoundaryContent.includes('Dashboard'), 'Provides direct navigation back to Dashboard');
assert(errorBoundaryContent.includes('aria-controls="error-details-panel"'), 'Details disclosure uses aria-controls');
assert(errorBoundaryContent.includes('aria-expanded='), 'Details disclosure uses aria-expanded state');

// -----------------------------------------------------------------------------
// Test Group 2: App.tsx Top-Level Error Boundary Integration
// -----------------------------------------------------------------------------
console.log('\n--- Test Group 2: App.tsx Top-Level Integration & Routing ---');

const appPath = path.join(rootDir, 'src/App.tsx');
const appContent = fs.readFileSync(appPath, 'utf-8');

assert(appContent.includes('import { ErrorBoundary }'), 'App.tsx imports ErrorBoundary');
assert(appContent.includes('<ErrorBoundary>'), 'App.tsx wraps router tree inside <ErrorBoundary>');
assert(appContent.includes('</ErrorBoundary>'), 'App.tsx properly closes </ErrorBoundary>');
assert(appContent.includes('<Route path="/404" element={<NotFoundPage />} />'), 'App.tsx registers /404 route with NotFoundPage');
assert(appContent.includes('<Route path="*" element={<Navigate to="/404" replace />} />'), 'App.tsx redirects unmapped paths to /404');

// -----------------------------------------------------------------------------
// Test Group 3: NotFoundPage Semantic Structure & Accessibility
// -----------------------------------------------------------------------------
console.log('\n--- Test Group 3: NotFoundPage Semantic Structure & Accessibility ---');

const notFoundPath = path.join(rootDir, 'src/pages/NotFoundPage.tsx');
assert(fs.existsSync(notFoundPath), 'NotFoundPage exists in src/pages/');

const notFoundContent = fs.readFileSync(notFoundPath, 'utf-8');
assert(notFoundContent.includes('role="main"'), 'NotFoundPage root has role="main" semantic landmark');
assert(notFoundContent.includes('<h1'), 'NotFoundPage provides top-level <h1> heading');
assert(notFoundContent.includes('Page Not Found'), 'Heading contains "Page Not Found" text');
assert(notFoundContent.includes('Dashboard'), 'Provides button to return to Dashboard');
assert(notFoundContent.includes('View Leads'), 'Provides secondary button to navigate to Leads');
assert(notFoundContent.includes("minHeight: '44px'"), 'Action buttons enforce minimum 44px touch height');

// -----------------------------------------------------------------------------
// Test Group 4: Network Connectivity & Offline Alert Banner
// -----------------------------------------------------------------------------
console.log('\n--- Test Group 4: Network Connectivity & Offline Banner ---');

const networkBannerPath = path.join(rootDir, 'src/components/common/NetworkStatusBanner.tsx');
assert(fs.existsSync(networkBannerPath), 'NetworkStatusBanner exists in src/components/common/');

const networkBannerContent = fs.readFileSync(networkBannerPath, 'utf-8');
assert(networkBannerContent.includes("addEventListener('offline'"), 'Subscribes to browser offline event');
assert(networkBannerContent.includes("addEventListener('online'"), 'Subscribes to browser online event');
assert(networkBannerContent.includes('role="alert"'), 'Offline banner declares role="alert"');
assert(networkBannerContent.includes('aria-live="assertive"'), 'Offline alert declares assertive aria-live');
assert(networkBannerContent.includes('role="status"'), 'Reconnection banner declares role="status"');
assert(networkBannerContent.includes('aria-live="polite"'), 'Reconnection banner declares polite aria-live');

const appLayoutPath = path.join(rootDir, 'src/components/layout/AppLayout.tsx');
const appLayoutContent = fs.readFileSync(appLayoutPath, 'utf-8');
assert(appLayoutContent.includes('<NetworkStatusBanner />'), 'AppLayout renders <NetworkStatusBanner /> globally');

// -----------------------------------------------------------------------------
// Test Group 5: Touch Targets (>= 44px) & ARIA Labels Audit
// -----------------------------------------------------------------------------
console.log('\n--- Test Group 5: Mobile Touch Targets (>= 44px) & ARIA Labels ---');

const headerContent = fs.readFileSync(path.join(rootDir, 'src/components/layout/Header.tsx'), 'utf-8');
assert(headerContent.includes('aria-label="Toggle navigation menu"'), 'Header mobile menu button has descriptive aria-label');
assert(headerContent.includes("minHeight: '44px'"), 'Header mobile menu toggle meets 44px min height');
assert(headerContent.includes("minWidth: '44px'"), 'Header mobile menu toggle meets 44px min width');

const mobileNavContent = fs.readFileSync(path.join(rootDir, 'src/components/layout/MobileNav.tsx'), 'utf-8');
assert(mobileNavContent.includes('aria-label="Close navigation"'), 'MobileNav close button has descriptive aria-label');
assert(mobileNavContent.includes('aria-label="Sign out of account"'), 'MobileNav sign-out button has descriptive aria-label');
assert(mobileNavContent.includes("minHeight: '44px'"), 'MobileNav links/buttons meet min 44px touch height');

const modalContent = fs.readFileSync(path.join(rootDir, 'src/components/ui/Modal.tsx'), 'utf-8');
assert(modalContent.includes('role="dialog"'), 'Modal declares role="dialog"');
assert(modalContent.includes('aria-modal="true"'), 'Modal declares aria-modal="true"');
assert(modalContent.includes('aria-labelledby="modal-title"'), 'Modal headers link to aria-labelledby');
assert(modalContent.includes('aria-label="Close dialog"'), 'Modal close button has descriptive aria-label');
assert(modalContent.includes("minHeight: '44px'"), 'Modal close button meets min 44px touch height');
assert(modalContent.includes("minWidth: '44px'"), 'Modal close button meets min 44px touch width');

const buttonContent = fs.readFileSync(path.join(rootDir, 'src/components/ui/Button.tsx'), 'utf-8');
assert(buttonContent.includes("minHeight: '44px'"), 'Button component md size guarantees 44px min touch height');

const inputContent = fs.readFileSync(path.join(rootDir, 'src/components/ui/Input.tsx'), 'utf-8');
assert(inputContent.includes('aria-invalid='), 'Input component sets aria-invalid attribute dynamically');
assert(inputContent.includes("minHeight: '44px'"), 'Input component guarantees 44px touch height');

const selectContent = fs.readFileSync(path.join(rootDir, 'src/components/ui/Select.tsx'), 'utf-8');
assert(selectContent.includes('aria-invalid='), 'Select component sets aria-invalid attribute dynamically');
assert(selectContent.includes("minHeight: '44px'"), 'Select component guarantees 44px touch height');

// -----------------------------------------------------------------------------
// Test Group 6: Design System Accessibility & CSS Focus Rings
// -----------------------------------------------------------------------------
console.log('\n--- Test Group 6: Design System Accessibility & CSS Rules ---');

const indexCssContent = fs.readFileSync(path.join(rootDir, 'src/index.css'), 'utf-8');
assert(indexCssContent.includes(':focus-visible'), 'CSS configures :focus-visible rules for visible focus indicator');
assert(indexCssContent.includes('outline: 2px solid'), 'Visible focus ring uses distinct 2px outline');
assert(indexCssContent.includes('outline-offset: 2px'), 'Visible focus ring offsets for clarity');
assert(indexCssContent.includes('.sr-only'), 'CSS provides .sr-only accessible screen reader class');
assert(indexCssContent.includes('@media (max-width: 768px)'), 'CSS includes mobile touch targets media query');
assert(indexCssContent.includes('min-height: 44px'), 'CSS enforces min-height: 44px on interactive controls on mobile');

// -----------------------------------------------------------------------------
// Final Summary
// -----------------------------------------------------------------------------
console.log('\n================================================================');
console.log(`📊 Result: ${passed}/${total} Tests Passed (${Math.round((passed / total) * 100)}%)`);
console.log('================================================================');

if (passed === total) {
  console.log('🎉 ALL PHASE 10 ACCESSIBILITY & ERROR HANDLING SPECIFICATIONS VERIFIED!\n');
} else {
  process.exit(1);
}

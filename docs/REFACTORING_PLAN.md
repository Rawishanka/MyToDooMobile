# Codebase Refactoring Plan

## ✅ Completed Phases

### Phase 1: Cleanup (DONE)
- ✅ Removed test/debug files (8+ files)
- ✅ Removed duplicate screens (7 screens)
- ✅ Organized documentation (moved 30+ .md files to /docs)
- ✅ Removed temp files and logs

### Phase 2: Folder Structure (DONE)
- ✅ Created `src/` with feature-based organization
- ✅ Moved `api/` → `src/api/`
- ✅ Moved `store/` → `src/store/`
- ✅ Moved `hooks/` → `src/shared/hooks/`
- ✅ Moved `utils/` → `src/shared/utils/`
- ✅ Moved `constants/` → `src/config/`
- ✅ Moved `context/` → `src/shared/`
- ✅ Moved `components/` → `src/shared/components/`
- ✅ Updated `tsconfig.json` with path aliases

## 🔄 Current Phase

### Phase 3: Screen Organization (IN PROGRESS)
Need to move screens from `app/` and `app/(tabs)/` to feature folders:

#### Auth Feature (`src/features/auth/screens/`)
- [ ] `login-screen.tsx`
- [ ] `signup-screen.tsx` (1767 lines - needs refactoring)

#### Tasks Feature (`src/features/tasks/screens/`)
**Browse & Discovery:**
- [ ] `browse-screen.tsx` (1543 lines - needs refactoring)
- [ ] `explore.tsx` (1186 lines - needs refactoring)

**Task Details:**
- [ ] `task-detail.tsx` (685 lines - needs refactoring)

**Create Task Flow:**
- [ ] `title-screen.tsx`
- [ ] `image-upload-screen.tsx` (439 lines - needs refactoring)
- [ ] `time-select-screen.tsx` (536 lines - needs refactoring)
- [ ] `detail-screen.tsx`

**Offers:**
- [ ] `make-offer-screen.tsx` (412 lines - needs refactoring)
- [ ] `accept-offer-screen.tsx` (533 lines - needs refactoring)
- [ ] `task-offers.tsx` (551 lines - needs refactoring)

**Questions:**
- [ ] `ask-question-screen.tsx`
- [ ] `answer-question-screen.tsx` (436 lines - needs refactoring)
- [ ] `task-questions.tsx` (573 lines - needs refactoring)

**Task Management:**
- [ ] `accept-task-screen.tsx` (537 lines - needs refactoring)
- [ ] `task-completion-status.tsx` (834 lines - needs refactoring)
- [ ] `user-tasks.tsx` (812 lines - needs refactoring)
- [ ] `mytasks-screen.tsx` (711 lines - needs refactoring)

#### Profile Feature (`src/features/profile/screens/`)
- [ ] `profile-screen.tsx` (526 lines - needs refactoring)
- [ ] `accountinformation.jsx` (667 lines - needs refactoring)
- [ ] `notificationpreferences.jsx` (512 lines - needs refactoring)

#### Messages Feature (`src/features/messages/screens/`)
- [ ] `message-screen.tsx` (683 lines - needs refactoring)
- [ ] `notification-screen.tsx` (943 lines - needs refactoring)

#### Dashboard Feature (`src/features/dashboard/screens/`)
- [ ] `welcome-screen.tsx` (452 lines - needs refactoring)
- [ ] `dashboard.jsx`
- [ ] `goal-screen.tsx`
- [ ] `screen-first.tsx` (onboarding)
- [ ] `screen-second.tsx` (onboarding)

#### Payments Feature (`src/features/payments/screens/`)
- [ ] `payment-status.tsx` (485 lines - needs refactoring)
- [ ] `paymentscreens.jsx` (533 lines - needs refactoring)
- [ ] `complete-payment-screen.tsx` (509 lines - needs refactoring)
- [ ] `isuranceprotection.jsx`
- [ ] `taskalerts.jsx`

## 📋 Remaining Phases

### Phase 4: File Refactoring
Break down files exceeding 400 lines (25 files total):

**Critical Priority (>1000 lines):**
1. `signup-screen.tsx` (1767 lines)
2. `browse-screen.tsx` (1543 lines)
3. `explore.tsx` (1186 lines)

**High Priority (800-999 lines):**
4. `notification-screen.tsx` (943 lines)
5. `task-completion-status.tsx` (834 lines)
6. `user-tasks.tsx` (812 lines)

**Medium Priority (600-799 lines):**
7. `mytasks-screen.tsx` (711 lines)
8. `task-detail.tsx` (685 lines)
9. `message-screen.tsx` (683 lines)
10. `accountinformation.jsx` (667 lines)

**Standard Priority (400-599 lines):**
11-25. Remaining files (400-573 lines each)

### Phase 5: Import Updates
- [ ] Update all imports to use new path aliases
- [ ] Fix broken references
- [ ] Test navigation flows

### Phase 6: Cleanup & Testing
- [ ] Remove empty folders
- [ ] Verify all screens load correctly
- [ ] Test authentication flow
- [ ] Test task creation flow
- [ ] Test all navigation routes

### Phase 7: Documentation
- [ ] Create architecture diagram
- [ ] Update README.md
- [ ] Document new folder structure
- [ ] Create component library documentation

## 📊 Progress Summary

- **Files Removed:** 15+
- **Folders Organized:** 8
- **Files Moved:** 50+
- **Files to Refactor:** 25
- **Total Line Reduction Target:** ~8000 lines → proper modular structure

## 🎯 Success Criteria

1. ✅ No file exceeds 400 lines
2. ✅ All features organized in `src/features/`
3. ✅ All shared code in `src/shared/`
4. ✅ All imports use path aliases
5. ✅ Zero broken imports
6. ✅ All existing functionality preserved
7. ✅ All designs unchanged

# Bug Fixes - Action Plan

## Summary of Issues

Based on your report, here are the critical bugs that need fixing:

### ✅ Already Working (Verified)
1. Register/Login pages have proper links and buttons
2. Manager dashboard route exists
3. Loyalty points redemption UI exists

### ❌ Needs Immediate Fix

#### HIGH PRIORITY

**1. Loyalty Points Calculation Bug**
- **Issue:** Points < 100 still give $1 discount (should be 100 points = $1)
- **Location:** `hotel-detail.component.ts` - `discount` computed property
- **Fix:** Change from `pointsToRedeem / 100` to proper calculation

**2. Manager Can't Delete Hotels**
- **Issue:** Delete returns 403 Forbidden
- **Location:** `HotelsController.DeleteHotel` - requires Admin role
- **Fix:** Allow HotelManager to delete their own hotels

**3. Newly Created Hotels Not Visible**
- **Issue:** After creating hotel, it doesn't appear in manager dashboard
- **Location:** Manager dashboard doesn't refresh after creation
- **Fix:** Reload hotels after successful creation

**4. No Cancel Booking Button**
- **Issue:** Users can't cancel their bookings
- **Location:** Bookings page missing cancel functionality
- **Fix:** Add cancel button and implement cancellation

**5. Loyalty Points Not Awarded**
- **Issue:** Points not added after payment
- **Location:** Need to verify payment flow
- **Fix:** Ensure `AwardPointsAsync` is being called

#### MEDIUM PRIORITY

**6. Admin Dashboard Missing**
- **Issue:** No admin-specific dashboard
- **Location:** Need to create admin dashboard component
- **Fix:** Create admin dashboard with hotel management

**7. Confusing Points Message**
- **Issue:** "Max 0 points" shown when user has no points
- **Location:** Booking modal
- **Fix:** Hide loyalty section if user has 0 points

**8. Currency Symbol Issues**
- **Issue:** $ symbol appearing incorrectly
- **Location:** Multiple components
- **Fix:** Use Angular currency pipe consistently

#### LOW PRIORITY

**9. Room Checkout Logic**
- **Issue:** Rooms not released after checkout date
- **Location:** Backend - needs scheduled job
- **Fix:** Implement background job to release rooms

**10. Login Link in Reviews**
- **Issue:** Login link might not work properly
- **Location:** Hotel detail reviews section
- **Fix:** Verify routing and add return URL

## Recommended Fix Order

### Phase 1: Critical Fixes (Do First)
1. Fix loyalty points calculation (< 100 points bug)
2. Allow managers to delete their hotels
3. Add cancel booking functionality
4. Fix newly created hotels not appearing

### Phase 2: Important Fixes
5. Verify and fix loyalty points awarding
6. Hide loyalty section when 0 points
7. Fix currency formatting

### Phase 3: Feature Additions
8. Create admin dashboard
9. Implement room checkout logic

## Would you like me to:

A. **Fix all critical bugs now** (Phase 1 - 4 fixes)
B. **Fix one specific bug** (tell me which number)
C. **Create a complete admin dashboard** (new feature)
D. **Fix everything in order** (will take multiple steps)

Please let me know which approach you prefer, and I'll start implementing the fixes!

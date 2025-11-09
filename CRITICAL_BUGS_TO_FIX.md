# Critical Bugs to Fix

## Priority 1: Authentication & Navigation Issues

### 1. ❌ Can't register - login button is blank
**Status:** NEEDS FIX
**Location:** Register page
**Issue:** Login button not showing text

### 2. ❌ Login link not working in reviews section
**Status:** NEEDS FIX
**Location:** Hotel detail page - reviews section
**Issue:** Login link doesn't redirect properly

## Priority 2: Manager Dashboard Issues

### 3. ❌ $ symbol in manager dashboard, hotel details, bookings
**Status:** NEEDS FIX
**Location:** Multiple pages
**Issue:** Currency formatting issue

### 4. ❌ Deletion forbidden for manager
**Status:** NEEDS FIX
**Location:** Manager dashboard
**Issue:** Managers can't delete their own hotels (should be allowed)

### 5. ❌ If manager creates a hotel, it's not visible in manager dashboard
**Status:** NEEDS FIX
**Location:** Manager dashboard
**Issue:** Newly created hotels don't appear immediately

## Priority 3: Booking Issues

### 6. ❌ No option to cancel booking
**Status:** NEEDS FIX
**Location:** Bookings page
**Issue:** Missing cancel button for confirmed bookings

### 7. ❌ "Max 0 points (50% of total)" shown on booking window
**Status:** NEEDS FIX
**Location:** Hotel detail booking modal
**Issue:** Confusing message when user has 0 points

### 8. ❌ Points redemption: anything less than 100 redeemed as $1
**Status:** NEEDS FIX
**Location:** Booking creation
**Issue:** Should be 100 points = $1, but 50 points also gives $1 discount

### 9. ❌ Loyalty points aren't awarded for new bookings
**Status:** NEEDS INVESTIGATION
**Location:** Payment completion
**Issue:** Points not being added after payment

## Priority 4: Admin Dashboard Issues

### 10. ❌ Nothing in admin dashboard
**Status:** NEEDS FIX
**Location:** Admin dashboard (doesn't exist)
**Issue:** Admin dashboard not implemented

### 11. ❌ Admin can't add, update or delete hotels
**Status:** NEEDS FIX
**Location:** Admin functionality
**Issue:** Admin should have full hotel management

### 12. ❌ Routing in admin dashboard is manager-dashboard
**Status:** NEEDS FIX
**Location:** Navbar/routing
**Issue:** Admin link goes to wrong route

## Priority 5: Business Logic Issues

### 13. ❌ Hotel rooms not decremented after checkout date
**Status:** NEEDS FIX
**Location:** Backend booking logic
**Issue:** Rooms should be released after checkout, not just on cancellation

---

## Fix Order

1. Authentication & UI issues (1-2)
2. Manager dashboard functionality (3-5)
3. Booking functionality (6-9)
4. Admin dashboard (10-12)
5. Business logic (13)

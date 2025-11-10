# Review Edit & Delete Feature

## Overview
Users can now edit and delete their own reviews. Admins can delete any review for moderation purposes.

---

## Features Implemented

### 1. Edit Own Review
**Who**: Users who wrote the review  
**What**: Can edit rating and comment  
**How**: Click edit button → Form populates → Update → Save

### 2. Delete Own Review
**Who**: Users who wrote the review  
**What**: Can delete their review  
**How**: Click delete button → Confirm → Review removed

### 3. Admin Delete Any Review
**Who**: Admin users  
**What**: Can delete any review for moderation  
**How**: Click delete button on any review → Confirm → Review removed

---

## Backend Implementation

### ReviewsController.cs

#### Update Review Endpoint
```csharp
[HttpPut("{id}")]
[Authorize]
public async Task<ActionResult<ReviewResponse>> UpdateReview(int id, UpdateReviewRequest request)
```

**Features**:
- Validates user owns the review
- Updates rating and comment
- Recalculates hotel rating
- Clears relevant caches
- Returns updated review

#### Delete Review Endpoint
```csharp
[HttpDelete("{id}")]
[Authorize]
public async Task<IActionResult> DeleteReview(int id)
```

**Features**:
- Checks if user is admin
- Validates ownership (if not admin)
- Deletes review
- Recalculates hotel rating
- Clears relevant caches
- Logs deletion with admin flag

### ReviewService.cs

#### Delete Method
```csharp
public async Task<bool> DeleteReviewAsync(int id, int userId, bool isAdmin = false)
{
    var review = await _context.Reviews.FindAsync(id);
    if (review == null) return false;

    // Check ownership (admins can delete any review)
    if (!isAdmin && review.UserId != userId)
    {
        throw new UnauthorizedAccessException("You can only delete your own reviews");
    }

    // Delete and update hotel rating
    _context.Reviews.Remove(review);
    await _context.SaveChangesAsync();
    await UpdateHotelRatingAsync(hotelId);
    
    return true;
}
```

**Authorization Logic**:
- If `isAdmin = true`: Can delete any review
- If `isAdmin = false`: Can only delete own reviews
- Throws `UnauthorizedAccessException` if unauthorized

---

## Frontend Implementation

### ReviewService (Angular)

#### New Methods
```typescript
async update(id: number, review: any): Promise<Review | null> {
  return await this.http.put<Review>(`${this.apiUrl}/${id}`, review).toPromise() || null;
}

async delete(id: number): Promise<void> {
  await this.http.delete(`${this.apiUrl}/${id}`).toPromise();
}
```

### HotelDetailComponent

#### State Management
```typescript
editingReviewId = signal<number | null>(null);
showDeleteModal = signal(false);
reviewToDelete = signal<number | null>(null);
```

#### Edit Review Flow
```typescript
editReview(review: any) {
  this.editingReviewId.set(review.id);
  this.rating = review.rating;
  this.comment = review.comment;
  // Scroll to form
  document.querySelector('.review-form')?.scrollIntoView({ behavior: 'smooth' });
}

cancelEdit() {
  this.editingReviewId.set(null);
  this.rating = 5;
  this.comment = '';
}
```

#### Submit Review (Create or Update)
```typescript
async submitReview() {
  if (this.editingReviewId()) {
    // Update existing review
    const updated = await this.reviewService.update(this.editingReviewId()!, reviewData);
    // Update in list
  } else {
    // Create new review
    const review = await this.reviewService.submit(reviewData);
    // Add to list
  }
}
```

#### Delete Review Flow
```typescript
confirmDeleteReview(reviewId: number) {
  this.reviewToDelete.set(reviewId);
  this.showDeleteModal.set(true);
}

async deleteReview() {
  await this.reviewService.delete(reviewId);
  // Remove from list
  // Check if user can review again
}
```

#### Permission Checks
```typescript
canEditReview(review: any): boolean {
  const user = this.auth.currentUser();
  return user?.id === review.userId;
}

canDeleteReview(review: any): boolean {
  const user = this.auth.currentUser();
  return user?.id === review.userId || user?.role === 'Admin';
}
```

---

## UI/UX Features

### Review Card Actions
```html
<div class="review-actions">
  <div class="review-rating">
    <!-- Stars -->
  </div>
  <div class="review-buttons">
    @if (canEditReview(review)) {
      <button class="btn-icon btn-edit" (click)="editReview(review)">
        <i class="fas fa-edit"></i>
      </button>
    }
    @if (canDeleteReview(review)) {
      <button class="btn-icon btn-delete" (click)="confirmDeleteReview(review.id)">
        <i class="fas fa-trash"></i>
      </button>
    }
  </div>
</div>
```

### Editing Notice
```html
@if (editingReviewId()) {
  <div class="editing-notice">
    <i class="fas fa-info-circle"></i>
    <span>You are editing your review</span>
    <button class="btn-cancel-edit" (click)="cancelEdit()">
      <i class="fas fa-times"></i> Cancel
    </button>
  </div>
}
```

### Delete Confirmation Modal
```html
<div class="modal-overlay">
  <div class="modal-content delete-modal">
    <div class="warning-icon">
      <i class="fas fa-exclamation-triangle"></i>
    </div>
    <p>Are you sure you want to delete this review?</p>
    <p class="warning-text">This action cannot be undone.</p>
    <button class="btn-danger" (click)="deleteReview()">
      Delete Review
    </button>
  </div>
</div>
```

---

## User Flows

### Edit Review Flow
```
1. User sees their review with edit button
   ↓
2. Click edit button
   ↓
3. Form scrolls into view with populated data
   ↓
4. Yellow "editing" notice appears
   ↓
5. User modifies rating/comment
   ↓
6. Click "Update Review"
   ↓
7. Review updates in list
   ↓
8. Success message shown
   ↓
9. Form resets
```

### Delete Review Flow (User)
```
1. User sees their review with delete button
   ↓
2. Click delete button
   ↓
3. Confirmation modal appears
   ↓
4. Click "Delete Review"
   ↓
5. Review removed from list
   ↓
6. Hotel rating recalculated
   ↓
7. User can review again (if eligible)
   ↓
8. Success message shown
```

### Delete Review Flow (Admin)
```
1. Admin sees ANY review with delete button
   ↓
2. Click delete button
   ↓
3. Confirmation modal appears
   ↓
4. Click "Delete Review"
   ↓
5. Review removed from list
   ↓
6. Hotel rating recalculated
   ↓
7. Success message shown
```

---

## Permissions Matrix

| Action | Guest (Not Logged In) | User (Own Review) | User (Other's Review) | Admin |
|--------|----------------------|-------------------|----------------------|-------|
| View Reviews | ✅ | ✅ | ✅ | ✅ |
| Create Review | ❌ | ✅ (if eligible) | N/A | ✅ (if eligible) |
| Edit Review | ❌ | ✅ | ❌ | ❌ |
| Delete Review | ❌ | ✅ | ❌ | ✅ |

**Notes**:
- Users can only edit their own reviews
- Users can only delete their own reviews
- Admins can delete any review (moderation)
- Admins cannot edit other users' reviews (integrity)

---

## Validation & Security

### Backend Validation
```csharp
// Check ownership
if (!isAdmin && review.UserId != userId)
{
    throw new UnauthorizedAccessException("You can only delete your own reviews");
}
```

### Frontend Validation
```typescript
// Only show edit button for own reviews
canEditReview(review: any): boolean {
  return user?.id === review.userId;
}

// Show delete button for own reviews or admin
canDeleteReview(review: any): boolean {
  return user?.id === review.userId || user?.role === 'Admin';
}
```

### Authorization
- All endpoints require `[Authorize]`
- User ID extracted from JWT token
- Role checked from JWT claims
- Ownership validated before operations

---

## Cache Management

When review is updated or deleted:
```csharp
await _cache.RemoveAsync($"hotel_reviews_{hotelId}");
await _cache.RemoveAsync($"hotel_rating_{hotelId}");
await _cache.RemoveAsync($"hotel:{hotelId}");
await _cache.RemoveAsync("hotels:all");
await _cache.RemoveByPatternAsync("hotels:search:*");
```

**Why**: Ensures fresh data after review changes

---

## Hotel Rating Recalculation

After every review update/delete:
```csharp
await UpdateHotelRatingAsync(hotelId);
```

**Process**:
1. Get all reviews for hotel
2. Calculate average rating
3. Update hotel's rating field
4. Update review count
5. Save to database

---

## CSS Styling

### Edit Button
```css
.btn-icon.btn-edit {
  color: #3b82f6;  /* Blue */
}

.btn-icon.btn-edit:hover {
  background: #eff6ff;  /* Light blue background */
  color: #1e40af;  /* Darker blue */
}
```

### Delete Button
```css
.btn-icon.btn-delete {
  color: #dc2626;  /* Red */
}

.btn-icon.btn-delete:hover {
  background: #fee2e2;  /* Light red background */
  color: #991b1b;  /* Darker red */
}
```

### Editing Notice
```css
.editing-notice {
  background: #fef3c7;  /* Yellow background */
  border-left: 4px solid #f59e0b;  /* Orange accent */
  color: #92400e;  /* Brown text */
}
```

---

## Error Handling

### Backend Errors
- `404 Not Found`: Review doesn't exist
- `403 Forbidden`: User doesn't own review
- `401 Unauthorized`: Not logged in
- `500 Internal Server Error`: Server error

### Frontend Error Display
```typescript
catch (err: any) {
  this.error.set(err.error?.message || err.message || 'Failed to delete review');
}
```

**User sees**: Clear error message in red alert box

---

## Testing Scenarios

### Test 1: User Edits Own Review
1. Login as guest with review
2. Click edit button on own review
3. Modify rating and comment
4. Click "Update Review"
5. **Expected**: Review updates successfully
6. **Result**: ✅ Works

### Test 2: User Deletes Own Review
1. Login as guest with review
2. Click delete button on own review
3. Confirm deletion
4. **Expected**: Review deleted, can review again
5. **Result**: ✅ Works

### Test 3: Admin Deletes Any Review
1. Login as admin
2. Click delete button on any review
3. Confirm deletion
4. **Expected**: Review deleted successfully
5. **Result**: ✅ Works

### Test 4: User Cannot Edit Other's Review
1. Login as guest
2. View other user's review
3. **Expected**: No edit button shown
4. **Result**: ✅ Works

### Test 5: User Cannot Delete Other's Review
1. Login as guest (not admin)
2. View other user's review
3. **Expected**: No delete button shown
4. **Result**: ✅ Works

### Test 6: Cancel Edit
1. Start editing review
2. Click "Cancel" button
3. **Expected**: Form resets, editing mode exits
4. **Result**: ✅ Works

---

## Files Modified

### Backend
1. `finaldestination/Controllers/ReviewsController.cs`
   - Updated `DeleteReview` to check admin role
   - Added logging for deletions

2. `finaldestination/Services/ReviewService.cs`
   - Updated `DeleteReviewAsync` with `isAdmin` parameter
   - Added admin bypass for ownership check

3. `finaldestination/Interfaces/IReviewService.cs`
   - Updated interface signature

### Frontend
1. `finaldestination/ClientApp/src/app/services/review.service.ts`
   - Added `update()` method
   - Added `delete()` method

2. `finaldestination/ClientApp/src/app/pages/hotel-detail/hotel-detail.component.ts`
   - Added edit/delete state management
   - Added `editReview()` method
   - Added `cancelEdit()` method
   - Added `confirmDeleteReview()` method
   - Added `deleteReview()` method
   - Added `canEditReview()` permission check
   - Added `canDeleteReview()` permission check
   - Updated `submitReview()` to handle both create and update

3. `finaldestination/ClientApp/src/app/pages/hotel-detail/hotel-detail.component.html`
   - Added edit/delete buttons to review cards
   - Added editing notice
   - Updated form title based on mode
   - Added delete confirmation modal

4. `finaldestination/ClientApp/src/app/pages/hotel-detail/hotel-detail.component.css`
   - Added review action button styles
   - Added editing notice styles
   - Added delete modal styles

---

## Benefits

1. **User Control**: Users can fix mistakes in their reviews
2. **Content Moderation**: Admins can remove inappropriate reviews
3. **Better UX**: Clear visual feedback for editing mode
4. **Security**: Proper authorization checks
5. **Data Integrity**: Hotel ratings automatically recalculate
6. **Cache Management**: Fresh data after changes

---

## Future Enhancements

- [ ] Review edit history
- [ ] Admin review moderation dashboard
- [ ] Bulk review operations
- [ ] Review flagging by users
- [ ] Review response by hotel managers
- [ ] Review helpful votes
- [ ] Review sorting options
- [ ] Review filtering
- [ ] Email notifications for review actions

---

**Last Updated**: November 10, 2025  
**Status**: ✅ Fully Implemented and Tested

# Hotel Manager Dashboard Guide

## Overview
The Hotel Manager Dashboard allows hotel managers to manage their hotel listings, including adding new hotels, editing existing ones, and viewing booking statistics.

## Accessing the Dashboard

### Prerequisites
- You must be logged in with a HotelManager role account
- Navigate to the application and log in

### Navigation
Once logged in as a hotel manager, you'll see a "My Hotels" link in the navigation bar. Click it to access your dashboard.

**URL**: `/manager-dashboard`

## Dashboard Features

### 1. View Your Hotels

The dashboard displays all hotels you manage in a grid layout. Each hotel card shows:
- Hotel name
- Star rating
- Location (city)
- Address
- Price per night
- Number of available rooms
- Review count

### 2. Add a New Hotel

**Steps:**
1. Click the "Add New Hotel" button at the top of the dashboard
2. Fill in the hotel form:
   - **Hotel Name** (required, 2-100 characters)
   - **City** (required, 2-50 characters)
   - **Address** (required, 5-200 characters)
   - **Price Per Night** (required, $1-$10,000)
   - **Available Rooms** (required, 1-1,000 rooms)
   - **Rating** (required, 0-5 stars)
3. Click "Create Hotel"
4. The hotel will be added to your list

**Validation:**
- All fields are required
- Hotel name can only contain letters, spaces, hyphens, and periods
- Price must be a positive number
- Rooms must be between 1 and 1,000
- Rating must be between 0 and 5

### 3. Edit an Existing Hotel

**Steps:**
1. Find the hotel card you want to edit
2. Click the green "Edit" button
3. The form will open with current hotel information
4. Modify the fields you want to change
5. Click "Update Hotel"
6. Changes will be saved immediately

**Note:** You can only edit hotels that you manage.

### 4. Delete a Hotel

**Steps:**
1. Find the hotel card you want to delete
2. Click the red "Delete" button
3. Confirm the deletion in the popup dialog
4. The hotel will be removed from your list

**Warning:** 
- Deletion is permanent
- You cannot delete hotels with active bookings
- Cancel all bookings first before deleting a hotel

## Hotel Information Management

### Price Per Night
- Set competitive pricing for your hotel
- Price is displayed to customers during booking
- Can be updated anytime through the edit function

### Available Rooms
- Represents the total number of rooms in your hotel
- System automatically calculates availability based on bookings
- Update this number if you add or remove rooms

### Rating
- Initial rating when creating a hotel
- Will be automatically updated based on customer reviews
- Displayed prominently to potential customers

## Best Practices

### 1. Accurate Information
- Ensure all hotel details are accurate and up-to-date
- Use the full address for better customer experience
- Set realistic pricing based on your market

### 2. Room Management
- Keep the available rooms count accurate
- Update immediately if rooms are added or removed
- Monitor booking patterns to optimize room allocation

### 3. Regular Updates
- Review and update hotel information regularly
- Adjust pricing based on season or demand
- Keep track of customer reviews and ratings

### 4. Responsive Management
- Check the dashboard regularly for new bookings
- Respond to customer needs promptly
- Monitor room availability to prevent overbooking

## Understanding the Booking System

### How Availability Works
1. **Total Rooms**: The number you set in "Available Rooms"
2. **Booked Rooms**: Rooms with confirmed bookings for specific dates
3. **Available Rooms**: Total rooms minus booked rooms for a date range

### Automatic Booking Confirmation
- Bookings are automatically confirmed if rooms are available
- No manual approval needed from hotel managers
- System prevents overbooking automatically

### Room Allocation Logic
- System calculates: 2 guests per room (rounded up)
- Example: 3 guests = 2 rooms needed
- Checks for overlapping bookings in the date range

## Troubleshooting

### Cannot Delete Hotel
**Problem**: Error message when trying to delete
**Solution**: 
- Check if there are active bookings
- Cancel all bookings first
- Then try deleting again

### Form Validation Errors
**Problem**: Cannot submit form
**Solution**:
- Check all required fields are filled
- Ensure values are within valid ranges
- Look for red error messages under fields

### Hotel Not Appearing
**Problem**: Created hotel doesn't show up
**Solution**:
- Refresh the page
- Check if you're logged in as the correct user
- Verify the hotel was created successfully

### Cannot Edit Hotel
**Problem**: Edit button doesn't work
**Solution**:
- Ensure you're the manager of that hotel
- Check your internet connection
- Try refreshing the page

## API Endpoints Used

The dashboard uses these backend endpoints:

- `GET /api/hotels/my-hotels` - Get your hotels
- `POST /api/hotels` - Create new hotel
- `PUT /api/hotels/{id}` - Update hotel
- `DELETE /api/hotels/{id}` - Delete hotel

## Security

### Authorization
- Only hotel managers can access the dashboard
- You can only manage hotels assigned to you
- Admin users have full access to all hotels

### Data Protection
- All API calls are authenticated
- JWT tokens are used for security
- Sensitive operations require confirmation

## Mobile Responsiveness

The dashboard is fully responsive and works on:
- Desktop computers
- Tablets
- Mobile phones

**Mobile Features:**
- Stacked layout for better viewing
- Touch-friendly buttons
- Optimized forms for mobile input

## Tips for Success

1. **Complete Profile**: Fill in all hotel details completely
2. **Competitive Pricing**: Research market rates in your area
3. **Accurate Rooms**: Keep room count updated
4. **Monitor Reviews**: Check customer feedback regularly
5. **Quick Updates**: Make changes as soon as needed
6. **Professional Photos**: (Future feature) Prepare quality images

## Support

If you encounter issues:
1. Check this guide first
2. Verify your account has HotelManager role
3. Ensure you're logged in
4. Contact system administrator if problems persist

## Future Features (Coming Soon)

- Upload hotel photos
- View booking analytics
- Revenue reports
- Seasonal pricing
- Bulk operations
- Email notifications for new bookings
- Customer messaging system

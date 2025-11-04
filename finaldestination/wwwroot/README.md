# Final Destination - Angular Frontend

A modern, responsive hotel booking application built with AngularJS and connected to the ASP.NET Core backend.

## Features

- **User Authentication**: Login and registration with JWT tokens
- **Hotel Search**: Browse and search hotels by city, price, and rating
- **Hotel Details**: View detailed hotel information with reviews
- **Booking Management**: Create, view, and cancel bookings
- **Payment Processing**: Secure payment integration
- **Review System**: Submit and view hotel reviews
- **Loyalty Program**: Track points and transaction history
- **Responsive Design**: Modern UI that works on all devices

## Technology Stack

- **AngularJS 1.8.3**: Frontend framework
- **Angular Route**: Client-side routing
- **Font Awesome 6.4**: Icons
- **Custom CSS**: Modern, gradient-based design

## Project Structure

```
wwwroot/
├── app/
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   ├── bookings.controller.js
│   │   ├── hotels.controller.js
│   │   ├── main.controller.js
│   │   └── profile.controller.js
│   ├── services/
│   │   ├── auth.service.js
│   │   ├── booking.service.js
│   │   ├── hotel.service.js
│   │   ├── loyalty.service.js
│   │   └── review.service.js
│   ├── views/
│   │   ├── home.html
│   │   ├── login.html
│   │   ├── register.html
│   │   ├── hotels.html
│   │   ├── hotel-detail.html
│   │   ├── bookings.html
│   │   └── profile.html
│   └── app.js
├── css/
│   └── style.css
└── index.html
```

## Getting Started

### Prerequisites

- .NET 8.0 SDK
- SQL Server LocalDB (included with Visual Studio)

### Running the Application

1. **Start the Backend**:
   ```bash
   cd finaldestination
   dotnet run
   ```

2. **Access the Application**:
   - Frontend: https://localhost:5001
   - API: https://localhost:5001/api
   - Swagger: https://localhost:5001/swagger

### Default Test Accounts

The application comes with pre-seeded test accounts:

**Admin Account**:
- Email: admin@hotel.com
- Password: Admin123!

**Hotel Manager Account**:
- Email: manager@hotel.com
- Password: Manager123!

**Guest Account**:
- Email: guest@hotel.com
- Password: Guest123!

## API Configuration

The frontend connects to the backend API at `https://localhost:5001/api`. To change this:

1. Open `app/app.js`
2. Update the `API_URL` constant:
   ```javascript
   .constant('API_URL', 'https://your-api-url/api')
   ```

## Features Guide

### Authentication
- JWT-based authentication
- Token stored in localStorage
- Automatic token inclusion in API requests
- Protected routes for authenticated users

### Hotel Search
- Search by city, price range, and rating
- Real-time filtering
- Cached results for better performance

### Booking Flow
1. Browse hotels
2. View hotel details
3. Select dates and number of guests
4. Create booking
5. Process payment
6. View booking confirmation

### Loyalty Program
- Earn points on bookings
- View points balance
- Track transaction history
- Redeem points (future feature)

## Design Features

- **Modern Gradient UI**: Purple gradient hero sections
- **Card-based Layout**: Clean, organized content
- **Responsive Grid**: Adapts to all screen sizes
- **Smooth Animations**: Hover effects and transitions
- **Icon Integration**: Font Awesome icons throughout
- **Color Scheme**: Professional blue and purple palette

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Troubleshooting

### CORS Issues
If you encounter CORS errors, ensure the backend is running and CORS is enabled in `Program.cs`.

### API Connection Failed
- Verify the backend is running on https://localhost:5001
- Check the `API_URL` constant in `app/app.js`
- Ensure SSL certificate is trusted

### Authentication Issues
- Clear localStorage: `localStorage.clear()`
- Check token expiration (24 hours by default)
- Verify credentials with test accounts

## Future Enhancements

- [ ] Hotel image uploads
- [ ] Advanced search filters
- [ ] Booking history export
- [ ] Email notifications
- [ ] Social media login
- [ ] Multi-language support
- [ ] Dark mode theme

## License

This project is part of the Final Destination hotel booking system.

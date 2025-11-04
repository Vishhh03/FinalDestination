# Hotel Booking - Angular Frontend

Modern Angular 17 application with TypeScript for the Final Destination hotel booking system.

## Features

- ✅ **Angular 17** with standalone components
- ✅ **TypeScript** for type safety
- ✅ **Signals** for reactive state management
- ✅ **HTTP Interceptors** for JWT authentication
- ✅ **Route Guards** for protected routes
- ✅ **Lazy Loading** for optimal performance
- ✅ **Modern CSS** with gradients and animations

## Quick Start

### 1. Install Dependencies

```bash
cd finaldestination/ClientApp
npm install
```

### 2. Start Development Server

```bash
npm start
```

The app will run on `http://localhost:4200` and proxy API requests to `https://localhost:5001/api`

### 3. Build for Production

```bash
npm run build
```

Output will be in `dist/hotel-frontend`

## Project Structure

```
src/
├── app/
│   ├── components/
│   │   └── navbar/              # Shared navbar component
│   ├── guards/
│   │   └── auth.guard.ts        # Route protection
│   ├── interceptors/
│   │   └── auth.interceptor.ts  # JWT token injection
│   ├── models/
│   │   └── hotel.model.ts       # TypeScript interfaces
│   ├── pages/
│   │   ├── home/                # Landing page
│   │   ├── login/               # Login page
│   │   ├── register/            # Registration page
│   │   ├── hotels/              # Hotels list
│   │   ├── hotel-detail/        # Hotel details & booking
│   │   ├── bookings/            # My bookings
│   │   └── profile/             # User profile
│   ├── services/
│   │   ├── auth.service.ts      # Authentication
│   │   ├── hotel.service.ts     # Hotel API
│   │   ├── booking.service.ts   # Booking API
│   │   └── review.service.ts    # Review API
│   ├── app.component.ts         # Root component
│   └── app.routes.ts            # Route configuration
├── styles.css                   # Global styles
├── index.html                   # HTML entry point
└── main.ts                      # Bootstrap file
```

## Test Accounts

- **Admin**: admin@hotel.com / Admin123!
- **Manager**: manager@hotel.com / Manager123!
- **Guest**: guest@hotel.com / Guest123!

## API Configuration

The app uses a proxy configuration (`proxy.conf.json`) to forward `/api` requests to the backend at `https://localhost:5001`.

## Key Technologies

- **Angular 17**: Latest Angular with standalone components
- **TypeScript 5.2**: Strong typing and modern JavaScript features
- **RxJS 7.8**: Reactive programming
- **Angular Router**: Client-side routing
- **HttpClient**: HTTP communication with interceptors

## Development

### Add New Component

```bash
ng generate component components/my-component --standalone
```

### Add New Service

```bash
ng generate service services/my-service
```

## Build & Deploy

The Angular app can be integrated with the ASP.NET Core backend:

1. Build the Angular app: `npm run build`
2. Copy `dist/hotel-frontend` contents to `wwwroot`
3. Configure ASP.NET Core to serve the Angular app

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

Part of the Final Destination hotel booking system.

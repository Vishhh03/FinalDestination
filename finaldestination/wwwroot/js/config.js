// API Configuration
const API_CONFIG = {
  // Detect if running on different port (Live Server) and use full URL
  baseURL: (() => {
    const protocol = window.location.protocol;
    const port = window.location.port;
    
    // If opened directly from file system (file://)
    if (protocol === "file:") {
      console.warn("⚠️ Opening from file:// protocol. Use a web server instead!");
      console.info("✅ Recommended: Run 'dotnet run' and open https://localhost:5001");
      return "https://localhost:5001/api";
    }
    
    // If running on Live Server or different port, use full API URL
    if (port === "5500" || port === "5501" || port === "3000") {
      return "https://localhost:5001/api";
    }
    
    // If served from API itself, use relative URL
    return "/api";
  })(),
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
};

// Application Configuration
const APP_CONFIG = {
  appName: "FinalDestination",
  version: "1.0.0",
  tokenKey: "fd_auth_token",
  userKey: "fd_user_data",
};

// API Endpoints
const API_ENDPOINTS = {
  // Auth
  register: "/auth/register",
  login: "/auth/login",
  me: "/auth/me",
  applyHotelManager: "/auth/apply-hotel-manager",
  myApplication: "/auth/my-application",
  adminApplications: "/auth/admin/applications",
  processApplication: (id) => `/auth/admin/applications/${id}/process`,

  // Hotels
  hotels: "/hotels",
  hotel: (id) => `/hotels/${id}`,
  searchHotels: "/hotels/search",

  // Bookings
  bookings: "/bookings",
  booking: (id) => `/bookings/${id}`,
  myBookings: "/bookings/my",
  searchBookings: "/bookings/search",
  cancelBooking: (id) => `/bookings/${id}/cancel`,
  bookingPayment: (id) => `/bookings/${id}/payment`,

  // Reviews
  hotelReviews: (hotelId) => `/reviews/hotel/${hotelId}`,
  reviews: "/reviews",
  review: (id) => `/reviews/${id}`,

  // Loyalty
  loyaltyAccount: "/loyalty/account",
  loyaltyTransactions: "/loyalty/transactions",

  // Payments
  payment: (id) => `/payments/${id}`,
  refundPayment: (id) => `/payments/${id}/refund`,
};

export interface Hotel {
  id: number;
  name: string;
  address: string;
  city: string;
  pricePerNight: number;
  availableRooms: number;
  rating: number;
  managerId: number;
  createdAt: string;
}

export interface Booking {
  id: number;
  guestName: string;
  guestEmail: string;
  hotelId: number;
  hotelName: string;
  userId: number;
  checkInDate: string;
  checkOutDate: string;
  numberOfGuests: number;
  totalAmount: number;
  status: string;
  createdAt: string;
}

export interface Review {
  id: number;
  userId: number;
  userName: string;
  hotelId: number;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  contactNumber?: string;
  createdAt: string;
  isActive: boolean;
}

export interface AuthResponse {
  token: string;
  user: User;
  expiresAt: string;
}

export interface LoyaltyAccount {
  id: number;
  userId: number;
  pointsBalance: number;
  totalPointsEarned: number;
  lastUpdated: string;
}

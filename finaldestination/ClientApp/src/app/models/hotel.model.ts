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
  imageUrl?: string;
  images?: string[];
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
  loyaltyPointsRedeemed?: number;
  loyaltyDiscountAmount?: number;
  loyaltyPointsEarned?: number;
  status: BookingStatus;
  createdAt: string;
  paymentRequired?: boolean;
  paymentId?: number;
  minCheckoutDate?: string;
}

export enum BookingStatus {
  Confirmed = 1,
  Cancelled = 2,
  Completed = 3
}

export enum PaymentStatus {
  Pending = 1,
  Completed = 2,
  Failed = 3,
  Refunded = 4
}

export enum PaymentMethod {
  CreditCard = 1,
  DebitCard = 2,
  PayPal = 3,
  BankTransfer = 4
}

export interface PaymentRequest {
  bookingId: number;
  amount: number;
  currency: string;
  paymentMethod: PaymentMethod;
  cardNumber?: string;
  cardHolderName?: string;
  expiryMonth?: string;
  expiryYear?: string;
  cvv?: string;
}

export interface PaymentResult {
  paymentId: number;
  status: PaymentStatus;
  transactionId: string;
  amount: number;
  currency: string;
  errorMessage?: string;
  processedAt: string;
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
  role: string | number; // Can be string or number (backend should send string, but we handle both)
  contactNumber?: string;
  createdAt: string;
  isActive: boolean;
  loyaltyAccount?: LoyaltyInfo;
}

export interface LoyaltyInfo {
  pointsBalance: number;
  totalPointsEarned: number;
  lastUpdated: string;
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

export interface ApiError {
  message: string;
  details?: string;
  errors?: { [key: string]: string[] };
}

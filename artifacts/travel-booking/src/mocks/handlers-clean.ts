// Mock API handlers for local development without backend
import { http, HttpResponse } from 'msw';

// In-memory mock database with sessionStorage persistence
const STORAGE_KEY = 'msw_mock_bookings';

// Load bookings from sessionStorage on initialization
function loadBookings(): any[] {
  try {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    return [];
  }
}

// Save bookings to sessionStorage
function saveBookings(bookings: any[]) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(bookings));
  } catch (error) {
    // Silent fail
  }
}

// Initialize mock database from sessionStorage
let mockBookings: any[] = loadBookings();

export const handlers = [
  // Health check
  http.get('/api/healthz', () => {
    return HttpResponse.json({ status: 'ok', timestamp: new Date().toISOString() }, { status: 200 });
  }),

  // GET /api/bookings - Get all bookings
  http.get('/api/bookings', () => {
    return HttpResponse.json(mockBookings, { status: 200 });
  }),

  // GET /api/bookings/:id - Get specific booking
  http.get('/api/bookings/:id', ({ params }) => {
    const { id } = params;
    
    const booking = mockBookings.find((b) => 
      b.id === id || 
      b.id === parseInt(id as string) || 
      b.id?.toString() === id ||
      b.bookingId === id
    );
    
    if (!booking) {
      return HttpResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }
    
    return HttpResponse.json(booking, { status: 200 });
  }),

  // POST /api/bookings - Create new booking
  http.post('/api/bookings', async ({ request }) => {
    const body = await request.json() as any;
    
    const newBooking = {
      ...body,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    mockBookings.push(newBooking);
    saveBookings(mockBookings);
    
    return HttpResponse.json(newBooking, { status: 201 });
  }),

  // PUT /api/bookings/:id/cancel - Cancel booking
  http.put('/api/bookings/:id/cancel', async ({ params }) => {
    const { id } = params;
    
    const index = mockBookings.findIndex((b) => 
      b.id === id || b.id === parseInt(id as string) || b.id.toString() === id
    );
    
    if (index === -1) {
      return HttpResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }
    
    mockBookings[index] = {
      ...mockBookings[index],
      status: 'cancelled',
      paymentStatus: 'cancelled',
      updatedAt: new Date().toISOString(),
    };
    
    saveBookings(mockBookings);
    
    return HttpResponse.json(mockBookings[index], { status: 200 });
  }),

  // PUT /api/bookings/:id - Update booking
  http.put('/api/bookings/:id', async ({ params, request }) => {
    const { id } = params;
    const body = await request.json() as any;
    const index = mockBookings.findIndex((b) => b.id === parseInt(id as string));
    
    if (index === -1) {
      return HttpResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }
    
    mockBookings[index] = {
      ...mockBookings[index],
      ...body,
      updatedAt: new Date().toISOString(),
    };
    
    saveBookings(mockBookings);
    
    return HttpResponse.json(mockBookings[index], { status: 200 });
  }),

  // DELETE /api/bookings/:id - Delete booking
  http.delete('/api/bookings/:id', ({ params }) => {
    const { id } = params;
    const index = mockBookings.findIndex((b) => b.id === parseInt(id as string));
    
    if (index === -1) {
      return HttpResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }
    
    mockBookings.splice(index, 1);
    saveBookings(mockBookings);
    
    return HttpResponse.json({ success: true }, { status: 200 });
  }),

  // GET /api/flights - Get all flights
  http.get('/api/flights', () => {
    const mockFlights = [
      {
        id: 1,
        airline: 'Air India',
        flightNumber: 'AI-202',
        origin: 'Delhi',
        destination: 'Mumbai',
        departureTime: '06:00',
        arrivalTime: '08:15',
        duration: '2h 15m',
        price: 4500,
        class: 'Economy',
        seatsAvailable: 45,
      },
      {
        id: 2,
        airline: 'IndiGo',
        flightNumber: '6E-345',
        origin: 'Mumbai',
        destination: 'Bangalore',
        departureTime: '14:30',
        arrivalTime: '16:00',
        duration: '1h 30m',
        price: 3200,
        class: 'Economy',
        seatsAvailable: 28,
      },
    ];
    
    return HttpResponse.json(mockFlights, { status: 200 });
  }),

  // GET /api/buses - Get all buses
  http.get('/api/buses', () => {
    const mockBuses = [
      {
        id: 1,
        operator: 'VRL Travels',
        busType: 'AC Sleeper',
        origin: 'Delhi',
        destination: 'Jaipur',
        departureTime: '22:00',
        arrivalTime: '06:00',
        duration: '8h',
        price: 800,
        seatsAvailable: 12,
        amenities: ['WiFi', 'Blanket', 'Water Bottle', 'Charging Point'],
      },
    ];
    
    return HttpResponse.json(mockBuses, { status: 200 });
  }),

  // GET /api/hotels - Get all hotels
  http.get('/api/hotels', () => {
    const mockHotels = [
      {
        id: 1,
        name: 'Taj Palace',
        location: 'Mumbai',
        stars: 5,
        rating: 4.8,
        reviewCount: 1250,
        pricePerNight: 8500,
        imageUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945',
        amenities: ['Pool', 'Spa', 'Gym', 'Restaurant', 'WiFi', 'Parking'],
        roomTypes: ['Deluxe Room', 'Premium Suite', 'Presidential Suite'],
      },
    ];
    
    return HttpResponse.json(mockHotels, { status: 200 });
  }),

  // GET /api/packages - Get all packages
  http.get('/api/packages', () => {
    const mockPackages = [
      {
        id: 1,
        name: 'Goa Beach Paradise',
        destination: 'Goa',
        duration: '4 Days / 3 Nights',
        price: 12999,
        rating: 4.7,
        reviewCount: 856,
        imageUrl: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19',
        includes: ['Hotel', 'Breakfast', 'Airport Transfer', 'Sightseeing'],
      },
    ];
    
    return HttpResponse.json(mockPackages, { status: 200 });
  }),

  // POST /api/payments/create-order - Create Razorpay order
  http.post('/api/payments/create-order', async ({ request }) => {
    const body = await request.json() as any;
    
    const mockOrder = {
      id: `order_${Date.now()}${Math.random().toString(36).substr(2, 9)}`,
      entity: 'order',
      amount: body.amount * 100,
      amount_paid: 0,
      amount_due: body.amount * 100,
      currency: body.currency || 'INR',
      receipt: body.receipt || `receipt_${Date.now()}`,
      status: 'created',
      attempts: 0,
      notes: body.notes || {},
      created_at: Math.floor(Date.now() / 1000),
    };
    
    return HttpResponse.json({
      success: true,
      order: mockOrder,
      key: 'rzp_test_xxxxx',
    }, { status: 200 });
  }),

  // POST /api/payments/verify - Verify payment
  http.post('/api/payments/verify', async ({ request }) => {
    const body = await request.json() as any;
    
    return HttpResponse.json({
      success: true,
      message: 'Payment verified successfully',
      paymentId: body.razorpay_payment_id,
    }, { status: 200 });
  }),

  // GET /api/flights/:id - Get specific flight
  http.get('/api/flights/:id', ({ params }) => {
    const { id } = params;
    const flightId = parseInt(id as string);
    
    const mockFlight = {
      id: flightId,
      airline: 'Air India',
      flightNumber: 'AI-202',
      origin: 'Delhi',
      destination: 'Mumbai',
      departureTime: '06:00',
      arrivalTime: '08:15',
      duration: '2h 15m',
      price: 4500,
      class: 'Economy',
      seatsAvailable: 45,
    };
    
    return HttpResponse.json(mockFlight, { status: 200 });
  }),

  // GET /api/buses/:id - Get specific bus
  http.get('/api/buses/:id', ({ params }) => {
    const { id } = params;
    const busId = parseInt(id as string);
    
    const mockBus = {
      id: busId,
      operator: 'VRL Travels',
      busType: 'AC Sleeper',
      origin: 'Delhi',
      destination: 'Jaipur',
      departureTime: '22:00',
      arrivalTime: '06:00',
      duration: '8h',
      price: 800,
      seatsAvailable: 12,
      amenities: ['WiFi', 'Blanket', 'Water Bottle', 'Charging Point'],
    };
    
    return HttpResponse.json(mockBus, { status: 200 });
  }),

  // GET /api/hotels/:id - Get specific hotel
  http.get('/api/hotels/:id', ({ params }) => {
    const { id } = params;
    const hotelId = parseInt(id as string);
    
    const mockHotel = {
      id: hotelId,
      name: 'Taj Palace',
      location: 'Mumbai',
      stars: 5,
      rating: 4.8,
      reviewCount: 1250,
      pricePerNight: 8500,
      imageUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945',
      amenities: ['Pool', 'Spa', 'Gym', 'Restaurant', 'WiFi', 'Parking'],
      roomTypes: ['Deluxe Room', 'Premium Suite', 'Presidential Suite'],
    };
    
    return HttpResponse.json(mockHotel, { status: 200 });
  }),

  // GET /api/packages/:id - Get specific package
  http.get('/api/packages/:id', ({ params }) => {
    const { id } = params;
    const packageId = parseInt(id as string);
    
    const mockPackage = {
      id: packageId,
      name: 'Goa Beach Paradise',
      destination: 'Goa',
      duration: '4 Days / 3 Nights',
      price: 12999,
      rating: 4.7,
      reviewCount: 856,
      imageUrl: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19',
      includes: ['Hotel', 'Breakfast', 'Airport Transfer', 'Sightseeing'],
    };
    
    return HttpResponse.json(mockPackage, { status: 200 });
  }),

  // GET /api/flights/search - Search flights
  http.get('/api/flights/search', () => {
    return HttpResponse.json([
      {
        id: 1,
        airline: 'Air India',
        flightNumber: 'AI-202',
        origin: 'Delhi',
        destination: 'Mumbai',
        departureTime: '06:00',
        arrivalTime: '08:15',
        duration: '2h 15m',
        price: 4500,
        class: 'Economy',
        seatsAvailable: 45,
      },
    ], { status: 200 });
  }),

  // GET /api/buses/search - Search buses
  http.get('/api/buses/search', () => {
    return HttpResponse.json([
      {
        id: 1,
        operator: 'VRL Travels',
        busType: 'AC Sleeper',
        origin: 'Delhi',
        destination: 'Jaipur',
        departureTime: '22:00',
        arrivalTime: '06:00',
        duration: '8h',
        price: 800,
        seatsAvailable: 12,
        amenities: ['WiFi', 'Blanket', 'Water Bottle', 'Charging Point'],
      },
    ], { status: 200 });
  }),

  // GET /api/hotels/search - Search hotels
  http.get('/api/hotels/search', () => {
    return HttpResponse.json([
      {
        id: 1,
        name: 'Taj Palace',
        location: 'Mumbai',
        stars: 5,
        rating: 4.8,
        reviewCount: 1250,
        pricePerNight: 8500,
        imageUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945',
        amenities: ['Pool', 'Spa', 'Gym', 'Restaurant', 'WiFi', 'Parking'],
        roomTypes: ['Deluxe Room', 'Premium Suite', 'Presidential Suite'],
      },
    ], { status: 200 });
  }),
];

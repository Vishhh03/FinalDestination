// Main Application

const App = {
    // Initialize application
    init() {
        console.log('Initializing FinalDestination...');
        
        // Initialize modules
        Auth.init();
        this.setupRoutes();
        this.setupEventListeners();
        Router.init();
        
        console.log('FinalDestination initialized successfully!');
    },

    // Setup all routes
    setupRoutes() {
        Router.add('/', this.pages.home);
        Router.add('/hotels', this.pages.hotels);
        Router.add('/hotels/:id', this.pages.hotelDetail);
        Router.add('/login', this.pages.login);
        Router.add('/register', this.pages.register);
        Router.add('/logout', this.pages.logout);
        Router.add('/bookings', this.pages.bookings);
        Router.add('/bookings/:id', this.pages.bookingDetail);
        Router.add('/loyalty', this.pages.loyalty);
        Router.add('/admin', this.pages.admin);
        Router.add('/admin/bookings', this.pages.allBookings);
        Router.add('/manage-hotels', this.pages.manageHotels);
        Router.add('/apply-manager', this.pages.applyManager);
        Router.add('/my-application', this.pages.myApplication);
    },

    // Setup event listeners
    setupEventListeners() {
        const mobileToggle = Utils.$('#mobile-toggle');
        const navLinks = Utils.$('#nav-links');

        mobileToggle?.addEventListener('click', () => {
            navLinks.classList.toggle('active');
        });

        document.addEventListener('click', (e) => {
            if (!e.target.closest('.nav') && navLinks?.classList.contains('active')) {
                navLinks.classList.remove('active');
            }
        });
    },

    // Pages object containing all page handlers
    pages: {}
};

// Home Page
App.pages.home = async function() {
    const app = Utils.$('#app');
    app.innerHTML = `
        <section class="hero">
            <div class="container">
                <div class="hero-content">
                    <h1>Discover Your Perfect Stay</h1>
                    <p>Experience luxury and comfort at the world's finest hotels. Book your dream destination today.</p>
                    <div style="display: flex; gap: 1rem; flex-wrap: wrap;">
                        <button class="btn btn-primary" onclick="Router.navigate('/hotels')">
                            Explore Hotels →
                        </button>
                        ${!Auth.isLoggedIn() ? `
                            <button class="btn btn-secondary" onclick="Router.navigate('/register')">
                                Get Started
                            </button>
                        ` : ''}
                    </div>
                </div>
            </div>
        </section>

        <section class="section">
            <div class="container">
                <div class="section-title">
                    <h2>Featured Hotels</h2>
                    <p class="section-subtitle">Handpicked luxury accommodations for your next adventure</p>
                </div>
                <div id="featured-hotels" class="grid grid-3">
                    ${Components.loadingSkeleton(3)}
                </div>
            </div>
        </section>
    `;

    try {
        const hotels = await API.hotels.getAll();
        const featured = hotels.slice(0, 6);
        Utils.$('#featured-hotels').innerHTML = featured.map(h => Components.hotelCard(h)).join('');
    } catch (error) {
        Utils.$('#featured-hotels').innerHTML = Components.emptyState('Unable to load hotels', '😔');
    }
};

// Hotels Page
App.pages.hotels = async function() {
    const app = Utils.$('#app');
    app.innerHTML = `
        <section class="section">
            <div class="container">
                <div class="section-title">
                    <h2>All Hotels</h2>
                    <p class="section-subtitle">Find your perfect accommodation</p>
                </div>

                <div class="card mb-4">
                    <form id="search-form" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem;">
                        <div class="form-group">
                            <input type="text" id="search-city" class="form-input" placeholder="Search by city...">
                        </div>
                        <div class="form-group">
                            <input type="number" id="search-max-price" class="form-input" placeholder="Max price...">
                        </div>
                        <div class="form-group">
                            <button type="submit" class="btn btn-primary" style="width: 100%;">Search</button>
                        </div>
                    </form>
                </div>

                <div id="hotels-list" class="grid grid-3">
                    ${Components.loadingSkeleton(6)}
                </div>
            </div>
        </section>
    `;

    async function loadHotels(params = {}) {
        try {
            const hotels = params.city || params.maxPrice 
                ? await API.hotels.search(params)
                : await API.hotels.getAll();
            
            const list = Utils.$('#hotels-list');
            if (hotels.length === 0) {
                list.innerHTML = Components.emptyState('No hotels found', '🏨');
            } else {
                list.innerHTML = hotels.map(h => Components.hotelCard(h)).join('');
            }
        } catch (error) {
            Utils.$('#hotels-list').innerHTML = Components.emptyState('Unable to load hotels', '😔');
        }
    }

    Utils.$('#search-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const city = Utils.$('#search-city').value;
        const maxPrice = Utils.$('#search-max-price').value;
        loadHotels({ city, maxPrice });
    });

    await loadHotels();
};

// Hotel Detail Page
App.pages.hotelDetail = async function(params) {
    const hotelId = parseInt(params.id);
    const app = Utils.$('#app');
    
    if (!hotelId || isNaN(hotelId)) {
        Utils.showToast('Invalid hotel ID', 'error');
        Router.navigate('/hotels');
        return;
    }
    
    app.innerHTML = `
        <section class="section">
            <div class="container">
                <button class="btn btn-secondary mb-3" onclick="Router.navigate('/hotels')">
                    ← Back to Hotels
                </button>
                <div id="hotel-detail">${Components.loadingSkeleton(1)}</div>
            </div>
        </section>
    `;

    try {
        const hotel = await API.hotels.getById(hotelId);
        const reviews = await API.reviews.getHotelReviews(hotelId).catch(() => []);

        Utils.$('#hotel-detail').innerHTML = `
            <div class="card">
                <div class="hotel-image" style="height: 400px; border-radius: 16px; overflow: hidden; margin-bottom: 2rem;">
                    <img src="https://picsum.photos/1200/400?random=${hotel.id}" alt="${Utils.escapeHtml(hotel.name)}" style="width: 100%; height: 100%; object-fit: cover;">
                </div>

                <h1>${Utils.escapeHtml(hotel.name)}</h1>
                <div class="hotel-location mb-3">
                    📍 ${Utils.escapeHtml(hotel.address)}, ${Utils.escapeHtml(hotel.city)}
                </div>
                <div class="hotel-rating mb-4">
                    <span class="stars">${Utils.generateStars(hotel.rating || 0)}</span>
                    <span class="rating-text">${(hotel.rating || 0).toFixed(1)} (${reviews.length} reviews)</span>
                </div>

                <div class="grid grid-2 mb-4">
                    <div class="card">
                        <h3>Price</h3>
                        <div class="price-amount">${Utils.formatCurrency(hotel.pricePerNight)}</div>
                        <div class="price-label">per night</div>
                    </div>
                    <div class="card">
                        <h3>Availability</h3>
                        <div class="price-amount">${hotel.availableRooms}</div>
                        <div class="price-label">rooms available</div>
                    </div>
                </div>

                ${Auth.isLoggedIn() ? `
                    <button class="btn btn-primary btn-lg" onclick="App.showBookingForm(${hotel.id}, '${Utils.escapeHtml(hotel.name)}', ${hotel.pricePerNight})">
                        Book Now
                    </button>
                ` : `
                    <button class="btn btn-primary btn-lg" onclick="Router.navigate('/login')">
                        Login to Book
                    </button>
                `}

                <div class="mt-4">
                    <h2>Reviews</h2>
                    ${Auth.isLoggedIn() ? `
                        <button class="btn btn-secondary mb-3" onclick="App.showReviewForm(${hotel.id})">
                            Write a Review
                        </button>
                    ` : ''}
                    <div id="reviews-list">
                        ${reviews.length > 0 
                            ? reviews.map(r => Components.reviewCard(r)).join('')
                            : Components.emptyState('No reviews yet', '📝')
                        }
                    </div>
                </div>
            </div>
        `;
    } catch (error) {
        console.error('Error loading hotel:', error);
        Utils.showToast('Failed to load hotel: ' + error.message, 'error');
        Utils.$('#hotel-detail').innerHTML = `
            <div class="card">
                ${Components.emptyState('Hotel not found', '😔')}
                <button class="btn btn-secondary" onclick="Router.navigate('/hotels')">
                    Back to Hotels
                </button>
            </div>
        `;
    }
};

// Login Page
App.pages.login = function() {
    if (Auth.isLoggedIn()) {
        Router.navigate('/');
        return;
    }

    const app = Utils.$('#app');
    app.innerHTML = `
        <section class="section">
            <div class="container" style="max-width: 500px;">
                <div class="card">
                    <h1 class="text-center mb-4">Welcome Back</h1>
                    <form id="login-form">
                        <div class="form-group">
                            <label class="form-label">Email</label>
                            <input type="email" id="email" class="form-input" required>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Password</label>
                            <input type="password" id="password" class="form-input" required>
                        </div>
                        <button type="submit" class="btn btn-primary" style="width: 100%;">Login</button>
                    </form>
                    <p class="text-center mt-3">
                        Don't have an account? <a href="#/register">Register here</a>
                    </p>
                </div>
            </div>
        </section>
    `;

    Utils.$('#login-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = e.target.querySelector('button[type="submit"]');
        Utils.showLoading(btn);

        try {
            const email = Utils.$('#email').value;
            const password = Utils.$('#password').value;
            await Auth.login(email, password);
            Router.navigate('/');
        } catch (error) {
            Utils.hideLoading(btn);
        }
    });
};

// Register Page
App.pages.register = function() {
    if (Auth.isLoggedIn()) {
        Router.navigate('/');
        return;
    }

    const app = Utils.$('#app');
    app.innerHTML = `
        <section class="section">
            <div class="container" style="max-width: 600px;">
                <div class="card">
                    <h1 class="text-center mb-4">Create Account</h1>
                    <form id="register-form">
                        <div class="form-group">
                            <label class="form-label">Full Name</label>
                            <input type="text" id="name" class="form-input" required>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Email</label>
                            <input type="email" id="email" class="form-input" required>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Password</label>
                            <input type="password" id="password" class="form-input" required>
                            <small class="text-secondary">Min 6 characters, 1 uppercase, 1 lowercase, 1 number, 1 special character</small>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Confirm Password</label>
                            <input type="password" id="confirmPassword" class="form-input" required>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Contact Number (Optional)</label>
                            <input type="tel" id="contactNumber" class="form-input">
                        </div>
                        <button type="submit" class="btn btn-primary" style="width: 100%;">Create Account</button>
                    </form>
                    <p class="text-center mt-3">
                        Already have an account? <a href="#/login">Login here</a>
                    </p>
                    <p class="text-center mt-2">
                        <a href="#/apply-manager">Apply as Hotel Manager</a>
                    </p>
                </div>
            </div>
        </section>
    `;

    Utils.$('#register-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = e.target.querySelector('button[type="submit"]');

        const password = Utils.$('#password').value;
        const confirmPassword = Utils.$('#confirmPassword').value;

        if (password !== confirmPassword) {
            Utils.showToast('Passwords do not match', 'error');
            return;
        }

        if (!Utils.validatePassword(password)) {
            Utils.showToast('Password does not meet requirements', 'error');
            return;
        }

        Utils.showLoading(btn);

        try {
            const data = {
                name: Utils.$('#name').value,
                email: Utils.$('#email').value,
                password: password,
                confirmPassword: confirmPassword,
                contactNumber: Utils.$('#contactNumber').value || null
            };
            await Auth.register(data);
            Router.navigate('/');
        } catch (error) {
            Utils.hideLoading(btn);
        }
    });
};

// Logout
App.pages.logout = function() {
    Auth.logout();
};

// Bookings Page
App.pages.bookings = async function() {
    if (!Auth.requireAuth()) return;

    const app = Utils.$('#app');
    app.innerHTML = `
        <section class="section">
            <div class="container">
                <div class="section-title">
                    <h2>My Bookings</h2>
                    <p class="section-subtitle">View and manage your hotel reservations</p>
                </div>
                <div id="bookings-list" class="grid grid-2">
                    ${Components.loadingSkeleton(2)}
                </div>
            </div>
        </section>
    `;

    try {
        const bookings = await API.bookings.getMy();
        const list = Utils.$('#bookings-list');
        
        if (bookings.length === 0) {
            list.innerHTML = Components.emptyState('No bookings yet', '📅');
        } else {
            list.innerHTML = bookings.map(b => Components.bookingCard(b)).join('');
        }
    } catch (error) {
        Utils.$('#bookings-list').innerHTML = Components.emptyState('Unable to load bookings', '😔');
    }
};

// Loyalty Page
App.pages.loyalty = async function() {
    if (!Auth.requireAuth()) return;

    const app = Utils.$('#app');
    app.innerHTML = `
        <section class="section">
            <div class="container">
                <div class="section-title">
                    <h2>Loyalty Rewards</h2>
                    <p class="section-subtitle">Track your points and rewards</p>
                </div>
                <div id="loyalty-content">${Components.loadingSkeleton(1)}</div>
            </div>
        </section>
    `;

    try {
        const account = await API.loyalty.getAccount();
        const transactions = await API.loyalty.getTransactions();

        Utils.$('#loyalty-content').innerHTML = `
            <div class="grid grid-2 mb-4">
                <div class="card" style="background: linear-gradient(135deg, var(--gold), var(--gold-light)); color: var(--primary);">
                    <h3>Points Balance</h3>
                    <div class="price-amount" style="color: var(--primary);">${account.pointsBalance}</div>
                    <div class="price-label" style="color: var(--primary);">points available</div>
                </div>
                <div class="card">
                    <h3>Total Earned</h3>
                    <div class="price-amount">${account.totalPointsEarned}</div>
                    <div class="price-label">lifetime points</div>
                </div>
            </div>

            <div class="card">
                <h3 class="mb-3">Transaction History</h3>
                ${transactions.length > 0 ? transactions.map(t => `
                    <div class="card mb-2">
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <div>
                                <strong>${Utils.escapeHtml(t.description)}</strong>
                                <div class="text-secondary">${Utils.formatDate(t.createdAt)}</div>
                            </div>
                            <div class="badge badge-gold">+${t.pointsEarned} points</div>
                        </div>
                    </div>
                `).join('') : Components.emptyState('No transactions yet', '💰')}
            </div>
        `;
    } catch (error) {
        Utils.$('#loyalty-content').innerHTML = Components.emptyState('Unable to load loyalty information', '😔');
    }
};

// Admin Page
App.pages.admin = async function() {
    if (!Auth.requireRole('Admin')) return;

    const app = Utils.$('#app');
    app.innerHTML = `
        <section class="section">
            <div class="container">
                <div class="section-title">
                    <h2>Admin Dashboard</h2>
                    <p class="section-subtitle">Manage hotel manager applications and bookings</p>
                </div>
                <div class="admin-actions">
                    <a href="#/admin/bookings" class="btn btn-primary">View All Bookings</a>
                    <a href="#/manage-hotels" class="btn btn-secondary">Manage Hotels</a>
                </div>
                <h3>Hotel Manager Applications</h3>
                <div id="applications-list">${Components.loadingSkeleton(3)}</div>
            </div>
        </section>
    `;

    try {
        const applications = await API.auth.getApplications();
        const list = Utils.$('#applications-list');

        if (applications.length === 0) {
            list.innerHTML = Components.emptyState('No applications', '📋');
        } else {
            list.innerHTML = applications.map(app => `
                <div class="card mb-3">
                    <div class="card-header">
                        <div>
                            <h3>${Utils.escapeHtml(app.businessName)}</h3>
                            <p class="text-secondary">${Utils.escapeHtml(app.userEmail)}</p>
                        </div>
                        ${Components.applicationStatusBadge(app.statusText)}
                    </div>
                    <div class="card-body">
                        <div class="grid grid-2">
                            <div><strong>Contact:</strong> ${Utils.escapeHtml(app.contactPerson)}</div>
                            <div><strong>Phone:</strong> ${Utils.escapeHtml(app.businessPhone)}</div>
                            <div><strong>License:</strong> ${Utils.escapeHtml(app.businessLicense)}</div>
                            <div><strong>Applied:</strong> ${Utils.formatDate(app.applicationDate)}</div>
                        </div>
                        ${app.additionalInfo ? `<p class="mt-2"><strong>Info:</strong> ${Utils.escapeHtml(app.additionalInfo)}</p>` : ''}
                        ${app.status === 'Pending' || app.status === 'RequiresMoreInfo' ? `
                            <div class="mt-3" style="display: flex; gap: 1rem;">
                                <button class="btn btn-primary" onclick="App.processApplication(${app.id}, 'Approved')">
                                    Approve
                                </button>
                                <button class="btn btn-accent" onclick="App.processApplication(${app.id}, 'Rejected')">
                                    Reject
                                </button>
                                <button class="btn btn-secondary" onclick="App.processApplication(${app.id}, 'RequiresMoreInfo')">
                                    Request Info
                                </button>
                            </div>
                        ` : ''}
                        ${app.adminNotes ? `<p class="mt-2 text-secondary"><strong>Notes:</strong> ${Utils.escapeHtml(app.adminNotes)}</p>` : ''}
                    </div>
                </div>
            `).join('');
        }
    } catch (error) {
        Utils.$('#applications-list').innerHTML = Components.emptyState('Unable to load applications', '😔');
    }
};

// Process Application
App.processApplication = async function(id, status) {
    const notes = prompt(`Enter notes for this ${status.toLowerCase()} decision:`);
    if (notes === null) return;

    try {
        await API.auth.processApplication(id, { status, adminNotes: notes });
        Utils.showToast(`Application ${status.toLowerCase()} successfully`, 'success');
        Router.handleRoute(); // Reload page
    } catch (error) {
        Utils.showToast(error.message || 'Failed to process application', 'error');
    }
};

// Apply for Hotel Manager
App.pages.applyManager = function() {
    if (!Auth.requireAuth()) return;

    const app = Utils.$('#app');
    app.innerHTML = `
        <section class="section">
            <div class="container" style="max-width: 700px;">
                <div class="card">
                    <h1 class="text-center mb-4">Apply as Hotel Manager</h1>
                    <p class="text-center text-secondary mb-4">
                        Submit your application to manage hotels on our platform
                    </p>
                    <form id="apply-form">
                        <div class="form-group">
                            <label class="form-label">Business Name</label>
                            <input type="text" id="businessName" class="form-input" required>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Business Address</label>
                            <input type="text" id="businessAddress" class="form-input" required>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Business License Number</label>
                            <input type="text" id="businessLicense" class="form-input" required>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Contact Person</label>
                            <input type="text" id="contactPerson" class="form-input" required>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Business Phone</label>
                            <input type="tel" id="businessPhone" class="form-input" required>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Business Email</label>
                            <input type="email" id="businessEmail" class="form-input" required>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Additional Information (Optional)</label>
                            <textarea id="additionalInfo" class="form-textarea" rows="4"></textarea>
                        </div>
                        <button type="submit" class="btn btn-primary" style="width: 100%;">Submit Application</button>
                    </form>
                    <p class="text-center mt-3">
                        <a href="#/my-application">Check Application Status</a>
                    </p>
                </div>
            </div>
        </section>
    `;

    Utils.$('#apply-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = e.target.querySelector('button[type="submit"]');
        Utils.showLoading(btn);

        try {
            const data = {
                businessName: Utils.$('#businessName').value,
                businessAddress: Utils.$('#businessAddress').value,
                businessLicense: Utils.$('#businessLicense').value,
                contactPerson: Utils.$('#contactPerson').value,
                businessPhone: Utils.$('#businessPhone').value,
                businessEmail: Utils.$('#businessEmail').value,
                additionalInfo: Utils.$('#additionalInfo').value || null
            };
            await API.auth.applyHotelManager(data);
            Utils.showToast('Application submitted successfully!', 'success');
            Router.navigate('/my-application');
        } catch (error) {
            Utils.hideLoading(btn);
        }
    });
};

// My Application Status
App.pages.myApplication = async function() {
    if (!Auth.requireAuth()) return;

    const app = Utils.$('#app');
    app.innerHTML = `
        <section class="section">
            <div class="container" style="max-width: 700px;">
                <div class="section-title">
                    <h2>Application Status</h2>
                </div>
                <div id="application-status">${Components.loadingSkeleton(1)}</div>
            </div>
        </section>
    `;

    try {
        const application = await API.auth.getMyApplication();
        
        Utils.$('#application-status').innerHTML = `
            <div class="card">
                <div class="card-header">
                    <h3>${Utils.escapeHtml(application.businessName)}</h3>
                    ${Components.applicationStatusBadge(application.statusText)}
                </div>
                <div class="card-body">
                    <div class="grid grid-2 mb-3">
                        <div><strong>Business Address:</strong><br>${Utils.escapeHtml(application.businessAddress)}</div>
                        <div><strong>License:</strong><br>${Utils.escapeHtml(application.businessLicense)}</div>
                        <div><strong>Contact:</strong><br>${Utils.escapeHtml(application.contactPerson)}</div>
                        <div><strong>Phone:</strong><br>${Utils.escapeHtml(application.businessPhone)}</div>
                        <div><strong>Email:</strong><br>${Utils.escapeHtml(application.businessEmail)}</div>
                        <div><strong>Applied:</strong><br>${Utils.formatDate(application.applicationDate)}</div>
                    </div>
                    ${application.additionalInfo ? `
                        <div class="mb-3">
                            <strong>Additional Information:</strong>
                            <p>${Utils.escapeHtml(application.additionalInfo)}</p>
                        </div>
                    ` : ''}
                    ${application.adminNotes ? `
                        <div class="card" style="background: var(--bg-secondary);">
                            <strong>Admin Notes:</strong>
                            <p>${Utils.escapeHtml(application.adminNotes)}</p>
                        </div>
                    ` : ''}
                    ${application.processedDate ? `
                        <p class="text-secondary mt-3">
                            Processed on ${Utils.formatDate(application.processedDate)}
                            ${application.processedByName ? ` by ${Utils.escapeHtml(application.processedByName)}` : ''}
                        </p>
                    ` : ''}
                </div>
            </div>
        `;
    } catch (error) {
        Utils.$('#application-status').innerHTML = `
            <div class="card text-center">
                <p>No application found</p>
                <button class="btn btn-primary mt-3" onclick="Router.navigate('/apply-manager')">
                    Submit Application
                </button>
            </div>
        `;
    }
};

// Show Booking Form (Modal)
App.showBookingForm = function(hotelId, hotelName, pricePerNight) {
    const modal = Components.modal('Book Hotel', `
        <form id="booking-form">
            <h3 class="mb-3">${Utils.escapeHtml(hotelName)}</h3>
            <div class="form-group">
                <label class="form-label">Guest Name</label>
                <input type="text" id="guestName" class="form-input" value="${Auth.currentUser?.name || ''}" required>
            </div>
            <div class="form-group">
                <label class="form-label">Guest Email</label>
                <input type="email" id="guestEmail" class="form-input" value="${Auth.currentUser?.email || ''}" required>
            </div>
            <div class="form-group">
                <label class="form-label">Check-in Date</label>
                <input type="date" id="checkInDate" class="form-input" min="${new Date().toISOString().split('T')[0]}" required>
            </div>
            <div class="form-group">
                <label class="form-label">Check-out Date</label>
                <input type="date" id="checkOutDate" class="form-input" min="${new Date().toISOString().split('T')[0]}" required>
            </div>
            <div class="form-group">
                <label class="form-label">Number of Guests</label>
                <input type="number" id="numberOfGuests" class="form-input" min="1" max="10" value="1" required>
            </div>
            <div id="price-preview" class="card mb-3" style="background: var(--bg-secondary);"></div>
        </form>
    `, `
        <button class="btn btn-secondary" onclick="this.closest('.modal-overlay').remove()">Cancel</button>
        <button class="btn btn-primary" onclick="App.submitBooking(${hotelId}, ${pricePerNight})">Confirm Booking</button>
    `);

    document.body.insertAdjacentHTML('beforeend', modal);

    // Calculate price on date change
    const updatePrice = () => {
        const checkIn = Utils.$('#checkInDate')?.value;
        const checkOut = Utils.$('#checkOutDate')?.value;
        const preview = Utils.$('#price-preview');
        
        if (checkIn && checkOut && preview) {
            const nights = Utils.daysBetween(checkIn, checkOut);
            const total = nights * pricePerNight;
            preview.innerHTML = `
                <strong>Total:</strong> ${nights} night${nights !== 1 ? 's' : ''} × ${Utils.formatCurrency(pricePerNight)} = 
                <span class="price-amount" style="font-size: 1.5rem;">${Utils.formatCurrency(total)}</span>
            `;
        }
    };

    Utils.$('#checkInDate')?.addEventListener('change', updatePrice);
    Utils.$('#checkOutDate')?.addEventListener('change', updatePrice);
};

// Submit Booking
App.submitBooking = async function(hotelId, pricePerNight) {
    const btn = event.target;
    Utils.showLoading(btn);

    try {
        const checkInDate = Utils.$('#checkInDate').value;
        const checkOutDate = Utils.$('#checkOutDate').value;
        const nights = Utils.daysBetween(checkInDate, checkOutDate);

        const data = {
            hotelId,
            guestName: Utils.$('#guestName').value,
            guestEmail: Utils.$('#guestEmail').value,
            checkInDate,
            checkOutDate,
            numberOfGuests: parseInt(Utils.$('#numberOfGuests').value)
        };

        const booking = await API.bookings.create(data);
        Utils.showToast('Booking created! Processing payment...', 'success');
        
        // Show payment form
        Utils.$('.modal-overlay').remove();
        App.showPaymentForm(booking.id, nights * pricePerNight);
    } catch (error) {
        Utils.hideLoading(btn);
    }
};

// Show Payment Form
App.showPaymentForm = function(bookingId, amount) {
    const modal = Components.modal('Payment', `
        <form id="payment-form">
            <h3 class="mb-3">Total Amount: ${Utils.formatCurrency(amount)}</h3>
            <div class="form-group">
                <label class="form-label">Card Number</label>
                <input type="text" id="cardNumber" class="form-input" placeholder="4111 1111 1111 1111" required>
            </div>
            <div class="grid grid-2">
                <div class="form-group">
                    <label class="form-label">Expiry Month</label>
                    <input type="text" id="expiryMonth" class="form-input" placeholder="12" maxlength="2" required>
                </div>
                <div class="form-group">
                    <label class="form-label">Expiry Year</label>
                    <input type="text" id="expiryYear" class="form-input" placeholder="2025" maxlength="4" required>
                </div>
            </div>
            <div class="form-group">
                <label class="form-label">CVV</label>
                <input type="text" id="cvv" class="form-input" placeholder="123" maxlength="3" required>
            </div>
            <div class="form-group">
                <label class="form-label">Card Holder Name</label>
                <input type="text" id="cardHolderName" class="form-input" required>
            </div>
        </form>
    `, `
        <button class="btn btn-secondary" onclick="this.closest('.modal-overlay').remove()">Cancel</button>
        <button class="btn btn-primary" onclick="App.submitPayment(${bookingId}, ${amount})">Pay Now</button>
    `);

    document.body.insertAdjacentHTML('beforeend', modal);
};

// Submit Payment
App.submitPayment = async function(bookingId, amount) {
    const btn = event.target;
    Utils.showLoading(btn);

    try {
        const data = {
            amount,
            currency: 'USD',
            paymentMethod: 'CreditCard',
            cardNumber: Utils.$('#cardNumber').value,
            expiryMonth: Utils.$('#expiryMonth').value,
            expiryYear: Utils.$('#expiryYear').value,
            cvv: Utils.$('#cvv').value,
            cardHolderName: Utils.$('#cardHolderName').value
        };

        await API.bookings.processPayment(bookingId, data);
        Utils.showToast('Payment successful! Booking confirmed.', 'success');
        Utils.$('.modal-overlay').remove();
        Router.navigate('/bookings');
    } catch (error) {
        Utils.hideLoading(btn);
    }
};

// Cancel Booking
App.cancelBooking = async function(bookingId) {
    if (!confirm('Are you sure you want to cancel this booking?')) return;

    try {
        await API.bookings.cancel(bookingId);
        Utils.showToast('Booking cancelled successfully', 'success');
        Router.handleRoute(); // Reload page
    } catch (error) {
        Utils.showToast(error.message || 'Failed to cancel booking', 'error');
    }
};

// Show Review Form
App.showReviewForm = function(hotelId) {
    const modal = Components.modal('Write a Review', `
        <form id="review-form">
            <div class="form-group">
                <label class="form-label">Rating</label>
                <select id="rating" class="form-select" required>
                    <option value="">Select rating...</option>
                    <option value="5">5 - Excellent</option>
                    <option value="4">4 - Very Good</option>
                    <option value="3">3 - Good</option>
                    <option value="2">2 - Fair</option>
                    <option value="1">1 - Poor</option>
                </select>
            </div>
            <div class="form-group">
                <label class="form-label">Comment</label>
                <textarea id="comment" class="form-textarea" rows="4" required></textarea>
            </div>
        </form>
    `, `
        <button class="btn btn-secondary" onclick="this.closest('.modal-overlay').remove()">Cancel</button>
        <button class="btn btn-primary" onclick="App.submitReview(${hotelId})">Submit Review</button>
    `);

    document.body.insertAdjacentHTML('beforeend', modal);
};

// Submit Review
App.submitReview = async function(hotelId) {
    const btn = event.target;
    Utils.showLoading(btn);

    try {
        const data = {
            hotelId,
            rating: parseInt(Utils.$('#rating').value),
            comment: Utils.$('#comment').value
        };

        await API.reviews.create(data);
        Utils.showToast('Review submitted successfully!', 'success');
        Utils.$('.modal-overlay').remove();
        Router.handleRoute(); // Reload page
    } catch (error) {
        Utils.hideLoading(btn);
    }
};

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});


// ============================================
// HOTEL MANAGER FEATURES
// ============================================

// Manage Hotels Page (Hotel Manager)
App.pages.manageHotels = async function() {
    if (!Auth.isAuthenticated() || !Auth.hasRole(['HotelManager', 'Admin'])) {
        Router.navigate('/login');
        return;
    }

    Utils.$('#app').innerHTML = `
        <div class="container">
            <div class="page-header">
                <h1>Manage Hotels</h1>
                <button class="btn btn-primary" onclick="App.showCreateHotelModal()">
                    + Create New Hotel
                </button>
            </div>
            <div id="hotels-manager-list" class="loading">Loading hotels...</div>
        </div>
    `;

    try {
        const hotels = await API.hotels.getAll();
        const list = Utils.$('#hotels-manager-list');
        
        if (hotels.length === 0) {
            list.innerHTML = '<div class="empty-state">No hotels yet. Create your first hotel!</div>';
            return;
        }

        list.innerHTML = hotels.map(hotel => `
            <div class="hotel-manager-card">
                <div class="hotel-manager-info">
                    <h3>${hotel.name}</h3>
                    <p><strong>City:</strong> ${hotel.city}</p>
                    <p><strong>Address:</strong> ${hotel.address}</p>
                    <p><strong>Price:</strong> $${hotel.pricePerNight}/night</p>
                    <p><strong>Available Rooms:</strong> ${hotel.availableRooms}</p>
                    <p><strong>Rating:</strong> ${hotel.rating.toFixed(1)} ⭐</p>
                </div>
                <div class="hotel-manager-actions">
                    <button class="btn btn-secondary" onclick="App.showEditHotelModal(${hotel.id})">
                        Edit
                    </button>
                    ${Auth.hasRole('Admin') ? `
                        <button class="btn btn-danger" onclick="App.deleteHotel(${hotel.id}, '${hotel.name}')">
                            Delete
                        </button>
                    ` : ''}
                </div>
            </div>
        `).join('');
    } catch (error) {
        Utils.showToast('Failed to load hotels: ' + error.message, 'error');
    }
};

// Show Create Hotel Modal
App.showCreateHotelModal = function() {
    const modal = Components.modal('Create New Hotel', `
        <form id="create-hotel-form" class="form">
            <div class="form-group">
                <label>Hotel Name *</label>
                <input type="text" id="hotelName" required>
            </div>
            <div class="form-group">
                <label>City *</label>
                <input type="text" id="hotelCity" required>
            </div>
            <div class="form-group">
                <label>Address *</label>
                <input type="text" id="hotelAddress" required>
            </div>
            <div class="form-group">
                <label>Price Per Night ($) *</label>
                <input type="number" id="hotelPrice" min="0" step="0.01" required>
            </div>
            <div class="form-group">
                <label>Available Rooms *</label>
                <input type="number" id="hotelRooms" min="1" required>
            </div>
            <button type="submit" class="btn btn-primary">Create Hotel</button>
        </form>
    `);

    document.body.insertAdjacentHTML('beforeend', modal);

    Utils.$('#create-hotel-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const data = {
            name: Utils.$('#hotelName').value,
            city: Utils.$('#hotelCity').value,
            address: Utils.$('#hotelAddress').value,
            pricePerNight: parseFloat(Utils.$('#hotelPrice').value),
            availableRooms: parseInt(Utils.$('#hotelRooms').value)
        };

        try {
            await API.hotels.create(data);
            Utils.showToast('Hotel created successfully!', 'success');
            Utils.$('.modal-overlay').remove();
            Router.handleRoute();
        } catch (error) {
            Utils.showToast('Failed to create hotel: ' + error.message, 'error');
        }
    });
};

// Show Edit Hotel Modal
App.showEditHotelModal = async function(hotelId) {
    try {
        const hotel = await API.hotels.getById(hotelId);
        
        const modal = Components.modal('Edit Hotel', `
            <form id="edit-hotel-form" class="form">
                <div class="form-group">
                    <label>Hotel Name *</label>
                    <input type="text" id="editHotelName" value="${hotel.name}" required>
                </div>
                <div class="form-group">
                    <label>City *</label>
                    <input type="text" id="editHotelCity" value="${hotel.city}" required>
                </div>
                <div class="form-group">
                    <label>Address *</label>
                    <input type="text" id="editHotelAddress" value="${hotel.address}" required>
                </div>
                <div class="form-group">
                    <label>Price Per Night ($) *</label>
                    <input type="number" id="editHotelPrice" value="${hotel.pricePerNight}" min="0" step="0.01" required>
                </div>
                <div class="form-group">
                    <label>Available Rooms *</label>
                    <input type="number" id="editHotelRooms" value="${hotel.availableRooms}" min="0" required>
                </div>
                <button type="submit" class="btn btn-primary">Update Hotel</button>
            </form>
        `);

        document.body.insertAdjacentHTML('beforeend', modal);

        Utils.$('#edit-hotel-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const data = {
                name: Utils.$('#editHotelName').value,
                city: Utils.$('#editHotelCity').value,
                address: Utils.$('#editHotelAddress').value,
                pricePerNight: parseFloat(Utils.$('#editHotelPrice').value),
                availableRooms: parseInt(Utils.$('#editHotelRooms').value)
            };

            try {
                await API.hotels.update(hotelId, data);
                Utils.showToast('Hotel updated successfully!', 'success');
                Utils.$('.modal-overlay').remove();
                Router.handleRoute();
            } catch (error) {
                Utils.showToast('Failed to update hotel: ' + error.message, 'error');
            }
        });
    } catch (error) {
        Utils.showToast('Failed to load hotel: ' + error.message, 'error');
    }
};

// Delete Hotel
App.deleteHotel = async function(hotelId, hotelName) {
    if (!confirm(`Are you sure you want to delete "${hotelName}"? This action cannot be undone.`)) {
        return;
    }

    try {
        await API.hotels.delete(hotelId);
        Utils.showToast('Hotel deleted successfully', 'success');
        Router.handleRoute();
    } catch (error) {
        Utils.showToast('Failed to delete hotel: ' + error.message, 'error');
    }
};

// ============================================
// ADMIN FEATURES - ALL BOOKINGS
// ============================================

// All Bookings Page (Admin)
App.pages.allBookings = async function() {
    if (!Auth.isAuthenticated() || !Auth.hasRole('Admin')) {
        Router.navigate('/login');
        return;
    }

    Utils.$('#app').innerHTML = `
        <div class="container">
            <div class="page-header">
                <h1>All Bookings</h1>
                <div class="search-box">
                    <input type="email" id="searchEmail" placeholder="Search by email...">
                    <button class="btn btn-secondary" onclick="App.searchBookings()">Search</button>
                    <button class="btn btn-secondary" onclick="Router.handleRoute()">Clear</button>
                </div>
            </div>
            <div id="all-bookings-list" class="loading">Loading bookings...</div>
        </div>
    `;

    try {
        const bookings = await API.bookings.getAll();
        App.displayAllBookings(bookings);
    } catch (error) {
        Utils.showToast('Failed to load bookings: ' + error.message, 'error');
    }
};

// Search Bookings by Email
App.searchBookings = async function() {
    const email = Utils.$('#searchEmail').value.trim();
    if (!email) {
        Utils.showToast('Please enter an email address', 'warning');
        return;
    }

    Utils.$('#all-bookings-list').innerHTML = '<div class="loading">Searching...</div>';

    try {
        const bookings = await API.bookings.search(email);
        App.displayAllBookings(bookings);
    } catch (error) {
        Utils.showToast('Search failed: ' + error.message, 'error');
    }
};

// Display All Bookings
App.displayAllBookings = function(bookings) {
    const list = Utils.$('#all-bookings-list');
    
    if (bookings.length === 0) {
        list.innerHTML = '<div class="empty-state">No bookings found</div>';
        return;
    }

    list.innerHTML = bookings.map(booking => `
        <div class="booking-card">
            <div class="booking-header">
                <h3>${booking.hotelName}</h3>
                <span class="badge badge-${booking.status.toLowerCase()}">${booking.status}</span>
            </div>
            <div class="booking-details">
                <p><strong>Guest:</strong> ${booking.guestName} (${booking.guestEmail})</p>
                <p><strong>Check-in:</strong> ${new Date(booking.checkInDate).toLocaleDateString()}</p>
                <p><strong>Check-out:</strong> ${new Date(booking.checkOutDate).toLocaleDateString()}</p>
                <p><strong>Guests:</strong> ${booking.numberOfGuests}</p>
                <p><strong>Total:</strong> $${booking.totalAmount.toFixed(2)}</p>
                <p><strong>Booked:</strong> ${new Date(booking.createdAt).toLocaleString()}</p>
            </div>
            <div class="booking-actions">
                <button class="btn btn-secondary" onclick="App.viewBookingDetails(${booking.id})">
                    View Details
                </button>
            </div>
        </div>
    `).join('');
};

// View Booking Details
App.viewBookingDetails = async function(bookingId) {
    try {
        const booking = await API.bookings.getById(bookingId);
        
        const modal = Components.modal('Booking Details', `
            <div class="booking-detail-modal">
                <h3>${booking.hotelName}</h3>
                <div class="detail-grid">
                    <div class="detail-item">
                        <strong>Booking ID:</strong>
                        <span>${booking.id}</span>
                    </div>
                    <div class="detail-item">
                        <strong>Status:</strong>
                        <span class="badge badge-${booking.status.toLowerCase()}">${booking.status}</span>
                    </div>
                    <div class="detail-item">
                        <strong>Guest Name:</strong>
                        <span>${booking.guestName}</span>
                    </div>
                    <div class="detail-item">
                        <strong>Guest Email:</strong>
                        <span>${booking.guestEmail}</span>
                    </div>
                    <div class="detail-item">
                        <strong>Check-in:</strong>
                        <span>${new Date(booking.checkInDate).toLocaleDateString()}</span>
                    </div>
                    <div class="detail-item">
                        <strong>Check-out:</strong>
                        <span>${new Date(booking.checkOutDate).toLocaleDateString()}</span>
                    </div>
                    <div class="detail-item">
                        <strong>Number of Guests:</strong>
                        <span>${booking.numberOfGuests}</span>
                    </div>
                    <div class="detail-item">
                        <strong>Total Amount:</strong>
                        <span>$${booking.totalAmount.toFixed(2)}</span>
                    </div>
                    <div class="detail-item">
                        <strong>Booked On:</strong>
                        <span>${new Date(booking.createdAt).toLocaleString()}</span>
                    </div>
                </div>
            </div>
        `);

        document.body.insertAdjacentHTML('beforeend', modal);
    } catch (error) {
        Utils.showToast('Failed to load booking details: ' + error.message, 'error');
    }
};

// ============================================
// REVIEW MANAGEMENT
// ============================================

// Edit Review
App.editReview = async function(reviewId, hotelId) {
    try {
        const reviews = await API.reviews.getHotelReviews(hotelId);
        const review = reviews.find(r => r.id === reviewId);
        
        if (!review) {
            Utils.showToast('Review not found', 'error');
            return;
        }

        const modal = Components.modal('Edit Review', `
            <form id="edit-review-form" class="form">
                <div class="form-group">
                    <label>Rating *</label>
                    <select id="editRating" required>
                        <option value="5" ${review.rating === 5 ? 'selected' : ''}>⭐⭐⭐⭐⭐ Excellent</option>
                        <option value="4" ${review.rating === 4 ? 'selected' : ''}>⭐⭐⭐⭐ Good</option>
                        <option value="3" ${review.rating === 3 ? 'selected' : ''}>⭐⭐⭐ Average</option>
                        <option value="2" ${review.rating === 2 ? 'selected' : ''}>⭐⭐ Poor</option>
                        <option value="1" ${review.rating === 1 ? 'selected' : ''}>⭐ Terrible</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Comment *</label>
                    <textarea id="editComment" rows="4" required>${review.comment}</textarea>
                </div>
                <button type="submit" class="btn btn-primary">Update Review</button>
            </form>
        `);

        document.body.insertAdjacentHTML('beforeend', modal);

        Utils.$('#edit-review-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const data = {
                rating: parseInt(Utils.$('#editRating').value),
                comment: Utils.$('#editComment').value
            };

            try {
                await API.reviews.update(reviewId, data);
                Utils.showToast('Review updated successfully!', 'success');
                Utils.$('.modal-overlay').remove();
                Router.handleRoute();
            } catch (error) {
                Utils.showToast('Failed to update review: ' + error.message, 'error');
            }
        });
    } catch (error) {
        Utils.showToast('Failed to load review: ' + error.message, 'error');
    }
};

// Delete Review
App.deleteReview = async function(reviewId, hotelId) {
    if (!confirm('Are you sure you want to delete this review?')) {
        return;
    }

    try {
        await API.reviews.delete(reviewId);
        Utils.showToast('Review deleted successfully', 'success');
        Router.navigate('/hotels/' + hotelId);
    } catch (error) {
        Utils.showToast('Failed to delete review: ' + error.message, 'error');
    }
};

// ============================================
// PAYMENT MANAGEMENT (ADMIN)
// ============================================

// View Payment Details
App.viewPaymentDetails = async function(paymentId) {
    try {
        const payment = await API.payments.getById(paymentId);
        
        const modal = Components.modal('Payment Details', `
            <div class="payment-detail-modal">
                <div class="detail-grid">
                    <div class="detail-item">
                        <strong>Payment ID:</strong>
                        <span>${payment.id}</span>
                    </div>
                    <div class="detail-item">
                        <strong>Status:</strong>
                        <span class="badge badge-${payment.status.toLowerCase()}">${payment.status}</span>
                    </div>
                    <div class="detail-item">
                        <strong>Amount:</strong>
                        <span>$${payment.amount.toFixed(2)} ${payment.currency}</span>
                    </div>
                    <div class="detail-item">
                        <strong>Payment Method:</strong>
                        <span>${payment.paymentMethod}</span>
                    </div>
                    <div class="detail-item">
                        <strong>Transaction ID:</strong>
                        <span>${payment.transactionId || 'N/A'}</span>
                    </div>
                    <div class="detail-item">
                        <strong>Processed At:</strong>
                        <span>${payment.processedAt ? new Date(payment.processedAt).toLocaleString() : 'N/A'}</span>
                    </div>
                </div>
                ${payment.status === 'Completed' && Auth.hasRole('Admin') ? `
                    <button class="btn btn-danger" onclick="App.showRefundModal(${payment.id}, ${payment.amount})">
                        Process Refund
                    </button>
                ` : ''}
            </div>
        `);

        document.body.insertAdjacentHTML('beforeend', modal);
    } catch (error) {
        Utils.showToast('Failed to load payment details: ' + error.message, 'error');
    }
};

// Show Refund Modal
App.showRefundModal = function(paymentId, amount) {
    Utils.$('.modal-overlay').remove();
    
    const modal = Components.modal('Process Refund', `
        <form id="refund-form" class="form">
            <div class="form-group">
                <label>Refund Amount ($) *</label>
                <input type="number" id="refundAmount" value="${amount}" max="${amount}" min="0.01" step="0.01" required>
                <small>Maximum: $${amount.toFixed(2)}</small>
            </div>
            <div class="form-group">
                <label>Reason *</label>
                <textarea id="refundReason" rows="3" required placeholder="Enter reason for refund..."></textarea>
            </div>
            <button type="submit" class="btn btn-danger">Process Refund</button>
        </form>
    `);

    document.body.insertAdjacentHTML('beforeend', modal);

    Utils.$('#refund-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const data = {
            amount: parseFloat(Utils.$('#refundAmount').value),
            reason: Utils.$('#refundReason').value
        };

        try {
            await API.payments.refund(paymentId, data);
            Utils.showToast('Refund processed successfully!', 'success');
            Utils.$('.modal-overlay').remove();
        } catch (error) {
            Utils.showToast('Failed to process refund: ' + error.message, 'error');
        }
    });
};

// ============================================
// UPDATE EXISTING PAGES
// ============================================

// Update booking detail page to show payment details
const originalBookingDetail = App.pages.bookingDetail;
App.pages.bookingDetail = async function(params) {
    if (!Auth.isAuthenticated()) {
        Router.navigate('/login');
        return;
    }

    try {
        const booking = await API.bookings.getById(params.id);
        
        Utils.$('#app').innerHTML = `
            <div class="container">
                <div class="page-header">
                    <h1>Booking Details</h1>
                    <button class="btn btn-secondary" onclick="Router.navigate('/bookings')">
                        ← Back to Bookings
                    </button>
                </div>
                <div class="booking-detail-page">
                    <div class="booking-card">
                        <div class="booking-header">
                            <h2>${booking.hotelName}</h2>
                            <span class="badge badge-${booking.status.toLowerCase()}">${booking.status}</span>
                        </div>
                        <div class="booking-details">
                            <div class="detail-grid">
                                <div class="detail-item">
                                    <strong>Booking ID:</strong>
                                    <span>${booking.id}</span>
                                </div>
                                <div class="detail-item">
                                    <strong>Guest:</strong>
                                    <span>${booking.guestName}</span>
                                </div>
                                <div class="detail-item">
                                    <strong>Email:</strong>
                                    <span>${booking.guestEmail}</span>
                                </div>
                                <div class="detail-item">
                                    <strong>Check-in:</strong>
                                    <span>${new Date(booking.checkInDate).toLocaleDateString()}</span>
                                </div>
                                <div class="detail-item">
                                    <strong>Check-out:</strong>
                                    <span>${new Date(booking.checkOutDate).toLocaleDateString()}</span>
                                </div>
                                <div class="detail-item">
                                    <strong>Guests:</strong>
                                    <span>${booking.numberOfGuests}</span>
                                </div>
                                <div class="detail-item">
                                    <strong>Total Amount:</strong>
                                    <span>$${booking.totalAmount.toFixed(2)}</span>
                                </div>
                                <div class="detail-item">
                                    <strong>Booked On:</strong>
                                    <span>${new Date(booking.createdAt).toLocaleString()}</span>
                                </div>
                            </div>
                        </div>
                        ${booking.status === 'Confirmed' ? `
                            <button class="btn btn-danger" onclick="App.cancelBooking(${booking.id})">
                                Cancel Booking
                            </button>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;
    } catch (error) {
        Utils.showToast('Failed to load booking: ' + error.message, 'error');
        Router.navigate('/bookings');
    }
};

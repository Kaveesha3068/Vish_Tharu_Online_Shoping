// DOM Elements
const offersList = document.getElementById('offersList');
const addOfferBtn = document.getElementById('addOfferBtn');
const offerModal = document.getElementById('offerModal');
const offerForm = document.getElementById('offerForm');
const modalTitle = document.getElementById('modalTitle');
const cancelBtn = document.getElementById('cancelBtn');
const closeModalBtn = document.querySelector('.close-modal');
const searchInput = document.getElementById('searchOffers');
const searchBtn = document.getElementById('searchBtn');
const filterBtns = document.querySelectorAll('.filter-btn');
const imagePreview = document.getElementById('imagePreview');
const offerImage = document.getElementById('offerImage');

// Current filter state
let currentStatus = 'all';
let currentSearch = '';

// Sample offers data - In a real application, this would come from a backend API
let offers = [
    {
        id: 1,
        title: "Summer Collection Sale",
        description: "Get 30% off on all summer clothing items",
        category: "seasonal",
        discount: "30%",
        image: "../images/offers/summer-sale.jpg",
        validFrom: "2024-06-01",
        validUntil: "2024-08-31",
        status: "active"
    },
    {
        id: 2,
        title: "Buy 2 Get 1 Free",
        description: "Buy any 2 items and get 1 item free",
        category: "bundle",
        discount: "33%",
        image: "../images/offers/buy2get1.jpg",
        validFrom: "2024-07-01",
        validUntil: "2024-07-15",
        status: "upcoming"
    }
];

// Initialize the page
function init() {
    displayOffers(offers);
    setupEventListeners();
}

// Display offers in the list
function displayOffers(offersToDisplay) {
    offersList.innerHTML = '';

    if (offersToDisplay.length === 0) {
        offersList.innerHTML = `
            <div class="no-results">
                <i class="fas fa-search"></i>
                <p>No offers found</p>
            </div>
        `;
        return;
    }

    offersToDisplay.forEach(offer => {
        const offerCard = createOfferCard(offer);
        offersList.appendChild(offerCard);
    });
}

// Create offer card HTML
function createOfferCard(offer) {
    const card = document.createElement('div');
    card.className = 'admin-offer-card';
    card.innerHTML = `
        <div class="offer-image">
            <img src="${offer.image}" alt="${offer.title}" onerror="this.src='https://via.placeholder.com/300x200?text=Special+Offer'">
            <div class="offer-badge">${offer.discount} OFF</div>
        </div>
        <div class="offer-content">
            <h3>${offer.title}</h3>
            <p>${offer.description}</p>
            <div class="offer-meta">
                <span class="category">${offer.category}</span>
                <span class="validity">${formatDate(offer.validFrom)} - ${formatDate(offer.validUntil)}</span>
                <span class="status ${offer.status}">${offer.status}</span>
            </div>
        </div>
        <div class="offer-actions">
            <button class="btn-edit" onclick="editOffer(${offer.id})">
                <i class="fas fa-edit"></i> Edit
            </button>
            <button class="btn-delete" onclick="deleteOffer(${offer.id})">
                <i class="fas fa-trash"></i> Delete
            </button>
        </div>
    `;
    return card;
}

// Format date
function formatDate(dateString) {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
}

// Open modal for adding/editing offer
function openModal(offer = null) {
    if (offer) {
        modalTitle.textContent = 'Edit Offer';
        document.getElementById('offerId').value = offer.id;
        document.getElementById('offerTitle').value = offer.title;
        document.getElementById('offerDescription').value = offer.description;
        document.getElementById('offerCategory').value = offer.category;
        document.getElementById('offerDiscount').value = offer.discount;
        document.getElementById('validFrom').value = offer.validFrom;
        document.getElementById('validUntil').value = offer.validUntil;
        imagePreview.innerHTML = `<img src="${offer.image}" alt="Preview">`;
    } else {
        modalTitle.textContent = 'Add New Offer';
        offerForm.reset();
        imagePreview.innerHTML = '';
    }
    offerModal.style.display = 'flex';
}

// Close modal
function closeModal() {
    offerModal.style.display = 'none';
    offerForm.reset();
    imagePreview.innerHTML = '';
}

// Handle form submission
function handleSubmit(e) {
    e.preventDefault();
    
    const offerData = {
        id: document.getElementById('offerId').value || Date.now(),
        title: document.getElementById('offerTitle').value,
        description: document.getElementById('offerDescription').value,
        category: document.getElementById('offerCategory').value,
        discount: document.getElementById('offerDiscount').value,
        validFrom: document.getElementById('validFrom').value,
        validUntil: document.getElementById('validUntil').value,
        image: imagePreview.querySelector('img')?.src || '../images/offers/default.jpg',
        status: getOfferStatus(document.getElementById('validFrom').value, document.getElementById('validUntil').value)
    };

    if (document.getElementById('offerId').value) {
        // Edit existing offer
        const index = offers.findIndex(o => o.id === parseInt(offerData.id));
        offers[index] = offerData;
    } else {
        // Add new offer
        offers.push(offerData);
    }

    displayOffers(filterOffers());
    closeModal();
}

// Get offer status based on dates
function getOfferStatus(validFrom, validUntil) {
    const now = new Date();
    const from = new Date(validFrom);
    const until = new Date(validUntil);

    if (now < from) return 'upcoming';
    if (now > until) return 'expired';
    return 'active';
}

// Edit offer
function editOffer(id) {
    const offer = offers.find(o => o.id === id);
    if (offer) {
        openModal(offer);
    }
}

// Delete offer
function deleteOffer(id) {
    if (confirm('Are you sure you want to delete this offer?')) {
        offers = offers.filter(o => o.id !== id);
        displayOffers(filterOffers());
    }
}

// Filter offers based on status and search term
function filterOffers() {
    let filteredOffers = offers;

    // Apply status filter
    if (currentStatus !== 'all') {
        filteredOffers = filteredOffers.filter(offer => offer.status === currentStatus);
    }

    // Apply search filter
    if (currentSearch) {
        const searchTerm = currentSearch.toLowerCase();
        filteredOffers = filteredOffers.filter(offer => 
            offer.title.toLowerCase().includes(searchTerm) ||
            offer.description.toLowerCase().includes(searchTerm)
        );
    }

    return filteredOffers;
}

// Preview image before upload
function previewImage(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            imagePreview.innerHTML = `<img src="${e.target.result}" alt="Preview">`;
        };
        reader.readAsDataURL(file);
    }
}

// Setup event listeners
function setupEventListeners() {
    // Add offer button
    addOfferBtn.addEventListener('click', () => openModal());

    // Close modal buttons
    closeModalBtn.addEventListener('click', closeModal);
    cancelBtn.addEventListener('click', closeModal);
    offerModal.addEventListener('click', (e) => {
        if (e.target === offerModal) closeModal();
    });

    // Form submission
    offerForm.addEventListener('submit', handleSubmit);

    // Image preview
    offerImage.addEventListener('change', previewImage);

    // Search functionality
    searchBtn.addEventListener('click', () => {
        currentSearch = searchInput.value.trim();
        displayOffers(filterOffers());
    });

    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            currentSearch = searchInput.value.trim();
            displayOffers(filterOffers());
        }
    });

    // Status filter buttons
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentStatus = btn.dataset.status;
            displayOffers(filterOffers());
        });
    });
}

// Initialize the page when DOM is loaded
document.addEventListener('DOMContentLoaded', init); 
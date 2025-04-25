// Global variables
let allProducts = [];
let filteredProducts = [];
let currentCategory = 'all';
let searchTerm = '';

// Load all products
function loadProducts() {
    const productsContainer = document.getElementById('productsContainer');
    if (!productsContainer) return;

    allProducts = JSON.parse(localStorage.getItem('products')) || [];
    filteredProducts = [...allProducts]; // Start with all products
    
    // Generate structured data for products
    generateStructuredData(allProducts);
    
    updateProductDisplay();
    updateResultsCount();
    
    // Set up event listeners for search and filters
    setupEventListeners();
}

// Create product element
function createProductElement(product) {
    const div = document.createElement('div');
    div.className = 'product-card animate-fade-in';
    div.dataset.category = product.category || 'Other';
    
    // Calculate discounted price if there's an offer
    const originalPrice = product.price;
    let finalPrice = originalPrice;
    let offerBadge = '';
    
    if (product.offer && product.offer.active) {
        const discount = product.offer.discount || 0;
        finalPrice = originalPrice - (originalPrice * discount / 100);
        offerBadge = `
            <div class="offer-badge animate-pulse">
                <i class="fas fa-tag"></i> ${discount}% OFF
            </div>
        `;
    }
    
    div.innerHTML = `
        <img src="${product.image}" alt="${product.name}" class="product-image">
        ${offerBadge}
        <div class="product-info">
            <h3>${product.name}</h3>
            <p class="product-category">${product.category || 'Other'}</p>
            ${product.color ? `<p><i class="fas fa-palette"></i> Color: ${product.color}</p>` : ''}
            <div class="price-container">
                ${product.offer && product.offer.active ? 
                    `<p class="original-price"><i class="fas fa-tag"></i> Rs. ${originalPrice}</p>
                     <p class="discounted-price"><i class="fas fa-tag"></i> Rs. ${finalPrice}</p>` :
                    `<p><i class="fas fa-tag"></i> Rs. ${originalPrice}</p>`
                }
            </div>
            ${product.offer && product.offer.active && product.offer.validUntil ? 
                `<p class="offer-validity"><i class="fas fa-clock"></i> Offer valid until ${new Date(product.offer.validUntil).toLocaleDateString()}</p>` : 
                ''
            }
            <div class="availability-overlay ${product.available ? 'available' : 'unavailable'}">
                ${product.available ? '<i class="fas fa-check"></i> Available' : '<i class="fas fa-times"></i> Not Available'}
            </div>
            <div class="product-buttons">
                <button class="action-btn view-btn" onclick="viewProduct('${product.id}')">
                    <i class="fas fa-eye"></i> View Details
                </button>
                <button class="whatsapp-btn" onclick="sendToWhatsApp('${product.name}', '${finalPrice}')">
                    <i class="fab fa-whatsapp"></i> Inquire on WhatsApp
                </button>
            </div>
        </div>
    `;

    return div;
}

// Filter products by category
function filterByCategory(category) {
    currentCategory = category;
    applyFilters();
}

// Filter products by search term
function filterBySearch(term) {
    searchTerm = term.toLowerCase().trim();
    applyFilters();
}

// Apply all filters
function applyFilters() {
    // Start with all products
    filteredProducts = [...allProducts];
    
    // Apply category filter if not 'all'
    if (currentCategory !== 'all') {
        filteredProducts = filteredProducts.filter(product => 
            product.category === currentCategory
        );
    }
    
    // Apply search filter if search term exists
    if (searchTerm) {
        filteredProducts = filteredProducts.filter(product => 
            product.name.toLowerCase().includes(searchTerm) || 
            (product.category && product.category.toLowerCase().includes(searchTerm)) ||
            (product.color && product.color.toLowerCase().includes(searchTerm))
        );
    }
    
    updateProductDisplay();
    updateResultsCount();
}

// Update the product display
function updateProductDisplay() {
    const productsContainer = document.getElementById('productsContainer');
    const noResults = document.getElementById('noResults');
    
    productsContainer.innerHTML = ''; // Clear existing products
    
    if (filteredProducts.length === 0) {
        noResults.style.display = 'block';
    } else {
        noResults.style.display = 'none';
        
        filteredProducts.forEach(product => {
            const productElement = createProductElement(product);
            productsContainer.appendChild(productElement);
        });
    }
}

// Update results count
function updateResultsCount() {
    const resultsCount = document.getElementById('resultsCount');
    if (resultsCount) {
        if (filteredProducts.length === 0) {
            resultsCount.textContent = 'No products found';
        } else {
            resultsCount.textContent = `Showing ${filteredProducts.length} product${filteredProducts.length !== 1 ? 's' : ''}`;
        }
    }
}

// Set up event listeners
function setupEventListeners() {
    // Search functionality
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchBtn');
    
    if (searchInput && searchBtn) {
        searchBtn.addEventListener('click', () => {
            filterBySearch(searchInput.value);
        });
        
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                filterBySearch(searchInput.value);
            }
        });
    }
    
    // Category filter buttons
    const filterBtns = document.querySelectorAll('.filter-btn');
    
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active class from all buttons
            filterBtns.forEach(b => b.classList.remove('active'));
            
            // Add active class to clicked button
            btn.classList.add('active');
            
            // Apply category filter
            filterByCategory(btn.dataset.category);
        });
    });
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadProducts();
});

// Display products in the grid
function displayProducts() {
    productsContainer.innerHTML = '';
    
    products.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = 'product-card';
        
        const hasOffer = product.offer && new Date(product.offer.validUntil) > new Date();
        const finalPrice = hasOffer ? calculateDiscountedPrice(product.price, product.offer.discount) : product.price;
        
        productCard.innerHTML = `
            <div class="product-image">
                <img src="${product.image}" alt="${product.name}">
                ${hasOffer ? `<div class="offer-badge">${product.offer.discount}% OFF</div>` : ''}
            </div>
            <div class="product-info">
                <h3>${product.name}</h3>
                <p class="category">${product.category}</p>
                <div class="price-container">
                    <span class="price">₹${finalPrice}</span>
                    ${hasOffer ? `<span class="original-price">₹${product.price}</span>` : ''}
                </div>
                <p class="availability ${product.available ? 'available' : 'unavailable'}">
                    ${product.available ? 'In Stock' : 'Out of Stock'}
                </p>
            </div>
            <div class="product-actions">
                <button class="action-btn view-btn" onclick="viewProduct('${product.id}')">
                    <i class="fas fa-eye"></i> View Details
                </button>
            </div>
        `;
        
        productsContainer.appendChild(productCard);
    });
}

// Function to send WhatsApp message
function sendToWhatsApp(name, price) {
    // WhatsApp number (replace with your number)
    const whatsappNumber = '94757997430';
    
    // Create the message
    const message = `I'm interested in this product:%0A%0A*Product Name:* ${name}%0A*Price:* Rs. ${price}%0A%0ACould you please provide more details?`;
    
    // Create WhatsApp link and open it
    window.open(`https://wa.me/${whatsappNumber}?text=${message}`, '_blank');
}

// Function to generate structured data for products
function generateStructuredData(products) {
    const structuredData = {
        "@context": "https://schema.org",
        "@type": "ItemList",
        "itemListElement": products.map((product, index) => ({
            "@type": "ListItem",
            "position": index + 1,
            "item": {
                "@type": "Product",
                "name": product.name,
                "description": product.description || `${product.name} - ${product.category}`,
                "image": product.image,
                "offers": {
                    "@type": "Offer",
                    "price": product.price,
                    "priceCurrency": "LKR",
                    "availability": product.available ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
                    "priceValidUntil": product.offer && product.offer.validUntil ? product.offer.validUntil : null
                },
                "category": product.category
            }
        }))
    };

    // Add structured data to the page
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(structuredData);
    document.head.appendChild(script);
}

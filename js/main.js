// Store products in localStorage for demo purposes
// In a real application, this would come from a backend server
if (!localStorage.getItem('products')) {
    const initialProducts = [
        {
            id: 1,
            name: 'Sample Product 1',
            category: 'Clothing',
            price: 2999,
            color: 'Blue',
            available: true,
            image: 'https://via.placeholder.com/300'
        },
        {
            id: 2,
            name: 'Sample Product 2',
            category: 'Accessories',
            price: 3999,
            color: 'Red',
            available: false,
            image: 'https://via.placeholder.com/300'
        },
        {
            id: 3,
            name: 'Sample Product 3',
            category: 'Jewelry',
            price: 4999,
            color: 'Gold',
            available: true,
            image: 'https://via.placeholder.com/300'
        }
    ];
    localStorage.setItem('products', JSON.stringify(initialProducts));
}

// Load featured products on the homepage
function loadFeaturedProducts() {
    const productsContainer = document.getElementById('featuredProducts');
    if (!productsContainer) return;

    const products = JSON.parse(localStorage.getItem('products')) || [];
    const featuredProducts = products.slice(0, 3); // Show only first 3 products

    featuredProducts.forEach(product => {
        const productElement = createProductElement(product);
        productsContainer.appendChild(productElement);
    });
}

// Create product element
function createProductElement(product) {
    const div = document.createElement('div');
    div.className = 'product-card';
    
    div.innerHTML = `
        <img src="${product.image}" alt="${product.name}" class="product-image">
        <div class="product-info">
            <h3>${product.name}</h3>
            ${product.category ? `<p class="product-category">${product.category}</p>` : ''}
            ${product.color ? `<p>Color: ${product.color}</p>` : ''}
            <p>Price: Rs. ${product.price}</p>
            <div class="availability-overlay ${product.available ? 'available' : 'unavailable'}">
                ${product.available ? 'Available' : 'Not Available'}
            </div>
            <a href="products.html" class="view-product-btn">
                <i class="fas fa-eye"></i> View Details
            </a>
            <div class="product-details" style="display:none;">
                <span class="product-name">${product.name}</span>
                <span class="product-price">${product.price}</span>
                <span class="product-category">${product.category}</span>
                <span class="product-color">${product.color}</span>
            </div>
        </div>
    `;

    return div;
}

// Function to send inquiry to website chat
function sendToChat(name, price, category, color) {
    // Create the inquiry message
    const message = `DETAILS PLEASE: ${name}\nPrice: Rs. ${price}\nCategory: ${category}\nColor: ${color}`;
    
    // Store the message in localStorage to be picked up by the chat page
    const inquiry = {
        productName: name,
        price: price,
        category: category,
        color: color,
        message: message,
        timestamp: Date.now()
    };
    
    localStorage.setItem('pendingInquiry', JSON.stringify(inquiry));
    
    // Redirect to the messages page
    window.location.href = 'messages.html';
}

// Handle newsletter form submission
function handleNewsletterSubmit(e) {
    e.preventDefault();
    const emailInput = e.target.querySelector('input[type="email"]');
    const email = emailInput.value.trim();
    
    if (email) {
        // In a real application, this would send the email to a server
        // For now, we'll just show an alert
        alert(`Thank you for subscribing with ${email}! You'll receive updates soon.`);
        emailInput.value = '';
    }
}

// Mobile menu toggle
function setupMobileMenu() {
    const menuToggle = document.querySelector('.mobile-menu-toggle') || document.createElement('button');
    const navbar = document.querySelector('.navbar-links');
    
    // If menu toggle doesn't exist yet, create it
    if (!document.querySelector('.mobile-menu-toggle')) {
        menuToggle.className = 'mobile-menu-toggle';
        menuToggle.innerHTML = '<i class="fas fa-bars"></i>';
        const navContainer = document.querySelector('.navbar');
        if (navContainer) {
            navContainer.appendChild(menuToggle);
        }
    }
    
    // Add event listener
    menuToggle.addEventListener('click', () => {
        navbar.classList.toggle('active');
        // Change icon based on state
        const icon = menuToggle.querySelector('i');
        if (icon) {
            if (navbar.classList.contains('active')) {
                icon.className = 'fas fa-times';
            } else {
                icon.className = 'fas fa-bars';
            }
        }
    });
    
    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.navbar') && navbar.classList.contains('active')) {
            navbar.classList.remove('active');
            const icon = menuToggle.querySelector('i');
            if (icon) {
                icon.className = 'fas fa-bars';
            }
        }
    });
}

// Handle window resize for responsive behavior
function handleResize() {
    const width = window.innerWidth;
    const navbar = document.querySelector('.navbar-links');
    
    if (width > 768 && navbar) {
        navbar.classList.remove('active');
        const icon = document.querySelector('.mobile-menu-toggle i');
        if (icon) {
            icon.className = 'fas fa-bars';
        }
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadFeaturedProducts();
    setupMobileMenu();
    
    // Set up newsletter form
    const newsletterForm = document.getElementById('newsletterForm');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', handleNewsletterSubmit);
    }
    
    // Add resize listener
    window.addEventListener('resize', handleResize);
});

// Global variables
let products = [];

// DOM Elements
const productsContainer = document.getElementById('productsContainer');

// Load products from localStorage
function loadProducts() {
    const storedProducts = localStorage.getItem('products');
    if (storedProducts) {
        products = JSON.parse(storedProducts);
        displayProducts();
    }
}

// Display products in the grid
function displayProducts() {
    productsContainer.innerHTML = '';
    
    products.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = 'admin-product-card';
        
        productCard.innerHTML = `
            <div class="product-image">
                <img src="${product.image}" alt="${product.name}">
            </div>
            <div class="product-info">
                <h3>${product.name}</h3>
                <p class="category">${product.category}</p>
                <div class="price-container">
                    <span class="price">₹${product.price}</span>
                </div>
                <p class="availability ${product.available ? 'available' : 'unavailable'}">
                    ${product.available ? 'In Stock' : 'Out of Stock'}
                </p>
            </div>
            <div class="product-actions">
                <button class="action-btn edit-btn" onclick="editProduct('${product.id}')">
                    <i class="fas fa-edit"></i> Edit
                </button>
                <button class="action-btn delete-btn" onclick="deleteProduct('${product.id}')">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </div>
        `;
        
        productsContainer.appendChild(productCard);
    });
}

// Edit product
function editProduct(productId) {
    // Implement edit product functionality
    console.log('Edit product:', productId);
}

// Delete product
function deleteProduct(productId) {
    if (confirm('Are you sure you want to delete this product?')) {
        products = products.filter(p => p.id !== productId);
        localStorage.setItem('products', JSON.stringify(products));
        displayProducts();
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', loadProducts); 
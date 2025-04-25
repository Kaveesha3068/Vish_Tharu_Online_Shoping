// Check if admin is logged in
function checkAuth() {
    if (!sessionStorage.getItem('adminLoggedIn')) {
        window.location.href = 'login.html';
    }
}

// Load all products
function loadProducts() {
    const productsList = document.getElementById('productsList');
    const products = JSON.parse(localStorage.getItem('products')) || [];
    
    productsList.innerHTML = '';
    
    products.forEach(product => {
        const div = document.createElement('div');
        div.className = 'product-card';
        
        div.innerHTML = `
            <img src="${product.image}" alt="${product.name}" class="product-image">
            <div class="product-info">
                <h3>${product.name}</h3>
                <p>Category: ${product.category}</p>
                <p>Color: ${product.color}</p>
                <p>Price: Rs. ${product.price}</p>
                <p>Available: ${product.available ? 'Yes' : 'No'}</p>
                <button onclick="editProduct(${product.id})" class="btn-primary">Edit</button>
                <button onclick="deleteProduct(${product.id})" class="btn-secondary">Delete</button>
            </div>
        `;
        
        productsList.appendChild(div);
    });
}

// Show/hide product form
function toggleProductForm(show = true) {
    document.getElementById('productForm').style.display = show ? 'block' : 'none';
}

// Handle image preview
document.getElementById('productImage').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        const preview = document.getElementById('imagePreview');
        
        reader.onload = function(e) {
            preview.src = e.target.result;
            preview.style.display = 'block';
        };
        
        reader.readAsDataURL(file);
    }
});

// Add new product
function addProduct(formData) {
    const products = JSON.parse(localStorage.getItem('products')) || [];
    const newProduct = {
        id: Date.now(), // Use timestamp as ID
        name: formData.name,
        category: formData.category,
        price: parseFloat(formData.price),
        color: formData.color,
        available: formData.available === 'true',
        image: formData.imageData // Base64 image data
    };
    
    products.push(newProduct);
    localStorage.setItem('products', JSON.stringify(products));
    loadProducts();
}

// Edit product
function editProduct(productId) {
    const products = JSON.parse(localStorage.getItem('products')) || [];
    const product = products.find(p => p.id === productId);
    
    if (product) {
        document.getElementById('productName').value = product.name;
        document.getElementById('productCategory').value = product.category;
        document.getElementById('productPrice').value = product.price;
        document.getElementById('productColor').value = product.color;
        document.getElementById('productAvailable').value = product.available;
        
        // Show existing image preview
        const imagePreview = document.getElementById('imagePreview');
        imagePreview.src = product.image;
        imagePreview.style.display = 'block';
        
        // Store editing product ID
        document.getElementById('productManageForm').dataset.editingId = productId;
        
        toggleProductForm(true);
    }
}

// Delete product
function deleteProduct(productId) {
    if (confirm('Are you sure you want to delete this product?')) {
        const products = JSON.parse(localStorage.getItem('products')) || [];
        const filteredProducts = products.filter(p => p.id !== productId);
        localStorage.setItem('products', JSON.stringify(filteredProducts));
        loadProducts();
    }
}

// Handle product form submission
document.getElementById('productManageForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const imagePreview = document.getElementById('imagePreview');
    const formData = {
        name: document.getElementById('productName').value,
        category: document.getElementById('productCategory').value,
        price: document.getElementById('productPrice').value,
        color: document.getElementById('productColor').value,
        available: document.getElementById('productAvailable').value,
        imageData: imagePreview.style.display !== 'none' ? imagePreview.src : ''
    };
    
    if (!formData.imageData) {
        alert('Please select an image');
        return;
    }
    
    const editingId = this.dataset.editingId;
    
    if (editingId) {
        // Update existing product
        const products = JSON.parse(localStorage.getItem('products')) || [];
        const index = products.findIndex(p => p.id === parseInt(editingId));
        
        if (index !== -1) {
            products[index] = {
                ...products[index],
                ...formData
            };
            localStorage.setItem('products', JSON.stringify(products));
        }
        
        delete this.dataset.editingId;
    } else {
        // Add new product
        addProduct(formData);
    }
    
    this.reset();
    document.getElementById('imagePreview').style.display = 'none';
    toggleProductForm(false);
    loadProducts();
});

// Simple hash function for security (same as in login.js)
function hashPassword(password, salt) {
    let hash = 0;
    const combinedString = password + salt;
    
    for (let i = 0; i < combinedString.length; i++) {
        const char = combinedString.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
    }
    
    return hash.toString(16); // Convert to hex string
}

// Handle credential changes
document.getElementById('changeCredentialsForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const newUsername = document.getElementById('newUsername').value.trim();
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    // Basic validation
    if (!newUsername || !newPassword) {
        alert('Username and password cannot be empty');
        return;
    }
    
    if (newPassword !== confirmPassword) {
        alert('Passwords do not match!');
        return;
    }
    
    // Generate a new salt
    const salt = Math.random().toString(36).substring(2, 15);
    
    // Create new credentials with hashed password
    const credentials = {
        username: newUsername,
        password: hashPassword(newPassword, salt),
        salt: salt
    };
    
    localStorage.setItem('adminCredentials', JSON.stringify(credentials));
    alert('Credentials updated successfully!');
    document.getElementById('credentialsModal').style.display = 'none';
    
    // Clear the form
    document.getElementById('newUsername').value = '';
    document.getElementById('newPassword').value = '';
    document.getElementById('confirmPassword').value = '';
});

// UI Event Listeners
document.getElementById('addProductBtn').addEventListener('click', () => toggleProductForm(true));
document.getElementById('cancelProductBtn').addEventListener('click', () => toggleProductForm(false));
document.getElementById('changeCredentials').addEventListener('click', () => {
    document.getElementById('credentialsModal').style.display = 'flex';
});
document.getElementById('closeCredentialsModal').addEventListener('click', () => {
    document.getElementById('credentialsModal').style.display = 'none';
});
document.getElementById('logoutBtn').addEventListener('click', () => {
    sessionStorage.removeItem('adminLoggedIn');
    window.location.href = 'login.html';
});

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    loadProducts();
});

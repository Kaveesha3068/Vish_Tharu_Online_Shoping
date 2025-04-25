// Simple hash function for security
function hashPassword(password, salt) {
    // In a real application, use a proper crypto library
    // This is a simple implementation for demonstration
    let hash = 0;
    const combinedString = password + salt;
    
    for (let i = 0; i < combinedString.length; i++) {
        const char = combinedString.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
    }
    
    return hash.toString(16); // Convert to hex string
}

// Set default admin credentials if not exists
if (!localStorage.getItem('adminCredentials')) {
    // Generate a random salt
    const salt = Math.random().toString(36).substring(2, 15);
    
    const defaultCredentials = {
        username: 'admin',
        // Store hashed password
        password: hashPassword('admin', salt),
        salt: salt
    };
    localStorage.setItem('adminCredentials', JSON.stringify(defaultCredentials));
}

// Handle login form submission
document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const now = Date.now();
    
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;
    
    // Basic input validation
    if (!username || !password) {
        alert('Please enter both username and password');
        return;
    }
    
    // Check if admin credentials exist in localStorage
    const storedCredentials = localStorage.getItem('adminCredentials');
    
    // Allow admin/admin login only if no credentials are stored or as a fallback
    if (username === 'admin' && password === 'admin' && (!storedCredentials || storedCredentials === 'null')) {
        console.log('Using default admin credentials');
        // Set admin session with expiration time (2 hours)
        const sessionData = {
            loggedIn: true,
            expires: now + (2 * 60 * 60 * 1000) // 2 hours
        };
        sessionStorage.setItem('adminLoggedIn', JSON.stringify(sessionData));
        
        // Set default credentials
        const salt = Math.random().toString(36).substring(2, 15);
        const defaultCredentials = {
            username: 'admin',
            password: hashPassword('admin', salt),
            salt: salt
        };
        localStorage.setItem('adminCredentials', JSON.stringify(defaultCredentials));
        
        // Redirect to dashboard
        window.location.href = 'dashboard.html';
        return;
    }
    
    // Check stored credentials
    try {
        const adminCredentials = JSON.parse(localStorage.getItem('adminCredentials'));
        
        if (!adminCredentials || !adminCredentials.salt) {
            throw new Error('Invalid credentials format');
        }
        
        // Hash the provided password with the stored salt
        const hashedPassword = hashPassword(password, adminCredentials.salt);
        
        if (username === adminCredentials.username && hashedPassword === adminCredentials.password) {
            // Set admin session with expiration time (2 hours)
            const sessionData = {
                loggedIn: true,
                expires: now + (2 * 60 * 60 * 1000) // 2 hours
            };
            sessionStorage.setItem('adminLoggedIn', JSON.stringify(sessionData));
            
            // Redirect to dashboard
            window.location.href = 'dashboard.html';
        } else {
            // Simple error message
            alert('Invalid username or password. Please try again.');
        }
    } catch (error) {
        console.error('Error during login:', error);
        
        // Reset to default credentials
        const salt = Math.random().toString(36).substring(2, 15);
        const defaultCredentials = {
            username: 'admin',
            password: hashPassword('admin', salt),
            salt: salt
        };
        localStorage.setItem('adminCredentials', JSON.stringify(defaultCredentials));
        
        alert('Login system has been reset. Please try again with username: admin, password: admin');
    }
});

/**
 * Performance and Security Optimization Module
 * This module provides utilities to improve website performance and security
 */

// Performance monitoring
const Performance = {
    // Store timing metrics
    metrics: {},
    
    // Start timing a specific operation
    startMeasure: function(label) {
        this.metrics[label] = {
            start: performance.now()
        };
    },
    
    // End timing and calculate duration
    endMeasure: function(label) {
        if (!this.metrics[label]) return null;
        
        this.metrics[label].end = performance.now();
        this.metrics[label].duration = this.metrics[label].end - this.metrics[label].start;
        
        return this.metrics[label].duration;
    },
    
    // Get all performance metrics
    getAllMetrics: function() {
        return this.metrics;
    },
    
    // Clear all metrics
    clearMetrics: function() {
        this.metrics = {};
    }
};

// Resource loading optimization
const ResourceLoader = {
    // Cache for loaded resources
    cache: {},
    
    // Preload critical resources
    preload: function(resources) {
        resources.forEach(resource => {
            if (resource.type === 'image') {
                const img = new Image();
                img.src = resource.url;
                this.cache[resource.url] = img;
            } else if (resource.type === 'script') {
                const script = document.createElement('script');
                script.src = resource.url;
                script.async = true;
                document.head.appendChild(script);
            }
        });
    },
    
    // Lazy load non-critical resources
    lazyLoad: function(selector) {
        // Use Intersection Observer to load resources when they come into view
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const element = entry.target;
                    
                    if (element.tagName === 'IMG') {
                        element.src = element.dataset.src;
                    } else if (element.dataset.background) {
                        element.style.backgroundImage = `url(${element.dataset.background})`;
                    }
                    
                    // Stop observing once loaded
                    observer.unobserve(element);
                }
            });
        });
        
        // Start observing elements
        document.querySelectorAll(selector).forEach(element => {
            observer.observe(element);
        });
    }
};

// Security utilities
const Security = {
    // Encryption key storage
    encryptionKey: null,
    
    // Initialize encryption system
    initEncryption: function() {
        // Check if we already have a key in localStorage
        const storedKey = localStorage.getItem('encryptionKey');
        if (storedKey) {
            this.encryptionKey = storedKey;
            return Promise.resolve(storedKey);
        }
        
        // Generate a new encryption key
        return window.crypto.subtle.generateKey(
            {
                name: "AES-GCM",
                length: 256
            },
            true, // extractable
            ["encrypt", "decrypt"]
        )
        .then(key => {
            // Export the key to raw format
            return window.crypto.subtle.exportKey("raw", key);
        })
        .then(keyData => {
            // Convert to base64 for storage
            const keyBase64 = btoa(String.fromCharCode.apply(null, new Uint8Array(keyData)));
            localStorage.setItem('encryptionKey', keyBase64);
            this.encryptionKey = keyBase64;
            return keyBase64;
        })
        .catch(error => {
            console.error('Encryption initialization failed:', error);
            // Fallback to a simple key for demo purposes
            const fallbackKey = this.generateToken(32);
            localStorage.setItem('encryptionKey', fallbackKey);
            this.encryptionKey = fallbackKey;
            return fallbackKey;
        });
    },
    
    // Encrypt message
    encryptMessage: function(message) {
        if (!message) return '';
        if (!this.encryptionKey) {
            return Promise.reject('Encryption not initialized');
        }
        
        try {
            // For modern browsers with Web Crypto API
            if (window.crypto && window.crypto.subtle) {
                // Create an initialization vector
                const iv = window.crypto.getRandomValues(new Uint8Array(12));
                
                // Convert the key from base64
                const keyData = Uint8Array.from(atob(this.encryptionKey), c => c.charCodeAt(0));
                
                // Import the key
                return window.crypto.subtle.importKey(
                    "raw",
                    keyData,
                    { name: "AES-GCM", length: 256 },
                    false,
                    ["encrypt"]
                )
                .then(key => {
                    // Encode the message
                    const encodedMessage = new TextEncoder().encode(message);
                    
                    // Encrypt the message
                    return window.crypto.subtle.encrypt(
                        {
                            name: "AES-GCM",
                            iv: iv
                        },
                        key,
                        encodedMessage
                    );
                })
                .then(encryptedData => {
                    // Combine the IV and encrypted data
                    const encryptedArray = new Uint8Array(iv.byteLength + encryptedData.byteLength);
                    encryptedArray.set(iv, 0);
                    encryptedArray.set(new Uint8Array(encryptedData), iv.byteLength);
                    
                    // Convert to base64 for storage/transmission
                    return btoa(String.fromCharCode.apply(null, encryptedArray));
                })
                .catch(error => {
                    console.error('Encryption failed:', error);
                    // Fallback to simple encryption for demo
                    return this.simpleEncrypt(message);
                });
            } else {
                // Fallback for browsers without Web Crypto API
                return Promise.resolve(this.simpleEncrypt(message));
            }
        } catch (error) {
            console.error('Encryption error:', error);
            return Promise.resolve(this.simpleEncrypt(message));
        }
    },
    
    // Decrypt message
    decryptMessage: function(encryptedMessage) {
        if (!encryptedMessage) return '';
        if (!this.encryptionKey) {
            return Promise.reject('Encryption not initialized');
        }
        
        try {
            // For modern browsers with Web Crypto API
            if (window.crypto && window.crypto.subtle) {
                // Convert from base64
                const encryptedData = Uint8Array.from(atob(encryptedMessage), c => c.charCodeAt(0));
                
                // Extract IV (first 12 bytes)
                const iv = encryptedData.slice(0, 12);
                const ciphertext = encryptedData.slice(12);
                
                // Convert the key from base64
                const keyData = Uint8Array.from(atob(this.encryptionKey), c => c.charCodeAt(0));
                
                // Import the key
                return window.crypto.subtle.importKey(
                    "raw",
                    keyData,
                    { name: "AES-GCM", length: 256 },
                    false,
                    ["decrypt"]
                )
                .then(key => {
                    // Decrypt the message
                    return window.crypto.subtle.decrypt(
                        {
                            name: "AES-GCM",
                            iv: iv
                        },
                        key,
                        ciphertext
                    );
                })
                .then(decryptedData => {
                    // Decode the message
                    return new TextDecoder().decode(decryptedData);
                })
                .catch(error => {
                    console.error('Decryption failed:', error);
                    // Fallback to simple decryption for demo
                    return this.simpleDecrypt(encryptedMessage);
                });
            } else {
                // Fallback for browsers without Web Crypto API
                return Promise.resolve(this.simpleDecrypt(encryptedMessage));
            }
        } catch (error) {
            console.error('Decryption error:', error);
            return Promise.resolve(this.simpleDecrypt(encryptedMessage));
        }
    },
    
    // Simple encryption fallback (for demo purposes only)
    simpleEncrypt: function(message) {
        if (!this.encryptionKey) return message;
        
        let result = '';
        for (let i = 0; i < message.length; i++) {
            const charCode = message.charCodeAt(i) ^ this.encryptionKey.charCodeAt(i % this.encryptionKey.length);
            result += String.fromCharCode(charCode);
        }
        return btoa(result);
    },
    
    // Simple decryption fallback (for demo purposes only)
    simpleDecrypt: function(encryptedMessage) {
        if (!this.encryptionKey) return encryptedMessage;
        
        try {
            const decoded = atob(encryptedMessage);
            let result = '';
            for (let i = 0; i < decoded.length; i++) {
                const charCode = decoded.charCodeAt(i) ^ this.encryptionKey.charCodeAt(i % this.encryptionKey.length);
                result += String.fromCharCode(charCode);
            }
            return result;
        } catch (error) {
            console.error('Simple decryption failed:', error);
            return encryptedMessage;
        }
    },
    
    // Sanitize user input to prevent XSS
    sanitizeInput: function(input) {
        if (!input) return '';
        
        return input
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    },
    
    // Validate input based on type
    validateInput: function(input, type) {
        if (!input) return false;
        
        switch(type) {
            case 'email':
                return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input);
            case 'phone':
                return /^\+?[0-9]{10,15}$/.test(input);
            case 'text':
                return input.length > 0 && input.length < 500;
            default:
                return true;
        }
    },
    
    // Generate a secure random token
    generateToken: function(length = 32) {
        const array = new Uint8Array(length);
        window.crypto.getRandomValues(array);
        return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
    }
};

// Cache management
const CacheManager = {
    // Set item with expiration
    setWithExpiry: function(key, value, ttl) {
        const item = {
            value: value,
            expiry: Date.now() + ttl
        };
        localStorage.setItem(key, JSON.stringify(item));
    },
    
    // Get item and check expiration
    getWithExpiry: function(key) {
        const itemStr = localStorage.getItem(key);
        if (!itemStr) return null;
        
        const item = JSON.parse(itemStr);
        if (Date.now() > item.expiry) {
            localStorage.removeItem(key);
            return null;
        }
        
        return item.value;
    },
    
    // Clear all expired items
    clearExpired: function() {
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            this.getWithExpiry(key); // Will auto-remove if expired
        }
    }
};

// Export all utilities
window.VTPerformance = {
    Performance,
    ResourceLoader,
    Security,
    CacheManager
};

// Initialize performance optimizations
document.addEventListener('DOMContentLoaded', function() {
    // Clear expired cache items
    CacheManager.clearExpired();
    
    // Setup lazy loading for images
    ResourceLoader.lazyLoad('img[data-src], [data-background]');
    
    // Preload critical resources
    ResourceLoader.preload([
        { type: 'image', url: 'images/logo.png' },
        { type: 'image', url: 'images/about-shop.jpg' }
    ]);
    
    // Start measuring page load performance
    Performance.startMeasure('pageLoad');
    
    window.addEventListener('load', function() {
        const loadTime = Performance.endMeasure('pageLoad');
        console.log(`Page loaded in ${loadTime.toFixed(2)}ms`);
    });
});

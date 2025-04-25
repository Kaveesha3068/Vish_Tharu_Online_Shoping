// Global variables
let conversations = [];
let currentConversationId = null;
let searchTerm = '';

// Check if admin is logged in
function checkAuth() {
    const adminSession = sessionStorage.getItem('adminLoggedIn');
    
    if (!adminSession) {
        window.location.href = 'login.html';
        return;
    }
    
    try {
        const sessionData = JSON.parse(adminSession);
        const now = Date.now();
        
        // Check if session is expired
        if (!sessionData.loggedIn || sessionData.expires < now) {
            // Clear expired session
            sessionStorage.removeItem('adminLoggedIn');
            window.location.href = 'login.html';
        }
    } catch (error) {
        // Invalid session format, redirect to login
        sessionStorage.removeItem('adminLoggedIn');
        window.location.href = 'login.html';
    }
}

// Initialize the admin messaging system
function initAdminMessaging() {
    checkAuth();
    
    // Load conversations from local storage
    loadConversations();
    
    // Set up event listeners
    setupEventListeners();
    
    // Clean old messages on startup
    cleanOldMessages();
    
    // Set up periodic cleanup every hour
    setInterval(cleanOldMessages, 60 * 60 * 1000);
}

// Load conversations from local storage
function loadConversations() {
    conversations = JSON.parse(localStorage.getItem('conversations')) || [];
    updateConversationsCount();
    renderConversationList();
}

// Update the conversations count
function updateConversationsCount() {
    const conversationsCount = document.getElementById('conversationsCount');
    if (conversationsCount) {
        conversationsCount.textContent = conversations.length;
    }
}

// Render the conversation list
function renderConversationList() {
    const conversationList = document.getElementById('adminConversationList');
    const emptyConversations = document.getElementById('emptyAdminConversations');
    
    if (conversations.length === 0) {
        emptyConversations.style.display = 'flex';
        return;
    }
    
    emptyConversations.style.display = 'none';
    conversationList.innerHTML = '';
    
    // Sort conversations by last message time (newest first)
    conversations.sort((a, b) => {
        const aTime = a.messages.length > 0 ? a.messages[a.messages.length - 1].timestamp : a.createdAt;
        const bTime = b.messages.length > 0 ? b.messages[b.messages.length - 1].timestamp : b.createdAt;
        return bTime - aTime;
    });
    
    // Filter conversations by search term if any
    const filteredConversations = searchTerm 
        ? conversations.filter(conversation => {
            // Check if any message content matches the search term
            return conversation.messages.some(message => 
                message.content.toLowerCase().includes(searchTerm.toLowerCase())
            );
        })
        : conversations;
    
    filteredConversations.forEach(conversation => {
        const lastMessage = conversation.messages.length > 0 
            ? conversation.messages[conversation.messages.length - 1] 
            : { content: 'New conversation', sender: 'system' };
        
        const userName = localStorage.getItem('userName') || 'Guest';
        
        const div = document.createElement('div');
        div.className = `conversation-item ${conversation.id === currentConversationId ? 'active' : ''}`;
        div.dataset.id = conversation.id;
        
        // Check for unread messages from user
        const hasUnreadMessages = conversation.messages.some(
            message => message.sender === 'user' && !message.read
        );
        
        div.innerHTML = `
            <div class="conversation-name">
                ${userName} ${hasUnreadMessages ? '<span class="unread-badge">New</span>' : ''}
            </div>
            <div class="conversation-preview">${lastMessage.sender === 'user' ? `${userName}: ` : 'You: '}${lastMessage.content}</div>
            <div class="conversation-time">${formatTime(lastMessage.timestamp || conversation.createdAt)}</div>
        `;
        
        div.addEventListener('click', () => {
            openConversation(conversation.id);
        });
        
        conversationList.appendChild(div);
    });
}

// Format timestamp to readable time
function formatTime(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    
    // If today, show time only
    if (date.toDateString() === now.toDateString()) {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    
    // If this year, show month and day
    if (date.getFullYear() === now.getFullYear()) {
        return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
    
    // Otherwise show full date
    return date.toLocaleDateString([], { year: 'numeric', month: 'short', day: 'numeric' });
}

// Open a conversation
function openConversation(conversationId) {
    currentConversationId = conversationId;
    
    // Update UI
    const welcomeMessage = document.getElementById('adminWelcomeMessage');
    const conversationView = document.getElementById('adminConversationView');
    
    welcomeMessage.style.display = 'none';
    conversationView.style.display = 'flex';
    
    // Update active conversation in list
    document.querySelectorAll('.conversation-item').forEach(item => {
        item.classList.toggle('active', item.dataset.id === conversationId);
    });
    
    // Load messages
    const conversation = conversations.find(c => c.id === conversationId);
    if (conversation) {
        // Update conversation header
        const conversationHeader = document.getElementById('adminConversationHeader');
        const conversationDate = document.getElementById('conversationDate');
        
        const userName = localStorage.getItem('userName') || 'Guest';
        conversationHeader.querySelector('h3').textContent = userName;
        conversationDate.textContent = `Started ${formatTime(conversation.createdAt)}`;
        
        // Mark all user messages as read
        conversation.messages.forEach(message => {
            if (message.sender === 'user') {
                message.read = true;
            }
        });
        
        // Save changes
        saveConversations();
        
        // Render messages
        renderMessages(conversation.messages);
        
        // Update conversation list to remove unread badges
        renderConversationList();
    }
}

// Render messages in the current conversation
function renderMessages(messages) {
    const messagesList = document.getElementById('adminMessagesList');
    messagesList.innerHTML = '';
    
    messages.forEach(message => {
        const div = document.createElement('div');
        div.className = `message ${message.sender === 'admin' ? 'outgoing' : 'incoming'}`;
        
        div.innerHTML = `
            <div class="message-sender">${message.sender === 'admin' ? 'You' : 'Client'}</div>
            <div class="message-content">${message.content}</div>
            <div class="message-time">${formatTime(message.timestamp)}</div>
            <div class="message-actions">
                <button onclick="deleteMessage('${currentConversationId}', '${message.id}')" class="delete-message-btn">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        
        messagesList.appendChild(div);
    });
    
    // Scroll to bottom
    messagesList.scrollTop = messagesList.scrollHeight;
    
    // Mark all messages as read
    if (messages.length > 0) {
        messages.forEach(message => message.read = true);
        saveConversations();
    }
}

// Delete a message
function deleteMessage(conversationId, messageId) {
    const conversation = conversations.find(c => c.id === conversationId);
    if (!conversation) return;
    
    // Remove the message
    conversation.messages = conversation.messages.filter(msg => msg.id !== messageId);
    
    // If no messages left, remove the conversation
    if (conversation.messages.length === 0) {
        conversations = conversations.filter(c => c.id !== conversationId);
        currentConversationId = null;
        
        // Update UI
        const conversationView = document.getElementById('adminConversationView');
        const welcomeMessage = document.getElementById('adminWelcomeMessage');
        if (conversationView) conversationView.style.display = 'none';
        if (welcomeMessage) welcomeMessage.style.display = 'flex';
    }
    
    // Save changes
    saveConversations();
    
    // Update UI
    if (currentConversationId === conversationId) {
        if (conversation.messages.length > 0) {
            renderMessages(conversation.messages);
        } else {
            const conversationView = document.getElementById('adminConversationView');
            const welcomeMessage = document.getElementById('adminWelcomeMessage');
            if (conversationView) conversationView.style.display = 'none';
            if (welcomeMessage) welcomeMessage.style.display = 'flex';
        }
    }
    
    // Update conversation list and count
    renderConversationList();
    updateConversationsCount();
}

// Clean old messages (older than 48 hours)
function cleanOldMessages() {
    const now = Date.now();
    const HOURS_48 = 48 * 60 * 60 * 1000; // 48 hours in milliseconds
    let conversationsUpdated = false;
    
    conversations.forEach(conversation => {
        const originalLength = conversation.messages.length;
        conversation.messages = conversation.messages.filter(message => {
            return (now - message.timestamp) <= HOURS_48;
        });
        
        if (conversation.messages.length !== originalLength) {
            conversationsUpdated = true;
        }
    });
    
    // Remove empty conversations
    const originalConversationsLength = conversations.length;
    conversations = conversations.filter(conversation => conversation.messages.length > 0);
    
    if (conversationsUpdated || conversations.length !== originalConversationsLength) {
        saveConversations();
        renderConversationList();
        updateConversationsCount();
        
        // If current conversation was affected
        if (currentConversationId) {
            const currentConversation = conversations.find(c => c.id === currentConversationId);
            if (!currentConversation) {
                currentConversationId = null;
                document.getElementById('conversationView').style.display = 'none';
                document.getElementById('welcomeMessage').style.display = 'flex';
            } else {
                renderMessages(currentConversation.messages);
            }
        }
    }
}

// Send a message as admin
function sendAdminMessage() {
    const messageInput = document.getElementById('adminMessageInput');
    const content = messageInput.value.trim();
    
    if (!content || !currentConversationId) return;
    
    const conversation = conversations.find(c => c.id === currentConversationId);
    if (!conversation) return;
    
    const newMessage = {
        id: Date.now().toString(),
        content: content,
        sender: 'admin',
        timestamp: Date.now(),
        read: true
    };
    
    conversation.messages.push(newMessage);
    saveConversations();
    
    // Clear input
    messageInput.value = '';
    
    // Update UI
    renderMessages(conversation.messages);
    renderConversationList();
}

// Save conversations to local storage
function saveConversations() {
    localStorage.setItem('conversations', JSON.stringify(conversations));
}

// Search conversations
function searchConversations() {
    const searchInput = document.getElementById('searchConversations');
    searchTerm = searchInput.value.trim();
    renderConversationList();
}

// Delete all messages in the current conversation
function deleteAllMessages() {
    if (!currentConversationId) return;
    
    const conversation = conversations.find(c => c.id === currentConversationId);
    if (!conversation) return;
    
    // Remove all messages
    conversation.messages = [];
    
    // Remove the conversation
    conversations = conversations.filter(c => c.id !== currentConversationId);
    currentConversationId = null;
    
    // Save changes
    saveConversations();
    
    // Update UI
    const conversationView = document.getElementById('adminConversationView');
    const welcomeMessage = document.getElementById('adminWelcomeMessage');
    if (conversationView) conversationView.style.display = 'none';
    if (welcomeMessage) welcomeMessage.style.display = 'flex';
    
    // Update conversation list and count
    renderConversationList();
    updateConversationsCount();
}

// Setup event listeners
function setupEventListeners() {
    // Send message button
    const sendMessageBtn = document.getElementById('adminSendMessageBtn');
    if (sendMessageBtn) {
        sendMessageBtn.addEventListener('click', sendAdminMessage);
    }
    
    // Send message on Enter key
    const messageInput = document.getElementById('adminMessageInput');
    if (messageInput) {
        messageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendAdminMessage();
            }
        });
    }
    
    // Search button
    const searchBtn = document.getElementById('searchBtn');
    if (searchBtn) {
        searchBtn.addEventListener('click', searchConversations);
    }
    
    // Search on Enter key
    const searchInput = document.getElementById('searchConversations');
    if (searchInput) {
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                searchConversations();
            }
        });
    }
    
    // Logout button
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            sessionStorage.removeItem('adminLoggedIn');
            window.location.href = 'login.html';
        });
    }
    
    // Change credentials button
    const changeCredentials = document.getElementById('changeCredentials');
    if (changeCredentials) {
        changeCredentials.addEventListener('click', () => {
            document.getElementById('credentialsModal').style.display = 'flex';
        });
    }
    
    // Close credentials modal button
    const closeCredentialsModal = document.getElementById('closeCredentialsModal');
    if (closeCredentialsModal) {
        closeCredentialsModal.addEventListener('click', () => {
            document.getElementById('credentialsModal').style.display = 'none';
        });
    }
    
    // Change credentials form
    const changeCredentialsForm = document.getElementById('changeCredentialsForm');
    if (changeCredentialsForm) {
        changeCredentialsForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const newUsername = document.getElementById('newUsername').value;
            const newPassword = document.getElementById('newPassword').value;
            const confirmPassword = document.getElementById('confirmPassword').value;
            
            if (newPassword !== confirmPassword) {
                alert('Passwords do not match!');
                return;
            }
            
            const credentials = {
                username: newUsername,
                password: newPassword
            };
            
            localStorage.setItem('adminCredentials', JSON.stringify(credentials));
            alert('Credentials updated successfully!');
            document.getElementById('credentialsModal').style.display = 'none';
        });
    }
    
    // Delete all messages button
    const deleteAllBtn = document.getElementById('deleteAllMessagesBtn');
    if (deleteAllBtn) {
        deleteAllBtn.addEventListener('click', () => {
            if (confirm('Are you sure you want to delete all messages in this conversation?')) {
                deleteAllMessages();
            }
        });
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', initAdminMessaging);

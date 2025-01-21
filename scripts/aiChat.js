// Get DOM elements
const chatMessages = document.getElementById('chat-messages');
const userInput = document.getElementById('user-input');
const sendButton = document.getElementById('send-button');

// Store message history
let messageHistory = [];

// API configuration
const API_KEY = 'your-api-key-here';  // Replace with your actual API key
const API_URL = 'https://api.anthropic.com/v1/messages';

// Initialize chat event listeners
function initializeChat() {
    sendButton.addEventListener('click', handleSendMessage);
    userInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleSendMessage();
        }
    });
}

// Handle sending messages
async function handleSendMessage() {
    const message = userInput.value.trim();
    
    if (!message) return;

    // Clear input field
    userInput.value = '';

    // Add user message to chat
    addMessageToChat('user', message);

    // Disable input while processing
    setLoadingState(true);

    try {
        const response = await sendMessageToAI(message);
        addMessageToChat('ai', response);
    } catch (error) {
        console.error('Error:', error);
        addMessageToChat('ai', 'Sorry, an error occurred. Please try again.');
    }

    // Re-enable input
    setLoadingState(false);
}

// Add message to chat display
function addMessageToChat(sender, content) {
    const messageElement = document.createElement('div');
    messageElement.className = `message ${sender}-message`;
    messageElement.textContent = content;
    
    chatMessages.appendChild(messageElement);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    
    // Add to history
    messageHistory.push({
        role: sender,
        content: content,
        timestamp: new Date().toISOString()
    });
}

// Send message to AI API
async function sendMessageToAI(message) {
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': API_KEY,
                'anthropic-version': '2023-06-01'
            },
            body: JSON.stringify({
                messages: [{
                    role: 'user',
                    content: message
                }],
                model: 'claude-3-sonnet-20240229',
                max_tokens: 1024
            })
        });

        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }

        const data = await response.json();
        return data.content[0].text;

    } catch (error) {
        console.error('API request failed:', error);
        throw error;
    }
}

// Set loading state
function setLoadingState(isLoading) {
    sendButton.disabled = isLoading;
    userInput.disabled = isLoading;
    sendButton.textContent = isLoading ? 'Sending...' : 'Send';
}

// Error handler function
function handleError(error) {
    console.error('Chat error:', error);
    addMessageToChat('ai', 'An error occurred. Please try again.');
    setLoadingState(false);
}

// Clear chat history
function clearChat() {
    chatMessages.innerHTML = '';
    messageHistory = [];
}

// Export chat history
function exportChatHistory() {
    return JSON.stringify(messageHistory, null, 2);
}

// Initialize the chat
document.addEventListener('DOMContentLoaded', initializeChat);

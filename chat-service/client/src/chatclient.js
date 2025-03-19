var socket = null;
var userListDiv = document.getElementById('user-list');
var userSelect = document.getElementById('user-select');
var chatUI = document.getElementById('chat-ui');
var mainUI = document.getElementById('main-menu');
// Buttons
var chatBtn = document.getElementById("chat");
var backBtn = document.getElementById("back-btn");
var chatBack = document.getElementById("chat-back");
var sendBtn = document.getElementById("send-btn");
// Chat UI elements
var messageInput = document.getElementById('message');
var chatMessages = document.getElementById('chat-messages');
var users = [];
var currentUser = null;
var unreadMessages = new Set();
var selectedChatUser = null;
function connectWebSocket() {
    if (socket)
        return;
    socket = new WebSocket('wss://localhost:3000');
    socket.onopen = function () { return console.log("WebSocket connected"); };
    socket.onmessage = function (event) {
        var data = JSON.parse(event.data);
        if (data.type === 'users' && data.users) {
            users = data.users.filter(function (user) { return user !== currentUser; }); // Exclude self
            updateUserList();
        }
        else if (data.type === 'message' && data.from) {
            if (data.from === selectedChatUser) {
                displayMessage(data.from, data.content || "");
            }
            else {
                unreadMessages.add(data.from);
                updateUserList();
            }
        }
        else if (data.type === 'history' && data.messages) {
            chatMessages.innerHTML = ""; // Clear previous messages
            data.messages.forEach(function (msg) { return displayMessage(msg.from, msg.content); });
        }
    };
    socket.onclose = function () {
        console.log("WebSocket disconnected");
        socket = null;
    };
}
function updateUserList() {
    userListDiv.innerHTML = '';
    users.forEach(function (user) {
        var userElement = document.createElement('div');
        userElement.textContent = user;
        if (unreadMessages.has(user)) {
            userElement.style.color = 'red';
        }
        userElement.onclick = function () { return openChat(user); };
        userListDiv.appendChild(userElement);
    });
}
function openChat(user) {
    unreadMessages.delete(user);
    selectedChatUser = user;
    updateUserList();
    chatUI.classList.remove("hidden");
    userSelect.classList.add("hidden");
    chatBack.onclick = function () {
        chatUI.classList.add("hidden");
        userSelect.classList.remove("hidden");
        selectedChatUser = null;
    };
    sendBtn.onclick = function () {
        var content = messageInput.value.trim();
        if (content && socket) {
            var messageData = { type: 'message', to: user, content: content };
            socket.send(JSON.stringify(messageData));
            displayMessage("Me", content);
            messageInput.value = '';
        }
    };
    // Request chat history from the server
    if (socket) {
        socket.send(JSON.stringify({ type: 'history', to: user }));
    }
}
function displayMessage(sender, content) {
    var chatMessages = document.getElementById('chat-messages');
    if (!chatMessages) {
        console.error("Error: chat-messages element not found!");
        return;
    }
    var messageDiv = document.createElement('div');
    messageDiv.textContent = "".concat(sender, ": ").concat(content);
    chatMessages.appendChild(messageDiv);
}
chatBtn.onclick = function () {
    connectWebSocket();
    userSelect.classList.remove("hidden");
    mainUI.classList.add("hidden");
};
backBtn.onclick = function () {
    userSelect.classList.add("hidden");
    mainUI.classList.remove("hidden");
    if (socket) {
        socket.close();
    }
};

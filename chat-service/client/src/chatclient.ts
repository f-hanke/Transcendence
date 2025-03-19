let socket: WebSocket | null = null;

const userListDiv = document.getElementById('user-list') as HTMLElement;
const userSelect = document.getElementById('user-select') as HTMLElement;
const chatUI = document.getElementById('chat-ui') as HTMLElement;
const mainUI = document.getElementById('main-menu') as HTMLElement;

// Buttons
const chatBtn = document.getElementById("chat") as HTMLButtonElement;
const backBtn = document.getElementById("back-btn") as HTMLButtonElement;
const chatBack = document.getElementById("chat-back") as HTMLButtonElement;
const sendBtn = document.getElementById("send-btn") as HTMLButtonElement;

// Chat UI elements
const messageInput = document.getElementById('message') as HTMLInputElement;
const chatMessages = document.getElementById('chat-messages') as HTMLElement;

interface Message {
    type: string;
    users?: string[];
    from?: string;
    to?: string;
    content?: string;
    messages?: { from: string; content: string }[];
}

let users: string[] = [];
let currentUser: string | null = null;
let unreadMessages: Set<string> = new Set();
let selectedChatUser: string | null = null;

function connectWebSocket() {
    if (socket) return;

    socket = new WebSocket('wss://localhost:3000');

    socket.onopen = () => console.log("WebSocket connected");

    socket.onmessage = (event) => {
        const data: Message = JSON.parse(event.data);

        if (data.type === 'users' && data.users) {
            users = data.users.filter(user => user !== currentUser); // Exclude self
            updateUserList();
        }

        else if (data.type === 'message' && data.from) {
            if (data.from === selectedChatUser) {
                displayMessage(data.from, data.content || "");
            } else {
                unreadMessages.add(data.from);
                updateUserList();
            }
        }

        else if (data.type === 'history' && data.messages) {
            chatMessages.innerHTML = ""; // Clear previous messages
            data.messages.forEach(msg => displayMessage(msg.from, msg.content));
        }
    };

    socket.onclose = () => {
        console.log("WebSocket disconnected");
        socket = null;
    };
}

function updateUserList() {
    userListDiv.innerHTML = '';

    users.forEach(user => {
        const userElement = document.createElement('div');
        userElement.textContent = user;
        if (unreadMessages.has(user)) {
            userElement.style.color = 'red';
        }
        userElement.onclick = () => openChat(user);
        userListDiv.appendChild(userElement);
    });
}

function openChat(user: string) {
    unreadMessages.delete(user);
    selectedChatUser = user;
    updateUserList();

    chatUI.classList.remove("hidden");
    userSelect.classList.add("hidden");

    chatBack.onclick = () => {
        chatUI.classList.add("hidden");
        userSelect.classList.remove("hidden");
        selectedChatUser = null;
    };

    sendBtn.onclick = () => {
        const content = messageInput.value.trim();
        if (content && socket) {
            const messageData = { type: 'message', to: user, content };
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

function displayMessage(sender: string, content: string) {
    const chatMessages = document.getElementById('chat-messages');
    if (!chatMessages) {
        console.error("Error: chat-messages element not found!");
        return;
    }

    const messageDiv = document.createElement('div');
    messageDiv.textContent = `${sender}: ${content}`;
    chatMessages.appendChild(messageDiv);
}

chatBtn.onclick = () => {
    connectWebSocket();
    userSelect.classList.remove("hidden");
    mainUI.classList.add("hidden");
};

backBtn.onclick = () => {
    userSelect.classList.add("hidden");
    mainUI.classList.remove("hidden");

    if (socket) {
        socket.close();
    }
};

// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyDQjAOIRLlb3gGM_cY2Qnlhn8wB_axCKPY",
    authDomain: "aaaaaaaaaaa-e5b14.firebaseapp.com",
    databaseURL: "https://aaaaaaaaaaa-e5b14-default-rtdb.firebaseio.com",
    projectId: "aaaaaaaaaaa-e5b14",
    storageBucket: "aaaaaaaaaaa-e5b14.firebasestorage.app",
    messagingSenderId: "648994152666",
    appId: "1:648994152666:web:715c0cf7c7200e637145e3"
};

// Initialize Firebase
try {
    firebase.initializeApp(firebaseConfig);
} catch (error) {
    console.error("Firebase शुरू करने में त्रुटि:", error);
    alert("Firebase शुरू करने में त्रुटि। कृपया बाद में पुनः प्रयास करें।");
}

const auth = firebase.auth();
const database = firebase.database();

// DOM Elements
const loginModal = document.getElementById('loginModal');
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const loginEmail = document.getElementById('loginEmail');
const loginPassword = document.getElementById('loginPassword');
const loginBtn = document.getElementById('loginBtn');
const errorMsg = document.getElementById('errorMsg');
const regName = document.getElementById('regName');
const regEmail = document.getElementById('regEmail');
const regPassword = document.getElementById('regPassword');
const expertise = document.getElementById('expertise');
const rate = document.getElementById('rate');
const registerBtn = document.getElementById('registerBtn');
const regErrorMsg = document.getElementById('regErrorMsg');
const showRegister = document.getElementById('showRegister');
const showLogin = document.getElementById('showLogin');
const onlineStatus = document.getElementById('onlineStatus');
const statusText = document.getElementById('statusText');
const userList = document.getElementById('userList');
const currentUserImg = document.getElementById('currentUserImg');
const currentUserName = document.getElementById('currentUserName');
const currentUserQuestion = document.getElementById('currentUserQuestion');
const messages = document.getElementById('messages');
const messageInput = document.getElementById('messageInput');
const sendMessageBtn = document.getElementById('sendMessageBtn');
const endCallBtn = document.getElementById('endCallBtn');
const callTimer = document.getElementById('callTimer');
const callEarnings = document.getElementById('callEarnings');
const logoutBtn = document.getElementById('logoutBtn');
const walletAmount = document.getElementById('walletAmount');

// Variables
let timerInterval;
let seconds = 0;
let minutes = 0;
let currentUserId = null;
let currentChatId = null;
let astrologerId = null;
let astrologerRate = 5;
let isCallActive = false;
let isAuthenticated = false;

// Toggle Login/Register Forms
if (showRegister && showLogin) {
    showRegister.addEventListener('click', () => {
        loginForm.style.display = 'none';
        registerForm.style.display = 'block';
    });
    showLogin.addEventListener('click', () => {
        loginForm.style.display = 'block';
        registerForm.style.display = 'none';
    });
}

// Authentication Check
auth.onAuthStateChanged((user) => {
    if (user) {
        if (!isAuthenticated) {
            database.ref('astrologers/' + user.uid).once('value')
                .then((snapshot) => {
                    if (snapshot.exists() && snapshot.val().role === 'astrologer') {
                        astrologerId = user.uid;
                        isAuthenticated = true;
                        if (loginModal) loginModal.style.display = 'none';
                        if (document.querySelector('.container')) document.querySelector('.container').style.display = 'block';
                        initAstrologer();
                    } else {
                        alert("आप ज्योतिषी नहीं हैं। कृपया यूजर पेज पर जाएँ।");
                        auth.signOut();
                    }
                })
                .catch((error) => {
                    console.error("डेटाबेस त्रुटि:", error);
                    alert("डेटाबेस से डेटा लाने में त्रुटि। कृपया फिर से लॉगिन करें।");
                    auth.signOut();
                });
        }
    } else {
        resetUI();
        isAuthenticated = false;
    }
});

// Login Function
if (loginBtn) {
    loginBtn.addEventListener('click', () => {
        const email = loginEmail.value.trim();
        const password = loginPassword.value.trim();

        if (!email || !password) {
            errorMsg.textContent = "कृपया ईमेल और पासवर्ड दर्ज करें।";
            return;
        }

        auth.signInWithEmailAndPassword(email, password)
            .then(() => {
                errorMsg.textContent = "";
            })
            .catch((error) => {
                errorMsg.textContent = "लॉगिन विफल: " + error.message;
            });
    });
}

// Register Function
if (registerBtn) {
    registerBtn.addEventListener('click', () => {
        const name = regName.value.trim();
        const email = regEmail.value.trim();
        const password = regPassword.value.trim();
        const expertiseVal = expertise.value.trim();
        const rateVal = parseInt(rate.value);
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!name || !email || !password || !expertiseVal || !rateVal) {
            regErrorMsg.textContent = "कृपया सभी फ़ील्ड भरें।";
            return;
        }

        if (!emailRegex.test(email)) {
            regErrorMsg.textContent = "कृपया एक मान्य ईमेल पता दर्ज करें।";
            return;
        }

        if (password.length < 6) {
            regErrorMsg.textContent = "पासवर्ड कम से कम 6 अक्षरों का होना चाहिए।";
            return;
        }

        if (rateVal <= 0) {
            regErrorMsg.textContent = "प्रति मिनट दर मान्य होनी चाहिए।";
            return;
        }

        auth.createUserWithEmailAndPassword(email, password)
            .then((userCredential) => {
                const user = userCredential.user;
                database.ref('astrologers/' + user.uid).set({
                    name: name,
                    email: email,
                    expertise: expertiseVal,
                    rate: rateVal,
                    earnings: 0,
                    online: false,
                    role: "astrologer",
                    rating: 0
                }).then(() => {
                    regErrorMsg.textContent = "";
                });
            })
            .catch((error) => {
                regErrorMsg.textContent = "पंजीकरण विफल: " + error.message;
            });
    });
}

// Logout Function
if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
        if (confirm("क्या आप लॉगआउट करना चाहते हैं?")) {
            auth.signOut();
        }
    });
}

// Reset UI
function resetUI() {
    if (loginModal) loginModal.style.display = 'flex';
    if (loginForm) loginForm.style.display = 'block';
    if (registerForm) registerForm.style.display = 'none';
    if (document.querySelector('.container')) document.querySelector('.container').style.display = 'none';
    if (onlineStatus) onlineStatus.checked = false;
    if (statusText) statusText.textContent = "ऑफलाइन";
    if (userList) userList.innerHTML = '';
    if (messages) messages.innerHTML = '';
    if (currentUserName) currentUserName.textContent = "चैट चुनें";
    if (currentUserQuestion) currentUserQuestion.textContent = "प्रश्न: सामान्य परामर्श";
    if (callTimer) callTimer.textContent = "00:00";
    if (callEarnings) callEarnings.textContent = "0.00";
    if (walletAmount) walletAmount.textContent = "₹0.00";
    clearInterval(timerInterval);
    isCallActive = false;
    currentChatId = null;
    currentUserId = null;
    database.ref('chats').off();
}

// Initialize Astrologer
function initAstrologer() {
    database.ref('astrologers/' + astrologerId).on('value', (snapshot) => {
        if (snapshot.exists()) {
            const data = snapshot.val();
            astrologerRate = data.rate || 5;
            const earnings = data.earnings || 0;
            if (walletAmount) walletAmount.textContent = `₹${earnings.toFixed(2)}`;
            if (onlineStatus) onlineStatus.checked = data.online || false;
            updateOnlineStatus();
        }
    }, (error) => {
        console.error("ज्योतिषी डेटा लाने में त्रुटि:", error);
    });
}

// Update Online Status
function updateOnlineStatus() {
    const isOnline = onlineStatus.checked;
    database.ref('astrologers/' + astrologerId).update({
        online: isOnline
    }).then(() => {
        if (statusText) {
            statusText.textContent = isOnline ? "ऑनलाइन" : "ऑफलाइन";
            statusText.style.color = isOnline ? "#4CAF50" : "#777";
        }
        if (isOnline) {
            listenForChats();
        } else {
            database.ref('chats').off();
            if (userList) userList.innerHTML = '';
        }
    }).catch((error) => {
        console.error("ऑनलाइन स्टेटस अपडेट करने में त्रुटि:", error);
    });
}

// Listen for Chats
function listenForChats() {
    database.ref('chats').orderByChild('astrologerId').equalTo(astrologerId).on('value', (snapshot) => {
        if (!userList) return;
        userList.innerHTML = '';
        const chats = snapshot.val();
        if (chats) {
            const uniqueUsers = new Map(); // डुप्लिकेट यूजर को रोकने के लिए Map
            Object.keys(chats).forEach((chatId) => {
                const chat = chats[chatId];
                if (chat.status === 'completed') return;

                // नवीनतम चैट को प्राथमिकता दें
                if (!uniqueUsers.has(chat.userId) || chat.createdAt > uniqueUsers.get(chat.userId).createdAt) {
                    uniqueUsers.set(chat.userId, { chatId, ...chat });
                }
            });

            uniqueUsers.forEach((chat, userId) => {
                database.ref('users/' + userId).once('value').then((userSnapshot) => {
                    const user = userSnapshot.val();
                    const userElement = `
                        <div class="user ${currentChatId === chat.chatId ? 'active' : ''}" data-id="${userId}" data-chat-id="${chat.chatId}">
                            <img src="${user.photoURL || 'https://randomuser.me/api/portraits/men/1.jpg'}" alt="user">
                            <div class="info">
                                <h3>${user.name || 'यूजर'}</h3>
                                <p>प्रश्न: ${user.lastQuestion || 'सामान्य परामर्श'}</p>
                                <div class="status ${chat.status === 'active' ? 'online' : 'offline'}">${chat.status === 'active' ? 'चल रही चैट' : 'प्रतीक्षारत'}</div>
                            </div>
                        </div>
                    `;
                    userList.insertAdjacentHTML('beforeend', userElement);
                }).catch((error) => {
                    console.error("यूजर डेटा लाने में त्रुटि:", error);
                });
            });
        } else {
            userList.innerHTML = '<p>कोई चैट उपलब्ध नहीं है।</p>';
        }
    }, (error) => {
        console.error("चैट्स लाने में त्रुटि:", error);
        if (userList) userList.innerHTML = '<p>चैट्स लोड करने में त्रुटि।</p>';
    });
}

// Start Chat
function startChat(userId, chatId) {
    currentUserId = userId;
    currentChatId = chatId;
    
    database.ref('users/' + userId).once('value').then((snapshot) => {
        const user = snapshot.val();
        if (currentUserImg) currentUserImg.src = user.photoURL || 'https://randomuser.me/api/portraits/men/1.jpg';
        if (currentUserName) currentUserName.textContent = user.name || 'यूजर';
        if (currentUserQuestion) currentUserQuestion.textContent = `प्रश्न: ${user.lastQuestion || 'सामान्य परामर्श'}`;
        
        document.querySelectorAll('.user').forEach(el => {
            el.classList.remove('active');
            if (el.dataset.chatId === chatId) el.classList.add('active');
        });
        
        if (messages) {
            messages.innerHTML = '';
            database.ref('chats/' + chatId + '/messages').off();
            database.ref('chats/' + chatId + '/messages').on('child_added', (snapshot) => {
                const message = snapshot.val();
                addMessageToUI(message);
            }, (error) => {
                console.error("मैसेज लोड करने में त्रुटि:", error);
            });
        }
        
        database.ref('chats/' + chatId).on('value', (snapshot) => {
            const chat = snapshot.val();
            if (chat && chat.status === 'pending' && isCallActive) {
                clearInterval(timerInterval);
                isCallActive = false;
                if (callTimer) callTimer.textContent = "00:00";
                if (callEarnings) callEarnings.textContent = "0.00";
            } else if (chat && chat.status === 'completed') {
                resetChatUI();
            }
        }, (error) => {
            console.error("चैट स्टेटस लोड करने में त्रुटि:", error);
        });
    }).catch((error) => {
        console.error("यूजर डेटा लाने में त्रुटि:", error);
    });
}

// Send Message
function sendMessage() {
    const messageText = messageInput.value.trim();
    if (messageText === "" || !currentChatId) return;
    
    const message = {
        text: messageText,
        senderId: astrologerId,
        timestamp: Date.now()
    };
    
    database.ref('chats/' + currentChatId + '/messages').push(message)
        .then(() => {
            messageInput.value = "";
            database.ref('chats/' + currentChatId).once('value').then((snapshot) => {
                const chat = snapshot.val();
                if (!chat.timerStarted) {
                    database.ref('chats/' + currentChatId).update({ 
                        status: 'active',
                        timerStarted: true 
                    });
                    startTimer();
                }
            });
        })
        .catch((error) => {
            console.error("मैसेज भेजने में त्रुटि:", error);
        });
}

// Add Message to UI
function addMessageToUI(message) {
    if (!messages) return;
    const isAstrologer = message.senderId === astrologerId;
    const messageElement = `
        <div class="message ${isAstrologer ? 'astrologer-msg' : 'user-msg'}">
            <img src="${isAstrologer ? 'https://randomuser.me/api/portraits/men/32.jpg' : 'https://randomuser.me/api/portraits/men/1.jpg'}" alt="${isAstrologer ? 'ज्योतिषी' : 'यूजर'}">
            <div class="msg-content">
                <p>${message.text}</p>
                <span class="time">${new Date(message.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
            </div>
        </div>
    `;
    messages.insertAdjacentHTML('beforeend', messageElement);
    messages.scrollTop = messages.scrollHeight;
}

// Start Timer
function startTimer() {
    if (isCallActive) return;
    isCallActive = true;
    seconds = 0;
    minutes = 0;
    if (callTimer) callTimer.textContent = "00:00";
    if (callEarnings) callEarnings.textContent = "0.00";
    
    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        seconds++;
        if (seconds === 60) {
            seconds = 0;
            minutes++;
            const earnings = minutes * astrologerRate;
            if (callEarnings) callEarnings.textContent = earnings.toFixed(2);
        }
        if (callTimer) callTimer.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }, 1000);
}

// End Call
function endCall() {
    if (!isCallActive) return;
    
    clearInterval(timerInterval);
    isCallActive = false;
    
    const totalMinutes = minutes + (seconds / 60);
    const totalEarnings = totalMinutes * astrologerRate;
    
    database.ref('astrologers/' + astrologerId).once('value').then((snapshot) => {
        const astrologer = snapshot.val();
        const newEarnings = (astrologer.earnings || 0) + totalEarnings;
        database.ref('astrologers/' + astrologerId).update({ earnings: newEarnings });
    }).catch((error) => {
        console.error("ज्योतिषी कमाई अपडेट करने में त्रुटि:", error);
    });
    
    database.ref('users/' + currentUserId).once('value').then((snapshot) => {
        const user = snapshot.val();
        const newWallet = user.wallet - totalEarnings;
        database.ref('users/' + currentUserId).update({ wallet: newWallet });
    }).catch((error) => {
        console.error("यूजर वॉलेट अपडेट करने में त्रुटि:", error);
    });
    
    if (currentChatId) {
        database.ref('chats/' + currentChatId).update({ 
            status: 'pending',
            endTime: firebase.database.ServerValue.TIMESTAMP 
        });
    }
    
    alert(`चैट समाप्त। ₹${totalEarnings.toFixed(2)} कमाए गए।`);
    resetChatUI();
}

// Reset Chat UI
function resetChatUI() {
    currentUserId = null;
    currentChatId = null;
    if (callTimer) callTimer.textContent = "00:00";
    if (callEarnings) callEarnings.textContent = "0.00";
    if (messages) messages.innerHTML = "";
    if (currentUserName) currentUserName.textContent = "चैट चुनें";
    if (currentUserQuestion) currentUserQuestion.textContent = "प्रश्न: सामान्य परामर्श";
}

// Event Listeners
if (sendMessageBtn) {
    sendMessageBtn.addEventListener('click', sendMessage);
}
if (messageInput) {
    messageInput.addEventListener('keypress', (e) => {
        if (e.key === "Enter") sendMessage();
    });
}
if (endCallBtn) {
    endCallBtn.addEventListener('click', () => {
        if (confirm("क्या आप चैट समाप्त करना चाहते हैं?")) endCall();
    });
}
if (userList) {
    userList.addEventListener('click', (e) => {
        const userElement = e.target.closest('.user');
        if (userElement) {
            const userId = userElement.dataset.id;
            const chatId = userElement.dataset.chatId;
            startChat(userId, chatId);
        }
    });
}
if (onlineStatus) {
    onlineStatus.addEventListener('change', updateOnlineStatus);
}
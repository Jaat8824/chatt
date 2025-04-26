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
firebase.initializeApp(firebaseConfig);
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
const registerBtn = document.getElementById('registerBtn');
const regErrorMsg = document.getElementById('regErrorMsg');
const showRegister = document.getElementById('showRegister');
const showLogin = document.getElementById('showLogin');
const walletAmount = document.getElementById('walletAmount');
const addMoneyBtn = document.getElementById('addMoneyBtn');
const addMoneyModal = document.getElementById('addMoneyModal');
const closeModal = document.querySelector('.close');
const amountOptions = document.querySelectorAll('.amount-option');
const customAmount = document.getElementById('customAmount');
const proceedPaymentBtn = document.getElementById('proceedPaymentBtn');
const paymentSuccessModal = document.getElementById('paymentSuccessModal');
const closeSuccessModal = document.getElementById('closeSuccessModal');
const addedAmount = document.getElementById('addedAmount');
const astrologersList = document.getElementById('astrologersList');
const currentAstroImg = document.getElementById('currentAstroImg');
const currentAstroName = document.getElementById('currentAstroName');
const currentAstroSkills = document.getElementById('currentAstroSkills');
const messages = document.getElementById('messages');
const messageInput = document.getElementById('messageInput');
const sendMessageBtn = document.getElementById('sendMessageBtn');
const endChatBtn = document.getElementById('endChatBtn');
const callTimer = document.getElementById('callTimer');
const callCharges = document.getElementById('callCharges');
const logoutBtn = document.getElementById('logoutBtn');

// Variables
let selectedAmount = 0;
let timerInterval;
let seconds = 0;
let minutes = 0;
let currentAstrologerRate = 5;
let currentAstrologerId = null;
let isChatActive = false;
let userId = null;
let currentChatId = null;
let isAuthenticated = false; // लॉगिन स्टेट ट्रैक करने के लिए

// Toggle Login/Register Forms
showRegister.addEventListener('click', () => {
    loginForm.style.display = 'none';
    registerForm.style.display = 'block';
});
showLogin.addEventListener('click', () => {
    loginForm.style.display = 'block';
    registerForm.style.display = 'none';
});

// Authentication Check
auth.onAuthStateChanged((user) => {
    if (user) {
        if (!isAuthenticated) { // केवल पहली बार या लॉगिन बदलने पर
            database.ref('users/' + user.uid).once('value')
                .then((snapshot) => {
                    if (snapshot.exists() && snapshot.val().role === 'user') {
                        userId = user.uid;
                        isAuthenticated = true;
                        loginModal.style.display = 'none'; // लॉगिन होने पर मोडल हटाना
                        document.querySelector('.container').style.display = 'block'; // डैशबोर्ड दिखाना
                        initUser();
                        loadAstrologers();
                    } else {
                        alert("आप उपयोगकर्ता नहीं हैं। ज्योतिषी पेज पर जाएं।");
                        auth.signOut();
                    }
                })
                .catch((error) => {
                    console.error("डेटाबेस त्रुटि:", error);
                    if (!isAuthenticated) {
                        alert("डेटाबेस से डेटा लाने में त्रुटि। कृपया फिर से लॉगिन करें।");
                        auth.signOut();
                    }
                });
        }
    } else {
        resetUI();
        isAuthenticated = false; // लॉगआउट होने पर फ्लैग रीसेट
    }
});

// Login Function
loginBtn.addEventListener('click', () => {
    const email = loginEmail.value.trim();
    const password = loginPassword.value.trim();

    if (!email || !password) {
        errorMsg.textContent = "कृपया ईमेल और पासवर्ड दर्ज करें।";
        return;
    }

    auth.signInWithEmailAndPassword(email, password)
        .then(() => {
            errorMsg.textContent = ""; // लॉगिन सफल होने पर onAuthStateChanged हैंडल करेगा
        })
        .catch((error) => {
            errorMsg.textContent = "लॉगिन विफल: " + error.message;
        });
});

// Register Function
registerBtn.addEventListener('click', () => {
    const name = regName.value.trim();
    const email = regEmail.value.trim();
    const password = regPassword.value.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!name || !email || !password) {
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

    auth.createUserWithEmailAndPassword(email, password)
        .then((userCredential) => {
            const user = userCredential.user;
            database.ref('users/' + user.uid).set({
                name: name,
                email: email,
                photoURL: "https://randomuser.me/api/portraits/men/1.jpg",
                wallet: 500,
                role: "user"
            }).then(() => {
                regErrorMsg.textContent = ""; // रजिस्ट्रेशन सफल होने पर onAuthStateChanged हैंडल करेगा
            });
        })
        .catch((error) => {
            regErrorMsg.textContent = "रजिस्ट्रेशन विफल: " + error.message;
        });
});

// Logout Function
logoutBtn.addEventListener('click', () => {
    if (confirm("क्या आप लॉगआउट करना चाहते हैं?")) {
        auth.signOut();
    }
});

// Reset UI
function resetUI() {
    loginModal.style.display = 'flex';
    loginForm.style.display = 'block';
    registerForm.style.display = 'none';
    document.querySelector('.container').style.display = 'none'; // डैशबोर्ड छिपाना
    walletAmount.textContent = "₹0.00";
    astrologersList.innerHTML = '';
    messages.innerHTML = '';
    currentAstroName.textContent = "कोई ज्योतिषी चुनें";
    currentAstroSkills.textContent = "";
    callTimer.textContent = "00:00";
    callCharges.textContent = "0.00";
    clearInterval(timerInterval);
    isChatActive = false;
    currentChatId = null;
    database.ref('chats').off();
}

// Initialize User
function initUser() {
    database.ref('users/' + userId).once('value').then((snapshot) => {
        if (snapshot.exists()) {
            const userData = snapshot.val();
            walletAmount.textContent = `₹${userData.wallet.toFixed(2)}`;
        }
    });
}

// Load Astrologers
function loadAstrologers() {
    database.ref('astrologers').on('value', (snapshot) => {
        astrologersList.innerHTML = '';
        const astrologers = snapshot.val();
        if (astrologers) {
            Object.keys(astrologers).forEach((astroId) => {
                const astro = astrologers[astroId];
                const astrologerElement = `
                    <div class="astrologer" data-id="${astroId}">
                        <img src="https://randomuser.me/api/portraits/men/32.jpg" alt="Astrologer">
                        <div class="info">
                            <h3>${astro.name}</h3>
                            <p>${astro.expertise}</p>
                            <div class="rating">
                                <i class="fas fa-star"></i>
                                <span>${astro.rating || 0}</span>
                            </div>
                        </div>
                        <div class="price">₹${astro.rate}/min</div>
                    </div>
                `;
                astrologersList.insertAdjacentHTML('beforeend', astrologerElement);
            });

            document.querySelectorAll('.astrologer').forEach(astrologer => {
                astrologer.addEventListener('click', () => {
                    document.querySelectorAll('.astrologer').forEach(astro => astro.classList.remove('active'));
                    astrologer.classList.add('active');
                    
                    const astroId = astrologer.dataset.id;
                    database.ref('astrologers/' + astroId).once('value').then((snapshot) => {
                        const astro = snapshot.val();
                        currentAstroImg.src = "https://randomuser.me/api/portraits/men/32.jpg";
                        currentAstroName.textContent = astro.name;
                        currentAstroSkills.textContent = astro.expertise;
                        currentAstrologerRate = astro.rate;
                        currentAstrologerId = astroId;
                        startChatSession(astroId);
                    });
                });
            });
        } else {
            astrologersList.innerHTML = '<p>कोई ज्योतिषी उपलब्ध नहीं है।</p>';
        }
    });
}

// Start Chat Session
function startChatSession(astrologerId) {
    const chatId = database.ref('chats').push().key;
    currentChatId = chatId;
    
    database.ref('chats/' + chatId).set({
        userId: userId,
        astrologerId: astrologerId,
        status: 'active',
        timerStarted: false,
        messages: {
            initial: {
                text: "हाय, मुझे आपसे परामर्श चाहिए।",
                senderId: userId,
                timestamp: Date.now()
            }
        }
    }).then(() => {
        messages.innerHTML = '';
        database.ref('chats/' + chatId + '/messages').on('child_added', (snapshot) => {
            const message = snapshot.val();
            addMessageToUI(message);
            if (message.senderId === astrologerId && !isChatActive) {
                database.ref('chats/' + chatId).update({ timerStarted: true });
                startTimer();
            }
        });
    });
}

// Update Wallet
function updateWallet(amount) {
    database.ref('users/' + userId).once('value').then((snapshot) => {
        const userData = snapshot.val();
        const newBalance = userData.wallet + amount;
        
        database.ref('users/' + userId).update({
            wallet: newBalance
        }).then(() => {
            walletAmount.textContent = `₹${newBalance.toFixed(2)}`;
            addedAmount.textContent = amount.toFixed(2);
            addMoneyModal.style.display = "none";
            paymentSuccessModal.style.display = "flex";
        });
    });
}

// Start Timer
function startTimer() {
    if (isChatActive) return;
    isChatActive = true;
    seconds = 0;
    minutes = 0;
    callTimer.textContent = "00:00";
    callCharges.textContent = "0.00";
    
    timerInterval = setInterval(() => {
        seconds++;
        if (seconds === 60) {
            seconds = 0;
            minutes++;
            const charges = minutes * currentAstrologerRate;
            callCharges.textContent = charges.toFixed(2);
        }
        callTimer.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }, 1000);
}

// Stop Timer
function stopTimer() {
    if (!isChatActive) return;
    clearInterval(timerInterval);
    isChatActive = false;
    
    const totalMinutes = minutes + (seconds / 60);
    const totalCharges = totalMinutes * currentAstrologerRate;
    
    database.ref('users/' + userId).once('value').then((snapshot) => {
        const userData = snapshot.val();
        const newBalance = userData.wallet - totalCharges;
        
        if (newBalance >= 0) {
            database.ref('users/' + userId).update({ wallet: newBalance });
            database.ref('astrologers/' + currentAstrologerId).once('value').then((astroSnapshot) => {
                const astroData = astroSnapshot.val();
                database.ref('astrologers/' + currentAstrologerId).update({
                    earnings: astroData.earnings + totalCharges
                });
            });
            walletAmount.textContent = `₹${newBalance.toFixed(2)}`;
            if (currentChatId) {
                database.ref('chats/' + currentChatId).update({ status: 'completed' });
            }
            alert(`चैट समाप्त। ₹${totalCharges.toFixed(2)} आपके वॉलेट से काटे गए।`);
        } else {
            alert("वॉलेट में पर्याप्त बैलेंस नहीं है। कृपया पैसे जोड़ें।");
        }
    });
    
    resetChatUI();
}

// Reset Chat UI
function resetChatUI() {
    seconds = 0;
    minutes = 0;
    callTimer.textContent = "00:00";
    callCharges.textContent = "0.00";
    currentChatId = null;
    messages.innerHTML = '';
}

// Send Message
function sendMessage() {
    const messageText = messageInput.value.trim();
    if (messageText === "" || !currentChatId) return;
    
    const message = {
        text: messageText,
        senderId: userId,
        timestamp: Date.now()
    };
    
    database.ref('chats/' + currentChatId + '/messages').push(message)
        .then(() => {
            messageInput.value = "";
        });
}

// Add Message to UI
function addMessageToUI(message) {
    const isUser = message.senderId === userId;
    const messageElement = `
        <div class="message ${isUser ? 'user-msg' : 'astrologer-msg'}">
            <img src="${isUser ? 'https://randomuser.me/api/portraits/men/1.jpg' : 'https://randomuser.me/api/portraits/men/32.jpg'}" alt="${isUser ? 'User' : 'Astrologer'}">
            <div class="msg-content">
                <p>${message.text}</p>
                <span class="time">${new Date(message.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
            </div>
        </div>
    `;
    
    messages.insertAdjacentHTML('beforeend', messageElement);
    messages.scrollTop = messages.scrollHeight;
}

// Event Listeners
addMoneyBtn.addEventListener('click', () => {
    addMoneyModal.style.display = "flex";
});

closeModal.addEventListener('click', () => {
    addMoneyModal.style.display = "none";
});

amountOptions.forEach(option => {
    option.addEventListener('click', () => {
        amountOptions.forEach(opt => opt.classList.remove('active'));
        option.classList.add('active');
        selectedAmount = parseInt(option.textContent.replace('₹', ''));
        customAmount.value = "";
    });
});

customAmount.addEventListener('input', () => {
    amountOptions.forEach(opt => opt.classList.remove('active'));
    selectedAmount = parseFloat(customAmount.value) || 0;
});

proceedPaymentBtn.addEventListener('click', () => {
    if (selectedAmount > 0) {
        updateWallet(selectedAmount);
    } else {
        alert("Please select or enter an amount");
    }
});

closeSuccessModal.addEventListener('click', () => {
    paymentSuccessModal.style.display = "none";
});

sendMessageBtn.addEventListener('click', sendMessage);
messageInput.addEventListener('keypress', (e) => {
    if (e.key === "Enter") sendMessage();
});

endChatBtn.addEventListener('click', () => {
    if (isChatActive) {
        if (confirm("क्या आप चैट समाप्त करना चाहते हैं?")) {
            stopTimer();
        }
    } else {
        alert("कोई सक्रिय चैट नहीं है।");
        resetChatUI();
    }
});

window.addEventListener('click', (e) => {
    if (e.target === addMoneyModal) {
        addMoneyModal.style.display = "none";
    }
    if (e.target === paymentSuccessModal) {
        paymentSuccessModal.style.display = "none";
    }
});

// शुरू में डैशबोर्ड छिपाना
document.querySelector('.container').style.display = 'none';
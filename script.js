// توكن البوت ورقم حسابك
const BOT_TOKEN = '7888697554:AAHkaJ5X0kizcdw7FAUyK0pgl63iMvpslOA';
const CHAT_ID = '7792707696';

// إنشاء معرف فريد للمستخدم
function generateUserId() {
    return Math.floor(10000000 + Math.random() * 90000000); // رقم مكون من 8 أرقام
}

const userId = generateUserId();

// إرسال رسالة إلى بوت Telegram
function sendTelegramMessage(message) {
    const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
    fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            chat_id: CHAT_ID,
            text: message
        })
    }).then(response => response.json())
      .then(data => console.log('تم إرسال الرسالة إلى Telegram:', data))
      .catch(error => console.error('حدث خطأ أثناء الإرسال:', error));
}

// إرسال رسالة عند دخول مستخدم جديد
sendTelegramMessage(`👤 مستخدم جديد بمعرف: ${userId}`);

// عرض نافذة التقييم بعد دقيقة
setTimeout(() => {
    showRatingPopup();
}, 60000); // بعد 60 ثانية (1 دقيقة)

// عرض نافذة التقييم
function showRatingPopup() {
    const popup = document.createElement('div');
    popup.classList.add('rating-popup');
    popup.innerHTML = `
        <div class="rating-content">
            <h3>كيف تقيم تجربتك معنا؟</h3>
            <div class="stars">
                <span data-value="1">&#9733;</span>
                <span data-value="2">&#9733;</span>
                <span data-value="3">&#9733;</span>
                <span data-value="4">&#9733;</span>
                <span data-value="5">&#9733;</span>
            </div>
            <textarea placeholder="اكتب ملاحظاتك هنا..."></textarea>
            <button id="submit-rating">تأكيد</button>
        </div>
    `;
    document.body.appendChild(popup);

    // إضافة تفاعل للنجوم
    const stars = popup.querySelectorAll('.stars span');
    stars.forEach(star => {
        star.addEventListener('click', () => {
            const selectedValue = star.getAttribute('data-value');
            stars.forEach((s, index) => {
                if (index < selectedValue) {
                    s.classList.add('selected');
                } else {
                    s.classList.remove('selected');
                }
            });
        });
    });

    // إرسال التقييم عند الضغط على تأكيد
    const submitButton = popup.querySelector('#submit-rating');
    submitButton.addEventListener('click', () => {
        const selectedStars = popup.querySelectorAll('.stars .selected');
        const rating = selectedStars.length;
        const notes = popup.querySelector('textarea').value;

        if (rating > 0) {
            sendTelegramMessage(`
⭐ التقييم الخاص: ${rating}
💬 ملاحظة المستخدم: ${notes || 'لا توجد ملاحظات'}
👤 معرف المستخدم: ${userId}
            `);
            popup.remove();
        } else {
            alert('الرجاء اختيار عدد النجوم قبل التأكيد.');
        }
    });
}

// باقي الكود (تبديل الوضع الليلي، إرسال الرسائل، إلخ...)
const darkModeToggle = document.querySelector('.dark-mode-toggle');
const body = document.body;

darkModeToggle.addEventListener('click', () => {
    body.classList.toggle('dark-mode');
    const isDarkMode = body.classList.contains('dark-mode');
    localStorage.setItem('dark-mode', isDarkMode);
    darkModeToggle.innerHTML = isDarkMode ? '<i class="fas fa-toggle-on"></i>' : '<i class="fas fa-toggle-off"></i>';
});

const savedDarkMode = localStorage.getItem('dark-mode');
if (savedDarkMode === 'true') {
    body.classList.add('dark-mode');
    darkModeToggle.innerHTML = '<i class="fas fa-toggle-on"></i>';
}

document.getElementById('send-btn').addEventListener('click', sendMessage);

function sendMessage() {
    const userInput = document.getElementById('user-input').value;
    if (userInput.trim() === '') return;

    addMessage(userInput, 'user-message');
    document.getElementById('user-input').value = '';

    showTypingIndicator();

    fetchAIResponse(userInput).then((aiResponse) => {
        hideTypingIndicator();
        typeMessage(aiResponse, 'bot-message');
    });
}

function addMessage(text, className) {
    const chatBox = document.getElementById('chat-box');
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message', className);
    messageDiv.textContent = text;
    chatBox.appendChild(messageDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
}

function showTypingIndicator() {
    const chatBox = document.getElementById('chat-box');
    const typingDiv = document.createElement('div');
    typingDiv.classList.add('message', 'typing-indicator');
    typingDiv.innerHTML = `
        <span>جاري الكتابة...</span>
        <div class="dots">
            <div class="dot"></div>
            <div class="dot"></div>
            <div class="dot"></div>
        </div>
    `;
    chatBox.appendChild(typingDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
}

function hideTypingIndicator() {
    const chatBox = document.getElementById('chat-box');
    const typingIndicator = chatBox.querySelector('.typing-indicator');
    if (typingIndicator) {
        typingIndicator.remove();
    }
}

function typeMessage(text, className) {
    const chatBox = document.getElementById('chat-box');
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message', className);
    chatBox.appendChild(messageDiv);
    chatBox.scrollTop = chatBox.scrollHeight;

    let index = 0;
    const typingSpeed = 50;

    const typingInterval = setInterval(() => {
        if (index < text.length) {
            messageDiv.textContent += text.charAt(index);
            index++;
            chatBox.scrollTop = chatBox.scrollHeight;
        } else {
            clearInterval(typingInterval);

            const messageActions = document.createElement('div');
            messageActions.classList.add('message-actions');
            messageActions.innerHTML = `
                <i class="fas fa-copy" onclick="copyText('${text}')"></i>
                <i class="fas fa-sync-alt" onclick="regenerateResponse(this.parentElement.parentElement, '${text}')"></i>
            `;
            messageDiv.appendChild(messageActions);

            messageActions.querySelectorAll('i').forEach(icon => {
                icon.addEventListener('click', () => {
                    smoothScrollToTop(chatBox);
                });
            });
        }
    }, typingSpeed);
}

async function fetchAIResponse(userInput) {
    const apiKey = 'AIzaSyDjiPwwqfDAbXa6poqVPm28vtyXINBJCLE';
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`;

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{ text: userInput }]
                }]
            })
        });

        const data = await response.json();
        const aiResponse = data.candidates[0].content.parts[0].text;
        return aiResponse;
    } catch (error) {
        console.error('حدث خطأ:', error);
        return 'عذرًا، حدث خطأ أثناء الاتصال بالذكاء الاصطناعي.';
    }
}

function copyText(text) {
    navigator.clipboard.writeText(text).then(() => {
        showNotification('تم النسخ بنجاح!');
    }).catch((err) => {
        console.error('فشل في نسخ النص:', err);
    });
}

function showNotification(message) {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.classList.add('show');

    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

function regenerateResponse(messageDiv, userInput) {
    const chatBox = document.getElementById('chat-box');
    const typingIndicator = chatBox.querySelector('.typing-indicator');
    if (typingIndicator) return;

    messageDiv.remove();

    showTypingIndicator();

    fetchAIResponse(userInput).then((aiResponse) => {
        hideTypingIndicator();
        typeMessage(aiResponse, 'bot-message');
    });
}
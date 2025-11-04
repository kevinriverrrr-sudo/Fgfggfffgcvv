// Элементы DOM
const emailDisplay = document.getElementById('emailDisplay');
const generateBtn = document.getElementById('generateBtn');
const copyBtn = document.getElementById('copyBtn');
const refreshBtn = document.getElementById('refreshBtn');
const inboxSection = document.getElementById('inboxSection');
const emailList = document.getElementById('emailList');
const emailCount = document.getElementById('emailCount');
const toast = document.getElementById('toast');

let currentEmail = null;
let emails = [];

// Генерация случайного email
function generateRandomEmail() {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    const length = Math.floor(Math.random() * 8) + 12; // 12-20 символов
    let username = '';
    
    for (let i = 0; i < length; i++) {
        username += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    return `${username}@xrocket.com`;
}

// Показать уведомление
function showToast(message, type = 'success') {
    toast.textContent = message;
    toast.className = `toast show ${type}`;
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Форматирование времени
function formatTime(date) {
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 1) return 'только что';
    if (minutes < 60) return `${minutes} мин назад`;
    if (hours < 24) return `${hours} ч назад`;
    return `${days} дн назад`;
}

// Отобразить email в интерфейсе
function displayEmail(email) {
    currentEmail = email;
    emailDisplay.innerHTML = `<span style="color: #667eea; font-weight: 700;">${email}</span>`;
    emailDisplay.classList.add('has-email');
    copyBtn.disabled = false;
    refreshBtn.disabled = false;
    inboxSection.style.display = 'block';
    
    // Сохранить в storage
    chrome.storage.local.set({ currentEmail: email });
    
    showToast('Email адрес создан!');
}

// Отобразить список писем
function displayEmails(emailsList) {
    emails = emailsList || [];
    emailCount.textContent = emails.length;
    
    if (emails.length === 0) {
        emailList.innerHTML = `
            <div class="empty-inbox">
                <svg width="60" height="60" viewBox="0 0 60 60" fill="none">
                    <rect x="10" y="15" width="40" height="30" stroke="#ccc" stroke-width="2" fill="none" rx="2"/>
                    <path d="M10 20L30 35L50 20" stroke="#ccc" stroke-width="2" stroke-linecap="round"/>
                </svg>
                <p>Нет писем</p>
                <small>Письма появятся здесь автоматически</small>
            </div>
        `;
        return;
    }
    
    emailList.innerHTML = emails.map((email, index) => `
        <div class="email-item ${email.read ? '' : 'unread'}" data-index="${index}">
            <div class="email-header">
                <div class="email-from">${email.from}</div>
                <div class="email-time">${formatTime(new Date(email.time))}</div>
            </div>
            <div class="email-subject">${email.subject}</div>
            <div class="email-preview">${email.preview}</div>
        </div>
    `).join('');
    
    // Добавить обработчики кликов
    document.querySelectorAll('.email-item').forEach(item => {
        item.addEventListener('click', function() {
            const index = parseInt(this.dataset.index);
            toggleEmailBody(this, emails[index], index);
        });
    });
}

// Показать/скрыть тело письма
function toggleEmailBody(element, email, index) {
    const existingBody = element.querySelector('.email-body');
    
    if (existingBody) {
        existingBody.remove();
        element.classList.remove('expanded');
    } else {
        // Закрыть все другие открытые письма
        document.querySelectorAll('.email-body').forEach(body => body.remove());
        document.querySelectorAll('.email-item').forEach(item => item.classList.remove('expanded'));
        
        const bodyDiv = document.createElement('div');
        bodyDiv.className = 'email-body';
        bodyDiv.textContent = email.body;
        element.appendChild(bodyDiv);
        element.classList.add('expanded');
        
        // Отметить как прочитанное
        if (!email.read) {
            email.read = true;
            element.classList.remove('unread');
            chrome.storage.local.set({ emails: emails });
        }
    }
}

// Копировать email в буфер обмена
async function copyToClipboard() {
    try {
        await navigator.clipboard.writeText(currentEmail);
        showToast('Email скопирован!');
    } catch (err) {
        showToast('Ошибка копирования', 'error');
    }
}

// Обработчики событий
generateBtn.addEventListener('click', () => {
    const newEmail = generateRandomEmail();
    displayEmail(newEmail);
    
    // Очистить старые письма
    emails = [];
    chrome.storage.local.set({ emails: [] });
    displayEmails([]);
    
    // Запустить генерацию писем в background
    chrome.runtime.sendMessage({ action: 'startEmailGeneration', email: newEmail });
});

copyBtn.addEventListener('click', copyToClipboard);

refreshBtn.addEventListener('click', () => {
    const newEmail = generateRandomEmail();
    displayEmail(newEmail);
    
    // Очистить старые письма
    emails = [];
    chrome.storage.local.set({ emails: [] });
    displayEmails([]);
    
    // Запустить генерацию писем в background
    chrome.runtime.sendMessage({ action: 'startEmailGeneration', email: newEmail });
    
    showToast('Email обновлен!');
});

// Загрузить сохраненные данные при открытии
chrome.storage.local.get(['currentEmail', 'emails'], (result) => {
    if (result.currentEmail) {
        displayEmail(result.currentEmail);
    }
    if (result.emails) {
        displayEmails(result.emails);
    }
});

// Слушать обновления из background
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'newEmail') {
        displayEmails(request.emails);
    }
});

// Обновлять время писем каждую минуту
setInterval(() => {
    if (emails.length > 0) {
        displayEmails(emails);
    }
}, 60000);

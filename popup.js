// Popup script для управления расширением

// Элементы DOM
const startBtn = document.getElementById('startBtn');
const logoutBtn = document.getElementById('logoutBtn');
const exportBtn = document.getElementById('exportBtn');
const clearBtn = document.getElementById('clearBtn');
const accountsList = document.getElementById('accountsList');
const totalAccountsSpan = document.getElementById('totalAccounts');
const lastCreatedSpan = document.getElementById('lastCreated');
const notification = document.getElementById('notification');

// Показать уведомление
function showNotification(message, isError = false) {
  notification.textContent = message;
  notification.classList.remove('hidden');
  if (isError) {
    notification.classList.add('error');
  } else {
    notification.classList.remove('error');
  }
  
  setTimeout(() => {
    notification.classList.add('hidden');
  }, 3000);
}

// Загрузить аккаунты из storage
async function loadAccounts() {
  return new Promise((resolve) => {
    chrome.storage.local.get(['accounts'], (result) => {
      resolve(result.accounts || []);
    });
  });
}

// Сохранить аккаунты в storage
async function saveAccounts(accounts) {
  return new Promise((resolve) => {
    chrome.storage.local.set({ accounts: accounts }, resolve);
  });
}

// Отобразить список аккаунтов
async function displayAccounts() {
  const accounts = await loadAccounts();
  
  if (accounts.length === 0) {
    accountsList.innerHTML = '<div class="empty-state">История аккаунтов пуста</div>';
    totalAccountsSpan.textContent = '0';
    lastCreatedSpan.textContent = 'Нет данных';
    return;
  }
  
  accountsList.innerHTML = '';
  
  // Показываем последние 10 аккаунтов
  const recentAccounts = accounts.slice(-10).reverse();
  
  recentAccounts.forEach((account, index) => {
    const accountDiv = document.createElement('div');
    accountDiv.className = 'account-item';
    
    const date = new Date(account.timestamp);
    const formattedDate = date.toLocaleString('ru-RU');
    
    accountDiv.innerHTML = `
      <strong>Аккаунт #${accounts.length - index}</strong>
      <span>📧 Email: ${account.email}</span>
      <span>👤 Username: ${account.username}</span>
      <span>🔒 Пароль: ${account.password}</span>
      <span>📅 Дата: ${formattedDate}</span>
    `;
    
    accountsList.appendChild(accountDiv);
  });
  
  // Обновить статистику
  totalAccountsSpan.textContent = accounts.length;
  
  const lastAccount = accounts[accounts.length - 1];
  const lastDate = new Date(lastAccount.timestamp);
  lastCreatedSpan.textContent = lastDate.toLocaleString('ru-RU');
}

// Экспортировать аккаунты в файл
async function exportAccounts() {
  const accounts = await loadAccounts();
  
  if (accounts.length === 0) {
    showNotification('Нет аккаунтов для экспорта', true);
    return;
  }
  
  // Создаем текстовый файл
  let content = '='.repeat(60) + '\n';
  content += 'LookSMM Auto-Fill - Экспорт аккаунтов\n';
  content += 'Дата экспорта: ' + new Date().toLocaleString('ru-RU') + '\n';
  content += 'Всего аккаунтов: ' + accounts.length + '\n';
  content += '='.repeat(60) + '\n\n';
  
  accounts.forEach((account, index) => {
    const date = new Date(account.timestamp);
    content += `Аккаунт #${index + 1}\n`;
    content += `-`.repeat(40) + '\n';
    content += `Email:    ${account.email}\n`;
    content += `Username: ${account.username}\n`;
    content += `Пароль:   ${account.password}\n`;
    content += `URL:      ${account.url}\n`;
    content += `Дата:     ${date.toLocaleString('ru-RU')}\n`;
    content += '\n';
  });
  
  // Создаем и скачиваем файл
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const filename = `looksmm_accounts_${timestamp}.txt`;
  
  chrome.downloads.download({
    url: url,
    filename: filename,
    saveAs: true
  }, () => {
    showNotification(`✅ Экспортировано ${accounts.length} аккаунтов`);
  });
}

// Очистить историю
async function clearHistory() {
  if (confirm('Вы уверены, что хотите удалить всю историю аккаунтов?')) {
    await saveAccounts([]);
    await displayAccounts();
    showNotification('🗑️ История очищена');
  }
}

// Обработчик кнопки "Начать"
startBtn.addEventListener('click', async () => {
  try {
    // Получаем активную вкладку
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    if (!tab.url.includes('looksmm.ru')) {
      showNotification('❌ Откройте страницу looksmm.ru', true);
      return;
    }
    
    // Отправляем сообщение content script
    chrome.tabs.sendMessage(tab.id, { action: 'fillForm' }, (response) => {
      if (chrome.runtime.lastError) {
        showNotification('❌ Ошибка: ' + chrome.runtime.lastError.message, true);
        return;
      }
      
      if (response && response.success) {
        showNotification('✅ Форма заполнена и отправлена!');
        // Обновляем список аккаунтов
        setTimeout(() => displayAccounts(), 500);
      } else {
        showNotification('❌ ' + (response?.message || 'Не удалось заполнить форму'), true);
      }
    });
    
  } catch (error) {
    showNotification('❌ Ошибка: ' + error.message, true);
  }
});

// Обработчик кнопки "Выход"
logoutBtn.addEventListener('click', async () => {
  try {
    // Проверяем, открыта ли страница looksmm.ru
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    if (tab.url.includes('looksmm.ru/profile/settings')) {
      // Уже на странице настроек
      chrome.tabs.sendMessage(tab.id, { action: 'logout' }, (response) => {
        if (response && response.success) {
          showNotification('✅ Выполняется выход...');
        }
      });
    } else {
      // Открываем страницу настроек
      chrome.tabs.create({
        url: 'https://looksmm.ru/profile/settings'
      }, (newTab) => {
        // Ждем загрузки страницы и выполняем logout
        setTimeout(() => {
          chrome.tabs.sendMessage(newTab.id, { action: 'logout' });
        }, 2000);
        showNotification('✅ Открываем страницу настроек...');
      });
    }
    
  } catch (error) {
    showNotification('❌ Ошибка: ' + error.message, true);
  }
});

// Обработчик кнопки "Экспортировать"
exportBtn.addEventListener('click', exportAccounts);

// Обработчик кнопки "Очистить"
clearBtn.addEventListener('click', clearHistory);

// Слушаем сообщения от content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'saveAccount') {
    loadAccounts().then(accounts => {
      accounts.push(request.data);
      saveAccounts(accounts).then(() => {
        displayAccounts();
      });
    });
  }
});

// Инициализация при загрузке
document.addEventListener('DOMContentLoaded', () => {
  displayAccounts();
});

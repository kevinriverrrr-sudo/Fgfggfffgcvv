// Элементы DOM
const startBtn = document.getElementById('startBtn');
const clearLogsBtn = document.getElementById('clearLogsBtn');
const exportBtn = document.getElementById('exportBtn');
const copyAllBtn = document.getElementById('copyAllBtn');
const status = document.getElementById('status');
const logsList = document.getElementById('logsList');
const totalAccounts = document.getElementById('totalAccounts');

// Загрузка логов при открытии popup
document.addEventListener('DOMContentLoaded', loadLogs);

// Обработчик кнопки "Начать"
startBtn.addEventListener('click', async () => {
  try {
    // Получаем активную вкладку
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    // Проверяем, что мы на Roblox
    if (!tab.url.includes('roblox.com')) {
      updateStatus('Откройте страницу регистрации Roblox!', 'error');
      return;
    }
    
    updateStatus('Запуск автозаполнения...', 'working');
    
    // Отправляем сообщение content script
    chrome.tabs.sendMessage(tab.id, { action: 'startAutoFill' }, (response) => {
      if (chrome.runtime.lastError) {
        updateStatus('Ошибка: перезагрузите страницу Roblox', 'error');
        return;
      }
      
      if (response && response.success) {
        updateStatus('Форма заполнена успешно!', 'success');
        
        // Сохраняем данные в логи
        saveLog(response.data);
      } else {
        updateStatus('Ошибка заполнения формы', 'error');
      }
    });
  } catch (error) {
    updateStatus('Ошибка: ' + error.message, 'error');
  }
});

// Обработчик очистки логов
clearLogsBtn.addEventListener('click', () => {
  if (confirm('Вы уверены? Все логи будут удалены!')) {
    chrome.storage.local.set({ registrationLogs: [] }, () => {
      loadLogs();
      updateStatus('Логи очищены', 'success');
    });
  }
});

// Экспорт в TXT
exportBtn.addEventListener('click', async () => {
  const logs = await getLogs();
  
  if (logs.length === 0) {
    updateStatus('Нет логов для экспорта', 'error');
    return;
  }
  
  let txtContent = '=== ROBLOX REGISTRATION LOGS ===\n\n';
  
  logs.forEach((log, index) => {
    txtContent += `--- Аккаунт #${index + 1} ---\n`;
    txtContent += `Дата: ${log.date}\n`;
    txtContent += `Username: ${log.username}\n`;
    txtContent += `Password: ${log.password}\n`;
    txtContent += `Дата рождения: ${log.birthday}\n`;
    txtContent += `Пол: ${log.gender}\n`;
    txtContent += '\n';
  });
  
  // Создаем и скачиваем файл
  const blob = new Blob([txtContent], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `roblox_accounts_${Date.now()}.txt`;
  a.click();
  URL.revokeObjectURL(url);
  
  updateStatus('Файл экспортирован!', 'success');
});

// Копировать все логи
copyAllBtn.addEventListener('click', async () => {
  const logs = await getLogs();
  
  if (logs.length === 0) {
    updateStatus('Нет логов для копирования', 'error');
    return;
  }
  
  let textContent = '';
  
  logs.forEach((log, index) => {
    textContent += `#${index + 1} | ${log.username} | ${log.password} | ${log.birthday} | ${log.gender}\n`;
  });
  
  navigator.clipboard.writeText(textContent);
  updateStatus('Все логи скопированы!', 'success');
});

// Функция обновления статуса
function updateStatus(message, type = '') {
  status.textContent = message;
  status.className = 'status ' + type;
}

// Сохранение лога
function saveLog(data) {
  chrome.storage.local.get(['registrationLogs'], (result) => {
    const logs = result.registrationLogs || [];
    
    const logEntry = {
      date: new Date().toLocaleString('ru-RU'),
      username: data.username,
      password: data.password,
      birthday: data.birthday,
      gender: data.gender,
      timestamp: Date.now()
    };
    
    logs.unshift(logEntry); // Добавляем в начало
    
    chrome.storage.local.set({ registrationLogs: logs }, () => {
      loadLogs();
    });
  });
}

// Загрузка логов
function loadLogs() {
  chrome.storage.local.get(['registrationLogs'], (result) => {
    const logs = result.registrationLogs || [];
    
    totalAccounts.textContent = logs.length;
    
    if (logs.length === 0) {
      logsList.innerHTML = '<p class="no-logs">Логи пусты. Начните регистрацию!</p>';
      return;
    }
    
    logsList.innerHTML = '';
    
    logs.forEach((log, index) => {
      const logItem = document.createElement('div');
      logItem.className = 'log-item';
      
      logItem.innerHTML = `
        <div class="log-item-header">
          <span class="log-item-date">${log.date}</span>
          <button class="log-item-copy" data-index="${index}">📋 Копировать</button>
        </div>
        <div class="log-item-data">
          <div><strong>Username:</strong> ${log.username}</div>
          <div><strong>Password:</strong> ${log.password}</div>
          <div><strong>Дата рожд.:</strong> ${log.birthday}</div>
          <div><strong>Пол:</strong> ${log.gender}</div>
        </div>
      `;
      
      logsList.appendChild(logItem);
      
      // Добавляем обработчик копирования
      logItem.querySelector('.log-item-copy').addEventListener('click', () => {
        const text = `Username: ${log.username}\nPassword: ${log.password}\nДата рождения: ${log.birthday}\nПол: ${log.gender}`;
        navigator.clipboard.writeText(text);
        updateStatus('Лог скопирован!', 'success');
      });
    });
  });
}

// Получение логов
function getLogs() {
  return new Promise((resolve) => {
    chrome.storage.local.get(['registrationLogs'], (result) => {
      resolve(result.registrationLogs || []);
    });
  });
}

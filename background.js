// Background service worker

// Установка расширения
chrome.runtime.onInstalled.addListener(() => {
  console.log('[LookSMM Auto-Fill] Расширение установлено');
  
  // Инициализируем хранилище
  chrome.storage.local.get(['accounts'], (result) => {
    if (!result.accounts) {
      chrome.storage.local.set({ accounts: [] });
    }
  });
});

// Слушаем сообщения от content script и popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'saveAccount') {
    // Сохраняем аккаунт
    chrome.storage.local.get(['accounts'], (result) => {
      const accounts = result.accounts || [];
      accounts.push(request.data);
      
      chrome.storage.local.set({ accounts: accounts }, () => {
        console.log('[LookSMM Auto-Fill] Аккаунт сохранен:', request.data.email);
        sendResponse({ success: true });
      });
    });
    
    return true; // Асинхронный ответ
  }
});

console.log('[LookSMM Auto-Fill] Background service worker загружен');

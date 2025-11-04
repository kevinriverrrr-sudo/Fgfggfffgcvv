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

// Обработка завершения регистрации и переход на страницу заказа
chrome.webNavigation.onCompleted.addListener(async (details) => {
  if (details.frameId !== 0) return; // Только основной фрейм
  
  // Проверяем, есть ли отложенный заказ
  const data = await chrome.storage.local.get(['pendingOrderUrl', 'pendingOrderLink', 'pendingOrderService']);
  
  if (data.pendingOrderUrl && data.pendingOrderLink) {
    // Проверяем, что мы успешно зарегистрировались (не на странице регистрации)
    if (!details.url.includes('/register') && !details.url.includes('/signup') && details.url.includes('looksmm.ru')) {
      console.log('[LookSMM Auto-Fill] Регистрация завершена, переходим на страницу заказа...');
      
      // Ждем немного для завершения всех операций
      setTimeout(() => {
        // Переходим на страницу заказа
        chrome.tabs.update(details.tabId, { 
          url: data.pendingOrderUrl 
        }, () => {
          // Очищаем временные данные
          chrome.storage.local.remove(['pendingOrderUrl']);
        });
      }, 2000);
    }
  }
  
  // Проверяем, на странице ли мы заказа, и если да - заполняем форму
  if (details.url.includes('/order/free-service/') && data.pendingOrderLink) {
    console.log('[LookSMM Auto-Fill] На странице заказа, заполняем форму...');
    
    setTimeout(() => {
      chrome.tabs.sendMessage(details.tabId, {
        action: 'fillOrderForm',
        link: data.pendingOrderLink,
        quantity: 100
      }, (response) => {
        if (response && response.success) {
          console.log('[LookSMM Auto-Fill] Форма заказа заполнена');
          // Очищаем оставшиеся данные
          chrome.storage.local.remove(['pendingOrderLink', 'pendingOrderService']);
        }
      });
    }, 1500);
  }
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
  } else if (request.action === 'createAccountAndOrder') {
    // Процесс: регистрация + заказ
    handleAccountAndOrder(request, sendResponse);
    return true;
  }
});

// Функция для обработки создания аккаунта и заказа
async function handleAccountAndOrder(request, sendResponse) {
  try {
    const { service, link, serviceUrl } = request;
    
    console.log('[LookSMM Auto-Fill] Начинаем процесс:', service);
    
    // Получаем активную вкладку
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    const currentTab = tabs[0];
    
    if (!currentTab) {
      sendResponse({ success: false, message: 'Не удалось получить активную вкладку' });
      return;
    }
    
    // Проверяем, на какой странице мы находимся
    if (currentTab.url.includes('looksmm.ru')) {
      // Если уже на looksmm.ru, проверяем авторизацию
      // Пробуем сразу перейти на страницу заказа
      chrome.storage.local.set({
        pendingOrderLink: link,
        pendingOrderService: service
      }, () => {
        chrome.tabs.update(currentTab.id, { url: serviceUrl }, () => {
          sendResponse({ success: true });
        });
      });
    } else {
      // Открываем новую вкладку с сайтом
      chrome.tabs.create({ url: 'https://looksmm.ru/' }, (newTab) => {
        // Сохраняем данные для последующего использования
        chrome.storage.local.set({
          pendingOrderUrl: serviceUrl,
          pendingOrderLink: link,
          pendingOrderService: service
        }, () => {
          sendResponse({ success: true });
        });
      });
    }
    
  } catch (error) {
    console.error('[LookSMM Auto-Fill] Ошибка:', error);
    sendResponse({ success: false, message: error.message });
  }
}

console.log('[LookSMM Auto-Fill] Background service worker загружен');

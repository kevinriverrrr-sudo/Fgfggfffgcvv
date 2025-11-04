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

// Обработка завершения загрузки страниц
chrome.webNavigation.onCompleted.addListener(async (details) => {
  if (details.frameId !== 0) return; // Только основной фрейм
  
  // Проверяем, есть ли отложенный заказ
  const data = await chrome.storage.local.get([
    'pendingOrderUrl', 
    'pendingOrderLink', 
    'pendingOrderService',
    'needRegistration',
    'registrationCompleted'
  ]);
  
  console.log('[LookSMM Auto-Fill] 📍 Загружена страница:', details.url);
  console.log('[LookSMM Auto-Fill] 📦 Данные:', data);
  
  // СЦЕНАРИЙ 1: Страница регистрации загружена - запускаем авторегистрацию
  if ((details.url.includes('/signup') || details.url.includes('/register')) && data.needRegistration) {
    console.log('[LookSMM Auto-Fill] 2️⃣ Страница регистрации загружена!');
    console.log('[LookSMM Auto-Fill] 🤖 Запускаем АВТОЗАПОЛНЕНИЕ формы регистрации...');
    
    setTimeout(() => {
      chrome.tabs.sendMessage(details.tabId, {
        action: 'fillForm'  // Используем существующую функцию автозаполнения
      }, (response) => {
        if (chrome.runtime.lastError) {
          console.log('[LookSMM Auto-Fill] ⚠️ Ошибка:', chrome.runtime.lastError.message);
          return;
        }
        
        if (response && response.success) {
          console.log('[LookSMM Auto-Fill] ✅ Форма регистрации заполнена!');
          console.log('[LookSMM Auto-Fill] 3️⃣ Ждём завершения регистрации...');
          
          // Помечаем что регистрация началась
          chrome.storage.local.set({ 
            needRegistration: false,
            registrationInProgress: true 
          });
        } else {
          console.log('[LookSMM Auto-Fill] ❌ Не удалось заполнить форму');
        }
      });
    }, 2000); // Ждем 2 секунды после загрузки страницы
    
    return;
  }
  
  // СЦЕНАРИЙ 2: Регистрация завершена - переходим на страницу заказа
  if (data.pendingOrderUrl && data.pendingOrderLink && !data.needRegistration) {
    // Проверяем, что мы УЖЕ зарегистрированы (не на странице регистрации)
    if (!details.url.includes('/signup') && 
        !details.url.includes('/register') && 
        details.url.includes('looksmm.ru') &&
        !details.url.includes('/order/free-service/')) {
      
      console.log('[LookSMM Auto-Fill] 4️⃣ Регистрация завершена! Переходим на страницу заказа...');
      
      // Ждем немного и переходим на страницу заказа
      setTimeout(() => {
        chrome.tabs.update(details.tabId, { 
          url: data.pendingOrderUrl 
        }, () => {
          console.log('[LookSMM Auto-Fill] 5️⃣ Открываем страницу заказа:', data.pendingOrderUrl);
          // Очищаем флаг
          chrome.storage.local.remove(['pendingOrderUrl', 'registrationInProgress']);
        });
      }, 2000);
      
      return;
    }
  }
  
  // СЦЕНАРИЙ 3: Страница заказа загружена - заполняем форму
  if (details.url.includes('/order/free-service/') && data.pendingOrderLink) {
    console.log('[LookSMM Auto-Fill] 6️⃣ Страница заказа загружена!');
    console.log('[LookSMM Auto-Fill] 🎯 Заполняем форму заказа...');
    
    // Увеличено время ожидания для полной загрузки страницы
    setTimeout(() => {
      chrome.tabs.sendMessage(details.tabId, {
        action: 'fillOrderForm',
        link: data.pendingOrderLink,
        quantity: 100
      }, (response) => {
        if (chrome.runtime.lastError) {
          console.log('[LookSMM Auto-Fill] ⚠️ Ошибка при заполнении:', chrome.runtime.lastError.message);
          
          // Повторная попытка
          setTimeout(() => {
            chrome.tabs.sendMessage(details.tabId, {
              action: 'fillOrderForm',
              link: data.pendingOrderLink,
              quantity: 100
            });
          }, 2000);
          return;
        }
        
        if (response && response.success) {
          console.log('[LookSMM Auto-Fill] 7️⃣ Форма заказа заполнена!');
          console.log('[LookSMM Auto-Fill] 🔘 Ищем и нажимаем синюю кнопку "Получить"...');
          console.log('[LookSMM Auto-Fill] ✅ ГОТОВО! Процесс завершён успешно! 🎉');
          
          // Очищаем все временные данные
          chrome.storage.local.remove([
            'pendingOrderLink', 
            'pendingOrderService',
            'registrationCompleted'
          ]);
        } else {
          console.log('[LookSMM Auto-Fill] ⚠️ Проблема с заполнением формы, повторяем...');
          
          // Повторная попытка через 2 секунды
          setTimeout(() => {
            chrome.tabs.sendMessage(details.tabId, {
              action: 'fillOrderForm',
              link: data.pendingOrderLink,
              quantity: 100
            });
          }, 2000);
        }
      });
    }, 2500);
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
    
    console.log('[LookSMM Auto-Fill] 🚀 Начинаем ПОЛНЫЙ процесс:', service);
    console.log('[LookSMM Auto-Fill] 📝 Ссылка:', link);
    console.log('[LookSMM Auto-Fill] 🎯 URL заказа:', serviceUrl);
    
    // Сохраняем данные для последующего использования
    await chrome.storage.local.set({
      pendingOrderUrl: serviceUrl,
      pendingOrderLink: link,
      pendingOrderService: service,
      needRegistration: true  // Флаг что нужна регистрация
    });
    
    // Получаем активную вкладку
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    const currentTab = tabs[0];
    
    if (!currentTab) {
      sendResponse({ success: false, message: 'Не удалось получить активную вкладку' });
      return;
    }
    
    // ШАГ 1: Открываем страницу регистрации или главную
    console.log('[LookSMM Auto-Fill] ШАГИ:');
    console.log('[LookSMM Auto-Fill] 1️⃣ Открываем страницу для регистрации...');
    
    // Проверяем, на какой странице мы находимся
    if (currentTab.url.includes('looksmm.ru')) {
      // Если уже на looksmm.ru, ищем страницу регистрации
      const registerUrl = 'https://looksmm.ru/signup'; // или /register
      chrome.tabs.update(currentTab.id, { url: registerUrl }, () => {
        console.log('[LookSMM Auto-Fill] ✅ Перешли на страницу регистрации');
        sendResponse({ success: true });
      });
    } else {
      // Открываем страницу регистрации в текущей вкладке
      chrome.tabs.update(currentTab.id, { url: 'https://looksmm.ru/signup' }, () => {
        console.log('[LookSMM Auto-Fill] ✅ Открыли страницу регистрации');
        sendResponse({ success: true });
      });
    }
    
  } catch (error) {
    console.error('[LookSMM Auto-Fill] ❌ Ошибка:', error);
    sendResponse({ success: false, message: error.message });
  }
}

console.log('[LookSMM Auto-Fill] Background service worker загружен');

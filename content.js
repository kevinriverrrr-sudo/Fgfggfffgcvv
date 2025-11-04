// Content script для взаимодействия со страницей looksmm.ru

// Генерация случайного email
function generateRandomEmail() {
  const domains = ['gmail.com', 'yahoo.com', 'outlook.com', 'mail.ru', 'yandex.ru'];
  const randomString = Math.random().toString(36).substring(2, 12);
  const domain = domains[Math.floor(Math.random() * domains.length)];
  return `${randomString}@${domain}`;
}

// Генерация случайного username
function generateRandomUsername() {
  const adjectives = ['Cool', 'Fast', 'Smart', 'Bright', 'Happy', 'Lucky', 'Super', 'Mega'];
  const nouns = ['User', 'Gamer', 'Pro', 'Master', 'King', 'Boss', 'Hero', 'Star'];
  const randomNum = Math.floor(Math.random() * 9999);
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  return `${adj}${noun}${randomNum}`;
}

// Генерация надежного случайного пароля
function generateRandomPassword() {
  const length = 16;
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
  let password = '';
  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return password;
}

// Функция для заполнения формы
function autoFillForm() {
  console.log('[LookSMM Auto-Fill] Начинаем автозаполнение...');
  
  // Генерируем данные
  const email = generateRandomEmail();
  const username = generateRandomUsername();
  const password = generateRandomPassword();
  
  // Ищем поля формы (различные варианты селекторов)
  const emailInputs = document.querySelectorAll('input[type="email"], input[name*="email" i], input[placeholder*="email" i], input[id*="email" i]');
  const usernameInputs = document.querySelectorAll('input[name*="username" i], input[name*="login" i], input[placeholder*="username" i], input[placeholder*="имя пользователя" i], input[id*="username" i]');
  const passwordInputs = document.querySelectorAll('input[type="password"]');
  
  let filled = false;
  
  // Заполняем email
  if (emailInputs.length > 0) {
    emailInputs[0].value = email;
    emailInputs[0].dispatchEvent(new Event('input', { bubbles: true }));
    emailInputs[0].dispatchEvent(new Event('change', { bubbles: true }));
    console.log('[LookSMM Auto-Fill] Email заполнен:', email);
    filled = true;
  }
  
  // Заполняем username
  if (usernameInputs.length > 0) {
    usernameInputs[0].value = username;
    usernameInputs[0].dispatchEvent(new Event('input', { bubbles: true }));
    usernameInputs[0].dispatchEvent(new Event('change', { bubbles: true }));
    console.log('[LookSMM Auto-Fill] Username заполнен:', username);
    filled = true;
  }
  
  // Заполняем пароль (обычно 2 поля - пароль и подтверждение)
  if (passwordInputs.length > 0) {
    passwordInputs.forEach((input, index) => {
      input.value = password;
      input.dispatchEvent(new Event('input', { bubbles: true }));
      input.dispatchEvent(new Event('change', { bubbles: true }));
      console.log(`[LookSMM Auto-Fill] Пароль ${index + 1} заполнен`);
    });
    filled = true;
  }
  
  if (filled) {
    // Сохраняем данные
    const accountData = {
      email: email,
      username: username,
      password: password,
      timestamp: new Date().toISOString(),
      url: window.location.href
    };
    
    // Отправляем данные в popup для сохранения
    chrome.runtime.sendMessage({
      action: 'saveAccount',
      data: accountData
    });
    
    // Ждем немного перед нажатием кнопки
    setTimeout(() => {
      clickCreateAccountButton();
    }, 1000);
    
    return { success: true, data: accountData };
  } else {
    console.log('[LookSMM Auto-Fill] Поля формы не найдены');
    return { success: false, message: 'Поля формы не найдены на странице' };
  }
}

// Функция для нажатия кнопки "Создать аккаунт"
function clickCreateAccountButton() {
  console.log('[LookSMM Auto-Fill] Ищем кнопку создания аккаунта...');
  
  // Различные варианты текста кнопки
  const buttonTexts = [
    'создать аккаунт',
    'зарегистрироваться',
    'регистрация',
    'создать',
    'register',
    'sign up',
    'create account'
  ];
  
  // Ищем кнопку
  const buttons = document.querySelectorAll('button, input[type="submit"], a.btn, .button');
  
  for (let button of buttons) {
    const buttonText = button.textContent.toLowerCase().trim();
    const buttonValue = (button.value || '').toLowerCase().trim();
    
    for (let text of buttonTexts) {
      if (buttonText.includes(text) || buttonValue.includes(text)) {
        console.log('[LookSMM Auto-Fill] Кнопка найдена, нажимаем...');
        button.click();
        return true;
      }
    }
  }
  
  // Если не нашли по тексту, ищем по атрибутам
  const submitButtons = document.querySelectorAll('button[type="submit"], input[type="submit"]');
  if (submitButtons.length > 0) {
    console.log('[LookSMM Auto-Fill] Нажимаем submit кнопку...');
    submitButtons[0].click();
    return true;
  }
  
  console.log('[LookSMM Auto-Fill] Кнопка не найдена');
  return false;
}

// Функция для выхода из аккаунта
function performLogout() {
  console.log('[LookSMM Auto-Fill] Начинаем процесс выхода...');
  
  // Проверяем, на нужной ли мы странице
  if (window.location.href.includes('looksmm.ru/profile/settings')) {
    // Скроллим вниз
    window.scrollTo(0, document.body.scrollHeight);
    
    setTimeout(() => {
      // Ищем кнопку выхода
      const logoutTexts = ['выход', 'выйти', 'logout', 'sign out'];
      const buttons = document.querySelectorAll('button, a.btn, .button, a[href*="logout"]');
      
      for (let button of buttons) {
        const buttonText = button.textContent.toLowerCase().trim();
        
        for (let text of logoutTexts) {
          if (buttonText.includes(text)) {
            console.log('[LookSMM Auto-Fill] Кнопка выхода найдена, нажимаем...');
            button.click();
            return true;
          }
        }
      }
      
      console.log('[LookSMM Auto-Fill] Кнопка выхода не найдена');
      return false;
    }, 1000);
  } else {
    // Если не на странице настроек, перенаправляем
    console.log('[LookSMM Auto-Fill] Перенаправление на страницу настроек...');
    window.location.href = 'https://looksmm.ru/profile/settings';
  }
}

// Функция для заполнения формы заказа
function fillOrderForm(link, quantity = 100) {
  console.log('[LookSMM Auto-Fill] Заполняем форму заказа...');
  
  // Ищем поле для ссылки
  const linkInputs = document.querySelectorAll(
    'input[name*="link" i], input[name*="url" i], input[placeholder*="ссылк" i], ' +
    'input[placeholder*="link" i], input[id*="link" i], input[type="text"], input[type="url"]'
  );
  
  // Ищем поле количества
  const quantityInputs = document.querySelectorAll(
    'input[name*="quantity" i], input[name*="amount" i], input[name*="count" i], ' +
    'input[placeholder*="количество" i], input[placeholder*="quantity" i], input[type="number"]'
  );
  
  let filled = false;
  
  // Заполняем ссылку
  if (linkInputs.length > 0) {
    // Находим первое видимое поле
    for (let input of linkInputs) {
      if (input.offsetParent !== null) { // Проверяем, что элемент видим
        input.value = link;
        input.dispatchEvent(new Event('input', { bubbles: true }));
        input.dispatchEvent(new Event('change', { bubbles: true }));
        console.log('[LookSMM Auto-Fill] Ссылка заполнена:', link);
        filled = true;
        break;
      }
    }
  }
  
  // Заполняем количество
  if (quantityInputs.length > 0) {
    for (let input of quantityInputs) {
      if (input.offsetParent !== null) {
        input.value = quantity;
        input.dispatchEvent(new Event('input', { bubbles: true }));
        input.dispatchEvent(new Event('change', { bubbles: true }));
        console.log('[LookSMM Auto-Fill] Количество заполнено:', quantity);
        filled = true;
        break;
      }
    }
  }
  
  if (filled) {
    // Ждем немного и нажимаем кнопку (увеличено время для загрузки)
    console.log('[LookSMM Auto-Fill] ⏳ Ждем 2 секунды перед поиском кнопки...');
    setTimeout(() => {
      const clicked = clickSubmitButton();
      if (!clicked) {
        // Пробуем еще раз через секунду
        console.log('[LookSMM Auto-Fill] ⚠️ Первая попытка не удалась, пробуем снова...');
        setTimeout(() => {
          clickSubmitButton();
        }, 1000);
      }
    }, 2000);
    
    return { success: true };
  } else {
    console.log('[LookSMM Auto-Fill] Поля формы заказа не найдены');
    return { success: false, message: 'Поля формы не найдены' };
  }
}

// Функция для нажатия кнопки "Получить" или "Submit" (УЛУЧШЕННАЯ ВЕРСИЯ)
function clickSubmitButton() {
  console.log('[LookSMM Auto-Fill] 🔍 Начинаем МЕГА-поиск синей кнопки "Получить"...');
  
  const buttonTexts = [
    'получить',
    'заказать',
    'отправить',
    'submit',
    'order',
    'send',
    'добавить',
    'оформить'
  ];
  
  // СТРАТЕГИЯ 1: Поиск кнопок с текстом "получить" и синими классами
  console.log('[LookSMM Auto-Fill] Стратегия 1: Поиск по тексту и синим классам...');
  const blueButtonClasses = [
    '.btn-primary',
    '.btn-info', 
    '.btn-blue',
    '.btn-success',
    'button.btn-primary',
    'button.btn-info',
    'a.btn-primary',
    'a.btn-info'
  ];
  
  for (let className of blueButtonClasses) {
    const buttons = document.querySelectorAll(className);
    console.log(`[LookSMM Auto-Fill] Найдено ${buttons.length} кнопок с классом ${className}`);
    
    for (let button of buttons) {
      if (button.offsetParent === null) continue;
      
      const buttonText = button.textContent.toLowerCase().trim();
      console.log(`[LookSMM Auto-Fill] Проверяем кнопку: "${buttonText}"`);
      
      for (let text of buttonTexts) {
        if (buttonText.includes(text)) {
          console.log(`[LookSMM Auto-Fill] ✅ НАЙДЕНА! Синяя кнопка "${buttonText}" - НАЖИМАЕМ!`);
          button.click();
          return true;
        }
      }
    }
  }
  
  // СТРАТЕГИЯ 2: Поиск ВСЕХ кнопок и проверка текста
  console.log('[LookSMM Auto-Fill] Стратегия 2: Поиск всех кнопок по тексту...');
  const allButtons = document.querySelectorAll('button, input[type="submit"], a.btn, .btn, .button, [role="button"]');
  console.log(`[LookSMM Auto-Fill] Всего найдено кнопок: ${allButtons.length}`);
  
  for (let button of allButtons) {
    if (button.offsetParent === null) continue;
    
    const buttonText = button.textContent.toLowerCase().trim();
    const buttonValue = (button.value || '').toLowerCase().trim();
    
    if (buttonText || buttonValue) {
      console.log(`[LookSMM Auto-Fill] Проверяем: "${buttonText}" / "${buttonValue}"`);
    }
    
    for (let text of buttonTexts) {
      if (buttonText.includes(text) || buttonValue.includes(text)) {
        console.log(`[LookSMM Auto-Fill] ✅ НАЙДЕНА! Кнопка "${buttonText || buttonValue}" - НАЖИМАЕМ!`);
        button.click();
        return true;
      }
    }
  }
  
  // СТРАТЕГИЯ 3: Поиск по атрибуту type="submit"
  console.log('[LookSMM Auto-Fill] Стратегия 3: Поиск submit кнопок...');
  const submitButtons = document.querySelectorAll('button[type="submit"], input[type="submit"]');
  console.log(`[LookSMM Auto-Fill] Найдено submit кнопок: ${submitButtons.length}`);
  
  for (let button of submitButtons) {
    if (button.offsetParent !== null) {
      const buttonText = button.textContent.toLowerCase().trim();
      console.log(`[LookSMM Auto-Fill] ✅ НАЙДЕНА submit кнопка "${buttonText}" - НАЖИМАЕМ!`);
      button.click();
      return true;
    }
  }
  
  // СТРАТЕГИЯ 4: ЯДЕРНАЯ ОПЦИЯ - ищем любую видимую синюю кнопку
  console.log('[LookSMM Auto-Fill] Стратегия 4: ЯДЕРНАЯ ОПЦИЯ - поиск любой синей кнопки...');
  for (let button of allButtons) {
    if (button.offsetParent === null) continue;
    
    // Проверяем стили кнопки
    const computedStyle = window.getComputedStyle(button);
    const bgColor = computedStyle.backgroundColor;
    const color = computedStyle.color;
    
    // Проверяем, есть ли синий цвет (RGB значения содержат синий)
    const isBlueish = bgColor.includes('rgb') && (
      bgColor.includes('0, 123') || // Bootstrap primary
      bgColor.includes('13, 110') || // Darker blue
      bgColor.includes('23, 162') || // Light blue
      bgColor.includes('52, 144') || // Medium blue
      bgColor.match(/rgb\(\s*\d+,\s*\d+,\s*[2-9]\d+/) // Any blue-ish
    );
    
    if (isBlueish) {
      const buttonText = button.textContent.toLowerCase().trim();
      console.log(`[LookSMM Auto-Fill] Найдена СИНЯЯ кнопка: "${buttonText}" (цвет: ${bgColor})`);
      
      // Если в тексте есть что-то про получение/заказ - жмём!
      if (buttonText.length > 0 && buttonText.length < 50) {
        console.log(`[LookSMM Auto-Fill] ✅ НАЖИМАЕМ синюю кнопку "${buttonText}"!`);
        button.click();
        return true;
      }
    }
  }
  
  // СТРАТЕГИЯ 5: Последняя попытка - первая видимая кнопка на странице
  console.log('[LookSMM Auto-Fill] Стратегия 5: Нажимаем первую видимую кнопку...');
  for (let button of allButtons) {
    if (button.offsetParent !== null && button.textContent.trim().length > 0) {
      const buttonText = button.textContent.trim();
      console.log(`[LookSMM Auto-Fill] ⚠️ Нажимаем первую попавшуюся кнопку: "${buttonText}"`);
      button.click();
      return true;
    }
  }
  
  console.log('[LookSMM Auto-Fill] ❌ КНОПКА НЕ НАЙДЕНА! Выводим все кнопки на странице:');
  allButtons.forEach((btn, index) => {
    console.log(`  Кнопка ${index + 1}: "${btn.textContent.trim()}" - видима: ${btn.offsetParent !== null}`);
  });
  
  return false;
}

// Слушаем сообщения от popup и background
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('[LookSMM Auto-Fill] Получено сообщение:', request.action);
  
  if (request.action === 'fillForm') {
    const result = autoFillForm();
    sendResponse(result);
  } else if (request.action === 'logout') {
    performLogout();
    sendResponse({ success: true });
  } else if (request.action === 'fillOrderForm') {
    const result = fillOrderForm(request.link, request.quantity || 100);
    sendResponse(result);
  } else if (request.action === 'fillFormAndGoToOrder') {
    // Сначала заполняем форму регистрации
    const result = autoFillForm();
    if (result.success) {
      // После успешной регистрации, сохраняем URL для перехода
      chrome.storage.local.set({ 
        pendingOrderUrl: request.orderUrl,
        pendingOrderLink: request.link,
        pendingOrderService: request.service
      });
    }
    sendResponse(result);
  }
  
  return true; // Асинхронный ответ
});

console.log('[LookSMM Auto-Fill] Content script загружен');

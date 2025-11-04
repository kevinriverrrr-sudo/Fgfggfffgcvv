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

// Слушаем сообщения от popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('[LookSMM Auto-Fill] Получено сообщение:', request.action);
  
  if (request.action === 'fillForm') {
    const result = autoFillForm();
    sendResponse(result);
  } else if (request.action === 'logout') {
    performLogout();
    sendResponse({ success: true });
  }
  
  return true; // Асинхронный ответ
});

console.log('[LookSMM Auto-Fill] Content script загружен');

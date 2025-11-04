// Content script для автоматического заполнения формы регистрации Roblox

// Генераторы случайных данных
const usernameGenerator = {
  prefixes: ['Cool', 'Super', 'Epic', 'Mega', 'Pro', 'Ultra', 'Dark', 'Fire', 'Ice', 'Thunder', 
             'Shadow', 'Ninja', 'Dragon', 'Phoenix', 'Storm', 'Cyber', 'Neon', 'Turbo', 'Hyper', 'Alpha'],
  words: ['Gamer', 'Player', 'Master', 'King', 'Queen', 'Lord', 'Warrior', 'Hunter', 'Rider', 'Fighter',
          'Slayer', 'Knight', 'Legend', 'Hero', 'Demon', 'Angel', 'Ghost', 'Wolf', 'Tiger', 'Eagle'],
  suffixes: ['123', '456', '789', 'X', 'XD', 'Pro', 'YT', '007', '99', 'HD', '2024', '2025'],
  
  generate() {
    const prefix = this.prefixes[Math.floor(Math.random() * this.prefixes.length)];
    const word = this.words[Math.floor(Math.random() * this.words.length)];
    const suffix = Math.random() > 0.5 ? this.suffixes[Math.floor(Math.random() * this.suffixes.length)] : '';
    return prefix + word + suffix;
  }
};

const passwordGenerator = {
  chars: 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*',
  
  generate(length = 12) {
    let password = '';
    for (let i = 0; i < length; i++) {
      password += this.chars.charAt(Math.floor(Math.random() * this.chars.length));
    }
    return password;
  }
};

const birthdayGenerator = {
  generate() {
    // Генерируем возраст от 13 до 25 лет
    const currentYear = new Date().getFullYear();
    const birthYear = currentYear - (13 + Math.floor(Math.random() * 13)); // 13-25 лет
    const month = Math.floor(Math.random() * 12) + 1; // 1-12
    const day = Math.floor(Math.random() * 28) + 1; // 1-28 (безопасно для всех месяцев)
    
    return {
      month: month,
      day: day,
      year: birthYear
    };
  }
};

const genderOptions = ['Male', 'Female'];

// Вспомогательная функция для задержки
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Функция для установки значения в поле input
function setInputValue(element, value) {
  if (!element) return false;
  
  const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
  nativeInputValueSetter.call(element, value);
  
  const event = new Event('input', { bubbles: true });
  element.dispatchEvent(event);
  
  const changeEvent = new Event('change', { bubbles: true });
  element.dispatchEvent(changeEvent);
  
  return true;
}

// Функция для клика по элементу
function clickElement(element) {
  if (!element) return false;
  
  element.click();
  const event = new MouseEvent('click', {
    view: window,
    bubbles: true,
    cancelable: true
  });
  element.dispatchEvent(event);
  
  return true;
}

// Основная функция автозаполнения
async function autoFillRegistration() {
  try {
    console.log('Начало автозаполнения формы Roblox...');
    
    // Генерируем данные
    const username = usernameGenerator.generate();
    const password = passwordGenerator.generate();
    const birthday = birthdayGenerator.generate();
    const gender = genderOptions[Math.floor(Math.random() * genderOptions.length)];
    
    console.log('Сгенерированные данные:', { username, password, birthday, gender });
    
    // Ждем загрузки формы
    await delay(1000);
    
    // Различные селекторы для формы регистрации Roblox
    // Пробуем разные варианты, так как Roblox может менять селекторы
    
    // 1. Заполняем месяц рождения
    const monthSelectors = [
      '#MonthDropdown',
      'select[id*="month" i]',
      'select[name*="month" i]',
      'select.form-control.input-field[aria-label*="Month"]',
      '#signup-birthdaymonth'
    ];
    
    let monthSelect = null;
    for (const selector of monthSelectors) {
      monthSelect = document.querySelector(selector);
      if (monthSelect) break;
    }
    
    if (monthSelect) {
      monthSelect.value = birthday.month;
      monthSelect.dispatchEvent(new Event('change', { bubbles: true }));
      console.log('Месяц установлен:', birthday.month);
      await delay(300);
    }
    
    // 2. Заполняем день рождения
    const daySelectors = [
      '#DayDropdown',
      'select[id*="day" i]',
      'select[name*="day" i]',
      'select.form-control.input-field[aria-label*="Day"]',
      '#signup-birthdayday'
    ];
    
    let daySelect = null;
    for (const selector of daySelectors) {
      daySelect = document.querySelector(selector);
      if (daySelect) break;
    }
    
    if (daySelect) {
      daySelect.value = birthday.day;
      daySelect.dispatchEvent(new Event('change', { bubbles: true }));
      console.log('День установлен:', birthday.day);
      await delay(300);
    }
    
    // 3. Заполняем год рождения
    const yearSelectors = [
      '#YearDropdown',
      'select[id*="year" i]',
      'select[name*="year" i]',
      'select.form-control.input-field[aria-label*="Year"]',
      '#signup-birthdayyear'
    ];
    
    let yearSelect = null;
    for (const selector of yearSelectors) {
      yearSelect = document.querySelector(selector);
      if (yearSelect) break;
    }
    
    if (yearSelect) {
      yearSelect.value = birthday.year;
      yearSelect.dispatchEvent(new Event('change', { bubbles: true }));
      console.log('Год установлен:', birthday.year);
      await delay(500);
    }
    
    // 4. Заполняем username
    const usernameSelectors = [
      '#signup-username',
      'input[id*="username" i]',
      'input[name*="username" i]',
      'input[type="text"][placeholder*="username" i]',
      'input.form-control.input-field[placeholder*="Username"]'
    ];
    
    let usernameInput = null;
    for (const selector of usernameSelectors) {
      usernameInput = document.querySelector(selector);
      if (usernameInput) break;
    }
    
    if (usernameInput) {
      setInputValue(usernameInput, username);
      console.log('Username установлен:', username);
      await delay(500);
    }
    
    // 5. Заполняем password
    const passwordSelectors = [
      '#signup-password',
      'input[id*="password" i]',
      'input[name*="password" i]',
      'input[type="password"]',
      'input.form-control.input-field[type="password"]'
    ];
    
    let passwordInput = null;
    for (const selector of passwordSelectors) {
      passwordInput = document.querySelector(selector);
      if (passwordInput) break;
    }
    
    if (passwordInput) {
      setInputValue(passwordInput, password);
      console.log('Password установлен');
      await delay(500);
    }
    
    // 6. Выбираем пол (опционально)
    const genderSelectors = [
      `input[type="radio"][value="${gender}"]`,
      `input[id*="${gender.toLowerCase()}"]`,
      `button[data-testid*="gender-${gender.toLowerCase()}"]`,
      `.gender-button[data-gender="${gender}"]`
    ];
    
    let genderInput = null;
    for (const selector of genderSelectors) {
      genderInput = document.querySelector(selector);
      if (genderInput) break;
    }
    
    if (genderInput) {
      clickElement(genderInput);
      console.log('Пол установлен:', gender);
      await delay(300);
    }
    
    // Формируем строку с датой рождения для логов
    const birthdayString = `${birthday.month.toString().padStart(2, '0')}/${birthday.day.toString().padStart(2, '0')}/${birthday.year}`;
    
    console.log('Автозаполнение завершено успешно!');
    
    return {
      success: true,
      data: {
        username: username,
        password: password,
        birthday: birthdayString,
        gender: gender
      }
    };
    
  } catch (error) {
    console.error('Ошибка при автозаполнении:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Слушаем сообщения от popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'startAutoFill') {
    autoFillRegistration().then(sendResponse);
    return true; // Асинхронный ответ
  }
});

console.log('Roblox Auto Register content script загружен');

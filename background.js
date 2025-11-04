// Генератор случайных писем
const emailTemplates = [
    {
        from: 'support@amazon.com',
        subject: 'Подтверждение заказа #${orderNum}',
        body: 'Здравствуйте!\n\nВаш заказ #${orderNum} был успешно оформлен.\n\nСпасибо за покупку!\nКоманда Amazon'
    },
    {
        from: 'no-reply@github.com',
        subject: 'Новый коммит в репозитории',
        body: 'Пользователь ${user} сделал коммит в репозиторий.\n\nИзменения:\n- Обновлен README.md\n- Добавлены новые функции\n\nGitHub Team'
    },
    {
        from: 'newsletter@techcrunch.com',
        subject: 'TechCrunch Daily: ${topic}',
        body: 'Главные новости технологий сегодня:\n\n1. ${topic}\n2. Новый стартап привлек $${amount}M\n3. Обновление популярного сервиса\n\nЧитайте полностью на TechCrunch'
    },
    {
        from: 'notifications@twitter.com',
        subject: '${count} новых уведомлений',
        body: 'У вас ${count} новых уведомлений в Twitter:\n\n- ${user1} упомянул вас\n- ${user2} лайкнул ваш твит\n- Новый подписчик\n\nПерейти в Twitter'
    },
    {
        from: 'security@paypal.com',
        subject: 'Подтверждение входа в аккаунт',
        body: 'Здравствуйте,\n\nМы заметили вход в ваш аккаунт с нового устройства.\n\nВремя: ${time}\nУстройство: ${device}\n\nЕсли это были не вы, смените пароль.\n\nPayPal Security Team'
    },
    {
        from: 'hello@stripe.com',
        subject: 'Новый платеж на $${amount}',
        body: 'Поздравляем!\n\nВы получили новый платеж на сумму $${amount}\n\nПлательщик: ${payer}\nДата: ${date}\n\nStripe'
    },
    {
        from: 'team@slack.com',
        subject: 'Приглашение в workspace "${workspace}"',
        body: '${inviter} приглашает вас присоединиться к workspace "${workspace}" в Slack.\n\nПринять приглашение: [Ссылка]\n\nSlack Team'
    },
    {
        from: 'updates@linkedin.com',
        subject: 'У вас ${count} новых просмотров профиля',
        body: 'Ваш профиль просмотрели ${count} человек за последнюю неделю.\n\nПопулярные вакансии:\n- Senior Developer at ${company}\n- Product Manager\n- UI/UX Designer\n\nLinkedIn'
    },
    {
        from: 'noreply@reddit.com',
        subject: 'Топ-посты из r/${subreddit}',
        body: 'Популярные посты сегодня:\n\n1. ${post1}\n2. ${post2}\n3. ${post3}\n\nПродолжайте читать на Reddit'
    },
    {
        from: 'info@booking.com',
        subject: 'Подтверждение бронирования',
        body: 'Бронирование подтверждено!\n\nОтель: ${hotel}\nЗаезд: ${checkin}\nВыезд: ${checkout}\n\nНомер бронирования: ${bookingNum}\n\nBooking.com'
    },
    {
        from: 'notifications@discord.com',
        subject: '${count} новых сообщений в Discord',
        body: 'У вас непрочитанные сообщения:\n\n- ${server1}: ${count1} сообщений\n- ${server2}: ${count2} сообщений\n\nОткрыть Discord'
    },
    {
        from: 'support@steam.com',
        subject: 'Распродажа Steam: скидки до ${discount}%',
        body: 'Не пропустите распродажу!\n\nИгры со скидкой:\n- ${game1}: -${discount}%\n- ${game2}: -75%\n- ${game3}: -50%\n\nПредложение ограничено!\nSteam'
    }
];

// Случайные данные для подстановки
const randomData = {
    orderNum: () => Math.floor(100000 + Math.random() * 900000),
    user: () => ['alexdev', 'john_code', 'sarah_tech', 'mike_web', 'anna_design'][Math.floor(Math.random() * 5)],
    topic: () => ['AI достиг нового уровня', 'Квантовые компьютеры', 'Новая ОС выпущена', 'Прорыв в робототехнике'][Math.floor(Math.random() * 4)],
    amount: () => Math.floor(1 + Math.random() * 100),
    count: () => Math.floor(1 + Math.random() * 20),
    user1: () => '@tech_guru',
    user2: () => '@code_ninja',
    time: () => new Date().toLocaleTimeString('ru-RU'),
    device: () => ['Chrome на Windows', 'Safari на iPhone', 'Firefox на Mac'][Math.floor(Math.random() * 3)],
    payer: () => ['John Smith', 'Maria Garcia', 'David Lee'][Math.floor(Math.random() * 3)],
    date: () => new Date().toLocaleDateString('ru-RU'),
    inviter: () => ['Александр', 'Мария', 'Дмитрий'][Math.floor(Math.random() * 3)],
    workspace: () => ['Tech Startup', 'Dev Team', 'Marketing Hub'][Math.floor(Math.random() * 3)],
    company: () => ['Google', 'Microsoft', 'Apple', 'Meta'][Math.floor(Math.random() * 4)],
    subreddit: () => ['programming', 'webdev', 'javascript', 'technology'][Math.floor(Math.random() * 4)],
    post1: () => 'Интересная статья о программировании',
    post2: () => 'Новый фреймворк для разработки',
    post3: () => 'Обсуждение лучших практик',
    hotel: () => ['Grand Hotel', 'Beach Resort', 'City Center Inn'][Math.floor(Math.random() * 3)],
    checkin: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('ru-RU'),
    checkout: () => new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toLocaleDateString('ru-RU'),
    bookingNum: () => 'BK' + Math.floor(100000 + Math.random() * 900000),
    server1: () => 'Dev Chat',
    server2: () => 'Gaming Squad',
    count1: () => Math.floor(1 + Math.random() * 10),
    count2: () => Math.floor(1 + Math.random() * 10),
    game1: () => ['Cyberpunk 2077', 'Elden Ring', 'Red Dead 2'][Math.floor(Math.random() * 3)],
    game2: () => ['GTA V', 'Witcher 3', 'Skyrim'][Math.floor(Math.random() * 3)],
    game3: () => ['Portal 2', 'Half-Life', 'CS:GO'][Math.floor(Math.random() * 3)],
    discount: () => Math.floor(30 + Math.random() * 60)
};

// Заполнить шаблон случайными данными
function fillTemplate(template) {
    let subject = template.subject;
    let body = template.body;
    
    // Заменить все плейсхолдеры
    const placeholders = (subject + body).match(/\$\{(\w+)\}/g) || [];
    const used = {};
    
    placeholders.forEach(placeholder => {
        const key = placeholder.slice(2, -1);
        if (!used[key] && randomData[key]) {
            used[key] = randomData[key]();
        }
    });
    
    Object.keys(used).forEach(key => {
        const regex = new RegExp(`\\$\\{${key}\\}`, 'g');
        subject = subject.replace(regex, used[key]);
        body = body.replace(regex, used[key]);
    });
    
    return {
        from: template.from,
        subject: subject,
        body: body,
        preview: body.split('\n')[0].substring(0, 80) + '...',
        time: Date.now(),
        read: false
    };
}

// Генерировать случайное письмо
function generateRandomEmail() {
    const template = emailTemplates[Math.floor(Math.random() * emailTemplates.length)];
    return fillTemplate(template);
}

// Добавить новое письмо
async function addNewEmail() {
    const result = await chrome.storage.local.get(['emails', 'currentEmail']);
    
    if (!result.currentEmail) {
        return; // Нет активного email
    }
    
    const emails = result.emails || [];
    const newEmail = generateRandomEmail();
    emails.unshift(newEmail); // Добавить в начало
    
    // Ограничить количество писем до 50
    if (emails.length > 50) {
        emails.pop();
    }
    
    await chrome.storage.local.set({ emails: emails });
    
    // Уведомить popup
    chrome.runtime.sendMessage({ action: 'newEmail', emails: emails });
}

// Запустить генерацию писем
function startEmailGeneration() {
    // Отменить старые алармы
    chrome.alarms.clear('generateEmail');
    
    // Создать новый аларм - письма каждые 2-5 минут
    chrome.alarms.create('generateEmail', {
        delayInMinutes: 0.5, // Первое письмо через 30 секунд
        periodInMinutes: 2
    });
}

// Слушать сообщения от popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'startEmailGeneration') {
        startEmailGeneration();
        
        // Сразу добавить 1-2 письма для демонстрации
        setTimeout(() => addNewEmail(), 2000);
        setTimeout(() => addNewEmail(), 5000);
    }
});

// Слушать алармы
chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === 'generateEmail') {
        // Случайно добавить 1 или 2 письма
        const count = Math.random() > 0.7 ? 2 : 1;
        for (let i = 0; i < count; i++) {
            setTimeout(() => addNewEmail(), i * 3000);
        }
    }
});

// При установке расширения
chrome.runtime.onInstalled.addListener(() => {
    console.log('XRocket Temp Email установлен!');
});

// RanobeLib Auto Reader Content Script
(function() {
    'use strict';

    let isAutoReading = false;
    let autoReadButton = null;
    let scrollSpeed = 50; // мс между прокрутками
    let scrollStep = 100; // пикселей за раз
    let chapterDelay = 2000; // задержка перед переходом к следующей главе (мс)
    let currentScrollTimeout = null;

    // Настройки из хранилища
    chrome.storage.sync.get({
        scrollSpeed: 50,
        scrollStep: 100,
        chapterDelay: 2000
    }, function(items) {
        scrollSpeed = items.scrollSpeed;
        scrollStep = items.scrollStep;
        chapterDelay = items.chapterDelay;
    });

    // Проверка, что мы на странице чтения главы
    function isChapterPage() {
        return window.location.pathname.includes('/read/');
    }

    // Создание кнопки автоматического чтения
    function createAutoReadButton() {
        if (autoReadButton) return;

        const button = document.createElement('button');
        button.id = 'ranobelib-auto-read-btn';
        button.innerHTML = '📝 Авто-чтение';
        button.className = 'auto-read-button';
        button.title = 'Нажмите для автоматического чтения';
        
        button.addEventListener('click', toggleAutoRead);
        
        document.body.appendChild(button);
        autoReadButton = button;
    }

    // Переключение режима автоматического чтения
    function toggleAutoRead() {
        if (isAutoReading) {
            stopAutoRead();
        } else {
            startAutoRead();
        }
    }

    // Начать автоматическое чтение
    function startAutoRead() {
        isAutoReading = true;
        updateButtonState();
        console.log('Автоматическое чтение началось');
        autoScroll();
    }

    // Остановить автоматическое чтение
    function stopAutoRead() {
        isAutoReading = false;
        if (currentScrollTimeout) {
            clearTimeout(currentScrollTimeout);
            currentScrollTimeout = null;
        }
        updateButtonState();
        console.log('Автоматическое чтение остановлено');
    }

    // Обновить состояние кнопки
    function updateButtonState() {
        if (!autoReadButton) return;
        
        if (isAutoReading) {
            autoReadButton.innerHTML = '⏸️ Пауза';
            autoReadButton.classList.add('active');
        } else {
            autoReadButton.innerHTML = '📝 Авто-чтение';
            autoReadButton.classList.remove('active');
        }
    }

    // Автоматическая прокрутка страницы
    function autoScroll() {
        if (!isAutoReading) return;

        const currentScroll = window.pageYOffset || document.documentElement.scrollTop;
        const maxScroll = document.documentElement.scrollHeight - window.innerHeight;

        // Проверяем, достигли ли конца страницы
        if (currentScroll >= maxScroll - 50) {
            console.log('Достигнут конец главы');
            handleChapterEnd();
            return;
        }

        // Прокручиваем вниз
        window.scrollBy({
            top: scrollStep,
            behavior: 'smooth'
        });

        // Продолжаем прокрутку
        currentScrollTimeout = setTimeout(autoScroll, scrollSpeed);
    }

    // Обработка конца главы
    function handleChapterEnd() {
        console.log('Переход к следующей главе через', chapterDelay, 'мс');
        
        // Небольшая задержка, чтобы сайт засчитал прочтение
        setTimeout(() => {
            if (!isAutoReading) return;
            
            const nextButton = findNextChapterButton();
            if (nextButton) {
                console.log('Найдена кнопка следующей главы, переходим...');
                nextButton.click();
                
                // Ждем загрузки новой страницы и начинаем снова
                setTimeout(() => {
                    window.scrollTo(0, 0);
                    if (isAutoReading) {
                        autoScroll();
                    }
                }, 1000);
            } else {
                console.log('Следующая глава не найдена, останавливаем чтение');
                stopAutoRead();
                alert('Достигнут конец доступных глав!');
            }
        }, chapterDelay);
    }

    // Поиск кнопки следующей главы
    function findNextChapterButton() {
        // Различные селекторы для кнопки "Следующая глава"
        const selectors = [
            'a.reader-navigation__button_next',
            'a[data-direction="next"]',
            'a.next-chapter',
            'a[href*="/read/"][title*="Следующ"]',
            'button.next-chapter',
            '.reader-header-actions button[data-direction="next"]',
            'a.btn-next',
            '.chapter-navigation a.next'
        ];

        for (const selector of selectors) {
            const button = document.querySelector(selector);
            if (button && !button.disabled && !button.classList.contains('disabled')) {
                return button;
            }
        }

        // Дополнительный поиск по тексту
        const links = document.querySelectorAll('a');
        for (const link of links) {
            const text = link.textContent.toLowerCase();
            if (text.includes('следующ') || text.includes('next') || link.title.toLowerCase().includes('следующ')) {
                return link;
            }
        }

        // Поиск стрелки вправо
        const arrows = document.querySelectorAll('a[href*="/read/"], button');
        for (const arrow of arrows) {
            if (arrow.innerHTML.includes('→') || arrow.innerHTML.includes('»') || arrow.innerHTML.includes('&rarr;')) {
                return arrow;
            }
        }

        return null;
    }

    // Обработка навигации (для SPA)
    function handleNavigation() {
        if (isChapterPage()) {
            if (!autoReadButton) {
                createAutoReadButton();
            }
        } else {
            if (autoReadButton) {
                stopAutoRead();
            }
        }
    }

    // Инициализация
    function init() {
        if (isChapterPage()) {
            createAutoReadButton();
        }

        // Отслеживание изменений URL для SPA
        let lastUrl = location.href;
        new MutationObserver(() => {
            const url = location.href;
            if (url !== lastUrl) {
                lastUrl = url;
                handleNavigation();
            }
        }).observe(document, {subtree: true, childList: true});

        // Горячие клавиши
        document.addEventListener('keydown', (e) => {
            // Ctrl + Shift + A для переключения автоматического чтения
            if (e.ctrlKey && e.shiftKey && e.key === 'A') {
                e.preventDefault();
                if (isChapterPage()) {
                    toggleAutoRead();
                }
            }
        });
    }

    // Запуск после полной загрузки страницы
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Слушаем сообщения от popup
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        if (request.action === 'toggleAutoRead') {
            if (isChapterPage()) {
                toggleAutoRead();
                sendResponse({success: true, isReading: isAutoReading});
            } else {
                sendResponse({success: false, error: 'Не на странице главы'});
            }
        } else if (request.action === 'getStatus') {
            sendResponse({isReading: isAutoReading, isChapterPage: isChapterPage()});
        } else if (request.action === 'updateSettings') {
            scrollSpeed = request.settings.scrollSpeed;
            scrollStep = request.settings.scrollStep;
            chapterDelay = request.settings.chapterDelay;
            sendResponse({success: true});
        }
        return true;
    });

})();

// Popup script for RanobeLib Auto Reader

document.addEventListener('DOMContentLoaded', function() {
    const scrollSpeedInput = document.getElementById('scrollSpeed');
    const scrollStepInput = document.getElementById('scrollStep');
    const chapterDelayInput = document.getElementById('chapterDelay');
    
    const scrollSpeedValue = document.getElementById('scrollSpeedValue');
    const scrollStepValue = document.getElementById('scrollStepValue');
    const chapterDelayValue = document.getElementById('chapterDelayValue');
    
    const saveButton = document.getElementById('saveButton');
    const statusText = document.getElementById('statusText');

    // Загрузка сохраненных настроек
    chrome.storage.sync.get({
        scrollSpeed: 50,
        scrollStep: 100,
        chapterDelay: 2000
    }, function(items) {
        scrollSpeedInput.value = items.scrollSpeed;
        scrollStepInput.value = items.scrollStep;
        chapterDelayInput.value = items.chapterDelay;
        
        updateValueDisplays();
    });

    // Обновление отображаемых значений
    function updateValueDisplays() {
        scrollSpeedValue.textContent = scrollSpeedInput.value + 'мс';
        scrollStepValue.textContent = scrollStepInput.value + 'px';
        chapterDelayValue.textContent = (chapterDelayInput.value / 1000).toFixed(1) + 'с';
    }

    // Обновление значений при изменении слайдеров
    scrollSpeedInput.addEventListener('input', updateValueDisplays);
    scrollStepInput.addEventListener('input', updateValueDisplays);
    chapterDelayInput.addEventListener('input', updateValueDisplays);

    // Сохранение настроек
    saveButton.addEventListener('click', function() {
        const settings = {
            scrollSpeed: parseInt(scrollSpeedInput.value),
            scrollStep: parseInt(scrollStepInput.value),
            chapterDelay: parseInt(chapterDelayInput.value)
        };

        chrome.storage.sync.set(settings, function() {
            // Уведомление пользователя об успешном сохранении
            const originalText = saveButton.textContent;
            saveButton.textContent = '✓ Сохранено!';
            saveButton.style.background = '#4ade80';
            saveButton.style.color = 'white';

            // Отправка обновленных настроек в content script
            chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
                if (tabs[0]) {
                    chrome.tabs.sendMessage(tabs[0].id, {
                        action: 'updateSettings',
                        settings: settings
                    });
                }
            });

            setTimeout(function() {
                saveButton.textContent = originalText;
                saveButton.style.background = '';
                saveButton.style.color = '';
            }, 2000);
        });
    });

    // Проверка статуса
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        if (tabs[0]) {
            chrome.tabs.sendMessage(tabs[0].id, {action: 'getStatus'}, function(response) {
                if (chrome.runtime.lastError) {
                    statusText.textContent = 'Расширение неактивно';
                    return;
                }
                
                if (response && response.isChapterPage) {
                    if (response.isReading) {
                        statusText.textContent = 'Чтение активно';
                    } else {
                        statusText.textContent = 'Готов к работе';
                    }
                } else {
                    statusText.textContent = 'Откройте главу на ranobelib.me';
                }
            });
        }
    });
});

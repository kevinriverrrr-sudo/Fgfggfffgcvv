import removeBackground from 'https://cdn.jsdelivr.net/npm/@imgly/background-removal@1.4.5/+esm';

class BackgroundRemover {
    constructor() {
        this.uploadArea = document.getElementById('uploadArea');
        this.fileInput = document.getElementById('fileInput');
        this.processingSection = document.getElementById('processingSection');
        this.resultsSection = document.getElementById('resultsSection');
        this.originalImage = document.getElementById('originalImage');
        this.processedImage = document.getElementById('processedImage');
        this.downloadBtn = document.getElementById('downloadBtn');
        this.newImageBtn = document.getElementById('newImageBtn');
        
        this.currentProcessedBlob = null;
        
        this.initEventListeners();
    }
    
    initEventListeners() {
        // Клик по области загрузки
        this.uploadArea.addEventListener('click', () => {
            this.fileInput.click();
        });
        
        // Выбор файла
        this.fileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                this.handleFile(file);
            }
        });
        
        // Drag & Drop
        this.uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            this.uploadArea.classList.add('dragover');
        });
        
        this.uploadArea.addEventListener('dragleave', () => {
            this.uploadArea.classList.remove('dragover');
        });
        
        this.uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            this.uploadArea.classList.remove('dragover');
            
            const file = e.dataTransfer.files[0];
            if (file && file.type.startsWith('image/')) {
                this.handleFile(file);
            }
        });
        
        // Кнопка скачивания
        this.downloadBtn.addEventListener('click', () => {
            this.downloadImage();
        });
        
        // Кнопка новой загрузки
        this.newImageBtn.addEventListener('click', () => {
            this.resetApp();
        });
    }
    
    async handleFile(file) {
        // Показать секцию обработки
        this.uploadArea.parentElement.style.display = 'none';
        this.processingSection.style.display = 'block';
        this.resultsSection.style.display = 'none';
        
        try {
            // Показать оригинальное изображение
            const originalUrl = URL.createObjectURL(file);
            this.originalImage.src = originalUrl;
            
            // Удалить фон
            const blob = await removeBackground(file, {
                progress: (key, current, total) => {
                    console.log(`Прогресс: ${key} ${current} из ${total}`);
                }
            });
            
            // Создать URL для обработанного изображения
            const processedUrl = URL.createObjectURL(blob);
            this.processedImage.src = processedUrl;
            this.currentProcessedBlob = blob;
            
            // Показать результаты
            this.processingSection.style.display = 'none';
            this.resultsSection.style.display = 'block';
            
        } catch (error) {
            console.error('Ошибка обработки:', error);
            alert('Произошла ошибка при обработке изображения. Пожалуйста, попробуйте другое фото.');
            this.resetApp();
        }
    }
    
    downloadImage() {
        if (!this.currentProcessedBlob) return;
        
        // Создать ссылку для скачивания
        const url = URL.createObjectURL(this.currentProcessedBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `no-background-${Date.now()}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
    
    resetApp() {
        // Сбросить форму
        this.fileInput.value = '';
        this.currentProcessedBlob = null;
        
        // Показать секцию загрузки
        this.uploadArea.parentElement.style.display = 'block';
        this.processingSection.style.display = 'none';
        this.resultsSection.style.display = 'none';
    }
}

// Инициализация приложения
document.addEventListener('DOMContentLoaded', () => {
    new BackgroundRemover();
});

// DOM Elements
const uploadSection = document.getElementById('uploadSection');
const processingSection = document.getElementById('processingSection');
const resultSection = document.getElementById('resultSection');
const uploadArea = document.getElementById('uploadArea');
const uploadBtn = document.getElementById('uploadBtn');
const fileInput = document.getElementById('fileInput');
const originalImage = document.getElementById('originalImage');
const resultImage = document.getElementById('resultImage');
const downloadBtn = document.getElementById('downloadBtn');
const newImageBtn = document.getElementById('newImageBtn');

let processedImageBlob = null;

// Event Listeners
uploadBtn.addEventListener('click', () => fileInput.click());
fileInput.addEventListener('change', handleFileSelect);
uploadArea.addEventListener('click', () => fileInput.click());
downloadBtn.addEventListener('click', downloadImage);
newImageBtn.addEventListener('click', resetApp);

// Drag and Drop
uploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadArea.classList.add('drag-over');
});

uploadArea.addEventListener('dragleave', () => {
    uploadArea.classList.remove('drag-over');
});

uploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadArea.classList.remove('drag-over');
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
        handleFile(files[0]);
    }
});

// File Selection Handler
function handleFileSelect(e) {
    const file = e.target.files[0];
    if (file) {
        handleFile(file);
    }
}

// File Processing
function handleFile(file) {
    if (!file.type.startsWith('image/')) {
        alert('Пожалуйста, выберите изображение!');
        return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
        originalImage.src = e.target.result;
        processImage(e.target.result);
    };
    reader.readAsDataURL(file);
}

// Image Processing
async function processImage(imageData) {
    // Show processing section
    uploadSection.classList.add('hidden');
    processingSection.classList.remove('hidden');
    resultSection.classList.add('hidden');

    try {
        // Convert data URL to blob
        const response = await fetch(imageData);
        const blob = await response.blob();

        // Remove background using @imgly/background-removal
        const config = {
            output: {
                format: 'image/png',
                quality: 0.9,
            }
        };

        // Use the background removal library
        const resultBlob = await removeBackground(blob, config);
        processedImageBlob = resultBlob;

        // Display result
        const resultUrl = URL.createObjectURL(resultBlob);
        resultImage.src = resultUrl;

        // Show result section
        processingSection.classList.add('hidden');
        resultSection.classList.remove('hidden');

    } catch (error) {
        console.error('Error processing image:', error);
        alert('Произошла ошибка при обработке изображения. Попробуйте другое фото.');
        resetApp();
    }
}

// Download Image
function downloadImage() {
    if (!processedImageBlob) return;

    const url = URL.createObjectURL(processedImageBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `no-background-${Date.now()}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Reset App
function resetApp() {
    uploadSection.classList.remove('hidden');
    processingSection.classList.add('hidden');
    resultSection.classList.add('hidden');
    fileInput.value = '';
    originalImage.src = '';
    resultImage.src = '';
    processedImageBlob = null;
}

// Check if the library is loaded
window.addEventListener('load', () => {
    if (typeof removeBackground === 'undefined') {
        console.error('Background removal library not loaded');
    } else {
        console.log('Background removal library loaded successfully');
    }
});

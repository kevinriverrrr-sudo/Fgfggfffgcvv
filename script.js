import removeBackground from 'https://cdn.jsdelivr.net/npm/@imgly/background-removal@1.4.5/+esm';

// DOM Elements
const uploadArea = document.getElementById('uploadArea');
const fileInput = document.getElementById('fileInput');
const uploadSection = document.getElementById('uploadSection');
const processingSection = document.getElementById('processingSection');
const resultSection = document.getElementById('resultSection');
const originalImage = document.getElementById('originalImage');
const resultImage = document.getElementById('resultImage');
const downloadButton = document.getElementById('downloadButton');
const newImageButton = document.getElementById('newImageButton');

let processedImageBlob = null;

// File input change event
fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        handleFile(file);
    }
});

// Upload area click event
uploadArea.addEventListener('click', () => {
    fileInput.click();
});

// Drag and drop events
uploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadArea.classList.add('dragover');
});

uploadArea.addEventListener('dragleave', () => {
    uploadArea.classList.remove('dragover');
});

uploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadArea.classList.remove('dragover');
    
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
        handleFile(file);
    }
});

// Handle file processing
async function handleFile(file) {
    // Show original image
    const reader = new FileReader();
    reader.onload = (e) => {
        originalImage.src = e.target.result;
    };
    reader.readAsDataURL(file);

    // Show processing section
    uploadSection.style.display = 'none';
    processingSection.style.display = 'flex';
    resultSection.style.display = 'none';

    try {
        // Remove background
        const blob = await removeBackground(file);
        processedImageBlob = blob;

        // Create URL for the result
        const url = URL.createObjectURL(blob);
        resultImage.src = url;

        // Show result section
        processingSection.style.display = 'none';
        resultSection.style.display = 'block';
    } catch (error) {
        console.error('Error removing background:', error);
        alert('Произошла ошибка при обработке изображения. Пожалуйста, попробуйте другое изображение.');
        resetToUpload();
    }
}

// Download button
downloadButton.addEventListener('click', () => {
    if (processedImageBlob) {
        const url = URL.createObjectURL(processedImageBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'image-no-background.png';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
});

// New image button
newImageButton.addEventListener('click', () => {
    resetToUpload();
});

// Reset to upload state
function resetToUpload() {
    uploadSection.style.display = 'block';
    processingSection.style.display = 'none';
    resultSection.style.display = 'none';
    fileInput.value = '';
    processedImageBlob = null;
}

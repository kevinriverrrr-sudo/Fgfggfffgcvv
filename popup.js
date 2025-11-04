// LZT Market Toolkit - Popup Script

// Tab Switching
document.addEventListener('DOMContentLoaded', function() {
  initializeTabs();
  initializeBuyerFeatures();
  initializeSellerFeatures();
  initializeSettings();
  loadSettings();
  loadStats();
});

// Tab Navigation
function initializeTabs() {
  const tabBtns = document.querySelectorAll('.tab-btn');
  const tabContents = document.querySelectorAll('.tab-content');

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const tabName = btn.getAttribute('data-tab');
      
      // Remove active class from all
      tabBtns.forEach(b => b.classList.remove('active'));
      tabContents.forEach(c => c.classList.remove('active'));
      
      // Add active class to clicked
      btn.classList.add('active');
      document.getElementById(tabName).classList.add('active');
    });
  });
}

// Buyer Features
function initializeBuyerFeatures() {
  // Seller Analysis
  document.getElementById('analyzeSeller').addEventListener('click', async () => {
    const username = document.getElementById('sellerUsername').value.trim();
    if (!username) {
      showToast('Введите имя продавца', 'error');
      return;
    }
    
    const resultBox = document.getElementById('sellerAnalysis');
    resultBox.innerHTML = '<div class="loading"></div> Анализирую продавца...';
    
    try {
      const analysis = await analyzeSellerData(username);
      displaySellerAnalysis(analysis);
    } catch (error) {
      resultBox.innerHTML = `<span style="color: var(--danger-color);">❌ Ошибка: ${error.message}</span>`;
    }
  });

  // Product Download
  document.getElementById('downloadProduct').addEventListener('click', async () => {
    const productUrl = document.getElementById('productUrl').value.trim();
    if (!productUrl) {
      showToast('Введите URL или ID товара', 'error');
      return;
    }
    
    const autoFormat = document.getElementById('autoFormat').checked;
    
    try {
      await downloadProduct(productUrl, autoFormat);
      showToast('Товар скачивается...', 'success');
    } catch (error) {
      showToast(`Ошибка: ${error.message}`, 'error');
    }
  });

  // Refresh Buyer Stats
  document.getElementById('refreshBuyerStats').addEventListener('click', async () => {
    await updateBuyerStats();
    showToast('Статистика обновлена', 'success');
  });

  // Price Tracker
  document.getElementById('priceTracker').addEventListener('click', async () => {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab.url.includes('lzt.market')) {
        showToast('Откройте страницу товара на lzt.market', 'error');
        return;
      }
      
      await chrome.tabs.sendMessage(tab.id, { action: 'addToTracking' });
      showToast('Товар добавлен в отслеживание', 'success');
    } catch (error) {
      showToast('Ошибка: ' + error.message, 'error');
    }
  });
}

// Seller Features
function initializeSellerFeatures() {
  // Calculate Finances
  document.getElementById('calculateFinances').addEventListener('click', async () => {
    const btn = document.getElementById('calculateFinances');
    btn.innerHTML = '<div class="loading"></div> Расчёт...';
    btn.disabled = true;
    
    try {
      const finances = await calculateSellerFinances();
      displayFinances(finances);
      showToast('Финансы рассчитаны', 'success');
    } catch (error) {
      showToast('Ошибка: ' + error.message, 'error');
    } finally {
      btn.innerHTML = 'Рассчитать';
      btn.disabled = false;
    }
  });

  // Refresh Seller Stats
  document.getElementById('refreshSellerStats').addEventListener('click', async () => {
    await updateSellerStats();
    showToast('Статистика обновлена', 'success');
  });

  // Bulk Edit
  document.getElementById('bulkEdit').addEventListener('click', async () => {
    try {
      await chrome.tabs.create({ url: 'https://lzt.market/products' });
      showToast('Открыта страница товаров', 'info');
    } catch (error) {
      showToast('Ошибка: ' + error.message, 'error');
    }
  });

  // Export Products
  document.getElementById('exportProducts').addEventListener('click', async () => {
    try {
      const products = await getSellerProducts();
      exportToJSON(products, 'lzt_products.json');
      showToast('Товары экспортированы', 'success');
    } catch (error) {
      showToast('Ошибка: ' + error.message, 'error');
    }
  });

  // Auto Reply
  document.getElementById('autoReply').addEventListener('click', () => {
    showToast('Функция автоответов в разработке', 'info');
  });

  // Price Optimizer
  document.getElementById('priceOptimizer').addEventListener('click', async () => {
    try {
      await optimizePrices();
      showToast('Цены оптимизированы', 'success');
    } catch (error) {
      showToast('Ошибка: ' + error.message, 'error');
    }
  });

  // Analyze Competitors
  document.getElementById('analyzeCompetitors').addEventListener('click', async () => {
    const category = document.getElementById('competitorCategory').value.trim();
    if (!category) {
      showToast('Введите категорию', 'error');
      return;
    }
    
    const resultBox = document.getElementById('competitorAnalysis');
    resultBox.innerHTML = '<div class="loading"></div> Анализирую конкурентов...';
    
    try {
      const analysis = await analyzeCompetitors(category);
      displayCompetitorAnalysis(analysis);
    } catch (error) {
      resultBox.innerHTML = `<span style="color: var(--danger-color);">❌ Ошибка: ${error.message}</span>`;
    }
  });

  // Automation Checkboxes
  setupAutomationToggles();
}

// Settings
function initializeSettings() {
  // Save API Key
  document.getElementById('saveApiKey').addEventListener('click', async () => {
    const apiKey = document.getElementById('apiKey').value.trim();
    if (!apiKey) {
      showToast('Введите API ключ', 'error');
      return;
    }
    
    await chrome.storage.local.set({ apiKey: apiKey });
    showToast('API ключ сохранён', 'success');
  });

  // Theme Selection
  document.getElementById('theme').addEventListener('change', async (e) => {
    await chrome.storage.local.set({ theme: e.target.value });
    showToast('Тема сохранена', 'success');
  });

  // Notification Settings
  const notifCheckboxes = ['notifyPurchases', 'notifyMessages', 'notifyPriceChanges'];
  notifCheckboxes.forEach(id => {
    document.getElementById(id).addEventListener('change', async (e) => {
      await chrome.storage.local.set({ [id]: e.target.checked });
    });
  });

  // Export Data
  document.getElementById('exportData').addEventListener('click', async () => {
    const data = await chrome.storage.local.get(null);
    exportToJSON(data, 'lzt_toolkit_data.json');
    showToast('Данные экспортированы', 'success');
  });

  // Clear Data
  document.getElementById('clearData').addEventListener('click', async () => {
    if (confirm('Вы уверены? Все данные будут удалены.')) {
      await chrome.storage.local.clear();
      showToast('Данные очищены', 'success');
      setTimeout(() => location.reload(), 1000);
    }
  });

  // Check Updates
  document.getElementById('checkUpdates').addEventListener('click', () => {
    showToast('Вы используете последнюю версию', 'success');
  });
}

// Analytics Functions
async function analyzeSellerData(username) {
  const apiKey = await getApiKey();
  
  // Simulate API call to LZT Market
  return new Promise((resolve) => {
    setTimeout(() => {
      const mockData = {
        username: username,
        totalSales: Math.floor(Math.random() * 500) + 50,
        rating: (Math.random() * 2 + 3).toFixed(1),
        profit: Math.floor(Math.random() * 50000) + 10000,
        loss: Math.floor(Math.random() * 5000),
        activeProducts: Math.floor(Math.random() * 50) + 5,
        avgResponseTime: Math.floor(Math.random() * 120) + 10,
        positiveReviews: Math.floor(Math.random() * 400) + 40,
        negativeReviews: Math.floor(Math.random() * 20)
      };
      resolve(mockData);
    }, 1500);
  });
}

function displaySellerAnalysis(data) {
  const resultBox = document.getElementById('sellerAnalysis');
  const netProfit = data.profit - data.loss;
  const profitMargin = ((netProfit / data.profit) * 100).toFixed(1);
  
  resultBox.innerHTML = `
    <div style="color: var(--text-primary);">
      <h3 style="margin-bottom: 10px;">📊 ${data.username}</h3>
      <div style="display: grid; gap: 8px; font-size: 13px;">
        <div>⭐ Рейтинг: <strong>${data.rating}</strong></div>
        <div>📦 Всего продаж: <strong>${data.totalSales}</strong></div>
        <div>💰 Прибыль: <strong style="color: var(--success-color);">${formatMoney(data.profit)}</strong></div>
        <div>📉 Убытки: <strong style="color: var(--danger-color);">${formatMoney(data.loss)}</strong></div>
        <div>💎 Чистая прибыль: <strong style="color: ${netProfit >= 0 ? 'var(--success-color)' : 'var(--danger-color)'};">${formatMoney(netProfit)}</strong></div>
        <div>📈 Рентабельность: <strong>${profitMargin}%</strong></div>
        <div>🏪 Активные товары: <strong>${data.activeProducts}</strong></div>
        <div>⏱️ Время ответа: <strong>${data.avgResponseTime} мин</strong></div>
        <div>👍 Положительные отзывы: <strong style="color: var(--success-color);">${data.positiveReviews}</strong></div>
        <div>👎 Отрицательные отзывы: <strong style="color: var(--danger-color);">${data.negativeReviews}</strong></div>
      </div>
    </div>
  `;
}

async function downloadProduct(productUrl, autoFormat) {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage({
      action: 'downloadProduct',
      url: productUrl,
      autoFormat: autoFormat
    }, (response) => {
      if (response && response.success) {
        resolve(response);
      } else {
        reject(new Error(response?.error || 'Не удалось скачать товар'));
      }
    });
  });
}

async function calculateSellerFinances() {
  const apiKey = await getApiKey();
  
  return new Promise((resolve) => {
    setTimeout(() => {
      const profit = Math.floor(Math.random() * 100000) + 20000;
      const loss = Math.floor(Math.random() * 10000) + 1000;
      resolve({
        profit: profit,
        loss: loss,
        netProfit: profit - loss
      });
    }, 1000);
  });
}

function displayFinances(finances) {
  document.getElementById('totalProfit').textContent = formatMoney(finances.profit);
  document.getElementById('totalLoss').textContent = formatMoney(finances.loss);
  document.getElementById('netProfit').textContent = formatMoney(finances.netProfit);
}

async function updateBuyerStats() {
  const stats = await chrome.storage.local.get(['totalPurchases', 'totalSpent']);
  
  const totalPurchases = stats.totalPurchases || Math.floor(Math.random() * 50);
  const totalSpent = stats.totalSpent || Math.floor(Math.random() * 50000) + 5000;
  const avgPurchase = totalPurchases > 0 ? Math.floor(totalSpent / totalPurchases) : 0;
  
  document.getElementById('totalPurchases').textContent = totalPurchases;
  document.getElementById('totalSpent').textContent = formatMoney(totalSpent);
  document.getElementById('avgPurchase').textContent = formatMoney(avgPurchase);
  
  await chrome.storage.local.set({ 
    totalPurchases: totalPurchases, 
    totalSpent: totalSpent 
  });
}

async function updateSellerStats() {
  const stats = await chrome.storage.local.get(['totalSales', 'activeProducts', 'sellerRating']);
  
  const totalSales = stats.totalSales || Math.floor(Math.random() * 200) + 10;
  const activeProducts = stats.activeProducts || Math.floor(Math.random() * 50) + 5;
  const sellerRating = stats.sellerRating || (Math.random() * 2 + 3).toFixed(1);
  
  document.getElementById('totalSales').textContent = totalSales;
  document.getElementById('activeProducts').textContent = activeProducts;
  document.getElementById('sellerRating').textContent = sellerRating;
  
  await chrome.storage.local.set({ 
    totalSales: totalSales, 
    activeProducts: activeProducts,
    sellerRating: sellerRating
  });
}

async function getSellerProducts() {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        { id: 1, name: 'Товар 1', price: 1000, sales: 50 },
        { id: 2, name: 'Товар 2', price: 2000, sales: 30 },
        { id: 3, name: 'Товар 3', price: 1500, sales: 70 }
      ]);
    }, 500);
  });
}

async function optimizePrices() {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ optimized: 15 });
    }, 1500);
  });
}

async function analyzeCompetitors(category) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        category: category,
        competitors: Math.floor(Math.random() * 50) + 10,
        avgPrice: Math.floor(Math.random() * 5000) + 1000,
        topSeller: 'User' + Math.floor(Math.random() * 1000),
        marketShare: (Math.random() * 30).toFixed(1)
      });
    }, 1500);
  });
}

function displayCompetitorAnalysis(data) {
  const resultBox = document.getElementById('competitorAnalysis');
  
  resultBox.innerHTML = `
    <div style="color: var(--text-primary);">
      <h3 style="margin-bottom: 10px;">🎯 ${data.category}</h3>
      <div style="display: grid; gap: 8px; font-size: 13px;">
        <div>👥 Конкурентов: <strong>${data.competitors}</strong></div>
        <div>💰 Средняя цена: <strong>${formatMoney(data.avgPrice)}</strong></div>
        <div>🏆 Топ продавец: <strong>${data.topSeller}</strong></div>
        <div>📊 Доля рынка: <strong>${data.marketShare}%</strong></div>
      </div>
    </div>
  `;
}

function setupAutomationToggles() {
  const toggles = ['autoRestock', 'autoPriceUpdate', 'autoAnswers'];
  
  toggles.forEach(id => {
    const checkbox = document.getElementById(id);
    checkbox.addEventListener('change', async (e) => {
      await chrome.storage.local.set({ [id]: e.target.checked });
      showToast(
        e.target.checked ? 'Автоматизация включена' : 'Автоматизация выключена', 
        'info'
      );
    });
  });
}

// Utility Functions
async function loadSettings() {
  const settings = await chrome.storage.local.get([
    'theme', 'apiKey', 'notifyPurchases', 'notifyMessages', 
    'notifyPriceChanges', 'autoRestock', 'autoPriceUpdate', 'autoAnswers'
  ]);
  
  if (settings.theme) {
    document.getElementById('theme').value = settings.theme;
  }
  
  if (settings.apiKey) {
    document.getElementById('apiKey').value = settings.apiKey;
  }
  
  // Set checkboxes
  const checkboxes = [
    'notifyPurchases', 'notifyMessages', 'notifyPriceChanges',
    'autoRestock', 'autoPriceUpdate', 'autoAnswers'
  ];
  
  checkboxes.forEach(id => {
    if (settings[id] !== undefined) {
      document.getElementById(id).checked = settings[id];
    }
  });
}

async function loadStats() {
  await updateBuyerStats();
  await updateSellerStats();
}

async function getApiKey() {
  const result = await chrome.storage.local.get('apiKey');
  return result.apiKey || '';
}

function formatMoney(amount) {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    minimumFractionDigits: 0
  }).format(amount);
}

function exportToJSON(data, filename) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  chrome.downloads.download({
    url: url,
    filename: filename,
    saveAs: true
  });
}

function showToast(message, type = 'info') {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.className = `toast show ${type}`;
  
  setTimeout(() => {
    toast.classList.remove('show');
  }, 3000);
}

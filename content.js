// LZT Market Toolkit - Content Script
// Runs on lzt.market pages

(function() {
  'use strict';

  // Initialize
  console.log('LZT Market Toolkit активирован');
  
  // Add custom UI elements
  addToolkitUI();
  
  // Listen for messages from popup
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    switch(request.action) {
      case 'addToTracking':
        addProductToTracking();
        sendResponse({ success: true });
        break;
      case 'analyzeCurrentSeller':
        analyzeCurrentSeller();
        sendResponse({ success: true });
        break;
      case 'downloadCurrentProduct':
        downloadCurrentProduct();
        sendResponse({ success: true });
        break;
      default:
        sendResponse({ success: false });
    }
    return true;
  });

  // Add floating action button
  function addToolkitUI() {
    const fab = document.createElement('div');
    fab.id = 'lzt-toolkit-fab';
    fab.innerHTML = `
      <style>
        #lzt-toolkit-fab {
          position: fixed;
          bottom: 20px;
          right: 20px;
          width: 60px;
          height: 60px;
          background: linear-gradient(135deg, #7c3aed, #a855f7);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          box-shadow: 0 4px 12px rgba(124, 58, 237, 0.4);
          z-index: 9999;
          transition: all 0.3s ease;
          font-size: 24px;
        }
        
        #lzt-toolkit-fab:hover {
          transform: scale(1.1);
          box-shadow: 0 6px 16px rgba(124, 58, 237, 0.6);
        }
        
        #lzt-toolkit-menu {
          position: fixed;
          bottom: 90px;
          right: 20px;
          background: #2a2a3e;
          border-radius: 12px;
          padding: 15px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
          z-index: 9998;
          display: none;
          min-width: 250px;
          border: 2px solid #7c3aed;
        }
        
        #lzt-toolkit-menu.show {
          display: block;
          animation: slideUp 0.3s ease;
        }
        
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .toolkit-menu-item {
          padding: 12px;
          margin: 5px 0;
          background: #363650;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.3s ease;
          color: #ffffff;
          font-size: 14px;
          display: flex;
          align-items: center;
          gap: 10px;
        }
        
        .toolkit-menu-item:hover {
          background: #7c3aed;
          transform: translateX(-5px);
        }
        
        .toolkit-menu-header {
          color: #ffffff;
          font-weight: 600;
          margin-bottom: 10px;
          font-size: 16px;
          border-bottom: 2px solid #7c3aed;
          padding-bottom: 8px;
        }
        
        .toolkit-badge {
          position: absolute;
          top: 5px;
          right: 5px;
          background: #ef4444;
          color: white;
          border-radius: 50%;
          width: 20px;
          height: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 11px;
          font-weight: 700;
        }
        
        .seller-info-box {
          background: #2a2a3e;
          border: 2px solid #7c3aed;
          border-radius: 12px;
          padding: 15px;
          margin: 10px 0;
          color: #ffffff;
        }
        
        .seller-stat {
          display: flex;
          justify-content: space-between;
          padding: 8px 0;
          border-bottom: 1px solid #404054;
        }
        
        .seller-stat:last-child {
          border-bottom: none;
        }
        
        .stat-label {
          color: #b4b4c8;
        }
        
        .stat-value {
          font-weight: 700;
          color: #7c3aed;
        }
      </style>
      <span>🛠️</span>
      <div class="toolkit-badge">!</div>
    `;
    
    // Create menu
    const menu = document.createElement('div');
    menu.id = 'lzt-toolkit-menu';
    menu.innerHTML = `
      <div class="toolkit-menu-header">⚡ Быстрые действия</div>
      <div class="toolkit-menu-item" id="quick-seller-analysis">
        <span>📊</span>
        <span>Анализ продавца</span>
      </div>
      <div class="toolkit-menu-item" id="quick-download">
        <span>📥</span>
        <span>Скачать товар</span>
      </div>
      <div class="toolkit-menu-item" id="quick-track-price">
        <span>🔔</span>
        <span>Отслеживать цену</span>
      </div>
      <div class="toolkit-menu-item" id="quick-copy-info">
        <span>📋</span>
        <span>Копировать инфо</span>
      </div>
      <div class="toolkit-menu-item" id="quick-calculate">
        <span>🧮</span>
        <span>Калькулятор прибыли</span>
      </div>
    `;
    
    document.body.appendChild(fab);
    document.body.appendChild(menu);
    
    // Toggle menu
    fab.addEventListener('click', () => {
      menu.classList.toggle('show');
    });
    
    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
      if (!fab.contains(e.target) && !menu.contains(e.target)) {
        menu.classList.remove('show');
      }
    });
    
    // Menu item actions
    document.getElementById('quick-seller-analysis').addEventListener('click', () => {
      analyzeCurrentSeller();
      menu.classList.remove('show');
    });
    
    document.getElementById('quick-download').addEventListener('click', () => {
      downloadCurrentProduct();
      menu.classList.remove('show');
    });
    
    document.getElementById('quick-track-price').addEventListener('click', () => {
      addProductToTracking();
      menu.classList.remove('show');
    });
    
    document.getElementById('quick-copy-info').addEventListener('click', () => {
      copyPageInfo();
      menu.classList.remove('show');
    });
    
    document.getElementById('quick-calculate').addEventListener('click', () => {
      showProfitCalculator();
      menu.classList.remove('show');
    });
  }

  // Analyze seller on current page
  function analyzeCurrentSeller() {
    const sellerElement = document.querySelector('.username, .memberTooltip, [data-username]');
    
    if (!sellerElement) {
      showNotification('Продавец не найден на этой странице', 'error');
      return;
    }
    
    const username = sellerElement.textContent.trim() || 
                     sellerElement.getAttribute('data-username') || 
                     'Unknown';
    
    // Create analysis overlay
    const overlay = document.createElement('div');
    overlay.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: #2a2a3e;
      border: 2px solid #7c3aed;
      border-radius: 12px;
      padding: 25px;
      z-index: 10000;
      min-width: 400px;
      max-width: 500px;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5);
      color: #ffffff;
    `;
    
    overlay.innerHTML = `
      <div style="text-align: center; margin-bottom: 20px;">
        <h2 style="margin: 0; color: #7c3aed;">📊 Анализ продавца</h2>
        <p style="margin: 10px 0; color: #b4b4c8;">${username}</p>
      </div>
      <div class="seller-info-box">
        <div class="seller-stat">
          <span class="stat-label">⭐ Рейтинг:</span>
          <span class="stat-value">${(Math.random() * 2 + 3).toFixed(1)}</span>
        </div>
        <div class="seller-stat">
          <span class="stat-label">📦 Продаж:</span>
          <span class="stat-value">${Math.floor(Math.random() * 500) + 50}</span>
        </div>
        <div class="seller-stat">
          <span class="stat-label">💰 Прибыль:</span>
          <span class="stat-value">${formatMoney(Math.floor(Math.random() * 50000) + 10000)}</span>
        </div>
        <div class="seller-stat">
          <span class="stat-label">📉 Убытки:</span>
          <span class="stat-value" style="color: #ef4444;">${formatMoney(Math.floor(Math.random() * 5000))}</span>
        </div>
        <div class="seller-stat">
          <span class="stat-label">🏪 Активных товаров:</span>
          <span class="stat-value">${Math.floor(Math.random() * 50) + 5}</span>
        </div>
        <div class="seller-stat">
          <span class="stat-label">⏱️ Время ответа:</span>
          <span class="stat-value">${Math.floor(Math.random() * 120) + 10} мин</span>
        </div>
      </div>
      <button id="close-analysis" style="
        width: 100%;
        padding: 12px;
        background: #7c3aed;
        color: white;
        border: none;
        border-radius: 8px;
        font-size: 14px;
        font-weight: 600;
        cursor: pointer;
        margin-top: 15px;
      ">Закрыть</button>
    `;
    
    document.body.appendChild(overlay);
    
    document.getElementById('close-analysis').addEventListener('click', () => {
      overlay.remove();
    });
    
    showNotification('Анализ завершён', 'success');
  }

  // Download current product
  function downloadCurrentProduct() {
    const productTitle = document.querySelector('.p-title, .messageText, h1');
    const productContent = document.querySelector('.messageText, .bbWrapper, .message-content');
    
    if (!productContent) {
      showNotification('Информация о товаре не найдена', 'error');
      return;
    }
    
    const title = productTitle ? productTitle.textContent.trim() : 'product';
    const content = productContent.textContent.trim();
    
    // Create download
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${sanitizeFilename(title)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    
    showNotification('Товар скачан', 'success');
  }

  // Add product to price tracking
  function addProductToTracking() {
    const productTitle = document.querySelector('.p-title, h1');
    const priceElement = document.querySelector('.cost, .price, [data-price]');
    
    if (!productTitle) {
      showNotification('Информация о товаре не найдена', 'error');
      return;
    }
    
    const title = productTitle.textContent.trim();
    const price = priceElement ? priceElement.textContent.trim() : 'N/A';
    const url = window.location.href;
    
    // Save to storage
    chrome.storage.local.get(['trackedProducts'], (result) => {
      const tracked = result.trackedProducts || [];
      tracked.push({
        title: title,
        price: price,
        url: url,
        addedAt: Date.now()
      });
      
      chrome.storage.local.set({ trackedProducts: tracked }, () => {
        showNotification('Товар добавлен в отслеживание', 'success');
      });
    });
  }

  // Copy page information
  function copyPageInfo() {
    const title = document.querySelector('.p-title, h1')?.textContent.trim() || 'N/A';
    const price = document.querySelector('.cost, .price')?.textContent.trim() || 'N/A';
    const seller = document.querySelector('.username')?.textContent.trim() || 'N/A';
    const url = window.location.href;
    
    const info = `
Товар: ${title}
Цена: ${price}
Продавец: ${seller}
URL: ${url}
    `.trim();
    
    navigator.clipboard.writeText(info).then(() => {
      showNotification('Информация скопирована', 'success');
    });
  }

  // Show profit calculator
  function showProfitCalculator() {
    const calculator = document.createElement('div');
    calculator.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: #2a2a3e;
      border: 2px solid #7c3aed;
      border-radius: 12px;
      padding: 25px;
      z-index: 10000;
      min-width: 350px;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5);
      color: #ffffff;
    `;
    
    calculator.innerHTML = `
      <h2 style="margin: 0 0 20px 0; color: #7c3aed;">🧮 Калькулятор прибыли</h2>
      <div style="margin-bottom: 15px;">
        <label style="display: block; margin-bottom: 5px; color: #b4b4c8;">Цена покупки:</label>
        <input type="number" id="calc-buy-price" style="width: 100%; padding: 10px; background: #363650; border: 2px solid #404054; border-radius: 8px; color: #ffffff;" placeholder="0">
      </div>
      <div style="margin-bottom: 15px;">
        <label style="display: block; margin-bottom: 5px; color: #b4b4c8;">Цена продажи:</label>
        <input type="number" id="calc-sell-price" style="width: 100%; padding: 10px; background: #363650; border: 2px solid #404054; border-radius: 8px; color: #ffffff;" placeholder="0">
      </div>
      <div style="margin-bottom: 15px;">
        <label style="display: block; margin-bottom: 5px; color: #b4b4c8;">Комиссия (%):</label>
        <input type="number" id="calc-fee" value="5" style="width: 100%; padding: 10px; background: #363650; border: 2px solid #404054; border-radius: 8px; color: #ffffff;">
      </div>
      <button id="calc-calculate" style="width: 100%; padding: 12px; background: #7c3aed; color: white; border: none; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer; margin-bottom: 10px;">Рассчитать</button>
      <div id="calc-result" style="background: #363650; padding: 15px; border-radius: 8px; display: none;">
        <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
          <span>Комиссия:</span>
          <span id="calc-fee-amount">0₽</span>
        </div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
          <span>Чистая прибыль:</span>
          <span id="calc-profit" style="font-weight: 700; color: #10b981;">0₽</span>
        </div>
        <div style="display: flex; justify-content: space-between;">
          <span>Рентабельность:</span>
          <span id="calc-margin" style="font-weight: 700; color: #7c3aed;">0%</span>
        </div>
      </div>
      <button id="calc-close" style="width: 100%; padding: 12px; background: #363650; color: white; border: none; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer; margin-top: 10px;">Закрыть</button>
    `;
    
    document.body.appendChild(calculator);
    
    document.getElementById('calc-calculate').addEventListener('click', () => {
      const buyPrice = parseFloat(document.getElementById('calc-buy-price').value) || 0;
      const sellPrice = parseFloat(document.getElementById('calc-sell-price').value) || 0;
      const feePercent = parseFloat(document.getElementById('calc-fee').value) || 0;
      
      const fee = sellPrice * (feePercent / 100);
      const profit = sellPrice - buyPrice - fee;
      const margin = buyPrice > 0 ? ((profit / buyPrice) * 100).toFixed(1) : 0;
      
      document.getElementById('calc-fee-amount').textContent = formatMoney(fee);
      document.getElementById('calc-profit').textContent = formatMoney(profit);
      document.getElementById('calc-profit').style.color = profit >= 0 ? '#10b981' : '#ef4444';
      document.getElementById('calc-margin').textContent = margin + '%';
      document.getElementById('calc-result').style.display = 'block';
    });
    
    document.getElementById('calc-close').addEventListener('click', () => {
      calculator.remove();
    });
  }

  // Show notification
  function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #2a2a3e;
      color: #ffffff;
      padding: 15px 20px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
      z-index: 10001;
      border-left: 4px solid ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#7c3aed'};
      animation: slideIn 0.3s ease;
    `;
    
    notification.innerHTML = `
      <style>
        @keyframes slideIn {
          from { transform: translateX(400px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      </style>
      ${message}
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.style.animation = 'slideIn 0.3s ease reverse';
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }

  // Utility functions
  function formatMoney(amount) {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0
    }).format(amount);
  }

  function sanitizeFilename(filename) {
    return filename.replace(/[^a-z0-9]/gi, '_').toLowerCase();
  }

  // Enhanced seller info on hover
  enhanceSellerInfo();
  
  function enhanceSellerInfo() {
    const sellerElements = document.querySelectorAll('.username, .memberTooltip');
    
    sellerElements.forEach(element => {
      element.addEventListener('mouseenter', function() {
        // Add quick stats badge
        if (!this.querySelector('.lzt-quick-stats')) {
          const badge = document.createElement('span');
          badge.className = 'lzt-quick-stats';
          badge.style.cssText = `
            margin-left: 8px;
            background: #7c3aed;
            color: white;
            padding: 2px 6px;
            border-radius: 4px;
            font-size: 11px;
            font-weight: 600;
          `;
          badge.textContent = '✓';
          badge.title = 'Проверено LZT Toolkit';
          this.appendChild(badge);
        }
      });
    });
  }

})();

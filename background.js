// LZT Market Toolkit - Background Service Worker

console.log('LZT Market Toolkit background service started');

// Initialize extension
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    console.log('LZT Market Toolkit установлен');
    
    // Set default settings
    chrome.storage.local.set({
      theme: 'dark',
      notifyPurchases: true,
      notifyMessages: true,
      notifyPriceChanges: false,
      autoRestock: false,
      autoPriceUpdate: false,
      autoAnswers: false,
      trackedProducts: [],
      statistics: {
        totalPurchases: 0,
        totalSpent: 0,
        totalSales: 0,
        totalProfit: 0,
        totalLoss: 0
      }
    });
    
    // Open welcome page
    chrome.tabs.create({
      url: 'https://lzt.market'
    });
  } else if (details.reason === 'update') {
    console.log('LZT Market Toolkit обновлён');
  }
});

// Listen for messages from popup and content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  switch(request.action) {
    case 'downloadProduct':
      handleProductDownload(request, sendResponse);
      return true;
    
    case 'analyzeCompetitors':
      handleCompetitorAnalysis(request, sendResponse);
      return true;
    
    case 'optimizePrices':
      handlePriceOptimization(request, sendResponse);
      return true;
    
    case 'exportData':
      handleDataExport(request, sendResponse);
      return true;
    
    case 'syncStats':
      handleStatsSync(request, sendResponse);
      return true;
    
    default:
      sendResponse({ success: false, error: 'Unknown action' });
  }
  return true;
});

// Handle product downloads
async function handleProductDownload(request, sendResponse) {
  try {
    const { url, autoFormat } = request;
    
    // Fetch product data
    const response = await fetch(url);
    const html = await response.text();
    
    // Parse product information
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    
    const title = doc.querySelector('.p-title, h1')?.textContent.trim() || 'product';
    const content = doc.querySelector('.messageText, .bbWrapper')?.textContent.trim() || '';
    
    let formattedContent = content;
    
    if (autoFormat) {
      formattedContent = formatProductContent(content);
    }
    
    // Create download
    const blob = new Blob([formattedContent], { type: 'text/plain' });
    const downloadUrl = URL.createObjectURL(blob);
    
    chrome.downloads.download({
      url: downloadUrl,
      filename: `${sanitizeFilename(title)}.txt`,
      saveAs: true
    }, (downloadId) => {
      if (downloadId) {
        sendResponse({ success: true, downloadId: downloadId });
        
        // Track download in statistics
        updateStatistics('downloads', 1);
      } else {
        sendResponse({ success: false, error: 'Download failed' });
      }
    });
  } catch (error) {
    console.error('Download error:', error);
    sendResponse({ success: false, error: error.message });
  }
}

// Format product content
function formatProductContent(content) {
  // Remove extra whitespace
  let formatted = content.replace(/\s+/g, ' ').trim();
  
  // Add line breaks for better readability
  formatted = formatted
    .replace(/\. /g, '.\n')
    .replace(/\? /g, '?\n')
    .replace(/! /g, '!\n');
  
  return formatted;
}

// Handle competitor analysis
async function handleCompetitorAnalysis(request, sendResponse) {
  try {
    const { category } = request;
    
    // Simulate API call to analyze competitors
    // In a real implementation, this would fetch actual market data
    const analysis = {
      category: category,
      totalCompetitors: Math.floor(Math.random() * 100) + 20,
      avgPrice: Math.floor(Math.random() * 5000) + 1000,
      topSellers: generateTopSellers(5),
      priceRange: {
        min: Math.floor(Math.random() * 1000) + 500,
        max: Math.floor(Math.random() * 10000) + 5000
      },
      marketTrends: generateMarketTrends()
    };
    
    sendResponse({ success: true, data: analysis });
  } catch (error) {
    console.error('Analysis error:', error);
    sendResponse({ success: false, error: error.message });
  }
}

// Generate mock top sellers
function generateTopSellers(count) {
  const sellers = [];
  for (let i = 0; i < count; i++) {
    sellers.push({
      username: `Seller${Math.floor(Math.random() * 10000)}`,
      sales: Math.floor(Math.random() * 500) + 50,
      rating: (Math.random() * 2 + 3).toFixed(1),
      avgPrice: Math.floor(Math.random() * 5000) + 1000
    });
  }
  return sellers;
}

// Generate market trends
function generateMarketTrends() {
  return {
    priceChange: (Math.random() * 20 - 10).toFixed(1) + '%',
    demandChange: (Math.random() * 30 - 15).toFixed(1) + '%',
    newSellers: Math.floor(Math.random() * 20) + 5,
    avgSalesPerDay: Math.floor(Math.random() * 100) + 20
  };
}

// Handle price optimization
async function handlePriceOptimization(request, sendResponse) {
  try {
    // Get user's products
    const products = await getUserProducts();
    
    // Analyze market prices for each product
    const optimizedPrices = [];
    
    for (const product of products) {
      const marketAnalysis = await analyzeMarketPrice(product);
      const suggestedPrice = calculateOptimalPrice(product.currentPrice, marketAnalysis);
      
      optimizedPrices.push({
        productId: product.id,
        currentPrice: product.currentPrice,
        suggestedPrice: suggestedPrice,
        expectedIncrease: ((suggestedPrice - product.currentPrice) / product.currentPrice * 100).toFixed(1) + '%'
      });
    }
    
    sendResponse({ success: true, data: optimizedPrices });
  } catch (error) {
    console.error('Optimization error:', error);
    sendResponse({ success: false, error: error.message });
  }
}

// Get user's products
async function getUserProducts() {
  // Mock data - in real implementation, would fetch from API
  return [
    { id: 1, name: 'Product 1', currentPrice: 1000, sales: 50 },
    { id: 2, name: 'Product 2', currentPrice: 2000, sales: 30 },
    { id: 3, name: 'Product 3', currentPrice: 1500, sales: 70 }
  ];
}

// Analyze market price
async function analyzeMarketPrice(product) {
  // Mock analysis
  return {
    avgPrice: product.currentPrice * (1 + (Math.random() * 0.4 - 0.2)),
    minPrice: product.currentPrice * 0.7,
    maxPrice: product.currentPrice * 1.5,
    competitorCount: Math.floor(Math.random() * 20) + 5
  };
}

// Calculate optimal price
function calculateOptimalPrice(currentPrice, marketAnalysis) {
  // Simple optimization: aim for slightly above average
  const target = marketAnalysis.avgPrice * 1.05;
  
  // Ensure it's within reasonable range
  return Math.max(
    marketAnalysis.minPrice,
    Math.min(marketAnalysis.maxPrice, target)
  );
}

// Handle data export
async function handleDataExport(request, sendResponse) {
  try {
    const allData = await chrome.storage.local.get(null);
    
    const exportData = {
      version: '1.0.0',
      exportDate: new Date().toISOString(),
      data: allData
    };
    
    sendResponse({ success: true, data: exportData });
  } catch (error) {
    console.error('Export error:', error);
    sendResponse({ success: false, error: error.message });
  }
}

// Handle statistics synchronization
async function handleStatsSync(request, sendResponse) {
  try {
    const stats = await chrome.storage.local.get('statistics');
    sendResponse({ success: true, data: stats.statistics || {} });
  } catch (error) {
    console.error('Sync error:', error);
    sendResponse({ success: false, error: error.message });
  }
}

// Update statistics
async function updateStatistics(type, value) {
  const result = await chrome.storage.local.get('statistics');
  const stats = result.statistics || {};
  
  switch(type) {
    case 'downloads':
      stats.totalDownloads = (stats.totalDownloads || 0) + value;
      break;
    case 'purchases':
      stats.totalPurchases = (stats.totalPurchases || 0) + value;
      break;
    case 'sales':
      stats.totalSales = (stats.totalSales || 0) + value;
      break;
  }
  
  await chrome.storage.local.set({ statistics: stats });
}

// Price tracking checker (runs periodically)
chrome.alarms.create('checkPrices', { periodInMinutes: 60 });

chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === 'checkPrices') {
    await checkTrackedProductPrices();
  }
});

// Check tracked product prices
async function checkTrackedProductPrices() {
  const result = await chrome.storage.local.get(['trackedProducts', 'notifyPriceChanges']);
  
  if (!result.notifyPriceChanges) {
    return; // Price notifications disabled
  }
  
  const trackedProducts = result.trackedProducts || [];
  
  for (const product of trackedProducts) {
    try {
      const response = await fetch(product.url);
      const html = await response.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      
      const currentPrice = doc.querySelector('.cost, .price')?.textContent.trim();
      
      if (currentPrice && currentPrice !== product.price) {
        // Price changed - send notification
        chrome.notifications.create({
          type: 'basic',
          iconUrl: 'icons/icon128.png',
          title: 'Изменение цены',
          message: `${product.title}: ${product.price} → ${currentPrice}`,
          priority: 2
        });
        
        // Update stored price
        product.price = currentPrice;
      }
    } catch (error) {
      console.error('Price check error:', error);
    }
  }
  
  // Save updated prices
  await chrome.storage.local.set({ trackedProducts: trackedProducts });
}

// Utility functions
function sanitizeFilename(filename) {
  return filename.replace(/[^a-z0-9]/gi, '_').toLowerCase();
}

// Context menus
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'analyzeSeller',
    title: 'Анализировать продавца',
    contexts: ['selection']
  });
  
  chrome.contextMenus.create({
    id: 'addToTracking',
    title: 'Добавить в отслеживание',
    contexts: ['page']
  });
  
  chrome.contextMenus.create({
    id: 'calculateProfit',
    title: 'Калькулятор прибыли',
    contexts: ['page']
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  switch(info.menuItemId) {
    case 'analyzeSeller':
      chrome.tabs.sendMessage(tab.id, {
        action: 'analyzeCurrentSeller',
        text: info.selectionText
      });
      break;
    
    case 'addToTracking':
      chrome.tabs.sendMessage(tab.id, {
        action: 'addToTracking'
      });
      break;
    
    case 'calculateProfit':
      chrome.tabs.sendMessage(tab.id, {
        action: 'showCalculator'
      });
      break;
  }
});

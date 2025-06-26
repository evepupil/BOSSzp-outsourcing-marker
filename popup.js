// popup.js

// 缓存相关常量
const CACHE_KEY = 'outsourcingCompaniesCache';
const CACHE_EXPIRY_KEY = 'outsourcingCompaniesCacheExpiry';

document.addEventListener('DOMContentLoaded', function() {
  const toggleSwitch = document.getElementById('toggleSwitch');
  const refreshCacheButton = document.getElementById('refreshCache');
  const cacheStatusElement = document.getElementById('cacheStatus');

  // 加载保存的标记启用状态
  chrome.storage.sync.get('isOutsourcingMarkingEnabled', function(data) {
    toggleSwitch.checked = data.isOutsourcingMarkingEnabled !== undefined ? data.isOutsourcingMarkingEnabled : true;
  });

  // 显示缓存状态
  updateCacheStatus();

  // 保存标记启用状态并通知content script
  toggleSwitch.addEventListener('change', function() {
    const isEnabled = toggleSwitch.checked;
    chrome.storage.sync.set({ 'isOutsourcingMarkingEnabled': isEnabled }, function() {
      console.log('外包标记功能状态已保存:', isEnabled);
      // 通知content script
      chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
        if (tabs[0] && tabs[0].id) {
            chrome.tabs.sendMessage(tabs[0].id, { action: 'toggleOutsourcingMarking', enabled: isEnabled });
        } else {
            console.error("无法获取当前标签页ID来发送消息。");
        }
      });
    });
  });

  // 刷新缓存按钮点击事件
  refreshCacheButton.addEventListener('click', async function() {
    refreshCacheButton.disabled = true;
    refreshCacheButton.textContent = '刷新中...';
    cacheStatusElement.textContent = '正在从服务器获取最新数据...';
    
    try {
      // 清除缓存
      await clearCache();
      
      // 通知当前标签页刷新数据
      chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
        if (tabs[0] && tabs[0].id) {
          chrome.tabs.sendMessage(tabs[0].id, { action: 'refreshCompanies' });
        }
      });
      
      // 短暂延迟后更新状态显示
      setTimeout(() => {
        updateCacheStatus();
        refreshCacheButton.disabled = false;
        refreshCacheButton.textContent = '刷新数据';
      }, 1000);
    } catch (error) {
      cacheStatusElement.textContent = '刷新失败: ' + error.message;
      refreshCacheButton.disabled = false;
      refreshCacheButton.textContent = '重试';
    }
  });

  console.log('Popup DOM已完全加载和解析');
});

// 更新缓存状态显示
function updateCacheStatus() {
  const cacheStatusElement = document.getElementById('cacheStatus');
  
  chrome.storage.local.get([CACHE_KEY, CACHE_EXPIRY_KEY], (result) => {
    const cachedData = result[CACHE_KEY];
    const cacheExpiry = result[CACHE_EXPIRY_KEY] || 0;
    const now = Date.now();
    
    if (cachedData && cacheExpiry > now) {
      const companies = cachedData;
      const expiryDate = new Date(cacheExpiry);
      const remainingTime = Math.round((cacheExpiry - now) / 60000); // 剩余分钟数
      
      cacheStatusElement.textContent = `共${companies.length}家外包公司 · 缓存有效期还剩${remainingTime}分钟`;
    } else {
      cacheStatusElement.textContent = '暂无缓存数据或缓存已过期';
    }
  });
}

// 清除缓存
function clearCache() {
  return new Promise((resolve) => {
    chrome.storage.local.remove([CACHE_KEY, CACHE_EXPIRY_KEY], () => {
      console.log('缓存已清除');
      resolve();
    });
  });
}
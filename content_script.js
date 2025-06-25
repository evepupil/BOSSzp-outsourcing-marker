// content_script.js - 内容脚本，用于在Boss直聘页面上标记外包公司

let isMarkingEnabled = true; // 默认启用标记功能
let outsourcingCompaniesList = []; // 缓存外包公司列表
let observer = null; // MutationObserver 实例

// 异步函数：从 config.json 文件中获取外包公司列表
async function fetchConfigInternal() {
  try {
    // 从服务器API获取外包公司列表
    const response = await fetch('https://boss.chaosyn.com/companies');
    // 检查请求是否成功
    if (!response.ok) {
      console.error('获取外包公司名单失败:', response.statusText);
      return []; // 请求失败则返回空数组
    }
    // 解析 JSON 数据
    console.log('API响应:', response);

    const config = await response.json();
    console.log('获取到的数据:', config);
    
    // 存储到全局变量并返回
    outsourcingCompaniesList = config.outsourcing_companies || [];
    return outsourcingCompaniesList;
  } catch (error) {
    console.error('获取或解析外包公司数据时发生错误:', error);
    return []; // 发生错误则返回空数组
  }
}

// 函数：添加公司到外包列表
async function addCompanyToOutsourcingList(companyName) {
  try {
    const response = await fetch('https://boss.chaosyn.com/add-company', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ companyName })
    });
    
    const data = await response.json();
    
    if (response.ok) {
      showToast(`添加成功：${companyName}已添加到外包公司列表`, 'success');
      // 更新缓存的列表
      if (!outsourcingCompaniesList.includes(companyName)) {
        outsourcingCompaniesList.push(companyName);
      }
      return true;
    } else {
      showToast(`添加失败：${data.message}`, 'error');
      return false;
    }
  } catch (error) {
    showToast(`请求失败：${error.message}`, 'error');
    return false;
  }
}

// 函数：显示提示消息
function showToast(message, type = 'info') {
  // 检查是否已存在toast元素，如果有则移除
  const existingToast = document.getElementById('outsourcing-toast');
  if (existingToast) {
    existingToast.remove();
  }
  
  // 创建toast元素
  const toast = document.createElement('div');
  toast.id = 'outsourcing-toast';
  toast.style.position = 'fixed';
  toast.style.top = '20px'; // 修改为顶部显示
  toast.style.left = '50%';
  toast.style.transform = 'translateX(-50%)';
  toast.style.padding = '10px 20px';
  toast.style.borderRadius = '4px';
  toast.style.fontSize = '14px';
  toast.style.zIndex = '10000';
  toast.style.boxShadow = '0 2px 8px rgba(0,0,0,0.2)';
  
  // 根据类型设置样式
  if (type === 'success') {
    toast.style.backgroundColor = '#dff0d8';
    toast.style.color = '#3c763d';
    toast.style.border = '1px solid #d6e9c6';
  } else if (type === 'error') {
    toast.style.backgroundColor = '#f2dede';
    toast.style.color = '#a94442';
    toast.style.border = '1px solid #ebccd1';
  } else {
    toast.style.backgroundColor = '#d9edf7';
    toast.style.color = '#31708f';
    toast.style.border = '1px solid #bce8f1';
  }
  
  toast.textContent = message;
  document.body.appendChild(toast);
  
  // 3秒后自动消失
  setTimeout(() => {
    if (toast && toast.parentNode) {
      toast.remove();
    }
  }, 3000);
}

// 函数：在公司页面添加"添加到外包列表"按钮
function addButtonToCompanyPage() {
  // 检查当前是否在公司页面
  if (!window.location.href.includes('/gongsi/')) {
    return;
  }
  
  // 查找公司名称元素
  const companyNameElement = document.querySelector('h1.name');
  if (!companyNameElement) {
    return;
  }
  
  // 检查是否已添加按钮
  if (companyNameElement.querySelector('.add-outsourcing-btn')) {
    return;
  }
  
  // 获取公司名称
  const companyName = companyNameElement.firstChild.textContent.trim();
  // 创建按钮
  const addButton = document.createElement('button');
  addButton.className = 'add-outsourcing-btn';
  addButton.textContent = '标记为外包';
  addButton.style.marginLeft = '10px';
  addButton.style.fontSize = '12px';
  addButton.style.padding = '2px 8px';
  addButton.style.backgroundColor = '#5dd5c8';
  addButton.style.color = '#fff';
  addButton.style.border = 'none';
  addButton.style.borderRadius = '3px';
  addButton.style.cursor = 'pointer';
  
  // 检查公司是否已在列表中
  if (outsourcingCompaniesList.includes(companyName)) {
    addButton.textContent = '已在外包列表';
    addButton.style.backgroundColor = '#ccc';
    addButton.disabled = true;
  }
  
  // 添加点击事件
  addButton.addEventListener('click', async () => {
    if (!addButton.disabled) {
      addButton.disabled = true;
      addButton.textContent = '添加中...';
      
      const success = await addCompanyToOutsourcingList(companyName);
      
      if (success) {
        addButton.textContent = '已在外包列表';
        addButton.style.backgroundColor = '#ccc';
      } else {
        addButton.disabled = false;
        addButton.textContent = '标记为外包';
      }
    }
  });
  
  // 添加按钮到公司名称元素
  companyNameElement.appendChild(addButton);
}

// 函数：根据外包公司列表标记页面上的公司
function markOutsourcingCompanies() {
  if (!isMarkingEnabled || !outsourcingCompaniesList || outsourcingCompaniesList.length === 0) {
    // console.log('标记功能已禁用或外包公司列表为空。');
    return;
  }
  const outsourcingCompanies = outsourcingCompaniesList; // 使用缓存的列表
  // 如果外包公司列表为空或未定义，则不执行任何操作
  if (!outsourcingCompanies || outsourcingCompanies.length === 0) {
    console.log('未配置外包公司或配置为空。');
    return;
  }

  // 在公司页面添加按钮
  addButtonToCompanyPage();

  // 选择器：用于选取页面上职位卡片的页脚部分。这个选择器可能需要根据 Boss 直聘页面的实际 HTML 结构进行调整。
  // 这是一个常见的用于查找职位列表项的模式。
  const jobCards = document.querySelectorAll('.job-card-footer'); 
  
  if (jobCards.length != 0) {
    // 遍历所有找到的职位卡片
    jobCards.forEach(card => {
        // 尝试在职位卡片中找到公司名称元素。
        // 这个选择器是一个猜测，很可能需要根据实际页面结构更新。
        const companyNameElement = card.querySelector('.boss-name'); 
        if (companyNameElement) {
        // 获取公司名称并去除首尾空格
        const companyName = companyNameElement.textContent.trim();
        // 检查公司名称是否存在于外包公司列表中
        if (outsourcingCompanies.includes(companyName)) {
            // 检查是否已经标记，避免重复标记
            if (card.querySelector('.outsourcing-tag')) {
                return; // 如果已标记，则跳过
            }

            // 创建一个新的 span 元素作为标记
            const tag = document.createElement('span');
            tag.textContent = '外包'; // 标记文本
            tag.classList.add('outsourcing-tag'); // 添加 CSS 类以便样式化
            
            // 尝试将标记附加到职位卡片中一个可见且合适的位置。
            // 这个位置可能需要调整。
            const companyInfoBox = card.querySelector('.job-info.clearfix'); // 一个常见的信息展示区域
            if (companyInfoBox) {
                companyInfoBox.appendChild(tag); // 附加到公司信息区域
            } else {
                // 备选方案：直接附加到卡片上，可能看起来不理想
                card.style.position = 'relative'; // 确保如果标记使用绝对定位时能正确显示
                card.appendChild(tag); // 直接附加到卡片
            }
        }
        }
    });
  }
  
    // 下面是消息列表的外包公司标记
  const messageList = document.querySelector('.chat-content');
  if (messageList) {
    const name_box = messageList.querySelectorAll('.name-box');
    
    name_box.forEach(box => {
        const box_spans = box.querySelectorAll('span')
        const companyName = box_spans[1].textContent.trim();
        if (outsourcingCompanies.includes(companyName)) {
            if (box.querySelector('.outsourcing-tag')) {
                return; // 如果已标记，则跳过
            }
            // 创建一个 span 元素作为外包标签
            const tag = document.createElement('span');
            tag.textContent = '外包'; // 标签文本
            tag.classList.add('outsourcing-tag'); // 为标签添加 CSS 类以便样式化

            // 加到消息的开头
            if (box.firstChild) {
                box.insertBefore(tag, box.firstChild);
              } else {
                box.appendChild(tag);
              }
        }
    })
  }
  
    // 下面是消息列表的外包公司标记
    const bottom_div = document.querySelectorAll('.sub-li-bottom');
    if (bottom_div) {
        bottom_div.forEach(div => {
            const bottom_p = div.querySelector('p')
            const companyName = bottom_p.querySelector('span').textContent.trim();
            if (outsourcingCompanies.includes(companyName)) {
                if (div.querySelector('.outsourcing-tag')) {
                    return; // 如果已标记，则跳过
                }
                // 创建一个 span 元素作为外包标签
                const tag = document.createElement('span');
                tag.textContent = '外包'; // 标签文本
                tag.classList.add('outsourcing-tag'); // 为标签添加 CSS 类以便样式化
                // 加到公司名称后面
                const bottom_a = div.querySelector('a')
                if (bottom_a.children[1]) {
                    bottom_a.insertBefore(tag, bottom_a.children[1]);
                  } else {
                    bottom_a.appendChild(tag);
                  }
            }
        })
    }

    // 下面是推荐列表的外包公司标记
    const similar_company_span = document.querySelectorAll('.similar-job-company');
    const info_conpany_span = document.querySelectorAll('.info-company-logo');
    recommend_company_span = [...similar_company_span, ...info_conpany_span]
    if (recommend_company_span) {
        recommend_company_span.forEach( one_similar_company_span => {
            var companyName = '';
            if (one_similar_company_span.querySelector('.company-name')){
                companyName = one_similar_company_span.querySelector('.company-name').textContent.trim();

            }
            else{
                companyName = one_similar_company_span.querySelector('.company-logo-name').textContent.trim();
            }
            if (outsourcingCompanies.includes(companyName)) {
                if (one_similar_company_span.querySelector('.outsourcing-tag')) {
                    return; // 如果已标记，则跳过
                }
                // 创建一个 span 元素作为外包标签
                const tag = document.createElement('span');
                tag.textContent = '外包'; // 标签文本
                tag.classList.add('outsourcing-tag'); // 为标签添加 CSS 类以便样式化
                // 加到公司名称后面
                one_similar_company_span.appendChild(tag);
            }
        })
    }

}


// 函数：移除页面上所有的外包标记
function removeOutsourcingMarks() {
  const tags = document.querySelectorAll('.outsourcing-tag');
  tags.forEach(tag => tag.remove());
  // console.log('所有外包标记已移除。');
  // 如果存在观察器，则停止观察
  if (observer) {
    observer.disconnect();
    // console.log('MutationObserver已停止。');
  }
}

// 主函数：脚本的主要执行逻辑
async function main() {
  // 从存储中加载启用状态
  const data = await new Promise(resolve => chrome.storage.sync.get('isOutsourcingMarkingEnabled', resolve));
  isMarkingEnabled = data.isOutsourcingMarkingEnabled !== undefined ? data.isOutsourcingMarkingEnabled : true;

  if (!isMarkingEnabled) {
    // console.log('标记功能已禁用，移除现有标记。');
    removeOutsourcingMarks();
    return;
  }

  // console.log('标记功能已启用。');
  // 获取外包公司列表
  if (outsourcingCompaniesList.length === 0) { // 仅当列表为空时才获取
    await fetchConfigInternal();
  }
  
  // 如果外包公司列表不为空
  if (outsourcingCompaniesList.length > 0) {
    // 初始标记：页面加载完成后立即标记一次
    markOutsourcingCompanies();

    // 确保只创建一个观察器实例
    if (observer) {
        observer.disconnect(); // 先断开旧的
    }
    // 观察 DOM 变化，以便标记动态加载的内容
    // 创建一个 MutationObserver 实例来监听 DOM 树的变化
    observer = new MutationObserver((mutationsList, obs) => {
      if (!isMarkingEnabled) {
        obs.disconnect(); // 如果标记被禁用，停止观察
        return;
      }
      // 当 DOM 发生变化时，重新执行标记函数。
      markOutsourcingCompanies();
    });

    // 配置观察器：监听 document.body 及其所有子节点的 childList 和 subtree 变化
    observer.observe(document.body, { childList: true, subtree: true });
  } else {
    // console.log('外包公司列表为空，将不进行任何标记。');
  }
}
  

// 运行脚本：当页面完全加载或 DOM 准备就绪时执行主函数
if (document.readyState === 'loading') {  // 如果文档仍在加载中
  document.addEventListener('DOMContentLoaded', main);
} else {  // 如果 DOMContentLoaded 事件已经触发
  main();
}

// 监听来自 popup 的消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'toggleOutsourcingMarking') {
    isMarkingEnabled = request.enabled;
    // console.log(`标记功能已切换为: ${isMarkingEnabled}`);
    if (isMarkingEnabled) {
      main(); // 重新执行主逻辑以应用标记
    } else {
      removeOutsourcingMarks(); // 移除所有标记
    }
    sendResponse({ status: 'success', enabled: isMarkingEnabled });
  }
  return true; // Indicates that the response is sent asynchronously
});
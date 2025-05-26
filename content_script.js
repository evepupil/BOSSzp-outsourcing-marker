// content_script.js - 内容脚本，用于在Boss直聘页面上标记外包公司

let isMarkingEnabled = true; // 默认启用标记功能
let outsourcingCompaniesList = []; // 缓存外包公司列表
let observer = null; // MutationObserver 实例

// 异步函数：从 config.json 文件中获取外包公司列表
async function fetchConfigInternal() {
  try {
    // 从服务器API获取外包公司列表
    const response = await fetch('http://localhost:3000/api/outsourcing-companies');
    // 检查请求是否成功
    if (!response.ok) {
      console.error('获取 config.json 失败:', response.statusText);
      return []; // 请求失败则返回空数组
    }
    // 解析 JSON 数据
    const config = await response.json();
    // 存储到全局变量并返回
    outsourcingCompaniesList = config.outsourcing_companies || [];
    return outsourcingCompaniesList;
  } catch (error) {
    console.error('获取或解析 config.json 时发生错误:', error);
    return []; // 发生错误则返回空数组
  }
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
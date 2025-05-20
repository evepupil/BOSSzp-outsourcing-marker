// content_script.js - 内容脚本，用于在Boss直聘页面上标记外包公司

// 异步函数：从 config.json 文件中获取外包公司列表
async function fetchConfig() {
  try {
    // 使用 chrome.runtime.getURL 获取插件内文件的绝对路径
    const response = await fetch(chrome.runtime.getURL('config.json'));
    // 检查请求是否成功
    if (!response.ok) {
      console.error('获取 config.json 失败:', response.statusText);
      return []; // 请求失败则返回空数组
    }
    // 解析 JSON 数据
    const config = await response.json();
    // 返回 outsourcing_companies 数组，如果不存在则返回空数组
    return config.outsourcing_companies || [];
  } catch (error) {
    console.error('获取或解析 config.json 时发生错误:', error);
    return []; // 发生错误则返回空数组
  }
}

// 函数：根据外包公司列表标记页面上的公司
function markOutsourcingCompanies(outsourcingCompanies) {
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
  

  console.info("开始标记消息列表")
    // 下面是消息列表的外包公司标记
  const messageList = document.querySelector('.chat-content');
  if (messageList) {
    const name_box = messageList.querySelectorAll('.name-box');
    
    name_box.forEach(box => {
        const box_spans = box.querySelectorAll('span')
        console.info(box_spans)

        const companyName = box_spans[1].textContent.trim();
        console.info(companyName)
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
  
}

// 主函数：脚本的主要执行逻辑
async function main() {
  // 获取外包公司列表
  const outsourcingCompanies = await fetchConfig();
  // 如果外包公司列表不为空
  if (outsourcingCompanies.length > 0) {
    // 初始标记：页面加载完成后立即标记一次
    markOutsourcingCompanies(outsourcingCompanies);

    // 观察 DOM 变化，以便标记动态加载的内容
    // 创建一个 MutationObserver 实例来监听 DOM 树的变化
    const observer = new MutationObserver((mutationsList, observer) => {
      // 当 DOM 发生变化时，重新执行标记函数。
      // 如果需要，这里可以更具体地检查变化的类型，但目前是任何变化都重新检查。
      markOutsourcingCompanies(outsourcingCompanies);
    });

    // 配置观察器：监听 document.body 及其所有子节点的 childList 和 subtree 变化
    observer.observe(document.body, { childList: true, subtree: true });
  } else {
    console.log('外包公司列表为空，将不进行任何标记。');
  }
}

// 运行脚本：当页面完全加载或 DOM 准备就绪时执行主函数
if (document.readyState === 'loading') {  // 如果文档仍在加载中
  document.addEventListener('DOMContentLoaded', main); // 监听 DOMContentLoaded 事件
} else {  // 如果 DOMContentLoaded 事件已经触发
  main(); // 直接执行主函数
}
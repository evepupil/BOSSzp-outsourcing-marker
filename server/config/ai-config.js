/**
 * AI服务配置
 * 包含默认的API设置和模型参数
 */
const aiConfig = {
  // API基础URL
  baseUrl: process.env.AI_BASE_URL || 'https://api.deepseek.com/v1',
  
  // 默认使用DeepSeek V3模型
  model: process.env.AI_MODEL || 'deepseek-v3',
  
  // 自定义参数
  hySource: process.env.HY_SOURCE || 'api',
  hyUser: process.env.HY_USER || '',
  hyToken: process.env.HY_TOKEN || '',
  agentId: process.env.AGENT_ID || '',
  chatId: process.env.CHAT_ID || '',
  
  // 重试配置
  retries: parseInt(process.env.AI_RETRIES || '3'),
  retryDelay: parseInt(process.env.AI_RETRY_DELAY || '1000'),
  
  // 超时设置（毫秒）
  timeout: parseInt(process.env.AI_TIMEOUT || '60000'),
};

export default aiConfig; 
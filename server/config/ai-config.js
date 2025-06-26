import dotenv from 'dotenv';

// 加载环境变量
dotenv.config({ path: '.env.local' });

/**
 * AI服务配置
 * 包含默认的API设置和模型参数
 */
const aiConfig = {
  // API基础URL
  baseUrl: process.env.AI_BASE_URL || 'https://api.deepseek.com/v1',
  
  // 默认使用DeepSeek V3模型
  model: process.env.AI_MODEL || 'deepseek-v3',
  
  // 温度参数，控制创造性（0-1）
  // 对于判断类任务，使用较低的温度以获得更一致的结果
  temperature: parseFloat(process.env.AI_TEMPERATURE || '0.2'),
  
  // 最大令牌数
  maxTokens: parseInt(process.env.AI_MAX_TOKENS || '4096'),
  
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

// 输出配置信息用于调试
console.log('AI配置加载完成:', {
  baseUrl: aiConfig.baseUrl,
  model: aiConfig.model,
  hySource: aiConfig.hySource,
  hyUser: aiConfig.hyUser ? '已设置' : '未设置',
  hyToken: aiConfig.hyToken ? '已设置' : '未设置',
  agentId: aiConfig.agentId,
});

export default aiConfig; 
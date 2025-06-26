import OpenAI from 'openai';
import aiConfig from '../config/ai-config.js';
import promptTemplates from '../config/prompt-templates.js';

/**
 * AI服务类 - 处理与DeepSeek API的交互
 */
class AIService {
  /**
   * 创建AI服务实例
   * @param {Object} config - 配置项
   * @param {string} config.baseUrl - API基础URL
   * @param {string} config.model - 使用的模型名称
   * @param {string} config.hySource - 来源标识
   * @param {string} config.hyUser - 用户标识
   * @param {string} config.hyToken - 认证令牌
   * @param {string} config.agentId - 代理ID
   * @param {string} config.chatId - 聊天ID
   */
  constructor(config = {}) {
    // 合并默认配置和传入的配置
    const mergedConfig = { ...aiConfig, ...config };
    
    this.baseUrl = mergedConfig.baseUrl;
    this.model = mergedConfig.model;
    this.temperature = mergedConfig.temperature;
    
    // 自定义参数
    this.hySource = mergedConfig.hySource;
    this.hyUser = mergedConfig.hyUser;
    this.hyToken = mergedConfig.hyToken;
    this.agentId = mergedConfig.agentId;
    this.chatId = mergedConfig.chatId;
    
    // 初始化客户端
    this.client = new OpenAI({
      baseURL: this.baseUrl,
      apiKey: this.hyToken
    });
    
    // 提示词模板
    this.promptTemplates = promptTemplates;
  }

  /**
   * 获取提示词模板
   * @param {string} templateName - 模板名称
   * @param {Object} variables - 变量对象
   * @returns {string} - 格式化后的提示词
   */
  getPrompt(templateName, variables = {}) {
    const template = this.promptTemplates[templateName];
    if (!template) {
      throw new Error(`提示词模板 "${templateName}" 不存在`);
    }
    
    // 替换模板中的变量
    let prompt = template;
    for (const [key, value] of Object.entries(variables)) {
      prompt = prompt.replace(new RegExp(`{{${key}}}`, 'g'), value);
    }
    
    return prompt;
  }

  /**
   * 发送请求到AI并处理流式响应
   * @param {Array} messages - 消息数组，格式为[{role: 'user', content: '你好'}]
   * @param {Function} onChunk - 每次收到响应块时的回调函数
   * @returns {Promise<string>} - 完整的响应文本
   */
  async streamCompletion(messages, onChunk) {
    try {
      // 调用API
      const response = await this.client.chat.completions.create({
        model: this.model,
        messages: messages,
        temperature: this.temperature,
        stream: true,
        extra_body: {
          hy_source: this.hySource,
          hy_user: this.hyUser,
          hy_token: this.hyToken,
          agent_id: this.agentId,
          chat_id: this.chatId,
          should_remove_conversation: false,
        },
      });

      // 拼接流式响应
      let fullText = "";
      
      // 处理流式响应
      for await (const chunk of response) {
        if (chunk.choices[0]?.delta?.content) {
          const content = chunk.choices[0].delta.content;
          const cleanedContent = content.replace(/\[text\]/g, '');
          
          fullText += cleanedContent;
          
          // 如果提供了回调函数，则调用
          if (typeof onChunk === 'function') {
            onChunk(cleanedContent, fullText);
          }
        }
      }
      
      return fullText;
    } catch (error) {
      console.error('AI请求错误:', error);
      throw error;
    }
  }

  /**
   * 发送非流式请求到AI
   * @param {Array} messages - 消息数组
   * @returns {Promise<string>} - 响应文本
   */
  async completion(messages) {
    try {
      const response = await this.client.chat.completions.create({
        model: this.model,
        messages: messages,
        temperature: this.temperature,
        extra_body: {
          hy_source: this.hySource,
          hy_user: this.hyUser,
          hy_token: this.hyToken,
          agent_id: this.agentId,
          chat_id: this.chatId,
          should_remove_conversation: false,
        },
      });

      return response.choices[0].message.content.replace(/\[text\]/g, '');
    } catch (error) {
      console.error('AI请求错误:', error);
      throw error;
    }
  }
}

export default AIService; 
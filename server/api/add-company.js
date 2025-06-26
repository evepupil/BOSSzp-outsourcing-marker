import { createClient } from 'redis';
import AIService from '../services/ai-service.js';
import dotenv from 'dotenv';

// 加载环境变量
dotenv.config({ path: '.env.local' });

// Redis客户端实例
let redisClient = null;

// 获取Redis客户端实例
async function getRedisClient() {
  if (!redisClient) {
    redisClient = createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379'
    });
    await redisClient.connect();
  }
  return redisClient;
}

// 创建AI服务实例
const aiService = new AIService();

// Vercel API路由处理函数
export default async function handler(req, res) {
  // 设置CORS头部
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  
  // 处理OPTIONS请求（预检请求）
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // 只允许POST请求
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST', 'OPTIONS']);
    return res.status(405).json({ message: `不支持${req.method}方法` });
  }
  
  let redis = null;
  try {
    // 验证请求体
    if (!req.body) {
      return res.status(400).json({ message: '请求体不能为空' });
    }
    
    const { companyName } = req.body;
    
    // 验证公司名称
    if (!companyName || typeof companyName !== 'string' || companyName.trim() === '') {
      return res.status(400).json({ message: '公司名称不能为空' });
    }
    
    // 清理公司名称
    const cleanCompanyName = companyName.trim();
    
    // 连接到Redis
    console.log('正在连接到Redis...');
    redis = await getRedisClient();
    
    // 获取当前外包公司列表
    console.log('获取现有公司列表...');
    const companiesJson = await redis.get('outsourcing_companies');
    let outsourcingCompanies = [];
    
    if (companiesJson) {
      outsourcingCompanies = JSON.parse(companiesJson);
      console.log(`获取到${outsourcingCompanies.length}家现有公司`);
    } else {
      console.log('未找到现有公司列表，使用空数组');
    }
    
    // 检查公司是否已存在
    if (outsourcingCompanies.includes(cleanCompanyName)) {
      return res.status(409).json({ message: '该公司已存在于列表中' });
    }
    
    // 使用AI判断是否为外包公司
    console.log(`正在使用AI判断 "${cleanCompanyName}" 是否为外包公司...`);
    try {
      // 使用提示词模板
      const aiResponse = await aiService.streamCompletion([
        { 
          role: 'user', 
          content: aiService.getPrompt('outsourcing', { query: cleanCompanyName }) 
        }
      ]);
      
      console.log(`AI判断结果: ${aiResponse}`);
      
      // 解析AI响应
      const isOutsourcing = aiResponse.toLowerCase().includes('true');
      
      if (!isOutsourcing) {
        return res.status(400).json({ 
          message: 'AI识别该公司不是外包公司，如有疑问请在git上提交issue', 
          aiResponse: aiResponse
        });
      }
      
      console.log(`AI确认 "${cleanCompanyName}" 为外包公司，继续添加...`);
    } catch (aiError) {
      console.error('AI判断出错:', aiError);
      // AI判断失败时，记录错误但继续添加公司
      console.log('由于AI判断失败，将跳过验证继续添加公司');
    }
    
    // 添加新公司
    const updatedCompanies = [...outsourcingCompanies, cleanCompanyName];
    
    // 按字母顺序排序（可选）
    updatedCompanies.sort();
    
    // 更新Redis中的公司列表
    console.log('正在更新Redis中的公司列表...');
    await redis.set('outsourcing_companies', JSON.stringify(updatedCompanies));
    console.log('Redis更新成功');
    
    // 返回成功响应
    return res.status(201).json({ 
      message: '公司添加成功',
      company: cleanCompanyName,
      total: updatedCompanies.length
    });
    
  } catch (error) {
    console.error('Error:', error);
    
    // 返回错误响应
    return res.status(500).json({ 
      message: '添加公司失败', 
      error: error.message || '未知错误'
    });
  }
} 
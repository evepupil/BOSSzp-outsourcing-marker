import { createClient } from 'redis';

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

// Vercel API路由处理函数
export default async function handler(req, res) {
  // 设置CORS头
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // 处理预检请求
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // 只允许GET请求
  if (req.method !== 'GET') {
    return res.status(405).json({ error: '不支持的请求方法' });
  }

  let redis = null;
  try {
    // 连接到Redis
    console.log('正在连接到Redis...');
    redis = await getRedisClient();
    
    // 从Redis获取公司列表
    console.log('正在获取外包公司列表...');
    const companiesJson = await redis.get('outsourcing_companies');
    
    // 解析公司列表
    let companies = [];
    if (companiesJson) {
      companies = JSON.parse(companiesJson);
      console.log(`成功获取了${companies.length}家公司`);
    } else {
      console.log('未找到公司列表，返回空数组');
    }
    
    // 确保companies是一个数组
    if (!Array.isArray(companies)) {
      console.log('获取到的公司列表不是数组，使用空数组');
      companies = [];
    }
    
    // 返回公司列表
    return res.status(200).json({ 
      outsourcing_companies: companies,
      count: companies.length,
      updated_at: new Date().toISOString()
    });
  } catch (error) {
    console.error('处理请求时出错:', error);
    return res.status(500).json({ error: '获取公司列表时发生错误' });
  }
} 
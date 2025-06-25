import { createClient } from '@vercel/edge-config';

// Vercel API路由处理函数
export default async function handler(req, res) {
  // 设置CORS头部
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  
  // 处理OPTIONS请求（预检请求）
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // 只允许GET请求
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET', 'OPTIONS']);
    return res.status(405).json({ message: `不支持${req.method}方法` });
  }
  
  try {
    // 创建Edge Config客户端
    const edgeConfig = createClient(process.env.EDGE_CONFIG);
    
    // 从Edge Config获取外包公司列表
    const outsourcingCompanies = await edgeConfig.get('outsourcing_companies') || [];
    
    // 返回成功响应
    return res.status(200).json({ 
      outsourcing_companies: outsourcingCompanies,
      count: outsourcingCompanies.length,
      updated_at: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error:', error);
    
    // 返回错误响应
    return res.status(500).json({ 
      message: '获取外包公司名单失败', 
      error: error.message 
    });
  }
} 
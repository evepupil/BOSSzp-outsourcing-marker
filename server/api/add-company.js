import { createClient } from '@vercel/edge-config';

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
    
    // 创建Edge Config客户端
    const edgeConfig = createClient(process.env.EDGE_CONFIG);
    
    // 获取当前外包公司列表
    const outsourcingCompanies = await edgeConfig.get('outsourcing_companies') || [];
    
    // 检查公司是否已存在
    if (outsourcingCompanies.includes(cleanCompanyName)) {
      return res.status(409).json({ message: '该公司已存在于列表中' });
    }
    
    // 添加新公司
    const updatedCompanies = [...outsourcingCompanies, cleanCompanyName];
    
    // 按字母顺序排序（可选）
    updatedCompanies.sort();
    
    // 更新Edge Config
    await edgeConfig.set('outsourcing_companies', updatedCompanies);
    
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
      error: error.message 
    });
  }
} 
import fs from 'fs';
import path from 'path';

// 查找并获取数据文件路径
async function findDataFilePath() {
  const possiblePaths = [
    path.join(process.cwd(), 'outsourcing-companies.json'),
    path.join(process.cwd(), 'server/outsourcing-companies.json'),
    path.join(process.cwd(), '../outsourcing-companies.json')
  ];
  
  for (const p of possiblePaths) {
    try {
      if (fs.existsSync(p)) {
        return p;
      }
    } catch (e) {
      console.log(`尝试路径失败: ${p}`);
    }
  }
  
  return null;
}

// 读取公司数据
async function readCompaniesData() {
  const filePath = await findDataFilePath();
  if (!filePath) {
    throw new Error('数据文件不存在');
  }
  
  const data = fs.readFileSync(filePath, 'utf8');
  return { 
    filePath, 
    data: JSON.parse(data) 
  };
}

// 写入公司数据
async function writeCompaniesData(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
}

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
    
    // 读取当前数据
    const { filePath, data } = await readCompaniesData();
    
    // 检查公司是否已存在
    if (data.outsourcing_companies.includes(cleanCompanyName)) {
      return res.status(409).json({ message: '该公司已存在于列表中' });
    }
    
    // 添加新公司
    data.outsourcing_companies.push(cleanCompanyName);
    
    // 按字母顺序排序（可选）
    data.outsourcing_companies.sort();
    
    // 写入文件
    await writeCompaniesData(filePath, data);
    
    // 返回成功响应
    return res.status(201).json({ 
      message: '公司添加成功',
      company: cleanCompanyName,
      total: data.outsourcing_companies.length
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
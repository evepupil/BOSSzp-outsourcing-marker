import fs from 'fs';
import path from 'path';

// Vercel API路由处理函数
export default async function handler(req, res) {
  // 只允许GET请求
  if (req.method !== 'GET' && req.method !== 'OPTIONS') {
    res.setHeader('Allow', ['GET', 'OPTIONS']);
    return res.status(405).json({ message: `不支持${req.method}方法` });
  }

  // 处理OPTIONS请求（预检请求）
  if (req.method === 'OPTIONS') {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    return res.status(200).end();
  }

  try {
    // 读取JSON文件 - 尝试多种可能的路径
    let data;
    let jsonPath;
    
    // 尝试不同的路径
    const possiblePaths = [
      path.join(process.cwd(), 'outsourcing-companies.json'),
      path.join(process.cwd(), 'server/outsourcing-companies.json'),
      path.join(process.cwd(), '../outsourcing-companies.json')
    ];
    
    // 尝试读取文件
    for (const p of possiblePaths) {
      try {
        if (fs.existsSync(p)) {
          jsonPath = p;
          data = fs.readFileSync(jsonPath, 'utf8');
          console.log(`成功从路径读取数据: ${jsonPath}`);
          break;
        }
      } catch (e) {
        console.log(`尝试路径失败: ${p}`);
      }
    }
    
    // 如果没有找到文件
    if (!data) {
      console.error('无法找到数据文件');
      return res.status(500).json({ message: '数据文件不存在' });
    }
    
    const companies = JSON.parse(data);
    
    // 设置CORS头部
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Allow-Origin', '*'); // 允许跨域请求
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    
    // 返回成功响应
    return res.status(200).json(companies);
  } catch (error) {
    console.error('Error:', error);
    
    // 返回错误响应
    return res.status(500).json({ message: '获取外包公司名单失败', error: error.message });
  }
} 
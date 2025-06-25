import fs from 'fs';
import path from 'path';

// 修改为Vercel API路由格式
export default async function handler(req, res) {
  try {
    // 读取JSON文件
    const jsonPath = path.join(process.cwd(), 'outsourcing-companies.json');
    const data = fs.readFileSync(jsonPath, 'utf8');
    const companies = JSON.parse(data);
    
    // 设置CORS头部
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Allow-Origin', '*'); // 允许跨域请求
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    
    // 返回成功响应
    res.status(200).json(companies);
  } catch (error) {
    console.error('Error:', error);
    
    // 返回错误响应
    res.status(500).json({ message: '获取外包公司名单失败', error: error.message });
  }
} 
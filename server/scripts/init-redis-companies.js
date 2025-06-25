import { createClient } from 'redis';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// 加载环境变量
dotenv.config({ path: '.env.local' });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function initializeCompanies() {
  // 创建Redis客户端
  const redis = createClient({
    url: process.env.REDIS_URL || 'redis://localhost:6379'
  });
  
  try {
    // 连接到Redis
    console.log('正在连接到Redis...');
    await redis.connect();
    console.log('Redis连接成功');
    
    // 检查是否已存在公司列表
    console.log('检查是否存在外包公司列表...');
    const existingCompaniesJson = await redis.get('outsourcing_companies');
    let existingCompanies = [];
    
    if (existingCompaniesJson) {
      existingCompanies = JSON.parse(existingCompaniesJson);
      console.log(`外包公司列表已存在，包含 ${existingCompanies.length} 家公司`);
      console.log('如需重置，请使用 --reset 参数');
      
      if (!process.argv.includes('--reset')) {
        await redis.quit();
        process.exit(0);
      } else {
        console.log('正在重置外包公司列表...');
      }
    }
    
    // 从文件加载初始数据
    let initialCompanies = [];
    const jsonPath = path.join(__dirname, '..', 'outsourcing-companies.json');
    
    if (fs.existsSync(jsonPath)) {
      console.log('从本地文件加载初始数据...');
      const data = fs.readFileSync(jsonPath, 'utf8');
      const json = JSON.parse(data);
      initialCompanies = json.outsourcing_companies || [];
      console.log(`从文件加载了 ${initialCompanies.length} 家公司`);
    }
    
    // 存储到Redis
    console.log('正在将数据存储到Redis...');
    await redis.set('outsourcing_companies', JSON.stringify(initialCompanies));
    console.log(`已成功初始化Redis存储，添加了 ${initialCompanies.length} 家外包公司`);
    
    // 关闭Redis连接
    await redis.quit();
    console.log('Redis连接已关闭');
    
  } catch (error) {
    console.error('初始化Redis存储时出错:', error);
    
    // 确保关闭Redis连接
    try {
      if (redis.isOpen) {
        await redis.quit();
      }
    } catch (closeError) {
      console.error('关闭Redis连接时出错:', closeError);
    }
    
    process.exit(1);
  }
}

initializeCompanies(); 
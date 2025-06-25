import { createClient } from '@vercel/edge-config';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// 加载环境变量
dotenv.config({ path: '.env.local' });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function initializeEdgeConfig() {
  try {
    // 检查是否配置了Edge Config
    if (!process.env.EDGE_CONFIG) {
      console.error('错误: 未设置EDGE_CONFIG环境变量');
      process.exit(1);
    }

    // 创建Edge Config客户端
    const edgeConfig = createClient(process.env.EDGE_CONFIG);

    // 检查是否已存在外包公司列表
    const existingCompanies = await edgeConfig.get('outsourcing_companies');
    
    if (existingCompanies && existingCompanies.length > 0) {
      console.log('外包公司列表已存在，包含', existingCompanies.length, '家公司');
      console.log('如需重置，请使用 --reset 参数');
      
      if (process.argv.includes('--reset')) {
        console.log('正在重置外包公司列表...');
      } else {
        process.exit(0);
      }
    }

    // 读取本地JSON文件（如果存在）
    let initialCompanies = [];
    const jsonPath = path.join(__dirname, '..', 'outsourcing-companies.json');
    
    if (fs.existsSync(jsonPath)) {
      console.log('从本地文件加载初始数据...');
      const data = fs.readFileSync(jsonPath, 'utf8');
      const json = JSON.parse(data);
      initialCompanies = json.outsourcing_companies || [];
    }

    // 设置Edge Config
    await edgeConfig.set('outsourcing_companies', initialCompanies);
    console.log('已成功初始化Edge Config，添加了', initialCompanies.length, '家外包公司');

  } catch (error) {
    console.error('初始化Edge Config时出错:', error);
    process.exit(1);
  }
}

initializeEdgeConfig(); 
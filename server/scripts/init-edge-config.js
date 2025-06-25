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

    if (!process.env.EDGE_CONFIG_TOKEN) {
      console.error('错误: 未设置EDGE_CONFIG_TOKEN环境变量');
      process.exit(1);
    }

    console.log('EDGE_CONFIG值:', process.env.EDGE_CONFIG);
    
    // 从环境变量中提取配置ID
    const configUrl = process.env.EDGE_CONFIG;
    if (!configUrl || !configUrl.includes('edge-config.vercel.com')) {
      throw new Error('无效的Edge Config URL');
    }
    
    const urlParts = configUrl.split('/');
    const configId = urlParts[urlParts.length - 1];
    console.log('Edge Config ID:', configId);

    // 创建Edge Config客户端（仅用于读取）
    const edgeConfig = createClient(process.env.EDGE_CONFIG);

    // 检查是否已存在外包公司列表
    let existingCompanies = [];
    try {
      existingCompanies = await edgeConfig.get('outsourcing_companies') || [];
      console.log('现有外包公司列表:', existingCompanies);
    } catch (getError) {
      console.error('使用客户端获取现有列表失败:', getError);
      
      // 尝试通过API获取
      try {
        console.log('尝试通过API获取现有列表...');
        const getResponse = await fetch(
          `https://api.vercel.com/v1/edge-config/${configId}/items?key=outsourcing_companies`,
          {
            headers: {
              'Authorization': `Bearer ${process.env.EDGE_CONFIG_TOKEN}`
            }
          }
        );
        
        if (getResponse.ok) {
          const data = await getResponse.json();
          if (data && Array.isArray(data.value)) {
            existingCompanies = data.value;
            console.log('通过API获取到现有列表:', existingCompanies);
          }
        } else {
          console.log('API获取列表失败，使用空数组继续');
        }
      } catch (apiGetError) {
        console.error('API获取列表失败:', apiGetError);
      }
    }
    
    if (existingCompanies && existingCompanies.length > 0) {
      console.log('外包公司列表已存在，包含', existingCompanies.length, '家公司');
      console.log('如需重置，请使用 --reset 参数');
      
      if (!process.argv.includes('--reset')) {
        process.exit(0);
      } else {
        console.log('正在重置外包公司列表...');
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
      console.log('从文件加载了', initialCompanies.length, '家公司');
    }

    // 通过Vercel API更新Edge Config
    console.log('通过API更新Edge Config...');
    const response = await fetch(
      `https://api.vercel.com/v1/edge-config/${configId}/items`,
      {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${process.env.EDGE_CONFIG_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          items: [
            {
              operation: 'update',
              key: 'outsourcing_companies',
              value: initialCompanies
            }
          ]
        })
      }
    );
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API请求失败: ${response.status} - ${errorText}`);
    }
    
    console.log('API更新成功');
    console.log('已成功初始化Edge Config，添加了', initialCompanies.length, '家外包公司');

  } catch (error) {
    console.error('初始化Edge Config时出错:', error);
    process.exit(1);
  }
}

initializeEdgeConfig(); 
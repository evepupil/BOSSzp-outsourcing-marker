import { createClient } from '@vercel/edge-config';

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

  try {
    // 检查环境变量
    if (!process.env.EDGE_CONFIG) {
      console.error('错误: 未设置EDGE_CONFIG环境变量');
      return res.status(500).json({ error: '服务器配置错误' });
    }

    console.log('正在尝试获取外包公司列表...');
    
    // 创建Edge Config客户端
    const edgeConfig = createClient(process.env.EDGE_CONFIG);
    
    // 尝试从Edge Config获取公司列表
    let companies = [];
    try {
      companies = await edgeConfig.get('outsourcing_companies');
      console.log(`成功从Edge Config获取了${companies ? companies.length : 0}家公司`);
    } catch (edgeError) {
      console.error('从Edge Config获取数据失败:', edgeError);
      
      // 如果Edge Config客户端失败，尝试使用API
      if (process.env.EDGE_CONFIG_TOKEN) {
        console.log('尝试通过API获取数据...');
        try {
          // 从环境变量中提取配置ID
          const configUrl = process.env.EDGE_CONFIG;
          if (!configUrl || !configUrl.includes('edge-config.vercel.com')) {
            throw new Error('无效的Edge Config URL');
          }
          
          const urlParts = configUrl.split('/');
          const configId = urlParts[urlParts.length - 1];
          
          const response = await fetch(
            `https://api.vercel.com/v1/edge-config/${configId}/items?key=outsourcing_companies`,
            {
              headers: {
                'Authorization': `Bearer ${process.env.EDGE_CONFIG_TOKEN}`
              }
            }
          );
          
          if (!response.ok) {
            throw new Error(`API请求失败: ${response.status}`);
          }
          
          const data = await response.json();
          if (data && Array.isArray(data.value)) {
            companies = data.value;
            console.log(`成功通过API获取了${companies.length}家公司`);
          } else {
            console.log('API返回了无效数据:', data);
            companies = [];
          }
        } catch (apiError) {
          console.error('通过API获取数据失败:', apiError);
          throw new Error('获取公司列表失败');
        }
      } else {
        console.error('未设置EDGE_CONFIG_TOKEN，无法通过API获取数据');
        throw new Error('获取公司列表失败');
      }
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
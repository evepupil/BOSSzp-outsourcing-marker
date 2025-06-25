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
    
    // 检查环境变量
    if (!process.env.EDGE_CONFIG) {
      throw new Error('未配置EDGE_CONFIG环境变量');
    }
    
    if (!process.env.EDGE_CONFIG_TOKEN) {
      throw new Error('未配置EDGE_CONFIG_TOKEN环境变量');
    }
    
    // 从环境变量中提取配置ID
    const configUrl = process.env.EDGE_CONFIG;
    if (!configUrl || !configUrl.includes('edge-config.vercel.com')) {
      throw new Error('无效的Edge Config URL');
    }
    
    const urlParts = configUrl.split('/');
    const configId = urlParts[urlParts.length - 1];
    
    // 创建Edge Config客户端（仅用于读取）
    const edgeConfig = createClient(process.env.EDGE_CONFIG);
    
    // 获取当前外包公司列表
    let outsourcingCompanies = [];
    try {
      outsourcingCompanies = await edgeConfig.get('outsourcing_companies') || [];
      console.log('获取到现有公司列表:', outsourcingCompanies);
    } catch (getError) {
      console.error('获取公司列表失败:', getError);
      
      // 尝试通过API获取
      try {
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
            outsourcingCompanies = data.value;
            console.log('通过API获取到现有公司列表:', outsourcingCompanies);
          }
        } else {
          console.log('API获取列表失败，使用空数组继续');
        }
      } catch (apiGetError) {
        console.error('API获取列表失败:', apiGetError);
      }
    }
    
    // 检查公司是否已存在
    if (outsourcingCompanies.includes(cleanCompanyName)) {
      return res.status(409).json({ message: '该公司已存在于列表中' });
    }
    
    // 添加新公司
    const updatedCompanies = [...outsourcingCompanies, cleanCompanyName];
    
    // 按字母顺序排序（可选）
    updatedCompanies.sort();
    
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
              value: updatedCompanies
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
      error: error.message || '未知错误'
    });
  }
} 
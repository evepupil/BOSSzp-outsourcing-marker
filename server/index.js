import fs from 'fs';
import path from 'path';

// 获取外包公司名单的处理函数
exports.getOutsourcingCompanies = async (event) => {
  try {
    // 读取JSON文件
    const jsonPath = path.join(__dirname, 'outsourcing-companies.json');
    const data = fs.readFileSync(jsonPath, 'utf8');
    const companies = JSON.parse(data);
    
    // 返回成功响应
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*', // 允许跨域请求
        'Access-Control-Allow-Credentials': true
      },
      body: JSON.stringify(companies)
    };
  } catch (error) {
    console.error('Error:', error);
    
    // 返回错误响应
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      body: JSON.stringify({ message: '获取外包公司名单失败', error: error.message })
    };
  }
}; 
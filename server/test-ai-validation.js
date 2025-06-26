import AIService from './services/ai-service.js';
import dotenv from 'dotenv';

// 加载环境变量
dotenv.config({ path: '.env.local' });

// 测试公司名称
const testCompanies = [
  '华为技术服务有限公司',
  '中软国际科技服务有限公司',
  '软通动力信息技术有限公司',
  '文思海辉技术有限公司',
  '博彦科技股份有限公司',
  '苹果公司',
  '微软公司',
  '腾讯科技有限公司',
  '阿里巴巴集团',
  '百度在线网络技术有限公司',
  '京东集团',
  '小米科技有限责任公司'
];

async function testAIValidation() {
  console.log('开始测试AI外包公司判断功能...\n');
  
  // 创建AI服务实例
  const aiService = new AIService();
  console.log(aiService)
  // 测试每个公司
  for (const company of testCompanies) {
    try {
      console.log(`正在判断: ${company}`);
      
      // 使用提示词模板
      const aiResponse = await aiService.streamCompletion([
        { 
          role: 'user', 
          content: aiService.getPrompt('outsourcing', { query: company }) 
        }
      ]);
      
      // 解析AI响应
      const isOutsourcing = aiResponse.toLowerCase().includes('true');
      
      console.log(`判断结果: ${isOutsourcing ? '是外包公司' : '不是外包公司'}`);
      console.log(`AI原始响应: ${aiResponse}`);
      console.log('-----------------------------------');
    } catch (error) {
      console.error(`判断 ${company} 时出错:`, error);
      console.log('-----------------------------------');
    }
  }
  
  console.log('\n测试完成!');
}

testAIValidation().catch(error => {
  console.error('测试过程中发生错误:', error);
  process.exit(1);
}); 
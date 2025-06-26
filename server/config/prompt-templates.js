/**
 * 提示词模板集合
 * 用于存储各种场景的提示词模板
 * 
 * 使用{{变量名}}作为变量占位符
 */
const promptTemplates = {
  // 通用对话模板
  outsourcing: `你是一个判断是否为外包公司的AI，请判断公司：{{query}}  是否为外包公司，如果是外包公司则返回true，不是则返回false，严禁返回其他内容`,
};

export default promptTemplates; 
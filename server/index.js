// 重定向到API路由
export default function handler(req, res) {
  // 如果请求的是根路径，重定向到API文档或其他页面
  if (req.url === '/') {
    res.setHeader('Location', '/companies');
    res.status(302).end();
    return;
  }
  
  // 否则重定向到companies API
  res.setHeader('Location', '/companies');
  res.status(302).end();
} 
# 外包公司API

这是一个使用Redis存储和管理外包公司列表的API。

## 功能

- 获取外包公司列表
- 添加新的外包公司
- 使用Redis进行数据存储

## 环境设置

1. 复制`.env.example`文件为`.env.local`
2. 更新`.env.local`文件中的`REDIS_URL`值为您的Redis连接URL
   - 本地开发可以使用: `redis://localhost:6379`
   - 生产环境使用您的Redis服务提供商提供的URL

## 安装依赖

```bash
npm install
```

## 初始化Redis数据

```bash
npm run init-redis
```

如需重置数据：

```bash
npm run reset-redis
```

## 本地开发

```bash
npm run dev
```

## API端点

### 获取外包公司列表

```
GET /api/companies
```

响应示例：

```json
{
  "outsourcing_companies": [
    "公司名称1",
    "公司名称2",
    "公司名称3"
  ],
  "count": 3,
  "updated_at": "2023-11-23T12:34:56.789Z"
}
```

### 添加外包公司

```
POST /api/add-company
```

请求体示例：

```json
{
  "companyName": "新公司名称"
}
```

响应示例：

```json
{
  "message": "公司添加成功",
  "company": "新公司名称",
  "total": 4
}
```

## 测试API

确保已经设置了正确的环境变量，并且本地服务器正在运行，然后执行：

```bash
npm run test-api
```

## 部署

```bash
npm run deploy
```

## Redis部署选项

1. **Vercel集成的Redis**
   - 通过Vercel集成Upstash或Redis Enterprise
   - 自动配置环境变量

2. **自托管Redis**
   - 使用自己的Redis服务器
   - 需要手动配置环境变量

3. **云服务提供商**
   - Redis Labs提供免费层
   - AWS ElastiCache
   - Azure Cache for Redis
   - Google Cloud Memorystore

## 注意事项

- 确保您的Redis实例可以从Vercel服务器访问
- 对于生产环境，建议使用带有密码保护的Redis实例
- 在生产环境中，应该添加适当的身份验证机制保护API 
# 外包公司API

这是一个使用Vercel Edge Config存储和管理外包公司列表的API。

## 功能

- 获取外包公司列表
- 添加新的外包公司
- 使用Vercel Edge Config进行数据存储

## 环境设置

1. 复制`.env.example`文件为`.env.local`
2. 在Vercel控制台创建一个Edge Config
3. 更新`.env.local`文件中的`EDGE_CONFIG`值为您的Edge Config URL（格式：`https://edge-config.vercel.com/{configId}`）
4. 在Vercel控制台生成一个具有写入权限的Token，并更新`.env.local`文件中的`EDGE_CONFIG_TOKEN`值

## 安装依赖

```bash
npm install
```

## 初始化Edge Config

```bash
npm run init-edge-config
```

如需重置数据：

```bash
npm run reset-edge-config
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
    {
      "name": "公司名称",
      "contact": "联系人",
      "phone": "联系电话"
    }
  ],
  "count": 1,
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
  "name": "公司名称",
  "contact": "联系人",
  "phone": "联系电话"
}
```

响应示例：

```json
{
  "success": true,
  "message": "公司添加成功",
  "company": {
    "name": "公司名称",
    "contact": "联系人",
    "phone": "联系电话"
  }
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

## 注意事项

- Edge Config的`set`方法在某些环境中不可用，因此我们使用Vercel API进行数据写入
- 确保您的Edge Config Token具有足够的权限
- 在生产环境中，应该添加适当的身份验证机制 
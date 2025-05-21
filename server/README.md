# 外包公司名单 API

这是一个基于AWS Lambda的Serverless API，用于获取外包公司名单。

## 功能

- 提供REST API接口获取外包公司名单
- 使用JSON文件存储公司数据
- 通过AWS Lambda和API Gateway实现Serverless架构

## 安装与部署

### 前置条件

- Node.js 14.x 或更高版本
- AWS账号及配置好的AWS CLI凭证
- Serverless Framework

### 安装依赖

```bash
npm install
```

### 本地开发

```bash
npm start
```

这将启动本地开发服务器，API将在 `http://localhost:3000/dev/companies` 可用。

### 部署到AWS

```bash
npm run deploy
```

或指定环境：

```bash
serverless deploy --stage production
```

## API 端点

### 获取外包公司名单

- **URL**: `/companies`
- **方法**: `GET`
- **响应示例**:
  ```json
  {
    "companies": [
      {
        "id": 1,
        "name": "华为技术服务有限公司",
        "type": "IT外包",
        "location": "深圳",
        "description": "提供IT基础设施和应用开发服务"
      },
      // 更多公司...
    ],
    "lastUpdated": "2023-08-15T08:00:00Z"
  }
  ```

## 数据更新

要更新公司名单，请直接编辑 `outsourcing-companies.json` 文件，然后重新部署。 
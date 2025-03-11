# AIStream Mocker

[English](#english) | [中文](#chinese)

<a id="english"></a>
## AIStream Mocker

A Next.js application that mocks AI streaming responses with configurable TPS (tokens per second) for development and testing purposes.

### Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

- Set [http://localhost:3000/v1](http://localhost:3000/v1) as baseURL with your Chat Client to call the application.
- Fetch models in your Chat Client

### Features

- Simulate AI response streams with adjustable TPS (tokens per second) rates
- Configure various streaming parameters to test different scenarios
- Provide a realistic environment for testing streaming AI integrations

### Configuration

You can modify the streaming settings in the configuration file located at:
```
src/config/default.ts
```

Key parameters include:
- `tps`: Tokens per second rate ->  `tokenSpeed` 
- `returnText`: The content return by server -> `responses.defaultResponse`

Additionally, you can adjust other parameters defined in the configuration file to fine-tune the streaming behavior according to your testing needs.

### Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Learn Next.js](https://nextjs.org/learn)

### Deployment

Deploy your application using [Vercel Platform](https://vercel.com/new).

---

<a id="chinese"></a>
## AIStream 模拟器

这是一个用于模拟可配置 TPS（每秒令牌数）的 AI 流式响应的 Next.js 应用程序，适用于开发和测试场景。

### 开始使用

首先，运行开发服务器：

```bash
npm run dev
# 或
yarn dev
# 或
pnpm dev
# 或
bun dev
```

- 将 [http://localhost:3000/v1](http://localhost:3000/v1) 设置为聊天客户端的 baseURL 以调用应用程序。
- 在聊天客户端中获取模型列表

### 功能特点

- 模拟可调节 TPS（每秒令牌数）的 AI 响应流
- 配置各种流参数以测试不同场景
- 为测试流式 AI 集成提供真实环境

### 配置

您可以在以下配置文件中修改流设置：
```
src/config/default.ts
```

主要参数包括：
- `tps`：每秒令牌速率 -> `tokenSpeed`
- `returnText`：服务器返回的内容 -> `responses.defaultResponse`

此外，您可以根据测试需求调整配置文件中定义的其他参数，以微调流式行为。

### 了解更多

- [Next.js 文档](https://nextjs.org/docs)
- [学习 Next.js](https://nextjs.org/learn)

### 部署

使用 [Vercel 平台](https://vercel.com/new) 部署您的应用程序。
